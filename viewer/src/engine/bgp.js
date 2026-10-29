// SPDX-License-Identifier: Apache-2.0
// BGP-4 (RFC 4271) with Multiprotocol Extensions (RFC 4760) carrying VPN-IPv4
// routes for BGP/MPLS IP VPNs (RFC 4364), labels encoded per RFC 8277.
// iBGP between router loopbacks: a full mesh between the PEs, or the sessions
// in topo.bgp.sessions ([{ a, b, client, configuredOn }], `client` the side
// that is a route reflector client of the other (RFC 4456), `configuredOn` the
// ends that configure the neighbour). PE-CE routing is static (RFC 4364 §7).
//
// A VRF site is a CE behind a link ({ pe, rd, ce, link }) and/or the PE's own
// VRF members ({ pe, rd, interfaces, statics }): loopbacks and IP interfaces
// in the VRF, and static routes. Those PE-originated routes are exported like
// a CE's (RFC 4364 §4.3.1): connected prefixes while their interface is up,
// and per prefix the static with the lowest preference whose next hop is in
// an up connected subnet (a floating static takes over when the preferred
// next hop's interface fails).
//   interfaces: [{ name, kind: 'loopback' | 'ip', ip, prefix, link? }]
//   statics:    [{ prefix, nextHop, preference }]

import { compareIp, inPrefix, ipToInt } from './ip.js';
import { nodeById, nodeOrdinal } from './topology.js';

export const ORIGIN = { IGP: 0, EGP: 1, INCOMPLETE: 2 };
export const AFI_IPV4 = 1;
export const SAFI_MPLS_VPN = 128; // RFC 4364 §4.3.4

// RFC 4271 §8.2.2: the FSM path to Established for a passive-open-less peer.
export function fsmToEstablished() {
  return [
    { from: 'Idle', event: 'ManualStart (Event 1)', to: 'Connect', action: 'start ConnectRetryTimer, open TCP to peer :179' },
    { from: 'Connect', event: 'TcpConnectionConfirmed (Event 17)', to: 'OpenSent', action: 'send OPEN' },
    { from: 'OpenSent', event: 'BGPOpen (Event 19)', to: 'OpenConfirm', action: 'send KEEPALIVE' },
    { from: 'OpenConfirm', event: 'KeepAliveMsg (Event 26)', to: 'Established', action: 'start HoldTimer, exchange UPDATEs' },
  ];
}

// RFC 4271 §9.1.2.2 (Breaking Ties, phase 2) preceded by the §9.1.1 degree of
// preference (LOCAL_PREF). Returns { best, reason } where reason names the
// step that decided. Candidate fields:
//   localPref, asPath[], origin, med, neighborAs, ebgp, igpCost, bgpId, peerAddr
export function bestPath(candidates) {
  if (!candidates.length) return { best: null, reason: 'no candidates' };
  let set = [...candidates];
  const steps = [
    ['highest LOCAL_PREF (§9.1.1)', (r) => -r.localPref],
    ['shortest AS_PATH (§9.1.2.2 a)', (r) => r.asPath.length],
    ['lowest ORIGIN (§9.1.2.2 b)', (r) => r.origin],
  ];
  for (const [reason, key] of steps) {
    const min = Math.min(...set.map(key));
    const next = set.filter((r) => key(r) === min);
    if (next.length === 1 && set.length > 1) return { best: next[0], reason };
    set = next;
  }
  // c) MED: compared only between routes from the same neighbouring AS.
  const byAs = new Map();
  for (const r of set) {
    const cur = byAs.get(r.neighborAs);
    if (!cur || r.med < cur) byAs.set(r.neighborAs, r.med);
  }
  const afterMed = set.filter((r) => r.med === byAs.get(r.neighborAs));
  if (afterMed.length === 1 && set.length > 1) return { best: afterMed[0], reason: 'lowest MED, same neighbour AS (§9.1.2.2 c)' };
  set = afterMed;
  const more = [
    ['eBGP over iBGP (§9.1.2.2 d)', (r) => (r.ebgp ? 0 : 1)],
    ['lowest IGP cost to NEXT_HOP (§9.1.2.2 e)', (r) => r.igpCost],
    ['lowest BGP Identifier (§9.1.2.2 f)', (r) => ipToInt(r.bgpId)],
    ['lowest peer address (§9.1.2.2 g)', (r) => ipToInt(r.peerAddr)],
  ];
  for (const [reason, key] of more) {
    const min = Math.min(...set.map(key));
    const next = set.filter((r) => key(r) === min);
    if (next.length === 1 && set.length > 1) return { best: next[0], reason };
    set = next;
  }
  return { best: set[0], reason: set.length === candidates.length && set.length === 1 ? 'only path' : 'identical' };
}

export function vpnPrefixes(topo, site) {
  if (!site.ce) return [];
  const ce = nodeById(topo, site.ce);
  const link = topo.links.find((l) => l.id === site.link);
  return [ce.lan, link.subnet].filter(Boolean);
}

