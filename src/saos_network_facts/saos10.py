# SPDX-License-Identifier: Apache-2.0
"""Facts from the SAOS 10 translator's pivot JSON of a configuration.

The translator turns a CLI or XML configuration into one JSON document keyed by YANG module
(``openconfig-interfaces:interfaces``, ``ciena-mef-fp:fps``, ...). This module walks that document
for the facts and returns the same dict shape as ``saos6`` (hostname, interfaces, loopbacks, VLANs,
ports, LAGs, peers, IS-IS, segment routing, BGP, pseudowires, CFM, G.8032 rings), extended with the
SAOS 10 objects that carry the same information: forwarding domains, flow points, classifiers, VRFs
(with their BGP route distinguisher, route targets, CE neighbours and SRv6 locators), static routes,
EVPN segments and instances, OSPF, MPLS-TP co-routed tunnels and L2VPN services.

Two translator quirks are handled here:

* the CLI pivot carries bookkeeping keys (``__leaf_order__``, ``__key_literal__``, ...) and bare
  leaf names, while the XML pivot prefixes augmented leaves with their module
  (``ciena-openconfig-interfaces:type``); lookups go by local name;
* edits: a CLI ``no`` and an XML ``nc:operation="remove"`` / ``"delete"`` put ``__operation__:
  "remove"`` on the entry (``"replace"`` for a remove-then-recreate), and an entry that exists only
  as the path to a leaf reset carries ``__edit_path__``, or (translator 4.2.1) only its keys and a
  ``__remove__`` naming the deleted leaves (``no oc-if:interfaces interface 9 config ptp-id``); all
  are honoured here: a removed object leaves the facts, a path-only entry is not a create. Translators before 1.13.0 drop the XML
  operation, so ``removed_objects(xml_text)`` still reads it from the XML and ``apply_removals``
  drops those objects.
"""

import ipaddress
import xml.etree.ElementTree as ET

from .saos6 import finish_isis, finish_rings, new_pseudowire, new_ring, new_ring_instance, ring_port, set_isis_metric, set_rpl
from .saos6 import new_facts as _base_facts

NETCONF_NS = "urn:ietf:params:xml:ns:netconf:base:1.0"
REMOVAL_KINDS = {"interface": "interfaces", "fp": "fps", "fd": "fds", "logical-port": "ports", "classifier": "classifiers",
                 "vrf": "vrfs", "ethernet-segment": "segments", "pseudowire": "pseudowires", "g8032-ring": "rings"}


def new_facts():
    facts = _base_facts()
    facts.update({"fds": [], "fps": [], "classifiers": {}, "vrfs": [], "segments": [], "objects": 0,
                  "ospf": {"instances": [], "interfaces": []}, "tp_corouted_tunnels": [], "l2vpn_services": [],
                  "evpn_instances": [], "vrf_instances": [], "static_routes": [], BGP_SETTINGS: {},
                  VRF_SETTINGS: {"bgp": {}, "labels": {}}})
    facts["segment_routing"].update({"srv6": {"locators": []}, "flex_algorithms": []})
    return facts


# ---------------------------------------------------------------- pivot helpers

def local(key):
    return key.rsplit(":", 1)[-1]


OPERATION = "__operation__"
# BGP peer and peer-group settings while a device's files are folded in, keyed (as, "peer" | "group",
# address | name); ``finish`` resolves the inheritance and drops them (they are not facts of their own).
BGP_SETTINGS = "_bgp_settings"
# What BGP (``bgp instance <as> vrf <name>``) and MPLS label management say about each VRF, while a
# device's files are folded in; ``finish`` merges it into ``vrf_instances`` and drops it.
VRF_SETTINGS = "_vrf_settings"
EDIT_PATH = "__edit_path__"
REMOVE = "__remove__"
# List keys (and the leaves naming an entry) that a leaf delete repeats on its path.
KEYS = {"name", "tag", "id", "ptp-id", "xcvr-id", "source-ip", "destination-ip", "vrfName", "prefix", "address",
        "as", "color", "endpoint", "mep-identifier", "ring-name", "instance-name", "port-id",
        "destination-prefix", "afi", "safi", "af-type"}


def clean(obj):
    """The pivot without the translator's ``__*`` bookkeeping keys, except the edit markers this
    module acts on (``__operation__``, ``__edit_path__``, ``__remove__``)."""
    if isinstance(obj, dict):
        return {k: clean(v) for k, v in obj.items() if not k.startswith("__") or k in (OPERATION, EDIT_PATH, REMOVE)}
    if isinstance(obj, list):
        return [clean(v) for v in obj]
    return obj


def removed(obj):
    """True when the pivot marks this entry or container as removed."""
    return isinstance(obj, dict) and obj.get(OPERATION) in ("remove", "delete")


def _deletes_leaf(obj):
    if isinstance(obj, list):
        return any(_deletes_leaf(v) for v in obj)
    return isinstance(obj, dict) and (REMOVE in obj or any(_deletes_leaf(v) for v in obj.values()))


def _sets_leaf(obj, top=True):
    """True when the entry sets a leaf other than its keys (a nested container or list counts by its leaves)."""
    if not isinstance(obj, dict):
        return False
    for key, value in obj.items():
        if key.startswith("__") or (top and local(key) in KEYS):
            continue
        if isinstance(value, list) and value and all(isinstance(v, dict) for v in value):
            if any(_sets_leaf(v) for v in value):  # entries of a nested list, each with its own keys
                return True
        elif not isinstance(value, dict) or _sets_leaf(value, top=False):
            return True
    return False


def removed_leaves(obj):
    """The local names of the leaves a leaf delete (``no <path> <leaf>``) removes from this entry."""
    marks = obj.get(REMOVE) if isinstance(obj, dict) else None
    return {local(str(k)) for k in (marks if isinstance(marks, (dict, list)) else [marks] if marks else [])}


def path_only(obj):
    """True when this entry exists in the pivot only as the path to a leaf edit: marked with
    ``__edit_path__``, or a leaf delete (``__remove__``) that sets nothing besides its keys."""
    if not isinstance(obj, dict) or removed(obj):
        return False
    return obj.get(EDIT_PATH) is not None or (_deletes_leaf(obj) and not _sets_leaf(obj))


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


def _set(current, key, value):
    """Set a fact from a leaf this pivot carries; a leaf the pivot leaves out keeps the earlier value."""
    if value is not None:
        current[key] = value


def _ettp(facts, name, config):
    """A physical port (``type ettp``): its description, PTP id, speed and auto-negotiation, under ``ports``."""
    port = _port(facts, name)
    port["description"] = text(get(config, "description")) or port["description"]
    for leaf in ("ptp-id", "port-speed", "auto-negotiation"):
        value = get(config, leaf)
        if value is not None:
            port[leaf.replace("-", "_")] = text(value)


