// SPDX-License-Identifier: Apache-2.0
// Where devices go, computed from the facts so a consumer never authors or computes a layout: one
// layout shared by the 3D page, the 2D frames and the snapshot. Deterministic: the same devices and
// links give the same positions, whatever order they come in. Pure functions, no Node or DOM APIs.
//
// algorithm auto (the default) scores candidates and takes the best (chooseLayout below): the ladder
// described here, and tiers (the network roles as columns, CE | PE | P | PE | CE), radial (a hub lab),
// stress (stress majorisation) and, for a mesh without IGP roles, grid (a lattice), in layout-shapes.ts,
// and the ladder on another cycle (innerLadder below). The ladder:
//   1. The core: the IGP routers (P and PE); in a lab without an IGP router, the G.8032 ring members;
//      else the devices on the longest cycle; else (a chain or a tree) the devices that link others.
//      A plain box between two core devices (a line system or a third-party router in the path) is
//      core too, as is a chain of them (a ROADM, amplifiers, a ROADM), and so is a second cycle linked to the core (routers without an IGP, such as MPLS-TP
//      nodes, on a ring of their own). Linux hosts never are.
//   2. A core with a cycle (a G.8032 ring, else the longest cycle of the core) is a ladder: the cycle
//      (counted in routers: a line system's chain of plain boxes counts as one link, so a span through
//      it never outweighs a cycle of routers alone)
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
// Line systems: the members of an optical line system (devices without facts the facts give an
// equipment role: terminals, OADMs, ROADMs, amplifiers) are drawn on the optical layer, off every other
// frame. The other devices are laid out without them; then each line system is a row of its own above
// them, in path order (a terminal, the members between: OADM pairs for ELS, a fixed-filter system with no
// in-line amplifiers; ROADMs or in-line amplifiers for a ROADM system; the other terminal), the end cabled to the
// router further left on the left, spread between its two routers' columns when they are far enough
// apart, else a column apart centred over them, within max_columns. OADMs cabled to each other (back to
// back, the express span between them) stand side by side, BACK_TO_BACK apart, one place in the chain.
// A router cabled only to the line system stands under the member it is cabled to.
// aspect card: a landscape card, at most `max_columns` columns and wider than tall where it can be. A
// ladder too long for that runs round a rectangle that wide instead (its rows use the full width; its
// sides and rotation chosen like the ladder's); a triangle that is the whole core is a V; a column
// layout wraps into bands. Outer devices hang sideways off the row ends while everything stays within
// max_columns (the layout may grow to either side), else above or below; a core device with a single
// core neighbour (a stub) hangs with them rather than between the rows; spots round a device's
// neighbours are tried when the band leaves none whose links cross nothing; islands go beside the
// layout when they fit. The last pass may use the card's whole width, never adds a link through a
// device, and also counts each row of height and link length a little, so a device moves into a nearby
// spare spot when that adds no crossing. So a 10-device lab is about 4 columns by 3 rows on a card.
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
import { clearLinks, grid, radial, scoreLayout, stress, tierRole, tiers, type LayoutScore, type ShapeGraph } from "./layout-shapes.ts";

/** A device to place. `role` as the 3D importer gives it: p and pe are the IGP routers. */
export interface LayoutNode {
  id: string;
  role?: string | null;
  /** A device without facts, drawn as a plain box. */
  plain?: boolean;
  /** A Linux host: never part of the core. */
  host?: boolean;
  /** The IGP area the device is in: the tiers keep the devices of one area together. */
  group?: string | null;
  /** The equipment role a device without facts has (schema 1.9 devices[].role: terminal, oadm, roadm,
   * amplifier): with `plain`, a line-system member, laid out as a chain on a row of its own. */
  equipment?: string | null;
}

/** A link end: a device name, or an object naming it (`node` as the importer, `device` as a facts file's links[]). */
export type LayoutEnd = string | { node?: string; device?: string };

export interface LayoutLink {
  id?: string;
  a: LayoutEnd;
  b: LayoutEnd;
  /** A connection over an optical line system, not a cable (two routers cabled to the same channel port
   * of its two terminals): it joins its routers in the layout, but a router with nothing else is still
   * "cabled only to the line system" and stands under its terminal. */
  lightpath?: boolean;
  /** The channel a link rides over the line system (`over ch 25`): a connection over it, or a routed link
   * with `over`, drawn with a channel chip between its port badges. Beside a cable between the same two
   * devices it wants a longer line (the layout gives it ROOM). */
  over?: string | null;
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
  /** What placed the devices: hints, force, ladder, rectangle, columns, tiers, radial, stress, grid or none. */
  method: "hints" | "force" | "ladder" | "rectangle" | "columns" | "tiers" | "radial" | "stress" | "grid" | "none";
  /** The same, said for a person (which ring or cycle the ladder runs on). */
  description: string;
  /** The core devices, sorted (auto only). */
  core: string[];
  /** Hints that could not be used, and why. */
  warnings: string[];
  /** The candidates algorithm auto scored, the chosen one first (auto only). */
  candidates?: Array<{ method: LayoutResult["method"]; description: string; positions: Record<string, Point> } & LayoutScore>;
}

