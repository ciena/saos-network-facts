// SPDX-License-Identifier: Apache-2.0
// View properties on the 3D page (viewprops.js): which planes it draws and lists, plain boxes, where the
// camera starts and how much the labels say, from the resolved view. No view: the page as before.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';
import { DEFAULT_LABELS } from '../src/view/labels.js';
import { LAYERS, LAYER_GAP, planeBox, presentLayers } from '../src/view/layers.js';
import { CAMERAS, cameraPose, densityLabels, FRAME_ONLY, importOptions, pageLayerId, pageView, viewLayers } from '../src/viewprops.js';
import { LAYER_IDS } from '../../js/src/index.ts';

const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');

// What load() does up to the camera, for the example facts and a query string: the planes drawn and
// the camera pose (for a 600 x 800 stage between the side panels).
function page(search, { aspect = 600 / 800 } = {}) {
  const { view, warnings } = pageView(null, null, search);
  const imp = importFacts(example, importOptions(view));
  const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
  const shown = viewLayers(view, presentLayers(net).map((l) => l.id));
  const box = planeBox(net.topo);
  const pose = cameraPose(box, view.camera, { planes: shown.layers.length, gap: LAYER_GAP, aspect, narrowed: shown.narrowed });
  return { view, warnings: [...warnings, ...shown.warnings], layers: shown.layers, box, pose };
}
const round = (xyz) => xyz.map((v) => Math.round(v * 100) / 100);

