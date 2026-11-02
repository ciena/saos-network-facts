#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// saos-network-facts-render: a facts file to the card frames and the exploded snapshot, as static
// SVG files (src/render). Runs from a checkout (Node 22.18 or later) or as the bundled
// render/saos-network-facts-render.mjs in the viewer release asset.
//
//   saos-network-facts-render facts.json [--view view.json] [--params "preset=card-frames&start=igp"]
//                             [--frames frames.svg] [--snapshot snapshot.svg]
//                             [--png-dir DIR [--scale 1,2] [--font FILE] [--font-family NAME]]
//
// With neither --frames, --snapshot nor --png-dir, the frames SVG goes to standard output. --png-dir
// writes one PNG per frame and scale, <name>.<frame>.png and <name>.<frame>@2x.png (name: the facts
// file's, without .json / .facts.json; for a plain facts.json, its folder's), rasterised with @resvg/resvg-js (src/render/png.js). Warnings
// (view properties ignored, layout hints not used) go to standard error.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { frames, snapshot } from '../src/render/index.js';
import { framePngs, pngName } from '../src/render/png.js';

const USAGE = 'usage: saos-network-facts-render facts.json [--view view.json] [--params QUERY] [--frames out.svg] [--snapshot out.svg] [--png-dir DIR [--scale 1,2] [--font FILE] [--font-family NAME]]';

// The lab's name from its facts file: core.facts.json -> core; a plain facts.json -> its folder's name.
export function labName(path) {
  const base = basename(path).replace(/(\.facts)?\.json$/, '');
  return base === 'facts' ? basename(dirname(resolve(path))) || base : base;
}

export function parseArgs(argv) {
  const opts = { facts: null, view: null, params: null, frames: null, snapshot: null, pngDir: null, scale: '1,2', fonts: [], fontFamily: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const key = { '--view': 'view', '--params': 'params', '--frames': 'frames', '--snapshot': 'snapshot', '--png-dir': 'pngDir', '--scale': 'scale', '--font': 'fonts', '--font-family': 'fontFamily' }[a];
    if (key) {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      if (key === 'fonts') opts.fonts.push(argv[++i]);
      else opts[key] = argv[++i];
    } else if (a === '-h' || a === '--help') opts.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else if (!opts.facts) opts.facts = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  opts.scales = String(opts.scale).split(',').map((x) => Number(x.trim()));
  if (!opts.scales.length || opts.scales.some((x) => !(x > 0 && x <= 8))) throw new Error(`--scale: expected numbers from 0 to 8, as 1,2`);
  return opts;
}

export async function main(argv, { read = (f) => readFileSync(f, 'utf8'), write = writeFileSync, mkdir = (d) => mkdirSync(d, { recursive: true }), out = process.stdout, err = process.stderr } = {}) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    err.write(`${e.message}\n${USAGE}\n`);
    return 2;
  }
  if (opts.help || !opts.facts) {
    (opts.help ? out : err).write(`${USAGE}\n`);
    return opts.help ? 0 : 2;
  }
  try {
    const facts = read(opts.facts);
    const view = opts.view ? read(opts.view) : undefined;
    const params = opts.params ?? undefined;
    const name = { name: labName(opts.facts) };
    const jobs = [];
    const fr = opts.frames || opts.pngDir || !opts.snapshot ? frames(facts, view, params, name) : null;
    if (opts.frames || (!opts.snapshot && !opts.pngDir)) jobs.push(['frames', fr, opts.frames]);
    if (opts.snapshot) jobs.push(['snapshot', snapshot(facts, view, params, name), opts.snapshot]);
    for (const w of new Set(jobs.flatMap(([, r]) => r.warnings))) err.write(`warning: ${w}\n`);
    for (const [kind, r, path] of jobs) {
      if (path) write(path, r.svg);
      else out.write(r.svg);
      const what = kind === 'frames' ? `${r.frames.length} frames (${r.frames.map((f) => f.id).join(', ')}), start ${r.start}` : `${r.layers.length} planes (${r.layers.join(', ')}), ${r.view.snapshot.variant}`;
      if (path) err.write(`${path}: ${what}, ${r.width}x${r.height}, ${Buffer.byteLength(r.svg)} bytes\n`);
    }
    if (opts.pngDir) {
      if (!jobs.some(([kind]) => kind === 'frames')) for (const w of fr.warnings) err.write(`warning: ${w}\n`);
      mkdir(opts.pngDir);
      for (const p of await framePngs(fr, { scales: opts.scales, fontFiles: opts.fonts, fontFamily: opts.fontFamily })) {
        const path = join(opts.pngDir, pngName(name.name, p.id, p.scale));
        write(path, p.png);
        err.write(`${path}: ${p.width}x${p.height}, ${p.png.length} bytes\n`);
      }
    }
    return 0;
  } catch (e) {
    err.write(`${opts.facts}: ${e.message}\n`);
    return 1;
  }
}

const invoked = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (invoked) process.exitCode = await main(process.argv.slice(2));