const CYCLE_SEARCH_LIMIT = 200000;
const COMBOS_LIMIT = 400;
const GAP = 0.6; // spacing between devices hung side by side
const CLEAR = 0.55; // closer than this on both axes is taken (grid spots)
const SPACE = 0.6; // no device nearer than this to another
const CROSSING = 4; // the cost of two core links crossing, in grid units of link length
const THROUGH = 6; // the cost of a core link running through a device
const HEIGHT = 1; // on a card, the cost of a row of height in the last untangling pass
const LENGTH = 0.4; // on a card, the cost of a grid unit of link length in the last untangling pass
// A connection over the line system beside a cable between the same two devices (parallelPairs): the
// rainbow's channel chip and the port badges of both links share one line, which needs ROOM columns. A
// row is ROW of a column on the 2D frames (frames.js: rows 7.6 font units, columns at least 9.4 font
// units and 160 px), so a vertical link of one row counts as shorter than a horizontal one of one
// column. In a lab with such a pair the last untangling pass counts SHORT per column missing, and LABEL
// for each link that runs through one of its own two devices' labels (which would push its badges off).
const ROOM = 0.9;
const ROW = 0.62;
const SHORT = 4;
const LABEL = 2;

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
  const cabled = new Map(ids.map((id) => [id, new Set<string>()])); // without the lightpaths
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
    if (!l.lightpath) (cabled.get(a)!.add(b), cabled.get(b)!.add(a));
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
  const limit = card ? maxColumns : Infinity;
  // Line systems: the other devices first, without them, then each line system as a row above.
  const isMember = (n: LayoutNode) => !!n.plain && !!n.equipment && !n.host;
  const members = new Set(model.nodes.filter(isMember).map((n) => n.id));
  if (members.size && members.size < ids.length) {
    const rest: LayoutModel = {
      nodes: model.nodes.filter((n) => !members.has(n.id)),
      links: model.links.filter((l) => !members.has(endName(l.a) ?? "") && !members.has(endName(l.b) ?? "")),
      rings: model.rings,
    };
    const restIds = ids.filter((id) => !members.has(id));
    const restAdj = new Map(restIds.map((id) => [id, new Set([...adj.get(id)!].filter((x) => !members.has(x)))]));
    const inner = chooseLayout(rest, restIds, restAdj, linkEnds, limit);
    const pos = new Map(Object.entries(inner.positions).map(([id, p]) => [id, { ...p }]));
    const oadms = new Set(model.nodes.filter((n) => members.has(n.id) && isOadm(n)).map((n) => n.id));
    const rows = lineSystems(pos, ids, cabled, members, oadms, limit);
    const positions: Record<string, Point> = {};
    for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
    return { ...inner, positions: normalise(positions), description: `${inner.description}; ${rows.join("; ")}`, warnings };
  }
  return { ...chooseLayout(model, ids, adj, linkEnds, limit), warnings };
}

// An OADM: a line-system member whose equipment role is `oadm` (any case).
export const isOadm = (n: LayoutNode) => /^oadm$/i.test(n.equipment ?? "");

/** How far apart (in columns) two OADMs cabled back to back stand: their boxes (2.6 font units wide, a
 * column at least 9.4) touch or nearly so. */
export const BACK_TO_BACK = 0.3;

