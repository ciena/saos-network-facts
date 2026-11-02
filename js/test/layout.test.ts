// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { test } from "node:test";
import { forceLayout, layoutFacts, longestCycle, resolveView, type LayoutModel, type Point } from "../src/index.ts";

// A ring of `n` routers R1..Rn (role pe or p), each PE with a CE hung off it.
function ringLab(n: number, { roles = "p", ces = [] as number[] } = {}): LayoutModel {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `R${i + 1}`, role: roles }));
  const links = nodes.map((r, i) => ({ id: `l${i}`, a: { node: r.id }, b: { node: nodes[(i + 1) % n]!.id } }));
  for (const i of ces) {
    nodes.push({ id: `CE${i}`, role: "ce" });
    links.push({ id: `ce${i}`, a: { node: `R${i}` }, b: { node: `CE${i}` } });
  }
  return { nodes, links };
}

const minDistance = (positions: Record<string, Point>) => {
  const pts = Object.values(positions);
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y));
  return min;
};
const spanX = (positions: Record<string, Point>) => {
  const xs = Object.values(positions).map((p) => p.x);
  return Math.max(...xs) - Math.min(...xs);
};
const ends = (model: LayoutModel) =>
  model.links.map((l) => [l.a, l.b].map((e) => (typeof e === "string" ? e : (e.node ?? e.device)!)) as [string, string]);
// Links that run through a device (not at their ends), and pairs of links that cross.
const through = (model: LayoutModel, positions: Record<string, Point>) => {
  const out: string[] = [];
  for (const [a, b] of ends(model)) {
    const p = positions[a]!, q = positions[b]!;
    for (const [id, r] of Object.entries(positions)) {
      if (id === a || id === b) continue;
      const dx = q.x - p.x, dy = q.y - p.y, len = dx * dx + dy * dy;
      const t = len ? Math.max(0, Math.min(1, ((r.x - p.x) * dx + (r.y - p.y) * dy) / len)) : 0;
      if (Math.hypot(r.x - p.x - t * dx, r.y - p.y - t * dy) < 0.15 && t > 0.02 && t < 0.98) out.push(`${a}-${b} through ${id}`);
    }
  }
  return out;
};
const crossings = (model: LayoutModel, positions: Record<string, Point>) => {
  const e = ends(model);
  const o = (p: Point, q: Point, r: Point) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  let n = 0;
  for (let i = 0; i < e.length; i++) {
    for (let j = i + 1; j < e.length; j++) {
      const [a, b] = e[i]!, [c, d] = e[j]!;
      if (new Set([a, b, c, d]).size < 4) continue;
      const [p1, p2, p3, p4] = [a, b, c, d].map((id) => positions[id]!) as [Point, Point, Point, Point];
      if (o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0) n++;
    }
  }
  return n;
};
const CARD = { aspect: "card", max_columns: 4 } as const;

// Deterministic shuffle (reverse, then interleave), so the test itself is repeatable.
const shuffle = <T>(list: T[]): T[] => {
  const r = [...list].reverse();
  return [...r.filter((_, i) => i % 2), ...r.filter((_, i) => !(i % 2))];
};

test("a ring of routers is a ladder: two rows, its CEs hung off the ends", () => {
  const out = layoutFacts(ringLab(8, { ces: [1, 5] }));
  assert.equal(out.method, "ladder");
  assert.deepEqual(out.warnings, []);
  assert.deepEqual(out.core, ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]);
  const rows = new Set(out.core.map((id) => out.positions[id]!.y));
  assert.ok(rows.size <= 3, `rows ${[...rows]}`);
  assert.ok(minDistance(out.positions) >= 0.5);
  // top left at 0, 0
  assert.equal(Math.min(...Object.values(out.positions).map((p) => p.x)), 0);
  assert.equal(Math.min(...Object.values(out.positions).map((p) => p.y)), 0);
});

test("deterministic: the same lab in any order gives the same positions", () => {
  const lab = ringLab(10, { roles: "pe", ces: [1, 3, 6] });
  const a = layoutFacts(lab);
  assert.deepEqual(layoutFacts(lab), a);
  assert.deepEqual(layoutFacts({ nodes: shuffle(lab.nodes), links: shuffle(lab.links) }), a);
  const card = { aspect: "card", max_columns: 4 } as const;
  assert.deepEqual(layoutFacts({ nodes: shuffle(lab.nodes), links: shuffle(lab.links) }, card), layoutFacts(lab, card));
});

