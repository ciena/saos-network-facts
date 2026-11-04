// SPDX-License-Identifier: Apache-2.0
// The layout candidates (tiers, radial, stress), the score and the choice between them: one test per rule.
import assert from "node:assert/strict";
import { test } from "node:test";
import { layoutFacts, type LayoutModel, type Point } from "../src/index.ts";
import { scoreLayout, stress } from "../src/layout-shapes.ts";

const CARD = { aspect: "card", max_columns: 4 } as const;
const links = (pairs: string) => pairs.split(" ").map((p) => ({ a: p.split("-")[0]!, b: p.split("-")[1]! }));
const lab = (nodes: Array<[string, string?, string?]>, pairs: string): LayoutModel => ({
  nodes: nodes.map(([id, role, group]) => ({ id, ...(role === "plain" ? { plain: true } : role ? { role } : {}), ...(group ? { group } : {}) })),
  links: links(pairs),
});
const crossings = (m: LayoutModel, p: Record<string, Point>) => {
  const e = m.links.map((l) => [l.a, l.b] as [string, string]);
  const o = (a: Point, b: Point, c: Point) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  let n = 0;
  for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) {
    const [a, b] = e[i]!, [c, d] = e[j]!;
    if (new Set([a, b, c, d]).size < 4) continue;
    if (o(p[a]!, p[b]!, p[c]!) * o(p[a]!, p[b]!, p[d]!) < 0 && o(p[c]!, p[d]!, p[a]!) * o(p[c]!, p[d]!, p[b]!) < 0) n++;
  }
  return n;
};
const spanX = (p: Record<string, Point>) => Math.max(...Object.values(p).map((q) => q.x)) - Math.min(...Object.values(p).map((q) => q.x));
const shuffle = <T>(list: T[]): T[] => {
  const r = [...list].reverse();
  return [...r.filter((_, i) => i % 2), ...r.filter((_, i) => !(i % 2))];
};

// Two PE pairs either side of two P routers, a CE dual-homed to each PE pair.
const roles = lab(
  [["PE1", "pe"], ["PE2", "pe"], ["PE3", "pe"], ["PE4", "pe"], ["P1", "p"], ["P2", "p"], ["CEA", "ce"], ["CEB", "ce"]],
  "PE1-P1 PE2-P2 PE1-PE2 P1-P2 P1-PE3 P2-PE4 PE3-PE4 CEA-PE1 CEA-PE2 CEB-PE3 CEB-PE4",
);

test("roles: CE | PE | P | PE | CE, left to right", () => {
  for (const layout of [{}, CARD]) {
    const out = layoutFacts(roles, layout);
    // the tiers are a candidate; the chosen layout (the tiers, or the ladder drawing the same) follows them
    assert.ok(out.candidates!.some((c) => c.description === "tiers by role: CE | PE | P | PE | CE"));
    const x = (id: string) => out.positions[id]!.x;
    assert.ok(x("CEA") < x("PE1") && x("PE1") === x("PE2") && x("PE2") < x("P1") && x("P1") === x("P2") && x("P2") < x("PE3") && x("PE3") === x("PE4") && x("PE4") < x("CEB"), JSON.stringify(out.positions));
    assert.equal(crossings(roles, out.positions), 0);
  }
  // On a 4-column card the five tiers take five columns: the roles are worth the one column more.
  assert.equal(layoutFacts(roles, CARD).method, "tiers");
  assert.equal(spanX(layoutFacts(roles, CARD).positions), 4);
});

test("mirrored: a PE pair one above the other, its dual-homed CE half way between, both sides alike", () => {
  const p = layoutFacts(roles, CARD).positions;
  assert.equal(p.CEA!.y, (p.PE1!.y + p.PE2!.y) / 2);
  assert.equal(p.CEB!.y, (p.PE3!.y + p.PE4!.y) / 2);
  assert.equal(p.CEA!.y, p.CEB!.y);
  // the picture is its own mirror image about the P column
  const mid = p.P1!.x;
  for (const [l, r] of [["CEA", "CEB"], ["PE1", "PE3"], ["PE2", "PE4"]] as const) assert.ok(Math.abs(mid - p[l]!.x - (p[r]!.x - mid)) < 1e-9, `${l} / ${r}`);
});