// Each line system (a connected piece of `members`) as a row of its own above everything placed, the
// next one above that: in path order from one end to the other (a piece that is not a path: breadth
// first from its first name), the end cabled to the router further left on the left. Consecutive
// `oadms` cabled to each other are one place in the row, side by side BACK_TO_BACK apart. The places
// are spread evenly between the columns of the routers at the two ends when they are at least a column
// a place apart, else a column apart centred over them (closer on a card too narrow for that), then
// shifted to stay within max_columns of the layout. A router cabled to nothing but line systems stands
// under the member it is cabled to, when that spot is free. Returns what it did, a phrase per line system.
function lineSystems(pos: Map<string, Point>, ids: string[], adj: Map<string, Set<string>>, members: Set<string>, oadms: Set<string>, maxColumns: number): string[] {
  const memberIds = ids.filter((id) => members.has(id));
  const memberAdj = new Map(memberIds.map((id) => [id, new Set([...adj.get(id)!].filter((x) => members.has(x)))]));
  // Routers cabled to line systems only: they move under their member, so they do not set the row.
  const onlyOptical = new Set(ids.filter((id) => !members.has(id) && adj.get(id)!.size > 0 && [...adj.get(id)!].every((x) => members.has(x))));
  const anchorX = (id: string) => {
    const xs = sortedNames(adj.get(id)!).filter((x) => !members.has(x) && !onlyOptical.has(x) && pos.has(x)).map((x) => pos.get(x)!.x);
    return xs.length ? xs.reduce((t, v) => t + v, 0) / xs.length : null;
  };
  const placed = () => [...pos.values()];
  const out: string[] = [];
  let y = pos.size ? Math.min(...placed().map((p) => p.y)) - 1 : 0;
  for (const piece of components(memberIds, memberAdj)) {
    const ends = piece.filter((id) => memberAdj.get(id)!.size <= 1);
    let order: string[] = [];
    if (piece.length === 1) order = [...piece];
    else if (ends.length === 2) {
      order = [ends[0]!];
      while (order.length < piece.length) {
        const next = sortedNames(memberAdj.get(order.at(-1)!)!).find((x) => !order.includes(x));
        if (!next) break;
        order.push(next);
      }
    }
    if (order.length !== piece.length) {
      order = [piece[0]!];
      for (let i = 0; i < order.length; i++) for (const x of sortedNames(memberAdj.get(order[i]!)!)) if (!order.includes(x)) order.push(x);
    }
    let xa = anchorX(order[0]!), xb = anchorX(order.at(-1)!);
    if (xa !== null && xb !== null && xa > xb + 1e-9) {
      order.reverse();
      [xa, xb] = [xb, xa];
    }
    // The places: OADMs cabled back to back share one.
    const places: string[][] = [];
    for (const id of order) {
      const last = places.at(-1)?.at(-1);
      if (last && oadms.has(id) && oadms.has(last) && memberAdj.get(last)!.has(id)) places.at(-1)!.push(id);
      else places.push([id]);
    }
    const inner = places.reduce((t, pl) => t + (pl.length - 1) * BACK_TO_BACK, 0);
    const xs = placed().map((p) => p.x);
    const mid = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
    const lo = xa ?? xb ?? mid, hi = xb ?? xa ?? mid;
    const k = places.length;
    let step = k > 1 ? Math.max(1, (hi - lo - inner) / (k - 1)) : 0;
    if (Number.isFinite(maxColumns) && k > 1 && step * (k - 1) + inner > maxColumns - 1) step = Math.max(BACK_TO_BACK, (maxColumns - 1 - inner) / (k - 1));
    const width = step * (k - 1) + inner;
    let start = (lo + hi) / 2 - width / 2;
    if (Number.isFinite(maxColumns) && xs.length) {
      // Within max_columns of the layout: shifted toward it as far as needed.
      const end = start + width;
      const over = Math.max(Math.max(...xs), end) - Math.min(Math.min(...xs), start) - (maxColumns - 1);
      if (over > 1e-9) start += start < Math.min(...xs) ? Math.min(over, Math.min(...xs) - start) : -Math.min(over, end - Math.max(...xs));
    }
    let x = start;
    for (const pl of places) {
      pl.forEach((id, j) => pos.set(id, { x: round(x + j * BACK_TO_BACK), y }));
      x += (pl.length - 1) * BACK_TO_BACK + step;
    }
    out.push(`line system ${places.map((pl) => (pl.length > 1 ? `${pl.join(" + ")} back to back` : pl[0])).join(" - ")} in a row above`);
    y -= 1;
  }
  // A router cabled only to line systems: under the member it is cabled to, when no device is there.
  const top = Math.max(...memberIds.map((id) => pos.get(id)!.y));
  for (const id of [...onlyOptical].sort(compareNames)) {
    const near = sortedNames(adj.get(id)!).map((x) => pos.get(x)!);
    const want = { x: round(near.reduce((t, p) => t + p.x, 0) / near.length), y: top + 1 };
    if (![...pos].some(([o, p]) => o !== id && Math.hypot(p.x - want.x, p.y - want.y) < SPACE)) pos.set(id, want);
  }
  return out;
}

const sortedNames = (s: Iterable<string>) => [...s].sort(compareNames);

// ---- the candidates and the choice ---------------------------------------------------------------

// Every candidate that fits the lab, scored (layout-shapes.ts scoreLayout); the lowest score wins, after
// two adjustments. In a lab with routers in both roles (P and PE), a candidate whose picture follows
// them (every P between the leftmost and the rightmost PE, no CE between them) counts ROLE_BONUS less.
// Any other candidate, and radial or stress always (they are for labs no tiering fits), must beat the
// ladder (the layout before the candidates, tuned on many labs) by MARGIN. On a card, a candidate wider
// than max_columns is not taken, except one that follows the roles, which may take one column more
// (CE | PE | P | PE | CE is five). On a tie the earlier candidate wins: the ladder (or rectangle or
// columns), tiers (the roles as columns), radial, stress.
const ROLE_BONUS = 2;
const MARGIN = 3;
const MESH_MAX = 15;

