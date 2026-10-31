// SPDX-License-Identifier: Apache-2.0
// SRv6 walks (see srv6.js): an IPv6 packet from a router to a locator's End SID along the
// locator's algorithm (IGP SPF or Flex-Algo), and a customer frame over an EVPN instance:
// EVPN-VPWS encapsulated to the far end's End.DX2 SID, EVPN-VPLS flooded by ingress replication
// to every other member's End.DT2M SID (RFC 9252 §6, RFC 8986 §4.9-4.11, H.Encaps.L2.Red §5.2).
// Each transit router forwards on the outer destination by longest match over the locators.

import { SRV6_FUNCTIONS, locatorRoute, sidOf } from './srv6.js';
import { nodeById } from './topology.js';
import { ETHERTYPE, ethernet, lagNote, pickNextHop, transmit } from './walk.js';

const HOP_LIMIT = 64;
const NEXT_HEADER = { ethernet: '143 (Ethernet)', none: '59 (No Next Header)' };
const SID_NAME = { dx2: 'End.DX2', dt2u: 'End.DT2U', dt2m: 'End.DT2M', end: 'End' };

function ipv6(src, dst, hopLimit, nextHeader) {
  return { name: 'IPv6', fields: { src, dst, hopLimit, nextHeader } };
}

// Forward an IPv6 packet whose outer destination is `dst` from `start` (which already sent it
// on `inLink`, or sends it now when inLink is null) to the router owning the locator, hop by hop.
// `inner`: the headers inside the outer IPv6 header; `deliver(node)`: the step at the owner.
function forwardIpv6(net, start, { src, dst, nextHeader, inner, flow, deliver, label }) {
  const steps = [];
  let node = start;
  let hopLimit = HOP_LIMIT;
  for (let i = 0; i < 16; i++) {
    const r = locatorRoute(net.srv6, node, dst);
    const lookup = { table: `${node} IPv6 RIB (SRv6 locators)`, key: dst, result: !r ? 'no route' : r.unreachable ? `${r.prefix}: ${r.unreachable}` : r.local ? `${r.prefix} local locator ${r.locator}` : `${r.prefix} (${r.locator}, ${r.algorithm ? `Flex-Algo ${r.algorithm}` : 'algorithm 0'}) via ${r.nextHops.map((h) => h.node).join(', ')} metric ${r.metric}` };
    if (!r || r.unreachable) {
      steps.push({ node, title: `${node}: no route to ${dst}`, lookup, actions: ['drop'], headers: [ipv6(src, dst, hopLimit, nextHeader), ...inner], moves: [], status: 'dropped' });
      return steps;
    }
    if (r.local) {
      steps.push({ ...deliver(node, lookup, hopLimit), node });
      return steps;
    }
    const nh = pickNextHop(net, r.nextHops, flow);
    const tx = transmit(net, node, nh.link, flow);
    const actions = i === 0 ? [] : [`hop limit ${hopLimit} -> ${hopLimit - 1}`];
    if (i > 0) hopLimit -= 1;
    actions.push(`forward on ${tx.local.if} to ${tx.remote.node}`, ...lagNote(tx));
    steps.push({
      node,
      title: i === 0 ? `${node}: ${label}` : `${node}: IPv6 forward to ${r.locator}${r.algorithm ? ` (Flex-Algo ${r.algorithm})` : ''}`,
      lookup,
      actions: i === 0 ? [...(flow.ingress ?? []), ...actions] : actions,
      headers: [ethernet(net, tx, ETHERTYPE.IPV6), ipv6(src, dst, hopLimit, nextHeader), ...inner],
      moves: [{ from: node, to: tx.remote.node, link: tx.link.id, member: tx.member }],
      status: 'forward',
    });
    if (!net.links[tx.link.id].up) {
      steps.push({ node, title: `Link ${tx.link.id} is down`, actions: ['drop'], headers: [], moves: [], status: 'dropped' });
      return steps;
    }
    node = tx.remote.node;
  }
  steps.push({ node, title: 'hop limit exceeded', actions: ['drop'], headers: [], moves: [], status: 'dropped' });
  return steps;
}

// Every locator of the network as { value, label } choices for a walk.
export function locatorTargets(net) {
  return net.srv6.locators.map((l) => ({ value: `${l.node}|${l.name}`, label: `${l.node} ${l.name} ${l.prefix}${l.algorithm ? ` (Flex-Algo ${l.algorithm})` : ''}` }));
}

