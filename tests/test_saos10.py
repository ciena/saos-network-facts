# SPDX-License-Identifier: Apache-2.0
from saos_network_facts import saos10


def run(*pivots):
    facts = saos10.new_facts()
    for pivot in pivots:
        saos10.extract({"yuma-netconf:config": pivot}, facts)
    return saos10.finish(facts)


IFACES = {"openconfig-interfaces:interfaces": {"interface": [
    {"name": "lb0", "config": {"name": "lb0", "type": "loopback"},
     "ipv4": {"addresses": {"address": [{"ip": "192.0.2.1", "config": {"prefix-length": 32}}]}}},
    {"name": "core", "config": {"name": "core", "ciena-openconfig-interfaces:type": "ip",
                                "underlay-binding": {"config": {"fd": "FD1"}}},
     "ipv4": {"addresses": {"address": {"ip": "198.51.100.0", "config": {"prefix-length": 31}}}}},
]}}


def test_interfaces_by_local_name_and_single_entry_lists():
    f = run(IFACES)
    assert [(i["name"], i["kind"], i["ip"], i["fd"]) for i in f["interfaces"]] == [
        ("lb0", "loopback", "192.0.2.1/32", None), ("core", "ip", "198.51.100.0/31", "FD1")]


def test_removed_and_path_only_entries():
    f = run(
        {"ciena-mef-fd:fds": {"fd": [{"name": "A", "mode": "vpls"}, {"name": "B", "mode": "vpws"}]}},
        {"ciena-mef-fd:fds": {"fd": [{"name": "A", "__operation__": "remove"}, {"name": "C", "__edit_path__": ["x"]}]}},
    )
    assert f["fds"] == [{"name": "B", "mode": "vpws"}]


def test_xml_removals_read_from_the_xml():
    xml = ('<config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"><fps><fp nc:operation="delete"><name>FP1</name></fp></fps>'
           '<fps><fp nc:operation="delete"><name>FP2</name><fd-name>x</fd-name></fp></fps></config>')
    assert saos10.removed_objects(xml) == {("fp", "FP1")}
    assert saos10.removed_objects("<not xml") == set()


def test_isis_net_sr_and_merge_across_files():
    sr = {"enabled": True, "srgb": [{"lower-bound": 16000, "upper-bound": 23999}]}
    net = ["49.0001.1920.0000.2001.00"]
    first = {"ciena-isis:isis": {"instance": [{"tag": "CORE", "level-type": "level-2", "net": net, "segment-routing": sr,
                                                "interfaces": {"interface": [{"name": "core", "interface-type": "point-to-point"}]}}]}}
    later = {"ciena-isis:isis": {"instance": [{"tag": "CORE", "interfaces": {"interface": [{"name": "core", "level-type": "level-2"},
                                                                                         {"name": "lb0"}]}}]}}
    f = run(IFACES, first, later)
    (instance,) = f["isis"]["instances"]
    assert instance["level"] == "level-2" and instance["sr_enabled"] is True
    assert (instance["net"], instance["area_id"]) == ("49.0001.1920.0000.2001.00", "49.0001")
    assert f["isis"]["interfaces"] == [{"interface": "core", "instance": "CORE", "level": "level-2", "type": "point-to-point",
                                        "metrics": [], "address_families": ["ipv4 unicast"]},
                                       {"interface": "lb0", "instance": "CORE", "level": None, "type": None, "metrics": [],
                                        "address_families": ["ipv4 unicast"]}]
    assert f["segment_routing"]["srgb"] == [{"instance": "CORE", "lower": "16000", "upper": "23999"}]
    assert f["interfaces"][1]["isis"] == "CORE"


def test_isis_interface_metrics_per_level_in_configuration_order():
    # level-2 set first, its wide metric in a later file; level-1 only a narrow metric
    first = {"ciena-isis:isis": {"instance": [{"tag": "CORE", "interfaces": {"interface": [
        {"name": "core", "level-2": {"metric": 20}}, {"name": "lb0"}]}}]}}
    later = {"ciena-isis:isis": {"instance": [{"tag": "CORE", "interfaces": {"interface": [
        {"name": "core", "level-2": {"wide-metric": 100}, "level-1": {"metric": 11}}]}}]}}
    f = run(IFACES, first, later)
    core, lb0 = f["isis"]["interfaces"]
    assert core["metrics"] == [{"level": "level-2", "metric": "20", "wide_metric": "100"},
                               {"level": "level-1", "metric": "11", "wide_metric": None}]
    assert lb0["metrics"] == []


def test_prefix_sids_and_node_flag():
    f = run(IFACES, {"ciena-sr:segment-routing": {"connected-prefix-sid-map": [
        {"prefix": "192.0.2.1/32", "interface": "lb0", "start-sid": 1, "value-type": "index"},
        {"prefix": "198.51.100.0/31", "interface": "core", "start-sid": 9, "value-type": "index"}]}})
    assert [(p["prefix"], p["sid"], p["node"]) for p in f["segment_routing"]["prefix_sids"]] == [
        ("192.0.2.1/32", "1", True), ("198.51.100.0/31", "9", False)]


