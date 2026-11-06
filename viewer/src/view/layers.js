// SPDX-License-Identifier: Apache-2.0
// Builds the stacked protocol layers for a network (engine/network.js) as
// Three.js groups: one translucent plane per layer over the same node positions.

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { hostPrefix } from '../engine/ip.js';
import { prefixSidLabel } from '../engine/mpls.js';
import { RAINBOW } from '../rainbow.js';
import { DEFAULT_LABELS, bgpLabel, lagLabel, nodeLabel } from './labels.js';

// One plane per layer, LAYER_GAP apart in this order, for the layers the network has something on.
// Every layer says whether a network gives it anything to draw (`has`, mirroring its build_*): a layer
// with nothing is neither listed nor drawn, so the sidebar offers only what the loaded facts carry.
// Plain boxes: devices without facts (fill and outline).
const PLAIN = 0x3a4351;
const PLAIN_EDGE = 0x8b98a8;
const OPTICAL = 0x5c7cfa; // optical spans and line-system members (schema 1.9 links[].kind, devices[].role)
const SITE = 0x8b98a8;
const PAGE_LAYER_OF = { igp: 'isis' }; // a note's view layer id -> the page's layer id

export const LAYERS = [
  // Under the physical plane: optical line-system members and the spans to and between them (schema 1.9).
  { id: 'optical', name: 'Optical line system', color: 0x5c7cfa, has: (net) => (net.topo.plain?.nodes ?? []).some((n) => n.equipment) || [...net.topo.links, ...(net.topo.plain?.links ?? [])].some((l) => l.medium === 'optical') },
  // A lab with no facts at all still has its plain boxes (devices without facts, not line-system members) here.
  { id: 'physical', name: 'Physical / LAG', color: 0x8b98a8, has: (net) => net.topo.nodes.length > 0 || (net.topo.plain?.nodes ?? []).some((n) => !n.equipment) },
  { id: 'ring', name: 'G.8032 rings', color: 0xe3b341, has: (net) => (net.g8032?.rings.length ?? 0) > 0 },
  { id: 'isis', name: 'IGP (IS-IS / OSPF)', color: 0x3fb950, has: (net) => net.igp.routers.length > 0 },
  { id: 'mpls', name: 'MPLS: SR policies / LSPs / MPLS-TP', color: 0xd29922, has: (net) => net.tp.tunnels.length > 0 || net.sr.policies.length > 0 || mplsRouters(net).length > 0 },
  { id: 'srv6', name: 'SRv6 locators / Flex-Algo', color: 0xffa657, has: (net) => (net.srv6?.locators.length ?? 0) > 0 || (net.srv6?.algorithms.length ?? 0) > 1 },
  { id: 'bgp', name: 'BGP', color: 0xa371f7, has: (net) => net.bgp.sessions.length > 0 },
  { id: 'vrf', name: 'VRFs / L3VPN', color: 0xa5d6ff, has: (net) => (net.l3vpn?.vrfs.length ?? 0) > 0 },
  { id: 'pw', name: 'Pseudowires (VPWS)', color: 0xf778ba, has: (net) => net.vpws.pseudowires.length > 0 },
  { id: 'evpn', name: 'EVPN instances', color: 0xd2a8ff, has: (net) => (net.evpn?.instances.length ?? 0) > 0 },
  { id: 'cfm', name: 'CFM MEG', color: 0x39c5cf, has: (net) => net.cfm.megs.length > 0 },
];
export const LAYER_GAP = 6;
// Flex-Algo topologies in the SRv6 plane, one colour per algorithm after algorithm 0's.
const ALGO_COLORS = [0xff7b72, 0x79c0ff, 0x56d364, 0xe3b341];
// VRFs in the L3VPN plane, one colour each (the panels use the same: vrfColor).
export const VRF_COLORS = [0x58a6ff, 0xffa657, 0x7ee787, 0xff7b72, 0xd2a8ff, 0xf2cc60];
export const vrfColor = (net, name) => VRF_COLORS[Math.max(0, (net.l3vpn?.vrfs ?? []).findIndex((v) => v.name === name)) % VRF_COLORS.length];
const SUB_RING = 0x79c0ff; // a sub-ring, apart from the major rings in the layer colour
const RPL = 0xf0883e;

// The layers a network shows (those with something to draw), in stacking order; every layer before
// a network is loaded.
export function presentLayers(net) {
  return LAYERS.filter((l) => !net || l.has(net));
}

// The routers that label-switch: a label table (LFIB) with entries, under SR-MPLS or LDP.
export function mplsRouters(net) {
  if (net.mpls.mode === 'none') return [];
  return net.topo.nodes.filter((n) => n.role !== 'ce' && n.loopback && Object.keys(net.mpls.lfib[n.id] ?? {}).length > 0).map((n) => n.id);
}

// The routers MPLS transport ends on: the PEs, and any router that ends a VRF (a P with a management
// VRF too), a pseudowire, an EVPN instance or an MPLS-TP tunnel, so a walk to or from it has an LSP.
// Roles stay as they are: a transport endpoint is not made a PE.
export function transportEndpoints(net) {
  const routers = new Set(net.topo.nodes.filter((n) => n.role !== 'ce' && n.loopback).map((n) => n.id));
  const ends = new Set([
    ...net.topo.nodes.filter((n) => n.role === 'pe').map((n) => n.id),
    ...(net.topo.vrfs ?? []).flatMap((v) => v.sites.map((s) => s.pe)),
    ...net.vpws.pseudowires.flatMap((p) => p.ends.map((e) => e.node)),
    ...(net.evpn?.instances ?? []).flatMap((i) => i.members.map((m) => m.node)),
    ...net.tp.tunnels.flatMap((t) => [t.src, t.dst]),
  ]);
  return net.topo.nodes.map((n) => n.id).filter((id) => routers.has(id) && ends.has(id));
}

