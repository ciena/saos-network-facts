"""Facts for a set of devices: which configuration files belong to which device, which extractor reads
them, and the device records of the facts file.

Each device has an extractor:

* ``saos6`` (SAOS 6 and SAOS 8): ``saos6`` parses the flat CLI directly.
* ``saos10``: the translator turns each configuration file into pivot JSON and ``saos10`` walks it.
  A file the translator cannot parse is reported on the record (``status: partial``) and the others
  still count.
* anything else (a Linux host, a line system): no facts, ``status: skipped``.

The extractor comes from, in order: the platform map's ``extractor``, the device type (``-6x`` / ``-8x``
-> saos6, ``-10x`` -> saos10), the containerlab kind (``ciena_saos`` -> saos10), and last the files
themselves (XML, or CLI that is not in the SAOS 6 ``verb [noun] action`` form, is SAOS 10).

A device's files are merged in order, so a loopback created in the first file is known in the third.
"""

import re
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
    saos10_device_facts(record, texts, platform, translator, jobs)
    return record


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


def document(records, translator=None):
    """The facts file: ``schema_version``, what produced it, and the device records."""
    return {
        "schema_version": SCHEMA_VERSION,
        "generator": {"name": "saos-network-facts", "version": __version__,
                      "translator": translator.describe() if translator is not None else None},
        "devices": records,
    }


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
