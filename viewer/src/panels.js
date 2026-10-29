// SPDX-License-Identifier: Apache-2.0
// The facts panels: the overview (devices, services, SR policies, MPLS-TP tunnels, BGP), one
// device (its facts record, then the engine's tables for it) and one service
// (its pseudowire ends, transports and MEG). Links between them are hash
// routes (#device=PE1, #service=...), handled by main.js.

import { isisArea } from '../../js/src/index.ts';
import { renderNode } from './view/panel.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v);

export const deviceHref = (id) => `#device=${encodeURIComponent(id)}`;
export const serviceHref = (id) => `#service=${encodeURIComponent(id)}`;
const deviceLink = (id) => `<a href="${deviceHref(id)}">${esc(id)}</a>`;
const serviceLink = (s) => `<a href="${serviceHref(s.id)}">${esc(s.name)}</a>`;

// rows: arrays of cells; a cell is text (escaped) or { html }.
function table(headers, rows) {
  if (!rows.length) return '<p class="sub">none</p>';
  const cell = (c) => `<td>${c && typeof c === 'object' && 'html' in c ? c.html : esc(dash(c))}</td>`;
  return `<table class="tbl"><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('')}</table>`;
}

function kv(pairs) {
  return `<table class="kvt">${pairs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v && typeof v === 'object' && 'html' in v ? v.html : esc(dash(v))}</td></tr>`).join('')}</table>`;
}

function transportText(e) {
  const t = e.transport;
  if (t.error) return `down: ${t.error}`;
  if (t.kind === 'sr-policy') return `SR policy ${t.policy} [${t.stack.join(' ')}]`;
  if (t.kind === 'sr') return `Prefix-SID ${t.stack.join(' ')}`;
  if (t.kind === 'mpls-tp') return `MPLS-TP ${t.tunnel}${t.switched ? ` (protecting ${t.configured})` : ''} [${t.stack.join(' ')}]`;
  return t.kind ?? e.underlay;
}

export function renderOverview(el, imp, net) {
  const { file, topology: topo, services } = imp;
  const g = file.generator ?? {};
  const role = Object.fromEntries(topo.nodes.map((n) => [n.id, n.role]));
  let html = `<h2 class="title">${esc(topo.name)}</h2>`;
  html += `<p class="sub">Facts schema ${esc(file.schema_version)} · ${esc(g.name)} ${esc(g.version)}${g.translator ? ` · ${esc(g.translator.replace(/\s*\(.*\)$/, ''))}` : ''}</p>`;
  html += '<h2>Devices</h2>';
  html += table(
    ['device', 'type', 'role', 'loopback', 'status', 'PWs', 'MEPs'],
    file.devices.map((r) => {
      const n = topo.nodes.find((x) => x.id === r.device);
      return [n ? { html: deviceLink(r.device) } : r.device, r.type, n ? role[r.device].toUpperCase() : '-', n?.loopback, r.status, r.facts?.pseudowires?.length ?? 0, r.facts?.cfm?.meps?.length ?? 0];
    }),
  );
  html += '<h2>Services</h2>';
  html += table(
    ['service', 'ends', 'PW id', 'transport', 'state', 'MEG'],
    services.map((s) => {
      const pw = net.vpws.pseudowires.find((p) => p.id === s.pseudowire);
      const kinds = [...new Set(pw.ends.map((e) => ({ 'sr-policy': 'SR policy', sr: 'Prefix-SID', 'mpls-tp': 'MPLS-TP' })[e.transport.kind] ?? e.transport.kind ?? 'down'))];
      return [{ html: serviceLink(s) }, { html: s.ends.map((e) => deviceLink(e.node)).join(' – ') }, pw.pwid, kinds.join(' / '), pw.state, s.meg];
    }),
  );
  html += '<h2>SR policies</h2>';
  html += table(
    ['policy', 'headend', 'color', 'endpoint', 'segment list', 'path'],
    net.sr.policies.map((p) => [p.name, { html: deviceLink(p.headend) }, p.color, p.endpointNode ?? p.endpoint, p.segmentList.sids.join(' '), p.valid ? p.path.join(' > ') : p.reason]),
  );
  if (net.tp.tunnels.length) {
    html += '<h2>MPLS-TP tunnels</h2>';
    html += table(
      ['tunnel', 'role', 'path', 'OAM', 'state'],
      net.tp.tunnels.map((t) => [t.id, t.role === 'backup' ? `backup of ${t.protects ?? '?'}` : t.role, t.path.join(' > '), t.oam ? `${t.oam.kind.toUpperCase()}${t.oam.intervalMs ? ` ${t.oam.intervalMs} ms` : ''}` : null, `${t.state}${t.reasons.length ? ` (${t.reasons.join('; ')})` : ''}`]),
    );
  }
  html += '<h2>BGP sessions</h2>';
  html += table(
    ['a', 'b', 'RR client', 'state'],
    net.bgp.sessions.map((s) => [{ html: deviceLink(s.a) }, { html: deviceLink(s.b) }, s.client, `${s.state}${s.reason ? ` (${s.reason})` : ''}`]),
  );
  el.innerHTML = html;
}

export function renderDevice(el, imp, net, id) {
  const r = imp.file.devices.find((x) => x.device === id);
  if (!r) {
    el.innerHTML = `<p class="sub">No device ${esc(id)} in this facts file.</p>`;
    return;
  }
  const f = r.facts ?? {};
  const n = imp.topology.nodes.find((x) => x.id === id);
  const isis = f.isis?.instances?.[0];
  const sr = f.segment_routing;
  const bgp = f.bgp?.instances?.[0];
  const sid = sr?.prefix_sids?.find((s) => s.node);
  const srgb = sr?.srgb?.[0];
  let html = `<h2 class="title">${esc(id)} <span class="sub">${esc(n ? n.role.toUpperCase() : 'not shown')}</span></h2>`;
  html += kv([
    ['type', r.type],
    ['platform', r.platform],
    ['extractor', r.extractor],
    ['status', `${r.status}${r.reason ? ` (${r.reason})` : ''}`],
    ['hostname', f.hostname],
    ['files', { html: (r.templates ?? []).map(esc).join('<br/>') || '-' }],
  ]);
  if (isis) {
    html += '<h2>IS-IS</h2>';
    html += kv([
      ['instance', isis.name],
      ['level', isis.level],
      ['NET', isis.net],
      ['area', isisArea(isis)],
      ['system id', isis.system_id],
      ['segment routing', isis.sr_enabled === null || isis.sr_enabled === undefined ? null : isis.sr_enabled ? 'enabled' : 'disabled'],
    ]);
  }
  const ospf = (f.ospf?.instances ?? [])[0];
  if (ospf) {
    html += '<h2>OSPF</h2>';
    html += kv([
      ['instance', ospf.name],
      ['router id', ospf.router_id],
      ['VRF', ospf.vrf],
      ['areas', ospf.areas.map((a) => `${a.area}${a.type ? ` (${a.type})` : ''}`).join(', ')],
    ]);
    html += table(
      ['interface', 'area', 'type', 'metric', 'passive', 'BFD'],
      (f.ospf.interfaces ?? []).filter((i) => i.instance === ospf.name).map((i) => [i.interface, i.area, i.type, i.metric, i.passive ? 'yes' : 'no', i.bfd ? 'yes' : 'no']),
    );
  }
  if (sr && (srgb || sid)) {
    html += '<h2>Segment routing</h2>';
    html += kv([
      ['SRGB', srgb ? `${srgb.lower}-${srgb.upper}` : null],
      ['node SID', sid ? `${sid.prefix} ${sid.value_type} ${sid.sid}${srgb && sid.value_type === 'index' ? ` (label ${Number(srgb.lower) + Number(sid.sid)})` : ''}` : null],
    ]);
  }
  if (bgp) {
    html += '<h2>BGP</h2>';
    html += kv([
      ['AS', bgp.as],
      ['router id', bgp.router_id],
      ['route reflector', bgp.route_reflector ? `yes${bgp.cluster_id ? `, cluster ${bgp.cluster_id}` : ''}` : 'no'],
    ]);
    const owner = Object.fromEntries(imp.topology.nodes.map((x) => [x.loopback, x.id]));
    html += table(
      ['neighbour', 'device', 'AS', 'RR client', 'families', 'session'],
      (f.peers ?? []).filter((p) => p.kind === 'bgp').map((p) => {
        const peer = owner[p.ip];
        const s = peer && net.bgp.sessions.find((x) => [x.a, x.b].includes(id) && [x.a, x.b].includes(peer));
        return [p.ip, peer ? { html: deviceLink(peer) } : null, p.remote_as, p.route_reflector_client ? 'yes' : 'no', (p.address_families ?? []).join(', '), s ? `${s.state}${s.reason ? ` (${s.reason})` : ''}` : null];
      }),
    );
  }
  const own = imp.services.filter((s) => s.ends.some((e) => e.node === id));
  if (own.length) {
    html += '<h2>Services</h2>';
    html += table(['service', 'AC', 'peer'], own.map((s) => {
      const e = s.ends.find((x) => x.node === id);
      const peer = s.ends.find((x) => x !== e);
      return [{ html: serviceLink(s) }, `${dash(e.fp)} (port ${dash(e.port)})`, { html: deviceLink(peer.node) }];
    }));
  }
  el.innerHTML = `${html}<div class="engine-node"></div>`;
  if (n) renderNode(el.querySelector('.engine-node'), net, id);
}

// actions: { walkPw(pwId, from), walkCcm(megId) } to run the walks from the panel's buttons.
export function renderService(el, imp, net, id, actions) {
  const s = imp.services.find((x) => x.id === id);
  if (!s) {
    el.innerHTML = `<p class="sub">No service ${esc(id)}.</p>`;
    return;
  }
  const pw = net.vpws.pseudowires.find((p) => p.id === s.pseudowire);
  const meg = s.meg && net.cfm.megs.find((m) => m.id === s.meg);
  let html = `<h2 class="title">${esc(s.name)} <span class="sub">${esc(s.type.toUpperCase())} · PW ${esc(pw.pwid)} · ${esc(pw.state)}</span></h2>`;
  if (pw.reasons.length) html += `<ul class="gaps">${pw.reasons.map((x) => `<li class="warn">${esc(x)}</li>`).join('')}</ul>`;
  html += '<h2>Pseudowire ends</h2>';
  html += table(
    ['end', 'AC', 'PW label in / out', 'transport', 'path'],
    pw.ends.map((e) => [{ html: deviceLink(e.node) }, `${dash(e.ac.name)} (port ${dash(e.ac.port)})`, `${e.localLabel} / ${e.remoteLabel}`, transportText(e), e.transport.path ? e.transport.path.join(' > ') : `${e.node} > … > ${e.peer} (IGP shortest path)`]),
  );
  html += pw.static
    ? '<p class="sub">Static pseudowire: the PW labels are configured at each end (no targeted LDP).</p>'
    : `<p class="sub">Targeted LDP between the loopbacks: ${esc(pw.tldp)}. PW labels are allocated by the view (the facts carry none for LDP-signalled PWs).</p>`;
  if (meg) {
    html += '<h2>CFM</h2>';
    html += kv([
      ['MD / MA', `${dash(imp.topology.cfm.megs.find((m) => m.id === meg.id)?.md)} / ${meg.id}`],
      ['level', meg.level],
      ['CCM interval', meg.intervalMs >= 1000 ? `${meg.intervalMs / 1000} s` : `${meg.intervalMs} ms`],
    ]);
    html += table(['MEP', 'device', 'flow point', 'direction', 'state'], meg.meps.map((m) => [m.mepId, { html: deviceLink(m.node) }, m.if, m.direction, m.defect ?? 'ok']));
  }
  html += '<div class="row">';
  for (const e of pw.ends) html += `<button type="button" data-walk-from="${esc(e.node)}">Walk a frame from ${esc(e.node)}</button>`;
  if (meg) html += '<button type="button" data-walk-ccm>CCM stream</button>';
  html += '</div>';
  el.innerHTML = html;
  for (const b of el.querySelectorAll('[data-walk-from]')) b.addEventListener('click', () => actions.walkPw(pw.id, b.dataset.walkFrom));
  el.querySelector('[data-walk-ccm]')?.addEventListener('click', () => actions.walkCcm(meg.id));
}
