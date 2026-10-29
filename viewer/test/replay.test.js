// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { replayFailure } from '../src/engine/replay.js';

const topo = builtinTopology();
const titles = (r) => r.replay.steps.map((s) => s.title);

describe('failure replay', () => {
  test('P1-P2 silent failure: CCM detection, IS-IS reflood, SPF, traffic on the cross link', () => {
    const r = replayFailure(topo, 'P1-P2', { detection: 'ccm' });
    // Stream fails at 20 ms; MEP 2 (P2) last heard at 10 -> 45 (25 after), MEP 1 (P1) at 15 -> 50 (30 after).
    const cfm = r.replay.steps.filter((s) => s.layer === 'cfm');
    expect(cfm.map((s) => [s.node, s.t])).toEqual([
      ['P2', 25],
      ['P1', 30],
    ]);
    // LSP regenerated 50 ms after detection with seq 2.
    expect(titles(r)).toContain('t=75 ms: P2 originates 0000.0000.0003.00-00 seq 2');
    expect(titles(r)).toContain('t=80 ms: P1 originates 0000.0000.0002.00-00 seq 2');
    const p1 = r.replay.steps.find((s) => s.layer === 'mpls' && s.node === 'P1');
    expect(p1.actions).toContain('LFIB 10.0.0.4/32: swap 27002->28002 to P2 -> pop 27002 to PE2');
    expect(r.walkBefore.steps.map((s) => s.node)).toEqual(['CE1', 'PE1', 'P1', 'P2', 'PE2', 'CE2']);
    expect(r.walkAfter.steps.map((s) => s.node)).toEqual(['CE1', 'PE1', 'P1', 'PE2', 'CE2']);
    expect(r.replay.steps.at(-1)).toMatchObject({ status: 'delivered' });
    // Timeline is ordered.
    const ts = r.replay.steps.map((s) => s.t);
    expect(ts).toEqual([...ts].sort((a, b) => a - b));
  });

  test('BGP keeps the VPN routes: the next hop stays resolved with a higher IGP cost', () => {
    const r = replayFailure(topo, 'P1-P2');
    const pe1 = r.replay.steps.find((s) => s.layer === 'bgp' && s.node === 'PE1');
    expect(pe1.actions).toContain('CUST-A 192.168.2.0/24: NH 10.0.0.4 still resolved (IGP 30 -> 40), kept');
  });

  test('LAG member failure: LACP only, no IGP event', () => {
    const r = replayFailure(topo, 'PE1-P1/2');
    expect(r.replay.steps.some((s) => s.layer === 'mpls')).toBe(false);
    expect(r.after.isis.rib).toEqual(r.before.isis.rib);
    expect(r.walkAfter.steps[1].moves[0].member).toBe('PE1-P1/1');
  });

  test('loss of signal on the only uplink isolates PE1; BGP hold timer expires at 90 s', () => {
    const r = replayFailure(topo, 'PE1-P1', { detection: 'los' });
    expect(r.walkAfter.delivered).toBe(false);
    expect(titles(r)).toContain('t=90 s: iBGP PE1-PE2 HoldTimer expires');
  });
});