test("plain boxes (no facts) go by adjacency: a box between a CE and its PE sits between them", () => {
  const m = lab([["PE1", "pe"], ["PE2", "pe"], ["P1", "p"], ["CE1", "ce"], ["CE2", "ce"], ["NID", "plain"]], "PE1-P1 P1-PE2 CE1-NID NID-PE1 CE2-PE2");
  const out = layoutFacts(m);
  const x = (id: string) => out.positions[id]!.x;
  assert.equal(out.method, "tiers");
  assert.ok(x("CE1") < x("NID") && x("NID") < x("PE1") && x("PE1") < x("P1") && x("P1") < x("PE2") && x("PE2") < x("CE2"), JSON.stringify(out.positions));
});

test("crossing minimisation: cross-wired PEs and P routers are ordered so no links cross", () => {
  // PE1 and PE3 hang off P2, PE2 and PE4 off P1: by name the rows would cross; the sweeps order them.
  const m = lab([["PE1", "pe"], ["PE2", "pe"], ["PE3", "pe"], ["PE4", "pe"], ["P1", "p"], ["P2", "p"]], "PE1-P2 PE2-P1 PE3-P2 PE4-P1 P1-P2");
  const out = layoutFacts(m, CARD);
  const tiers = out.candidates!.find((c) => c.method === "tiers")!;
  assert.equal(tiers.crossings, 0);
  assert.equal(crossings(m, out.positions), 0);
});

test("grouping: routers of one IGP area kept together in their tier", () => {
  const m = lab(
    [["PE1", "pe"], ["PE2", "pe"], ["PA1", "p", "49.0001"], ["PB1", "p", "49.0002"], ["PA2", "p", "49.0001"], ["PB2", "p", "49.0002"]],
    "PE1-PA1 PE1-PB1 PE1-PA2 PE1-PB2 PE2-PA1 PE2-PB1 PE2-PA2 PE2-PB2",
  );
  const tiers = layoutFacts(m, CARD).candidates!.find((c) => c.method === "tiers")!;
  const column = ["PA1", "PA2", "PB1", "PB2"].sort((a, b) => tiers.positions[a]!.y - tiers.positions[b]!.y);
  const areaOf = (id: string) => id.slice(0, 2);
  // one change of area down the column: PA PA PB PB (or PB PB PA PA)
  assert.equal(column.filter((id, i) => i && areaOf(id) !== areaOf(column[i - 1]!)).length, 1, column.join(" "));
});

test("radial: one hub and many spokes, the hub in the middle", () => {
  const m = lab([["HUB"], ["S1"], ["S2"], ["S3"], ["S4"], ["S5"], ["S6"]], "HUB-S1 HUB-S2 HUB-S3 HUB-S4 HUB-S5 HUB-S6");
  const out = layoutFacts(m, CARD);
  assert.equal(out.method, "radial");
  const p = out.positions;
  const xs = Object.values(p).map((q) => q.x), ys = Object.values(p).map((q) => q.y);
  assert.equal(p.HUB!.x, (Math.min(...xs) + Math.max(...xs)) / 2);
  assert.equal(p.HUB!.y, (Math.min(...ys) + Math.max(...ys)) / 2);
  assert.ok(spanX(p) <= 3 + 1e-9);
  assert.equal(crossings(m, p), 0);
});

test("stress: an odd mesh gets even links, across the card, the same every time", () => {
  // K3,3 plus a tail: no tiering or ring fits it.
  const m = lab([["A1"], ["A2"], ["A3"], ["B1"], ["B2"], ["B3"], ["T"]], "A1-B1 A1-B2 A1-B3 A2-B1 A2-B2 A2-B3 A3-B1 A3-B2 A3-B3 B3-T");
  const g = {
    ids: m.nodes.map((n) => n.id),
    adj: new Map(m.nodes.map((n) => [n.id, new Set(m.links.flatMap((l) => (l.a === n.id ? [l.b as string] : l.b === n.id ? [l.a as string] : [])))])),
    node: new Map(m.nodes.map((n) => [n.id, n])),
    groups: new Map<string, string>(),
  };
  const p = stress(g, 4)!;
  assert.deepEqual(stress(g, 4), p);
  const xs = [...p.values()].map((q) => q.x), ys = [...p.values()].map((q) => q.y);
  assert.ok(Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys), "wider than tall");
  assert.ok(Math.max(...xs) - Math.min(...xs) <= 3 + 1e-9);
  const lens = m.links.map((l) => Math.hypot(p.get(l.a as string)!.x - p.get(l.b as string)!.x, p.get(l.a as string)!.y - p.get(l.b as string)!.y));
  assert.ok(Math.max(...lens) / Math.min(...lens) < 2.5, lens.join(" "));
  // and it is a candidate of the auto layout
  assert.ok(layoutFacts(m, CARD).candidates!.some((c) => c.method === "stress"));
});

