// SPDX-License-Identifier: Apache-2.0
// SRv6 (RFC 8986) locators and IS-IS Flex-Algo (RFC 9350) over the IGP of a built network, and
// EVPN over SRv6 (RFC 9252) on top: which routers take part in each algorithm, the links of each
// algorithm's topology, the route from every router to every locator in that topology, and the
// EVPN instances' SIDs and state.
//
// topo.srv6:      { locators: [{ node, name, prefix, algorithm, sidType, ... }] }
// topo.flexAlgos: [{ algorithm, definitions: [{ node, metricType, advertise, priority, adminGroups }] }]
// topo.evpn:      [{ id, evi, type: 'vpls' | 'vpws' | 'fxc', members: [{ node, fd, ac, routeTargets,
//                   srv6Locator, srPolicyColor, localServiceId, remoteServiceId, controlWord }] }]
//
// Algorithm 0 (SPF) is the IGP itself. A router takes part in Flex-Algo N when it configures a
// definition of N; the definition in use is the advertised one with the highest priority, then
// the highest system id (RFC 9350 §5.3); without an advertised definition nobody computes N.
// A link is in N's topology when both its routers take part; link affinities (admin groups) and
// link delays are not in the facts, so exclusions cannot be applied and a latency / TE metric
// falls back to the IGP metric: both are said in the result (`notes`).

import { bigToIp6, longestMatch, parsePrefix } from './ip.js';
import { spf } from './isis.js';
import { nodeById } from './topology.js';

// The priority of a definition that configures none: 128, the usual implementation default (RFC
// 9350 §5.1 carries a priority but sets no default).
export const DEFAULT_FAD_PRIORITY = 128;

// SID functions the view allocates after a locator: the facts carry locators, not SIDs. 16 bits
// right after the locator prefix; End for the node, then one per EVPN instance and behaviour.
export const SRV6_FUNCTIONS = { end: 0x0001, dx2: 0xe000, dt2u: 0xe100, dt2m: 0xe200 };

// The SID `fn` of a locator prefix (`2001:db8:f0:1::/64`, 0xe000 -> `2001:db8:f0:1:e000::`).
export function sidOf(prefix, fn) {
  const { net, bits, v6 } = parsePrefix(prefix);
  if (!v6 || bits > 112) return null;
  return bigToIp6(net | (BigInt(fn) << BigInt(128 - bits - 16)));
}

const algoOf = (loc) => loc.algorithm ?? 0;

// The Flex-Algo definition in use (RFC 9350 §5.3): of the advertised ones, the highest priority,
// then the highest system id.
function winningDefinition(topo, defs) {
  const sys = (d) => nodeById(topo, d.node).systemId ?? '';
  const adv = defs.filter((d) => d.advertise);
  adv.sort((x, y) => (y.priority ?? DEFAULT_FAD_PRIORITY) - (x.priority ?? DEFAULT_FAD_PRIORITY) || sys(y).localeCompare(sys(x)));
  return adv[0] ?? null;
}

// The LSDB of one algorithm: each participant's Up adjacencies to other participants.
function algoLsdb(topo, adjacencies, members) {
  return members.map((origin) => ({
    origin,
    isReach: adjacencies
      .filter((a) => a.state === 'Up' && (a.a === origin || a.b === origin))
      .map((a) => {
        const nbr = a.a === origin ? a.b : a.a;
        return { neighbor: nbr, link: a.link, metric: a.cost?.[a.a === origin ? 'a' : 'b'] ?? a.metric };
      })
      .filter((r) => members.includes(r.neighbor)),
  }));
}