test("aspect card: a 10-device ring wraps to max_columns, round a rectangle", () => {
  const lab = ringLab(10, { ces: [2, 7] });
  assert.ok(spanX(layoutFacts(lab).positions) > 3);
  for (const max of [4, 3, 2]) {
    const out = layoutFacts(lab, { aspect: "card", max_columns: max });
    assert.ok(spanX(out.positions) <= max - 1 + 1e-9, `max ${max}: span ${spanX(out.positions)}`);
    assert.ok(minDistance(out.positions) >= 0.5, `max ${max}`);
  }
  assert.equal(layoutFacts(lab, { aspect: "card", max_columns: 4 }).method, "rectangle");
  // A ring that fits stays a ladder on a card.
  assert.equal(layoutFacts(ringLab(6), { aspect: "card", max_columns: 4 }).method, "ladder");
  // max_columns only matters on a card.
  assert.deepEqual(layoutFacts(lab, { aspect: "free", max_columns: 2 }), layoutFacts(lab));
});

test("aspect card: a chain wraps into bands, still joined", () => {
  const nodes = Array.from({ length: 10 }, (_, i) => ({ id: `PE${i + 1}`, role: "pe" }));
  const links = nodes.slice(1).map((n, i) => ({ a: nodes[i]!.id, b: n.id }));
  const free = layoutFacts({ nodes, links });
  assert.equal(free.method, "columns");
  assert.equal(spanX(free.positions), 9);
  const card = layoutFacts({ nodes, links }, { aspect: "card", max_columns: 4 });
  assert.equal(spanX(card.positions), 3);
  assert.ok(minDistance(card.positions) >= 0.5);
  // the snake: PE4 and PE5 are one band apart in the same column
  assert.equal(card.positions.PE4!.x, card.positions.PE5!.x);
});

test("the core: IGP routers first, else the G.8032 ring, else the longest cycle; a plain box in the path joins it", () => {
  // Routers on a square, an L2 switch triangle hanging off R1: the routers are the core.
  const igp = ringLab(4, { roles: "pe" });
  igp.nodes.push({ id: "S1", role: "ce" }, { id: "S2", role: "ce" });
  igp.links.push({ a: "R1", b: "S1" }, { a: "S1", b: "S2" }, { a: "S2", b: "R1" });
  assert.deepEqual(layoutFacts(igp).core, ["R1", "R2", "R3", "R4"]);

  // No IGP router: the ring members, in ring order from the ring's links (ids or pairs).
  const ring: LayoutModel = {
    nodes: ["A", "B", "C", "D", "E"].map((id) => ({ id, role: "ce" })),
    links: [
      { id: "ab", a: "A", b: "B" }, { id: "bc", a: "B", b: "C" }, { id: "cd", a: "C", b: "D" }, { id: "da", a: "D", b: "A" }, { id: "de", a: "D", b: "E" },
    ],
    rings: [{ name: "ring_1", nodes: [{ node: "A" }, { node: "B" }, { node: "C" }, "D"], links: ["ab", "bc", ["C", "D"], "da"] }],
  };
  const r = layoutFacts(ring);
  assert.deepEqual(r.core, ["A", "B", "C", "D"]);
  assert.equal(r.description, "ladder on G.8032 ring ring_1");

  // Neither: the longest cycle. A plain box between two core devices is core.
  const cyc: LayoutModel = {
    nodes: [{ id: "X1" }, { id: "X2" }, { id: "X3" }, { id: "X4" }, { id: "LS", plain: true }, { id: "BOX", plain: true }],
    links: [{ a: "X1", b: "X2" }, { a: "X2", b: "X3" }, { a: "X3", b: "X1" }, { a: "X1", b: "LS" }, { a: "LS", b: "X3" }, { a: "X3", b: "X4" }, { a: "X4", b: "BOX" }],
  };
  const c = layoutFacts(cyc);
  assert.equal(c.description, "ladder on the longest cycle");
  assert.deepEqual(c.core, ["LS", "X1", "X2", "X3"]);
  assert.ok(minDistance(c.positions) >= 0.5);
});

