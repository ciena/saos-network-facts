// SPDX-License-Identifier: Apache-2.0
// Where devices go, computed from the facts so a consumer never authors or computes a layout: one
// layout shared by the 3D page, the 2D frames and the snapshot. Deterministic: the same devices and
// links give the same positions, whatever order they come in. Pure functions, no Node or DOM APIs.
//
// algorithm auto (the default):
//   1. The core: the IGP routers (P and PE); in a lab without an IGP router, the G.8032 ring members;
//      else the devices on the longest cycle; else (a chain or a tree) the devices that link others.
//      A plain box between two core devices (a line system or a third-party router in the path) is
//      core too, and so is a second cycle linked to the core (routers without an IGP, such as MPLS-TP
//      nodes, on a ring of their own). Linux hosts never are.
//   2. A core with a cycle (a G.8032 ring, else the longest cycle of the core) is a ladder: the cycle
//      as a racetrack of a top and a bottom row, at the rotation and split that keep the other core
//      links (rungs) short, uncrossed and clear of devices, and put the devices that face customers at
//      the row ends. Core devices off the cycle sit between the rows, under their placed neighbours.
//   3. A core without a cycle is laid out in columns by hops from one end, rows ordered by their
//      neighbours in the column before.
//   4. Everything else (CEs, hosts, plain boxes) hangs off its core neighbour, outward: off a row end
//      sideways, else up from the top row and down from the bottom row; a device behind it further out;
//      a device linked to two or more placed devices (dual-homed) between them.
//   5. No device is put on a link, nor where its own links would run through a device; a spot whose
//      links cross none is preferred. A last pass swaps devices, or moves one to a spare spot, while
//      that removes crossings or links through devices (the cycle's devices stay put).
//   6. Islands (linked to nothing placed) go in a row underneath.
// aspect card: at most `max_columns` columns. A ladder too long for that runs round a rectangle that
// wide instead (its row lengths, sides and rotation chosen like the ladder's), a column layout wraps
// into bands, and outer devices hang above or below, never sideways, so a 10-device lab stays readable
// on a small card.
// Hints ({ NAME: [x, y] }, a diagram's authored positions) are used when they place every device: a
// device without a hint of its own takes the hint of the name it extends (NAME for NAME-O-1, NAME-T-2:
// a diagram that draws one box for a line system the facts list shelf by shelf), and plain boxes still
// without one go beside their neighbours. Otherwise they are reported and the computed layout is used.
// algorithm force: the force-directed layout (Fruchterman and Reingold) the 3D page has always computed,
// hints ignored.
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
  /** A Linux host: never part of the core. */
  host?: boolean;
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
const CLEAR = 0.55; // closer than this on both axes is taken (grid spots)
const SPACE = 0.6; // no device nearer than this to another
const CROSSING = 4; // the cost of two core links crossing, in grid units of link length
const THROUGH = 6; // the cost of a core link running through a device

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
    const authored = hintLayout(model, ids, adj, hints);
    if (authored.positions) return { positions: authored.positions, method: "hints", description: authored.description, core: [], warnings };
    warnings.push(
      Object.keys(hints).length
        ? `layout hints place ${ids.length - authored.missing.length} of ${ids.length} devices (none for ${authored.missing.join(", ")}): the computed layout is used`
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
  const edges = edgeList(ids, adj);
  const rings = (model.rings ?? [])
    .map((r) => ({ ...r, members: sorted(new Set(r.nodes.map((m) => (typeof m === "string" ? m : m.node)).filter((m) => adj.has(m)))) }))
    .sort((p, q) => q.members.length - p.members.length || compareNames(String(p.name ?? p.id ?? ""), String(q.name ?? q.id ?? "")));

  let transit = false;
  let core = new Set(ids.filter((id) => node.get(id)?.role === "p" || node.get(id)?.role === "pe"));
  if (!core.size) core = new Set(rings.flatMap((r) => r.members));
  if (!core.size) core = new Set(longestCycle(ids, adj));
  if (!core.size) {
    // No router, ring or cycle: the devices that link others (the chain or tree's inner devices),
    // else every linked device; laid out in columns by hops.
    const linked = ids.filter((id) => adj.get(id)!.size && !node.get(id)?.host);
    const inner = linked.filter((id) => adj.get(id)!.size >= 2);
    core = new Set(inner.length >= 2 ? inner : linked);
    transit = core.size > 0;
  }
  for (const r of rings) for (const id of r.members) core.add(id);
  for (const id of ids) {
    if (!core.has(id) && node.get(id)?.plain && [...adj.get(id)!].filter((x) => core.has(x)).length >= 2) core.add(id);
  }
  // A second cycle linked to the core (routers without an IGP, such as MPLS-TP nodes, on a ring of
  // their own) joins it, so it is laid out with the core instead of hung off it.
  for (let grown = core.size > 0; grown; ) {
    grown = false;
    const rest = ids.filter((id) => !core.has(id) && !node.get(id)?.host);
    const restSet = new Set(rest);
    const restAdj = new Map(rest.map((id) => [id, new Set([...adj.get(id)!].filter((x) => restSet.has(x)))]));
    for (const piece of components(rest, restAdj)) {
      if (!piece.some((id) => [...adj.get(id)!].some((x) => core.has(x)))) continue;
      const cyc = longestCycle(piece, restAdj);
      if (cyc.length >= 3) {
        for (const id of cyc) core.add(id);
        grown = true;
      }
    }
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
        pos.set(id, free(pos, edges, { x, y: midY }, "x", bounds(pos, maxColumns), { x: 0, y: 1 }, nb));
      }
    }
    pos = untangle(pos, coreAdj);
  } else if (core.size) {
    pos = untangle(columns(sorted(core), adj, core, maxColumns), coreAdj);
    method = "columns";
    description = transit ? "columns by hops (no router, ring or cycle)" : "columns by hops (no cycle)";
  } else {
    pos = new Map();
    method = "none";
    description = "no links: a row of devices";
  }
  const placedCore = new Map(pos);

  // Outer devices, breadth first from the core.
  if (placedCore.size) {
    const xs = [...placedCore.values()].map((p) => p.x);
    const ys = [...placedCore.values()].map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const midY = (minY + maxY) / 2;
    const box = bounds(placedCore, maxColumns);
    const coreBox = { minX, maxX, minY, maxY };
    // Outward from a placed device: off a core row end sideways (not on a card), up from the top
    // row, down from the bottom row; from an outer device, the way it was hung.
    const outward = (anchor: string): Point => {
      const a = pos.get(anchor)!;
      if (!placedCore.has(anchor)) return a.dir ?? { x: 0, y: 1 };
      if (!card && a.x === minX && minX !== maxX) return { x: -1, y: 0 };
      if (!card && a.x === maxX && minX !== maxX) return { x: 1, y: 0 };
      if (a.y === minY && minY !== maxY) return { x: 0, y: -1 };
      if (card && a.y < midY) return { x: 0, y: -1 };
      return { x: 0, y: 1 };
    };
    const queue = sorted(ids.filter((id) => !pos.has(id) && [...adj.get(id)!].some((x) => pos.has(x))));
    const seen = new Set(queue);
    const fanout = new Map<string, number>(); // anchor -> devices already hung off it
    while (queue.length) {
      const id = queue.shift()!;
      const anchors = sorted(adj.get(id)!).filter((x) => pos.has(x));
      const mine = anchors.map((x) => pos.get(x)!);
      let want: Point;
      let dir: Point;
      if (anchors.length >= 2) {
        // Linked to two or more placed devices (dual-homed): between them, outward when they agree.
        const dirs = anchors.map(outward);
        const agree = dirs.every((d) => d.x === dirs[0]!.x && d.y === dirs[0]!.y);
        dir = agree ? dirs[0]! : { x: 0, y: 0 };
        const c = { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
        want = agree ? { x: c.x + dir.x * 0.9, y: c.y + dir.y } : c;
      } else {
        const anchor = anchors[0]!;
        const a = pos.get(anchor)!;
        dir = outward(anchor);
        const k = fanout.get(anchor) ?? 0;
        fanout.set(anchor, k + 1);
        const spread = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * GAP;
        want = { x: a.x + dir.x * 0.9 + (dir.y ? spread : 0), y: a.y + dir.y + (dir.x ? spread : 0) };
      }
      // On a card, a device hung off the core goes in the band above or below it, not between rows
      // (unless its neighbours face different ways: then it sits between them).
      if (card && anchors.every((x) => placedCore.has(x)) && dir.y) want = { x: want.x, y: dir.y < 0 ? Math.min(want.y, minY - 1) : Math.max(want.y, maxY + 1) };
      const p = free(pos, edges, want, dir.x ? "y" : "x", box, dir.x || dir.y ? dir : { x: 0, y: 1 }, mine, coreBox);
      pos.set(id, { ...p, dir: dir.x || dir.y ? dir : { x: 0, y: 1 } });
      for (const nb of sorted(adj.get(id)!)) if (!pos.has(nb) && !seen.has(nb)) (seen.add(nb), queue.push(nb));
    }
  }

  // Last, the devices off the cycle (or off the core, without one) are untangled among everything placed.
  const fixed = new Set(cycle.length >= 3 ? cycle : core);
  if (pos.size > fixed.size) pos = untangle(pos, adj, new Set([...pos.keys()].filter((id) => !fixed.has(id))));

  // Islands: rows underneath (at most maxColumns wide on a card).
  islands(ids, pos, maxColumns);

  const positions: Record<string, Point> = {};
  for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
  return { positions: normalise(positions), method, description, core: sorted(core) };
}

