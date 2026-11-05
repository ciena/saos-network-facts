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
    expect([core.kind, core.medium, core.over, buildNetwork(imp.topology).igp.adjacencies.find((a) => a.link === 'PE1-PE2')?.state]).toEqual(['core', undefined, 'over ch 25', 'Up']);
  });

  test('sites, notes, and the layout lays the line system out as a chain on a row of its own', () => {
    expect(imp.topology.sites).toEqual([{ name: 'east', nodes: ['PE1', 'ROADM-A'] }, { name: 'west', nodes: ['PE2', 'ROADM-B'] }]);
    expect(imp.topology.notes).toEqual([
      { text: 'in-line amplifier hut, no site of its own', device: 'AMP-1', layer: null },
      { text: 'PE1-PE2 core link rides ch 25; ch 26 is lit on ROADM-A only', device: null, layer: null },
    ]);
    // the routers laid out without the line system, the line system a row above them in path order
    expect(imp.layout.core).toEqual(['PE1', 'PE2']);
    expect(imp.layout.description).toMatch(/; line system ROADM-A - AMP-1 - ROADM-B in a row above$/);
    const p = imp.layout.positions;
    expect(new Set(['ROADM-A', 'AMP-1', 'ROADM-B'].map((id) => p[id].y)).size).toBe(1);
    expect(p['ROADM-A'].x < p['AMP-1'].x && p['AMP-1'].x < p['ROADM-B'].x && p['ROADM-A'].y < p.PE1.y).toBe(true);
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
  const group = (svg, id) => svg.split(/(?=<g class="frame[ a-z0-9]*")/).find((g) => g.includes(`id="f-${id}"`));

  test('the optical frame: the line system (spans with captions, members tagged) and the routers at its ends', () => {
    const r = frames(text, { preset: 'card-frames' });
    expect(r.frames.map((x) => x.id)).toEqual(['optical', 'physical', 'role', 'igp', 'bgp', 'pw']);
    const optical = group(r.svg, 'optical');
    expect(optical.match(/class="link-optical"/g)).toHaveLength(5);
    for (const caption of ['ch 25', 'ch 26 · dark', 'span 1 · 40 km', 'span 2 · 38 km']) expect(optical).toContain(`>${caption}</text>`);
    // the routers at the spans' ends by their type (5164, 5162), as on the physical frame
    for (const tag of ['ROADM', 'AMP', '5164', '5162']) expect(optical).toContain(`>${tag}</text>`);
    expect(optical.match(/<g class="site">/g)).toHaveLength(2);
    // the note on AMP-1 (no layer of its own) goes with AMP-1, on the optical frame
    expect(optical).toContain('>in-line amplifier hut, no</text>');
    expect(r.svg).toMatch(/data-title="Optical · 3 line-system members, 5 spans · 2 sites"/);
  });

  test('the physical frame: the routers and the routed link over the line system; sites; the free note', () => {
    const r = frames(text, { preset: 'card-frames' });
    const physical = group(r.svg, 'physical');
    expect(physical).not.toContain('link-optical');
    expect(physical).not.toContain('>ROADM</text>');
    expect(physical).toContain('>over ch 25</text>');
    expect(physical.match(/<g class="site">/g)).toHaveLength(2);
    expect(physical.match(/<g class="note">/g)).toHaveLength(1);
    expect(r.svg).toMatch(/data-title="Physical · 2 devices \(SAOS 10\), 1 link · 2 sites"/);
    // the other frames leave the line system out too; notes only on their own frame
    expect(group(r.svg, 'igp')).not.toContain('ROADM-A');
    expect(r.svg.match(/<g class="note">/g)).toHaveLength(2);
  });

  test('a view without the optical layer draws the line system on the physical frame', () => {
    const r = frames(text, { layers: ['physical', 'igp', 'bgp', 'pw'] });
    expect(r.frames.map((x) => x.id)).toEqual(['physical', 'igp', 'bgp', 'pw']);
    const physical = group(r.svg, 'physical');
    expect(physical.match(/class="link-optical"/g)).toHaveLength(5);
    expect(physical.match(/<g class="note">/g)).toHaveLength(2);
    expect(r.svg).toMatch(/data-title="Physical · 5 devices \(SAOS 10\), 6 links \(5 optical\) · 2 sites"/);
  });

  test('a note goes on its layer\'s frame, or the physical one when the drawing has no such frame', () => {
    const svg = frames(withNotes([{ text: 'IGP note', device: 'PE1', layer: 'igp' }, { text: 'ring note', layer: 'ring' }])).svg;
    const groups = svg.split(/(?=<g class="frame[ a-z0-9]*")/).slice(1);
    const frameOf = (t) => groups.filter((g) => g.includes(`>${t}</text>`)).map((g) => g.match(/id="f-([a-z0-9]+)"/)[1]);
    expect(frameOf('IGP note')).toEqual(['igp']);
    expect(frameOf('ring note')).toEqual(['physical']);
  });

  test('the snapshot: the optical plane under physical, with the line system and its note; physical with the link over it', () => {
    const r = snapshot(text);
    expect(r.layers).toEqual(['optical', 'physical', 'igp', 'mpls', 'bgp', 'pw']);
    const plane = (id) => r.svg.split(/(?=<g class="layer")/).find((g) => g.includes(`data-layer="${id}"`));
    expect(plane('optical').match(/class="link-optical"/g)).toHaveLength(5);
    expect(plane('optical').match(/<g class="site">/g)).toHaveLength(2);
    expect(plane('optical')).toContain('class="note-marker"');
    expect(plane('optical')).toContain('>1 · AMP-1</text>');
    expect(plane('optical')).toContain('>AMP-1  AMP</text>');
    expect(plane('physical')).not.toContain('link-optical');
    expect(plane('physical')).toContain('>over ch 25</text>');
    // members have no riser; the PEs rise from the optical plane
    expect(r.svg).not.toMatch(/class="pillar" data-layers="optical"/);
    expect(r.svg.match(/class="pillar" data-layers="physical optical/g)).toHaveLength(2);
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
    const ls = { plain: { nodes: [{ id: 'AMP', equipment: 'amplifier' }] } };
    expect([noteLayer({ device: 'AMP' }, ['optical', 'physical'], ls), noteLayer({ device: 'AMP' }, ['physical'], ls), noteLayer({ device: 'AMP', layer: 'physical' }, ['optical', 'physical'], ls)]).toEqual(['optical', 'physical', 'physical']);
    const topo = { nodes: [{ id: 'A', pos: { x: 0, z: 0 } }], plain: { nodes: [{ id: 'B', pos: { x: 10, z: 4 } }] } };
    expect(siteRect(topo, { nodes: ['A', 'B'] }, 2)).toEqual({ x0: -2, x1: 12, z0: -2, z1: 6 });
    expect(siteRect(topo, { nodes: ['C'] })).toBeNull();
  });
});