test("hints: used when they place every device, else reported and the computed layout used", () => {
  const lab = ringLab(4);
  const all = { R1: [100, 100], R2: [300, 100], R3: [300, 300], R4: [100, 300] } as Record<string, [number, number]>;
  const used = layoutFacts(lab, { hints: all });
  assert.equal(used.method, "hints");
  assert.deepEqual(used.positions, { R1: { x: 0, y: 0 }, R2: { x: 1, y: 0 }, R3: { x: 1, y: 1 }, R4: { x: 0, y: 1 } });
  assert.equal(layoutFacts(lab, { algorithm: "hints", hints: all }).method, "hints");

  const partial = layoutFacts(lab, { algorithm: "hints", hints: { R1: [0, 0], R2: [1, 0] } });
  assert.equal(partial.method, "ladder");
  assert.deepEqual(partial.warnings, ["layout hints place 2 of 4 devices (none for R3, R4): the computed layout is used"]);
  assert.deepEqual(partial.positions, layoutFacts(lab).positions);
  assert.deepEqual(layoutFacts(lab, { algorithm: "hints" }).warnings, ["layout algorithm hints without hints: the computed layout is used"]);
  // the resolved defaults (hints {}) are the automatic layout, no warning
  assert.deepEqual(layoutFacts(lab, resolveView().view.layout), layoutFacts(lab));
});

test("force: the force-directed layout, hints ignored", () => {
  const lab = ringLab(6, { ces: [1] });
  const out = layoutFacts(lab, { algorithm: "force", hints: { R1: [0, 0] } });
  assert.equal(out.method, "force");
  assert.deepEqual(out.warnings, []);
  assert.deepEqual(layoutFacts(lab, { algorithm: "force" }), out);
  assert.deepEqual(Object.keys(out.positions).sort(), lab.nodes.map((n) => n.id).sort());
  assert.ok(minDistance(out.positions) > 0.3);
  assert.deepEqual(forceLayout(["A"], []), { A: { x: 0.5, y: 0 } });
  assert.deepEqual(forceLayout([], []), {});
});

test("edge cases: no devices, one device, islands, links to unknown devices", () => {
  assert.deepEqual(layoutFacts({ nodes: [], links: [] }).positions, {});
  assert.deepEqual(layoutFacts({ nodes: [{ id: "PE1", role: "pe" }], links: [] }).positions, { PE1: { x: 0, y: 0 } });
  const lab = ringLab(4, { ces: [1] });
  lab.nodes.push({ id: "LONE1", role: "ce" }, { id: "LONE2", plain: true });
  lab.links.push({ a: "R2", b: "GHOST" }, { a: "R3", b: "R3" });
  const out = layoutFacts(lab, { aspect: "card", max_columns: 2 });
  assert.ok(minDistance(out.positions) >= 0.5);
  assert.ok(spanX(out.positions) <= 1);
  assert.equal(out.positions.LONE1!.y, out.positions.LONE2!.y);
});

// ---- the rules from laying out a large set of lab topologies -----------------------------------------

test("no router, ring or cycle: the linked devices in columns by hops, not a row by name", () => {
  // A chain of three switches (no IGP) with a stub on each end and one off the middle.
  const lab: LayoutModel = {
    nodes: ["ACC-1", "ACC-2", "AGG", "STUB-1", "STUB-2", "STUB-3"].map((id) => ({ id, role: "ce" })),
    links: [{ a: "STUB-1", b: "ACC-1" }, { a: "ACC-1", b: "AGG" }, { a: "AGG", b: "ACC-2" }, { a: "ACC-2", b: "STUB-2" }, { a: "AGG", b: "STUB-3" }],
  };
  for (const layout of [{}, CARD]) {
    const out = layoutFacts(lab, layout);
    assert.equal(out.method, "columns");
    assert.equal(out.description, "columns by hops (no router, ring or cycle)");
    assert.deepEqual(out.core, ["ACC-1", "ACC-2", "AGG"]);
    const p = out.positions;
    assert.equal(p["ACC-1"]!.y, p.AGG!.y);
    assert.equal(p.AGG!.y, p["ACC-2"]!.y);
    assert.ok(Math.abs(p["ACC-1"]!.x - p["ACC-2"]!.x) === 2, "the chain runs across");
    assert.deepEqual(through(lab, p), []);
    assert.equal(crossings(lab, p), 0);
    assert.ok(minDistance(p) >= 0.5);
  }
  // Two devices and a link: still columns.
  assert.equal(layoutFacts({ nodes: [{ id: "A" }, { id: "B" }], links: [{ a: "A", b: "B" }] }).method, "columns");
  // No link at all: a row.
  assert.equal(layoutFacts({ nodes: [{ id: "A" }, { id: "B" }], links: [] }).method, "none");
});

