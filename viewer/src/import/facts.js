// SPDX-License-Identifier: Apache-2.0
// Import a saos-network-facts facts file (schema 1.x) into the engine topology
// (engine/topology.js). Everything comes from the facts; what they do not say
// is derived (links from interface subnets, roles, positions) or defaulted
// (IS-IS metrics, CFM level and interval), and each such choice is listed in
// the report so the view never passes a guess off as configuration.
//
//   IGP          IS-IS, or OSPF when more devices run OSPF than IS-IS (the engine runs one)
//   nodes        every device with facts; a router when it runs the IGP or an MPLS-TP tunnel, else a CE
//   links        two routed interfaces on different devices in one IPv4 subnet (management interfaces
//                never link: they share the management network); with more interfaces in the subnet,
//                the two that run the IGP; core when both run the IGP; a LAG when both interfaces ride
//                a LAG (lags / ports[].lag), members paired by port in natural order at both ends
//   IS-IS        per link each end's interface metric at the level the view runs (wide, else narrow, else 10)
//   OSPF         per link the area and cost of each end's interface, BFD when both ends enable it
//   SRGB, SIDs   segment_routing.srgb / prefix_sids (node SID of the loopback)
//   SR policies  segment_routing.policies, the preferred candidate path's first segment list
//   MPLS-TP      tp_corouted_tunnels: each node's segment, stitched from the ingress along next hops
//   BGP          peers of kind bgp, matched to the device owning the address
//   pseudowires  the two ends that name each other (peer address + PW id); static on an MPLS-TP tunnel
//   CFM          MEPs of one MD / MA on two devices, over that service's pseudowire, at the MA's CCM interval
//   L2 links     top-level links[] (schema 1.5, from the extractor's --clab topology) between two ports no
//                addressed link already joins: drawn as plain links with no subnet (no IGP, no routes)
//   G.8032       rings[] (schema 1.5) joined across devices by ring id: the links whose two ends are ring ports
//                of the ring, the RPL from the owner's and neighbour's port, a sub-ring's interconnection nodes

import { ccmIntervalMs, devicesByName, interfacesOnPort, isisArea, isisMetric, isRouted, loopbacks, parseFacts, ringsOf } from '../../../js/src/index.ts';
import { CCM_INTERVALS_MS } from '../engine/cfm.js';
import { intToIp, parsePrefix } from '../engine/ip.js';
import { BACKBONE, normArea } from '../engine/ospf.js';
import { rfcVendor } from '../engine/vendor.js';
import { layoutNodes, scalePositions } from './layout.js';

const DEFAULT_METRIC = 10;

// An IPv4 `ip/len` as { ip, len, subnet }, or null for anything else.
export function ipv4Subnet(cidr) {
  const m = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(cidr ?? '');
  if (!m) return null;
  const len = Number(m[2]);
  if (len > 32) return null;
  return { ip: m[1], len, subnet: `${intToIp(parsePrefix(`${m[1]}/${len}`).net)}/${len}` };
}

// The port an interface rides on: the port whose flow points (SAOS 10) or VLANs (SAOS 6) reach it;
// the LAG when that port is a member of one (a member reaches the LAG's interfaces).
function portOf(facts, ifname) {
  for (const port of Object.keys(facts.ports ?? {})) {
    if (interfacesOnPort(facts, port).some((i) => i.name === ifname)) return facts.ports[port].lag ?? port;
  }
  return null;
}

// The LAG a port is (a LAG name) or is a member of (ports[].lag), as { name, members }, or null.
function lagOf(facts, port) {
  if (!port) return null;
  const lags = facts.lags ?? [];
  return lags.find((l) => l.name === port) ?? lags.find((l) => l.name === facts.ports?.[port]?.lag) ?? null;
}

// Natural order of port names: digit runs compare as numbers, so 1/2 < 1/10 and 29/30 < 29/100.
export function naturalCompare(x, y) {
  const parts = (v) => String(v).split(/(\d+)/);
  const px = parts(x);
  const py = parts(y);
  for (let i = 0; i < Math.max(px.length, py.length); i++) {
    const [a, b] = [px[i] ?? '', py[i] ?? ''];
    if (a === b) continue;
    const numeric = /^\d+$/.test(a) && /^\d+$/.test(b);
    return numeric ? Number(a) - Number(b) : a < b ? -1 : 1;
  }
  return 0;
}

// The members of a link: one per member pair when both ends ride a LAG (802.1AX: the IP
// interface sits on the aggregator, its members carry the frames), else the link itself.
// The facts do not say which member faces which: members are paired by port in natural order at
// both ends (labs cable like for like, 29/30 to 29/30), not in the order they were configured.
function linkMembers(id, a, b, report) {
  const plain = { lag: false, members: [{ id, a: a.if, b: b.if }] };
  if (!a.lag && !b.lag) return plain;
  if (!a.lag || !b.lag) {
    report.warn(`${id}: ${a.lag ? a.node : b.node} rides LAG ${(a.lag ?? b.lag).name}, ${a.lag ? b.node : a.node} no LAG; drawn as a plain link`);
    return plain;
  }
  const n = Math.min(a.lag.members.length, b.lag.members.length);
  if (!n) {
    report.warn(`${id}: LAG ${!a.lag.members.length ? `${a.node} ${a.lag.name}` : `${b.node} ${b.lag.name}`} has no members; drawn as a plain link`);
    return plain;
  }
  if (a.lag.members.length !== b.lag.members.length) report.warn(`${id}: ${a.node} ${a.lag.name} has ${a.lag.members.length} members, ${b.node} ${b.lag.name} ${b.lag.members.length}; ${n} are drawn`);
  const [ma, mb] = [a, b].map((e) => [...e.lag.members].sort(naturalCompare));
  const members = [];
  for (let i = 0; i < n; i++) members.push({ id: `${id}/${i + 1}`, a: ma[i], b: mb[i] });
  return { lag: true, members };
}

// IS-IS level as written (`level-1`, `L2`, `level-1-2`, `L1L2`) -> 1 or 2; level 1-2 runs as 2 here.
function levelNumber(level) {
  const s = String(level ?? '');
  if (/1-?L?2$/i.test(s)) return 2;
  const m = /([12])$/.exec(s);
  return m ? Number(m[1]) : null;
}

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

