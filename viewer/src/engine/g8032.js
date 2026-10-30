// SPDX-License-Identifier: Apache-2.0
// Ethernet ring protection, ITU-T G.8032 (ERP). A ring is a closed loop of
// links; one of them, the ring protection link (RPL), is blocked by its owner
// (and neighbour) in the idle state so the ring is loop-free. When a ring link
// fails, the two nodes beside it block their failed ports and send R-APS(SF)
// around the ring; every node flushes its FDB and the RPL owner unblocks the
// RPL, so traffic flows the other way round (protection state). A sub-ring is
// an open ring that closes through two interconnection nodes of another ring;
// without a virtual channel its R-APS channel ends at those nodes.
//
// topo.rings[] (import/facts.js): { id, name, type: 'major' | 'sub', rapsVid, level, revertive,
//   wtrMin, guardMs, holdOffMs, members, nodes: [{ node, ports: [{ name, if, link }], rpl, rplPort,
//   terminates }], links, rpl: { link, owner, neighbor } | null, path: { nodes, links, closed },
//   subRingOf, interconnect }

import { ends } from './topology.js';

// Y.1731 §9.10 / G.8032 §10.3: R-APS PDU, OpCode 40, in a CFM frame at the
// instance's MEG level, to the ring-specific group address 01-19-A7-00-00-0X
// (X = ring id, version 2).
export const RAPS_OPCODE = 40;
export const RAPS_REQUEST = { NR: 0b0000, MS: 0b0111, SF: 0b1011, FS: 0b1101 };

export function rapsGroupMac(ringId) {
  const x = Number.isInteger(Number(ringId)) && Number(ringId) >= 0 && Number(ringId) <= 255 ? Number(ringId) : 1;
  return `01:19:a7:00:00:${x.toString(16).padStart(2, '0')}`;
}

export function ringTimers(ring, vendor) {
  const d = vendor.g8032;
  return {
    wtrMin: ring.wtrMin ?? d.wtrMin,
    guardMs: ring.guardMs ?? d.guardMs,
    holdOffMs: ring.holdOffMs ?? d.holdOffMs,
    revertive: ring.revertive ?? true, // G.8032 §10.1.1: revertive operation is the default
  };
}

// The ring port of `node` on `link`, as configured ({ name, if, link }), or null.
export function ringPort(ring, node, link) {
  return ring.nodes.find((n) => n.node === node)?.ports.find((p) => p.link === link) ?? null;
}

// The ring's state for one link-state set. `overrides[ring.id]` replaces the
// computed blocked ports (the replay's recovery phase: RPL forwarding while a
// repaired port waits for R-APS(NR, RB)).
export function computeG8032(topo, linkStates, vendor, overrides = {}) {
  const rings = [];
  for (const ring of topo.rings ?? []) {
    const t = ringTimers(ring, vendor);
    const failed = ring.links.filter((l) => !linkStates[l]?.up);
    let blocked = [];
    let state;
    if (!ring.rpl) state = 'no-rpl'; // nothing blocks: the view cannot say where the loop is broken
    else if (failed.length) {
      state = 'protection';
      for (const id of failed) {
        const l = topo.links.find((x) => x.id === id);
        for (const n of [l.a.node, l.b.node]) if (ringPort(ring, n, id)) blocked.push({ node: n, link: id, why: 'SF' });
      }
    } else {
      state = 'idle';
      blocked.push({ node: ring.rpl.owner, link: ring.rpl.link, why: 'RPL' });
      if (ring.rpl.neighbor) blocked.push({ node: ring.rpl.neighbor, link: ring.rpl.link, why: 'RPL' });
    }
    const o = overrides[ring.id];
    if (o) {
      blocked = o.blocked;
      state = o.state ?? state;
    }
    rings.push({ id: ring.id, name: ring.name, type: ring.type, rapsVid: ring.rapsVid, level: ring.level, state, failed, blocked, timers: t, links: ring.links, nodes: ring.nodes.map((n) => n.node) });
  }
  return { rings };
}

