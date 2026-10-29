# SPDX-License-Identifier: Apache-2.0
import json
import os

import pytest
from recorded import CASES, EXPECTED, FIXTURES, RecordedTranslator, case_devices

from saos_network_facts import extract, schema


def run_case(name, translator=None):
    translator = translator or RecordedTranslator()
    records = [extract.device_facts(d, translator, recipe=CASES[name].get("recipe")) for d in case_devices(name)]
    return extract.document(records, translator)


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