class Report {
  constructor() {
    this.items = []; // { layer, source: 'facts' | 'derived' | 'default', item, detail }
    this.warnings = [];
  }
  add(layer, source, item, detail) {
    this.items.push({ layer, source, item, detail });
  }
  warn(text) {
    this.warnings.push(text);
  }
  // Grouped by layer, the shape view/panel.js renderImportReport expects.
  get gaps() {
    const out = {};
    for (const i of this.items) (out[i.layer] ??= []).push(i);
    return out;
  }
}

// OSPF of a device: the instances of the default VRF and the interfaces they run on, by name.
export function ospfOf(f) {
  const instances = (f.ospf?.instances ?? []).filter((i) => !i.vrf || i.vrf === 'default');
  const names = new Set(instances.map((i) => i.name));
  return { instances, interfaces: new Map((f.ospf?.interfaces ?? []).filter((x) => names.has(x.instance)).map((x) => [x.interface, x])) };
}

// The IGP the engine runs: IS-IS, unless more devices run OSPF than IS-IS.
function chooseIgp(devices, report) {
  const count = (has) => [...devices.values()].filter(has).length;
  const isis = count((f) => f.isis?.instances?.length);
  const ospf = count((f) => ospfOf(f).instances.length);
  const igp = ospf > isis ? 'ospf' : 'isis';
  if (isis && ospf) report.warn(`IS-IS on ${isis} and OSPF on ${ospf} devices: the view runs one IGP, ${igp === 'ospf' ? 'OSPF' : 'IS-IS'}`);
  return igp;
}

// Whether an interface of a device runs the IGP (a passive OSPF interface forms no adjacency).
function inIgp(igp, f, iface) {
  if (igp === 'isis') return Boolean(iface.isis);
  const o = ospfOf(f).interfaces.get(iface.name);
  return Boolean(o) && !o.passive;
}

function buildNodes(devices, igp, report) {
  const nodes = [];
  for (const [name, f] of devices) {
    const ospf = ospfOf(f);
    const los = loopbacks(f);
    const lo = (igp === 'ospf' ? los.find((l) => ospf.interfaces.has(l.name)) : los.find((l) => l.isis)) ?? los[0] ?? null;
    const loIp = lo ? ipv4Subnet(lo.ip)?.ip ?? null : null;
    const isis = f.isis?.instances?.[0] ?? null;
    const runsIgp = igp === 'ospf' ? ospf.instances.length > 0 : Boolean(isis);
    const router = (runsIgp || (f.tp_corouted_tunnels ?? []).length > 0) && Boolean(loIp);
    const node = { id: name, role: router ? 'p' : 'ce', pos: { x: 0, z: 0 } };
    if (loIp) node.loopback = loIp;
    if (isis?.system_id) node.systemId = isis.system_id;
    if (igp === 'ospf' && router) {
      const rid = ospf.instances[0]?.router_id;
      if (rid) node.routerId = rid;
      const area = normArea(ospf.interfaces.get(lo.name)?.area);
      if (area) node.loopbackArea = area;
    }
    if (router) {
      const sid = (f.segment_routing?.prefix_sids ?? []).find((s) => s.prefix === `${loIp}/32`);
      if (sid?.value_type === 'index') node.sidIndex = Number(sid.sid);
      if (igp === 'isis' && isis && !isis.system_id) report.warn(`${name}: IS-IS instance ${isis.name} has no NET; its LSP ID is made up`);
    } else if (runsIgp) {
      report.warn(`${name}: runs ${igp === 'ospf' ? 'OSPF' : 'IS-IS'} but has no loopback address; shown as a host`);
    }
    nodes.push(node);
  }
  return nodes;
}

// OSPF on a core link: each end's area and cost (RFC 2328 §C.3, per interface), BFD when both ends enable it.
function ospfLink(link, devices, report, defaults) {
  const cfg = [link.a, link.b].map((e) => ospfOf(devices.get(e.node)).interfaces.get(e.if) ?? null);
  const areas = cfg.map((c) => normArea(c?.area));
  if (areas[0] && areas[1] && areas[0] !== areas[1]) report.warn(`${link.id}: OSPF areas ${areas[0]} and ${areas[1]} on its two ends; no adjacency forms on a real network, the view uses ${areas[0]}`);
  link.area = areas[0] ?? areas[1] ?? BACKBONE;
  if (!areas[0] && !areas[1]) defaults.area++;
  const costs = cfg.map((c) => num(c?.metric));
  if (costs.some((c) => c === null)) defaults.metric++;
  const [ca, cb] = costs.map((c) => c ?? rfcVendor.ospf.defaultCost);
  link.metric = ca;
  if (ca !== cb) link.cost = { a: ca, b: cb };
  if (cfg.every((c) => c?.bfd)) link.bfd = true;
}

// IS-IS on a core link: each end's interface metric at `level` (RFC 5305 wide, else narrow), the
// default where the configuration sets none; per end when they differ, like OSPF costs.
function isisLink(link, devices, level, defaults) {
  const metrics = [link.a, link.b].map((e) => isisMetric(devices.get(e.node), e.if, level));
  if (metrics.some((m) => m === null)) defaults.metric++;
  const [ma, mb] = metrics.map((m) => m ?? DEFAULT_METRIC);
  link.metric = ma;
  if (ma !== mb) link.cost = { a: ma, b: mb };
}