def test_sr_policy_and_segment_lists():
    f = run({"ciena-sr-policy:segment-routing-traffic-engineering": {
        "attributes": {"segment-lists": {"segment-list": [{"name": "L1", "segments": {"segment": [
            {"index": 2, "segment-type-1": {"sid-value": 16003}}, {"index": 1, "segment-type-1": {"sid-value": 16002}}]}}]}},
        "policies": {"policy": [{"color": 100, "endpoint": "192.0.2.3", "name": "p", "source": "192.0.2.1",
                                 "candidate-paths": {"candidate-path": [{"protocol-origin": "local", "originator": "192.0.2.1",
                                                                          "discriminator": 100, "preference": 100,
                                                                          "segment-lists": {"segment-list": [{"name": "L1"}]}}]}}]}}})
    sr = f["segment_routing"]
    assert sr["segment_lists"] == {"L1": ["16002", "16003"]}
    (policy,) = sr["policies"]
    assert (policy["name"], policy["color"], policy["endpoint"]) == ("p", "100", "192.0.2.3")
    assert policy["candidate_paths"][0]["segment_lists"] == ["L1"]


def test_bgp_route_reflector_and_peer_merge():
    first = {"ciena-bgp:bgp": {"instance": [{"as": 65000, "router-id": "192.0.2.1", "cluster-id": "192.0.2.1",
                                             "peer": [{"address": "192.0.2.2", "remote-as": 65000}]}]}}
    later = {"ciena-bgp:bgp": {"instance": [{"as": 65000, "peer": [{"address": "192.0.2.2", "address-family": [
        {"afi": "vpnv4", "safi": "unicast", "route-reflector-client": True}]}]}]}}
    f = run(first, later)
    assert f["peers"] == [{"kind": "bgp", "name": "as65000", "ip": "192.0.2.2", "remote_as": "65000",
                           "route_reflector_client": True, "address_families": ["vpnv4 unicast"], "peer_group": None}]
    assert f["bgp"]["instances"] == [{"as": "65000", "router_id": "192.0.2.1", "cluster_id": "192.0.2.1", "route_reflector": True}]


def test_pseudowire_service_and_cfm_mep_port():
    f = run(
        {"ciena-mef-fd:fds": {"fd": [{"name": "FD-V", "mode": "vpws"}]},
         "ciena-mef-classifier:classifiers": {"classifier": [{"name": "V100", "filter-entry": [{"vtags": [{"tag": 1, "vlan-id": 100}]}]}]},
         "ciena-mef-fp:fps": {"fp": [{"name": "AC", "fd-name": "FD-V", "logical-port": "3", "classifier-list": ["V100"]}]},
         "ietf-pseudowires:pseudowires": {"pseudowire": [{"name": "PW1", "configured-pw": {"peer-ip": "192.0.2.2", "pw-id": 100},
                                                          "ciena-ietf-pseudowires:mode": "spoke"}]},
         "ciena-l2vpn:l2vpn-services": {"l2vpn": [{"name": "SVC", "forwarding-domain": "FD-V", "pseudowire": ["PW1"]}]},
         "mef-cfm:maintenance-domain": [{"id": "MD5", "md-level": 5, "maintenance-association": [{"id": "MA1",
            "component-list": [{"component-id": 1, "ciena-cfm:fd-name": "FD-V"}],
            "maintenance-association-end-point": [{"mep-identifier": 11, "interface": "AC", "direction": "up"}]}]}]},
    )
    (pw,) = f["pseudowires"]
    assert (pw["kind"], pw["peer"], pw["pw_id"], pw["mode"], pw["service"], pw["service_type"]) == (
        "configured", "192.0.2.2", "100", "spoke", "SVC", "vpws")
    assert f["cfm"]["meps"] == [{"md": "MD5", "ma": "MA1", "mep_id": "11", "level": "5", "direction": "up", "interface": "AC",
                                 "port": "3", "vlan": "100", "service": "FD-V", "ccm_interval": None}]
    assert f["ports"]["3"]["roles"] == ["fp", "cfm-mep"]
    assert f["l2vpn_services"] == [{"name": "SVC", "fd": "FD-V", "pseudowires": ["PW1"], "mtu": None, "signaling_type": None}]


def test_cfm_mep_ccm_interval_is_the_maintenance_associations():
    md = lambda ma: {"mef-cfm:maintenance-domain": [{"id": "MD5", "md-level": 5, "maintenance-association": [ma]}]}  # noqa: E731
    mep = lambda n: {"mep-identifier": n, "interface": f"AC{n}", "direction": "up"}  # noqa: E731
    f = run(md({"id": "MA1", "ccm-interval": "10ms", "maintenance-association-end-point": [mep(11), mep(12)]}),
            md({"id": "MA2", "maintenance-association-end-point": [mep(21)]}))
    assert [(m["ma"], m["mep_id"], m["ccm_interval"]) for m in f["cfm"]["meps"]] == [
        ("MA1", "11", "10ms"), ("MA1", "12", "10ms"), ("MA2", "21", None)]


