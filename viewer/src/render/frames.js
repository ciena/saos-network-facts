// SPDX-License-Identifier: Apache-2.0
// Layer frames: a lab as flat 2D frames, one per layer the facts have content for, all on the
// library layout (js/src/layout.ts layoutFacts) so the devices stay put from frame to frame and only
// the layer's objects and their labels change. Each object carries two or three short labels, the
// most important first; each frame has a title. A layer that reads better over another is drawn over
// it: G.8032 rings over the physical links, pseudowires and SR policies over the IGP.
//
// One SVG holds every frame as <g class="frame" id="f-<layer>"> (the view's layer ids). CSS inside
// the SVG shows the :target frame, else the start frame, which is the last group so that no :has()
// is needed:
//   <img src="frames.svg#f-igp">  one frame, no script
//   <img src="frames.svg">        the start frame (the view's frames.start, by default the signature layer)
// A page that inlines the SVG can show one group at a time itself (a card that rotates).

import { deviceDetail } from './model.js';

const C = {
  ink: '#1d2430', mute: '#5b6675', ghost: '#c3cad3', ghostInk: '#8a94a3',
  p: '#1f5fa8', pe: '#c8202f', ce: '#4b7f52', l2: '#6a5acd', host: '#3d7f8f', plain: '#8a94a3',
  link: '#69768a', ring: '#d29a1e', subRing: '#4f9fe8', rpl: '#f0883e', igp: '#2e9e5b',
  mpls: '#b7791f', srv6: '#e8590c', pw: '#d63384', cfm: '#1a9fae', bgp: '#7d4cc2', vrf: '#5b5fc7', evpn: '#a65fd6',
};
const ROLE_TAG = { p: 'P', pe: 'PE', ce: 'CE', l2: 'L2', host: 'H', plain: '?' };
const ALGO = ['#e8590c', '#1c7ed6', '#2f9e44', '#c2255c'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (v) => Math.round(v * 10) / 10;
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// The title of each frame, by layer id.
export function frameTitle(id, m) {
  const igpName = m.igp === 'ospf' ? 'OSPF' : 'IS-IS';
  switch (id) {
    case 'physical': {
      const oses = [...new Set(m.nodes.map((n) => n.os).filter(Boolean))];
      return `Physical · ${plural(m.nodes.length, 'device')}${oses.length === 1 ? ` (${oses[0]})` : ''}, ${plural(m.links.length, 'link')}`;
    }
    case 'ring':
      return `G.8032 · ${m.rings.map((r) => `${r.name}${r.vid != null ? ` (VID ${r.vid})` : ''}`).join(', ')}`;
    case 'igp': {
      const lvl = m.nodes.find((n) => n.isis)?.isis?.level ?? '';
      return `IGP · ${igpName}${m.igp === 'ospf' ? '' : ` ${lvl}`}${m.srgb ? ', SR' : ''}${m.areas.length ? ` · area ${m.areas.join(', ')}` : ''}`.replace(/\s+·/g, ' ·');
    }
    case 'mpls':
      return `MPLS · ${[m.policies.length && plural(m.policies.length, 'SR policy', 'SR policies'), m.tunnels.length && plural(m.tunnels.length, 'MPLS-TP tunnel')].filter(Boolean).join(', ')} over ${igpName}`;
    case 'srv6':
      return `SRv6 · ${plural(m.nodes.filter((n) => n.locators.length).length, 'locator router')}${m.algorithms.length ? ` · Flex-Algo ${m.algorithms.map((a) => a.algorithm).join(', ')}` : ''}`;
    case 'bgp': {
      const asn = m.nodes.find((n) => n.asn)?.asn;
      const rr = m.nodes.filter((n) => n.rr).map((n) => n.id);
      return `BGP · ${asn ? `AS ${asn} · ` : ''}${plural(m.bgp.length, 'session')}${rr.length ? ` · RR ${rr.join(', ')}` : ''}`;
    }
    case 'vrf':
      return `L3VPN · ${plural(m.vrfs.length, 'VRF')}: ${m.vrfs.map((v) => v.name).join(', ')}`;
    case 'pw': {
      const vias = [...new Set(m.pws.map((p) => p.via.replace(/ \S+$/, (x) => (/policy|tunnel|LSP/.test(p.via) ? '' : x)).replace(/^SR policy.*/, 'SR policy').replace(/^MPLS-TP.*/, 'MPLS-TP')))];
      return `Services · ${plural(m.pws.length, 'pseudowire')} over ${vias.join(' / ')}`;
    }
    case 'evpn':
      return `EVPN · ${m.evpn.map((i) => `EVI ${i.evi} ${i.type?.toUpperCase() ?? ''}`.trim()).join(', ')}`;
    case 'cfm':
      return `CFM · ${m.megs.map((x) => x.label).join(', ')}`;
    default:
      return id;
  }
}

// frames: the layer ids in order (js/src/view.ts viewFrames), start: the one shown by the bare file.
export function renderFrames(m, positions, { frames, start }) {
  const P = positions;
  const xs = Object.values(P).map((p) => p.x), ys = Object.values(P).map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  // Fonts grow with the drawing so a big lab still reads when a card scales it down; the grid is in
  // font units so three label lines fit between rows.
  const f = Math.round(13 * Math.max(1, ((maxX - minX) * 160 + 300) / 760));
  const U = Math.max(160, f * 9.4), V = f * 7.6;
  const mx = f * 5.5, myTop = f * 7.4, myBot = f * 6.6;
  const titles = Object.fromEntries(frames.map((id) => [id, frameTitle(id, m)]));
  // Wide enough for the longest title, so a small lab keeps its titles whole.
  const W = Math.ceil(Math.max((maxX - minX) * U + 2 * mx, Math.max(...Object.values(titles).map((t) => t.length)) * f * 1.15 * 0.6 + f * 2.4));
  const H = Math.ceil((maxY - minY) * V + myTop + myBot);
  const ox = (W - ((maxX - minX) * U + 2 * mx)) / 2;
  const at = (id) => ({ x: r1(ox + mx + (P[id].x - minX) * U), y: r1(myTop + (P[id].y - minY) * V) });
  const nodes = new Map(m.nodes.map((n) => [n.id, n]));
  const ctx = { model: m, at, f, nodes, W, H };
  const order = start && frames.includes(start) ? [...frames.filter((x) => x !== start), start] : frames;

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" class="netfacts-frames" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" data-frames="${frames.join(' ')}" data-start="${start ?? ''}">`);
  out.push(`<title>${esc(m.name)}</title>`);
  out.push('<style>.frame{display:none}.frame:target{display:inline}.frame:last-of-type{display:inline}.frame:target~.frame:last-of-type{display:none}</style>');
  out.push(`<rect width="${W}" height="${H}" fill="#fff"/>`);
  for (const id of order) {
    const g = draw(id, ctx);
    g.push(`<rect width="${W}" height="${r1(f * 2.5)}" fill="#fff" fill-opacity="0.92"/><text x="${r1(f * 1.1)}" y="${r1(f * 1.7)}" font-size="${r1(f * 1.15)}" font-weight="700" fill="${id === 'physical' ? C.ink : C[id] ?? C.ink}">${esc(titles[id])}</text>`);
    out.push(`<g class="frame" id="f-${id}" data-title="${esc(titles[id])}">${g.join('')}</g>`);
  }
  out.push('</svg>');
  return { svg: `${out.join('\n')}\n`, frames: frames.map((id) => ({ id, title: titles[id] })), start, width: W, height: H };
}

// A label block, first line bold; anchored centre-top at (x, y) or above, kept off earlier blocks.
function block(ctx, reg, x, y, lines, { color = C.ink, anchor = 'middle', up = false } = {}) {
  const { f } = ctx;
  const sz = (i) => (i === 0 ? f : f * 0.85);
  const lh = f * 1.15;
  const w = Math.max(...lines.map((l, i) => l.length * sz(i) * 0.58)) + f * 0.6;
  const h = lines.length * lh + f * 0.35;
  let x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  x0 = Math.max(2, Math.min(ctx.W - w - 2, x0));
  // Off every label already placed and below the title band: try the preferred side first, then
  // alternate, a label height at a time.
  const base = up ? y - h : y;
  const hit = (yy) => yy < f * 2.6 || yy + h > ctx.H - 2 || reg.some((b) => x0 < b.x + b.w && b.x < x0 + w && yy < b.y + b.h && b.y < yy + h);
  let y0 = base;
  for (let i = 1; i < 24 && hit(y0); i++) {
    const step = Math.ceil(i / 2) * (h * 0.55) * (i % 2 ? 1 : -1) * (up ? -1 : 1);
    y0 = base + step;
  }
  if (hit(y0)) y0 = base;
  reg.push({ x: x0, y: y0, w, h });
  return `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(f * 0.3)}" fill="#fff" fill-opacity="0.9"/>` +
    lines.map((l, i) => `<text x="${r1(x0 + w / 2)}" y="${r1(y0 + f * 0.95 + i * lh)}" font-size="${r1(sz(i))}" text-anchor="middle"${i === 0 ? ' font-weight="700"' : ''} fill="${i === 0 ? color : C.mute}">${esc(l)}</text>`).join('');
}