function chooseLayout(
  model: LayoutModel,
  ids: string[],
  adj: Map<string, Set<string>>,
  linkEnds: Map<string, [string, string]>,
  maxColumns: number,
): Omit<LayoutResult, "warnings"> {
  const legacy = autoLayout(model, ids, adj, linkEnds, maxColumns);
  const edges = edgeList(ids, adj);
  if (!edges.length) return legacy;
  // Every link (parallel links too: each has port badges of its own), as sorted pairs in name order.
  const known = new Set(ids);
  const links = model.links
    .map((l) => [endName(l.a), endName(l.b)].sort((x, y) => compareNames(x ?? "", y ?? "")) as [string, string])
    .filter(([a, b]) => a && b && a !== b && known.has(a) && known.has(b))
    .sort((p, q) => compareNames(p[0], q[0]) || compareNames(p[1], q[1]));
  const node = new Map(model.nodes.map((n) => [n.id, n]));
  // Groups the tiers keep together: IGP areas, else G.8032 rings.
  const groups = new Map<string, string>();
  for (const id of ids) if (node.get(id)?.group) groups.set(id, `area ${node.get(id)!.group}`);
  if (new Set(groups.values()).size < 2) {
    groups.clear();
    const rings = [...(model.rings ?? [])].sort((p, q) => compareNames(String(p.name ?? p.id ?? ""), String(q.name ?? q.id ?? "")));
    for (const r of rings) for (const m of r.nodes) {
      const id = typeof m === "string" ? m : m.node;
      if (adj.has(id) && !groups.has(id)) groups.set(id, `ring ${r.name ?? r.id ?? ""}`);
    }
  }
  const g: ShapeGraph = { ids, adj, node, groups };
  const roles = new Set(ids.map((id) => tierRole(node.get(id))));
  const both = roles.has("p") && roles.has("pe");
  const finish = (pos: Map<string, Point> | null) => {
    if (!pos) return null;
    clearLinks(pos, edges);
    islands(ids, pos, maxColumns);
    const positions: Record<string, Point> = {};
    for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
    return normalise(positions);
  };
  // A lab whose routers have no roles (no IGP), no ring and no plain box, of at most MESH_MAX devices:
  // nothing tiers it, so the mesh candidates (grid, and the ladder on another cycle) are tried too.
  // (A bigger lab has no room for a mesh on a card, and the searches would take too long.)
  const plainRouters = ids.length <= MESH_MAX && !roles.has("p") && !roles.has("pe") && !roles.has("plain") && !(model.rings ?? []).length;
  const tierText = both ? "tiers by role: CE | PE | P | PE | CE" : roles.has("p") || roles.has("pe") ? "tiers by role and hops" : "tiers by hops (no IGP router)";
  const list: Array<{ method: LayoutResult["method"]; description: string; positions: Record<string, Point> | null; bonus: number; extra?: number; scoreFrom?: Record<string, Point> }> = [
    { method: legacy.method, description: legacy.description, positions: legacy.positions, bonus: 0 },
    { method: "tiers", description: tierText, positions: finish(tiers(g, maxColumns)), bonus: -MARGIN },
    { method: "radial", description: "radial round the hub", positions: finish(radial(g, maxColumns)), bonus: -MARGIN },
    { method: "stress", description: "stress majorisation (no tiering fits)", positions: finish(stress(g, maxColumns)), bonus: -MARGIN },
    ...(plainRouters ? innerLadder(model, ids, adj, linkEnds, maxColumns, legacy, links) : []),
    { method: "grid", description: "a lattice of rows and columns (a mesh)", positions: plainRouters ? finish(grid(g, maxColumns, legacy.positions)) : null, bonus: -MARGIN },
  ];
  if (both) {
    const of = (r: string) => ids.filter((id) => tierRole(node.get(id)) === r);
    for (const c of list) {
      if (!c.positions) continue;
      const x = (id: string) => c.positions![id]!.x;
      const pe = of("pe").map(x), lo = Math.min(...pe), hi = Math.max(...pe);
      const follows = lo < hi && of("p").every((id) => x(id) > lo + 1e-9 && x(id) < hi - 1e-9) && of("ce").every((id) => x(id) <= lo + 1e-9 || x(id) >= hi - 1e-9);
      if (follows) c.bonus = c.method === "radial" || c.method === "stress" ? ROLE_BONUS - MARGIN : ROLE_BONUS;
    }
  }
  // On a card, no candidate wider than max_columns (one that follows the roles: one column more).
  const span = (p: Record<string, Point>) => Math.max(...Object.values(p).map((q) => q.x)) - Math.min(...Object.values(p).map((q) => q.x));
  const scored = list
    .filter((c): c is typeof c & { positions: Record<string, Point> } => !!c.positions)
    .filter((c) => c === list[0] || span(c.positions) <= maxColumns - 1 + (c.bonus > 0 ? 1 : (c.extra ?? 0)) + 1e-9)
    .map((c, i) => ({ ...c, i, s: scoreLayout(new Map(Object.entries(c.scoreFrom ?? c.positions)), links, maxColumns) }));
  const ranked = [...scored].sort((p, q) => p.s.score - p.bonus - (q.s.score - q.bonus) || p.i - q.i);
  const best = ranked[0]!;
  return {
    positions: best.positions,
    method: best.method,
    description: best.description,
    core: legacy.core,
    candidates: ranked.map((c) => ({ method: c.method, description: c.description, positions: c.positions, ...c.s })),
  };
}

// The ladder on another cycle. A lab with no IGP router and no ring takes its longest cycle as the core,
// and that cycle often runs through the customer devices round the outside, leaving the routers' own
// ring as chords across the middle. Here every other cycle of at least half the lab's devices
// (INNER_CYCLES of them at most, shortest first) is tried as the core instead, the devices off it hung
// as usual (between the rows when linked to two or more of it, else outward); the best by scoreLayout
// is the candidate.
const INNER_CYCLES = 16;
function innerLadder(
  model: LayoutModel,
  ids: string[],
  adj: Map<string, Set<string>>,
  linkEnds: Map<string, [string, string]>,
  maxColumns: number,
  legacy: Omit<LayoutResult, "warnings">,
  links: Array<[string, string]>,
): Array<{ method: LayoutResult["method"]; description: string; positions: Record<string, Point> | null; bonus: number; extra?: number; scoreFrom?: Record<string, Point> }> {
  if (legacy.method !== "ladder" && legacy.method !== "rectangle") return [];
  const linked = ids.filter((id) => adj.get(id)!.size);
  const longest = new Set(legacy.core);
  let best: { positions: Record<string, Point>; score: number; core: string[] } | null = null;
  for (const cyc of cycleSets(linked, adj, Math.max(4, Math.ceil(linked.length / 2)), INNER_CYCLES)) {
    if (cyc.length === longest.size && cyc.every((id) => longest.has(id))) continue;
    const r = autoLayout(model, ids, adj, linkEnds, maxColumns + 1, cyc);
    const score = scoreLayout(new Map(Object.entries(r.positions)), links, maxColumns).score;
    if (!best || score < best.score - 1e-9) best = { positions: r.positions, score, core: cyc };
  }
  if (!best) return [];
  // The devices off the cycle below it rather than above (customer devices under the network, as a
  // diagram draws them): mirrored top to bottom when most of them sit above the cycle's middle.
  const on = new Set(best.core);
  const ys = best.core.map((id) => best!.positions[id]!.y);
  const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
  const off = ids.filter((id) => !on.has(id)).reduce((s, id) => s + best!.positions[id]!.y - mid, 0);
  const scoreFrom = best.positions;
  if (off < -1e-9) best.positions = normalise(Object.fromEntries(Object.entries(best.positions).map(([id, p]) => [id, { x: p.x, y: round(-p.y) }])));
  // (scored as found: the mirror image has the same links and crossings; only the score's guess of which
  // side a label goes differs, and the frames place labels where they fit)
  return [{ method: "ladder", description: `ladder on the cycle ${best.core.join(", ")}`, positions: best.positions, bonus: -MARGIN, extra: 1, scoreFrom }];
}

