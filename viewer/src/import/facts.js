// SPDX-License-Identifier: Apache-2.0
// Import a saos-network-facts facts file (schema 1.x) into the engine topology
// (engine/topology.js). Everything comes from the facts; what they do not say
// is derived (links from interface subnets, roles, positions) or defaulted
// (IS-IS metrics, CFM level and interval), and each such choice is listed in
// the report so the view never passes a guess off as configuration.
//
//   IGP          IS-IS, or OSPF when more devices run OSPF than IS-IS (the engine runs one)
//   nodes        every device with facts; a router when it runs the IGP or an MPLS-TP tunnel, else a CE
//   links        two routed interfaces on different devices in one IPv4 or IPv6 subnet (management interfaces
//                never link: they share the management network); with more interfaces in the subnet,
//                the two that run the IGP; core when both run the IGP; a LAG when both interfaces ride
//                a LAG (lags / ports[].lag), members paired by port in natural order at both ends; an IPv6
//                subnet joining the same two interfaces as an IPv4 one is that link's second family; IPv6
//                link-local addresses never link
//   loopbacks    the IGP loopback's IPv4 address, or its IPv6 one when the device has no IPv4 loopback or its
//                IGP interfaces carry IPv6 only (an IPv6 core); every loopback address is advertised
//   IS-IS        per link each end's interface metric at the level the view runs (wide, else narrow, else 10)
//   OSPF         per link the area and cost of each end's interface, BFD when both ends enable it
//   SRGB, SIDs   segment_routing.srgb / prefix_sids (node SID of the loopback)
//   SR policies  segment_routing.policies, the preferred candidate path's first segment list
//   MPLS-TP      tp_corouted_tunnels: each node's segment, stitched from the ingress along next hops
//   BGP          peers of kind bgp, matched to the device owning the address (IPv4 or IPv6)
//   pseudowires  the two ends that name each other (peer address + PW id); static on an MPLS-TP tunnel
//   CFM          MEPs of one MD / MA on two devices, over that service's pseudowire, at the MA's CCM interval
//   L2 links     top-level links[] (schema 1.5, from the extractor's --clab topology) between two ports no
//                addressed link already joins: drawn as plain links with no subnet (no IGP, no routes)
//   SRv6         segment_routing.srv6.locators (schema 1.6) per device, with their Flex-Algo (0 when none)
//   Flex-Algo    segment_routing.flex_algorithms (schema 1.6): each device's definitions, grouped by algorithm
//   EVPN         evpn_instances (schema 1.6) grouped by EVI across devices, the attachment circuit the flow
//                point on the instance's forwarding domain
//   hosts        hosts[] (schema 1.8, Linux hosts from --clab exec lines or --hosts): CE nodes with their
//                addresses and static routes, linked to a router by subnet like any device, else by links[]
//   VRFs         vrf_instances (schema 1.7) joined across devices by name: per PE its RD, route targets per
//                address family, interfaces, static routes, redistribution, label allocation, SRv6 locators
//   G.8032       rings[] (schema 1.5) joined across devices by ring id: the links whose two ends are ring ports
//                of the ring, the RPL from the owner's and neighbour's port, a sub-ring's interconnection nodes

import { ccmIntervalMs, devicesByName, evpnInstances, flexAlgorithms, hosts as factsHosts, interfacesOnPort, isisArea, isisMetric, isRouted, loopbacks, parseFacts, ringsOf, srv6Locators, staticRoutes, vrfInstances, vrfRouteTargets } from '../../../js/src/index.ts';
import { CCM_INTERVALS_MS } from '../engine/cfm.js';
import { hostPrefix, ip6ToBig, isV6, networkOf } from '../engine/ip.js';
import { BACKBONE, normArea } from '../engine/ospf.js';
import { rfcVendor } from '../engine/vendor.js';
import { layoutNodes, scalePositions } from './layout.js';

const DEFAULT_METRIC = 10;

// An IPv4 `ip/len` as { ip, len, subnet }, or null for anything else.
export function ipv4Subnet(cidr) {
  const m = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(cidr ?? '');
  if (!m) return null;
  const len = Number(m[2]);
  if (len > 32 || m[1].split('.').some((o) => Number(o) > 255)) return null;
  return { ip: m[1], len, subnet: networkOf(m[1], len) };
}

// An IPv6 `ip/len` as { ip, len, subnet } (the subnet in RFC 5952 text), or null for anything else and
// for a link-local address (RFC 4291 §2.5.6, the first 10 bits 1111111010: every interface has one, so
// it says nothing about a link).
export function ipv6Subnet(cidr) {
  const m = /^([0-9a-f:]+)\/(\d{1,3})$/i.exec(cidr ?? '');
  if (!m || !m[1].includes(':')) return null;
  const len = Number(m[2]);
  if (len > 128) return null;
  try {
    if (ip6ToBig(m[1]) >> 118n === 0x3fan) return null;
    const ip = networkOf(m[1], 128).split('/')[0];
    return { ip, len, subnet: networkOf(m[1], len) };
  } catch {
    return null;
  }
}

