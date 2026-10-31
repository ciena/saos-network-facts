// SPDX-License-Identifier: Apache-2.0
// SR Policy, RFC 9256 (Segment Routing Policy Architecture), SR-MPLS data plane.
// A policy is identified by (headend, color, endpoint) (§2.1) and here has one
// explicit candidate path with one segment list of Prefix-SID labels (§2.2,
// §4). Traffic steered into it gets the segment list pushed; every node along
// the way forwards on the top SID with its ordinary SR LFIB.
//
// topo.srPolicies: [{ name, headend, color, endpoint: ip, segmentList: { name, sids: [label] } }]

import { IMPLICIT_NULL, nodeOfSid } from './mpls.js';
import { hostPrefix } from './ip.js';
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

export function computeSrPolicies(topo, isis, mpls, vendor) {
  const policies = (topo.srPolicies ?? []).map((p) => {
    const endpointNode = topo.nodes.find((n) => n.loopback === p.endpoint || (n.loopbacks ?? []).includes(p.endpoint))?.id ?? null;
    const sids = p.segmentList.sids.map((label) => ({ label, node: nodeOfSid(topo, vendor, label) ?? null }));
    const base = { ...p, endpointNode, sids, valid: false, path: [p.headend], hops: [] };
    // §5.1: a segment list is invalid when its SIDs cannot be resolved; we
    // require every Prefix-SID to be a reachable node (a simplification).
    if (mpls.mode !== 'sr') return { ...base, reason: 'SR-MPLS is not the active label mode' };
    if (!endpointNode) return { ...base, reason: `endpoint ${p.endpoint} is no router loopback` };
    const unknown = sids.find((s) => !s.node);
    if (unknown) return { ...base, reason: `SID ${unknown.label} is no Prefix-SID in the SRGB` };
    const unreachable = sids.find((s) => s.node !== p.headend && !isis.rib[p.headend]?.[hostPrefix(nodeById(topo, s.node).loopback)]);
    if (unreachable) return { ...base, reason: `SID ${unreachable.label} (${unreachable.node}) unreachable from ${p.headend}` };
    const { hops, end, error } = followStack(topo, mpls, vendor, p.headend, p.segmentList.sids);
    if (error) return { ...base, hops, reason: error };
    if (end !== endpointNode) return { ...base, hops, reason: `segment list ends at ${end}, not the endpoint ${endpointNode}` };
    return { ...base, valid: true, reason: 'valid', hops, path: [p.headend, ...hops.map((h) => h.to)] };
  });
  return { policies };
}

// The policy steering (headend, color, endpoint node), RFC 9256 §8.
export function policyFor(sr, headend, color, endpointNode) {
  return sr.policies.find((p) => p.headend === headend && p.color === color && p.endpointNode === endpointNode) ?? null;
}

// Impose `stack` at `node`: resolve the top SID through the FTN (a top SID of
// an adjacent node with PHP is not imposed at all). `pick` chooses among ECMP
// next hops. Returns { stack, nextHop, top, target }.
export function imposeSr(topo, mpls, vendor, node, stack, pick = (hops) => hops[0]) {
  let labels = [...stack];
  while (labels.length && nodeOfSid(topo, vendor, labels[0]) === node) labels = labels.slice(1);
  if (!labels.length) return { stack: [], nextHop: null };
  const target = nodeOfSid(topo, vendor, labels[0]);
  const ftn = mpls.ftn[node]?.[hostPrefix(nodeById(topo, target).loopback)];
  if (!ftn) return { stack: labels, nextHop: null };
  const nh = pick(ftn.nextHops);
  return { stack: nh.label === IMPLICIT_NULL ? labels.slice(1) : [nh.label, ...labels.slice(1)], nextHop: nh, top: labels[0], target };
}
