// SPDX-License-Identifier: Apache-2.0
// The facts panels: the overview (devices, services, SR policies, MPLS-TP tunnels, BGP, G.8032
// rings, SRv6 locators, Flex-Algos, EVPN instances, VRFs, hosts), one device or host (its facts record, then the engine's
// tables for it) and one service (its pseudowire ends, transports and MEG; an EVPN instance's members, SIDs and paths;
// or a VRF's sites, transports and route exchange). Links between them are hash
// routes (#device=PE1, #service=...), handled by main.js.

import { isisArea } from '../../js/src/index.ts';
import { canonicalIp } from './import/facts.js';
import { hex, vrfColor } from './view/layers.js';
import { renderNode } from './view/panel.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v);

export const deviceHref = (id) => `#device=${encodeURIComponent(id)}`;
export const serviceHref = (id) => `#service=${encodeURIComponent(id)}`;
const deviceLink = (id) => `<a href="${deviceHref(id)}">${esc(id)}</a>`;
const serviceLink = (s) => `<a href="${serviceHref(s.id)}">${esc(s.name)}</a>`;
const vrfLink = (net, v) => `<a href="${serviceHref(`vrf:${v.name}`)}" style="color:${hex(vrfColor(net, v.name))}">${esc(v.name)}</a>`;
const transportCell = (t) => (t.kind === 'srv6' ? `SRv6 ${t.behavior} ${t.sid} (${t.locator})` : `MPLS label ${t.allocation}`);
const rtText = (site) => Object.entries(site.rts ?? {}).filter(([fam]) => !site.families || site.families.includes(fam))
  .map(([fam, r]) => `${fam.split(' ')[0]}: import ${r.import.join(' ') || '-'} / export ${r.export.join(' ') || '-'}`).join('; ');
