"""Things that must agree across the repo: versions, and the npm package's copy of the schema."""

import json
import tomllib
from pathlib import Path

from saos_network_facts import __version__, schema

ROOT = Path(__file__).resolve().parent.parent


def test_versions_agree():
    pyproject = tomllib.loads((ROOT / "pyproject.toml").read_text())["project"]["version"]
    package = json.loads((ROOT / "js/package.json").read_text())["version"]
    assert pyproject == package == __version__


def test_npm_schema_is_the_python_schema():
    assert json.loads((ROOT / "js/schema/facts-v1.schema.json").read_text()) == schema.load_schema()
