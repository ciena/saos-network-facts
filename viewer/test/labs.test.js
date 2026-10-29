// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { fetchLabIndex, labParams, loadFromParams } from '../src/labs.js';

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

  test('no facts and no lab: nothing to load (the page shows its example)', async () => {
    const { fetchFn, calls } = stub({});
    expect(await loadFromParams(labParams(''), { base: BASE, fetch: fetchFn })).toBeNull();
    expect(calls).toEqual([]);
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
