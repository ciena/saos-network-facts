// SPDX-License-Identifier: Apache-2.0
// SR Policy, RFC 9256 (Segment Routing Policy Architecture). A policy is identified by
// (headend, color, endpoint) (§2.1) and here has one explicit candidate path with one segment list
// (§2.2, §4). Traffic steered into it gets the segment list; every node along the way forwards on
// the active segment.
//
// SR-MPLS (RFC 8660): a segment is a Prefix-SID label, in algorithm 0 (the IGP's SPF, over the SR
// LFIB) or in a Flex-Algo (RFC 9350 §8: that algorithm's shortest path), or a static adjacency SID
// of the node the packet is at (RFC 8402 §3.4: out of that link, popped). SRv6 (RFC 8986): a
// segment is a SID inside a locator (a uSID may be written as the locator itself), followed along
// the locator's algorithm to the node that owns it.
//
// topo.srPolicies: [{ name, headend, color, endpoint: ip, segmentList: { name, type, sids } }]
//   type 'mpls' (sids are labels; absent in older topologies) or 'srv6' (sids are IPv6 SIDs)
// topo.adjSids:    [{ node, interface, label, link, neighbor }]
// node.algoSids:   [{ algorithm, index | label }], the loopback's Flex-Algo Prefix-SIDs

import { IMPLICIT_NULL, nodeOfSid, srgbOf } from './mpls.js';
import { hostPrefix, longestMatch } from './ip.js';
import { nodeById } from './topology.js';

// Follow a label stack from `start` over the SR LFIBs until it is empty.
// Returns { hops: [{ from, to, link, stack }], end, error }.
export function followStack(topo, mpls, vendor, start, stack) {
  const hops = [];
  let cur = start;
  let labels = [...stack];
  for (let guard = 0; labels.length && guard < 64; guard++) {
    const top = labels[0];
    if (nodeOfSid(topo, vendor, top) === cur) {
      labels = labels.slice(1); // our own Prefix-SID: next segment
      continue;
    }
    const entry = mpls.lfib[cur]?.[top];
    if (!entry) return { hops, end: cur, error: `${cur}: no LFIB entry for ${top}` };
    const nh = entry.nextHops[0];
    labels = nh.op === 'pop' ? labels.slice(1) : [nh.outLabel, ...labels.slice(1)];
    hops.push({ from: cur, to: nh.node, link: nh.link, stack: labels });
    cur = nh.node;
  }
  return { hops, end: cur, error: labels.length ? 'forwarding loop' : null };
}

// The router whose Prefix-SID in a Flex-Algo is `label`, as { node, algorithm }, or null.
export function nodeOfAlgoSid(topo, vendor, label) {
  const { base } = srgbOf(topo, vendor);
  for (const n of topo.nodes) {
    if (n.role === 'ce') continue;
    const s = (n.algoSids ?? []).find((x) => (x.label ?? base + x.index) === label);
    if (s) return { node: n.id, algorithm: s.algorithm };
  }
  return null;
}

// What an MPLS label is when the packet is at `at`: its adjacency SID, else a Prefix-SID (algorithm 0
// first, then the Flex-Algos), else some other router's adjacency SID (meaningless here), else null.
function mplsSegment(topo, vendor, label, at) {
  const adj = topo.adjSids ?? [];
  const own = adj.find((a) => a.node === at && a.label === label);
  if (own) return { kind: 'adjacency', ...own };
  const node = nodeOfSid(topo, vendor, label);
  if (node) return { kind: 'prefix', node, algorithm: 0 };
  const fa = nodeOfAlgoSid(topo, vendor, label);
  if (fa) return { kind: 'prefix', ...fa };
  const other = adj.find((a) => a.label === label);
  return other ? { kind: 'foreign-adjacency', ...other } : null;
}

const algoName = (a) => (a ? `Flex-Algo ${a}` : 'algorithm 0');

// Walk an SR-MPLS segment list from the headend. Returns { hops, end, error, sids: [{ label, node, algorithm?, adjacency? }] }.
function walkMpls(topo, igp, mpls, srv6, vendor, headend, labels) {
  const hops = [];
  const sids = [];
  let cur = headend;
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const rest = labels.slice(i + 1);
    const seg = mplsSegment(topo, vendor, label, cur);
    const fail = (error) => ({ hops, end: cur, error, sids: [...sids, ...labels.slice(i).map((l) => ({ label: l, node: null }))] });
    if (!seg) return fail(`SID ${label} is no Prefix-SID in the SRGB and no adjacency SID`);
    if (seg.kind === 'foreign-adjacency') return fail(`SID ${label} is an adjacency SID of ${seg.node} (${seg.interface}), but the packet is at ${cur}`);
    if (seg.kind === 'adjacency') {
      if (!igp.adjacencies.some((a) => a.link === seg.link && a.state === 'Up')) return fail(`${cur}: adjacency SID ${label} (${seg.interface}): the adjacency is down`);
      hops.push({ from: cur, to: seg.neighbor, link: seg.link, stack: rest });
      sids.push({ label, node: cur, adjacency: seg.interface });
      cur = seg.neighbor;
      continue;
    }
    sids.push({ label, node: seg.node, algorithm: seg.algorithm });
    if (seg.node === cur) continue; // our own Prefix-SID: next segment
    if (seg.algorithm === 0) {
      if (mpls.mode !== 'sr') return fail('SR-MPLS is not the active label mode');
      if (!igp.rib[cur]?.[hostPrefix(nodeById(topo, seg.node).loopback)]) return fail(`SID ${label} (${seg.node}) unreachable from ${cur}`);
      const walk = followStack(topo, mpls, vendor, cur, [label]);
      for (const h of walk.hops) hops.push({ ...h, stack: [...h.stack, ...rest] });
      if (walk.error) return { ...fail(walk.error), hops };
      cur = walk.end;
      continue;
    }
    // A Flex-Algo Prefix-SID: hop by hop along the algorithm's shortest path; the penultimate hop pops.
    const spf = srv6?.spfs?.[seg.algorithm];
    for (let guard = 0; cur !== seg.node; guard++) {
      if (!spf) return fail(`SID ${label} (${seg.node}): no ${algoName(seg.algorithm)} definition, so no router computes it`);
      if (!spf[cur]) return fail(`SID ${label} (${seg.node}): ${cur} takes no part in ${algoName(seg.algorithm)}`);
      const nh = spf[cur].nextHops?.[seg.node]?.[0];
      if (!nh || guard > 64) return fail(`SID ${label}: ${seg.node} is not reachable from ${cur} in ${algoName(seg.algorithm)}`);
      hops.push({ from: cur, to: nh.node, link: nh.link, stack: nh.node === seg.node ? rest : [label, ...rest] });
      cur = nh.node;
    }
  }
  return { hops, end: cur, error: null, sids };
}

