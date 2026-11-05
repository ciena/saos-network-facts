// SPDX-License-Identifier: Apache-2.0
// Static renders of a facts file, for pages and cards that show a lab without the 3D page:
//   frames(facts, view)    one SVG, a frame per layer the lab has content for (frames.js)
//   snapshot(facts, view)  one SVG, the exploded (or stacked) planes with layer chips (snapshot.js)
// Both read the view properties (js/src/view.ts resolveView: a view file, as JSON text or an object,
// plus optional URL-style parameters) and place devices with the library layout (layoutFacts), so a
// card, a snapshot and the 3D page agree. Pure functions: no DOM, no network, no three.js; the same
// facts and view give the same bytes.

import { resolveView, viewFrames } from '../../../js/src/index.ts';
import { buildNetwork } from '../engine/network.js';
import { importFacts } from '../import/facts.js';
import { renderFrames } from './frames.js';
import { layerModel, presentLayers, renderModel } from './model.js';
import { renderSnapshot } from './snapshot.js';

export { presentLayers, renderModel } from './model.js';
export { frameTitle } from './frames.js';
export { snapshotLayers } from './snapshot.js';

// The facts imported and the network built once, for both renders: { model, view, positions, method, warnings }.
// `name`: the lab's name when the facts carry no recipe (the CLI passes the file's name).
export function prepare(facts, view, params, { name } = {}) {
  const { view: resolved, warnings } = resolveView(view, params);
  const text = typeof facts === 'string' ? facts : JSON.stringify(facts);
  const imp = importFacts(text, { plain: resolved.plain !== false, layout: resolved.layout });
  if (name && !imp.file.devices.some((r) => r.recipe)) imp.topology.name = name;
  const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
  const model = renderModel(imp, net);
  if (resolved.title) model.name = resolved.title;
  return { model, view: resolved, positions: imp.layout.positions, method: imp.layout.method, warnings: [...warnings, ...imp.layout.warnings] };
}

// The frames a card shows: the present layers, SR policies / MPLS-TP only when there is no
// pseudowire frame (which shows the transport already), in the view's order, from its start frame.
// A signature start on a physical frame without a link (every cable of the lab runs to the line
// system, which the optical frame draws) is the optical frame instead: the card opens on the network.
export function frameLayers(model, view) {
  const present = presentLayers(model);
  const out = viewFrames(view, present.includes('pw') ? present.filter((id) => id !== 'mpls') : present);
  if (view.frames.start === 'signature' && out.start === 'physical' && out.frames.includes('optical') && !layerModel(model, 'physical', true).links.length) out.start = 'optical';
  return out;
}

export function frames(facts, view, params, opts) {
  const p = prepare(facts, view, params, opts);
  const { frames: list, start } = frameLayers(p.model, p.view);
  const out = renderFrames(p.model, p.positions, { frames: list.length ? list : ['physical'], start: start ?? 'physical', period: p.view.frames.period_s });
  return { ...out, view: p.view, warnings: p.warnings, model: p.model };
}

export function snapshot(facts, view, params, opts) {
  const p = prepare(facts, view, params, opts);
  const out = renderSnapshot(p.model, p.positions, { variant: p.view.snapshot.variant, layers: p.view.layers, title: p.view.title, method: p.method });
  return { ...out, view: p.view, warnings: p.warnings, model: p.model };
}
