#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Record the translator's pivot JSON for every SAOS 10 file of the test cases into tests/fixtures/pivots.json,
so the tests run without a translator or the network.

    scripts/record_pivots.py --translator-root ~/src/translator   # run under the checkout's virtualenv
    scripts/record_pivots.py --translator-url https://...          # or any translator MCP endpoint
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "tests"))

from recorded import CASES, PIVOTS, case_devices, pivot_key  # noqa: E402

from saos_network_facts import extract  # noqa: E402
from saos_network_facts.translator import SAOS_VERSION, load_translator  # noqa: E402


class Recorder:
    parallel = False

    def __init__(self, translator):
        self.translator = translator
        self.pivots = {}

    def describe(self):
        return self.translator.describe()

    def parse(self, text, fmt, platform=None):
        key = pivot_key(text, fmt, platform)
        try:
            pivot = self.translator.parse(text, fmt, platform)
        except Exception as exc:
            self.pivots[key] = {"error": str(exc).splitlines()[0] if str(exc) else type(exc).__name__}
            raise
        self.pivots[key] = {"pivot": pivot}
        return pivot


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--translator-root")
    p.add_argument("--translator-url")
    args = p.parse_args(argv)
    translator = load_translator(args.translator_root, args.translator_url)
    recorder = Recorder(translator)
    for name in CASES:
        for device in case_devices(name):
            extract.device_facts(device, recorder)
    PIVOTS.write_text(json.dumps({"translator": translator.version, "saos_version": SAOS_VERSION,
                                  "pivots": dict(sorted(recorder.pivots.items()))}, indent=1, sort_keys=True) + "\n")
    print(f"{translator.describe()}: {len(recorder.pivots)} pivots -> {PIVOTS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
