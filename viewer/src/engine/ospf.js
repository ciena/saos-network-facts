// SPDX-License-Identifier: Apache-2.0
// OSPFv2, RFC 2328. Every core link between two routers is a point-to-point
// network (§1.2, §12.4.1.1); routers are grouped in areas, area 0.0.0.0 being
// the backbone. Per area each router originates one Router-LSA (type 1)
// listing its Full neighbours (link type 1) and the stub networks of its
// interfaces in that area (link type 3, loopback /32 included), floods it in
// the area, and runs the intra-area SPF (§16.1). Area border routers
// summarize routes into the other areas as Summary-LSAs (type 3, §12.4.3) and
// every router adds inter-area routes from them (§16.2).
//
// Topology inputs (all optional, vendor-neutral):
//   topo.igp = 'ospf'          selects OSPF instead of IS-IS as the IGP
//   topo.ospf.area             default area of a link (default 0.0.0.0)
//   node.routerId              default: the loopback address
//   node.loopbackArea          area the loopback is advertised in
//   link.area                  area of the link (both ends)
//   link.cost = { a, b }       per-end interface cost (default link.metric)
//
// The result has the IGP shape the label protocols, BGP and the walks use:
// { routers, adjacencies, rib }, plus OSPF's own lsas, lsdb and spf per area.

import { compareIp } from './ip.js';
import { buildRib, isRouter, spf } from './isis.js';
import { nodeById } from './topology.js';

export const BACKBONE = '0.0.0.0';
// §12.1.6: the first instance of an LSA has InitialSequenceNumber 0x80000001.
export const INITIAL_SEQ = 0x80000001;
export const ALL_SPF_ROUTERS = '224.0.0.5';

export const fmtSeq = (seq) => `0x${(seq >>> 0).toString(16).padStart(8, '0')}`;

// "0" / 0 / "0.0.0.0" -> "0.0.0.0"; a plain integer becomes dotted quad.
export function normArea(a) {
  if (a === undefined || a === null || a === '') return null;
  const s = String(a).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s) >>> 0;
    return [24, 16, 8, 0].map((b) => (n >>> b) & 255).join('.');
  }
  return s;
}

export const routerId = (topo, id) => nodeById(topo, id).routerId ?? nodeById(topo, id).loopback;

export function linkArea(topo, link) {
  return normArea(link.area) ?? normArea(topo.ospf?.area) ?? BACKBONE;
}

function cost(link, side) {
  return link.cost?.[side] ?? link.metric ?? 10;
}

// §10.3 neighbour state machine on a point-to-point network, from Down to
// Full: Hello (Init, then 2-Way once our router ID is in the neighbour's
// Hello), adjacency forms (p2p: always, §10.4), master/slave negotiation
// (ExStart), Database Description exchange, LS Requests (Loading), Full.
export function neighborFsm(a, b, ridA, ridB) {
  const master = compareIp(ridA, ridB) > 0 ? a : b;
  return [
    { from: a, to: b, packet: 'Hello', event: 'HelloReceived', state: 'Init', note: `${b} sees ${a}'s Hello without itself listed` },
    { from: b, to: a, packet: 'Hello', event: '2-WayReceived', state: '2-Way', note: `${a} finds its router ID in ${b}'s Hello; p2p: form the adjacency (§10.4)` },
    { from: a, to: b, packet: 'Database Description (I/M/MS)', event: 'AdjOK?', state: 'ExStart', note: `master/slave: higher router ID ${master} is master` },
    { from: master, to: master === a ? b : a, packet: 'Database Description', event: 'NegotiationDone', state: 'Exchange', note: 'LSA headers of each LSDB exchanged' },
    { from: b, to: a, packet: 'Link State Request', event: 'ExchangeDone', state: 'Loading', note: 'request the LSAs that are newer or missing' },
    { from: a, to: b, packet: 'Link State Update', event: 'LoadingDone', state: 'Full', note: 'databases synchronized: neighbour Full, Router-LSAs re-originated' },
  ];
}

export function computeAdjacencies(topo, linkStates) {
  const adj = [];
  for (const l of topo.links) {
    if (l.kind !== 'core') continue;
    if (!isRouter(nodeById(topo, l.a.node)) || !isRouter(nodeById(topo, l.b.node))) continue;
    const up = linkStates[l.id].up;
    adj.push({
      link: l.id,
      a: l.a.node,
      b: l.b.node,
      area: linkArea(topo, l),
      metric: cost(l, 'a'),
      cost: { a: cost(l, 'a'), b: cost(l, 'b') },
      state: up ? 'Up' : 'Down',
      nbrState: up ? 'Full' : 'Down',
    });
  }
  return adj;
}