// An IPv6 packet (an echo request) from router `from`'s loopback to the End SID of `locator`
// (`node|name`), along the locator's algorithm.
export function srv6PingWalk(net, from, locator) {
  const [owner, name] = String(locator).split('|');
  const loc = net.srv6.locators.find((l) => l.node === owner && l.name === name);
  if (!loc) throw new Error(`no SRv6 locator ${locator}`);
  const src = nodeById(net.topo, from).loopback;
  const dst = sidOf(loc.prefix, SRV6_FUNCTIONS.end);
  const flow = { src, dst, proto: 'ICMPv6', sport: 0, dport: 0 };
  const inner = [{ name: 'ICMPv6', fields: { type: '128 (Echo Request)' } }];
  const steps = forwardIpv6(net, from, {
    src, dst, nextHeader: '58 (ICMPv6)', inner, flow,
    label: `echo request to ${loc.name} End SID ${dst}`,
    deliver: (node, lookup, hopLimit) => ({
      title: `${node}: End SID of ${loc.name} is local: echo reply`,
      lookup: { ...lookup, result: `local SID ${dst} (End, RFC 8986 §4.1)` },
      actions: ['no segment routing header: the destination is this node\'s End SID', 'answer with an echo reply'],
      headers: [ipv6(src, dst, hopLimit, '58 (ICMPv6)'), ...inner],
      moves: [],
      status: 'delivered',
    }),
  });
  const algo = loc.algorithm ? `Flex-Algo ${loc.algorithm}` : 'algorithm 0';
  return { kind: 'srv6', layer: 'srv6', title: `SRv6 ${from} -> ${owner} ${loc.name} (${algo})`, steps, delivered: steps.at(-1).status === 'delivered' };
}

// A customer frame entering EVPN instance `id` (`evi:<n>`) at member `from`: EVPN-VPWS to the other
// end's End.DX2 SID; EVPN-VPLS (a broadcast or unknown unicast frame) one copy per other member,
// to its End.DT2M SID.
export function evpnWalk(net, id, from = null) {
  const inst = net.evpn.instances.find((i) => i.id === id || i.evi === String(id));
  if (!inst) throw new Error(`no EVPN instance ${id}`);
  const me = from ? inst.members.find((m) => m.node === from) : inst.members[0];
  if (!me) throw new Error(`${from} is not a member of EVI ${inst.evi}`);
  const vpls = inst.type === 'vpls';
  const customer = [
    { name: 'Ethernet II (customer)', fields: { dst: vpls ? 'ff:ff:ff:ff:ff:ff' : '00:00:5e:00:53:02', src: '00:00:5e:00:53:01', ethertype: ETHERTYPE.IPV4 } },
    { name: 'Payload', fields: { note: vpls ? 'a broadcast: flooded to every member (BUM)' : 'carried unchanged' } },
  ];
  const ingress = [`frame in on AC ${me.ac.name ?? '-'} (port ${me.ac.port ?? '-'}): forwarding domain ${me.fd ?? '-'}, EVI ${inst.evi} ${vpls ? 'EVPN-VPLS' : 'EVPN-VPWS'}`];
  const title = `EVPN ${vpls ? 'VPLS' : 'VPWS'} EVI ${inst.evi} from ${me.node}`;
  if (inst.state !== 'Up') {
    const steps = [{ node: me.node, title: `${me.node}: EVI ${inst.evi} is down`, lookup: { table: 'EVPN instances', key: `EVI ${inst.evi}`, result: 'Down' }, actions: [...ingress, ...inst.reasons.map((r) => `down: ${r}`)], headers: customer, moves: [], status: 'dropped' }];
    return { kind: 'evpn', layer: 'srv6', title, steps, delivered: false };
  }
  const targets = inst.members.filter((m) => m !== me);
  const steps = [];
  for (const [k, far] of targets.entries()) {
    const kind = vpls ? 'dt2m' : 'dx2';
    const sid = far.sids[kind];
    const src = nodeById(net.topo, me.node).loopback;
    const copy = vpls && targets.length > 1 ? ` (copy ${k + 1} of ${targets.length})` : '';
    const how = vpls
      ? `ingress replication: ${far.node} advertised an Inclusive Multicast route (type 3) with End.DT2M SID ${sid}`
      : `${far.node} advertised an Ethernet A-D per EVI route (type 1) for service id ${far.localServiceId ?? '-'} with End.DX2 SID ${sid}`;
    const flow = { src, dst: sid, proto: 'ETH', sport: Number(inst.evi) || 0, dport: k, ingress: [...ingress, how, `H.Encaps.L2.Red: outer IPv6 ${src} -> ${sid}, next header Ethernet (RFC 8986 §5.2)`] };
    steps.push(...forwardIpv6(net, me.node, {
      src, dst: sid, nextHeader: NEXT_HEADER.ethernet, inner: customer, flow,
      label: `EVI ${inst.evi} -> ${far.node}${copy}: encapsulate to ${SID_NAME[kind]} ${sid}`,
      deliver: (node, lookup, hopLimit) => ({
        title: `${node}: ${SID_NAME[kind]} SID ${sid}, decapsulate onto ${far.ac.name ?? 'the AC'}`,
        lookup: { ...lookup, result: `local SID ${sid} (${SID_NAME[kind]}, EVI ${inst.evi})` },
        actions: [`remove the outer IPv6 header (${SID_NAME[kind]}, RFC 8986 ${kind === 'dx2' ? '§4.9' : '§4.11'})`, vpls ? `flood in forwarding domain ${far.fd ?? '-'}, not back to the core (split horizon)` : `cross-connect to forwarding domain ${far.fd ?? '-'}`, `frame out on AC ${far.ac.name ?? '-'} (port ${far.ac.port ?? '-'})`],
        headers: [ipv6(src, sid, hopLimit, NEXT_HEADER.ethernet), ...customer],
        moves: [],
        status: 'delivered',
      }),
    }));
  }
  return { kind: 'evpn', layer: 'srv6', title, instance: inst, steps, delivered: steps.length > 0 && steps.filter((s) => s.status === 'delivered').length === targets.length };
}
