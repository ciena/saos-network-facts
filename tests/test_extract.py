# SPDX-License-Identifier: Apache-2.0
import json
import os

import pytest
from recorded import CASES, EXPECTED, FIXTURES, RecordedTranslator, case_devices

from saos_network_facts import extract, schema


def run_case(name, translator=None):
    translator = translator or RecordedTranslator()
    records = [extract.device_facts(d, translator, recipe=CASES[name].get("recipe")) for d in case_devices(name)]
    clab = CASES[name].get("clab")
    return extract.document(records, translator, extract.links_from_clab(FIXTURES / clab) if clab else None)


@pytest.mark.parametrize("name", sorted(CASES))
def test_case_matches_expected_facts(name):
    doc = run_case(name)
    path = EXPECTED / f"{name}.facts.json"
    text = json.dumps(doc, indent=2, sort_keys=True) + "\n"
    if os.environ.get("UPDATE_GOLDEN"):
        path.write_text(text)
    assert text == path.read_text(), f"{path.name} differs; rerun with UPDATE_GOLDEN=1 and review the diff"


@pytest.mark.parametrize("path", sorted(EXPECTED.glob("*.json")), ids=lambda p: p.name)
def test_expected_facts_validate(path):
    assert schema.errors(json.loads(path.read_text())) == []


def declared(node, schema_doc):
    """Every property name the schema allows at this node, following $ref / oneOf."""
    if "$ref" in node:
        return declared(schema_doc["$defs"][node["$ref"].rsplit("/", 1)[-1]], schema_doc)
    for alt in node.get("oneOf", []):
        if alt.get("type") != "null":
            return declared(alt, schema_doc)
    return node


def undocumented(value, node, schema_doc, where="$"):
    node = declared(node, schema_doc)
    out = []
    if isinstance(value, dict):
        props = node.get("properties")
        extra = node.get("additionalProperties")
        for key, item in value.items():
            if props is not None and key in props:
                out += undocumented(item, props[key], schema_doc, f"{where}.{key}")
            elif isinstance(extra, dict):
                out += undocumented(item, extra, schema_doc, f"{where}[{key}]")
            else:
                out.append(f"{where}.{key}")
    elif isinstance(value, list) and "items" in node:
        for i, item in enumerate(value):
            out += undocumented(item, node["items"], schema_doc, f"{where}[{i}]")
    return out


@pytest.mark.parametrize("path", sorted(EXPECTED.glob("*.json")), ids=lambda p: p.name)
def test_every_emitted_field_is_documented(path):
    schema_doc = schema.load_schema()
    assert undocumented(json.loads(path.read_text()), schema_doc, schema_doc) == []


def test_statuses():
    by = {r["device"]: r for r in run_case("mixed")["devices"]}
    assert by["AGG1"]["status"] == "ok" and by["AGG1"]["extractor"] == "saos6"
    assert by["PE3"]["status"] == "partial"
    assert by["PE3"]["failed_templates"] == [{"template": "PE3/03-broken.cfg", "error": "Unknown top-level command: frobnicate"}]
    assert by["PE3"]["platform"] == "cn5164"
    clab = {r["device"]: r for r in run_case("sr-l2")["devices"]}
    assert clab["CE1"]["status"] == "skipped" and clab["CE1"]["facts"] is None
    assert clab["PE2"]["templates"] == ["configs/PE2.xml"]


def test_merge_order_and_removals():
    pe3 = next(r for r in run_case("mixed")["devices"] if r["device"] == "PE3")
    assert [fp["name"] for fp in pe3["facts"]["fps"]] == ["FP-CORE"]
    assert [fd["name"] for fd in pe3["facts"]["fds"]] == ["FD-CORE"]
    assert pe3["facts"]["vrfs"] == ["CUST-A"]
    assert pe3["templates"] == ["PE3/01-base.cfg", "PE3/02-services.xml", "PE3/03-broken.cfg"]


def test_no_translator_skips_saos10_only():
    records = [extract.device_facts(d) for d in case_devices("mixed")]
    assert [(r["device"], r["status"]) for r in records] == [("AGG1", "ok"), ("PE3", "skipped")]
    assert records[1]["reason"] == "no translator"


class NoCalls:
    """A translator that must not be called."""

    def parse(self, text, fmt, platform=None):
        raise AssertionError("translator called")


