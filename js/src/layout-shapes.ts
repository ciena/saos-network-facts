// SPDX-License-Identifier: Apache-2.0
// The layout candidates beside the ladder (layout.ts), and the score that picks one per lab:
//   tiers   the network roles as columns, CE | PE | P | PE | CE, nodes ordered within a column to
//           cross as few links as possible (Sugiyama: layer assignment, then barycentre sweeps), then
//           rows set so links run straight and evenly spaced; redundant pairs come out mirrored.
//   radial  one hub in the middle, its spokes round it (a hub lab: one device linked to most others).
//   stress  stress majorisation (Gansner, Koren and North, "Graph Drawing by Stress Majorization",
//           2004): link lengths as close to the hops between devices as can be, for a mesh that fits
//           no tiering.
//   score   crossings, links through devices, devices too close, port badges likely to collide, how
//           even the link lengths are and how well the layout fits the frame (a landscape card at
//           most max_columns wide and three rows tall). Lower is better.
// Pure functions, deterministic: every list is walked in name order.

import { compareNames, type LayoutNode, type Point } from "./layout.ts";

/** The lab as the candidates read it. `groups`: device to its group (IGP area, else G.8032 ring). */
export interface ShapeGraph {
  ids: string[];
  adj: Map<string, Set<string>>;
  node: Map<string, LayoutNode>;
  groups: Map<string, string>;
}

type Pos = Map<string, Point>;

const sorted = (s: Iterable<string>) => [...s].sort(compareNames);
const round = (v: number) => Math.round(v * 100) / 100 + 0;

/** The role a device plays in the tiers: p and pe as the importer says, else ce (a host or plain box too). */
export function tierRole(n: LayoutNode | undefined): "p" | "pe" | "ce" | "plain" {
  if (n?.role === "p" || n?.role === "pe") return n.role;
  return n?.plain && !n.host ? "plain" : "ce";
}

// Hops from `from` over `adj`, only through `within` when given.
function hops(from: string | string[], adj: Map<string, Set<string>>, within?: Set<string>): Map<string, number> {
  const start = Array.isArray(from) ? from : [from];
  const d = new Map(start.map((s) => [s, 0]));
  const q = [...start];
  while (q.length) {
    const c = q.shift()!;
    for (const n of sorted(adj.get(c) ?? [])) if ((!within || within.has(n)) && !d.has(n)) (d.set(n, d.get(c)! + 1), q.push(n));
  }
  return d;
}

/** The connected pieces with links (two devices or more), biggest first, then by first name. */
export function pieces(g: ShapeGraph): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const id of g.ids) {
    if (seen.has(id) || !g.adj.get(id)!.size) continue;
    const piece = sorted(hops(id, g.adj).keys());
    for (const x of piece) seen.add(x);
    out.push(piece);
  }
  return out.sort((a, b) => b.length - a.length || compareNames(a[0]!, b[0]!));
}

// Each piece laid out by `shape` (null: the shape does not fit that piece), side by side while they fit
// within maxColumns, else under each other.
function perPiece(g: ShapeGraph, maxColumns: number, shape: (piece: string[]) => Pos | null): Pos | null {
  const all = pieces(g);
  if (!all.length) return null;
  const out: Pos = new Map();
  let x = 0, y = 0, rowH = 0;
  for (const piece of all) {
    const p = shape(piece);
    if (!p) return null;
    const pts = [...p.values()];
    const minX = Math.min(...pts.map((q) => q.x)), minY = Math.min(...pts.map((q) => q.y));
    const w = Math.max(...pts.map((q) => q.x)) - minX, h = Math.max(...pts.map((q) => q.y)) - minY;
    if (out.size && x + w > maxColumns - 1 + 1e-9) (x = 0, y += rowH + 1.2, rowH = 0);
    for (const [id, q] of p) out.set(id, { x: round(q.x - minX + x), y: round(q.y - minY + y) });
    x += w + 1;
    rowH = Math.max(rowH, h);
  }
  return out;
}

// ---- tiers -----------------------------------------------------------------------------------------

/** The core a piece is tiered round: its IGP routers, and plain boxes on a path between two of them
 * (a line system in the middle); without a router, the devices that link others (not hosts). */
