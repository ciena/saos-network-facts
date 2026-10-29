# SPDX-License-Identifier: Apache-2.0
"""Facts from the SAOS 10 translator's pivot JSON of a configuration.

The translator turns a CLI or XML configuration into one JSON document keyed by YANG module
(``openconfig-interfaces:interfaces``, ``ciena-mef-fp:fps``, ...). This module walks that document
for the facts and returns the same dict shape as ``saos6`` (hostname, interfaces, loopbacks, VLANs,
ports, LAGs, peers, IS-IS, segment routing, BGP, pseudowires, CFM), extended with the SAOS 10 objects
that carry the same information: forwarding domains, flow points, classifiers, VRFs, EVPN segments.

Two translator quirks are handled here:

* the CLI pivot carries bookkeeping keys (``__leaf_order__``, ``__key_literal__``, ...) and bare
  leaf names, while the XML pivot prefixes augmented leaves with their module
  (``ciena-openconfig-interfaces:type``); lookups go by local name;
* edits: a CLI ``no`` and an XML ``nc:operation="remove"`` / ``"delete"`` put ``__operation__:
  "remove"`` on the entry (``"replace"`` for a remove-then-recreate), and an entry that exists only
  as the path to a leaf reset carries ``__edit_path__``; both are honoured here: a removed object
  leaves the facts, a path-only entry is not a create. Translators before 1.13.0 drop the XML
  operation, so ``removed_objects(xml_text)`` still reads it from the XML and ``apply_removals``
  drops those objects.
"""

import xml.etree.ElementTree as ET

from .saos6 import finish_isis, new_pseudowire
from .saos6 import new_facts as _base_facts

NETCONF_NS = "urn:ietf:params:xml:ns:netconf:base:1.0"
REMOVAL_KINDS = {"interface": "interfaces", "fp": "fps", "fd": "fds", "logical-port": "ports", "classifier": "classifiers",
                 "vrf": "vrfs", "ethernet-segment": "segments", "pseudowire": "pseudowires"}


def new_facts():
    facts = _base_facts()
    facts.update({"fds": [], "fps": [], "classifiers": {}, "vrfs": [], "segments": [], "objects": 0})
    return facts


# ---------------------------------------------------------------- pivot helpers

def local(key):
    return key.rsplit(":", 1)[-1]


OPERATION = "__operation__"
EDIT_PATH = "__edit_path__"


def clean(obj):
    """The pivot without the translator's ``__*`` bookkeeping keys, except the two edit markers
    this module acts on (``__operation__``, ``__edit_path__``)."""
    if isinstance(obj, dict):
        return {k: clean(v) for k, v in obj.items() if not k.startswith("__") or k in (OPERATION, EDIT_PATH)}
    if isinstance(obj, list):
        return [clean(v) for v in obj]
    return obj


def removed(obj):
    """True when the pivot marks this entry or container as removed."""
    return isinstance(obj, dict) and obj.get(OPERATION) in ("remove", "delete")


def path_only(obj):
    """True when this entry exists in the pivot only as the path to a leaf edit."""
    return isinstance(obj, dict) and obj.get(EDIT_PATH) is not None and not removed(obj)


def get(obj, name, default=None):
    """``obj[name]`` by local name, whichever module prefix the pivot used."""
    if not isinstance(obj, dict):
        return default
    for key, value in obj.items():
        if local(key) == name:
            return value
    return default


def entries(obj, name):
    """A YANG list as a Python list (the pivot uses a dict for a single entry)."""
    value = get(obj, name)
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def as_list(value):
    """A top-level YANG list (``mef-cfm:maintenance-domain``, ``ciena-vrf:vrf``) as a Python list."""
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def text(value):
    return None if value is None else str(value)


def flag(value):
    """A YANG boolean as True / False, or None when unset."""
    if value is None:
        return None
    return value if isinstance(value, bool) else str(value).lower() == "true"


def root(pivot):
    return get(pivot, "config", pivot) if isinstance(pivot, dict) and len(pivot) == 1 else pivot


