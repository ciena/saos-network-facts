// SPDX-License-Identifier: Apache-2.0
// Where devices go, computed from the facts so a consumer never authors or computes a layout: one
// layout shared by the 3D page, the 2D frames and the snapshot. Deterministic: the same devices and
// links give the same positions, whatever order they come in. Pure functions, no Node or DOM APIs.
//
// algorithm auto (the default):
//   1. The core: the IGP routers (P and PE); in a lab without an IGP router, the G.8032 ring members;
//      else the devices on the longest cycle. A plain box between two core devices (a line system or
//      a third-party router in the path) is core too.
//   2. A core with a cycle (a G.8032 ring, else the longest cycle of the core) is a ladder: the cycle
//      as a racetrack of a top and a bottom row, at the rotation and split that keep the other core
//      links (rungs) short and uncrossed and put the devices that face customers at the row ends.
//      Core devices off the cycle sit between the rows, under their placed neighbours.
//   3. A core without a cycle (a chain, a tree) is laid out in columns by hops from one end.
//   4. Everything else (CEs, hosts, plain boxes) hangs off its core neighbour, outward: off a row end
//      sideways, else up from the top row and down from the bottom row; a device behind it further out.
//   5. Islands (linked to nothing placed) go in a row underneath.
// aspect card: at most `max_columns` columns. A ladder too long for that runs round a rectangle that
// wide instead, a column layout wraps into bands, and outer devices hang above or below, never
// sideways, so a 10-device lab stays readable on a small card.
// Hints ({ NAME: [x, y] }, a diagram's authored positions) are used only when they place every device;
// partial hints are reported and the computed layout is used. algorithm force: the force-directed
// layout (Fruchterman and Reingold) the 3D page has always computed, hints ignored.
//
// Positions are in grid units: x columns to the right, y rows down, 1 apart (hung devices and caps
// sit at fractions). A renderer scales them to its own frame.

import type { Layout } from "./generated/view.ts";

/** A device to place. `role` as the 3D importer gives it: p and pe are the IGP routers. */
export interface LayoutNode {
  id: string;
  role?: string | null;
  /** A device without facts, drawn as a plain box. */
  plain?: boolean;
}

/** A link end: a device name, or an object naming it (`node` as the importer, `device` as a facts file's links[]). */
export type LayoutEnd = string | { node?: string; device?: string };

export interface LayoutLink {
  id?: string;
  a: LayoutEnd;
  b: LayoutEnd;
}

/** A G.8032 ring: its members (names or { node }) and its links (link ids, or pairs of device names). */
export interface LayoutRing {
  id?: string | number;
  name?: string | null;
  nodes: Array<string | { node: string }>;
  links?: Array<string | [string, string]>;
}

/** What the layout reads: devices, the links between them and the rings. The 3D importer's topology
 * (`{ nodes, links, rings }`) is one. */
export interface LayoutModel {
  nodes: LayoutNode[];
  links: LayoutLink[];
  rings?: LayoutRing[];
}

export interface Point {
  x: number;
  y: number;
}

export interface LayoutResult {
  /** Device name to position, in grid units (x right, y down). */
  positions: Record<string, Point>;
  /** What placed the devices: hints, force, ladder, rectangle, columns or none. */
  method: "hints" | "force" | "ladder" | "rectangle" | "columns" | "none";
  /** The same, said for a person (which ring or cycle the ladder runs on). */
  description: string;
  /** The core devices, sorted (auto only). */
  core: string[];
  /** Hints that could not be used, and why. */
  warnings: string[];
}

const CYCLE_SEARCH_LIMIT = 200000;
const COMBOS_LIMIT = 400;
const GAP = 0.6; // spacing between devices hung side by side
const CLEAR = 0.55; // closer than this on both axes is taken

