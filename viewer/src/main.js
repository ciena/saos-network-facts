// SPDX-License-Identifier: Apache-2.0
// The viewer page: loads a facts file (the one the URL names, see labs.js; else
// the bundled example; or one the visitor picks), imports it into the engine
// topology, builds the network and shows it as stacked layers, with the
// overview / device / service panels, walks and failure replays. Routes:
// #device=NAME, #service=ID, #topology (panels hidden); anything else is the overview.

import exampleFacts from '../../examples/adaptive-sr-cfm/facts.json?raw';
import { buildNetwork, ccmWalk, isisFloodWalk, ospfFloodAreas, ospfFloodWalk, replayFailure, tpTunnelWalk, vpwsWalk } from './engine/index.js';
import { importFacts } from './import/facts.js';
import { labParams, loadFromParams, loadLab } from './labs.js';
import { renderDevice, renderOverview, renderService } from './panels.js';
import { Animator, DWELL_MS, TRAVEL_MS } from './view/animator.js';
import { LAYERS, LayerView, hex } from './view/layers.js';
import { markStep, renderImportReport, renderStep, renderStepList } from './view/panel.js';
import { createScene } from './view/scene.js';
import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const PLAY_ICON = 'M7 5v14l12-7z';
const PAUSE_ICON = 'M6 5h4v14H6zM14 5h4v14h-4z';
const EXAMPLE_NAME = 'Adaptive-SR-CFM (example)';

const { renderer, labels, scene, camera, controls } = createScene($('scene'), $('stage'));
const layers = new LayerView(scene);
const animator = new Animator(scene, layers);

const state = { imp: null, net: null, failures: [], walk: null, step: 0, playing: false, speed: 1, elapsed: 0, replay: null };

// ---- loading ---------------------------------------------------------------

function load(text, name, positions = null) {
  let imp;
  try {
    imp = importFacts(text, { name: name ?? undefined, positions });
  } catch (err) {
    showError(`${name ?? 'facts'}: ${err.message}`);
    return false;
  }
  showError(null);
  state.imp = imp;
  state.failures = [];
  state.replay = null;
  setWalk(null);
  rebuild();
  fitCamera();
  renderImportReport($('tab-import'), imp.report);
  fillSelects();
  route();
  return true;
}

function showError(text) {
  $('facts-error').hidden = !text;
  $('facts-error').textContent = text ?? '';
}

function rebuild(net = null) {
  const { imp } = state;
  state.net = net ?? buildNetwork(imp.topology, { labelMode: imp.labelMode, failures: state.failures });
  layers.build(state.net);
  $('topo-name').textContent = `${imp.topology.name} · ${imp.topology.nodes.length} devices, ${imp.topology.links.length} links`;
  $('fail-state').textContent = state.failures.length ? `Down: ${state.failures.join(', ')}` : 'All links up';
  renderOverview($('tab-overview'), imp, state.net);
  if (current.tab === 'device') renderDevice($('tab-device'), imp, state.net, current.id);
  if (current.tab === 'service') renderService($('tab-service'), imp, state.net, current.id, walkActions);
}

// Frame the layer stack: look at its middle from the front and above, far enough back for the
// widest side, with the projection shifted so the stack sits between the two side panels.
function fitCamera() {
  const { x0, x1, z0, z1 } = layers.box;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const size = Math.max(x1 - x0, (z1 - z0) * 1.6);
  controls.target.set(cx, 13, cz);
  camera.position.set(cx, 13 + size * 0.85, cz + size * 1.4);
  offsetView();
  controls.update();
}

function offsetView() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const left = $('controls').getBoundingClientRect();
  const right = $('detail').getBoundingClientRect();
  const wide = w > 900 && !document.body.classList.contains('topology-only');
  const shift = wide ? (right.width - left.width) / 2 : 0;
  camera.setViewOffset(w, h, shift, 0, w, h);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', offsetView);

