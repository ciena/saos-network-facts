#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// saos-network-facts-render: a facts file to the card frames and the exploded snapshot, as static
// SVG files (src/render). Runs from a checkout (Node 22.18 or later) or as the bundled
// render/saos-network-facts-render.mjs in the viewer release asset.
//
//   saos-network-facts-render facts.json [--view view.json] [--params "preset=card-frames&start=igp"]
//                             [--frames frames.svg] [--snapshot snapshot.svg]
//
// With neither --frames nor --snapshot, the frames SVG goes to standard output. Warnings (view
// properties ignored, layout hints not used) go to standard error.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { frames, snapshot } from '../src/render/index.js';

const USAGE = 'usage: saos-network-facts-render facts.json [--view view.json] [--params QUERY] [--frames out.svg] [--snapshot out.svg]';

export function parseArgs(argv) {
  const opts = { facts: null, view: null, params: null, frames: null, snapshot: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const key = { '--view': 'view', '--params': 'params', '--frames': 'frames', '--snapshot': 'snapshot' }[a];
    if (key) {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      opts[key] = argv[++i];
    } else if (a === '-h' || a === '--help') opts.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else if (!opts.facts) opts.facts = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  return opts;
}

export function main(argv, { read = (f) => readFileSync(f, 'utf8'), write = writeFileSync, out = process.stdout, err = process.stderr } = {}) {
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
    const name = { name: basename(opts.facts).replace(/(\.facts)?\.json$/, '') };
    const jobs = [];
    if (opts.frames || !opts.snapshot) jobs.push(['frames', frames(facts, view, params, name), opts.frames]);
    if (opts.snapshot) jobs.push(['snapshot', snapshot(facts, view, params, name), opts.snapshot]);
    for (const w of new Set(jobs.flatMap(([, r]) => r.warnings))) err.write(`warning: ${w}\n`);
    for (const [kind, r, path] of jobs) {
      if (path) write(path, r.svg);
      else out.write(r.svg);
      const what = kind === 'frames' ? `${r.frames.length} frames (${r.frames.map((f) => f.id).join(', ')}), start ${r.start}` : `${r.layers.length} planes (${r.layers.join(', ')}), ${r.view.snapshot.variant}`;
      if (path) err.write(`${path}: ${what}, ${r.width}x${r.height}, ${Buffer.byteLength(r.svg)} bytes\n`);
    }
    return 0;
  } catch (e) {
    err.write(`${opts.facts}: ${e.message}\n`);
    return 1;
  }
}

const invoked = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (invoked) process.exitCode = main(process.argv.slice(2));
