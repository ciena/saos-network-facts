# saos-network-facts viewer

A browser view of a facts file: the devices and links as a 3D topology with one plane per layer —
physical, IS-IS, MPLS (SR policies), BGP, pseudowires (VPWS) and CFM — plus an overview, a panel
per device and per service, packet walks (a VPWS frame over its SR policy, a CCM stream, an IS-IS
LSP flood) and link-failure replays. The published site shows the bundled
[Adaptive-SR-CFM example](../examples/adaptive-sr-cfm/); *Load your facts.json* (or drop a file
on the page) reads any facts file of schema 1.x in the browser, without uploading it.

```bash
npm ci
npm run dev       # http://localhost:5173
npm test          # vitest: the facts importer
npm run build     # static site in dist/ (relative paths: serve it from any directory)
```

Node 22.18 or later.

| Path | |
|---|---|
| `src/import/facts.js` | facts file -> engine topology, and the import report |
| `src/import/layout.js` | node positions (the facts have none) |
| `src/engine/` | the network model: IS-IS, SR-MPLS and SR policies, BGP, VPWS, CFM, LAG, walks, failure replay |
| `src/view/` | the three.js layers, the walk animation and the engine's per-node tables |
| `src/panels.js`, `src/main.js` | the overview / device / service panels and the page |

The importer reads the file with the npm reader (`../js/src`). Facts carry configuration, so what
they do not say is derived or defaulted and listed in the **Import** tab: links are two interfaces
in one IPv4 subnet; roles (CE: no IS-IS; PE: speaks BGP, ends a pseudowire or faces a CE); IS-IS
metrics (10); CFM level and CCM interval when not configured; positions. PW labels and LFIBs are
computed by the engine from the RFCs, not read from devices.
