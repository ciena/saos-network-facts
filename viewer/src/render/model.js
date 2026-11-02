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
    };
  });
  // A lab with no IGP router: its devices are L2 switches, not CEs.
  if (!nodes.some((n) => n.role === 'p' || n.role === 'pe')) for (const n of nodes) if (n.role === 'ce') n.role = 'l2';

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
  }));

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
  };
}

// The view layers (js/src/view.ts LAYER_IDS) this lab has something to draw on.
export function presentLayers(m) {
  const has = {
    physical: true,
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

// The full properties of a device, one per line: the hover title on every object of it.
export function deviceDetail(n, m) {
  const lines = [n.id, [n.type, n.platform, n.os].filter(Boolean).join(' · ')];
  if (n.plain) lines.push(`no facts: ${n.reason ?? 'not extracted'}`);
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
