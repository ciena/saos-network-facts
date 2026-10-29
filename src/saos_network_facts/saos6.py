# SPDX-License-Identifier: Apache-2.0
"""Facts from a SAOS 6 / SAOS 8 CLI configuration.

SAOS 6 (39xx, 51xx on 6.x) and SAOS 8 (5170 / 5171) share one flat command language: every line is a
complete command (``verb [sub-verb] action key value ...``), nothing is contextual, and lists of ports
or VLANs are written ``1-8`` or ``11,12``. That makes the facts (hostname, interfaces with their
addresses, loopbacks, VLAN membership, port descriptions, LAG membership, MPLS peers, IS-IS,
pseudowires, CFM MEPs) a matter of recognising a few dozen command shapes. This module does only that:
it is not a validator, and a line it does not recognise is counted, not rejected.

``parse(text)`` returns a plain dict (see ``new_facts``) so the result can be written as JSON and
merged across a device's configuration files with ``merge``. The shape is documented field by field
in ``schema/facts-v1.schema.json``; ``saos10`` extends it.
"""

import re
import shlex

PORT_RANGE = re.compile(r"^(\d+)-(\d+)$")


def new_facts():
    return {
        "hostname": None,
        "interfaces": [],   # {"name", "kind": loopback|ip|management, "ip", "vlan", "vs"}
        "gateway": None,
        "vlans": {},        # vlan id (str) -> {"ports": [...]}
        "ports": {},        # port (str) -> {"description", "vlans", "lag", "roles"}
        "lags": [],         # {"name", "members": [...]}
        "sub_ports": [],    # {"name", "parent"}
        "rings": [],        # {"name", "west", "east"}
        "peers": [],        # {"kind": mpls-vc|tp-tunnel|bgp, "name", "ip"}
        "isis": {"instances": [], "interfaces": []},
        "segment_routing": {"srgb": [], "prefix_sids": [], "policies": [], "segment_lists": {}},
        "bgp": {"instances": []},
        "pseudowires": [],  # {"name", "kind", "peer", "pw_id", ...}
        "cfm": {"meps": []},
        "lines": 0,         # command lines seen
        "recognised": 0,    # command lines that produced a fact
    }


def split(line):
    """Tokens of one command line; quotes group words, an unbalanced quote falls back to whitespace."""
    try:
        return shlex.split(line, posix=True)
    except ValueError:
        return line.split()


def expand(spec):
    """``"1-3,7"`` -> ``["1", "2", "3", "7"]``; names and dotted ports pass through unchanged."""
    out = []
    for part in str(spec).split(","):
        part = part.strip()
        if not part:
            continue
        m = PORT_RANGE.match(part)
        if m and int(m.group(1)) <= int(m.group(2)):
            out.extend(str(n) for n in range(int(m.group(1)), int(m.group(2)) + 1))
        else:
            out.append(part)
    return out


def pairs(tokens):
    """``key value`` pairs from the tail of a command (after its verb words and positional name); a
    trailing lone word becomes ``{word: True}``."""
    out = {}
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens):
            out.setdefault(tokens[i], tokens[i + 1])
        else:
            out.setdefault(tokens[i], True)
        i += 2
    return out


def after(tokens, key):
    """The token after ``key`` in a command, or None: for commands that mix valueless flags
    (``ldp-lsp``) with ``key value`` pairs, where ``pairs`` would pair the wrong words."""
    for i, token in enumerate(tokens[:-1]):
        if token == key:
            return tokens[i + 1]
    return None


def _s(value):
    """A config value as text (a lone trailing keyword parses as ``True``; it carries no value)."""
    return None if value is None or value is True else str(value)


def _port(facts, name):
    return facts["ports"].setdefault(str(name), {"description": None, "vlans": [], "lag": None, "roles": []})


def _add(lst, value):
    if value not in lst:
        lst.append(value)


def _role(facts, port, role):
    _add(_port(facts, port)["roles"], role)


def _lag(facts, name):
    for lag in facts["lags"]:
        if lag["name"] == name:
            return lag
    lag = {"name": name, "members": []}
    facts["lags"].append(lag)
    return lag


def _isis_instance(facts, name):
    for instance in facts["isis"]["instances"]:
        if instance["name"] == name:
            return instance
    instance = {"name": name, "level": None, "area": None, "nets": [], "sr_enabled": None}
    facts["isis"]["instances"].append(instance)
    return instance


def _pseudowire(facts, name):
    for pw in facts["pseudowires"]:
        if pw["name"] == name:
            return pw
    pw = new_pseudowire(name)
    facts["pseudowires"].append(pw)
    return pw


def new_pseudowire(name):
    return {"name": name, "kind": None, "peer": None, "pw_id": None, "in_label": None, "out_label": None,
            "mode": None, "tunnel": None, "tunnel_type": None, "tunnel_color": None, "service": None, "service_type": None}


