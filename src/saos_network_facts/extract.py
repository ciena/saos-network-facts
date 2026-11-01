# SPDX-License-Identifier: Apache-2.0
"""Facts for a set of devices: which configuration files belong to which device, which extractor reads
them, and the device records of the facts file.

Each device has an extractor:

* ``saos6`` (SAOS 6 and SAOS 8): ``saos6`` parses the flat CLI directly.
* ``saos10``: the translator turns each configuration file into pivot JSON and ``saos10`` walks it.
  A file the translator cannot parse is reported on the record (``status: partial``) and the others
  still count. The translator needs the device's platform (``cn5164``), from the platform map's
  ``platform`` or the device type; a device with neither is ``status: error`` without a call.
* anything else (a Linux host, a line system): no facts, ``status: skipped``.

A containerlab topology also gives the facts file its ``links`` (``links_from_clab``) and, with a hosts
file, its Linux ``hosts`` (``collect_hosts``): addresses and routes from a ``linux`` node's ``exec`` lines.

The extractor comes from, in order: the platform map's ``extractor``, the device type (``-6x`` / ``-8x``
-> saos6, ``-10x`` -> saos10), the containerlab kind (``ciena_saos`` -> saos10), and last the files
themselves (XML, or CLI that is not in the SAOS 6 ``verb [noun] action`` form, is SAOS 10).

A device's files are merged in order, so a loopback created in the first file is known in the third.
"""

import ipaddress
import re
import shlex
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from . import SCHEMA_VERSION, __version__, saos6, saos10
from .translator import prepare, translator_platform

SAOS6_TYPE = re.compile(r"-(6x|8x)$")
SAOS10_TYPE = re.compile(r"-10x$")
SAOS10_KINDS = {"ciena_saos", "ciena_saos10"}
SAOS6_LINE = re.compile(r"^[a-z][\w-]*(?: [\w-]+)? (?:create|set|add|remove|delete|enable|disable|attach|detach|unset|clear)\b")
CONFIG_SUFFIXES = {".cfg", ".conf", ".txt", ".xml", ".partial", ".cli", ".j2"}
EXTRACTORS = ("saos6", "saos10")
HOST_KINDS = {"linux"}


@dataclass
class Device:
    name: str
    type: str | None = None
    platform: str | None = None
    extractor: str | None = None
    kind: str | None = None          # the containerlab kind, when the device comes from a clab file
    configs: list = field(default_factory=list)  # [(label, Path)] in apply order


def extractor_for(device_type):
    """``saos6``, ``saos10`` or None for a device type such as ``5164-10x`` or ``3930-6x``."""
    device_type = device_type or ""
    if SAOS6_TYPE.search(device_type):
        return "saos6"
    if SAOS10_TYPE.search(device_type):
        return "saos10"
    return None


def detect_extractor(texts):
    """``saos6`` or ``saos10`` from the configuration text: XML is SAOS 10; CLI is SAOS 6 / 8 when at
    least half its command lines read ``verb [noun] action ...`` (``vlan create``, ``port set``)."""
    total = flat = 0
    for text in texts:
        if prepare(text)[0] == "xml":
            return "saos10"
        for raw in text.splitlines():
            line = raw.strip()
            if not line or line[0] in "#!" or line in ("config", "configure", "conf", "exit", "return", "apply"):
                continue
            total += 1
            flat += bool(SAOS6_LINE.match(line))
    if not total:
        return None
    return "saos6" if flat * 2 >= total else "saos10"


# ---------------------------------------------------------------- inputs

def device_name(path):
    """The device a configuration file belongs to: its name up to the first dot (``PE_1.cfg.partial`` -> ``PE_1``)."""
    return Path(path).name.split(".", 1)[0]


def is_config(path):
    path = Path(path)
    return path.is_file() and not path.name.startswith(".") and (not path.suffix or path.suffix.lower() in CONFIG_SUFFIXES)


def _label(path, base):
    try:
        return Path(path).resolve().relative_to(Path(base).resolve()).as_posix()
    except ValueError:
        return Path(path).name