def test_pseudowire_steered_onto_an_sr_policy():
    f = run({"ietf-pseudowires:pseudowires": {"pseudowire": [
        {"name": "PW1", "configured-pw": {"peer-ip": "192.0.2.2", "pw-id": 100},
         "ciena-ietf-pseudowires:tunnel-type": "sr-policy", "ciena-ietf-pseudowires:tunnel-color": 2},
        {"name": "PW2", "configured-pw": {"peer-ip": "192.0.2.3", "pw-id": 200}}]}})
    pw1, pw2 = f["pseudowires"]
    assert (pw1["tunnel_type"], pw1["tunnel_color"]) == ("sr-policy", "2")
    assert (pw2["tunnel_type"], pw2["tunnel_color"]) == (None, None)


def test_top_level_vrf_list():
    f = run({"ciena-vrf:vrf": [{"vrfName": "A"}, {"vrfName": "B"}]}, {"ciena-vrf:vrf": [{"vrfName": "A", "__operation__": "remove"}]})
    assert f["vrfs"] == ["B"]


def test_ospf_areas_interfaces_and_merge():
    first = {"ciena-ospf:ospf": {"instance": [{"tag": 1, "router-id": "192.0.2.1", "interfaces": {"interface": [
        {"name": "core", "type": "point-to-point", "metric": 20}, {"name": "lb0"}]},
        "areas": {"area": [{"id": "0.0.0.0", "network": [{"prefix": "198.51.100.0/31"}, {"prefix": "192.0.2.1/32"}]}]}}]}}
    later = {"ciena-ospf:ospf": {"instance": [{"tag": 1, "interfaces": {"interface": [
        {"name": "core", "hello-interval": 5, "dead-interval": 20, "bfd": {"enable": True}}, {"name": "other", "passive": True}]},
        "areas": {"area": [{"id": 1, "type": {"stub": {}}}]}}]}}
    f = run(IFACES, first, later)
    (instance,) = f["ospf"]["instances"]
    assert instance == {"name": "1", "router_id": "192.0.2.1", "vrf": None, "areas": [
        {"area": "0.0.0.0", "type": None, "networks": ["198.51.100.0/31", "192.0.2.1/32"]},
        {"area": "1", "type": "stub", "networks": []}]}
    core, lb0, other = f["ospf"]["interfaces"]
    assert core == {"instance": "1", "interface": "core", "area": "0.0.0.0", "type": "point-to-point", "metric": "20",
                    "hello_interval": "5", "dead_interval": "20", "priority": None, "passive": False, "bfd": True}
    assert (lb0["area"], lb0["passive"]) == ("0.0.0.0", True)  # a loopback is passive
    assert (other["area"], other["passive"]) == (None, True)  # no such interface: no address, no area


def test_ospf_removals():
    ospf = {"ciena-ospf:ospf": {"instance": [{"tag": 1, "interfaces": {"interface": [{"name": "core"}, {"name": "lb0"}]}}]}}
    f = run(IFACES, ospf, {"ciena-ospf:ospf": {"instance": [{"tag": 1, "interfaces": {"interface": [
        {"name": "lb0", "__operation__": "remove"}]}}]}})
    assert [i["interface"] for i in f["ospf"]["interfaces"]] == ["core"]
    f = run(IFACES, ospf, {"ciena-ospf:ospf": {"instance": [{"tag": 1, "__operation__": "remove"}]}})
    assert f["ospf"] == {"instances": [], "interfaces": []}


TUNNEL = {"name": "TP-1", "source-ip": "192.0.2.1", "destination-ip": "192.0.2.3"}


def test_tp_corouted_tunnel_segments_backup_and_bfd():
    f = run({"ciena-mpls-tp-corouted:tp-corouted-tunnels": {"tunnel": [
        dict(TUNNEL, **{"tunnel-type": "static-transit-corouted", "forward-in-segment": {"forward-in-label": 1001},
                        "forward-out-segment": {"next-hop-ip": "198.51.100.5", "forward-out-label": 1003},
                        "reverse-in-segment": {"reverse-in-label": 1004},
                        "reverse-out-segment": {"prev-hop-ip": "198.51.100.0", "reverse-out-label": 1002}}),
        dict(TUNNEL, name="TP-1-B", **{"tunnel-type": "static-ingress-corouted", "tunnel-role-type": "backup",
                                        "primary-tunnel-configuration": {"primary-tunnel-name": "TP-1",
                                                                         "primary-tunnel-type": "static-ingress-corouted"},
                                        "ciena-bfd-mpls-tp:bfd-cfg-parms": {"desired-min-tx-interval": "3300", "admin-down": False}}),
    ]}})
    transit, backup = f["tp_corouted_tunnels"]
    assert transit == {"name": "TP-1", "source": "192.0.2.1", "destination": "192.0.2.3", "type": "static-transit-corouted",
                       "role": "primary", "primary": None, "admin_state": "enable", "reversion": "enable", "reversion_hold_time": None,
                       "forward_in_label": "1001", "forward_out_label": "1003", "next_hop_ip": "198.51.100.5",
                       "reverse_in_label": "1004", "reverse_out_label": "1002", "prev_hop_ip": "198.51.100.0", "bfd": None}
    assert backup["role"] == "backup" and backup["primary"] == {"name": "TP-1", "type": "static-ingress-corouted"}
    assert backup["bfd"] == {"enabled": True, "interval_ms": 3}