export function computeSrv6(topo, igp) {
  const locators = (topo.srv6?.locators ?? []).map((l) => ({ ...l, algorithm: algoOf(l) }));
  const routers = igp.routers;
  const algorithms = [{ algorithm: 0, participants: [...routers], definition: null, links: igp.adjacencies.filter((a) => a.state === 'Up').map((a) => a.link), notes: [] }];
  const spfs = { 0: igp.spf };
  for (const fa of topo.flexAlgos ?? []) {
    const defs = fa.definitions.filter((d) => routers.includes(d.node));
    const definition = winningDefinition(topo, defs);
    const notes = [];
    let participants = defs.map((d) => d.node);
    if (!definition) {
      notes.push(`no router advertises the definition of Flex-Algo ${fa.algorithm}: no router computes it (RFC 9350 §5.3)`);
      participants = [];
    }
    const members = [...new Set(participants)].sort();
    const adj = igp.adjacencies.filter((a) => members.includes(a.a) && members.includes(a.b));
    const ag = definition?.adminGroups ?? {};
    const affinity = [...(ag.excludeAny ?? []).map((g) => `exclude ${g}`), ...(ag.includeAny ?? []).map((g) => `include-any ${g}`), ...(ag.includeAll ?? []).map((g) => `include-all ${g}`)];
    if (affinity.length) notes.push(`${affinity.join(', ')}: the facts carry no link affinities, so no link is excluded`);
    if (definition && definition.metricType && definition.metricType !== 'igp') notes.push(`metric type ${definition.metricType}: the facts carry no link ${definition.metricType === 'latency' ? 'delay' : 'TE metric'}, so the IGP metric is used`);
    const lsdb = algoLsdb(topo, adj, members);
    spfs[fa.algorithm] = Object.fromEntries(members.map((r) => [r, spf(lsdb, r)]));
    algorithms.push({ algorithm: fa.algorithm, participants: members, definition, links: adj.filter((a) => a.state === 'Up').map((a) => a.link), notes });
  }
  // Routes to the locators, per router: the locator's algorithm's shortest path to its owner.
  const rib = {};
  for (const r of routers) {
    rib[r] = {};
    for (const loc of locators) {
      const s = spfs[loc.algorithm]?.[r];
      const base = { prefix: loc.prefix, locator: loc.name, owner: loc.node, algorithm: loc.algorithm };
      if (loc.node === r) rib[r][loc.prefix] = { ...base, metric: 0, nextHops: [], local: true };
      else if (!s) rib[r][loc.prefix] = { ...base, unreachable: loc.algorithm && spfs[loc.algorithm] ? `${r} takes no part in Flex-Algo ${loc.algorithm}` : `no Flex-Algo ${loc.algorithm} definition` };
      else if (s.dist[loc.node] === undefined) rib[r][loc.prefix] = { ...base, unreachable: `${loc.node} is not reachable in ${loc.algorithm ? `Flex-Algo ${loc.algorithm}` : 'the IGP'}` };
      else rib[r][loc.prefix] = { ...base, metric: s.dist[loc.node], nextHops: s.nextHops[loc.node] };
    }
  }
  return { locators, algorithms, rib };
}

// The route `node` uses for IPv6 destination `ip` among the locators (longest match), or null.
export function locatorRoute(srv6, node, ip) {
  return longestMatch(Object.values(srv6.rib[node] ?? {}), ip);
}

// The hop-by-hop path from `from` to the owner of `prefix` (first equal-cost next hop each time).
export function locatorPath(srv6, from, prefix) {
  const nodes = [from];
  const links = [];
  let cur = from;
  for (let i = 0; i < 64; i++) {
    const r = srv6.rib[cur]?.[prefix];
    if (!r || r.unreachable) return null;
    if (r.local) return { nodes, links };
    const nh = r.nextHops[0];
    nodes.push(nh.node);
    links.push(nh.link);
    cur = nh.node;
  }
  return null;
}

// Two BGP speakers exchange EVPN routes when they have an Established session carrying l2vpn evpn
// (when the facts list the session's families), or share a route reflector that reflects between
// them (RFC 4456: one of the two is its client).
function evpnExchange(topo, bgp) {
  const evpn = (s) => !s.families?.length || s.families.includes('l2vpn evpn');
  const up = bgp.sessions.filter((s) => s.state === 'Established' && evpn(topo.bgp?.sessions?.find((t) => t.a === s.a && t.b === s.b) ?? s));
  const peer = (x, y) => up.find((s) => (s.a === x && s.b === y) || (s.a === y && s.b === x));
  return (x, y) => {
    if (peer(x, y)) return { via: 'direct' };
    for (const rr of bgp.speakers) {
      const [sx, sy] = [peer(rr, x), peer(rr, y)];
      if (sx && sy && (sx.client === x || sy.client === y)) return { via: rr };
    }
    return null;
  };
}

