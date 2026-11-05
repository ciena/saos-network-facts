// SPDX-License-Identifier: Apache-2.0
// Static renders (src/render): the frame rule, the start frame, the SVG contracts (one :target group
// per frame, the start frame last; snapshot planes and chips, self-contained), byte-stable goldens for
// the fixture labs (UPDATE_GOLDEN=1 rewrites them), the CLI, and no three.js in the module graph.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { labName, main, parseArgs } from '../bin/saos-network-facts-render.mjs';
import { framePngs, pngName } from '../src/render/png.js';
import { frameStyle } from '../src/render/frames.js';
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
  // short host links and a bond's two member cables to one PE: port badges that stacked before
  'vpws-bonds': 'tests/fixtures/expected/vpws-bonds.facts.json',
  // no configurations at all: every device drawn as its type, the roles from the extra file
  'config-less': 'tests/fixtures/expected/config-less.facts.json',
};
const GOLDEN = resolve(here, 'golden/render');
const frameIds = (svg) => [...svg.matchAll(/<g class="frame[ a-z0-9]*" id="f-([a-z0-9]+)"/g)].map((m) => m[1]);
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
    expect(r.frames.map((f) => f.id)).toEqual(['physical', 'role', 'ring', 'igp', 'bgp', 'pw', 'cfm']);
    expect(r.start).toBe('pw');
    // the start frame is the static one (no CSS animation: it shows); a fragment shows that frame instead
    expect(frameIds(r.svg).at(-1)).toBe('pw');
    expect(r.svg).toContain('.frame{visibility:hidden}.frame.start{visibility:visible}:root:has(.frame:target) .frame{visibility:hidden}:root:has(.frame:target) .frame:target{visibility:visible}');
    expect(r.svg).toMatch(/data-title="Services · 3 pseudowires over/);
  });

  test('a ring lab starts on its rings; an L3VPN lab on its VRFs; EVPN and SRv6 frames', () => {
    expect(frames(read(LABS['g8032-two-ring'])).start).toBe('ring');
    expect(frames(read(LABS['l3vpn-hosts'])).start).toBe('vrf');
    const s = frames(read(LABS['srv6-evpn']));
    expect(s.frames.map((f) => f.id)).toEqual(['physical', 'role', 'igp', 'srv6', 'bgp', 'vrf', 'evpn']);
    expect(s.start).toBe('evpn');
    // SRv6 over OSPF (OSPF's SPF is per router and area): an SRv6 frame, no crash
    expect(frames(read(LABS['srv6-ospf'])).frames.map((f) => f.id)).toEqual(['physical', 'role', 'igp', 'srv6', 'pw']);
  });

  test('SR policies get a frame only when there is no pseudowire frame', () => {
    const file = JSON.parse(read(LABS['plain-box']));
    expect(frames(JSON.stringify(file)).frames.map((f) => f.id)).not.toContain('mpls');
    for (const r of file.devices) if (r.facts) (r.facts.pseudowires = []), (r.facts.l2vpn_services = []);
    const ids = frames(JSON.stringify(file)).frames.map((f) => f.id);
    expect(ids).toContain('mpls');
    expect(ids).not.toContain('pw');
  });

  test('a physical frame without a link (every cable runs to the line system) starts on the optical frame', () => {
    // the line-system lab with its routers' facts left out: the PE1-PE2 core link (from the facts) goes,
    // their cables to the ROADMs stay, on the optical frame
    const file = JSON.parse(read(LABS['line-system']));
    for (const r of file.devices) if (r.device === 'PE1' || r.device === 'PE2') (r.status = 'skipped'), delete r.facts;
    const r = frames(JSON.stringify(file), { preset: 'card-frames' });
    expect(r.frames.map((f) => f.id)).toEqual(['optical', 'physical']);
    expect(r.svg).toMatch(/data-title="Physical · 2 devices [^"]*, 0 links/);
    expect(r.start).toBe('optical');
    expect(r.svg).toMatch(/data-frames="optical physical" data-start="optical"/);
    expect(frameIds(r.svg).at(-1)).toBe('optical');
    // a view's own start is kept; a physical frame with a link keeps the signature start
    expect(frames(JSON.stringify(file), { preset: 'card-frames', frames: { start: 'physical' } }).start).toBe('physical');
    expect(frames(read(LABS['line-system']), { preset: 'card-frames' }).start).toBe('pw');
  });

  test('the view picks frames and the start frame; empty layers make none', () => {
    const text = read(LABS['adaptive-sr-cfm']);
    const listed = frames(text, { frames: { rule: 'list', list: ['cfm', 'igp', 'evpn'], start: 'first' } });
    expect(listed.frames.map((f) => f.id)).toEqual(['cfm', 'igp']);
    expect(listed.start).toBe('cfm');
    expect(frames(text, undefined, 'start=igp').start).toBe('igp');
    expect(frames(text, { layers: ['physical', 'igp'] }).frames.map((f) => f.id)).toEqual(['physical', 'igp']);
  });

  test('devices without facts are drawn as their type, dashed, unless the view says plain: false', () => {
    const text = read(LABS['plain-box']);
    const on = frames(text).svg;
    expect(on).toContain('data-title="Physical · 3 devices (SAOS 10), 3 links"');
    expect(on).toMatch(/<title>OLS1\n[^<]*<\/title><rect [^>]*stroke-dasharray="[^"]+"[^>]*\/><text [^>]*>line<\/text>/);
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
  test('writes the frames and the snapshot, reports what it wrote and the view warnings', async () => {
    const t = io();
    t.files['v.json'] = JSON.stringify({ preset: 'card-frames', colour: 'red' });
    const code = await main([LABS['g8032-two-ring'], '--view', 'v.json', '--frames', 'f.svg', '--snapshot', 's.svg'], t.opts);
    expect(code).toBe(0);
    expect(frameIds(t.files['f.svg'])).toEqual(['physical', 'ring']);
    expect(planeIds(t.files['s.svg'])).toEqual(['ring', 'physical']);
    expect(t.err.join('')).toMatch(/warning: view: colour: unknown property/);
    expect(t.err.join('')).toMatch(/f.svg: 2 frames \(physical, ring\), start ring/);
  });
  test('frames to standard output by default; usage errors exit 2', async () => {
    const t = io();
    expect(await main([LABS['plain-box']], t.opts)).toBe(0);
    expect(t.out.join('')).toMatch(/^<svg/);
    expect(await main([], io().opts)).toBe(2);
    expect(await main(['a.json', '--bogus'], io().opts)).toBe(2);
    expect(await main(['missing.json'], { ...io().opts, read: () => { throw new Error('ENOENT'); } })).toBe(1);
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

describe('self-rotating frames', () => {
  const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];

  test('the bare file cycles every frame from the start frame, one period each, by hard cuts', () => {
    const r = frames(read(LABS['adaptive-sr-cfm']), { preset: 'card-frames' });
    const ids = r.frames.map((f) => f.id);
    expect(r.period).toBe(4);
    expect(r.svg).toContain(`@keyframes nf-rotate{0%{visibility:visible}14.285%,100%{visibility:hidden}}`);
    expect(r.svg).toContain(`.frame{animation:nf-rotate ${ids.length * 4}s step-end infinite}`);
    expect(r.svg).toMatch(/<g class="frame r0 start" id="f-pw"/);
    expect(r.svg).toMatch(/<g class="frame r1" id="f-cfm"/); // the frame after the start frame, then round
    expect(r.svg).toMatch(/<g class="frame r2" id="f-physical"/);
    expect(r.svg).toContain('.r1{animation-delay:-24s}');
    // inside a reduced-motion guard; a fragment, #still or data-rotate="off" stops it
    expect(r.svg).toMatch(/@media \(prefers-reduced-motion:no-preference\)\{@keyframes/);
    expect(r.svg).toContain(':root:has(.frame:target) .frame,:root:has(#still:target) .frame,:root[data-rotate="off"] .frame{animation:none}');
    expect(r.svg).toContain('<rect id="still"');
  });

  test('the period comes from the view; one frame does not animate', () => {
    expect(frames(read(LABS['g8032-two-ring']), { frames: { period_s: 6 } }).svg).toContain('.frame{animation:nf-rotate 12s step-end infinite}');
    const one = frameStyle(['physical'], 'physical');
    expect(one).not.toContain('@keyframes');
    expect(one).toContain('.frame.start{visibility:visible}');
    expect(frames(read(LABS['adaptive-sr-cfm']), { frames: { rule: 'list', list: ['igp'] } }).svg).not.toContain('@keyframes');
  });

  test('still(id): one frame on its own, no CSS', () => {
    const r = frames(read(LABS['srv6-evpn']));
    const s = r.still('igp');
    expect(s).not.toContain('<style>');
    expect(s).toContain('id="f-igp"');
    expect(s).not.toContain('id="f-evpn"');
    expect(() => r.still('nope')).toThrow(/no frame "nope"/);
  });
});

describe('PNG export', () => {
  const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  test('one PNG per frame and scale, at the frame size times the scale', async () => {
    const r = frames(read(LABS['g8032-two-ring']), { preset: 'card-frames' });
    const pngs = await framePngs(r, { scales: [1, 2] });
    expect(pngs.map((p) => `${p.id}@${p.scale}`)).toEqual(['physical@1', 'physical@2', 'ring@1', 'ring@2']);
    for (const p of pngs) {
      expect(p.png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(pngSize(p.png)).toEqual([r.width * p.scale, r.height * p.scale]);
      expect(p.png.length).toBeGreaterThan(5000); // drawn, not blank
    }
    expect(pngs[0].png.equals(pngs[2].png)).toBe(false);
    expect(pngName('lab', 'igp', 1)).toBe('lab.igp.png');
    expect(pngName('lab', 'igp', 2)).toBe('lab.igp@2x.png');
  });

  test('CLI --png-dir writes <name>.<frame>.png and @2x, named after the facts file (or its folder)', async () => {
    const files = {}, dirs = [], err = [];
    const code = await main([LABS['g8032-two-ring'], '--png-dir', 'out', '--scale', '1,2'], { read, write: (f, d) => (files[f] = d), mkdir: (d) => dirs.push(d), out: { write: () => {} }, err: { write: (x) => err.push(x) } });
    expect(code).toBe(0);
    expect(dirs).toEqual(['out']);
    expect(Object.keys(files).sort()).toEqual(['out/g8032-two-ring.physical.png', 'out/g8032-two-ring.physical@2x.png', 'out/g8032-two-ring.ring.png', 'out/g8032-two-ring.ring@2x.png']);
    expect(labName('examples/adaptive-sr-cfm/facts.json')).toBe('adaptive-sr-cfm');
    expect(() => parseArgs(['a.json', '--scale', '0'])).toThrow(/--scale/);
  });
});

describe('port badges and metric pills never overlap', () => {
  const rects = (svg, re) => [...svg.matchAll(re)].map((m) => m.slice(1, 5).map(Number));
  const overlap = (a, b, pad = 0.5) => a[0] < b[0] + b[2] - pad && b[0] < a[0] + a[2] - pad && a[1] < b[1] + b[3] - pad && b[1] < a[1] + a[3] - pad;
  const frameOf = (svg, id) => svg.match(new RegExp(`<g class="frame[ a-z0-9]*" id="f-${id}"[\\s\\S]*?(?=\\n<g class="frame|\\n</svg>)`))?.[0] ?? '';
  const BADGE = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="[\d.]+" fill="#fff" stroke="#9aa4b1"/g;
  const DEVICE = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="[\d.]+" fill="#(?!fff)[0-9a-f]{6}"[^>]*stroke="#(?:fff|8a94a3|1d2430)"/g;
  const METRIC = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="[\d.]+" fill="#fff" stroke="#2e9e5b"/g;
  const GHOST = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="[\d.]+" fill="#eef1f4"/g;
  const pairs = (xs, ys = null) => (ys ? xs.flatMap((a) => ys.filter((b) => overlap(a, b))) : xs.flatMap((a, i) => xs.slice(i + 1).filter((b) => overlap(a, b))));

  for (const [lab, path] of Object.entries(LABS)) {
    test(lab, () => {
      const svg = frames(read(path), { preset: 'card-frames' }).svg;
      for (const id of ['physical', 'optical']) {
        const fr = frameOf(svg, id);
        if (!fr) continue;
        // a router symbol counts as its ring's square (render/frames.js deviceRect)
        const routers = [...fr.matchAll(/<g class="router"><circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) => { const r = (+m[3] * 0.88) / 0.75; return [+m[1] - r, +m[2] - r, 2 * r, 2 * r]; });
        const badges = rects(fr, BADGE), devices = [...rects(fr, DEVICE), ...routers];
        expect(devices.length, `${id}: device boxes found`).toBeGreaterThan(0);
        expect(pairs(badges), `${id}: badge on badge`).toEqual([]);
        expect(pairs(badges, devices), `${id}: badge on device`).toEqual([]);
      }
      const igp = frameOf(svg, 'igp');
      if (igp) {
        const metrics = rects(igp, METRIC);
        expect(pairs(metrics), 'metric on metric').toEqual([]);
        expect(pairs(metrics, rects(igp, GHOST)), 'metric on device').toEqual([]);
      }
    });
  }

  test('the bond cables of vpws-bonds keep both ends\' ports, apart', () => {
    const fr = frameOf(frames(read(LABS['vpws-bonds']), { preset: 'card-frames' }).svg, 'physical');
    const n = rects(fr, BADGE).length;
    const links = (fr.match(/<title>[^<]* — [^<]*/g) ?? []).length;
    expect(n).toBe(links * 2); // every port drawn, none dropped to the hover title
  });

  test('placeBadge: clear of its own box, then along the link, then beside it, else null', async () => {
    const { placeBadge } = await import('../src/render/frames.js');
    const box = { x: 0, y: 0, w: 40, h: 24 };
    const from = { x: 20, y: 12 }, to = { x: 220, y: 12 };
    const s1 = placeBadge(from, to, 200, 20, 13, box, [box]);
    expect(s1.rect.x).toBeGreaterThanOrEqual(40); // outside the box, measured from its edge
    const s2 = placeBadge(from, to, 200, 20, 13, box, [box, s1.rect]);
    expect(s2.rect.x).toBeGreaterThan(s1.rect.x + s1.rect.w); // slid along past the first badge
    const crowded = placeBadge({ x: 20, y: 12 }, { x: 70, y: 12 }, 50, 20, 13, box, [box, { x: 40, y: -40, w: 40, h: 104 }]);
    expect(crowded).toBeNull(); // no room on a short, crowded link: the port stays in the hover title
  });
});
