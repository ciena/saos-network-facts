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
        "rings": [],        # {"name", "west", "east", "ring_id", "ports", "instances"}
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


def _isis_interface(facts, name):
    """The IS-IS attachment of an IP interface (the first, when it is attached to several instances)."""
    for item in facts["isis"]["interfaces"]:
        if item["interface"] == name:
            return item
    item = {"interface": name, "instance": None, "level": None, "type": None, "metrics": []}
    facts["isis"]["interfaces"].append(item)
    return item


def set_isis_metric(item, level, **values):
    """Set ``metric`` / ``wide_metric`` of ``level`` on an IS-IS interface: the metric the interface
    advertises at that level. A level gets its entry the first time the configuration sets one, and
    loses it when neither is set any more."""
    metrics = item.setdefault("metrics", [])
    entry = next((m for m in metrics if m["level"] == level), None)
    if entry is None:
        if all(v is None for v in values.values()):
            return
        entry = {"level": level, "metric": None, "wide_metric": None}
        metrics.append(entry)
    entry.update(values)
    if entry["metric"] is None and entry["wide_metric"] is None:
        metrics.remove(entry)


def _pseudowire(facts, name):
    for pw in facts["pseudowires"]:
        if pw["name"] == name:
            return pw
    pw = new_pseudowire(name)
    facts["pseudowires"].append(pw)
    return pw


def _ring(facts, name):
    for ring in facts["rings"]:
        if ring["name"] == name:
            return ring
    ring = new_ring(name)
    facts["rings"].append(ring)
    return ring


def _virtual_ring(facts, name):
    """The instance (virtual ring) called ``name`` on whichever logical ring carries it, or None."""
    for ring in facts["rings"]:
        for instance in ring["instances"]:
            if instance["name"] == name:
                return instance
    return None


def _lower_keys(kv):
    """Ring commands are documented with ``WTR`` and ``wtr`` alike: match their keys case-insensitively."""
    return {str(k).lower(): v for k, v in kv.items()}


def new_pseudowire(name):
    return {"name": name, "kind": None, "peer": None, "pw_id": None, "in_label": None, "out_label": None,
            "mode": None, "tunnel": None, "tunnel_type": None, "tunnel_color": None, "service": None, "service_type": None}


def new_ring(name, west=None, east=None):
    """A G.8032 ring: the two ring ports and the protection instances configured on it."""
    return {"name": name, "west": west, "east": east, "ring_id": None, "ports": [], "instances": []}


def new_ring_instance(name):
    """An Ethernet ring protection instance (SAOS 10 erp-instance, SAOS 6 / 8 virtual ring), nothing
    configured yet: null means the configuration does not say, nothing is filled in from defaults."""
    return {"name": name, "raps_vid": None, "raps_level": None, "type": None, "virtual_channel": None,
            "termination": None, "sub_ring_of": None, "rpl": [], "members": [],
            "timers": {"wtr": None, "guard": None, "hold_off": None}, "revertive": None}


def ring_port(ring, name):
    """The ring's port entry called ``name`` (``west`` / ``east``, ``port0`` / ``port1``), created when missing."""
    for port in ring["ports"]:
        if port["name"] == name:
            return port
    port = {"name": name, "interface": None, "hold_off": None}
    ring["ports"].append(port)
    return port


def set_rpl(instance, port, role):
    """The RPL role configured on one ring port of an instance (the latest setting per port wins)."""
    entry = next((r for r in instance["rpl"] if r["port"] == port), None)
    if role is None:
        if entry is not None:
            instance["rpl"].remove(entry)
        return
    if entry is None:
        entry = {"port": port, "interface": None, "role": role}
        instance["rpl"].append(entry)
    entry["role"] = role