// Devices linked to nothing placed: rows underneath (at most maxColumns wide).
function islands(ids: string[], pos: Map<string, Point>, maxColumns: number) {
  const left = ids.filter((id) => !pos.has(id));
  if (!left.length) return;
  const xs = [...pos.values()].map((p) => p.x);
  const x0 = xs.length ? Math.min(...xs) : 0;
  const y0 = pos.size ? Math.max(...[...pos.values()].map((p) => p.y)) + 1.2 : 0;
  const width = Number.isFinite(maxColumns) ? maxColumns : left.length;
  left.forEach((id, i) => pos.set(id, { x: x0 + (i % width), y: y0 + Math.floor(i / width) }));
}

// Every link once, as a sorted pair.
function edgeList(ids: string[], adj: Map<string, Set<string>>): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const a of ids) for (const b of [...adj.get(a)!].sort(compareNames)) if (compareNames(a, b) < 0) out.push([a, b]);
  return out;
}

// The connected pieces of `ids` under `adj`, each sorted, in order of their first name.
function components(ids: string[], adj: Map<string, Set<string>>): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const id of [...ids].sort(compareNames)) {
    if (seen.has(id)) continue;
    const piece: string[] = [];
    const stack = [id];
    seen.add(id);
    while (stack.length) {
      const c = stack.pop()!;
      piece.push(c);
      for (const n of adj.get(c) ?? []) if (!seen.has(n)) (seen.add(n), stack.push(n));
    }
    out.push(piece.sort(compareNames));
  }
  return out;
}

