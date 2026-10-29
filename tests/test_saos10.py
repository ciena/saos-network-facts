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
    assert f["isis"]["interfaces"] == [{"interface": "core", "instance": "CORE", "level": "level-2", "type": "point-to-point"},
                                       {"interface": "lb0", "instance": "CORE", "level": None, "type": None}]
    assert f["segment_routing"]["srgb"] == [{"instance": "CORE", "lower": "16000", "upper": "23999"}]
    assert f["interfaces"][1]["isis"] == "CORE"


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
                           "route_reflector_client": True, "address_families": ["vpnv4 unicast"]}]
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
                                 "port": "3", "vlan": "100", "service": "FD-V"}]
    assert f["ports"]["3"]["roles"] == ["fp", "cfm-mep"]
    assert "_l2vpn" not in f


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
