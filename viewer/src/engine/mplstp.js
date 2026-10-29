// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// MPLS-TP co-routed bidirectional LSPs, statically provisioned: RFC 5654
// (requirements), RFC 5921 (framework), RFC 5960 (data plane), identifiers per
// RFC 6370. A co-routed bidirectional LSP is two unidirectional LSPs, forward
// (source -> destination) and reverse, bound together and running over the
// same hops (RFC 5654 §2.1.1, RFC 5960 §2.2). With no control plane every
// node is told its labels: per hop an in label and an out label per
// direction. The ultimate hop pops (no PHP, RFC 5960 §3.1.1: the LSP label is
// what identifies the LSP for its OAM at the end point).
//
// topo.tpTunnels: [{
//   id, name?, src, dst, tunnelNum?, lspNum?, role: 'primary' | 'backup',
//   protects?: <primary tunnel id>,           1:1 linear protection (RFC 6378)
//   admin?: 'up' | 'down',
//   hops: [{ node, fwdIn, fwdOut, revIn, revOut }],   source first
//   links: [linkId],                          hops[i] -> hops[i+1]
//   oam?: { kind: 'bfd' | 'cfm', intervalMs? } | null   proactive CC on the LSP
// }]
// Ingress: fwdIn and revOut are null; egress: fwdOut and revIn are null.

import { lossThresholdMs } from './cfm.js';
import { nodeById } from './topology.js';

// RFC 5586: G-ACh Label (GAL) value 13, under the LSP label for OAM packets.
export const GAL = 13;
// RFC 6428 §3.3: ACH channel types for BFD CC on MPLS-TP.
export const ACH_BFD_CC = '0x0022';

const tunnelNumbers = (topo) => {
  const next = {};
  return Object.fromEntries((topo.tpTunnels ?? []).map((t) => {
    next[t.src] = (next[t.src] ?? 0) + 1;
    return [t.id, t.tunnelNum ?? next[t.src]];
  }));
};

// RFC 6370 §5 (tunnel and LSP IDs) and §7.2.2 (MEP_IDs) for one tunnel.
export function tpIdentifiers(topo, t, vendor, num) {
  const g = vendor.mplsTp.globalId;
  const nodeId = (n) => nodeById(topo, n).routerId ?? nodeById(topo, n).loopback;
  const lsp = t.lspNum ?? (t.role === 'backup' ? 2 : 1);
  const tunnelId = `${g}::${nodeId(t.src)}::${num}::${g}::${nodeId(t.dst)}::${num}`;
  return {
    tunnelId,
    lspId: `${tunnelId}::${lsp}`,
    lspNum: lsp,
    tunnelNum: num,
    meps: { [t.src]: `${g}::${nodeId(t.src)}::${num}::${lsp}`, [t.dst]: `${g}::${nodeId(t.dst)}::${num}::${lsp}` },
  };
}

// Time from a silent failure to loss of continuity at the end points.
export function detectionMs(oam, vendor) {
  if (!oam) return null;
  if (oam.kind === 'cfm') return lossThresholdMs(oam.intervalCode ?? 2);
  return (oam.intervalMs ?? vendor.bfd.intervalMs) * (oam.detectMult ?? vendor.bfd.detectMult);
}

// Static label errors along the hops: hop i's forward out label must be hop
// i+1's forward in label, and hop i+1's reverse out label hop i's reverse in.
export function labelErrors(topo, t) {
  const errs = [];
  const n = t.hops.length;
  if (n < 2) errs.push('fewer than two hops');
  if (t.hops[0]?.node !== t.src || t.hops.at(-1)?.node !== t.dst) errs.push('hops do not run from source to destination');
  for (let i = 0; i + 1 < n; i++) {
    const [h, k] = [t.hops[i], t.hops[i + 1]];
    const link = topo.links.find((l) => l.id === t.links?.[i]);
    if (!link) errs.push(`${h.node}-${k.node}: no link ${t.links?.[i] ?? ''}`.trim());
    else if (![link.a.node, link.b.node].includes(h.node) || ![link.a.node, link.b.node].includes(k.node)) errs.push(`link ${link.id} does not join ${h.node} and ${k.node}`);
    if (h.fwdOut !== k.fwdIn) errs.push(`forward ${h.node} out ${h.fwdOut ?? '-'} != ${k.node} in ${k.fwdIn ?? '-'}`);
    if (k.revOut !== h.revIn) errs.push(`reverse ${k.node} out ${k.revOut ?? '-'} != ${h.node} in ${h.revIn ?? '-'}`);
  }
  return errs;
}