function buildLinks(devices, nodes, igp, isisLevel, report) {
  const bySubnet = new Map();
  for (const [name, f] of devices) {
    for (const i of f.interfaces ?? []) {
      if (!isRouted(i)) continue;
      for (const cidr of i.ipv4?.length ? i.ipv4 : [i.ip]) {
        const s = ipv4Subnet(cidr);
        if (!s || s.len >= 32) continue;
        if (!bySubnet.has(s.subnet)) bySubnet.set(s.subnet, []);
        const port = portOf(f, i.name);
        bySubnet.get(s.subnet).push({ node: name, if: i.name, ip: s.ip, port, lag: lagOf(f, port), igp: inIgp(igp, f, i) });
      }
    }
  }
  const role = Object.fromEntries(nodes.map((n) => [n.id, n.role]));
  const links = [];
  const ids = new Set();
  // The two ends of a point-to-point link in a subnet: its two interfaces when they are on
  // different devices; with more interfaces (a leftover duplicate on one device), the two on
  // different devices that run the IGP, when they are exactly two; else none.
  const linkEnds = (ends) => {
    const two = (list) => (list.length === 2 && list[0].node !== list[1].node ? list : null);
    return two(ends) ?? (ends.length > 2 ? two(ends.filter((e) => e.igp)) : null);
  };
  const igpName = igp === 'ospf' ? 'OSPF' : 'IS-IS';
  for (const [subnet, ends] of bySubnet) {
    const pair = linkEnds(ends);
    if (!pair) {
      if (ends.length > 2) report.warn(`${subnet}: ${ends.length} interfaces (${ends.map((e) => `${e.node} ${e.if}`).join(', ')}) and no two of different devices run ${igpName}; only point-to-point links are drawn`);
      continue;
    }
    const [a, b] = pair;
    if (ends.length > 2) {
      const rest = ends.filter((e) => e !== a && e !== b);
      report.warn(`${subnet}: ${ends.length} interfaces; drawn between the two that run ${igpName} (${a.node} ${a.if}, ${b.node} ${b.if}), ignoring ${rest.map((e) => `${e.node} ${e.if}`).join(', ')}`);
    }
    const core = role[a.node] !== 'ce' && role[b.node] !== 'ce' && a.igp && b.igp;
    let id = `${a.node}-${b.node}`;
    if (ids.has(id)) id = `${id} ${subnet}`;
    ids.add(id);
    const end = (e) => ({ node: e.node, if: e.if, ip: e.ip, ...(e.port ? { port: e.port } : {}) });
    const { lag, members } = linkMembers(id, a, b, report);
    links.push({ id, kind: core ? 'core' : 'access', ...(core ? { metric: DEFAULT_METRIC } : {}), subnet, lag, a: end(a), b: end(b), members });
  }
  const lags = links.filter((l) => l.lag);
  if (lags.length) {
    report.add('physical', 'facts', `${lags.length} LAG links`, `links whose interfaces ride a LAG at both ends: ${lags.map((l) => `${l.id} (${l.members.length} members)`).join(', ')}`);
    report.add('physical', 'derived', 'LAG member pairing', 'the facts do not say which member faces which: members are paired by port in natural order at both ends (29/30 with 29/30)');
  }
  const core = links.filter((l) => l.kind === 'core');
  const name = igp === 'ospf' ? 'OSPF' : 'IS-IS';
  report.add('physical', 'derived', `${links.length} links`, `from interface subnets (two routed interfaces of different devices in one IPv4 subnet; management interfaces and loopbacks never link); ${core.length} core (${name} at both ends), ${links.length - core.length} access`);
  if (igp === 'isis' && core.length) {
    const defaults = { metric: 0 };
    for (const l of core) isisLink(l, devices, isisLevel, defaults);
    report.add('isis', defaults.metric ? 'default' : 'facts', 'link metrics', defaults.metric
      ? `${defaults.metric} of ${core.length} core links have an end without a level-${isisLevel} metric in the facts: metric ${DEFAULT_METRIC} there`
      : `per interface level-${isisLevel} metric (wide, else narrow)`);
  }
  if (igp === 'ospf') {
    const defaults = { area: 0, metric: 0 };
    for (const l of core) ospfLink(l, devices, report, defaults);
    const areas = [...new Set(core.map((l) => l.area))].sort();
    report.add('ospf', defaults.area ? 'default' : 'facts', 'areas', `${areas.join(', ') || '-'}, from the area networks covering each interface${defaults.area ? `; ${defaults.area} links in no area on either end are in the backbone` : ''}`);
    report.add('ospf', defaults.metric ? 'default' : 'facts', 'interface costs', defaults.metric ? `${defaults.metric} links have an end without a configured metric: cost ${rfcVendor.ospf.defaultCost} there` : 'per interface metric');
    report.add('ospf', 'facts', 'BFD', `${core.filter((l) => l.bfd).length} links with BFD on both ends`);
    report.add('ospf', 'default', 'network type and timers', `point-to-point on every core link; hello ${rfcVendor.ospf.helloIntervalS} s, dead ${rfcVendor.ospf.deadIntervalS} s (engine model values)`);
  }
  return links;
}

// The device that owns an address (loopback or interface), by name.
// The topology's own links (top-level `links[]`, written by the extractor from a containerlab file)
// that no addressed link already joins at either port: plain L2 links between two shown devices,
// with no subnet, so an IGP never runs on them. They place the ring ports of a pure L2 ring.
function topologyLinks(file, links, nodes, report) {
  const shown = new Set(nodes.map((n) => n.id));
  const taken = (node, port) => links.some((l) => (l.a.node === node && l.a.port === port) || (l.b.node === node && l.b.port === port));
  const ids = new Set(links.map((l) => l.id));
  let added = 0;
  for (const l of file.links ?? []) {
    const [a, b] = [l.a, l.b];
    if (!shown.has(a.device) || !shown.has(b.device) || a.device === b.device) continue;
    if (taken(a.device, a.port) || taken(b.device, b.port)) continue;
    let id = `${a.device}-${b.device}`;
    if (ids.has(id)) id = `${id} ${a.port}/${b.port}`;
    ids.add(id);
    links.push({ id, kind: 'l2', lag: false, a: { node: a.device, if: a.port, port: a.port }, b: { node: b.device, if: b.port, port: b.port }, members: [{ id, a: a.port, b: b.port }] });
    added += 1;
  }
  if (added) report.add('physical', 'facts', `${added} L2 links`, `from the file's links[] (the extractor's topology): between two ports that no addressed link joins; no subnet, so no IGP and no routes over them`);
}

function ownerIndex(devices) {
  const owner = new Map();
  for (const [name, f] of devices) {
    for (const i of f.interfaces ?? []) {
      for (const cidr of [i.ip, ...(i.ipv4 ?? [])]) {
        const s = ipv4Subnet(cidr);
        if (s && !owner.has(s.ip)) owner.set(s.ip, name);
      }
    }
  }
  return owner;
}

