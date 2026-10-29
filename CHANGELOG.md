# Changelog

All notable changes to saos-network-facts are documented here, following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versioning model: **semver**. The Python package, the npm package and this changelog share one
version. The facts schema has its own version (`schema_version` in every facts file).

<!--
Entry format (one line per change):
  - **Short title** (#<PR>, @<author>) — what changed and why.
Every PR cuts a release: add the line, rename [Unreleased] to [X.Y.Z] - YYYY-MM-DD (patch for
fixes, minor for features, major for breaking changes), bump pyproject.toml, js/package.json and
src/saos_network_facts/__init__.py, and add a fresh empty [Unreleased] above it. On merge,
release.yml tags main vX.Y.Z and creates the GitHub Release from that section.
-->

## [Unreleased]

## [0.1.0] - 2026-10-29

### Added

- **Facts schema v1** — JSON Schema (draft 2020-12) for the facts file, `schema_version` 1.0.0: an
  object `{schema_version, generator, devices[]}` with every field documented, including IS-IS
  NET / area / system id, segment routing (SRGB, prefix and node SIDs, SR policies and segment
  lists), BGP instances with route-reflector and cluster id, pseudowires (peer, PW id, service) and
  CFM MEPs (MD, MA, MEP id, level, direction, port).
- **Python package and CLI** — `saos-network-facts extract --configs DIR|FILES [--clab FILE]
  [--platform-map FILE] -o facts.json` and `saos-network-facts validate FILE`. SAOS 6 / 8 CLI is
  parsed directly; SAOS 10 CLI and NETCONF XML go through a translator's open `convert_cli` /
  `convert_xml` MCP tools (no token needed; `SAOS10_TRANSLATOR_TOKEN` is sent when set) or a local
  translator checkout. A device's files are merged in order (status ok / partial / error / skipped).
  The hosted translator is the default endpoint (`DEFAULT_TRANSLATOR_URL`, overridable with
  `--translator-url` / `SAOS10_TRANSLATOR_URL`); requests are retried up to 3 times on 429, 5xx
  and network errors, with 1 s / 2 s backoff.
- **npm package `@ciena/saos-network-facts`** — the schema, TypeScript types generated from it, and
  a reader: `parseFacts`, `readFacts` (Node), `interfacesOnPort` (flow point -> forwarding domain ->
  interface on SAOS 10, VLAN -> interface on SAOS 6), `loopbacks`, `bgpPeers`, `isisAreaId`,
  `isisSystemId`, `isisArea`.
- **Licence** — Apache-2.0 (`LICENSE`), `NOTICE` (Copyright 2026 Ciena Corporation), and an
  `SPDX-License-Identifier: Apache-2.0` header on every source file; both files ship in the wheel,
  sdist and npm package.
