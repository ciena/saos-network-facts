// SPDX-License-Identifier: Apache-2.0
// Static renders (src/render): the frame rule, the start frame, the SVG contracts (one :target group
// per frame, the start frame last; snapshot planes and chips, self-contained), byte-stable goldens for
// the fixture labs (UPDATE_GOLDEN=1 rewrites them), the CLI, and no three.js in the module graph.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { main } from '../bin/saos-network-facts-render.mjs';
import { frameLayers, frames, prepare, snapshot } from '../src/render/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const LABS = {
  'adaptive-sr-cfm': 'examples/adaptive-sr-cfm/facts.json',
  'g8032-two-ring': 'tests/fixtures/expected/g8032-two-ring.facts.json',
  'plain-box': 'tests/fixtures/expected/plain-box.facts.json',
  'srv6-evpn': 'tests/fixtures/expected/srv6-evpn.facts.json',
  'l3vpn-hosts': 'tests/fixtures/expected/l3vpn-hosts.facts.json',
  'ospf-tp': 'tests/fixtures/expected/ospf-tp.facts.json',
  'srv6-ospf': 'viewer/test/fixtures/srv6-ospf.facts.json',
  'line-system': 'tests/fixtures/expected/line-system.facts.json',
};
const GOLDEN = resolve(here, 'golden/render');
const frameIds = (svg) => [...svg.matchAll(/<g class="frame" id="f-([a-z0-9]+)"/g)].map((m) => m[1]);
const planeIds = (svg) => [...svg.matchAll(/<g class="layer" data-layer="([a-z0-9]+)"/g)].map((m) => m[1]);

function golden(name, svg) {
  const path = resolve(GOLDEN, name);
  if (process.env.UPDATE_GOLDEN || !existsSync(path)) {
    mkdirSync(GOLDEN, { recursive: true });
    writeFileSync(path, svg);
  }
  expect(svg, `${name} differs from the golden file (UPDATE_GOLDEN=1 npm test rewrites it; review the diff)`).toBe(readFileSync(path, 'utf8'));
}

describe('golden renders of the fixture labs', () => {
  for (const [lab, path] of Object.entries(LABS)) {
    test(lab, () => {
      const text = read(path);
      // the card preset for frames (a wide lab wraps into four columns), the defaults for the snapshot
      golden(`${lab}.frames.svg`, frames(text, { preset: 'card-frames' }, undefined, { name: lab }).svg);
      golden(`${lab}.snapshot.svg`, snapshot(text, undefined, undefined, { name: lab }).svg);
    });
  }
  test('stacked variant', () => golden('g8032-two-ring.stacked.svg', snapshot(read(LABS['g8032-two-ring']), { snapshot: { variant: 'stacked' } }, undefined, { name: 'g8032-two-ring' }).svg));
});

