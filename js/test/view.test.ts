// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { LAYER_IDS, PRESET_NAMES, resolveView, VIEW_DEFAULTS, VIEW_PRESETS, VIEW_VERSION, viewFrames, viewFromParams } from "../src/index.ts";

const views = path.resolve(import.meta.dirname, "..", "..", "tests", "fixtures", "views");
const readView = (name: string) => JSON.parse(fs.readFileSync(path.join(views, name), "utf8")) as unknown;

test("no view: the defaults, every property set", () => {
  const { view, warnings } = resolveView();
  assert.deepEqual(warnings, []);
  assert.deepEqual(view, { ...VIEW_DEFAULTS, layers: [...LAYER_IDS] });
  assert.equal(view.preset, null);
  assert.equal(view.view_version, VIEW_VERSION);
  assert.deepEqual(view.frames, { rule: "auto", list: [], start: "signature", period_s: 4 });
  assert.equal(view.camera, "fit");
});

test("the presets: card-frames, lab-snapshot, protocol-stack", () => {
  assert.deepEqual(PRESET_NAMES, ["card-frames", "lab-snapshot", "protocol-stack"]);
  assert.deepEqual(resolveView({ preset: "card-frames" }).view.layout, { algorithm: "auto", hints: {}, aspect: "card", max_columns: 4 });
  assert.deepEqual(resolveView({ preset: "lab-snapshot" }).view.camera, "iso");
  assert.deepEqual(resolveView({ preset: "protocol-stack" }).view.snapshot, { variant: "stacked" });
  for (const name of PRESET_NAMES) assert.deepEqual(resolveView({ preset: name }).warnings, [], name);
});

test("merge order: defaults < preset < view file < URL", () => {
  const file = { preset: "lab-snapshot", camera: "top", layout: { aspect: "free" } };
  // the preset beats the defaults, the file beats the preset
  const fromFile = resolveView(file).view;
  assert.equal(fromFile.preset, "lab-snapshot");
  assert.equal(fromFile.camera, "top");
  assert.equal(fromFile.layout.aspect, "free");
  assert.equal(fromFile.snapshot.variant, "exploded");
  // the URL beats the file, property by property
  const { view, warnings } = resolveView(file, "?camera=iso&variant=stacked");
  assert.deepEqual(warnings, []);
  assert.equal(view.camera, "iso");
  assert.equal(view.snapshot.variant, "stacked");
  assert.equal(view.layout.aspect, "free");
  // a preset the URL names replaces the file's, and the file still applies over it
  const swapped = resolveView(file, { preset: "protocol-stack" }).view;
  assert.equal(swapped.preset, "protocol-stack");
  assert.equal(swapped.snapshot.variant, "stacked");
  assert.equal(swapped.camera, "top");
});

test("nested objects merge by property; lists replace; hints add device by device", () => {
  const { view } = resolveView(
    { preset: "card-frames", layers: ["physical", "igp"], frames: { period_s: 6 }, layout: { hints: { PE1: [0, 0], P1: [1, 0] } } },
    "?layers=igp,ring",
  );
  assert.deepEqual(view.layers, ["igp", "ring"]);
  assert.deepEqual(view.frames, { rule: "auto", list: [], start: "signature", period_s: 6 });
  assert.equal(view.layout.aspect, "card");
  assert.deepEqual(view.layout.hints, { PE1: [0, 0], P1: [1, 0] });
});

