// SPDX-License-Identifier: Apache-2.0
// Devices by type, roles on a frame of their own (U3d): a lab whose devices all lack facts is drawn
// from its records and links[]; the physical frame shows each device as its type (platform family
// colour, model tag), a device without facts as its type too, with a dashed outline; the role frame,
// right after physical, shows CE / PE / P from the facts or a record's role, and is left out when no
// device has one. The devices stay put from frame to frame.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { importFacts, networkRole } from '../src/import/facts.js';
import { renderOverview } from '../src/panels.js';
import { OTHER, physicalLook, ROUTER } from '../src/render/frames.js';
import { frames, snapshot } from '../src/render/index.js';
import { isRouter, typeTag } from '../src/render/model.js';

const expected = (name) => readFileSync(new URL(`../../tests/fixtures/expected/${name}.facts.json`, import.meta.url), 'utf8');
const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');
const group = (svg, id) => svg.split(/(?=<g class="frame[ a-z0-9]*")/).find((g) => g.includes(`id="f-${id}"`));
// The box of each device in a frame: the first <rect> after the device's hover title.
const boxes = (g) => Object.fromEntries([...g.matchAll(/<g><title>([^\n<]+)\n[^<]*(?:<\/title>)<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*fill="([^"]+)"([^>]*)\/><text[^>]*>([^<]*)<\/text>/g)].map((m) => [m[1], { x: +m[2], y: +m[3], w: +m[4], h: +m[5], fill: m[6], rest: m[7], tag: m[8] }]));
// The router symbols of a physical frame: { name: { cx, cy, r, dashed } }.
const routers = (g) => Object.fromEntries([...g.matchAll(/<g><title>([^\n<]+)\n[^<]*<\/title><g class="router"><circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="([^"]+)"\/>(.*?)<\/g><\/g>/g)].map((m) => [m[1], { cx: +m[2], cy: +m[3], r: +m[4], fill: m[5], dashed: m[6].includes('stroke-dasharray') }]));
const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2];

// A facts file with every device's facts removed, as a lab nobody has configured yet.
function configLess(text, { roles = {} } = {}) {
  const file = JSON.parse(text);
  for (const r of file.devices) {
    Object.assign(r, { facts: null, status: 'skipped', reason: 'no configuration', templates: [] });
    delete r.platform;
    if (roles[r.device]) r.role = roles[r.device];
  }
  return JSON.stringify(file);
}

describe('a lab whose devices all lack facts', () => {
  test('is drawn from its records and links[]: the physical frame only, no throw', () => {
    const text = configLess(expected('g8032-two-ring'));
    const r = frames(text, { preset: 'card-frames' });
    expect(r.frames.map((f) => f.id)).toEqual(['physical']);
    expect(r.start).toBe('physical');
    const physical = group(r.svg, 'physical');
    expect(Object.keys(routers(physical))).toHaveLength(JSON.parse(text).devices.length);
    expect(Object.values(routers(physical)).every((x) => x.dashed)).toBe(true);
    expect(physical.match(/<line /g).length).toBe(JSON.parse(text).links.length);
    expect(r.svg).toContain('data-title="Physical · 9 devices (SAOS 10, no facts), 10 links"');
  });

  test('the import reports it; the engine runs on nothing; the 3D page panels list the boxes', () => {
    const imp = importFacts(configLess(expected('g8032-two-ring')));
    expect(imp.topology.nodes).toEqual([]);
    expect(imp.topology.plain.nodes.map((n) => n.id)).toContain('RM_1');
    expect(imp.report.gaps.physical.some((g) => g.item === 'no facts')).toBe(true);
    const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
    const el = { innerHTML: '' };
    renderOverview(el, imp, net);
    expect(el.innerHTML).toContain('RM_1');
  });

  test('with nothing to draw (plain: false) it still says no device has facts', () => {
    expect(() => importFacts(configLess(expected('g8032-two-ring')), { plain: false })).toThrow(/no device in this facts file has facts .*plain: false/);
    expect(() => frames(configLess(expected('g8032-two-ring')), { plain: false })).toThrow(/no device in this facts file has facts/);
  });

  test('the snapshot draws its physical plane', () => {
    expect(snapshot(configLess(expected('g8032-two-ring'))).layers).toEqual(['physical']);
  });
});

describe('the physical frame shows the devices, not their roles', () => {
  test('isRouter and typeTag: a Ciena SAOS device is a router; the model tag of any other box', () => {
    expect([{ type: '3984-10x' }, { type: '3928-6x', os: 'SAOS 6/8' }, { type: 'odd', os: 'SAOS 10' }, { type: 'WSAi' }, { type: 'JNP7100-48L' }, { type: 'ELS-TERM' }, {}].map(isRouter)).toEqual([true, true, true, false, false, false, false]);
    expect(['3984-10x', '3926v2-10x', '3926-TDM-6x', '5164', 'WSAi', 'JNP7100-48L', 'ELS-TERM', '', null].map(typeTag)).toEqual(['3984', '3926v2', '3926', '5164', 'WSAi', 'JNP', 'ELS', '?', '?']);
  });

  test('every router is the same red router symbol, never a role tag; its name and type beside it', () => {
    const physical = group(frames(example).svg, 'physical');
    const r = routers(physical);
    const ids = JSON.parse(example).devices.filter((x) => x.facts).map((x) => x.device);
    expect(Object.keys(r).sort()).toEqual([...ids].sort());
    expect(new Set(Object.values(r).map((x) => x.fill))).toEqual(new Set([ROUTER.fill]));
    expect(Object.values(boxes(physical)).map((x) => x.tag).filter((t) => ['P', 'PE', 'CE', 'L2', 'PE·RR', 'P·RR'].includes(t))).toEqual([]);
    for (const x of JSON.parse(example).devices.filter((d) => d.facts)) expect(physical).toContain(`>${x.type}</text>`);
  });

  test('a device without facts is the same symbol with a dashed ring; a non-router a grey box with its model', () => {
    const file = JSON.parse(expected('plain-box'));
    const pe2 = file.devices.find((r) => r.device === 'PE2');
    Object.assign(pe2, { facts: null, status: 'skipped', reason: 'no configuration', templates: [] });
    const physical = group(frames(JSON.stringify(file)).svg, 'physical');
    const r = routers(physical);
    expect([r.PE2.fill, r.PE2.r, r.PE2.dashed, r.PE1.dashed]).toEqual([r.PE1.fill, r.PE1.r, true, false]);
    expect(physical).not.toContain('no facts</text>');
    // OLS1 (type line-system, no extractor): a grey box, dashed, tagged with its model
    expect(boxes(physical).OLS1).toMatchObject({ fill: OTHER.fill, tag: 'line' });
    expect(boxes(physical).OLS1.rest).toContain('stroke-dasharray');
    // the title says so only when no device has facts (the card keeps its width)
    expect(frames(JSON.stringify(file)).svg).toMatch(/data-title="Physical · 3 devices \(SAOS 10\), \d+ links?"/);
  });

  test('the colours are Ciena\'s: white arrows on Ciena red, near-black tags on grey, near-black names on white, all 4.5:1 or more', () => {
    const lum = (hex) => { const c = hex.replace('#', ''); const v = (c.length === 3 ? [...c].map((x) => x + x) : c.match(/../g)).map((x) => parseInt(x, 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    expect([ROUTER.fill, OTHER.fill]).toEqual(['#dc0000', '#c8c8c8']);
    expect(ratio(ROUTER.fill, ROUTER.arrow)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(OTHER.fill, OTHER.text)).toBeGreaterThanOrEqual(4.5);
    for (const name of [ROUTER.name, OTHER.name]) expect(ratio(name, '#fff')).toBeGreaterThanOrEqual(4.5);
  });

  test('physicalLook: a line-system member keeps its equipment look, a box with no type stays the faint ?', () => {
    expect(physicalLook({ plain: true, equipment: 'roadm', type: 'roadm-2d' })).toMatchObject({ tag: 'ROADM', dash: false, router: false });
    expect(physicalLook({ plain: true, type: null })).toMatchObject({ tag: '?', dash: true, typed: false, router: false });
    expect(physicalLook({ plain: true, type: '3984-10x' })).toMatchObject({ router: true, dash: true });
    expect(physicalLook({ plain: false, type: '3984-10x', os: 'SAOS 10' })).toMatchObject({ router: true, dash: false });
    expect(physicalLook({ plain: true, type: 'WSAi' })).toMatchObject({ router: false, tag: 'WSAi', color: OTHER.fill, dash: true });
    expect(physicalLook({ host: true, role: 'host' })).toMatchObject({ tag: 'H' });
  });
});

describe('the role frame', () => {
  test('right after physical, listed in data-frames as f-role: CE / PE / P from the facts, a route reflector P·RR', () => {
    const r = frames(example);
    expect(r.frames.map((f) => f.id).slice(0, 2)).toEqual(['physical', 'role']);
    expect(r.svg).toMatch(/data-frames="physical role /);
    const role = group(r.svg, 'role');
    expect(role).toContain('id="f-role"');
    const tags = Object.values(boxes(role)).map((b) => b.tag);
    expect(tags).toContain('PE');
    expect(tags).toContain('P');
    expect(tags.every((t) => /^(CE|PE|P)(·RR)?$/.test(t))).toBe(true);
    expect(r.frames.find((f) => f.id === 'role').title).toMatch(/^Roles · (\d+ CE, )?\d+ PE, \d+ P/);
  });

  test('the devices stay put: each box has the same centre on the physical and the role frame', () => {
    for (const text of [example, expected('srv6-evpn'), expected('config-less')]) {
      const r = frames(text, { preset: 'card-frames' });
      const phys = Object.fromEntries(Object.entries(routers(group(r.svg, 'physical'))).map(([k, c]) => [k, { x: c.cx - c.r, y: c.cy - c.r, w: 2 * c.r, h: 2 * c.r }])), role = boxes(group(r.svg, 'role'));
      expect(Object.keys(role).length).toBeGreaterThan(0);
      // (a route reflector's box is larger on the role frame: the same centre, to the rounding)
      for (const id of Object.keys(role)) centre(role[id]).forEach((v, k) => expect(Math.abs(v - centre(phys[id])[k]), id).toBeLessThan(0.11));
    }
  });

  test('left out when no device has a role: an L2 lab, and a lab without facts or roles', () => {
    expect(frames(expected('g8032-two-ring')).frames.map((f) => f.id)).not.toContain('role');
    expect(frames(configLess(expected('srv6-evpn'))).frames.map((f) => f.id)).toEqual(['physical']);
  });

  test('a record\'s role (CE, PE or P, any case) gives a device without facts its role; other roles are equipment', () => {
    expect(['pe', 'P', ' ce ', 'roadm', 'router', undefined].map((role) => networkRole({ role }))).toEqual(['pe', 'p', 'ce', null, null, null]);
    const r = frames(expected('config-less'), { preset: 'card-frames' });
    expect(r.frames.map((f) => f.id)).toEqual(['physical', 'role']);
    const role = boxes(group(r.svg, 'role'));
    expect(Object.fromEntries(Object.entries(role).map(([id, b]) => [id, b.tag]))).toEqual({ CE1: 'CE', PE1: 'PE', P1: 'P', PE2: 'PE', CE2: 'CE' });
    // dashed: no facts behind it; MGMT has no role: its ghost and its name only
    expect(role.PE1.rest).toContain('stroke-dasharray');
    expect(group(r.svg, 'role')).toContain('>MGMT</text>');
    expect(r.frames[1].title).toBe('Roles · 2 CE, 2 PE, 1 P');
    // a network role is not equipment: no line-system member, no optical frame
    const imp = importFacts(expected('config-less'));
    expect(imp.topology.plain.nodes.find((n) => n.id === 'PE1')).toMatchObject({ role: 'pe', plain: true });
    expect(imp.topology.plain.nodes.some((n) => n.equipment)).toBe(false);
    // the layout reads it as it reads a derived role: CE | PE | P | PE | CE
    expect(imp.layout.method).toBe('tiers');
  });

  test('the snapshot has no role plane (a frame only)', () => {
    expect(snapshot(example).layers).not.toContain('role');
    expect(snapshot(expected('config-less')).layers).toEqual(['physical']);
  });

  test('a view picks it like any layer: left out of an explicit layers list, a start frame on request', () => {
    expect(frames(example, { layers: ['physical', 'igp'] }).frames.map((f) => f.id)).toEqual(['physical', 'igp']);
    expect(frames(example, undefined, 'start=role').start).toBe('role');
  });
});