describe('frames', () => {
  test('one frame per layer with content, in the view order, the signature layer first shown', () => {
    const r = frames(read(LABS['adaptive-sr-cfm']));
    expect(r.frames.map((f) => f.id)).toEqual(['physical', 'ring', 'igp', 'bgp', 'pw', 'cfm']);
    expect(r.start).toBe('pw');
    // the start frame is the last group, so the bare file shows it without :has()
    expect(frameIds(r.svg).at(-1)).toBe('pw');
    expect(r.svg).toContain('.frame:target{display:inline}.frame:last-of-type{display:inline}.frame:target~.frame:last-of-type{display:none}');
    expect(r.svg).toMatch(/data-title="Services · 3 pseudowires over/);
  });

  test('a ring lab starts on its rings; an L3VPN lab on its VRFs; EVPN and SRv6 frames', () => {
    expect(frames(read(LABS['g8032-two-ring'])).start).toBe('ring');
    expect(frames(read(LABS['l3vpn-hosts'])).start).toBe('vrf');
    const s = frames(read(LABS['srv6-evpn']));
    expect(s.frames.map((f) => f.id)).toEqual(['physical', 'igp', 'srv6', 'bgp', 'vrf', 'evpn']);
    expect(s.start).toBe('evpn');
    // SRv6 over OSPF (OSPF's SPF is per router and area): an SRv6 frame, no crash
    expect(frames(read(LABS['srv6-ospf'])).frames.map((f) => f.id)).toEqual(['physical', 'igp', 'srv6', 'pw']);
  });

  test('SR policies get a frame only when there is no pseudowire frame', () => {
    const file = JSON.parse(read(LABS['plain-box']));
    expect(frames(JSON.stringify(file)).frames.map((f) => f.id)).not.toContain('mpls');
    for (const r of file.devices) if (r.facts) (r.facts.pseudowires = []), (r.facts.l2vpn_services = []);
    const ids = frames(JSON.stringify(file)).frames.map((f) => f.id);
    expect(ids).toContain('mpls');
    expect(ids).not.toContain('pw');
  });

  test('the view picks frames and the start frame; empty layers make none', () => {
    const text = read(LABS['adaptive-sr-cfm']);
    const listed = frames(text, { frames: { rule: 'list', list: ['cfm', 'igp', 'evpn'], start: 'first' } });
    expect(listed.frames.map((f) => f.id)).toEqual(['cfm', 'igp']);
    expect(listed.start).toBe('cfm');
    expect(frames(text, undefined, 'start=igp').start).toBe('igp');
    expect(frames(text, { layers: ['physical', 'igp'] }).frames.map((f) => f.id)).toEqual(['physical', 'igp']);
  });

  test('devices without facts are plain boxes, unless the view says plain: false', () => {
    const text = read(LABS['plain-box']);
    const on = frames(text).svg;
    expect(on).toContain('line-system · no facts');
    expect(on).toContain('stroke-dasharray="4 3"');
    expect(frames(text, { plain: false }).svg).not.toContain('OLS1');
  });
});

describe('snapshot', () => {
  test('one plane per present layer the view shows, chips, risers, hover details', () => {
    const r = snapshot(read(LABS['adaptive-sr-cfm']));
    expect(planeIds(r.svg).reverse()).toEqual(r.layers);
    expect(r.layers).toEqual(['physical', 'ring', 'igp', 'mpls', 'bgp', 'pw', 'cfm']);
    for (const id of r.layers) expect(r.svg).toContain(`class="chip" data-layer="${id}"`);
    expect(r.svg).toContain('class="pillar"');
    expect(r.svg).toMatch(/<title>PE1\n/);
    expect(snapshot(read(LABS['adaptive-sr-cfm']), { layers: ['physical', 'igp'] }).layers).toEqual(['physical', 'igp']);
  });

  test('exploded by default, stacked on request: the same planes, closer together', () => {
    const text = read(LABS['g8032-two-ring']);
    const e = snapshot(text), s = snapshot(text, undefined, 'variant=stacked');
    expect(e.view.snapshot.variant).toBe('exploded');
    expect(s.svg).toContain('data-variant="stacked"');
    expect(s.layers).toEqual(e.layers);
    expect(s.height).toBeLessThan(e.height);
  });
});

describe('self-contained and deterministic', () => {
  for (const [lab, path] of Object.entries(LABS).slice(0, 3)) {
    test(lab, () => {
      const text = read(path);
      for (const svg of [frames(text).svg, snapshot(text).svg]) {
        expect(svg.replace('xmlns="http://www.w3.org/2000/svg"', '')).not.toMatch(/https?:|@import|url\(|<script[^>]+src|xlink:href|<image/);
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
      }
      expect(frames(text).svg).toBe(frames(text).svg);
      expect(snapshot(text).svg).toBe(snapshot(text).svg);
    });
  }
  test('the positions are the library layout the 3D page uses', () => {
    const p = prepare(read(LABS['adaptive-sr-cfm']));
    expect(['ladder', 'rectangle', 'columns']).toContain(p.method);
    expect(Object.keys(p.positions).sort()).toEqual(p.model.nodes.map((n) => n.id).sort());
    expect(frameLayers(p.model, p.view).start).toBe('pw');
  });
});

describe('CLI', () => {
  const io = () => {
    const files = {}, out = [], err = [];
    return { files, out, err, opts: { read: (f) => (f in files ? files[f] : read(f)), write: (f, d) => (files[f] = d), out: { write: (s) => out.push(s) }, err: { write: (s) => err.push(s) } } };
  };
  test('writes the frames and the snapshot, reports what it wrote and the view warnings', () => {
    const t = io();
    t.files['v.json'] = JSON.stringify({ preset: 'card-frames', colour: 'red' });
    const code = main([LABS['g8032-two-ring'], '--view', 'v.json', '--frames', 'f.svg', '--snapshot', 's.svg'], t.opts);
    expect(code).toBe(0);
    expect(frameIds(t.files['f.svg'])).toEqual(['physical', 'ring']);
    expect(planeIds(t.files['s.svg'])).toEqual(['ring', 'physical']);
    expect(t.err.join('')).toMatch(/warning: view: colour: unknown property/);
    expect(t.err.join('')).toMatch(/f.svg: 2 frames \(physical, ring\), start ring/);
  });
  test('frames to standard output by default; usage errors exit 2', () => {
    const t = io();
    expect(main([LABS['plain-box']], t.opts)).toBe(0);
    expect(t.out.join('')).toMatch(/^<svg/);
    expect(main([], io().opts)).toBe(2);
    expect(main(['a.json', '--bogus'], io().opts)).toBe(2);
    expect(main(['missing.json'], { ...io().opts, read: () => { throw new Error('ENOENT'); } })).toBe(1);
  });
});

describe('no three.js', () => {
  test('the render module graph never imports three', () => {
    const seen = new Set();
    const walk = (file) => {
      if (seen.has(file)) return;
      seen.add(file);
      const src = readFileSync(file, 'utf8');
      for (const [, spec] of src.matchAll(/^\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/gm)) {
        expect(spec, `${file} imports ${spec}`).not.toMatch(/^three/);
        if (spec.startsWith('.')) walk(resolve(dirname(file), spec));
      }
    };
    walk(resolve(here, '../bin/saos-network-facts-render.mjs'));
    expect(seen.size).toBeGreaterThan(10);
  });
});