// Either family.
export const ipSubnet = (cidr) => ipv4Subnet(cidr) ?? ipv6Subnet(cidr);
// A prefix in its network form (192.0.2.7/24 -> 192.0.2.0/24), or as written when it is none.
const prefixOf = (p) => ipSubnet(p)?.subnet ?? p;

// An interface's addresses by family, as written (`ip` is the first IPv4 address in schema 1.x).
const v4Of = (i) => (i.ipv4?.length ? i.ipv4 : [i.ip]).filter((c) => ipv4Subnet(c));
const v6Of = (i) => [...(i.ipv6 ?? []), ...(isV6(i.ip) ? [i.ip] : [])].filter((c) => ipv6Subnet(c));

// The facts with every IPv6-only interface given its first IPv6 address as `ip`, so the npm reader's
// port and loopback helpers (which look at `ip`, the IPv4 address) see an IPv6-only interface too.
function withIpv6(f) {
  const interfaces = (f.interfaces ?? []).map((i) => (i.ip || !v6Of(i).length ? i : { ...i, ip: v6Of(i)[0] }));
  return { ...f, interfaces };
}

// The port an interface rides on: the port whose flow points (SAOS 10) or VLANs (SAOS 6) reach it;
// the LAG when that port is a member of one (a member reaches the LAG's interfaces).
function portOf(f, ifname) {
  const facts = withIpv6(f);
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

// A device's loopback addresses: `loIp` the one the view runs the IGP, BGP and labels on (the IGP
// loopback's IPv4 address; its IPv6 one when the device has no IPv4 loopback, or when IS-IS runs on
// IPv6-only interfaces, an IPv6 core whose BGP sessions and SRv6 locators use the IPv6 loopback),
// `all` every address of that loopback. OSPF (OSPFv2) is IPv4 only.
function loopbackOf(f, lo, igp) {
  const iface = lo ? (f.interfaces ?? []).find((i) => i.name === lo.name) : null;
  if (!iface) return { loIp: null, all: [], family: null };
  const v4 = v4Of(iface).map((c) => ipv4Subnet(c).ip);
  const v6 = v6Of(iface).map((c) => ipv6Subnet(c).ip);
  const igpIfs = (f.interfaces ?? []).filter((i) => i.kind !== 'loopback' && inIgp(igp, f, i));
  const v6Core = igp === 'isis' && igpIfs.length > 0 && igpIfs.every((i) => !v4Of(i).length && v6Of(i).length);
  const family = v6.length && (!v4.length || v6Core) ? 'ipv6' : v4.length ? 'ipv4' : null;
  return { loIp: family === 'ipv6' ? v6[0] : v4[0] ?? null, all: [...v4, ...v6], family };
}

function buildNodes(devices, igp, report) {
  const nodes = [];
  const v6Nodes = [];
  const sidElsewhere = [];
  for (const [name, f] of devices) {
    const ospf = ospfOf(f);
    const los = loopbacks(withIpv6(f));
    const lo = (igp === 'ospf' ? los.find((l) => ospf.interfaces.has(l.name)) : los.find((l) => l.isis)) ?? los[0] ?? null;
    const isis = f.isis?.instances?.[0] ?? null;
    const { loIp, all, family } = loopbackOf(f, lo, igp);
    const runsIgp = igp === 'ospf' ? ospf.instances.length > 0 : Boolean(isis);
    const router = (runsIgp || (f.tp_corouted_tunnels ?? []).length > 0) && Boolean(loIp);
    const node = { id: name, role: router ? 'p' : 'ce', pos: { x: 0, z: 0 } };
    if (loIp) node.loopback = loIp;
    if (all.length > 1) node.loopbacks = all;
    if (family === 'ipv6' && router) v6Nodes.push(name);
    if (isis?.system_id) node.systemId = isis.system_id;
    if (igp === 'ospf' && router) {
      const rid = ospf.instances[0]?.router_id;
      if (rid) node.routerId = rid;
      const area = normArea(ospf.interfaces.get(lo.name)?.area);
      if (area) node.loopbackArea = area;
    }
    if (router) {
      const sid = (f.segment_routing?.prefix_sids ?? []).find((s) => all.some((ip) => s.prefix === hostPrefix(ip)));
      if (sid?.value_type === 'index') node.sidIndex = Number(sid.sid);
      if (sid && sid.prefix !== hostPrefix(loIp)) sidElsewhere.push(`${name} (${sid.prefix})`);
      if (igp === 'isis' && isis && !isis.system_id) report.warn(`${name}: IS-IS instance ${isis.name} has no NET; its LSP ID is made up`);
    } else if (runsIgp) {
      report.warn(`${name}: runs ${igp === 'ospf' ? 'OSPF' : 'IS-IS'} but has no loopback address; shown as a host`);
    }
    nodes.push(node);
  }
  if (sidElsewhere.length) report.add('mpls', 'derived', 'node SIDs on the other loopback address', `${sidElsewhere.join(', ')}: the prefix SID is configured on the loopback's other address family; the view gives it to the loopback it runs on`);
  if (v6Nodes.length) report.add('physical', 'derived', 'IPv6 loopbacks', `${v6Nodes.join(', ')}: IS-IS runs on IPv6-only interfaces (or the loopback has no IPv4 address), so the view runs IS-IS, BGP and the label tables on the IPv6 loopback`);
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

function buildLinks(devices, nodes, igp, isisLevel, report, hostFacts = new Map()) {
  // IPv4 subnets first, then IPv6: an IPv6 subnet on two interfaces an IPv4 subnet already links is
  // the same link's second address family.
  const bySubnet = new Map();
  for (const [family, addrs, parse] of [['ipv4', v4Of, ipv4Subnet], ['ipv6', v6Of, ipv6Subnet]]) {
    for (const [name, f] of [...devices, ...hostFacts]) {
      for (const i of f.interfaces ?? []) {
        if (!isRouted({ ...i, ip: i.ip ?? v6Of(i)[0] ?? null })) continue;
        for (const cidr of addrs(i)) {
          const s = parse(cidr);
          if (!s || s.len >= (family === 'ipv6' ? 128 : 32)) continue;
          if (!bySubnet.has(s.subnet)) bySubnet.set(s.subnet, []);
          const port = f.host ? (f.ports[i.name] ?? null) : portOf(f, i.name);
          bySubnet.get(s.subnet).push({ node: name, if: i.name, ip: s.ip, port, lag: lagOf(f, port), igp: inIgp(igp, f, i) });
        }
      }
    }
  }
  const byPair = new Map(); // `${node}|${if}` pair -> link, to fold an IPv6 subnet into its IPv4 link
  const pairKey = (a, b) => [`${a.node}|${a.if}`, `${b.node}|${b.if}`].sort().join(' ');
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
    const same = byPair.get(pairKey(a, b));
    if (same && !same.subnet6 && isV6(subnet) && !isV6(same.subnet)) {
      same.subnet6 = subnet;
      for (const e of [a, b]) same[same.a.node === e.node && same.a.if === e.if ? 'a' : 'b'].ip6 = e.ip;
      continue;
    }
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
    const link = { id, kind: core ? 'core' : 'access', ...(core ? { metric: DEFAULT_METRIC } : {}), subnet, lag, a: end(a), b: end(b), members };
    links.push(link);
    byPair.set(pairKey(a, b), link);
  }
  const lags = links.filter((l) => l.lag);
  if (lags.length) {
    report.add('physical', 'facts', `${lags.length} LAG links`, `links whose interfaces ride a LAG at both ends: ${lags.map((l) => `${l.id} (${l.members.length} members)`).join(', ')}`);
    report.add('physical', 'derived', 'LAG member pairing', 'the facts do not say which member faces which: members are paired by port in natural order at both ends (29/30 with 29/30)');
  }
  const core = links.filter((l) => l.kind === 'core');
  const name = igp === 'ospf' ? 'OSPF' : 'IS-IS';
  const v6 = links.filter((l) => isV6(l.subnet)).length;
  const dual = links.filter((l) => l.subnet6).length;
  const families = v6 || dual ? `; ${links.length - v6 - dual} IPv4, ${v6} IPv6, ${dual} dual-stack (link-local addresses never link)` : '';
  report.add('physical', 'derived', `${links.length} links`, `from interface subnets (two routed interfaces of different devices in one IPv4 or IPv6 subnet; management interfaces and loopbacks never link); ${core.length} core (${name} at both ends), ${links.length - core.length} access${families}`);
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
// The file's links are the cabling: an addressed link whose port the file cables to some other
// device is a subnet over a bridged domain (a VLAN around a ring, a service across the network),
// not that cable; it keeps its two interfaces and loses its ports, which the cabled links take.
function topologyLinks(file, links, nodes, report) {
  const shown = new Set(nodes.map((n) => n.id));
  const cabled = new Map(); // `${device}|${port}` -> `${far device}|${far port}`, from links[]
  for (const l of file.links ?? []) {
    cabled.set(`${l.a.device}|${l.a.port}`, `${l.b.device}|${l.b.port}`);
    cabled.set(`${l.b.device}|${l.b.port}`, `${l.a.device}|${l.a.port}`);
  }
  const elsewhere = (e, far) => e.port && cabled.has(`${e.node}|${e.port}`) && cabled.get(`${e.node}|${e.port}`) !== `${far.node}|${far.port}`;
  const bridged = links.filter((l) => !l.lag && (elsewhere(l.a, l.b) || elsewhere(l.b, l.a)));
  for (const l of bridged) {
    l.bridged = [l.a, l.b].map((e) => `${e.node} ${e.if} (port ${e.port ?? '?'}, cabled to ${(cabled.get(`${e.node}|${e.port}`) ?? '?').replace('|', ' port ')})`).join(', ');
    for (const e of [l.a, l.b]) delete e.port;
  }
  if (bridged.length) report.add('physical', 'derived', `${bridged.length} subnets over a bridged domain`, `${bridged.map((l) => `${l.id} (${l.subnet}): ${l.bridged}`).join('; ')}: the file's links[] cable those ports to other devices, so the subnet is an L3 adjacency over a bridged domain (a ring VLAN, a service), drawn as a link with no ports; the cables are drawn as L2 links`);
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

// An address in the form the owner index keys it by (IPv6 in RFC 5952 text, so 2001:DB8:0::1 finds 2001:db8::1).
export function canonicalIp(ip) {
  return ipv6Subnet(`${ip}/128`)?.ip ?? ip;
}

function ownerIndex(devices) {
  const owner = new Map();
  for (const [name, f] of devices) {
    for (const i of f.interfaces ?? []) {
      for (const cidr of [i.ip, ...(i.ipv4 ?? []), ...(i.ipv6 ?? [])]) {
        const s = ipSubnet(cidr);
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
    // a VRF neighbour (schema 1.7: a CE of an L3VPN) is no iBGP session of the core
    for (const p of (f.peers ?? []).filter((x) => x.kind === 'bgp' && !x.vrf)) {
      const peer = owner.get(canonicalIp(p.ip));
      if (!peer) {
        report.warn(`${name}: BGP neighbour ${p.ip} is no device of this file`);
        continue;
      }
      const key = [name, peer].sort().join('|');
      const s = sessions.get(key) ?? { a: [name, peer].sort()[0], b: [name, peer].sort()[1], client: null, configuredOn: [], families: [], sides: {} };
      s.configuredOn.push(name);
      s.sides[name] = p.address_families ?? [];
      for (const fam of p.address_families ?? []) if (!s.families.includes(fam)) s.families.push(fam);
      if (p.route_reflector_client) s.client = peer;
      sessions.set(key, s);
    }
  }
  // A family both ends configure is negotiated (RFC 4760 §8, the Multiprotocol capability); with
  // one end configured, or an end that lists none, its families stand.
  const list = [...sessions.values()].map(({ sides, ...s }) => {
    const [x, y] = Object.values(sides);
    if (y && x.length && y.length) s.families = s.families.filter((f) => x.includes(f) && y.includes(f));
    return s;
  });
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
      const peer = owner.get(canonicalIp(pw.peer));
      const g = peer ? devices.get(peer) : null;
      const j = g ? (g.pseudowires ?? []).findIndex((q, k) => !used.has(`${peer}#${k}`) && q.pw_id === pw.pw_id && owner.get(canonicalIp(q.peer)) === name) : -1;
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

const hasRingId = (r) => r.ring_id !== null && r.ring_id !== undefined && r.ring_id !== '';

// Which ring of the file a device's ring belongs to: the ring id when the device configures one
// (SAOS 6 / 8 always do, SAOS 10 XML usually does); without one, the ring of that name. A SAOS 10
// CLI config normally leaves `ring-id` out (the YANG key is the ring name, the id defaults to 1),
// so its devices' rings join by name; a name-only ring joins a ring id when exactly one device
// gives that name an id. Two different ring ids under one name say nothing about which of them an
// id-less ring means: that ring stays on its own device, with a warning.
function ringKeys(devices, report) {
  const idsByName = new Map(); // ring name -> the ring ids configured under it
  for (const [, f] of devices) for (const r of ringsOf(f)) if (hasRingId(r)) idsByName.set(r.name, new Set([...(idsByName.get(r.name) ?? []), String(r.ring_id)]));
  return (device, r) => {
    if (hasRingId(r)) return { key: String(r.ring_id), ringId: String(r.ring_id), joinedBy: 'id' };
    const ids = idsByName.get(r.name);
    if (!ids) return { key: `name:${r.name}`, ringId: null, joinedBy: 'name' };
    if (ids.size === 1) return { key: [...ids][0], ringId: [...ids][0], joinedBy: 'id' };
    report.warn(`${device}: ring ${r.name} has no ring id and ${r.name} is ring id ${[...ids].join(' and ')} on other devices; it cannot be joined with either`);
    return { key: `${device}:${r.name}`, ringId: null, joinedBy: 'device' };
  };
}

// G.8032 rings (schema 1.5 `rings[]`, SAOS 10 and SAOS 6 / 8 alike), one per ring across the file
// (joined by ring id, or by ring name where no device gives the ring an id, see ringKeys): the
// ring's links are the topology links whose two ends are ring ports of the ring on their devices;
// the RPL is the link of the port the owner configures `rpl owner` on.
function buildRings(devices, links, report) {
  const linkOf = (node, port) => links.find((l) => (l.a.node === node && l.a.port === port) || (l.b.node === node && l.b.port === port)) ?? null;
  const keyOf = ringKeys(devices, report);
  const groups = new Map(); // ring key -> ring
  const byDevice = new Map(); // `${device}|${ring name}` -> ring key
  for (const [name, f] of devices) {
    for (const r of ringsOf(f)) {
      const inst = r.instances[0] ?? null;
      if (r.instances.length > 1) report.warn(`${name}: ring ${r.name} has ${r.instances.length} protection instances; the view shows the first (${inst.name})`);
      const { key, ringId, joinedBy } = keyOf(name, r);
      byDevice.set(`${name}|${r.name}`, key);
      if (!groups.has(key)) groups.set(key, { id: key, ringId, joinedBy, name: r.name, type: inst?.type ?? null, rapsVid: num(inst?.raps_vid), level: num(inst?.raps_level), virtualChannel: inst?.virtual_channel ?? null, revertive: inst?.revertive ?? null, wtrMin: num(inst?.timers?.wtr), guardMs: num(inst?.timers?.guard), holdOffMs: num(inst?.timers?.hold_off), members: [], nodes: [], links: [], rpl: null, subRingOf: null, interconnect: [] });
      const g = groups.get(key);
      if (g.name !== r.name) report.warn(`ring id ${key}: named ${g.name} on ${g.nodes[0]?.node} and ${r.name} on ${name}`);
      if (g.joinedBy === 'name' && inst && g.nodes.length) {
        // joined by name only: a different R-APS VID or ring type on one device is the one sign that two rings share the name
        const first = g.nodes[0].node;
        if (num(inst.raps_vid) !== null && g.rapsVid !== null && num(inst.raps_vid) !== g.rapsVid) report.warn(`ring ${r.name} (joined by name, no ring id): R-APS VID ${g.rapsVid} on ${first} and ${inst.raps_vid} on ${name}; the two may be different rings`);
        if (inst.type && g.type && inst.type !== g.type) report.warn(`ring ${r.name} (joined by name, no ring id): a ${g.type} ring on ${first} and a ${inst.type} ring on ${name}; the two may be different rings`);
      }
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
    report.add('ring', 'derived', 'ring links', 'a link whose two ends are ring ports of the same ring on their devices (an addressed link, or one of the links[] in the file); a ring port on neither cannot be placed');
    const byName = rings.filter((r) => r.joinedBy === 'name');
    if (byName.length) report.add('ring', 'derived', 'rings joined by name', `${byName.map((r) => r.name).join(', ')}: no device configures a ring id (a SAOS 10 CLI config leaves ring-id out; the YANG default is 1), so the devices' rings of that name are one ring and its R-APS group MAC uses ring id 1`);
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

const algorithmNumber = (a) => (a === null || a === undefined || a === '' ? 0 : Number(a));

// SRv6 locators of every device (schema 1.6), with their algorithm (0: SPF).
function buildSrv6(devices, nodes, report) {
  const shown = new Set(nodes.filter((n) => n.role !== 'ce').map((n) => n.id));
  const locators = [];
  for (const [name, f] of devices) {
    for (const l of srv6Locators(f)) {
      if (!shown.has(name)) {
        report.warn(`${name}: SRv6 locator ${l.name} on a device the view does not run the IGP on; left out`);
        continue;
      }
      locators.push({ node: name, name: l.name, prefix: l.prefix, algorithm: algorithmNumber(l.algorithm), sidType: l.sid_type ?? null, blockLength: num(l.block_length), nodeLength: num(l.node_length), functionLength: num(l.function_length), endBehavior: l.end_behavior ?? null, instances: l.instances ?? [] });
    }
  }
  const bad = locators.filter((l) => !ipv6Subnet(l.prefix));
  for (const l of bad) report.warn(`${l.node}: SRv6 locator ${l.name} prefix ${l.prefix ?? '-'} is no IPv6 prefix; left out`);
  const good = locators.filter((l) => !bad.includes(l));
  if (good.length) {
    const algos = [...new Set(good.map((l) => l.algorithm))].sort((x, y) => x - y);
    report.add('srv6', 'facts', `${good.length} SRv6 locators`, `on ${new Set(good.map((l) => l.node)).size} routers; algorithm ${algos.join(', ')} (a locator without a Flex-Algo is in algorithm 0, the IGP's SPF)`);
    report.add('srv6', 'derived', 'SRv6 SIDs', 'the facts carry locators, not SIDs: the view allocates the function in the 16 bits after the locator (End 0x0001, End.DX2 0xe000, End.DT2U 0xe100, End.DT2M 0xe200, plus the EVPN instance\'s ordinal on the device)');
  }
  return { locators: good };
}

// Flex-Algo definitions (schema 1.6), grouped by algorithm across devices.
function buildFlexAlgos(devices, nodes, report) {
  const shown = new Set(nodes.filter((n) => n.role !== 'ce').map((n) => n.id));
  const byAlgo = new Map();
  for (const [name, f] of devices) {
    if (!shown.has(name)) continue;
    for (const d of flexAlgorithms(f)) {
      const a = algorithmNumber(d.algorithm);
      if (!byAlgo.has(a)) byAlgo.set(a, []);
      const ag = d.admin_groups ?? {};
      byAlgo.get(a).push({ node: name, metricType: d.metric_type ?? 'igp', advertise: Boolean(d.advertise_definition), priority: num(d.priority), adminGroups: { includeAny: ag.include_any ?? [], includeAll: ag.include_all ?? [], excludeAny: ag.exclude_any ?? [] }, srlgExclude: d.srlg_exclude ?? [] });
    }
  }
  const algos = [...byAlgo].sort(([x], [y]) => x - y).map(([algorithm, definitions]) => ({ algorithm, definitions }));
  if (algos.length) {
    report.add('srv6', 'facts', `${algos.length} Flex-Algo${algos.length > 1 ? 's' : ''}`, algos.map((a) => `${a.algorithm}: defined on ${a.definitions.map((d) => d.node).join(', ')}, advertised by ${a.definitions.filter((d) => d.advertise).map((d) => d.node).join(', ') || 'none'}`).join('; '));
    report.add('srv6', 'derived', 'Flex-Algo participation', 'a router takes part in an algorithm when it configures a definition of it; the definition in use is the advertised one with the highest priority (128 where none is set), then the highest system id (RFC 9350 §5.3)');
    report.add('srv6', 'default', 'Flex-Algo link constraints', 'the facts carry no link affinities (admin groups) or link delays: no link is excluded and a latency or TE metric falls back to the IGP metric');
  }
  return algos;
}

// EVPN instances (schema 1.6), one per EVI across the devices that configure it.
function buildEvpn(devices, report) {
  const byEvi = new Map();
  for (const [name, f] of devices) {
    for (const e of evpnInstances(f)) {
      const evi = String(e.evi);
      if (!byEvi.has(evi)) byEvi.set(evi, { id: `evi:${evi}`, evi, type: e.type ?? null, members: [] });
      const g = byEvi.get(evi);
      if (e.type && g.type && e.type !== g.type) report.warn(`EVI ${evi}: ${g.type} on ${g.members[0]?.node} and ${e.type} on ${name}`);
      const fds = e.fds?.length ? e.fds : e.fd ? [e.fd] : [];
      const fp = (f.fps ?? []).find((x) => fds.includes(x.fd));
      g.members.push({
        node: name,
        fd: e.fd ?? fds[0] ?? null,
        ac: fp ? { port: fp.logical_port ?? null, name: fp.name } : { port: null, name: null },
        rd: e.route_distinguisher ?? null,
        routeTargets: (e.route_targets ?? []).map((t) => ({ rt: t.route_target, type: t.type ?? 'both' })),
        srv6Locator: e.srv6_locator ?? null,
        srPolicyColor: num(e.sr_policy_color),
        localServiceId: e.local_service_id ?? null,
        remoteServiceId: e.remote_service_id ?? null,
        controlWord: e.control_word ?? null,
        description: e.description ?? null,
      });
    }
  }
  const instances = [...byEvi.values()].sort((x, y) => naturalCompare(x.evi, y.evi));
  if (instances.length) {
    report.add('evpn', 'facts', `${instances.length} EVPN instances`, `${instances.map((i) => `EVI ${i.evi} ${(i.type ?? '?').toUpperCase()} on ${i.members.map((m) => m.node).join(', ')}`).join('; ')}: joined across devices by EVI; route targets, VPWS service ids and SRv6 locator as configured`);
    report.add('evpn', 'derived', 'EVPN route exchange', 'two members exchange EVPN routes over an Established iBGP session carrying l2vpn evpn, or through a route reflector with a session to both; the attachment circuit is the flow point on the instance\'s forwarding domain');
  }
  return instances;
}

// Linux hosts (schema 1.8): CE nodes with their addresses and static routes, and facts-like
// interfaces so buildLinks links them by subnet (their port is the attached interface's name, as the
// file's links[] cable it). A host named like a device with facts is left out.
function buildHosts(file, devices, report) {
  const nodes = [];
  const facts = new Map();
  const ignored = [];
  for (const h of factsHosts(file)) {
    if (devices.has(h.name)) {
      report.warn(`host ${h.name}: also a device with facts; the device is shown`);
      continue;
    }
    const addrs = h.interfaces.flatMap((i) => i.addresses);
    const routes = h.routes.filter((r) => r.next_hop).map((r) => ({ prefix: prefixOf(r.prefix), nextHop: r.next_hop, metric: r.metric ?? 0 }));
    routes.sort((x, y) => x.metric - y.metric);
    nodes.push({ id: h.name, role: 'ce', host: true, kind: h.kind ?? null, addresses: addrs.map((a) => ipSubnet(a)?.ip).filter(Boolean), routes, pos: { x: 0, z: 0 } });
    const interfaces = h.interfaces.filter((i) => i.addresses.length).map((i) => {
      const v4 = i.addresses.filter((a) => ipv4Subnet(a));
      const v6 = i.addresses.filter((a) => ipv6Subnet(a));
      return { name: i.name, kind: 'ip', ip: v4[0] ?? v6[0], ipv4: v4, ipv6: v6, vrf: null };
    });
    facts.set(h.name, { host: true, interfaces, ports: Object.fromEntries(h.interfaces.filter((i) => i.attached).map((i) => [i.name, i.name])) });
    if (h.ignored_commands.length) ignored.push(`${h.name}: ${h.ignored_commands.join('; ')}`);
  }
  if (nodes.length) {
    const sources = [...new Set(factsHosts(file).flatMap((h) => h.sources))].join(' and ');
    report.add('physical', 'facts', `${nodes.length} Linux hosts`, `${nodes.map((n) => n.id).join(', ')} from hosts[] (${sources}): CEs with their addresses and static routes (longest match, the lowest metric of equal prefixes); linked by subnet, else by the file's links[]`);
  }
  if (ignored.length) report.add('physical', 'facts', 'host exec lines not read', `${ignored.join(' | ')}: the extractor reads only ip addr add and ip route add|replace`);
  return { nodes, facts };
}

const FAMILIES = ['ipv4 unicast', 'ipv6 unicast'];

// One VRF interface as engine VRF members: a loopback's addresses as host routes, an IP interface's
// subnets with the link they are on.
function vrfInterfaces(name, f, v, links, report) {
  const out = [];
  for (const ifname of v.interfaces ?? []) {
    const i = (f.interfaces ?? []).find((x) => x.name === ifname);
    if (!i) continue;
    for (const cidr of [...v4Of(i), ...v6Of(i)]) {
      const s = ipSubnet(cidr);
      if (!s) continue;
      if (i.kind === 'loopback') {
        out.push({ name: ifname, kind: 'loopback', ip: s.ip, prefix: hostPrefix(s.ip) });
        continue;
      }
      const link = links.find((l) => [l.a, l.b].some((e) => e.node === name && e.if === ifname));
      out.push({ name: ifname, kind: 'ip', ip: s.ip, prefix: s.subnet, ...(link ? { link: link.id } : {}) });
    }
  }
  return out;
}

// VRFs (schema 1.7), joined across devices by name: one site per device, with what the engine's
// L3VPN needs (engine/bgp.js): RD, route targets per family, families, redistribution, label
// allocation, SRv6 locators, interfaces and static routes.
function buildVrfs(devices, nodes, links, report) {
  const routers = new Set(nodes.filter((n) => n.role !== 'ce').map((n) => n.id));
  const byName = new Map();
  for (const [name, f] of devices) {
    for (const v of vrfInstances(f)) {
      if (!routers.has(name)) {
        report.warn(`${name}: VRF ${v.name} on a device the view does not run the IGP on; left out`);
        continue;
      }
      if (!byName.has(v.name)) byName.set(v.name, { name: v.name, role: v.role ?? null, description: v.description ?? null, rt: { import: [], export: [] }, sites: [] });
      const g = byName.get(v.name);
      g.role ??= v.role ?? null;
      const rts = Object.fromEntries(FAMILIES.map((fam) => [fam, { import: vrfRouteTargets(v, fam, 'import'), export: vrfRouteTargets(v, fam, 'export') }]));
      const statics = staticRoutes(f, v.name).map((r) => ({
        prefix: prefixOf(r.prefix),
        nextHop: r.next_hop && r.next_hop !== 'blackhole' ? r.next_hop : null,
        preference: num(r.preference) ?? 1,
        discard: !r.next_hop || r.next_hop === 'blackhole' ? /^null0$/i.test(r.interface ?? '') || r.next_hop === 'blackhole' : false,
      }));
      g.sites.push({
        pe: name,
        rd: v.route_distinguisher ?? null,
        families: v.address_families ?? [],
        rts,
        redistribute: v.redistribute ?? {},
        labelAllocation: v.label_allocation ?? {},
        srv6Locators: v.srv6_locators ?? {},
        interfaces: vrfInterfaces(name, f, v, links, report),
        statics,
        ceBgpPeers: (f.peers ?? []).filter((p) => p.kind === 'bgp' && p.vrf === v.name).map((p) => ({ ip: p.ip, remoteAs: p.remote_as ?? null })),
      });
    }
  }
  const vrfs = [...byName.values()];
  if (vrfs.length) {
    report.add('vrf', 'facts', `${vrfs.length} VRFs`, vrfs.map((v) => `${v.name}${v.role === 'management' ? ' (management)' : ''} on ${v.sites.map((s) => `${s.pe} RD ${s.rd ?? '-'}`).join(', ')}`).join('; ') + ': joined across devices by name; route targets per address family, interfaces, static routes, label allocation and SRv6 locators as configured');
    report.add('vrf', 'derived', 'L3VPN route exchange', 'a PE exports its VRF\'s connected (interfaces, loopbacks) and static routes per address family BGP runs in the VRF, over iBGP sessions carrying vpnv4 / vpnv6 unicast (directly or through a route reflector); another PE imports a route into each VRF whose import route targets it carries (RFC 4364), best path per RFC 4271');
    const noRedis = vrfs.flatMap((v) => v.sites.filter((s) => !Object.keys(s.redistribute).length && s.families.length).map((s) => `${s.pe} ${v.name}`));
    if (noRedis.length) report.add('vrf', 'default', 'redistribution', `${noRedis.join(', ')}: no redistribute configured; the view exports connected and static routes`);
    const srv6 = vrfs.some((v) => v.sites.some((s) => Object.keys(s.srv6Locators).length));
    if (srv6) report.add('vrf', 'derived', 'SRv6 L3 service SIDs', 'the facts carry locators, not SIDs: per VRF and address family the view allocates End.DT4 (0xe300) or End.DT6 (0xe400) plus the VRF\'s ordinal on the device, in the 16 bits after the locator; the route\'s next hop resolves over the route to that locator (RFC 9252)');
    const labels = vrfs.some((v) => v.sites.some((s) => !Object.keys(s.srv6Locators).length || s.families.some((fam) => !s.srv6Locators[fam])));
    if (labels) report.add('vrf', 'derived', 'VPN labels', 'computed (RFC 4364): per VRF where label_allocation says per-vrf, else per prefix (the default); the next hop resolves over an LSP');
    const ce = vrfs.flatMap((v) => v.sites.flatMap((s) => s.ceBgpPeers.map((p) => `${s.pe} ${v.name} ${p.ip ?? '?'} AS ${p.remoteAs ?? '?'}`)));
    if (ce.length) report.add('vrf', 'default', 'PE-CE routing', `CE BGP neighbours (${ce.join(', ')}) are listed, not run: PE-CE routes are the VRF's connected and static routes`);
  }
  return vrfs;
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
  const hostNames = new Set(factsHosts(file).map((h) => h.name));
  for (const r of file.devices) if (!devices.has(r.device) && !hostNames.has(r.device)) report.warn(`${r.device}: ${r.status}${r.reason ? ` (${r.reason})` : ''}; not shown`);

  const igp = chooseIgp(devices, report);
  // The IS-IS level the view runs: the first instance's (level 1-2 runs as 2).
  const levels = [...new Set([...devices.values()].map((f) => levelNumber(f.isis?.instances?.[0]?.level)).filter(Boolean))];
  const nodes = buildNodes(devices, igp, report);
  const hostImport = buildHosts(file, devices, report);
  nodes.push(...hostImport.nodes);
  const links = buildLinks(devices, nodes, igp, levels[0] ?? 2, report, hostImport.facts);
  topologyLinks(file, links, nodes, report);
  const owner = ownerIndex(devices);
  const bgp = buildBgp(devices, owner, report);
  const srgb = srgbOf(devices, report);
  const srPolicies = buildSrPolicies(devices, report);
  const tpTunnels = buildTpTunnels(devices, links, report);
  const pseudowires = buildPseudowires(devices, owner, tpTunnels, report);
  const megs = buildCfm(devices, pseudowires, report);
  const rings = buildRings(devices, links, report);
  const srv6 = buildSrv6(devices, nodes, report);
  const flexAlgos = buildFlexAlgos(devices, nodes, report);
  const evpn = buildEvpn(devices, report);
  const vrfs = buildVrfs(devices, nodes, links, report);

  // Roles: a router is a PE when it has a service: it ends a pseudowire or an EVPN instance, has a
  // (customer) VRF, or faces a CE or host. Speaking BGP alone (a route reflector) or a management VRF
  // (a loopback for the DCN, on every node) leaves a transit router a P; a route reflector is marked.
  const edge = new Set([...pseudowires.flatMap((p) => p.ends.map((e) => e.node)), ...evpn.flatMap((i) => i.members.map((m) => m.node)), ...vrfs.filter((v) => v.role !== 'management').flatMap((v) => v.sites.map((s) => s.pe))]);
  for (const l of links) if (l.kind === 'access') for (const e of [l.a, l.b]) edge.add(e.node);
  for (const n of nodes) if (n.role !== 'ce' && edge.has(n.id)) n.role = 'pe';
  for (const n of nodes) if (n.role !== 'ce' && devices.get(n.id)?.bgp?.instances?.some((i) => i.route_reflector)) n.rr = true;
  report.add('physical', 'derived', 'roles', `CE: no ${igp === 'ospf' ? 'OSPF' : 'IS-IS'} and no MPLS-TP tunnel (a Linux host is a host); PE: a router with a service (it ends a pseudowire or an EVPN instance, has a VRF other than a management VRF, or faces a CE or host); P: the other routers, a BGP route reflector shown as P / RR`);

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
    vrfs,
    bgp: { sessions: bgp.sessions },
    srPolicies,
    tpTunnels,
    pseudowires,
    cfm: { linkMegs: false, megs },
    rings,
    srv6,
    flexAlgos,
    evpn,
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
