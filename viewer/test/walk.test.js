// SPDX-License-Identifier: Apache-2.0
// Packet walks over the built-in topology. Labels are the hand-computed values
// from mpls.test.js / bgp.test.js: LDP P1 27002 -> P2 28002 -> PHP; VPN 105000.
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { bgpUpdateWalk, ccmWalk, dataWalk, isisFloodWalk } from '../src/engine/walk.js';

const topo = builtinTopology();
const stacks = (w) => w.steps.map((s) => s.headers.filter((h) => h.name === 'MPLS').map((h) => h.fields.label));
const path = (w) => w.steps.map((s) => s.node);

describe('data plane CE1 -> CE2 over the L3VPN', () => {
  test('LDP: push [27002, 105000], swap at P1, PHP at P2, VPN pop at PE2', () => {
    const w = dataWalk(buildNetwork(topo));
    expect(w.delivered).toBe(true);
    expect(path(w)).toEqual(['CE1', 'PE1', 'P1', 'P2', 'PE2', 'CE2']);
    expect(stacks(w)).toEqual([[], [27002, 105000], [28002, 105000], [105000], [], []]);
    expect(w.steps[3].actions[0]).toMatch(/^pop 28002 \(PHP/);
    expect(w.steps[4].actions[0]).toMatch(/^pop VPN label 105000/);
  });

  test('header stack: Ethernet (MPLS ethertype in the core), S bit on the VPN label only', () => {
    const w = dataWalk(buildNetwork(topo));
    const h = w.steps[1].headers;
    expect(h.map((x) => x.name)).toEqual(['Ethernet II', 'MPLS', 'MPLS', 'IPv4', 'UDP']);
    expect(h[0].fields.ethertype).toBe('0x8847');
    expect(h[1].fields.s).toBe(0);
    expect(h[2].fields.s).toBe(1);
    expect(w.steps[0].headers[0].fields.ethertype).toBe('0x0800');
  });

  test('uniform TTL (RFC 3443): 64 -> 63 at CE1, 62 pushed at PE1, 61 at P1, 60 after PHP', () => {
    const w = dataWalk(buildNetwork(topo));
    const ttl = (i, name, k = 0) => w.steps[i].headers.filter((h) => h.name === name)[k]?.fields.ttl;
    expect(ttl(0, 'IPv4')).toBe(63);
    expect(ttl(1, 'MPLS')).toBe(62);
    expect(ttl(2, 'MPLS')).toBe(61);
    expect(ttl(3, 'MPLS')).toBe(60);
    expect(ttl(4, 'IPv4')).toBe(59);
  });

  test('records the LAG member chosen on PE1-P1', () => {
    const w = dataWalk(buildNetwork(topo));
    expect(w.steps[1].moves[0]).toMatchObject({ link: 'PE1-P1' });
    expect(['PE1-P1/1', 'PE1-P1/2']).toContain(w.steps[1].moves[0].member);
    expect(w.steps[1].actions.some((a) => a.startsWith('LAG lag1: hash'))).toBe(true);
  });

  test('SR-MPLS: 16005 end to end, PHP at P2', () => {
    const w = dataWalk(buildNetwork(topo, { labelMode: 'sr' }));
    expect(stacks(w)).toEqual([[], [16005, 105000], [16005, 105000], [105000], [], []]);
  });

  test('after P1-P2 fails: PE1 -> P1 -> PE2 over the cross link, PHP at P1', () => {
    const w = dataWalk(buildNetwork(topo, { failures: ['P1-P2'] }));
    expect(path(w)).toEqual(['CE1', 'PE1', 'P1', 'PE2', 'CE2']);
    expect(stacks(w)).toEqual([[], [27002, 105000], [105000], [], []]);
  });

  test('is deterministic', () => {
    expect(dataWalk(buildNetwork(topo))).toEqual(dataWalk(buildNetwork(topo)));
  });

  test('drops at PE1 when PE2 is unreachable', () => {
    const w = dataWalk(buildNetwork(topo, { failures: ['PE1-P1'] }));
    expect(w.delivered).toBe(false);
    expect(w.steps.at(-1)).toMatchObject({ node: 'PE1', status: 'dropped' });
  });
});

describe('control-plane walks', () => {
  const net = buildNetwork(topo);

  test('IS-IS LSP flood: rounds at 10/20/30 ms, 5 transmissions', () => {
    const w = isisFloodWalk(net, 'PE1');
    expect(w.layer).toBe('isis');
    expect(w.transmissions).toHaveLength(5);
    expect(w.steps.filter((s) => s.moves.length).map((s) => s.t)).toEqual([10, 20, 30]);
    expect(w.steps[0].headers.find((h) => h.name === 'IS-IS').fields.seq).toBe('0x00000002');
  });

  test('BGP UPDATE PE2 -> PE1 rides the LSP to 10.0.0.1 (PE2 -> P2 -> P1 -> PE1)', () => {
    const w = bgpUpdateWalk(net, 'PE2', 'PE1');
    expect(path(w)).toEqual(['PE2', 'PE2', 'P2', 'P1', 'PE1']);
    expect(stacks(w)).toEqual([[], [28000], [27000], [], []]);
    expect(w.steps.at(-1).status).toBe('delivered');
    expect(w.steps[1].headers.at(-1).name).toBe('BGP UPDATE');
    expect(w.steps.at(-1).lookup.result).toMatch(/installed/);
  });

  test('BGP UPDATE is not sent while the session is down', () => {
    const w = bgpUpdateWalk(buildNetwork(topo, { failures: ['PE1-P1'] }), 'PE2', 'PE1');
    expect(w.steps).toHaveLength(1);
    expect(w.steps[0].status).toBe('dropped');
  });

  test('CCM stream: alternating MEPs every 5 ms, then loss and defect after a failure', () => {
    const ok = ccmWalk(net, 'MEG-P1-P2', { count: 2 });
    expect(ok.steps.map((s) => s.t)).toEqual([0, 5, 10, 15]);
    expect(ok.steps[0].headers[1].fields).toMatchObject({ mdLevel: 2, opcode: '1 (CCM)', mepId: 1 });
    const bad = ccmWalk(net, 'MEG-P1-P2', { failAfter: 2 });
    const defects = bad.steps.filter((s) => s.title.includes('loss of continuity'));
    expect(defects.map((s) => [s.node, s.t])).toEqual([
      ['P2', 45],
      ['P1', 50],
    ]);
  });
});
