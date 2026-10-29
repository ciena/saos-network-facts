// SPDX-License-Identifier: Apache-2.0
// MPLS label distribution: LDP (RFC 5036) and SR-MPLS (RFC 8402/8667/8660);
// reserved labels per RFC 3032 §2.1.
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { IMPLICIT_NULL } from '../src/engine/mpls.js';

const topo = builtinTopology();
// Node ordinals: CE1 1, PE1 2, P1 3, P2 4, PE2 5, CE2 6.
// Neutral LDP blocks: 24000 + ordinal*1000 -> PE1 26000, P1 27000, P2 28000, PE2 29000.
// FECs in address order: 10.0.0.1 (PE1), .2 (P1), .3 (P2), .4 (PE2); an LSR's own
// loopback takes implicit-null, not a label from its block.
// P1: .1 27000, .3 27001, .4 27002. P2: .1 28000, .2 28001, .4 28002.

describe('LDP (RFC 5036)', () => {
  const net = buildNetwork(topo, { labelMode: 'ldp' });

  test('one session per IS-IS adjacency (basic discovery, §2.4.1)', () => {
    expect(net.mpls.sessions.map((s) => s.link)).toEqual(['PE1-P1', 'P1-P2', 'P2-PE2', 'P1-PE2']);
  });

  test('egress binds implicit-null to its own loopback (RFC 3032 §2.1, label 3)', () => {
    expect(IMPLICIT_NULL).toBe(3);
    expect(net.mpls.bindings.PE2['10.0.0.4/32'].local).toBe(3);
  });

  test('independent control: every LSR binds every FEC from its block', () => {
    expect(Object.fromEntries(Object.entries(net.mpls.bindings.PE1).map(([f, b]) => [f, b.local]))).toEqual({
      '10.0.0.1/32': 3,
      '10.0.0.2/32': 26000,
      '10.0.0.3/32': 26001,
      '10.0.0.4/32': 26002,
    });
  });

  test('liberal retention (§2.6.2): P1 keeps every peer mapping for 10.0.0.4', () => {
    expect(net.mpls.bindings.P1['10.0.0.4/32'].remote).toEqual({ PE1: 26002, P2: 28002, PE2: 3 });
  });

  test('LFIB: P1 swaps toward P2, P2 pops (PHP) toward PE2', () => {
    expect(net.mpls.lfib.P1[27002].nextHops).toEqual([{ node: 'P2', link: 'P1-P2', op: 'swap', outLabel: 28002 }]);
    expect(net.mpls.lfib.P2[28002].nextHops).toEqual([{ node: 'PE2', link: 'P2-PE2', op: 'pop', outLabel: null }]);
  });

  test('FTN: PE1 pushes P1\'s label for 10.0.0.4', () => {
    expect(net.mpls.ftn.PE1['10.0.0.4/32'].nextHops).toEqual([{ node: 'P1', link: 'PE1-P1', label: 27002 }]);
  });

  test('after P1-P2 fails P1 becomes penultimate hop for PE2 (pop over the cross link)', () => {
    const f = buildNetwork(topo, { labelMode: 'ldp', failures: ['P1-P2'] });
    expect(f.mpls.lfib.P1[27002].nextHops).toEqual([{ node: 'PE2', link: 'P1-PE2', op: 'pop', outLabel: null }]);
  });
});

describe('SR-MPLS (RFC 8402 / 8667)', () => {
  const net = buildNetwork(topo, { labelMode: 'sr' });

  test('Prefix-SID label = SRGB base 16000 + index (index = node ordinal)', () => {
    expect(net.mpls.bindings.PE1['10.0.0.4/32']).toMatchObject({ local: 16005, sidIndex: 5 });
    expect(net.mpls.ftn.PE1['10.0.0.4/32'].nextHops[0].label).toBe(16005);
  });

  test('same label end to end; penultimate hop pops (P flag clear, RFC 8667 §2.1.1)', () => {
    expect(net.mpls.lfib.P1[16005].nextHops[0]).toMatchObject({ op: 'swap', outLabel: 16005, node: 'P2' });
    expect(net.mpls.lfib.P2[16005].nextHops[0]).toMatchObject({ op: 'pop', node: 'PE2' });
  });

  test('needs no label distribution sessions (SIDs ride in IS-IS)', () => {
    expect(net.mpls.sessions).toEqual([]);
  });
});
