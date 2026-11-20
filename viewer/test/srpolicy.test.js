// SPDX-License-Identifier: Apache-2.0
// SR policy segment lists on the synthetic sr-policy fixture (a PE1 / P1 / PE2 / P2 square; Flex-Algo 128
// on PE1, P2 and PE2 only; a static adjacency SID on P1 toward PE2): Flex-Algo Prefix-SIDs, adjacency SIDs
// and SRv6 uSID lists resolve hop by hop, and lists that cannot be followed say why.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { computeVpws } from '../src/engine/vpws.js';
import { importFacts } from '../src/import/facts.js';

const text = readFileSync(new URL('../../tests/fixtures/expected/sr-policy.facts.json', import.meta.url), 'utf8');
const load = (extra = [], failures = []) => {
  const imp = importFacts(JSON.parse(text));
  imp.topology.srPolicies.push(...extra);
  return { imp, net: buildNetwork(imp.topology, { labelMode: imp.labelMode, failures }) };
};
const policy = (net, name) => net.sr.policies.find((p) => p.name === name);
const extra = (name, headend, endpoint, type, sids) => ({ name, headend, color: 9, endpoint, segmentList: { name, type, sids } });

describe('the sr-policy fixture', () => {
  test('imports Flex-Algo Prefix-SIDs, adjacency SIDs and typed segment lists', () => {
    const { imp } = load();
    const node = (id) => imp.topology.nodes.find((n) => n.id === id);
    expect(node('PE2').algoSids).toEqual([{ algorithm: 128, index: 103 }]);
    expect(node('P1').algoSids).toBeUndefined();
    expect(imp.topology.adjSids).toEqual([{ node: 'P1', interface: 'P1-PE2', label: 24001, link: 'P1-PE2', neighbor: 'PE2' }]);
    expect(imp.topology.srPolicies.map((p) => [p.name, p.segmentList.type, p.segmentList.sids])).toEqual([
      ['FA128-MPLS-to-PE2', 'mpls', [16103]],
      ['ADJ-to-PE2', 'mpls', [16002, 24001]],
      ['FA128-SRV6-to-PE2', 'srv6', ['2001:db8:a804::/48', '2001:db8:a803::/48']],
    ]);
  });

  test('every policy resolves, each along its own path', () => {
    const { net } = load();
    expect(net.sr.policies.map((p) => [p.name, p.valid, p.path])).toEqual([
      ['FA128-MPLS-to-PE2', true, ['PE1', 'P2', 'PE2']],
      ['ADJ-to-PE2', true, ['PE1', 'P1', 'PE2']],
      ['FA128-SRV6-to-PE2', true, ['PE1', 'P2', 'PE2']],
    ]);
    expect(policy(net, 'FA128-MPLS-to-PE2').sids).toEqual([{ label: 16103, node: 'PE2', algorithm: 128 }]);
    expect(policy(net, 'ADJ-to-PE2').sids).toEqual([
      { label: 16002, node: 'P1', algorithm: 0 }, { label: 24001, node: 'P1', adjacency: 'P1-PE2' }]);
    expect(policy(net, 'FA128-SRV6-to-PE2').sids.map((s) => [s.node, s.locator])).toEqual([['P2', 'LOC-ALGO128'], ['PE2', 'LOC-ALGO128']]);
  });

  test('an adjacency SID needs its link: failing it invalidates only that policy', () => {
    const { net } = load([], ['P1-PE2']);
    expect(net.sr.policies.map((p) => [p.name, p.valid])).toEqual([
      ['FA128-MPLS-to-PE2', true], ['ADJ-to-PE2', false], ['FA128-SRV6-to-PE2', true]]);
  });

  test('a pseudowire steered onto a Flex-Algo, adjacency or SRv6 policy says the walk cannot follow it', () => {
    const { net } = load();
    const pw = (color) => ({ ends: [{ node: 'PE1', underlay: 'sr-policy', color }, { node: 'PE2', underlay: 'sr' }] });
    const vpws = computeVpws({ ...net.topo, pseudowires: [128, 200, 300].map(pw) }, net.isis, net.mpls, net.sr, net.vendor);
    expect(vpws.pseudowires.map((p) => p.ends[0].transport.error)).toEqual([
      'SR policy FA128-MPLS-to-PE2 uses Flex-Algo or adjacency SIDs; the packet walk follows only algorithm 0 Prefix-SID lists',
      'SR policy ADJ-to-PE2 uses Flex-Algo or adjacency SIDs; the packet walk follows only algorithm 0 Prefix-SID lists',
      'SR policy FA128-SRV6-to-PE2 uses SRv6 SIDs; the packet walk follows only algorithm 0 Prefix-SID lists',
    ]);
  });

  test('lists that cannot be followed are invalid and say why', () => {
    const { net } = load([
      extra('foreign-adj', 'PE1', '192.0.2.3', 'mpls', [24001]),
      extra('unknown', 'PE1', '192.0.2.3', 'mpls', [16999]),
      extra('not-in-fa', 'P1', '192.0.2.3', 'mpls', [16103]),
      extra('no-locator', 'PE1', '2001:db8::3', 'srv6', ['2001:db8:ffff::/48']),
    ]);
    const reasons = Object.fromEntries(net.sr.policies.filter((p) => !p.valid).map((p) => [p.name, p.reason]));
    expect(reasons).toEqual({
      'foreign-adj': 'SID 24001 is an adjacency SID of P1 (P1-PE2), but the packet is at PE1',
      unknown: 'SID 16999 is no Prefix-SID in the SRGB and no adjacency SID',
      'not-in-fa': 'SID 16103 (PE2): P1 takes no part in Flex-Algo 128',
      'no-locator': 'SID 2001:db8:ffff::/48 is in no SRv6 locator',
    });
  });
});
