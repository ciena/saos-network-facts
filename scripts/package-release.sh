#!/usr/bin/env bash
# Writes the release downloads into $1: the Python wheel and sdist, and the npm package tarball.
# release.yml attaches whatever lands there to the GitHub Release.
set -euo pipefail
out="$(mkdir -p "$1" && cd "$1" && pwd)"
root="$(cd "$(dirname "$0")/.." && pwd)"
python3 -m pip install --quiet build
python3 -m build --outdir "$out" "$root"
cd "$root/js"
npm ci --no-audit --no-fund
npm pack --pack-destination "$out"