function tierCore(g: ShapeGraph, piece: string[]): Set<string> {
  const inPiece = new Set(piece);
  let core = new Set(piece.filter((id) => tierRole(g.node.get(id)) === "p" || tierRole(g.node.get(id)) === "pe"));
  if (!core.size) core = new Set(piece.filter((id) => g.adj.get(id)!.size >= 2 && !g.node.get(id)?.host));
  if (core.size < 2) core = new Set(piece.filter((id) => !g.node.get(id)?.host));
  // plain boxes on a plain-only path between two core devices
  const isPlain = (id: string) => inPiece.has(id) && !core.has(id) && tierRole(g.node.get(id)) === "plain";
  for (const from of sorted(core)) {
    const prev = new Map<string, string>();
    const queue = sorted(g.adj.get(from)!).filter(isPlain);
    for (const id of queue) prev.set(id, from);
    while (queue.length) {
      const id = queue.shift()!;
      for (const x of sorted(g.adj.get(id)!)) {
        if (core.has(x) && x !== from && prev.get(id) !== x) for (let at: string | undefined = id; at && at !== from; at = prev.get(at)) core.add(at);
        else if (isPlain(x) && !prev.has(x)) (prev.set(x, id), queue.push(x));
      }
    }
  }
  return core;
}

/** Tiers: CE | PE | P | PE | CE as columns (see the file comment). null when the piece has no core of
 * two devices or more. `widthBudget`: the columns a card allows. */
export function tiers(g: ShapeGraph, maxColumns: number): Pos | null {
  return perPiece(g, maxColumns, (piece) => tierPiece(g, piece, maxColumns));
}