test("a device linked to two placed devices sits between them, off their link", () => {
  // A CE dual-homed to two PEs of a triangle core, and a second CE behind the first.
  const lab: LayoutModel = {
    nodes: [{ id: "P1", role: "p" }, { id: "PE1", role: "pe" }, { id: "PE2", role: "pe" }, { id: "PE3", role: "pe" }, { id: "PE4", role: "pe" }, { id: "CE-1", role: "ce" }, { id: "CE-9", role: "ce" }],
    links: [
      { a: "PE1", b: "PE2" }, { a: "PE1", b: "P1" }, { a: "PE2", b: "P1" }, { a: "P1", b: "PE3" }, { a: "P1", b: "PE4" },
      { a: "CE-1", b: "PE1" }, { a: "CE-1", b: "PE2" }, { a: "CE-9", b: "PE3" },
    ],
  };
  for (const layout of [{}, CARD]) {
    const p = layoutFacts(lab, layout).positions;
    const [a, b] = [p.PE1!, p.PE2!];
    assert.ok(p["CE-1"]!.x >= Math.min(a.x, b.x) - 1e-9 && p["CE-1"]!.x <= Math.max(a.x, b.x) + 1e-9, `CE-1 between its PEs (${JSON.stringify(p)})`);
    assert.deepEqual(through(lab, p), []);
    assert.ok(minDistance(p) >= 0.5);
  }
});

test("a second cycle linked to the core joins it (routers without an IGP on a ring of their own)", () => {
  // Four IGP PEs on a square; four MPLS-TP nodes (no IGP, so not P or PE) on a square of their own,
  // linked to two of the PEs; a CE dual-homed to the far side.
  const lab = ringLab(4, { roles: "pe" });
  for (const id of ["T1", "T2", "T3", "T4", "CE"]) lab.nodes.push({ id, role: "ce" });
  lab.links.push({ a: "T1", b: "T2" }, { a: "T2", b: "T3" }, { a: "T3", b: "T4" }, { a: "T4", b: "T1" }, { a: "R1", b: "T1" }, { a: "R2", b: "T2" }, { a: "CE", b: "T3" }, { a: "CE", b: "T4" });
  const out = layoutFacts(lab);
  for (const id of ["T1", "T2", "T3", "T4"]) assert.ok(out.core.includes(id), id);
  assert.equal(out.method, "ladder");
  assert.deepEqual(through(lab, out.positions), []);
  assert.equal(crossings(lab, out.positions), 0);
  // A host on two routers is not a cycle of its own: it stays outside the core.
  const hosted = ringLab(4, { roles: "pe" });
  hosted.nodes.push({ id: "h1", role: "ce", host: true });
  hosted.links.push({ a: "h1", b: "R1" }, { a: "h1", b: "R2" });
  assert.ok(!layoutFacts(hosted).core.includes("h1"));
});

test("aspect card: the rectangle chooses its split, and an untangling pass removes crossings", () => {
  // Four core switches fully meshed, a chain of four between two of them on each side (its ends
  // linked to the other pair too), and a box on two of the core switches on each side: a 14-device
  // cycle with many rungs (no IGP: the longest cycle is the core).
  const nodes = ["C1", "C2", "C3", "C4", "E1", "E2", "E3", "E4", "W1", "W2", "W3", "W4", "X1", "X2"].map((id) => ({ id, role: "ce" }));
  const pairs: Array<[string, string]> = [
    ["C1", "C2"], ["C1", "C3"], ["C1", "C4"], ["C2", "C3"], ["C2", "C4"], ["C3", "C4"],
    ["C1", "E1"], ["E1", "E2"], ["E2", "E3"], ["E3", "E4"], ["E4", "C2"], ["E1", "C3"], ["E4", "C4"],
    ["C3", "W1"], ["W1", "W2"], ["W2", "W3"], ["W3", "W4"], ["W4", "C4"], ["W1", "C1"], ["W4", "C2"],
    ["X1", "C1"], ["X1", "C3"], ["X2", "C2"], ["X2", "C4"],
  ];
  const lab: LayoutModel = { nodes, links: pairs.map(([a, b]) => ({ a, b })) };
  const card = layoutFacts(lab, CARD);
  assert.equal(card.method, "rectangle");
  assert.ok(spanX(card.positions) <= 3 + 1e-9);
  assert.ok(minDistance(card.positions) >= 0.5);
  assert.deepEqual(through(lab, card.positions), []);
  assert.ok(crossings(lab, card.positions) <= 5, `card crossings ${crossings(lab, card.positions)}`);
  // A 10-device ring with two rungs fits a 4-column card without a crossing.
  const ring = ringLab(10, { roles: "pe", ces: [1, 6] });
  ring.links.push({ a: "R2", b: "R9" }, { a: "R4", b: "R7" });
  const r = layoutFacts(ring, CARD);
  assert.equal(crossings(ring, r.positions), 0);
  assert.deepEqual(through(ring, r.positions), []);
});

