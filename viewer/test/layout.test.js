// SPDX-License-Identifier: Apache-2.0
// The library's layout (js/src/layout.ts) on every fixture lab and the example, through the importer:
// deterministic, no two devices on top of each other, a card within max_columns, and the 3D page's
// default positions.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { layoutFacts, resolveView } from '../../js/src/index.ts';
import { drawnLinks, drawnNodes, importFacts } from '../src/import/facts.js';
import { layoutNodes } from '../src/import/layout.js';

const expected = new URL('../../tests/fixtures/expected/', import.meta.url);
const LABS = [
  ['adaptive-sr-cfm (example)', readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8')],
  ...readdirSync(expected)
    .filter((f) => f.endsWith('.facts.json'))
    .sort()
    .map((f) => [f.replace('.facts.json', ''), readFileSync(new URL(f, expected), 'utf8')]),
];

const minDistance = (positions) => {
  const pts = Object.values(positions);
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
  return min;
};
// Links that run through a device (not at their ends).
const through = (model, positions) => {
  const out = [];
  for (const l of model.links) {
    const [a, b] = [l.a.node, l.b.node];
    const p = positions[a], q = positions[b];
    for (const [id, r] of Object.entries(positions)) {
      if (id === a || id === b) continue;
      const dx = q.x - p.x, dy = q.y - p.y, len = dx * dx + dy * dy;
      const t = len ? Math.max(0, Math.min(1, ((r.x - p.x) * dx + (r.y - p.y) * dy) / len)) : 0;
      if (Math.hypot(r.x - p.x - t * dx, r.y - p.y - t * dy) < 0.15 && t > 0.02 && t < 0.98) out.push(`${a}-${b} through ${id}`);
    }
  }
  return out;
};
const spanX = (positions) => Math.max(...Object.values(positions).map((p) => p.x)) - Math.min(...Object.values(positions).map((p) => p.x));
// What the page lays out: every drawn device and link (plain boxes included) and the rings.
const modelOf = (topo) => ({ nodes: drawnNodes(topo), links: drawnLinks(topo), rings: topo.rings });
const reversed = (m) => ({ nodes: [...m.nodes].reverse(), links: [...m.links].reverse(), rings: [...(m.rings ?? [])].reverse() });

describe('layout of every fixture lab and the example', () => {
  test('there are labs to lay out', () => expect(LABS.length).toBeGreaterThan(10));

  for (const [name, text] of LABS) {
    describe(name, () => {
      const imp = importFacts(text);
      const topo = modelOf(imp.topology);
      const views = { free: {}, card: { aspect: 'card', max_columns: 4 }, 'card-frames preset': resolveView({ preset: 'card-frames' }).view.layout, 'narrow card': { aspect: 'card', max_columns: 2 } };

      test('deterministic: the same facts give the same positions, in any order', () => {
        for (const layout of Object.values(views)) {
          const a = layoutFacts(topo, layout);
          expect(layoutFacts(modelOf(importFacts(text).topology), layout)).toEqual(a);
          expect(layoutFacts(reversed(topo), layout)).toEqual(a);
        }
      });

      test('no two devices overlap, and no link runs through a device', () => {
        for (const [view, layout] of Object.entries(views)) {
          const { positions } = layoutFacts(topo, layout);
          expect(Object.keys(positions).sort(), view).toEqual(topo.nodes.map((n) => n.id).sort());
          if (topo.nodes.length > 1) expect(minDistance(positions), view).toBeGreaterThanOrEqual(0.5);
          expect(through(topo, positions), view).toEqual([]);
        }
        const scene = topo.nodes.map((n) => n.pos);
        for (let i = 0; i < scene.length; i++) for (let j = i + 1; j < scene.length; j++) expect(Math.hypot(scene[i].x - scene[j].x, scene[i].z - scene[j].z)).toBeGreaterThan(2);
      });

      test('a card respects max_columns', () => {
        for (const max of [4, 3, 2]) expect(spanX(layoutFacts(topo, { aspect: 'card', max_columns: max }).positions)).toBeLessThanOrEqual(max - 1 + 1e-9);
      });

      test("the 3D page's positions are the automatic layout by default", () => {
        expect(imp.layout.method).not.toBe('force');
        expect(imp.layout.positions).toEqual(layoutFacts(topo).positions);
        expect(imp.report.gaps.physical.find((i) => i.item === 'positions')).toMatchObject({ source: 'derived' });
        for (const n of topo.nodes) expect(Math.abs(n.pos.x) <= 25 && Math.abs(n.pos.z) <= 15, n.id).toBe(true);
      });
    });
  }
});

describe('the importer and the view layout', () => {
  const example = LABS[0][1];

  test('the example is a ladder on its longest core cycle, the CE hung off a row end', () => {
    const imp = importFacts(example);
    expect(imp.layout.method).toBe('ladder');
    expect(imp.report.gaps.physical.find((i) => i.item === 'positions').detail).toMatch(/^the facts carry no layout: ladder on the longest cycle \(core: /);
    const { positions } = imp.layout;
    const xs = Object.values(positions).map((p) => p.x);
    expect([Math.min(...xs), Math.max(...xs)]).toContain(positions.CE1.x);
  });

  test('a ring lab without an IGP is a ladder on its G.8032 ring', () => {
    const imp = importFacts(LABS.find(([n]) => n === 'g8032-two-ring')[1]);
    expect(imp.layout.description).toBe('ladder on G.8032 ring ring_1');
  });

  test('algorithm force keeps the force-directed layout the page had', () => {
    const imp = importFacts(example, { layout: { algorithm: 'force' } });
    const ids = imp.topology.nodes.map((n) => n.id);
    const force = layoutNodes(ids, imp.topology.links.map((l) => [l.a.node, l.b.node]));
    expect(Object.fromEntries(imp.topology.nodes.map((n) => [n.id, n.pos]))).toEqual(force);
    expect(imp.report.gaps.physical.find((i) => i.item === 'positions').detail).toBe('the facts carry no layout: force-directed layout of the links');
  });

  test('hints are used only when they cover every device', () => {
    const ids = importFacts(example).topology.nodes.map((n) => n.id);
    const hints = Object.fromEntries(ids.map((id, i) => [id, [i * 100, (i % 2) * 100]]));
    const used = importFacts(example, { layout: { hints } });
    expect(used.layout.method).toBe('hints');
    expect(used.report.gaps.physical.find((i) => i.item === 'positions').source).toBe('authored');
    const partial = importFacts(example, { layout: { algorithm: 'hints', hints: { [ids[0]]: [0, 0] } } });
    expect(partial.layout.method).toBe('ladder');
    expect(partial.report.warnings.some((w) => w.startsWith('layout hints place 1 of'))).toBe(true);
  });

  test('plain boxes take part: a line system between two routers is core, in the path', () => {
    const imp = importFacts(LABS.find(([n]) => n === 'plain-box')[1]);
    const plain = imp.topology.plain.nodes.map((n) => n.id);
    expect(plain.length).toBeGreaterThan(0);
    for (const id of plain) expect(imp.layout.positions[id], id).toBeDefined();
    const between = plain.filter((id) => imp.topology.plain.links.filter((l) => l.a.node === id || l.b.node === id).length >= 2);
    expect(between.length).toBeGreaterThan(0);
    for (const id of between) expect(imp.layout.core).toContain(id);
    for (const n of drawnNodes(imp.topology)) expect(n.pos, n.id).toBeDefined();
    // without plain boxes the layout is of the routers alone
    const bare = importFacts(LABS.find(([n]) => n === 'plain-box')[1], { plain: false });
    for (const id of plain) expect(bare.layout.positions[id]).toBeUndefined();
  });

  test('a positions file still wins when it places every device', () => {
    const ids = importFacts(example).topology.nodes.map((n) => n.id);
    const positions = Object.fromEntries(ids.map((id, i) => [id, [i * 10, 0]]));
    const imp = importFacts(example, { positions, layout: { aspect: 'card' } });
    expect(imp.layout).toBe(null);
    expect(imp.report.gaps.physical.find((i) => i.item === 'positions').source).toBe('authored');
  });
});