def _interfaces(facts, container):
    """``openconfig-interfaces:interfaces``. A device's files are applied in order and each one adds
    to what the earlier ones configured (a base file sets ``type loopback``, a device file its
    address): an interface a later file mentions again keeps the leaves it does not set, and its
    addresses are added to the earlier ones."""
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
        kind = text(get(config, "type"))
        current = next((i for i in facts["interfaces"] if i["name"] == name), None)
        if kind == "ettp" or (kind is None and current is None and name in facts["ports"]):
            # a port's leaves, or a later file adding to a port an earlier file typed ettp
            _ettp(facts, name, config)
            continue
        if current is None:
            current = {"name": name, "kind": "unknown", "ip": None, "ipv4": [], "ipv6": [], "vlan": None, "vs": None,
                       "fd": None, "vrf": None, "description": None, "mtu": None}
            facts["interfaces"].append(current)
        _set(current, "kind", kind)
        for family in ("ipv4", "ipv6"):
            for address in _addresses(interface, family):
                _add(current[family], address)
        current["ip"] = current["ipv4"][0] if current["ipv4"] else None
        _set(current, "fd", text(get(get(get(config, "underlay-binding"), "config"), "fd")))
        for key, leaf in (("vrf", "vrfName"), ("description", "description"), ("mtu", "mtu")):
            _set(current, key, text(get(config, leaf)))
        if current["kind"] == "lag":
            members = [text(get(m, "member-port")) for m in entries(get(config, "agg"), "member-ports")]
            lag = next((l for l in facts["lags"] if l["name"] == name), None)
            if lag is None:
                lag = {"name": name, "members": []}
                facts["lags"].append(lag)
            for member in members:
                if member:
                    _add(lag["members"], member)
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
        vlans = facts["classifiers"].setdefault(name, [])  # a later file adds to an earlier classifier
        for entry in entries(classifier, "filter-entry"):
            for vtag in entries(entry, "vtags"):
                vlan = text(get(vtag, "vlan-id"))
                if vlan:
                    _add(vlans, vlan)


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
        current = next((f for f in facts["fds"] if f["name"] == name), None)
        if current is None:
            current = {"name": name, "mode": None}
            facts["fds"].append(current)
        _set(current, "mode", text(get(fd, "mode")))


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
        current = next((f for f in facts["fps"] if f["name"] == name), None)
        if current is None:
            current = {"name": name, "fd": None, "logical_port": None, "classifiers": []}
            facts["fps"].append(current)
        _set(current, "fd", text(get(fp, "fd-name")))
        _set(current, "logical_port", text(get(fp, "logical-port")))
        for classifier in as_list(get(fp, "classifier-list") or None):
            _add(current["classifiers"], text(classifier))


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
                 "nets": nets, "sr_enabled": flag(get(sr, "enabled")), "multi_topology": _isis_multi_topology(instance)}
        if previous is not None:
            # a later file that only adds to the instance keeps what an earlier one set
            for key in ("level", "area", "sr_enabled", "multi_topology"):
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
                current = dict(item, metrics=[])
                facts["isis"]["interfaces"].append(current)
            else:
                current.update({k: v for k, v in item.items() if v is not None})
            _isis_interface_afs(current, interface)
            for level in ("level-1", "level-2"):
                # the metric the interface advertises at the level: narrow `metric`, wide `wide-metric` (RFC 5305)
                settings = get(interface, level)
                values = {"metric": text(get(settings, "metric")), "wide_metric": text(get(settings, "wide-metric"))}
                set_isis_metric(current, level, **{k: v for k, v in values.items() if v is not None})


def _isis_multi_topology(instance):
    """IS-IS multi-topology routing (RFC 5120: IPv6 in its own topology, MT 2): ``multi-topology-mode
    enable``, or the deprecated ``multi-topology <level>`` list; None when the instance leaves it unset."""
    mode = flag(get(get(instance, "multi-topology-mode"), "enable"))
    if mode is not None:
        return mode
    return True if entries(instance, "multi-topology") else None


def _isis_interface_afs(current, interface):
    """The address families configured on an IS-IS interface: ``address-families address-family <afi>
    <safi>`` entries, and ``ipv4-unicast-default-disable`` (IPv4 unicast runs on every IS-IS interface
    unless that is true). ``finish`` turns them into the interface's ``address_families``."""
    configured = current.setdefault("_afs", [])
    for af in entries(get(interface, "address-families"), "address-family"):
        name = " ".join(x for x in (text(get(af, "afi")), text(get(af, "safi"))) if x)
        if not name:
            continue
        if removed(af):
            current["_afs"] = configured = [a for a in configured if a != name]
        else:
            _add(configured, name)
    disabled = flag(get(interface, "ipv4-unicast-default-disable"))
    if disabled is not None:
        current["_ipv4_off"] = disabled


def _bgp_settings(store, entry):
    """The neighbour settings a ``peer`` or ``peer-group`` entry sets, into ``store``: remote AS,
    address families and, per address family, whether the neighbour is a route-reflector client
    (an explicit ``false`` is kept, so a peer can override its group)."""
    if get(entry, "remote-as") is not None:
        store["remote_as"] = text(get(entry, "remote-as"))
    for af in entries(entry, "address-family"):
        name = " ".join(x for x in (text(get(af, "afi")), text(get(af, "safi"))) if x)
        if not name:
            continue
        _add(store["address_families"], name)
        if get(af, "route-reflector-client") is not None:
            store["rr_clients"][name] = bool(flag(get(af, "route-reflector-client")))


def _new_settings():
    return {"remote_as": None, "address_families": [], "rr_clients": {}, "group": None}


def _bgp_peer(facts, asn, peer):
    ip = text(get(peer, "address"))
    current = next((p for p in facts["peers"] if p["kind"] == "bgp" and p["ip"] == ip and p["name"] == f"as{asn}"
                    and p.get("vrf") is None), None)
    if removed(peer):
        facts["peers"] = [p for p in facts["peers"] if p is not current]
        facts[BGP_SETTINGS].pop((asn, "peer", ip), None)
        return
    if path_only(peer):
        return
    if current is None:
        current = {"kind": "bgp", "name": f"as{asn}", "ip": ip, "remote_as": None,
                   "route_reflector_client": False, "address_families": [], "peer_group": None, "vrf": None}
        facts["peers"].append(current)
    settings = facts[BGP_SETTINGS].setdefault((asn, "peer", ip), _new_settings())
    if get(peer, "peer-group") is not None:
        settings["group"] = text(get(peer, "peer-group"))
    _bgp_settings(settings, peer)


def _bgp_group(facts, asn, group):
    """A ``peer-group``: settings its member peers inherit (``finish`` resolves them)."""
    name = text(get(group, "name"))
    if removed(group):
        facts[BGP_SETTINGS].pop((asn, "group", name), None)
    elif not path_only(group):
        _bgp_settings(facts[BGP_SETTINGS].setdefault((asn, "group", name), _new_settings()), group)