def test_tp_tunnel_merge_and_removal():
    tunnels = lambda *t: {"ciena-mpls-tp-corouted:tp-corouted-tunnels": {"tunnel": list(t)}}  # noqa: E731
    f = run(tunnels(dict(TUNNEL, **{"tunnel-type": "static-ingress-corouted"})),
            tunnels(dict(TUNNEL, **{"tunnel-admin-state": "disable", "forward-out-segment": {"forward-out-label": 7}})))
    (t,) = f["tp_corouted_tunnels"]
    assert (t["type"], t["admin_state"], t["forward_out_label"]) == ("static-ingress-corouted", "disable", "7")
    f = run(tunnels(TUNNEL), tunnels(dict(TUNNEL, __operation__="remove")))
    assert f["tp_corouted_tunnels"] == []


def test_l2vpn_service_removed():
    svc = {"ciena-l2vpn:l2vpn-services": {"l2vpn": [{"name": "A", "forwarding-domain": "FD-A", "mtu": 1500, "signaling-type": "static",
                                                     "pseudowire": ["PW1", "PW2"]}, {"name": "B"}]}}
    f = run(svc, {"ciena-l2vpn:l2vpn-services": {"l2vpn": [{"name": "B", "__operation__": "remove"}]}})
    assert f["l2vpn_services"] == [{"name": "A", "fd": "FD-A", "pseudowires": ["PW1", "PW2"], "mtu": "1500", "signaling_type": "static"}]


def test_a_leaf_delete_creates_nothing():
    """``no oc-if:interfaces interface 9 config ptp-id`` (translator 4.2.1): the entry carries only its
    key and ``__remove__``; it is the path to the deleted leaf, not a new interface or port."""
    f = run(IFACES, {
        "openconfig-interfaces:interfaces": {"__operation__": "none", "interface": [
            {"name": "9", "__operation__": "none",
             "config": {"__operation__": "none", "__remove__": {"ciena-openconfig-if-ethernet-port:ptp-id": []}}}]},
        "ciena-mef-logical-port:logical-ports": {"logical-port": [
            {"name": "9", "__operation__": "none", "__remove__": {"description": []}}]},
        "ciena-packet-ptp:ptps": {"ptp": [{"ptp-id": "9", "properties": {"transmitter": {"__remove__": {"state": []}}}}]},
        "ciena-mpls-tp-corouted:tp-corouted-tunnels": {"tunnel": [dict(TUNNEL, **{"__remove__": {"reversion-hold-time": []}})]},
        "ciena-ospf:ospf": {"instance": [{"tag": 1, "interfaces": {"interface": [{"name": "core", "__remove__": {"metric": []}}]}}]},
    })
    assert [i["name"] for i in f["interfaces"]] == ["lb0", "core"]
    assert f["ports"] == {}
    assert f["tp_corouted_tunnels"] == [] and f["ospf"] == {"instances": [], "interfaces": []}


def test_a_leaf_delete_beside_a_set_is_an_edit():
    f = run({"openconfig-interfaces:interfaces": {"interface": [
        {"name": "x", "config": {"name": "x", "type": "ip", "__remove__": {"description": []}}}]}})
    assert [(i["name"], i["kind"]) for i in f["interfaces"]] == [("x", "ip")]


def ring(name, ring_id, ports, instances):
    return {"ring-name": name, "ring-id": ring_id,
            "ring-ports": {"ring-port": [{"port-id": p, "interface": i} for p, i in ports]},
            "erp-instances": {"erp-instance": instances}}


def erp(name, construct, rpl, **leaves):
    entry = {"instance-name": name, "raps-vid": 4090, "raps-level": 7, "erp-instance-construct": f"ciena-itut-g8032-draft:{construct}",
             "data-members": ["FD-A"], "ports": {"port": [{"port-id": p, "rpl": r} for p, r in rpl]}}
    entry.update(leaves)
    return entry


def test_g8032_major_ring_rpl_owner_and_timers():
    f = run({"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [
        ring("ring_1", 1, [("port0", "1"), ("port1", "2")],
             [erp("erp_1", "major-ring", [("port0", "none"), ("port1", "owner")],
                  **{"wtr-timer": 1, "guard-timer": 200, "hold-off-time": 100, "reversion": "non-revertive"})])]}})
    (r,) = f["rings"]
    assert (r["name"], r["ring_id"], r["west"], r["east"]) == ("ring_1", "1", "1", "2")
    assert r["ports"] == [{"name": "port0", "interface": "1", "hold_off": None}, {"name": "port1", "interface": "2", "hold_off": None}]
    (i,) = r["instances"]
    assert i == {"name": "erp_1", "raps_vid": "4090", "raps_level": "7", "type": "major", "virtual_channel": None, "termination": None,
                 "sub_ring_of": None, "members": ["FD-A"], "revertive": False,
                 "rpl": [{"port": "port0", "interface": "1", "role": "none"}, {"port": "port1", "interface": "2", "role": "owner"}],
                 "timers": {"wtr": "1", "guard": "200", "hold_off": "100"}}
    assert f["ports"]["1"]["roles"] == ["ring"] and f["ports"]["2"]["roles"] == ["ring"]