// The label-switched paths between every pair of transport endpoints, along FTN / LFIB next hops (the
// MPLS plane draws them when there are no SR policies): [{ src, dst, hops, labels: [{ from, to, label }] }].
export function transportLsps(net) {
  const out = [];
  const pes = transportEndpoints(net);
  for (const src of pes) {
    for (const dst of pes) {
      if (src === dst) continue;
      const fec = hostPrefix(net.topo.nodes.find((n) => n.id === dst).loopback);
      const hops = [src];
      let hop = net.mpls.ftn[src]?.[fec]?.nextHops[0];
      const labels = [];
      let cur = src;
      let guard = 0;
      while (hop && guard++ < 16) {
        labels.push({ from: cur, to: hop.node, label: hop.label });
        hops.push(hop.node);
        cur = hop.node;
        if (cur === dst) break;
        const e = net.mpls.lfib[cur]?.[hop.label];
        if (!e) break;
        const nh = e.nextHops[0];
        hop = { node: nh.node, label: nh.op === 'pop' ? 3 : nh.outLabel };
      }
      if (hops.at(-1) === dst) out.push({ src, dst, hops, labels });
    }
  }
  return out;
}

// An express span: a link between two OADMs of a line system, back to back at one site (as render/model.js
// isExpress, over the plain boxes: { nodes }).
export function isExpress(plain, l) {
  const oadm = (id) => /^oadm$/i.test(plain.nodes.find((n) => n.id === id)?.equipment ?? '');
  return oadm(l.a.node) && oadm(l.b.node);
}

// The router ports a line system's drawing shows: each connection over it (import/facts.js lightpathsOf,
// drawn on the physical plane as a rainbow of dashes with its caption) and each routed link over it (a link
// with `over`, drawn alike) with the router port at each end, and the
// router port (a device that is not a member, with facts or a plain box) at the router end of each cable
// to a line-system member (on the optical plane, or on physical without one). A line drawn beside others
// between the same two devices carries its index and their count (memberOffset), as buildPlain spreads them.
export function physicalLineSystem(net) {
  const plain = net.topo.plain ?? { nodes: [], links: [] };
  const members = new Set(plain.nodes.filter((n) => n.equipment).map((n) => n.id));
  const key = (l) => [l.a.node, l.b.node].sort().join('|');
  const spread = (list) => {
    const count = new Map(), seen = new Map();
    for (const l of list) count.set(key(l), (count.get(key(l)) ?? 0) + 1);
    return list.map((l) => {
      const index = seen.get(key(l)) ?? 0;
      seen.set(key(l), index + 1);
      return { l, index, count: count.get(key(l)) };
    });
  };
  const lightpaths = spread(net.topo.lightpaths ?? []).map(({ l, index, count }) => ({ ...l, index, count }));
  const ports = [];
  // the cables as buildPlain draws them (plain links, spread among themselves)
  for (const { l, index, count } of spread(plain.links.filter((l) => !isExpress(plain, l)))) {
    for (const [end, far] of [[l.a, l.b], [l.b, l.a]]) {
      if (!members.has(end.node) && members.has(far.node) && end.port != null) ports.push({ node: end.node, port: String(end.port), toward: far.node, index, count, lightpath: false });
    }
  }
  for (const l of lightpaths) {
    for (const [end, far] of [[l.a, l.b], [l.b, l.a]]) {
      if (end.port != null) ports.push({ node: end.node, port: String(end.port), toward: far.node, index: l.index, count: l.count, lightpath: true });
    }
  }
  // a routed link over the line system (the facts' link, `over`): drawn alike, the router port at each end
  for (const l of net.topo.links.filter((x) => x.over)) {
    for (const [end, far] of [[l.a, l.b], [l.b, l.a]]) {
      const port = l.cables?.find((c) => c.node === end.node)?.port ?? end.port ?? end.if;
      if (port != null) ports.push({ node: end.node, port: String(port), toward: far.node, index: 0, count: 1, lightpath: true });
    }
  }
  return { members: [...members], lightpaths, ports };
}

// The outline every plane shares: the drawn devices (plain boxes too) with a 6-unit margin, in xz.
export function planeBox(topo) {
  const drawn = [...topo.nodes, ...(topo.plain?.nodes ?? [])];
  const xs = drawn.map((n) => n.pos.x);
  const zs = drawn.map((n) => n.pos.z);
  return { x0: Math.min(...xs) - 6, x1: Math.max(...xs) + 6, z0: Math.min(...zs) - 6, z1: Math.max(...zs) + 6 };
}

// A site's outline on the physical plane: its drawn devices with a margin, in xz.
export function siteRect(topo, site, pad = 3.6) {
  const drawn = [...topo.nodes, ...(topo.plain?.nodes ?? [])].filter((n) => site.nodes.includes(n.id) && n.pos);
  if (!drawn.length) return null;
  const xs = drawn.map((n) => n.pos.x), zs = drawn.map((n) => n.pos.z);
  return { x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, z0: Math.min(...zs) - pad, z1: Math.max(...zs) + pad };
}

// The page layer a note (import/facts.js, schema 1.9) goes on: its view layer when the page shows it;
// without one, optical for a note on a line-system member when the page shows that layer; else physical.
export function noteLayer(note, present, topo = null) {
  const id = PAGE_LAYER_OF[note.layer] ?? note.layer;
  if (id && present.includes(id)) return id;
  if (!id && present.includes('optical') && topo?.plain?.nodes.some((n) => n.id === note.device && n.equipment)) return 'optical';
  return 'physical';
}

// The toggle state after a build: kept for the layers shown, forgotten (visible again) for the others,
// so a layer a later network brings back does not come back hidden.
export function toggleState(visible, present) {
  return Object.fromEntries(LAYERS.map((l) => [l.id, present.includes(l.id) ? visible[l.id] !== false : true]));
}

let shown = presentLayers(null);
export const layerY = (id) => Math.max(0, shown.findIndex((l) => l.id === id)) * LAYER_GAP;
// Gap report layers that share a plane.
const LAYER_ALIAS = { ospf: 'isis', 'mpls-tp': 'mpls' };
export const layerColor = (id) => LAYERS.find((l) => l.id === (LAYER_ALIAS[id] ?? id))?.color ?? 0xffffff;

const RED = 0xff5f56;

export function hex(c) {
  return `#${c.toString(16).padStart(6, '0')}`;
}

