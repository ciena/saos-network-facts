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

import { deviceDetail, equipmentTag, layerModel, noteLayerOf, wrapNote } from './model.js';

const C = {
  ink: '#1d2430', mute: '#5b6675', ghost: '#c3cad3', ghostInk: '#8a94a3',
  p: '#1f5fa8', pe: '#c8202f', ce: '#4b7f52', l2: '#6a5acd', host: '#3d7f8f', plain: '#8a94a3',
  link: '#69768a', ring: '#d29a1e', subRing: '#4f9fe8', rpl: '#f0883e', igp: '#2e9e5b',
  mpls: '#b7791f', srv6: '#e8590c', pw: '#d63384', cfm: '#1a9fae', bgp: '#7d4cc2', vrf: '#5b5fc7', evpn: '#a65fd6',
  optical: '#3b5bdb', site: '#7a8696', note: '#fff6d5', noteEdge: '#d9a400',
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
    case 'optical': {
      const members = m.nodes.filter((n) => n.member).length;
      const spans = m.links.filter((l) => l.medium === 'optical').length;
      return `Optical · ${plural(members, 'line-system member')}, ${plural(spans, 'span')}${m.sites.length ? ` · ${plural(m.sites.length, 'site')}` : ''}`;
    }
    case 'physical': {
      const oses = [...new Set(m.nodes.map((n) => n.os).filter(Boolean))];
      const optical = m.links.filter((l) => l.medium === 'optical').length;
      return `Physical · ${plural(m.nodes.length, 'device')}${oses.length === 1 ? ` (${oses[0]})` : ''}, ${plural(m.links.length, 'link')}${optical ? ` (${optical} optical)` : ''}${m.sites.length ? ` · ${plural(m.sites.length, 'site')}` : ''}`;
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
export function renderFrames(m, positions, { frames, start, period = 4 }) {
  const P = positions;
  const xs = Object.values(P).map((p) => p.x), ys = Object.values(P).map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  // Fonts grow with the drawing so a big lab still reads when a card scales it down; the grid is in
  // font units so three label lines fit between rows.
  const f = Math.round(13 * Math.max(1, ((maxX - minX) * 160 + 300) / 760));
  const U = Math.max(160, f * 9.4), V = f * 7.6;
  // A site frame's name sits on its top edge, above the device labels: a line more at the top.
  const mx = f * 5.5, myTop = f * (m.sites.length ? 8.6 : 7.4), myBot = f * 6.6;
  // An optical frame takes the line system off the others (render/model.js layerModel).
  const split = frames.includes('optical');
  const titles = Object.fromEntries(frames.map((id) => [id, frameTitle(id, layerModel(m, id, split))]));
  // Wide enough for the longest title, so a small lab keeps its titles whole.
  const W = Math.ceil(Math.max((maxX - minX) * U + 2 * mx, Math.max(...Object.values(titles).map((t) => t.length)) * f * 1.15 * 0.6 + f * 2.4));
  // Free notes (no device) sit along the bottom edge: room for the frame with the most of them.
  const freeLines = Math.max(0, ...frames.map((id) => notesOn(m, id, frames).filter((x) => !x.device).reduce((k, x) => k + wrapNote(x.text, 60).length, 0)));
  const notesH = freeLines ? freeLines * f * 1.0 + f * 1.4 : 0;
  const H = Math.ceil((maxY - minY) * V + myTop + myBot + notesH);
  const ox = (W - ((maxX - minX) * U + 2 * mx)) / 2;
  const at = (id) => ({ x: r1(ox + mx + (P[id].x - minX) * U), y: r1(myTop + (P[id].y - minY) * V) });
  const nodes = new Map(m.nodes.map((n) => [n.id, n]));
  const ctx = { model: m, full: m, at, f, nodes, W, H, frames, notesH };
  const order = start && frames.includes(start) ? [...frames.filter((x) => x !== start), start] : frames;

  const open = `<svg xmlns="http://www.w3.org/2000/svg" class="netfacts-frames" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" data-frames="${frames.join(' ')}" data-start="${start ?? ''}">`;
  const head = `<title>${esc(m.name)}</title>`;
  const background = `<rect id="still" width="${W}" height="${H}" fill="#fff"/>`;
  const groups = {};
  for (const id of order) {
    const lm = layerModel(m, id, split);
    const g = draw(id, { ...ctx, model: lm, nodes: new Map(lm.nodes.map((n) => [n.id, n])) });
    g.push(`<rect width="${W}" height="${r1(f * 2.5)}" fill="#fff" fill-opacity="0.92"/><text x="${r1(f * 1.1)}" y="${r1(f * 1.7)}" font-size="${r1(f * 1.15)}" font-weight="700" fill="${id === 'physical' ? C.ink : C[id] ?? C.ink}">${esc(titles[id])}</text>`);
    groups[id] = `<g class="frame r${rotIndex(frames, start, id)}${id === start ? ' start' : ''}" id="f-${id}" data-title="${esc(titles[id])}">${g.join('')}</g>`;
  }
  const svg = [open, head, `<style>${frameStyle(frames, start, { period })}</style>`, background, ...order.map((id) => groups[id]), '</svg>'].join('\n');
  // One frame on its own, no CSS: for rasterisers that run no animation (png.js).
  const still = (id) => {
    if (!groups[id]) throw new Error(`no frame "${id}"`);
    return [open, head, background, groups[id].replace(' class="frame', ' class="still-frame'), '</svg>\n'].join('\n');
  };
  return { svg: `${svg}\n`, frames: frames.map((id) => ({ id, title: titles[id] })), start, period, width: W, height: H, still };
}

// A frame's place in the rotation: 0 for the start frame, then the frames after it in the list, round.
export function rotIndex(frames, start, id) {
  const s = Math.max(0, frames.indexOf(start));
  return (frames.indexOf(id) - s + frames.length) % frames.length;
}

// The frames' CSS. Static: the start frame shows (any SVG viewer, CSS animation or not); #f-<layer>
// shows that frame instead. Moving: when nothing is targeted and motion is welcome, every frame runs
// one animation of N periods, staggered by a negative delay so the start frame shows at t = 0, then the
// next frame in the list, and so on round. A targeted frame stops it (:has(:target)), as does
// prefers-reduced-motion and an inlining page that sets data-rotate="off" on the <svg>. One frame: no
// animation. A hard cut (visibility, step-end): nothing is redrawn between switches, so 20 cards on a
// page cost ~6% of a core where a 0.4 s crossfade cost ~37% (headless Chromium, software rendering).
export function frameStyle(frames, start, { period = 4 } = {}) {
  const n = frames.length;
  const css = ['.frame{visibility:hidden}.frame.start{visibility:visible}', ':root:has(.frame:target) .frame{visibility:hidden}:root:has(.frame:target) .frame:target{visibility:visible}'];
  // #still: the start frame, not moving. An <img> does not see the page's prefers-reduced-motion, so
  // a page serves frames.svg#still for it: <picture><source media="(prefers-reduced-motion: reduce)"
  // srcset="frames.svg#still"><img src="frames.svg"></picture>.
  if (n < 2) return css.join('');
  const cycle = n * period;
  // rounded down, so a frame is hidden by the time the next one shows (never two at a boundary)
  const pct = (t) => `${Math.floor((t / cycle) * 1e5) / 1e3}%`;
  const keyframes = `@keyframes nf-rotate{0%{visibility:visible}${pct(period)},100%{visibility:hidden}}`;
  // Classes, not ids, so the stop rules (more specific) win over the animation.
  const rules = frames.map((_, k) => (k ? `.r${k}{animation-delay:${-(n - k) * period}s}` : ''));
  css.push(`@media (prefers-reduced-motion:no-preference){${keyframes}.frame{animation:nf-rotate ${cycle}s step-end infinite}${rules.join('')}:root:has(.frame:target) .frame,:root:has(#still:target) .frame,:root[data-rotate="off"] .frame{animation:none}}`);
  return css.join('');
}

// A label block, first line bold; anchored centre-top at (x, y) or above, kept off earlier blocks.
function block(ctx, reg, x, y, lines, { color = C.ink, anchor = 'middle', up = false, fill = '#fff', stroke = null, bold = true, fixed = false } = {}) {
  const { f } = ctx;
  const sz = (i) => (i === 0 && bold ? f : f * 0.85);
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
  for (let i = 1; i < 24 && !fixed && hit(y0); i++) {
    const step = Math.ceil(i / 2) * (h * 0.55) * (i % 2 ? 1 : -1) * (up ? -1 : 1);
    y0 = base + step;
  }
  if (hit(y0)) y0 = base;
  reg.push({ x: x0, y: y0, w, h });
  return `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(f * 0.3)}" fill="${fill}" fill-opacity="0.9"${stroke ? ` stroke="${stroke}" stroke-width="${r1(f * 0.08)}"` : ''}/>` +
    lines.map((l, i) => `<text x="${r1(x0 + w / 2)}" y="${r1(y0 + f * 0.95 + i * lh)}" font-size="${r1(sz(i))}" text-anchor="middle"${i === 0 && bold ? ' font-weight="700"' : ''} fill="${i === 0 && bold ? color : bold ? C.mute : C.ink}">${esc(l)}</text>`).join('');
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
    g.push(line(a, b, C.ghost, ctx.f * (l.medium === 'optical' ? 0.3 : 0.12), l.plain && l.medium !== 'optical' ? ' stroke-dasharray="5 4"' : ''));
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
  const g = siteFrames(ctx, reg, id === 'physical' || id === 'optical');
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

  // The physical frame, and the optical frame (the line system and the routers at its ends) drawn alike.
  if (id === 'physical' || id === 'optical') {
    const mixed = new Set(model.nodes.map((n) => n.os).filter(Boolean)).size > 1;
    const pillW = (text) => String(text).length * f * 0.75 * 0.6 + f * 0.6;
    const pair = (l) => [l.a.node, l.b.node].sort().join('|');
    const pairs = new Map();
    for (const l of model.links) pairs.set(pair(l), [...(pairs.get(pair(l)) ?? []), l.id]);
    for (const l of model.links) {
      const [a, b] = ends.get(l.id);
      // A routed link over the line system says so (`over ch 25`) where it has no label of its own.
      const caption = l.caption ?? l.over;
      const tip = `${l.a.node} ${l.a.port} — ${l.b.node} ${l.b.port}${l.medium ? `\n${l.medium}${l.caption ? `: ${l.caption}` : ''}` : l.caption ? `\n${l.caption}` : ''}${l.over ? `\n${l.over}` : ''}${l.subnet ? `\n${l.subnet}` : ''}`;
      // An optical span: a fibre, drawn as a blue double line (white core).
      const body = l.medium === 'optical'
        ? `${line(a, b, C.optical, f * 0.42, ' stroke-linecap="round"')}${line(a, b, '#fff', f * 0.14, ' stroke-linecap="round"')}`
        : line(a, b, l.plain ? C.plain : C.link, f * 0.16, l.plain ? ' stroke-dasharray="6 5"' : '');
      // The caption on the link, staggered along parallel links; the port pills only where they fit
      // between the device and the caption (else the ports are in the hover title only).
      const sibs = pairs.get(pair(l));
      const t = 0.5 + (sibs.indexOf(l.id) - (sibs.length - 1) / 2) * 0.3;
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const cw = caption ? pillW(caption) : 0;
      const fits = (port, tp) => !caption || (Math.min(tp, 1 - tp) * len - pillW(port) / 2 > f * 1.4 && Math.abs(t - tp) * len > (cw + pillW(port)) / 2 + 2);
      const pa = l.a.port ?? '?', pb = l.b.port ?? '?';
      const ports = fits(pa, 0.24) && fits(pb, 0.76) ? `${pill(lerp(a, b, 0.24), pa, '#9aa4b1')}${pill(lerp(a, b, 0.76), pb, '#9aa4b1')}` : '';
      const cap = caption ? pill(lerp(a, b, t), caption, l.medium === 'optical' || !l.caption ? C.optical : '#9aa4b1') : '';
      g.push(`<g${l.medium ? ` class="link-${esc(l.medium)}"` : ''}>${title(tip)}${body}${ports}${cap}</g>`);
      if (caption) { const c = lerp(a, b, t); reg.push({ x: c.x - cw / 2, y: c.y - f * 0.55, w: cw, h: f * 1.1 }); }
    }
    for (const n of model.nodes) {
      const p = at(n.id);
      // A line-system member (a box without facts that has an equipment role) is meant to have no
      // facts: solid, in the optical colour, tagged with its equipment.
      const eq = n.plain ? equipmentTag(n) : null;
      const col = eq ? C.optical : C[n.role] ?? C.plain;
      const s = f * (n.rr ? 1.6 : 1.3);
      const tag = eq ?? (ROLE_TAG[n.role] ?? '') + (n.rr ? '·RR' : '');
      g.push(`<g>${title(deviceDetail(n, model))}<rect x="${r1(p.x - s)}" y="${r1(p.y - s * 0.6)}" width="${r1(2 * s)}" height="${r1(1.2 * s)}" rx="${r1(s * 0.2)}" fill="${col}"${n.plain && !eq ? ' fill-opacity="0.35" stroke-dasharray="4 3"' : ''} stroke="${n.plain && !eq ? C.plain : '#fff'}" stroke-width="${r1(f * 0.1)}"/><text x="${p.x}" y="${r1(p.y + f * 0.35)}" font-size="${r1(f * (eq && tag.length > 3 ? 0.62 : 0.8))}" font-weight="700" text-anchor="middle" fill="#fff">${esc(tag)}</text></g>`);
      reg.push({ x: p.x - s, y: p.y - s * 0.6, w: 2 * s, h: 1.2 * s });
    }
    for (const n of model.nodes) {
      const p = at(n.id);
      const sub = n.plain ? (n.equipment ? [n.equipment, n.type] : [n.type, 'no facts']) : [n.type, mixed ? n.os : null];
      g.push(outward(ctx, reg, p, f * 1.0, [n.id, sub.filter(Boolean).join(' · ')], { color: n.plain && n.equipment ? C.optical : C[n.role] ?? C.plain }));
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
  g.push(...drawNotes(id, ctx, reg));
  return g;
}

// A note's frame: its layer when the drawing has that frame, else physical.
function notesOn(m, id, frames) {
  return m.notes.filter((x) => noteLayerOf(x, m, frames) === id);
}

// Sites (schema 1.9): a rounded frame round each site's devices and their labels (above a device in
// the top half, below it in the bottom half, as outward() places them), its name on the top edge,
// under everything else; strong on the physical frame, faint on the others so they keep their bearings.
function siteFrames(ctx, reg, strong) {
  const { f, at, model, H } = ctx;
  const g = [];
  for (const site of model.sites) {
    const ps = site.nodes.map(at);
    const x0 = Math.min(...ps.map((p) => p.x)) - f * 4.4, x1 = Math.max(...ps.map((p) => p.x)) + f * 4.4;
    const y0 = Math.min(...ps.map((p) => p.y - (p.y > H * 0.5 ? f * 1.6 : f * 4.6)));
    const y1 = Math.max(...ps.map((p) => p.y + (p.y > H * 0.5 ? f * 4.4 : f * 1.6)));
    const nw = site.name.length * f * 0.85 * 0.62 + f * 0.8;
    g.push(`<g class="site">${title(`site ${site.name}: ${site.nodes.join(', ')}`)}<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" rx="${r1(f * 0.8)}" fill="${C.site}" fill-opacity="${strong ? 0.06 : 0.03}" stroke="${C.site}" stroke-opacity="${strong ? 0.8 : 0.35}" stroke-width="${r1(f * 0.09)}" stroke-dasharray="${r1(f * 0.6)} ${r1(f * 0.35)}"/><rect x="${r1(x0 + f * 0.7)}" y="${r1(y0 - f * 0.6)}" width="${r1(nw)}" height="${r1(f * 1.2)}" fill="#fff"/><text x="${r1(x0 + f * 1.1)}" y="${r1(y0 + f * 0.3)}" font-size="${r1(f * 0.85)}" font-weight="700" fill="${C.site}"${strong ? '' : ' fill-opacity="0.6"'}>${esc(site.name)}</text></g>`);
    reg.push({ x: x0 + f * 0.7, y: y0 - f * 0.6, w: nw, h: f * 1.2 });
  }
  return g;
}

// Notes (schema 1.9) on this frame: one on a device in a yellow block beside it with a leader line,
// the free ones along the bottom edge.
function drawNotes(id, ctx, reg) {
  const { f, at, model, frames, H, notesH } = ctx;
  const g = [];
  const mine = notesOn(ctx.full, id, frames);
  for (const x of mine.filter((n) => n.device)) {
    const p = at(x.device);
    const lines = wrapNote(x.text, 26);
    // The first free spot beside it (right, then left; level, a little below, a little above, further
    // below, further above), else the one that overlaps least.
    const w = Math.max(...lines.map((l) => l.length * f * 0.85 * 0.58)) + f * 0.6, h = lines.length * f * 1.15 + f * 0.35;
    const spots = [-h / 2, f * 1.2, -f * 1.2 - h, f * 2.6, -f * 2.6 - h].flatMap((dy) => [f * 2.2, f * 4.4].flatMap((dx) => [[p.x + dx, p.y + dy], [p.x - dx - w, p.y + dy]]));
    const overlap = ([sx, sy]) => (sx < 2 || sx + w > ctx.W - 2 || sy < f * 2.6 || sy + h > H - notesH ? Infinity
      : reg.reduce((k, r) => k + Math.max(0, Math.min(sx + w, r.x + r.w) - Math.max(sx, r.x)) * Math.max(0, Math.min(sy + h, r.y + r.h) - Math.max(sy, r.y)), 0));
    const [sx, sy] = spots.find((q) => overlap(q) === 0) ?? spots.reduce((best, q) => (overlap(q) < overlap(best) ? q : best));
    const b = block(ctx, reg, sx, sy, lines, { anchor: 'start', fill: C.note, stroke: C.noteEdge, bold: false, fixed: true });
    const r = reg.at(-1);
    const q = { x: r1(Math.max(r.x, Math.min(p.x, r.x + r.w))), y: r1(Math.max(r.y, Math.min(p.y, r.y + r.h))) };
    g.push(`<g class="note">${title(`${x.device}: ${x.text}`)}${line(p, q, C.noteEdge, f * 0.08, ` stroke-dasharray="${r1(f * 0.25)} ${r1(f * 0.2)}"`)}${b}</g>`);
  }
  let y = H - notesH + f * 0.6;
  for (const x of mine.filter((n) => !n.device)) {
    const lines = wrapNote(x.text, 60);
    const w = Math.max(...lines.map((l) => l.length)) * f * 0.85 * 0.58 + f * 0.8;
    const h = lines.length * f * 1.0 + f * 0.4;
    g.push(`<g class="note">${title(x.text)}<rect x="${r1(f)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(f * 0.3)}" fill="${C.note}" stroke="${C.noteEdge}" stroke-width="${r1(f * 0.08)}"/>${lines.map((l, i) => `<text x="${r1(f * 1.4)}" y="${r1(y + f * 0.95 + i * f)}" font-size="${r1(f * 0.85)}" fill="${C.ink}">${esc(l)}</text>`).join('')}</g>`);
    y += h + f * 0.2;
  }
  return g;
}
