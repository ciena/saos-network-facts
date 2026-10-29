# SPDX-License-Identifier: Apache-2.0
"""The test cases (tests/fixtures/cases.yaml) and a translator that answers from recorded pivots."""

import hashlib
import json
from pathlib import Path

import yaml

from saos_network_facts import extract

FIXTURES = Path(__file__).resolve().parent / "fixtures"
CASES = yaml.safe_load((FIXTURES / "cases.yaml").read_text())
PIVOTS = FIXTURES / "pivots.json"
EXPECTED = FIXTURES / "expected"


def pivot_key(text, fmt, platform):
    return hashlib.sha256(f"{fmt}\n{platform}\n{text}".encode()).hexdigest()[:24]


def case_devices(name):
    case = CASES[name]
    rel = lambda p: None if p is None else str(FIXTURES / p)  # noqa: E731
    return extract.collect([rel(c) for c in case.get("configs") or []] or None, rel(case.get("clab")), rel(case.get("platform_map")))


class RecordedTranslator:
    """Answers ``parse`` from tests/fixtures/pivots.json: the recorded pivot, or the recorded error."""

    parallel = False

    def __init__(self, path=PIVOTS):
        data = json.loads(Path(path).read_text())
        self.version = data["translator"]
        self.pivots = data["pivots"]

    def describe(self):
        return f"translator {self.version} (recorded)"

    def parse(self, text, fmt, platform=None):
        entry = self.pivots.get(pivot_key(text, fmt, platform))
        if entry is None:
            raise KeyError(f"no recorded pivot for this {fmt} file (platform {platform}); run scripts/record_pivots.py")
        if "error" in entry:
            raise ValueError(entry["error"])
        return entry["pivot"]