function tierPiece(g: ShapeGraph, piece: string[], maxColumns: number): Pos | null {
  if (piece.length < 2) return null;
  const core = tierCore(g, piece);
  if (core.size < 2) return null;
  const role = (id: string) => tierRole(g.node.get(id));
  const coreList = sorted(core);
  const ps = coreList.filter((id) => role(id) === "p");
  const pes = coreList.filter((id) => role(id) === "pe");
  const withRoles = ps.length > 0 && pes.length > 0;

  // Hops from a set of core devices, in the core (through the whole piece where the core alone does
  // not join two devices).
  const dcache = new Map<string, Map<string, number>>();
  const D = (set: string[]) => {
    const k = set.join("|");
    if (!dcache.has(k)) {
      const d = hops(set, g.adj, core);
      if (d.size < core.size) for (const [x, v] of hops(set, g.adj)) if (!d.has(x) && core.has(x)) d.set(x, v);
      dcache.set(k, d);
    }
    return dcache.get(k)!;
  };
  // The poles: the two sets of core devices furthest apart, among the edge devices one by one (PEs;
  // else the core devices facing outer devices), the core devices an outer device is linked to (a
  // dual-homed CE's PE pair goes in one column, mirrored), and every device facing outer devices when
  // those are at most half the core; one of the two may be any core device. A dual-homed CE's set counts
  // a hop more (the redundant pair stays together), the facing devices half a hop; on a tie the bigger
  // sets, then by name.
  const facing = coreList.filter((id) => [...g.adj.get(id)!].some((x) => !core.has(x)));
  const edge = pes.length >= 2 ? pes : facing.length >= 2 ? facing : coreList;
  const sets = new Map<string, string[]>();
  for (const id of edge) sets.set(id, [id]);
  for (const x of piece.filter((id) => !core.has(id))) {
    const s = sorted(g.adj.get(x)!).filter((y) => core.has(y));
    if (s.length >= 2) sets.set(s.join("|"), s);
  }
  const attached = new Set(sets.keys());
  if (!withRoles && facing.length >= 2 && facing.length <= core.size / 2 && !sets.has(facing.join("|"))) sets.set(facing.join("|"), facing);
  const bonus = (set: string[]) => (set.length < 2 ? 0 : attached.has(set.join("|")) ? 1 : 0.5);
  const list = [...sets.values()].sort((p, q) => compareNames(p.join("|"), q.join("|")));
  const others = coreList.filter((id) => !sets.has(id)).map((id) => [id]);
  let A = list[0]!, B = list[1] ?? others[0] ?? list[0]!, far = -1, value = -1, size = 0;
  for (let i = 0; i < list.length; i++) for (const q of [...list.slice(i + 1), ...others]) {
    const p = list[i]!;
    if (p.some((x) => q.includes(x))) continue;
    const dq = D(q);
    const d = Math.min(...p.map((x) => dq.get(x) ?? 0));
    const v = d + bonus(p) + bonus(q);
    if (v > value || (v === value && p.length + q.length > size)) [A, B, far, value, size] = [p, q, d, v, p.length + q.length];
  }
  far = Math.max(far, 1);
  const da = D(A), db = D(B);
  const t = new Map(coreList.map((id) => {
    const x = da.get(id) ?? 0, y = db.get(id) ?? 0;
    return [id, x + y ? x / (x + y) : 0.5];
  }));

  // Columns: one per hop between the poles (at least PE | P | PE with both roles), more while a column
  // would hold more than three devices, at most max_columns; then one each side for the outer devices
  // when they fit.
  const outer = piece.filter((id) => !core.has(id));
  const card = Number.isFinite(maxColumns);
  const need = withRoles ? 3 : 2;
  let C = Math.max(far + 1, need, Math.ceil(core.size / 3));
  if (card) C = Math.max(Math.min(C, maxColumns), Math.min(need, far + 1));
  // (CE | PE | P | PE | CE takes five columns on a four-column card: the roles are worth the column.)
  const sideCols = !card || C + 2 <= maxColumns + (withRoles ? 1 : 0);
  const col = new Map<string, number>();
  const peSide = { left: 0, right: 0 };
  // PEs on the outer core columns, P routers between them (or out to the last column on a side
  // without a PE).
  for (const id of coreList) {
    const tv = t.get(id)!;
    let c = Math.round(tv * (C - 1));
    if (withRoles && role(id) === "pe") {
      if (tv < 0.5 - 1e-9) c = 0;
      else if (tv > 0.5 + 1e-9) c = C - 1;
      else c = peSide.left <= peSide.right ? 0 : C - 1;
      peSide[c === 0 ? "left" : "right"]++;
    }
    col.set(id, c);
  }
  if (withRoles && C >= 3) {
    for (const id of ps) col.set(id, Math.min(peSide.right ? C - 2 : C - 1, Math.max(peSide.left ? 1 : 0, col.get(id)!)));
  }
  // Outer devices, breadth first: outward of their anchors when those are on a side column, else in
  // their anchor's column, hung at the top or bottom.
  const hang = new Map<string, number>(); // -1 top, 1 bottom
  const hung = new Map<number, number>(); // column -> devices hung in it
  const hangAt = (id: string, c: number) => {
    const k = hung.get(c) ?? 0;
    hung.set(c, k + 1);
    hang.set(id, k % 2 ? 1 : -1);
  };
  const queue = sorted(outer.filter((id) => [...g.adj.get(id)!].some((x) => col.has(x))));
  const seen = new Set(queue);
  const dirOf = new Map<string, number>(); // the way an outer device was hung: -1 left, 1 right, 0 in place
  while (queue.length) {
    const id = queue.shift()!;
    const anchors = sorted(g.adj.get(id)!).filter((x) => col.has(x));
    const cs = anchors.map((x) => col.get(x)!);
    const dirs = anchors.map((x) => (core.has(x) ? (col.get(x) === 0 ? -1 : col.get(x) === C - 1 ? 1 : 0) : (dirOf.get(x) ?? 0)));
    const agree = dirs.every((d) => d === dirs[0]);
    let dir = agree ? dirs[0]! : 0;
    // A CE linked to a PE on a side column and to a P router as well still goes outward of the PE.
    const peDirs = anchors.map((x, i) => (role(x) === "pe" ? dirs[i]! : 0)).filter((d) => d);
    if (!agree && withRoles && peDirs.length && peDirs.every((d) => d === peDirs[0])) dir = peDirs[0]!;
    const mean = cs.reduce((s, v) => s + v, 0) / cs.length;
    let c = Math.round(mean);
    if (dir && C === 1) dir = 0;
    if (dir) {
      const out = (dir < 0 ? Math.min(...cs) : Math.max(...cs)) + dir;
      const lo = !card ? -Infinity : sideCols ? -1 : 0, hi = !card ? Infinity : sideCols ? C : C - 1;
      if (out >= lo && out <= hi) c = out;
      else (c = dir < 0 ? Math.min(...cs) : Math.max(...cs), hangAt(id, c));
    } else if (anchors.length === 1 || cs.every((v) => v === cs[0])) hangAt(id, c);
    col.set(id, c);
    dirOf.set(id, dir);
    for (const n of sorted(g.adj.get(id)!)) if (!col.has(n) && !seen.has(n)) (seen.add(n), queue.push(n));
  }

  // Order within columns: barycentre sweeps, keeping the order with the fewest crossings.
  const cols = [...new Set(col.values())].sort((x, y) => x - y);
  let order = new Map(cols.map((c) => [c, sorted([...col.keys()].filter((id) => col.get(id) === c)).sort((x, y) => (t.get(x) ?? 1) - (t.get(y) ?? 1) || compareNames(x, y))]));
  const rowOf = (o: Map<number, string[]>) => {
    const r = new Map<string, number>();
    for (const list of o.values()) list.forEach((id, i) => r.set(id, i - (list.length - 1) / 2));
    return r;
  };
  const place = (o: Map<number, string[]>) => coordinates(g, o, col, hang);
  const edges = piece.flatMap((x) => sorted(g.adj.get(x)!).filter((y) => compareNames(x, y) < 0).map((y) => [x, y] as [string, string]));
  let best = { order, cost: Infinity };
  const consider = (o: Map<number, string[]>) => {
    const pos = place(o);
    const cost = crossingCount(pos, edges) * 10 + throughCount(pos, edges);
    if (cost < best.cost) best = { order: new Map([...o].map(([k, v]) => [k, [...v]])), cost };
  };
  consider(order);
  for (let it = 0; it < 8; it++) {
    for (const sweep of [cols, [...cols].reverse()]) {
      const r = rowOf(order);
      const next = new Map(order);
      for (const c of sweep) {
        const list = order.get(c)!;
        const key = new Map(list.map((id) => {
          const nb = [...g.adj.get(id)!].filter((x) => col.has(x) && col.get(x) !== c);
          let w = 0, s = 0;
          for (const x of nb) {
            const k = 1 / Math.abs(col.get(x)! - c);
            (w += k), (s += k * r.get(x)!);
          }
          let v = w ? s / w : r.get(id)!;
          // hung devices stay at the column's ends
          if (hang.has(id)) v = hang.get(id)! * 1000 + v;
          return [id, v];
        }));
        const grouped = groupOrder(g, list, key);
        next.set(c, grouped);
        r.clear();
        for (const [k, v] of rowOf(next)) r.set(k, v);
      }
      order = next;
      consider(order);
    }
  }
  // Then neighbours in a column swapped while that lowers the cost (the transpose heuristic), within a
  // group.
  order = best.order;
  for (let pass = 0, better = true; better && pass < 20; pass++) {
    better = false;
    for (const c of cols) {
      const list = order.get(c)!;
      for (let i = 0; i + 1 < list.length; i++) {
        if (hang.has(list[i]!) || hang.has(list[i + 1]!) || (g.groups.get(list[i]!) ?? "") !== (g.groups.get(list[i + 1]!) ?? "")) continue;
        const swapped = [...list];
        [swapped[i], swapped[i + 1]] = [swapped[i + 1]!, swapped[i]!];
        const before = best.cost;
        consider(new Map(order).set(c, swapped));
        if (best.cost < before) (order = best.order, (better = true));
      }
    }
  }
  return place(best.order);
}

