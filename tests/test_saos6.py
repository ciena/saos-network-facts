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
    assert f["isis"]["interfaces"] == [{"interface": "core", "instance": "CORE", "level": "L2", "type": None}]


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
                   "out_label": "8002", "mode": None, "tunnel": "TUN1", "service": None, "service_type": None}
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
                   "port": "3", "vlan": "200", "service": "VS200"}
    assert (sub["interface"], sub["port"], sub["direction"]) == ("sp1", None, "down")
    assert "cfm-mep" in f["ports"]["3"]["roles"]
    assert "_cfm_services" not in f


def test_expand_and_net_parts():
    assert saos6.expand("1-3,7,lag1") == ["1", "2", "3", "7", "lag1"]
    assert saos6.net_parts("49.0001.1720.1600.0001.00") == ("49.0001", "1720.1600.0001")
    assert saos6.net_parts("49.0001") == (None, None)
