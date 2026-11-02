// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { LAYERS } from '../src/view/layers.js';
import { importOptions, layerVisibility, pageLayerId, pageView } from '../src/viewprops.js';
import { LAYER_IDS } from '../../js/src/index.ts';

describe('view properties on the page', () => {
  test('every view layer is a layer of the page', () => {
    const page = LAYERS.map((l) => l.id);
    expect(LAYER_IDS.map(pageLayerId).sort()).toEqual([...page].sort());
  });

  test('no view: every layer shown, no warnings', () => {
    const { view, warnings } = pageView(null, null, '');
    expect(warnings).toEqual([]);
    expect(Object.values(layerVisibility(view)).every(Boolean)).toBe(true);
  });

  test('the view file, then the URL; a fetch error comes first in the warnings', () => {
    const { view, warnings } = pageView('{"layers":["physical","igp","bgp"],"camera":"top"}', 'v.json: HTTP 404', '?camera=iso&lab=x&bogus=1');
    expect(view.camera).toBe('iso');
    expect(layerVisibility(view)).toMatchObject({ physical: true, isis: true, bgp: true, ring: false, cfm: false });
    expect(warnings).toEqual(['v.json: HTTP 404']);
    expect(layerVisibility(pageView(null, null, '?layers=ring').view)).toMatchObject({ physical: false, ring: true });
  });

  test('plain boxes by default; plain false (view file or ?plain=0) leaves them out', () => {
    expect(importOptions(pageView(null, null, '').view)).toEqual({ plain: true });
    expect(importOptions(pageView('{"plain":false}', null, '').view)).toEqual({ plain: false });
    expect(importOptions(pageView(null, null, '?plain=0').view)).toEqual({ plain: false });
    expect(importOptions(pageView('{"plain":false}', null, '?plain=1').view)).toEqual({ plain: true });
  });
});