def from_configs(paths):
    """Devices from ``--configs``: a directory holds one device per file (files that share a name up to
    the first dot are one device, in name order) and one device per subdirectory (its files in name
    order); files given directly are grouped the same way, in the order given."""
    devices = {}

    def add(name, path, base):
        devices.setdefault(name, Device(name)).configs.append((_label(path, base), Path(path)))

    for given in paths:
        given = Path(given)
        if given.is_dir():
            for child in sorted(given.iterdir()):
                if child.is_dir() and not child.name.startswith("."):
                    for f in sorted(p for p in child.rglob("*") if is_config(p)):
                        add(child.name, f, given)
                elif is_config(child):
                    add(device_name(child), child, given)
        elif given.is_file():
            add(device_name(given), given, given.parent)
        else:
            raise FileNotFoundError(f"no such configuration file or directory: {given}")
    return devices


def from_clab(path):
    """Devices from a containerlab topology: each node's kind and type (node, then its kind's, then the
    defaults), and its ``startup-config`` file when there is one."""
    path = Path(path)
    data = yaml.safe_load(path.read_text()) or {}
    topology = data.get("topology") or {}
    defaults = topology.get("defaults") or {}
    kinds = topology.get("kinds") or {}
    devices = {}
    for name, node in (topology.get("nodes") or {}).items():
        node = node or {}
        kind = node.get("kind") or defaults.get("kind")
        merged = {**defaults, **(kinds.get(kind) or {}), **node}
        device = Device(str(name), type=None if merged.get("type") is None else str(merged["type"]), kind=kind)
        startup = merged.get("startup-config")
        if startup and (path.parent / startup).is_file():
            device.configs.append((_label(path.parent / startup, path.parent), path.parent / startup))
        devices[device.name] = device
    return devices


def links_from_clab(path):
    """The physical links of a containerlab topology, ``[{"a": {"device", "port"}, "b": {...}}]`` in
    file order: each ``links`` entry's two endpoints, written ``NODE:PORT`` (brief form) or as
    ``{node, interface}`` objects (extended form). Entries with other than two endpoints (a host
    bridge, a dangling veth) are left out."""
    path = Path(path)
    data = yaml.safe_load(path.read_text()) or {}
    out = []
    for link in (data.get("topology") or {}).get("links") or []:
        ends = [_link_end(e) for e in (link or {}).get("endpoints") or []]
        if len(ends) == 2 and all(ends):
            out.append({"a": ends[0], "b": ends[1]})
    return out


def _link_end(endpoint):
    if isinstance(endpoint, str) and ":" in endpoint:
        device, port = endpoint.split(":", 1)
        return {"device": device, "port": port}
    if isinstance(endpoint, dict) and endpoint.get("node") and endpoint.get("interface"):
        return {"device": str(endpoint["node"]), "port": str(endpoint["interface"])}
    return None


# ---------------------------------------------------------------- Linux hosts

def _family(address):
    """``ipv4`` or ``ipv6`` for an address or prefix; None when it is neither."""
    try:
        return "ipv6" if ipaddress.ip_interface(address).version == 6 else "ipv4"
    except ValueError:
        return None


def _with_length(address):
    """An address as ``a/len``: a bare address is a host address (/32, /128), as ``ip addr add`` takes it."""
    if "/" in address:
        return address
    return f"{address}/{128 if _family(address) == 'ipv6' else 32}"


def _option(words, name):
    """The word after ``name`` (``dev eth1`` -> ``eth1``), or None."""
    return words[words.index(name) + 1] if name in words[:-1] else None