def _bgp(facts, container):
    if removed(container):
        facts["peers"] = [p for p in facts["peers"] if p["kind"] != "bgp"]
        facts["bgp"]["instances"] = []
        facts[BGP_SETTINGS] = {}
        facts[VRF_SETTINGS]["bgp"] = {}
        return
    for instance in entries(container, "instance"):
        asn = text(get(instance, "as"))
        if removed(instance):
            facts["peers"] = [p for p in facts["peers"] if not (p["kind"] == "bgp" and p["name"] == f"as{asn}")]
            facts["bgp"]["instances"] = [i for i in facts["bgp"]["instances"] if i["as"] != asn]
            facts[BGP_SETTINGS] = {k: v for k, v in facts[BGP_SETTINGS].items() if k[0] != asn}
            facts[VRF_SETTINGS]["bgp"] = {k: v for k, v in facts[VRF_SETTINGS]["bgp"].items() if k[0] != asn}
            continue
        current = next((i for i in facts["bgp"]["instances"] if i["as"] == asn), None)
        if current is None:
            current = {"as": asn, "router_id": None, "cluster_id": None, "route_reflector": False,
                       "srv6_locator": None, "srv6_locators": {}}
            facts["bgp"]["instances"].append(current)
        for key, leaf in (("router_id", "router-id"), ("cluster_id", "cluster-id")):
            if get(instance, leaf) is not None:
                current[key] = text(get(instance, leaf))
        _bgp_srv6_locators(current, instance)
        for group in entries(instance, "peer-group"):
            _bgp_group(facts, asn, group)
        for peer in entries(instance, "peer"):
            _bgp_peer(facts, asn, peer)
        for vrf in entries(instance, "vrf"):
            _bgp_vrf(facts, asn, vrf)


def _af_name(entry, afi="afi", safi="safi"):
    """``<afi> <safi>`` of an address-family entry (``ipv4 unicast``, ``vpnv6 unicast``), or None."""
    return " ".join(x for x in (text(get(entry, afi)), text(get(entry, safi))) if x) or None


def _bgp_srv6_locators(current, instance):
    """The SRv6 locators a BGP instance allocates its service SIDs from: ``segment-routing srv6 locator``
    for the whole instance and ``address-family <afi> <safi> segment-routing-srv6 locator`` per address
    family (``vpnv4 unicast``, ``vpnv6 unicast``). A VRF address family's own locator wins over the
    instance's address family, which wins over the instance (``finish`` applies that to each VRF)."""
    srv6 = get(get(instance, "segment-routing"), "srv6")
    if removed(srv6) or removed(get(srv6, "locator")):
        current["srv6_locator"] = None
    elif get(srv6, "locator") is not None:
        current["srv6_locator"] = text(get(srv6, "locator"))
    for af in entries(instance, "address-family"):
        name = _af_name(af)
        if not name:
            continue
        sr = get(af, "segment-routing-srv6")
        if removed(af) or removed(sr):
            current["srv6_locators"].pop(name, None)
        elif get(sr, "locator") is not None:
            current["srv6_locators"][name] = text(get(sr, "locator"))


def _new_bgp_vrf():
    return {"route_distinguisher": None, "route_targets": [], "address_families": [], "srv6_locators": {},
            "redistribute": {}}


def _route_targets(store, entries_, af):
    """``route-target <id> direction import|export|both`` entries into ``store`` (one per id and address
    family; ``af`` None for the targets the VRF sets for every address family)."""
    for target in entries_:
        value = text(get(target, "id"))
        if not value:
            continue
        old = next((t for t in store if t["route_target"] == value and t["address_family"] == af), None)
        if removed(target):
            store[:] = [t for t in store if t is not old]
        elif old is None:
            store.append({"route_target": value, "type": text(get(target, "direction")), "address_family": af})
        elif get(target, "direction") is not None:
            old["type"] = text(get(target, "direction"))


def _bgp_vrf(facts, asn, vrf):
    """``bgp instance <as> vrf <name>``: the BGP side of an L3VPN VRF (RFC 4364): its route
    distinguisher, its route targets (for every address family, and per ``vrf-address-family``), the
    address families it runs (``ipv4 unicast``, ``ipv6 unicast``), per address family the SRv6 locator
    its service SIDs come from (End.DT4 / End.DT6, ``segment-routing-srv6 locator``) and the protocols
    it redistributes, and the CE neighbours (``vrf-address-family <afi> <safi> peer <address>``), which
    become BGP ``peers`` with ``vrf`` set."""
    name = text(get(vrf, "name"))
    if not name:
        return
    store = facts[VRF_SETTINGS]["bgp"]
    if removed(vrf):
        store.pop((asn, name), None)
        facts["peers"] = [p for p in facts["peers"] if not (p["kind"] == "bgp" and p["name"] == f"as{asn}" and p.get("vrf") == name)]
        return
    if path_only(vrf) and (asn, name) not in store:
        return
    current = store.setdefault((asn, name), _new_bgp_vrf())
    rd = get(vrf, "route-distinguisher")
    if isinstance(rd, dict) and removed(rd):
        current["route_distinguisher"] = None
    elif rd is not None and not isinstance(rd, dict):
        current["route_distinguisher"] = text(rd)
    if "route-distinguisher" in removed_leaves(vrf):
        current["route_distinguisher"] = None
    _route_targets(current["route_targets"], entries(vrf, "route-target"), None)
    for af in entries(vrf, "vrf-address-family"):
        af_name = _af_name(af)
        if not af_name:
            continue
        if removed(af):
            current["address_families"] = [a for a in current["address_families"] if a != af_name]
            current["route_targets"] = [t for t in current["route_targets"] if t["address_family"] != af_name]
            current["srv6_locators"].pop(af_name, None)
            current["redistribute"].pop(af_name, None)
            for peer in facts["peers"]:
                if peer["kind"] == "bgp" and peer["name"] == f"as{asn}" and peer.get("vrf") == name:
                    peer["address_families"] = [a for a in peer["address_families"] if a != af_name]
            facts["peers"] = [p for p in facts["peers"] if not (p.get("vrf") == name and p["kind"] == "bgp"
                                                               and p["name"] == f"as{asn}" and not p["address_families"])]
            continue
        _add(current["address_families"], af_name)
        _route_targets(current["route_targets"], entries(af, "route-target"), af_name)
        sr = get(af, "segment-routing-srv6")
        if removed(sr):
            current["srv6_locators"].pop(af_name, None)
        elif get(sr, "locator") is not None:
            current["srv6_locators"][af_name] = text(get(sr, "locator"))
        for item in entries(af, "redistribute"):
            protocol = text(get(item, "protocol"))
            protocols = current["redistribute"].setdefault(af_name, [])
            if removed(item):
                current["redistribute"][af_name] = [x for x in protocols if x != protocol]
            elif protocol:
                _add(protocols, protocol)
        for peer in entries(af, "peer"):
            _bgp_vrf_peer(facts, asn, name, af_name, peer)