def test_g8032_sub_ring_without_virtual_channel_and_the_interconnection_node():
    major = ring("ring_1", 1, [("port0", "1"), ("port1", "2")], [erp("erp_1", "major-ring", [("port0", "neighbor"), ("port1", "none")])])
    # the sub-ring's port0 is the major ring's port1: this node is where the sub-ring terminates, so only port1 has an RPL leaf
    sub = ring("ring_2", 2, [("port0", "2"), ("port1", "3")], [erp("erp_2", "sub-ring-no-virtual-channel", [("port1", "owner")])])
    f = run({"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [major, sub]}})
    r1, r2 = f["rings"]
    assert r1["instances"][0]["sub_ring_of"] is None and r1["instances"][0]["virtual_channel"] is None
    (i,) = r2["instances"]
    assert (i["type"], i["virtual_channel"], i["sub_ring_of"]) == ("sub", False, "ring_1")
    assert i["rpl"] == [{"port": "port1", "interface": "3", "role": "owner"}]
    assert i["timers"] == {"wtr": None, "guard": None, "hold_off": None} and i["revertive"] is None  # nothing configured, no defaults
    # a pass-through node of the same sub-ring is attached to nothing
    g = run({"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [
        ring("ring_2", 2, [("port0", "1"), ("port1", "2")],
             [erp("erp_2", "sub-ring-no-virtual-channel", [("port0", "neighbor"), ("port1", "none")])])]}})
    assert g["rings"][0]["instances"][0]["sub_ring_of"] is None
    assert [x["role"] for x in g["rings"][0]["instances"][0]["rpl"]] == ["neighbor", "none"]


def test_g8032_merge_across_files_and_removal():
    first = {"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [
        ring("ring_1", 1, [("port0", "1"), ("port1", "2")], [erp("erp_1", "major-ring", [("port0", "none"), ("port1", "none")])])]}}
    later = {"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [
        {"ring-name": "ring_1", "erp-instances": {"erp-instance": [
            {"instance-name": "erp_1", "ports": {"port": [{"port-id": "port1", "rpl": "owner"}]}, "wtr-timer": 3}]}}]}}
    f = run(first, later)
    (i,) = f["rings"][0]["instances"]
    assert [(x["port"], x["role"]) for x in i["rpl"]] == [("port0", "none"), ("port1", "owner")]
    assert i["timers"]["wtr"] == "3" and i["raps_vid"] == "4090"
    gone = run(first, {"ciena-itut-g8032-draft:g8032-rings": {"g8032-ring": [{"ring-name": "ring_1", "__operation__": "remove"}]}})
    assert gone["rings"] == []
    xml = ('<config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"><g8032-rings><g8032-ring nc:operation="remove">'
           '<ring-name>ring_1</ring-name></g8032-ring></g8032-rings></config>')
    assert saos10.removed_objects(xml) == {("g8032-ring", "ring_1")}
    assert saos10.apply_removals(run(first), {("g8032-ring", "ring_1")})["rings"] == []


def iface(name, config=None, v4=None, v6=None, **extra):
    entry = {"name": name, **extra}
    if config is not None:
        entry["config"] = dict(config, name=name)
    for family, addresses in (("ipv4", v4), ("ipv6", v6)):
        if addresses:
            entry[family] = {"addresses": {"address": [{"ip": ip, "config": {"prefix-length": n}} for ip, n in addresses]}}
    return {"openconfig-interfaces:interfaces": {"interface": [entry]}}


def test_an_interface_in_a_later_file_keeps_the_earlier_leaves():
    # base layer types the loopback, the device layer adds its addresses, the services layer its MTU
    f = run(iface("lo0", {"type": "loopback", "description": "router id"}),
            iface("lo0", v4=[("192.0.2.1", 32)], v6=[("2001:db8::1", 128)]),
            iface("lo0", {"mtu": 1500}, v6=[("2001:db8:1::1", 128)]),
            {"ciena-sr:segment-routing": {"connected-prefix-sid-map": [
                {"prefix": "2001:db8::1/128", "interface": "lo0", "start-sid": 1, "value-type": "index"}]}})
    assert f["interfaces"] == [{"name": "lo0", "kind": "loopback", "ip": "192.0.2.1/32", "ipv4": ["192.0.2.1/32"],
                                "ipv6": ["2001:db8::1/128", "2001:db8:1::1/128"], "vlan": None, "vs": None, "fd": None,
                                "vrf": None, "description": "router id", "mtu": "1500"}]
    assert f["segment_routing"]["prefix_sids"][0]["node"] is True
    assert [i["name"] for i in saos10.loopbacks(f)] == ["lo0"]


def test_a_later_file_sets_a_leaf_again_and_can_still_remove_the_interface():
    f = run(iface("core", {"type": "ip", "mtu": 9000, "description": "old"}), iface("core", {"description": "new"}))
    assert (f["interfaces"][0]["kind"], f["interfaces"][0]["mtu"], f["interfaces"][0]["description"]) == ("ip", "9000", "new")
    gone = run(iface("core", {"type": "ip"}), iface("core", __operation__="remove"))
    assert gone["interfaces"] == []


def test_a_port_and_a_lag_merge_across_files():
    f = run(iface("1", {"type": "ettp", "description": "uplink"}), iface("1", {"port-speed": "10G"}),
            iface("agg1", {"type": "lag", "agg": {"member-ports": [{"member-port": "1"}]}}),
            iface("agg1", {"mtu": 9000, "agg": {"member-ports": [{"member-port": "2"}]}}))
    assert [i["name"] for i in f["interfaces"]] == ["agg1"]
    assert (f["ports"]["1"]["description"], f["ports"]["1"]["port_speed"], f["ports"]["1"]["lag"]) == ("uplink", "10G", "agg1")
    assert f["lags"] == [{"name": "agg1", "members": ["1", "2"]}]


