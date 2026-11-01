// SPDX-License-Identifier: Apache-2.0
// The failure modes the page offers per link: a silent failure only when the lab detects it there
// (CFM MEG, BFD, the LACP timeout, the IGP hold timer), else only a loss of signal.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, failureModes, silentDetection } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';

const netOf = (path) => {
  const imp = importFacts(readFileSync(new URL(path, import.meta.url), 'utf8'));
  return buildNetwork(imp.topology, { labelMode: imp.labelMode });
};
const l3vpn = netOf('../../tests/fixtures/expected/l3vpn-hosts.facts.json');
const ring = netOf('../../tests/fixtures/expected/g8032-two-ring.facts.json');
const ospfTp = netOf('../../tests/fixtures/expected/ospf-tp.facts.json');

// A small network with one link of each kind (silentDetection reads links, MEGs and adjacencies).
const link = (id, extra = {}) => ({ id, a: { node: 'A' }, b: { node: 'B' }, members: [{ id }], lag: false, ...extra });
const fake = {
  igpName: 'isis',
  topo: { links: [link('cfm'), link('bfd', { bfd: true }), link('lag', { lag: true, members: [{ id: 'lag/1' }, { id: 'lag/2' }] }), link('igp'), link('bare')] },
  cfm: { megs: [{ id: 'm', link: 'cfm' }] },
  igp: { adjacencies: [{ link: 'cfm' }, { link: 'bfd' }, { link: 'igp' }] },
};

describe('silent failure detection per link', () => {
  test('CFM MEG, then BFD, then the LACP timeout (a LAG or one member), then the IGP hold timer', () => {
    expect(silentDetection(fake, 'cfm')).toEqual({ kind: 'cfm', text: 'CFM CCM' });
    expect(silentDetection(fake, 'bfd')).toEqual({ kind: 'bfd', text: 'BFD' });
    expect(silentDetection(fake, 'lag')).toEqual({ kind: 'lacp', text: 'the LACP timeout' });
    expect(silentDetection(fake, 'lag/2')).toEqual({ kind: 'lacp', text: 'the LACP timeout' });
    expect(silentDetection(fake, 'igp')).toEqual({ kind: 'igp', text: 'the IS-IS hold timer' });
    expect(silentDetection(fake, 'bare')).toBeNull();
  });
  test('the OSPF dead interval in an OSPF lab', () => {
    const core = ospfTp.topo.links.find((l) => l.kind === 'core');
    expect(silentDetection(ospfTp, core.id).text).toMatch(/OSPF dead interval|BFD|CFM CCM/);
  });
  test('an IS-IS core link: the hold timer', () => {
    expect(silentDetection(l3vpn, 'PE1-P1')).toEqual({ kind: 'igp', text: 'the IS-IS hold timer' });
  });
  test('an L2 ring link with nothing on it: no silent failure, only loss of signal', () => {
    expect(silentDetection(ring, ring.topo.links[0].id)).toBeNull();
    expect(failureModes(ring, ring.topo.links[0].id)).toEqual([{ value: 'los', label: 'Loss of signal: interfaces go down at once' }]);
  });
  test('the offered silent mode names what finds it, before loss of signal', () => {
    expect(failureModes(fake, 'cfm').map((m) => m.label)).toEqual(['Silent failure: found by CFM CCM', 'Loss of signal: interfaces go down at once']);
    expect(failureModes(fake, 'bare').map((m) => m.value)).toEqual(['los']);
  });
});