def _bgp_vrf_peer(facts, asn, vrf, af, peer):
    """A CE neighbour of a VRF (``vrf-address-family <afi> <safi> peer <address>``): one BGP peer per
    address, with ``vrf`` set and the VRF address families it is configured in."""
    ip = text(get(peer, "address"))
    current = next((p for p in facts["peers"] if p["kind"] == "bgp" and p["ip"] == ip and p["name"] == f"as{asn}"
                    and p.get("vrf") == vrf), None)
    if removed(peer):
        if current is not None:
            current["address_families"] = [a for a in current["address_families"] if a != af]
            if not current["address_families"]:
                facts["peers"] = [p for p in facts["peers"] if p is not current]
        return
    if current is None:
        if path_only(peer):
            return
        current = {"kind": "bgp", "name": f"as{asn}", "ip": ip, "remote_as": None,
                   "route_reflector_client": False, "address_families": [], "peer_group": None, "vrf": vrf}
        facts["peers"].append(current)
    _add(current["address_families"], af)
    if get(peer, "remote-as") is not None:
        current["remote_as"] = text(get(peer, "remote-as"))
    if get(peer, "route-reflector-client") is not None:
        current["route_reflector_client"] = bool(flag(get(peer, "route-reflector-client")))


def _bgp_resolve(facts):
    """Each BGP peer with what it inherits from its ``peer-group``: the peer's own remote AS and
    route-reflector-client setting per address family win over the group's; the address families
    are the group's and the peer's. A peer is a route-reflector client when it is one in at least
    one address family."""
    settings = facts.pop(BGP_SETTINGS, {})
    for peer in facts["peers"]:
        if peer["kind"] != "bgp" or peer.get("vrf") is not None:
            continue  # a VRF neighbour has no peer group: its own settings are already in place
        asn = peer["name"][2:]
        own = settings.get((asn, "peer", peer["ip"]), _new_settings())
        group = settings.get((asn, "group", own["group"]), _new_settings()) if own["group"] else _new_settings()
        peer["remote_as"] = own["remote_as"] or group["remote_as"]
        peer["address_families"] = list(group["address_families"])
        for af in own["address_families"]:
            _add(peer["address_families"], af)
        peer["route_reflector_client"] = any({**group["rr_clients"], **own["rr_clients"]}.values())
        peer["peer_group"] = own["group"]


def _vrfs(facts, container):
    """A ``vrfs`` container of ``vrf`` entries keyed by ``name``; read like the ``vrf`` list."""
    if removed(container):
        facts["vrfs"], facts["vrf_instances"] = [], []
        return
    for vrf in entries(container, "vrf"):
        _vrf_entry(facts, text(get(vrf, "name")), vrf)


def _vrf_list(facts, container):
    """``ciena-vrf:vrf``, the top-level VRF list keyed by ``vrfName``."""
    for vrf in as_list(container):
        _vrf_entry(facts, text(get(vrf, "vrfName")), vrf)


def _new_vrf(name):
    return {"name": name, "description": None, "role": None, "srv6_locator_address": None, "srv6_sid_type": None,
            "sr_policy_color": None}


def _vrf_entry(facts, name, vrf):
    """A VRF (a routing and forwarding instance of its own) with its description, its role (``data``,
    or ``management`` for a management VRF), the SRv6 locator address and SID type it allocates its
    service SIDs with (``segment-routing-srv6 locator <ipv6> sid-type u-sid``) and the SR policy color
    that steers its traffic (``sr-policy color``)."""
    if not name:
        return
    if removed(vrf):
        _drop(facts, "vrf", name)
        return
    current = next((v for v in facts["vrf_instances"] if v["name"] == name), None)
    if path_only(vrf) and current is None:
        return
    _add(facts["vrfs"], name)
    if current is None:
        current = _new_vrf(name)
        facts["vrf_instances"].append(current)
    for key, value in (("description", get(vrf, "description")), ("role", get(vrf, "role")),
                       ("sr_policy_color", get(get(vrf, "sr-policy"), "color"))):
        _set(current, key, text(value))
    srv6 = get(vrf, "segment-routing-srv6")
    if removed(srv6):
        current["srv6_locator_address"] = current["srv6_sid_type"] = None
    else:
        _set(current, "srv6_locator_address", text(get(srv6, "locator")))
        _set(current, "srv6_sid_type", text(get(srv6, "sid-type")))
    for key in removed_leaves(vrf) & {"description", "role"}:
        current[key] = None


def _rib(facts, container):
    """``ciena-rib:rib``: static routes per VRF (``rib vrf <name> ipv4|ipv6 <prefix>``; ``default`` is
    the global table). Each next hop is one route: ``next-hop <address>`` (optionally through
    ``outgoing-interface-name``) or ``outgoing-interface <name>`` alone (``Null0`` discards), with its
    route preference (administrative distance), tag and description."""
    routes = facts["static_routes"]
    if removed(container):
        facts["static_routes"] = []
        return
    for vrf in entries(container, "vrf"):
        name = text(get(vrf, "name"))
        if removed(vrf):
            facts["static_routes"] = routes = [r for r in routes if r["vrf"] != name]
            continue
        for family in ("ipv4", "ipv6"):
            for route in entries(vrf, family):
                prefix = text(get(route, "destination-prefix"))
                if removed(route):
                    facts["static_routes"] = routes = [r for r in routes if not (r["vrf"] == name and r["prefix"] == prefix)]
                    continue
                for kind, leaf in (("next_hop", "address"), ("interface", "name")):
                    for hop in entries(route, "next-hop" if kind == "next_hop" else "outgoing-interface"):
                        value = text(get(hop, leaf))
                        old = next((r for r in routes if r["vrf"] == name and r["prefix"] == prefix and r[kind] == value
                                    and (kind == "next_hop" or r["next_hop"] is None)), None)
                        if removed(hop):
                            facts["static_routes"] = routes = [r for r in routes if r is not old]
                            continue
                        if old is None:
                            if path_only(hop):
                                continue
                            old = {"vrf": name, "prefix": prefix, "family": family, "next_hop": None, "interface": None,
                                   "preference": None, "tag": None, "description": None}
                            old[kind] = value
                            routes.append(old)
                        for key, sub in (("preference", "route-preference"), ("tag", "tag"), ("description", "description")):
                            _set(old, key, text(get(hop, sub)))
                        if kind == "next_hop":
                            _set(old, "interface", text(get(hop, "outgoing-interface-name")))


def _mpls(facts, container):
    """``mpls label-management allocation-mode vrf <name> address-family ipv4|ipv6 mode``: how an
    L3VPN over MPLS / SR-MPLS allocates its VPN labels (``per-vrf`` or ``per-prefix``), per VRF. The
    rest of ``mpls`` (interfaces, label blocks) is not a fact: returns False when there is none of this."""
    labels = facts[VRF_SETTINGS]["labels"]
    allocation = get(get(container, "label-management"), "allocation-mode")
    if removed(container) or removed(get(container, "label-management")) or removed(allocation):
        labels.clear()
        return None
    if allocation is None:
        return False
    for vrf in entries(allocation, "vrf"):
        name = text(get(vrf, "name"))
        if not name:
            continue
        if removed(vrf):
            labels.pop(name, None)
            continue
        for af in entries(vrf, "address-family"):
            af_type = text(get(af, "af-type"))
            if removed(af):
                labels.get(name, {}).pop(af_type, None)
            elif af_type and get(af, "mode") is not None:
                labels.setdefault(name, {})[af_type] = text(get(af, "mode"))


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
    if removed(container):
        facts["evpn_instances"] = []
    else:
        _evpn_instances(facts, get(container, "evpn-instances"))
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