# ---------------------------------------------------------------- extraction

def _port(facts, name):
    return facts["ports"].setdefault(str(name), {"description": None, "vlans": [], "lag": None, "roles": []})


def _add(lst, value):
    if value not in lst:
        lst.append(value)


def _addresses(interface, family):
    out = []
    for address in entries(get(get(interface, family), "addresses"), "address"):
        ip = text(get(address, "ip"))
        length = text(get(get(address, "config"), "prefix-length"))
        if ip:
            out.append(f"{ip}/{length}" if length else ip)
    return out


def _drop(facts, kind, name):
    apply_removals(facts, {(kind, name)})


def _interfaces(facts, container):
    if removed(container):
        facts["interfaces"], facts["lags"] = [], []
        return
    for interface in entries(container, "interface"):
        name = text(get(interface, "name"))
        if removed(interface):
            _drop(facts, "interface", name)
            continue
        if path_only(interface):
            continue
        config = get(interface, "config") or {}
        kind = text(get(config, "type")) or "unknown"
        if kind == "ettp":
            port = _port(facts, name)
            port["description"] = text(get(config, "description")) or port["description"]
            for leaf in ("ptp-id", "port-speed", "auto-negotiation"):
                value = get(config, leaf)
                if value is not None:
                    port[leaf.replace("-", "_")] = text(value)
            continue
        ipv4 = _addresses(interface, "ipv4")
        ipv6 = _addresses(interface, "ipv6")
        entry = {
            "name": name, "kind": kind, "ip": ipv4[0] if ipv4 else None, "ipv4": ipv4, "ipv6": ipv6,
            "vlan": None, "vs": None,
            "fd": text(get(get(get(config, "underlay-binding"), "config"), "fd")),
            "vrf": text(get(config, "vrfName")),
            "description": text(get(config, "description")),
            "mtu": text(get(config, "mtu")),
        }
        facts["interfaces"] = [i for i in facts["interfaces"] if i["name"] != name] + [entry]
        if kind == "lag":
            members = [text(get(m, "member-port")) for m in entries(get(config, "agg"), "member-ports")]
            members = [m for m in members if m]
            facts["lags"] = [l for l in facts["lags"] if l["name"] != name] + [{"name": name, "members": members}]
            for member in members:
                _port(facts, member)["lag"] = name


def _classifiers(facts, container):
    if removed(container):
        facts["classifiers"] = {}
        return
    for classifier in entries(container, "classifier"):
        name = text(get(classifier, "name"))
        if removed(classifier):
            _drop(facts, "classifier", name)
            continue
        if path_only(classifier):
            continue
        vlans = []
        for entry in entries(classifier, "filter-entry"):
            for vtag in entries(entry, "vtags"):
                vlan = text(get(vtag, "vlan-id"))
                if vlan:
                    _add(vlans, vlan)
        facts["classifiers"][name] = vlans


def _fds(facts, container):
    if removed(container):
        facts["fds"] = []
        return
    for fd in entries(container, "fd"):
        name = text(get(fd, "name"))
        if removed(fd):
            _drop(facts, "fd", name)
            continue
        if path_only(fd):
            continue
        facts["fds"] = [f for f in facts["fds"] if f["name"] != name] + [{"name": name, "mode": text(get(fd, "mode"))}]


def _fps(facts, container):
    if removed(container):
        facts["fps"] = []
        return
    for fp in entries(container, "fp"):
        name = text(get(fp, "name"))
        if removed(fp):
            _drop(facts, "fp", name)
            continue
        if path_only(fp):
            continue
        classifiers = [text(c) for c in as_list(get(fp, "classifier-list") or None)]
        entry = {"name": name, "fd": text(get(fp, "fd-name")), "logical_port": text(get(fp, "logical-port")), "classifiers": classifiers}
        facts["fps"] = [f for f in facts["fps"] if f["name"] != name] + [entry]


