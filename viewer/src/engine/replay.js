// SPDX-License-Identifier: Apache-2.0
// Link-failure -> reconvergence replay. Builds the network before and after the
// failure and lays out, on one timeline, what each protocol does in between:
// LACP member removal, CFM/BFD loss of continuity, IGP adjacency down (IS-IS
// or OSPF), LSP/LSA regeneration and flooding, SPF, LFIB/FTN updates, BGP
// next-hop tracking, MPLS-TP tunnel loss of continuity and protection
// switching, the pseudowires riding them, and G.8032 ring protection (R-APS
// Signal Fail, RPL unblock, and after the repair the guard timer, wait-to-
// restore and R-APS(NR, RB)) on the rings the link is part of.

import { buildNetwork } from './network.js';
import { ccmStream, fmtMs } from './cfm.js';
import { floodLsp } from './isis.js';
import { areaView, fmtSeq } from './ospf.js';
import { describeLacpState } from './lag.js';
import { dataWalk, hostWalk } from './walk.js';
import { nodeById } from './topology.js';
import { RAPS_REQUEST, rapsHeaders, rapsHops, ringDataPath, ringPort } from './g8032.js';

function linkOfFailure(topo, failure) {
  const link = topo.links.find((l) => l.id === failure || l.members.some((m) => m.id === failure));
  if (!link) throw new Error(`unknown link or member ${failure}`);
  return link;
}

function lfibByFec(net, r) {
  return Object.fromEntries(Object.values(net.mpls.lfib[r] ?? {}).map((e) => [e.fec, e]));
}

function describeLfib(e) {
  if (!e) return 'none';
  return e.nextHops.map((nh) => (nh.op === 'swap' ? `swap ${e.inLabel}->${nh.outLabel}` : `pop ${e.inLabel}`) + ` to ${nh.node}`).join(', ');
}