def test_flow_points_domains_classifiers_meps_and_sids_merge_across_files():
    md = {"id": "MD5", "md-level": 5, "maintenance-association": [{"id": "MA1", "ccm-interval": "10ms",
          "maintenance-association-end-point": [{"mep-identifier": 1, "interface": "FP1", "direction": "up"}]}]}
    f = run({"ciena-mef-fd:fds": {"fd": [{"name": "FD1", "mode": "vpls"}]},
             "ciena-mef-classifier:classifiers": {"classifier": [{"name": "C", "filter-entry": [
                 {"vtags": [{"tag": 1, "vlan-id": 100}]}]}]},
             "ciena-mef-fp:fps": {"fp": [{"name": "FP1", "fd-name": "FD1", "logical-port": "3", "classifier-list": ["C"]}]},
             "mef-cfm:maintenance-domain": [md],
             "ciena-sr:segment-routing": {"connected-prefix-sid-map": [
                 {"prefix": "192.0.2.1/32", "interface": "lb0", "start-sid": 1, "value-type": "index"}]}},
            {"ciena-mef-fd:fds": {"fd": [{"name": "FD1", "description": "x"}]},
             "ciena-mef-classifier:classifiers": {"classifier": [{"name": "C", "filter-entry": [
                 {"vtags": [{"tag": 2, "vlan-id": 200}]}]}]},
             "ciena-mef-fp:fps": {"fp": [{"name": "FP1", "description": "x"}]},
             "mef-cfm:maintenance-domain": [{"id": "MD5", "maintenance-association": [{"id": "MA1",
                 "maintenance-association-end-point": [{"mep-identifier": 1, "priority": 7}]}]}],
             "ciena-sr:segment-routing": {"connected-prefix-sid-map": [{"prefix": "192.0.2.1/32", "start-sid": 5}]}})
    assert f["fds"] == [{"name": "FD1", "mode": "vpls"}]
    assert f["classifiers"] == {"C": ["100", "200"]}
    assert f["fps"] == [{"name": "FP1", "fd": "FD1", "logical_port": "3", "classifiers": ["C"]}]
    (mep,) = f["cfm"]["meps"]
    assert (mep["level"], mep["direction"], mep["interface"], mep["ccm_interval"], mep["port"]) == ("5", "up", "FP1", "10ms", "3")
    assert f["segment_routing"]["prefix_sids"] == [{"prefix": "192.0.2.1/32", "interface": "lb0", "sid": "5",
                                                    "value_type": "index", "node": False}]


def bgp(*items, **instance):
    return {"ciena-bgp:bgp": {"instance": [{"as": 64500, **instance, **dict(items)}]}}


def af(afi, safi, **leaves):
    return {"afi": afi, "safi": safi, **leaves}


def test_bgp_peers_inherit_their_peer_group():
    group = {"name": "CLIENTS", "remote-as": 64500, "update-source-interface": "lo0",
             "address-family": [af("l2vpn", "evpn", **{"route-reflector-client": True}), af("ipv6", "unicast")]}
    f = run(bgp(("peer", [{"address": "2001:db8::1", "peer-group": "CLIENTS"},
                          {"address": "2001:db8::2", "peer-group": "CLIENTS", "remote-as": 64501,
                           "address-family": [af("l2vpn", "evpn", **{"route-reflector-client": False}), af("vpnv4", "unicast")]},
                          {"address": "2001:db8::3", "remote-as": 64502}]),
                ("peer-group", [group]), **{"router-id": "192.0.2.4"}))
    assert [(p["ip"], p["remote_as"], p["address_families"], p["route_reflector_client"]) for p in f["peers"]] == [
        ("2001:db8::1", "64500", ["l2vpn evpn", "ipv6 unicast"], True),
        # the peer's own remote AS and route-reflector-client setting win over the group's
        ("2001:db8::2", "64501", ["l2vpn evpn", "ipv6 unicast", "vpnv4 unicast"], False),
        ("2001:db8::3", "64502", [], False)]
    assert f["bgp"]["instances"][0]["route_reflector"] is True
    assert "_bgp_settings" not in f


def test_bgp_peer_group_from_another_file_removal_and_unknown_group():
    group = bgp(("peer-group", [{"name": "RR", "remote-as": 64500, "address-family": [af("l2vpn", "evpn")]}]))
    peer = bgp(("peer", [{"address": "2001:db8::4", "peer-group": "RR"}, {"address": "2001:db8::5", "peer-group": "NONE"}]))
    f = run(peer, group)  # the group may be defined after the peer that names it
    assert [(p["remote_as"], p["address_families"]) for p in f["peers"]] == [("64500", ["l2vpn evpn"]), (None, [])]
    f = run(group, peer, bgp(("peer-group", [{"name": "RR", "__operation__": "remove"}]),
                             ("peer", [{"address": "2001:db8::5", "__operation__": "remove"}])))
    assert [(p["ip"], p["remote_as"]) for p in f["peers"]] == [("2001:db8::4", None)]


