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

## [0.23.5] - 2026-11-09

### Fixed

- **Mesh labs laid out like their hand-drawn diagrams** (#38, @jgroom33) — a lab without IGP roles
  (configs that parse to nothing, such as the 10-, 12- and 13-node base recipes) took its longest cycle as
  the core and ran it round the card's border, so the other links crossed the empty middle as long
  diagonals, and in base-10node-10x-8x links lay nearly on top of each other. Two new candidates for such
  labs (at most 15 devices, no ring, no plain box): `grid`, a mesh on a lattice of whole columns and rows
  (stress layout snapped by the Hungarian method, then annealed with a fixed seed), and the ladder on
  another cycle (the routers' own ring, the customer devices hung off it, mirrored so they sit below; one
  column more on a card; off a card, such a lab takes its card's layout, so the 3D page shows the same
  structure). The score now counts links lying on top of each other (two links leaving one
  device less than 15° apart, or sharing a stretch: 3 each) and link length beyond 2.25 grid units.
  On the 204 na-sales-lab cards, 11 change: crossings 15 → 14, label covers 1 → 3, labels across a link
  6 → 3, small badges 130 → 118, badges beside their link 54 → 46, none dropped.

## [0.23.4] - 2026-11-09

### Fixed

- **The rainbow on every link over the line system in 3D, and device labels off other devices, links and
  rainbows on the frames** (#37, @jgroom33) — in 3D a connection over the line system was six 1 px dashed
  lines: about 1 px wide at 1x (base-els-2node PE-1–PE-2), and hidden inside the grey tube where a routed
  link already joins the two routers (Team-3-MC P1–PE4: link P1 2 – PE4 2, its cables to the ELS
  terminals from 2/1, so the link has no `over` and a connection is derived beside it). Every rainbow is
  now a row of thick dashes (radius 0.22, wider than a link's 0.13 tube), and such a connection wraps the
  link's tube. A lone line over the line system has its `over ch N` caption on one side and its port
  labels on the other, off the rainbow. On the frames a device label takes the nearest spot next to its
  device (its usual place, the other side, slid sideways up to half its width, up to a label height
  further out, or beside it) that covers no device box, no other device's link and no rainbow (Team-3-MC:
  PE4's label lay on PE3's box on the IGP frame, and on the PE3–CE-3 link and the rainbow on the physical
  frame); on the IGP frame the labels are placed before the metric pills, which slide along their link
  clear of them; the two port badges of a link are drawn at one size (P1–PE4's two `2/1` badges were
  not). On the 204 labs of a CAL rollout, 87 cards change (the 3D positions and the snapshots none, no
  card changes size or gains a crossing): device labels on another device's box, another device's link or
  a rainbow 56 → 3 (on 24 cards → 3), links with two badge sizes 103 → 0, badges beside their line
  92 → 56, dropped to the hover title 1 → 0, smaller than full size 99 → 130. Render goldens change:
  `adaptive-sr-cfm`, `g8032-two-ring`, `l3vpn-hosts`, `line-system`, `srv6-evpn` and `srv6-ospf` frames
  (labels moved off a box or link: P3, PE1, PE6; RS_1, RM_4, RS_2; PE1, a BGP VRF label and the hosts;
  PE1, PE2; a route reflector label; PE1, PE2 on the SRv6 frame; one IGP metric pill moves; in the first
  two a badge takes its link's other badge's size), and `els-line-system` frames (a link's two badges at
  one size); facts goldens change their version line.

## [0.23.3] - 2026-11-08

### Fixed

- **Port badges sit on their own links: room for a connection over the line system beside a cable, a
  badge past its own device's label, and none under another link** (#36, @jgroom33) — on a lab card
  (`card-frames`), two routers joined by a cable and by a connection over the line system (the rainbow,
  with its `ch 25` chip) were pulled 0.4 columns apart, too short for the chip and four port badges, so
  both badges of the connection sat beside the line; a badge whose own device's label lay over the near
  half of a short link (a router one row under another, its label above it) floated beside the line, 49 px
  off; and a badge could sit on its link under another link's line where links leave a device close
  together. The layout's last untangling pass now gives such a pair at least 0.9 columns (a row counting
  as 0.62 of a column) clear of both devices' labels, taking that result only when it has no more crossings
  or links through devices than without (layout link property `over`, optional). On the frames a badge on
  its link is never under another link's line (a parallel link between the same two devices aside), the
  badges of a connection over the line system are placed first, and a badge whose own device's label
  covers its link may go on it past the middle, up to 0.6 of its length, before it goes beside the line.
  On the 204 labs of a CAL rollout, 30 cards change: badges under another link 64 → 0, dropped to the hover
  title 11 → 1, beside their line 108 → 92; no card changes size or gains a crossing. The render golden
  `l3vpn-hosts.frames.svg` changes (two badges by PE2 move off each other's link); facts goldens change
  their version line.

## [0.23.2] - 2026-11-07

### Added

- **View property `embed`: the viewer inside another page shows its one lab and nothing else to load**
  (#35, @jgroom33) — a page that opens the viewer in an iframe for one lab's facts
  (`?facts=…&preset=lab-snapshot&embed=true`) had no way to hide the viewer's *Example lab* button and its
  *Load your facts.json* picker, which replace the lab on show. `embed` (boolean, default `false`; view
  schema 1.4, an optional property) is set from a view file or the URL (`embed=true` / `1` / `yes`). With it
  on, the page leaves out the example button, the file picker and its note, never shows the lab picker,
  does not read a file dropped on it, and when the facts fail to load shows the error alone instead of the
  bundled example behind it (the Facts section is shown only for an error). The Import tab and the
  `#device=` / `#service=` links stay. With it off, the page is as in 0.23.1; the lab cards and render
  goldens are unchanged.

## [0.23.1] - 2026-11-07

### Fixed

- **The OADM pair touches in 3D, in the snapshot and on the 2D frames** (#34, @jgroom33) — two OADMs of a
  line system cabled back to back (the express link between them) share one label and their express link
  is not drawn, but on the 3D page the two boxes still stood about four box-widths apart. They now move
  toward each other, each halfway, until their boxes touch (`touchBackToBack` in the viewer's
  `import/layout.js`). The snapshot pulls them together the same way and gives the pair one label,
  `A | B`. On the 2D frames the boxes already touched, but each box's white outline and rounded corners
  left a white seam between them. The pair is now one outlined block with a faint line between its two
  tags. Labs without an OADM pair are drawn as before.
- **A free note is shown whole** (#34, @jgroom33) — a note on no device was cut after three lines on the
  frames and the snapshot (`ports 25…`); it now wraps to as many lines as it needs, and the card grows to
  fit. A note on a device keeps its three lines, its whole text in the hover title.
- **A connection over the line system beside a cable reads as two lines, each with its badges**
  (#34, @jgroom33) — on the physical frame, a rainbow `ch N` connection and a direct cable between the same
  two routers were drawn 0.9 font units apart and read as one line; they are now 1.25 apart, still meeting
  the router symbol. The channel chip stays in the middle of its link when the cable beside it has no
  caption, instead of being pushed toward one end, so the port badges at both ends keep their place on
  their own link (Team-4-MC_NA's `2/2`).

### Changed

- **ELS terminology** (#34, @jgroom33) — a line-system `terminal` is tagged `TERM` on the 2D frames, the
  snapshot and the 3D page; `OT` now means a transponder only. The schema's `devices[].role` description
  (wording only, no schema version change) documents `terminal`, `oadm` (fixed-filter add/drop: two
  chassis back to back over an express link), `roadm` (reconfigurable, WSS) and `amplifier` (line or
  in-line amplifier). The README says what lies between the terminals (OADM pairs only for ELS; ROADMs or
  in-line amplifiers for a ROADM system) and that ELS is amplified and actively controlled with fixed
  filters, not passive, and says chassis rather than shelf; the layout comment in `js/src/layout.ts` says
  the same.

### Added

- **An ELS-shaped fixture lab in the site menu** (#34, @jgroom33) — `els-line-system`: a terminal, an
  OADM pair back to back over an express link, a terminal, the routers on the terminals' channel ports
  (25, 26), channel 16 added and dropped at the OADM site; facts and render goldens. The OADM-pair tests
  use it. The ROADM fixture (`line-system`) now types its two ROADMs `roadm-1d`, terminal ROADMs with one
  line port, as it wires them.

## [0.23.0] - 2026-11-05

### Changed

- **Layout: a line system laid out as a chain** — the members of an optical line system (devices without facts
  with an equipment role: terminals, OADMs, ROADMs, amplifiers) are now laid out after the other devices,
  without them, and each line system is then a row of its own above them, in
  path order: a terminal, the OADMs or amplifiers, the other terminal, the end cabled to the router further
  left on the left, each member's label by its box, within `max_columns`. A router cabled only to the line
  system stands under its terminal. Before, the members joined the core and could fold back on themselves. A plain box without an equipment role is laid out as before.
  `LayoutNode` takes `equipment` (the importer's nodes carry it already).
- **Frames: two OADMs back to back drawn as one, their express span implied** — two OADMs cabled to each
  other (both line-system members with the equipment role `oadm`, any case: the express span of a back-to-back
  pair) take one place in the line system's row, side by side (`BACK_TO_BACK`, 0.3 columns, in the layout;
  the frames draw their boxes touching, under one label `OADM-1 | OADM-2`, names left to right), and the frames and the snapshot leave the span between them out
  (`isExpress` in the viewer's render model): express traffic is implied by the two standing together. The
  facts and the 3D model keep the link; the frame titles count the spans they draw.
- **Frames: an optical frame for the line system, the routers joined through it on the physical frame** —
  the line system was drawn on the optical frame with the routers at its ends, so the physical frame showed
  those routers unconnected (and a lab cabled only through it had a physical frame without a link). A lab
  with a line system now has two frames for it. The optical frame draws the line system alone: its row
  (terminal, the OADMs side by side, terminal), the spans with their labels, and at each member port a
  router is cabled to a callout naming what rides it, `PE-1 2/1 · ch 25` (the cable's label as its channel,
  else `ch N` for a numbered port), instead of the router and its cable. The physical frame draws the
  routers: two routers cabled to the same port of two members of one line system (a terminal's channel
  port) are joined by a connection over it, a rainbow of dashes (a dash of each of six colours in turn, for a
  wavelength) labelled with its channel (`ch 25`), the router
  port badged at each end, derived from the cabling (`topology.lightpaths`, `lightpathsOf` in the
  importer), drawn only, never on a protocol frame, not a link of the 3D view's network. Where the facts
  give a routed link over the line system, nothing is derived and that link is drawn the same way: a
  rainbow of dashes captioned with its channel, badged with the router ports its cables to the line
  system leave from (not its interface names), on the frames, the snapshot and the 3D page. The
  frames other than optical lay their devices out without the line system, each connection over it an
  ordinary link (the importer's `cardLayout`), so the chain no longer pushes the routers apart; the
  optical frame keeps the line system's places. A view without the optical layer keeps the line system
  with every cable on the physical frame. The start frame is unchanged; protocol frames leave the line
  system out.
- **3D view and snapshot: the physical plane shows the routers joined through the line system** — the 3D
  page and the snapshot keep their optical plane under the physical one (the members, the spans, the
  router cables, each router end now labelled with its port on the page), and their physical plane now
  joins the routers too: each connection over the line system is a rainbow of dashes captioned
  `over ch 25`, with the router port at each end (`physicalLineSystem` in `view/layers.js`; the snapshot
  badges it as a cable). Without an optical plane (a view that leaves it out) the page's physical plane
  draws all of it. Two OADMs back to back share one label (`OADM-1 | OADM-2 oadm`) and their express span
  is not drawn, as on the frames. A free note hangs just in front of the plane's front right corner
  instead of over the devices there.

## [0.22.0] - 2026-11-05

### Added

- **Frames: a role frame, and the physical frame shows the devices, not their roles** — a new frame `f-role` (view layer
  `role`, view schema 1.3) sits right after physical and shows the network roles, CE, PE and P, as the viewer
  derives them from the facts (a route reflector P·RR), or a record's `role` for a device without facts; it
  is left out when no device has a role, listed in `data-frames`, and the devices keep their places. The
  physical frame now draws every router (a Ciena SAOS device: SAOS 10, and SAOS 6 and 8 too) as the same
  common router symbol, a Ciena red (#DC0000) disc with four white arrows pointing in, its name and model
  (3984-10x, 5164-10x) beside it in near-black; any other device (a Waveserver, a third-party box, an ELS
  shelf without a role) is a neutral grey box tagged with its model (WSAi, JNP, ELS); every text 4.5:1 or
  better on its background. The links and ports as before. The role tags and role colours moved
  from physical to the role frame (no duplicate: physical keeps none). A device without facts is drawn as
  the same symbol with a dashed ring (a grey box with a dashed outline) instead of a grey plain box ("no facts" stays in its hover title); one
  without a type stays the faint grey box. The snapshot has no role plane (its physical plane keeps the role
  colours), nor has the 3D page. A view that lists its `layers` without `role` gets no role frame, as before.
- **A lab whose devices all lack facts is drawn** — `importFacts` threw "no device in this facts file has
  facts" when every record was skipped (no configuration in the lab yet, or no extractor for the type). It
  now draws the records and the file's `links[]` as plain boxes (the physical frame; the role frame too
  when the records give roles; the 3D page's physical plane), and throws only when there is nothing to
  draw (the view's `plain: false`). The layout counts the boxes of such a lab as its network, so a cycle of
  them gets the ladder rather than "no cycle" columns (a chain of boxes between routers still counts as one
  link). A record `role` of `ce`, `pe` or `p` (any case) is a network role, not equipment: the layout and the
  role frame read it (facts schema description only). Fixture lab `config-less` (six devices, no
  configurations, roles from `--extra`) is in the site's lab menu. On the 202 published CAL lab cards (196
  plus the 6 without configurations, now drawn): every physical frame shows router symbols and grey boxes; 58
  cards gain a role frame; on 23 cards 57 skipped devices beside configured ones change from the grey "?"
  box to their symbol or box; layout, crossings and card sizes unchanged on the 196; port badges moved off
  their spot 188 -> 151 and dropped 11 -> 11, cards with any badge collision 58 -> 52 (the router symbol is
  narrower than the old box; 32 cards better, 3 cards one or two badges worse as placement order shifts). Render goldens of the fixture labs regenerated.

## [0.21.0] - 2026-11-04

### Added

- **Layout: the card follows the network roles; candidates scored, the best per lab** — `layoutFacts`
  (algorithm auto) now scores candidates and takes the best. Tiers put the roles in columns, CE | PE | P | PE | CE
  left to right (PE: a router with a service, P: only IGP and MPLS, CE: no IGP; devices without facts by
  what they are linked to). The poles are the devices (or the PE pair a CE is dual-homed to) furthest apart.
  Devices in a column are ordered to cross as few links as possible (Sugiyama: barycentre sweeps, then
  swapping neighbours), with the routers of one IGP area (else one G.8032 ring) kept together. Rows are
  set so links run straight and evenly spaced, so a PE pair and its dual-homed CE come out mirrored.
  Radial takes a hub lab; stress (stress majorisation) takes a mesh that fits no tiering; the ladder stays
  a candidate. The score counts crossings, links through devices, crowding, port badges that would find
  no room at full size on their link (laid out as the card frames draw them, fitted to the renderer on 196
  labs), link-length evenness and fit (`max_columns` wide, three rows, landscape, compact). A layout that
  follows the roles counts 2 less, and a candidate other than the ladder must beat it by 3. On a card,
  role tiers may take one column more than `max_columns` (CE | PE | P | PE | CE is five). `LayoutResult`
  gains `candidates` (each with its positions and score, the chosen one first) and the methods `tiers`,
  `radial` and `stress`; `LayoutNode` gains `group` (the IGP area), which the viewer's importer now sets.
  Hints (an authored layout) and algorithm force are unchanged. Measured on 196 published CAL lab cards:
  51 change (with the next entry); port badges moved off their natural spot 310 -> 188, dropped to the
  hover title 22 -> 11 (labs with any 90 -> 58); link-length spread (coefficient of variation) 0.163 ->
  0.109; crossings unchanged (15) and no lab worse; labs with P and PE routers drawn by role 1 -> 10 of 19. Render goldens
  of five fixture labs regenerated (ospf-tp, srv6-ospf, srv6-evpn and l3vpn-hosts now PE | P | PE).
- **Layout: the ladder's cycle is counted in routers** — plain boxes add nothing to a cycle's length, so
  a line system's chain of them (ROADMs and amplifiers between two routers) counts as one link, and of
  equally long cycles the one with the fewest boxes wins: a cycle of routers alone, when there is one, is
  the ladder's rather than a longer one through the line system. `longestCycle` takes an optional
  `uncounted` test. With the ELS line systems' spans added to the 196 cards, the one lab whose ladder ran
  through its line system (3 crossings) now runs on its router triangle with none; without the spans one
  other card changes (a dual-homed device no longer counted into the ring: 0 badges moved instead of 2).

## [0.20.0] - 2026-11-02

### Fixed

- **Frames: port badges never overlap a device box or each other; IGP metrics never stack** — the port
  badges in the physical and optical frames sat at a fixed point along each link, so on a short link they
  went under the device boxes, and the badges of parallel links (a bond's member cables) stacked. Each badge
  now starts outside its device's box (measured from the box edge), slides along its link up to the middle
  until it clears every device box, caption, device label and badge already placed, then tries 0.8 and 0.65
  of its size, then beside the line (never on another link); all badges try each step before the next, in
  a fixed order, so the output stays byte-stable. A badge with no room (a short link in a crowded corner)
  leaves its port to the link's hover title. Device labels are placed before the badges, so they stay
  beside their device. IGP metric pills take the middle of their link, else the nearest clear spot along
  it (parallel and crossing links). New golden lab `vpws-bonds` (short host links, a bond's two cables to
  one PE) and a test that counts overlaps on every golden lab; on 199 generated lab frames: 0 overlaps
  (was 114 frames, 257 badge-on-badge, 467 badge-on-device), 99% of badges drawn.

## [0.19.0] - 2026-11-02

### Added

- **Viewer: `frames.svg` rotates by itself; PNG export** — the frames SVG carries CSS (`@keyframes`, no
  script) that shows the start frame, then the next frame every `frames.period_s` seconds, round, wherever
  the file is shown on its own (`<img>`, CSS background, the file in a browser, GitHub's file view). Hard
  cuts, not a crossfade (20 rotating cards: ~6% of a core against ~37% for a 0.4 s fade, headless Chromium).
  `#f-<layer>` shows that frame and stops; `#still` shows the start frame without moving, for
  `<picture><source media="(prefers-reduced-motion: reduce)">` (an `<img>` does not see the page's
  preference; the file as a document stops by itself); `data-rotate="off"` stops it in a page that inlines
  the SVG; one frame does not move; a viewer without CSS animation shows the start frame. Checked headless
  in Chromium and Firefox, as `<img>`, as the document and as a background image, the optical frame
  included. CLI `--png-dir DIR [--scale 1,2] [--font FILE] [--font-family NAME]` writes
  `<name>.<frame>.png` and `@2x.png` per frame with `@resvg/resvg-js` (a new viewer dependency, no browser;
  installed beside the bundled CLI from the release tgz); `frames()` returns `period` and `still(id)`. The
  bundled `render/` gains a `package.json` (`"type": "module"`) so it loads as ES modules beside any
  `package.json`.

## [0.18.0] - 2026-11-02

### Added

- **Schema 1.9.0: sites, line systems, link labels and notes** — what no configuration says and a drawing
  needs, written by the caller (from its own inventory) in a new `extract --extra FILE` (YAML or JSON:
  `devices: {NAME: {type, role, site}}`, `links: [{a, b, kind, label}]`, `notes: [{text, device, layer}]`)
  and carried into the facts as given; the library reads no inventory. New optional fields (1.8 files stay
  valid): `devices[].site` and `role`, `hosts[].site`, `links[].kind` (`ethernet`, `optical`, `lag`) and
  `label`, and a top-level `notes[]` (`{text, device?, layer?}`: in the facts rather than the view because
  they describe one lab, while a view is a presentation many labs share). A name no other input knows is a
  device record with its type and role and no facts (`status` `skipped`): a line-system member; a link on
  the same two ports as a topology link gives it its kind and label; a typo (an unknown name or key) is an
  error before anything is extracted. npm reader: `sites(file)`, `notes(file, { layer, device })`.
- **Viewer, frames and snapshot draw them** — optical spans as a blue double line (the 3D page: a blue
  tube) with their label, staggered on parallel spans, the port pills kept where they fit; line-system
  members as solid blue boxes tagged with their role (ROADM, AMP, OT) and no "plain box" warning; a dashed
  frame round each site's devices (strong on the physical frame, faint on the others; on the snapshot's
  physical plane; on the 3D page's physical plane); notes in yellow on their layer (physical when the
  drawing has no such layer): beside their device with a leader line on a frame, numbered on the snapshot
  with the text in the plane's corner, above the device on the 3D page; free notes along the bottom edge.
  The Device and Overview panels name a member by its role and show its site and spans.
- **View schema 1.2: the `optical` layer, under physical** — with line-system members or optical spans, the
  3D page, the frames and the snapshot have an optical plane / frame below the physical one: the members,
  the spans with their labels and the routers at their ends (their risers start there). The physical layer
  keeps the routers and the links between them, and a routed link whose two ports are cabled by optical
  spans says it rides the line system (`over ch 25`); the other layers leave the line system out. A note
  without a layer goes with its device (optical for a member). A view whose `layers` leave `optical` out
  draws the line system on the physical layer. `LAYER_IDS` starts with `optical` (the defaults list it);
  older views stay valid. Labs without a line system draw as before (their snapshots change only in the
  embedded riser script, which now starts a riser on the lowest plane its device is on).
- **Layout: a chain of plain boxes between two routers is core** — an optical line system (a ROADM,
  amplifiers, a ROADM) between two PEs now joins the ladder with them instead of hanging in loose columns
  (a single plain box between two core devices already did). Layouts of labs without such a chain are
  unchanged.
- **Fixture `line-system`** — the sr-l2 PEs with their core link over an optical line system given by
  `labs/line-system/extra.yaml` (three members, five spans, two sites, two notes; synthetic): golden facts,
  golden frames and snapshot, checked headless in Chromium and Firefox. It is in the site's lab menu, the
  first published lab with plain boxes (the rule that kept them out of the menu is dropped: a feature the
  library has is demoed).

## [0.17.1] - 2026-11-02

### Fixed

- **Viewer: SRv6 over OSPF no longer crashes the page, frames and snapshot** — OSPF keeps its SPF per
  router and per area (RFC 2328 §16.1), IS-IS per router only, and `computeSrv6` read algorithm 0's SPF
  as IS-IS's, so any lab with SRv6 locators over OSPF threw `TypeError: Cannot read properties of
  undefined (reading '<router>')` in `buildNetwork`. Algorithm 0 now merges OSPF's areas: the shortest
  intra-area path over the router's areas (equal-cost next hops merged), and a router in another area
  over the inter-area route to its loopback through an area border router (§16.2). IS-IS labs are
  unchanged. Synthetic fixture `viewer/test/fixtures/srv6-ospf.facts.json` (a two-area OSPF ring, one
  locator per router) with golden frames and snapshot.
- **SAOS 6/8: a configuration with nothing recognised is `error`, not `ok`** — a device typed SAOS 6/8
  whose files hold no command line the parser reads (`recognised: 0`, no host name) came out `ok` with
  all-empty facts, which reads like a device that configures nothing. It is now `status: error` with
  `facts: null` and a `reason` (`no SAOS 6/8 command recognised in N command lines: not a SAOS 6/8
  configuration?`), as the schema already describes `error` ("nothing could be read"); readers already
  skip `error` records and the viewer shows them as plain boxes. Schema description updated, shape
  unchanged (still 1.8.0). Synthetic fixture lab `saos6-unrecognised`.

## [0.17.0] - 2026-11-02

### Added

- **Viewer: frames and snapshot, the lab as static SVG** — `frames(facts, view)` writes one `frames.svg`
  with a 2D frame per layer the lab has content for (physical; G.8032 over physical; IGP; SR policies /
  MPLS-TP over the IGP when there is no pseudowire; SRv6 and Flex-Algo; BGP; L3VPN VRFs; pseudowires over
  the IGP; EVPN; CFM), chosen by the view (`layers`, `frames`, `viewFrames`) and starting on the signature
  layer; each frame a `<g id="f-<layer>">` shown by CSS `:target`, so `<img src="frames.svg#f-igp">` shows
  one frame without script and the bare file the start frame (the last group, no `:has()`).
  `snapshot(facts, view)` writes `snapshot.svg`: the exploded (or `stacked`) planes, devices on risers,
  objects with two or three short labels and hover details, chips that switch planes and close the gaps.
  Both on `layoutFacts` (the 3D page's positions) with plain boxes, self-contained and byte-stable. CLI
  `saos-network-facts-render facts.json --view v.json --frames f.svg --snapshot s.svg`; `npm run build:render`
  bundles it and `render.js` (ES module, importer and engine included, no three.js or yaml), which the
  viewer release tgz carries as `render/` (the Pages site does not). On the landscape card layout (0.16.0). Golden SVGs for six fixture labs; checked
  headless in Chromium and Firefox (fragment frames, chips, no console errors).

## [0.16.0] - 2026-11-02

### Changed

- **Layout: landscape cards** — the card aspect (`aspect: "card"`, the `card-frames` preset) is for a landscape
  card image, but half the cards came out taller than wide: a 10-device lab was two columns by six rows, small
  labs two columns by four (CEs hung in bands above and below the core). A card is now wider than tall where
  it can be, still within `max_columns` (about 4 columns by 3 rows for a 10-device lab): a cycle too long for
  a two-row ladder runs round a rectangle whose rows use the full width (it was as narrow as two columns);
  outer devices hang sideways off the row ends while everything stays within `max_columns` (the layout may
  grow to either side), else above or below; a triangle that is the whole core is drawn as a V; islands go
  beside the layout when they fit; and the last untangling pass counts each row of height (and link length)
  a little, so a device moves into a nearby spare spot when that adds no crossing.
- **Layout: hung devices avoid the rungs on a card** — devices hung off the core on a card no longer cross
  the rungs where the wide layout is clean: a core device with a single core neighbour (a stub off an inner
  router) hangs outward with the CEs instead of between the rows; spots round a device's neighbours are
  tried when the band above or below leaves none whose links cross nothing; and the last untangling pass may
  use the card's whole width and never adds a link through a device. Wide layouts are unchanged.

## [0.15.0] - 2026-11-02

### Added

- **Viewer: the view's layers, camera and label density on the 3D page** — the resolved view (`resolveView`:
  a lab's view file, `?view=`, URL parameters) now drives more than the layer toggles. `layers`: the page
  draws and lists only the planes that are both in the view and in the facts (`viewprops.js` `viewLayers`,
  on top of the planes the facts have); a layer the view leaves out is no longer drawn unchecked, and when
  the view names none of the facts' layers every plane is shown with a warning. `camera`: the camera starts
  at `fit` (front and above, the page's camera as it was; aimed at the middle of the planes left when the
  view removes some), `top` (straight down on the top plane, the outline filling the stage between the side
  panels) or `iso` (from the front right corner, the whole stack in view) (`cameraPose`); a Camera menu in
  the Layers section switches it, and `window.netfactsView.camera` gives the pose it started from.
  `density`: the Labels panel starts from it for this page without storing it. So
  `?preset=protocol-stack&layers=igp,mpls&camera=top` opens on the IGP and MPLS planes from above, the same
  every time, and `?preset=lab-snapshot` opens from the corner with compact labels. No view: the same
  planes, camera and labels as before.
- **View schema 1.1: `density`** — `full`, `compact`, `minimal` or `null` (the default: the page's own
  choice), as the view property and the URL parameter `density`; the preset `lab-snapshot` sets `compact`.
  An optional property, so a 1.0 view is still valid and a 1.0 reader reports it and ignores it. The facts
  schema is unchanged (1.8.0).

## [0.14.0] - 2026-11-02

### Added

- **npm reader: `layoutFacts(model, layout?)`, the layout computed from the facts** — where the devices go,
  for a view's `layout`, so every renderer (the 3D page now, the 2D frames and the snapshot to come) shares
  one picture and no consumer authors one. `algorithm` auto: the core (the IGP routers, else the G.8032
  ring, else the longest cycle, with a plain box in its path) as a two-row ladder on the ring or the core's
  longest cycle, at the rotation and split that keep the other core links short and uncrossed and the
  devices facing customers at the row ends (columns by hops when the core has no cycle); CEs, hosts and
  plain boxes (`drawnNodes` / `drawnLinks`) hung outward. A chain or tree with no router, ring or cycle is
  laid out in columns by hops from the devices that link others (not a row by name); a second cycle linked
  to the core joins it (MPLS-TP nodes without an IGP on a ring of their own); a device linked to two placed
  devices sits between them; no device is put on a link or where its links would run through a device,
  and a last pass swaps or moves devices while that removes crossings. `aspect` card keeps it within `max_columns` columns: a ring too long for the
  ladder runs round a rectangle (row lengths, sides and rotation chosen like the ladder's), a chain wraps
  into bands, outer devices hang above and below. `hints` are used when they place every device: a hint
  for `NAME` places devices `NAME-*` that have none (a diagram with one box for a line system the facts list
  shelf by shelf), plain boxes still without one go beside their neighbours; else they are reported and
  ignored; `force` is the force-directed
  layout the page had (`forceLayout`). Deterministic: the same devices and links in any order give the
  same positions. Runs in Node and the browser (no dependencies).

### Changed

- **Viewer: the 3D page lays labs out with `layoutFacts`** — by default, instead of the force-directed
  layout, following the view's `layout` (`?layout=force` or a view file brings the old layout back; a
  positions file that places every device still wins). The Import tab says which layout placed the
  devices and the core it chose; `window.netfactsView.layout` carries the result. The view schema's
  descriptions of `layout` say what the properties now do (view 1.0, no change to what validates).
  Plain boxes and their links take part in the layout (a line system between two routers sits in the
  core). The expected fixture files only gain the new version.

## [0.13.1] - 2026-11-02

### Fixed

- **Node SID labels follow the configured prefix SID** — SAOS 10 reads `start-sid` as an SRGB index
  unless `value-type absolute` says otherwise (`ietf-sr-cmn` `sid-value-type`, `default "index"`), but a
  config that left `value-type` out gave `value_type: null`, and the viewer then dropped the SID and
  labelled each router SRGB base + its position in the topology: `start-sid 1001-1005` over SRGB 16000
  showed 16001-16005, in node order, instead of 17001-17005 per router. The extractor now writes
  `value_type: "index"` when the config leaves it out (schema description updated, shape unchanged,
  schema still 1.8.0). The viewer reads a null `value_type` as index too, so older facts files label
  correctly without a re-extract. An `absolute` SID becomes label − SRGB base inside the SRGB. Outside it,
  the viewer keeps the label and warns. The device panel shows the label the view uses. One function
  (`nodeSid` in `engine/mpls.js`) gives the label to the SR label tables, the markers, `nodeOfSid` and
  the SR policy segment checks. Only routers with no prefix SID still get the position, and the import
  report lists them.

## [0.13.0] - 2026-11-02

### Added

- **Viewer: devices without facts as plain boxes** — the importer dropped the records the extractor
  skipped or failed on (an optical line system, a third-party router, a controller) and the `links[]` to
  them ("not shown"). They are now drawn on the physical plane as dim outlined boxes with their name and
  type, with the file's links to them as dashed lines; the device panel and the overview name them
  "plain box" and the Import tab says "shown as plain box". They live in `topology.plain` (`{ nodes,
  links }`, each with `plain: true`), apart from `topology.nodes`, so the engine never sees them: every
  existing lab computes exactly what it did, and no published lab has one. A record the extractor
  failed on (`status: error`) is a plain box too and is still reported with its status and reason.
  `drawnNodes` / `drawnLinks` give every device and link a 2D view or layout draws. The page applies
  the view property `plain` from `resolveView` (a view file's `"plain": false`, or `?plain=0`), passing
  `importFacts(text, { plain })`; false leaves them out as before.
- **Fixtures** — a new clab lab `labs/plain-box` (the sr-l2 PEs with a line system of kind `generic_vm`
  between them; no new translator calls), a test fixture only (not in the site's lab menu). The other expected
  files only gain the new version.
## [0.12.0] - 2026-11-02

### Added

- **View properties: schema `view-v1.schema.json` (view 1.0)** — a view file says what to show of a facts
  file, so a site or a lab card never computes a layout or draws a diagram itself: the `layers` that may
  be shown; the 2D `frames` a card rotates through (`rule` auto or list, `list`, `start`: `signature`,
  `first` or a layer, `period_s` as a hint); the 3D `snapshot` (`variant` exploded or stacked); the
  `layout` (`algorithm` auto, force or hints, `hints` per device, `aspect` card / wide / free,
  `max_columns`); `plain` boxes for devices without facts; the `camera` (fit, top, iso); and three
  presets: `card-frames`, `lab-snapshot`, `protocol-stack`. The defaults and presets are data
  (`view-presets-v1.json`) beside the schema. Python: `schema.load_view_schema()`,
  `schema.load_view_presets()`, `schema.view_errors(view)`. The facts schema is unchanged (1.8.0).
- **npm reader: `resolveView(view?, urlParams?)`** — merges the defaults, the preset, the view file and
  URL parameters (in that order; objects by property, lists replace, layout hints by device) into a view
  with every property set, reporting unknown properties and bad values as warnings instead of throwing;
  with `viewFromParams`, `viewFrames` (the frames a card shows and the one to start on), `LAYER_IDS`,
  `VIEW_DEFAULTS`, `VIEW_PRESETS`, generated `ViewFile` types and the schema as
  `@ciena/saos-network-facts/view-schema`.
- **Viewer: view properties by URL and lab index** — a lab's `"view"` in the lab index, `?view=<url>` (over
  it) and the URL parameters `preset`, `layers`, `frames`, `start`, `period`, `variant`, `layout`, `aspect`,
  `columns`, `plain`, `camera`, `title` are resolved for the page: the layer toggles start from `layers`,
  and the resolved view with its warnings is exposed as `window.netfactsView` for embedders and the
  renderers to come. A missing view file is a console warning, not an error. No view: the page is as
  before.

## [0.11.2] - 2026-11-02

### Fixed

- **Viewer: the MPLS plane draws the transport wherever it exists** — it drew only LSPs, SR policies or
  tunnels between two PEs, so a lab with one PE (a management VRF on the PE that faces the DCN
  gateways, the other routers P) lost the MPLS plane, although its walks pushed the labels. Every
  label-switching router now gets a marker with its node SID label (SR-MPLS) or its label count (LDP),
  and LSPs run between the transport endpoints: the PEs and any router that ends a VRF (a P with a
  management VRF counts), a pseudowire, an EVPN instance or an MPLS-TP tunnel. The plane is listed when
  there is a tunnel, an SR policy or a label-switching router. Roles do not change.
- **Hosts: addresses on bond VLAN sub-interfaces are traced to their cable** — `ip link add ... type bond
  | vlan` and `ip link set ... master` were ignored, so an address on `bond0.1100` (over `bond0`, member
  `eth2`) had no `attached`, and the viewer linked two such hosts across a VPWS subnet. The extractor
  now reads those lines and attaches a sub-interface where its bond's members are cabled (the first
  cabled member). As a safety net the viewer never links two hosts that are both cabled to routers.
- **Fixtures** — a new clab lab `labs/vpws-bonds` (the vpws-hosts PEs; hosts with LACP bonds and VLAN
  sub-interfaces, one bond with two members); no translator calls. The other expected files only gain the
  new version.

## [0.11.1] - 2026-11-02

### Fixed

- **SAOS 10: the management VRF's `role` from its configuration** — `role` was set only from `role
  management` / `role data`. A VRF configured `isolate-mgmt true` with no role (only the management VRF
  takes it) now has `role` `management`. The rule is stated in the schema and the README: the name
  (`MGMT`) or description never decides it, and a hand-built facts file should set `role: management`.
  No schema change (1.8.0: only the description says more).
- **Hosts: a containerlab `linux` node read as a SAOS device is not also a host** — a vrnetlab SAOS image
  run as kind `linux` (its type, platform map or startup configuration says SAOS) came out both as a
  device record and, empty, in `hosts[]`. A node is now a device or a host, never both.
- **Hosts: IPv6 and `replace` exec lines are read** — `ip -6 addr replace ...` (and `ip addr replace`)
  went to `ignored_commands`, and an address written after its options (`ip -6 addr add dev eth1
  2001:db8::1/64 nodad`) came out as `dev/32`. Address and route commands now take `add` and `replace`
  and find the address among the options, IPv4 and IPv6 alike.
- **Viewer: the global and empty VRFs are not L3VPNs** — the `default` VRF and VRFs with no route
  distinguisher, route target, interface or static route (bare `vlan501`-style VRFs) were drawn and
  listed as Down L3VPNs (a site with no VPN family labelled "SRv6") and made every router a PE. They are
  now left out of the plane, the overview and the roles, and named in the Import tab. The extractor keeps
  them in the facts: they are configuration.
- **Viewer: a management VRF without a role is recognised by its use** — a role-less management VRF (a
  loopback at every site, other interfaces only towards Linux hosts such as DCN gateways, only default
  static routes, no CE neighbour) was taken for a customer VRF, so every router was a PE. It is now a
  management VRF ("management (by use)" in the overview), not a service; a `role` in the facts wins, and
  the name alone never counts.
- **Viewer: no link between hosts that only share a subnet across an L2 service** — two hosts in one
  subnet, each cabled to a PE, were linked directly although a VPWS carries the subnet between the PEs;
  only the cables are drawn now (a host's `attached` counts as cabling too).
- **Fixtures** — a new clab lab `labs/vpws-hosts` (two SAOS 6 PEs run as kind `linux` with a VPWS, two
  hosts on one subnet behind them, IPv6 `replace` and options-first exec lines); no translator calls.
  The other expected files only gain the new version.

## [0.11.0] - 2026-11-01

### Added

- **Schema 1.8.0: Linux hosts** — a new optional top-level `hosts[]` (1.7 files stay valid): each Linux
  host of the lab (a test host, a CE site, a DCN gateway) with its `interfaces` (addresses with prefix
  length, IPv4 and IPv6, and `attached`: the device and port at the other end of its cable), its static
  `routes`, its `default_gateway` per family, its `sources` and the `ignored_commands`. From the `linux`
  nodes of `--clab` (their `exec` lines: `ip [-4|-6] addr add`, `ip [-4|-6] route add|replace`; every
  other line is listed in `ignored_commands`, not dropped silently) and from the new `--hosts FILE`
  (YAML / JSON: interfaces, routes, gateway), which adds to a containerlab host of the same name. A
  containerlab host's device record stays `skipped` (reason "a Linux host: see hosts[]"). The CLI prints
  a `HOST` line per host.
- **npm reader** — `hosts(file)`, `hostByName(file, name)`, `hostGateway(host, family)` (empty / null for
  older files).
- **Viewer: Linux hosts, a VRFs / L3VPN plane and L3VPN walks** — hosts are CE nodes with their addresses
  and routes, linked to their PE by subnet (else by `links[]`). VRFs from `vrf_instances` become L3VPN
  sites (RD, route targets per address family, interfaces and their hosts, static routes with Null0
  discards, redistribution, per-VRF or per-prefix labels, SRv6 locators); the engine gains per-site and
  per-family route targets, VPN-IPv6 (RFC 4659, 6VPE over an IPv4 core), sessions that carry only the
  VPN families both ends negotiate, and SRv6 L3VPN: End.DT4 / End.DT6 SIDs from each family's locator
  (allocated by the view: the facts carry locators), next hops resolved over the route to the locator,
  H.Encaps.Red and decapsulation into the VRF (RFC 8986, RFC 9252). A **VRFs / L3VPN** plane (only for a
  network with VRFs): one colour per VRF, a ring per PE with its RD and transport, arcs between the PEs
  whose routes cross, lines to the attached hosts, and each VRF's state with the reasons (no BGP path,
  a route target mismatch, an unresolved next hop). Walks: *L3VPN packet* (a host, or a PE in a VRF, to
  an address: host routing, the ingress VRF lookup, VPN + transport labels or SRv6 encapsulation, the
  egress VRF lookup, delivery to the host) and *BGP UPDATE of a VPN route* (originated with its RD, route
  targets and label or SRv6 Prefix-SID, carried to each speaker, reflected with ORIGINATOR_ID /
  CLUSTER_LIST, and imported or not into each VRF by route target). With the L3VPN walk selected, a
  failure replay follows that flow (a floating static default taking over when a DCN gateway's link
  fails). Overview, device (VRF tables), host and VRF (`#service=vrf:<name>`) panels.
- **Fixtures** — a new clab lab `labs/l3vpn-hosts` (PE1 - P1 - PE2 on IS-IS + SR-MPLS with a backup link,
  P1 the VPNv4 / VPNv6 route reflector, VRF BLUE with per-VRF labels between Linux hosts h1 and h2,
  the management VRF MGMT with a loopback per node and two DCN gateway hosts with floating static
  defaults), recorded with translator 4.2.1 (the earlier pivots are unchanged); `labs/srv6-evpn` gains
  `hosts.yaml` (its CE sites `ce-a` and `ce-b`, given with `--hosts`). The other expected files only gain
  the new version (and `hosts` where a topology was given).
- **Site** — the `l3vpn-hosts` fixture lab is in the lab index (`?lab=l3vpn-hosts`); `srv6-evpn` now
  shows its L3VPN over SRv6.

### Fixed

- **Viewer: only the layers the loaded facts have are listed and drawn** — every layer now checks
  whether the network gives it anything to draw (any node; a G.8032 ring; an IGP router; an MPLS-TP
  tunnel, SR policy or LSP between PEs; an SRv6 locator or Flex-Algo; a BGP session; a VRF; a
  pseudowire; an EVPN instance; a CFM MEG), and a layer with nothing is neither in the sidebar nor
  stacked. Before, only the SRv6 and EVPN layers were optional, and even those toggles stayed visible
  (the list's `display: flex` beat `hidden`): a ring-only lab offered IGP, MPLS, BGP, pseudowire and CFM
  planes with nothing on them. The layers are decided once per loaded lab or file (a failure replay
  does not reshuffle the stack), and a hidden layer's on / off choice is kept only while the lab has
  it: a layer a later lab brings back starts visible.
- **Viewer: Linux hosts are listed as hosts, not as skipped devices** — the overview's Devices table
  showed a containerlab host with the topology's default type (5164), role CE and status `skipped`;
  hosts are now only in the Hosts table, with their kind (`linux`) and role host, and a host's panel shows
  its interfaces, routes and cabling instead of the placeholder device record.
- **Viewer: P and PE from the services a router has** — a router was a PE as soon as it spoke BGP, so a
  route reflector with no service (the l3vpn-hosts P1, the srv6-evpn RR1) showed as a PE. A PE now ends a
  pseudowire or an EVPN instance, has a VRF other than a management VRF, or faces a CE or host; any
  other router is a P, shown as P / RR when it reflects BGP routes (a PE that reflects is PE / RR). In
  the example, P8 and PE5 (iBGP clients with no service configured) are now P and PE6 is PE / RR; a P
  with a management VRF keeps its VRF table.
- **Viewer: the failure menu offers only what the lab can detect** — "Silent failure: found by CFM CCM /
  BFD" was offered for every link. The silent mode is now offered per selected link only when something
  finds it there, and names it (CFM CCM, BFD, the LACP timeout, the IS-IS hold timer or OSPF dead
  interval); a link nothing watches (a host link, an L2 ring link) offers loss of signal only.
- **Viewer: the lab menu names a loaded file** — after *Load your facts.json* (or a drop) the lab menu
  still showed the previous lab; it now shows "Your file: NAME", and the page's `?lab=` is dropped so a
  reload does not claim the file is that lab. The *Example lab* button selects the index's default lab.

## [0.10.0] - 2026-10-31

### Added

- **Viewer: IPv6 networks** — links are two routed interfaces in one IPv4 *or IPv6* subnet (`/64`,
  `/126`, `/127`; link-local addresses never link; an IPv6 subnet on the same two interfaces as an
  IPv4 one is that link's second family), BGP neighbours and pseudowire peers are matched over IPv6
  addresses too, and a router whose IS-IS interfaces carry IPv6 only (or whose loopback has no IPv4
  address) runs IS-IS, BGP and the label tables on its IPv6 loopback, every loopback address being
  advertised. An IPv6-only lab now draws its routed links, loopbacks, IS-IS adjacencies and iBGP
  sessions; before, only IPv4 was read and a `--clab` lab got its cables as L2 links only. The
  engine's address helpers handle both families (`engine/ip.js`). The Import tab says which routers
  run on IPv6.
- **Viewer: Labels panel** — device labels with the loopback or by name only, iBGP labels for every
  session, only sessions that are down, or none, LAG labels on or off, and the label size; the
  defaults draw every label as before, and the choice is kept in the browser.
- **Viewer: SRv6 locators / Flex-Algo and EVPN instances (schema 1.6 facts)** — two planes shown only
  for a network that has them. The SRv6 plane: each router's locators (with their algorithm),
  algorithm 0's links, and each Flex-Algo's topology (routers that configure its definition, the links
  between them) with the definition in use (RFC 9350 §5.3: highest priority, then system id), its metric
  type and admin-group constraints; the facts carry no link affinities or delays, so no link is excluded
  and a latency metric falls back to the IGP metric, as the Import tab and the overview say. The EVPN
  plane: each EVI across its PEs (EVPN-VPLS, EVPN-VPWS with its service ids), its SRv6 locator and its
  state: Up when every pair of members exchanges EVPN routes (an iBGP session carrying `l2vpn evpn`,
  directly or through a route reflector), shares a route target, mirrors the VPWS service ids and
  reaches the other's locator in its algorithm. New walks: *EVPN frame over SRv6* (EVPN-VPWS to the far
  End.DX2 SID, EVPN-VPLS broadcast by ingress replication to each End.DT2M SID, H.Encaps.L2.Red and
  decapsulation onto the AC) and *SRv6 packet to a locator* (to its End SID along the locator's
  algorithm). The facts carry locators, not SIDs: the view allocates the functions and says so.
  Overview, device and service panels list locators, Flex-Algos, routes to locators and EVPN
  instances (`#service=evi:<n>`). VRFs / L3VPN over SRv6 are not drawn yet.
- **Site** — the `srv6-evpn` fixture lab is in the lab index (`?lab=srv6-evpn`).

## [0.9.0] - 2026-10-31

### Added

- **Schema 1.7.0: VRFs (L3VPN), static routes, BGP VRF neighbours and SRv6 locators (SAOS 10)** — all
  new fields are optional, so 1.6 files stay valid. `vrf_instances[]`: each VRF (the `vrf` list, and
  any VRF only BGP names) with its `description`, `role` (`management` for a management VRF), the
  BGP instance that carries it (`bgp_as`), `route_distinguisher`, `address_families` (`ipv4 unicast`,
  `ipv6 unicast`), `route_targets` (import / export / both, VRF-wide or per address family), per
  address family the `srv6_locators` its L3 service SIDs come from (the VRF address family's own, else
  the instance's `vpnv4` / `vpnv6 unicast` locator, else the instance's), the VRF's own
  `srv6_locator_address` / `srv6_sid_type`, `sr_policy_color`, the MPLS VPN `label_allocation`
  (`per-vrf` / `per-prefix`), `redistribute` per address family, and the `interfaces` bound to it.
  `static_routes[]`: each next hop of `rib vrf <name> ipv4|ipv6 <prefix>` (`vrf` `default` for the
  global table) with `next_hop`, outgoing `interface`, `preference`, `tag` and `description`. BGP
  peers gain `vrf` (CE neighbours of `bgp instance <as> vrf <name> vrf-address-family ... peer`;
  null for the global table) and BGP instances `srv6_locator` / `srv6_locators` per address family.
- **npm reader** — `vrfInstances(device)`, `staticRoutes(device, vrf?)` (empty for older files and SAOS
  6 / 8 devices), `vrfMembers(file, name)`, `vrfRouteTargets(vrf, addressFamily, direction)`, and `vrf`
  on `bgpPeers(facts)`.
- **Fixtures** — `labs/srv6-evpn` gains an L3VPN layer: VRF `CUST-A` over SRv6 on PE1 and PE2 with
  route distinguisher and route targets, a CE-facing interface, VRF static routes and an eBGP CE
  neighbour, VPNv4 / VPNv6 towards the route reflector; its new files are recorded with translator
  4.2.1 (the earlier pivots are unchanged) and the expected facts and the example regenerated (the
  example's CE1 gains its static route). The other expected files only gain the new empty fields.

### Changed

- **Viewer** — a BGP neighbour in a VRF (an L3VPN CE) is no longer taken for an iBGP session of the
  core, so it draws no edge and no "no device of this file" warning.
- **`recognised`** — also counts an SAOS 10 `rib` object (static routes) and an `mpls` object that sets
  a VPN label allocation mode (the rest of `mpls` is still not a fact).

## [0.8.0] - 2026-10-31

### Added

- **Schema 1.6.0: SRv6 locators, Flex-Algo definitions, IS-IS address families, EVPN instances, BGP
  peer groups (SAOS 10)** — all new fields are optional, so 1.5 files stay valid.
  `segment_routing.srv6.locators[]`: each `segment-routing srv6 locators locator` with its `prefix`,
  `sid_type` (`u-sid` / `uncompressed-sid`), Flex-Algo `algorithm`, `block_length` / `node_length` /
  `function_length`, `end_behavior` and the IS-IS `instances` it is restricted to (empty: every
  instance). `segment_routing.flex_algorithms[]`: each `segment-routing flex-algorithm` with its
  `metric_type` (`igp` / `latency` / `te`), `advertise_definition` and `priority`, the
  `admin_groups` it includes (any / all) or excludes, and `srlg_exclude`. IS-IS instances gain
  `address_families` (the union of their interfaces': IPv4 unicast unless
  `ipv4-unicast-default-disable`, plus each configured `address-family`, so an IPv6-only IGP is
  explicit), `multi_topology`, `srv6_locators` (the locators the instance advertises) and
  `srv6_enabled`; IS-IS interfaces gain `address_families`. `evpn_instances[]`: each
  `evpn evpn-instances evpn-instance` with its `evi`, service `type` (`vpls`, `vpws`, `fxc`), the
  forwarding domain (`fd`, `fds`), the EVPN-VPWS `local_service_id` / `remote_service_id`,
  `control_word`, `route_distinguisher`, `route_targets`, its `srv6_locator` and `sr_policy_color`.
  BGP peers gain `peer_group`. VRFs (L3VPN) are not part of this release.
- **npm reader** — `srv6Locators(device)`, `flexAlgorithms(device)`, `evpnInstances(device)` (empty for
  older files and SAOS 6 / 8 devices), `evpnMembers(file, evi)` (the devices with an EVI: the PEs of an
  EVPN-VPLS, the two ends of an EVPN-VPWS), and `peerGroup` on `bgpPeers(facts)`.
- **Fixtures** — `labs/srv6-evpn` gains Flex-Algo 128 with an admin-group exclusion, IS-IS
  multi-topology with IPv6-only core links, an SRv6 locator per node and a Flex-Algo locator per PE,
  and an EVPN-VPLS and an EVPN-VPWS instance over SRv6 on the PEs; its pivots are re-recorded
  (translator 4.2.1) and the expected facts regenerated. The other expected files only gain the new
  empty fields.

## [0.7.2] - 2026-10-31

### Fixed

- **SAOS 10: a device's later files add to an interface instead of replacing it** — a device split
  into several files (a base layer, a device layer, a services layer) is folded in order, but an
  interface a later file mentioned again was rebuilt from that file alone, so the leaves an earlier
  file set were lost: a loopback typed in the base layer and addressed in the device layer came out
  as kind `unknown` (no node SIDs, no loopback), and a later MTU wiped the addresses. A later file
  now sets only the leaves it carries and adds its addresses to the earlier ones; LAG members, a
  port's leaves, forwarding domains, flow points (classifiers are added), classifiers (VLANs are
  added), CFM MEPs and connected prefix SIDs merge the same way. Removals still drop the object.
- **SAOS 10: BGP peer groups are resolved into their peers** — a peer configured as
  `peer <address> peer-group <name>` had `remote_as` null, no address families and
  `route_reflector_client` false, because the settings live on the peer group, so a route
  reflector came out with `route_reflector` false. Each peer now inherits its group's remote AS,
  address families and route-reflector-client setting per address family, its own settings
  winning, wherever the group is defined among the device's files. A removed BGP peer or peer group
  now leaves the facts. No schema change.

## [0.7.1] - 2026-10-31

### Fixed

- **Viewer: rings without a ring id are joined by name** — a SAOS 10 CLI configuration normally
  leaves `ring-id` out (the YANG key is the ring name; the id is optional and defaults to 1), so
  every device's ring arrived with `ring_id` null and the viewer, which joined rings by id only,
  drew one ring fragment per device with a warning and no RPL or replay. The import now joins a
  device ring by its ring id when it has one, else by the one ring id its name carries on other
  devices, else by its name; the ring layer, the RPL, the interconnection nodes and the R-APS
  replay work on the joined ring (its group MAC uses the default ring id 1), and the Import tab
  lists the rings joined by name. The only warnings left are real ambiguities: an id-less ring
  whose name is two different ring ids elsewhere stays on its device, and two name-joined devices
  that disagree on the R-APS VID or ring type are reported as possibly different rings.
- **Viewer: the file's `links[]` win a port over a subnet guess** — two routed interfaces in one
  subnet are drawn as a point-to-point link on their ports, which is wrong when the subnet rides a
  VLAN around a ring (or a service across the network): the guessed link took the ring ports and
  the cabled links from `links[]` were skipped, so the ring lost its RPL. An addressed link whose
  port the file cables to another device now keeps its two interfaces and loses its ports (the
  Import tab lists these subnets over a bridged domain), and the cables are drawn as L2 links.
- **SAOS 6 / 8: the short form `ring virtual-ring add ...` is parsed** — the CLI's partial command
  recognition lets a configuration write `ring` for `ring-protection` (and `virtual` for
  `virtual-ring`); the parser only matched the full word, so the virtual ring's VLAN or
  virtual-switch members came out empty. Abbreviated command words are read as the full ones;
  `logical-ring delete` and `virtual-ring delete` remove the ring or the instance, so a
  configuration that deletes before it creates does not double them.
- **Fixtures** — `labs/g8032-by-name`: a four-node SAOS 10 CLI ring written as such configs are
  (nested form, quoted names, no `ring-id`), with its containerlab links, recorded pivots and
  expected facts; `g8032-saos6/A2.cfg` writes its virtual-ring commands in the short form (the
  expected facts are unchanged). The site's lab index gains the new lab (`?lab=g8032-by-name`).

## [0.7.0] - 2026-10-30

### Added

- **Example: a G.8032 major ring and sub-ring** — `examples/adaptive-sr-cfm` gains one
  `G8032_ringCreate.xml` template on PE1, P2, P3, PE4, PE5 and PE6, written for the example (not
  from the recipe) and validated with the hosted translator: major ring `ring-core` PE1 - P2 - PE4 -
  P3 (ring id 1, R-APS VID 4094, RPL P3 - PE4 with P3 owner and PE4 neighbour, WTR 1 min, guard
  500 ms, revertive) and sub-ring `ring-access` P2 - PE5 - PE6 - PE4 (ring id 2, VID 4093, no
  virtual channel, RPL PE6 - PE5, terminating at the interconnection nodes P2 and PE4), both
  protecting the VPLS forwarding domain `ring-data` (VLAN 100) over the existing core links.
  `facts.json` regenerated (schema 1.5.0); SOURCE.md says what was added and why.
- **Viewer: G.8032 ring layer** — a *G.8032 rings* plane between the physical and IGP layers draws
  each ring on its links (a sub-ring in its own colour, a little above its major ring), with a bar
  and label where a ring port blocks: the RPL owner and neighbour in the idle state, the failed
  ports in protection, the recovered ports while the ring waits to revert. The import joins the
  devices' `rings[]` by ring id, maps ring ports to the links the view already has, finds the RPL
  from the owner's port and the interconnection nodes from where a sub-ring instance names one
  port (SAOS 10) or terminates (SAOS 6 / 8), and lists ring timers it defaults (G.8032: WTR 5 min,
  guard 500 ms, hold-off 0, revertive) in the Import tab. The file's top-level `links[]` (schema 1.5,
  from `--clab`) are drawn as plain L2 links where no addressed link joins the two ports, so a pure
  L2 ring (the `g8032-two-ring` fixture) is placed too. The overview gets a *G.8032 rings* table
  (type, R-APS VID, nodes, RPL, protected domains, state) and the device panel the device's rings,
  ring ports, RPL role and timers.
- **Viewer: ring failure replay** — failing a ring link now lays out, on the same timeline as the
  IGP and MPLS steps, G.8032 (ITU-T) protection switching: Signal Fail at both ends (loss of
  signal, CFM / BFD on the link, or, with neither, when the port is declared down, which the step
  says), the failed ports blocked and the FDB flushed, R-APS(SF) frames (Y.1731 OpCode 40, the
  ring's group MAC and R-APS VID, MEG level) hop by hop around the ring with the RPL owner and
  neighbour unblocking the RPL, and the protection state with the new data path (a sub-ring's
  through its interconnection nodes). Then the repair (60 s after the failure, a model value):
  guard timer, R-APS(NR), wait-to-restore at the RPL owner, R-APS(NR, RB) re-blocking the RPL and
  unblocking the recovered ports, back to idle; non-revertive rings stay as they are. Each step
  names the network it belongs to (before, in protection, repaired but not reverted), and the ring
  layer follows along. A failed RPL and a link on no ring are handled (no port change; no ring
  steps).
- **Site: a lab index with the example and the two-ring lab** — the viewer build stages
  `labs/index.json` beside the page (`viewer/labs.config.js`, a vite plugin; the dev server serves
  it too) with the Adaptive-SR-CFM example as the default lab and the `g8032-two-ring` fixture lab
  (its facts, with `links` from the containerlab topology, copied from `tests/fixtures/expected`),
  so the site and its previews open the example as before and offer the two-ring lab in the lab
  menu or at `?lab=g8032-two-ring`.

## [0.6.0] - 2026-10-30

### Added

- **Live pull-request previews of the example site** — `.github/workflows/pr-preview.yml` deploys
  every pull request from a branch of this repository to `pr-preview/pr-<N>/` on the `gh-pages`
  branch, live at `https://ciena.github.io/saos-network-facts/pr-preview/pr-<N>/`, with a sticky
  comment on the PR carrying the link; the preview follows every push and is removed when the PR
  closes or merges (a weekly job prunes any left behind). A fork PR, whose token is read-only, gets
  no live preview and no comment; every PR still gets the built site as the `site-preview` artifact
  of its run. Fork code is only built under the read-only token (no `pull_request_target`); the
  actions are pinned to commits. CONTRIBUTING "Previewing the site".

### Changed

- **The site deploys from the `gh-pages` branch** — `pages.yml` now deploys `main` to the root of
  `gh-pages` (keeping `pr-preview/`) instead of through `actions/deploy-pages`, so one branch holds
  the site and its previews. One-time repository setting: *Settings > Pages > Source: Deploy from a
  branch*, `gh-pages` / `(root)`; the old Actions deployment stays up until the switch, and the
  first `main` deploy creates the branch. `pages.yml` no longer runs on pull requests.
- **Viewer package version** — `viewer/package.json` is bumped with the release again (0.5.0 shipped
  the viewer download named 0.4.2), so the release asset is `saos-network-facts-viewer-0.6.0.tgz`.

## [0.5.0] - 2026-10-30

### Added

- **G.8032 ring facts (schema 1.5.0)** — `rings[]` now describes Ethernet ring protection on SAOS 10
  as well as SAOS 6 / 8, with optional `ring_id`, `ports` (the ring ports under their configured
  names, with the SAOS 6 / 8 per-port hold-off) and `instances`: the protection instances on the
  ring (SAOS 10 `erp-instance`, SAOS 6 / 8 virtual ring) with `raps_vid`, `raps_level`, `type`
  `major` / `sub`, `virtual_channel`, SAOS 6 / 8 sub-ring `termination`, the RPL role per port
  (`owner` / `neighbor` / `next-neighbor` / `none`, with the port's interface), `members` (SAOS 10
  forwarding domains, SAOS 6 VLANs, SAOS 8 virtual switches), `timers` (`wtr` minutes, `guard` and
  `hold_off` milliseconds) and `revertive`, all as configured with no defaults filled in. The derived
  `sub_ring_of` names the ring a sub-ring is attached to on an interconnection node (the two rings
  share a port). SAOS 10 ring ports get the `ring` role too; `west` / `east` are `port0` / `port1`.
- **SAOS 10 `g8032-rings`** — a handler for the translator's `ciena-itut-g8032-draft:g8032-rings`
  pivot, merged across a device's files and honouring removals (pivot and NETCONF `g8032-ring`).
- **SAOS 6 / 8 virtual rings** — `ring-protection logical-ring create|set` (ring id, `guard-time`,
  `wtr`, port hold-off) and `ring-protection virtual-ring create|set|unset|add|remove` (R-APS VID,
  `mel`, `sub-ring` termination, `west-port-rpl` / `east-port-rpl owner`, `revertive`, `vid` / `vs`
  members) attached to the logical rings; syntax from the SAOS 6.21 / 8.6 command references.
- **Top-level `links`** — with `--clab`, the topology's `links` (brief `NODE:PORT` and extended
  `{node, interface}` endpoints) are written as `links[] {a: {device, port}, b: {device, port}}`, so
  a reader can place L2 rings whose ports carry no addresses. Absent without a topology.
- **npm reader** — `ringsOf(device)` (a device's rings with `ports` / `instances` always present) and
  `ringMembers(file, ringId)` (every device on a ring id, with its ring); types regenerated.
- **Fixtures** — `labs/g8032-two-ring`: a two-ring G.8032 lab on nine SAOS 10 devices with its containerlab
  topology (major ring RM_1..RM_4, sub-ring RM_1 - RS_1 - RS_2 - RM_4 without a virtual channel,
  three CEs), recorded with translator 4.2.1; `labs/g8032-saos6`: a synthetic SAOS 6 / 8 major ring
  and sub-ring with an interconnection node. README section "Rings".

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