// A column's devices by key, the devices of one group (IGP area, ring) kept together, a group where the
// mean key of its members puts it.
function groupOrder(g: ShapeGraph, list: string[], key: Map<string, number>): string[] {
  const byKey = [...list].sort((x, y) => key.get(x)! - key.get(y)! || compareNames(x, y));
  const groups = new Set(list.map((id) => g.groups.get(id) ?? ""));
  if (groups.size < 2) return byKey;
  const mean = new Map<string, number>();
  for (const grp of groups) {
    const ms = list.filter((id) => (g.groups.get(id) ?? "") === grp);
    mean.set(grp, ms.reduce((s, id) => s + key.get(id)!, 0) / ms.length);
  }
  // hung devices keep their place at the ends
  const ends = (id: string) => (key.get(id)! <= -500 ? -1 : key.get(id)! >= 500 ? 1 : 0);
  return byKey.sort((x, y) => ends(x) - ends(y) || mean.get(g.groups.get(x) ?? "")! - mean.get(g.groups.get(y) ?? "")! || compareNames(g.groups.get(x) ?? "", g.groups.get(y) ?? "") || key.get(x)! - key.get(y)! || compareNames(x, y));
}

// Rows for an order: each device as level as it can be with its neighbours in other columns (straight
// links), devices of a column at least a row apart and in order (pool-adjacent violators on the wanted
// rows), a few passes left to right and back.
function coordinates(g: ShapeGraph, order: Map<number, string[]>, col: Map<string, number>, hang: Map<string, number>): Pos {
  const y = new Map<string, number>();
  for (const list of order.values()) list.forEach((id, i) => y.set(id, i - (list.length - 1) / 2));
  const cols = [...order.keys()].sort((a, b) => a - b);
  for (let pass = 0; pass < 6; pass++) {
    for (const c of pass % 2 ? [...cols].reverse() : cols) {
      const list = order.get(c)!;
      const want = list.map((id) => {
        const nb = [...g.adj.get(id)!].filter((x) => col.has(x) && col.get(x) !== c && !hang.has(x));
        if (!nb.length || hang.has(id)) return y.get(id)!;
        const ys = nb.map((x) => y.get(x)!).sort((a, b) => a - b);
        return ys.reduce((s, v) => s + v, 0) / ys.length;
      });
      list.forEach((id, i) => y.set(id, isotonic(want, i)));
    }
  }
  // Rows centred as a whole on 0, on half steps (so mirrored pairs stay mirrored).
  const all = [...y.values()];
  const mid = (Math.min(...all) + Math.max(...all)) / 2;
  const pos: Pos = new Map();
  for (const [id, v] of y) if (!hang.has(id)) pos.set(id, { x: col.get(id)!, y: Math.round((v - mid) * 2) / 2 });
  // A hung device (its anchor's column has no room beside it): a row up or down from its anchor and
  // 0.6 of a column outward (away from the middle of the drawing), further out while that spot is taken.
  const xs = [...pos.values()].map((p) => p.x);
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
  for (const id of hang.keys()) { // in the order they were hung (breadth first)
    const nb = sorted(g.adj.get(id)!).filter((x) => pos.has(x)).map((x) => pos.get(x)!);
    const a = nb.length ? { x: nb.reduce((s, p) => s + p.x, 0) / nb.length, y: nb.reduce((s, p) => s + p.y, 0) / nb.length } : { x: col.get(id)!, y: 0 };
    const side = a.x < midX - 1e-9 ? -1 : a.x > midX + 1e-9 ? 1 : hang.get(id)!;
    const want = { x: round(a.x + 0.6 * side), y: a.y + hang.get(id)! };
    while ([...pos.values()].some((p) => Math.hypot(p.x - want.x, p.y - want.y) < 0.6)) want.x = round(want.x + 0.6 * side);
    pos.set(id, want);
  }
  return pos;
}

