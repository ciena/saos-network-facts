// SPDX-License-Identifier: Apache-2.0
// Connectivity Fault Management: IEEE 802.1ag (now IEEE 802.1Q clause 18-21)
// and ITU-T Y.1731. By default one maintenance association (MEG) per core link
// with a Down MEP at each end (topo.cfm.linkMegs: false turns them off). A
// LAG's MEPs sit on the aggregated interface, so CCMs keep flowing over the
// surviving member when one member fails.
//
// Service MEGs (topo.cfm.megs) watch a VPWS end to end: an Up MEP on each
// attachment circuit, CCMs carried through the pseudowire.
// meg: { id, pseudowire, level?, intervalCode?, meps: [{ mepId, node, if }] }

import { nodeById } from './topology.js';
import { isRouter } from './isis.js';

// 802.1Q Table 21-15: CCM Interval field encoding.
export const CCM_INTERVALS_MS = { 1: 10 / 3, 2: 10, 3: 100, 4: 1000, 5: 10000, 6: 60000, 7: 600000 };

// 802.1Q §20.20 (Remote MEP state machine): rMEPwhile = (3.25..3.5) x CCM
// interval. A remote MEP is declared failed (DefRemoteCCM / Y.1731 dLOC) when
// no CCM arrives for 3.5 intervals.
export const LOSS_MULTIPLIER = 3.5;

export function lossThresholdMs(intervalCode) {
  return LOSS_MULTIPLIER * CCM_INTERVALS_MS[intervalCode];
}

// Destination MAC for multicast CCMs at MD level L: 01-80-C2-00-00-3L (802.1Q Table 8-15).
export function ccmGroupMac(level) {
  return `01:80:c2:00:00:3${level}`;
}

export function computeCfm(topo, linkStates, vendor, vpws = { pseudowires: [] }) {
  const megs = [];
  for (const l of topo.cfm?.linkMegs === false ? [] : topo.links) {
    if (l.kind !== 'core') continue;
    if (!isRouter(nodeById(topo, l.a.node)) || !isRouter(nodeById(topo, l.b.node))) continue;
    const up = linkStates[l.id].up;
    const level = vendor.cfm.linkMdLevel;
    const intervalCode = vendor.cfm.ccmIntervalCode;
    megs.push({
      id: `MEG-${l.id}`,
      link: l.id,
      level,
      intervalCode,
      intervalMs: CCM_INTERVALS_MS[intervalCode],
      meps: [
        { mepId: 1, node: l.a.node, if: l.a.if, direction: 'down', defect: up ? null : 'DefRemoteCCM', rdi: !up },
        { mepId: 2, node: l.b.node, if: l.b.if, direction: 'down', defect: up ? null : 'DefRemoteCCM', rdi: !up },
      ],
    });
  }
  for (const m of topo.cfm?.megs ?? []) {
    const pw = vpws.pseudowires.find((p) => p.id === m.pseudowire);
    const up = pw?.state === 'Up';
    const intervalCode = m.intervalCode ?? vendor.cfm.serviceCcmIntervalCode;
    megs.push({
      id: m.id,
      pseudowire: m.pseudowire,
      level: m.level ?? vendor.cfm.serviceMdLevel,
      intervalCode,
      intervalMs: CCM_INTERVALS_MS[intervalCode],
      meps: m.meps.map((p) => ({ ...p, direction: 'up', defect: up ? null : 'DefRemoteCCM', rdi: !up })),
    });
  }
  return { megs };
}

// Simulate the CCM stream of one MEG for `durationMs`. If `failAtMs` is set the
// link stops carrying frames at that time. MEP 1 sends at k*interval, MEP 2 at
// k*interval + interval/2 (independent transmit timers). Each MEP watches its
// peer: when no CCM has arrived for 3.5 intervals it raises DefRemoteCCM and
// sets RDI in its own CCMs (802.1Q §20.20, §20.9.5).
export function ccmStream(meg, { durationMs, failAtMs = null }) {
  const iv = meg.intervalMs;
  const threshold = LOSS_MULTIPLIER * iv;
  const [m1, m2] = meg.meps;
  const tx = [];
  for (let k = 0; k * iv < durationMs; k++) {
    tx.push({ t: k * iv, from: m1, to: m2, seq: k + 1 });
    tx.push({ t: k * iv + iv / 2, from: m2, to: m1, seq: k + 1 });
  }
  tx.sort((x, y) => x.t - y.t || x.from.mepId - y.from.mepId);

  const lastRx = { [m1.mepId]: 0, [m2.mepId]: 0 };
  const defect = { [m1.mepId]: null, [m2.mepId]: null };
  const events = [];
  const checkDefects = (now) => {
    for (const m of [m1, m2]) {
      const due = lastRx[m.mepId] + threshold;
      if (defect[m.mepId] === null && due <= now) {
        defect[m.mepId] = due;
        events.push({ t: due, kind: 'defect', mep: m, text: `MEP ${m.mepId} on ${m.node}: DefRemoteCCM (no CCM for ${LOSS_MULTIPLIER} x ${fmtMs(iv)})` });
      }
    }
  };
  for (const f of tx) {
    checkDefects(f.t);
    const lost = failAtMs !== null && f.t >= failAtMs;
    const rdi = defect[f.from.mepId] !== null;
    events.push({ t: f.t, kind: 'ccm', from: f.from, to: f.to, seq: f.seq, rdi, lost });
    if (!lost) lastRx[f.to.mepId] = f.t;
  }
  checkDefects(durationMs);
  events.sort((x, y) => x.t - y.t || (x.kind === 'defect' ? -1 : 1));
  return { events, defectAt: { [m1.mepId]: defect[m1.mepId], [m2.mepId]: defect[m2.mepId] } };
}

export function fmtMs(ms) {
  if (ms >= 1000) return `${ms / 1000} s`;
  return `${Number.isInteger(ms) ? ms : ms.toFixed(2)} ms`;
}