// The locator an SRv6 SID is in (longest match), or null. A uSID written as a prefix is matched by its address.
export function locatorOfSid(srv6, sid) {
  return longestMatch(srv6?.locators ?? [], String(sid).split('/')[0]);
}

// Walk an SRv6 segment list from the headend, each SID along its locator's route.
function walkSrv6(srv6, headend, list) {
  const hops = [];
  const sids = [];
  let cur = headend;
  for (let i = 0; i < list.length; i++) {
    const sid = list[i];
    const loc = locatorOfSid(srv6, sid);
    const fail = (error) => ({ hops, end: cur, error, sids: [...sids, ...list.slice(i).map((s) => ({ label: s, node: null }))] });
    if (!loc) return fail(`SID ${sid} is in no SRv6 locator`);
    sids.push({ label: sid, node: loc.node, algorithm: loc.algorithm, locator: loc.name });
    for (let guard = 0; cur !== loc.node; guard++) {
      const r = srv6.rib[cur]?.[loc.prefix];
      if (!r || r.unreachable) return fail(`SID ${sid} (${loc.node} ${loc.name}): ${r?.unreachable ?? `${cur} has no route`}`);
      const nh = r.nextHops[0];
      if (!nh || guard > 64) return fail(`SID ${sid}: forwarding loop`);
      hops.push({ from: cur, to: nh.node, link: nh.link, stack: list.slice(i) });
      cur = nh.node;
    }
  }
  return { hops, end: cur, error: null, sids };
}

export function computeSrPolicies(topo, igp, mpls, vendor, srv6 = null) {
  const policies = (topo.srPolicies ?? []).map((p) => {
    const endpointNode = topo.nodes.find((n) => n.loopback === p.endpoint || (n.loopbacks ?? []).includes(p.endpoint))?.id ?? null;
    const isSrv6 = p.segmentList.type === 'srv6';
    const base = { ...p, endpointNode, sids: p.segmentList.sids.map((label) => ({ label, node: null })), valid: false, path: [p.headend], hops: [] };
    // §5.1: a segment list is invalid when its SIDs cannot be resolved; here every SID must be
    // reachable, in its algorithm, from where the previous one leaves the packet.
    if (!isSrv6 && mpls.mode !== 'sr') return { ...base, reason: 'SR-MPLS is not the active label mode' };
    if (!endpointNode) return { ...base, reason: `endpoint ${p.endpoint} is no router loopback` };
    const walk = isSrv6 ? walkSrv6(srv6 ?? { locators: [], rib: {} }, p.headend, p.segmentList.sids) : walkMpls(topo, igp, mpls, srv6, vendor, p.headend, p.segmentList.sids);
    const out = { ...base, sids: walk.sids, hops: walk.hops };
    if (walk.error) return { ...out, reason: walk.error };
    if (walk.end !== endpointNode) return { ...out, reason: `segment list ends at ${walk.end}, not the endpoint ${endpointNode}` };
    return { ...out, valid: true, reason: 'valid', path: [p.headend, ...walk.hops.map((h) => h.to)] };
  });
  return { policies };
}

// The policy steering (headend, color, endpoint node), RFC 9256 §8.
export function policyFor(sr, headend, color, endpointNode) {
  return sr.policies.find((p) => p.headend === headend && p.color === color && p.endpointNode === endpointNode) ?? null;
}

// Impose `stack` at `node`: resolve the top SID through the FTN (a top SID of
// an adjacent node with PHP is not imposed at all). `pick` chooses among ECMP
// next hops. Returns { stack, nextHop, top, target }. Only algorithm 0
// Prefix-SIDs resolve here: a top SID that is a Flex-Algo or adjacency SID
// gives no next hop.
export function imposeSr(topo, mpls, vendor, node, stack, pick = (hops) => hops[0]) {
  let labels = [...stack];
  while (labels.length && nodeOfSid(topo, vendor, labels[0]) === node) labels = labels.slice(1);
  if (!labels.length) return { stack: [], nextHop: null };
  const target = nodeOfSid(topo, vendor, labels[0]);
  if (!target) return { stack: labels, nextHop: null };
  const ftn = mpls.ftn[node]?.[hostPrefix(nodeById(topo, target).loopback)];
  if (!ftn) return { stack: labels, nextHop: null };
  const nh = pick(ftn.nextHops);
  return { stack: nh.label === IMPLICIT_NULL ? labels.slice(1) : [nh.label, ...labels.slice(1)], nextHop: nh, top: labels[0], target };
}
