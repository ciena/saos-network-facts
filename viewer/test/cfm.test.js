// SPDX-License-Identifier: Apache-2.0
// CFM: IEEE 802.1ag (802.1Q clauses 18-21) and ITU-T Y.1731.
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { CCM_INTERVALS_MS, ccmGroupMac, ccmStream, lossThresholdMs } from '../src/engine/cfm.js';

const topo = builtinTopology();

describe('CCM encodings', () => {
  test('interval codes (802.1Q Table 21-15)', () => {
    expect(CCM_INTERVALS_MS[1]).toBeCloseTo(3.333, 3);
    expect(CCM_INTERVALS_MS[2]).toBe(10);
    expect(CCM_INTERVALS_MS[4]).toBe(1000);
    expect(CCM_INTERVALS_MS[7]).toBe(600000);
  });
  test('loss of continuity after 3.5 intervals: 35 ms at 10 ms, 3.5 s at 1 s', () => {
    expect(lossThresholdMs(2)).toBe(35);
    expect(lossThresholdMs(4)).toBe(3500);
  });
  test('multicast CCM DA 01-80-C2-00-00-3x carries the MD level', () => {
    expect(ccmGroupMac(2)).toBe('01:80:c2:00:00:32');
    expect(ccmGroupMac(7)).toBe('01:80:c2:00:00:37');
  });
});

describe('MEGs on the built-in core', () => {
  test('one link MEG per router-router link, Down MEPs 1 and 2 at the ends', () => {
    const { megs } = buildNetwork(topo).cfm;
    expect(megs.map((m) => m.id)).toEqual(['MEG-PE1-P1', 'MEG-P1-P2', 'MEG-P2-PE2', 'MEG-P1-PE2']);
    expect(megs[0].meps.map((m) => `${m.mepId}@${m.node}:${m.if}`)).toEqual(['1@PE1:lag1', '2@P1:lag1']);
    expect(megs.every((m) => m.meps.every((p) => p.defect === null))).toBe(true);
  });
  test('a failed link raises DefRemoteCCM and RDI on both MEPs', () => {
    const meg = buildNetwork(topo, { failures: ['P1-P2'] }).cfm.megs.find((m) => m.link === 'P1-P2');
    expect(meg.meps.map((m) => [m.defect, m.rdi])).toEqual([
      ['DefRemoteCCM', true],
      ['DefRemoteCCM', true],
    ]);
  });
  test('a LAG member failure does not break continuity (MEPs on the aggregate)', () => {
    const meg = buildNetwork(topo, { failures: ['PE1-P1/1'] }).cfm.megs[0];
    expect(meg.meps.every((m) => m.defect === null)).toBe(true);
  });
});

describe('CCM stream (802.1Q §20.20 remote MEP state machine)', () => {
  const meg = buildNetwork(topo).cfm.megs[1]; // 10 ms CCMs; MEP 1 at k*10, MEP 2 at k*10+5

  test('no defect while CCMs arrive', () => {
    const { defectAt } = ccmStream(meg, { durationMs: 1000 });
    expect(defectAt).toEqual({ 1: null, 2: null });
  });

  test('link fails at 100 ms: MEP 2 last heard MEP 1 at 90 -> defect 125; MEP 1 last heard at 95 -> 130', () => {
    const { defectAt, events } = ccmStream(meg, { durationMs: 200, failAtMs: 100 });
    expect(defectAt).toEqual({ 1: 130, 2: 125 });
    const ccms = events.filter((e) => e.kind === 'ccm');
    expect(ccms.filter((e) => e.t < 100).every((e) => !e.lost)).toBe(true);
    expect(ccms.filter((e) => e.t >= 100).every((e) => e.lost)).toBe(true);
    // After its defect a MEP sets RDI in what it sends.
    expect(ccms.find((e) => e.from.mepId === 2 && e.t >= 125).rdi).toBe(true);
    expect(ccms.find((e) => e.from.mepId === 2 && e.t < 125 && e.t >= 100).rdi).toBe(false);
  });
});
