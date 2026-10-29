// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// IS-IS, ISO/IEC 10589 + RFC 1195 (IP), with RFC 5305 wide metrics and
// RFC 5303 three-way point-to-point adjacencies. One level (topo.isis.level,
// 1 or 2, default 2) and one area.
//
// Every core link between two routers is a point-to-point circuit. A LAG is one
// circuit (IS-IS runs over the aggregated interface, not its members).

import { compareIp } from './ip.js';
import { nodeById } from './topology.js';

export const isRouter = (n) => n.role !== 'ce';

// RFC 5303 §3.3: next three-way state given the current state and the state
// carried in the received IIH's Point-to-Point Three-Way Adjacency TLV (240).
const THREE_WAY = {
  Down: { Down: 'Initializing', Initializing: 'Up', Up: 'Down' },
  Initializing: { Down: 'Initializing', Initializing: 'Up', Up: 'Up' },
  Up: { Down: 'Initializing', Initializing: 'Up', Up: 'Up' },
};

export function threeWayNext(current, received) {
  return THREE_WAY[current][received];
}

// Bring a p2p adjacency up from Down/Down. Returns the IIH exchange.
export function threeWayHandshake(a, b) {
  const state = { [a]: 'Down', [b]: 'Down' };
  const trace = [];
  const send = (from, to) => {
    const sent = state[from];
    const before = state[to];
    state[to] = threeWayNext(before, sent);
    trace.push({ from, to, sentState: sent, receiverBefore: before, receiverAfter: state[to] });
  };
  send(a, b); // A: Down -> B goes Initializing
  send(b, a); // B: Initializing -> A goes Up
  send(a, b); // A: Up -> B goes Up
  return { trace, state };
}

export function lspId(node) {
  return `${node.systemId}.00-00`;
}

// adjacencies on every core link with routers at both ends; state follows the link.
export function computeAdjacencies(topo, linkStates) {
  const adj = [];
  for (const l of topo.links) {
    if (l.kind !== 'core') continue;
    if (!isRouter(nodeById(topo, l.a.node)) || !isRouter(nodeById(topo, l.b.node))) continue;
    adj.push({
      link: l.id,
      a: l.a.node,
      b: l.b.node,
      metric: l.metric,
      // Each end advertises its own interface metric (link.cost per end, if set).
      ...(l.cost ? { cost: { a: l.cost.a, b: l.cost.b } } : {}),
      state: linkStates[l.id].up ? 'Up' : 'Down',
    });
  }
  return adj;
}

// The LSP a router originates (ISO 10589 §7.3.7): its Up adjacencies as
// Extended IS Reachability (TLV 22) and its prefixes as Extended IP
// Reachability (TLV 135).
export function originateLsp(topo, nodeId, adjacencies, seq = 1, vendor) {
  const node = nodeById(topo, nodeId);
  const isReach = [];
  const ipReach = [{ prefix: `${node.loopback}/32`, metric: 0 }];
  for (const a of adjacencies) {
    if (a.a !== nodeId && a.b !== nodeId) continue;
    const link = topo.links.find((l) => l.id === a.link);
    if (a.state !== 'Up') continue;
    const nbr = a.a === nodeId ? a.b : a.a;
    const metric = a.cost?.[a.a === nodeId ? 'a' : 'b'] ?? a.metric;
    isReach.push({ neighbor: nbr, systemId: nodeById(topo, nbr).systemId, metric, link: a.link });
    ipReach.push({ prefix: link.subnet, metric });
  }
  isReach.sort((x, y) => x.neighbor.localeCompare(y.neighbor) || x.link.localeCompare(y.link));
  ipReach.sort((x, y) => compareIp(x.prefix.split('/')[0], y.prefix.split('/')[0]));
  return {
    lspId: lspId(node),
    origin: nodeId,
    seq,
    lifetime: vendor?.isis.lspLifetimeS ?? 1200,
    isReach,
    ipReach,
  };
}

// Connected components of the Up-adjacency graph: flooding (§7.3.15) delivers
// each LSP to every router reachable over Up adjacencies, so in a converged
// network each component shares one LSDB.
function components(routers, adjacencies) {
  const comp = {};
  let c = 0;
  for (const r of routers) {
    if (comp[r] !== undefined) continue;
    const stack = [r];
    comp[r] = c;
    while (stack.length) {
      const u = stack.pop();
      for (const a of adjacencies) {
        if (a.state !== 'Up') continue;
        const v = a.a === u ? a.b : a.b === u ? a.a : null;
        if (v && comp[v] === undefined) {
          comp[v] = c;
          stack.push(v);
        }
      }
    }
    c++;
  }
  return comp;
}

