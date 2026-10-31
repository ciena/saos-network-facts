# SPDX-License-Identifier: Apache-2.0
from saos_network_facts import saos6


def facts(*lines):
    return saos6.merge(["\n".join(lines)])


def test_interfaces_vlans_and_lags():
    f = facts(
        "system set host-name AGG1",
        "interface create loopback lb0 ip 203.0.113.1/32",
        "interface create ip-interface core ip 198.51.100.0/31 vlan 100",
        "vlan create vlan 100,200",
        "vlan add vlan 100,200 port 1-2",
        "vlan remove vlan 200 port 2",
        "aggregation create agg LAG1",
        "aggregation add agg LAG1 port 3-4",
    )
    assert f["hostname"] == "AGG1"
    assert [i["kind"] for i in f["interfaces"]] == ["loopback", "ip"]
    assert f["interfaces"][1]["vlan"] == "100"
    assert f["vlans"]["200"] == {"ports": ["1"]}
    assert f["ports"]["2"]["vlans"] == ["100"]
    assert f["lags"] == [{"name": "LAG1", "members": ["3", "4"]}]
    assert f["ports"]["4"]["lag"] == "LAG1"
    assert f["recognised"] == f["lines"] == 8


def test_unrecognised_lines_are_counted_not_rejected():
    f = facts("# a comment", "snmp set community-string x", "system set host-name A")
    assert (f["lines"], f["recognised"]) == (2, 1)


def test_isis_area_net_and_level():
    f = facts(
        "isis instance create isis-instance CORE level L2 area 49.0011",
        "isis instance set isis-instance CORE net 49.0011.1920.0000.2001.00",
        "isis interface attach ip-interface core isis-instance CORE level L2",
    )
    (instance,) = f["isis"]["instances"]
    assert instance["level"] == "L2"
    assert instance["area"] == "49.0011"
    assert instance["net"] == "49.0011.1920.0000.2001.00"
    assert (instance["area_id"], instance["system_id"]) == ("49.0011", "1920.0000.2001")
    assert f["isis"]["interfaces"] == [{"interface": "core", "instance": "CORE", "level": "L2", "type": None, "metrics": []}]


def test_isis_interface_level_wide_metric():
    f = facts(
        "isis interface-level set ip-interface early level L2 wide-metric 30",
        "isis interface attach ip-interface core isis-instance CORE level L1-L2",
        "isis interface attach ip-interface early isis-instance CORE level L2",
        "isis interface-level set ip-interface core level L2 wide-metric 100 priority 70",
        "isis interface-level set ip-interface core level L1 hello-timer 5 wide-metric 50",
        "isis interface-level set ip-interface core level L1 priority 10",
    )
    early, core = f["isis"]["interfaces"]
    assert core["metrics"] == [{"level": "L2", "metric": None, "wide_metric": "100"},
                               {"level": "L1", "metric": None, "wide_metric": "50"}]
    assert early == {"interface": "early", "instance": "CORE", "level": "L2", "type": None,
                     "metrics": [{"level": "L2", "metric": None, "wide_metric": "30"}]}
    unset = facts("isis interface attach ip-interface core isis-instance CORE",
                  "isis interface-level set ip-interface core level L2 wide-metric 100",
                  "isis interface-level unset ip-interface core level L2 priority wide-metric")
    assert unset["isis"]["interfaces"][0]["metrics"] == []


def test_isis_area_without_net():
    (instance,) = facts("isis instance create isis-instance T level L1 area 49.0000")["isis"]["instances"]
    assert (instance["net"], instance["area_id"], instance["system_id"]) == (None, "49.0000", None)


def test_pseudowires_static_and_dynamic():
    f = facts(
        "mpls l2-vpn create static-vc VC1 pw-id 201 peer 203.0.113.30 in-label 8001 out-label 8002 tp-tunnel-ingr-corout TUN1",
        "mpls l2-vpn create dynamic-vc VC2 pw-id 202 peer 203.0.113.31 ldp-lsp pw-type eth-tagged pw-mode mesh",
        "virtual-switch ethernet attach mpls-vc VC2 vs VS200",
    )
    vc1, vc2 = f["pseudowires"]
    assert vc1 == {"name": "VC1", "kind": "static", "peer": "203.0.113.30", "pw_id": "201", "in_label": "8001",
                   "out_label": "8002", "mode": None, "tunnel": "TUN1", "tunnel_type": None, "tunnel_color": None,
                   "service": None, "service_type": None}
    assert (vc2["kind"], vc2["peer"], vc2["pw_id"], vc2["mode"], vc2["service"]) == ("dynamic", "203.0.113.31", "202", "mesh", "VS200")
    # the static VC is still a peer, as before the pseudowire list existed
    assert f["peers"] == [{"kind": "mpls-vc", "name": "VC1", "ip": "203.0.113.30"}]
    assert f["recognised"] == 3