EVPN_SERVICES = (("vpls-fd", "vpls"), ("vpws-cross-connect-fd", "vpws"), ("flexible-cross-connect-vlan-aware-fd", "fxc"))


def _evpn_instances(facts, container):
    """``evpn evpn-instances evpn-instance <evi>``: an EVPN instance (EVI) binds a forwarding domain to
    the EVPN control plane: EVPN-VPLS (``vpls-fd``), EVPN-VPWS (``vpws-cross-connect-fd`` with the local
    and remote service ids that pair the two ends) or VLAN-aware FXC; its route targets and route
    distinguisher, and the transport: an SRv6 locator (``segment-routing-srv6 locator``, the End.DT2
    SIDs come from it) or an SR policy color. ``evi`` is the instance id, unique per device."""
    if removed(container):
        facts["evpn_instances"] = []
        return
    for item in entries(container, "evpn-instance"):
        evi = text(get(item, "id"))
        if not evi:
            continue
        current = next((e for e in facts["evpn_instances"] if e["evi"] == evi), None)
        if removed(item):
            facts["evpn_instances"] = [e for e in facts["evpn_instances"] if e is not current]
            continue
        if current is None:
            if path_only(item):
                continue
            current = {"evi": evi, "description": None, "type": None, "fd": None, "fds": [], "local_service_id": None,
                       "remote_service_id": None, "control_word": None, "route_distinguisher": None, "route_targets": [],
                       "srv6_locator": None, "sr_policy_color": None}
            facts["evpn_instances"].append(current)
        if get(item, "description") is not None:
            current["description"] = text(get(item, "description"))
        for leaf, kind in EVPN_SERVICES:
            for fd in entries(item, leaf):
                name = text(get(fd, "forwarding-domain"))
                if not name:
                    continue
                if removed(fd):
                    current["fds"] = [f for f in current["fds"] if f != name]
                    if current["fd"] == name:
                        current["fd"] = current["fds"][0] if current["fds"] else None
                    continue
                _add(current["fds"], name)
                current["fd"] = current["fd"] or name
                current["type"] = kind
                for key, sub in (("local_service_id", "local-service-id"), ("remote_service_id", "remote-service-id")):
                    if get(fd, sub) is not None:
                        current[key] = text(get(fd, sub))
                if get(fd, "control-word") is not None:
                    current["control_word"] = flag(get(fd, "control-word"))
        rd = get(item, "route-distinguisher")
        if isinstance(rd, dict):
            value = next((text(get(v, "value")) for k, v in rd.items() if not k.startswith("__") and isinstance(v, dict)), None)
            current["route_distinguisher"] = value or current["route_distinguisher"]
        for target in entries(item, "vpn-target"):
            value = text(get(target, "route-target"))
            if not value:
                continue
            current["route_targets"] = [t for t in current["route_targets"] if t["route_target"] != value]
            if not removed(target):
                current["route_targets"].append({"route_target": value, "type": text(get(target, "route-target-type"))})
        locator = get(get(item, "segment-routing-srv6"), "locator")
        if locator is not None:
            current["srv6_locator"] = text(locator)
        color = get(get(item, "sr-policy"), "color")
        if color is not None:
            current["sr_policy_color"] = text(color)


def _srv6_locators(sr, container):
    """``segment-routing srv6 locators locator <name>``: an SRv6 locator is the IPv6 prefix the node's
    SRv6 SIDs are allocated from (``prefix``), with its SID format (``sid-type`` ``u-sid`` for
    compressed micro-SIDs or ``uncompressed-sid``), the optional block / node / function lengths
    of the SID structure, the Flex-Algo it belongs to (``algorithm``, 128-255; none is algorithm 0)
    and the IS-IS instances that advertise it (``instances instance``; none means every instance)."""
    locators = sr["srv6"]["locators"]
    if removed(container) or removed(get(container, "locators")):
        sr["srv6"]["locators"] = []
        return
    for item in entries(get(container, "locators"), "locator"):
        name = text(get(item, "name"))
        if not name:
            continue
        current = next((loc for loc in locators if loc["name"] == name), None)
        if removed(item):
            sr["srv6"]["locators"] = locators = [loc for loc in locators if loc is not current]
            continue
        if current is None:
            if path_only(item):
                continue
            current = {"name": name, "prefix": None, "sid_type": None, "algorithm": None, "block_length": None,
                       "node_length": None, "function_length": None, "end_behavior": None, "instances": []}
            locators.append(current)
        for key, leaf in (("prefix", "prefix"), ("sid_type", "sid-type"), ("algorithm", "algorithm"),
                          ("block_length", "block-length"), ("node_length", "node-length"),
                          ("function_length", "function-length"), ("end_behavior", "end-behavior-type")):
            if get(item, leaf) is not None:
                current[key] = text(get(item, leaf))
        for instance in entries(get(item, "instances"), "instance"):
            tag = text(get(instance, "instance"))
            if not tag:
                continue
            if removed(instance):
                current["instances"] = [i for i in current["instances"] if i != tag]
            else:
                _add(current["instances"], tag)


ADMIN_GROUPS = (("include_any", "include-any-admin-group", "include-any"), ("include_all", "include-all-admin-group", "include-all"),
                ("exclude_any", "exclude-any-admin-group", "exclude-any"))


def _flex_algorithms(sr, container):
    """``segment-routing flex-algorithm <128-255>``: a Flex-Algo definition (FAD, RFC 9350): the metric
    its SPF minimises (``flex-algo-metric`` ``igp`` / ``latency`` / ``te``; unset is IGP), whether this
    node advertises the definition and with which priority (``advertise-definition priority``; the
    highest priority FAD in the area wins), and the link affinities (admin groups, by name) the
    computation includes or excludes. The deprecated ``include-any`` / ``include-all`` /
    ``exclude-any`` leaves read the same as their ``-admin-group`` replacements."""
    algos = sr["flex_algorithms"]
    for item in as_list(get(container, "flex-algorithm")):
        number = text(get(item, "algorithm"))
        if not number:
            continue
        current = next((a for a in algos if a["algorithm"] == number), None)
        if removed(item):
            sr["flex_algorithms"] = algos = [a for a in algos if a is not current]
            continue
        if current is None:
            if path_only(item):
                continue
            current = {"algorithm": number, "metric_type": None, "advertise_definition": False, "priority": None,
                       "admin_groups": {"include_any": [], "include_all": [], "exclude_any": []}, "srlg_exclude": []}
            algos.append(current)
        if get(item, "flex-algo-metric") is not None:
            current["metric_type"] = text(get(item, "flex-algo-metric"))
        advertise = get(item, "advertise-definition")
        if removed(advertise):
            current["advertise_definition"], current["priority"] = False, None
        elif advertise is not None:
            current["advertise_definition"] = True
            if get(advertise, "priority") is not None:
                current["priority"] = text(get(advertise, "priority"))
        groups = get(item, "admin-group")
        for key, *leaves in ADMIN_GROUPS:
            for leaf in leaves:
                for color in as_list(get(groups, leaf)):
                    _add(current["admin_groups"][key], text(color))
        for srlg in as_list(get(item, "srlg-exclude")):
            _add(current["srlg_exclude"], text(srlg))


