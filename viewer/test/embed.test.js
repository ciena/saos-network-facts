// SPDX-License-Identifier: Apache-2.0
// The embed view property (view 1.4) on the 3D page (viewprops.js): embedded in another page for one
// lab, the page offers nothing else to load (no example button, file picker, note, lab picker or file
// drop) and a failed load shows the error alone; not embedded, the page as before.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { failedLoad, nothingNamed, pageControls, pageView } from '../src/viewprops.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const view = (search, viewText = null) => pageView(viewText, null, search).view;
const CAL = '?facts=labs/x/facts.json&preset=lab-snapshot';

describe('embed off (the default)', () => {
  test('every control: example, file picker and its note, file drop; the lab picker from two labs', () => {
    for (const v of [view(''), view(CAL), view(`${CAL}&embed=false`), view('?embed=0', '{"embed": true}')]) {
      expect(v.embed).toBe(false);
      expect(pageControls(v, 1)).toEqual({ example: true, file: true, drop: true, labPicker: false });
      expect(pageControls(v, 2)).toEqual({ example: true, file: true, drop: true, labPicker: true });
    }
    expect(pageControls(view(''))).toEqual({ example: true, file: true, drop: true, labPicker: false });
  });

  test('a failed load shows the example behind the error, as 0.23.1 did', () => {
    expect(failedLoad(view(CAL), 'labs/x/facts.json: 404 Not Found')).toEqual({ example: true, error: 'labs/x/facts.json: 404 Not Found; showing the example' });
    expect(nothingNamed(view(''))).toEqual({ example: true, error: null });
  });
});

describe('embed on', () => {
  test('from the URL (true, 1, yes) or from a view file', () => {
    for (const v of [view(`${CAL}&embed=true`), view('?embed=1'), view('?embed=yes'), view('', '{"view_version": "1.4", "embed": true}')]) {
      expect(v.embed).toBe(true);
      expect(pageControls(v, 0)).toEqual({ example: false, file: false, drop: false, labPicker: false });
      expect(pageControls(v, 5)).toEqual({ example: false, file: false, drop: false, labPicker: false });
    }
    // the preset CAL opens with keeps its own properties
    const v = view(`${CAL}&embed=true`);
    expect([v.preset, v.camera, v.density]).toEqual(['lab-snapshot', 'iso', 'compact']);
    expect(pageView(null, null, `${CAL}&embed=true`).warnings).toEqual([]);
  });

  test('a failed load shows the error alone, no example behind it', () => {
    expect(failedLoad(view(`${CAL}&embed=true`), 'labs/x/facts.json: 404 Not Found')).toEqual({ example: false, error: 'labs/x/facts.json: 404 Not Found' });
    expect(nothingNamed(view('?embed=true'))).toEqual({ example: false, error: 'nothing to show: the URL names no facts file (?facts=) or lab (?lab=)' });
  });
});

test('the page has what embed() takes out: the example and file controls in one row, the note, the Facts section', () => {
  const section = html.match(/<section id="facts-section">([\s\S]*?)<\/section>/)?.[1] ?? '';
  const row = section.match(/<div class="row">([\s\S]*?)<\/div>/)?.[1] ?? '';
  expect(row).toContain('id="facts-example"');
  expect(row).toContain('id="facts-file"');
  expect(section).toContain('<p id="facts-note" class="sub">A file you load stays in this browser');
  expect(section).toContain('<select id="lab-select" hidden');
  expect(section).toContain('<p id="facts-error" class="warn" hidden>');
});
