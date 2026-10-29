// SPDX-License-Identifier: Apache-2.0
// VPWS: point-to-point Ethernet pseudowires, RFC 4448 (Ethernet over MPLS)
// signaled with LDP FEC 128 / PWid (RFC 8077 §5-6) over a targeted LDP
// session between the two PE loopbacks. Each end advertises the PW label it
// expects; the other end pushes it under the transport (bottom of stack). The
// transport is chosen per end:
//   sr-policy  the SR Policy (headend, color, endpoint) (RFC 9256 §8.2)
//   sr         the endpoint's Prefix-SID (RFC 8660)
//   ldp        the LDP LSP to the endpoint's loopback (RFC 5036)
//   mpls-tp    a statically configured MPLS-TP tunnel (mplstp.js); the PW is
//              static too (`static: true`): each end is configured with the
//              label it receives (rxLabel) and the one it sends (txLabel),
//              no targeted LDP (RFC 5921 §3.4, RFC 6073 static PWs)
//
// topo.pseudowires: [{ id, service, pwid, static?, ends: [end, end] }]
// end: { node, ac: { port, name }, underlay, color?, tunnel?, rxLabel?, txLabel? }

import { activeTunnel } from './mplstp.js';
import { prefixSidLabel } from './mpls.js';
import { policyFor } from './srpolicy.js';
import { nodeById, nodeOrdinal } from './topology.js';

function transport(topo, isis, mpls, sr, vendor, end, peer, tp) {
  if (end.underlay === 'mpls-tp') {
    const t = tp && activeTunnel(tp, end.tunnel, end.node);
    if (!t) return { error: `no MPLS-TP tunnel ${end.tunnel}` };
    if (![t.src, t.dst].includes(end.node) || ![t.src, t.dst].includes(peer)) return { error: `tunnel ${t.id} does not join ${end.node} and ${peer}` };
    if (t.endState[end.node] !== 'Up') return { error: `MPLS-TP tunnel ${t.id} down at ${end.node}` };
    const h = tp.head[end.node][t.id];
    const path = end.node === t.src ? t.path : [...t.path].reverse();
    return { kind: 'mpls-tp', tunnel: t.id, configured: end.tunnel, switched: t.id !== end.tunnel, dir: h.dir, stack: [h.outLabel], link: h.link, next: h.next, path };
  }
  const fec = `${nodeById(topo, peer).loopback}/32`;
  if (end.underlay === 'sr-policy') {
    const p = policyFor(sr, end.node, end.color, peer);
    if (!p) return { error: `no SR policy color ${end.color} to ${peer}` };
    if (!p.valid) return { error: `SR policy ${p.name} invalid: ${p.reason}` };
    return { kind: 'sr-policy', policy: p.name, stack: p.segmentList.sids, path: p.path };
  }
  if (!mpls.ftn[end.node]?.[fec]) return { error: `no LSP to ${fec}` };
  if (end.underlay === 'sr') {
    if (mpls.mode !== 'sr') return { error: 'underlay SR but SR-MPLS is not the active label mode' };
    return { kind: 'sr', stack: [prefixSidLabel(topo, vendor, peer)] };
  }
  if (end.underlay === 'ldp') {
    if (mpls.mode !== 'ldp') return { error: 'underlay LDP but LDP is not the active label mode' };
    return { kind: 'ldp', stack: null }; // label comes from the FTN at imposition
  }
  return { error: `unknown underlay ${end.underlay}` };
}

export function computeVpws(topo, isis, mpls, sr, vendor, tp = null) {
  const next = {};
  const pwLabels = {};
  const pseudowires = (topo.pseudowires ?? []).map((pw) => {
    // Each end allocates the label it expects to receive (RFC 8077 §6.1); a
    // static PW has it configured.
    const local = pw.ends.map((e) => {
      let label = e.rxLabel;
      if (!pw.static) {
        next[e.node] ??= vendor.mpls.pwLabelBase(nodeOrdinal(topo, e.node));
        label = next[e.node]++;
      }
      (pwLabels[e.node] ??= {})[label] = { pw: pw.id, end: pw.ends.indexOf(e) };
      return label;
    });
    const [a, b] = pw.ends.map((e) => e.node);
    const lo = (n) => `${nodeById(topo, n).loopback}/32`;
    const tldp = pw.static ? 'static' : isis.rib[a]?.[lo(b)] && isis.rib[b]?.[lo(a)] ? 'Operational' : 'Non-existent';
    const ends = pw.ends.map((e, i) => {
      const peer = pw.ends[1 - i].node;
      const remoteLabel = pw.static ? e.txLabel : local[1 - i];
      return { ...e, peer, localLabel: local[i], remoteLabel, transport: transport(topo, isis, mpls, sr, vendor, e, peer, tp) };
    });
    const reasons = [];
    if (tldp === 'Non-existent') reasons.push(`targeted LDP ${a}-${b} down (loopbacks unreachable)`);
    if (pw.static) for (const [i, e] of ends.entries()) if (e.txLabel !== local[1 - i]) reasons.push(`${e.node} sends PW label ${e.txLabel}, ${ends[1 - i].node} expects ${local[1 - i]}`);
    for (const e of ends) if (e.transport.error) reasons.push(`${e.node}: ${e.transport.error}`);
    return { ...pw, tldp, ends, state: reasons.length ? 'Down' : 'Up', reasons };
  });
  return { pseudowires, pwLabels };
}