// The VRF routes a site puts in its PE's table, best static per prefix
// first. linkUp(id) tells whether a link is up. Returns { routes, candidates }
// where candidates lists every prefix the site can ever originate (for
// stable label allocation).
export function siteRoutes(topo, site, linkUp = () => true) {
  const routes = [];
  const candidates = [];
  if (site.ce) {
    const link = topo.links.find((l) => l.id === site.link);
    const ceEnd = link.a.node === site.ce ? link.a : link.b;
    for (const prefix of vpnPrefixes(topo, site)) {
      const connected = prefix === link.subnet;
      candidates.push(prefix);
      routes.push({ prefix, type: connected ? 'connected' : 'static', via: { node: site.ce, link: link.id, ip: connected ? null : ceEnd.ip } });
    }
  }
  const up = [];
  for (const i of site.interfaces ?? []) {
    candidates.push(i.prefix);
    if (i.kind === 'loopback') {
      routes.push({ prefix: i.prefix, type: 'local', if: i.name, via: { node: site.pe, link: null, ip: null } });
      continue;
    }
    if (i.link && !linkUp(i.link)) continue;
    const link = i.link ? topo.links.find((l) => l.id === i.link) : null;
    const far = link ? (link.a.node === site.pe ? link.b : link.a) : null;
    up.push({ ...i, far });
    routes.push({ prefix: i.prefix, type: 'connected', if: i.name, via: { node: far?.node ?? null, link: link?.id ?? null, ip: null } });
  }
  const byPrefix = {};
  for (const st of site.statics ?? []) (byPrefix[st.prefix] ??= []).push(st);
  for (const [prefix, list] of Object.entries(byPrefix)) {
    candidates.push(prefix);
    const sorted = [...list].sort((x, y) => (x.preference ?? 1) - (y.preference ?? 1));
    const alternatives = sorted.map((st) => {
      const i = up.find((x) => inPrefix(st.nextHop, x.prefix));
      return { nextHop: st.nextHop, preference: st.preference ?? 1, resolved: Boolean(i), if: i?.name ?? null, via: i ? { node: i.far?.node ?? null, link: i.link ?? null, ip: st.nextHop } : null };
    });
    const best = alternatives.find((a) => a.resolved);
    alternatives.forEach((a) => (a.state = a === best ? 'active' : a.resolved ? 'standby' : 'unresolved'));
    if (best) routes.push({ prefix, type: 'static', preference: best.preference, if: best.if, via: best.via, alternatives });
  }
  return { routes, candidates: [...new Set(candidates)] };
}

// RFC 4271 §4.3 UPDATE carrying one VPN-IPv4 route in MP_REACH_NLRI (RFC 4760 §3).
export function buildUpdate(route) {
  return {
    type: 'UPDATE',
    withdrawnRoutes: [],
    pathAttributes: {
      ORIGIN: Object.keys(ORIGIN).find((k) => ORIGIN[k] === route.origin),
      AS_PATH: route.asPath.join(' ') || '(empty, iBGP)',
      LOCAL_PREF: route.localPref,
      EXTENDED_COMMUNITIES: route.rts.map((rt) => `RT:${rt}`),
      MP_REACH_NLRI: {
        afi: AFI_IPV4,
        safi: SAFI_MPLS_VPN,
        nextHop: `0:0:${route.nextHop}`, // RD 0 + IPv4 (RFC 4364 §4.3.2)
        nlri: [{ label: route.label, rd: route.rd, prefix: route.prefix }],
      },
    },
  };
}

function configuredSessions(topo, pes) {
  if (topo.bgp?.sessions) return topo.bgp.sessions;
  const out = [];
  for (let i = 0; i < pes.length; i++) for (let j = i + 1; j < pes.length; j++) out.push({ a: pes[i], b: pes[j], client: null });
  return out;
}