export function computeMplsTp(topo, linkStates, vendor) {
  const nums = tunnelNumbers(topo);
  const lfib = {};
  const head = {};
  const conflicts = [];
  const install = (node, label, entry) => {
    if (label === null || label === undefined) return;
    lfib[node] ??= {};
    if (lfib[node][label]) conflicts.push(`${node}: label ${label} used by ${lfib[node][label].tunnel} and ${entry.tunnel}`);
    else lfib[node][label] = { inLabel: label, ...entry };
  };

  const tunnels = (topo.tpTunnels ?? []).map((t) => {
    const ids = tpIdentifiers(topo, t, vendor, nums[t.id]);
    const admin = t.admin ?? 'up';
    const n = t.hops.length;
    const config = labelErrors(topo, t);
    if (admin === 'up') {
      t.hops.forEach((h, i) => {
        if (i > 0) {
          install(h.node, h.fwdIn, i < n - 1
            ? { tunnel: t.id, dir: 'fwd', op: 'swap', outLabel: h.fwdOut, link: t.links[i], next: t.hops[i + 1].node }
            : { tunnel: t.id, dir: 'fwd', op: 'pop', outLabel: null, link: null, next: null });
        }
        if (i < n - 1) {
          install(h.node, h.revIn, i > 0
            ? { tunnel: t.id, dir: 'rev', op: 'swap', outLabel: h.revOut, link: t.links[i - 1], next: t.hops[i - 1].node }
            : { tunnel: t.id, dir: 'rev', op: 'pop', outLabel: null, link: null, next: null });
        }
      });
      (head[t.src] ??= {})[t.id] = { dir: 'fwd', outLabel: t.hops[0].fwdOut, link: t.links[0], next: t.hops[1]?.node };
      (head[t.dst] ??= {})[t.id] = { dir: 'rev', outLabel: t.hops[n - 1].revOut, link: t.links[n - 2], next: t.hops[n - 2]?.node };
    }
    const broken = (t.links ?? []).filter((l) => linkStates[l] && !linkStates[l].up);
    const oam = t.oam ?? null;
    // What each end believes. With proactive CC (BFD or CFM on the LSP) a
    // failure anywhere on the path, or a label misconfiguration, is a loss of
    // continuity at both ends (RFC 6371 §5.1.1). Without it an end only sees
    // its own interface go down; a transit failure black-holes silently.
    const endState = {};
    const reasons = [];
    for (const [end, link] of [[t.src, t.links?.[0]], [t.dst, t.links?.at(-1)]]) {
      let down = null;
      if (admin !== 'up') down = 'admin down';
      else if (oam && (broken.length || config.length)) down = `${oam.kind.toUpperCase()} loss of continuity`;
      else if (broken.includes(link)) down = `interface on ${link} down`;
      endState[end] = down ? 'Down' : 'Up';
      if (down) reasons.push(`${end}: ${down}`);
    }
    if (broken.length) reasons.push(`link${broken.length > 1 ? 's' : ''} ${broken.join(', ')} down${oam ? '' : Object.values(endState).every((s) => s === 'Up') ? ': undetected without OAM, traffic black-holed' : ''}`);
    reasons.push(...config.map((e) => `label error: ${e}`));
    const forwards = admin === 'up' && !broken.length && !config.length;
    return {
      ...t,
      role: t.role ?? 'primary',
      ids,
      admin,
      path: t.hops.map((h) => h.node),
      broken,
      configErrors: config,
      oam,
      detectionMs: detectionMs(oam, vendor),
      endState,
      state: forwards ? 'Up' : 'Down',
      reasons,
    };
  });

  // 1:1 protection groups: the primary and the backups that protect it.
  const groups = tunnels
    .filter((t) => t.role !== 'backup')
    .map((p) => {
      const backups = tunnels.filter((b) => b.role === 'backup' && b.protects === p.id).map((b) => b.id);
      const active = Object.fromEntries([p.src, p.dst].map((end) => [end, selectActive(tunnels, p, backups, end).id]));
      return { primary: p.id, backups, active };
    });
  return { tunnels, groups, lfib, head, conflicts };
}

// RFC 6378 §4.3: on Signal Fail of the working LSP an end switches to the
// protection LSP if that is not failed too; it reverts once the working LSP
// is good again (revertive mode, the hold-off/wait-to-restore timers are not
// modeled).
function selectActive(tunnels, primary, backups, end) {
  if (primary.endState[end] === 'Up') return primary;
  for (const id of backups) {
    const b = tunnels.find((x) => x.id === id);
    if (b.endState[end] === 'Up') return b;
  }
  return primary;
}

// The tunnel that end `node` sends on for the tunnel (group) `id`.
export function activeTunnel(tp, id, node) {
  const g = tp.groups.find((x) => x.primary === id || x.backups.includes(id));
  const activeId = g ? g.active[node] ?? id : id;
  return tp.tunnels.find((t) => t.id === activeId) ?? null;
}