// detection: 'ccm' (silent failure, found by CFM) or 'los' (loss of signal).
// The traffic shown before and after: CE `from` -> CE `to` (default the first
// two CEs with a LAN), or with `host: { from, dst, vrf? }` a host walk.
export function replayFailure(topo, failure, { labelMode = 'ldp', vendor, detection = 'ccm', from = null, to = null, host = null } = {}) {
  const opts = { labelMode, ...(vendor ? { vendor } : {}) };
  const before = buildNetwork(topo, opts);
  const v = before.vendor;
  const link = linkOfFailure(topo, failure);
  const ceIds = topo.nodes.filter((n) => n.role === 'ce' && n.lan).map((n) => n.id);
  const src = from ?? ceIds[0];
  const dst = to ?? ceIds[1];
  const walkOf = (net) => (host ? hostWalk(net, host.from, host.dst, { vrf: host.vrf ?? null }) : src && dst ? dataWalk(net, src, dst) : null);
  const walkBefore = walkOf(before);
  const steps = [];
  // extra.network names the network the view shows at the step ('before' | 'after' | one of
  // `networks`); without it the view shows the network before the failure until the last step.
  const step = (t, layer, title, actions, extra = {}) =>
    steps.push({ t, layer, node: extra.node ?? link.a.node, title: `t=${fmtMs(t)}: ${title}`, actions, headers: extra.headers ?? [], moves: extra.moves ?? [], status: extra.status ?? 'forward', highlight: extra.highlight ?? { links: [link.id] }, ...(extra.network ? { network: extra.network } : {}) });

  step(0, 'physical', `${failure} fails`, [`${link.lag && failure !== link.id ? 'LAG member' : 'link'} ${failure} stops carrying frames`], { status: 'dropped' });
  // 802.1AX §6.4.4: a silent member failure is found when no LACPDU arrives for 3 x the periodic time.
  const lacpTimeoutMs = (v.lacp.shortTimeout ? 1 : 30) * 3 * 1000;
  const lacpTimeout = `no LACPDU for 3 x ${v.lacp.shortTimeout ? '1 s (short timeout)' : '30 s (long timeout)'}: partner info expired (802.1AX §6.4.12)`;

  const afterLinks = buildNetwork(topo, { ...opts, failures: [failure] }).links;
  if (afterLinks[link.id].up) {
    // A LAG member failed but the bundle survives: LACP only, no IGP change.
    const after = buildNetwork(topo, { ...opts, failures: [failure] });
    const m0 = before.links[link.id].members.find((m) => m.id === failure);
    const m1 = after.links[link.id].members.find((m) => m.id === failure);
    const tLacp = detection === 'los' ? 0 : lacpTimeoutMs;
    if (detection !== 'los') step(0, 'physical', `${failure}: frames lost until LACP notices`, ['silent failure: the member stays up at both ends, flows hashed onto it are dropped'], { status: 'dropped' });
    step(tLacp, 'physical', `LACP removes ${failure} from ${link.a.if}`, [
      ...(detection === 'los' ? ['loss of signal: the port goes down at once'] : [lacpTimeout]),
      `port disabled: Selected -> UNSELECTED, Mux leaves COLLECTING_DISTRIBUTING (802.1AX §6.4.14-15)`,
      `actor state 0x${m0.actorState.toString(16)} [${describeLacpState(m0.actorState).join(',')}] -> 0x${m1.actorState.toString(16)} [${describeLacpState(m1.actorState).join(',')}]`,
      `distributing members: ${before.links[link.id].distributing.join(', ')} -> ${after.links[link.id].distributing.join(', ')}`,
    ]);
    step(tLacp, 'cfm', `CCMs on MEG-${link.id} keep flowing`, ['MEPs sit on the aggregated interface; no loss of continuity']);
    step(tLacp, 'isis', `${before.igpName === 'ospf' ? 'OSPF neighbour stays Full' : 'IS-IS adjacency stays Up'}`, ['LAG still up (min-links 1): no LSP/LSA change, no SPF']);
    const walkAfter = walkOf(after);
    if (walkAfter) {
      const hop = (w) => w.steps.flatMap((s) => s.moves).find((m) => m.link === link.id)?.member;
      step(tLacp, 'physical', 'Flows rehash onto the surviving members', [`${host ? `${host.from}->${host.dst}` : `${src}->${dst}`} flow: member ${hop(walkBefore) ?? '-'} -> ${hop(walkAfter) ?? '-'}`], { status: 'delivered' });
    }
    return { before, after, walkBefore, walkAfter, replay: { kind: 'replay', layer: 'physical', title: `Failure replay: ${failure}`, steps } };
  }

  // The link (or the whole bundle) is down.
  const ends = [link.a.node, link.b.node];
  const detectAt = {};
  const ospf = before.igpName === 'ospf';
  // Only a link the IGP runs on changes the LSDB (not a PE-CE or host link).
  const igpLink = before.igp.adjacencies.some((a) => a.link === link.id);
  const meg = before.cfm.megs.find((m) => m.link === link.id);
  if (detection === 'ccm' && meg) {
    const failAtMs = 2 * meg.intervalMs;
    const { defectAt } = ccmStream(meg, { durationMs: failAtMs + 5 * meg.intervalMs, failAtMs });
    for (const mep of meg.meps) detectAt[mep.node] = defectAt[mep.mepId] - failAtMs;
    for (const mep of meg.meps) {
      step(detectAt[mep.node], 'cfm', `${mep.node} MEP ${mep.mepId}: loss of continuity`, [
        `no CCM for 3.5 x ${fmtMs(meg.intervalMs)} -> DefRemoteCCM; RDI set`,
        `interface ${mep.if} declared down to IS-IS`,
      ], { node: mep.node, status: 'dropped' });
    }
  } else if (detection === 'ccm' && link.bfd) {
    // RFC 5880 §6.8.4: no BFD Control packet for Detect Mult x interval.
    const t = v.bfd.intervalMs * v.bfd.detectMult;
    for (const n of ends) {
      detectAt[n] = t;
      step(t, 'physical', `${n}: BFD session on ${link.id} Down`, [`no BFD Control packet for ${v.bfd.detectMult} x ${fmtMs(v.bfd.intervalMs)} -> Down (Control Detection Time Expired)`, 'clients (the IGP) told the neighbour is gone'], { node: n, status: 'dropped' });
    }
  } else if (detection === 'ccm' && link.lag) {
    // No CC on the bundle: every member's LACP partner times out, the aggregator goes down.
    for (const n of ends) {
      detectAt[n] = lacpTimeoutMs;
      step(lacpTimeoutMs, 'physical', `${n}: ${link.id} members expire, LAG down`, [lacpTimeout, 'no member distributing: the aggregated interface goes down'], { node: n, status: 'dropped' });
    }
  } else if (detection === 'ccm' && igpLink) {
    // No CC on the link: only the IGP hellos stop. ISO 10589 holding time / RFC 2328 RouterDeadInterval.
    const t = ospf ? v.ospf.deadIntervalS * 1000 : v.isis.holdMultiplier * v.isis.helloIntervalS * 1000;
    const why = ospf ? `no Hello for RouterDeadInterval ${fmtMs(t)} (RFC 2328 §10.3 InactivityTimer)` : `no IIH for the holding time ${v.isis.holdMultiplier} x ${fmtMs(v.isis.helloIntervalS * 1000)} (ISO 10589)`;
    step(0, 'physical', 'Silent failure: no CFM MEG or BFD on the link', ['both interfaces stay up; traffic onto the link is dropped until the IGP notices'], { status: 'dropped' });
    for (const n of ends) {
      detectAt[n] = t;
      step(t, 'isis', `${n}: ${ospf ? 'OSPF' : 'IS-IS'} hold timer on ${link.id} expires`, [why], { node: n, status: 'dropped' });
    }
  } else if (detection === 'ccm') {
    for (const n of ends) detectAt[n] = 0;
    step(0, 'physical', 'Silent failure: nothing watches the link', ['no CFM MEG, BFD, LACP or IGP adjacency on it: both interfaces stay up and traffic onto it is dropped'], { status: 'dropped' });
  } else {
    for (const n of ends) detectAt[n] = 0;
    step(0, 'physical', 'Loss of signal at both ends', ends.map((n) => `${n}: interface down`), { status: 'dropped' });
  }

  const routers = igpLink ? ends.filter((n) => (ospf ? before.ospf.lsas[n] : before.isis.lsps[n])) : [];
  const area = ospf ? before.ospf.adjacencies.find((a) => a.link === link.id)?.area : null;
  const seqs = ospf
    ? Object.fromEntries(routers.map((n) => [n, Math.max(...Object.values(before.ospf.lsas[n]).map((l) => l.seq)) + 1]))
    : Object.fromEntries(routers.map((n) => [n, before.isis.lsps[n].seq + 1]));
  const after = buildNetwork(topo, { ...opts, failures: [failure], ...(ospf ? { ospfSeqs: seqs } : { isisSeqs: seqs }) });
  const firstChange = {};
  for (const n of ospf && area ? routers : []) {
    // RFC 2328: the neighbour goes Down (§10.3 KillNbr / InactivityTimer), the
    // router re-originates its Router-LSA for the area without the p2p link
    // (§12.4) and floods it (§13).
    const t0 = detectAt[n];
    const other = ends.find((x) => x !== n);
    step(t0, 'isis', `${n}: OSPF neighbour ${other} on ${link.id} Full -> Down`, ['Router-LSA changes: schedule re-origination'], { node: n });
    const tGen = t0 + v.ospf.lsaGenDelayMs;
    const lsa = after.ospf.lsas[n][area];
    step(tGen, 'isis', `${n} originates Router-LSA ${lsa.lsId} seq ${fmtSeq(lsa.seq)} (area ${area})`, [`p2p neighbours now: ${lsa.links.map((l) => l.neighbor).join(', ') || 'none'}`], { node: n });
    firstChange[n] = Math.min(firstChange[n] ?? Infinity, t0);
    const view = { ...areaView(before.ospf, area), adjacencies: after.ospf.adjacencies.filter((a) => a.area === area) };
    for (const tx of floodLsp(view, n, lsa, v, v.ospf.floodHopDelayMs)) {
      const t = tGen + tx.t;
      if (tx.result === 'installed') firstChange[tx.to] = Math.min(firstChange[tx.to] ?? Infinity, t);
      step(t, 'isis', `${n}'s LSA ${tx.from} -> ${tx.to}: ${tx.result}`, [tx.result === 'installed' ? 'newer seq: install, LS Ack, flood on' : 'already held: LS Ack, discard'], {
        node: tx.to,
        moves: [{ from: tx.from, to: tx.to, link: tx.link, member: null, duplicate: tx.result !== 'installed' }],
        highlight: { links: [link.id, tx.link] },
      });
    }
  }
  // Summary-LSAs of an ABR change too when an area's routes change; their
  // flooding is not laid out, every router in the domain runs SPF.
  if (ospf && area) for (const r of before.ospf.routers) if (firstChange[r] === undefined && JSON.stringify(before.ospf.rib[r]) !== JSON.stringify(after.ospf.rib[r])) firstChange[r] = Math.max(0, ...Object.values(firstChange)) + v.ospf.floodHopDelayMs;
  for (const n of ospf ? [] : routers) {
    const t0 = detectAt[n];
    step(t0, 'isis', `${n}: IS-IS adjacency on ${link.id} Down`, ['remove from TLV 22, schedule LSP regeneration'], { node: n });
    const tGen = t0 + v.isis.lspGenDelayMs;
    const lsp = after.isis.lsps[n];
    step(tGen, 'isis', `${n} originates ${lsp.lspId} seq ${lsp.seq}`, [`IS neighbours now: ${lsp.isReach.map((r) => r.neighbor).join(', ') || 'none'}`], { node: n });
    firstChange[n] = Math.min(firstChange[n] ?? Infinity, t0);
    const isisView = { routers: before.isis.routers, adjacencies: after.isis.adjacencies, lsps: before.isis.lsps };
    for (const tx of floodLsp(isisView, n, lsp, v)) {
      const t = tGen + tx.t;
      if (tx.result === 'installed') firstChange[tx.to] = Math.min(firstChange[tx.to] ?? Infinity, t);
      step(t, 'isis', `${n}'s LSP ${tx.from} -> ${tx.to}: ${tx.result}`, [tx.result === 'installed' ? 'newer seq: install and flood on' : 'already held: ack and discard'], {
        node: tx.to,
        moves: [{ from: tx.from, to: tx.to, link: tx.link, member: null, duplicate: tx.result !== 'installed' }],
        highlight: { links: [link.id, tx.link] },
      });
    }
  }

  // SPF + label tables + BGP next-hop tracking, per router.
  const spfDelay = ospf ? v.ospf.spfDelayMs : v.isis.spfDelayMs;
  for (const r of before.igp.routers) {
    if (firstChange[r] === undefined) continue;
    const t = firstChange[r] + spfDelay;
    const changes = [];
    for (const [prefix, route] of Object.entries(before.igp.rib[r])) {
      if (!prefix.endsWith('/32')) continue;
      const now = after.igp.rib[r][prefix];
      const was = route.nextHops.map((h) => h.node).join('+') || 'local';
      const is = now ? now.nextHops.map((h) => h.node).join('+') || 'local' : 'unreachable';
      if (!now || was !== is || now.metric !== route.metric) changes.push(`${prefix}: via ${was} (${route.metric}) -> ${now ? `via ${is} (${now.metric})` : 'unreachable'}`);
    }
    const lb = lfibByFec(before, r);
    const la = lfibByFec(after, r);
    for (const fec of new Set([...Object.keys(lb), ...Object.keys(la)])) {
      const a = describeLfib(lb[fec]);
      const b = describeLfib(la[fec]);
      if (a !== b) changes.push(`LFIB ${fec}: ${a} -> ${b}`);
    }
    const what = after.mpls.mode === 'none' ? 'SPF' : `SPF + ${after.mpls.mode.toUpperCase()} LFIB update`;
    step(t, after.mpls.mode === 'none' ? 'isis' : 'mpls', `${r}: ${what}`, changes.length ? changes : ['SPF: no best-path change'], { node: r, highlight: { links: [link.id], nodes: [r] } });
    if (nodeById(topo, r).role === 'pe') {
      const acts = [];
      for (const [vrf, table] of Object.entries(before.bgp.vrfs[r] ?? {})) {
        for (const route of Object.values(table).filter((x) => x.type === 'bgp')) {
          const now = after.bgp.vrfs[r]?.[vrf]?.[route.prefix];
          if (now?.type === 'bgp') acts.push(`${vrf} ${route.prefix}: NH ${route.nextHop} still resolved (IGP ${route.igpCost} -> ${now.igpCost}), kept`);
          else acts.push(`${vrf} ${route.prefix}: NH ${route.nextHop} unreachable -> removed (RFC 4271 §9.1.2.1)`);
        }
      }
      if (acts.length) step(t, 'bgp', `${r}: BGP next-hop tracking`, acts, { node: r });
    }
  }
  for (const s of after.bgp.sessions.filter((x) => x.state !== 'Established')) {
    if (before.bgp.sessions.find((b) => b.a === s.a && b.b === s.b)?.state === 'Established') {
      step(v.bgp.holdTimeS * 1000, 'bgp', `iBGP ${s.a}-${s.b} HoldTimer expires`, ['no KEEPALIVE for the hold time: Established -> Idle (Event 10), Adj-RIB-In flushed'], { node: s.a, status: 'dropped' });
    }
  }
  tpSteps(before, after, link, detectAt, step);
  vrfSteps(before, after, link, detectAt, step);
  const rings = ringSteps(topo, before, after, link, detectAt, detection, step);
  steps.sort((x, y) => x.t - y.t);
  const walkAfter = walkOf(after);
  const tEnd = steps.at(-1).t;
  // SR policies and pseudowires after the failure (no TI-LFA or policy
  // re-computation: an explicit segment list follows the new IGP paths).
  const policies = after.sr.policies.map((p) => `SR policy ${p.name}: ${p.valid ? p.path.join(' -> ') : `invalid (${p.reason})`}`);
  const tunnels = after.tp.tunnels.map((t) => `MPLS-TP ${t.id}: ${t.state}${t.reasons.length ? ` (${t.reasons.join('; ')})` : ''}`);
  const pws = after.vpws.pseudowires.map((p) => `PW ${p.id}: ${p.state}${p.reasons.length ? ` (${p.reasons.join('; ')})` : ''}`);
  const title = walkAfter ? (walkAfter.delivered ? 'Converged: traffic restored' : 'Converged: destination unreachable') : 'Converged';
  const status = walkAfter ? (walkAfter.delivered ? 'delivered' : 'dropped') : after.vpws.pseudowires.some((p) => p.state !== 'Up') ? 'dropped' : 'delivered';
  const ringLines = after.g8032.rings.filter((r) => r.links.includes(link.id)).map((r) => `G.8032 ${r.name}: ${r.state}${r.state === 'protection' ? ` (RPL forwarding, ${link.id} blocked)` : ''}`);
  step(tEnd, 'physical', title, [...(walkAfter ? [`${host ? `${host.from} -> ${host.dst}` : `${src} -> ${dst}`}: ${walkAfter.steps.flatMap((s) => s.moves).map((m) => m.to).join(' -> ')}`] : []), ...policies, ...tunnels, ...pws, ...ringLines], { status, ...(rings.length ? { network: 'after' } : {}) });
  const networks = {};
  if (rings.length) {
    // After the repair: the link is up, the ring still in protection until R-APS(NR, RB).
    const overrides = Object.fromEntries(rings.map((r) => [r.ring.id, { blocked: [link.a.node, link.b.node].map((n) => ({ node: n, link: link.id, why: 'recovered' })), state: 'pending' }]));
    networks.pending = buildNetwork(topo, { ...opts, ringOverrides: overrides });
    ringRecoverySteps(topo, before, link, rings, tEnd, step);
    steps.sort((x, y) => x.t - y.t);
  }
  return { before, after, walkBefore, walkAfter, networks, replay: { kind: 'replay', layer: 'physical', title: `Failure replay: ${failure}`, steps } };
}