// Rows nearest the wanted ones keeping order and a gap of at least one: the least-squares fit of
// want[i] - i by a non-decreasing sequence (pool-adjacent violators), plus i. Returns row `at`.
function isotonic(want: number[], at: number): number {
  const v = want.map((w, i) => w - i);
  const blocks: Array<{ sum: number; n: number }> = [];
  for (const x of v) {
    blocks.push({ sum: x, n: 1 });
    while (blocks.length > 1 && blocks.at(-2)!.sum / blocks.at(-2)!.n > blocks.at(-1)!.sum / blocks.at(-1)!.n) {
      const top = blocks.pop()!;
      blocks.at(-1)!.sum += top.sum;
      blocks.at(-1)!.n += top.n;
    }
  }
  let i = 0;
  for (const bl of blocks) {
    if (at < i + bl.n) return bl.sum / bl.n + at;
    i += bl.n;
  }
  return want[at]!;
}

// ---- radial ----------------------------------------------------------------------------------------

/** Radial: the hub (linked to at least three devices and to half the piece or more, the only device
 * that is) in the middle, its spokes round it on an ellipse as wide as the card allows, what hangs off a
 * spoke further out along the same way. null when no piece has a hub. */
export function radial(g: ShapeGraph, maxColumns: number): Pos | null {
  let any = false;
  const out = perPiece(g, maxColumns, (piece) => {
    const deg = (id: string) => g.adj.get(id)!.size;
    const top = Math.max(...piece.map(deg));
    const hubs = piece.filter((id) => deg(id) === top);
    if (hubs.length !== 1 || top < 3 || top < (piece.length - 1) / 2) return piece.length <= 3 ? simpleRow(g, piece) : null;
    any = true;
    return radialPiece(g, piece, hubs[0]!, maxColumns);
  });
  return any ? out : null;
}

function simpleRow(g: ShapeGraph, piece: string[]): Pos {
  // a link or a chain of three: across
  const end = piece.find((id) => g.adj.get(id)!.size === 1) ?? piece[0]!;
  const d = hops(end, g.adj);
  return new Map(piece.map((id) => [id, { x: d.get(id) ?? 0, y: 0 }]));
}