function label(text, cls, pos) {
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  return o;
}

// A label of several lines, each in its own colour.
function colourLines(lines, pos) {
  const el = document.createElement('div');
  el.className = 'edge-label';
  for (const l of lines) {
    const line = document.createElement('div');
    line.textContent = l.text;
    line.style.color = hex(l.color);
    el.appendChild(line);
  }
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  return o;
}

function cylinder(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const geo = new THREE.CylinderGeometry(radius, radius, dir.length(), 10, 1, true);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function dashed(points, color, opacity = 1) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity }));
  line.computeLineDistances();
  return line;
}

// A connection over the line system: a rainbow of dashes (src/rainbow.js), one dashed line per colour,
// each starting a dash further along.
function rainbow(points, dash = 0.6) {
  const g = new THREE.Group();
  RAINBOW.forEach((c, k) => {
    const line = dashed(points, new THREE.Color(c).getHex(), 0.95);
    const dist = line.geometry.getAttribute('lineDistance');
    for (let i = 0; i < dist.count; i++) dist.setX(i, dist.getX(i) + (RAINBOW.length - k) * dash);
    line.material.dashSize = dash;
    line.material.gapSize = dash * (RAINBOW.length - 1);
    g.add(line);
  });
  return g;
}

function solid(points, color, opacity = 1) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}

// Lateral offset (in xz) for member i of n on the segment a->b.
export function memberOffset(a, b, i, n, spacing = 0.7) {
  const d = new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
  const perp = new THREE.Vector3(-d.z, 0, d.x);
  return perp.multiplyScalar((i - (n - 1) / 2) * spacing);
}