// A device's labels go outward: above it in the top half of the drawing, below it in the bottom half.
function outward(ctx, reg, p, gap, lines, opts = {}) {
  const below = p.y > ctx.H * 0.5;
  return block(ctx, reg, p.x, below ? p.y + gap : p.y - gap, lines, { ...opts, up: !below });
}

function line(a, b, color, w, extra = '') {
  return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${w}"${extra}/>`;
}
const lerp = (a, b, t) => ({ x: r1(a.x + (b.x - a.x) * t), y: r1(a.y + (b.y - a.y) * t) });
const title = (t) => `<title>${esc(t)}</title>`;

// Parallel links between one pair get a sideways offset.
function linkEnds(ctx) {
  const n = new Map(), seen = new Map();
  const key = (l) => [l.a.node, l.b.node].sort().join('|');
  for (const l of ctx.model.links) n.set(key(l), (n.get(key(l)) ?? 0) + 1);
  const ends = new Map();
  for (const l of ctx.model.links) {
    const i = seen.get(key(l)) ?? 0;
    seen.set(key(l), i + 1);
    const a = ctx.at(l.a.node), b = ctx.at(l.b.node);
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const off = (i - (n.get(key(l)) - 1) / 2) * ctx.f * 0.9;
    const ox = (-(b.y - a.y) / d) * off, oy = ((b.x - a.x) / d) * off;
    ends.set(l.id, [{ x: r1(a.x + ox), y: r1(a.y + oy) }, { x: r1(b.x + ox), y: r1(b.y + oy) }]);
  }
  return ends;
}