const exportsRt = (m) => m.routeTargets.filter((r) => r.type !== 'import').map((r) => r.rt);
const importsRt = (m) => m.routeTargets.filter((r) => r.type !== 'export').map((r) => r.rt);

// EVPN instances over SRv6: per member its service SIDs (End.DX2 for EVPN-VPWS, End.DT2U and
// End.DT2M for EVPN-VPLS, from its locator), per ordered pair of members whether the routes go
// across (a BGP path, a matching route target, a VPWS service id match) and whether the far
// member's locator is reachable; the instance is Up when every pair is.
export function computeEvpn(topo, bgp, srv6) {
  const exchange = evpnExchange(topo, bgp);
  const ordinal = {}; // per node: the next EVPN instance index for SID functions
  const instances = (topo.evpn ?? []).map((inst) => {
    const members = inst.members.map((m) => {
      const k = (ordinal[m.node] = (ordinal[m.node] ?? -1) + 1);
      const loc = srv6.locators.find((l) => l.node === m.node && l.name === m.srv6Locator) ?? null;
      const sids = {};
      if (loc) {
        if (inst.type === 'vpls') {
          sids.dt2u = sidOf(loc.prefix, SRV6_FUNCTIONS.dt2u + k);
          sids.dt2m = sidOf(loc.prefix, SRV6_FUNCTIONS.dt2m + k);
        } else sids.dx2 = sidOf(loc.prefix, SRV6_FUNCTIONS.dx2 + k);
      }
      return { ...m, locator: loc, sids };
    });
    const reasons = [];
    const pairs = [];
    if (members.length < 2) reasons.push(`only ${members[0]?.node ?? 'no device'} configures EVI ${inst.evi}`);
    if (inst.type === 'vpws' && members.length > 2) reasons.push(`${members.length} devices configure EVPN-VPWS EVI ${inst.evi}; a VPWS has two ends`);
    for (const m of members) {
      if (!m.srv6Locator) reasons.push(`${m.node}: no SRv6 locator${m.srPolicyColor ? ` (SR policy color ${m.srPolicyColor})` : ''}; the view models EVPN over SRv6`);
      else if (!m.locator) reasons.push(`${m.node}: SRv6 locator ${m.srv6Locator} is not configured on ${m.node}`);
    }
    for (const x of members) {
      for (const y of members) {
        if (x === y) continue;
        const why = [];
        const bgpPath = exchange(x.node, y.node);
        if (!bgpPath) why.push(`no BGP EVPN path between ${x.node} and ${y.node}`);
        if (!exportsRt(y).some((rt) => importsRt(x).includes(rt))) why.push(`${x.node} imports none of ${y.node}'s route targets`);
        if (inst.type === 'vpws' && (x.remoteServiceId !== y.localServiceId)) why.push(`${x.node} remote service id ${x.remoteServiceId ?? '-'} is not ${y.node}'s local service id ${y.localServiceId ?? '-'}`);
        let path = null;
        if (y.locator) {
          path = locatorPath(srv6, x.node, y.locator.prefix);
          if (!path) why.push(srv6.rib[x.node]?.[y.locator.prefix]?.unreachable ?? `${y.node}'s locator ${y.locator.name} is not reachable from ${x.node}`);
        }
        pairs.push({ from: x.node, to: y.node, bgp: bgpPath, path, ok: !why.length && Boolean(path), reasons: why });
      }
    }
    for (const p of pairs) for (const r of p.reasons) if (!reasons.includes(r)) reasons.push(r);
    const up = !reasons.length && pairs.length > 0 && pairs.every((p) => p.ok);
    return { ...inst, members, pairs, state: up ? 'Up' : 'Down', reasons };
  });
  return { instances };
}