function buildBgp(devices, owner, report) {
  const sessions = new Map();
  let asn = null;
  for (const [name, f] of devices) {
    asn ??= num(f.bgp?.instances?.[0]?.as);
    for (const p of (f.peers ?? []).filter((x) => x.kind === 'bgp')) {
      const peer = owner.get(p.ip);
      if (!peer) {
        report.warn(`${name}: BGP neighbour ${p.ip} is no device of this file`);
        continue;
      }
      const key = [name, peer].sort().join('|');
      const s = sessions.get(key) ?? { a: [name, peer].sort()[0], b: [name, peer].sort()[1], client: null, configuredOn: [] };
      s.configuredOn.push(name);
      if (p.route_reflector_client) s.client = peer;
      sessions.set(key, s);
    }
  }
  const list = [...sessions.values()];
  if (list.length) {
    const rrs = [...new Set([...devices].filter(([, f]) => f.bgp?.instances?.some((i) => i.route_reflector)).map(([n]) => n))];
    report.add('bgp', 'facts', `${list.length} iBGP sessions`, `neighbours matched to the device owning each address${rrs.length ? `; route reflector ${rrs.join(', ')}` : ''}`);
  }
  for (const s of list) if (s.configuredOn.length === 1) report.warn(`BGP ${s.a}-${s.b}: configured on ${s.configuredOn[0]} only`);
  return { sessions: list, asn };
}

function buildSrPolicies(devices, report) {
  const policies = [];
  for (const [name, f] of devices) {
    const sr = f.segment_routing;
    for (const p of sr?.policies ?? []) {
      const paths = [...(p.candidate_paths ?? [])].sort((x, y) => (num(y.preference) ?? 0) - (num(x.preference) ?? 0));
      const listName = paths.find((c) => c.segment_lists?.length)?.segment_lists[0];
      const sids = listName ? sr.segment_lists?.[listName] : null;
      if (!sids?.length) {
        report.warn(`${name}: SR policy ${p.name} has no explicit segment list in the facts; not drawn`);
        continue;
      }
      policies.push({ name: p.name, headend: name, color: num(p.color), endpoint: p.endpoint, segmentList: { name: listName, sids: sids.map(Number) } });
    }
  }
  if (policies.length) report.add('mpls', 'facts', `${policies.length} SR policies`, 'headend, color, endpoint and the segment list of the preferred candidate path');
  return policies;
}

function srgbOf(devices, report) {
  const blocks = [];
  for (const [name, f] of devices) for (const b of f.segment_routing?.srgb ?? []) blocks.push({ name, base: Number(b.lower), size: Number(b.upper) - Number(b.lower) + 1 });
  if (!blocks.length) return null;
  const [first] = blocks;
  if (blocks.some((b) => b.base !== first.base || b.size !== first.size)) report.warn(`SRGB differs between devices; ${first.base}-${first.base + first.size - 1} (${first.name}) is used for all`);
  report.add('mpls', 'facts', 'SRGB', `${first.base}-${first.base + first.size - 1}; node SIDs are the loopbacks' prefix SID indexes`);
  return { base: first.base, size: first.size };
}

// MPLS-TP co-routed tunnels. Each node configures its own segment of a tunnel; a tunnel is
// stitched from its ingress segment by following the forward next hop to the neighbour whose
// segment of the same source / destination receives our forward out label, up to the egress.
function buildTpTunnels(devices, links, report) {
  const segs = [...devices].flatMap(([node, f]) => (f.tp_corouted_tunnels ?? []).map((t) => ({
    node,
    name: t.name,
    source: t.source,
    destination: t.destination,
    kind: /ingress/.test(t.type ?? '') ? 'ingress' : /egress/.test(t.type ?? '') ? 'egress' : 'transit',
    role: t.role ?? 'primary',
    primary: t.primary?.name ?? null,
    admin: t.admin_state === 'disable' ? 'down' : 'up',
    fwdIn: num(t.forward_in_label),
    fwdOut: num(t.forward_out_label),
    revIn: num(t.reverse_in_label),
    revOut: num(t.reverse_out_label),
    nextHop: t.next_hop_ip ?? null,
    prevHop: t.prev_hop_ip ?? null,
    bfd: t.bfd?.enabled ? { intervalMs: t.bfd.interval_ms ?? null } : null,
  })));
  const used = new Set();
  const tunnels = [];
  // The link from `node` to the neighbour that has address `ip`.
  const toward = (node, ip) => {
    const l = links.find((x) => (x.a.node === node && x.b.ip === ip) || (x.b.node === node && x.a.ip === ip));
    return l ? { link: l, near: l.a.node === node ? l.a : l.b, far: l.a.node === node ? l.b : l.a } : null;
  };
  for (const s0 of segs.filter((x) => x.kind === 'ingress')) {
    const what = `${s0.node} tunnel ${s0.name}`;
    const hop = (x) => ({ node: x.node, name: x.name, fwdIn: x.fwdIn, fwdOut: x.fwdOut, revIn: x.revIn, revOut: x.revOut });
    const hops = [hop(s0)];
    const via = [];
    const mine = [s0];
    let cur = s0;
    let err = null;
    while (cur.kind !== 'egress' && !err) {
      const nh = toward(cur.node, cur.nextHop);
      if (!nh) {
        err = `${cur.node}: next hop ${cur.nextHop} is on none of its links`;
        break;
      }
      const next = segs.find((x) => x.node === nh.far.node && !used.has(x) && !mine.includes(x) && x.kind !== 'ingress' && x.source === s0.source && x.destination === s0.destination && x.fwdIn === cur.fwdOut);
      if (!next) err = `${nh.far.node}: no segment of ${s0.source} -> ${s0.destination} with forward in label ${cur.fwdOut}`;
      else {
        if (next.prevHop && next.prevHop !== nh.near.ip) report.warn(`${what}: ${next.node} prev hop ${next.prevHop} is not ${cur.node}'s address ${nh.near.ip} on ${nh.link.id}`);
        mine.push(next);
        via.push(nh.link.id);
        hops.push(hop(next));
        cur = next;
        if (hops.length > 64) err = 'loop';
      }
    }
    if (err) {
      report.warn(`${what}: ${err}; not drawn`);
      continue;
    }
    for (const x of mine) used.add(x);
    const bfd = s0.bfd ?? cur.bfd;
    tunnels.push({
      id: tunnels.some((t) => t.id === s0.name) ? `${s0.node}:${s0.name}` : s0.name,
      name: s0.name,
      src: s0.node,
      dst: cur.node,
      role: s0.role,
      primaryName: s0.primary,
      ...(s0.admin === 'down' ? { admin: 'down' } : {}),
      hops,
      links: via,
      oam: bfd ? { kind: 'bfd', ...(bfd.intervalMs ? { intervalMs: bfd.intervalMs } : {}) } : null,
    });
  }
  for (const t of tunnels) {
    if (t.role === 'backup') {
      const p = tunnels.find((x) => x.role !== 'backup' && x.src === t.src && x.name === t.primaryName);
      if (p) t.protects = p.id;
      else report.warn(`${t.src} tunnel ${t.name}: backup of ${t.primaryName}, which is no tunnel here`);
    }
    delete t.primaryName;
  }
  for (const x of segs.filter((y) => !used.has(y))) report.warn(`${x.node}: tunnel segment ${x.name} (${x.kind}, ${x.source} -> ${x.destination}) is on no stitched tunnel`);
  if (segs.length) {
    const bfd = tunnels.filter((t) => t.oam).length;
    report.add('mpls-tp', 'facts', `${tunnels.length} co-routed tunnels`, `stitched from ${segs.length} per-node segments: per-hop labels in both directions, next / previous hops`);
    if (tunnels.length) {
      report.add('mpls-tp', 'facts', '1:1 protection', `${tunnels.filter((t) => t.protects).length} backup tunnels`);
      report.add('mpls-tp', 'facts', 'proactive OAM (LSP BFD)', `${bfd} of ${tunnels.length} tunnels; a tunnel without it only sees its own interfaces fail`);
      report.add('mpls-tp', 'derived', 'tunnel numbers (RFC 6370)', 'ordinal per source node; Global_ID 0');
      report.add('mpls-tp', 'default', 'protection timers', `switch in ${rfcVendor.mplsTp.protectionSwitchMs} ms; reversion hold time not modeled`);
    }
  }
  return tunnels;
}

