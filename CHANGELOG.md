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

## [0.4.2] - 2026-10-30

### Added

- **CFM CCM interval (schema 1.4.0)** — `cfm.meps[].ccm_interval`: the CCM interval of the MEP's
  maintenance association as written, from the SAOS 10 MA's `ccm-interval` (`3.3ms` ... `10min`)
  and from SAOS 6 / 8 `cfm service set service <ma> ccm-interval <1sec|100ms|3.33ms|...|0-7|off>`
  (in any order with the `cfm service create`); null when not configured. Optional, so 1.3 files
  still validate. The npm reader adds `ccmIntervalMs(mep | text)`, which reads both spellings and
  the 802.1Q interval index; the viewer runs each service MEG at its configured interval and says so
  in the Import tab instead of defaulting every MEG to 1 s.

### Fixed

- **Viewer: management networks drew links** — the npm reader's `isRouted` excluded SAOS 6
  `management` interfaces but not SAOS 10 `system` ones (the mgmtbr0 management bridge), so two
  devices on one management /24 got a bogus access link and one of them was labelled PE. Both kinds
  are now unrouted (`UNROUTED_KINDS`); the schema documents `system`.
- **Viewer: a subnet with three interfaces was dropped** — a leftover duplicate interface on one
  device (same address on another port) hid the link, because only exact pairs made one. The link
  now joins the two interfaces on different devices that run the IGP (IS-IS, or a non-passive OSPF
  interface), with an Import-tab warning naming the ignored interface; when the IGP does not single
  out a pair the subnet is still skipped, and the warning names it and says why.
- **Viewer: LAG members paired by port** — members of a LAG link are paired by port in natural order
  at both ends (`29/4`, `29/30`, `29/100`; `29/30` meets `29/30`), not in the order each device
  configured them.
- **Viewer: a staged lab index opens without parameters** — a site that stages `labs/index.json`
  beside the page now opens that index's default lab (the lab marked `default: true`, else the
  index's `default` id, else the first) when the URL names no facts and no lab; without a staged
  index the bundled example still shows. The README documents how the default is marked.

## [0.4.1] - 2026-10-29

### Fixed

- **SAOS 10 devices without a platform** — translator 4.2.1 requires `platform`
  on `convert_cli` / `convert_xml` and has no default, so a SAOS 10 device whose platform is
  unknown (no `-10x` type and no platform-map entry, as when the extractor is detected from the
  files) failed every file with the translator's raw `Missing required argument`. Such a device is
  now `status: error` before any call, with a reason that names the device and its files and says
  to set its type (`5164-10x`) or platform (`cn5164`) in `--platform-map`. Applies to every backend.
  The recorded translator replies are all from 4.2.1; the `mixed-detected` case no longer records
  any for PE3.

## [0.4.0] - 2026-10-29

### Added

- **IS-IS interface metrics (schema 1.3.0)** — `isis.interfaces[].metrics`: one entry per level the
  configuration sets a metric for, in configuration order, with the narrow `metric` and the
  `wide_metric` as written (`level` in the configuration's spelling: SAOS 10 `level-1` /
  `level-2`, SAOS 6 / 8 `L1` / `L2`). Read from the SAOS 10 interface's `level-1` / `level-2`
  `metric` and `wide-metric`, and from SAOS 6 / 8 `isis interface-level set ... wide-metric`
  (`unset` clears it). An empty list when none is configured; optional, so 1.2 files still
  validate. The npm reader adds `isisMetric(facts, interface, level)`: the wide metric of the
  level, else the narrow one, else null.
- **Viewer: LAG links from the facts** — a link whose interfaces ride a LAG at both ends (`lags`,
  `ports[].lag`) is imported as a LAG, one member per pair of member ports in configured order, so
  the engine runs LACP on it; LAG members are failure targets of their own.
- **Viewer: IS-IS metrics from the facts** — core links take each end's metric at the level the
  view runs (wide, else narrow; level 1-2 runs as level 2), per end when they differ; 10 only
  where the facts have none, as the Import tab says.
- **Viewer: OSPF flood area** — the OSPF LSA flood walk picks the area to flood in when the
  network has more than one.
- **Viewer: failure detection** — the failure replay chooses loss of signal (both ends down at
  once) or a silent failure, found by the link's CFM MEG or BFD, else the LACP timeout (3 s) on a
  LAG or LAG member, else the IS-IS holding time (30 s) / OSPF RouterDeadInterval (40 s).

### Changed

- **Viewer: a silent failure no longer replays as loss of signal** — with no CFM MEG or BFD on
  the link (every link of an imported facts file), the replay waited for nothing; it now shows
  the LACP or IGP hello timeout that finds the failure.
- **Fixtures** — the sr-l2 lab sets IS-IS wide metrics (and a narrow one on PE2) and the mixed lab
  a SAOS 6 wide metric; the replies for the two changed SAOS 10 files are recorded with translator
  4.2.1, the others kept. The
  Adaptive-SR-CFM example is re-extracted (only the schema version and the empty `metrics` differ).

## [0.3.1] - 2026-10-29

### Added

- **Engine unit tests** — 109 vitest cases over the viewer's engine (`viewer/test/`: BGP, CFM,
  containerlab import, IS-IS, LAG, MPLS, MPLS-TP, OSPF, failure replay, walks), checking each
  protocol's tables and packets against the RFC / IEEE behaviour on hand-built topologies. They
  come with the engine from its earlier home, now Apache-2.0.

### Changed

- **Address check allows 0.0.0.0/8** — "this network" (RFC 1122), never a host's address, where
  OSPF area ids such as 0.0.0.1 are written; it allowed only 0.0.0.0 before.

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
- **Address check on every tracked file** — `scripts/check_addresses.py` (run in CI, tested) fails
  on any IPv4 / IPv6 address outside RFC 1918, RFC 5737, 2001:db8::/32, 0.0.0.0, :: and ::1. It
  replaces the fixtures-only address test. The npm lockfiles are the only files it skips; the
  OSPF AllSPFRouters group (224.0.0.5) is its one named protocol constant.

### Changed

- **Example renumbered into RFC 1918** — the Adaptive-SR-CFM example's loopbacks are now
  10.255.10.0/24 and its core links 172.30.10.0/24 (last octets kept); its other addresses were
  already private. `facts.json` is regenerated (10/10 ok, identical apart from the addresses and
  the schema 1.2 keys), and `docs/example.png` is rebuilt from the site. The IS-IS system ids are
  re-derived from the new loopbacks (`0102.5501.000N`, area and NSEL unchanged).

### Fixed

- **A SAOS 10 leaf delete no longer creates the object** — `no oc-if:interfaces interface 9 config
  ptp-id` (and the like on logical ports, PTPs, OSPF and MPLS-TP tunnels) reaches the extractor as
  an entry with only its keys and `__remove__` (translator 4.2.1); it was taken for a new interface
  (kind `unknown`, no address) or port. Such an entry is now the path to the deleted leaf, as
  `__edit_path__` already was. Synthetic fixture `tests/fixtures/labs/leaf-delete/`.
- **npm reader: an unknown route-reflector-client flag stays unknown** — `bgpPeers()` returned
  `routeReflectorClient: false` for a peer whose record has no `route_reflector_client` (SAOS 6
  peers, pre-schema files); it is now `null`, so a caller can fall back to another source. An
  explicit `true` / `false` is unchanged. The type is `boolean | null`.

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