// The x range a card allows (maxColumns wide from the core's left edge); unbounded otherwise.
function bounds(pos: Map<string, Point>, maxColumns: number): { minX: number; maxX: number } | null {
  if (!Number.isFinite(maxColumns) || !pos.size) return null;
  const minX = Math.min(...[...pos.values()].map((p) => p.x));
  return { minX, maxX: minX + maxColumns - 1 };
}

const NEAR = 0.2; // a device closer than this to a link (not at its ends) is on it

// Distance from p to the segment a-b, and where along it (0 at a, 1 at b).
function segmentDistance(p: Point, a: Point, b: Point): { d: number; t: number } {
  const dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0;
  return { d: Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy), t };
}
const onLink = (p: Point, a: Point, b: Point) => {
  const { d, t } = segmentDistance(p, a, b);
  return d < NEAR && t > 0.01 && t < 0.99;
};
const segmentsCross = (p1: Point, p2: Point, p3: Point, p4: Point) => {
  const o = (p: Point, q: Point, r: Point) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0;
};

// The nearest free spot to `want`, inside `box` when given. A spot is free when no device is within
// SPACE of it, it is not on a link between placed devices, and its own links (to the placed devices
// `mine`) run through no device. Nearby spots (a 0.3 grid round `want`, nearest first, a spot inside
// `inner` (the core's box) counting as further) are tried first with no link of its own crossing a
// placed one, then allowing crossings; failing both, the first spot without a device stepping along
// `axis` (GAP apart), line by line outward along `out`.
function free(
  pos: Map<string, Point>,
  edges: Array<[string, string]>,
  want: Point,
  axis: "x" | "y",
  box: { minX: number; maxX: number } | null = null,
  out: Point = { x: 0, y: 1 },
  mine: Point[] = [],
  inner: { minX: number; maxX: number; minY: number; maxY: number } | null = null,
): Point {
  const placed = [...pos.values()];
  const links = edges.filter(([a, b]) => pos.has(a) && pos.has(b)).map(([a, b]) => [pos.get(a)!, pos.get(b)!] as const);
  const taken = (p: Point) => placed.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < SPACE);
  const onAny = (p: Point) => links.some(([a, b]) => onLink(p, a, b)) || mine.some((q) => placed.some((r) => r !== q && onLink(r, p, q)));
  const crossing = (p: Point) => mine.some((q) => links.some(([a, b]) => a !== q && b !== q && segmentsCross(p, q, a, b)));
  const inside = (p: Point) => !box || (p.x >= box.minX - 1e-9 && p.x <= box.maxX + 1e-9);
  const start = box ? { ...want, x: Math.min(Math.max(want.x, box.minX), box.maxX) } : want;
  const within = (p: Point) => !!inner && p.x > inner.minX + 1e-9 && p.x < inner.maxX - 1e-9 && p.y > inner.minY + 1e-9 && p.y < inner.maxY - 1e-9;
  const near: Array<{ p: Point; d: number }> = [];
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      const p = { x: round(start.x + i * 0.3), y: round(start.y + j * 0.3) };
      const d = Math.hypot(i, j) * 0.3;
      if (d <= 3 + 1e-9 && inside(p)) near.push({ p, d: d + (within(p) ? 1 : 0) });
    }
  }
  near.sort((u, v) => u.d - v.d || u.p.y - v.p.y || u.p.x - v.p.x);
  for (const ok of [(p: Point) => !onAny(p) && !crossing(p), (p: Point) => !onAny(p)]) {
    for (const { p } of near) if (!taken(p) && ok(p)) return p;
  }
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

