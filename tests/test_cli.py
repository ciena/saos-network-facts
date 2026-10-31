# SPDX-License-Identifier: Apache-2.0
import json
import subprocess
import sys

from recorded import EXPECTED, FIXTURES, RecordedTranslator

from saos_network_facts import SCHEMA_VERSION, __version__, cli


def test_extract_saos6_without_translator(tmp_path, capsys):
    out = tmp_path / "facts.json"
    rc = cli.main(["extract", "--configs", str(FIXTURES / "labs/mixed"), "--no-saos10", "-o", str(out), "--recipe", "mixed"])
    assert rc == 0
    doc = json.loads(out.read_text())
    assert doc["schema_version"] == SCHEMA_VERSION
    assert doc["generator"] == {"name": "saos-network-facts", "version": __version__, "translator": None}
    assert [(r["device"], r["status"], r["recipe"]) for r in doc["devices"]] == [("AGG1", "ok", "mixed"), ("PE3", "skipped", "mixed")]
    assert "devices 2 / ok 1" in capsys.readouterr().err
    assert cli.main(["validate", str(out)]) == 0


def test_extract_saos10_without_a_platform(tmp_path, capsys, monkeypatch):
    monkeypatch.setattr(cli, "load_translator", lambda *a: RecordedTranslator())
    out = tmp_path / "facts.json"
    assert cli.main(["extract", "--configs", str(FIXTURES / "labs/mixed"), "-o", str(out)]) == 1
    assert "ERROR   PE3 (None) no SAOS 10 platform for PE3" in capsys.readouterr().err
    assert cli.main(["validate", str(out)]) == 0


def test_extract_needs_an_input(capsys):
    assert cli.main(["extract"]) == 2


def test_validate(tmp_path, capsys):
    assert cli.main(["validate", *map(str, sorted(EXPECTED.glob("*.json")))]) == 0
    legacy = tmp_path / "legacy.json"
    legacy.write_text("[]")
    assert cli.main(["validate", str(legacy)]) == 1
    assert "pre-schema format" in capsys.readouterr().err
    broken = tmp_path / "broken.json"
    broken.write_text(json.dumps({"schema_version": "2.0.0", "generator": {}, "devices": [{"device": "x"}]}))
    assert cli.main(["validate", str(broken)]) == 1


def test_version():
    out = subprocess.run([sys.executable, "-m", "saos_network_facts", "--version"], capture_output=True, text=True, check=True).stdout
    assert out.strip() == f"saos-network-facts {__version__} (schema {SCHEMA_VERSION})"


def test_extract_clab_end_to_end_with_rings_and_links(tmp_path, capsys, monkeypatch):
    monkeypatch.setattr(cli, "load_translator", lambda *a: RecordedTranslator())
    out = tmp_path / "facts.json"
    assert cli.main(["extract", "--clab", str(FIXTURES / "labs/g8032-two-ring/topo.clab.yml"), "-o", str(out), "--quiet"]) == 0
    doc = json.loads(out.read_text())
    assert doc["schema_version"] == SCHEMA_VERSION and len(doc["links"]) == 10
    rm4 = next(r for r in doc["devices"] if r["device"] == "RM_4")
    owner = [(ring["name"], p["port"], p["interface"]) for ring in rm4["facts"]["rings"]
             for i in ring["instances"] for p in i["rpl"] if p["role"] == "owner"]
    assert owner == [("ring_1", "port1", "2")]
    assert "devices 9 / ok 9" in capsys.readouterr().err
    assert cli.main(["validate", str(out)]) == 0
    assert f"valid (schema {SCHEMA_VERSION})" in capsys.readouterr().out
