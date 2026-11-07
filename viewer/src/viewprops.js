// SPDX-License-Identifier: Apache-2.0
// View properties on this page: the view resolved from the lab's view file (or the page's ?view=)
// and the URL parameters (js/src/view.ts), and what the 3D page applies of it: the planes it draws and
// lists (layers), whether devices without facts are plain boxes (plain), where the camera starts
// (camera) and how much the labels say (density). The rest (frames, snapshot, layout) is resolved and
// exposed for the pages and embedders that use it. No DOM or three.js here, so it is testable.
import { resolveView } from '../../js/src/index.ts';
import { labelOptions } from './view/labels.js';

// The page's layer ids that differ from the view's (view.ts LAYER_IDS): the IGP plane is "isis".
const PAGE_LAYER = { igp: 'isis' };
export const pageLayerId = (viewId) => PAGE_LAYER[viewId] ?? viewId;
// The view layers the page has no plane for: role is a 2D frame only (render/frames.js); the page shows
// the roles as its devices' colours, on every plane.
export const FRAME_ONLY = ['role'];

// { view, warnings } for a view file's text (or null) and why it could not be fetched (or null).
export function pageView(viewText, viewError, search) {
  const { view, warnings } = resolveView(viewText ?? undefined, search);
  return { view, warnings: viewError ? [viewError, ...warnings] : warnings };
}

// The page layers to draw and list: those the facts have content for (`present`, in stacking order)
// that the view's layers name. When that leaves none (?layers=ring on a lab without rings), every
// present layer, with a warning, so the page never comes up empty. No view: `present` as it is.
export function viewLayers(view, present) {
  const wanted = new Set(view.layers.map(pageLayerId));
  const layers = present.filter((id) => wanted.has(id));
  if (layers.length || !present.length) return { layers, narrowed: layers.length < present.length, warnings: [] };
  return { layers: [...present], narrowed: false, warnings: [`layers: the facts have none of ${view.layers.join(', ')}; showing every layer they have`] };
}

// The importer's options from the view: plain boxes for devices without facts unless plain is false,
// and the layout properties (js/src/layout.ts layoutFacts).
export function importOptions(view) {
  return { plain: view.plain !== false, layout: view.layout };
}

// ---- camera -------------------------------------------------------------------------------------
// Where the camera starts, for the view's camera: { target, position } as [x, y, z] in scene units.
// box: the planes' outline in xz (view/layers.js planeBox); planes: how many are stacked, `gap` apart
// from y 0 up; aspect: width / height of the part of the page the stack is seen in (between the side
// panels); fov: the camera's vertical field of view in degrees; narrowed: the view left out planes the
// facts have (viewLayers), so fit aims at the middle of the planes left rather than the page's y 13.
//   fit  front and above, far enough back for the widest side (the page's camera without a view)
//   top  straight down on the top plane, the outline filling the view with a 10% margin
//   iso  isometric from the front right corner (equal angles to the three axes), the whole stack in view
export const CAMERAS = ['fit', 'top', 'iso'];

export function cameraPose(box, camera = 'fit', { planes = 1, gap = 6, aspect = 16 / 9, fov = 45, narrowed = false } = {}) {
  const cx = (box.x0 + box.x1) / 2;
  const cz = (box.z0 + box.z1) / 2;
  const w = box.x1 - box.x0;
  const d = box.z1 - box.z0;
  const top = Math.max(0, planes - 1) * gap;
  const half = (fov * Math.PI) / 360;
  const t = Math.tan(half);
  if (camera === 'top') {
    const dist = 1.1 * Math.max(d / 2 / t, w / 2 / (t * aspect));
    // a hair off vertical towards the front, so "up" on screen stays the far side, as in fit
    return { target: [cx, top, cz], position: [cx, top + dist, cz + dist * 1e-3] };
  }
  if (camera === 'iso') {
    const r = Math.hypot(w, d, top) / 2;
    const dist = r / Math.sin(Math.min(half, Math.atan(t * aspect)));
    const k = dist / Math.sqrt(3);
    return { target: [cx, top / 2, cz], position: [cx + k, top / 2 + k, cz + k] };
  }
  const size = Math.max(w, d * 1.6);
  const y = narrowed ? top / 2 : 13;
  return { target: [cx, y, cz], position: [cx, y + size * 0.85, cz + size * 1.4] };
}

// ---- labels -------------------------------------------------------------------------------------
// The Labels panel's options for a view density (view/labels.js labelOptions): null keeps the page's
// own (`own`: the visitor's stored choice); a density sets what the labels say and keeps their size.
const DENSITY = {
  full: { node: 'full', bgp: 'all', lag: true },
  compact: { node: 'name', bgp: 'down', lag: true },
  minimal: { node: 'name', bgp: 'none', lag: false },
};

export function densityLabels(density, own = {}) {
  const base = labelOptions(own);
  return DENSITY[density] ? { ...base, ...DENSITY[density] } : base;
}

// ---- embed --------------------------------------------------------------------------------------
// The page's own controls for a view (view 1.4 `embed`): a page embedded in another one (an iframe
// opened on one lab) shows that lab and offers nothing else to load: no example-lab button, no
// facts-file picker or its note, no file drop, and never the lab picker. Not embedded: all of them,
// the lab picker when the index has two labs or more.
export function pageControls(view, labCount = 0) {
  const own = !view?.embed;
  return { example: own, file: own, drop: own, labPicker: own && labCount >= 2 };
}

// What the page does when the facts the URL names cannot be loaded (`message`: why): show the bundled
// example with the error after it, or, embedded, the error alone.
export function failedLoad(view, message) {
  return view?.embed ? { example: false, error: message } : { example: true, error: `${message}; showing the example` };
}

// What the page does when the URL names no facts and the site has no lab index: show the bundled
// example, or, embedded, say there is nothing to show.
export function nothingNamed(view) {
  return view?.embed ? { example: false, error: 'nothing to show: the URL names no facts file (?facts=) or lab (?lab=)' } : { example: true, error: null };
}
