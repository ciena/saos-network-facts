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

test("longestCycle: the longest simple cycle from its smallest name", () => {
  const adj = new Map<string, Set<string>>([
    ["A", new Set(["B", "C"])], ["B", new Set(["A", "C", "D"])], ["C", new Set(["A", "B", "D"])], ["D", new Set(["B", "C"])],
  ]);
  assert.deepEqual(longestCycle(["D", "C", "B", "A"], adj), ["A", "B", "D", "C"]);
  assert.deepEqual(longestCycle(["A", "B"], new Map([["A", new Set(["B"])], ["B", new Set(["A"])]])), []);
});