function radialPiece(g: ShapeGraph, piece: string[], hub: string, maxColumns: number): Pos {
  const spokes = sorted(g.adj.get(hub)!);
  const spokeSet = new Set(spokes);
  // Spokes round the hub in the order that keeps links between spokes short: a walk along those links,
  // starting where they run out.
  const ring: string[] = [];
  const left = new Set(spokes);
  while (left.size) {
    const inner = (id: string) => [...g.adj.get(id)!].filter((x) => left.has(x) && spokeSet.has(x)).length;
    let cur = sorted(left).sort((a, b) => inner(a) - inner(b) || compareNames(a, b))[0]!;
    while (cur) {
      ring.push(cur);
      left.delete(cur);
      cur = sorted(g.adj.get(cur)!).find((x) => left.has(x))!;
    }
  }
  const k = ring.length;
  const card = Number.isFinite(maxColumns);
  const rx = card ? Math.max(1, Math.min((maxColumns - 1) / 2, 1 + k / 6)) : Math.max(1.2, k / 4);
  const ry = card ? 1 : rx;
  const pos: Pos = new Map([[hub, { x: 0, y: 0 }]]);
  const angle = new Map<string, number>();
  ring.forEach((id, i) => {
    const a = Math.PI + (2 * Math.PI * i) / k + (k % 2 ? 0 : Math.PI / k);
    angle.set(id, a);
    pos.set(id, { x: rx * Math.cos(a), y: ry * Math.sin(a) });
  });
  // Further devices: outward along the mean way of their placed neighbours, fanned when several share it.
  const d = hops(hub, g.adj);
  const rest = sorted(piece.filter((id) => !pos.has(id))).sort((a, b) => (d.get(a) ?? 0) - (d.get(b) ?? 0) || compareNames(a, b));
  const fan = new Map<string, number>();
  for (const id of rest) {
    const nb = sorted(g.adj.get(id)!).filter((x) => angle.has(x));
    if (!nb.length) continue;
    const sx = nb.reduce((s, x) => s + Math.cos(angle.get(x)!), 0), sy = nb.reduce((s, x) => s + Math.sin(angle.get(x)!), 0);
    const base = Math.atan2(sy, sx);
    const key = nb.join("|");
    const j = fan.get(key) ?? 0;
    fan.set(key, j + 1);
    const a = base + (j ? (j % 2 ? 1 : -1) * Math.ceil(j / 2) * 0.35 : 0);
    const r = 1 + (d.get(id) ?? 2) - 1;
    angle.set(id, a);
    pos.set(id, { x: rx * r * Math.cos(a), y: ry * r * Math.sin(a) });
  }
  for (const id of piece) if (!pos.has(id)) pos.set(id, { x: 0, y: 2 });
  return pos;
}

// ---- stress ----------------------------------------------------------------------------------------

/** Stress majorisation over the hops between devices (weights 1 / hops²), from devices on a circle in
 * breadth-first order; turned so its long side runs across, scaled to a mean link length of 1 and, on a
 * card, into max_columns by three rows. */
export function stress(g: ShapeGraph, maxColumns: number): Pos | null {
  return perPiece(g, maxColumns, (piece) => (piece.length < 3 ? simpleRow(g, piece) : stressPiece(g, piece, maxColumns)));
}

function stressPiece(g: ShapeGraph, piece: string[], maxColumns: number): Pos {
  const n = piece.length;
  const index = new Map(piece.map((id, i) => [id, i]));
  const D = piece.map((id) => {
    const d = hops(id, g.adj);
    return piece.map((x) => d.get(x) ?? n);
  });
  const hub = [...piece].sort((a, b) => g.adj.get(b)!.size - g.adj.get(a)!.size || compareNames(a, b))[0]!;
  const bfs = [...hops(hub, g.adj).keys()].filter((id) => index.has(id));
  const X = piece.map(() => ({ x: 0, y: 0 }));
  bfs.forEach((id, k) => {
    const a = (2 * Math.PI * k) / n;
    X[index.get(id)!] = { x: Math.cos(a) * n / 4, y: Math.sin(a) * n / 4 };
  });
  for (let it = 0; it < 300; it++) {
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, sw = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const d = D[i]![j]!, w = 1 / (d * d);
        const dx = X[i]!.x - X[j]!.x, dy = X[i]!.y - X[j]!.y;
        const len = Math.hypot(dx, dy) || 1e-6;
        sx += w * (X[j]!.x + (d * dx) / len);
        sy += w * (X[j]!.y + (d * dy) / len);
        sw += w;
      }
      X[i] = { x: sx / sw, y: sy / sw };
    }
  }
  // the long side across (principal axis), the smallest name to the left and up
  const cx = X.reduce((s, p) => s + p.x, 0) / n, cy = X.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of X) (sxx += (p.x - cx) ** 2), (syy += (p.y - cy) ** 2), (sxy += (p.x - cx) * (p.y - cy));
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  let P = X.map((p) => ({ x: (p.x - cx) * Math.cos(th) + (p.y - cy) * Math.sin(th), y: -(p.x - cx) * Math.sin(th) + (p.y - cy) * Math.cos(th) }));
  const first = index.get(sorted(piece)[0]!)!;
  if (P[first]!.x > 1e-6) P = P.map((p) => ({ x: -p.x, y: p.y }));
  if (P[first]!.y > 1e-6) P = P.map((p) => ({ x: p.x, y: -p.y }));
  // a mean link length of 1, then squeezed into the card
  const links = piece.flatMap((a) => [...g.adj.get(a)!].filter((b) => index.has(b) && compareNames(a, b) < 0).map((b) => [index.get(a)!, index.get(b)!]));
  const mean = links.reduce((s, [i, j]) => s + Math.hypot(P[i!]!.x - P[j!]!.x, P[i!]!.y - P[j!]!.y), 0) / (links.length || 1) || 1;
  P = P.map((p) => ({ x: p.x / mean, y: p.y / mean }));
  if (Number.isFinite(maxColumns)) {
    const span = (k: "x" | "y") => Math.max(...P.map((p) => p[k])) - Math.min(...P.map((p) => p[k]));
    const sx = span("x") > maxColumns - 1 ? (maxColumns - 1) / span("x") : 1;
    const sy = span("y") > 2 ? 2 / span("y") : 1;
    P = P.map((p) => ({ x: p.x * sx, y: p.y * sy }));
  }
  return new Map(piece.map((id, i) => [id, { x: round(P[i]!.x), y: round(P[i]!.y) }]));
}

