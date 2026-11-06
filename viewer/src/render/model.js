// SPDX-License-Identifier: Apache-2.0
// The render model: what a frame or a snapshot plane says about a lab, from the importer's topology
// (import/facts.js, plain boxes included), the engine's network and the facts records (model,
// platform, extractor). Nothing is drawn here; frames.js and snapshot.js draw it on the positions of
// the library layout (js/src/layout.ts layoutFacts), the same the 3D page uses.

import { isisArea } from '../../../js/src/index.ts';
import { nodeSid } from '../engine/mpls.js';
import { drawnLinks, drawnNodes } from '../import/facts.js';

const OS = { saos10: 'SAOS 10', saos6: 'SAOS 6/8' };

const ringRoleName = (m) => (m.rpl === 'owner' ? 'RPL owner' : m.rpl === 'neighbor' || m.rpl === 'neighbour' ? 'RPL neighbour' : m.terminates ? 'interconnection' : 'member');

function pwVia(end) {
  const t = end.transport ?? {};
  if (t.kind === 'sr-policy') return `SR policy ${t.policy}`;
  if (t.kind === 'mpls-tp') return `MPLS-TP ${t.tunnel}`;
  if (t.kind === 'srv6') return 'SRv6';
  return { sr: 'SR-MPLS LSP', 'sr-mpls': 'SR-MPLS LSP', ldp: 'LDP LSP', none: 'static' }[t.kind ?? end.underlay] ?? t.kind ?? end.underlay ?? '';
}