def parse_host_exec(lines):
    """A Linux host's addresses and routes from its containerlab ``exec`` commands.

    Read: ``ip [-4|-6] addr add|replace <address>[/<len>] dev <if>`` (an interface address, IPv4 or
    IPv6, its options in any order: ``ip -6 addr add dev eth1 2001:db8::1/64 nodad``) and
    ``ip [-4|-6] route add|replace <prefix>|default [via <next hop>] [dev <if>] [metric <n>]`` (a
    route; ``default`` is 0.0.0.0/0, or ::/0 with ``-6`` or an IPv6 next hop). Every other command
    (``ip link set``, ``sysctl``, a script) sets nothing the facts describe and is returned in
    ``ignored`` as written, so a reader can see what was not read.
    Returns ``{"addresses": [(if, address)], "routes": [route], "ignored": [command]}``."""
    out = {"addresses": [], "routes": [], "ignored": []}
    for raw in lines or []:
        command = str(raw).strip()
        if not command:
            continue
        try:
            words = shlex.split(command)
        except ValueError:
            out["ignored"].append(command)
            continue
        if words[:1] == ["sudo"]:
            words = words[1:]
        family = None
        if words[:1] == ["ip"] and len(words) > 1 and words[1] in ("-4", "-6"):
            family = "ipv6" if words[1] == "-6" else "ipv4"
            words = [words[0], *words[2:]]
        if len(words) >= 4 and words[0] == "ip" and words[1] in ("a", "addr", "address") and words[2] in ("add", "replace"):
            address = _operand(words[3:])
            if address and _family(address) and _option(words, "dev") and (family is None or _family(address) == family):
                out["addresses"].append((_option(words, "dev"), _with_length(address)))
                continue
            out["ignored"].append(command)
            continue
        if len(words) >= 4 and words[0] == "ip" and words[1] in ("r", "ro", "route") and words[2] in ("add", "replace"):
            via, dev, metric = _option(words, "via"), _option(words, "dev"), _option(words, "metric")
            target = _operand(words[3:]) or words[3]
            if target == "default":
                family = family or (_family(via) if via else None) or "ipv4"
                target = "::/0" if family == "ipv6" else "0.0.0.0/0"
            elif _family(target) is None:
                out["ignored"].append(command)
                continue
            target = _with_length(target)
            out["routes"].append({"prefix": target, "family": _family(target), "next_hop": via, "interface": dev,
                                  "metric": int(metric) if metric and metric.isdigit() else None})
            continue
        out["ignored"].append(command)
    return out


# ip(8) options that take a value, and those that stand alone, around an address or route operand.
IP_VALUE_OPTIONS = {"dev", "via", "metric", "label", "scope", "valid_lft", "preferred_lft", "peer", "broadcast",
                    "brd", "anycast", "table", "proto", "protocol", "src", "mtu", "realm", "weight"}
IP_FLAGS = {"nodad", "noprefixroute", "home", "mngtmpaddr", "optimistic", "autojoin", "permanent", "onlink"}


def _operand(words):
    """The address or prefix operand of an ``ip addr`` / ``ip route`` command: its first word that is not
    an option or the value of one (in ``ip -6 addr add dev eth1 2001:db8::1/64`` it is the address)."""
    skip = False
    for word in words:
        if skip:
            skip = False
        elif word in IP_FLAGS:
            continue
        elif word in IP_VALUE_OPTIONS:
            skip = True
        else:
            return word
    return None


def _new_host(name, kind=None):
    return {"name": name, "kind": kind, "sources": [], "interfaces": [], "routes": [],
            "default_gateway": {"ipv4": None, "ipv6": None}, "ignored_commands": []}


def _host_interface(host, name):
    for iface in host["interfaces"]:
        if iface["name"] == name:
            return iface
    iface = {"name": name, "addresses": [], "attached": None}
    host["interfaces"].append(iface)
    return iface


def _add_route(host, route):
    """Add a route, replacing one to the same prefix (``ip route replace``, a hosts file's later word)."""
    host["routes"] = [r for r in host["routes"] if r["prefix"] != route["prefix"]] + [route]


def hosts_from_clab(path):
    """The Linux hosts of a containerlab topology, ``{name: host}`` in node order: each node of kind
    ``linux`` (from the node, its kind or the defaults), its interfaces from the links it is cabled on
    (``attached``: the device and port at the other end) and from its ``exec`` lines, which also give
    its routes (``parse_host_exec``)."""
    path = Path(path)
    data = yaml.safe_load(path.read_text()) or {}
    topology = data.get("topology") or {}
    defaults = topology.get("defaults") or {}
    kinds = topology.get("kinds") or {}
    hosts = {}
    for name, node in (topology.get("nodes") or {}).items():
        node = node or {}
        kind = node.get("kind") or defaults.get("kind")
        if kind not in HOST_KINDS:
            continue
        merged = {**defaults, **(kinds.get(kind) or {}), **node}
        host = hosts[str(name)] = _new_host(str(name), kind)
        host["sources"].append("clab")
        for link in links_from_clab(path):
            for me, other in ((link["a"], link["b"]), (link["b"], link["a"])):
                if me["device"] == host["name"]:
                    _host_interface(host, me["port"])["attached"] = dict(other)
        parsed = parse_host_exec(merged.get("exec"))
        for ifname, address in parsed["addresses"]:
            iface = _host_interface(host, ifname)
            if address not in iface["addresses"]:
                iface["addresses"].append(address)
        for route in parsed["routes"]:
            _add_route(host, route)
        host["ignored_commands"] = parsed["ignored"]
    return hosts