/** Moves a device that sits on a link it is not an end of a little aside (a third of a column across,
 * else half a row up or down), where that clears the link and adds no crossing; in name order. */
export function clearLinks(pos: Pos, edges: Array<[string, string]>): Pos {
  const es = edges.filter(([a, b]) => pos.has(a) && pos.has(b));
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (const id of sorted(pos.keys())) {
      const on = (at: Pos) => es.some(([a, b]) => a !== id && b !== id && onSegment(at.get(id)!, at.get(a)!, at.get(b)!));
      if (!on(pos)) continue;
      const base = { through: throughCount(pos, es), crossings: crossingCount(pos, es) };
      const p = pos.get(id)!;
      for (const [dx, dy] of [[0.35, 0], [-0.35, 0], [0, -0.5], [0, 0.5], [0.35, -0.5], [-0.35, 0.5]] as const) {
        const next = new Map(pos).set(id, { x: round(p.x + dx), y: round(p.y + dy) });
        const crowded = [...next].some(([o, q]) => o !== id && Math.hypot(q.x - next.get(id)!.x, q.y - next.get(id)!.y) < 0.6);
        if (!crowded && !on(next) && throughCount(next, es) < base.through && crossingCount(next, es) <= base.crossings) {
          pos.set(id, next.get(id)!);
          moved = true;
          break;
        }
      }
    }
    if (!moved) break;
  }
  return pos;
}

const onSegment = (p: Point, a: Point, b: Point) => {
  const { d, t } = segmentDistance(p, a, b);
  return d < 0.2 && t > 0.01 && t < 0.99;
};

// ---- score -----------------------------------------------------------------------------------------

/** What the score counts, and the score: lower is better. */
export interface LayoutScore {
  score: number;
  crossings: number;
  through: number;
  crowded: number;
  badges: number;
  evenness: number;
  width: number;
  height: number;
}

const o = (p: Point, q: Point, r: Point) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
const segmentsCross = (p1: Point, p2: Point, p3: Point, p4: Point) => o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0;
function segmentDistance(p: Point, a: Point, b: Point): { d: number; t: number } {
  const dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0;
  return { d: Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy), t };
}

function crossingCount(pos: Pos, edges: Array<[string, string]>): number {
  let n = 0;
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i]!;
    for (let j = i + 1; j < edges.length; j++) {
      const [c, d] = edges[j]!;
      if (a === c || a === d || b === c || b === d) continue;
      if (segmentsCross(pos.get(a)!, pos.get(b)!, pos.get(c)!, pos.get(d)!)) n++;
    }
  }
  return n;
}

function throughCount(pos: Pos, edges: Array<[string, string]>, near = 0.2): number {
  let n = 0;
  for (const [a, b] of edges) {
    for (const [id, r] of pos) {
      if (id === a || id === b) continue;
      const { d, t } = segmentDistance(r, pos.get(a)!, pos.get(b)!);
      if (d < near && t > 0.01 && t < 0.99) n++;
    }
  }
  return n;
}