def _logical_ports(facts, container):
    if removed(container):
        return
    for lp in entries(container, "logical-port"):
        if removed(lp):
            _drop(facts, "logical-port", text(get(lp, "name")))
            continue
        if path_only(lp):
            continue
        port = _port(facts, text(get(lp, "name")))
        if get(lp, "binding") is not None:
            port["binding"] = text(get(lp, "binding"))
        if get(lp, "description") is not None:
            port["description"] = text(get(lp, "description"))


def _bounds(value):
    """``[{"lower", "upper"}]`` from an SRGB / SRLB list of ``lower-bound`` / ``upper-bound``."""
    out = []
    for block in as_list(value):
        lower, upper = text(get(block, "lower-bound")), text(get(block, "upper-bound"))
        if lower is not None or upper is not None:
            out.append({"lower": lower, "upper": upper})
    return out


def _isis(facts, container):
    if removed(container):
        facts["isis"] = {"instances": [], "interfaces": []}
        facts["segment_routing"]["srgb"] = []
        return
    for instance in entries(container, "instance"):
        if removed(instance) or path_only(instance):
            continue
        tag = text(get(instance, "tag"))
        nets = [text(n) for n in as_list(get(instance, "net"))]
        sr = get(instance, "segment-routing")
        previous = next((i for i in facts["isis"]["instances"] if i["name"] == tag), None)
        entry = {"name": tag, "level": text(get(instance, "level-type")), "area": nets[0] if nets else None,
                 "nets": nets, "sr_enabled": flag(get(sr, "enabled"))}
        if previous is not None:
            # a later file that only adds to the instance keeps what an earlier one set
            for key in ("level", "area", "sr_enabled"):
                if entry[key] is None:
                    entry[key] = previous.get(key)
            if not nets:
                entry["nets"] = previous.get("nets", [])
        facts["isis"]["instances"] = [i for i in facts["isis"]["instances"] if i["name"] != tag] + [entry]
        srgb = _bounds(get(sr, "srgb"))
        if srgb:
            facts["segment_routing"]["srgb"] = [b for b in facts["segment_routing"]["srgb"] if b["instance"] != tag] + [
                dict(b, instance=tag) for b in srgb]
        for interface in entries(get(instance, "interfaces"), "interface"):
            item = {"interface": text(get(interface, "name")), "instance": tag,
                    "level": text(get(interface, "level-type")), "type": text(get(interface, "interface-type"))}
            current = next((i for i in facts["isis"]["interfaces"] if i["interface"] == item["interface"] and i["instance"] == tag), None)
            if current is None:
                facts["isis"]["interfaces"].append(item)
            else:
                current.update({k: v for k, v in item.items() if v is not None})


def _bgp_peer(facts, asn, peer):
    ip = text(get(peer, "address"))
    current = next((p for p in facts["peers"] if p["kind"] == "bgp" and p["ip"] == ip and p["name"] == f"as{asn}"), None)
    if current is None:
        current = {"kind": "bgp", "name": f"as{asn}", "ip": ip, "remote_as": None,
                   "route_reflector_client": False, "address_families": []}
        facts["peers"].append(current)
    if get(peer, "remote-as") is not None:
        current["remote_as"] = text(get(peer, "remote-as"))
    for af in entries(peer, "address-family"):
        name = " ".join(x for x in (text(get(af, "afi")), text(get(af, "safi"))) if x)
        if name:
            _add(current["address_families"], name)
        if flag(get(af, "route-reflector-client")):
            current["route_reflector_client"] = True