// Does the ring forward frames over `link` in this state (up and blocked at neither end)?
export function linkForwards(ringState, link) {
  return !ringState.failed.includes(link) && !ringState.blocked.some((b) => b.link === link);
}

// The nodes a frame of the ring's VLANs visits from `from` to `to` over the
// forwarding ring links (breadth first), with the links, or null when the
// rings do not join them in this state. A sub-ring's frames also cross the
// ring it is attached to (the same VLANs, through the interconnection nodes),
// so that ring's forwarding links count too.
export function ringDataPath(topo, g8032, ringId, from, to) {
  const states = [g8032.rings.find((r) => r.id === ringId)];
  const ring = topo.rings.find((r) => r.id === ringId);
  if (ring?.subRingOf) states.push(g8032.rings.find((r) => r.id === ring.subRingOf));
  const forwarding = states.filter(Boolean).flatMap((st) => st.links.filter((id) => linkForwards(st, id)));
  const queue = [[from]];
  const seen = new Set([from]);
  const via = new Map();
  while (queue.length) {
    const path = queue.shift();
    const cur = path.at(-1);
    if (cur === to) {
      const links = [];
      for (let i = 1; i < path.length; i++) links.push(via.get(`${path[i - 1]}>${path[i]}`));
      return { nodes: path, links };
    }
    for (const id of forwarding) {
      const l = topo.links.find((x) => x.id === id);
      if (l.a.node !== cur && l.b.node !== cur) continue;
      const next = ends(l, cur).remote.node;
      if (seen.has(next)) continue;
      seen.add(next);
      via.set(`${cur}>${next}`, id);
      queue.push([...path, next]);
    }
  }
  return null;
}

// The R-APS frame headers a node sends on the ring (Y.1731 Table 9-28).
export function rapsHeaders(ring, from, request, { rb = false, dnf = false, bpr = 0 } = {}, vendor, topo) {
  const ord = topo.nodes.findIndex((n) => n.id === from) + 1;
  const name = Object.keys(RAPS_REQUEST).find((k) => RAPS_REQUEST[k] === request);
  return [
    { name: 'Ethernet II', fields: { dst: rapsGroupMac(ring.ringId ?? ring.id), src: vendor.mac(ord, 1), 'VLAN (R-APS)': ring.rapsVid ?? '-', ethertype: '0x8902 (CFM)' } },
    { name: 'R-APS', fields: { 'MEG level': ring.level ?? '-', version: 1, opcode: RAPS_OPCODE, request: `${name} (${request.toString(2).padStart(4, '0')})`, RB: rb ? 1 : 0, DNF: dnf ? 1 : 0, BPR: bpr, 'node id': vendor.mac(ord, 1) } },
  ];
}

// R-APS propagation along the ring from `from`, away from `avoid` (the failed
// link, or none): the ordered hops [{ from, to, link }] a frame sent on both
// ring ports makes, each ring node forwarding it on its other port, until the
// ring is covered or the frame reaches the open end of a sub-ring, with the
// hop count from the sender (`depth`). Without a virtual channel an
// interconnection node has no further sub-ring link, so the sub-ring's R-APS
// ends there and never enters the major ring.
export function rapsHops(topo, ring, from, { avoid = null } = {}) {
  const hops = [];
  const seen = new Set([from]);
  let frontier = [from];
  const dir = new Map();
  for (let depth = 1; frontier.length; depth++) {
    const next = [];
    for (const cur of frontier) {
      for (const id of ring.links) {
        if (id === avoid || id === dir.get(cur)) continue;
        const l = topo.links.find((x) => x.id === id);
        if (l.a.node !== cur && l.b.node !== cur) continue;
        const to = ends(l, cur).remote.node;
        if (seen.has(to)) continue;
        seen.add(to);
        dir.set(to, id);
        hops.push({ from: cur, to, link: id, depth });
        next.push(to);
      }
    }
    frontier = next;
  }
  return hops;
}