// The ghost: the physical topology faint, with names, so every frame keeps its bearings.
function ghost(ctx, ends, reg, { names = true } = {}) {
  const g = [];
  for (const l of ctx.model.links) {
    const [a, b] = ends.get(l.id);
    g.push(line(a, b, C.ghost, ctx.f * 0.12, l.plain ? ' stroke-dasharray="5 4"' : ''));
  }
  for (const n of ctx.model.nodes) {
    const p = ctx.at(n.id);
    const s = ctx.f * 0.9;
    g.push(`<rect x="${r1(p.x - s)}" y="${r1(p.y - s * 0.6)}" width="${r1(2 * s)}" height="${r1(1.2 * s)}" rx="${r1(s * 0.25)}" fill="#eef1f4" stroke="${C.ghost}"/>`);
    if (names) {
      const w = n.id.length * ctx.f * 0.8 * 0.58 + 6;
      reg.push({ x: p.x - w / 2, y: p.y + s * 0.7, w, h: ctx.f });
      g.push(`<text x="${p.x}" y="${r1(p.y + s * 0.7 + ctx.f * 0.8)}" font-size="${r1(ctx.f * 0.8)}" text-anchor="middle" fill="${C.ghostInk}">${esc(n.id)}</text>`);
    }
  }
  return g;
}