def test_saos10_without_a_platform_is_an_error_before_any_call(tmp_path):
    by = {d.name: extract.device_facts(d, NoCalls()) for d in case_devices("mixed-detected")}
    assert by["PE3"]["extractor"] == "saos10" and by["PE3"]["status"] == "error" and by["PE3"]["facts"] is None
    assert "platform" not in by["PE3"]
    assert by["PE3"]["reason"] == ("no SAOS 10 platform for PE3 (PE3/01-base.cfg, PE3/02-services.xml, PE3/03-broken.cfg): "
                                   "the translator needs one; set its type (5164-10x) or platform (cn5164) in --platform-map")
    assert by["AGG1"]["status"] == "ok"
    (tmp_path / "map.yaml").write_text("devices:\n  PE3:\n    platform: cn5164\n")
    devices = extract.collect([FIXTURES / "labs/mixed"], platform_map=tmp_path / "map.yaml")
    pe3 = extract.device_facts(next(d for d in devices if d.name == "PE3"), RecordedTranslator())
    assert pe3["platform"] == "cn5164" and pe3["status"] == "partial"


def test_detect_extractor():
    assert extract.detect_extractor(["<config/>"]) == "saos10"
    assert extract.detect_extractor(["config\nsystem config hostname A\nfds fd X mode vpls\n"]) == "saos10"
    assert extract.detect_extractor(["system set host-name A\nvlan create vlan 10\nport set port 1 description x\n"]) == "saos6"
    assert extract.detect_extractor(["# only a comment\n"]) is None


def test_configs_files_group_by_name(tmp_path):
    for name in ("R1.day1.cfg", "R1.day0.cfg", "R2.cfg", "notes.md"):
        (tmp_path / name).write_text("system set host-name X\n")
    devices = extract.from_configs([tmp_path])
    assert sorted(devices) == ["R1", "R2"]
    assert [label for label, _ in devices["R1"].configs] == ["R1.day0.cfg", "R1.day1.cfg"]
    given = extract.from_configs([tmp_path / "R1.day1.cfg", tmp_path / "R1.day0.cfg"])
    assert [label for label, _ in given["R1"].configs] == ["R1.day1.cfg", "R1.day0.cfg"]
    with pytest.raises(FileNotFoundError):
        extract.from_configs([tmp_path / "missing"])


def test_platform_map_shorthand_and_configs(tmp_path):
    (tmp_path / "a.cfg").write_text("x")
    (tmp_path / "map.yaml").write_text("R1: 5164-10x\nR2:\n  extractor: saos6\n  configs: [a.cfg]\n")
    devices = {d.name: d for d in extract.collect(platform_map=tmp_path / "map.yaml")}
    assert devices["R1"].type == "5164-10x"
    assert devices["R2"].extractor == "saos6" and [c for c, _ in devices["R2"].configs] == ["a.cfg"]
    (tmp_path / "bad.yaml").write_text("R1: {extractor: junos}\n")
    with pytest.raises(ValueError):
        extract.load_platform_map(tmp_path / "bad.yaml")


def test_fixtures_have_no_secrets():
    """No secrets in the fixtures. Addresses are checked on every tracked file by
    scripts/check_addresses.py (tests/test_check_addresses.py)."""
    import re
    for path in FIXTURES.rglob("*"):
        if path.is_file() and path.suffix != ".json":
            assert not re.search(r"password|secret|token", path.read_text(), re.I), path.name


def test_leaf_deletes_create_no_port():
    (pe5,) = run_case("leaf-delete")["devices"]
    assert pe5["status"] == "ok"
    assert [i["name"] for i in pe5["facts"]["interfaces"]] == ["lb0", "core1"]
    assert list(pe5["facts"]["ports"]) == ["1"]


def test_isis_metrics_are_optional():
    # a schema 1.2 file (no `metrics` on the IS-IS interfaces) still validates against 1.3
    doc = json.loads((EXPECTED / "sr-l2.facts.json").read_text())
    for record in doc["devices"]:
        for item in ((record.get("facts") or {}).get("isis") or {}).get("interfaces", []):
            item.pop("metrics")
    doc["schema_version"] = "1.2.0"
    assert schema.errors(doc) == []
    doc["devices"][0]["facts"]["isis"]["interfaces"][0]["metrics"] = [{"level": "level-2", "metric": 10}]
    assert schema.errors(doc)  # an entry needs level, metric and wide_metric