def test_cfm_mep_takes_level_from_its_service():
    f = facts(
        "cfm service create vs VS200 name MA-200 level 4",
        "cfm mep create service MA-200 port 3 type up mepid 21 vlan 200",
        "cfm mep create service MA-200 sub-port sp1 type down mepid 22",
    )
    mep, sub = f["cfm"]["meps"]
    assert mep == {"md": None, "ma": "MA-200", "mep_id": "21", "level": "4", "direction": "up", "interface": None,
                   "port": "3", "vlan": "200", "service": "VS200", "ccm_interval": None}
    assert (sub["interface"], sub["port"], sub["direction"]) == ("sp1", None, "down")
    assert "cfm-mep" in f["ports"]["3"]["roles"]
    assert "_cfm_services" not in f


def test_cfm_mep_ccm_interval_from_its_service_set_in_any_order():
    f = facts(
        "cfm service set service MA-100 ccm-interval 100ms",   # before the create
        "cfm service create vs VS100 name MA-100 level 4",
        "cfm service create vs VS200 name MA-200 level 4",
        "cfm service set service MA-200 ccm-interval 3.33ms",  # after it
        "cfm service create vs VS300 name MA-300 level 4",     # left at the default
        "cfm service set service MA-300 alarm-time 3000",      # a setting the facts do not carry
        "cfm mep create service MA-100 port 1 type up mepid 11",
        "cfm mep create service MA-200 port 2 type up mepid 21",
        "cfm mep create service MA-300 port 3 type up mepid 31",
    )
    assert [(m["ma"], m["level"], m["service"], m["ccm_interval"]) for m in f["cfm"]["meps"]] == [
        ("MA-100", "4", "VS100", "100ms"), ("MA-200", "4", "VS200", "3.33ms"), ("MA-300", "4", "VS300", None)]
    assert (f["lines"], f["recognised"]) == (9, 8)


def test_expand_and_net_parts():
    assert saos6.expand("1-3,7,lag1") == ["1", "2", "3", "7", "lag1"]
    assert saos6.net_parts("49.0001.1720.1600.0001.00") == ("49.0001", "1720.1600.0001")
    assert saos6.net_parts("49.0001") == (None, None)


def test_virtual_rings_major_and_sub_ring_on_an_interconnection_node():
    f = facts(
        "ring-protection logical-ring create logical-ring-name lr1 ring-id 1 west-port 1 east-port 3 WTR 1",
        "ring-protection logical-ring set ring lr1 guard-time 1000 west-port-holdoff-time 100",
        "ring-protection logical-ring create logical-ring-name lr2 ring-id 2 west-port 3 east-port 2",
        "ring-protection virtual-ring create virtual-ring-name vr1 logical-ring lr1 raps-vid 100 mel 7",
        "ring-protection virtual-ring add ring vr1 vid 1000-1001",
        "ring-protection virtual-ring set ring vr1 east-port-rpl owner revertive on",
        "ring-protection virtual-ring create virtual-ring-name vr2 logical-ring lr2 raps-vid 102 sub-ring east-port-termination",
        "ring-protection virtual-ring add ring vr2 vid 1000",
        "ring-protection virtual-ring set ring vr2 mel 7",
    )
    lr1, lr2 = f["rings"]
    assert (lr1["name"], lr1["ring_id"], lr1["west"], lr1["east"]) == ("lr1", "1", "1", "3")
    assert lr1["ports"] == [{"name": "west", "interface": "1", "hold_off": "100"}, {"name": "east", "interface": "3", "hold_off": None}]
    (vr1,) = lr1["instances"]
    assert vr1 == {"name": "vr1", "raps_vid": "100", "raps_level": "7", "type": "major", "virtual_channel": None, "termination": None,
                   "sub_ring_of": None, "rpl": [{"port": "east", "interface": "3", "role": "owner"}], "members": ["1000", "1001"],
                   "timers": {"wtr": "1", "guard": "1000", "hold_off": None}, "revertive": True}
    (vr2,) = lr2["instances"]
    assert (vr2["type"], vr2["termination"], vr2["sub_ring_of"], vr2["raps_level"]) == ("sub", "east", "lr1", "7")
    assert vr2["rpl"] == [] and vr2["revertive"] is None
    assert vr2["timers"] == {"wtr": None, "guard": None, "hold_off": None}  # lr2 configures none
    assert all("ring" in f["ports"][p]["roles"] for p in ("1", "2", "3"))
    assert "_ring_timers" not in f and f["recognised"] == 9


