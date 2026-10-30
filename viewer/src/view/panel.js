// SPDX-License-Identifier: Apache-2.0
// DOM rendering for the detail panel: step list, step detail with the header
// stack, and per-node tables.

import { hex, layerColor } from './layers.js';
import { describeLacpState } from '../engine/lag.js';

const HEADER_COLORS = {
  'Ethernet II': '#8b98a8',
  'IEEE 802.3': '#8b98a8',
  LLC: '#6e7681',
  MPLS: '#d29922',
  IPv4: '#4aa8ff',
  UDP: '#58a6ff',
  TCP: '#58a6ff',
  'IS-IS': '#3fb950',
  OSPF: '#3fb950',
  'Router-LSA': '#3fb950',
  'Router-LSA links': '#3fb950',
  'G-ACh BFD CC': '#d29922',
  'BGP UPDATE': '#a371f7',
  'CFM CCM': '#39c5cf',
  'R-APS': '#e3b341',
  'Ethernet II (customer)': '#f778ba',
  Payload: '#f778ba',
};

const SOURCE_COLORS = { facts: '#3fb950', authored: '#58a6ff', derived: '#8b98a8', default: '#d29922' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function renderStepList(el, walk, onPick) {
  el.innerHTML = '';
  walk?.steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = s.status;
    const layer = s.layer ?? walk.layer;
    li.innerHTML = `<span class="n">${i + 1}</span><span class="layer-tag" style="background:${hex(layerColor(layer))}">${esc(layer)}</span><span class="t">${esc(s.title)}</span>`;
    li.addEventListener('click', () => onPick(i));
    el.appendChild(li);
  });
}

export function markStep(el, i) {
  [...el.children].forEach((li, k) => li.classList.toggle('active', k === i));
  el.children[i]?.scrollIntoView({ block: 'nearest' });
}

function headerHtml(h) {
  const rows = Object.entries(h.fields)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('');
  const color = HEADER_COLORS[h.name] ?? (h.name.startsWith('TLV') ? '#3fb950' : '#8b98a8');
  return `<div class="hdr" style="border-color:${color}"><div class="name">${esc(h.name)}</div><table>${rows}</table></div>`;
}

export function renderStep(el, step) {
  if (!step) {
    el.innerHTML = '';
    return;
  }
  const mv = step.moves.length === 1 ? step.moves[0] : null;
  el.innerHTML = `
    <div class="kv">at <b>${esc(step.node)}</b>${mv ? ` &rarr; ${esc(mv.to)} on ${esc(mv.link)}${mv.member && mv.member !== mv.link ? ` (member ${esc(mv.member)})` : ''}` : ''}</div>
    ${step.lookup ? `<div class="lookup"><b>${esc(step.lookup.table)}</b> &middot; key ${esc(step.lookup.key)}<br/>${esc(step.lookup.result)}</div>` : ''}
    <ul class="actions">${step.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    ${step.headers.length ? `<h2>Header stack (outermost first)</h2><div class="stack">${step.headers.map(headerHtml).join('')}</div>` : ''}
  `;
}

function table(headers, rows) {
  if (!rows.length) return '<p class="sub">none</p>';
  return `<table class="tbl"><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('')}</table>`;
}