test("score: crossings, links through devices, crowding, port badges, evenness and fit", () => {
  const sq = (pts: Record<string, [number, number]>) => new Map(Object.entries(pts).map(([k, [x, y]]) => [k, { x, y }]));
  const edges: Array<[string, string]> = [["A", "B"], ["B", "C"], ["C", "D"], ["A", "D"]];
  const square = scoreLayout(sq({ A: [0, 0], B: [1, 0], C: [1, 1], D: [0, 1] }), edges, 4);
  const bow = scoreLayout(sq({ A: [0, 0], B: [1, 0], C: [0, 1], D: [1, 1] }), edges, 4);
  assert.equal(square.crossings, 0);
  assert.equal(bow.crossings, 1);
  assert.ok(bow.score > square.score);
  // a device on a link, two devices on one spot
  const on = scoreLayout(sq({ A: [0, 0], B: [2, 0], C: [1, 0] }), [["A", "B"]], 4);
  assert.equal(on.through, 1);
  assert.equal(scoreLayout(sq({ A: [0, 0], B: [0.2, 0] }), [["A", "B"]], 4).crowded, 1);
  // badges: a link too short for its two badges; parallel links each have their own
  assert.ok(scoreLayout(sq({ A: [0, 0], B: [0.4, 0] }), [["A", "B"]], 4).badges >= 1);
  assert.ok(scoreLayout(sq({ A: [0, 0], B: [0.7, 0] }), [["A", "B"], ["A", "B"], ["A", "B"]], 4).badges >= 1);
  assert.equal(scoreLayout(sq({ A: [0, 0], B: [1, 0] }), [["A", "B"]], 4).badges, 0);
  // fit: wider than max_columns, taller than three rows, taller than wide all cost
  const wide = scoreLayout(sq({ A: [0, 0], B: [1, 0], C: [2, 0], D: [3, 0], E: [4, 0], F: [5, 0] }), [], 4);
  const fits = scoreLayout(sq({ A: [0, 0], B: [1, 0], C: [2, 0], D: [0, 1], E: [1, 1], F: [2, 1] }), [], 4);
  assert.ok(wide.score > fits.score);
  assert.ok(scoreLayout(sq({ A: [0, 0], B: [0, 1], C: [0, 2], D: [0, 3] }), [], 4).score > scoreLayout(sq({ A: [0, 0], B: [1, 0], C: [0, 1], D: [1, 1] }), [], 4).score);
});

test("the choice: every candidate scored, the chosen one first; max_columns holds on a card", () => {
  for (const m of [roles, lab([["H"], ["A"], ["B"], ["C"], ["D"]], "H-A H-B H-C H-D A-B")]) {
    for (const max of [4, 3]) {
      const out = layoutFacts(m, { aspect: "card", max_columns: max });
      assert.equal(out.candidates![0]!.method, out.method);
      assert.deepEqual(out.candidates![0]!.positions, out.positions);
      assert.ok(out.candidates!.length >= 2);
      // only a layout that follows the roles takes a column more
      assert.ok(spanX(out.positions) <= max - 1 + (out.method === "tiers" && m === roles ? 1 : 0) + 1e-9, `${max}: ${spanX(out.positions)}`);
    }
  }
  // deterministic: the same lab in any order
  const shuffled = { nodes: shuffle(roles.nodes), links: shuffle(roles.links) };
  assert.deepEqual(layoutFacts(shuffled, CARD), layoutFacts(roles, CARD));
  // hints (an authored layout) are used as they are: no candidates
  const hints = Object.fromEntries(roles.nodes.map((n, i) => [n.id, [i * 100, 0]])) as Record<string, [number, number]>;
  const authored = layoutFacts(roles, { hints });
  assert.equal(authored.method, "hints");
  assert.equal(authored.candidates, undefined);
});