// The attachment circuit of a service on a device: the flow point on the service's forwarding
// domain (the l2vpn service's, else a forwarding domain named like the service).
function attachment(f, service) {
  const fd = (f.l2vpn_services ?? []).find((s) => s.name === service)?.fd ?? service;
  const fp = (f.fps ?? []).find((x) => x.fd === fd);
  return fp ? { port: fp.logical_port ?? null, name: fp.name } : { port: null, name: null };
}

// The MPLS-TP tunnel a PW end rides: the one this node is the ingress or egress of, by name.
function tpTunnelOf(tpTunnels, node, name) {
  return tpTunnels.find((t) => t.role !== 'backup' && ((t.src === node && t.hops[0].name === name) || (t.dst === node && t.hops.at(-1).name === name)));
}

function pwEnd(name, f, pw, peer, tpTunnels, report) {
  const end = { node: name, ac: attachment(f, pw.service) };
  if (pw.tunnel_type === 'sr-policy') {
    end.underlay = 'sr-policy';
    end.color = num(pw.tunnel_color);
  } else if (/corouted/.test(pw.tunnel_type ?? '') && pw.tunnel) {
    const t = tpTunnelOf(tpTunnels, name, pw.tunnel);
    if (!t) report.warn(`${name}: PW ${pw.name} rides MPLS-TP tunnel ${pw.tunnel}, which is not stitched`);
    end.underlay = 'mpls-tp';
    end.tunnel = t?.id ?? pw.tunnel;
    end.rxLabel = num(pw.in_label);
    end.txLabel = num(pw.out_label);
  } else if (pw.tunnel_type || pw.tunnel) {
    report.warn(`${name}: PW ${pw.name} rides ${pw.tunnel_type ?? `tunnel ${pw.tunnel}`}, which the view does not model; shown over the Prefix-SID`);
    end.underlay = 'sr';
  } else {
    end.underlay = f.segment_routing?.prefix_sids?.length ? 'sr' : 'ldp';
    report.add('pw', 'derived', `${name} PW ${pw.name} to ${peer}`, `no tunnel type configured: resolved over the peer's ${end.underlay === 'sr' ? 'Prefix-SID (SR-MPLS)' : 'LDP LSP'}`);
  }
  return end;
}

function buildPseudowires(devices, owner, tpTunnels, report) {
  const used = new Set();
  const pseudowires = [];
  for (const [name, f] of devices) {
    (f.pseudowires ?? []).forEach((pw, i) => {
      if (used.has(`${name}#${i}`)) return;
      const peer = owner.get(pw.peer);
      const g = peer ? devices.get(peer) : null;
      const j = g ? (g.pseudowires ?? []).findIndex((q, k) => !used.has(`${peer}#${k}`) && q.pw_id === pw.pw_id && owner.get(q.peer) === name) : -1;
      if (j < 0) {
        report.warn(`${name}: PW ${pw.name} (id ${pw.pw_id}) to ${pw.peer}: ${peer ? `${peer} has no PW ${pw.pw_id} back` : 'no device has that address'}; not drawn`);
        return;
      }
      used.add(`${name}#${i}`).add(`${peer}#${j}`);
      const other = g.pseudowires[j];
      if (other.service !== pw.service) report.warn(`PW ${pw.pw_id} ${name}-${peer}: service ${pw.service} at ${name}, ${other.service} at ${peer}`);
      const ends = [pwEnd(name, f, pw, peer, tpTunnels, report), pwEnd(peer, g, other, name, tpTunnels, report)];
      pseudowires.push({
        id: `${pw.service ?? pw.name} ${name}-${peer}`,
        service: pw.service ?? pw.name,
        serviceType: pw.service_type ?? other.service_type ?? null,
        pwid: num(pw.pw_id),
        ...(ends.every((e) => e.underlay === 'mpls-tp') ? { static: true } : {}),
        ends,
      });
    });
  }
  if (pseudowires.length) report.add('pw', 'facts', `${pseudowires.length} pseudowires`, 'paired by PW id where each end names the other as peer; transport from tunnel type and color');
  const tp = pseudowires.filter((p) => p.static).length;
  if (tp) report.add('pw', 'facts', `${tp} static pseudowires on MPLS-TP`, 'transmit / receive labels and the tunnel as configured');
  return pseudowires;
}