// ---- routes and tabs -------------------------------------------------------

const current = { tab: 'overview', id: null };

function showTab(tab) {
  for (const b of document.querySelectorAll('.tabs button')) b.classList.toggle('active', b.dataset.tab === tab);
  for (const t of ['overview', 'device', 'service', 'walk', 'import']) $(`tab-${t}`).hidden = t !== tab;
  current.tab = tab;
}

function route() {
  const hash = decodeURIComponent(location.hash.slice(1));
  document.body.classList.toggle('topology-only', hash === 'topology');
  offsetView();
  const [key, ...rest] = hash.split('=');
  const id = rest.join('=');
  if (!state.imp) return;
  if (key === 'device' && id) {
    current.id = id;
    renderDevice($('tab-device'), state.imp, state.net, id);
    showTab('device');
  } else if (key === 'service' && id) {
    current.id = id;
    renderService($('tab-service'), state.imp, state.net, id, walkActions);
    showTab('service');
  } else if (current.tab === 'device' || current.tab === 'service' || hash === '') {
    showTab('overview');
  }
}

window.addEventListener('hashchange', route);
for (const b of document.querySelectorAll('.tabs button')) {
  b.addEventListener('click', () => {
    if (b.dataset.tab === 'overview') history.replaceState(null, '', location.pathname + location.search);
    showTab(b.dataset.tab);
  });
}
$('p-panels').addEventListener('click', () => {
  location.hash = document.body.classList.contains('topology-only') ? '' : 'topology';
});

// ---- layers ----------------------------------------------------------------

for (const L of LAYERS) {
  const label = document.createElement('label');
  label.innerHTML = `<input type="checkbox" checked data-layer="${L.id}"/><span class="swatch" style="background:${hex(L.color)}"></span>${L.name}`;
  label.querySelector('input').addEventListener('change', (e) => layers.setVisible(L.id, e.target.checked));
  $('layer-toggles').appendChild(label);
}

// ---- walks -----------------------------------------------------------------

function options(sel, values) {
  const prev = sel.value;
  sel.innerHTML = values.map((v) => `<option value="${v.value}">${v.label}</option>`).join('');
  if (values.some((v) => v.value === prev)) sel.value = prev;
}

function fillWalkParams() {
  const box = $('walk-params');
  const kind = $('walk-kind').value;
  const net = state.net;
  box.innerHTML = '';
  const add = (id, values) => {
    const s = document.createElement('select');
    s.id = id;
    options(s, values);
    box.appendChild(s);
    return s;
  };
  if (kind === 'tp') {
    add('wp-a', net.tp.tunnels.map((t) => ({ value: t.id, label: `${t.id} (${t.src}–${t.dst})${t.role === 'backup' ? ' backup' : ''}` })));
  } else if (kind === 'vpws') {
    const pw = add('wp-a', net.vpws.pseudowires.map((p) => ({ value: p.id, label: `${p.service} PW ${p.pwid} (${p.ends.map((e) => e.node).join('–')})` })));
    const from = add('wp-b', []);
    const ends = () => options(from, (net.vpws.pseudowires.find((p) => p.id === pw.value)?.ends ?? []).map((e) => ({ value: e.node, label: `from ${e.node}` })));
    pw.addEventListener('change', ends);
    ends();
  } else if (kind === 'ccm') {
    add('wp-a', net.cfm.megs.map((m) => ({ value: m.id, label: `MEG ${m.id}` })));
  } else {
    const origin = add('wp-a', net.igp.routers.map((r) => ({ value: r, label: `origin ${r}` })));
    // OSPF floods a Router-LSA per area: with more than one area, the area of the origin's to flood in.
    if (net.igpName === 'ospf' && net.igp.routers.some((r) => ospfFloodAreas(net, r).length)) {
      const area = add('wp-b', []);
      const areas = () => options(area, ospfFloodAreas(net, origin.value).map((a) => ({ value: a, label: `area ${a}` })));
      origin.addEventListener('change', areas);
      areas();
    }
  }
  $('walk-run').disabled = !box.querySelector('select')?.options.length;
}