def _bgp(facts, container):
    if removed(container):
        facts["peers"] = [p for p in facts["peers"] if p["kind"] != "bgp"]
        facts["bgp"]["instances"] = []
        return
    for instance in entries(container, "instance"):
        asn = text(get(instance, "as"))
        if removed(instance):
            facts["peers"] = [p for p in facts["peers"] if p["kind"] != "bgp"]
            facts["bgp"]["instances"] = [i for i in facts["bgp"]["instances"] if i["as"] != asn]
            continue
        current = next((i for i in facts["bgp"]["instances"] if i["as"] == asn), None)
        if current is None:
            current = {"as": asn, "router_id": None, "cluster_id": None, "route_reflector": False}
            facts["bgp"]["instances"].append(current)
        for key, leaf in (("router_id", "router-id"), ("cluster_id", "cluster-id")):
            if get(instance, leaf) is not None:
                current[key] = text(get(instance, leaf))
        for peer in entries(instance, "peer"):
            if removed(peer) or path_only(peer):
                continue
            _bgp_peer(facts, asn, peer)


def _vrfs(facts, container):
    if removed(container):
        facts["vrfs"] = []
        return
    for vrf in entries(container, "vrf"):
        if removed(vrf):
            _drop(facts, "vrf", text(get(vrf, "name")))
        elif not path_only(vrf):
            _add(facts["vrfs"], text(get(vrf, "name")))


def _vrf_list(facts, container):
    """``ciena-vrf:vrf``, the top-level VRF list keyed by ``vrfName`` (what NETCONF configs carry)."""
    for vrf in as_list(container):
        name = text(get(vrf, "vrfName"))
        if not name:
            continue
        if removed(vrf):
            _drop(facts, "vrf", name)
        elif not path_only(vrf):
            _add(facts["vrfs"], name)


def _ptps(facts, container):
    """The optical transmitter on a physical port: frequency (GHz), state and power, under ports[ptp-id].tx."""
    for ptp in entries(container, "ptp"):
        name = text(get(ptp, "ptp-id"))
        if not name or removed(ptp) or path_only(ptp):
            continue
        tx = get(get(ptp, "properties"), "transmitter")
        if not isinstance(tx, dict):
            continue
        port = _port(facts, name)
        current = dict(port.get("tx") or {})
        freq = text(get(get(tx, "frequency"), "value"))
        if freq is not None:
            current["frequency"] = freq
        if get(tx, "state") is not None:
            current["state"] = text(get(tx, "state"))
        power = text(get(get(tx, "power"), "value"))
        if power is not None:
            current["power"] = power
        port["tx"] = current


def _xcvrs(facts, container):
    """The pluggable's mode on a port (400GZR+, ...), under ports[xcvr-id].xcvr_mode."""
    for x in entries(container, "xcvr"):
        name = text(get(x, "xcvr-id"))
        mode = text(get(get(x, "properties"), "mode"))
        if name and mode and not removed(x):
            _port(facts, name)["xcvr_mode"] = mode


def _esi(identifier):
    """The ESI as text: ``mac 02:00:...`` for a mac-based ESI, else ``<kind> <value>``."""
    if not isinstance(identifier, dict):
        return None
    for kind, body in identifier.items():
        if kind.startswith("__"):
            continue
        if isinstance(body, dict):
            values = [text(v) for k, v in body.items() if not k.startswith("__") and not isinstance(v, (dict, list))]
            value = " ".join(v for v in values if v)
        else:
            value = text(body)
        return f"{'mac' if local(kind) == 'mac-based' else local(kind)} {value}".strip()
    return None


def _evpn(facts, container):
    """EVPN ethernet segments (EVLAG / multihoming): the logical port, the ESI, the redundancy mode
    and the DF-election preference, under ``segments``. Two devices sharing an ESI form one segment."""
    segments = get(container, "ethernet-segments")
    if removed(container) or removed(segments):
        facts["segments"] = []
        return
    for es in entries(segments, "ethernet-segment"):
        name = text(get(es, "name"))
        if not name:
            continue
        if removed(es):
            _drop(facts, "ethernet-segment", name)
            continue
        current = next((s for s in facts["segments"] if s["name"] == name), None)
        if current is None:
            if path_only(es):
                continue
            current = {"name": name, "port": None, "evlag": False, "esi": None, "mode": None, "preference": None}
            facts["segments"].append(current)
        df = get(es, "df-election")
        for key, value in (("port", text(get(es, "logical-port"))), ("esi", _esi(get(es, "ethernet-segment-identifier"))),
                           ("mode", text(get(es, "active-mode"))), ("preference", text(get(df, "preference")))):
            if value is not None:
                current[key] = value
        if get(es, "evlag") is not None:
            current["evlag"] = text(get(es, "evlag")).lower() == "true"