def finish_rings(facts):
    """Derived ring views once every file is in: the interface behind each RPL port, and on an
    interconnection node ``sub_ring_of``: a sub-ring instance whose ring shares a port with another
    ring on this device is attached to that ring (the sub-ring terminates here)."""
    rings = facts["rings"]
    for ring in rings:
        interfaces = {p["name"]: p["interface"] for p in ring["ports"]}
        ends = {i for i in interfaces.values() if i}
        shared = next((other["name"] for other in rings if other is not ring
                       and ends & {p["interface"] for p in other["ports"] if p["interface"]}), None)
        for instance in ring["instances"]:
            for rpl in instance["rpl"]:
                rpl["interface"] = interfaces.get(rpl["port"])
            instance["sub_ring_of"] = shared if instance["type"] == "sub" else None
    return facts


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
    """``nets``, ``net``, ``area_id`` and ``system_id`` on every IS-IS instance, from what the config set;
    ``metrics`` on every interface (empty when no metric is configured)."""
    for item in facts["isis"]["interfaces"]:
        item.setdefault("metrics", [])
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

    if t[0] == "ring-protection" and len(t) > 2:
        return _ring_protection(facts, t, head)

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
        # an interface whose metrics were set before it was attached gets its instance now
        item = next((i for i in facts["isis"]["interfaces"] if i["interface"] == kv["ip-interface"] and i["instance"] is None), None)
        attach = {"interface": kv["ip-interface"], "instance": kv.get("isis-instance"),
                  "level": _s(kv.get("level")), "type": _s(kv.get("type")), "metrics": item["metrics"] if item else []}
        if item is None:
            facts["isis"]["interfaces"].append(attach)
        else:
            item.update(attach)
        return True
    if head in ("isis interface-level set", "isis interface-level unset") and "ip-interface" in kv and _s(kv.get("level")):
        # the per-level settings of an IS-IS interface; the wide metric is the one the interface advertises
        if "wide-metric" in t:
            wide = _s(kv.get("wide-metric")) if head.endswith(" set") else None
            set_isis_metric(_isis_interface(facts, kv["ip-interface"]), _s(kv["level"]), wide_metric=wide)
        return True

    if t[0] == "cfm" and len(t) > 2 and t[1] in ("service", "servi") and t[2] == "create":
        # cfm service create vs|vlan <x> name <ma> level <n>: the MA, and the level its MEPs run at
        kv = kv_after(3)
        if _s(kv.get("name")):
            _cfm_service(facts, _s(kv["name"])).update(
                {"level": _s(kv.get("level")), "vs": _s(kv.get("vs")), "vlan": _s(kv.get("vlan"))})
        return True
    if t[0] == "cfm" and len(t) > 2 and t[1] in ("service", "servi") and t[2] == "set":
        # cfm service set service <ma> ccm-interval <1sec|100ms|3.33ms|...|0-7|off>: the interval its MEPs send CCMs at
        kv = kv_after(3)
        if _s(kv.get("service")) and "ccm-interval" in kv:
            _cfm_service(facts, _s(kv["service"]))["ccm_interval"] = _s(kv["ccm-interval"])
            return True
        return False
    if head == "cfm mep create":
        kv = kv_after(3)
        port = _s(kv.get("port"))
        if port:
            _role(facts, port, "cfm-mep")
        facts["cfm"]["meps"].append({
            "md": None, "ma": _s(kv.get("service")), "mep_id": _s(kv.get("mepid")), "level": None,
            "direction": _s(kv.get("type")), "interface": _s(kv.get("sub-port")), "port": port,
            "vlan": _s(kv.get("vlan")), "service": None, "ccm_interval": None})
        return True

    return False


def _cfm_service(facts, name):
    """The settings collected so far for CFM service ``name`` (``cfm service create`` / ``set`` lines, in any order)."""
    return facts.setdefault("_cfm_services", {}).setdefault(name, {})