/** The device sets of the simple cycles among `ids` of at least `min` devices (a bounded search),
 * shortest first, then in name order; at most `max`. */
export function cycleSets(ids: string[], adj: Map<string, Set<string>>, min: number, max: number): string[][] {
  const found = new Map<string, string[]>();
  let steps = 0;
  const order = [...ids].sort(compareNames);
  const within = new Set(order);
  for (const start of order) {
    const path = [start];
    const on = new Set(path);
    const dfs = (cur: string) => {
      if (++steps > CYCLE_SEARCH_LIMIT) return;
      for (const nx of [...(adj.get(cur) ?? [])].filter((x) => within.has(x)).sort(compareNames)) {
        if (nx === start && path.length >= Math.max(3, min)) {
          const set = [...path].sort(compareNames);
          found.set(set.join("|"), set);
        }
        if (on.has(nx) || compareNames(nx, start) < 0) continue;
        path.push(nx);
        on.add(nx);
        dfs(nx);
        path.pop();
        on.delete(nx);
      }
    };
    dfs(start);
  }
  return [...found.values()].sort((a, b) => a.length - b.length || compareNames(a.join("|"), b.join("|"))).slice(0, max);
}

// ---- auto ----------------------------------------------------------------------------------------

function autoLayout(
  model: LayoutModel,
  ids: string[],
  adj: Map<string, Set<string>>,
  linkEnds: Map<string, [string, string]>,
  maxColumns: number,
  forced?: string[],
): Omit<LayoutResult, "warnings"> {
  const card = Number.isFinite(maxColumns);
  const node = new Map(model.nodes.map((n) => [n.id, n]));
  const sorted = (s: Iterable<string>) => [...s].sort(compareNames);
  const edges = edgeList(ids, adj);
  const rings = (model.rings ?? [])
    .map((r) => ({ ...r, members: sorted(new Set(r.nodes.map((m) => (typeof m === "string" ? m : m.node)).filter((m) => adj.has(m)))) }))
    .sort((p, q) => q.members.length - p.members.length || compareNames(String(p.name ?? p.id ?? ""), String(q.name ?? q.id ?? "")));

  let transit = false;
  let core = new Set(forced ?? ids.filter((id) => node.get(id)?.role === "p" || node.get(id)?.role === "pe"));
  if (!core.size) core = new Set(rings.flatMap((r) => r.members));
  // The longest cycle counted in routers: plain boxes add nothing, so a chain of them (a line system's
  // ROADMs and amplifiers, a span between two routers) counts as one link, and of equally long cycles
  // the one with the fewest boxes wins (a cycle of routers alone, when there is one).
  // A lab of plain boxes only (no device has facts) counts them all: they are its network.
  const isPlain = (id: string) => !!node.get(id)?.plain;
  const uncounted = ids.every(isPlain) ? undefined : isPlain;
  if (!core.size) core = new Set(longestCycle(ids, adj, uncounted));
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
  // A chain of plain boxes between two core devices (an optical line system: ROADM, amplifiers,
  // ROADM) is core too: the boxes on the shortest plain path from one core device to another.
  if (core.size) {
    const isPlain = (id: string) => !core.has(id) && !!node.get(id)?.plain && !node.get(id)?.host;
    for (const from of sorted(core)) {
      const prev = new Map<string, string>();
      const queue = sorted([...adj.get(from)!].filter(isPlain));
      for (const id of queue) prev.set(id, from);
      while (queue.length) {
        const id = queue.shift()!;
        for (const x of sorted([...adj.get(id)!])) {
          if (core.has(x) && x !== from && prev.get(id) !== x) {
            for (let at: string | undefined = id; at && at !== from; at = prev.get(at)) core.add(at);
          } else if (isPlain(x) && !prev.has(x)) {
            prev.set(x, id);
            queue.push(x);
          }
        }
      }
    }
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
  const cycle = ordered ?? longestCycle(sorted(core), coreAdj, uncounted);
  const external = new Set(sorted(core).filter((id) => [...adj.get(id)!].some((x) => !core.has(x))));
  const pes = new Set(ids.filter((id) => node.get(id)?.role === "pe"));

  let pos: Map<string, Point & { dir?: Point }>;
  let method: LayoutResult["method"];
  let description: string;
  if (cycle.length >= 3) {
    const on = ring && ordered ? `G.8032 ring ${ring.name ?? ring.id ?? ""}`.trim() : "the longest cycle";
    const fitted = ladder(cycle, coreAdj, external, pes, card ? maxColumns : Infinity, core.size === cycle.length);
    if (fitted) {
      pos = fitted;
      method = "ladder";
      description = `ladder on ${on}`;
    } else {
      pos = rectangle(cycle, coreAdj, maxColumns);
      method = "rectangle";
      description = `${on} round a rectangle ${maxColumns} columns wide`;
    }
    // Core devices off the cycle: between the rows, under their placed neighbours. On a card, one with a
    // single core neighbour (a stub) is hung outward with the outer devices instead, so what hangs off it
    // is not boxed in between the rows.
    const rest = sorted(core).filter((id) => !pos.has(id) && !(card && coreAdj.get(id)!.size < 2));
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
    const coreBox = { minX, maxX, minY, maxY };
    // Room beside the layout for x on a card (everything stays within maxColumns columns).
    const fits = (x: number) => {
      const b = bounds(pos, maxColumns);
      return !b || (x >= b.minX - 1e-9 && x <= b.maxX + 1e-9);
    };
    // Outward from a placed device: off a core row end sideways (on a card, while that stays within
    // max_columns, so a card is wider than tall), up from the top row, down from the bottom row; from
    // an outer device, the way it was hung.
    const outward = (anchor: string): Point => {
      const a = pos.get(anchor)!;
      if (!placedCore.has(anchor)) return a.dir ?? { x: 0, y: 1 };
      if (a.x === minX && minX !== maxX && fits(a.x - 0.9)) return { x: -1, y: 0 };
      if (a.x === maxX && minX !== maxX && fits(a.x + 0.9)) return { x: 1, y: 0 };
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
      // On a card the band may leave no spot whose links cross nothing: the spots round the device's
      // neighbours are tried too.
      const p = free(pos, edges, want, dir.x ? "y" : "x", bounds(pos, maxColumns), dir.x || dir.y ? dir : { x: 0, y: 1 }, mine, coreBox, card ? mine : []);
      pos.set(id, { ...p, dir: dir.x || dir.y ? dir : { x: 0, y: 1 } });
      for (const nb of sorted(adj.get(id)!)) if (!pos.has(nb) && !seen.has(nb)) (seen.add(nb), queue.push(nb));
    }
  }

  // Last, the devices off the cycle (or off the core, without one) are untangled among everything placed.
  const fixed = new Set(cycle.length >= 3 ? cycle : core);
  // With a connection over the line system beside a cable (parallelPairs), the pass also makes room
  // for it (ROOM); that result is taken only when it has no more crossings and links through devices
  // than the pass without.
  if (pos.size > fixed.size) {
    const movable = new Set([...pos.keys()].filter((id) => !fixed.has(id)));
    const parallel = parallelPairs(model, adj);
    const roomy = parallel.size ? untangle(new Map(pos), adj, movable, true, maxColumns, parallel) : null;
    pos = untangle(pos, adj, movable, true, maxColumns);
    if (roomy) {
      const [r, p] = [tangles(roomy, adj), tangles(pos, adj)];
      if (r.crossings <= p.crossings && r.through <= p.through) pos = roomy;
    }
  }

  // Islands: rows underneath (at most maxColumns wide on a card).
  islands(ids, pos, maxColumns);

  const positions: Record<string, Point> = {};
  for (const id of ids) positions[id] = { x: round(pos.get(id)!.x), y: round(pos.get(id)!.y) };
  return { positions: normalise(positions), method, description, core: sorted(core) };
}

// Devices linked to nothing placed: rows underneath (at most maxColumns wide); on a card, a row to the
// right instead when they fit beside the layout within maxColumns (a card stays wider than tall).
function islands(ids: string[], pos: Map<string, Point>, maxColumns: number) {
  const left = ids.filter((id) => !pos.has(id));
  if (!left.length) return;
  const xs = [...pos.values()].map((p) => p.x);
  if (Number.isFinite(maxColumns) && xs.length && Math.max(...xs) - Math.min(...xs) + left.length <= maxColumns - 1 + 1e-9) {
    const ys = [...pos.values()].map((p) => p.y);
    const y = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
    left.forEach((id, i) => pos.set(id, { x: Math.max(...xs) + 1 + i, y }));
    return;
  }
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

// The x range a card allows for the next device: anywhere that keeps everything placed within
// maxColumns columns (so the layout may grow to either side); unbounded otherwise.
function bounds(pos: Map<string, Point>, maxColumns: number): { minX: number; maxX: number } | null {
  if (!Number.isFinite(maxColumns) || !pos.size) return null;
  const xs = [...pos.values()].map((p) => p.x);
  return { minX: Math.max(...xs) - (maxColumns - 1), maxX: Math.min(...xs) + (maxColumns - 1) };
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
// `inner` (the core's box) counting as further; with `around`, the spots round those devices too) are
// tried first with no link of its own crossing a placed one, then allowing crossings; failing both, the
// first spot without a device stepping along `axis` (GAP apart), line by line outward along `out`.
function free(
  pos: Map<string, Point>,
  edges: Array<[string, string]>,
  want: Point,
  axis: "x" | "y",
  box: { minX: number; maxX: number } | null = null,
  out: Point = { x: 0, y: 1 },
  mine: Point[] = [],
  inner: { minX: number; maxX: number; minY: number; maxY: number } | null = null,
  around: Point[] = [],
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
  const seen = new Set<string>();
  for (const [centre, reach] of [[start, 10], ...around.map((c) => [c, 6] as const)] as Array<readonly [Point, number]>) {
    for (let i = -reach; i <= reach; i++) {
      for (let j = -reach; j <= reach; j++) {
        if (Math.hypot(i, j) > reach + 1e-9) continue;
        const p = { x: round(centre.x + i * 0.3), y: round(centre.y + j * 0.3) };
        const key = `${p.x},${p.y}`;
        if (seen.has(key) || !inside(p)) continue;
        seen.add(key);
        near.push({ p, d: Math.hypot(p.x - start.x, p.y - start.y) + (within(p) ? 1 : 0) });
      }
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

/**
 * The longest simple cycle among `ids` (a bounded search: labs are small), starting at its smallest
 * name. With `uncounted`, those devices add nothing to a cycle's length (ties: the fewer of them).
 */
export function longestCycle(ids: string[], adj: Map<string, Set<string>>, uncounted?: (id: string) => boolean): string[] {
  let best: string[] = [];
  let bestScore = -1;
  const score = (p: string[]) => (uncounted ? p.filter((id) => !uncounted(id)).length * 1000 - p.length : p.length);
  let steps = 0;
  const order = [...ids].sort(compareNames);
  const within = new Set(order);
  for (const start of order) {
    const path = [start];
    const on = new Set(path);
    const dfs = (cur: string) => {
      if (++steps > CYCLE_SEARCH_LIMIT) return;
      for (const nx of [...(adj.get(cur) ?? [])].filter((x) => within.has(x)).sort(compareNames)) {
        if (nx === start && path.length >= 3 && score(path) > bestScore) {
          best = [...path];
          bestScore = score(path);
        }
        if (on.has(nx) || compareNames(nx, start) < 0) continue;
        path.push(nx);
        on.add(nx);
        dfs(nx);
        path.pop();
        on.delete(nx);
      }
    };
    dfs(start);
    if (!uncounted && best.length === order.length) break;
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
function ladder(
  cycle: string[],
  adj: Map<string, Set<string>>,
  external: Set<string>,
  edgeRole: Set<string>,
  maxColumns: number,
  whole = false,
): Map<string, Point> | null {
  const m = cycle.length;
  // A triangle that is the whole core, on a card: a V (two on top, one below between them), wider than
  // tall; the device with the fewest outer links below, so the others hang off the top corners sideways.
  if (m === 3 && whole && Number.isFinite(maxColumns) && maxColumns >= 3) {
    const outer = (id: string) => (external.has(id) ? 2 : edgeRole.has(id) ? 1 : 0);
    const low = [...cycle].sort((a, b) => outer(a) - outer(b) || cycle.indexOf(a) - cycle.indexOf(b))[0]!;
    const [left, right] = cycle.filter((id) => id !== low);
    return new Map([[left!, { x: 0, y: 0 }], [right!, { x: 2, y: 0 }], [low, { x: 1, y: 1 }]]);
  }
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
// little per row so the rectangle stays low; the first cheapest wins. Both rows use the card's width
// (the wider row exactly that, the other at most one less), so a long cycle is a wide, low rectangle,
// not a tall one two columns wide. A shorter row spreads to the corners.
function rectangle(cycle: string[], adj: Map<string, Set<string>>, width: number): Map<string, Point> {
  const m = cycle.length;
  const chords = chordsOf(cycle, adj);
  const spread = (n: number, w: number) => Array.from({ length: n }, (_, i) => (n === 1 ? 0 : (i * (w - 1)) / (n - 1)));
  let best: { cost: number; pos: Map<string, Point> } | null = null;
  const most = Math.max(2, Math.min(width, Math.floor(m / 2)));
  for (let top = Math.max(2, most - 1); top <= most; top++) {
    for (let bottom = Math.max(2, most - 1); bottom <= most; bottom++) {
      const sides = m - top - bottom;
      if (sides < 0 || Math.max(top, bottom) !== most) continue;
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
// placed devices (with `keepClear`, never adding a link through a device on the way; a move that only
// shortens links is not taken, so the ladder's choices stand). On a card the spare spots reach as far to
// either side as max_columns allows. `parallel` (parallelPairs): pairs that want ROOM; with any, links
// through their own devices' labels count too (LABEL).
// Deterministic: moves are tried in name and grid order, the first improvement taken, until none
// helps (bounded).
function untangle(
  pos: Map<string, Point>,
  adj: Map<string, Set<string>>,
  movable: Set<string> = new Set(pos.keys()),
  keepClear = false,
  maxColumns = Infinity,
  parallel: Set<string> = new Set(),
): Map<string, Point> {
  const ids = [...pos.keys()].sort(compareNames);
  const free = ids.filter((id) => movable.has(id));
  const edges = edgeList(ids, new Map(ids.map((id) => [id, new Set([...adj.get(id)!].filter((x) => pos.has(x)))])));
  // { cost, through, crossed }: the weighted crossings and links through devices, the links through
  // devices and the crossings.
  const penalty = (at: Map<string, Point>) => {
    let cost = 0;
    let through = 0, crossed = 0;
    for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) if (crosses(at, edges[i]!, edges[j]!)) (cost += CROSSING, crossed++);
    for (const [a, b] of edges) for (const id of ids) if (id !== a && id !== b && onLink(at.get(id)!, at.get(a)!, at.get(b)!)) (cost += THROUGH, through++);
    // On a card, each row of height costs a little (less than a crossing) and so does link length, so a
    // device moves into a nearby spare spot inside the card when that adds no crossing: the card stays
    // wider than tall without devices pulled away from their neighbours.
    if (Number.isFinite(maxColumns)) {
      const ay = [...at.values()].map((p) => p.y);
      cost += HEIGHT * (Math.max(...ay) - Math.min(...ay));
      for (const [a, b] of edges) cost += LENGTH * Math.hypot(at.get(a)!.x - at.get(b)!.x, at.get(a)!.y - at.get(b)!.y);
    }
    if (parallel.size) {
      const ay = [...at.values()].map((p) => p.y), mid = (Math.min(...ay) + Math.max(...ay)) / 2;
      for (const [a, b] of edges) {
        const p = at.get(a)!, q = at.get(b)!;
        if (parallel.has(`${a}|${b}`)) cost += SHORT * Math.max(0, ROOM - Math.hypot(p.x - q.x, (p.y - q.y) * ROW));
        for (const id of [a, b]) if (segmentHitsRect(p, q, labelBox(id, at.get(id)!, mid))) cost += LABEL;
      }
    }
    return { cost, through, crossed };
  };
  let { cost: cur, through: curThrough, crossed: curCrossed } = penalty(pos);
  if (!cur) return pos;
  const xs = [...pos.values()].map((p) => p.x), ys = [...pos.values()].map((p) => p.y);
  // Spare spots: a half-step grid aligned with the layout's corner, half a row beyond it above and below;
  // on a card, as far to either side as max_columns allows (a move never makes it wider than that).
  const grid: Point[] = [];
  const box = bounds(pos, maxColumns);
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const x0 = box ? Math.min(...xs) - Math.floor((Math.min(...xs) - box.minX) * 2 + 1e-9) / 2 : Math.min(...xs);
  const x1 = box ? box.maxX : Math.max(...xs);
  for (let y = y0 - 0.5; y <= y1 + 0.5 + 1e-9; y += 0.5) for (let x = x0; x <= x1 + 1e-9; x += 0.5) grid.push({ x: round(x), y: round(y) });
  const narrow = (at: Map<string, Point>) => {
    if (!Number.isFinite(maxColumns)) return true;
    const ax = [...at.values()].map((p) => p.x);
    return Math.max(...ax) - Math.min(...ax) <= maxColumns - 1 + 1e-9;
  };
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
      // With keepClear, never a move that adds a link through a device, whatever crossings it removes;
      // nor one that adds a crossing to make room for a pair (`parallel`).
      const { cost, through, crossed } = penalty(next);
      if (cost < cur - 1e-9 && (!keepClear || through <= curThrough) && (!parallel.size || crossed <= curCrossed) && narrow(next)) {
        for (const [id, p] of next) pos.set(id, p);
        cur = cost;
        curThrough = through;
        curCrossed = crossed;
        better = true;
        break;
      }
    }
    if (!better) break;
  }
  return pos;
}

// The crossings and the links through devices among the links between placed devices.
function tangles(pos: Map<string, Point>, adj: Map<string, Set<string>>): { crossings: number; through: number } {
  const ids = [...pos.keys()].sort(compareNames);
  const edges = edgeList(ids, new Map(ids.map((id) => [id, new Set([...adj.get(id)!].filter((x) => pos.has(x)))])));
  let crossings = 0, through = 0;
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) if (crosses(pos, edges[i]!, edges[j]!)) crossings++;
  for (const [a, b] of edges) for (const id of ids) if (id !== a && id !== b && onLink(pos.get(id)!, pos.get(a)!, pos.get(b)!)) through++;
  return { crossings, through };
}

// The pairs of devices (`a|b`, in name order) joined by more than one link, one of them over the line
// system (LayoutLink over).
function parallelPairs(model: LayoutModel, adj: Map<string, Set<string>>): Set<string> {
  const count = new Map<string, number>(), over = new Set<string>();
  for (const l of model.links) {
    const [a, b] = [endName(l.a), endName(l.b)].sort((x, y) => compareNames(x ?? "", y ?? ""));
    if (!a || !b || a === b || !adj.get(a)?.has(b)) continue;
    count.set(`${a}|${b}`, (count.get(`${a}|${b}`) ?? 0) + 1);
    if (l.over) over.add(`${a}|${b}`);
  }
  return new Set([...over].filter((k) => count.get(k)! > 1));
}

// Where the 2D frames put a device's label, grown by half a port badge all round, in grid units: above
// the device in the top half of the drawing (`mid` the middle row), below it in the bottom half; the
// name over the type, some 4 font units wide; a column 12.3 font units, a row 7.6 (as layout-shapes.ts
// badgeCollisions).
function labelBox(id: string, p: Point, mid: number) {
  const w = (Math.max(id.length * 0.62, 4) + 0.6 + 1.1) / 12.3, h = (2.6 + 1.1) / 7.6, gap = (1 - 0.55) / 7.6;
  return { x: p.x - w / 2, y: p.y > mid + 1e-9 ? p.y + gap : p.y - gap - h, w, h };
}

// Whether the segment p-q crosses the rectangle r (Liang-Barsky clipping).
function segmentHitsRect(p: Point, q: Point, r: { x: number; y: number; w: number; h: number }): boolean {
  let t0 = 0, t1 = 1;
  const dx = q.x - p.x, dy = q.y - p.y;
  for (const [pp, qq] of [[-dx, p.x - r.x], [dx, r.x + r.w - p.x], [-dy, p.y - r.y], [dy, r.y + r.h - p.y]] as const) {
    if (pp === 0) {
      if (qq < 0) return false;
      continue;
    }
    const t = qq / pp;
    if (pp < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
  }
  return t0 <= t1;
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
