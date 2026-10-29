#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# Writes the release downloads into $1: the Python wheel and sdist, the npm package tarball and
# the built viewer (saos-network-facts-viewer-<version>.tgz: the static site, index.html and
# assets/ at the top, with LICENSE and NOTICE). release.yml attaches whatever lands there to the
# GitHub Release.
set -euo pipefail
out="$(mkdir -p "$1" && cd "$1" && pwd)"
root="$(cd "$(dirname "$0")/.." && pwd)"
python3 -m pip install --quiet build
python3 -m build --outdir "$out" "$root"
cd "$root/js"
npm ci --no-audit --no-fund
npm pack --pack-destination "$out"
cd "$root/viewer"
npm ci --no-audit --no-fund
npm run build
version="$(node -p 'require("./package.json").version')"
cp "$root/LICENSE" "$root/NOTICE" dist/
tar -czf "$out/saos-network-facts-viewer-$version.tgz" -C dist .