/** Compares device names the way people number them (P2 before P10). */
export function compareNames(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

const round = (v: number) => Math.round(v * 100) / 100 + 0; // + 0: no -0
const endName = (e: LayoutEnd): string | undefined => (typeof e === "string" ? e : (e?.node ?? e?.device));

/** The layout of `model` for `layout` (a view's `layout`; every property optional). */
export function layoutFacts(model: LayoutModel, layout: Layout | null = {}): LayoutResult {
  const opts = layout ?? {};
  const algorithm = opts.algorithm ?? "auto";
  const ids = [...new Set(model.nodes.map((n) => n.id))].sort(compareNames);
  const warnings: string[] = [];
  const empty = (method: LayoutResult["method"]): LayoutResult => ({ positions: {}, method, description: "no devices", core: [], warnings });
  if (!ids.length) return empty("none");

  const known = new Set(ids);
  const adj = new Map(ids.map((id) => [id, new Set<string>()]));
  const raw: Array<[string, string]> = []; // every link, in the order given (the force layout's input)
  const linkEnds = new Map<string, [string, string]>();
  for (const l of model.links) {
    const a = endName(l.a);
    const b = endName(l.b);
    if (!a || !b || a === b || !known.has(a) || !known.has(b)) continue;
    if (l.id !== undefined) linkEnds.set(l.id, [a, b]);
    raw.push([a, b]);
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }

  if (algorithm === "force") {
    const order = [...new Set(model.nodes.map((n) => n.id))];
    return { positions: forceLayout(order, raw), method: "force", description: "force-directed layout of the links", core: [], warnings };
  }

  const hints = opts.hints ?? {};
  if (Object.keys(hints).length || algorithm === "hints") {
    const valid = (p: unknown) => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]);
    const missing = ids.filter((id) => !valid(hints[id]));
    if (!missing.length) return { positions: fromHints(ids, hints), method: "hints", description: "the hints, scaled", core: [], warnings };
    warnings.push(
      Object.keys(hints).length
        ? `layout hints place ${ids.length - missing.length} of ${ids.length} devices (none for ${missing.join(", ")}): the computed layout is used`
        : "layout algorithm hints without hints: the computed layout is used",
    );
  }

  const card = opts.aspect === "card";
  const maxColumns = Math.max(1, Math.floor(opts.max_columns ?? 6));
  return { ...autoLayout(model, ids, adj, linkEnds, card ? maxColumns : Infinity), warnings };
}

// ---- auto ----------------------------------------------------------------------------------------