# ---------------------------------------------------------------- schema 1.6: SRv6, Flex-Algo, IS-IS AFs, EVPN instances
# Pivot shapes as the translator (4.2.x, SAOS 10.12) writes them for the CLI in each comment.

SR = {"ciena-sr:segment-routing": {
    # segment-routing srv6 locators locator LOC-A sid-type u-sid prefix 2001:db8:a0:1::/64 algorithm 128
    # segment-routing srv6 locators locator LOC-A instances instance CORE
    "srv6": {"locators": {"locator": [
        {"name": "LOC-A", "sid-type": "u-sid", "prefix": "2001:db8:a0:1::/64", "algorithm": 128,
         "instances": {"instance": [{"instance": "CORE"}]}},
        {"name": "LOC-B", "sid-type": "uncompressed-sid", "prefix": "2001:db8:b0:1::/64",
         "block-length": 32, "node-length": 16, "function-length": 16},
    ]}},
    # segment-routing flex-algorithm 128 flex-algo-metric latency / advertise-definition priority 200 /
    #   admin-group include-any-admin-group red green; flex-algorithm 129 admin-group exclude-any-admin-group blue
    "flex-algorithm": [
        {"algorithm": 128, "flex-algo-metric": "latency", "advertise-definition": {"priority": 200},
         "admin-group": {"include-any-admin-group": ["red", "green"]}},
        {"algorithm": 129, "admin-group": {"exclude-any-admin-group": ["blue"], "include-all": ["gold"]}},
    ],
}}

ISIS = {"ciena-isis:isis": {"instance": [
    {"tag": "CORE", "net": ["49.0001.0000.0000.0001.00"], "multi-topology-mode": {"enable": True},
     "interfaces": {"interface": [
         # isis instance CORE interfaces interface lb0 address-families address-family ipv6 unicast
         {"name": "lb0", "address-families": {"address-family": [{"afi": "ipv6", "safi": "unicast"}]}},
         # ... interface core ipv4-unicast-default-disable true + address-family ipv6 unicast: IPv6 only
         {"name": "core", "ipv4-unicast-default-disable": True,
          "address-families": {"address-family": [{"afi": "ipv6", "safi": "unicast"}]}},
     ]}},
    {"tag": "EDGE", "multi-topology": [{"level": "level-2"}], "interfaces": {"interface": [{"name": "edge"}]}},
]}}

EVPN = {"ciena-evpn:evpn": {"evpn-instances": {"evpn-instance": [
    # evpn evpn-instances evpn-instance 101 vpls-fd fd-vpls-101 / vpn-target 64496:101 route-target-type both /
    #   segment-routing-srv6 locator LOC-A / route-distinguisher ip-based value 192.0.2.1:101
    {"id": 101, "vpls-fd": [{"forwarding-domain": "fd-vpls-101"}],
     "vpn-target": [{"route-target": "64496:101", "route-target-type": "both"}],
     "route-distinguisher": {"ip-based": {"value": "192.0.2.1:101"}},
     "segment-routing-srv6": {"locator": "LOC-A"}},
    # evpn evpn-instances evpn-instance 201 vpws-cross-connect-fd fd-vpws-201 local-service-id 1 remote-service-id 2 control-word false
    {"id": 201, "vpws-cross-connect-fd": [{"forwarding-domain": "fd-vpws-201", "local-service-id": 1,
                                           "remote-service-id": 2, "control-word": False}],
     "vpn-target": [{"route-target": "64496:201", "route-target-type": "import"},
                    {"route-target": "64496:202", "route-target-type": "export"}],
     "sr-policy": {"color": 100}},
]}}}


def test_srv6_locators_and_flex_algorithms():
    sr = run(SR)["segment_routing"]
    assert sr["srv6"]["locators"] == [
        {"name": "LOC-A", "prefix": "2001:db8:a0:1::/64", "sid_type": "u-sid", "algorithm": "128", "block_length": None,
         "node_length": None, "function_length": None, "end_behavior": None, "instances": ["CORE"]},
        {"name": "LOC-B", "prefix": "2001:db8:b0:1::/64", "sid_type": "uncompressed-sid", "algorithm": None,
         "block_length": "32", "node_length": "16", "function_length": "16", "end_behavior": None, "instances": []},
    ]
    assert sr["flex_algorithms"] == [
        {"algorithm": "128", "metric_type": "latency", "advertise_definition": True, "priority": "200",
         "admin_groups": {"include_any": ["red", "green"], "include_all": [], "exclude_any": []}, "srlg_exclude": []},
        {"algorithm": "129", "metric_type": None, "advertise_definition": False, "priority": None,
         "admin_groups": {"include_any": [], "include_all": ["gold"], "exclude_any": ["blue"]}, "srlg_exclude": []},
    ]