// Port badges that find no place at full size on their link, laid out as a card frame draws them (in
// font units: a column 12.3 apart, a row 7.6; a device box 2.6 by 1.6; its label of two lines, at least
// 3 wide, above it in the top half of the drawing and below it in the bottom half; a badge 1.8 by 1.1;
// sizes fitted to what the card frames draw on a large set of labs). Each badge slides from
// its device's box toward the middle of its link until it clears the boxes, the labels and the badges
// placed before it; one that finds no such spot counts. `edges` may list a pair more than once
// (parallel links, drawn side by side).
function badgeCollisions(pos: Pos, edges: Array<[string, string]>, names: boolean): number {
  type Box = { x: number; y: number; w: number; h: number };
  const U = 12.3, V = 7.6, PAD = 0.15;
  const at = new Map([...pos].map(([id, p]) => [id, { x: p.x * U, y: p.y * V }]));
  const ys = [...at.values()].map((p) => p.y);
  const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
  const taken: Box[] = [];
  for (const [id, p] of at) {
    taken.push({ x: p.x - 1.3, y: p.y - 0.8, w: 2.6, h: 1.6 });
    const w = Math.max(names ? id.length * 0.62 : 0, 3) + 0.6;
    const below = p.y > mid + 1e-9;
    taken.push({ x: p.x - w / 2, y: below ? p.y + 1 : p.y - 1 - 2.6, w, h: 2.6 });
  }
  const hits = (r: Box) => taken.some((q) => r.x < q.x + q.w + PAD && q.x < r.x + r.w + PAD && r.y < q.y + q.h + PAD && q.y < r.y + r.h + PAD);
  const count = new Map<string, number>(), seen = new Map<string, number>();
  const key = (a: string, b: string) => [a, b].sort(compareNames).join("|");
  for (const [a, b] of edges) count.set(key(a, b), (count.get(key(a, b)) ?? 0) + 1);
  let n = 0;
  for (const [a, b] of edges) {
    if (!at.has(a) || !at.has(b)) continue;
    const k = key(a, b), i = seen.get(k) ?? 0;
    seen.set(k, i + 1);
    const p = at.get(a)!, q = at.get(b)!;
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const ux = (q.x - p.x) / len, uy = (q.y - p.y) / len;
    const off = (i - (count.get(k)! - 1) / 2) * 0.9;
    for (const [from, dir] of [[p, 1], [q, -1]] as const) {
      const bw = 1.8, bh = 1.1;
      const tx = Math.abs(ux) > 1e-6 ? (1.3 + bw / 2 + PAD) / Math.abs(ux) : Infinity;
      const ty = Math.abs(uy) > 1e-6 ? (0.8 + bh / 2 + PAD) / Math.abs(uy) : Infinity;
      let placed = false;
      for (let t = Math.min(tx, ty); t <= len / 2 + 1e-6; t += 0.35) {
        const c = { x: from.x + dir * ux * t - uy * off, y: from.y + dir * uy * t + ux * off };
        const r = { x: c.x - bw / 2, y: c.y - bh / 2, w: bw, h: bh };
        if (!hits(r)) {
          taken.push(r);
          placed = true;
          break;
        }
      }
      if (!placed) n++;
    }
  }
  return n;
}

// The weights: a crossing costs as much as 4 units of misfit, a link through a device 6.
const W = { crossing: 4, through: 6, crowded: 6, badge: 1.5, evenness: 3, wide: 1.5, tall: 2, portrait: 2, area: 1.5 };

/** The score of positions for the links `edges` (pairs of names, smaller first; a pair once per link, so
 * parallel links repeat it). `maxColumns` Infinity: no card. */
export function scoreLayout(pos: Pos, edges: Array<[string, string]>, maxColumns: number, names = true): LayoutScore {
  const once = new Set<string>();
  const es = edges.filter(([a, b]) => pos.has(a) && pos.has(b) && !once.has(`${a}|${b}`) && !!once.add(`${a}|${b}`));
  const crossings = crossingCount(pos, es);
  const through = throughCount(pos, es);
  const ids = [...pos.keys()];
  let crowded = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const p = pos.get(ids[i]!)!, q = pos.get(ids[j]!)!;
    if (Math.hypot(p.x - q.x, p.y - q.y) < 0.6) crowded++;
  }
  const lens = es.map(([a, b]) => Math.hypot(pos.get(a)!.x - pos.get(b)!.x, pos.get(a)!.y - pos.get(b)!.y));
  const badges = badgeCollisions(pos, edges, names);
  const mean = lens.reduce((s, v) => s + v, 0) / (lens.length || 1);
  const evenness = lens.length && mean ? Math.sqrt(lens.reduce((s, v) => s + (v - mean) ** 2, 0) / lens.length) / mean : 0;
  const xs = ids.map((id) => pos.get(id)!.x), ys = ids.map((id) => pos.get(id)!.y);
  const width = Math.max(...xs) - Math.min(...xs) + 1, height = Math.max(...ys) - Math.min(...ys) + 1;
  let fit = 0;
  if (Number.isFinite(maxColumns)) fit += W.wide * Math.max(0, width - maxColumns) + W.tall * Math.max(0, height - 3);
  if (ids.length > 2) fit += W.portrait * Math.max(0, height - width + 0.5);
  // compact: the box's area per device
  fit += (W.area * width * height) / ids.length;
  const score = W.crossing * crossings + W.through * through + W.crowded * crowded + W.badge * badges + W.evenness * evenness + fit;
  const r2 = (v: number) => Math.round(v * 100) / 100 + 0;
  return { score: r2(score), crossings, through, crowded, badges, evenness: r2(evenness), width: r2(width), height: r2(height) };
}