def test_links_from_clab():
    assert run_case("sr-l2")["links"] == [{"a": {"device": "PE1", "port": "1"}, "b": {"device": "PE2", "port": "1"}},
                                          {"a": {"device": "PE1", "port": "3"}, "b": {"device": "CE1", "port": "eth1"}}]
    assert "links" not in run_case("mixed")  # no topology given


def test_links_from_clab_extended_form_and_odd_links(tmp_path):
    (tmp_path / "topo.clab.yml").write_text(
        "topology:\n  nodes: {A: {kind: linux}, B: {kind: linux}}\n  links:\n"
        "    - endpoints: [\"A:1\", \"B:1\"]\n"
        "    - type: veth\n      endpoints: [{node: A, interface: eth2}, {node: B, interface: eth2}]\n"
        "    - endpoints: [\"A:3\"]\n"
        "    - endpoints: [\"A:4\", \"B:4\", \"host:x\"]\n"
        "    - endpoints: [\"A:5\", \"nocolon\"]\n")
    assert extract.links_from_clab(tmp_path / "topo.clab.yml") == [
        {"a": {"device": "A", "port": "1"}, "b": {"device": "B", "port": "1"}},
        {"a": {"device": "A", "port": "eth2"}, "b": {"device": "B", "port": "eth2"}}]
    (tmp_path / "empty.clab.yml").write_text("topology:\n  nodes: {A: {kind: linux}}\n")
    assert extract.links_from_clab(tmp_path / "empty.clab.yml") == []


def rpl(instance):
    return [(r["port"], r["interface"], r["role"]) for r in instance["rpl"]]


def test_g8032_two_ring_lab_per_node():
    """The expected facts of the two-ring SAOS 10 lab, checked against its configurations: ring ids,
    ports, instance types, R-APS VID / level, RPL roles, members and the interconnection nodes."""
    doc = run_case("g8032-two-ring")
    by = {r["device"]: r for r in doc["devices"]}
    assert all(r["status"] == "ok" for r in doc["devices"])
    assert len(doc["links"]) == 10 and doc["links"][3] == {"a": {"device": "RM_4", "port": "2"}, "b": {"device": "RM_1", "port": "1"}}
    for ce in ("CE_1", "CE_2", "CE_3"):
        assert by[ce]["facts"]["rings"] == []
        assert not any("ring" in p["roles"] for p in by[ce]["facts"]["ports"].values())
    for name in ("RM_1", "RM_2", "RM_3", "RM_4"):
        major = next(r for r in by[name]["facts"]["rings"] if r["name"] == "ring_1")
        assert (major["ring_id"], major["west"], major["east"]) == ("1", "1", "2")
        assert [(p["name"], p["interface"]) for p in major["ports"]] == [("port0", "1"), ("port1", "2")]
        (erp,) = major["instances"]
        assert (erp["name"], erp["raps_vid"], erp["raps_level"], erp["type"], erp["virtual_channel"], erp["sub_ring_of"]) == (
            "erp_1", "4090", "7", "major", None, None)
        assert erp["members"] == ["ring_1-fd"] and erp["revertive"] is None
        assert erp["timers"] == {"wtr": "1", "guard": None, "hold_off": None}
        assert all("ring" in by[name]["facts"]["ports"][p]["roles"] for p in ("1", "2"))
    for name in ("RM_1", "RM_4", "RS_1", "RS_2"):
        sub = next(r for r in by[name]["facts"]["rings"] if r["name"] == "ring_2")
        (erp,) = sub["instances"]
        assert sub["ring_id"] == "2"
        assert (erp["name"], erp["raps_vid"], erp["raps_level"], erp["type"]) == ("erp_2", "4089", "7", "sub")
        assert erp["virtual_channel"] is False
        assert erp["members"] == ["ring_1-fd"] and erp["timers"]["wtr"] == "1"
    # the major ring's RPL: owner RM_4 port1 (interface 2), neighbour RM_1 port0 (interface 1), none elsewhere
    major_rpl = {n: rpl(next(r for r in by[n]["facts"]["rings"] if r["name"] == "ring_1")["instances"][0])
                 for n in ("RM_1", "RM_2", "RM_3", "RM_4")}
    assert major_rpl == {"RM_1": [("port0", "1", "neighbor"), ("port1", "2", "none")],
                         "RM_2": [("port0", "1", "none"), ("port1", "2", "none")],
                         "RM_3": [("port0", "1", "none"), ("port1", "2", "none")],
                         "RM_4": [("port0", "1", "none"), ("port1", "2", "owner")]}
    # the sub-ring's RPL: owner RM_1 port1 (interface 3), neighbour RS_1 port0 (interface 1); the
    # interconnection nodes RM_1 / RM_4 list one port and are attached to ring_1
    sub_ring = {n: next(r for r in by[n]["facts"]["rings"] if r["name"] == "ring_2") for n in ("RM_1", "RM_4", "RS_1", "RS_2")}
    assert {n: rpl(r["instances"][0]) for n, r in sub_ring.items()} == {
        "RM_1": [("port1", "3", "owner")], "RM_4": [("port0", "3", "none")],
        "RS_1": [("port0", "1", "neighbor"), ("port1", "2", "none")], "RS_2": [("port0", "1", "none"), ("port1", "2", "none")]}
    assert {n: r["instances"][0]["sub_ring_of"] for n, r in sub_ring.items()} == {
        "RM_1": "ring_1", "RM_4": "ring_1", "RS_1": None, "RS_2": None}
    assert (sub_ring["RM_1"]["west"], sub_ring["RM_1"]["east"], sub_ring["RM_4"]["west"], sub_ring["RM_4"]["east"]) == ("2", "3", "3", "1")
    assert sorted(p for p, v in by["RM_1"]["facts"]["ports"].items() if "ring" in v["roles"]) == ["1", "2", "3"]