// Rungs short and uncrossed, cycle edges short (no long diagonal closing the track), no core link
// crossing another or running through a device.
function chordCost(pos: Map<string, Point>, cycle: string[], chords: Chord[]): number {
  let cost = 0;
  for (const [a, b] of chords) {
    const p = pos.get(a)!, q = pos.get(b)!;
    cost += Math.abs(p.x - q.x) + Math.abs(p.y - q.y) * 0.5 + (p.y === q.y ? 2.5 : 0) + (p.x === q.x && Math.abs(p.y - q.y) > 1 ? 2.5 : 0);
  }
  const m = cycle.length;
  const ring: Chord[] = cycle.map((id, i) => [id, cycle[(i + 1) % m]!]);
  for (const [a, b] of ring) {
    const p = pos.get(a)!, q = pos.get(b)!;
    cost += Math.max(0, Math.hypot(p.x - q.x, p.y - q.y) - 1.2) * 0.8;
  }
  const all = [...chords, ...ring];
  for (let i = 0; i < chords.length; i++) for (let j = i + 1; j < all.length; j++) if (crosses(pos, all[i]!, all[j]!)) cost += CROSSING;
  const pts = [...pos.entries()];
  for (const [a, b] of all) {
    const p = pos.get(a)!, q = pos.get(b)!;
    for (const [id, r] of pts) if (id !== a && id !== b && onLink(r, p, q)) cost += THROUGH;
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

// The cycle round a rectangle at most `width` columns wide (for a card, when a racetrack is too wide):
// a top row left to right, down the right side, the bottom row right to left, up the left side. Every
// split (top and bottom row lengths, devices on each side) and rotation is scored by chordCost, plus a
// little per row so the rectangle stays low; the first cheapest wins. A shorter row spreads to the corners.
function rectangle(cycle: string[], adj: Map<string, Set<string>>, width: number): Map<string, Point> {
  const m = cycle.length;
  const chords = chordsOf(cycle, adj);
  const spread = (n: number, w: number) => Array.from({ length: n }, (_, i) => (n === 1 ? 0 : (i * (w - 1)) / (n - 1)));
  let best: { cost: number; pos: Map<string, Point> } | null = null;
  const most = Math.max(2, Math.min(width, m - 2));
  for (let top = 2; top <= most; top++) {
    for (let bottom = 2; bottom <= most; bottom++) {
      const sides = m - top - bottom;
      if (sides < 0) continue;
      for (let rightN = Math.floor(sides / 2); rightN <= Math.ceil(sides / 2); rightN++) {
        const leftN = sides - rightN;
        const w = Math.max(top, bottom);
        const h = Math.max(rightN, leftN) + 2; // rows
        const slots = (n: number) => Array.from({ length: n }, (_, i) => (n === h - 2 ? 1 + i : 1 + ((i + 0.5) * (h - 2)) / n - 0.5));
        const places: Point[] = [];
        for (const x of spread(top, w)) places.push({ x, y: 0 });
        for (const y of slots(rightN)) places.push({ x: w - 1, y });
        for (const x of spread(bottom, w).reverse()) places.push({ x, y: h - 1 });
        for (const y of slots(leftN).reverse()) places.push({ x: 0, y });
        for (let r = 0; r < m; r++) {
          const pos = new Map<string, Point>();
          for (let i = 0; i < m; i++) pos.set(cycle[(i + r) % m]!, { ...places[i]! });
          const cost = chordCost(pos, cycle, chords) + 0.3 * h;
          if (!best || cost < best.cost - 1e-9) best = { cost, pos };
        }
      }
    }
  }
  return best!.pos;
}

// Untangles placed devices: swaps two of the `movable` ones, or moves one to a spare spot in the
// layout's box, while that lowers the crossings and links through devices among the links between
// placed devices (a move that only shortens links is not taken, so the ladder's choices stand).
// Deterministic: moves are tried in name and grid order, the first improvement taken, until none
// helps (bounded).
function untangle(pos: Map<string, Point>, adj: Map<string, Set<string>>, movable: Set<string> = new Set(pos.keys())): Map<string, Point> {
  const ids = [...pos.keys()].sort(compareNames);
  const free = ids.filter((id) => movable.has(id));
  const edges = edgeList(ids, new Map(ids.map((id) => [id, new Set([...adj.get(id)!].filter((x) => pos.has(x)))])));
  const penalty = (at: Map<string, Point>) => {
    let n = 0;
    for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) if (crosses(at, edges[i]!, edges[j]!)) n += CROSSING;
    for (const [a, b] of edges) for (const id of ids) if (id !== a && id !== b && onLink(at.get(id)!, at.get(a)!, at.get(b)!)) n += THROUGH;
    return n;
  };
  let cur = penalty(pos);
  if (!cur) return pos;
  const xs = [...pos.values()].map((p) => p.x), ys = [...pos.values()].map((p) => p.y);
  // Spare spots: a half-step grid aligned with the layout's corner, half a row beyond it above and below.
  const grid: Point[] = [];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (let y = y0 - 0.5; y <= y1 + 0.5 + 1e-9; y += 0.5) for (let x = x0; x <= x1 + 1e-9; x += 0.5) grid.push({ x: round(x), y: round(y) });
  // Spots `id` could move to: none of the other devices within SPACE.
  const spare = (id: string) => grid.filter((g) => ![...pos].some(([o, p]) => o !== id && Math.hypot(p.x - g.x, p.y - g.y) < SPACE));
  for (let pass = 0; pass < 60 && cur > 0; pass++) {
    let better = false;
    const moves: Array<() => Map<string, Point>> = [];
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        moves.push(() => new Map(pos).set(free[i]!, pos.get(free[j]!)!).set(free[j]!, pos.get(free[i]!)!));
      }
      for (const g of spare(free[i]!)) moves.push(() => new Map(pos).set(free[i]!, g));
    }
    for (const move of moves) {
      const next = move();
      const cost = penalty(next);
      if (cost < cur - 1e-9) {
        for (const [id, p] of next) pos.set(id, p);
        cur = cost;
        better = true;
        break;
      }
    }
    if (!better) break;
  }
  return pos;
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