// Dijkstra over an LSDB (ISO 10589 §7.2.6 decision process). An edge u->v is
// used only if v's LSP also reports u (two-way connectivity check). Equal-cost
// paths are kept (ECMP), next hops sorted for determinism.
export function spf(lsdb, root) {
  const byOrigin = Object.fromEntries(lsdb.map((l) => [l.origin, l]));
  const dist = { [root]: 0 };
  const nextHops = { [root]: [] };
  const done = new Set();
  const twoWay = (u, v, link) => byOrigin[v]?.isReach.some((r) => r.neighbor === u && r.link === link);

  for (;;) {
    let u = null;
    for (const n of Object.keys(dist)) {
      if (done.has(n)) continue;
      if (u === null || dist[n] < dist[u] || (dist[n] === dist[u] && n < u)) u = n;
    }
    if (u === null) break;
    done.add(u);
    for (const r of byOrigin[u]?.isReach ?? []) {
      if (!twoWay(u, r.neighbor, r.link) || done.has(r.neighbor)) continue;
      const d = dist[u] + r.metric;
      const hops = u === root ? [{ node: r.neighbor, link: r.link }] : nextHops[u];
      if (dist[r.neighbor] === undefined || d < dist[r.neighbor]) {
        dist[r.neighbor] = d;
        nextHops[r.neighbor] = [...hops];
      } else if (d === dist[r.neighbor]) {
        nextHops[r.neighbor] = mergeHops(nextHops[r.neighbor], hops);
      }
    }
  }
  return { dist, nextHops };
}

function mergeHops(a, b) {
  const all = [...a];
  for (const h of b) if (!all.some((x) => x.node === h.node && x.link === h.link)) all.push(h);
  return all.sort((x, y) => x.node.localeCompare(y.node) || x.link.localeCompare(y.link));
}

// Routes from an SPF result: prefix -> best metric and next hops (RFC 1195 §3.10).
export function buildRib(lsdb, root, spfResult) {
  const rib = {};
  for (const lsp of lsdb) {
    const d = spfResult.dist[lsp.origin];
    if (d === undefined) continue;
    for (const p of lsp.ipReach) {
      const metric = d + p.metric;
      const nh = spfResult.nextHops[lsp.origin];
      const cur = rib[p.prefix];
      const local = lsp.origin === root;
      if (!cur || metric < cur.metric || (local && !cur.local)) {
        rib[p.prefix] = { prefix: p.prefix, metric, nextHops: [...nh], origin: lsp.origin, local };
      } else if (metric === cur.metric && !cur.local) {
        cur.nextHops = mergeHops(cur.nextHops, nh);
      }
    }
  }
  return rib;
}

// seqs: { nodeId: sequence number } (defaults to 1).
export function computeIsis(topo, linkStates, vendor, seqs = {}) {
  const routers = topo.nodes.filter(isRouter).map((n) => n.id);
  const adjacencies = computeAdjacencies(topo, linkStates);
  const lsps = Object.fromEntries(
    routers.map((r) => [r, originateLsp(topo, r, adjacencies, seqs[r] ?? 1, vendor)]),
  );
  const comp = components(routers, adjacencies);
  const lsdb = {};
  const spfs = {};
  const rib = {};
  for (const r of routers) {
    lsdb[r] = routers.filter((o) => comp[o] === comp[r]).map((o) => lsps[o]);
    spfs[r] = spf(lsdb[r], r);
    rib[r] = buildRib(lsdb[r], r, spfs[r]);
  }
  return { routers, adjacencies, lsps, lsdb, spf: spfs, rib };
}

// Flood one LSP from its origin (ISO 10589 §7.3.15.1). On receipt of a newer
// LSP a router stores it, acknowledges it on the p2p circuit (PSNP) and floods
// it on every other circuit; a copy it already holds is acknowledged and
// dropped, and receipt clears SRM for that circuit so it is not sent back.
// Returns transmissions in time order: { t, from, to, link, result }.
// OSPF floods the same way within an area (ospf.js areaView, hop delay).
export function floodLsp(isis, origin, lsp, vendor, hop = vendor.isis.floodHopDelayMs) {
  const up = isis.adjacencies.filter((a) => a.state === 'Up');
  const nbrs = (n) =>
    up
      .filter((a) => a.a === n || a.b === n)
      .map((a) => ({ node: a.a === n ? a.b : a.a, link: a.link }))
      .sort((x, y) => x.node.localeCompare(y.node));
  const held = Object.fromEntries(isis.routers.map((r) => [r, isis.lsps[origin]?.seq ?? 0]));
  held[origin] = lsp.seq;

  const out = [];
  let inflight = nbrs(origin).map((n) => ({ t: hop, from: origin, to: n.node, link: n.link }));
  while (inflight.length) {
    const t = inflight[0].t;
    const now = inflight.filter((x) => x.t === t);
    inflight = inflight.filter((x) => x.t !== t);
    const receivedFrom = {};
    const installed = [];
    now.sort((x, y) => x.to.localeCompare(y.to) || x.from.localeCompare(y.from));
    for (const tx of now) {
      (receivedFrom[tx.to] ??= new Set()).add(tx.from);
      let result;
      if (lsp.seq > held[tx.to]) {
        held[tx.to] = lsp.seq;
        installed.push(tx.to);
        result = 'installed';
      } else {
        result = 'duplicate';
      }
      out.push({ ...tx, seq: lsp.seq, result });
    }
    for (const r of installed) {
      for (const n of nbrs(r)) {
        if (receivedFrom[r].has(n.node)) continue;
        inflight.push({ t: t + hop, from: r, to: n.node, link: n.link });
      }
    }
    inflight.sort((x, y) => x.t - y.t);
  }
  return out;
}