def _ring_protection(facts, t, head):
    """``ring-protection logical-ring ...`` (a G.8032 ring: its two ports, ring id and timers) and
    ``ring-protection virtual-ring ...`` (a protection instance on a logical ring: R-APS VID, MEG
    level, sub-ring termination, RPL owner, revertive, and the VLANs (SAOS 6) or virtual switches
    (SAOS 8) it protects). Timers are configured on the logical ring and reported on each of its
    instances in ``finish``; port hold-off stays on the ring port."""
    kv = _lower_keys(pairs(t[3:]))
    if head == "ring-protection logical-ring create" and _s(kv.get("logical-ring-name")):
        ring = _ring(facts, _s(kv["logical-ring-name"]))
        ring["west"], ring["east"] = _s(kv.get("west-port")), _s(kv.get("east-port"))
        for name, port in (("west", ring["west"]), ("east", ring["east"])):
            ring_port(ring, name)["interface"] = port
            if port:
                _role(facts, port, "ring")
        if _s(kv.get("ring-id")):
            ring["ring_id"] = _s(kv["ring-id"])
        _ring_timers(facts, ring, kv)
        return True
    if head == "ring-protection logical-ring set" and _s(kv.get("ring")):
        _ring_timers(facts, _ring(facts, _s(kv["ring"])), kv)
        return True
    if head == "ring-protection virtual-ring create" and _s(kv.get("virtual-ring-name")) and _s(kv.get("logical-ring")):
        instance = new_ring_instance(_s(kv["virtual-ring-name"]))
        instance.update({"raps_vid": _s(kv.get("raps-vid")), "raps_level": _s(kv.get("mel"))})
        sub = _s(kv.get("sub-ring"))
        instance["type"] = "sub" if sub else "major"
        if sub:
            # west-port-termination / east-port-termination: the sub-ring ends on that port here;
            # no-port-termination: it passes through this node
            instance["termination"] = sub.split("-")[0] if sub.startswith(("west-", "east-")) else "none"
        _ring(facts, _s(kv["logical-ring"]))["instances"].append(instance)
        return True
    instance = _virtual_ring(facts, _s(kv.get("ring")))
    if instance is None:
        return False  # a command on an unknown virtual ring, or a show / clear / force
    if head == "ring-protection virtual-ring set":
        if _s(kv.get("mel")):
            instance["raps_level"] = _s(kv["mel"])
        if _s(kv.get("revertive")):
            instance["revertive"] = _s(kv["revertive"]).lower() == "on"
        for port in ("west", "east"):
            if _s(kv.get(f"{port}-port-rpl")):
                set_rpl(instance, port, _s(kv[f"{port}-port-rpl"]))
        return True
    if head == "ring-protection virtual-ring unset":
        flags = {x.lower() for x in t[5:]}
        if "mel" in flags:
            instance["raps_level"] = None
        if "revertive" in flags:
            instance["revertive"] = None
        for port in ("west", "east"):
            if f"{port}-port-rpl" in flags:
                set_rpl(instance, port, None)
        return True
    if head in ("ring-protection virtual-ring add", "ring-protection virtual-ring remove"):
        members = expand(kv["vid"]) if _s(kv.get("vid")) else [m for m in str(kv.get("vs") or "").split(",") if m]
        for member in members:
            if head.endswith(" add"):
                _add(instance["members"], member)
            elif member in instance["members"]:
                instance["members"].remove(member)
        return True
    return False


def _ring_timers(facts, ring, kv):
    """``guard-time`` (ms) and ``wtr`` (minutes) of a logical ring, and the hold-off time (ms) of each
    of its ports: kept aside until ``finish`` copies the ring timers onto the ring's instances."""
    timers = facts.setdefault("_ring_timers", {}).setdefault(ring["name"], {"wtr": None, "guard": None})
    if _s(kv.get("wtr")):
        timers["wtr"] = _s(kv["wtr"])
    if _s(kv.get("guard-time")):
        timers["guard"] = _s(kv["guard-time"])
    for port in ("west", "east"):
        if _s(kv.get(f"{port}-port-holdoff-time")):
            ring_port(ring, port)["hold_off"] = _s(kv[f"{port}-port-holdoff-time"])


def finish(facts):
    """Derived views once every file is in: MEP levels, services and CCM intervals from their CFM
    service, IS-IS NET parts, ring timers and RPL interfaces on every ring instance, sub-rings
    attached to their ring."""
    services = facts.pop("_cfm_services", {})
    for mep in facts["cfm"]["meps"]:
        service = services.get(mep["ma"]) or {}
        mep["level"] = mep["level"] or service.get("level")
        mep["service"] = mep["service"] or service.get("vs")
        mep["vlan"] = mep["vlan"] or service.get("vlan")
        mep["ccm_interval"] = mep["ccm_interval"] or service.get("ccm_interval")
    timers = facts.pop("_ring_timers", {})
    for ring in facts["rings"]:
        for instance in ring["instances"]:
            instance["timers"].update(timers.get(ring["name"], {}))
    finish_rings(facts)
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