// Areas a router has interfaces in (its loopback area included), sorted with
// the backbone first.
function areasOf(topo, adjacencies, r) {
  const set = new Set(adjacencies.filter((a) => a.a === r || a.b === r).map((a) => a.area));
  set.add(loopbackArea(topo, adjacencies, r));
  return [...set].sort((x, y) => (x === BACKBONE ? -1 : y === BACKBONE ? 1 : compareIp(x, y)));
}

function loopbackArea(topo, adjacencies, r) {
  const own = normArea(nodeById(topo, r).loopbackArea);
  if (own) return own;
  const areas = adjacencies.filter((a) => a.a === r || a.b === r).map((a) => a.area);
  if (!areas.length || areas.includes(BACKBONE)) return areas.length ? BACKBONE : (normArea(topo.ospf?.area) ?? BACKBONE);
  return [...areas].sort(compareIp)[0];
}

// §12.4.1: the Router-LSA of router `r` in `area`.
export function originateRouterLsa(topo, r, area, adjacencies, seq = INITIAL_SEQ) {
  const node = nodeById(topo, r);
  const links = [];
  const stubs = [];
  if (loopbackArea(topo, adjacencies, r) === area) stubs.push({ type: 3, prefix: `${node.loopback}/32`, metric: 0 });
  for (const a of adjacencies) {
    if (a.area !== area || (a.a !== r && a.b !== r)) continue;
    const side = a.a === r ? 'a' : 'b';
    const link = topo.links.find((l) => l.id === a.link);
    const metric = a.cost[side];
    if (a.state === 'Up') {
      const nbr = side === 'a' ? a.b : a.a;
      links.push({ type: 1, neighbor: nbr, linkId: routerId(topo, nbr), linkData: link[side].ip, metric, link: a.link });
    }
    // The interface subnet is a stub network whenever the interface is up (§12.4.1.1).
    if (a.state === 'Up' && link.subnet) stubs.push({ type: 3, prefix: link.subnet, metric });
  }
  links.sort((x, y) => x.neighbor.localeCompare(y.neighbor) || x.link.localeCompare(y.link));
  stubs.sort((x, y) => compareIp(x.prefix.split('/')[0], y.prefix.split('/')[0]));
  const rid = routerId(topo, r);
  return {
    lsType: 1,
    lsId: rid,
    advRouter: rid,
    origin: r,
    area,
    seq,
    age: 0,
    abr: areasOf(topo, adjacencies, r).length > 1,
    links,
    stubs,
    // The views spf()/buildRib() from isis.js read (same Dijkstra, §16.1).
    isReach: links.map((l) => ({ neighbor: l.neighbor, link: l.link, metric: l.metric })),
    ipReach: stubs.map((s) => ({ prefix: s.prefix, metric: s.metric })),
  };
}

