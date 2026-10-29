// SPDX-License-Identifier: Apache-2.0
// Facts files by URL, so a site can stage the built viewer next to its own facts:
//
//   ?facts=<url>[&positions=<url>]   open that facts file (and authored node positions)
//   ?labs=<url>                      a lab index: open its default lab, offer the others
//   ?labs=<url>&lab=<id>             open lab <id> of that index
//   ?lab=<id>                        the same with the index at labs/index.json
//
// URLs are relative to the page; the index's own URLs are relative to the index. Lab index:
//
//   { "labs": [{ "id", "title", "facts", "positions"?, "default"? }], "default"?: "<id>" }
//
// (a bare array of labs works too). The default lab is the one marked `default: true`, else the
// index's `default` id, else the first. No DOM here, so it is testable with a stub fetch.

export const DEFAULT_INDEX = 'labs/index.json';

export function labParams(search) {
  const q = new URLSearchParams(search);
  const get = (k) => q.get(k)?.trim() || null;
  return { facts: get('facts'), positions: get('positions'), labs: get('labs'), lab: get('lab') };
}

export const resolveUrl = (url, base) => new URL(url, base).href;

async function fetchText(fetchFn, url) {
  const r = await fetchFn(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}

async function fetchJson(fetchFn, url) {
  const text = await fetchText(fetchFn, url);
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${url}: not JSON (${err.message})`);
  }
}

// The labs of the index at `indexUrl`, their URLs made absolute; `defaultId` is the lab to open.
export async function fetchLabIndex(fetchFn, indexUrl) {
  const body = await fetchJson(fetchFn, indexUrl);
  const list = Array.isArray(body) ? body : body?.labs;
  if (!Array.isArray(list) || !list.length) throw new Error(`${indexUrl}: expected { "labs": [{ "id", "title", "facts" }, ...] }`);
  const labs = list.map((l, i) => {
    if (!l?.id || !l.facts) throw new Error(`${indexUrl}: lab ${i + 1} needs an id and a facts URL`);
    return {
      id: String(l.id),
      title: l.title ?? String(l.id),
      facts: resolveUrl(l.facts, indexUrl),
      ...(l.positions ? { positions: resolveUrl(l.positions, indexUrl) } : {}),
    };
  });
  const ids = new Set(labs.map((l) => l.id));
  if (ids.size !== labs.length) throw new Error(`${indexUrl}: lab ids are not unique`);
  const marked = list.find((l) => l.default === true)?.id ?? (Array.isArray(body) ? null : body.default);
  return { url: indexUrl, labs, defaultId: marked && ids.has(String(marked)) ? String(marked) : labs[0].id };
}

// The facts text and positions (parsed, or null) of one lab.
export async function loadLab(fetchFn, lab) {
  const [facts, positions] = await Promise.all([fetchText(fetchFn, lab.facts), lab.positions ? fetchJson(fetchFn, lab.positions) : null]);
  return { ...lab, factsText: facts, positions };
}

// What the page URL asks for: null when it names no facts and no lab (the page shows its
// bundled example), else { index, lab } with `index` null for a bare ?facts=.
export async function loadFromParams(params, { base, fetch: fetchFn }) {
  if (params.facts) {
    const facts = resolveUrl(params.facts, base);
    // No title: the view names it after the recipe in the file.
    const lab = { id: null, title: null, facts, ...(params.positions ? { positions: resolveUrl(params.positions, base) } : {}) };
    return { index: null, lab: await loadLab(fetchFn, lab) };
  }
  if (!params.labs && !params.lab) return null;
  const index = await fetchLabIndex(fetchFn, resolveUrl(params.labs ?? DEFAULT_INDEX, base));
  const id = params.lab ?? index.defaultId;
  const lab = index.labs.find((l) => l.id === id);
  if (!lab) throw new Error(`no lab "${id}" in ${index.url}`);
  return { index, lab: await loadLab(fetchFn, lab) };
}
