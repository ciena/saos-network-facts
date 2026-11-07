// SPDX-License-Identifier: Apache-2.0
// Node positions in the scene: the library's layout computed from the facts (js/src/layout.ts
// layoutFacts: a ladder on the ring or the core's longest cycle, the rest hung outward; or the
// force-directed layout), or authored positions, centred and scaled to the extent the scene's camera
// frames (about 50 x 30 units). The scene's z is the layout's y (down the screen).
import { forceLayout, layoutFacts } from '../../../js/src/index.ts';

const WIDTH = 50;
const DEPTH = 30;

// The width of a plain box in the scene (view/layers.js buildPlain draws it PLAIN_BOX square).
export const PLAIN_BOX = 2.4;

// Two OADMs of a line system cabled back to back (the express span between them, view/layers.js
// isExpress) are one unit at one site, express traffic implied: on one row each moves halfway toward
// the other (or away, were they closer) until their boxes just touch (as render/frames.js and render/snapshot.js draw them). `plain`:
// the plain boxes ({ nodes, links }) with their scene positions, moved in place.
export function touchBackToBack(plain) {
  const oadm = (id) => plain.nodes.find((n) => n.id === id && /^oadm$/i.test(n.equipment ?? ''));
  const round = (v) => Math.round(v * 100) / 100 + 0;
  const paired = new Set();
  for (const l of plain.links) {
    const [a, b] = [oadm(l.a.node), oadm(l.b.node)];
    if (!a || !b || a === b || !a.pos || !b.pos || paired.has(a.id) || paired.has(b.id) || Math.abs(a.pos.z - b.pos.z) > 1e-9) continue;
    const pull = (Math.abs(b.pos.x - a.pos.x) - PLAIN_BOX) / 2;
    if (Math.abs(pull) < 1e-9) continue;
    const s = Math.sign(b.pos.x - a.pos.x);
    a.pos = { ...a.pos, x: round(a.pos.x + s * pull) };
    b.pos = { ...b.pos, x: round(b.pos.x - s * pull) };
    paired.add(a.id).add(b.id);
  }
}

// { pos: { id: { x, z } }, result } for the importer's topology ({ nodes, links, rings }) and a view's
// layout. A computed layout keeps its rows and columns (a card's wrapping stays) and is stretched to
// the frame on each axis, at most 2:1, so a two-row ladder is not a thin strip under the tilted camera;
// force and authored layouts turn a tall picture a quarter so its long side runs along x and keep
// their proportions, as the page always has.
export function placeLayout(model, layout) {
  const result = layoutFacts(model, layout);
  const ids = model.nodes.map((n) => n.id);
  const drawn = result.method === 'force' || result.method === 'hints';
  return { pos: fit(ids, ids.map((id) => ({ x: result.positions[id].x, z: result.positions[id].y })), { turn: drawn, stretch: !drawn }), result };
}

// The force-directed layout of `ids` and `edges` ([a, b] pairs), fitted to the scene.
export function layoutNodes(ids, edges) {
  if (!ids.length) return {};
  const p = forceLayout(ids, edges);
  return fit(ids, ids.map((id) => ({ x: p[id].x, z: p[id].y })));
}

// Authored positions, as a diagram gives them: { NAME: [x, y] } or { NAME: { x, y } } in any unit,
// y down (a `{ "positions": {...} }` wrapper is accepted). Scaled into the same frame as the layout,
// a tall diagram turned a quarter so its long side runs along x. `missing`: the ids without one.
export function scalePositions(ids, positions) {
  const table = positions?.positions ?? positions ?? {};
  const xy = (p) => (Array.isArray(p) ? p : [p?.x, p?.y ?? p?.z]).map(Number);
  const known = ids.filter((id) => table[id] !== undefined && xy(table[id]).every(Number.isFinite));
  const missing = ids.filter((id) => !known.includes(id));
  if (missing.length || !ids.length) return { pos: {}, missing };
  return { pos: fit(ids, ids.map((id) => ({ x: xy(table[id])[0], z: xy(table[id])[1] }))), missing };
}

// Centre on the origin, scaled into WIDTH x DEPTH; with `turn`, the longer side along x first; with
// `stretch`, each axis scaled on its own, at most twice the other.
function fit(ids, pos, { turn = true, stretch = false } = {}) {
  const span = (axis) => Math.max(...pos.map((p) => p[axis])) - Math.min(...pos.map((p) => p[axis]));
  if (turn && span('z') > span('x')) for (const p of pos) [p.x, p.z] = [p.z, p.x];
  const cx = (Math.max(...pos.map((p) => p.x)) + Math.min(...pos.map((p) => p.x))) / 2;
  const cz = (Math.max(...pos.map((p) => p.z)) + Math.min(...pos.map((p) => p.z))) / 2;
  let sx = WIDTH / (span('x') || 1);
  let sz = DEPTH / (span('z') || 1);
  if (stretch) [sx, sz] = [Math.min(sx, 2 * sz), Math.min(sz, 2 * sx)];
  else sx = sz = Math.min(sx, sz);
  const round = (v) => Math.round(v * 100) / 100 + 0;
  return Object.fromEntries(ids.map((id, i) => [id, { x: round((pos[i].x - cx) * sx), z: round((pos[i].z - cz) * sz) }]));
}