test("no device lands on a link: hung, dual-homed and off-cycle devices avoid every placed link", () => {
  const labs: LayoutModel[] = [];
  for (const n of [4, 6, 8, 10, 12]) {
    const lab = ringLab(n, { roles: "pe", ces: [1, 2, Math.ceil(n / 2)] });
    lab.nodes.push({ id: "MID", role: "p" }, { id: "DUAL", role: "ce" }, { id: "HOST", role: "ce", host: true });
    lab.links.push({ a: "MID", b: "R1" }, { a: "MID", b: `R${Math.ceil(n / 2) + 1}` }, { a: "DUAL", b: "R2" }, { a: "DUAL", b: "R3" }, { a: "HOST", b: "CE1" });
    labs.push(lab);
  }
  for (const lab of labs) {
    for (const layout of [{}, CARD, { aspect: "card", max_columns: 3 } as const]) {
      const p = layoutFacts(lab, layout).positions;
      assert.deepEqual(through(lab, p), [], `${lab.nodes.length} devices, ${JSON.stringify(layout)}`);
      assert.ok(minDistance(p) >= 0.5);
      if (layout !== CARD && "aspect" in layout) assert.ok(spanX(p) <= 2 + 1e-9);
    }
  }
});

test("hints: a hint for NAME places devices NAME-*, and plain boxes without a hint go beside their neighbours", () => {
  // A diagram with one box for a line system the facts list shelf by shelf (LS-O-1, LS-T-1), and a
  // plain box the diagram does not show.
  const lab: LayoutModel = {
    nodes: [{ id: "PE1", role: "pe" }, { id: "PE2", role: "pe" }, { id: "LS-O-1", plain: true }, { id: "LS-T-1", plain: true }, { id: "PATCH", plain: true }],
    links: [{ a: "PE1", b: "LS-O-1" }, { a: "LS-O-1", b: "LS-T-1" }, { a: "LS-T-1", b: "PE2" }, { a: "PE2", b: "PATCH" }],
  };
  const hints = { PE1: [0, 0], LS: [200, 0], PE2: [400, 0] } as Record<string, [number, number]>;
  const out = layoutFacts(lab, { hints });
  assert.equal(out.method, "hints");
  assert.deepEqual(out.warnings, []);
  assert.equal(out.description, "the hints, scaled (LS-O-1, LS-T-1 at LS; PATCH beside their neighbours)");
  const p = out.positions;
  assert.ok(minDistance(p) >= 0.5);
  assert.ok(p.PE1!.x < p["LS-O-1"]!.x && p["LS-T-1"]!.x < p.PE2!.x, "the shelves sit where the diagram has LS");
  assert.ok(Math.hypot(p.PATCH!.x - p.PE2!.x, p.PATCH!.y - p.PE2!.y) < 1.5, "PATCH beside PE2");
  // The same with a device of the facts (not a plain box) missing: the computed layout, with a warning.
  const routers = { ...lab, nodes: [...lab.nodes, { id: "PE3", role: "pe" }], links: [...lab.links, { a: "PE3", b: "PE2" }] };
  const partial = layoutFacts(routers, { hints });
  assert.notEqual(partial.method, "hints");
  assert.deepEqual(partial.warnings, ["layout hints place 4 of 6 devices (none for PATCH, PE3): the computed layout is used"]);
  // A hint for a name that is itself a device covers only that device.
  const own = layoutFacts({ nodes: [{ id: "LS" }, { id: "LS-1", role: "pe" }], links: [] }, { hints: { LS: [0, 0] } });
  assert.notEqual(own.method, "hints");
});

test("longestCycle: the longest simple cycle from its smallest name", () => {
  const adj = new Map<string, Set<string>>([
    ["A", new Set(["B", "C"])], ["B", new Set(["A", "C", "D"])], ["C", new Set(["A", "B", "D"])], ["D", new Set(["B", "C"])],
  ]);
  assert.deepEqual(longestCycle(["D", "C", "B", "A"], adj), ["A", "B", "D", "C"]);
  assert.deepEqual(longestCycle(["A", "B"], new Map([["A", new Set(["B"])], ["B", new Set(["A"])]])), []);
});