function autoLayout(
  model: LayoutModel,
  ids: string[],
  adj: Map<string, Set<string>>,
  linkEnds: Map<string, [string, string]>,
  maxColumns: number,
): Omit<LayoutResult, "warnings"> {
  const card = Number.isFinite(maxColumns);
  const node = new Map(model.nodes.map((n) => [n.id, n]));
  const sorted = (s: Iterable<string>) => [...s].sort(compareNames);
  const rings = (model.rings ?? [])
    .map((r) => ({ ...r, members: sorted(new Set(r.nodes.map((m) => (typeof m === "string" ? m : m.node)).filter((m) => adj.has(m)))) }))
    .sort((p, q) => q.members.length - p.members.length || compareNames(String(p.name ?? p.id ?? ""), String(q.name ?? q.id ?? "")));

  let core = new Set(ids.filter((id) => node.get(id)?.role === "p" || node.get(id)?.role === "pe"));
  if (!core.size) core = new Set(rings.flatMap((r) => r.members));
  if (!core.size) core = new Set(longestCycle(ids, adj));
  for (const r of rings) for (const id of r.members) core.add(id);
  for (const id of ids) {
    if (!core.has(id) && node.get(id)?.plain && [...adj.get(id)!].filter((x) => core.has(x)).length >= 2) core.add(id);
  }

  const coreAdj = new Map([...core].map((id) => [id, new Set([...adj.get(id)!].filter((x) => core.has(x)))]));
  const ring = rings.find((r) => r.members.length >= 3 && r.members.every((id) => core.has(id)));
  const ordered = ring ? ringOrder(ring.members, ring.links ?? [], linkEnds) : null;
  const cycle = ordered ?? longestCycle(sorted(core), coreAdj);
  const external = new Set(sorted(core).filter((id) => [...adj.get(id)!].some((x) => !core.has(x))));
  const pes = new Set(ids.filter((id) => node.get(id)?.role === "pe"));

  let pos: Map<string, Point & { dir?: Point }>;
  let method: LayoutResult["method"];
  let description: string;
  if (cycle.length >= 3) {
    const on = ring && ordered ? `G.8032 ring ${ring.name ?? ring.id ?? ""}`.trim() : "the longest cycle";
    const fitted = ladder(cycle, coreAdj, external, pes, card ? maxColumns : Infinity);
    if (fitted) {
      pos = fitted;
      method = "ladder";
      description = `ladder on ${on}`;
    } else {
      pos = rectangle(cycle, coreAdj, maxColumns);
      method = "rectangle";
      description = `${on} round a rectangle ${maxColumns} columns wide`;
    }
    // Core devices off the cycle: between the rows, under their placed neighbours.
    const rest = sorted(core).filter((id) => !pos.has(id));
    const rows = [...pos.values()].map((p) => p.y);
    const midY = (Math.min(...rows) + Math.max(...rows)) / 2;
    for (let pass = 0; pass < 3 && rest.some((id) => !pos.has(id)); pass++) {
      for (const id of rest) {
        if (pos.has(id)) continue;
        const nb = sorted(coreAdj.get(id)!).filter((x) => pos.has(x)).map((x) => pos.get(x)!);
        if (!nb.length && pass < 2) continue;
        const x = nb.length ? nb.reduce((s, p) => s + p.x, 0) / nb.length : 0;
        pos.set(id, free(pos, { x, y: midY }, "x", bounds(pos, maxColumns)));
      }
    }
  } else if (core.size) {
    pos = columns(sorted(core), adj, core, maxColumns);
    method = "columns";
    description = "columns by hops (no cycle)";
  } else {
    pos = new Map();
    method = "none";
    description = "no core: a row of devices";
  }
  const placedCore = new Map(pos);

  // Outer devices, breadth first from the core.
  if (placedCore.size) {
    const xs = [...placedCore.values()].map((p) => p.x);
    const ys = [...placedCore.values()].map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const midY = (minY + maxY) / 2;
    const box = bounds(placedCore, maxColumns);
    const queue = sorted(ids.filter((id) => !pos.has(id) && [...adj.get(id)!].some((x) => pos.has(x))));
    const seen = new Set(queue);
    const fanout = new Map<string, number>(); // anchor -> devices already hung off it
    while (queue.length) {
      const id = queue.shift()!;
      const anchor = sorted(adj.get(id)!).find((x) => pos.has(x))!;
      const a = pos.get(anchor)!;
      let dir: Point;
      if (!placedCore.has(anchor)) dir = a.dir ?? { x: 0, y: 1 };
      else if (!card && a.x === minX && minX !== maxX) dir = { x: -1, y: 0 };
      else if (!card && a.x === maxX && minX !== maxX) dir = { x: 1, y: 0 };
      else if (a.y === minY && minY !== maxY) dir = { x: 0, y: -1 };
      else if (card && a.y < midY) dir = { x: 0, y: -1 };
      else dir = { x: 0, y: 1 };
      const k = fanout.get(anchor) ?? 0;
      fanout.set(anchor, k + 1);
      const spread = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * GAP;
      let want: Point = { x: a.x + dir.x * 0.9 + (dir.y ? spread : 0), y: a.y + dir.y + (dir.x ? spread : 0) };
      // On a card, a device hung off the core goes in the band above or below it, not between rows.
      if (card && placedCore.has(anchor)) want = { x: want.x, y: dir.y < 0 ? Math.min(want.y, minY - 1) : Math.max(want.y, maxY + 1) };
      const p = free(pos, want, dir.x ? "y" : "x", box, dir);
      pos.set(id, { ...p, dir });
      for (const nb of sorted(adj.get(id)!)) if (!pos.has(nb) && !seen.has(nb)) (seen.add(nb), queue.push(nb));
    }
  }

  // Islands: rows underneath (at most maxColumns wide on a card).
  const left = ids.filter((id) => !pos.has(id));
  if (left.length) {
    const xs = [...pos.values()].map((p) => p.x);
    const x0 = xs.length ? Math.min(...xs) : 0;
    const y0 = pos.size ? Math.max(...[...pos.values()].map((p) => p.y)) + 1.2 : 0;
    const width = Number.isFinite(maxColumns) ? maxColumns : left.length;
    left.forEach((id, i) => pos.set(id, { x: x0 + (i % width), y: y0 + Math.floor(i / width) }));
  }

  const positions: Record<string, Point> = {};
  for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
  return { positions: normalise(positions), method, description, core: sorted(core) };
}