def _segment_routing(facts, container):
    """``ciena-sr:segment-routing``: connected prefix SIDs (``node`` is decided in ``finish``), SRv6
    locators and Flex-Algo definitions."""
    sr = facts["segment_routing"]
    if removed(container):
        sr["prefix_sids"] = []
        sr["srv6"]["locators"], sr["flex_algorithms"] = [], []
        return
    if get(container, "srv6") is not None:
        _srv6_locators(sr, get(container, "srv6"))
    _flex_algorithms(sr, container)
    for item in as_list(get(container, "connected-prefix-sid-map")):
        prefix = text(get(item, "prefix"))
        if not prefix:
            continue
        current = next((p for p in sr["prefix_sids"] if p["prefix"] == prefix), None)
        if removed(item):
            sr["prefix_sids"] = [p for p in sr["prefix_sids"] if p is not current]
            continue
        if current is None:
            current = {"prefix": prefix, "interface": None, "sid": None, "value_type": None, "node": False}
            sr["prefix_sids"].append(current)
        for key, leaf in (("interface", "interface"), ("sid", "start-sid"), ("value_type", "value-type")):
            _set(current, key, text(get(item, leaf)))


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
                           ("mode", get(pw, "mode")), ("tunnel", get(pw, "tunnel-name")),
                           ("tunnel_type", get(pw, "tunnel-type")), ("tunnel_color", get(pw, "tunnel-color"))):
            if value is not None:
                current[key] = text(value)


def _l2vpn_services(facts, container):
    """``ciena-l2vpn:l2vpn-services``: an L2VPN service binds a forwarding domain (its attachment
    circuits) to one or more pseudowires; ``finish`` also names the service on each pseudowire."""
    if removed(container):
        facts["l2vpn_services"] = []
        return
    for svc in entries(container, "l2vpn"):
        name = text(get(svc, "name"))
        if not name:
            continue
        current = next((s for s in facts["l2vpn_services"] if s["name"] == name), None)
        if removed(svc):
            facts["l2vpn_services"] = [s for s in facts["l2vpn_services"] if s is not current]
            continue
        if current is None:
            if path_only(svc):
                continue
            current = {"name": name, "fd": None, "pseudowires": [], "mtu": None, "signaling_type": None}
            facts["l2vpn_services"].append(current)
        for key, leaf in (("fd", "forwarding-domain"), ("mtu", "mtu"), ("signaling_type", "signaling-type")):
            if get(svc, leaf) is not None:
                current[key] = text(get(svc, leaf))
        for pw in as_list(get(svc, "pseudowire")):
            _add(current["pseudowires"], text(pw))


def _ospf(facts, container):
    """``ciena-ospf:ospf``: OSPFv2 instances (router id, VRF, areas and the networks that put
    interfaces in them) and the interfaces each instance runs on (network type, metric, timers,
    passive, BFD). An interface's area is filled in ``finish`` from the area networks."""
    ospf = facts["ospf"]
    if removed(container):
        facts["ospf"] = {"instances": [], "interfaces": []}
        return
    for instance in entries(container, "instance"):
        tag = text(get(instance, "tag"))
        current = next((i for i in ospf["instances"] if i["name"] == tag), None)
        if removed(instance):
            ospf["instances"] = [i for i in ospf["instances"] if i is not current]
            ospf["interfaces"] = [i for i in ospf["interfaces"] if i["instance"] != tag]
            continue
        if current is None:
            if path_only(instance):
                continue
            current = {"name": tag, "router_id": None, "vrf": None, "areas": []}
            ospf["instances"].append(current)
        for key, leaf in (("router_id", "router-id"), ("vrf", "vrf")):
            if get(instance, leaf) is not None:
                current[key] = text(get(instance, leaf))
        for area in entries(get(instance, "areas"), "area"):
            area_id = text(get(area, "id"))
            entry = next((a for a in current["areas"] if a["area"] == area_id), None)
            if removed(area):
                current["areas"] = [a for a in current["areas"] if a is not entry]
                continue
            if entry is None:
                entry = {"area": area_id, "type": None, "networks": []}
                current["areas"].append(entry)
            kind = get(area, "type")
            if kind is not None:
                # a YANG choice: {"stub": {}} / {"nssa": {...}}, or plain text
                entry["type"] = next((local(k) for k in kind if not k.startswith("__")), None) if isinstance(kind, dict) else text(kind)
            for network in entries(area, "network"):
                prefix = text(get(network, "prefix"))
                if prefix and not removed(network):
                    _add(entry["networks"], prefix)
        for interface in entries(get(instance, "interfaces"), "interface"):
            name = text(get(interface, "name"))
            item = next((i for i in ospf["interfaces"] if i["instance"] == tag and i["interface"] == name), None)
            if removed(interface):
                ospf["interfaces"] = [i for i in ospf["interfaces"] if i is not item]
                continue
            if item is None:
                if path_only(interface):
                    continue
                item = {"instance": tag, "interface": name, "area": None, "type": None, "metric": None,
                        "hello_interval": None, "dead_interval": None, "priority": None, "passive": False, "bfd": False}
                ospf["interfaces"].append(item)
            for key, leaf in (("type", "type"), ("metric", "metric"), ("hello_interval", "hello-interval"),
                              ("dead_interval", "dead-interval"), ("priority", "priority")):
                if get(interface, leaf) is not None:
                    item[key] = text(get(interface, leaf))
            if get(interface, "passive") is not None:
                item["passive"] = bool(flag(get(interface, "passive")))
            if get(get(interface, "bfd"), "enable") is not None:
                item["bfd"] = bool(flag(get(get(interface, "bfd"), "enable")))


