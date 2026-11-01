// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { fetchLabIndex, labChoices, labParams, loadFromParams } from '../src/labs.js';
import { LABS, labFiles } from '../labs.config.js';

const BASE = 'https://example.test/site/index.html';

// A fetch that answers from a { url: body } table (objects as JSON), 404 otherwise.
function stub(files) {
  const calls = [];
  const fetchFn = async (url) => {
    calls.push(url);
    if (!(url in files)) return { ok: false, status: 404, text: async () => '' };
    const body = files[url];
    return { ok: true, status: 200, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) };
  };
  return { fetchFn, calls };
}

describe('the page URL', () => {
  test('parameters', () => {
    expect(labParams('?facts=a.json&positions=p.json')).toEqual({ facts: 'a.json', positions: 'p.json', labs: null, lab: null });
    expect(labParams('?labs=labs.json&lab=x')).toMatchObject({ labs: 'labs.json', lab: 'x' });
    expect(labParams('')).toEqual({ facts: null, positions: null, labs: null, lab: null });
  });

  test('no facts and no lab: the default lab of labs/index.json beside the page when the site stages one', async () => {
    const index = { default: 'b', labs: [{ id: 'a', facts: 'a.json' }, { id: 'b', title: 'B lab', facts: 'b.json' }] };
    const { fetchFn, calls } = stub({ 'https://example.test/site/labs/index.json': index, 'https://example.test/site/labs/b.json': 'B' });
    const out = await loadFromParams(labParams(''), { base: BASE, fetch: fetchFn });
    expect(out.index.defaultId).toBe('b');
    expect(out.lab).toMatchObject({ id: 'b', title: 'B lab', factsText: 'B' });
    expect(calls[0]).toBe('https://example.test/site/labs/index.json');
  });

  test('no facts, no lab and no staged index: nothing to load (the page shows its example)', async () => {
    const { fetchFn, calls } = stub({});
    expect(await loadFromParams(labParams(''), { base: BASE, fetch: fetchFn })).toBeNull();
    expect(calls).toEqual(['https://example.test/site/labs/index.json']);
    // a server that answers a page instead of 404 (an SPA fallback) counts as no index
    const html = stub({ 'https://example.test/site/labs/index.json': '<!doctype html><title>x</title>' });
    expect(await loadFromParams(labParams(''), { base: BASE, fetch: html.fetchFn })).toBeNull();
    // an index that is there but malformed is still an error, not silently the example
    const bad = stub({ 'https://example.test/site/labs/index.json': { labs: [{ id: 'a' }] } });
    await expect(loadFromParams(labParams(''), { base: BASE, fetch: bad.fetchFn })).rejects.toThrow('needs an id and a facts URL');
  });

  test('?facts= loads that file relative to the page, with optional positions', async () => {
    const { fetchFn } = stub({ 'https://example.test/data/lab1.json': '{"x":1}', 'https://example.test/site/pos.json': { A: [1, 2] } });
    const out = await loadFromParams(labParams('?facts=../data/lab1.json&positions=pos.json'), { base: BASE, fetch: fetchFn });
    expect(out.index).toBeNull();
    expect(out.lab).toMatchObject({ title: null, factsText: '{"x":1}', positions: { A: [1, 2] } });
  });

  test('?labs= opens the default lab; URLs in the index are relative to the index', async () => {
    const index = { labs: [{ id: 'a', title: 'A', facts: 'a/facts.json' }, { id: 'b', facts: 'b/facts.json', positions: 'b/positions.json', default: true }] };
    const { fetchFn } = stub({
      'https://example.test/site/labs/index.json': index,
      'https://example.test/site/labs/b/facts.json': 'B',
      'https://example.test/site/labs/b/positions.json': { PE1: [0, 0] },
    });
    const out = await loadFromParams(labParams('?labs=labs/index.json'), { base: BASE, fetch: fetchFn });
    expect(out.index.labs.map((l) => [l.id, l.title])).toEqual([['a', 'A'], ['b', 'b']]);
    expect(out.lab).toMatchObject({ id: 'b', factsText: 'B', positions: { PE1: [0, 0] } });
  });

  test('?lab= alone uses labs/index.json beside the page', async () => {
    const { fetchFn } = stub({ 'https://example.test/site/labs/index.json': [{ id: 'a', facts: 'a.json' }, { id: 'b', facts: 'b.json' }], 'https://example.test/site/labs/b.json': 'B' });
    const out = await loadFromParams(labParams('?lab=b'), { base: BASE, fetch: fetchFn });
    expect(out.lab.factsText).toBe('B');
  });

  test('errors name the URL or the lab', async () => {
    const { fetchFn } = stub({ 'https://example.test/site/labs.json': { default: 'a', labs: [{ id: 'a', facts: 'a.json' }] } });
    await expect(loadFromParams(labParams('?facts=missing.json'), { base: BASE, fetch: fetchFn })).rejects.toThrow('missing.json: HTTP 404');
    await expect(loadFromParams(labParams('?labs=labs.json&lab=z'), { base: BASE, fetch: fetchFn })).rejects.toThrow('no lab "z"');
    await expect(fetchLabIndex(stub({ 'https://x.test/i.json': { labs: [{ id: 'a' }] } }).fetchFn, 'https://x.test/i.json')).rejects.toThrow('needs an id and a facts URL');
  });
});