export function renderNode(el, net, id) {
  const n = net.topo.nodes.find((x) => x.id === id);
  if (!n) {
    el.innerHTML = '';
    return;
  }
  let html = `<h2 style="color:var(--text);font-size:14px;text-transform:none">${esc(n.id)} <span class="sub">${n.role.toUpperCase()} ${esc(n.loopback ?? n.lan ?? '')}${n.model ? ` · ${esc(n.model)}` : ''}</span></h2>`;
  const ifs = net.topo.links.filter((l) => l.a.node === id || l.b.node === id).map((l) => {
    const e = l.a.node === id ? l.a : l.b;
    const far = l.a.node === id ? l.b : l.a;
    return [e.if, e.port ?? '-', e.ip ?? '-', `${far.node}${far.port ? `:${far.port}` : ''}`];
  });
  html += '<h2>Interfaces</h2>';
  html += table(['if', 'port', 'address', 'to'], ifs);
  if (net.ospf.lsas[id]) {
    html += '<h2>OSPF neighbours</h2>';
    html += table(
      ['neighbour', 'link', 'area', 'cost', 'state'],
      net.ospf.adjacencies.filter((a) => a.a === id || a.b === id).map((a) => [a.a === id ? a.b : a.a, a.link, a.area, a.cost[a.a === id ? 'a' : 'b'], a.nbrState]),
    );
  }
  if (net.igp.rib[id]) {
    const ospf = net.igpName === 'ospf';
    html += `<h2>${ospf ? 'OSPF' : 'IS-IS'} routes</h2>`;
    html += table(
      ospf ? ['prefix', 'metric', 'type', 'next hop'] : ['prefix', 'metric', 'next hop'],
      Object.values(net.igp.rib[id]).map((r) => [r.prefix, r.metric, ...(ospf ? [`${r.type} ${r.area}`] : []), r.local ? 'local' : r.nextHops.map((h) => `${h.node} (${h.link})`).join(', ')]),
    );
  }
  if (net.igp.rib[id] && net.mpls.mode !== 'none') {
    html += `<h2>LFIB (${net.mpls.mode.toUpperCase()})</h2>`;
    html += table(
      ['in', 'FEC', 'op', 'out', 'next hop'],
      Object.values(net.mpls.lfib[id] ?? {}).flatMap((e) => e.nextHops.map((nh) => [e.inLabel, e.fec, nh.op, nh.outLabel ?? '-', nh.node])),
    );
  }
  const tp = Object.values(net.tp.lfib[id] ?? {});
  const heads = Object.entries(net.tp.head[id] ?? {});
  if (tp.length || heads.length) {
    html += '<h2>MPLS-TP static LSPs</h2>';
    html += table(
      ['tunnel', 'dir', 'in', 'op', 'out', 'next hop'],
      [
        ...heads.map(([t, h]) => [t, h.dir, '(ingress)', 'push', h.outLabel, h.next]),
        ...tp.map((e) => [e.tunnel, e.dir, e.inLabel, e.op, e.outLabel ?? '-', e.next ?? '(end point)']),
      ],
    );
    const own = net.tp.tunnels.filter((t) => t.src === id || t.dst === id);
    if (own.length) html += table(['tunnel', 'role', 'LSP_ID (RFC 6370)', 'here', 'OAM'], own.map((t) => [t.id, t.role, t.ids.lspId, t.endState[id], t.oam ? `${t.oam.kind} ${t.detectionMs} ms` : 'none']));
  }
  for (const [vrf, t] of Object.entries(net.bgp.vrfs[id] ?? {})) {
    html += `<h2>VRF ${esc(vrf)}</h2>`;
    html += table(
      ['prefix', 'type', 'via', 'VPN label'],
      Object.values(t).map((r) => [
        r.prefix,
        r.type === 'static' ? `static pref ${r.preference}` : r.type,
        r.type === 'bgp' ? `${r.nextHop} (IGP ${r.igpCost})` : r.type === 'local' ? r.if : `${r.via.ip ?? ''} ${r.via.node ?? '-'}${r.alternatives?.length > 1 ? ` [${r.alternatives.filter((a) => a.state !== 'active').map((a) => `${a.nextHop} pref ${a.preference} ${a.state}`).join(', ')}]` : ''}`.trim(),
        r.vpnLabel,
      ]),
    );
  }
  const policies = net.sr.policies.filter((p) => p.headend === id);
  if (policies.length) {
    html += '<h2>SR policies (headend)</h2>';
    html += table(['name', 'color', 'endpoint', 'segment list', 'state'], policies.map((p) => [p.name, p.color, p.endpoint, p.segmentList.sids.join(' '), p.valid ? p.path.join('>') : p.reason]));
  }
  const pws = net.vpws.pseudowires.flatMap((pw) => pw.ends.filter((e) => e.node === id).map((e) => [pw.service, pw.pwid, e.peer, `${e.ac.name} (${e.ac.port})`, e.localLabel, e.remoteLabel, e.transport.tunnel ?? e.transport.policy ?? e.underlay, pw.state]));
  if (pws.length) {
    html += '<h2>Pseudowires</h2>';
    html += table(['service', 'pwid', 'peer', 'AC', 'in', 'out', 'via', 'state'], pws);
  }
  const lags = net.topo.links.filter((l) => l.lag && (l.a.node === id || l.b.node === id));
  for (const l of lags) {
    const st = net.links[l.id];
    html += `<h2>LACP ${esc(l.id)}</h2>`;
    html += table(
      ['member', 'actor state', 'flags'],
      st.members.map((m) => [m.id, `0x${m.actorState.toString(16).padStart(2, '0')}`, describeLacpState(m.actorState).join(' ')]),
    );
  }
  const meps = net.cfm.megs.flatMap((g) => g.meps.filter((m) => m.node === id).map((m) => [g.id, m.mepId, m.direction, m.if, m.defect ?? 'ok']));
  if (meps.length) {
    html += '<h2>CFM MEPs</h2>';
    html += table(['MEG', 'MEP', 'dir', 'if', 'state'], meps);
  }
  el.innerHTML = html;
}

// The import report: per layer, where each item came from (read from the
// facts, derived from them, or a default), and the import warnings.
export function renderImportReport(el, report) {
  if (!report) {
    el.innerHTML = '';
    return;
  }
  const { topology, gaps, warnings } = report;
  const chip = (src) => `<span class="layer-tag" style="background:${SOURCE_COLORS[src]}">${esc(src)}</span>`;
  let html = `<h2 style="color:var(--text);font-size:14px;text-transform:none">${esc(topology.name)}</h2>`;
  html += `<p class="sub">Where each layer's data came from: ${Object.keys(SOURCE_COLORS).map(chip).join(' ')}. Authored, derived and default items are not in the configurations.</p>`;
  for (const [layer, items] of Object.entries(gaps)) {
    html += `<h2><span class="layer-tag" style="background:${hex(layerColor(layer))}">${esc(layer)}</span></h2>`;
    html += '<ul class="gaps">';
    for (const i of items) html += `<li>${chip(i.source)} <b>${esc(i.item)}</b>: ${esc(i.detail)}</li>`;
    html += '</ul>';
  }
  if (warnings.length) html += `<h2>Import warnings</h2><ul class="gaps">${warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;
  el.innerHTML = html;
}