def _tp_bfd(params):
    """LSP BFD on a co-routed tunnel: enabled unless ``admin-down``; SAOS 10 gives the intervals in microseconds."""
    if not isinstance(params, dict):
        return None
    tx = text(get(params, "desired-min-tx-interval"))
    return {"enabled": not flag(get(params, "admin-down")), "interval_ms": int(tx) // 1000 if tx and tx.isdigit() else None}


def _tp_tunnels(facts, container):
    """``ciena-mpls-tp-corouted:tp-corouted-tunnels``: static MPLS-TP co-routed (bidirectional) tunnels.
    Each node of the path configures its own segment of a tunnel, keyed by name, source and
    destination: the ingress its forward-out and reverse-in labels, a transit node all four, the
    egress forward-in and reverse-out. A backup tunnel names the primary it protects (1:1)."""
    if removed(container):
        facts["tp_corouted_tunnels"] = []
        return
    tunnels = facts["tp_corouted_tunnels"]
    for tunnel in entries(container, "tunnel"):
        key = (text(get(tunnel, "name")), text(get(tunnel, "source-ip")), text(get(tunnel, "destination-ip")))
        current = next((t for t in tunnels if (t["name"], t["source"], t["destination"]) == key), None)
        if removed(tunnel):
            facts["tp_corouted_tunnels"] = tunnels = [t for t in tunnels if t is not current]
            continue
        if current is None:
            if path_only(tunnel):
                continue
            current = {"name": key[0], "source": key[1], "destination": key[2], "type": None, "role": "primary",
                       "primary": None, "admin_state": "enable", "reversion": "enable", "reversion_hold_time": None,
                       "forward_in_label": None, "forward_out_label": None, "next_hop_ip": None,
                       "reverse_in_label": None, "reverse_out_label": None, "prev_hop_ip": None, "bfd": None}
            tunnels.append(current)
        for key_, leaf in (("type", "tunnel-type"), ("role", "tunnel-role-type"), ("admin_state", "tunnel-admin-state"),
                           ("reversion", "tunnel-reversion-state"), ("reversion_hold_time", "reversion-hold-time")):
            if get(tunnel, leaf) is not None:
                current[key_] = text(get(tunnel, leaf))
        primary = get(tunnel, "primary-tunnel-configuration")
        if isinstance(primary, dict) and get(primary, "primary-tunnel-name") is not None:
            current["primary"] = {"name": text(get(primary, "primary-tunnel-name")), "type": text(get(primary, "primary-tunnel-type"))}
        for segment, leaves in (("forward-in-segment", ("forward-in-label",)),
                                ("forward-out-segment", ("forward-out-label", "next-hop-ip")),
                                ("reverse-in-segment", ("reverse-in-label",)),
                                ("reverse-out-segment", ("reverse-out-label", "prev-hop-ip"))):
            for leaf in leaves:
                value = get(get(tunnel, segment), leaf)
                if value is not None:
                    current[leaf.replace("-", "_")] = text(value)
        bfd = _tp_bfd(get(tunnel, "bfd-cfg-parms"))
        if bfd is not None:
            current["bfd"] = bfd


def _cfm(facts, container):
    """``mef-cfm:maintenance-domain``: one MEP record per maintenance-association end point, with the
    MD level and the MA's CCM interval (``ccm-interval``, as written; None when the MA leaves the default)."""
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
                current = next((m for m in meps if (m["md"], m["ma"], m["mep_id"]) == (md_id, ma_id, mep_id)), None)
                if removed(mep) or removed(ma):
                    facts["cfm"]["meps"] = meps = [m for m in meps if m is not current]
                    continue
                if current is None:
                    current = {"md": md_id, "ma": ma_id, "mep_id": mep_id, "level": None, "direction": None, "interface": None,
                               "port": None, "vlan": None, "service": None, "ccm_interval": None}
                    meps.append(current)
                # a later file that mentions the MEP again keeps the leaves it does not set
                for key, value in (("level", get(md, "md-level")), ("direction", get(mep, "direction")),
                                   ("interface", get(mep, "interface")), ("service", fd), ("ccm_interval", get(ma, "ccm-interval"))):
                    _set(current, key, text(value))


def _ring_instance(facts, ring, instance):
    """One ``erp-instance`` of a ring: R-APS VID and level, construct (major ring / sub-ring with or
    without a virtual channel), the forwarding domains it protects, its timers (wtr-timer in minutes,
    guard-timer and hold-off-time in milliseconds), reversion, and the RPL role of each ring port."""
    name = text(get(instance, "instance-name"))
    current = next((i for i in ring["instances"] if i["name"] == name), None)
    if removed(instance):
        ring["instances"] = [i for i in ring["instances"] if i is not current]
        return
    if current is None:
        if path_only(instance):
            return
        current = new_ring_instance(name)
        ring["instances"].append(current)
    for key, leaf in (("raps_vid", "raps-vid"), ("raps_level", "raps-level")):
        if get(instance, leaf) is not None:
            current[key] = text(get(instance, leaf))
    construct = text(get(instance, "erp-instance-construct"))
    if construct is not None:
        construct = local(construct)
        current["type"] = "major" if construct == "major-ring" else "sub" if construct.startswith("sub-ring") else None
        current["virtual_channel"] = None if current["type"] != "sub" else construct == "sub-ring-virtual-channel"
    for member in as_list(get(instance, "data-members") or None):
        _add(current["members"], text(member))
    for key, leaf in (("wtr", "wtr-timer"), ("guard", "guard-timer"), ("hold_off", "hold-off-time")):
        if get(instance, leaf) is not None:
            current["timers"][key] = text(get(instance, leaf))
    if get(instance, "reversion") is not None:
        current["revertive"] = local(text(get(instance, "reversion"))) == "revertive"
    for port in entries(get(instance, "ports"), "port"):
        port_id = text(get(port, "port-id"))
        if removed(port):
            set_rpl(current, port_id, None)
        elif get(port, "rpl") is not None:
            set_rpl(current, port_id, local(text(get(port, "rpl"))))


def _g8032_rings(facts, container):
    """``ciena-itut-g8032-draft:g8032-rings``: each G.8032 ring with its two ring ports (``port0`` is
    reported as ``west``, ``port1`` as ``east``, so SAOS 6 and SAOS 10 rings read alike), its ring id
    and its ERP instances. A ring port's interface gets the ``ring`` role."""
    if removed(container):
        facts["rings"] = []
        return
    for item in entries(container, "g8032-ring"):
        name = text(get(item, "ring-name"))
        if not name:
            continue
        current = next((r for r in facts["rings"] if r["name"] == name), None)
        if removed(item):
            facts["rings"] = [r for r in facts["rings"] if r is not current]
            continue
        if current is None:
            if path_only(item):
                continue
            current = new_ring(name)
            facts["rings"].append(current)
        if get(item, "ring-id") is not None:
            current["ring_id"] = text(get(item, "ring-id"))
        for port in entries(get(item, "ring-ports"), "ring-port"):
            port_id = text(get(port, "port-id"))
            if not port_id or removed(port):
                continue
            entry = ring_port(current, port_id)
            interface = text(get(port, "interface"))
            if interface is not None:
                entry["interface"] = interface
                _add(_port(facts, interface)["roles"], "ring")
                if port_id in ("port0", "port1"):
                    current["west" if port_id == "port0" else "east"] = interface
        for instance in entries(get(item, "erp-instances"), "erp-instance"):
            _ring_instance(facts, current, instance)


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
    "rib": _rib,
    "mpls": _mpls,
    "ptps": _ptps,
    "xcvrs": _xcvrs,
    "evpn": _evpn,
    "segment-routing": _segment_routing,
    "segment-routing-traffic-engineering": _sr_policy,
    "pseudowires": _pseudowires,
    "l2vpn-services": _l2vpn_services,
    "ospf": _ospf,
    "tp-corouted-tunnels": _tp_tunnels,
    "maintenance-domain": _cfm,
    "g8032-rings": _g8032_rings,
}


def extract(pivot, facts=None):
    """Facts from one pivot document; pass ``facts`` to accumulate over a device's files, then ``finish``."""
    facts = facts if facts is not None else new_facts()
    for key, container in clean(root(pivot)).items():
        if key.startswith("__"):
            continue
        facts["objects"] += 1
        handler = HANDLERS.get(local(key))
        if handler and handler(facts, container) is not False:  # False: the object carries no fact
            facts["recognised"] += 1
    facts["lines"] = facts["objects"]
    return facts