describe('view properties on the page', () => {
  test('every view layer is a layer of the page, but the frame-only optical and role layers', () => {
    const pageIds = LAYERS.map((l) => l.id);
    expect(FRAME_ONLY).toEqual(['optical', 'role']);
    expect(LAYER_IDS.filter((id) => !FRAME_ONLY.includes(id)).map(pageLayerId).sort()).toEqual([...pageIds].sort());
  });

  test('no view: every layer the facts have, the fit camera, the visitor\'s labels, no warnings', () => {
    const shown = page('');
    expect(shown.warnings).toEqual([]);
    expect(shown.layers).toEqual(['physical', 'ring', 'isis', 'mpls', 'bgp', 'pw', 'cfm']);
    expect(shown.view.camera).toBe('fit');
    expect(densityLabels(shown.view.density, { node: 'name', scale: 1.2 })).toEqual({ ...DEFAULT_LABELS, node: 'name', scale: 1.2 });
  });

  test('the fit camera is the page\'s camera from before view properties', () => {
    const box = { x0: -10, x1: 30, z0: -6, z1: 14 };
    // the old fitCamera: target (cx, 13, cz), back by size = max(width, depth * 1.6)
    expect(cameraPose(box, 'fit', { planes: 3 })).toEqual({ target: [10, 13, 4], position: [10, 13 + 40 * 0.85, 4 + 40 * 1.4] });
    expect(cameraPose(box)).toEqual(cameraPose(box, 'fit', { planes: 9, aspect: 3 }));
    // a view that leaves planes out: the same angle and distance, aimed at the middle of those left
    expect(cameraPose(box, 'fit', { planes: 2, narrowed: true })).toEqual({ target: [10, 3, 4], position: [10, 3 + 40 * 0.85, 4 + 40 * 1.4] });
  });

  test('the view file, then the URL; a fetch error comes first in the warnings', () => {
    const { view, warnings } = pageView('{"layers":["physical","igp","bgp"],"camera":"top"}', 'v.json: HTTP 404', '?camera=iso&lab=x&bogus=1');
    expect(view.camera).toBe('iso');
    expect(warnings).toEqual(['v.json: HTTP 404']);
    expect(viewLayers(view, ['physical', 'ring', 'isis', 'mpls', 'bgp', 'cfm']).layers).toEqual(['physical', 'isis', 'bgp']);
  });

  test('the planes: only layers both in the view and in the facts, in stacking order', () => {
    const present = ['physical', 'ring', 'isis', 'mpls', 'bgp', 'pw', 'cfm'];
    expect(viewLayers(pageView(null, null, '?layers=mpls,igp,evpn').view, present)).toEqual({ layers: ['isis', 'mpls'], narrowed: true, warnings: [] });
    expect(viewLayers(pageView(null, null, '?layers=physical,ring,igp,mpls,bgp,pw,cfm,evpn').view, present).narrowed).toBe(false);
    expect(viewLayers(pageView(null, null, '').view, present).layers).toEqual(present);
    // none of the view's layers in the facts: every present layer rather than an empty page
    const none = viewLayers(pageView(null, null, '?layers=srv6,evpn').view, present);
    expect(none.layers).toEqual(present);
    expect(none.warnings).toEqual(['layers: the facts have none of srv6, evpn; showing every layer they have']);
    expect(viewLayers(pageView(null, null, '?layers=ring').view, []).layers).toEqual([]);
  });

  test('?preset=protocol-stack&layers=igp,mpls&camera=top: two planes, straight down (golden camera)', () => {
    const shown = page('?preset=protocol-stack&layers=igp,mpls&camera=top');
    expect(shown.warnings).toEqual([]);
    expect(shown.view.preset).toBe('protocol-stack');
    expect(shown.layers).toEqual(['isis', 'mpls']);
    expect(round(shown.pose.target)).toEqual(GOLDEN.top.target);
    expect(round(shown.pose.position)).toEqual(GOLDEN.top.position);
    // the same query always gives the same camera
    expect(page('?layers=igp,mpls&preset=protocol-stack&camera=top').pose).toEqual(shown.pose);
  });

  test('presets open the page in their state: protocol-stack fit, lab-snapshot iso with compact labels', () => {
    const stack = page('?preset=protocol-stack');
    expect(stack.view.camera).toBe('fit');
    expect(stack.layers).toEqual(page('').layers);
    expect(stack.pose).toEqual(page('').pose);
    expect(densityLabels(stack.view.density, { bgp: 'none' }).bgp).toBe('none');
    const snap = page('?preset=lab-snapshot');
    expect(snap.view.camera).toBe('iso');
    expect(round(snap.pose.target)).toEqual(GOLDEN.iso.target);
    expect(round(snap.pose.position)).toEqual(GOLDEN.iso.position);
    expect(densityLabels(snap.view.density, { scale: 0.8 })).toEqual({ node: 'name', bgp: 'down', lag: true, scale: 0.8 });
  });

  test('top looks straight down on the top plane and keeps the whole outline in view', () => {
    const box = { x0: 0, x1: 40, z0: 0, z1: 20 };
    for (const aspect of [0.5, 1, 2.5]) {
      const { target, position } = cameraPose(box, 'top', { planes: 4, aspect });
      expect(target).toEqual([20, 18, 10]);
      const h = position[1] - target[1];
      expect(Math.abs(position[0] - target[0])).toBe(0);
      expect(position[2] - target[2]).toBeLessThan(h * 0.01);
      const t = Math.tan((45 * Math.PI) / 360);
      expect(10 / h).toBeLessThanOrEqual(t);
      expect(20 / h).toBeLessThanOrEqual(t * aspect + 1e-9);
    }
  });

  test('iso sits on the diagonal of the three axes and backs off for a taller stack', () => {
    const box = { x0: 0, x1: 40, z0: 0, z1: 20 };
    const low = cameraPose(box, 'iso', { planes: 2 });
    const tall = cameraPose(box, 'iso', { planes: 8 });
    const d = (p) => p.position.map((v, i) => v - p.target[i]);
    for (const p of [low, tall]) {
      const [x, y, z] = d(p);
      expect(x).toBeCloseTo(y);
      expect(y).toBeCloseTo(z);
    }
    expect(tall.target[1]).toBe(21);
    expect(d(tall)[0]).toBeGreaterThan(d(low)[0]);
  });

  test('every camera of the schema has a pose', () => {
    for (const name of CAMERAS) expect(cameraPose({ x0: 0, x1: 1, z0: 0, z1: 1 }, name).position.every(Number.isFinite)).toBe(true);
  });

  test('density sets what the labels say, keeps their size; null keeps the visitor\'s choice', () => {
    expect(densityLabels('full', { node: 'name', bgp: 'none', lag: false, scale: 1.4 })).toEqual({ node: 'full', bgp: 'all', lag: true, scale: 1.4 });
    expect(densityLabels('minimal')).toEqual({ node: 'name', bgp: 'none', lag: false, scale: 1 });
    expect(densityLabels(null, { node: 'bogus', bgp: 'down' })).toEqual({ ...DEFAULT_LABELS, bgp: 'down' });
    expect(densityLabels(pageView('{"density":"compact"}', null, '?density=minimal').view.density)).toMatchObject({ bgp: 'none' });
  });

  test('plain boxes by default; plain false (view file or ?plain=0) leaves them out', () => {
    expect(importOptions(pageView(null, null, '').view)).toMatchObject({ plain: true });
    expect(importOptions(pageView('{"plain":false}', null, '').view)).toMatchObject({ plain: false });
    expect(importOptions(pageView(null, null, '?plain=0').view)).toMatchObject({ plain: false });
    expect(importOptions(pageView('{"plain":false}', null, '?plain=1').view)).toMatchObject({ plain: true });
    expect(importOptions(pageView(null, null, '?aspect=card&columns=3').view).layout).toEqual({ algorithm: 'auto', hints: {}, aspect: 'card', max_columns: 3 });
  });
});

// The camera poses for the example facts (examples/adaptive-sr-cfm) on a 600 x 800 stage; a change
// here moves where the page opens for these URLs.
const GOLDEN = {
  // the example's planes (the computed layout) span x -31..31, z -16.2..16.2; two planes: the top one (MPLS) at y 6
  top: { target: [0, 6, 0], position: [0, 115.77, 0.11] },
  // seven planes, 0..36: the stack's middle, from the front right corner
  iso: { target: [0, 18, 0], position: [76.55, 94.55, 76.55] },
};
