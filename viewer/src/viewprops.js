// SPDX-License-Identifier: Apache-2.0
// View properties on this page: the view resolved from the lab's view file (or the page's ?view=)
// and the URL parameters (js/src/view.ts), and what the 3D page applies of it today: which layers
// start shown. The rest (frames, snapshot, layout, camera) is resolved and exposed for the pages
// and embedders that use it. No DOM here, so it is testable.
import { LAYER_IDS, resolveView } from '../../js/src/index.ts';

// The page's layer ids that differ from the view's (view.ts LAYER_IDS): the IGP plane is "isis".
const PAGE_LAYER = { igp: 'isis' };
export const pageLayerId = (viewId) => PAGE_LAYER[viewId] ?? viewId;

// { view, warnings } for a view file's text (or null) and why it could not be fetched (or null).
export function pageView(viewText, viewError, search) {
  const { view, warnings } = resolveView(viewText ?? undefined, search);
  return { view, warnings: viewError ? [viewError, ...warnings] : warnings };
}

// Page layer id -> shown, for the view's layers (every view layer has a page layer).
export function layerVisibility(view) {
  return Object.fromEntries(LAYER_IDS.map((id) => [pageLayerId(id), view.layers.includes(id)]));
}