test("unknown properties and bad values are reported, not fatal; the lower value stays", () => {
  const { view, warnings } = resolveView(
    { view_version: "1.3", device_info: ["role"], camera: "orbit", layers: ["physical", "optical", "igp"], frames: { start: "middle", speed: 2 }, layout: { max_columns: 0, hints: { PE1: [1] } } },
    "?preset=poster&plain=maybe&facts=lab.json",
  );
  assert.equal(view.camera, "fit");
  assert.deepEqual(view.layers, ["physical", "igp"]);
  assert.equal(view.frames.start, "signature");
  assert.equal(view.layout.max_columns, 6);
  assert.deepEqual(view.layout.hints, {});
  assert.equal(view.plain, true);
  assert.equal(view.preset, null);
  assert.deepEqual(warnings, [
    'URL: preset: "poster" is not one of card-frames, lab-snapshot, protocol-stack',
    "view: device_info: unknown property, ignored",
    'view: camera: "orbit" is not one of fit, top, iso',
    'view: layers: unknown layer "optical"',
    'view: frames.start: "middle" is not one of signature, first, physical, ring, igp, mpls, srv6, bgp, vrf, pw, evpn, cfm',
    "view: frames.speed: unknown property, ignored",
    "view: layout.max_columns: expected a whole number from 1",
    "view: layout.hints.PE1: expected [x, y]",
    "URL: plain: expected true or false",
  ]);
});

test("another major version is read for what it knows, with a warning; bad JSON is a warning", () => {
  const { view, warnings } = resolveView({ view_version: "2.0", camera: "top" });
  assert.equal(view.camera, "top");
  assert.equal(view.view_version, VIEW_VERSION);
  assert.deepEqual(warnings, ["view: view_version: 2.0, this reader understands 1.x; reading what it knows"]);
  assert.deepEqual(resolveView("{not json").warnings.length, 1);
  assert.deepEqual(resolveView("[]").warnings, ["view: expected an object"]);
  assert.equal(resolveView('{"camera":"iso"}').view.camera, "iso");
});

test("URL parameters", () => {
  assert.deepEqual(viewFromParams("?frames=igp,%20ring&start=first&period=2.5&columns=3&plain=0&layout=force&aspect=card&title=Lab"), {
    frames: { rule: "list", list: ["igp", "ring"], start: "first", period_s: 2.5 },
    layout: { algorithm: "force", aspect: "card", max_columns: 3 },
    plain: false,
    title: "Lab",
  });
  assert.deepEqual(viewFromParams("?facts=a.json&lab=x&view=v.json"), {});
  assert.deepEqual(resolveView(undefined, "?period=soon").warnings, ["URL: frames.period_s: expected a number of seconds above 0"]);
});

test("the example view files resolve without warnings", () => {
  const card = resolveView(readView("card.view.json"));
  assert.deepEqual(card.warnings, []);
  assert.equal(card.view.layout.max_columns, 3);
  assert.equal(card.view.layout.aspect, "card");
  const snap = resolveView(readView("snapshot.view.json"));
  assert.deepEqual(snap.warnings, []);
  assert.equal(snap.view.camera, "top");
  assert.deepEqual(snap.view.layout.hints.PE2, [2, 0]);
});

test("frames: the shown layers with content, and where to start", () => {
  const present = ["physical", "igp", "mpls", "pw", "cfm"];
  const auto = resolveView({ preset: "card-frames" }).view;
  assert.deepEqual(viewFrames(auto, present), { frames: ["physical", "igp", "mpls", "pw", "cfm"], start: "pw" });
  const listed = resolveView(readView("card.view.json")).view;
  assert.deepEqual(viewFrames(listed, present), { frames: ["igp", "pw", "cfm"], start: "pw" });
  assert.deepEqual(viewFrames(resolveView({ frames: { start: "first" } }).view, present).start, "physical");
  assert.deepEqual(viewFrames(resolveView({ frames: { start: "cfm" } }).view, present).start, "cfm");
  assert.deepEqual(viewFrames(resolveView({ frames: { start: "ring" } }).view, present).start, "pw");
  assert.deepEqual(viewFrames(resolveView({ layers: ["physical", "igp"] }).view, present), { frames: ["physical", "igp"], start: "igp" });
  assert.deepEqual(viewFrames(auto, []), { frames: [], start: null });
});

test("the defaults and presets are not changed by resolving", () => {
  const before = JSON.stringify([VIEW_DEFAULTS, VIEW_PRESETS]);
  const { view } = resolveView({ preset: "card-frames", layout: { hints: { PE1: [0, 0] } } });
  view.layers.push("cfm");
  view.layout.hints.P1 = [1, 1];
  assert.equal(JSON.stringify([VIEW_DEFAULTS, VIEW_PRESETS]), before);
});