def load_hosts(path):
    """``{name: host}`` from a hosts file (YAML or JSON), for hosts no containerlab ``exec`` describes:
    ``hosts: {NAME: {kind, interfaces: [{name, addresses, attached: {device, port}}], routes: [{prefix,
    next_hop, interface, metric}], gateway: <address> | {ipv4, ipv6}}}`` (or the mapping alone).
    ``gateway`` is a default route through that address."""
    path = Path(path)
    data = yaml.safe_load(path.read_text()) or {}
    entries = data.get("hosts", data) if isinstance(data, dict) else {}
    out = {}
    for name, entry in (entries or {}).items():
        entry = entry or {}
        host = out[str(name)] = _new_host(str(name), entry.get("kind"))
        host["sources"].append("hosts-file")
        for given in entry.get("interfaces") or []:
            if not given.get("name"):
                raise ValueError(f"{path}: host {name}: every interface needs a name")
            iface = _host_interface(host, str(given["name"]))
            iface["addresses"] = [_with_length(str(a)) for a in given.get("addresses") or []]
            if given.get("attached"):
                attached = given["attached"]
                iface["attached"] = {"device": str(attached["device"]), "port": str(attached["port"])}
        for given in entry.get("routes") or []:
            prefix = _with_length(str(given["prefix"]))
            if _family(prefix) is None:
                raise ValueError(f"{path}: host {name}: route prefix {given['prefix']!r} is not an address")
            _add_route(host, {"prefix": prefix, "family": _family(prefix),
                              "next_hop": None if given.get("next_hop") is None else str(given["next_hop"]),
                              "interface": given.get("interface"), "metric": given.get("metric")})
        gateway = entry.get("gateway")
        for address in ([gateway] if isinstance(gateway, str) else (gateway or {}).values()):
            if address:
                family = _family(str(address))
                _add_route(host, {"prefix": "::/0" if family == "ipv6" else "0.0.0.0/0", "family": family,
                                  "next_hop": str(address), "interface": None, "metric": None})
    return out


def _merge_host(host, given):
    """A hosts-file entry over a containerlab one: its interfaces' addresses and attachments where it
    gives them, its routes added (replacing those to the same prefix)."""
    host["kind"] = host["kind"] or given["kind"]
    host["sources"] += [s for s in given["sources"] if s not in host["sources"]]
    for iface in given["interfaces"]:
        mine = _host_interface(host, iface["name"])
        if iface["addresses"]:
            mine["addresses"] = iface["addresses"]
        if iface["attached"]:
            mine["attached"] = iface["attached"]
    for route in given["routes"]:
        _add_route(host, route)


def collect_hosts(clab=None, hosts_file=None, devices=()):
    """The ``hosts`` of the facts file: the containerlab Linux nodes, then the hosts file's (an entry
    for a containerlab host merges into it), each with its ``default_gateway`` per address family (the
    next hop of its lowest-metric default route). None when neither input was given. A hosts-file
    host named like a device the extractor reads is an error. A node is a host or a device, never both:
    a containerlab ``linux`` node the extractor reads as a SAOS device (a vrnetlab SAOS image is often
    kind ``linux``; its type, platform map or startup configuration say SAOS) is a device, not a host."""
    if not clab and not hosts_file:
        return None
    readable = {d.name for d in devices if reads_as_device(d)}
    hosts = {name: h for name, h in (hosts_from_clab(clab) if clab else {}).items() if name not in readable}
    for name, given in (load_hosts(hosts_file) if hosts_file else {}).items():
        if name in readable or name in {d.name for d in devices if d.kind not in HOST_KINDS}:
            raise ValueError(f"{hosts_file}: host {name} is also a device of the configurations")
        if name in hosts:
            _merge_host(hosts[name], given)
        else:
            hosts[name] = given
    for host in hosts.values():
        for family, default in (("ipv4", "0.0.0.0/0"), ("ipv6", "::/0")):
            routes = [r for r in host["routes"] if r["prefix"] == default and r["next_hop"]]
            routes.sort(key=lambda r: r["metric"] if r["metric"] is not None else 0)
            host["default_gateway"][family] = routes[0]["next_hop"] if routes else None
    return list(hosts.values())