// The CCM interval of a MEG as { ms, code } (802.1Q Table 21-15), from the MEPs' ccm_interval
// (schema 1.4); null when neither MEP's facts set one, or the text is not an interval the view knows.
function ccmInterval(key, meps, report) {
  const texts = [...new Set(meps.map((m) => m.ccm_interval).filter((t) => t !== null && t !== undefined))];
  if (!texts.length) return null;
  if (texts.length > 1) report.warn(`CFM ${key}: CCM interval ${texts.join(' and ')} on its two MEPs; the view uses ${texts[0]}`);
  const ms = ccmIntervalMs(texts[0]);
  const code = Object.keys(CCM_INTERVALS_MS).find((c) => Math.abs(CCM_INTERVALS_MS[c] - ms) < 0.01);
  if (ms === null || !code) {
    report.warn(`CFM ${key}: CCM interval "${texts[0]}" is ${ms === null ? 'not an interval the view knows' : 'no 802.1Q CCM interval'}; shown at 1 s`);
    return null;
  }
  return { ms, code: Number(code) };
}

function buildCfm(devices, pseudowires, report) {
  const groups = new Map();
  for (const [name, f] of devices) {
    for (const m of f.cfm?.meps ?? []) {
      const key = `${m.md ?? ''}/${m.ma}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ ...m, node: name });
    }
  }
  const megs = [];
  const defaults = []; // MEGs without a CCM interval in the facts
  for (const [key, meps] of groups) {
    if (meps.length !== 2) {
      report.warn(`CFM ${key}: ${meps.length} MEP(s); only MEGs with two MEPs are drawn`);
      continue;
    }
    const nodes = meps.map((m) => m.node);
    // The MA's forwarding domain is the service's: the pseudowire between the two MEPs' devices on it.
    const pw = pseudowires.find((p) => p.ends.every((e) => nodes.includes(e.node)) && meps.every((m) => !m.service || m.service === p.service));
    if (!pw) {
      report.warn(`CFM ${key}: no pseudowire joins ${nodes.join(' and ')} on service ${meps[0].service}; not drawn`);
      continue;
    }
    const level = meps.map((m) => num(m.level)).find((l) => l !== null) ?? null;
    const interval = ccmInterval(key, meps, report);
    megs.push({ id: meps[0].ma, md: meps[0].md, pseudowire: pw.id, ...(level !== null ? { level } : {}), ...(interval ? { intervalCode: interval.code } : {}), meps: meps.map((m) => ({ mepId: num(m.mep_id), node: m.node, if: m.interface ?? m.port ?? '' })) });
    if (level === null) report.add('cfm', 'default', `MEG ${meps[0].ma} level`, 'no MD level in the facts: shown at the default service level 4 (MEF 30.1)');
    if (!interval) defaults.push(meps[0].ma);
  }
  if (megs.length) {
    report.add('cfm', 'facts', `${megs.length} service MEGs`, 'Up MEPs of one MD / MA on two devices, watching the pseudowire between them');
    report.add('cfm', defaults.length ? 'default' : 'facts', 'CCM interval', defaults.length
      ? `${defaults.length === megs.length ? 'the facts carry no CCM interval' : `no CCM interval in the facts for MEG ${defaults.join(', ')}`}: shown at 1 s${defaults.length === megs.length ? '' : ' there'}`
      : "each MEG's as configured on its maintenance association (ccm_interval)");
  }
  return megs;
}

// The ring ports of one instance at one node: every port of the ring, except where the node
// terminates a sub-ring. SAOS 10 lists two `ring-port`s even there (the YANG requires two) and names
// the sub-ring's own port alone in the instance's `ports`; SAOS 6 / 8 says which port the sub-ring
// terminates on. The other port is the major ring's, where the sub-ring's traffic continues.
function instancePorts(ring, inst) {
  if (inst.type !== 'sub' || ring.ports.length !== 2) return ring.ports;
  if (inst.termination === 'west' || inst.termination === 'east') return ring.ports.filter((p) => p.name === inst.termination);
  if (inst.rpl.length === 1) return ring.ports.filter((p) => p.name === inst.rpl[0].port);
  return ring.ports;
}

// G.8032 rings (schema 1.5 `rings[]`, SAOS 10 and SAOS 6 / 8 alike), one per ring id across the file:
// the ring's links are the topology links whose two ends are ring ports of the ring on their devices;
// the RPL is the link of the port the owner configures `rpl owner` on. A device ring without a ring
// id is a ring of its own (nothing says which other device's ring it is).
function buildRings(devices, links, report) {
  const linkOf = (node, port) => links.find((l) => (l.a.node === node && l.a.port === port) || (l.b.node === node && l.b.port === port)) ?? null;
  const groups = new Map(); // ring id -> ring
  const byDevice = new Map(); // `${device}|${ring name}` -> ring id
  for (const [name, f] of devices) {
    for (const r of ringsOf(f)) {
      const inst = r.instances[0] ?? null;
      if (r.instances.length > 1) report.warn(`${name}: ring ${r.name} has ${r.instances.length} protection instances; the view shows the first (${inst.name})`);
      const key = r.ring_id !== null && r.ring_id !== undefined ? String(r.ring_id) : `${name}:${r.name}`;
      if (!r.ring_id && r.ring_id !== 0) report.warn(`${name}: ring ${r.name} has no ring id; it cannot be joined with the other devices' rings`);
      byDevice.set(`${name}|${r.name}`, key);
      if (!groups.has(key)) groups.set(key, { id: key, ringId: r.ring_id ?? null, name: r.name, type: inst?.type ?? null, rapsVid: num(inst?.raps_vid), level: num(inst?.raps_level), virtualChannel: inst?.virtual_channel ?? null, revertive: inst?.revertive ?? null, wtrMin: num(inst?.timers?.wtr), guardMs: num(inst?.timers?.guard), holdOffMs: num(inst?.timers?.hold_off), members: [], nodes: [], links: [], rpl: null, subRingOf: null, interconnect: [] });
      const g = groups.get(key);
      if (g.name !== r.name) report.warn(`ring id ${key}: named ${g.name} on ${g.nodes[0]?.node} and ${r.name} on ${name}`);
      for (const m of inst?.members ?? []) if (!g.members.includes(m)) g.members.push(m);
      const ports = (inst ? instancePorts(r, inst) : r.ports).map((p) => {
        const link = p.interface ? linkOf(name, p.interface) : null;
        if (!link) report.warn(`${name}: ring ${r.name} port ${p.name} (${p.interface ?? 'no interface'}) is on no link of the view (no addressed interface rides it and the file's links[] do not name it); the ring is drawn without it`);
        return { name: p.name, if: p.interface ?? null, link: link?.id ?? null };
      });
      const rplOf = (role) => inst?.rpl.find((x) => x.role === role) ?? null;
      const owner = rplOf('owner');
      const neighbor = rplOf('neighbor');
      g.nodes.push({ node: name, ring: r.name, instance: inst?.name ?? null, ports, rpl: owner ? 'owner' : neighbor ? 'neighbor' : null, rplPort: (owner ?? neighbor)?.port ?? null, terminates: Boolean(inst && inst.type === 'sub' && ports.length < r.ports.length), subRingOf: inst?.sub_ring_of ?? null });
    }
  }
  const rings = [...groups.values()];
  for (const g of rings) {
    const portLinks = new Map(); // link id -> nodes whose ring ports are on it
    for (const n of g.nodes) for (const p of n.ports) if (p.link) portLinks.set(p.link, [...(portLinks.get(p.link) ?? []), n.node]);
    for (const [id, ends] of portLinks) {
      if (ends.length === 2) g.links.push(id);
      else report.warn(`ring ${g.name}: ${ends[0]} has a ring port on ${id} but the far end does not; the link is not on the ring`);
    }
    g.interconnect = g.nodes.filter((n) => n.terminates || n.subRingOf).map((n) => n.node);
    const parent = g.nodes.map((n) => n.subRingOf && byDevice.get(`${n.node}|${n.subRingOf}`)).find(Boolean);
    if (parent) g.subRingOf = parent;
    const owners = g.nodes.filter((n) => n.rpl === 'owner');
    const neighbors = g.nodes.filter((n) => n.rpl === 'neighbor');
    if (owners.length > 1) report.warn(`ring ${g.name}: RPL owner on ${owners.map((n) => n.node).join(' and ')}; the view uses ${owners[0].node}`);
    const owner = owners[0] ?? null;
    if (owner) {
      const link = owner.ports.find((p) => p.name === owner.rplPort)?.link ?? null;
      if (!link || !g.links.includes(link)) report.warn(`ring ${g.name}: the RPL owner's port ${owner.rplPort} on ${owner.node} is on no link of the ring; no RPL drawn`);
      else {
        const nb = neighbors.find((n) => n.ports.some((p) => p.name === n.rplPort && p.link === link)) ?? null;
        if (neighbors.length && !nb) report.warn(`ring ${g.name}: RPL neighbour ${neighbors.map((n) => n.node).join(', ')} is not at the other end of the RPL ${link}`);
        g.rpl = { link, owner: owner.node, neighbor: nb?.node ?? null };
      }
    } else report.warn(`ring ${g.name}: no RPL owner configured; the view cannot say which port blocks`);
    g.path = ringPath(g);
  }
  if (rings.length) {
    const major = rings.filter((r) => r.type === 'major').length;
    report.add('ring', 'facts', `${rings.length} G.8032 rings`, `${major} major, ${rings.length - major} sub-ring; ring ports, R-APS VID and level, RPL owner / neighbour, protected forwarding domains and timers as configured`);
    report.add('ring', 'derived', 'ring links', 'a link whose two ends are ring ports of the same ring id on their devices (an addressed link, or one of the links[] in the file); a ring port on neither cannot be placed');
    const sub = rings.filter((r) => r.type === 'sub');
    if (sub.length) report.add('ring', 'derived', 'interconnection nodes', 'a node where a sub-ring instance names one port (SAOS 10) or terminates on a port (SAOS 6 / 8); the sub-ring is attached to the ring that shares its other port');
    const defaults = rings.filter((r) => r.wtrMin === null || r.guardMs === null || r.holdOffMs === null || r.revertive === null);
    if (defaults.length) report.add('ring', 'default', 'protection timers', `WTR ${rfcVendor.g8032.wtrMin} min, guard ${rfcVendor.g8032.guardMs} ms, hold-off ${rfcVendor.g8032.holdOffMs} ms, revertive (G.8032 defaults) where ${defaults.length === rings.length ? 'a ring' : defaults.map((r) => r.name).join(', ')} does not configure them`);
  }
  return rings;
}