def _segment_routing(facts, container):
    """``ciena-sr:segment-routing``: connected prefix SIDs (``node`` is decided in ``finish``)."""
    sr = facts["segment_routing"]
    if removed(container):
        sr["prefix_sids"] = []
        return
    for item in as_list(get(container, "connected-prefix-sid-map")):
        prefix = text(get(item, "prefix"))
        if not prefix:
            continue
        sr["prefix_sids"] = [p for p in sr["prefix_sids"] if p["prefix"] != prefix]
        if removed(item):
            continue
        sr["prefix_sids"].append({"prefix": prefix, "interface": text(get(item, "interface")), "sid": text(get(item, "start-sid")),
                                  "value_type": text(get(item, "value-type")), "node": False})


def _sid(segment):
    """The SID of one segment-list entry: an MPLS label (type 1) or an SRv6 SID (type 2)."""
    for kind in ("segment-type-1", "segment-type-2"):
        value = get(get(segment, kind), "sid-value")
        if value is not None:
            return text(value)
    return None


def _sr_policy(facts, container):
    """``ciena-sr-policy:segment-routing-traffic-engineering``: segment lists and SR policies."""
    sr = facts["segment_routing"]
    if removed(container):
        sr["policies"], sr["segment_lists"] = [], {}
        return
    for sl in entries(get(get(container, "attributes"), "segment-lists"), "segment-list"):
        name = text(get(sl, "name"))
        if removed(sl):
            sr["segment_lists"].pop(name, None)
            continue
        segments = sorted(entries(get(sl, "segments"), "segment"), key=lambda s: int(get(s, "index") or 0))
        sids = [s for s in (_sid(x) for x in segments) if s is not None]
        if sids or name not in sr["segment_lists"]:
            sr["segment_lists"][name] = sids
    for policy in entries(get(container, "policies"), "policy"):
        color, endpoint = text(get(policy, "color")), text(get(policy, "endpoint"))
        current = next((p for p in sr["policies"] if p["color"] == color and p["endpoint"] == endpoint), None)
        if removed(policy):
            sr["policies"] = [p for p in sr["policies"] if p is not current]
            continue
        if current is None:
            current = {"name": None, "color": color, "endpoint": endpoint, "source": None, "candidate_paths": []}
            sr["policies"].append(current)
        for key in ("name", "source"):
            if get(policy, key) is not None:
                current[key] = text(get(policy, key))
        for cp in entries(get(policy, "candidate-paths"), "candidate-path"):
            path = {"origin": text(get(cp, "protocol-origin")), "originator": text(get(cp, "originator")),
                    "discriminator": text(get(cp, "discriminator")), "preference": text(get(cp, "preference")),
                    "flex_algorithm": text(get(cp, "flex-algorithm")),
                    "segment_lists": [text(get(s, "name")) for s in entries(get(cp, "segment-lists"), "segment-list")]}
            key = (path["origin"], path["originator"], path["discriminator"])
            old = next((c for c in current["candidate_paths"] if (c["origin"], c["originator"], c["discriminator"]) == key), None)
            if old is None:
                current["candidate_paths"].append(path)
            else:
                old.update({k: v for k, v in path.items() if v not in (None, [])})