export class LayerView {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.groups = {};
    this.visible = Object.fromEntries(LAYERS.map((l) => [l.id, true]));
    this.pickables = [];
    this.linkMeshes = {}; // link id -> [materials] for highlighting
    this.labels = { ...DEFAULT_LABELS };
    this.present = shown.map((l) => l.id);
  }

  // Label options (view/labels.js); applied on the next build.
  setLabels(opts) {
    this.labels = { ...DEFAULT_LABELS, ...opts };
  }

  pos(nodeId, layer = 'physical') {
    const n = this.net.topo.nodes.find((x) => x.id === nodeId) ?? this.net.topo.plain?.nodes.find((x) => x.id === nodeId);
    return new THREE.Vector3(n.pos.x, layerY(layer), n.pos.z);
  }

  // Point on link `linkId` (member `memberId` if given) between from and to at t in [0, 1].
  linkPoint(linkId, memberId, from, to, t, layer) {
    const a = this.pos(from, layer);
    const b = this.pos(to, layer);
    const link = this.net.topo.links.find((l) => l.id === linkId);
    const i = memberId ? link.members.findIndex((m) => m.id === memberId) : -1;
    const off = i >= 0 && link.members.length > 1 ? memberOffset(this.pos(link.a.node), this.pos(link.b.node), i, link.members.length) : new THREE.Vector3();
    return new THREE.Vector3().lerpVectors(a, b, t).add(off);
  }

  setVisible(id, v) {
    this.visible[id] = v;
    if (this.groups[id]) this.groups[id].visible = v;
  }

  dispose() {
    this.root.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      if (o.element) o.element.remove();
    });
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
  }

  // `present`: the ids of the layers to show (main.js decides them once per loaded network, so a
  // failure replay does not reshuffle the stack); default, the layers this network has content for.
  // A layer not shown forgets its toggle: it comes back visible when a later network has it.
  build(net, present = null) {
    this.dispose();
    this.net = net;
    this.groups = {};
    this.pickables = [];
    this.linkMeshes = {};
    this.opticalEnds = null;
    const box = planeBox(net.topo);
    this.box = box;

    shown = present ? LAYERS.filter((l) => present.includes(l.id)) : presentLayers(net);
    this.present = shown.map((l) => l.id);
    this.visible = toggleState(this.visible, this.present);
    for (const base of shown) {
      const L = { ...base, y: layerY(base.id) };
      const g = new THREE.Group();
      g.name = L.id;
      g.visible = this.visible[L.id];
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(box.x1 - box.x0, box.z1 - box.z0),
        new THREE.MeshBasicMaterial({ color: L.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }),
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.set((box.x0 + box.x1) / 2, L.y - 0.05, (box.z0 + box.z1) / 2);
      g.add(plane);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry), new THREE.LineBasicMaterial({ color: L.color, transparent: true, opacity: 0.35 }));
      edge.rotation.copy(plane.rotation);
      edge.position.copy(plane.position);
      g.add(edge);
      const lbl = label(L.name, 'layer-label', new THREE.Vector3(box.x0 + (box.x1 - box.x0) * 0.25, L.y, box.z1 + 0.5));
      lbl.element.style.color = hex(L.color);
      g.add(lbl);
      this[`build_${L.id}`](g, net, L);
      this.groups[L.id] = g;
      this.root.add(g);
    }
    this.buildNotes(net);
    // Node pillars tie the layers together.
    const pillarMat = new THREE.LineBasicMaterial({ color: 0x3a4655, transparent: true, opacity: 0.6 });
    const vrfRouters = new Set((net.l3vpn?.vrfs ?? []).flatMap((v) => v.sites.map((s) => s.pe)));
    const vrfHosts = new Set((net.l3vpn?.vrfs ?? []).flatMap((v) => v.sites.flatMap((s) => s.attached.map((a) => a.node))));
    for (const n of net.topo.nodes) {
      const core = ['srv6', 'mpls', 'isis'].find((id) => this.present.includes(id)) ?? 'physical';
      const top = n.role === 'ce' ? (vrfHosts.has(n.id) && this.present.includes('vrf') ? layerY('vrf') : layerY('physical')) : n.role === 'pe' || vrfRouters.has(n.id) ? layerY(shown.at(-1).id) : layerY(core);
      const bottom = this.opticalEnds?.has(n.id) ? layerY('optical') : layerY('physical');
      const pillar = new THREE.Line(new THREE.BufferGeometry().setFromPoints([this.pos(n.id).setY(bottom), this.pos(n.id).setY(top)]), pillarMat);
      this.root.add(pillar);
    }
  }

  // The physical plane (at layerY('physical'): 0, or one gap up when the optical plane is under it).
  build_physical(g, net, L) {
    const Y = L.y;
    const colors = { ce: 0x6e7681, pe: 0x4aa8ff, p: 0x2f81f7 };
    for (const n of net.topo.nodes) {
      const geo = n.role === 'ce' ? new THREE.CylinderGeometry(1.1, 1.1, 1.2, 20) : new THREE.BoxGeometry(2.4, 1.2, 2.4);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[n.role], roughness: 0.5, metalness: 0.2 }));
      mesh.position.copy(this.pos(n.id)).setY(Y + 0.6);
      mesh.userData.node = n.id;
      this.pickables.push(mesh);
      g.add(mesh);
      g.add(label(nodeLabel(n, this.labels), 'node-label', this.pos(n.id).setY(Y - 1.3)));
    }
    for (const l of net.topo.links) {
      const st = net.links[l.id];
      const a = this.pos(l.a.node).setY(Y + 0.6);
      const b = this.pos(l.b.node).setY(Y + 0.6);
      const mats = [];
      l.members.forEach((m, i) => {
        const up = st.members[i].up;
        const off = memberOffset(a, b, i, l.members.length);
        // a link over the line system (`over`), up: a rainbow of dashes, as a connection over it, round a
        // thin faint core that carries the walk's highlight; down, red as any link
        const rides = l.over && up;
        const mat = new THREE.MeshStandardMaterial({ color: up ? (l.medium === 'optical' ? OPTICAL : l.kind === 'access' ? 0x6e7681 : 0x9aa7b8) : RED, transparent: !up || rides, opacity: rides ? 0.3 : up ? 1 : 0.5 });
        mats.push(mat);
        g.add(cylinder(a.clone().add(off), b.clone().add(off), rides ? 0.05 : 0.13, mat));
        if (rides) g.add(rainbow([a.clone().add(off), b.clone().add(off)]));
      });
      this.linkMeshes[l.id] = mats;
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5);
      // A routed link over the line system is captioned as a connection over it (`over ch 25`).
      const caption = l.over ?? l.caption;
      if (caption) g.add(label(caption, `edge-label${l.medium === 'optical' || l.over || !l.caption ? ' optical' : ''}`, mid.clone().setY(Y + 1.4)));
      if (l.lag) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24), new THREE.MeshStandardMaterial({ color: st.up ? 0xf0b429 : RED }));
        ring.position.copy(mid);
        const dir = new THREE.Vector3().subVectors(b, a).normalize();
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        g.add(ring);
        const text = lagLabel(l, st.distributing.length, this.labels);
        if (text) g.add(label(text, 'edge-label', mid.clone().setY(Y + 2)));
      }
    }
    // With an optical plane, the line system is drawn there, not here; here, the routers joined through it
    // (a rainbow of dashes, `over ch N`, the router port at each end). Without one, all of it is drawn here.
    const split = this.present.includes('optical');
    const members = new Set((net.topo.plain?.nodes ?? []).filter((n) => n.equipment).map((n) => n.id));
    const onOptical = (l) => members.has(l.a.node) || members.has(l.b.node) || l.medium === 'optical';
    const plain = net.topo.plain ?? { nodes: [], links: [] };
    this.buildPlain(g, split ? { nodes: plain.nodes.filter((n) => !members.has(n.id)), links: plain.links.filter((l) => !onOptical(l)) } : plain, Y);
    const ls = physicalLineSystem(net);
    for (const l of ls.lightpaths) {
      const a = this.pos(l.a.node).setY(Y + 0.6), b = this.pos(l.b.node).setY(Y + 0.6);
      const off = memberOffset(a, b, l.index, l.count, 1.2);
      g.add(rainbow([a.clone().add(off), b.clone().add(off)]));
      // side by side connections: their captions staggered along the line, apart
      g.add(label(l.over, 'edge-label optical', new THREE.Vector3().lerpVectors(a, b, 0.5 + (l.index - (l.count - 1) / 2) * 0.16).add(off).setY(Y + 1.4)));
    }
    this.buildPorts(g, ls.ports.filter((p) => p.lightpath || !split), Y);
    this.buildSites(g, net, Y);
  }

  // Port labels at the router ends of lines (physicalLineSystem ports), at height Y: a fifth of the way
  // along (at least 2.2 units out, clear of the device box), so a router's ports spread out along its
  // lines rather than stack on it; side by side lines' ports staggered along them.
  buildPorts(g, ports, Y) {
    for (const p of ports) {
      const a = this.pos(p.node).setY(Y + 0.6), b = this.pos(p.toward).setY(Y + 0.6);
      const off = memberOffset(a, b, p.index, p.count, 1.2);
      const t = Math.min(0.45, Math.max(0.2, 2.2 / Math.max(a.distanceTo(b), 0.001))) + p.index * 0.1;
      g.add(label(p.port, 'port-label', new THREE.Vector3().lerpVectors(a, b, t).add(off).setY(Y + 0.9)));
    }
  }

  // The optical plane, under the physical one: the line-system members (schema 1.9 devices[].role), the
  // optical spans and links to them, each router at a span's end as a disc with its name and its port on
  // each cable; the router's pillar starts here.
  build_optical(g, net, L) {
    const Y = L.y;
    const plain = net.topo.plain ?? { nodes: [], links: [] };
    const members = new Set(plain.nodes.filter((n) => n.equipment).map((n) => n.id));
    const onOptical = (l) => members.has(l.a.node) || members.has(l.b.node) || l.medium === 'optical';
    const links = [...plain.links.filter(onOptical), ...net.topo.links.filter((l) => l.medium === 'optical').map((l) => ({ ...l, a: { node: l.a.node, port: l.a.port }, b: { node: l.b.node, port: l.b.port } }))];
    const ends = new Set(links.flatMap((l) => [l.a.node, l.b.node]).filter((id) => !members.has(id)));
    this.opticalEnds = ends;
    for (const id of ends) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.25, 24), new THREE.MeshStandardMaterial({ color: 0x9aa7b8, roughness: 0.6 }));
      disc.position.copy(this.pos(id)).setY(Y + 0.12);
      g.add(disc);
      g.add(label(id, 'node-label', this.pos(id).setY(Y - 1.3)));
    }
    this.buildPlain(g, { nodes: plain.nodes.filter((n) => members.has(n.id)), links }, Y);
    this.buildPorts(g, physicalLineSystem(net).ports.filter((p) => !p.lightpath), Y);
    this.buildSites(g, net, Y);
  }

  // Sites (schema 1.9, import/facts.js annotate): a dashed outline on the physical plane round each
  // site's devices, its name at the front left corner.
  buildSites(g, net, Y = 0) {
    for (const site of net.topo.sites ?? []) {
      const r = siteRect(net.topo, site);
      if (!r) continue;
      const y = Y + 0.03;
      g.add(dashed([[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1], [r.x0, r.z0]].map(([x, z]) => new THREE.Vector3(x, y, z)), SITE, 0.85));
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), new THREE.MeshBasicMaterial({ color: SITE, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }));
      plate.rotation.x = -Math.PI / 2;
      plate.position.set((r.x0 + r.x1) / 2, y - 0.01, (r.z0 + r.z1) / 2);
      g.add(plate);
      g.add(label(site.name, 'site-label', new THREE.Vector3(r.x0 + 1.2, y, r.z1 - 0.6)));
    }
  }

  // Notes (schema 1.9): on their layer (physical when the page does not show it), so they follow its
  // toggle; one on a device above the device, a free one hanging from just in front of the plane's front
  // right corner (style.css: off the devices there).
  buildNotes(net) {
    let free = 0;
    for (const note of net.topo.notes ?? []) {
      const id = noteLayer(note, this.present, net.topo);
      const g = this.groups[id];
      if (!g) continue;
      const at = note.device ? this.pos(note.device, id).setY(layerY(id) + 2.6) : new THREE.Vector3(this.box.x1 - 2, layerY(id), this.box.z1 + 1 + 1.6 * free++);
      g.add(label(note.text, note.device ? 'note-label' : 'note-label free', at));
    }
  }

  // Plain boxes (import/facts.js plainNodes): a device without facts as a dim box with an outline, its
  // name and type, and the file's links[] to it as thin dashed lines. Nothing runs on them, so they
  // have no link state (a failure cannot be set on them). `plain`: the boxes and links to draw at height Y
  // (the physical plane, or the optical plane for a line system). Two OADMs back to back (isExpress) share
  // one label, `A | B`, and their express span is implied, not drawn (as on the 2D frames).
  buildPlain(g, plain, Y) {
    const mates = new Map();
    for (const l of plain.links) if (isExpress(plain, l)) mates.set(l.b.node, l.a.node).set(l.a.node, l.b.node);
    for (const n of plain.nodes) {
      // A line-system member (a role from the extra file, no facts by design): solid, in the optical colour.
      const geo = new THREE.BoxGeometry(2.4, 1.2, 2.4);
      const mesh = new THREE.Mesh(geo, n.equipment
        ? new THREE.MeshStandardMaterial({ color: OPTICAL, roughness: 0.6, metalness: 0.1 })
        : new THREE.MeshStandardMaterial({ color: PLAIN, roughness: 0.8, metalness: 0, transparent: true, opacity: 0.55 }));
      mesh.position.copy(this.pos(n.id)).setY(Y + 0.6);
      mesh.userData.node = n.id;
      this.pickables.push(mesh);
      g.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: PLAIN_EDGE }));
      edges.position.copy(mesh.position);
      g.add(edges);
      const mate = mates.get(n.id);
      // labelled once over the pair, left to right, from its left box
      if (mate && (this.pos(mate).x < this.pos(n.id).x || (this.pos(mate).x === this.pos(n.id).x && mate < n.id))) continue;
      // the pair's names, then what they share once (`ELS-O-1 | ELS-O-2 oadm · ELS-OADM`)
      const [own, other] = [nodeLabel(n, this.labels), mate && nodeLabel(plain.nodes.find((x) => x.id === mate), this.labels)];
      const tail = own.slice(n.id.length);
      const text = !mate ? own : other.slice(mate.length) === tail ? `${n.id} | ${mate}${tail}` : `${own} | ${other}`;
      g.add(label(text, `node-label ${n.equipment ? 'optical' : 'plain'}`, (mate ? this.pos(n.id).lerp(this.pos(mate), 0.5) : this.pos(n.id)).setY(Y - 1.3)));
    }
    // An optical span (links[].kind) as a solid tube in the optical colour with its caption; the rest dashed.
    const key = (l) => [l.a.node, l.b.node].sort().join('|');
    const count = new Map(), seen = new Map();
    const links = plain.links.filter((l) => !isExpress(plain, l));
    for (const l of links) count.set(key(l), (count.get(key(l)) ?? 0) + 1);
    for (const l of links) {
      const a = this.pos(l.a.node).setY(Y + 0.6), b = this.pos(l.b.node).setY(Y + 0.6);
      const i = seen.get(key(l)) ?? 0;
      seen.set(key(l), i + 1);
      const off = memberOffset(a, b, i, count.get(key(l)), 1.2);
      if (l.medium === 'optical') g.add(cylinder(a.clone().add(off), b.clone().add(off), 0.16, new THREE.MeshStandardMaterial({ color: OPTICAL, roughness: 0.4 })));
      else g.add(dashed([a.clone().add(off), b.clone().add(off)], PLAIN_EDGE, 0.9));
      if (l.caption) g.add(label(l.caption, `edge-label${l.medium === 'optical' ? ' optical' : ''}`, new THREE.Vector3().lerpVectors(a, b, 0.5).add(off).setY(Y + 1.4)));
    }
  }

  // One line per ring link at the ring's height (a sub-ring a little above its major ring), a bar
  // across the link where a ring port blocks (the RPL in the idle state, a failed port in
  // protection, a recovered port waiting for R-APS), a failed link in red.
  build_ring(g, net, L) {
    const rings = net.g8032?.rings ?? [];
    rings.forEach((st, k) => {
      const ring = net.topo.rings.find((r) => r.id === st.id);
      const sub = ring.type === 'sub';
      const color = sub ? SUB_RING : L.color;
      const y = L.y + 0.3 + (sub ? 0.7 : 0);
      for (const n of st.nodes) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(sub ? 0.4 : 0.5, 16, 12), new THREE.MeshStandardMaterial({ color }));
        s.position.copy(this.pos(n)).setY(y);
        g.add(s);
      }
      for (const id of ring.links) {
        const l = net.topo.links.find((x) => x.id === id);
        const a = this.pos(l.a.node).setY(y);
        const b = this.pos(l.b.node).setY(y);
        const failed = st.failed.includes(id);
        g.add(failed ? dashed([a, b], RED) : solid([a, b], color));
        for (const blk of st.blocked.filter((x) => x.link === id)) {
          const near = this.pos(blk.node).setY(y);
          const far = blk.node === l.a.node ? b : a;
          const at = new THREE.Vector3().lerpVectors(near, far, 0.2);
          const dir = new THREE.Vector3().subVectors(far, near).normalize();
          const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.25), new THREE.MeshStandardMaterial({ color: blk.why === 'RPL' ? RPL : RED }));
          bar.position.copy(at);
          bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
          g.add(bar);
          const text = blk.why === 'RPL' ? (blk.node === ring.rpl?.owner ? 'RPL owner' : 'RPL') : blk.why === 'SF' ? 'blocked (SF)' : 'blocked (recovered)';
          g.add(label(text, 'edge-label', at.clone().setY(y + 0.7)));
        }
      }
      const anchor = ring.rpl ? net.topo.links.find((x) => x.id === ring.rpl.link) : null;
      const mid = anchor ? new THREE.Vector3().lerpVectors(this.pos(anchor.a.node), this.pos(anchor.b.node), 0.5) : this.pos(st.nodes[0]);
      const title = `${ring.name}${ring.ringId !== null ? ` (ring ${ring.ringId})` : ''} ${sub ? 'sub-ring' : 'major ring'} · R-APS VID ${ring.rapsVid ?? '?'} · ${st.state}`;
      const lbl = label(title, 'edge-label', mid.setY(y + 1.6 + k * 0.8));
      lbl.element.style.color = hex(color);
      g.add(lbl);
    });
  }

  build_isis(g, net, L) {
    const areas = new Set(net.igp.adjacencies.map((a) => a.area));
    for (const r of net.igp.routers) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshStandardMaterial({ color: L.color }));
      s.position.copy(this.pos(r, 'isis'));
      g.add(s);
    }
    for (const a of net.igp.adjacencies) {
      const up = a.state === 'Up';
      const p = [this.pos(a.a, 'isis'), this.pos(a.b, 'isis')];
      g.add(up ? solid(p, L.color) : dashed(p, RED));
      const cost = a.cost && a.cost.a !== a.cost.b ? `${a.cost.a}/${a.cost.b}` : `${a.metric}`;
      const area = a.area && areas.size > 1 ? ` · area ${a.area}` : '';
      g.add(label(`${cost}${area}`, 'edge-label', new THREE.Vector3().lerpVectors(p[0], p[1], 0.5).setY(L.y + 0.6)));
    }
  }

  // A tube along `hops` at height `y`, with an arrow head into the last node.
  tube(g, hops, y, color) {
    const pts = hops.map((h) => this.pos(h).setY(y));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40 * hops.length, 0.09, 6), new THREE.MeshBasicMaterial({ color })));
    const end = pts.at(-1);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 12), new THREE.MeshBasicMaterial({ color }));
    cone.position.copy(end);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, curve.getPoint(0.97)).normalize());
    g.add(cone);
  }

  // Every label-switching router: a marker with its node SID label (SR-MPLS: SRGB base + index) or its
  // label table's size (LDP); the full table is in the device panel.
  mplsNodes(g, net, L) {
    for (const id of mplsRouters(net)) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), new THREE.MeshStandardMaterial({ color: L.color }));
      m.position.copy(this.pos(id, 'mpls'));
      g.add(m);
      const n = Object.keys(net.mpls.lfib[id]).length;
      const text = net.mpls.mode === 'sr' ? `node SID ${prefixSidLabel(net.topo, net.vendor, id)} · ${n} labels` : `LDP · ${n} labels`;
      g.add(label(text, 'edge-label', this.pos(id, 'mpls').setY(L.y - 0.9)));
    }
  }

  build_mpls(g, net, L) {
    this.mplsNodes(g, net, L);
    // Static MPLS-TP tunnels: the forward LSP and, just above it, the reverse
    // LSP on the same hops, with the label on each hop.
    let base = 0;
    for (const t of net.tp.tunnels) {
      const up = t.state === 'Up';
      for (const [dir, hops] of [['fwd', t.path], ['rev', [...t.path].reverse()]]) {
        const lift = L.y + 0.5 + base;
        const color = !up ? RED : t.role === 'backup' ? 0x9e6a03 : dir === 'fwd' ? L.color : 0xf2cc60;
        this.tube(g, hops, lift, color);
        for (let i = 0; i + 1 < hops.length; i++) {
          const h = t.hops.find((x) => x.node === hops[i]);
          const lbl = dir === 'fwd' ? h.fwdOut : h.revOut;
          const mid = new THREE.Vector3().lerpVectors(this.pos(hops[i], 'mpls'), this.pos(hops[i + 1], 'mpls'), dir === 'fwd' ? 0.38 : 0.62).setY(lift + 0.5);
          g.add(label(String(lbl), 'edge-label', mid));
        }
        base += 0.9;
      }
      g.add(label(`${t.id}${t.role === 'backup' ? ' (backup)' : ''} ${t.state}${t.oam ? ` · ${t.oam.kind.toUpperCase()}` : ''}`, 'edge-label', this.pos(t.src).setY(L.y + base)));
    }
    // Configured SR policies (RFC 9256) are the LSPs worth showing when there are any.
    if (net.sr.policies.length) {
      net.sr.policies.forEach((p, k) => {
        const lift = L.y + 0.5 + base + k * 1.1;
        const color = p.valid ? (k % 2 ? 0xf2cc60 : L.color) : RED;
        const hops = p.valid ? p.path : [p.headend, p.endpointNode ?? p.headend];
        if (hops.length > 1) this.tube(g, hops, lift, color);
        const at = this.pos(p.headend).setY(lift + 0.6);
        g.add(label(`${p.name} [${p.segmentList.sids.join(' ')}]${p.valid ? '' : ' INVALID'}`, 'edge-label', at));
      });
      return;
    }
    // Otherwise one LSP per (ingress, egress) transport endpoint along FTN/LFIB next hops.
    transportLsps(net).forEach(({ hops, labels }, k) => {
      const lift = 0.5 + base + k * 1.2;
      const color = k % 2 ? 0xf2cc60 : L.color;
      this.tube(g, hops, L.y + lift, color);
      for (const s of labels) {
        const at = k % 2 ? 0.62 : 0.38; // keep the two directions' labels apart
        const mid = new THREE.Vector3().lerpVectors(this.pos(s.from, 'mpls'), this.pos(s.to, 'mpls'), at).setY(L.y + lift + 0.5);
        g.add(label(s.label === 3 ? 'imp-null' : String(s.label), 'edge-label', mid));
      }
    });
  }

  build_bgp(g, net, L) {
    for (const pe of net.bgp.speakers) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshStandardMaterial({ color: L.color }));
      s.position.copy(this.pos(pe, 'bgp'));
      g.add(s);
    }
    for (const s of net.bgp.sessions) {
      const a = this.pos(s.a, 'bgp');
      const b = this.pos(s.b, 'bgp');
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 4);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(40);
      g.add(s.state === 'Established' ? solid(pts, L.color) : dashed(pts, RED));
      const text = bgpLabel(s, this.labels, Boolean(net.topo.bgp?.sessions));
      if (text) g.add(label(text, 'edge-label', mid.clone().setY(L.y + 2.4)));
    }
  }

  build_pw(g, net, L) {
    net.vpws.pseudowires.forEach((pw, k) => {
      const [a, b] = pw.ends.map((e) => this.pos(e.node, 'pw'));
      const up = pw.state === 'Up';
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 3 + k * 1.2);
      g.add((up ? solid : dashed)(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(40), up ? L.color : RED));
      for (const e of pw.ends) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: L.color }));
        s.position.copy(this.pos(e.node, 'pw'));
        g.add(s);
      }
      const via = [...new Set(pw.ends.map((e) => e.transport.tunnel ?? e.transport.policy ?? e.underlay))].join(' / ');
      g.add(label(`${pw.service} PW ${pw.pwid} ${pw.state} · ${via}`, 'edge-label', mid.clone().setY(mid.y - 0.8)));
    });
  }

  // SRv6 / Flex-Algo: each router's locators in a label (algorithm in brackets); algorithm 0's
  // topology (the IGP's links) in the layer colour; each Flex-Algo's topology above it in its own
  // colour, its routers as small spheres, its definition (winner, metric type, constraints) in a
  // label at the router that advertises it.
  build_srv6(g, net, L) {
    const { locators, algorithms } = net.srv6;
    const routers = net.igp.routers;
    for (const r of routers) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshStandardMaterial({ color: L.color }));
      s.position.copy(this.pos(r, 'srv6'));
      g.add(s);
      const mine = locators.filter((l) => l.node === r);
      if (mine.length) {
        const text = mine.map((l) => `${l.name} ${l.prefix}${l.algorithm ? ` [${l.algorithm}]` : ''}`).join('\n');
        const lbl = label(text, 'edge-label locator-label', this.pos(r, 'srv6').setY(L.y - 1.1));
        g.add(lbl);
      }
    }
    algorithms.forEach((a, k) => {
      const y = L.y + 0.05 + k * 0.7;
      const color = k === 0 ? L.color : ALGO_COLORS[(k - 1) % ALGO_COLORS.length];
      for (const id of a.links) {
        const link = net.topo.links.find((x) => x.id === id);
        g.add(solid([this.pos(link.a.node).setY(y), this.pos(link.b.node).setY(y)], color, k === 0 ? 0.6 : 1));
      }
      if (k === 0) return;
      for (const r of a.participants) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), new THREE.MeshStandardMaterial({ color }));
        s.position.copy(this.pos(r)).setY(y);
        g.add(s);
      }
      const d = a.definition;
      const ag = d?.adminGroups ?? {};
      const excl = (ag.excludeAny ?? []).length ? ` · excl ${ag.excludeAny.join(',')}` : '';
      const text = d ? `Flex-Algo ${a.algorithm} · ${d.metricType}${excl} · FAD ${d.node}${d.priority !== null ? ` prio ${d.priority}` : ''}` : `Flex-Algo ${a.algorithm} · no definition advertised`;
      const at = this.pos(d?.node ?? a.participants[0] ?? routers[0]).setY(y + 1.2 + (k - 1) * 0.6);
      const lbl = label(text, 'edge-label', at);
      lbl.element.style.color = hex(color);
      g.add(lbl);
    });
  }

  // EVPN instances: an arc between each pair of members (one for a VPWS), dashed red when the
  // instance is down, with the EVI, the service type, the VPWS service ids and the SRv6 locator.
  build_evpn(g, net, L) {
    net.evpn.instances.forEach((inst, k) => {
      const up = inst.state === 'Up';
      const nodes = inst.members.map((m) => m.node);
      let mid = null;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const [a, b] = [this.pos(nodes[i], 'evpn'), this.pos(nodes[j], 'evpn')];
          const m = new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 3 + k * 1.2);
          mid ??= m;
          g.add((up ? solid : dashed)(new THREE.QuadraticBezierCurve3(a, m, b).getPoints(40), up ? L.color : RED));
        }
      }
      for (const n of nodes) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: L.color }));
        s.position.copy(this.pos(n, 'evpn'));
        g.add(s);
      }
      const locs = [...new Set(inst.members.map((m) => m.srv6Locator).filter(Boolean))].join('/');
      const ids = inst.type === 'vpws' ? ` ${inst.members.map((m) => m.localServiceId ?? '-').join('↔')}` : '';
      const text = `EVI ${inst.evi} ${(inst.type ?? '?').toUpperCase()}${ids}${locs ? ` · ${locs}` : ''} · ${inst.state}`;
      g.add(label(text, 'edge-label', (mid ?? this.pos(nodes[0], 'evpn')).clone().setY((mid?.y ?? L.y) - 0.8)));
    });
  }

  // VRFs / L3VPN: per VRF (its own colour) a ring around each PE that has it with the RD and the
  // transport, an arc between each pair of PEs whose routes cross (solid both ways, dashed one way
  // only, dashed red when neither gets the other's), and a line from the PE to each host or CE on
  // the VRF's interfaces.
  build_vrf(g, net, L) {
    const perPe = new Map(); // PE -> [{ text, color }]: one label per PE, a line per VRF
    net.l3vpn.vrfs.forEach((v, k) => {
      const color = VRF_COLORS[k % VRF_COLORS.length];
      const mat = new THREE.MeshStandardMaterial({ color });
      for (const site of v.sites) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5 + k * 0.4, 0.09, 8, 32), mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(this.pos(site.pe, 'vrf'));
        g.add(ring);
        const tr = Object.values(site.transport);
        const how = !tr.length ? 'no VPN family' : tr.every((t) => t.kind === 'srv6') ? `SRv6 ${[...new Set(tr.map((t) => t.locator))].join('/')}` : tr.every((t) => t.kind === 'mpls') ? `MPLS ${[...new Set(tr.map((t) => t.allocation))].join('/')}` : 'SRv6 + MPLS';
        if (!perPe.has(site.pe)) perPe.set(site.pe, []);
        perPe.get(site.pe).push({ text: `${v.name} ${site.rd ?? ''} · ${how}`, color });
        for (const a of site.attached) {
          const [p, h] = [this.pos(site.pe, 'vrf'), this.pos(a.node, 'vrf')];
          g.add(dashed([p, h], color, 0.9));
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), mat);
          dot.position.copy(h);
          g.add(dot);
        }
      }
      const pes = [...new Set(v.sites.map((s) => s.pe))];
      for (let i = 0; i < pes.length; i++) {
        for (let j = i + 1; j < pes.length; j++) {
          const between = v.pairs.filter((p) => [p.from, p.to].includes(pes[i]) && [p.from, p.to].includes(pes[j]));
          if (!between.length) continue;
          const ways = [pes[i], pes[j]].filter((to) => between.some((p) => p.to === to && p.ok)).length;
          const both = between.every((p) => p.ok) && ways === 2;
          const [a, b] = [this.pos(pes[i], 'vrf'), this.pos(pes[j], 'vrf')];
          const m = new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 2.5 + k * 1.2);
          const pts = new THREE.QuadraticBezierCurve3(a, m, b).getPoints(40);
          g.add(both ? solid(pts, color) : dashed(pts, ways ? color : RED));
        }
      }
    });
    for (const [pe, lines] of perPe) g.add(colourLines(lines, this.pos(pe, 'vrf').setY(L.y - 1.2)));
    // The VRFs and their state, as a legend in the plane's near corner.
    const legend = net.l3vpn.vrfs.map((v, k) => ({ text: `${v.name}${v.role === 'management' ? ' (management)' : ''} · ${v.state}`, color: v.state === 'Down' ? RED : VRF_COLORS[k % VRF_COLORS.length] }));
    g.add(colourLines(legend, new THREE.Vector3(this.box.x1 - 2, L.y, this.box.z1 - 1)));
  }

  build_cfm(g, net, L) {
    for (const meg of net.cfm.megs.filter((m) => m.pseudowire)) {
      const [a, b] = meg.meps.map((m) => this.pos(m.node, 'cfm'));
      const defect = meg.meps.some((m) => m.defect);
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 3);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      g.add(dashed(curve.getPoints(40), defect ? RED : L.color, 0.9));
      for (const [mep, t] of [[meg.meps[0], 0.1], [meg.meps[1], 0.9]]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 12), new THREE.MeshStandardMaterial({ color: mep.defect ? RED : L.color }));
        cone.position.copy(curve.getPoint(t));
        g.add(cone); // Up MEP: points up, into the service
        g.add(label(`MEP ${mep.mepId}`, 'edge-label', curve.getPoint(t).setY(curve.getPoint(t).y + 0.9)));
      }
      g.add(label(`${meg.id} MD${meg.level} ${meg.intervalMs >= 1000 ? `${meg.intervalMs / 1000} s` : `${meg.intervalMs} ms`}${defect ? ' DEFECT' : ''}`, 'edge-label', mid.clone().setY(mid.y - 0.8)));
    }
    for (const meg of net.cfm.megs.filter((m) => !m.pseudowire)) {
      const link = net.topo.links.find((l) => l.id === meg.link);
      const a = this.pos(link.a.node, 'cfm');
      const b = this.pos(link.b.node, 'cfm');
      const defect = meg.meps.some((m) => m.defect);
      g.add(dashed([a, b], defect ? RED : L.color, 0.9));
      for (const [mep, at, to] of [[meg.meps[0], a, b], [meg.meps[1], b, a]]) {
        const p = new THREE.Vector3().lerpVectors(at, to, 0.18);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 12), new THREE.MeshStandardMaterial({ color: mep.defect ? RED : L.color }));
        cone.position.copy(p);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(to, at).normalize());
        g.add(cone);
      }
      g.add(label(`MD${meg.level} ${meg.intervalMs} ms${defect ? ' DEFECT' : ''}`, 'edge-label', new THREE.Vector3().lerpVectors(a, b, 0.5).setY(L.y + 0.6)));
    }
  }

  // Highlight links (emissive) for the current step.
  highlight(linkIds = []) {
    for (const [id, mats] of Object.entries(this.linkMeshes)) {
      for (const m of mats) m.emissive?.setHex(linkIds.includes(id) ? 0x7a2a00 : 0x000000);
    }
  }
}
