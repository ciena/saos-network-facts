// SPDX-License-Identifier: Apache-2.0
// Node SID labels from the facts' prefix SIDs: value-type index (the YANG default, also when the facts
// say null), absolute inside and outside the SRGB, and labels that do not follow the node order.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, rfcVendor } from '../src/engine/index.js';
import { nodeOfSid, prefixSidLabel } from '../src/engine/mpls.js';
import { importFacts } from '../src/import/facts.js';
import { renderDevice } from '../src/panels.js';

const fixture = readFileSync(new URL('../../tests/fixtures/expected/l3vpn-hosts.facts.json', import.meta.url), 'utf8');

// The l3vpn-hosts lab (PE1, P1, PE2 over IS-IS, SRGB 16000-23999) with the given prefix SID per router.
function lab(sids) {
  const file = JSON.parse(fixture);
  for (const r of file.devices) {
    const sr = r.facts?.segment_routing;
    if (!sr?.prefix_sids?.length) continue;
    Object.assign(sr.prefix_sids[0], sids[r.device]);
  }
  const imp = importFacts(JSON.stringify(file));
  return { imp, net: buildNetwork(imp.topology, { labelMode: imp.labelMode }) };
}

const routers = (imp) => imp.topology.nodes.filter((n) => n.role !== 'ce').map((n) => n.id);
const labels = ({ imp, net }) => Object.fromEntries(routers(imp).map((id) => [id, prefixSidLabel(net.topo, net.vendor, id)]));
const fec = (imp, id) => `${imp.topology.nodes.find((n) => n.id === id).loopback}/32`;

describe('node SID labels', () => {
  test('the routers are in file order: PE1, P1, PE2 (positions 1-3, none matching a SID below)', () => {
    expect(routers(lab({}).imp)).toEqual(['PE1', 'P1', 'PE2']);
  });

  test('index: SRGB base + the configured index, not the node position', () => {
    const l = lab({ PE1: { sid: '1003', value_type: 'index' }, P1: { sid: '1001', value_type: 'index' }, PE2: { sid: '1002', value_type: 'index' } });
    expect(labels(l)).toEqual({ P1: 17001, PE1: 17003, PE2: 17002 });
    expect(l.net.mpls.bindings.P1[fec(l.imp, 'PE1')]).toMatchObject({ local: 17003, sidIndex: 1003 });
  });

  test('a null value_type (facts before 0.13.1, no value-type in the config) is an index', () => {
    const l = lab({ PE1: { sid: '1003', value_type: null }, P1: { sid: '1001', value_type: null }, PE2: { sid: '1002', value_type: null } });
    expect(labels(l)).toEqual({ P1: 17001, PE1: 17003, PE2: 17002 });
    expect(l.imp.topology.nodes.find((n) => n.id === 'PE1')).toMatchObject({ sidIndex: 1003 });
    expect(l.net.mpls.lfib.P1[17003]).toBeDefined();
    expect(l.net.mpls.lfib.P1[16001]).toBeUndefined(); // PE1's position label, as before the fix
  });

  test('absolute inside the SRGB: the label as written, the index label - base', () => {
    const l = lab({ PE1: { sid: '17003', value_type: 'absolute' }, P1: { sid: '1001', value_type: 'index' }, PE2: { sid: '17002', value_type: 'absolute' } });
    expect(labels(l)).toEqual({ P1: 17001, PE1: 17003, PE2: 17002 });
    expect(l.imp.topology.nodes.find((n) => n.id === 'PE2')).toMatchObject({ sidIndex: 1002 });
    expect(l.imp.report.warnings.filter((w) => /outside the SRGB/.test(w))).toEqual([]);
  });

  test('absolute outside the SRGB: kept as the label, with a warning', () => {
    const l = lab({ PE1: { sid: '30003', value_type: 'absolute' }, P1: { sid: '1', value_type: 'index' }, PE2: { sid: '2', value_type: 'index' } });
    expect(labels(l)).toEqual({ P1: 16001, PE1: 30003, PE2: 16002 });
    expect(l.net.mpls.bindings.P1[fec(l.imp, 'PE1')]).toMatchObject({ local: 30003, sidIndex: null });
    expect(l.imp.report.warnings).toContain('PE1: absolute prefix SID 30003 is outside the SRGB 16000-23999; shown as its label');
  });

  test('nodeOfSid and the SR policy segment check use the same labels', () => {
    const l = lab({ PE1: { sid: '1003', value_type: null }, P1: { sid: '1001', value_type: null }, PE2: { sid: '17002', value_type: 'absolute' } });
    expect(nodeOfSid(l.net.topo, rfcVendor, 17003)).toBe('PE1');
    expect(nodeOfSid(l.net.topo, rfcVendor, 17002)).toBe('PE2');
    expect(nodeOfSid(l.net.topo, rfcVendor, 16001)).toBeUndefined();
  });

  test('a router with no prefix SID falls back to its position, reported', () => {
    const l = lab({ PE1: { sid: null, value_type: null }, P1: { sid: '1001', value_type: null }, PE2: { sid: '1002', value_type: null } });
    expect(labels(l)).toEqual({ P1: 17001, PE1: 16001, PE2: 17002 });
    expect(l.imp.report.gaps.mpls.find((i) => i.item === 'node SIDs not configured')?.detail).toMatch(/^PE1: no prefix SID on the loopback/);
  });

  test('the device panel shows the label the view uses', () => {
    const l = lab({ PE1: { sid: '1003', value_type: null }, P1: { sid: '1001', value_type: null }, PE2: { sid: '1002', value_type: null } });
    const el = { innerHTML: '', querySelector: () => ({ innerHTML: '' }) };
    renderDevice(el, l.imp, l.net, 'PE1');
    expect(el.innerHTML).toMatch(/index 1003 \(label 17003\)/);
  });
});
