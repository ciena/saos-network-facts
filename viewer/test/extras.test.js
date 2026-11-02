// SPDX-License-Identifier: Apache-2.0
// What the extractor's extra file adds (schema 1.9) on every drawing: the synthetic line-system
// fixture (the sr-l2 PEs, their core link riding an optical line system ROADM-A - AMP-1 - ROADM-B
// given by the extra file, two sites, two notes). The engine never reads these.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { drawnLinks, drawnNodes, importFacts } from '../src/import/facts.js';
import { renderDevice, renderOverview } from '../src/panels.js';
import { equipmentTag, wrapNote } from '../src/render/model.js';
import { frames, snapshot } from '../src/render/index.js';
import { nodeLabel } from '../src/view/labels.js';
import { noteLayer, siteRect } from '../src/view/layers.js';

const text = readFileSync(new URL('../../tests/fixtures/expected/line-system.facts.json', import.meta.url), 'utf8');
const plainBox = readFileSync(new URL('../../tests/fixtures/expected/plain-box.facts.json', import.meta.url), 'utf8');
const withNotes = (notes) => JSON.stringify({ ...JSON.parse(text), notes });

describe('import', () => {
  const imp = importFacts(text);
  const nodes = new Map(drawnNodes(imp.topology).map((n) => [n.id, n]));

  test('line-system members are plain boxes with their equipment role, without a warning', () => {
    expect(imp.topology.plain.nodes.map((n) => [n.id, n.equipment, n.type])).toEqual([['ROADM-A', 'roadm', 'roadm-2d'], ['AMP-1', 'amplifier', 'ila'], ['ROADM-B', 'roadm', 'roadm-2d']]);
    expect(imp.report.warnings.filter((w) => /plain box/.test(w))).toEqual([]);
    expect(nodeLabel(nodes.get('AMP-1'))).toBe('AMP-1 amplifier · ila');
    expect(nodeLabel(nodes.get('PE1'))).toBe('PE1 192.0.2.1');
  });

  test('optical spans keep their kind and label; the routed core link rides over them', () => {
    const optical = drawnLinks(imp.topology).filter((l) => l.medium === 'optical').map((l) => [l.a.node, l.b.node, l.caption]);
    expect(optical).toEqual([['PE1', 'ROADM-A', 'ch 25'], ['PE1', 'ROADM-A', 'ch 26 · dark'], ['ROADM-A', 'AMP-1', 'span 1 · 40 km'], ['AMP-1', 'ROADM-B', 'span 2 · 38 km'], ['ROADM-B', 'PE2', 'ch 25']]);
    const core = imp.topology.links.find((l) => l.id === 'PE1-PE2');
    expect([core.kind, core.medium, buildNetwork(imp.topology).igp.adjacencies.find((a) => a.link === 'PE1-PE2')?.state]).toEqual(['core', undefined, 'Up']);
  });

  test('sites, notes, and the layout puts the line system on the core ladder', () => {
    expect(imp.topology.sites).toEqual([{ name: 'east', nodes: ['PE1', 'ROADM-A'] }, { name: 'west', nodes: ['PE2', 'ROADM-B'] }]);
    expect(imp.topology.notes).toEqual([
      { text: 'in-line amplifier hut, no site of its own', device: 'AMP-1', layer: 'physical' },
      { text: 'PE1-PE2 core link rides ch 25; ch 26 is lit on ROADM-A only', device: null, layer: 'physical' },
    ]);
    expect(imp.layout.method).toBe('ladder');
    expect(imp.layout.core).toEqual(['AMP-1', 'PE1', 'PE2', 'ROADM-A', 'ROADM-B']);
    expect(nodes.get('PE1').site).toBe('east');
  });

  test('a file without extras imports as before: no sites, notes or link kinds', () => {
    const t = importFacts(plainBox).topology;
    expect([t.sites, t.notes, drawnLinks(t).some((l) => l.medium || l.caption), drawnNodes(t).some((n) => n.site || n.equipment)]).toEqual([[], [], false, false]);
  });

  test('panels name a member by its role and show its site and spans', () => {
    const net = buildNetwork(imp.topology);
    const el = { innerHTML: '' }, dev = { innerHTML: '' };
    renderOverview(el, imp, net);
    expect(el.innerHTML).toContain('<td>amplifier</td>');
    renderDevice(dev, imp, net, 'ROADM-A');
    const html = dev.innerHTML;
    expect(html).toContain('a roadm the extra file gives (a line-system member)');
    expect(html).toContain('(span 1 · 40 km)');
    expect(html).toContain('<td>site</td><td>east</td>');
  });
});