// The x range a card allows (maxColumns wide from the core's left edge); unbounded otherwise.
function bounds(pos: Map<string, Point>, maxColumns: number): { minX: number; maxX: number } | null {
  if (!Number.isFinite(maxColumns) || !pos.size) return null;
  const minX = Math.min(...[...pos.values()].map((p) => p.x));
  return { minX, maxX: minX + maxColumns - 1 };
}

// The nearest free spot to `want`, stepping along `axis` (GAP apart), inside `box` when given. When a
// line has no room, the next line out (along `out`) is tried.
function free(pos: Map<string, Point>, want: Point, axis: "x" | "y", box: { minX: number; maxX: number } | null = null, out: Point = { x: 0, y: 1 }): Point {
  const taken = (p: Point) => [...pos.values()].some((q) => Math.abs(q.x - p.x) < CLEAR && Math.abs(q.y - p.y) < CLEAR);
  const inside = (p: Point) => !box || (p.x >= box.minX - 1e-9 && p.x <= box.maxX + 1e-9);
  const start = box ? { ...want, x: Math.min(Math.max(want.x, box.minX), box.maxX) } : want;
  for (let line = 0; line < 50; line++) {
    const base = { x: start.x + (axis === "y" ? out.x * line : 0), y: start.y + (axis === "x" ? (out.y || 1) * line : 0) };
    for (let i = 0; i < 40; i++) {
      const d = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * GAP;
      const p = { x: base.x + (axis === "x" ? d : 0), y: base.y + (axis === "y" ? d : 0) };
      if (inside(p) && !taken(p)) return p;
    }
  }
  return start;
}

