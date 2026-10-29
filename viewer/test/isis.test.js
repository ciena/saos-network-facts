// SPDX-License-Identifier: Apache-2.0
// IS-IS: ISO/IEC 10589, RFC 1195, RFC 5303 (three-way p2p), RFC 5305 (TLV 22/135).
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { floodLsp, spf, threeWayHandshake, threeWayNext } from '../src/engine/isis.js';
import { rfcVendor } from '../src/engine/vendor.js';

const topo = builtinTopology();

describe('RFC 5303 §3.3 three-way handshake', () => {
  test('follows the state table', () => {
    expect(threeWayNext('Down', 'Down')).toBe('Initializing');
    expect(threeWayNext('Down', 'Initializing')).toBe('Up');
    expect(threeWayNext('Down', 'Up')).toBe('Down');
    expect(threeWayNext('Initializing', 'Up')).toBe('Up');
    expect(threeWayNext('Up', 'Down')).toBe('Initializing');
  });

  test('brings both ends Up in three IIHs', () => {
    const { trace, state } = threeWayHandshake('PE1', 'P1');
    expect(trace.map((x) => `${x.from}:${x.sentState}->${x.to}:${x.receiverAfter}`)).toEqual([
      'PE1:Down->P1:Initializing',
      'P1:Initializing->PE1:Up',
      'PE1:Up->P1:Up',
    ]);
    expect(state).toEqual({ PE1: 'Up', P1: 'Up' });
  });
});

describe('adjacencies and LSPs (ISO 10589 §7.3.7)', () => {
  const net = buildNetwork(topo);

  test('forms one p2p adjacency per core link, LAG counted once, none to CEs', () => {
    expect(net.isis.adjacencies.map((a) => `${a.link}:${a.state}`)).toEqual([
      'PE1-P1:Up',
      'P1-P2:Up',
      'P2-PE2:Up',
      'P1-PE2:Up',
    ]);
  });

  test("P1's LSP lists its neighbours (TLV 22) and prefixes (TLV 135)", () => {
    const lsp = net.isis.lsps.P1;
    expect(lsp.lspId).toBe('0000.0000.0002.00-00');
    expect(lsp.isReach.map((r) => `${r.neighbor}/${r.metric}`)).toEqual(['P2/10', 'PE1/10', 'PE2/30']);
    expect(lsp.ipReach).toEqual([
      { prefix: '10.0.0.2/32', metric: 0 },
      { prefix: '10.1.1.0/31', metric: 10 },
      { prefix: '10.1.2.0/31', metric: 10 },
      { prefix: '10.1.4.0/31', metric: 30 },
    ]);
  });
});

describe('SPF (ISO 10589 §7.2.6 decision process)', () => {
  test('PE1: hand-computed distances, all via the LAG to P1', () => {
    // PE1-P1 10, P1-P2 10, P2-PE2 10, P1-PE2 30.
    // P1 = 10; P2 = 10+10 = 20; PE2 = min(10+10+10, 10+30) = 30.
    const { dist, nextHops } = buildNetwork(topo).isis.spf.PE1;
    expect(dist).toEqual({ PE1: 0, P1: 10, P2: 20, PE2: 30 });
    for (const n of ['P1', 'P2', 'PE2']) expect(nextHops[n]).toEqual([{ node: 'P1', link: 'PE1-P1' }]);
  });

  test('P1 after P1-P2 fails: PE2 direct (30), P2 via PE2 (30+10)', () => {
    const { dist, nextHops } = buildNetwork(topo, { failures: ['P1-P2'] }).isis.spf.P1;
    expect(dist.PE2).toBe(30);
    expect(dist.P2).toBe(40);
    expect(nextHops.P2).toEqual([{ node: 'PE2', link: 'P1-PE2' }]);
  });

  test('routes carry the loopback metric (RFC 1195): PE1 -> 10.0.0.4/32 = 30', () => {
    const r = buildNetwork(topo).isis.rib.PE1['10.0.0.4/32'];
    expect(r.metric).toBe(30);
    expect(r.nextHops.map((h) => h.node)).toEqual(['P1']);
  });

  const lsp = (origin, nbrs) => ({
    origin,
    seq: 1,
    isReach: nbrs.map(([n, m, link]) => ({ neighbor: n, metric: m, link })),
    ipReach: [],
  });

  test('ignores an edge that fails the two-way connectivity check', () => {
    // A claims B, but B does not list A.
    const lsdb = [lsp('A', [['B', 1, 'ab']]), lsp('B', [])];
    expect(spf(lsdb, 'A').dist).toEqual({ A: 0 });
  });

  test('keeps equal-cost next hops (ECMP)', () => {
    // A-B-D and A-C-D, all metric 10: D = 20 via B and C.
    const lsdb = [
      lsp('A', [['B', 10, 'ab'], ['C', 10, 'ac']]),
      lsp('B', [['A', 10, 'ab'], ['D', 10, 'bd']]),
      lsp('C', [['A', 10, 'ac'], ['D', 10, 'cd']]),
      lsp('D', [['B', 10, 'bd'], ['C', 10, 'cd']]),
    ];
    const r = spf(lsdb, 'A');
    expect(r.dist.D).toBe(20);
    expect(r.nextHops.D).toEqual([{ node: 'B', link: 'ab' }, { node: 'C', link: 'ac' }]);
  });
});

describe('LSP flooding (ISO 10589 §7.3.15.1)', () => {
  test('floods a newer PE1 LSP to every router once; crossing copies are duplicates', () => {
    const net = buildNetwork(topo);
    const lsp = { ...net.isis.lsps.PE1, seq: 2 };
    const tx = floodLsp(net.isis, 'PE1', lsp, rfcVendor);
    // 10 ms per hop: PE1->P1 at 10; P1->P2, P1->PE2 at 20; P2<->PE2 cross at 30.
    expect(tx.map((x) => `${x.t}:${x.from}->${x.to}:${x.result}`)).toEqual([
      '10:PE1->P1:installed',
      '20:P1->P2:installed',
      '20:P1->PE2:installed',
      '30:PE2->P2:duplicate',
      '30:P2->PE2:duplicate',
    ]);
  });

  test('an LSP with a sequence number already held is not re-flooded', () => {
    const net = buildNetwork(topo);
    const tx = floodLsp(net.isis, 'PE1', net.isis.lsps.PE1, rfcVendor);
    expect(tx.map((x) => x.result)).toEqual(['duplicate']);
  });
});