def _pseudowires(facts, container):
    """``ietf-pseudowires:pseudowires``: the configured (static or LDP) pseudowires and their peers."""
    if removed(container):
        facts["pseudowires"] = []
        return
    for pw in entries(container, "pseudowire"):
        name = text(get(pw, "name"))
        if not name:
            continue
        if removed(pw):
            _drop(facts, "pseudowire", name)
            continue
        current = next((p for p in facts["pseudowires"] if p["name"] == name), None)
        if current is None:
            if path_only(pw):
                continue
            current = new_pseudowire(name)
            current["kind"] = "configured"
            facts["pseudowires"].append(current)
        configured = get(pw, "configured-pw")
        for key, value in (("peer", get(configured, "peer-ip")), ("pw_id", get(configured, "pw-id")),
                           ("in_label", get(configured, "receive-label")), ("out_label", get(configured, "transmit-label")),
                           ("mode", get(pw, "mode")), ("tunnel", get(pw, "tunnel-name"))):
            if value is not None:
                current[key] = text(value)


def _l2vpn_services(facts, container):
    """``ciena-l2vpn:l2vpn-services``: which service (and forwarding domain) each pseudowire carries."""
    services = facts.setdefault("_l2vpn", {})
    for svc in entries(container, "l2vpn"):
        name = text(get(svc, "name"))
        if not name or removed(svc):
            continue
        for pw in as_list(get(svc, "pseudowire")):
            services[text(pw)] = {"service": name, "fd": text(get(svc, "forwarding-domain"))}


def _cfm(facts, container):
    """``mef-cfm:maintenance-domain``: one MEP record per maintenance-association end point."""
    meps = facts["cfm"]["meps"]
    for md in as_list(container):
        md_id = text(get(md, "id"))
        if removed(md):
            facts["cfm"]["meps"] = meps = [m for m in meps if m["md"] != md_id]
            continue
        for ma in entries(md, "maintenance-association"):
            ma_id = text(get(ma, "id"))
            fd = next((text(get(c, "fd-name")) for c in entries(ma, "component-list") if get(c, "fd-name") is not None), None)
            for mep in entries(ma, "maintenance-association-end-point"):
                mep_id = text(get(mep, "mep-identifier"))
                facts["cfm"]["meps"] = meps = [m for m in meps if (m["md"], m["ma"], m["mep_id"]) != (md_id, ma_id, mep_id)]
                if removed(mep) or removed(ma):
                    continue
                meps.append({"md": md_id, "ma": ma_id, "mep_id": mep_id, "level": text(get(md, "md-level")),
                             "direction": text(get(mep, "direction")), "interface": text(get(mep, "interface")),
                             "port": None, "vlan": None, "service": fd})


def _system(facts, container):
    """The hostname; a removed ``system`` clears it, one without a hostname keeps the earlier one."""
    facts["hostname"] = None if removed(container) else (text(get(get(container, "config"), "hostname")) or facts["hostname"])


HANDLERS = {
    "system": _system,
    "interfaces": _interfaces,
    "classifiers": _classifiers,
    "fds": _fds,
    "fps": _fps,
    "logical-ports": _logical_ports,
    "isis": _isis,
    "bgp": _bgp,
    "vrfs": _vrfs,
    "vrf": _vrf_list,
    "ptps": _ptps,
    "xcvrs": _xcvrs,
    "evpn": _evpn,
    "segment-routing": _segment_routing,
    "segment-routing-traffic-engineering": _sr_policy,
    "pseudowires": _pseudowires,
    "l2vpn-services": _l2vpn_services,
    "maintenance-domain": _cfm,
}


def extract(pivot, facts=None):
    """Facts from one pivot document; pass ``facts`` to accumulate over a device's files, then ``finish``."""
    facts = facts if facts is not None else new_facts()
    for key, container in clean(root(pivot)).items():
        if key.startswith("__"):
            continue
        facts["objects"] += 1
        handler = HANDLERS.get(local(key))
        if handler:
            handler(facts, container)
            facts["recognised"] += 1
    facts["lines"] = facts["objects"]
    return facts


def _host_prefix(prefix):
    return prefix.endswith("/32") or prefix.endswith("/128")