export function renderModel(imp, net) {
  const { topology: topo, file, devices } = imp;
  const records = new Map(file.devices.map((r) => [r.device, r]));

  const ringRoles = new Map();
  for (const r of topo.rings ?? []) {
    for (const m of r.nodes ?? []) ringRoles.set(m.node, [...(ringRoles.get(m.node) ?? []), { ring: r.name ?? r.id, type: r.type, role: ringRoleName(m) }]);
  }
  const meps = new Map();
  for (const meg of net.cfm?.megs ?? []) for (const m of meg.meps) meps.set(m.node, [...(meps.get(m.node) ?? []), { mep: m.mepId, meg: meg.id, level: meg.level }]);
  const vrfsOf = new Map();
  for (const v of net.l3vpn?.vrfs ?? topo.vrfs ?? []) for (const s of v.sites ?? []) vrfsOf.set(s.pe, [...(vrfsOf.get(s.pe) ?? []), v.name]);
  const locators = new Map();
  for (const l of net.srv6?.locators ?? []) locators.set(l.node, [...(locators.get(l.node) ?? []), l]);

  const nodes = drawnNodes(topo).map((n) => {
    const f = devices.get(n.id) ?? {};
    const rec = records.get(n.id) ?? {};
    const isis = f.isis?.instances?.[0];
    const bgp = f.bgp?.instances?.[0];
    const sid = !n.plain && !n.host && topo.srgb && (n.sidIndex != null || n.sidLabel != null) ? nodeSid(topo, net.vendor, n) : null;
    return {
      id: n.id,
      role: n.plain ? 'plain' : n.host ? 'host' : n.role,
      plain: !!n.plain,
      host: !!n.host,
      rr: !!n.rr,
      type: rec.type ?? n.type ?? (n.host ? n.kind ?? 'host' : null),
      platform: rec.platform ?? null,
      os: OS[rec.extractor] ?? null,
      reason: n.plain ? n.reason ?? n.status ?? null : null,
      loopback: n.loopback ?? (n.host ? n.addresses?.[0] ?? null : null),
      sid,
      isis: isis ? { area: isisArea(isis), level: isis.level?.replace('level-', 'L') ?? null, systemId: n.systemId ?? null, sr: !!isis.sr_enabled } : null,
      asn: bgp?.as ?? null,
      vrfs: (vrfsOf.get(n.id) ?? []).filter((v, i, a) => a.indexOf(v) === i),
      rings: ringRoles.get(n.id) ?? [],
      meps: meps.get(n.id) ?? [],
      locators: (locators.get(n.id) ?? []).map((l) => l.prefix),
      site: n.site ?? null,
      equipment: n.equipment ?? null,
      // A line-system member: a box without facts with an equipment role (schema 1.9 devices[].role).
      member: !!(n.plain && n.equipment),
      // A box without facts whose record names its network role (import/facts.js networkRole).
      given: n.plain && ['ce', 'pe', 'p'].includes(n.role) ? n.role : null,
    };
  });
  // A lab with no IGP router: its devices are L2 switches, not CEs.
  if (!nodes.some((n) => n.role === 'p' || n.role === 'pe')) for (const n of nodes) if (n.role === 'ce') n.role = 'l2';
  // The network role the role frame shows: CE, PE or P as the importer derives it from the facts, or a
  // record's own role for a device without facts; none for an L2 switch, a host or a line-system member.
  for (const n of nodes) n.net = n.given ?? (['ce', 'pe', 'p'].includes(n.role) ? n.role : null);

  const adj = new Map((net.igp?.adjacencies ?? []).map((a) => [a.link, a]));
  const ringOf = new Map();
  for (const r of net.g8032?.rings ?? []) {
    for (const l of r.links) {
      const rpl = r.blocked.find((b) => b.link === l && b.why === 'RPL');
      ringOf.set(l, { ring: r.name ?? r.id, type: r.type, rpl: rpl?.node ?? null });
    }
  }
  const links = drawnLinks(topo).map((l) => ({
    id: l.id,
    a: { node: l.a.node, port: l.a.port ?? l.a.if ?? null },
    b: { node: l.b.node, port: l.b.port ?? l.b.if ?? null },
    subnet: l.subnet ?? null,
    metric: l.metric ?? null,
    adj: adj.get(l.id)?.state ?? null,
    lag: l.members?.length > 1 ? l.members.length : 0,
    ring: ringOf.get(l.id) ?? null,
    plain: !!l.plain,
    medium: l.medium ?? null,
    caption: l.caption ?? null,
    over: l.over ?? null,
    lightpath: false,
  }));
  // The connections over a line system (import/facts.js lightpathsOf): drawn on the physical layer only.
  for (const x of topo.lightpaths ?? []) links.push({ id: x.id, a: { ...x.a }, b: { ...x.b }, subnet: null, metric: null, adj: null, lag: 0, ring: null, plain: false, medium: null, caption: null, over: x.over, lightpath: true, via: x.via });

  const pws = (net.vpws?.pseudowires ?? []).map((pw) => {
    const [a, b] = pw.ends;
    return { id: pw.id, a: a.node, b: b.node, name: pw.service, type: pw.serviceType ?? 'vpws', via: pwVia(a), labels: `${a.localLabel ?? '?'}/${a.remoteLabel ?? '?'}`, path: a.transport?.path ?? null };
  });
  const policies = (net.sr?.policies ?? []).map((p) => ({ id: p.name, a: p.headend, b: p.endpointNode ?? null, name: p.name, color: p.color, valid: p.valid !== false, path: p.path ?? null, sids: (p.segmentList?.sids ?? []).join(' ') }));
  const tunnels = (net.tp?.tunnels ?? []).map((t) => ({ id: t.name ?? t.id, a: t.ingress ?? t.head ?? t.path?.[0] ?? null, b: t.egress ?? t.tail ?? t.path?.at(-1) ?? null, name: t.name ?? t.id, path: t.path ?? t.nodes ?? null }));
  const megs = (net.cfm?.megs ?? []).filter((m) => m.meps.length === 2).map((m) => ({ id: m.id, a: m.meps[0].node, b: m.meps[1].node, label: `${m.id} L${m.level} ${m.intervalMs >= 1000 ? `${m.intervalMs / 1000} s` : `${m.intervalMs} ms`}` }));
  const bgp = (net.bgp?.sessions ?? []).map((s) => ({ a: s.a, b: s.b, state: s.state, client: s.client ?? null }));
  const evpn = (net.evpn?.instances ?? []).map((i) => ({ id: i.id, evi: i.evi, type: i.type, state: i.state ?? null, members: i.members.map((m) => m.node) }));
  const vrfs = (net.l3vpn?.vrfs ?? []).filter((v) => v.role !== 'management' && v.sites?.length).map((v) => ({ name: v.name, pes: [...new Set(v.sites.map((s) => s.pe))] }));
  const algorithms = (net.srv6?.algorithms ?? []).filter((a) => a.algorithm !== 0).map((a) => ({ algorithm: a.algorithm, links: a.links ?? [], metric: a.definition?.metricType ?? null }));

  return {
    name: topo.name,
    igp: topo.igp,
    srgb: topo.srgb ?? null,
    labelMode: imp.labelMode,
    nodes,
    links,
    rings: (net.g8032?.rings ?? []).map((r) => ({ id: r.id, name: r.name ?? r.id, type: r.type, nodes: r.nodes, links: r.links, state: r.state, vid: r.rapsVid ?? null })),
    pws,
    policies,
    tunnels,
    megs,
    bgp,
    evpn,
    vrfs,
    algorithms,
    areas: [...new Set(nodes.map((n) => n.isis?.area).filter(Boolean))],
    sites: topo.sites ?? [],
    notes: topo.notes ?? [],
  };
}