export function computeBgp(topo, isis, mpls, vendor, linkStates = null) {
  const linkUp = (id) => !linkStates || linkStates[id]?.up !== false;
  const pes = topo.nodes.filter((n) => n.role === 'pe').map((n) => n.id);
  const lo = (id) => nodeById(topo, id).loopback;
  const reach = (from, to) => Boolean(isis.rib[from]?.[`${lo(to)}/32`]);

  // TCP between loopbacks needs IGP reachability both ways, and both ends
  // must configure the other: an unconfigured end refuses the connection, so
  // the configured one stays Active (RFC 4271 §8.2.2).
  const sessions = configuredSessions(topo, pes).map(({ a, b, client = null, configuredOn = null }) => {
    const missing = configuredOn ? [a, b].filter((x) => !configuredOn.includes(x)) : [];
    const reachable = reach(a, b) && reach(b, a);
    const s = { a, b, client, aAddr: lo(a), bAddr: lo(b), state: reachable && !missing.length ? 'Established' : 'Active' };
    if (missing.length) s.reason = `not configured on ${missing.join(', ')}`;
    else if (!reachable) s.reason = 'loopbacks unreachable';
    return s;
  });
  const speakers = [...new Set(sessions.flatMap((s) => [s.a, s.b]))].sort();
  const session = (x, y) => sessions.find((s) => (s.a === x && s.b === y) || (s.a === y && s.b === x));
  const established = (x, y) => session(x, y)?.state === 'Established';
  const peersOf = (x) => speakers.filter((y) => y !== x && established(x, y));
  const isClient = (rr, y) => session(rr, y)?.client === y;

  // Originate: each PE exports its sites' routes with a per-prefix VPN label
  // (allocated over every prefix the site can originate, so a label stays put
  // when a route comes and goes).
  const originated = {};
  const local = {};
  for (const pe of pes) {
    originated[pe] = [];
    local[pe] = {};
    let label = vendor.mpls.vpnLabelBase(nodeOrdinal(topo, pe));
    for (const vrf of topo.vrfs ?? []) {
      for (const site of vrf.sites.filter((s) => s.pe === pe)) {
        const { routes, candidates } = siteRoutes(topo, site, linkUp);
        const labels = Object.fromEntries(candidates.map((p) => [p, label++]));
        for (const r of routes) {
          if ((local[pe][vrf.name] ??= {})[r.prefix]) continue;
          local[pe][vrf.name][r.prefix] = { ...r, vpnLabel: labels[r.prefix] };
          const prefix = r.prefix;
          originated[pe].push({
            vrf: vrf.name,
            rd: site.rd,
            prefix,
            label: labels[prefix],
            nextHop: lo(pe),
            originator: pe,
            rts: vrf.rt.export,
            origin: ORIGIN.INCOMPLETE, // redistributed static/connected
            asPath: [],
            localPref: vendor.bgp.localPref,
            med: 0,
            site,
          });
        }
      }
    }
  }

  // Adj-RIB-In per speaker: routes from direct peers, then route reflection
  // until nothing changes (RFC 4456 §6): a reflector passes a client's route
  // to every other peer and a non-client's route to its clients, so a route
  // can cross several reflectors. ORIGINATOR_ID keeps a route from going back
  // to its originator and CLUSTER_LIST from looping between reflectors (§8).
  const adjRibIn = {};
  for (const x of speakers) adjRibIn[x] = peersOf(x).flatMap((p) => (originated[p] ?? []).map((r) => ({ ...r, from: p, clusterList: [] })));
  for (let changed = true, guard = 0; changed && guard < speakers.length + 1; guard++) {
    changed = false;
    for (const rr of speakers) {
      for (const r of [...adjRibIn[rr]]) {
        if (r.clusterList.includes(rr)) continue;
        const to = peersOf(rr).filter((y) => y !== r.from && y !== r.originator && (isClient(rr, r.from) || isClient(rr, y)));
        for (const y of to) {
          if (adjRibIn[y].some((x) => x.originator === r.originator && x.rd === r.rd && x.prefix === r.prefix && x.from === rr)) continue;
          if (r.clusterList.includes(y)) continue;
          adjRibIn[y].push({ ...r, from: rr, reflectedBy: rr, originatorId: r.originator, clusterList: [rr, ...r.clusterList] });
          changed = true;
        }
      }
    }
  }
  const vrfs = {};
  for (const pe of pes) {
    adjRibIn[pe] ??= [];
    vrfs[pe] = {};
    for (const vrf of topo.vrfs ?? []) {
      if (!vrf.sites.some((s) => s.pe === pe)) continue;
      const table = { ...(local[pe][vrf.name] ?? {}) };
      const imported = adjRibIn[pe].filter((r) => r.rts.some((rt) => vrf.rt.import.includes(rt)));
      const byPrefix = {};
      for (const r of imported) (byPrefix[r.prefix] ??= []).push(r);
      for (const [prefix, routes] of Object.entries(byPrefix)) {
        if (table[prefix]) continue; // local static/connected wins
        // §9.1.2.1: a route whose NEXT_HOP is unresolvable is excluded; for a
        // VPN route the next hop also needs an LSP (RFC 4364 §5).
        const usable = routes
          .filter((r) => isis.rib[pe][`${r.nextHop}/32`] && mpls.ftn[pe]?.[`${r.nextHop}/32`])
          .map((r) => ({
            ...r,
            neighborAs: topo.asn,
            ebgp: false,
            igpCost: isis.rib[pe][`${r.nextHop}/32`].metric,
            bgpId: r.originator === r.from ? r.nextHop : lo(r.from),
            peerAddr: lo(r.from),
          }));
        const { best, reason } = bestPath(usable);
        if (!best) continue;
        table[prefix] = {
          prefix,
          type: 'bgp',
          rd: best.rd,
          nextHop: best.nextHop,
          from: best.from,
          vpnLabel: best.label,
          igpCost: best.igpCost,
          reason,
          candidates: usable.length,
        };
      }
      vrfs[pe][vrf.name] = Object.fromEntries(
        Object.entries(table).sort(([a], [b]) => compareIp(a.split('/')[0], b.split('/')[0])),
      );
    }
  }
  return { pes, speakers, sessions, originated, adjRibIn, vrfs };
}