// Routers reachable over Up adjacencies of one area from `r`.
function areaComponent(adjacencies, area, r) {
  const seen = new Set([r]);
  const stack = [r];
  while (stack.length) {
    const u = stack.pop();
    for (const a of adjacencies) {
      if (a.area !== area || a.state !== 'Up') continue;
      const v = a.a === u ? a.b : a.b === u ? a.a : null;
      if (v && !seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return seen;
}

const mergeHops = (a, b) => {
  const all = [...a];
  for (const h of b) if (!all.some((x) => x.node === h.node && x.link === h.link)) all.push(h);
  return all.sort((x, y) => x.node.localeCompare(y.node) || x.link.localeCompare(y.link));
};

// seqs: { nodeId: sequence number of its Router-LSAs } (default 0x80000001).
export function computeOspf(topo, linkStates, vendor, seqs = {}) {
  const routers = topo.nodes.filter(isRouter).map((n) => n.id);
  const adjacencies = computeAdjacencies(topo, linkStates);
  const areas = {};
  for (const r of routers) areas[r] = areasOf(topo, adjacencies, r);
  const allAreas = [...new Set(Object.values(areas).flat())].sort((x, y) => (x === BACKBONE ? -1 : y === BACKBONE ? 1 : compareIp(x, y)));

  // Router-LSAs and the per-area LSDB each router holds (its area component).
  const lsas = {};
  for (const r of routers) lsas[r] = Object.fromEntries(areas[r].map((ar) => [ar, originateRouterLsa(topo, r, ar, adjacencies, seqs[r] ?? INITIAL_SEQ)]));
  const lsdb = {};
  const spfs = {};
  const intra = {};
  for (const r of routers) {
    lsdb[r] = {};
    spfs[r] = {};
    intra[r] = {};
    for (const ar of areas[r]) {
      const comp = areaComponent(adjacencies, ar, r);
      lsdb[r][ar] = routers.filter((o) => comp.has(o) && lsas[o][ar]).map((o) => lsas[o][ar]);
      spfs[r][ar] = spf(lsdb[r][ar], r);
      intra[r][ar] = buildRib(lsdb[r][ar], r, spfs[r][ar]);
    }
  }

  // Summary-LSAs (§12.4.3). An ABR summarizes each attached area's
  // intra-area routes into its other areas; into a non-backbone area it also
  // summarizes the inter-area routes it learned over the backbone. Only
  // backbone summaries are used by ABRs (§16.2), so this is two passes.
  const summaries = Object.fromEntries(allAreas.map((ar) => [ar, []]));
  const abrs = routers.filter((r) => areas[r].length > 1);
  const summarize = (abr, into, routes) => {
    for (const rt of routes) {
      if (rt.metric === undefined) continue;
      const cur = summaries[into].find((s) => s.origin === abr && s.prefix === rt.prefix);
      if (!cur) summaries[into].push({ lsType: 3, origin: abr, advRouter: routerId(topo, abr), area: into, prefix: rt.prefix, metric: rt.metric });
      else cur.metric = Math.min(cur.metric, rt.metric);
    }
  };
  const ownPrefixes = (r, ar) => new Set(Object.keys(intra[r][ar] ?? {}));
  for (const abr of abrs) {
    for (const from of areas[abr]) {
      if (from === BACKBONE || !areas[abr].includes(BACKBONE)) continue;
      summarize(abr, BACKBONE, Object.values(intra[abr][from]).filter((rt) => !ownPrefixes(abr, BACKBONE).has(rt.prefix)));
    }
  }
  const inter = {};
  const interFrom = (r, ar) => {
    const out = {};
    const sp = spfs[r][ar];
    for (const s of summaries[ar]) {
      if (s.origin === r || sp.dist[s.origin] === undefined) continue;
      const metric = sp.dist[s.origin] + s.metric;
      const nh = sp.nextHops[s.origin];
      const cur = out[s.prefix];
      if (!cur || metric < cur.metric) out[s.prefix] = { prefix: s.prefix, metric, nextHops: [...nh], origin: s.origin, local: false, type: 'inter', area: ar };
      else if (metric === cur.metric) cur.nextHops = mergeHops(cur.nextHops, nh);
    }
    return out;
  };
  for (const r of routers) if (areas[r].includes(BACKBONE)) inter[r] = interFrom(r, BACKBONE);
  for (const abr of abrs) {
    for (const into of areas[abr]) {
      if (into === BACKBONE) continue;
      const own = ownPrefixes(abr, into);
      for (const from of areas[abr]) if (from !== into) summarize(abr, into, Object.values(intra[abr][from]).filter((rt) => !own.has(rt.prefix)));
      if (areas[abr].includes(BACKBONE)) summarize(abr, into, Object.values(inter[abr] ?? {}).filter((rt) => !own.has(rt.prefix)));
    }
  }
  for (const r of routers) {
    if (areas[r].includes(BACKBONE) && areas[r].length > 1) continue; // ABRs: backbone summaries only
    if (!areas[r].includes(BACKBONE)) inter[r] = Object.assign({}, ...areas[r].map((ar) => interFrom(r, ar)));
  }

  // The routing table (§16, §11): intra-area routes win over inter-area.
  const rib = {};
  for (const r of routers) {
    rib[r] = {};
    for (const ar of areas[r]) {
      for (const rt of Object.values(intra[r][ar])) {
        const cur = rib[r][rt.prefix];
        const route = { ...rt, type: 'intra', area: ar };
        if (!cur || rt.local || (!cur.local && rt.metric < cur.metric)) rib[r][rt.prefix] = route;
        else if (!cur.local && rt.metric === cur.metric) cur.nextHops = mergeHops(cur.nextHops, rt.nextHops);
      }
    }
    for (const rt of Object.values(inter[r] ?? {})) if (!rib[r][rt.prefix]) rib[r][rt.prefix] = rt;
  }
  return { protocol: 'ospf', routers, areas, abrs, adjacencies, lsas, lsdb, summaries, spf: spfs, rib };
}

// The Router-LSA `origin` refloods in `area` (§13, §13.3): on receipt of a
// newer instance a router installs it, acknowledges it (LS Ack) and floods it
// out of every other interface in the area; an instance it already holds is
// acknowledged and dropped. Same transmission model as the IS-IS flood.
export function areaView(ospf, area) {
  return {
    routers: ospf.routers.filter((r) => ospf.areas[r].includes(area)),
    adjacencies: ospf.adjacencies.filter((a) => a.area === area),
    lsps: Object.fromEntries(ospf.routers.filter((r) => ospf.lsas[r][area]).map((r) => [r, ospf.lsas[r][area]])),
  };
}
