// SPDX-License-Identifier: Apache-2.0
// The exploded snapshot: the 3D view's stacked planes as one static SVG, no WebGL. One plane per
// layer the lab has content for (and the view shows), bottom to top in the view's layer order; each
// device, link, ring, pseudowire, MEG... is an object on its plane with two or three short labels,
// the same device straight above itself on every plane (a dotted riser ties it together). Chips
// in the SVG switch planes off and on, and the planes above close the gap; hover titles carry the
// full properties. A small inline script does the switching, so the file works inline in a page, in
// <object> or <iframe>; as an <img> it is a still of every plane. No external script or font.
//
// Variants (view snapshot.variant):
//   exploded  planes one plane-depth apart, nothing overlaps (default)
//   stacked   planes overlapping like the 3D page's camera: compact

import { LAYER_IDS } from '../../../js/src/index.ts';
import { deviceDetail, equipmentTag, layerModel, noteLayerOf, presentLayers, wrapNote } from './model.js';

const C = {
  ink: '#1d2430', mute: '#5b6675', bg: '#ffffff',
  p: '#1f5fa8', pe: '#c8202f', ce: '#4b7f52', l2: '#6a5acd', host: '#3d7f8f', plain: '#8a94a3',
  physical: '#8b98a8', ring: '#d29a1e', igp: '#2e9e5b', mpls: '#b7791f', srv6: '#e8590c', bgp: '#7d4cc2', vrf: '#5b5fc7',
  pw: '#d63384', evpn: '#a65fd6', cfm: '#1a9fae', rpl: '#f0883e', subRing: '#4f9fe8',
  optical: '#3b5bdb', site: '#7a8696', note: '#fff6d5', noteEdge: '#d9a400',
};
const LAYER_NAME = { optical: 'Optical line system', physical: 'Physical', ring: 'G.8032 rings', igp: 'IGP', mpls: 'MPLS (SR policies / TP)', srv6: 'SRv6', bgp: 'BGP', vrf: 'L3VPN', pw: 'Pseudowires', evpn: 'EVPN', cfm: 'CFM' };
const ALGO = ['#e8590c', '#1c7ed6', '#2f9e44', '#c2255c'];
const CAMERAS = {
  exploded: { U: 230, V: 170, kx: 0.62, ky: 0.42, gapFactor: 1.0, gapPad: 46 },
  stacked: { U: 210, V: 160, kx: 0.62, ky: 0.42, gapFactor: 0.42, gapPad: 0 },
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (v) => Math.round(v * 10) / 10;

// The planes a snapshot draws: the present layers the view shows (physical always), bottom first. The
// role layer is a frame only: the snapshot's physical plane colours its devices by role already.
export function snapshotLayers(model, viewLayers = LAYER_IDS) {
  const present = new Set(presentLayers(model).filter((id) => id !== 'role'));
  return LAYER_IDS.filter((id) => present.has(id) && (id === 'physical' || viewLayers.includes(id)));
}

export function renderSnapshot(model, positions, { variant = 'exploded', layers: viewLayers = LAYER_IDS, title = null, method = null } = {}) {
  const cam = CAMERAS[variant] ?? CAMERAS.exploded;
  const layers = snapshotLayers(model, viewLayers);
  const P = positions;
  const xs = Object.values(P).map((p) => p.x), ys = Object.values(P).map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  // Plane coordinates (u right, v into the screen), margin around the devices.
  const mu = 0.75 * cam.U, mv = 0.55 * cam.V;
  const uv = (id) => ({ u: (P[id].x - minX) * cam.U + mu, v: (P[id].y - minY) * cam.V + mv });
  const planeU = (maxX - minX) * cam.U + 2 * mu, planeV = (maxY - minY) * cam.V + 2 * mv;
  // Screen: x = u + v*kx, y = v*ky (the plane), minus the layer's height.
  const planeH = planeV * cam.ky;
  const gap = Math.round(planeH * cam.gapFactor + cam.gapPad);
  const left = 40, top = 96;
  const W = Math.ceil(left + planeU + planeV * cam.kx + 60);
  const n = layers.length;
  const baseY = top + (n - 1) * gap; // the physical plane's back edge
  const H = Math.ceil(baseY + planeH + 70);
  const S = (u, v) => ({ x: r1(left + u + v * cam.kx), y: r1(baseY + v * cam.ky) });
  const at = (id) => { const q = uv(id); return S(q.u, q.v); };

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" class="netfacts-snapshot" data-variant="${variant}" data-gap="${gap}" data-full-h="${H}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">`);
  out.push(`<title>${esc(title ?? model.name)}</title>`);
  out.push(`<rect class="bg" x="0" y="-4000" width="${W}" height="${H + 8000}" fill="${C.bg}"/>`);

  // Risers: one per device from the physical plane up to the highest plane it is on.
  // With an optical plane, line-system members are on it alone (no riser) and the routers at the ends of
  // its spans rise from it.
  const split = layers.includes('optical');
  const optical = layerModel(model, 'optical', split);
  const onLayer = new Map(model.nodes.filter((nd) => !(split && nd.member)).map((nd) => [nd.id, new Set(['physical'])]));
  const mark = (id, l) => onLayer.get(id)?.add(l);
  if (split) for (const nd of optical.nodes) mark(nd.id, 'optical');
  for (const r of model.rings) for (const id of r.nodes) mark(id, 'ring');
  for (const l of model.links) if (l.adj) (mark(l.a.node, 'igp'), mark(l.b.node, 'igp'));
  for (const t of [...model.policies, ...model.tunnels]) for (const id of [t.a, t.b, ...(t.path ?? [])]) if (id) mark(id, 'mpls');
  for (const nd of model.nodes) if (nd.locators.length) mark(nd.id, 'srv6');
  for (const s of model.bgp) (mark(s.a, 'bgp'), mark(s.b, 'bgp'));
  for (const v of model.vrfs) for (const id of v.pes) mark(id, 'vrf');
  for (const pw of model.pws) for (const id of [pw.a, pw.b, ...(pw.path ?? [])]) mark(id, 'pw');
  for (const e of model.evpn) for (const id of e.members) mark(id, 'evpn');
  for (const m of model.megs) (mark(m.a, 'cfm'), mark(m.b, 'cfm'));
  out.push('<g class="pillars">');
  for (const nd of model.nodes) {
    if (!onLayer.has(nd.id)) continue;
    const p = at(nd.id);
    out.push(`<line class="pillar" data-layers="${[...onLayer.get(nd.id)].filter((l) => layers.includes(l)).join(' ')}" x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y}" stroke="#7f8a99" stroke-width="1.2" stroke-dasharray="2 3" stroke-opacity="0.8"/>`);
  }
  out.push('</g>');

  // Planes, top first so the lower ones paint over the upper ones' overhang.
  const groups = [];
  layers.forEach((id, k) => {
    const g = [];
    const col = C[id];
    const corners = [S(0, 0), S(planeU, 0), S(planeU, planeV), S(0, planeV)];
    g.push(`<polygon points="${corners.map((c) => `${c.x},${c.y}`).join(' ')}" fill="${col}" fill-opacity="0.07" stroke="${col}" stroke-opacity="0.55" stroke-width="1.2"/>`);
    const fl = S(0, planeV);
    g.push(`<text x="${fl.x + 8}" y="${fl.y - 8}" font-size="12" font-weight="700" fill="${col}">${esc(LAYER_NAME[id])}</text>`);
    const sub = planeCaption(id, model);
    if (sub) g.push(`<text x="${fl.x + 8}" y="${fl.y + 14}" font-size="10.5" fill="${C.mute}">${esc(sub)}</text>`);
    g.push(...layerObjects(id, layerModel(model, id, split), at, S, cam, { uv, layers, planeU, planeV, full: model }));
    groups.push(`<g class="layer" data-layer="${id}" transform="translate(0,${-k * gap})">${g.join('')}</g>`);
  });
  out.push(...groups.reverse());

  // Header: title, counts, layer chips (click or Enter to switch a plane).
  const counts = [`${model.nodes.length} devices`, `${model.links.length} links`, model.rings.length && `${model.rings.length} rings`, model.pws.length && `${model.pws.length} PW`, model.megs.length && `${model.megs.length} MEG`].filter(Boolean).join(' · ');
  out.push('<g class="hud">');
  out.push(`<text x="${left}" y="30" font-size="17" font-weight="700" fill="${C.ink}">${esc(title ?? model.name)}</text>`);
  out.push(`<text x="${left}" y="48" font-size="11" fill="${C.mute}">${esc(counts)}${method ? ` · layout: ${esc(method)}` : ''}</text>`);
  let cx = left;
  for (const id of layers) {
    const w = LAYER_NAME[id].length * 6.6 + 30;
    out.push(`<g class="chip" data-layer="${id}" role="button" tabindex="0" aria-pressed="true" style="cursor:pointer"><title>${id === 'physical' ? 'Physical (always shown)' : `Show or hide ${LAYER_NAME[id]}`}</title><rect x="${cx}" y="58" width="${w}" height="22" rx="11" fill="${C[id]}" fill-opacity="0.14" stroke="${C[id]}"/><circle class="dot" cx="${cx + 12}" cy="69" r="4.5" fill="${C[id]}"/><text x="${cx + 22}" y="73" font-size="11" fill="${C.ink}">${esc(LAYER_NAME[id])}</text></g>`);
    cx += w + 8;
  }
  out.push('</g>');
  out.push(`<script><![CDATA[${SWITCH_SCRIPT}]]></script>`);
  out.push('</svg>');
  return { svg: `${out.join('\n')}\n`, layers, width: W, height: H };
}

function planeCaption(id, model) {
  if (id === 'igp' && model.areas.length) {
    const lvl = model.nodes.find((n) => n.isis)?.isis?.level ?? '';
    return `${model.igp === 'ospf' ? 'OSPF' : 'IS-IS'} area ${model.areas.join(', ')} ${lvl}${model.srgb ? ` · SRGB ${model.srgb.base}–${model.srgb.base + model.srgb.size - 1}` : ''} · labels ${model.labelMode.toUpperCase()}`;
  }
  if (id === 'igp') return model.igp === 'ospf' ? 'OSPF' : 'IS-IS';
  if (id === 'optical') {
    const members = model.nodes.filter((n) => n.member).length;
    return `${members} line-system member${members === 1 ? '' : 's'} · ${model.links.filter((l) => l.medium === 'optical').length} optical spans`;
  }
  if (id === 'bgp') {
    const asn = model.nodes.find((n) => n.asn)?.asn;
    return asn ? `AS ${asn}` : '';
  }
  if (id === 'ring') return model.rings.map((r) => `${r.name} (${r.type}${r.vid != null ? `, R-APS VID ${r.vid}` : ''}, ${r.state})`).join(' · ');
  if (id === 'srv6' && model.algorithms.length) return `Flex-Algo ${model.algorithms.map((a) => a.algorithm).join(', ')}`;
  return '';
}

// A label block: first line bold, the rest small; anchored at (x, y) going up.
function block(reg, x, y, lines, { anchor = 'start', color = C.ink, bg = true, fill = '#fff', stroke = null, bold = true } = {}) {
  const h = 13;
  const w = Math.max(...lines.map((l, i) => l.length * (i === 0 && bold ? 7 : 5.9))) + 10;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let y0 = y - lines.length * h - 2;
  const hh = lines.length * h + 5;
  // Off every label already on this plane: step up until clear.
  const base = y0;
  const hit = (yy) => reg.some((b) => x0 < b.x + b.w + 2 && b.x < x0 + w + 2 && yy < b.y + b.h + 2 && b.y < yy + hh + 2);
  for (let i = 1; i < 24 && hit(y0); i++) y0 = base + Math.ceil(i / 2) * (hh * 0.6) * (i % 2 ? -1 : 1);
  if (hit(y0)) y0 = base;
  reg.push({ x: x0, y: y0, w, h: hh });
  const out = [];
  if (bg) out.push(`<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(w)}" height="${lines.length * h + 5}" rx="4" fill="${fill}" fill-opacity="${stroke ? 0.95 : 0.88}"${stroke ? ` stroke="${stroke}"` : ''}/>`);
  lines.forEach((l, i) => out.push(`<text x="${r1(x0 + 5)}" y="${r1(y0 + 11 + i * h)}" font-size="${i === 0 && bold ? 12 : 10.5}"${i === 0 && bold ? ' font-weight="700"' : ''} fill="${i === 0 && bold ? color : bold ? C.mute : C.ink}">${esc(l)}</text>`));
  return out.join('');
}

function layerObjects(id, model, at, S, cam, { uv, layers, planeU, planeV, full }) {
  const g = [];
  const reg = [];
  const nodes = new Map(model.nodes.map((n) => [n.id, n]));
  const line = (a, b, color, w, extra = '') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${w}"${extra}/>`;
  const lerp = (a, b, t) => ({ x: r1(a.x + (b.x - a.x) * t), y: r1(a.y + (b.y - a.y) * t) });
  const pill = (p, text, color) => {
    const w = String(text).length * 5.8 + 8;
    return `<rect x="${r1(p.x - w / 2)}" y="${r1(p.y - 7)}" width="${r1(w)}" height="14" rx="7" fill="#fff" stroke="${color}"/><text x="${p.x}" y="${r1(p.y + 3.5)}" font-size="9.5" text-anchor="middle" fill="${C.ink}">${esc(text)}</text>`;
  };
  const arc = (a, b, lift, color, dash) => {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - lift };
    const apex = { x: r1((a.x + 2 * m.x + b.x) / 4), y: r1((a.y + 2 * m.y + b.y) / 4) };
    return { path: `<path d="M${a.x},${a.y} Q${r1(m.x)},${r1(m.y)} ${b.x},${b.y}" fill="none" stroke="${color}" stroke-width="2.4"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`, apex };
  };
  const title = (t) => `<title>${esc(t)}</title>`;

  // The physical plane, and the optical plane (the line system and the routers at its ends) drawn alike.
  if (id === 'physical' || id === 'optical') {
    // Sites (schema 1.9): a dashed outline on the plane round each site's devices, its name at the front.
    for (const site of model.sites) {
      const q = site.nodes.map(uv);
      const u0 = Math.min(...q.map((x) => x.u)) - 62, u1 = Math.max(...q.map((x) => x.u)) + 62;
      const v0 = Math.min(...q.map((x) => x.v)) - 46, v1 = Math.max(...q.map((x) => x.v)) + 40;
      const pts = [S(u0, v0), S(u1, v0), S(u1, v1), S(u0, v1)];
      const nameAt = S(u0 + 8, v1 - 6);
      g.push(`<g class="site">${title(`site ${site.name}: ${site.nodes.join(', ')}`)}<polygon points="${pts.map((c) => `${c.x},${c.y}`).join(' ')}" fill="${C.site}" fill-opacity="0.08" stroke="${C.site}" stroke-width="1.3" stroke-dasharray="6 4"/><text x="${nameAt.x}" y="${nameAt.y}" font-size="11.5" font-weight="700" fill="${C.site}">${esc(site.name)}</text></g>`);
    }
    const pairN = new Map(), pairI = new Map();
    const pk = (l) => [l.a.node, l.b.node].sort().join('|');
    for (const l of model.links) pairN.set(pk(l), (pairN.get(pk(l)) ?? 0) + 1);
    for (const l of model.links) {
      const i = pairI.get(pk(l)) ?? 0;
      pairI.set(pk(l), i + 1);
      const a0 = at(l.a.node), b0 = at(l.b.node);
      const d = Math.hypot(b0.x - a0.x, b0.y - a0.y) || 1;
      const off = (i - (pairN.get(pk(l)) - 1) / 2) * 12;
      const nx = (-(b0.y - a0.y) / d) * off, ny = ((b0.x - a0.x) / d) * off;
      const a = { x: r1(a0.x + nx), y: r1(a0.y + ny) }, b = { x: r1(b0.x + nx), y: r1(b0.y + ny) };
      const optical = l.medium === 'optical';
      // A routed link over the line system says so (`over ch 25`) where it has no label of its own.
      const caption = l.caption ?? l.over;
      const tip = `${l.a.node} ${l.a.port} — ${l.b.node} ${l.b.port}${l.medium || l.caption ? `\n${[l.medium, l.caption].filter(Boolean).join(': ')}` : ''}${l.over ? `\n${l.over}` : ''}${l.subnet ? `\n${l.subnet}` : ''}${l.plain && !optical ? '\ncabled (links[]), no facts on one end' : ''}`;
      // An optical span: a blue double line (white core), its caption in the middle.
      const body = optical ? `${line(a, b, C.optical, 5, ' stroke-linecap="round"')}${line(a, b, '#fff', 1.6, ' stroke-linecap="round"')}` : line(a, b, l.plain ? C.plain : '#69768a', 2, l.plain ? ' stroke-dasharray="5 4"' : '');
      g.push(`<g${l.medium ? ` class="link-${esc(l.medium)}"` : ''}>${title(tip)}${body}${pill(lerp(a, b, 0.2), l.a.port ?? '?', '#9aa4b1')}${pill(lerp(a, b, 0.8), l.b.port ?? '?', '#9aa4b1')}${caption ? pill(lerp(a, b, 0.5), caption, optical || !l.caption ? C.optical : '#9aa4b1') : ''}</g>`);
    }
    for (const nd of model.nodes) {
      const p = at(nd.id);
      // A line-system member (no facts, an equipment role): solid, in the optical colour.
      const eq = nd.plain ? equipmentTag(nd) : null;
      const col = eq ? C.optical : C[nd.role] ?? C.plain;
      // A box: top face (a parallelogram on the plane) and a front face, 18 px tall.
      const hw = 34, hd = 22, h = 18;
      const tl = { x: p.x - hw - hd * cam.kx, y: p.y - hd * cam.ky - h };
      const top = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([du, dv]) => `${r1(p.x + du + dv * cam.kx)},${r1(p.y + dv * cam.ky - h)}`).join(' ');
      const fr = [[-hw, hd, 0], [hw, hd, 0], [hw, hd, h], [-hw, hd, h]].map(([du, dv, z]) => `${r1(p.x + du + dv * cam.kx)},${r1(p.y + dv * cam.ky - h + z)}`).join(' ');
      const side = [[hw, -hd, 0], [hw, hd, 0], [hw, hd, h], [hw, -hd, h]].map(([du, dv, z]) => `${r1(p.x + du + dv * cam.kx)},${r1(p.y + dv * cam.ky - h + z)}`).join(' ');
      const dash = nd.plain && !eq ? ' stroke-dasharray="3 2" fill-opacity="0.35"' : '';
      const sub = eq ? [[nd.equipment, nd.type].filter(Boolean).join(' · ')] : nd.plain ? [nd.type ?? '', 'no facts'] : [[nd.type, nd.os].filter(Boolean).join(' · ')];
      const full = deviceDetail(nd, model);
      g.push(`<g class="device">${title(full)}<polygon points="${side}" fill="${col}" stroke="#fff" stroke-width="0.8"${dash} style="filter:brightness(0.72)"/><polygon points="${fr}" fill="${col}" stroke="#fff" stroke-width="0.8"${dash} opacity="0.8"/><polygon points="${top}" fill="${col}" stroke="#fff" stroke-width="0.8"${dash}/>${block(reg, tl.x, tl.y - 2, [nd.id + (eq ? `  ${eq}` : nd.plain ? '' : `  ${roleTag(nd)}`), ...sub], { color: col })}</g>`);
    }
  }

  if (id === 'ring') {
    for (const r of model.rings) {
      const color = r.type === 'sub' ? C.subRing : C.ring;
      for (const lid of r.links) {
        const l = model.links.find((x) => x.id === lid);
        if (!l) continue;
        const a = at(l.a.node), b = at(l.b.node);
        g.push(`<g>${title(`ring ${r.name} link ${lid}${l.ring?.rpl ? `\nRPL, owner ${l.ring.rpl}` : ''}`)}${line(a, b, color, 7, ' stroke-linecap="round" stroke-opacity="0.75"')}</g>`);
        if (l.ring?.rpl) {
          const owner = l.ring.rpl === l.a.node ? a : b, other = owner === a ? b : a;
          const c = lerp(owner, other, 0.3);
          g.push(`<circle cx="${c.x}" cy="${c.y}" r="8" fill="${C.rpl}"/><text x="${c.x}" y="${r1(c.y + 3.5)}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">RPL</text>`);
        }
      }
      for (const id2 of r.nodes) {
        const p = at(id2);
        g.push(`<ellipse cx="${p.x}" cy="${p.y}" rx="11" ry="6" fill="${color}" stroke="#fff"/>`);
      }
    }
    // One label per device: its role on each ring it is on.
    for (const id2 of [...new Set(model.rings.flatMap((r) => r.nodes))]) {
      const p = at(id2);
      const rs = nodes.get(id2)?.rings ?? [];
      const role = [...new Set(rs.map((x) => x.role))].filter((x) => x !== 'member').join(', ') || 'member';
      g.push(`<g>${title(rs.map((x) => `${id2}: ${x.role} of ${x.ring}`).join('\n'))}${block(reg, p.x + 14, p.y - 6, [id2, role], { color: role !== 'member' ? C.rpl : C.ring })}</g>`);
    }
  }

  if (id === 'igp') {
    for (const l of model.links) {
      if (!l.adj) continue;
      const a = at(l.a.node), b = at(l.b.node);
      g.push(`<g>${title(`${l.a.node} — ${l.b.node}: adjacency ${l.adj}, metric ${l.metric}\n${l.subnet ?? ''}`)}${line(a, b, l.adj === 'Up' ? C.igp : C.rpl, 2.6)}${pill(lerp(a, b, 0.5), `${l.metric ?? '?'}`, C.igp)}</g>`);
    }
    for (const nd of model.nodes) {
      if (!nd.isis && !nd.loopback) continue;
      if (![...model.links].some((l) => l.adj && (l.a.node === nd.id || l.b.node === nd.id))) continue;
      const p = at(nd.id);
      const lines = [nd.id, nd.loopback, nd.sid ? `SID ${nd.sid.label}` : null].filter(Boolean);
      g.push(`<g>${title(deviceDetail(nd, model))}<ellipse cx="${p.x}" cy="${p.y}" rx="12" ry="7" fill="${C.igp}" stroke="#fff"/>${block(reg, p.x - 16, p.y - 8, lines, { anchor: 'end', color: C.igp })}</g>`);
    }
  }

  if (id === 'pw') {
    const seen = new Map();
    for (const pw of model.pws) {
      // The transport path along the plane, then the pseudowire as an arc over it.
      if (pw.path?.length > 1) {
        const pts = pw.path.map(at);
        g.push(`<polyline points="${pts.map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${C.pw}" stroke-width="1.6" stroke-dasharray="6 4" stroke-opacity="0.7"/>`);
      }
      const key = [pw.a, pw.b].sort().join('|');
      const k = seen.get(key) ?? 0;
      seen.set(key, k + 1);
      const a = at(pw.a), b = at(pw.b);
      const { path, apex } = arc(a, b, 70 + k * 30 + Math.hypot(b.x - a.x, b.y - a.y) * 0.12, C.pw);
      g.push(`<g>${title(`${pw.id}\n${pw.via}\nPW labels ${pw.labels}${pw.path ? `\npath ${pw.path.join(' → ')}` : ''}`)}${path}${block(reg, apex.x, apex.y + 6, [`${pw.type.toUpperCase()} ${pw.name}`, pw.via, `labels ${pw.labels}`], { anchor: 'middle', color: C.pw })}</g>`);
    }
    for (const id2 of new Set(model.pws.flatMap((p) => [p.a, p.b]))) {
      const p = at(id2);
      g.push(`<ellipse cx="${p.x}" cy="${p.y}" rx="9" ry="5" fill="${C.pw}" stroke="#fff"/>${block(reg, p.x - 12, p.y + 16, [id2], { anchor: 'end', color: C.pw })}`);
    }
  }

  if (id === 'cfm') {
    for (const m of model.megs) {
      const a = at(m.a), b = at(m.b);
      const { path, apex } = arc(a, b, 60, C.cfm, '2 4');
      g.push(`<g>${title(`MEG ${m.label}`)}${path}${block(reg, apex.x, apex.y + 6, [`MEG ${m.label}`], { anchor: 'middle', color: C.cfm })}</g>`);
    }
    for (const nd of model.nodes) {
      if (!nd.meps.length) continue;
      const p = at(nd.id);
      g.push(`<g>${title(nd.meps.map((x) => `MEP ${x.mep} ${x.meg} L${x.level}`).join('\n'))}<rect x="${p.x - 7}" y="${p.y - 7}" width="14" height="14" rx="2" fill="${C.cfm}" stroke="#fff"/>${block(reg, p.x + 12, p.y + 4, [nd.id, `MEP ${nd.meps[0].mep}`], { color: C.cfm })}</g>`);
    }
  }

  if (id === 'bgp') {
    for (const s of model.bgp) {
      const a = at(s.a), b = at(s.b);
      g.push(`<g>${title(`BGP ${s.a} — ${s.b}: ${s.state}${s.client ? ` (${s.client} is a route reflector client)` : ''}`)}${line(a, b, s.state === 'Established' ? C.bgp : C.rpl, 1.8, ' stroke-dasharray="7 4"')}</g>`);
    }
    for (const nd of model.nodes) {
      if (!model.bgp.some((s) => s.a === nd.id || s.b === nd.id)) continue;
      const p = at(nd.id);
      g.push(`<g>${title(deviceDetail(nd, model))}<ellipse cx="${p.x}" cy="${p.y}" rx="${nd.rr ? 14 : 9}" ry="${nd.rr ? 8 : 5}" fill="${C.bgp}" stroke="#fff"/>${block(reg, p.x + 14, p.y - 6, [nd.id, nd.rr ? 'route reflector' : null].filter(Boolean), { color: C.bgp })}</g>`);
    }
  }
  if (id === 'mpls') {
    const seen = new Map();
    for (const t of [...model.policies.map((x) => ({ ...x, kind: 'policy' })), ...model.tunnels.map((x) => ({ ...x, kind: 'tunnel' }))]) {
      if (!t.a || !t.b || !nodes.has(t.a) || !nodes.has(t.b)) continue;
      if (t.path?.length > 1) g.push(`<polyline points="${t.path.filter((x) => nodes.has(x)).map(at).map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${C.mpls}" stroke-width="1.6" stroke-dasharray="6 4" stroke-opacity="0.75"/>`);
      const key = [t.a, t.b].sort().join('|');
      const k = seen.get(key) ?? 0;
      seen.set(key, k + 1);
      const a = at(t.a), b = at(t.b);
      const { path, apex } = arc(a, b, 60 + k * 28 + Math.hypot(b.x - a.x, b.y - a.y) * 0.1, t.valid === false ? C.rpl : C.mpls);
      g.push(`<g>${title(`${t.name}\n${t.kind === 'policy' ? `SR policy, color ${t.color}, segments ${t.sids || '?'}` : 'MPLS-TP co-routed tunnel'}${t.path ? `\npath ${t.path.join(' → ')}` : ''}`)}${path}${block(reg, apex.x, apex.y + 6, t.kind === 'policy' ? [t.name, `color ${t.color}`] : [t.name, 'MPLS-TP'], { anchor: 'middle', color: C.mpls })}</g>`);
    }
  }

  if (id === 'srv6') {
    model.algorithms.forEach((alg, i) => {
      for (const lid of alg.links) {
        const l = model.links.find((x) => x.id === lid);
        if (!l) continue;
        const off = (i + 1) * 4;
        const a = at(l.a.node), b = at(l.b.node);
        g.push(`<g>${title(`Flex-Algo ${alg.algorithm}${alg.metric ? `, ${alg.metric} metric` : ''}`)}${line({ x: a.x, y: a.y + off }, { x: b.x, y: b.y + off }, ALGO[i % ALGO.length], 2)}</g>`);
      }
    });
    for (const nd of model.nodes) {
      if (!nd.locators.length) continue;
      const p = at(nd.id);
      g.push(`<g>${title(deviceDetail(nd, model))}<ellipse cx="${p.x}" cy="${p.y}" rx="10" ry="6" fill="${C.srv6}" stroke="#fff"/>${block(reg, p.x + 14, p.y - 6, [nd.id, nd.locators[0]], { color: C.srv6 })}</g>`);
    }
  }

  if (id === 'vrf') {
    model.vrfs.forEach((v, i) => {
      for (let x = 1; x < v.pes.length; x++) {
        const a = at(v.pes[0]), b = at(v.pes[x]);
        const { path, apex } = arc(a, b, 50 + i * 26, C.vrf, '8 4');
        g.push(`<g>${title(`VRF ${v.name}: ${v.pes.join(', ')}`)}${path}${x === 1 ? block(reg, apex.x, apex.y + 6, [`VRF ${v.name}`], { anchor: 'middle', color: C.vrf }) : ''}</g>`);
      }
    });
    for (const nd of model.nodes) {
      if (!nd.vrfs.length) continue;
      const p = at(nd.id);
      g.push(`<g>${title(deviceDetail(nd, model))}<ellipse cx="${p.x}" cy="${p.y}" rx="9" ry="5" fill="${C.vrf}" stroke="#fff"/>${block(reg, p.x + 12, p.y - 4, [nd.id], { color: C.vrf })}</g>`);
    }
  }

  if (id === 'evpn') {
    model.evpn.forEach((e, i) => {
      for (let x = 1; x < e.members.length; x++) {
        const a = at(e.members[0]), b = at(e.members[x]);
        const { path, apex } = arc(a, b, 50 + i * 26, e.state && e.state !== 'Up' ? C.rpl : C.evpn);
        g.push(`<g>${title(`EVI ${e.evi} (${e.type ?? '?'}): ${e.members.join(', ')}${e.state ? `, ${e.state}` : ''}`)}${path}${x === 1 ? block(reg, apex.x, apex.y + 6, [`EVI ${e.evi}`, (e.type ?? '').toUpperCase()].filter(Boolean), { anchor: 'middle', color: C.evpn }) : ''}</g>`);
      }
    });
    for (const id2 of new Set(model.evpn.flatMap((e) => e.members))) {
      const p = at(id2);
      g.push(`<ellipse cx="${p.x}" cy="${p.y}" rx="9" ry="5" fill="${C.evpn}" stroke="#fff"/>${block(reg, p.x - 12, p.y + 16, [id2], { anchor: 'end', color: C.evpn })}`);
    }
  }
  // Notes (schema 1.9) on their layer's plane (physical when the snapshot has no such plane), in the
  // plane's front right corner: one on a device numbered, with the number in a yellow marker by the device.
  const mine = full.notes.filter((x) => noteLayerOf(x, full, layers) === id);
  const corner = S(planeU, planeV);
  let k = 0;
  for (const x of mine) {
    const lines = wrapNote(x.text, 48);
    if (x.device) {
      k += 1;
      const p = at(x.device);
      const m = { x: r1(p.x + 40), y: r1(p.y - 30) };
      g.push(`<g class="note-marker">${title(`${x.device}: ${x.text}`)}<circle cx="${m.x}" cy="${m.y}" r="8" fill="${C.note}" stroke="${C.noteEdge}" stroke-width="1.4"/><text x="${m.x}" y="${r1(m.y + 3.5)}" font-size="10" font-weight="700" text-anchor="middle" fill="${C.ink}">${k}</text></g>`);
      lines.unshift(`${k} · ${x.device}`);
    }
    g.push(`<g class="note">${title(x.device ? `${x.device}: ${x.text}` : x.text)}${block(reg, corner.x - 10, corner.y - 8, lines, { anchor: 'end', fill: C.note, stroke: C.noteEdge, bold: !!x.device, color: C.ink })}</g>`);
  }
  return g;
}