def reads_as_device(device):
    """True when the extractor reads this device (it has an extractor): a SAOS device, not a host."""
    try:
        texts = [path.read_text() for _, path in device.configs]
    except (OSError, UnicodeDecodeError):
        texts = []
    return resolve_extractor(device, texts) is not None


def load_platform_map(path):
    """``{device: {"type", "platform", "extractor", "configs"}}`` from a YAML or JSON file: either
    ``devices: {name: {...}}`` or ``{name: {...}}``, where a bare string is the device type."""
    path = Path(path)
    data = yaml.safe_load(path.read_text()) or {}
    entries = data.get("devices", data) if isinstance(data, dict) else {}
    out = {}
    for name, entry in entries.items():
        entry = {"type": entry} if isinstance(entry, str) else dict(entry or {})
        if entry.get("extractor") not in (None, *EXTRACTORS):
            raise ValueError(f"{path}: {name}: extractor must be one of {', '.join(EXTRACTORS)}")
        if entry.get("configs"):
            entry["configs"] = [(str(c), path.parent / c) for c in entry["configs"]]
        out[str(name)] = entry
    return out


def collect(configs=None, clab=None, platform_map=None):
    """The devices to extract, in clab node order then configuration order."""
    devices = from_clab(clab) if clab else {}
    for name, device in (from_configs(configs) if configs else {}).items():
        if name in devices:
            devices[name].configs = device.configs
        else:
            devices[name] = device
    for name, entry in (load_platform_map(platform_map) if platform_map else {}).items():
        device = devices.setdefault(name, Device(name))
        device.type = entry.get("type", device.type)
        device.platform = entry.get("platform", device.platform)
        device.extractor = entry.get("extractor", device.extractor)
        if entry.get("configs"):
            device.configs = entry["configs"]
    return list(devices.values())


# ---------------------------------------------------------------- facts

def resolve_extractor(device, texts):
    return (device.extractor or extractor_for(device.type)
            or ("saos10" if device.kind in SAOS10_KINDS else None)
            or (detect_extractor(texts) if device.kind is None else None))


def device_facts(device, translator=None, jobs=1, recipe=None):
    """The facts record of one device: header fields plus the extractor's facts, or ``skipped`` / ``error``.
    ``translator`` (see ``translator.load_translator``) is needed for SAOS 10 devices."""
    record = {"device": device.name, "type": device.type, "extractor": None,
              "templates": [label for label, _ in device.configs], "status": "ok", "facts": None}
    if recipe is not None:
        record["recipe"] = recipe
    try:
        texts = [(label, path.read_text()) for label, path in device.configs]
    except (OSError, UnicodeDecodeError) as exc:
        record.update(status="error", reason=f"{type(exc).__name__}: {exc}")
        return record
    record["extractor"] = resolve_extractor(device, [t for _, t in texts])
    if record["extractor"] is None:
        if device.kind in HOST_KINDS:
            record.update(status="skipped", reason=f"a Linux host (kind {device.kind}): see hosts[]")
            return record
        record.update(status="skipped", reason="no extractor for this device" + (f" (kind {device.kind})" if device.kind else ""))
        return record
    if not texts:
        record.update(status="skipped", reason="no configuration")
        return record
    if record["extractor"] == "saos6":
        record["facts"] = saos6.merge(t for _, t in texts)
        return record
    platform = device.platform or translator_platform(device.type)
    if platform:
        record["platform"] = platform
    if translator is None:
        record.update(status="skipped", reason="no translator")
        return record
    if not platform:
        record.update(status="error", reason=no_platform_reason(device))
        return record
    saos10_device_facts(record, texts, platform, translator, jobs)
    return record


