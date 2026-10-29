// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// Builds the stacked protocol layers for a network (engine/network.js) as
// Three.js groups: one translucent plane per layer over the same node positions.

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const LAYERS = [
  { id: 'physical', name: 'Physical / LAG', y: 0, color: 0x8b98a8 },
  { id: 'isis', name: 'IGP (IS-IS / OSPF)', y: 6, color: 0x3fb950 },
  { id: 'mpls', name: 'MPLS: SR policies / LSPs', y: 12, color: 0xd29922 },
  { id: 'bgp', name: 'BGP', y: 18, color: 0xa371f7 },
  { id: 'pw', name: 'Pseudowires (VPWS)', y: 24, color: 0xf778ba },
  { id: 'cfm', name: 'CFM MEG', y: 30, color: 0x39c5cf },
];
export const layerY = (id) => LAYERS.find((l) => l.id === id)?.y ?? 0;
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
  }

  pos(nodeId, layer = 'physical') {
    const n = this.net.topo.nodes.find((x) => x.id === nodeId);
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

  build(net) {
    this.dispose();
    this.net = net;
    this.groups = {};
    this.pickables = [];
    this.linkMeshes = {};
    const xs = net.topo.nodes.map((n) => n.pos.x);
    const zs = net.topo.nodes.map((n) => n.pos.z);
    const box = { x0: Math.min(...xs) - 6, x1: Math.max(...xs) + 6, z0: Math.min(...zs) - 6, z1: Math.max(...zs) + 6 };
    this.box = box;

    for (const L of LAYERS) {
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
    // Node pillars tie the layers together.
    const pillarMat = new THREE.LineBasicMaterial({ color: 0x3a4655, transparent: true, opacity: 0.6 });
    for (const n of net.topo.nodes) {
      const top = n.role === 'ce' ? 0 : n.role === 'pe' ? LAYERS.at(-1).y : layerY('mpls');
      const pillar = new THREE.Line(new THREE.BufferGeometry().setFromPoints([this.pos(n.id), this.pos(n.id).setY(top)]), pillarMat);
      this.root.add(pillar);
    }
  }

  build_physical(g, net) {
    const colors = { ce: 0x6e7681, pe: 0x4aa8ff, p: 0x2f81f7 };
    for (const n of net.topo.nodes) {
      const geo = n.role === 'ce' ? new THREE.CylinderGeometry(1.1, 1.1, 1.2, 20) : new THREE.BoxGeometry(2.4, 1.2, 2.4);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[n.role], roughness: 0.5, metalness: 0.2 }));
      mesh.position.copy(this.pos(n.id)).setY(0.6);
      mesh.userData.node = n.id;
      this.pickables.push(mesh);
      g.add(mesh);
      const sub = n.loopback ? ` ${n.loopback}` : n.lan ? ` ${n.lan}` : '';
      g.add(label(`${n.id}${sub}`, 'node-label', this.pos(n.id).setY(-1.3)));
    }
    for (const l of net.topo.links) {
      const st = net.links[l.id];
      const a = this.pos(l.a.node).setY(0.6);
      const b = this.pos(l.b.node).setY(0.6);
      const mats = [];
      l.members.forEach((m, i) => {
        const up = st.members[i].up;
        const off = memberOffset(a, b, i, l.members.length);
        const mat = new THREE.MeshStandardMaterial({ color: up ? (l.kind === 'access' ? 0x6e7681 : 0x9aa7b8) : RED, transparent: !up, opacity: up ? 1 : 0.5 });
        mats.push(mat);
        g.add(cylinder(a.clone().add(off), b.clone().add(off), 0.13, mat));
      });
      this.linkMeshes[l.id] = mats;
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5);
      if (l.lag) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24), new THREE.MeshStandardMaterial({ color: st.up ? 0xf0b429 : RED }));
        ring.position.copy(mid);
        const dir = new THREE.Vector3().subVectors(b, a).normalize();
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        g.add(ring);
        g.add(label(`${l.a.if} LAG ${st.distributing.length}/${l.members.length}`, 'edge-label', mid.clone().setY(2)));
      }
    }
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

  build_mpls(g, net, L) {
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
    // Otherwise one LSP per (ingress PE, egress PE) along FTN/LFIB next hops.
    const pes = net.topo.nodes.filter((n) => n.role === 'pe').map((n) => n.id);
    let k = 0;
    for (const src of pes) {
      for (const dst of pes) {
        if (src === dst) continue;
        const fec = `${net.topo.nodes.find((n) => n.id === dst).loopback}/32`;
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
        if (hops.at(-1) !== dst) continue;
        const lift = 0.5 + base + k * 1.2;
        const color = k % 2 ? 0xf2cc60 : L.color;
        this.tube(g, hops, L.y + lift, color);
        for (const s of labels) {
          const at = k % 2 ? 0.62 : 0.38; // keep the two directions' labels apart
          const mid = new THREE.Vector3().lerpVectors(this.pos(s.from, 'mpls'), this.pos(s.to, 'mpls'), at).setY(L.y + lift + 0.5);
          g.add(label(s.label === 3 ? 'imp-null' : String(s.label), 'edge-label', mid));
        }
        k++;
      }
    }
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
      const kind = net.topo.bgp?.sessions ? (s.client ? `RR client ${s.client}` : '') : 'VPNv4';
      g.add(label(`iBGP ${s.state}${kind ? ` · ${kind}` : ''}`, 'edge-label', mid.clone().setY(L.y + 2.4)));
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