def net_parts(net):
    """``(area id, system id)`` of an IS-IS NET (``49.0001.1720.1600.0001.00`` -> ``("49.0001",
    "1720.1600.0001")``), or ``(None, None)`` when it is not well formed."""
    if not net:
        return None, None
    parts = str(net).strip().split(".")
    if len(parts) < 5:
        return None, None
    return ".".join(parts[:-4]), ".".join(parts[-4:-1])


def finish_isis(facts):
    """``nets``, ``net``, ``area_id`` and ``system_id`` on every IS-IS instance, from what the config set."""
    for instance in facts["isis"]["instances"]:
        nets = instance.setdefault("nets", [])
        instance["net"] = nets[0] if nets else None
        area_id, system_id = net_parts(instance["net"])
        if area_id is None and instance.get("area") and instance["area"] not in nets:
            area_id = instance["area"]  # SAOS 6 writes the area itself
        instance["area_id"] = area_id
        instance["system_id"] = system_id
    return facts


def apply(facts, line):
    """Apply one command line to ``facts``; returns True when it was recognised."""
    t = split(line)
    if not t:
        return False
    head = " ".join(t[:3])

    def kv_after(n):
        return pairs(t[n:])

    kv = kv_after(2)
    if head.startswith("system set") and "host-name" in kv:
        facts["hostname"] = str(kv["host-name"])
        return True

    kv = kv_after(4)
    if head == "interface create loopback" and len(t) > 3:
        facts["interfaces"].append({"name": t[3], "kind": "loopback", "ip": kv.get("ip"), "vlan": None, "vs": None})
        return True
    if head == "interface create ip-interface" and len(t) > 3:
        facts["interfaces"].append({"name": t[3], "kind": "ip", "ip": kv.get("ip"), "vlan": kv.get("vlan"), "vs": kv.get("vs")})
        return True
    kv = kv_after(3)
    if t[0] == "interface" and len(t) > 2 and t[1] in ("remote", "local") and t[2] == "set" and "ip" in kv:
        facts["interfaces"].append({"name": t[1], "kind": "management", "ip": kv["ip"], "vlan": None, "vs": None})
        return True
    kv = kv_after(4)
    if head == "interface set interface" and len(t) > 3 and "ip" in kv:
        facts["interfaces"].append({"name": t[3], "kind": "management", "ip": kv["ip"], "vlan": None, "vs": None})
        return True
    kv = kv_after(2)
    if head.startswith("interface set") and "gateway" in kv:
        facts["gateway"] = str(kv["gateway"])
        return True

    if t[0] == "vlan" and len(t) > 1 and t[1] in ("create", "add", "remove") and "vlan" in kv:
        vlans = expand(kv["vlan"])
        ports = expand(kv["port"]) if "port" in kv else []
        for vlan in vlans:
            entry = facts["vlans"].setdefault(vlan, {"ports": []})
            for port in ports:
                if t[1] == "add":
                    _add(entry["ports"], port)
                    _add(_port(facts, port)["vlans"], vlan)
                elif t[1] == "remove":
                    if port in entry["ports"]:
                        entry["ports"].remove(port)
                    p = facts["ports"].get(port)
                    if p and vlan in p["vlans"]:
                        p["vlans"].remove(vlan)
        return True

    kv = kv_after(4)
    if head == "port set port" and len(t) > 3:
        for port in expand(t[3]):
            entry = _port(facts, port)
            if "description" in kv:
                entry["description"] = str(kv["description"])
        return True

    kv = kv_after(2)
    if t[0] == "aggregation" and len(t) > 1:
        if t[1] in ("create", "add", "remove") and "agg" in kv:
            lag = _lag(facts, kv["agg"])
            for port in expand(kv["port"]) if "port" in kv else []:
                if t[1] == "add":
                    _add(lag["members"], port)
                    _port(facts, port)["lag"] = lag["name"]
                elif t[1] == "remove" and port in lag["members"]:
                    lag["members"].remove(port)
                    _port(facts, port)["lag"] = None
            return True
        if t[1] == "set" and "port" in kv:
            for port in expand(kv["port"]):
                _role(facts, port, "aggregation")
            return True
        return t[1] in ("enable", "disable")

    kv = kv_after(4)
    if head == "sub-port create sub-port" and len(t) > 3:
        parent = kv.get("parent-port")
        facts["sub_ports"].append({"name": t[3], "parent": parent})
        if parent:
            _role(facts, parent, "sub-port")
        return True

    kv = kv_after(3)
    if head == "virtual-switch ethernet add" and "port" in kv:
        for port in expand(kv["port"]):
            _role(facts, port, "virtual-switch")
        return True
    if head == "virtual-switch ethernet attach" and "mpls-vc" in kv and "vs" in kv:
        _pseudowire(facts, str(kv["mpls-vc"]))["service"] = _s(kv["vs"])
        return True

    if head == "ring-protection logical-ring create":
        kv = kv_after(3)
        facts["rings"].append({"name": kv.get("logical-ring-name"), "west": kv.get("west-port"), "east": kv.get("east-port")})
        for port in (kv.get("west-port"), kv.get("east-port")):
            if port:
                _role(facts, port, "ring")
        return True

    if t[0] == "mpls" and len(t) > 3 and t[1] == "l2-vpn" and t[2] == "create" and t[3] in ("static-vc", "dynamic-vc"):
        name = after(t, t[3])
        if name:
            pw = _pseudowire(facts, name)
            pw.update({"kind": t[3].split("-")[0], "peer": after(t, "peer"), "pw_id": after(t, "pw-id"),
                       "in_label": after(t, "in-label"), "out_label": after(t, "out-label"), "mode": after(t, "pw-mode"),
                       "tunnel": next((t[i + 1] for i, k in enumerate(t[:-1]) if k.startswith("tp-tunnel")), None)})
    kv = kv_after(t.index("static-vc")) if "static-vc" in t else {}
    if t[0] == "mpls" and len(t) > 1 and t[1] == "l2-vpn" and "static-vc" in kv and "peer" in kv:
        facts["peers"].append({"kind": "mpls-vc", "name": kv["static-vc"], "ip": kv["peer"]})
        return True
    if head == "mpls l2-vpn create" and len(t) > 3 and t[3] == "dynamic-vc":
        return True
    kv = kv_after(5)
    if head == "gmpls tp-tunnel create" and len(t) > 4:
        for key in ("dest-ip", "src-ip"):
            if key in kv:
                facts["peers"].append({"kind": "tp-tunnel", "name": t[4], "ip": kv[key], "role": key})
        return True

    kv = kv_after(3)
    if head == "isis instance create" and "isis-instance" in kv:
        instance = _isis_instance(facts, kv["isis-instance"])
        instance.update({"level": kv.get("level"), "area": kv.get("area")})
        if _s(kv.get("net")):
            _add(instance["nets"], _s(kv["net"]))
        return True
    if head == "isis instance set" and "isis-instance" in kv:
        instance = _isis_instance(facts, kv["isis-instance"])
        for key in ("level", "area"):
            if _s(kv.get(key)):
                instance[key] = _s(kv[key])
        if _s(kv.get("net")):
            _add(instance["nets"], _s(kv["net"]))
        return True
    if head == "isis interface attach" and "ip-interface" in kv:
        facts["isis"]["interfaces"].append({"interface": kv["ip-interface"], "instance": kv.get("isis-instance"),
                                            "level": _s(kv.get("level")), "type": _s(kv.get("type"))})
        return True

    if t[0] == "cfm" and len(t) > 2 and t[1] in ("service", "servi") and t[2] == "create":
        # cfm service create vs|vlan <x> name <ma> level <n>: the MA, and the level its MEPs run at
        kv = kv_after(3)
        if _s(kv.get("name")):
            facts.setdefault("_cfm_services", {})[_s(kv["name"])] = {
                "level": _s(kv.get("level")), "vs": _s(kv.get("vs")), "vlan": _s(kv.get("vlan"))}
        return True
    if head == "cfm mep create":
        kv = kv_after(3)
        port = _s(kv.get("port"))
        if port:
            _role(facts, port, "cfm-mep")
        facts["cfm"]["meps"].append({
            "md": None, "ma": _s(kv.get("service")), "mep_id": _s(kv.get("mepid")), "level": None,
            "direction": _s(kv.get("type")), "interface": _s(kv.get("sub-port")), "port": port,
            "vlan": _s(kv.get("vlan")), "service": None})
        return True

    return False


def finish(facts):
    """Derived views once every file is in: MEP levels and services from their CFM service, IS-IS NET parts."""
    services = facts.pop("_cfm_services", {})
    for mep in facts["cfm"]["meps"]:
        service = services.get(mep["ma"]) or {}
        mep["level"] = mep["level"] or service.get("level")
        mep["service"] = mep["service"] or service.get("vs")
        mep["vlan"] = mep["vlan"] or service.get("vlan")
    return finish_isis(facts)


def parse(text, facts=None):
    """Facts from one configuration; pass ``facts`` to accumulate over several files, then ``finish``."""
    facts = facts if facts is not None else new_facts()
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line[0] in "#!":
            continue
        facts["lines"] += 1
        if apply(facts, line):
            facts["recognised"] += 1
    return facts


def merge(texts):
    """Facts over a device's configuration files, applied in order."""
    facts = new_facts()
    for text in texts:
        parse(text, facts)
    return finish(facts)


def loopbacks(facts):
    return [i for i in facts["interfaces"] if i["kind"] == "loopback"]
