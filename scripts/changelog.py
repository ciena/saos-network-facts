#!/usr/bin/env python3
"""Changelog tooling for a semver repo. No dependencies.

  scripts/changelog.py check [BASE_REF]   the PR cuts a release: [Unreleased] is empty, the top release heading
                                          `## [X.Y.Z] - YYYY-MM-DD` is above BASE_REF's (default origin/main), and
                                          the version file (package.json, pyproject.toml [project] or VERSION),
                                          if any, agrees
  scripts/changelog.py version            print the top release's version (what release.yml tags)
  scripts/changelog.py notes [X.Y.Z]      print that release's section (default: the top release) — the GitHub
                                          Release notes

`check` runs in the required `changelog` job on every PR; `version` and `notes` feed release.yml.
"""

from __future__ import annotations

import datetime as _dt
import json
import re
import subprocess
import sys
from pathlib import Path

HEADING = re.compile(r"^## \[([^\]]+)\](?:\s+-\s+(\d{4}-\d{2}-\d{2}))?\s*$")
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
UNRELEASED = "Unreleased"


def parse(text: str) -> list[tuple[str, str | None, str]]:
    """The changelog's `## [..]` sections as (name, date, body) in file order."""
    sections: list[list] = []
    for line in text.splitlines():
        m = HEADING.match(line)
        if m:
            sections.append([m.group(1), m.group(2), []])
        elif sections:
            sections[-1][2].append(line)
    return [(n, d, "\n".join(b).strip()) for n, d, b in sections]


def top_release(sections) -> tuple[str, str | None, str] | None:
    return next(((n, d, b) for n, d, b in sections if n != UNRELEASED), None)


def _vtuple(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in v.split("."))


def version_file(root: Path) -> tuple[str | None, str | None]:
    """(file, version) from package.json, pyproject.toml's [project] or VERSION; (None, None) without one."""
    pj = root / "package.json"
    if pj.is_file():
        return "package.json", json.loads(pj.read_text()).get("version")
    pp = root / "pyproject.toml"
    if pp.is_file():
        text = pp.read_text()
        try:
            import tomllib
            return "pyproject.toml", (tomllib.loads(text).get("project") or {}).get("version")
        except ImportError:  # python < 3.11
            sec = re.search(r"(?ms)^\[project\]\s*$(.*?)(?=^\[|\Z)", text)
            m = sec and re.search(r'^version\s*=\s*"([^"]+)"', sec.group(1), re.M)
            return "pyproject.toml", (m.group(1) if m else None)
    vf = root / "VERSION"
    if vf.is_file():
        return "VERSION", vf.read_text().strip()
    return None, None


def _git_show(ref: str, path: str, root: Path) -> str | None:
    proc = subprocess.run(["git", "show", f"{ref}:{path}"], cwd=root, capture_output=True, text=True)
    return proc.stdout if proc.returncode == 0 else None


def _ref_exists(ref: str, root: Path) -> bool:
    return subprocess.run(["git", "rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}"], cwd=root,
                          capture_output=True).returncode == 0


def check(base: str, root: Path = Path(".")) -> list[str]:
    """Problems with the PR's release, [] when it is release-ready."""
    errors: list[str] = []
    sections = parse((root / "CHANGELOG.md").read_text())
    if not sections or sections[0][0] != UNRELEASED:
        errors.append("the first heading must be '## [Unreleased]'")
    elif sections[0][2]:
        errors.append("[Unreleased] must be empty at merge: every PR cuts a release — rename it to "
                      "'## [X.Y.Z] - YYYY-MM-DD' and start a fresh empty '## [Unreleased]' above it")
    top = top_release(sections)
    if not top:
        errors.append("no release heading '## [X.Y.Z] - YYYY-MM-DD' found")
        return errors
    name, date, body = top
    if not SEMVER.match(name):
        errors.append(f"top release '{name}' is not X.Y.Z")
    if not date:
        errors.append(f"release {name} has no ' - YYYY-MM-DD' date")
    else:
        try:
            _dt.date.fromisoformat(date)
        except ValueError:
            errors.append(f"release {name} has an invalid date {date}")
    if not body:
        errors.append(f"release {name} is empty")
    base_text = _git_show(base, "CHANGELOG.md", root)
    if base_text is None and not _ref_exists(base, root):
        errors.append(f"cannot read CHANGELOG.md on {base} (fetch it first)")
    elif base_text is None:
        pass  # the base has no changelog yet: this is the first release
    else:
        prev = top_release(parse(base_text))
        if prev and SEMVER.match(prev[0]) and SEMVER.match(name) and _vtuple(name) <= _vtuple(prev[0]):
            errors.append(f"version {name} must be above {prev[0]} on {base}: bump it "
                          "(patch for fixes, minor for features, major for breaking changes)")
    file, version = version_file(root)
    if file and version != name:
        errors.append(f"{file} version {version!r} must equal the top changelog release {name}")
    return errors


def main(argv: list[str]) -> int:
    cmd = argv[0] if argv else "check"
    root = Path(".")
    if cmd == "check":
        errors = check(argv[1] if len(argv) > 1 else "origin/main", root)
        for e in errors:
            print(f"::error file=CHANGELOG.md::{e}", file=sys.stderr)
        if not errors:
            print(f"release-ready: {top_release(parse((root / 'CHANGELOG.md').read_text()))[0]}")
        return 1 if errors else 0
    sections = parse((root / "CHANGELOG.md").read_text())
    if cmd == "version":
        top = top_release(sections)
        if not top:
            print("CHANGELOG.md has no release heading", file=sys.stderr)
            return 1
        print(top[0])
        return 0
    if cmd == "notes":
        want = argv[1] if len(argv) > 1 else (top_release(sections) or ("",))[0]
        sec = next((s for s in sections if s[0] == want), None)
        if sec is None:
            print(f"CHANGELOG.md has no '## [{want}] - YYYY-MM-DD' section", file=sys.stderr)
            return 1
        print(sec[2])
        return 0
    print("usage: changelog.py check [BASE_REF] | version | notes [X.Y.Z]", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