// G.8032 (ITU-T, §10.1): a node beside the failed link blocks its ring port,
// flushes its FDB and sends R-APS(SF) around the ring; every node that receives
// it flushes, the RPL owner and neighbour unblock the RPL. Returns the rings
// the link is on, with the time their protection state is reached.
function ringSteps(topo, before, after, link, detectAt, detection, step) {
  const v = before.vendor;
  const out = [];
  const ends = [link.a.node, link.b.node];
  const meg = before.cfm.megs.find((m) => m.link === link.id);
  for (const st of before.g8032.rings) {
    if (!st.links.includes(link.id)) continue;
    const ring = topo.rings.find((r) => r.id === st.id);
    const hl = { links: [link.id, ...ring.links] };
    const members = ring.members.length ? ring.members.join(', ') : 'the ring VLANs';
    if (!ring.rpl) {
      step(0, 'ring', `${ring.name}: no RPL owner`, ['the facts configure no RPL owner on this ring: the view cannot replay its protection switch'], { status: 'dropped', highlight: hl });
      continue;
    }
    const isRpl = link.id === ring.rpl.link;
    let tLast = 0;
    for (const n of ends) {
      const port = ringPort(ring, n, link.id);
      const t0 = (detectAt[n] ?? 0) + st.timers.holdOffMs;
      const why = detection === 'los'
        ? `loss of signal on ring port ${port.name} (${port.if}): local Signal Fail`
        : meg || link.bfd
          ? `${meg ? 'CFM' : 'BFD'} on the link: loss of continuity -> Signal Fail on ring port ${port.name} (${port.if})`
          : `no CFM MEP on ring port ${port.name} (${port.if}) in the facts: the port stays up, and G.8032 sees the failure only when the port is declared down at t=${fmtMs(detectAt[n] ?? 0)}; until then frames of ${members} into ${link.id} are dropped`;
      step(t0, 'ring', `${n}: ${ring.name} Signal Fail on ${link.id}`, [
        why,
        ...(st.timers.holdOffMs ? [`hold-off ${st.timers.holdOffMs} ms before acting (§10.1.8)`] : []),
        isRpl ? `ring port ${port.name} is the RPL port: it was blocked already; flush the FDB` : `block ring port ${port.name}, flush the FDB`,
        `send R-APS(SF) on both ring ports: 3 frames ${fmtMs(v.g8032.rapsBurstMs)} apart, then every ${v.g8032.rapsPeriodS} s (§10.1.9)`,
      ], { node: n, status: isRpl ? 'forward' : 'dropped', highlight: hl, network: 'after' });
      for (const h of rapsHops(topo, ring, n, { avoid: link.id })) {
        const t = t0 + h.depth * v.g8032.rapsHopDelayMs;
        tLast = Math.max(tLast, t);
        const acts = [`R-APS(SF) from ${n} (node id, BPR): flush the FDB (§10.1.10)`];
        if (h.to === ring.rpl.owner && !isRpl) acts.push(`RPL owner: unblock the RPL port on ${ring.rpl.link}`);
        if (h.to === ring.rpl.neighbor && !isRpl) acts.push(`RPL neighbour: unblock the RPL port on ${ring.rpl.link}`);
        if (ends.includes(h.to)) acts.push('in Signal Fail itself: its port on the failed link stays blocked');
        if (ring.type === 'sub' && ring.interconnect.includes(h.to)) acts.push(`interconnection node: the sub-ring's R-APS channel ends here (no virtual channel), nothing is sent onto the major ring`);
        step(t, 'ring', `${ring.name} R-APS(SF) ${h.from} -> ${h.to}`, acts, {
          node: h.to, moves: [{ from: h.from, to: h.to, link: h.link, member: null }], headers: rapsHeaders(ring, n, RAPS_REQUEST.SF, {}, v, topo), highlight: hl, network: 'after',
        });
      }
    }
    const path = ringDataPath(topo, after.g8032, ring.id, ends[0], ends[1]);
    step(tLast, 'ring', `${ring.name}: protection state`, [
      isRpl
        ? `the failed link is the RPL: it was blocked already, so the ring forwards as before; R-APS(SF) replaces R-APS(NR, RB) on the ring`
        : `RPL ${ring.rpl.link} forwarding (unblocked by ${ring.rpl.owner}${ring.rpl.neighbor ? ` and ${ring.rpl.neighbor}` : ''}); ${link.id} blocked at ${ends.join(' and ')}`,
      path ? `${members}: ${ends[0]} -> ${ends[1]} now ${path.nodes.join(' -> ')}${ring.subRingOf ? ' (through the interconnection nodes when it crosses the major ring)' : ''}` : `${members}: ${ends[0]} and ${ends[1]} are no longer joined by the ring`,
      `R-APS(SF) repeats every ${v.g8032.rapsPeriodS} s while the failure lasts`,
    ], { node: ring.rpl.owner, status: path ? 'delivered' : 'dropped', highlight: hl, network: 'after' });
    out.push({ ring, state: st, tProtection: tLast });
  }
  return out;
}