// The view layers (js/src/view.ts LAYER_IDS) this lab has something to draw on.
export function presentLayers(m) {
  const has = {
    optical: m.nodes.some((n) => n.member) || m.links.some((l) => l.medium === 'optical'),
    physical: true,
    role: m.nodes.some((n) => n.net),
    ring: m.rings.length > 0,
    igp: m.links.some((l) => l.adj),
    mpls: m.policies.length > 0 || m.tunnels.length > 0,
    srv6: m.nodes.some((n) => n.locators.length) || m.algorithms.length > 0,
    bgp: m.bgp.length > 0,
    vrf: m.vrfs.length > 0,
    pw: m.pws.length > 0,
    evpn: m.evpn.length > 0,
    cfm: m.megs.length > 0,
  };
  return Object.keys(has).filter((k) => has[k]);
}

// Whether a device is a router, for its symbol on the physical frame: a Ciena SAOS device (its type a Ciena
// model number, 3984, 5164, 8110, or its record a SAOS extractor's), SAOS 6 and 8 switches included (they
// route and switch as the SAOS 10 ones do, and one symbol keeps a mixed lab even). A Waveserver, a
// third-party box, an ELS shelf or a type the library does not know is not.
export function isRouter(n) {
  return /^\d{4}/.test(String(n?.type ?? '')) || !!n?.os;
}

// The model a device type names, short enough for its box: the model number with its variant (3984,
// 3926v2, 5170), else the type's leading letters (WSAi, JNP, ELS), at most six characters; '?' without one.
export function typeTag(type) {
  const t = String(type ?? '').trim();
  if (!t) return '?';
  const num = /^\d{4}(v\d)?/i.exec(t);
  if (num) return num[0];
  return (/^[a-z]+/i.exec(t)?.[0] ?? t).slice(0, 6);
}

// A short tag for a device's box: its role (P, PE, CE...), or for a box without facts its
// equipment (a line-system member's role from the extra file: ROADM, AMP, OT), else '?'.
const EQUIPMENT_TAG = { roadm: 'ROADM', amplifier: 'AMP', ila: 'ILA', terminal: 'OT', transponder: 'OT', muxponder: 'MXP', router: 'R', switch: 'SW' };
export function equipmentTag(n) {
  if (!n.equipment) return null;
  const e = n.equipment.toLowerCase();
  return EQUIPMENT_TAG[e] ?? e.replace(/[^a-z0-9]/g, '').slice(0, 4).toUpperCase();
}

// Notes wrapped to short lines (about `width` characters), at most `max` lines, the last cut with an ellipsis.
export function wrapNote(text, width = 34, max = 3) {
  const lines = [];
  let cur = '';
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    if (cur && (cur + ' ' + w).length > width) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  if (lines.length > max) { lines.length = max; lines[max - 1] = `${lines[max - 1].slice(0, width - 1)}…`; }
  return lines;
}

// The part of the model a layer draws. With an optical layer (`split`), line-system members and the
// links to them, and the optical spans, are on it, with the routers at their ends; the protocol layers
// leave the members and their links out (a link between two routers stays, an optical one too). The
// physical layer keeps the connections over the line system (lightpaths) and, with `cabling` (the
// frames), the whole line system too: every cable, so the routers are seen joined through it; without
// (the snapshot, whose optical plane is under it) it leaves the members out like the others. Without an
// optical layer, every layer has everything. Never an express span (isExpress); lightpaths on physical only.
export function layerModel(m, id, split, { cabling = false } = {}) {
  const shown = m.links.filter((l) => !isExpress(m, l) && (id === 'physical' || !l.lightpath));
  if (!split) return shown.length === m.links.length ? m : { ...m, links: shown };
  const members = new Set(m.nodes.filter((n) => n.member).map((n) => n.id));
  const toMember = (l) => members.has(l.a.node) || members.has(l.b.node);
  if (id === 'optical') {
    const links = shown.filter((l) => toMember(l) || l.medium === 'optical');
    const ends = new Set(links.flatMap((l) => [l.a.node, l.b.node]));
    const nodes = m.nodes.filter((n) => n.member || ends.has(n.id));
    return { ...m, nodes, links, sites: sitesOf(m, nodes) };
  }
  if (id === 'physical' && cabling) return { ...m, links: shown };
  const nodes = m.nodes.filter((n) => !n.member);
  return { ...m, nodes, links: shown.filter((l) => !toMember(l)), sites: sitesOf(m, nodes) };
}