// The ring's nodes in link order: a major ring from the RPL owner around and back (closed); a
// sub-ring from one end to the other (open at the interconnection nodes). A ring whose links do
// not chain (a port missing) gives the longest chain found.
function ringPath(g) {
  const adj = new Map();
  const end = (id) => id.split(' ')[0].split('-');
  const linkEnds = g.links.map((id) => {
    const n = g.nodes.filter((x) => x.ports.some((p) => p.link === id)).map((x) => x.node);
    return { id, a: n[0] ?? end(id)[0], b: n[1] ?? end(id)[1] };
  });
  for (const l of linkEnds) {
    adj.set(l.a, [...(adj.get(l.a) ?? []), { node: l.b, link: l.id }]);
    adj.set(l.b, [...(adj.get(l.b) ?? []), { node: l.a, link: l.id }]);
  }
  const start = [...adj.keys()].find((n) => adj.get(n).length === 1) ?? g.rpl?.owner ?? [...adj.keys()][0];
  if (!start) return { nodes: g.nodes.map((n) => n.node), links: [], closed: false };
  const nodes = [start];
  const used = new Set();
  let cur = start;
  for (;;) {
    const next = (adj.get(cur) ?? []).find((x) => !used.has(x.link));
    if (!next) break;
    used.add(next.link);
    if (next.node === start) return { nodes, links: [...used], closed: true };
    nodes.push(next.node);
    cur = next.node;
  }
  return { nodes, links: [...used], closed: false };
}