def finish(facts):
    """Derived views once every file is in: VLANs per port from flow points and classifiers, the
    ``fp`` role on every logical port a flow point uses, the IS-IS instance on each interface, the
    node SIDs, the service of each pseudowire and the port and VLAN of each CFM MEP."""
    for fp in facts["fps"]:
        port_name = fp["logical_port"]
        if not port_name:
            continue
        port = _port(facts, port_name)
        _add(port["roles"], "fp")
        for classifier in fp["classifiers"]:
            for vlan in facts["classifiers"].get(classifier, []):
                _add(port["vlans"], vlan)
                _add(facts["vlans"].setdefault(vlan, {"ports": []})["ports"], port_name)
    for item in facts["isis"]["interfaces"]:
        for interface in facts["interfaces"]:
            if interface["name"] == item["interface"]:
                interface.setdefault("isis", item["instance"])
    loopbacks = {i["name"] for i in facts["interfaces"] if i["kind"] == "loopback"}
    for sid in facts["segment_routing"]["prefix_sids"]:
        sid["node"] = sid["interface"] in loopbacks and _host_prefix(sid["prefix"])
    for instance in facts["bgp"]["instances"]:
        instance["route_reflector"] = any(p["route_reflector_client"] for p in facts["peers"]
                                          if p["kind"] == "bgp" and p["name"] == f"as{instance['as']}")
    services = facts.pop("_l2vpn", {})
    modes = {fd["name"]: fd["mode"] for fd in facts["fds"]}
    for pw in facts["pseudowires"]:
        svc = services.get(pw["name"])
        if svc:
            pw["service"] = svc["service"]
            pw["service_type"] = modes.get(svc["fd"]) if modes.get(svc["fd"]) in ("vpws", "vpls") else None
    fps = {fp["name"]: fp for fp in facts["fps"]}
    for mep in facts["cfm"]["meps"]:
        fp = fps.get(mep["interface"])
        if fp:
            mep["port"] = fp["logical_port"]
            vlans = [v for c in fp["classifiers"] for v in facts["classifiers"].get(c, [])]
            mep["vlan"] = vlans[0] if vlans else None
            if mep["port"]:
                _add(_port(facts, mep["port"])["roles"], "cfm-mep")
    return finish_isis(facts)


# ---------------------------------------------------------------- NETCONF removals

def removed_objects(xml_text):
    """{(kind, name)} for every list entry an XML configuration removes or deletes outright: an element
    with ``nc:operation`` remove/delete whose only child is its ``name`` key. An operation on a
    deeper leaf (clearing one attribute of an object) leaves the object in place."""
    try:
        tree = ET.fromstring(xml_text)
    except ET.ParseError:
        return set()
    out = set()
    for element in tree.iter():
        op = element.get(f"{{{NETCONF_NS}}}operation")
        if op not in ("remove", "delete"):
            continue
        kind = element.tag.rsplit("}", 1)[-1]
        children = list(element)
        if kind in REMOVAL_KINDS and len(children) == 1 and children[0].tag.rsplit("}", 1)[-1] == "name":
            out.add((kind, (children[0].text or "").strip()))
    return out


def apply_removals(facts, objects):
    for kind, name in objects:
        if kind == "interface":
            facts["interfaces"] = [i for i in facts["interfaces"] if i["name"] != name]
            facts["lags"] = [l for l in facts["lags"] if l["name"] != name]
        elif kind == "fp":
            facts["fps"] = [f for f in facts["fps"] if f["name"] != name]
        elif kind == "fd":
            facts["fds"] = [f for f in facts["fds"] if f["name"] != name]
        elif kind == "logical-port":
            facts["ports"].pop(name, None)
        elif kind == "classifier":
            facts["classifiers"].pop(name, None)
        elif kind == "vrf":
            facts["vrfs"] = [v for v in facts["vrfs"] if v != name]
        elif kind == "ethernet-segment":
            facts["segments"] = [s for s in facts.get("segments", []) if s["name"] != name]
        elif kind == "pseudowire":
            facts["pseudowires"] = [p for p in facts["pseudowires"] if p["name"] != name]
    return facts


def loopbacks(facts):
    return [i for i in facts["interfaces"] if i["kind"] == "loopback"]
