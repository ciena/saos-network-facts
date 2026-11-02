# saos-network-facts viewer

A browser view of a facts file: the devices and links as a 3D topology with one plane per layer —
physical, G.8032 rings, IGP (IS-IS or OSPF), MPLS (SR policies, MPLS-TP co-routed tunnels with 1:1
protection), SRv6 locators and Flex-Algo, BGP, VRFs / L3VPN, pseudowires (VPWS, signalled or static on MPLS-TP), EVPN instances and CFM — plus an overview, a panel per
device, host and service, packet walks (a VPWS frame over its SR policy or tunnel, a CCM stream, an
LSP BFD packet through a tunnel, an IS-IS LSP or OSPF LSA flood, per area with more than one, an
L3VPN packet between hosts over MPLS or SRv6, the BGP UPDATE of a VPN route through a route reflector) and
link and LAG member failure replays, found by loss of signal or, for a silent failure, by CFM / BFD,
the LACP timeout or the IGP hold timer, with the G.8032 protection switch and revert when the link
is on a ring. The
published site opens the [Adaptive-SR-CFM example](../examples/adaptive-sr-cfm/) and offers the
`g8032-two-ring`, `g8032-by-name`, `srv6-evpn` and `l3vpn-hosts` fixture labs, from the `labs/index.json` the build stages
(`labs.config.js`); *Load
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
| `labs.config.js` | the labs the build stages as `labs/index.json` (vite plugin; the dev server serves them too) |
| `src/engine/` | the network model: IS-IS, OSPF, SR-MPLS and SR policies, MPLS-TP, SRv6 / Flex-Algo, BGP and L3VPN (VRFs, hosts), VPWS, EVPN, CFM, G.8032, LAG, walks, failure replay |
| `src/view/` | the three.js layers, the walk animation and the engine's per-node tables |
| `src/panels.js`, `src/main.js` | the overview / device / service panels and the page |

The importer reads the file with the npm reader (`../js/src`). Facts carry configuration, so what
they do not say is derived or defaulted and listed in the **Import** tab: links are two interfaces
in one IPv4 or IPv6 subnet, a LAG when both ride one (`lags` / `ports[].lag`; members paired in configured
order, which the facts do not say), plus the file's top-level `links[]` (schema 1.5, the extractor's
`--clab` topology) as plain L2 links between ports no addressed link joins (no subnet, no IGP; a subnet
whose ports the file cables to other devices rides a bridged domain and keeps its interfaces but not the
ports, which the cabled links take); the IGP (OSPF when more devices run OSPF than IS-IS: the engine runs one);
roles (CE: no IGP and no MPLS-TP tunnel, a Linux host listed as a host; PE: a router with a service: it ends a
pseudowire or an EVPN instance, has a VRF other than a management VRF, or faces a CE or host; P: the other
routers, whatever their name, a BGP route reflector shown as P / RR); IS-IS
metrics (each end's wide, else narrow, metric at the level the view runs; 10 where not configured)
and OSPF costs where not configured; CFM level and CCM interval when not configured;
positions unless authored. MPLS-TP tunnels are stitched from each node's segment (ingress, then
the neighbour on the forward next hop with the matching label, to the egress). Signalled PW labels
and LFIBs are computed by the engine from the RFCs; static PW and tunnel labels are the configured ones.

IPv6: a link may be an IPv6 subnet (link-local addresses never link), and a router whose IS-IS
interfaces carry IPv6 only, or whose loopback has no IPv4 address, runs IS-IS, BGP and the label
tables on its IPv6 loopback (the Import tab lists them); BGP neighbours and pseudowire peers match
IPv6 addresses too.

The sidebar lists, and the stack draws, only the layers the loaded facts give something to draw (a
ring-only lab gets the physical and ring planes and nothing else): each layer checks the network once
per loaded lab or file (`view/layers.js` `LAYERS[].has`), and a layer's on / off choice is kept only while
the lab has it.

SRv6 and EVPN (schema 1.6) get two more planes, shown only when the file has SRv6 locators or EVPN
instances (`engine/srv6.js`). The SRv6 plane draws each router's locators and the topology of
each algorithm: algorithm 0 is the IGP; a router takes part in Flex-Algo N when it configures a
definition of N, the definition in use is the advertised one with the highest priority (128 when
none is set), then the highest system id (RFC 9350 §5.3), and a link is in N's topology when both its
routers take part. The facts carry no link affinities or link delays, so admin-group exclusions are
listed but exclude nothing and a latency or TE metric falls back to the IGP metric. Every router
routes to every locator along the locator's algorithm. The EVPN plane joins `evpn_instances` across
devices by EVI; an instance is Up when each pair of members has a BGP path for `l2vpn evpn` (a
session, or a route reflector with a session to both), a common route target, mirrored VPWS service
ids and a route to the other's locator. The facts carry locators, not SIDs: the view allocates End
(0x0001), End.DX2 (0xe000), End.DT2U (0xe100) and End.DT2M (0xe200), plus the instance's ordinal on the
device, in the 16 bits after the locator. Walks: an EVPN frame over SRv6 (`engine/srv6walk.js`) and an
SRv6 packet to a locator's End SID. The **Labels** panel trims the labels: device names only, iBGP labels
only for sessions that are down (or none), LAG labels off, and the label size.