// The repair (G.8032 §10.1.4 / §10.1.5): the nodes beside the repaired link
// clear SF, keep their ports blocked for the guard time and send R-APS(NR); in
// revertive mode the RPL owner starts the wait-to-restore timer, blocks the
// RPL when it expires and sends R-APS(NR, RB), on which the other nodes unblock
// their recovered ports and flush. Non-revertive: the RPL stays forwarding.
function ringRecoverySteps(topo, before, link, rings, tEnd, step) {
  const v = before.vendor;
  const ends = [link.a.node, link.b.node];
  const tRepair = Math.max(tEnd + 1000, v.g8032.repairAfterS * 1000);
  const names = rings.map((r) => r.ring.name).join(', ');
  step(tRepair, 'physical', `${link.id} repaired`, [
    `both ends see the link up again (model: the replay repairs it ${v.g8032.repairAfterS} s after the failure)`,
    `${names}: the ring ports on it stay blocked until R-APS says otherwise`,
  ], { status: 'forward', highlight: { links: [link.id] }, network: 'pending' });
  for (const { ring, state: st } of rings) {
    const hl = { links: [link.id, ...ring.links] };
    const t = st.timers;
    const isRpl = ring.rpl && link.id === ring.rpl.link;
    let tNrOwner = null;
    for (const n of ends) {
      const port = ringPort(ring, n, link.id);
      step(tRepair, 'ring', `${n}: ${ring.name} Signal Fail cleared on ${link.id}`, [
        `ring port ${port.name} (${port.if}) up: clear SF, keep the port blocked`,
        `start the guard timer (${t.guardMs} ms, §10.1.5): R-APS received meanwhile is ignored, so stale R-APS(SF) still circulating cannot reopen the failure`,
        'send R-APS(NR) on both ring ports',
      ], { node: n, highlight: hl, network: 'pending' });
      for (const h of rapsHops(topo, ring, n, { avoid: link.id })) {
        const tt = tRepair + h.depth * v.g8032.rapsHopDelayMs;
        const acts = [`R-APS(NR) from ${n}: no request pending at ${n}`];
        if (h.to === ring.rpl.owner) {
          tNrOwner = tNrOwner === null ? tt : Math.min(tNrOwner, tt); // the first R-APS(NR) to arrive starts it
          acts.push(t.revertive ? `RPL owner, revertive: start wait-to-restore (${t.wtrMin} min, §10.1.4 c)` : 'RPL owner, non-revertive: no WTR; the RPL keeps forwarding');
        }
        step(tt, 'ring', `${ring.name} R-APS(NR) ${h.from} -> ${h.to}`, acts, {
          node: h.to, moves: [{ from: h.from, to: h.to, link: h.link, member: null }], headers: rapsHeaders(ring, n, RAPS_REQUEST.NR, {}, v, topo), highlight: hl, network: 'pending',
        });
      }
    }
    step(tRepair + t.guardMs, 'ring', `${ends.join(', ')}: ${ring.name} guard timer expires`, ['R-APS is accepted again on the recovered ports'], { node: ends[0], highlight: hl, network: 'pending' });
    if (!ring.rpl) continue;
    if (!t.revertive) {
      step(tNrOwner ?? tRepair, 'ring', `${ring.name}: non-revertive, stays as it is`, [`RPL ${ring.rpl.link} keeps forwarding; ${link.id} stays blocked at ${ends.join(' and ')} until an operator clears it (§10.1.4)`], { node: ring.rpl.owner, highlight: hl, network: 'pending' });
      continue;
    }
    const tWtr = (tNrOwner ?? tRepair) + t.wtrMin * 60000;
    step(tWtr, 'ring', `${ring.rpl.owner}: ${ring.name} WTR expires`, [
      `block the RPL port on ${ring.rpl.link}, flush the FDB`,
      'send R-APS(NR, RB) on both ring ports (§10.1.4 c)',
    ], { node: ring.rpl.owner, highlight: hl, network: 'pending' });
    let tLast = tWtr;
    for (const h of rapsHops(topo, ring, ring.rpl.owner)) {
      const tt = tWtr + h.depth * v.g8032.rapsHopDelayMs;
      tLast = Math.max(tLast, tt);
      const acts = [`R-APS(NR, RB) from ${ring.rpl.owner}: flush the FDB`];
      if (ends.includes(h.to) && !isRpl) acts.push(`unblock the recovered ring port on ${link.id}`);
      if (h.to === ring.rpl.neighbor) acts.push(isRpl ? `RPL neighbour: the recovered port is the RPL, it stays blocked` : `RPL neighbour: block the RPL port on ${ring.rpl.link}`);
      step(tt, 'ring', `${ring.name} R-APS(NR, RB) ${h.from} -> ${h.to}`, acts, {
        node: h.to, moves: [{ from: h.from, to: h.to, link: h.link, member: null }], headers: rapsHeaders(ring, ring.rpl.owner, RAPS_REQUEST.NR, { rb: true }, v, topo), highlight: hl, network: 'pending',
      });
    }
    const path = ringDataPath(topo, before.g8032, ring.id, ends[0], ends[1]);
    step(tLast, 'ring', `${ring.name}: idle state restored`, [
      `RPL ${ring.rpl.link} blocked by ${ring.rpl.owner}${ring.rpl.neighbor ? ` and ${ring.rpl.neighbor}` : ''}${isRpl ? '' : `; ${link.id} forwarding again`}`,
      ...(path ? [`${ring.members.join(', ') || 'the ring VLANs'}: ${ends[0]} -> ${ends[1]} again ${path.nodes.join(' -> ')}`] : []),
    ], { node: ring.rpl.owner, status: 'delivered', highlight: hl, network: 'before' });
  }
}