// The part of the model a 2D card's frame draws in a lab with a line system (frames.js; the 3D page and
// the snapshot use layerModel). The optical frame: the line system alone, its members and the spans
// between them (an optical link between two routers too, with them), and a callout for each router
// cable to a member: `PE-1 2/1 · ch 25` at the member, the cable's label as its channel, else `ch N`
// for a port that is a number, else the port. Every other frame: the devices off the line system, and on
// the physical frame each connection over it (lightpath) between its routers. Never an express span.
export function cardLayer(m, id) {
  const members = new Set(m.nodes.filter((n) => n.member).map((n) => n.id));
  const toMember = (l) => members.has(l.a.node) || members.has(l.b.node);
  const shown = m.links.filter((l) => !isExpress(m, l) && (id === 'physical' || !l.lightpath));
  if (id === 'optical') {
    const links = shown.filter((l) => !l.lightpath && (members.has(l.a.node) && members.has(l.b.node) || (l.medium === 'optical' && !toMember(l))));
    const ends = new Set(links.flatMap((l) => [l.a.node, l.b.node]));
    const nodes = m.nodes.filter((n) => n.member || ends.has(n.id));
    const callouts = [];
    for (const l of shown) {
      if (l.lightpath || members.has(l.a.node) === members.has(l.b.node)) continue;
      const [mem, rtr] = members.has(l.a.node) ? [l.a, l.b] : [l.b, l.a];
      const channel = l.caption ?? (/^\d+$/.test(String(mem.port ?? '')) ? `ch ${mem.port}` : mem.port ?? '?');
      callouts.push({ member: mem.node, port: mem.port ?? null, router: rtr.node, routerPort: rtr.port ?? null, text: `${rtr.node} ${rtr.port ?? '?'} · ${channel}` });
    }
    return { ...m, nodes, links, sites: sitesOf(m, nodes), callouts };
  }
  const nodes = m.nodes.filter((n) => !n.member);
  return { ...m, nodes, links: shown.filter((l) => !toMember(l)), sites: sitesOf(m, nodes) };
}

// A lab with an optical line system: its members are off the protocol layers.
export const hasLineSystem = (m) => m.nodes.some((n) => n.member) || m.links.some((l) => l.medium === 'optical');

// The express span of two OADMs cabled back to back (both line-system members with the equipment role
// `oadm`, any case): left out of the drawings, where the two stand side by side (js/src/layout.ts
// BACK_TO_BACK) and express traffic is implied. The facts and the model keep the link.
export function isExpress(m, l) {
  const oadm = (id) => { const n = m.nodes.find((x) => x.id === id); return !!n?.member && /^oadm$/i.test(n.equipment ?? ''); };
  return l.a.node !== l.b.node && oadm(l.a.node) && oadm(l.b.node);
}

const sitesOf = (m, nodes) => {
  const ids = new Set(nodes.map((n) => n.id));
  return m.sites.map((s) => ({ ...s, nodes: s.nodes.filter((x) => ids.has(x)) })).filter((s) => s.nodes.length);
};

// The layer a note goes on (schema 1.9 notes[].layer), among the drawing's `layers`: its own when the
// drawing has it; without one, optical for a note on a line-system member when the drawing has an
// optical layer; else physical.
export function noteLayerOf(note, m, layers) {
  if (note.layer && layers.includes(note.layer)) return note.layer;
  if (!note.layer && layers.includes('optical') && m.nodes.some((n) => n.id === note.device && n.member)) return 'optical';
  return 'physical';
}

// The full properties of a device, one per line: the hover title on every object of it.
export function deviceDetail(n, m) {
  const lines = [n.id, [n.equipment, n.type, n.platform, n.os].filter(Boolean).join(' · ')];
  if (n.site) lines.push(`site ${n.site}`);
  if (n.plain && !n.equipment) lines.push(`no facts: ${n.reason ?? 'not extracted'}`);
  if (n.loopback) lines.push(`${n.host ? 'address' : 'loopback'} ${n.loopback}`);
  if (n.sid) lines.push(`prefix SID ${n.sid.label}${n.sid.index != null ? ` (index ${n.sid.index})` : ''}`);
  if (n.isis) lines.push(`${m.igp === 'ospf' ? 'OSPF' : 'IS-IS'} ${n.isis.area ?? ''} ${n.isis.level ?? ''}${n.isis.systemId ? ` · ${n.isis.systemId}` : ''}`.replace(/\s+/g, ' ').trim());
  if (n.asn) lines.push(`BGP AS ${n.asn}${n.rr ? ' · route reflector' : ''}`);
  for (const v of n.vrfs) lines.push(`VRF ${v}`);
  for (const r of n.rings) lines.push(`ring ${r.ring}: ${r.role}`);
  for (const x of n.meps) lines.push(`MEP ${x.mep} ${x.meg} L${x.level}`);
  for (const l of n.locators) lines.push(`SRv6 locator ${l}`);
  return lines.filter(Boolean).join('\n');
}
