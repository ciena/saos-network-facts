# SPDX-License-Identifier: Apache-2.0
import json
import subprocess
import sys

from recorded import EXPECTED, FIXTURES

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
