// SPDX-License-Identifier: Apache-2.0
// Facts files by URL, so a site can stage the built viewer next to its own facts:
//
//   ?facts=<url>[&positions=<url>]   open that facts file (and authored node positions)
//   ?labs=<url>                      a lab index: open its default lab, offer the others
//   ?labs=<url>&lab=<id>             open lab <id> of that index
//   ?lab=<id>                        the same with the index at labs/index.json
//   &view=<url>                      with any of these: view properties (a view file, see
//                                    js/src/view.ts), over the lab's own; other view properties
//                                    can be URL parameters too (preset, layers, camera, ...)
//   (nothing)                        the default lab of labs/index.json beside the page when a site
//                                    stages one, else the bundled example
//
// URLs are relative to the page; the index's own URLs are relative to the index. Lab index:
//
//   { "labs": [{ "id", "title", "facts", "positions"?, "view"?, "default"? }], "default"?: "<id>" }
//
// (a bare array of labs works too). The default lab is the one marked `default: true`, else the
// index's `default` id, else the first. No DOM here, so it is testable with a stub fetch.

export const DEFAULT_INDEX = 'labs/index.json';

export function labParams(search) {
  const q = new URLSearchParams(search);
  const get = (k) => q.get(k)?.trim() || null;
  return { facts: get('facts'), positions: get('positions'), labs: get('labs'), lab: get('lab'), view: get('view') };
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
// `optional`: null when the site stages no index there (not found, or not JSON, as a server's
// fallback page); an index that is there but malformed is still an error.
export async function fetchLabIndex(fetchFn, indexUrl, { optional = false } = {}) {
  let body;
  if (optional) {
    const r = await fetchFn(indexUrl);
    if (!r.ok) return null;
    try {
      body = JSON.parse(await r.text());
    } catch {
      return null;
    }
  } else body = await fetchJson(fetchFn, indexUrl);
  const list = Array.isArray(body) ? body : body?.labs;
  if (!Array.isArray(list) || !list.length) throw new Error(`${indexUrl}: expected { "labs": [{ "id", "title", "facts" }, ...] }`);
  const labs = list.map((l, i) => {
    if (!l?.id || !l.facts) throw new Error(`${indexUrl}: lab ${i + 1} needs an id and a facts URL`);
    return {
      id: String(l.id),
      title: l.title ?? String(l.id),
      facts: resolveUrl(l.facts, indexUrl),
      ...(l.positions ? { positions: resolveUrl(l.positions, indexUrl) } : {}),
      ...(l.view ? { view: resolveUrl(l.view, indexUrl) } : {}),
    };
  });
  const ids = new Set(labs.map((l) => l.id));
  if (ids.size !== labs.length) throw new Error(`${indexUrl}: lab ids are not unique`);
  const marked = list.find((l) => l.default === true)?.id ?? (Array.isArray(body) ? null : body.default);
  return { url: indexUrl, labs, defaultId: marked && ids.has(String(marked)) ? String(marked) : labs[0].id };
}

// A view file's text, or why it could not be fetched: { viewText, viewError }, both null for no URL.
// Never throws: a missing view leaves the page on its defaults (resolveView reports the rest).
export async function loadView(fetchFn, url) {
  if (!url) return { viewText: null, viewError: null };
  try {
    return { viewText: await fetchText(fetchFn, url), viewError: null };
  } catch (err) {
    return { viewText: null, viewError: `${err.message}; view properties left at their defaults` };
  }
}

// The facts text, positions (parsed, or null) and view text (or null, with viewError) of one lab.
// `view`, when given (the page's ?view=), replaces the lab's own view: its URL, or the
// { viewText, viewError } loadView already returned for it (so the page fetches it once).
export async function loadLab(fetchFn, lab, view = null) {
  const [facts, positions, loaded] = await Promise.all([
    fetchText(fetchFn, lab.facts),
    lab.positions ? fetchJson(fetchFn, lab.positions) : null,
    view && typeof view === 'object' ? view : loadView(fetchFn, view ?? lab.view),
  ]);
  return { ...lab, factsText: facts, positions, viewText: loaded.viewText, viewError: loaded.viewError };
}

// What the page URL asks for: { index, lab, view } with `index` null for a bare ?facts= and `view`
// the ?view= URL made absolute (or null); with no facts or lab parameter, the default lab of the
// index at labs/index.json beside the page, or null when the site stages none (the page shows its
// bundled example). `loadedView`: what loadView already returned for ?view=, so it is not fetched again.
export async function loadFromParams(params, { base, fetch: fetchFn, loadedView = null }) {
  const viewUrl = params.view ? resolveUrl(params.view, base) : null;
  const view = viewUrl && (loadedView ?? (await loadView(fetchFn, viewUrl)));
  if (params.facts) {
    const facts = resolveUrl(params.facts, base);
    // No title: the view names it after the recipe in the file.
    const lab = { id: null, title: null, facts, ...(params.positions ? { positions: resolveUrl(params.positions, base) } : {}) };
    return { index: null, lab: await loadLab(fetchFn, lab, view), view: viewUrl };
  }
  const implicit = !params.labs && !params.lab;
  const index = await fetchLabIndex(fetchFn, resolveUrl(params.labs ?? DEFAULT_INDEX, base), { optional: implicit });
  if (!index) return null;
  const id = params.lab ?? index.defaultId;
  const lab = index.labs.find((l) => l.id === id);
  if (!lab) throw new Error(`no lab "${id}" in ${index.url}`);
  return { index, lab: await loadLab(fetchFn, lab, view), view: viewUrl };
}

// The lab menu for what is shown: `shown` is { lab: id } (a lab of the index), { example: true } (the
// bundled example: the index's default lab when it has one) or { file: name } (a file the visitor
// loaded). A file, or anything the index does not list, gets an entry of its own at the top, selected,
// so the menu never names a lab that is not on the page. Returns { options: [{ value, label }], value }.
export function labChoices(index, shown) {
  const labs = (index?.labs ?? []).map((l) => ({ value: l.id, label: l.title }));
  const id = shown.lab ?? (shown.example ? index?.labs.find((l) => l.default)?.id : null);
  if (id && labs.some((l) => l.value === id)) return { options: labs, value: id };
  const label = shown.file ? `Your file: ${shown.file}` : shown.example ? 'Example' : 'Your file';
  return { options: [{ value: '', label }, ...labs], value: '' };
}
