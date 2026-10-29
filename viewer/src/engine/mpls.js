// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// MPLS label distribution. A label protocol turns the IGP routing table into
// per-LSR label bindings, an LFIB (incoming label -> swap/pop) and an FTN
// (FEC -> label to push). LDP and SR-MPLS implement the same interface, so the
// rest of the engine and the walks do not care which one is active:
//
//   build(topo, isis, vendor) -> { mode, sessions, bindings, lfib, ftn }
//
// FECs are the routers' loopback /32s (the BGP next hops).

import { compareIp } from './ip.js';
import { nodeById, nodeOrdinal } from './topology.js';

// RFC 3032 §2.1 reserved label values.
export const IMPLICIT_NULL = 3;

export function fecsOf(topo, isis) {
  return isis.routers
    .map((r) => `${nodeById(topo, r).loopback}/32`)
    .sort((a, b) => compareIp(a.split('/')[0], b.split('/')[0]));
}

function ownFec(topo, node) {
  return `${nodeById(topo, node).loopback}/32`;
}

// LFIB + FTN from a "label this neighbour expects for this FEC" function.
function forwarding(topo, isis, localLabel, remoteLabel) {
  const lfib = {};
  const ftn = {};
  for (const r of isis.routers) {
    lfib[r] = {};
    ftn[r] = {};
    for (const fec of fecsOf(topo, isis)) {
      const route = isis.rib[r][fec];
      if (!route || route.local) continue;
      const nexthops = route.nextHops
        .map((nh) => ({ ...nh, label: remoteLabel(nh.node, fec) }))
        .filter((nh) => nh.label !== undefined);
      if (!nexthops.length) continue;
      ftn[r][fec] = { fec, nextHops: nexthops, metric: route.metric };
      const inLabel = localLabel(r, fec);
      if (inLabel === undefined || inLabel === IMPLICIT_NULL) continue;
      lfib[r][inLabel] = {
        inLabel,
        fec,
        nextHops: nexthops.map((nh) => ({
          node: nh.node,
          link: nh.link,
          op: nh.label === IMPLICIT_NULL ? 'pop' : 'swap',
          outLabel: nh.label === IMPLICIT_NULL ? null : nh.label,
        })),
      };
    }
  }
  return { lfib, ftn };
}

// LDP, RFC 5036: Downstream Unsolicited advertisement (§2.6.3), independent
// control (§2.6.1) and liberal retention (§2.6.2). Each LSR binds a local label
// to every FEC in its routing table and advertises it to every LDP peer; the
// egress LSR advertises Implicit NULL for its own loopback, so the penultimate
// hop pops (PHP, RFC 3031 §3.16).
export const ldp = {
  mode: 'ldp',
  name: 'LDP (RFC 5036)',
  build(topo, isis, vendor) {
    // Link hello discovery (§2.4.1) + session (§2.5) on every Up adjacency.
    const sessions = isis.adjacencies
      .filter((a) => a.state === 'Up')
      .map((a) => ({ a: a.a, b: a.b, link: a.link, state: 'Operational' }));
    const peers = (r) => [
      ...new Set(sessions.filter((s) => s.a === r || s.b === r).map((s) => (s.a === r ? s.b : s.a))),
    ];

    const local = {};
    for (const r of isis.routers) {
      local[r] = {};
      let next = vendor.mpls.ldpLabelBase(nodeOrdinal(topo, r));
      for (const fec of fecsOf(topo, isis)) {
        if (fec === ownFec(topo, r)) local[r][fec] = IMPLICIT_NULL;
        else if (isis.rib[r][fec]) local[r][fec] = next++;
        else next++; // keep labels stable when a FEC disappears
      }
    }
    const bindings = {};
    for (const r of isis.routers) {
      bindings[r] = {};
      for (const [fec, label] of Object.entries(local[r])) {
        // Liberal retention: keep every peer's mapping, used or not.
        const remote = Object.fromEntries(
          peers(r).filter((p) => local[p][fec] !== undefined).map((p) => [p, local[p][fec]]),
        );
        bindings[r][fec] = { local: label, remote };
      }
    }
    const { lfib, ftn } = forwarding(
      topo,
      isis,
      (r, fec) => local[r][fec],
      (nbr, fec) => (peers(nbr).length ? local[nbr][fec] : undefined),
    );
    return { mode: 'ldp', sessions, bindings, lfib, ftn };
  },
};

// The SRGB in use: the topology's configured block (topo.srgb), else the
// vendor default. Uniform across the domain.
export const srgbOf = (topo, vendor) => topo.srgb ?? vendor.mpls.srgb;

// Prefix-SID of a router's loopback: SRGB base + index (uniform SRGB). The
// index is the node's configured `sidIndex`, else its ordinal.
export function prefixSidLabel(topo, vendor, nodeId) {
  const n = nodeById(topo, nodeId);
  return srgbOf(topo, vendor).base + (n.sidIndex ?? nodeOrdinal(topo, n.id));
}

// The router whose Prefix-SID is `label`, or undefined.
export function nodeOfSid(topo, vendor, label) {
  return topo.nodes.find((n) => n.role !== 'ce' && n.loopback && prefixSidLabel(topo, vendor, n.id) === label)?.id;
}

// SR-MPLS, RFC 8402 + RFC 8667 (IS-IS extensions) + RFC 8660 (MPLS data
// plane). Each router advertises a Prefix-SID index for its loopback in IS-IS;
// the label is SRGB base + index on every router (uniform SRGB). The P flag
// (no-PHP, RFC 8667 §2.1.1) is clear, so the penultimate hop pops.
export const sr = {
  mode: 'sr',
  name: 'SR-MPLS (RFC 8402/8667)',
  build(topo, isis, vendor) {
    const { base } = srgbOf(topo, vendor);
    const sidIndex = (fec) => {
      const n = topo.nodes.find((x) => `${x.loopback}/32` === fec);
      return n.sidIndex ?? nodeOrdinal(topo, n.id);
    };
    const label = (r, fec) => {
      if (!isis.rib[r][fec]) return undefined;
      return fec === ownFec(topo, r) ? IMPLICIT_NULL : base + sidIndex(fec);
    };
    const bindings = {};
    for (const r of isis.routers) {
      bindings[r] = {};
      for (const fec of fecsOf(topo, isis)) {
        if (!isis.rib[r][fec]) continue;
        bindings[r][fec] = { local: base + sidIndex(fec), sidIndex: sidIndex(fec), php: fec === ownFec(topo, r) };
      }
    }
    const { lfib, ftn } = forwarding(topo, isis, (r, fec) => (fec === ownFec(topo, r) ? undefined : label(r, fec)), label);
    return { mode: 'sr', sessions: [], bindings, lfib, ftn };
  },
};

// No dynamic label distribution: only statically configured LSPs (MPLS-TP
// tunnels, see mplstp.js) carry labels.
export const none = {
  mode: 'none',
  name: 'static only (no LDP/SR)',
  build() {
    return { mode: 'none', sessions: [], bindings: {}, lfib: {}, ftn: {} };
  },
};

export const labelProtocols = { ldp, sr, none };