// Columns by hops from one end of the longest shortest path; within a column, rows in the order of
// their neighbours in the column before (by name on a tie), so links do not cross. On a card,
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
  const row = new Map<string, number>();
  for (const c of [...byColumn.keys()].sort((x, y) => x - y)) {
    const list = byColumn.get(c)!;
    const centre = (id: string) => {
      const prev = [...adj.get(id)!].filter((n) => depth.get(n) === c - 1 && row.has(n)).map((n) => row.get(n)!);
      return prev.length ? prev.reduce((t, v) => t + v, 0) / prev.length : Infinity;
    };
    const keyed = list.map((id) => ({ id, k: centre(id) }));
    keyed.sort((x, y) => (x.k === y.k ? compareNames(x.id, y.id) : x.k === Infinity ? 1 : y.k === Infinity ? -1 : x.k - y.k));
    byColumn.set(c, keyed.map((e) => e.id));
    byColumn.get(c)!.forEach((id, i) => row.set(id, i - (list.length - 1) / 2));
  }
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

// Authored positions (any unit, y down) scaled so the closest two hinted places are about 1 apart. A
// device without a hint of its own takes the hint of the name it extends (NAME for NAME-1, NAME-O-2:
// a diagram that draws one box for a line system the facts list shelf by shelf), the devices sharing
// a place set side by side. Plain boxes still without a place go beside the devices they are linked
// to. Any other device without a hint: { missing }, and the computed layout is used.
function hintLayout(
  model: LayoutModel,
  ids: string[],
  adj: Map<string, Set<string>>,
  hints: Record<string, unknown>,
): { positions: Record<string, Point>; description: string; missing: string[] } | { positions: null; missing: string[] } {
  const valid = (p: unknown): p is number[] => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]);
  const keys = Object.keys(hints).filter((k) => valid(hints[k]));
  const known = new Set(ids);
  const placeOf = new Map<string, string>(); // device -> the hint it takes
  for (const id of ids) {
    if (valid(hints[id])) placeOf.set(id, id);
    else {
      const key = keys.filter((k) => !known.has(k) && id.startsWith(`${k}-`)).sort((x, y) => y.length - x.length || compareNames(x, y))[0];
      if (key) placeOf.set(id, key);
    }
  }
  const plain = new Set(model.nodes.filter((n) => n.plain).map((n) => n.id));
  const missing = ids.filter((id) => !placeOf.has(id));
  if (!placeOf.size || missing.some((id) => !plain.has(id))) return { positions: null, missing };

  const used = [...new Set(placeOf.values())].sort(compareNames);
  const pts = used.map((k) => (hints[k] as number[]).map(Number) as [number, number]);
  let unit = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
      if (d > 0) unit = Math.min(unit, d);
    }
  }
  if (!Number.isFinite(unit)) unit = 1;
  const at = new Map(used.map((k, i) => [k, { x: pts[i]![0] / unit, y: pts[i]![1] / unit }]));
  const edges = edgeList(ids, adj);
  const pos = new Map<string, Point>();
  // Devices with a hint of their own first, then the ones sharing a hint, beside each other.
  const order = ids.filter((id) => placeOf.get(id) === id).concat(ids.filter((id) => placeOf.has(id) && placeOf.get(id) !== id));
  for (const id of order) {
    const want = at.get(placeOf.get(id)!)!;
    pos.set(id, placeOf.get(id) === id ? { ...want } : free(pos, [], want, "x"));
  }
  for (const id of missing) {
    const mine = [...adj.get(id)!].filter((x) => pos.has(x)).sort(compareNames).map((x) => pos.get(x)!);
    if (!mine.length) continue;
    const c = { x: mine.reduce((t, p) => t + p.x, 0) / mine.length, y: mine.reduce((t, p) => t + p.y, 0) / mine.length };
    pos.set(id, free(pos, edges, mine.length === 1 ? { x: c.x, y: c.y + 0.9 } : c, "x", null, { x: 0, y: 1 }, mine));
  }
  const beside = missing.filter((id) => pos.has(id));
  islands(ids, pos, Infinity);
  const positions: Record<string, Point> = {};
  for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
  const notes = [
    ...used.filter((k) => !known.has(k)).map((k) => `${ids.filter((id) => placeOf.get(id) === k).join(", ")} at ${k}`),
    ...(beside.length ? [`${beside.join(", ")} beside their neighbours`] : []),
  ];
  return { positions: normalise(positions), description: `the hints, scaled${notes.length ? ` (${notes.join("; ")})` : ""}`, missing: [] };
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