// Shifts the layout so its top left corner is at 0, 0.
function normalise(positions: Record<string, Point>): Record<string, Point> {
  const pts = Object.values(positions);
  const minX = Math.min(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  for (const p of pts) [p.x, p.y] = [round(p.x - minX), round(p.y - minY)];
  return positions;
}

// A ring's members in ring order, from its links (ids or pairs); null when they do not close a cycle.
function ringOrder(members: string[], links: Array<string | [string, string]>, linkEnds: Map<string, [string, string]>): string[] | null {
  const nb = new Map(members.map((n) => [n, [] as string[]]));
  for (const l of links) {
    const ends = typeof l === "string" ? linkEnds.get(l) : l;
    if (!ends) continue;
    const [a, b] = ends;
    if (nb.has(a) && nb.has(b) && a !== b) (nb.get(a)!.push(b), nb.get(b)!.push(a));
  }
  const start = members[0]!;
  const order = [start];
  let prev: string | null = null;
  let cur = start;
  for (let i = 0; i < members.length; i++) {
    const next: string | undefined = nb.get(cur)!.filter((x) => x !== prev && !order.includes(x)).sort(compareNames)[0];
    if (!next) break;
    order.push(next);
    [prev, cur] = [cur, next];
  }
  const closes = order.length === members.length && nb.get(cur)!.includes(start);
  return closes && order.length >= 3 ? order : null;
}

/** The longest simple cycle among `ids` (a bounded search: labs are small), starting at its smallest name. */
export function longestCycle(ids: string[], adj: Map<string, Set<string>>): string[] {
  let best: string[] = [];
  let steps = 0;
  const order = [...ids].sort(compareNames);
  const within = new Set(order);
  for (const start of order) {
    const path = [start];
    const on = new Set(path);
    const dfs = (cur: string) => {
      if (++steps > CYCLE_SEARCH_LIMIT) return;
      for (const nx of [...(adj.get(cur) ?? [])].filter((x) => within.has(x)).sort(compareNames)) {
        if (nx === start && path.length >= 3 && path.length > best.length) best = [...path];
        if (on.has(nx) || compareNames(nx, start) < 0) continue;
        path.push(nx);
        on.add(nx);
        dfs(nx);
        path.pop();
        on.delete(nx);
      }
    };
    dfs(start);
    if (best.length === order.length) break;
  }
  return best;
}

type Chord = [string, string];

// The core links between cycle members that are not cycle edges (the rungs).
function chordsOf(cycle: string[], adj: Map<string, Set<string>>): Chord[] {
  const m = cycle.length;
  const index = new Map(cycle.map((id, i) => [id, i]));
  const chords: Chord[] = [];
  for (const a of cycle) {
    for (const b of [...adj.get(a)!].sort(compareNames)) {
      if (compareNames(a, b) >= 0 || !index.has(b)) continue;
      const d = Math.abs(index.get(a)! - index.get(b)!);
      if (d !== 1 && d !== m - 1) chords.push([a, b]);
    }
  }
  return chords;
}

// Rungs short and uncrossed, cycle edges short (no long diagonal closing the track).
function chordCost(pos: Map<string, Point>, cycle: string[], chords: Chord[]): number {
  let cost = 0;
  for (const [a, b] of chords) {
    const p = pos.get(a)!, q = pos.get(b)!;
    cost += Math.abs(p.x - q.x) + Math.abs(p.y - q.y) * 0.5 + (p.y === q.y ? 2.5 : 0) + (p.x === q.x && Math.abs(p.y - q.y) > 1 ? 2.5 : 0);
  }
  for (let i = 0; i < chords.length; i++) for (let j = i + 1; j < chords.length; j++) if (crosses(pos, chords[i]!, chords[j]!)) cost += 1.5;
  const m = cycle.length;
  for (let i = 0; i < m; i++) {
    const p = pos.get(cycle[i]!)!, q = pos.get(cycle[(i + 1) % m]!)!;
    cost += Math.max(0, Math.hypot(p.x - q.x, p.y - q.y) - 1.2) * 0.8;
  }
  return cost;
}

// The cycle as a racetrack: an optional cap device at each end (half way between the rows), a top
// row and a bottom row on whole columns. Every rotation, cap choice, split and column choice for the
// shorter row is scored (chordCost, less a bonus for devices facing customers, or PEs, at the ends);
// the cheapest wins, the first found on a tie. Only racetracks at most `maxColumns` wide are
// considered; null when none is.
function ladder(cycle: string[], adj: Map<string, Set<string>>, external: Set<string>, edgeRole: Set<string>, maxColumns: number): Map<string, Point> | null {
  const m = cycle.length;
  const chords = chordsOf(cycle, adj);
  let best: { cost: number; pos: Map<string, Point> } | null = null;
  for (let r = 0; r < m; r++) {
    const rot = [...cycle.slice(r), ...cycle.slice(0, r)];
    for (const capL of [0, 1]) {
      for (const capR of [0, 1]) {
        const rest = m - capL - capR;
        if (rest < 2) continue;
        for (let k = Math.max(1, Math.floor(rest / 2) - 1); k <= Math.min(rest - 1, Math.ceil(rest / 2) + 1); k++) {
          const left = capL ? rot[0]! : null;
          const top = rot.slice(capL, capL + k);
          const right = capR ? rot[capL + k]! : null;
          const bot = rot.slice(capL + k + capR).reverse();
          const w = Math.max(top.length, bot.length) - 1;
          // Caps sit 0.8 out: on a card each takes a column of its own.
          if (w + 1 + capL + capR > maxColumns) continue;
          const longRow = top.length >= bot.length ? top : bot;
          const shortRow = longRow === top ? bot : top;
          for (const cols of combos(w + 1, shortRow.length)) {
            const pos = new Map<string, Point>();
            longRow.forEach((id, i) => pos.set(id, { x: i, y: longRow === top ? 0 : 1 }));
            shortRow.forEach((id, i) => pos.set(id, { x: cols[i]!, y: shortRow === top ? 0 : 1 }));
            if (left) pos.set(left, { x: -0.8, y: 0.5 });
            if (right) pos.set(right, { x: w + 0.8, y: 0.5 });
            const ends = capL || capR ? [left, right].filter((x): x is string => !!x) : [top[0], top.at(-1), bot[0], bot.at(-1)].filter((x): x is string => !!x);
            let cost = chordCost(pos, cycle, chords);
            for (const id of new Set(ends)) cost -= external.has(id) ? 0.6 : edgeRole.has(id) ? 0.25 : 0;
            if (!best || cost < best.cost - 1e-9) best = { cost, pos };
          }
        }
      }
    }
  }
  return best?.pos ?? null;
}

// The cycle round a rectangle `width` columns wide (for a card, when a racetrack is too wide): a top
// row left to right, down the right side, the bottom row right to left, up the left side. Every
// rotation is scored by chordCost; the first cheapest wins.
function rectangle(cycle: string[], adj: Map<string, Set<string>>, width: number): Map<string, Point> {
  const m = cycle.length;
  const w = Math.max(2, Math.min(width, Math.ceil(m / 2)));
  const sides = Math.max(0, m - 2 * w);
  const rightN = Math.ceil(sides / 2);
  const leftN = sides - rightN;
  const h = Math.max(rightN, leftN) + 2; // rows
  const slots = (n: number) => Array.from({ length: n }, (_, i) => (n === h - 2 ? 1 + i : 1 + ((i + 0.5) * (h - 2)) / n - 0.5));
  const places: Point[] = [];
  for (let x = 0; x < w; x++) places.push({ x, y: 0 });
  for (const y of slots(rightN)) places.push({ x: w - 1, y });
  for (let x = w - 1; x >= 0; x--) places.push({ x, y: h - 1 });
  for (const y of slots(leftN).reverse()) places.push({ x: 0, y });
  const chords = chordsOf(cycle, adj);
  let best: { cost: number; pos: Map<string, Point> } | null = null;
  for (let r = 0; r < m; r++) {
    const pos = new Map<string, Point>();
    for (let i = 0; i < m; i++) pos.set(cycle[(i + r) % m]!, { ...places[i]! });
    const cost = chordCost(pos, cycle, chords);
    if (!best || cost < best.cost - 1e-9) best = { cost, pos };
  }
  return best!.pos;
}

// Increasing choices of `k` columns out of `n` (capped for big rows).
function combos(n: number, k: number): number[][] {
  const out: number[][] = [];
  const rec = (start: number, acc: number[]) => {
    if (out.length > COMBOS_LIMIT) return;
    if (acc.length === k) return void out.push([...acc]);
    for (let i = start; i <= n - (k - acc.length); i++) rec(i + 1, [...acc, i]);
  };
  rec(0, []);
  return out;
}

function crosses(pos: Map<string, Point>, [a, b]: Chord, [c, d]: Chord): boolean {
  if (new Set([a, b, c, d]).size < 4) return false;
  const [p1, p2, p3, p4] = [a, b, c, d].map((id) => pos.get(id)!) as [Point, Point, Point, Point];
  const o = (p: Point, q: Point, r: Point) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0;
}

// Columns by hops from one end of the longest shortest path; rows by name within a column. On a card,
// columns past `maxColumns` wrap into a band underneath, running back (a snake), so the chain stays joined.
function columns(ids: string[], adj: Map<string, Set<string>>, within: Set<string>, maxColumns: number): Map<string, Point> {
  const bfs = (s: string) => {
    const d = new Map([[s, 0]]);
    const q = [s];
    while (q.length) {
      const c = q.shift()!;
      for (const n of [...adj.get(c)!].sort(compareNames)) if (within.has(n) && !d.has(n)) (d.set(n, d.get(c)! + 1), q.push(n));
    }
    return d;
  };
  const far = (d: Map<string, number>) => [...d.entries()].sort((x, y) => y[1] - x[1] || compareNames(x[0], y[0]))[0]![0];
  const depth = new Map<string, number>();
  let offset = 0;
  // Each connected piece of the core in turn, left to right.
  for (const id of ids) {
    if (depth.has(id)) continue;
    const end = far(bfs(far(bfs(id))));
    const d = bfs(end);
    let deepest = 0;
    for (const [n, c] of d) (depth.set(n, offset + c), (deepest = Math.max(deepest, c)));
    offset += deepest + 1;
  }
  const byColumn = new Map<number, string[]>();
  for (const id of ids) byColumn.set(depth.get(id)!, [...(byColumn.get(depth.get(id)!) ?? []), id]);
  const tallest = Math.max(...[...byColumn.values()].map((l) => l.length));
  const pos = new Map<string, Point>();
  for (const [c, list] of byColumn) {
    const band = Number.isFinite(maxColumns) ? Math.floor(c / maxColumns) : 0;
    const inBand = Number.isFinite(maxColumns) ? c % maxColumns : c;
    const x = band % 2 ? maxColumns - 1 - inBand : inBand;
    list.forEach((id, i) => pos.set(id, { x, y: band * (tallest + 1) + i - (list.length - 1) / 2 + (tallest - 1) / 2 }));
  }
  return pos;
}

// Authored positions (any unit, y down) scaled so the closest two devices are about 1 apart.
function fromHints(ids: string[], hints: Record<string, unknown>): Record<string, Point> {
  const pts = ids.map((id) => (hints[id] as number[]).map(Number) as [number, number]);
  let unit = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
      if (d > 0) unit = Math.min(unit, d);
    }
  }
  if (!Number.isFinite(unit)) unit = 1;
  const positions: Record<string, Point> = {};
  ids.forEach((id, i) => (positions[id] = { x: pts[i]![0] / unit, y: pts[i]![1] / unit }));
  return normalise(positions);
}