function roleTag(nd) {
  return ({ p: 'P', pe: 'PE', ce: 'CE', l2: 'L2', host: 'host' }[nd.role] ?? '') + (nd.rr ? ' · RR' : '');
}

// Layer switching, inside the SVG: a hidden plane drops out and the planes above move down by
// one gap; the pillars follow; the viewBox shrinks from the top.
const SWITCH_SCRIPT = `
(function () {
  var svgs = document.querySelectorAll('svg.netfacts-snapshot:not([data-wired])');
  Array.prototype.forEach.call(svgs, function (svg) {
    svg.setAttribute('data-wired', '1');
    var gap = +svg.getAttribute('data-gap'), fullH = +svg.getAttribute('data-full-h');
    var vb = svg.getAttribute('viewBox').split(' ').map(Number);
    var layers = [].slice.call(svg.querySelectorAll('g.layer'));
    var order = layers.map(function (g) { return g.getAttribute('data-layer'); }).reverse();
    var off = {};
    function apply() {
      var shown = order.filter(function (id) { return !off[id]; });
      layers.forEach(function (g) {
        var id = g.getAttribute('data-layer'), k = shown.indexOf(id);
        g.style.display = k < 0 ? 'none' : '';
        if (k >= 0) g.setAttribute('transform', 'translate(0,' + (-k * gap) + ')');
      });
      [].forEach.call(svg.querySelectorAll('line.pillar'), function (p) {
        var ls = (p.getAttribute('data-layers') || '').split(' ');
        if (p._y0 === undefined) p._y0 = +p.getAttribute('y1');
        var y0 = p._y0, top = 0, bottom = Infinity;
        ls.forEach(function (id) { var k = shown.indexOf(id); if (k > top) top = k; if (k >= 0 && k < bottom) bottom = k; });
        if (bottom === Infinity) bottom = 0;
        p.setAttribute('y1', y0 - bottom * gap);
        p.setAttribute('y2', y0 - top * gap);
      });
      [].forEach.call(svg.querySelectorAll('g.chip'), function (c) {
        var id = c.getAttribute('data-layer');
        c.style.opacity = off[id] ? 0.45 : 1;
        c.querySelector('.dot').setAttribute('fill-opacity', off[id] ? 0 : 1);
        c.setAttribute('aria-pressed', off[id] ? 'false' : 'true');
      });
      var drop = (order.length - shown.length) * gap;
      svg.setAttribute('viewBox', [vb[0], drop, vb[2], fullH - drop].join(' '));
      svg.setAttribute('height', fullH - drop);
      svg.querySelector('g.hud').setAttribute('transform', 'translate(0,' + drop + ')');
    }
    [].forEach.call(svg.querySelectorAll('g.chip'), function (c) {
      var id = c.getAttribute('data-layer');
      if (id === 'physical') { c.style.cursor = 'default'; return; }
      function toggle() { off[id] = !off[id]; apply(); }
      c.addEventListener('click', toggle);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    apply();
  });
})();`;
