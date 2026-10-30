# saos-network-facts viewer

A browser view of a facts file: the devices and links as a 3D topology with one plane per layer —
physical, G.8032 rings, IGP (IS-IS or OSPF), MPLS (SR policies, MPLS-TP co-routed tunnels with 1:1
protection), BGP, pseudowires (VPWS, signalled or static on MPLS-TP) and CFM — plus an overview, a panel per
device and per service, packet walks (a VPWS frame over its SR policy or tunnel, a CCM stream, an
LSP BFD packet through a tunnel, an IS-IS LSP or OSPF LSA flood, per area with more than one) and
link and LAG member failure replays, found by loss of signal or, for a silent failure, by CFM / BFD,
the LACP timeout or the IGP hold timer, with the G.8032 protection switch and revert when the link
is on a ring. The
published site shows the bundled [Adaptive-SR-CFM example](../examples/adaptive-sr-cfm/); *Load
your facts.json* (or drop a file on the page) reads any facts file of schema 1.x in the browser,
without uploading it. `?facts=<url>`, `?labs=<index>` and `?lab=<id>` open facts served next to
the site, and a site that stages `labs/index.json` beside the page opens that index's default lab
without any parameter ([Use the viewer in your repo](../README.md#use-the-viewer-in-your-repo));
every release carries the built site as `saos-network-facts-viewer-X.Y.Z.tgz`.

```bash
npm ci
npm run dev       # http://localhost:5173
npm test          # vitest: the engine (one file per protocol), the facts importer, the URL loading
npm run build     # static site in dist/ (relative paths: serve it from any directory)
```

Node 22.18 or later.

| Path | |
|---|---|
| `src/import/facts.js` | facts file -> engine topology, and the import report |
| `src/import/layout.js` | node positions: a layout of the links, or authored positions scaled into the scene |
| `src/labs.js` | facts by URL: `?facts=`, `?positions=`, `?labs=`, `?lab=` and the lab index |
| `src/engine/` | the network model: IS-IS, OSPF, SR-MPLS and SR policies, MPLS-TP, BGP, VPWS, CFM, G.8032, LAG, walks, failure replay |
| `src/view/` | the three.js layers, the walk animation and the engine's per-node tables |
| `src/panels.js`, `src/main.js` | the overview / device / service panels and the page |

The importer reads the file with the npm reader (`../js/src`). Facts carry configuration, so what
they do not say is derived or defaulted and listed in the **Import** tab: links are two interfaces
in one IPv4 subnet, a LAG when both ride one (`lags` / `ports[].lag`; members paired in configured
order, which the facts do not say); the IGP (OSPF when more devices run OSPF than IS-IS: the engine runs one);
roles (CE: no IGP and no MPLS-TP tunnel; PE: speaks BGP, ends a pseudowire or faces a CE); IS-IS
metrics (each end's wide, else narrow, metric at the level the view runs; 10 where not configured)
and OSPF costs where not configured; CFM level and CCM interval when not configured;
positions unless authored. MPLS-TP tunnels are stitched from each node's segment (ingress, then
the neighbour on the forward next hop with the matching label, to the egress). Signalled PW labels
and LFIBs are computed by the engine from the RFCs; static PW and tunnel labels are the configured ones.

G.8032 rings (`rings[]`, schema 1.5) are joined across devices by ring id; a ring's links are the
links whose two ends are ring ports of that ring, so a ring port on a link the view does not have
(no addressed interface on it) is reported and left out. The RPL is the link of the port the owner
configures `rpl owner` on; an interconnection node is one where a sub-ring instance names a single
port (SAOS 10) or terminates on one (SAOS 6 / 8), and the sub-ring is attached to the ring sharing
its other port. In the idle state the RPL owner and neighbour block the RPL; a failed ring link is
blocked at both ends and the RPL forwards (`engine/g8032.js`). The failure replay plays the R-APS
exchange (ITU-T G.8032 §10.1): Signal Fail, R-APS(SF) around the ring, the RPL unblocked, the new
data path; then the repair, guard timer, R-APS(NR), wait-to-restore and R-APS(NR, RB) back to idle.
Timers come from the facts (WTR, guard, hold-off, revertive), else the G.8032 defaults (5 min,
500 ms, 0, revertive); the repair time (60 s after the failure) and the per-hop R-APS delay are model
values (`engine/vendor.js`).