// MPLS-TP: static LSPs have no control plane to reroute them. The end points
// learn of a failure from proactive CC on the LSP (BFD or CFM: loss of
// continuity, RFC 6371 §5.1.1) or, without it, only when their own interface
// goes down; then a protected tunnel switches to its backup (RFC 6378) and the
// pseudowires follow their tunnel.
function tpSteps(before, after, link, detectAt, step) {
  const v = before.vendor;
  const switchAt = {};
  for (const t of before.tp.tunnels) {
    if (!t.links.includes(link.id)) continue;
    const a = after.tp.tunnels.find((x) => x.id === t.id);
    const hl = { highlight: { links: [link.id, ...t.links] } };
    for (const end of [t.src, t.dst]) {
      if (t.endState[end] === a.endState[end]) {
        step(0, 'mpls', `${end}: tunnel ${t.id} still Up`, ['no OAM on the LSP and the failed link is not its own interface: the failure is not seen', 'traffic into the tunnel is black-holed'], { node: end, status: 'dropped', ...hl });
        continue;
      }
      const at = a.oam ? a.detectionMs : (detectAt[end] ?? 0);
      switchAt[`${t.id}|${end}`] = at;
      const why = a.oam
        ? [`${a.oam.kind.toUpperCase()} CC on ${t.ids.lspId}: nothing received for ${fmtMs(a.detectionMs)} -> loss of continuity`, 'tunnel Down at this end (Signal Fail)']
        : [`interface on ${link.id} down -> tunnel Down at this end`];
      step(at, 'mpls', `${end}: tunnel ${t.id} Down`, why, { node: end, status: 'dropped', ...hl });
    }
  }
  for (const g of after.tp.groups) {
    const b = before.tp.groups.find((x) => x.primary === g.primary);
    for (const [end, id] of Object.entries(g.active)) {
      if (b?.active[end] === id) continue;
      const t0 = Math.max(0, ...Object.entries(switchAt).filter(([k]) => k.endsWith(`|${end}`)).map(([, x]) => x));
      const bk = after.tp.tunnels.find((x) => x.id === id);
      step(t0 + v.mplsTp.protectionSwitchMs, 'mpls', `${end}: protection switch ${b?.active[end] ?? g.primary} -> ${id}`, [
        'Signal Fail on the working LSP: select the protection LSP (RFC 6378 §4.3, 1:1)',
        `now sending on ${bk.path.join(' -> ')}`,
      ], { node: end, highlight: { links: [link.id, ...bk.links] } });
    }
  }
  const tLast = Math.max(0, ...Object.values(switchAt)) + v.mplsTp.protectionSwitchMs;
  for (const p of after.vpws.pseudowires) {
    const q = before.vpws.pseudowires.find((x) => x.id === p.id);
    if (!q || !p.ends.some((e) => e.underlay === 'mpls-tp')) continue;
    const via = (pw) => pw.ends.map((e) => `${e.node}: ${e.transport.tunnel ?? e.transport.error ?? '-'}`).join(', ');
    if (q.state === p.state && via(q) === via(p)) continue;
    const what = q.state === p.state ? `stays ${p.state}, on ${p.ends.map((e) => e.transport.tunnel).join(' / ')}` : `${q.state} -> ${p.state}`;
    step(tLast, 'pw', `PW ${p.pwid} (${p.service}): ${what}`, [`tunnels: ${via(q)} -> ${via(p)}`, ...p.reasons], { node: p.ends[0].node, status: p.state === 'Up' ? 'delivered' : 'dropped' });
  }
}