def test_srv6_and_flex_algo_merge_across_files_and_removal():
    later = {"ciena-sr:segment-routing": {
        "srv6": {"locators": {"locator": [{"name": "LOC-A", "instances": {"instance": [{"instance": "EDGE"}]}},
                                          {"name": "LOC-B", "__operation__": "remove"},
                                          {"name": "LOC-C", "__edit_path__": ["x"]}]}},
        "flex-algorithm": [{"algorithm": 128, "advertise-definition": {"__operation__": "remove"}},
                           {"algorithm": 129, "__operation__": "remove"}]}}
    sr = run(SR, later)["segment_routing"]
    (loc,) = sr["srv6"]["locators"]
    assert (loc["name"], loc["prefix"], loc["algorithm"], loc["instances"]) == ("LOC-A", "2001:db8:a0:1::/64", "128", ["CORE", "EDGE"])
    (algo,) = sr["flex_algorithms"]
    assert (algo["algorithm"], algo["metric_type"], algo["advertise_definition"], algo["priority"]) == ("128", "latency", False, None)
    gone = run(SR, {"ciena-sr:segment-routing": {"__operation__": "remove"}})["segment_routing"]
    assert gone["srv6"] == {"locators": []} and gone["flex_algorithms"] == []


def test_isis_address_families_topology_and_srv6_binding():
    f = run(IFACES, SR, ISIS)
    instances = {i["name"]: i for i in f["isis"]["instances"]}
    interfaces = {i["interface"]: i for i in f["isis"]["interfaces"]}
    assert interfaces["lb0"]["address_families"] == ["ipv4 unicast", "ipv6 unicast"]
    assert interfaces["core"]["address_families"] == ["ipv6 unicast"]
    assert interfaces["edge"]["address_families"] == ["ipv4 unicast"]
    assert not any(k.startswith("_") for i in f["isis"]["interfaces"] for k in i)
    core, edge = instances["CORE"], instances["EDGE"]
    assert (core["address_families"], core["multi_topology"]) == (["ipv4 unicast", "ipv6 unicast"], True)
    # LOC-A names CORE, LOC-B names no instance: advertised in every instance
    assert (core["srv6_locators"], core["srv6_enabled"]) == (["LOC-A", "LOC-B"], True)
    assert (edge["address_families"], edge["multi_topology"], edge["srv6_locators"]) == (["ipv4 unicast"], True, ["LOC-B"])
    plain = run(IFACES, {"ciena-isis:isis": {"instance": [{"tag": "X", "interfaces": {"interface": [{"name": "core"}]}}]}})
    (x,) = plain["isis"]["instances"]
    assert (x["multi_topology"], x["srv6_enabled"], x["srv6_locators"]) == (None, False, [])


def test_isis_interface_af_removed_in_a_later_file():
    later = {"ciena-isis:isis": {"instance": [{"tag": "CORE", "interfaces": {"interface": [
        {"name": "lb0", "address-families": {"address-family": [{"afi": "ipv6", "safi": "unicast", "__operation__": "remove"}]}}]}}]}}
    f = run(ISIS, later)
    lb0 = next(i for i in f["isis"]["interfaces"] if i["interface"] == "lb0")
    assert lb0["address_families"] == ["ipv4 unicast"]


def test_evpn_instances_vpls_and_vpws():
    vpls, vpws = run(EVPN)["evpn_instances"]
    assert vpls == {"evi": "101", "description": None, "type": "vpls", "fd": "fd-vpls-101", "fds": ["fd-vpls-101"],
                    "local_service_id": None, "remote_service_id": None, "control_word": None,
                    "route_distinguisher": "192.0.2.1:101", "route_targets": [{"route_target": "64496:101", "type": "both"}],
                    "srv6_locator": "LOC-A", "sr_policy_color": None}
    assert (vpws["type"], vpws["fd"], vpws["local_service_id"], vpws["remote_service_id"], vpws["control_word"]) == (
        "vpws", "fd-vpws-201", "1", "2", False)
    assert vpws["route_targets"] == [{"route_target": "64496:201", "type": "import"}, {"route_target": "64496:202", "type": "export"}]
    assert (vpws["srv6_locator"], vpws["sr_policy_color"]) == (None, "100")


def test_evpn_instances_merge_remove_and_keep_segments():
    segment = {"ciena-evpn:evpn": {"ethernet-segments": {"ethernet-segment": [{"name": "ES1", "logical-port": "LAG1"}]}}}
    later = {"ciena-evpn:evpn": {"evpn-instances": {"evpn-instance": [
        {"id": 101, "vpn-target": [{"route-target": "64496:101", "__operation__": "remove"}], "description": "blue"},
        {"id": 201, "__operation__": "remove"},
        {"id": 301, "__edit_path__": ["x"]}]}}}
    f = run(EVPN, segment, later)
    (evi,) = f["evpn_instances"]
    assert (evi["evi"], evi["description"], evi["route_targets"], evi["srv6_locator"]) == ("101", "blue", [], "LOC-A")
    assert [s["name"] for s in f["segments"]] == ["ES1"]
    assert run(EVPN, {"ciena-evpn:evpn": {"__operation__": "remove"}})["evpn_instances"] == []


def test_bgp_peer_group_name():
    f = run({"ciena-bgp:bgp": {"instance": [{"as": 64496, "peer": [
        {"address": "2001:db8::2", "peer-group": "RR-CLIENTS"}, {"address": "2001:db8::3", "remote-as": 64497}]}]}})
    assert [(p["ip"], p["peer_group"]) for p in f["peers"]] == [("2001:db8::2", "RR-CLIENTS"), ("2001:db8::3", None)]