Linux hosts (`hosts[]`, schema 1.8) are CE nodes with their addresses and static routes (the lowest
metric of equal prefixes first), linked to a router by subnet like any device, else by the file's
`links[]`; the Import tab lists their `exec` lines the extractor did not read. Two hosts in one subnet that
are each cabled to another device are not linked: an L2 service (a VPWS, a VPLS) carries that subnet
between the devices, and only the cables are drawn; two hosts that are both cabled to routers are never
linked to each other, even when the facts trace an address to no cable.

The MPLS plane draws the transport wherever it exists, whatever the roles: every label-switching router
(a label table with entries) gets a marker with its node SID label (SR-MPLS: SRGB base + index) or its
label count (LDP), and, when there are no SR policies, an LSP between every two transport endpoints:
the PEs and any router that ends a VRF (a P with a management VRF counts), a pseudowire, an EVPN
instance or an MPLS-TP tunnel. The plane is listed when there is a tunnel, an SR policy or a
label-switching router. Being an endpoint does not make a router a PE. VRFs (`vrf_instances`,
schema 1.7) get a **VRFs / L3VPN** plane, shown only when the file has one (`engine/l3vpn.js`). The global
table (`default`) and a VRF with nothing to route (no route distinguisher, route target, interface or
static route, a name only such as `vlan501`) are left out: not drawn, not listed, and no reason for a PE
role (the Import tab names them). A management VRF is no service either: one with `role: management` in
the facts, or, with no role, one used only for management (at every site a loopback in it, its other
interfaces facing only Linux hosts such as DCN gateways, only default static routes, no CE neighbour);
its name alone never counts, and the overview says "management (by use)" for the second kind. VRFs are
joined across devices by name, one site per PE with its RD, route targets per address family,
interfaces (a host or CE on one is the site's attachment), static routes (Null0 discards),
redistribution, label allocation and SRv6 locators. A PE exports its VRF's connected and static routes
(only the redistributed protocols when the VRF names some) in each address family BGP runs in the VRF,
over iBGP sessions that negotiate `vpnv4 unicast` / `vpnv6 unicast` (both ends configure it), directly or
through route reflectors (ORIGINATOR_ID, CLUSTER_LIST); another PE imports a route into each VRF whose
import route targets it carries (RFC 4364) and picks the best path (RFC 4271). Transport per family: over
SRv6 when the family has a locator the PE configures, the route carries an End.DT4 (0xe300) or End.DT6
(0xe400) SID, allocated like the EVPN ones (plus the VRF's ordinal on the device), and its next hop
resolves over the route to that locator (RFC 9252); else a VPN label, one per VRF and family where
`label_allocation` says `per-vrf`, else per prefix, over an LSP (VPN-IPv6 over an IPv4 core is 6VPE,
RFC 4659). The plane draws a ring per VRF around each PE (one colour per VRF), an arc between PEs whose
routes cross (solid both ways, dashed one way, red neither) and a line to each attached host; the
overview and the VRF panel (`#service=vrf:<name>`) give each VRF's state (Up when every pair of sites
gets the other's routes; a family the receiving site does not run is a note) with the reasons. Walks:
an L3VPN packet from a host (or a PE in a VRF) to an address, through the VRF and the transport
(H.Encaps.Red to the far SID and End.DT4 / End.DT6 decapsulation, RFC 8986; or VPN and transport
labels), and the BGP UPDATE of a VPN route as it propagates; with the L3VPN walk selected, a failure
replay follows that flow (a floating static default taking over, say). PE-CE BGP is listed, not run.

G.8032 rings (`rings[]`, schema 1.5) are joined across devices by ring id, or by ring name where no
device gives the ring an id (a SAOS 10 CLI configuration normally leaves `ring-id` out; the Import tab
lists the rings joined by name, and an id-less ring whose name is two different ring ids elsewhere
stays on its device with a warning); a ring's links are the
links whose two ends are ring ports of that ring, so a ring port on a link the view does not have
(no addressed interface on it and no `links[]` entry) is reported and left out. The RPL is the link of the port the owner
configures `rpl owner` on; an interconnection node is one where a sub-ring instance names a single
port (SAOS 10) or terminates on one (SAOS 6 / 8), and the sub-ring is attached to the ring sharing
its other port. In the idle state the RPL owner and neighbour block the RPL; a failed ring link is
blocked at both ends and the RPL forwards (`engine/g8032.js`). The failure replay plays the R-APS
exchange (ITU-T G.8032 §10.1): Signal Fail, R-APS(SF) around the ring, the RPL unblocked, the new
data path; then the repair, guard timer, R-APS(NR), wait-to-restore and R-APS(NR, RB) back to idle.
Timers come from the facts (WTR, guard, hold-off, revertive), else the G.8032 defaults (5 min,
500 ms, 0, revertive); the repair time (60 s after the failure) and the per-hop R-APS delay are model
values (`engine/vendor.js`).