describe('frames and snapshot', () => {
  test('the physical frame: optical spans with captions, members tagged, site frames, notes', () => {
    const svg = frames(text, { preset: 'card-frames' }).svg;
    const physical = svg.split(/(?=<g class="frame")/).find((g) => g.includes('id="f-physical"'));
    expect(physical.match(/class="link-optical"/g)).toHaveLength(5);
    for (const caption of ['ch 25', 'ch 26 · dark', 'span 1 · 40 km', 'span 2 · 38 km']) expect(physical).toContain(`>${caption}</text>`);
    expect(physical).toContain('>ROADM</text>');
    expect(physical).toContain('>AMP</text>');
    expect(physical.match(/<g class="site">/g)).toHaveLength(2);
    expect(physical.match(/<g class="note">/g)).toHaveLength(2);
    expect(svg).toMatch(/data-title="Physical · 5 devices \(SAOS 10\), 6 links \(5 optical\) · 2 sites"/);
    // sites on every frame (faint), notes only on their own
    expect(svg.match(/<g class="site">/g).length).toBe(2 * svg.match(/<g class="frame"/g).length);
    expect(svg.match(/<g class="note">/g)).toHaveLength(2);
  });

  test('a note goes on its layer\'s frame, or the physical one when the drawing has no such frame', () => {
    const svg = frames(withNotes([{ text: 'IGP note', device: 'PE1', layer: 'igp' }, { text: 'ring note', layer: 'ring' }])).svg;
    const groups = svg.split(/(?=<g class="frame")/).slice(1);
    const frameOf = (t) => groups.filter((g) => g.includes(`>${t}</text>`)).map((g) => g.match(/id="f-([a-z0-9]+)"/)[1]);
    expect(frameOf('IGP note')).toEqual(['igp']);
    expect(frameOf('ring note')).toEqual(['physical']);
  });

  test('the snapshot: spans, members, sites on the physical plane; notes numbered on their plane', () => {
    const svg = snapshot(text).svg;
    const physical = svg.split(/(?=<g class="layer")/).find((g) => g.includes('data-layer="physical"'));
    expect(physical.match(/class="link-optical"/g)).toHaveLength(5);
    expect(physical.match(/<g class="site">/g)).toHaveLength(2);
    expect(physical).toContain('class="note-marker"');
    expect(physical).toContain('>1 · AMP-1</text>');
    expect(physical).toContain('>AMP-1  AMP</text>');
  });
});

describe('helpers', () => {
  test('equipment tags and note wrapping', () => {
    expect(['roadm', 'amplifier', 'terminal', 'Wave Shaper', undefined].map((e) => equipmentTag({ equipment: e }))).toEqual(['ROADM', 'AMP', 'OT', 'WAVE', null]);
    expect(wrapNote('one two three four five', 9)).toEqual(['one two', 'three', 'four five']);
    expect(wrapNote('one two three four five six', 9)).toEqual(['one two', 'three', 'four fiv…']);
    expect(wrapNote('a'.repeat(5), 9)).toEqual(['aaaaa']);
  });

  test('3D page: a note\'s layer (igp is the page\'s isis) and a site\'s outline', () => {
    expect(noteLayer({ layer: 'igp' }, ['physical', 'isis'])).toBe('isis');
    expect(noteLayer({ layer: 'ring' }, ['physical', 'isis'])).toBe('physical');
    const topo = { nodes: [{ id: 'A', pos: { x: 0, z: 0 } }], plain: { nodes: [{ id: 'B', pos: { x: 10, z: 4 } }] } };
    expect(siteRect(topo, { nodes: ['A', 'B'] }, 2)).toEqual({ x0: -2, x1: 12, z0: -2, z1: 6 });
    expect(siteRect(topo, { nodes: ['C'] })).toBeNull();
  });
});