function fillSelects() {
  const has = { vpws: state.net.vpws.pseudowires.length > 0, ccm: state.net.cfm.megs.length > 0, tp: state.net.tp.tunnels.length > 0, isis: state.net.igp.routers.length > 0 };
  $('walk-kind').querySelector('option[value="isis"]').textContent = state.net.igpName === 'ospf' ? 'OSPF LSA flood' : 'IS-IS LSP flood';
  for (const o of $('walk-kind').options) o.disabled = !has[o.value];
  if (!has[$('walk-kind').value]) $('walk-kind').value = Object.keys(has).find((k) => has[k]) ?? 'vpws';
  fillWalkParams();
  options($('fail-target'), state.imp.topology.links.flatMap((l) => [
    { value: l.id, label: `${l.id} (${l.kind}${l.lag ? ', LAG' : ''})` },
    ...(l.lag ? l.members.map((m) => ({ value: m.id, label: `\u2003member ${m.id} (${m.a}\u2013${m.b})` })) : []),
  ]));
}

$('walk-kind').addEventListener('change', fillWalkParams);

const walkActions = {
  walkPw: (pwId, from) => runWalk(() => vpwsWalk(state.net, pwId, from)),
  walkCcm: (megId) => runWalk(() => ccmWalk(state.net, megId)),
};

function runWalk(make) {
  if (state.replay) restore();
  try {
    setWalk(make());
  } catch (err) {
    setWalk({ title: err.message, steps: [] });
  }
  showTab('walk');
  state.playing = true;
  updatePlayIcon();
}

$('walk-run').addEventListener('click', () => {
  const kind = $('walk-kind').value;
  const a = $('wp-a')?.value;
  const b = $('wp-b')?.value;
  if (kind === 'vpws') walkActions.walkPw(a, b);
  else if (kind === 'ccm') walkActions.walkCcm(a);
  else if (kind === 'tp') runWalk(() => tpTunnelWalk(state.net, a));
  else runWalk(() => (state.net.igpName === 'ospf' ? ospfFloodWalk(state.net, a, b ?? null) : isisFloodWalk(state.net, a)));
});

function setWalk(walk) {
  state.walk = walk;
  state.step = 0;
  state.elapsed = 0;
  $('walk-title').textContent = walk?.title ?? 'No walk';
  renderStepList($('step-list'), walk, (i) => goStep(i));
  goStep(0);
}

function goStep(i) {
  const steps = state.walk?.steps ?? [];
  state.step = Math.max(0, Math.min(i, steps.length - 1));
  state.elapsed = 0;
  const step = steps[state.step];
  $('p-pos').textContent = `${steps.length ? state.step + 1 : 0} / ${steps.length}`;
  if (!step) {
    animator.clear();
    layers.highlight([]);
    renderStep($('step-detail'), null);
    return;
  }
  // A replay shows the network before the failure until its last step, unless the step names
  // the network it belongs to (a ring in protection, the link repaired but not yet reverted).
  if (state.replay) {
    const nets = { before: state.replay.before, after: state.replay.after, ...state.replay.networks };
    rebuild(nets[step.network] ?? (state.step === steps.length - 1 ? state.replay.after : state.replay.before));
  }
  markStep($('step-list'), state.step);
  renderStep($('step-detail'), step);
  layers.highlight(step.highlight?.links ?? step.moves.map((m) => m.link));
  animator.show(step, state.walk.layer);
}

// ---- failures --------------------------------------------------------------

$('fail-run').addEventListener('click', () => {
  const link = $('fail-target').value;
  if (!link) return;
  const detection = $('fail-detection').value;
  const { before, after, networks, replay } = replayFailure(state.imp.topology, link, { labelMode: state.imp.labelMode, detection });
  state.failures = [link];
  state.replay = { before, after, networks };
  setWalk(replay);
  showTab('walk');
  state.playing = true;
  updatePlayIcon();
  $('fail-state').textContent = `Down: ${link}`;
});