describe('the labs the site stages', () => {
  test('labs/index.json lists the example as the default lab and the two-ring fixture, each with its facts file', async () => {
    const files = labFiles();
    expect(Object.keys(files)).toEqual(['labs/index.json', 'labs/adaptive-sr-cfm/facts.json', 'labs/g8032-two-ring/facts.json', 'labs/g8032-by-name/facts.json', 'labs/srv6-evpn/facts.json', 'labs/l3vpn-hosts/facts.json']);
    expect(JSON.parse(files['labs/index.json'])).toEqual({
      labs: [
        { id: 'adaptive-sr-cfm', title: 'Adaptive-SR-CFM (example)', facts: 'adaptive-sr-cfm/facts.json', default: true },
        { id: 'g8032-two-ring', title: 'G.8032 two-ring lab (fixture, links from --clab)', facts: 'g8032-two-ring/facts.json' },
        { id: 'g8032-by-name', title: 'G.8032 ring without ring ids (fixture, joined by name)', facts: 'g8032-by-name/facts.json' },
        { id: 'srv6-evpn', title: 'SRv6, Flex-Algo, EVPN and an L3VPN over SRv6 (fixture, hosts from --hosts)', facts: 'srv6-evpn/facts.json' },
        { id: 'l3vpn-hosts', title: 'L3VPN with Linux hosts and a management VRF (fixture, links from --clab)', facts: 'l3vpn-hosts/facts.json' },
      ],
    });
    expect(LABS.filter((l) => l.default).map((l) => l.id)).toEqual(['adaptive-sr-cfm']);
    // the staged files are the repository's own, unchanged
    for (const lab of LABS) expect(files[`labs/${lab.id}/facts.json`]).toBe(readFileSync(new URL(lab.source, new URL('../labs.config.js', import.meta.url)), 'utf8'));
    // the index resolves as the page would fetch it: the example opens by default, the two-ring lab by ?lab=
    const site = Object.fromEntries(Object.entries(files).map(([k, v]) => [`https://example.test/site/${k}`, v]));
    const { fetchFn } = stub(site);
    const dflt = await loadFromParams(labParams(''), { base: BASE, fetch: fetchFn });
    expect(dflt.lab.id).toBe('adaptive-sr-cfm');
    expect(JSON.parse(dflt.lab.factsText).devices.map((d) => d.device)).toContain('PE1');
    const ring = await loadFromParams(labParams('?lab=g8032-two-ring'), { base: BASE, fetch: fetchFn });
    expect(JSON.parse(ring.lab.factsText).links).toHaveLength(10);
  });
});

describe('the lab menu names what is shown', () => {
  const index = { labs: [{ id: 'a', title: 'Lab A', default: true }, { id: 'b', title: 'Lab B' }] };
  test('a lab of the index is selected', () => {
    expect(labChoices(index, { lab: 'b' })).toEqual({ options: [{ value: 'a', label: 'Lab A' }, { value: 'b', label: 'Lab B' }], value: 'b' });
  });
  test('a loaded file gets its own entry, selected, instead of the previous lab', () => {
    expect(labChoices(index, { file: 'my-lab' })).toEqual({ options: [{ value: '', label: 'Your file: my-lab' }, { value: 'a', label: 'Lab A' }, { value: 'b', label: 'Lab B' }], value: '' });
  });
  test('the bundled example is the index\'s default lab', () => {
    expect(labChoices(index, { example: true }).value).toBe('a');
    expect(labChoices({ labs: [{ id: 'b', title: 'Lab B' }] }, { example: true }).options[0]).toEqual({ value: '', label: 'Example' });
  });
});