def test_g8032_saos6_lab_yields_the_same_instance_fields():
    by = {r["device"]: r for r in run_case("g8032-saos6")["devices"]}
    assert {n: r["extractor"] for n, r in by.items()} == {"A1": "saos6", "A2": "saos6", "S1": "saos6", "S2": "saos6"}
    lr1, lr2 = by["A1"]["facts"]["rings"]
    (vr1,) = lr1["instances"]
    assert (lr1["ring_id"], vr1["raps_vid"], vr1["raps_level"], vr1["type"], rpl(vr1), vr1["members"], vr1["revertive"]) == (
        "1", "100", "7", "major", [("east", "3", "owner")], ["1000", "1001"], True)
    assert vr1["timers"] == {"wtr": "1", "guard": "1000", "hold_off": None} and lr1["ports"][0]["hold_off"] == "100"
    (vr2,) = lr2["instances"]
    assert (vr2["type"], vr2["termination"], vr2["sub_ring_of"], vr2["virtual_channel"]) == ("sub", "east", "lr1", None)
    (s1,) = by["S1"]["facts"]["rings"][0]["instances"]
    assert (s1["termination"], s1["sub_ring_of"], rpl(s1)) == ("none", None, [("east", "2", "owner")])
    assert s1["timers"] == {"wtr": "5", "guard": "500", "hold_off": None}
    (s2,) = by["S2"]["facts"]["rings"][0]["instances"]
    assert (s2["members"], s2["raps_level"], rpl(s2)) == (["ring-vs-1"], "7", [])
    (a2,) = by["A2"]["facts"]["rings"][0]["instances"]
    assert a2["revertive"] is None and rpl(a2) == []


def test_ring_extras_and_links_are_optional():
    # a file before schema 1.5 (rings with name / west / east only, no links) still validates against 1.5
    doc = json.loads((EXPECTED / "g8032-saos6.facts.json").read_text())
    for record in doc["devices"]:
        record["facts"]["rings"] = [{"name": r["name"], "west": r["west"], "east": r["east"]} for r in record["facts"]["rings"]]
    doc.pop("links", None)
    doc["schema_version"] = "1.4.0"
    assert schema.errors(doc) == []
    doc["devices"][0]["facts"]["rings"][0]["instances"] = [{"name": "x"}]
    assert schema.errors(doc)  # an instance carries every field
    doc["devices"][0]["facts"]["rings"][0]["instances"] = []
    doc["links"] = [{"a": {"device": "A"}}]
    assert schema.errors(doc)  # a link has two ends with device and port