function restore() {
  state.failures = [];
  state.replay = null;
  rebuild();
}

$('fail-restore').addEventListener('click', () => {
  restore();
  setWalk(null);
});

// ---- player ----------------------------------------------------------------

function updatePlayIcon() {
  $('p-play-icon').setAttribute('d', state.playing ? PAUSE_ICON : PLAY_ICON);
}

$('p-play').addEventListener('click', () => {
  state.playing = !state.playing;
  updatePlayIcon();
});
$('p-prev').addEventListener('click', () => goStep(state.step - 1));
$('p-next').addEventListener('click', () => goStep(state.step + 1));
$('p-speed').addEventListener('input', (e) => (state.speed = Number(e.target.value)));
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select')) return;
  if (e.key === ' ') {
    e.preventDefault();
    $('p-play').click();
  } else if (e.key === 'ArrowLeft') goStep(state.step - 1);
  else if (e.key === 'ArrowRight') goStep(state.step + 1);
});

// ---- picking ---------------------------------------------------------------

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return; // a drag, not a click
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(layers.pickables)[0];
  if (hit) location.hash = `device=${encodeURIComponent(hit.object.userData.node)}`;
});

// ---- files -----------------------------------------------------------------

$('facts-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (load(await file.text(), file.name.replace(/\.json$/i, ''))) location.hash = '';
  e.target.value = '';
});
$('facts-example').addEventListener('click', () => {
  load(exampleFacts, EXAMPLE_NAME);
  history.replaceState(null, '', location.pathname);
});
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && load(await file.text(), file.name.replace(/\.json$/i, ''))) location.hash = '';
});

// ---- frame loop ------------------------------------------------------------

let last = performance.now();
function frame(now) {
  const dt = now - last;
  last = now;
  const steps = state.walk?.steps ?? [];
  if (state.playing && steps.length) {
    state.elapsed += dt * state.speed;
    if (state.elapsed >= TRAVEL_MS + DWELL_MS) {
      if (state.step < steps.length - 1) goStep(state.step + 1);
      else {
        state.playing = false;
        updatePlayIcon();
      }
    }
  }
  animator.update(Math.min(1, state.elapsed / TRAVEL_MS));
  controls.update();
  renderer.render(scene, camera);
  labels.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---- labs by URL --------------------------------------------------------------

let labIndex = null;

function loadLabResult(lab) {
  return load(lab.factsText, lab.title, lab.positions);
}

function fillLabSelect() {
  const sel = $('lab-select');
  sel.hidden = !labIndex || labIndex.labs.length < 2;
  if (!labIndex) return;
  options(sel, labIndex.labs.map((l) => ({ value: l.id, label: l.title })));
}

$('lab-select').addEventListener('change', async (e) => {
  const lab = labIndex?.labs.find((l) => l.id === e.target.value);
  if (!lab) return;
  try {
    if (loadLabResult(await loadLab(fetch, lab))) {
      const q = new URLSearchParams(location.search);
      q.set('lab', lab.id);
      history.replaceState(null, '', `${location.pathname}?${q}`);
    }
  } catch (err) {
    showError(err.message);
  }
});

async function start() {
  let found = null;
  try {
    found = await loadFromParams(labParams(location.search), { base: location.href, fetch });
  } catch (err) {
    load(exampleFacts, EXAMPLE_NAME);
    showError(`${err.message}; showing the example`);
    return;
  }
  if (!found) {
    load(exampleFacts, EXAMPLE_NAME);
    return;
  }
  labIndex = found.index;
  fillLabSelect();
  if (labIndex) $('lab-select').value = found.lab.id;
  loadLabResult(found.lab);
}

start();
requestAnimationFrame(frame);