def no_platform_reason(device):
    """Why a SAOS 10 device is not sent to the translator: its convert tools need the platform (from
    translator 4.2.1) and there is no default, so it must come from the device type or the platform map."""
    files = ", ".join(label for label, _ in device.configs)
    return (f"no SAOS 10 platform for {device.name} ({files}): the translator needs one; set its type "
            f"(5164-10x) or platform (cn5164) in --platform-map")


def saos10_device_facts(record, texts, platform, translator, jobs=1):
    """Parse every file (in parallel when the backend allows), then fold the pivots into one facts
    dict in order, honouring the removals an XML file carries."""
    prepared = [(label, *prepare(text)) for label, text in texts]

    def parse(item):
        _, fmt, text = item
        try:
            return translator.parse(text, fmt, platform), None
        except Exception as exc:  # a refused file, an unreachable endpoint
            return None, (str(exc).splitlines()[0] if str(exc) else type(exc).__name__)

    if jobs > 1 and getattr(translator, "parallel", False) and len(prepared) > 1:
        with ThreadPoolExecutor(max_workers=jobs) as pool:
            results = list(pool.map(parse, prepared))
    else:
        results = [parse(item) for item in prepared]

    facts = saos10.new_facts()
    failed = []
    for (label, fmt, text), (pivot, error) in zip(prepared, results, strict=True):
        if error is not None:
            failed.append({"template": label, "error": error})
            continue
        saos10.extract(pivot, facts)
        if fmt == "xml":
            saos10.apply_removals(facts, saos10.removed_objects(text))
    saos10.finish(facts)
    record["facts"] = facts
    if failed:
        record["status"] = "partial" if len(failed) < len(prepared) else "error"
        record["failed_templates"] = failed
        record["reason"] = "; ".join(f"{f['template']}: {f['error']}" for f in failed)[:300]


def document(records, translator=None, links=None, hosts=None):
    """The facts file: ``schema_version``, what produced it, the device records, (when a topology
    was given) the physical ``links`` between the devices, and (with a topology or a hosts file) the
    Linux ``hosts``."""
    doc = {
        "schema_version": SCHEMA_VERSION,
        "generator": {"name": "saos-network-facts", "version": __version__,
                      "translator": translator.describe() if translator is not None else None},
        "devices": records,
    }
    if links is not None:
        doc["links"] = links
    if hosts is not None:
        doc["hosts"] = hosts
    return doc


def needs_translator(devices):
    """True when any device would be read by the SAOS 10 extractor."""
    for device in devices:
        try:
            texts = [path.read_text() for _, path in device.configs]
        except (OSError, UnicodeDecodeError):
            continue
        if texts and resolve_extractor(device, texts) == "saos10":
            return True
    return False


def summary_line(record):
    if record["status"] in ("skipped", "error"):
        return f"{record['status'].upper():7} {record['device']} ({record['type']}) {record.get('reason', '')}"
    f = record["facts"]
    lb = len(saos6.loopbacks(f))
    ip = sum(1 for i in f["interfaces"] if i["kind"] not in ("loopback", "management", "lag"))
    status = "OK" if record["status"] == "ok" else record["status"].upper()
    tail = f" ({record['reason']})" if record["status"] == "partial" else ""
    return (f"{status:7} {record['device']} ({record['type']}) hostname={f['hostname']} "
            f"loopbacks={lb} ip-interfaces={ip} lags={len(f['lags'])} ports={len(f['ports'])} "
            f"vlans={len(f['vlans'])} peers={len(f['peers'])} pseudowires={len(f['pseudowires'])} "
            f"meps={len(f['cfm']['meps'])} recognised={f['recognised']}/{f['lines']}{tail}")


def host_summary_line(host):
    addresses = sum(len(i["addresses"]) for i in host["interfaces"])
    gateways = " ".join(f"{f}-gateway={g}" for f, g in host["default_gateway"].items() if g)
    ignored = f" ignored-exec={len(host['ignored_commands'])}" if host["ignored_commands"] else ""
    return (f"HOST    {host['name']} ({'+'.join(host['sources'])}) interfaces={len(host['interfaces'])} "
            f"addresses={addresses} routes={len(host['routes'])}{' ' + gateways if gateways else ''}{ignored}")
