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

## [0.3.0] - 2026-10-29

### Added

- **OSPF, MPLS-TP tunnels and L2VPN services (schema 1.2.0)** — SAOS 10 devices carry `ospf`
  (instances with router id, VRF and areas with their networks; interfaces with area, network type,
  metric, timers, passive, BFD), `tp_corouted_tunnels` (each node's segment of a static MPLS-TP
  co-routed tunnel: ends, ingress / transit / egress, primary or backup, forward and reverse
  labels, next and previous hop, LSP BFD) and `l2vpn_services` (forwarding domain, pseudowires,
  MTU, signalling). Optional fields, so 1.0 and 1.1 readers are unaffected. A new synthetic fixture
  lab (`tests/fixtures/labs/ospf-tp/`) covers them.
- **Viewer: OSPF and MPLS-TP** — the facts importer runs OSPF as the IGP when more devices run it
  than IS-IS (areas, costs, router ids, BFD from the facts), stitches MPLS-TP tunnels from their
  per-node segments (1:1 protection, LSP BFD) and carries static pseudowires over them, with an
  MPLS-TP BFD walk and the tunnels in the overview.
- **Viewer by URL, and as a release download** — `?facts=<url>` (with `&positions=<url>` for
  authored node positions), `?labs=<index.json>` (a list of labs: id, title, facts, positions,
  default) and `?lab=<id>` open facts served beside the site. Releases attach the built site as
  `saos-network-facts-viewer-X.Y.Z.tgz`; the README's "Use the viewer in your repo" shows how to
  stage it with your own facts in CI.

### Fixed

- **A SAOS 10 leaf delete no longer creates the object** — `no oc-if:interfaces interface 9 config
  ptp-id` (and the like on logical ports, PTPs, OSPF and MPLS-TP tunnels) reaches the extractor as
  an entry with only its keys and `__remove__` (translator 4.2.1); it was taken for a new interface
  (kind `unknown`, no address) or port. Such an entry is now the path to the deleted leaf, as
  `__edit_path__` already was. Synthetic fixture `tests/fixtures/labs/leaf-delete/`.

## [0.2.0] - 2026-10-29

### Added

- **Example and site** — `examples/adaptive-sr-cfm/`: a ten-device SAOS 10 lab (SR policies,
  VPWS pseudowires, CFM, iBGP route reflection) as rendered startup configurations, platform map
  and facts file (10/10 ok), with `SOURCE.md` on where it comes from and how to regenerate it.
  `viewer/`: a three.js view of a facts file (physical, IS-IS, SR policy, BGP, pseudowire and CFM
  planes; overview, device and service panels; packet walks and link-failure replays; load your own
  facts.json in the browser), on an engine that models IS-IS, SR-MPLS, BGP, VPWS and CFM from the RFCs.
  `pages.yml` deploys it to GitHub Pages from `main` and uploads a preview on pull requests; CI
  runs its tests and build.
- **Pseudowire transport (schema 1.1.0)** — SAOS 10 pseudowires carry `tunnel_type` and
  `tunnel_color` (`sr-policy`, color 2): which SR policy a PW is steered onto. Optional fields, so
  1.0 readers are unaffected.

## [0.1.1] - 2026-10-29

### Fixed

- **Translator refusals say why** — when `convert_cli` / `convert_xml` answers `ok: false` with the
  reason only in `validation.message` (schema errors such as an unknown element in NETCONF XML),
  the device's `failed_templates` / `reason` now carry that message instead of `convert failed`.

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