// ---- force ---------------------------------------------------------------------------------------

/** A force-directed layout (Fruchterman and Reingold, "Graph Drawing by Force-directed Placement",
 * 1991) from a fixed start on a circle, in units of the ideal link length: the 3D page's layout before
 * the auto layout. `ids` in the order given (the start circle follows it). */
export function forceLayout(ids: string[], edges: Array<[string, string]>): Record<string, Point> {
  const n = ids.length;
  if (!n) return {};
  const index = new Map(ids.map((id, i) => [id, i]));
  const links = edges.map(([a, b]) => [index.get(a), index.get(b)]).filter((p): p is [number, number] => p[0] !== undefined && p[1] !== undefined && p[0] !== p[1]);
  const pos = ids.map((_, i) => ({ x: Math.cos((2 * Math.PI * i) / n) * 10, y: Math.sin((2 * Math.PI * i) / n) * 10 }));
  const k = Math.sqrt(400 / n); // ideal link length for a 20 x 20 frame
  let temp = 5;
  for (let it = 0; it < 400; it++) {
    const disp = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i]!.x - pos[j]!.x;
        const dy = pos[i]!.y - pos[j]!.y;
        const d = Math.max(Math.hypot(dx, dy), 0.01);
        const f = (k * k) / d; // repulsion between every pair
        disp[i]!.x += (dx / d) * f;
        disp[i]!.y += (dy / d) * f;
        disp[j]!.x -= (dx / d) * f;
        disp[j]!.y -= (dy / d) * f;
      }
    }
    for (const [a, b] of links) {
      const dx = pos[a]!.x - pos[b]!.x;
      const dy = pos[a]!.y - pos[b]!.y;
      const d = Math.max(Math.hypot(dx, dy), 0.01);
      const f = (d * d) / k; // attraction along every link
      disp[a]!.x -= (dx / d) * f;
      disp[a]!.y -= (dy / d) * f;
      disp[b]!.x += (dx / d) * f;
      disp[b]!.y += (dy / d) * f;
    }
    for (let i = 0; i < n; i++) {
      const d = Math.max(Math.hypot(disp[i]!.x, disp[i]!.y), 0.01);
      pos[i]!.x += (disp[i]!.x / d) * Math.min(d, temp);
      pos[i]!.y += (disp[i]!.y / d) * Math.min(d, temp);
    }
    temp = Math.max(0.05, temp * 0.985);
  }
  const positions: Record<string, Point> = {};
  ids.forEach((id, i) => (positions[id] = { x: Math.round((pos[i]!.x / k) * 1000) / 1000 + 0, y: Math.round((pos[i]!.y / k) * 1000) / 1000 + 0 }));
  return positions;
}