function draw(id, ctx) {
  const { model, at, f, nodes } = ctx;
  const ends = linkEnds(ctx);
  const reg = [];
  const g = [];
  const dot = (p, color, r = f * 0.55) => `<ellipse cx="${p.x}" cy="${p.y}" rx="${r1(r)}" ry="${r1(r * 0.75)}" fill="${color}" stroke="#fff" stroke-width="${r1(f * 0.1)}"/>`;
  const pill = (p, text, color) => {
    const w = String(text).length * f * 0.75 * 0.6 + f * 0.6;
    return `<rect x="${r1(p.x - w / 2)}" y="${r1(p.y - f * 0.55)}" width="${r1(w)}" height="${r1(f * 1.1)}" rx="${r1(f * 0.55)}" fill="#fff" stroke="${color}" stroke-width="${r1(f * 0.07)}"/><text x="${p.x}" y="${r1(p.y + f * 0.28)}" font-size="${r1(f * 0.75)}" text-anchor="middle" fill="${C.ink}">${esc(text)}</text>`;
  };
  const arc = (a, b, k, color, dash) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const nx = -(b.y - a.y) / (d || 1), ny = (b.x - a.x) / (d || 1);
    // bow away from the drawing's middle: over the top row upward, under the bottom row downward
    let s = ny > 0 ? -1 : 1;
    if (m.y > ctx.H * 0.55) s = -s;
    const lift = f * 2.6 + d * 0.12 + k * f * 2.4;
    const c = { x: m.x + nx * lift * s, y: m.y + ny * lift * s };
    const apex = { x: r1((a.x + 2 * c.x + b.x) / 4), y: r1((a.y + 2 * c.y + b.y) / 4) };
    return { path: `<path d="M${a.x},${a.y} Q${r1(c.x)},${r1(c.y)} ${b.x},${b.y}" fill="none" stroke="${color}" stroke-width="${r1(f * 0.2)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`, apex };
  };

  if (id === 'physical') {
    const mixed = new Set(model.nodes.map((n) => n.os).filter(Boolean)).size > 1;
    for (const l of model.links) {
      const [a, b] = ends.get(l.id);
      g.push(`<g>${title(`${l.a.node} ${l.a.port} — ${l.b.node} ${l.b.port}${l.subnet ? `\n${l.subnet}` : ''}`)}${line(a, b, l.plain ? C.plain : C.link, f * 0.16, l.plain ? ' stroke-dasharray="6 5"' : '')}${pill(lerp(a, b, 0.24), l.a.port ?? '?', '#9aa4b1')}${pill(lerp(a, b, 0.76), l.b.port ?? '?', '#9aa4b1')}</g>`);
    }
    for (const n of model.nodes) {
      const p = at(n.id);
      const col = C[n.role] ?? C.plain;
      const s = f * (n.rr ? 1.6 : 1.3);
      g.push(`<g>${title(deviceDetail(n, model))}<rect x="${r1(p.x - s)}" y="${r1(p.y - s * 0.6)}" width="${r1(2 * s)}" height="${r1(1.2 * s)}" rx="${r1(s * 0.2)}" fill="${col}"${n.plain ? ' fill-opacity="0.35" stroke-dasharray="4 3"' : ''} stroke="${n.plain ? C.plain : '#fff'}" stroke-width="${r1(f * 0.1)}"/><text x="${p.x}" y="${r1(p.y + f * 0.35)}" font-size="${r1(f * 0.8)}" font-weight="700" text-anchor="middle" fill="#fff">${esc((ROLE_TAG[n.role] ?? '') + (n.rr ? '·RR' : ''))}</text></g>`);
      reg.push({ x: p.x - s, y: p.y - s * 0.6, w: 2 * s, h: 1.2 * s });
    }
    for (const n of model.nodes) {
      const p = at(n.id);
      g.push(outward(ctx, reg, p, f * 1.0, [n.id, n.plain ? [n.type, 'no facts'].filter(Boolean).join(' · ') : [n.type, mixed ? n.os : null].filter(Boolean).join(' · ')], { color: C[n.role] ?? C.plain }));
    }
  }

  if (id === 'ring') {
    g.push(...ghost(ctx, ends, reg, { names: false }));
    for (const r of model.rings) {
      const color = r.type === 'sub' ? C.subRing : C.ring;
      for (const lid of r.links) {
        const l = model.links.find((x) => x.id === lid);
        if (!l) continue;
        const [a, b] = ends.get(lid);
        g.push(`<g>${title(`${r.name}: ${l.a.node} ${l.a.port} — ${l.b.node} ${l.b.port}`)}${line(a, b, color, f * 0.55, ' stroke-linecap="round" stroke-opacity="0.85"')}</g>`);
        if (l.ring?.rpl) {
          const owner = l.ring.rpl === l.a.node ? a : b, other = owner === a ? b : a;
          const c = lerp(owner, other, 0.32);
          g.push(`<circle cx="${c.x}" cy="${c.y}" r="${r1(f * 0.85)}" fill="${C.rpl}"/><text x="${c.x}" y="${r1(c.y + f * 0.27)}" font-size="${r1(f * 0.62)}" font-weight="700" text-anchor="middle" fill="#fff">RPL</text>`);
        }
      }
      for (const id2 of r.nodes) g.push(dot(at(id2), color));
    }
    // One label per device: its role on each ring it is on (a member of both rings says so once).
    for (const id2 of [...new Set(model.rings.flatMap((r) => r.nodes))]) {
      const roles = [...new Set((nodes.get(id2)?.rings ?? []).map((x) => x.role))];
      const role = roles.filter((x) => x !== 'member').join(', ') || 'member';
      g.push(`<g>${title(deviceDetail(nodes.get(id2), model))}${outward(ctx, reg, at(id2), f * 0.9, [id2, role], { color: role === 'member' ? C.ink : C.rpl })}</g>`);
    }
  }

  if (id === 'igp') {
    g.push(...ghost(ctx, ends, reg, { names: false }));
    for (const l of model.links) {
      if (!l.adj) continue;
      const [a, b] = ends.get(l.id);
      g.push(`<g>${title(`${l.a.node} — ${l.b.node}: ${l.adj}, metric ${l.metric}\n${l.subnet ?? ''}`)}${line(a, b, l.adj === 'Up' ? C.igp : C.rpl, f * 0.22)}${pill(lerp(a, b, 0.5), l.metric ?? '?', C.igp)}</g>`);
    }
    for (const n of model.nodes) {
      if (!model.links.some((l) => l.adj && (l.a.node === n.id || l.b.node === n.id))) continue;
      const p = at(n.id);
      g.push(dot(p, C.igp));
      g.push(`<g>${title(deviceDetail(n, model))}${outward(ctx, reg, p, f * 0.8, [n.id, n.loopback, n.sid ? `SID ${n.sid.label}` : null].filter(Boolean), { color: C.igp })}</g>`);
    }
  }

  if (id === 'pw') {
    g.push(...ghost(ctx, ends, reg));
    for (const l of model.links) if (l.adj) { const [a, b] = ends.get(l.id); g.push(line(a, b, C.igp, f * 0.1, ' stroke-opacity="0.45"')); }
    const seen = new Map();
    for (const pw of model.pws) {
      if (pw.path?.length > 1) g.push(`<polyline points="${pw.path.map(at).map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${C.pw}" stroke-width="${r1(f * 0.13)}" stroke-dasharray="${f * 0.5} ${f * 0.35}" stroke-opacity="0.75"/>`);
      const key = [pw.a, pw.b].sort().join('|');
      const k = seen.get(key) ?? 0;
      seen.set(key, k + 1);
      const { path, apex } = arc(at(pw.a), at(pw.b), k, C.pw);
      g.push(`<g>${title(`${pw.id}\n${pw.via}\nPW labels ${pw.labels}${pw.path ? `\npath ${pw.path.join(' → ')}` : ''}`)}${path}${block(ctx, reg, apex.x, apex.y > ctx.H * 0.55 ? apex.y + f * 0.4 : apex.y - f * 0.4, [`${pw.type.toUpperCase()} ${pw.name}`, pw.via.replace('SR policy ', 'SR ')], { color: C.pw, up: apex.y <= ctx.H * 0.55 })}</g>`);
    }
    for (const id2 of new Set(model.pws.flatMap((p) => [p.a, p.b]))) g.push(dot(at(id2), C.pw));
  }

  if (id === 'cfm') {
    g.push(...ghost(ctx, ends, reg));
    for (const m of model.megs) {
      const { path, apex } = arc(at(m.a), at(m.b), 0, C.cfm, `${f * 0.2} ${f * 0.4}`);
      g.push(`<g>${title(m.label)}${path}${block(ctx, reg, apex.x, apex.y - f * 0.4, [`MEG ${m.label}`], { color: C.cfm, up: true })}</g>`);
    }
    for (const n of model.nodes) {
      if (!n.meps.length) continue;
      const p = at(n.id);
      const s = f * 0.6;
      g.push(`<g>${title(n.meps.map((x) => `MEP ${x.mep} ${x.meg} L${x.level}`).join('\n'))}<rect x="${r1(p.x - s)}" y="${r1(p.y - s)}" width="${r1(2 * s)}" height="${r1(2 * s)}" rx="${r1(s * 0.2)}" fill="${C.cfm}" stroke="#fff"/>${outward(ctx, reg, p, f * 1.1, [n.id, `MEP ${n.meps[0].mep}`], { color: C.cfm })}</g>`);
    }
  }

  if (id === 'bgp') {
    g.push(...ghost(ctx, ends, reg));
    for (const s of model.bgp) {
      g.push(`<g>${title(`BGP ${s.a} — ${s.b}: ${s.state}`)}${line(at(s.a), at(s.b), s.state === 'Established' ? C.bgp : C.rpl, f * 0.15, ` stroke-dasharray="${f * 0.55} ${f * 0.3}"`)}</g>`);
    }
    for (const n of model.nodes) {
      if (!model.bgp.some((s) => s.a === n.id || s.b === n.id)) continue;
      const p = at(n.id);
      g.push(dot(p, C.bgp, n.rr ? f * 0.85 : f * 0.5));
      const lines = [n.rr ? 'route reflector' : null, n.vrfs.length ? `VRF ${n.vrfs.join(', ')}` : null].filter(Boolean);
      if (lines.length) g.push(outward(ctx, reg, p, f * 1.6, lines, { color: C.bgp }));
    }
    const down = model.bgp.filter((s) => s.state !== 'Established');
    if (down.length) g.push(block(ctx, reg, ctx.W - f * 8, f * 2.6, [`${down.length} not established`, down.map((s) => `${s.a}–${s.b} ${s.state}`).join(', ')], { color: C.rpl }));
  }
  if (id === 'mpls') {
    g.push(...ghost(ctx, ends, reg));
    for (const l of model.links) if (l.adj) { const [a, b] = ends.get(l.id); g.push(line(a, b, C.igp, f * 0.1, ' stroke-opacity="0.45"')); }
    const seen = new Map();
    for (const t of [...model.policies.map((x) => ({ ...x, kind: 'policy' })), ...model.tunnels.map((x) => ({ ...x, kind: 'tunnel' }))]) {
      if (!t.a || !t.b || !nodes.has(t.a) || !nodes.has(t.b)) continue;
      if (t.path?.length > 1) g.push(`<polyline points="${t.path.filter((x) => nodes.has(x)).map(at).map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${C.mpls}" stroke-width="${r1(f * 0.16)}" stroke-dasharray="${f * 0.5} ${f * 0.35}" stroke-opacity="0.8"/>`);
      const key = [t.a, t.b].sort().join('|');
      const k = seen.get(key) ?? 0;
      seen.set(key, k + 1);
      const { path, apex } = arc(at(t.a), at(t.b), k, t.valid === false ? C.rpl : C.mpls);
      const lines = t.kind === 'policy' ? [t.name, `color ${t.color}${t.sids ? ` · ${t.sids}` : ''}`] : [t.name, 'MPLS-TP'];
      g.push(`<g>${title(`${t.name}\n${t.kind === 'policy' ? `SR policy, color ${t.color}, segments ${t.sids || '?'}${t.valid === false ? ', not valid' : ''}` : 'MPLS-TP co-routed tunnel'}${t.path ? `\npath ${t.path.join(' → ')}` : ''}`)}${path}${block(ctx, reg, apex.x, apex.y > ctx.H * 0.55 ? apex.y + f * 0.4 : apex.y - f * 0.4, lines, { color: C.mpls, up: apex.y <= ctx.H * 0.55 })}</g>`);
    }
  }

  if (id === 'srv6') {
    g.push(...ghost(ctx, ends, reg, { names: false }));
    model.algorithms.forEach((a, i) => {
      for (const lid of a.links) {
        const e = ends.get(lid);
        if (!e) continue;
        const off = (i + 1) * f * 0.35;
        g.push(`<g>${title(`Flex-Algo ${a.algorithm}${a.metric ? `, ${a.metric} metric` : ''}`)}${line({ x: e[0].x, y: r1(e[0].y + off) }, { x: e[1].x, y: r1(e[1].y + off) }, ALGO[i % ALGO.length], f * 0.14, ' stroke-opacity="0.85"')}</g>`);
      }
    });
    for (const n of model.nodes) {
      if (!n.locators.length) continue;
      const p = at(n.id);
      g.push(dot(p, C.srv6));
      g.push(`<g>${title(deviceDetail(n, model))}${outward(ctx, reg, p, f * 0.8, [n.id, ...n.locators.slice(0, 2)], { color: C.srv6 })}</g>`);
    }
  }

  if (id === 'vrf') {
    g.push(...ghost(ctx, ends, reg));
    model.vrfs.forEach((v, i) => {
      for (let x = 1; x < v.pes.length; x++) {
        const { path, apex } = arc(at(v.pes[0]), at(v.pes[x]), i, C.vrf, `${f * 0.6} ${f * 0.3}`);
        g.push(`<g>${title(`VRF ${v.name}: ${v.pes.join(', ')}`)}${path}${x === 1 ? block(ctx, reg, apex.x, apex.y > ctx.H * 0.55 ? apex.y + f * 0.4 : apex.y - f * 0.4, [`VRF ${v.name}`, plural(v.pes.length, 'PE')], { color: C.vrf, up: apex.y <= ctx.H * 0.55 }) : ''}</g>`);
      }
    });
    for (const n of model.nodes) if (n.vrfs.length) g.push(dot(at(n.id), C.vrf));
    for (const n of model.nodes) if (n.host) { const p = at(n.id); g.push(`<g>${title(deviceDetail(n, model))}${dot(p, C.host)}${outward(ctx, reg, p, f * 0.9, [n.id, n.loopback ?? ''].filter(Boolean), { color: C.host })}</g>`); }
  }

  if (id === 'evpn') {
    g.push(...ghost(ctx, ends, reg));
    model.evpn.forEach((e, i) => {
      for (let x = 1; x < e.members.length; x++) {
        const { path, apex } = arc(at(e.members[0]), at(e.members[x]), i, e.state && e.state !== 'Up' ? C.rpl : C.evpn);
        g.push(`<g>${title(`EVI ${e.evi} (${e.type ?? '?'}): ${e.members.join(', ')}${e.state ? `, ${e.state}` : ''}`)}${path}${x === 1 ? block(ctx, reg, apex.x, apex.y > ctx.H * 0.55 ? apex.y + f * 0.4 : apex.y - f * 0.4, [`EVI ${e.evi}`, (e.type ?? '').toUpperCase()], { color: C.evpn, up: apex.y <= ctx.H * 0.55 }) : ''}</g>`);
      }
    });
    for (const id2 of new Set(model.evpn.flatMap((e) => e.members))) g.push(dot(at(id2), C.evpn));
  }
  return g;
}