const eviLink = (i) => `<a href="${serviceHref(i.id)}">EVI ${esc(i.evi)}</a>`;
// A node's role as shown: HOST for a Linux host, P / RR for a route reflector that is no PE.
export const roleText = (n) => (n.host ? 'host' : `${n.role.toUpperCase()}${n.rr ? ' / RR' : ''}`);
const algoText = (a) => (a ? `Flex-Algo ${a}` : '0 (SPF)');
const definitionText = (d) => {
  if (!d) return 'none advertised';
  const ag = d.adminGroups ?? {};
  const groups = [...(ag.excludeAny ?? []).map((g) => `exclude ${g}`), ...(ag.includeAny ?? []).map((g) => `include-any ${g}`), ...(ag.includeAll ?? []).map((g) => `include-all ${g}`)];
  return `${d.node}: ${d.metricType}${d.priority !== null ? `, priority ${d.priority}` : ''}${groups.length ? `, ${groups.join(', ')}` : ''}`;
};

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
  let html = `<h2 class="title">${esc(topo.name)}</h2>`;
  html += `<p class="sub">Facts schema ${esc(file.schema_version)} · ${esc(g.name)} ${esc(g.version)}${g.translator ? ` · ${esc(g.translator.replace(/\s*\(.*\)$/, ''))}` : ''}</p>`;
  // Linux hosts are not SAOS devices: they are listed under Hosts (with their kind), not here.
  const hostIds = new Set(topo.nodes.filter((n) => n.host).map((n) => n.id));
  html += '<h2>Devices</h2>';
  html += table(
    ['device', 'type', 'role', 'loopback', 'status', 'PWs', 'MEPs'],
    file.devices.filter((r) => !hostIds.has(r.device)).map((r) => {
      const n = topo.nodes.find((x) => x.id === r.device);
      return [n ? { html: deviceLink(r.device) } : r.device, r.type, n ? roleText(n) : '-', n ? (n.loopbacks ?? [n.loopback]).filter(Boolean).join(', ') : null, r.status, r.facts?.pseudowires?.length ?? 0, r.facts?.cfm?.meps?.length ?? 0];
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
  if (topo.rings?.length) {
    html += '<h2>G.8032 rings</h2>';
    html += table(
      ['ring', 'type', 'R-APS VID', 'nodes', 'RPL', 'protects', 'state'],
      topo.rings.map((r) => {
        const st = net.g8032.rings.find((x) => x.id === r.id);
        const sub = r.type === 'sub' ? `sub-ring${r.subRingOf ? ` of ${topo.rings.find((x) => x.id === r.subRingOf)?.name ?? r.subRingOf}` : ''}` : r.type === 'major' ? 'major ring' : null;
        return [
          `${r.name}${r.ringId !== null ? ` (${r.ringId})` : ''}`, sub, r.rapsVid,
          { html: r.path.nodes.map(deviceLink).join(' – ') + (r.path.closed ? ` – ${deviceLink(r.path.nodes[0])}` : '') },
          r.rpl ? `${r.rpl.link}: owner ${r.rpl.owner}${r.rpl.neighbor ? `, neighbour ${r.rpl.neighbor}` : ''}` : 'no owner',
          r.members.join(', '),
          `${st.state}${st.failed.length ? ` (${st.failed.join(', ')} down)` : ''}`,
        ];
      }),
    );
  }
  html += srv6Overview(net);
  html += l3vpnOverview(net);
  el.innerHTML = html;
}

// VRFs (L3VPN) and Linux hosts, when the network has any.
function l3vpnOverview(net) {
  let html = '';
  const vrfs = net.l3vpn?.vrfs ?? [];
  if (vrfs.length) {
    html += '<h2>VRFs (L3VPN)</h2>';
    html += table(['VRF', 'role', 'PEs', 'families', 'transport', 'hosts / CEs', 'state'], vrfs.map((v) => [
      { html: vrfLink(net, v) }, v.role ? `${v.role}${v.roleFrom === 'use' ? ' (by use)' : ''}` : null, { html: v.sites.map((x) => deviceLink(x.pe)).join(', ') },
      [...new Set(v.sites.flatMap((x) => x.families))].map((f) => f.split(' ')[0]).join(', '),
      [...new Set(v.sites.flatMap((x) => Object.values(x.transport).map((t) => (t.kind === 'srv6' ? 'SRv6' : `MPLS ${t.allocation}`))))].join(', ') || 'none (no VPN family)',
      { html: v.sites.flatMap((x) => x.attached.map((a) => deviceLink(a.node))).join(', ') || '-' },
      `${v.state}${v.reasons.length ? ` (${v.reasons.join('; ')})` : ''}`,
    ]));
  }
  const hosts = net.topo.nodes.filter((n) => n.host);
  if (hosts.length) {
    html += '<h2>Hosts</h2>';
    html += table(['host', 'kind', 'role', 'addresses', 'routes', 'cabled to'], hosts.map((n) => [
      { html: deviceLink(n.id) }, n.kind ?? 'linux', 'host', (n.addresses ?? []).join(', '), n.routes.map((r) => `${r.prefix} via ${r.nextHop}`).join(', '),
      { html: net.topo.links.filter((l) => l.a.node === n.id || l.b.node === n.id).map((l) => deviceLink(l.a.node === n.id ? l.b.node : l.a.node)).join(', ') || '-' },
    ]));
  }
  return html;
}

// A PE's VRFs: RD, route targets, interfaces, transport, and each VRF's table.
function vrfDevice(net, id) {
  const mine = (net.l3vpn?.vrfs ?? []).map((v) => ({ v, site: v.sites.find((x) => x.pe === id) })).filter((x) => x.site);
  if (!mine.length) return '';
  let html = '<h2>VRFs</h2>';
  html += table(['VRF', 'RD', 'route targets', 'interfaces', 'transport', 'static routes'], mine.map(({ v, site }) => [
    { html: vrfLink(net, v) }, site.rd, rtText(site), [...new Set(site.interfaces.map((i) => i.name))].join(', '),
    Object.entries(site.transport).map(([f, t]) => `${f.split(' ')[0]}: ${transportCell(t)}`).join('; '),
    site.statics.map((st) => `${st.prefix} ${st.discard ? 'Null0' : `via ${st.nextHop}`}${st.preference !== 1 ? ` pref ${st.preference}` : ''}`).join(', '),
  ]));
  for (const { v } of mine) {
    const rows = Object.values(net.bgp.vrfs[id]?.[v.name] ?? {});
    html += `<h2>VRF ${vrfLink(net, v)} table</h2>`;
    html += table(['prefix', 'type', 'next hop', 'label / SID', 'note'], rows.map((r) => [
      r.prefix, r.type === 'static' && r.discard ? 'static (Null0)' : r.type,
      r.type === 'bgp' ? `${r.nextHop} (${r.originator}, RD ${r.rd})` : r.via?.ip ?? r.via?.node ?? r.if ?? '-',
      r.type === 'bgp' ? (r.sid ? `${r.behavior} ${r.sid}` : `label ${r.vpnLabel}`) : r.sid ? `local ${r.sid}` : r.vpnLabel ? `local label ${r.vpnLabel}` : null,
      r.type === 'bgp' ? `best: ${r.reason}${r.candidates > 1 ? ` of ${r.candidates}` : ''}` : r.alternatives?.length > 1 ? r.alternatives.map((a) => `${a.nextHop} pref ${a.preference} ${a.state}`).join(', ') : null,
    ]));
  }
  return html;
}

// A Linux host (schema 1.8): its addresses, routes and cabling.
function hostSection(imp, net, id) {
  const h = (imp.file.hosts ?? []).find((x) => x.name === id);
  if (!h) return '';
  let html = '<h2>Linux host</h2>';
  html += kv([['from', h.sources.join(', ')], ['kind', h.kind], ['default gateway', [h.default_gateway?.ipv4, h.default_gateway?.ipv6].filter(Boolean).join(', ') || null]]);
  html += table(['interface', 'addresses', 'cabled to'], h.interfaces.map((i) => [i.name, i.addresses.join(', '), i.attached ? { html: `${deviceLink(i.attached.device)} port ${esc(i.attached.port)}` } : null]));
  html += table(['route', 'next hop', 'interface', 'metric'], h.routes.map((r) => [r.prefix, r.next_hop, r.interface, r.metric]));
  if (h.ignored_commands.length) html += `<p class="sub">exec lines not read: ${h.ignored_commands.map(esc).join('; ')}</p>`;
  const vrfs = (net.l3vpn?.vrfs ?? []).filter((v) => v.sites.some((x) => x.attached.some((a) => a.node === id)));
  if (vrfs.length) html += `<p class="sub">In VRF ${vrfs.map((v) => vrfLink(net, v)).join(', ')}.</p>`;
  return html;
}

// A VRF: its sites (RD, route targets, transport, hosts), the route exchange between them, and walks.
function renderVrfService(el, net, id, actions) {
  const v = (net.l3vpn?.vrfs ?? []).find((x) => `vrf:${x.name}` === id);
  if (!v) {
    el.innerHTML = `<p class="sub">No VRF ${esc(id)}.</p>`;
    return;
  }
  let html = `<h2 class="title">VRF ${vrfLink(net, v)} <span class="sub">L3VPN${v.role === 'management' ? ' · management' : ''} · ${esc(v.state)}</span></h2>`;
  if (v.description) html += `<p class="sub">${esc(v.description)}</p>`;
  if (v.reasons.length || v.notes.length) html += `<ul class="gaps">${v.reasons.map((x) => `<li class="warn">${esc(x)}</li>`).join('')}${v.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  html += '<h2>Sites</h2>';
  html += table(['PE', 'RD', 'families', 'route targets', 'transport', 'interfaces', 'hosts / CEs'], v.sites.map((x) => [
    { html: deviceLink(x.pe) }, x.rd, x.families.map((f) => f.split(' ')[0]).join(', '), rtText(x),
    Object.entries(x.transport).map(([f, t]) => `${f.split(' ')[0]}: ${transportCell(t)}`).join('; '),
    [...new Set(x.interfaces.map((i) => i.name))].join(', '), { html: x.attached.map((a) => deviceLink(a.node)).join(', ') || '-' },
  ]));
  html += '<h2>Route exchange</h2>';
  html += table(['from', 'to', 'family', 'state'], v.pairs.map((p) => [{ html: deviceLink(p.from) }, { html: deviceLink(p.to) }, p.family, p.ok ? 'imported and installed' : p.reasons.join('; ')]));
  const hosts = v.sites.flatMap((x) => x.attached.filter((a) => a.host).map((a) => ({ ...a, pe: x.pe })));
  const targets = (n) => net.topo.nodes.find((x) => x.id === n)?.addresses ?? [];
  html += '<div class="row">';
  for (const a of hosts) for (const b of hosts) if (a.node !== b.node && a.pe !== b.pe) for (const ip of targets(b.node).slice(0, 2)) html += `<button type="button" data-walk-host="${esc(a.node)}" data-dst="${esc(ip)}">Packet ${esc(a.node)} → ${esc(ip)}</button>`;
  for (const x of v.sites) {
    const r = net.bgp.originated[x.pe]?.find((o) => o.vrf === v.name && o.type !== 'local') ?? net.bgp.originated[x.pe]?.find((o) => o.vrf === v.name);
    if (r) html += `<button type="button" data-walk-update="${esc(`${x.pe}|${v.name}|${r.prefix}`)}">UPDATE ${esc(r.prefix)} from ${esc(x.pe)}</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
  for (const b of el.querySelectorAll('[data-walk-host]')) b.addEventListener('click', () => actions.walkHost(b.dataset.walkHost, b.dataset.dst));
  for (const b of el.querySelectorAll('[data-walk-update]')) b.addEventListener('click', () => actions.walkUpdate(b.dataset.walkUpdate));
}

// SRv6 locators, Flex-Algos and EVPN instances, when the network has any.
function srv6Overview(net) {
  let html = '';
  const { locators, algorithms } = net.srv6;
  if (locators.length) {
    html += '<h2>SRv6 locators</h2>';
    html += table(['device', 'locator', 'prefix', 'algorithm', 'SID type', 'reached from'], locators.map((l) => {
      const from = net.igp.routers.filter((r) => r !== l.node && !net.srv6.rib[r]?.[l.prefix]?.unreachable);
      return [{ html: deviceLink(l.node) }, l.name, l.prefix, algoText(l.algorithm), l.sidType, `${from.length} of ${net.igp.routers.length - 1} routers`];
    }));
  }
  if (algorithms.length > 1) {
    html += '<h2>Flex-Algo</h2>';
    html += table(['algorithm', 'definition in use', 'routers', 'links', 'notes'], algorithms.slice(1).map((a) => [a.algorithm, definitionText(a.definition), { html: a.participants.map(deviceLink).join(', ') || '-' }, a.links.length, a.notes.join('; ')]));
  }
  if (net.evpn.instances.length) {
    html += '<h2>EVPN instances</h2>';
    html += table(['EVI', 'type', 'members', 'service ids', 'SRv6 locator', 'state'], net.evpn.instances.map((i) => [
      { html: eviLink(i) }, (i.type ?? '?').toUpperCase(), { html: i.members.map((m) => deviceLink(m.node)).join(' – ') },
      i.type === 'vpws' ? i.members.map((m) => `${m.localServiceId ?? '-'}→${m.remoteServiceId ?? '-'}`).join(', ') : null,
      [...new Set(i.members.map((m) => m.srv6Locator).filter(Boolean))].join(', '), `${i.state}${i.reasons.length ? ` (${i.reasons.join('; ')})` : ''}`,
    ]));
  }
  return html;
}

// A device's SRv6 locators, the Flex-Algos it takes part in and its EVPN instances.
function srv6Device(net, id) {
  let html = '';
  const mine = net.srv6.locators.filter((l) => l.node === id);
  if (mine.length) {
    html += '<h2>SRv6 locators</h2>';
    html += table(['locator', 'prefix', 'algorithm', 'SID type', 'block / node / function bits', 'IS-IS instances'], mine.map((l) => [l.name, l.prefix, algoText(l.algorithm), l.sidType, `${dash(l.blockLength)} / ${dash(l.nodeLength)} / ${dash(l.functionLength)}`, l.instances.join(', ') || 'every instance']));
  }
  const algos = net.srv6.algorithms.slice(1).filter((a) => a.participants.includes(id) || (net.topo.flexAlgos ?? []).find((f) => f.algorithm === a.algorithm)?.definitions.some((d) => d.node === id));
  if (algos.length) {
    html += '<h2>Flex-Algo</h2>';
    html += table(['algorithm', 'takes part', 'definition in use', 'own definition advertised'], algos.map((a) => {
      const own = net.topo.flexAlgos.find((f) => f.algorithm === a.algorithm)?.definitions.find((d) => d.node === id);
      return [a.algorithm, a.participants.includes(id) ? 'yes' : 'no', definitionText(a.definition), own ? (own.advertise ? 'yes' : 'no') : '-'];
    }));
  }
  const routes = Object.values(net.srv6.rib[id] ?? {}).filter((r) => !r.local);
  if (routes.length) {
    html += '<h2>Routes to SRv6 locators</h2>';
    html += table(['prefix', 'locator', 'algorithm', 'next hop', 'metric'], routes.map((r) => [r.prefix, `${r.owner} ${r.locator}`, algoText(r.algorithm), r.unreachable ? `unreachable: ${r.unreachable}` : r.nextHops.map((h) => `${h.node} (${h.link})`).join(', '), r.metric]));
  }
  const evis = net.evpn.instances.filter((i) => i.members.some((m) => m.node === id));
  if (evis.length) {
    html += '<h2>EVPN instances</h2>';
    html += table(['EVI', 'type', 'AC', 'RD', 'route targets', 'locator', 'SIDs (view)', 'state'], evis.map((i) => {
      const m = i.members.find((x) => x.node === id);
      return [{ html: eviLink(i) }, (i.type ?? '?').toUpperCase(), `${dash(m.ac.name)} (port ${dash(m.ac.port)})`, m.rd, m.routeTargets.map((t) => `${t.rt} ${t.type}`).join(', '), m.srv6Locator, Object.entries(m.sids).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(', '), i.state];
    }));
  }
  return html;
}

// An EVPN instance: its members, their SIDs and the paths between them, and walk buttons.
function renderEvpnService(el, net, id, actions) {
  const inst = net.evpn.instances.find((i) => i.id === id);
  if (!inst) {
    el.innerHTML = `<p class="sub">No EVPN instance ${esc(id)}.</p>`;
    return;
  }
  let html = `<h2 class="title">EVI ${esc(inst.evi)} <span class="sub">EVPN-${esc((inst.type ?? '?').toUpperCase())} over SRv6 · ${esc(inst.state)}</span></h2>`;
  if (inst.reasons.length) html += `<ul class="gaps">${inst.reasons.map((x) => `<li class="warn">${esc(x)}</li>`).join('')}</ul>`;
  html += '<h2>Members</h2>';
  html += table(['PE', 'AC', 'forwarding domain', 'RD', 'route targets', ...(inst.type === 'vpws' ? ['service id local / remote'] : []), 'locator', 'SIDs (allocated by the view)'], inst.members.map((m) => [
    { html: deviceLink(m.node) }, `${dash(m.ac.name)} (port ${dash(m.ac.port)})`, m.fd, m.rd, m.routeTargets.map((t) => `${t.rt} ${t.type}`).join(', '),
    ...(inst.type === 'vpws' ? [`${dash(m.localServiceId)} / ${dash(m.remoteServiceId)}`] : []),
    m.locator ? `${m.srv6Locator} ${m.locator.prefix}${m.locator.algorithm ? ` (Flex-Algo ${m.locator.algorithm})` : ''}` : m.srv6Locator, Object.entries(m.sids).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(', '),
  ]));
  html += '<h2>Between members</h2>';
  html += table(['from', 'to', 'EVPN routes', 'path to the far locator', 'state'], inst.pairs.map((p) => [
    { html: deviceLink(p.from) }, { html: deviceLink(p.to) }, p.bgp ? (p.bgp.via === 'direct' ? 'direct iBGP' : `via route reflector ${p.bgp.via}`) : 'no BGP path', p.path ? p.path.nodes.join(' > ') : '-', p.ok ? 'ok' : p.reasons.join('; '),
  ]));
  html += '<div class="row">';
  for (const m of inst.members) html += `<button type="button" data-walk-evpn="${esc(m.node)}">Walk a ${inst.type === 'vpls' ? 'broadcast ' : ''}frame from ${esc(m.node)}</button>`;
  html += '</div>';
  el.innerHTML = html;
  for (const b of el.querySelectorAll('[data-walk-evpn]')) b.addEventListener('click', () => actions.walkEvpn(inst.id, b.dataset.walkEvpn));
}

export function renderDevice(el, imp, net, id) {
  const host = imp.topology.nodes.find((x) => x.id === id && x.host);
  if (host) {
    // A Linux host: no device facts (its containerlab record is only a placeholder), its own panel.
    el.innerHTML = `<h2 class="title">${esc(id)} <span class="sub">HOST · ${esc(host.kind ?? 'linux')}</span></h2>${hostSection(imp, net, id)}<div class="engine-node"></div>`;
    renderNode(el.querySelector('.engine-node'), net, id);
    return;
  }
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
  let html = `<h2 class="title">${esc(id)} <span class="sub">${esc(n ? roleText(n) : 'not shown')}</span></h2>`;
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
    const owner = Object.fromEntries(imp.topology.nodes.flatMap((x) => [...new Set([x.loopback, ...(x.loopbacks ?? [])])].map((ip) => [ip, x.id])));
    html += table(
      ['neighbour', 'device', 'AS', 'RR client', 'families', 'session'],
      (f.peers ?? []).filter((p) => p.kind === 'bgp').map((p) => {
        const peer = owner[canonicalIp(p.ip)];
        const s = peer && net.bgp.sessions.find((x) => [x.a, x.b].includes(id) && [x.a, x.b].includes(peer));
        return [p.ip, peer ? { html: deviceLink(peer) } : null, p.remote_as, p.route_reflector_client ? 'yes' : 'no', (p.address_families ?? []).join(', '), s ? `${s.state}${s.reason ? ` (${s.reason})` : ''}` : null];
      }),
    );
  }
  const rings = (imp.topology.rings ?? []).filter((r) => r.nodes.some((n) => n.node === id));
  if (rings.length) {
    html += '<h2>G.8032 rings</h2>';
    html += table(['ring', 'type', 'ring ports', 'RPL role', 'R-APS VID / level', 'WTR / guard / hold-off', 'revertive'], rings.map((r) => {
      const me = r.nodes.find((n) => n.node === id);
      const st = net.g8032.rings.find((x) => x.id === r.id);
      const blocked = st.blocked.filter((b) => b.node === id).map((b) => b.link);
      return [
        r.name, r.type === 'sub' ? `sub-ring${me.terminates ? ' (terminates here)' : ''}` : r.type,
        me.ports.map((p) => `${p.name}: port ${dash(p.if)} -> ${p.link ?? 'no link'}${blocked.includes(p.link) ? ' [blocked]' : ''}`).join('; '),
        me.rpl ? `${me.rpl} (${me.rplPort})` : null,
        `${dash(r.rapsVid)} / ${dash(r.level)}`,
        `${r.wtrMin ?? 'default'} min / ${r.guardMs ?? 'default'} ms / ${r.holdOffMs ?? 'default'} ms`,
        r.revertive === null ? 'default (yes)' : r.revertive ? 'yes' : 'no',
      ];
    }));
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
  html += srv6Device(net, id);
  html += vrfDevice(net, id);
  el.innerHTML = `${html}<div class="engine-node"></div>`;
  if (n) renderNode(el.querySelector('.engine-node'), net, id);
}

// actions: { walkPw(pwId, from), walkCcm(megId), walkEvpn(id, from), walkHost(from, dst, vrf), walkUpdate(key) }
// to run the walks from the panel's buttons.
export function renderService(el, imp, net, id, actions) {
  if (String(id).startsWith('evi:')) return renderEvpnService(el, net, id, actions);
  if (String(id).startsWith('vrf:')) return renderVrfService(el, net, id, actions);
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
