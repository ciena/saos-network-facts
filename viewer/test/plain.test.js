// SPDX-License-Identifier: Apache-2.0
// Devices without facts as plain boxes: the synthetic plain-box fixture (the sr-l2 PEs with an
// optical line system OLS1 between them that the extractor skips) and every other fixture and
// published lab, whose topology and engine output must not change.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, vpwsWalk } from '../src/engine/index.js';
import { drawnLinks, drawnNodes, importFacts } from '../src/import/facts.js';
import { nodeLabel } from '../src/view/labels.js';
import { renderDevice, renderOverview } from '../src/panels.js';
import { LABS } from '../labs.config.js';

const EXPECTED = new URL('../../tests/fixtures/expected/', import.meta.url);
const read = (name) => readFileSync(new URL(`${name}.facts.json`, EXPECTED), 'utf8');
const text = read('plain-box');
// What the engine computes, without the topology it was given (which carries the positions).
const engineOf = (topology, labelMode) => {
  const { topo, ...net } = buildNetwork(topology, { labelMode });
  return JSON.parse(JSON.stringify(net));
};

describe('the plain-box fixture', () => {
  const imp = importFacts(text);
  const topo = imp.topology;

  test('the skipped line system is a plain box, outside the engine topology', () => {
    expect(topo.nodes.map((n) => n.id)).toEqual(['PE1', 'PE2']);
    expect(topo.plain.nodes).toEqual([
      { id: 'OLS1', role: 'plain', plain: true, type: 'line-system', platform: null, status: 'skipped', reason: 'no extractor for this device (kind generic_vm)', pos: expect.any(Object) },
    ]);
    expect(topo.plain.links).toEqual([
      { id: 'PE1-OLS1', kind: 'plain', plain: true, a: { node: 'PE1', port: '1' }, b: { node: 'OLS1', port: '1' } },
      { id: 'OLS1-PE2', kind: 'plain', plain: true, a: { node: 'OLS1', port: '2' }, b: { node: 'PE2', port: '1' } },
    ]);
    expect(drawnNodes(topo).map((n) => [n.id, !!n.plain])).toEqual([['PE1', false], ['PE2', false], ['OLS1', true]]);
    expect(drawnLinks(topo)).toHaveLength(topo.links.length + 2);
    for (const n of drawnNodes(topo)) expect(Number.isFinite(n.pos.x) && Number.isFinite(n.pos.z)).toBe(true);
    expect(nodeLabel(topo.plain.nodes[0])).toBe('OLS1 line-system');
  });

  test('the import report says it is shown as plain box', () => {
    expect(imp.report.warnings).toContain('OLS1: skipped (no extractor for this device (kind generic_vm)); shown as plain box');
    expect(imp.report.gaps.physical.find((g) => g.item === '1 plain box')).toMatchObject({ source: 'facts' });
  });

  test('the PEs still peer and carry the pseudowire over the subnet the line system bridges', () => {
    const net = buildNetwork(topo, { labelMode: imp.labelMode });
    expect(net.topo.nodes.some((n) => n.plain)).toBe(false);
    expect(net.igp.adjacencies.map((a) => a.state)).toEqual(['Up']);
    const pw = net.vpws.pseudowires[0];
    expect(vpwsWalk(net, pw.id, 'PE1').delivered).toBe(true);
  });

  test('the engine output is the same with or without the plain box (the view property plain)', () => {
    const off = importFacts(text, { plain: false });
    expect(off.topology.plain).toEqual({ nodes: [], links: [] });
    expect(off.report.warnings).toContain('OLS1: skipped (no extractor for this device (kind generic_vm)); not shown');
    expect(engineOf(topo, imp.labelMode)).toEqual(engineOf(off.topology, off.labelMode));
  });

  test('authored positions without the plain box put it between the devices it is cabled to', () => {
    const placed = importFacts(text, { positions: { PE1: [0, 0], PE2: [100, 0] } }).topology;
    const [pe1, pe2] = placed.nodes.map((n) => n.pos);
    const ols = placed.plain.nodes[0].pos;
    expect(ols.x).toBeCloseTo((pe1.x + pe2.x) / 2);
    expect(ols.z).toBeGreaterThan(pe1.z);
    const all = importFacts(text, { positions: { PE1: [0, 0], PE2: [100, 0], OLS1: [50, 50] } });
    expect(all.report.gaps.physical.find((g) => g.item === 'positions').detail).toBe('from the positions file');
    expect(all.topology.plain.nodes[0].pos.x).toBeCloseTo(0);
  });

  test('the panels name it a plain box with its cabling', () => {
    const net = buildNetwork(topo, { labelMode: imp.labelMode });
    const el = { innerHTML: '' };
    renderOverview(el, imp, net);
    expect(el.innerHTML).toContain('<td>line-system</td><td>plain box</td>');
    const dev = { innerHTML: '', querySelector: () => ({ innerHTML: '' }) };
    renderDevice(dev, imp, net, 'OLS1');
    expect(dev.innerHTML).toContain('plain box');
    expect(dev.innerHTML).toContain('cabled port 1 to PE1 1, port 2 to PE2 1');
    expect(dev.innerHTML).not.toContain('not shown');
  });
});

describe('a device the extractor failed on (mixed-detected PE3, status error)', () => {
  test('is a plain box and still reported as failed, with its reason', () => {
    const imp = importFacts(read('mixed-detected'));
    const box = imp.topology.plain.nodes.find((n) => n.id === 'PE3');
    expect(box).toMatchObject({ plain: true, status: 'error' });
    expect(imp.report.warnings.find((w) => w.startsWith('PE3: error (no SAOS 10 platform'))).toMatch(/; shown as plain box$/);
    const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
    const el = { innerHTML: '' };
    renderOverview(el, imp, net);
    expect(el.innerHTML).toMatch(/PE3<\/a><\/td><td>[^<]*<\/td><td>plain box<\/td><td>[^<]*<\/td><td>error<\/td>/);
    const dev = { innerHTML: '', querySelector: () => ({ innerHTML: '' }) };
    renderDevice(dev, imp, net, 'PE3');
    expect(dev.innerHTML).toContain('error (no SAOS 10 platform for PE3');
  });
});

// The engine never sees a plain box: for every fixture and the example, the engine computes the same
// with plain boxes as without. No published lab has one, so the site's pages are as before.
describe('every fixture: the same engine output with or without plain boxes', () => {
  const names = readdirSync(EXPECTED).filter((f) => f.endsWith('.facts.json')).map((f) => f.replace('.facts.json', ''));
  const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');
  for (const [name, facts] of [['adaptive-sr-cfm', example], ...names.map((n) => [n, read(n)])]) {
    test(name, () => {
      const on = importFacts(facts);
      const off = importFacts(facts, { plain: false });
      const { plain, ...engineTopo } = on.topology;
      expect(engineOf(on.topology, on.labelMode)).toEqual(engineOf(off.topology, off.labelMode));
      expect(off.topology.plain).toEqual({ nodes: [], links: [] });
      if (!plain.nodes.length) expect(on.topology).toEqual(off.topology);
      else expect(engineTopo.nodes.map((n) => n.id)).toEqual(off.topology.nodes.map((n) => n.id));
    });
  }

  test('no published lab has a plain box (plain-box is a test fixture, not in the lab menu)', () => {
    expect(LABS.map((l) => l.id)).not.toContain('plain-box');
    const withBoxes = LABS.filter((l) => importFacts(readFileSync(new URL(l.source, new URL('../labs.config.js', import.meta.url)), 'utf8')).topology.plain.nodes.length);
    expect(withBoxes).toEqual([]);
  });
});