def _host_prefix(prefix):
    return prefix.endswith("/32") or prefix.endswith("/128")


def finish(facts):
    """Derived views once every file is in: VLANs per port from flow points and classifiers, the
    ``fp`` role on every logical port a flow point uses, the IS-IS instance on each interface, the
    node SIDs, the service of each pseudowire, the port and VLAN of each CFM MEP, and the ring a
    sub-ring instance is attached to."""
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
    _bgp_resolve(facts)
    for instance in facts["bgp"]["instances"]:
        instance["route_reflector"] = any(p["route_reflector_client"] for p in facts["peers"]
                                          if p["kind"] == "bgp" and p["name"] == f"as{instance['as']}")
    services = {pw: svc for svc in facts["l2vpn_services"] for pw in svc["pseudowires"]}
    modes = {fd["name"]: fd["mode"] for fd in facts["fds"]}
    for pw in facts["pseudowires"]:
        svc = services.get(pw["name"])
        if svc:
            pw["service"] = svc["name"]
            pw["service_type"] = modes.get(svc["fd"]) if modes.get(svc["fd"]) in ("vpws", "vpls") else None
    _ospf_areas(facts)
    _isis_address_families(facts)
    _vrf_instances(facts)
    fps = {fp["name"]: fp for fp in facts["fps"]}
    for mep in facts["cfm"]["meps"]:
        fp = fps.get(mep["interface"])
        if fp:
            mep["port"] = fp["logical_port"]
            vlans = [v for c in fp["classifiers"] for v in facts["classifiers"].get(c, [])]
            mep["vlan"] = vlans[0] if vlans else None
            if mep["port"]:
                _add(_port(facts, mep["port"])["roles"], "cfm-mep")
    finish_rings(facts)
    return finish_isis(facts)


def _vrf_instances(facts):
    """Each VRF with what BGP and MPLS say about it: the VRFs the ``vrf`` list defines, then any that
    only BGP names. Its address families, route distinguisher and route targets, the SRv6 locator each
    address family takes its service SIDs from (its own, else the BGP instance's ``vpnv4 unicast`` /
    ``vpnv6 unicast`` locator, else the instance's), the VPN label allocation, and the interfaces bound
    to it (``vrfName``). A VRF in more than one BGP instance takes the first."""
    settings = facts.pop(VRF_SETTINGS, {"bgp": {}, "labels": {}})
    instances = {i["as"]: i for i in facts["bgp"]["instances"]}
    vrfs = facts["vrf_instances"]
    names = [v["name"] for v in vrfs]
    for (_, name) in settings["bgp"]:
        if name not in names:
            names.append(name)
            vrfs.append(_new_vrf(name))
    for vrf in vrfs:
        asn, bgp = next(((k[0], v) for k, v in settings["bgp"].items() if k[1] == vrf["name"]), (None, _new_bgp_vrf()))
        instance = instances.get(asn) or {}
        locators = {}
        for af in bgp["address_families"]:
            vpn = {"ipv4 unicast": "vpnv4 unicast", "ipv6 unicast": "vpnv6 unicast"}.get(af)
            locator = (bgp["srv6_locators"].get(af) or (instance.get("srv6_locators") or {}).get(vpn)
                       or instance.get("srv6_locator"))
            if locator:
                locators[af] = locator
        vrf.update({"bgp_as": asn, "route_distinguisher": bgp["route_distinguisher"],
                    "address_families": list(bgp["address_families"]), "route_targets": bgp["route_targets"],
                    "srv6_locators": locators, "redistribute": {k: v for k, v in bgp["redistribute"].items() if v},
                    "label_allocation": dict(settings["labels"].get(vrf["name"], {})),
                    "interfaces": [i["name"] for i in facts["interfaces"] if i.get("vrf") == vrf["name"]]})


def _isis_address_families(facts):
    """The address families each IS-IS interface runs (IPv4 unicast unless disabled, plus the ones it
    configures) and, per instance, their union in ``address_families`` (so an IPv6-only IGP is
    explicit), the SRv6 locators the instance advertises (those naming it, and those naming no
    instance) and ``srv6_enabled`` when there is at least one."""
    for item in facts["isis"]["interfaces"]:
        configured, ipv4_off = item.pop("_afs", []), item.pop("_ipv4_off", False)
        afs = [] if ipv4_off else ["ipv4 unicast"]
        item["address_families"] = afs + [a for a in configured if a not in afs]
    locators = facts["segment_routing"].get("srv6", {}).get("locators", [])
    for instance in facts["isis"]["instances"]:
        afs = [a for i in facts["isis"]["interfaces"] if i["instance"] == instance["name"] for a in i["address_families"]]
        instance["address_families"] = sorted(set(afs), key=lambda a: (a != "ipv4 unicast", a))
        instance["srv6_locators"] = [loc["name"] for loc in locators if not loc["instances"] or instance["name"] in loc["instances"]]
        instance["srv6_enabled"] = bool(instance["srv6_locators"])
        instance.setdefault("multi_topology", None)


def _ospf_areas(facts):
    """Each OSPF interface's area: the area of its instance whose ``network`` covers the interface's
    address (SAOS 10 puts interfaces in areas by network). Loopbacks are passive: advertised as a
    stub network, never an adjacency."""
    addresses = {i["name"]: i["ip"] for i in facts["interfaces"]}
    kinds = {i["name"]: i["kind"] for i in facts["interfaces"]}
    instances = {i["name"]: i for i in facts["ospf"]["instances"]}
    for item in facts["ospf"]["interfaces"]:
        if kinds.get(item["interface"]) == "loopback":
            item["passive"] = True
        instance, address = instances.get(item["instance"]), addresses.get(item["interface"])
        if item["area"] is not None or instance is None or not address:
            continue
        try:
            ip = ipaddress.ip_interface(address).ip
        except ValueError:
            continue
        item["area"] = next((a["area"] for a in instance["areas"] if any(_covers(n, ip) for n in a["networks"])), None)


def _covers(network, ip):
    try:
        return ip in ipaddress.ip_network(network, strict=False)
    except ValueError:
        return False


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
        key = "ring-name" if kind == "g8032-ring" else "name"
        if kind in REMOVAL_KINDS and len(children) == 1 and children[0].tag.rsplit("}", 1)[-1] == key:
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
            facts["vrf_instances"] = [v for v in facts.get("vrf_instances", []) if v["name"] != name]
        elif kind == "ethernet-segment":
            facts["segments"] = [s for s in facts.get("segments", []) if s["name"] != name]
        elif kind == "pseudowire":
            facts["pseudowires"] = [p for p in facts["pseudowires"] if p["name"] != name]
        elif kind == "g8032-ring":
            facts["rings"] = [r for r in facts["rings"] if r["name"] != name]
    return facts


def loopbacks(facts):
    return [i for i in facts["interfaces"] if i["kind"] == "loopback"]