// Services: one per pseudowire, with its MEG.
function buildServices(pseudowires, megs) {
  return pseudowires.map((pw) => ({
    id: pw.id,
    name: pw.service,
    type: pw.serviceType ?? 'vpws',
    pseudowire: pw.id,
    meg: megs.find((m) => m.pseudowire === pw.id)?.id ?? null,
    ends: pw.ends.map((e) => ({ node: e.node, port: e.ac.port, fp: e.ac.name })),
  }));
}

// Node positions: the authored ones when they place every device (see layout.js
// scalePositions), else a force-directed layout of the links.
function placeNodes(nodes, links, positions, report) {
  const ids = nodes.map((n) => n.id);
  if (positions) {
    const { pos, missing } = scalePositions(ids, positions);
    if (!missing.length) {
      report.add('physical', 'authored', 'positions', 'from the positions file');
      return pos;
    }
    report.warn(`positions: no position for ${missing.join(', ')}; the layout is computed instead`);
  }
  report.add('physical', 'derived', 'positions', 'the facts carry no layout: a force-directed layout of the links');
  return layoutNodes(ids, links.map((l) => [l.a.node, l.b.node]));
}

// facts file (JSON text or value) -> { topology, file, devices, services, labelMode, report }
// `positions`: optional authored node positions (layout.js scalePositions).
export function importFacts(input, { name, positions } = {}) {
  const file = parseFacts(input);
  const devices = devicesByName(file);
  const report = new Report();
  if (!devices.size) throw new Error('no device in this facts file has facts (status ok or partial)');
  for (const r of file.devices) if (!devices.has(r.device)) report.warn(`${r.device}: ${r.status}${r.reason ? ` (${r.reason})` : ''}; not shown`);

  const igp = chooseIgp(devices, report);
  // The IS-IS level the view runs: the first instance's (level 1-2 runs as 2).
  const levels = [...new Set([...devices.values()].map((f) => levelNumber(f.isis?.instances?.[0]?.level)).filter(Boolean))];
  const nodes = buildNodes(devices, igp, report);
  const links = buildLinks(devices, nodes, igp, levels[0] ?? 2, report);
  topologyLinks(file, links, nodes, report);
  const owner = ownerIndex(devices);
  const bgp = buildBgp(devices, owner, report);
  const srgb = srgbOf(devices, report);
  const srPolicies = buildSrPolicies(devices, report);
  const tpTunnels = buildTpTunnels(devices, links, report);
  const pseudowires = buildPseudowires(devices, owner, tpTunnels, report);
  const megs = buildCfm(devices, pseudowires, report);
  const rings = buildRings(devices, links, report);

  // Roles: a router is a PE when it speaks BGP, ends a pseudowire or faces a CE.
  const edge = new Set([...bgp.sessions.flatMap((s) => [s.a, s.b]), ...pseudowires.flatMap((p) => p.ends.map((e) => e.node))]);
  for (const l of links) if (l.kind === 'access') for (const e of [l.a, l.b]) edge.add(e.node);
  for (const n of nodes) if (n.role !== 'ce' && edge.has(n.id)) n.role = 'pe';
  report.add('physical', 'derived', 'roles', `CE: no ${igp === 'ospf' ? 'OSPF' : 'IS-IS'} and no MPLS-TP tunnel; PE: a router that speaks BGP, ends a pseudowire or faces a CE; P: the other routers`);

  const routers = nodes.filter((n) => n.role !== 'ce');
  if (igp === 'isis') {
    if (levels.length > 1) report.warn(`IS-IS levels ${levels.join(' and ')} mixed; the view runs one level (${levels[0]})`);
    const areas = [...new Set([...devices.values()].map((f) => f.isis?.instances?.[0]).filter(Boolean).map(isisArea).filter(Boolean))];
    if (routers.length) report.add('isis', 'facts', 'IS-IS', `level ${levels[0] ?? 2}, area ${areas.join(', ') || '?'}; system ids from the NETs`);
  } else {
    const instances = [...new Set([...devices.values()].flatMap((f) => ospfOf(f).instances.map((i) => i.name)))];
    const noRid = routers.filter((n) => !n.routerId).map((n) => n.id);
    report.add('ospf', 'facts', 'OSPF', `instance ${instances.join(', ')} on ${routers.length - noRid.length === routers.length ? 'every router' : `${routers.length - noRid.length} of ${routers.length} routers`}; the IGP of this view`);
    report.add('ospf', noRid.length ? 'default' : 'facts', 'router ids', noRid.length ? `${noRid.join(', ')}: no router id configured, the loopback is used` : 'ospf instance router-id');
  }

  const placed = placeNodes(nodes, links, positions, report);
  for (const n of nodes) n.pos = placed[n.id];

  const recipe = file.devices.find((r) => r.recipe)?.recipe;
  // Labels: SR-MPLS with an SRGB; static only when MPLS-TP tunnels carry every pseudowire; else LDP.
  const needsLdp = pseudowires.some((p) => p.ends.some((e) => e.underlay === 'ldp'));
  const labelMode = srgb ? 'sr' : tpTunnels.length && !needsLdp ? 'none' : 'ldp';
  const topology = {
    name: name ?? recipe ?? 'facts import',
    asn: bgp.asn ?? 65000,
    igp,
    ...(igp === 'ospf' ? { ospf: { area: BACKBONE } } : { isis: { level: levels[0] ?? 2 } }),
    ...(srgb ? { srgb } : {}),
    nodes,
    links,
    vrfs: [],
    bgp: { sessions: bgp.sessions },
    srPolicies,
    tpTunnels,
    pseudowires,
    cfm: { linkMegs: false, megs },
    rings,
  };
  return {
    topology,
    file,
    devices,
    services: buildServices(pseudowires, megs),
    labelMode,
    report: { topology, gaps: report.gaps, warnings: report.warnings },
  };
}