// VRF routes a PE originates itself (RFC 4364 §4.3.1) follow its interfaces:
// a connected subnet goes with its interface, and a static whose next hop is
// no longer on an up interface gives way to the next preference (a floating
// static). Changes to what the PE exports are withdrawn or advertised to its
// BGP peers; the remote VRFs follow.
function vrfSteps(before, after, link, detectAt, step) {
  const v = before.vendor;
  const desc = (r) => (r ? `${r.type}${r.type === 'static' ? ` via ${r.via.ip} pref ${r.preference}` : r.type === 'bgp' ? ` NH ${r.nextHop}` : ''}` : 'none');
  const tOf = (pe) => detectAt[pe] ?? 0;
  for (const pe of before.bgp.pes) {
    for (const [vrf, table] of Object.entries(before.bgp.vrfs[pe] ?? {})) {
      const now = after.bgp.vrfs[pe]?.[vrf] ?? {};
      const acts = [];
      for (const prefix of new Set([...Object.keys(table), ...Object.keys(now)])) {
        const [a, b] = [table[prefix], now[prefix]];
        if (a?.type === 'bgp' || b?.type === 'bgp') continue;
        if (desc(a) === desc(b)) continue;
        const why = b?.alternatives?.filter((x) => x.state === 'unresolved').map((x) => `${x.nextHop} pref ${x.preference} unresolved (interface down)`) ?? [];
        acts.push(`${prefix}: ${desc(a)} -> ${desc(b)}${why.length ? ` (${why.join(', ')})` : ''}`);
      }
      if (!acts.length) continue;
      const t = tOf(pe);
      step(t, 'bgp', `${pe}: VRF ${vrf} routes`, acts, { node: pe });
      // What the PE exports: the same prefix with the same label and next hop
      // needs no UPDATE; a lost one is withdrawn, a new one advertised.
      const key = (r) => `${r.prefix}|${r.label}|${r.nextHop}`;
      const was = new Map(before.bgp.originated[pe].filter((r) => r.vrf === vrf).map((r) => [r.prefix, r]));
      const is = new Map(after.bgp.originated[pe].filter((r) => r.vrf === vrf).map((r) => [r.prefix, r]));
      const kept = [...is.keys()].filter((p) => was.has(p) && key(was.get(p)) === key(is.get(p)) && acts.some((x) => x.startsWith(`${p}:`)));
      const gone = [...was.keys()].filter((p) => !is.has(p));
      const added = [...is.keys()].filter((p) => !was.has(p));
      const out = [
        ...kept.map((p) => `${p}: still exported (next hop ${is.get(p).nextHop}, VPN label ${is.get(p).label} unchanged): no UPDATE needed`),
        ...gone.map((p) => `${p}: MP_UNREACH_NLRI (withdraw) to ${after.bgp.sessions.filter((x) => x.a === pe || x.b === pe).map((x) => (x.a === pe ? x.b : x.a)).join(', ') || 'no peer'}`),
        ...added.map((p) => `${p}: UPDATE, label ${is.get(p).label}`),
      ];
      if (out.length) step(t + v.bgp.updateDelayMs, 'bgp', `${pe}: BGP VPN-IPv4 export`, out, { node: pe });
      for (const other of before.bgp.pes) {
        if (other === pe || (!gone.length && !added.length)) continue;
        const ch = [...gone, ...added].filter((p) => desc(before.bgp.vrfs[other]?.[vrf]?.[p]) !== desc(after.bgp.vrfs[other]?.[vrf]?.[p]));
        if (ch.length) step(t + 2 * v.bgp.updateDelayMs, 'bgp', `${other}: VRF ${vrf} updated`, ch.map((p) => `${p}: ${desc(before.bgp.vrfs[other]?.[vrf]?.[p])} -> ${desc(after.bgp.vrfs[other]?.[vrf]?.[p])}`), { node: other });
      }
    }
  }
}