def test_virtual_ring_pass_through_node_unset_and_saos8_virtual_switch_members():
    f = facts(
        "ring-protection logical-ring create logical-ring-name lr2 ring-id 2 west-port 1 east-port 2 guard-time 500",
        "ring-protection virtual-ring create virtual-ring-name vr2 logical-ring lr2 raps-vid 102 sub-ring no-port-termination",
        "ring-protection virtual-ring add ring vr2 vs ring-vs-1,ring-vs-2",
        "ring-protection virtual-ring remove ring vr2 vs ring-vs-2",
        "ring-protection virtual-ring set ring vr2 east-port-rpl owner revertive off",
        "ring-protection virtual-ring unset ring vr2 east-port-rpl revertive",
        "ring-protection virtual-ring set ring vr9 east-port-rpl owner",
        "ring-protection logical-ring show ring lr2",
    )
    (lr2,) = f["rings"]
    (vr2,) = lr2["instances"]
    assert (vr2["type"], vr2["termination"], vr2["sub_ring_of"]) == ("sub", "none", None)
    assert vr2["members"] == ["ring-vs-1"]
    assert vr2["rpl"] == [] and vr2["revertive"] is None
    assert vr2["timers"] == {"wtr": None, "guard": "500", "hold_off": None}
    assert (f["lines"], f["recognised"]) == (8, 6)  # the unknown ring and the show command produce nothing


def test_virtual_ring_commands_in_the_clis_short_form_and_deletes():
    """Partial command recognition: ``ring virtual-ring add`` is ``ring-protection virtual-ring add``
    (and ``ring logical-ring``, ``ring-prot``); a delete removes the instance or the ring, so a config
    that deletes before it creates does not double them. A word shorter than ``ring`` is not read."""
    f = facts(
        "ring virtual-ring delete ring vr1",  # nothing to delete yet
        "ring logical-ring delete ring lr1",
        "ring-prot logical-ring create logical-ring-name lr1 ring-id 1 west-port 24 east-port 23",
        "ring-protection virtual-ring create virtual-ring-name vr1 logical-ring lr1 raps-vid 4081 mel 0",
        "ring virtual-ring add ring vr1 vid 1000",
        "ring virtual add ring vr1 vid 1001",
        "RING VIRTUAL-RING set ring vr1 west-port-rpl owner",
        "rin virtual-ring add ring vr1 vid 1002",
    )
    (lr1,) = f["rings"]
    assert (lr1["name"], lr1["ring_id"], lr1["west"], lr1["east"]) == ("lr1", "1", "24", "23")
    (vr1,) = lr1["instances"]
    assert vr1["members"] == ["1000", "1001"]
    assert vr1["rpl"] == [{"port": "west", "interface": "24", "role": "owner"}]
    assert (f["lines"], f["recognised"]) == (8, 5)  # the two deletes of nothing and the 3-letter word are not recognised

    g = facts(
        "ring-protection logical-ring create logical-ring-name lr1 ring-id 1 west-port 24 east-port 23",
        "ring-protection virtual-ring create virtual-ring-name vr1 logical-ring lr1 raps-vid 4081 mel 0",
        "ring virtual-ring add ring vr1 vid 1000",
        "ring virtual-ring delete ring vr1",
        "ring logical-ring delete ring lr1",
        "ring-protection logical-ring create logical-ring-name lr1 ring-id 1 west-port 24 east-port 23",
        "ring-protection virtual-ring create virtual-ring-name vr1 logical-ring lr1 raps-vid 4081 mel 0",
    )
    (lr1,) = g["rings"]
    assert [i["name"] for i in lr1["instances"]] == ["vr1"]
    assert g["ports"]["24"]["roles"] == ["ring"] and g["recognised"] == 7
    h = facts("ring-protection logical-ring create logical-ring-name lr1 ring-id 1 west-port 24 east-port 23",
              "ring logical-ring delete ring lr1")
    assert h["rings"] == [] and h["ports"]["24"]["roles"] == []
