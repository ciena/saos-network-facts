// SPDX-License-Identifier: Apache-2.0
// Node positions for a topology that has none: a force-directed layout
// (Fruchterman & Reingold, "Graph Drawing by Force-directed Placement", 1991)
// from a fixed start on a circle, so the same nodes and links always give the
// same picture. The result is centred and scaled to the extent the scene's
// camera frames (about 50 x 30 units).

const ITERATIONS = 400;
const WIDTH = 50;
const DEPTH = 30;

export function layoutNodes(ids, edges) {
  const n = ids.length;
  if (!n) return {};
  const index = new Map(ids.map((id, i) => [id, i]));
  const pairs = edges.map(([a, b]) => [index.get(a), index.get(b)]).filter(([a, b]) => a !== undefined && b !== undefined && a !== b);
  const pos = ids.map((_, i) => ({ x: Math.cos((2 * Math.PI * i) / n) * 10, z: Math.sin((2 * Math.PI * i) / n) * 10 }));
  const k = Math.sqrt(400 / n); // ideal edge length for a 20 x 20 frame
  let temp = 5;
  for (let it = 0; it < ITERATIONS; it++) {
    const disp = pos.map(() => ({ x: 0, z: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i].x - pos[j].x;
        const dz = pos[i].z - pos[j].z;
        const d = Math.max(Math.hypot(dx, dz), 0.01);
        const f = (k * k) / d; // repulsion between every pair
        disp[i].x += (dx / d) * f;
        disp[i].z += (dz / d) * f;
        disp[j].x -= (dx / d) * f;
        disp[j].z -= (dz / d) * f;
      }
    }
    for (const [a, b] of pairs) {
      const dx = pos[a].x - pos[b].x;
      const dz = pos[a].z - pos[b].z;
      const d = Math.max(Math.hypot(dx, dz), 0.01);
      const f = (d * d) / k; // attraction along every link
      disp[a].x -= (dx / d) * f;
      disp[a].z -= (dz / d) * f;
      disp[b].x += (dx / d) * f;
      disp[b].z += (dz / d) * f;
    }
    for (let i = 0; i < n; i++) {
      const d = Math.max(Math.hypot(disp[i].x, disp[i].z), 0.01);
      pos[i].x += (disp[i].x / d) * Math.min(d, temp);
      pos[i].z += (disp[i].z / d) * Math.min(d, temp);
    }
    temp = Math.max(0.05, temp * 0.985);
  }
  return fit(ids, pos);
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

// Centre on the origin; the longer side of the layout along x, scaled into WIDTH x DEPTH.
function fit(ids, pos) {
  const span = (axis) => Math.max(...pos.map((p) => p[axis])) - Math.min(...pos.map((p) => p[axis]));
  if (span('z') > span('x')) for (const p of pos) [p.x, p.z] = [p.z, p.x];
  const cx = (Math.max(...pos.map((p) => p.x)) + Math.min(...pos.map((p) => p.x))) / 2;
  const cz = (Math.max(...pos.map((p) => p.z)) + Math.min(...pos.map((p) => p.z))) / 2;
  const scale = Math.min(WIDTH / (span('x') || 1), DEPTH / (span('z') || 1));
  const round = (v) => Math.round(v * 100) / 100;
  return Object.fromEntries(ids.map((id, i) => [id, { x: round((pos[i].x - cx) * scale), z: round((pos[i].z - cz) * scale) }]));
}
