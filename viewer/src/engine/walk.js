// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// Packet walks: step-by-step traces over a built network (see network.js).
//
// walk: { kind, title, layer, steps: [step] }
// step: { node, title, lookup?, actions: [string], headers: [header],
//         moves: [{ from, to, link, member, lost? }], status, t? }
// header: { name, fields: { ... } }   (outermost first)

import { inPrefix, longestMatch } from './ip.js';
import { selectMember } from './lag.js';
import { ends, ifOrdinal, nodeById, nodeOrdinal } from './topology.js';
import { floodLsp, lspId } from './isis.js';
import { ALL_SPF_ROUTERS, areaView, fmtSeq } from './ospf.js';
import { ACH_BFD_CC, GAL } from './mplstp.js';
import { buildUpdate, fsmToEstablished } from './bgp.js';
import { ccmGroupMac, ccmStream, fmtMs } from './cfm.js';
import { IMPLICIT_NULL } from './mpls.js';
import { imposeSr } from './srpolicy.js';

export const ETHERTYPE = { IPV4: '0x0800', MPLS: '0x8847', CFM: '0x8902' };
const IGP_NAME = { isis: 'IS-IS', ospf: 'OSPF' };
export const DEFAULT_FLOW = { src: '192.168.1.10', dst: '192.168.2.20', proto: 'UDP', sport: 49152, dport: 5001 };

function mac(net, nodeId, ifname) {
  return net.vendor.mac(nodeOrdinal(net.topo, nodeId), ifOrdinal(net.topo, nodeId, ifname));
}

// Pick one of several equal-cost next hops by flow hash (like the LAG distributor).
function pickNextHop(net, hops, flow) {
  if (hops.length === 1) return hops[0];
  return hops[net.vendor.lacp.hash(flow) % hops.length];
}

// Resolve the physical transmission for sending on `linkId` from `nodeId`.
function transmit(net, nodeId, linkId, flow) {
  const link = net.topo.links.find((l) => l.id === linkId);
  const { local, remote } = ends(link, nodeId);
  const state = net.links[linkId];
  const sel = selectMember(state, flow, net.vendor);
  return { link, local, remote, member: sel?.member ?? null, selection: link.lag ? sel : null };
}

function ethernet(net, tx, ethertype) {
  return {
    name: 'Ethernet II',
    fields: {
      dst: mac(net, tx.remote.node, tx.remote.if),
      src: mac(net, tx.local.node, tx.local.if),
      ethertype,
    },
  };
}

function packetHeaders(pkt) {
  const h = pkt.labels.map((l, i) => ({
    name: 'MPLS',
    fields: { label: l.label, tc: 0, s: i === pkt.labels.length - 1 ? 1 : 0, ttl: l.ttl, role: l.role },
  }));
  if (pkt.inner) {
    h.push(...pkt.inner); // an Ethernet frame carried by a pseudowire
  } else {
    h.push({ name: 'IPv4', fields: { src: pkt.ip.src, dst: pkt.ip.dst, ttl: pkt.ip.ttl, protocol: pkt.ip.proto } });
    const l4 = pkt.ip.proto === 'TCP' ? 'TCP' : 'UDP';
    h.push({ name: l4, fields: { sport: pkt.l4.sport, dport: pkt.l4.dport } });
  }
  if (pkt.app) h.push(pkt.app);
  return h;
}

function lagNote(tx) {
  if (!tx.selection) return [];
  const s = tx.selection;
  if (s.hash === null) return [`LAG ${tx.local.if}: one distributing member -> ${s.member}`];
  return [
    `LAG ${tx.local.if}: hash(5-tuple) = 0x${s.hash.toString(16).padStart(8, '0')} mod ${s.of} = ${s.index} -> member ${s.member}`,
  ];
}

function vrfOfArrival(net, nodeId, inLink) {
  for (const vrf of net.topo.vrfs ?? []) {
    if (vrf.sites.some((s) => s.pe === nodeId && (s.link === inLink || (s.interfaces ?? []).some((i) => i.link === inLink)))) return vrf.name;
  }
  return null;
}

// Addresses a node owns: its loopback, its link ends and its VRF interfaces.
function ownsAddress(net, nodeId, ip) {
  if (nodeById(net.topo, nodeId).loopback === ip) return true;
  if (net.topo.links.some((l) => [l.a, l.b].some((e) => e.node === nodeId && e.ip === ip))) return true;
  return (net.topo.vrfs ?? []).some((v) => v.sites.some((s) => s.pe === nodeId && (s.interfaces ?? []).some((i) => i.ip === ip)));
}

// An address inside the modeled lab: a link subnet, a loopback or a VRF member.
function inLab(net, ip) {
  if (net.topo.links.some((l) => l.subnet && inPrefix(ip, l.subnet))) return true;
  if (net.topo.nodes.some((n) => n.loopback === ip || (n.lan && inPrefix(ip, n.lan)))) return true;
  return (net.topo.vrfs ?? []).some((v) => v.sites.some((s) => (s.interfaces ?? []).some((i) => inPrefix(ip, i.prefix))));
}

// A host's routing: connected subnets of its up links, then its static routes
// (longest match); the next hop is the far end of the link it is on.
function hostLookup(net, nodeId, dst) {
  const node = nodeById(net.topo, nodeId);
  const mine = net.topo.links.filter((l) => l.a.node === nodeId || l.b.node === nodeId);
  const conn = mine.filter((l) => l.subnet && inPrefix(dst, l.subnet)).map((l) => ({ prefix: l.subnet, link: l, type: 'connected' }));
  const stat = (node.routes ?? []).filter((r) => inPrefix(dst, r.prefix)).map((r) => ({ ...r, link: mine.find((l) => l.subnet && inPrefix(r.nextHop, l.subnet)), type: 'static' }));
  const all = [...conn, ...stat].filter((r) => r.link).sort((x, y) => Number(y.prefix.split('/')[1]) - Number(x.prefix.split('/')[1]));
  return all[0] ?? null;
}

// Forward `pkt` starting at node `start` until delivered or dropped.
// ctx: { flow, inLink } ; returns steps.
// vrf: the VRF the packet starts in at `start` (a PE sourcing from a VRF).
export function forward(net, start, pkt, { flow, inLink = null, maxHops = 16, vrf: startVrf = null } = {}) {
  const steps = [];
  let nodeId = start;
  let arrived = inLink;
  for (let hop = 0; hop < maxHops; hop++) {
    const node = nodeById(net.topo, nodeId);
    const actions = [];
    let lookup = null;
    let vrf = hop === 0 && startVrf ? startVrf : node.role === 'pe' ? vrfOfArrival(net, nodeId, arrived) : null;
    let out = null; // { link, desc }
    const done = (status, title) => {
      steps.push({ node: nodeId, title, lookup, actions, headers: packetHeaders(pkt), moves: [], status });
      return steps;
    };

    // 0. MPLS-TP static LSPs (RFC 5960 §3): swap along the tunnel, or pop
    // at its end point and go on with the label below (the PW label).
    const tp = pkt.labels.length && node.role !== 'ce' ? net.tp?.lfib[nodeId]?.[pkt.labels[0].label] : null;
    if (tp) {
      const top = pkt.labels[0];
      const t = net.tp.tunnels.find((x) => x.id === tp.tunnel);
      const dir = tp.dir === 'fwd' ? 'forward' : 'reverse';
      const ttl = top.ttl - 1;
      lookup = { table: 'LFIB (MPLS-TP static)', key: `in-label ${top.label}`, result: `${tp.op} (tunnel ${t.id}, ${dir}${tp.next ? ` -> ${tp.next}` : ', end point'})` };
      if (tp.op === 'swap') {
        pkt.labels[0] = { ...top, label: tp.outLabel, ttl };
        actions.push(`swap ${top.label} -> ${tp.outLabel} (static ${dir} LSP of ${t.id}), TTL ${top.ttl} -> ${ttl}`);
        out = { link: tp.link, title: `Swap at ${nodeId} (MPLS-TP ${dir})` };
      } else {
        pkt.labels.shift();
        actions.push(`pop ${top.label}: ${dir} LSP of ${t.id} ends here (no PHP in MPLS-TP)`);
      }
    }

    // 1. Label switching (RFC 3031 §3.10-3.13): incoming label map.
    if (!out && pkt.labels.length && node.role !== 'ce') {
      const top = pkt.labels[0];
      const entry = net.mpls.lfib[nodeId]?.[top.label];
      const vpn = Object.entries(net.bgp.vrfs[nodeId] ?? {}).flatMap(([name, t]) =>
        Object.values(t)
          .filter((r) => r.type !== 'bgp' && r.vpnLabel === top.label)
          .map((r) => ({ vrf: name, route: r })),
      )[0];
      const pw = net.vpws?.pwLabels[nodeId]?.[top.label];
      if (entry) {
        const nh = pickNextHop(net, entry.nextHops, flow);
        const ttl = top.ttl - 1;
        lookup = { table: `LFIB (${net.mpls.mode.toUpperCase()})`, key: `in-label ${top.label}`, result: `${nh.op} -> ${nh.node} (FEC ${entry.fec})` };
        if (nh.op === 'swap') {
          pkt.labels[0] = { ...top, label: nh.outLabel, ttl };
          const verb = net.mpls.mode === 'sr' ? 'continue (swap)' : 'swap';
          actions.push(`${verb} ${top.label} -> ${nh.outLabel}, TTL ${top.ttl} -> ${ttl}`);
        } else {
          pkt.labels.shift();
          if (pkt.labels.length) pkt.labels[0] = { ...pkt.labels[0], ttl: Math.min(pkt.labels[0].ttl, ttl) };
          else if (pkt.ip) pkt.ip.ttl = Math.min(pkt.ip.ttl, ttl);
          actions.push(`pop ${top.label} (PHP: next hop advertised implicit-null)`);
        }
        out = { link: nh.link, title: `${nh.op === 'swap' ? 'Swap' : 'Pop (PHP)'} at ${nodeId}` };
      } else if (vpn) {
        const ttl = top.ttl - 1;
        pkt.labels.shift();
        pkt.ip.ttl = Math.min(pkt.ip.ttl, ttl);
        vrf = vpn.vrf;
        lookup = { table: 'LFIB (BGP VPN labels)', key: `in-label ${top.label}`, result: `pop, VRF ${vrf}` };
        actions.push(`pop VPN label ${top.label} (bottom of stack), continue in VRF ${vrf}`);
      } else if (pw) {
        // RFC 4448 §4.4.2: the PW label at the bottom of the stack identifies
        // the attachment circuit; pop it and send the frame out unchanged.
        const p = net.vpws.pseudowires.find((x) => x.id === pw.pw);
        const end = p.ends[pw.end];
        pkt.labels.shift();
        lookup = { table: `LFIB (${lookup ? 'MPLS-TP pop, then ' : ''}PW labels)`, key: `in-label ${top.label}`, result: `PW ${p.pwid} (${p.service}) -> AC ${end.ac.name} port ${end.ac.port}` };
        actions.push(`pop PW label ${top.label} (bottom of stack)`, `send the customer frame out on AC ${end.ac.name} (port ${end.ac.port})`);
        return done('delivered', `${nodeId} delivers on AC port ${end.ac.port}`);
      } else if (top.label === GAL && pkt.oam) {
        // RFC 5586 §4: GAL at the bottom of the stack: hand the G-ACh packet to OAM.
        pkt.labels.shift();
        lookup = { table: 'LFIB', key: `in-label ${GAL} (GAL)`, result: 'G-ACh: to the OAM end point' };
        actions.push(`pop GAL ${GAL}: Associated Channel ${pkt.oam}`);
        return done('delivered', `${nodeId} MEP receives the OAM packet`);
      } else {
        lookup = { table: 'LFIB', key: `in-label ${top.label}`, result: 'no entry' };
        actions.push('drop: unknown label');
        return done('dropped', `Drop at ${nodeId}`);
      }
    }

    // 2. IP lookup (VRF, CE or global table).
    if (!out && !pkt.ip) {
      actions.push('drop: label stack empty, no IP header');
      return done('dropped', `Drop at ${nodeId}`);
    }
    if (!out) {
      const dst = pkt.ip.dst;
      if (node.role === 'ce' && ownsAddress(net, nodeId, dst) && arrived) {
        lookup = { table: `${nodeId} RIB`, key: dst, result: 'local address' };
        actions.push('deliver to the local stack');
        return done('delivered', `Received by ${nodeId}`);
      }
      if (node.role === 'ce' && node.host) {
        const r = hostLookup(net, nodeId, dst);
        if (!r && arrived && !inLab(net, dst)) {
          // A gateway host hands traffic for the outside world on (the DCN
          // beyond it is not modeled).
          lookup = { table: `${nodeId} routes`, key: dst, result: 'not a lab address' };
          actions.push(`forward ${dst} out of the lab (beyond the modeled topology)`);
          return done('delivered', `${nodeId} forwards it out of the lab`);
        }
        if (!r) {
          lookup = { table: `${nodeId} routes`, key: dst, result: 'no route' };
          actions.push('drop: no route');
          return done('dropped', `Drop at ${nodeId}`);
        }
        const far = ends(r.link, nodeId).remote;
        lookup = { table: `${nodeId} routes`, key: dst, result: `${r.prefix} ${r.type === 'static' ? `via ${r.nextHop}` : 'connected'} (${far.node})` };
        pkt.ip.ttl -= 1;
        actions.push(`IP TTL -> ${pkt.ip.ttl}`);
        out = { link: r.link.id, title: `${nodeId} routes to ${far.node}` };
      } else if (node.role === 'ce') {
        if (node.lan && inPrefix(dst, node.lan)) {
          lookup = { table: `${nodeId} RIB`, key: dst, result: `${node.lan} connected` };
          pkt.ip.ttl -= 1;
          actions.push(`deliver on LAN ${node.lan}`);
          return done('delivered', `Delivered by ${nodeId}`);
        }
        const site = (net.topo.vrfs ?? []).flatMap((v) => v.sites).find((s) => s.ce === nodeId);
        if (!site) {
          actions.push('drop: no route');
          return done('dropped', `Drop at ${nodeId}`);
        }
        const link = net.topo.links.find((l) => l.id === site.link);
        lookup = { table: `${nodeId} RIB`, key: dst, result: `0.0.0.0/0 static via ${ends(link, nodeId).remote.ip} (${site.pe})` };
        pkt.ip.ttl -= 1;
        actions.push(`IP TTL -> ${pkt.ip.ttl}`);
        out = { link: link.id, title: `${nodeId} routes to ${site.pe}` };
      } else if (vrf) {
        const table = Object.values(net.bgp.vrfs[nodeId]?.[vrf] ?? {});
        const r = longestMatch(table, dst);
        if (!r) {
          lookup = { table: `VRF ${vrf}`, key: dst, result: 'no route' };
          actions.push('drop: no route in VRF');
          return done('dropped', `Drop at ${nodeId}`);
        }
        if (r.type === 'bgp') {
          const fec = `${r.nextHop}/32`;
          const ftn = net.mpls.ftn[nodeId][fec];
          const nh = pickNextHop(net, ftn.nextHops, flow);
          lookup = {
            table: `VRF ${vrf}`,
            key: dst,
            result: `${r.prefix} via BGP NH ${r.nextHop} VPN label ${r.vpnLabel}; FTN ${fec} -> ${nh.node}`,
          };
          pkt.ip.ttl -= 1;
          const ttl = pkt.ip.ttl; // uniform TTL model, RFC 3443 §3.1
          pkt.labels = [{ label: r.vpnLabel, ttl, role: 'VPN' }];
          actions.push(`push VPN label ${r.vpnLabel} (BGP, from ${r.from})`);
          if (nh.label !== 3) {
            pkt.labels.unshift({ label: nh.label, ttl, role: net.mpls.mode === 'sr' ? 'SR' : 'LDP' });
            actions.push(`push transport label ${nh.label} (${net.mpls.mode.toUpperCase()} FEC ${fec})`);
          } else {
            actions.push(`no transport label: ${nh.node} is the egress (implicit-null)`);
          }
          out = { link: nh.link, title: `${nodeId} VRF lookup, push labels` };
        } else if (r.type === 'local') {
          lookup = { table: `VRF ${vrf}`, key: dst, result: `${r.prefix} local (${r.if})` };
          actions.push(`deliver to the local stack in VRF ${vrf}`);
          return done('delivered', `Received by ${nodeId} (VRF ${vrf} ${r.if})`);
        } else {
          const st = r.type === 'static' ? ` ${r.via.ip} preference ${r.preference}${r.alternatives?.length > 1 ? ` (${r.alternatives.filter((a) => a.state !== 'active').map((a) => `${a.nextHop} pref ${a.preference} ${a.state}`).join(', ')})` : ''}` : '';
          lookup = { table: `VRF ${vrf}`, key: dst, result: `${r.prefix} ${r.type}${st} via ${r.via.node ?? '-'}` };
          if (!r.via.link) {
            actions.push('drop: the interface is not cabled');
            return done('dropped', `Drop at ${nodeId}`);
          }
          if (pkt.labels.length === 0 && !actions.length) pkt.ip.ttl -= 1;
          out = { link: r.via.link, title: `${nodeId} VRF ${vrf} -> ${r.via.node}` };
        }
      } else {
        const own = node.loopback === dst;
        if (own) {
          lookup = { table: `${nodeId} global RIB`, key: dst, result: 'local (loopback)' };
          actions.push('deliver to local stack');
          return done('delivered', `Received by ${nodeId}`);
        }
        const rib = Object.values(net.igp.rib[nodeId] ?? {});
        const r = longestMatch(rib, dst);
        if (!r || !r.nextHops.length) {
          lookup = { table: `${nodeId} global RIB`, key: dst, result: 'no route' };
          actions.push('drop: no route');
          return done('dropped', `Drop at ${nodeId}`);
        }
        const ftn = net.mpls.ftn[nodeId]?.[r.prefix];
        pkt.ip.ttl -= 1;
        if (ftn) {
          const nh = pickNextHop(net, ftn.nextHops, flow);
          lookup = { table: `${nodeId} global RIB + FTN`, key: dst, result: `${r.prefix} ${IGP_NAME[net.igpName]} metric ${r.metric} -> ${nh.node}` };
          if (nh.label !== 3) {
            pkt.labels = [{ label: nh.label, ttl: pkt.ip.ttl, role: net.mpls.mode === 'sr' ? 'SR' : 'LDP' }];
            actions.push(`push ${net.mpls.mode.toUpperCase()} label ${nh.label}`);
          }
          out = { link: nh.link, title: `${nodeId} routes into LSP` };
        } else {
          const nh = pickNextHop(net, r.nextHops, flow);
          lookup = { table: `${nodeId} global RIB`, key: dst, result: `${r.prefix} ${IGP_NAME[net.igpName]} metric ${r.metric} -> ${nh.node}` };
          out = { link: nh.link, title: `${nodeId} IP forward` };
        }
      }
    }

    const tx = transmit(net, nodeId, out.link, flow);
    actions.push(...lagNote(tx));
    const l2 = ethernet(net, tx, pkt.labels.length ? ETHERTYPE.MPLS : ETHERTYPE.IPV4);
    steps.push({
      node: nodeId,
      title: out.title,
      lookup,
      actions,
      headers: [l2, ...packetHeaders(pkt)],
      moves: [{ from: nodeId, to: tx.remote.node, link: tx.link.id, member: tx.member }],
      status: 'forward',
    });
    if (!net.links[tx.link.id].up) {
      steps.push({ node: nodeId, title: `Link ${tx.link.id} is down`, actions: ['drop'], headers: [], moves: [], status: 'dropped' });
      return steps;
    }
    arrived = tx.link.id;
    nodeId = tx.remote.node;
  }
  steps.push({ node: nodeId, title: 'TTL / hop limit exceeded', actions: ['drop'], headers: [], moves: [], status: 'dropped' });
  return steps;
}

function ceOf(net, ceId) {
  const n = nodeById(net.topo, ceId);
  if (n.role !== 'ce' || !n.lan) throw new Error(`${ceId} is not a CE with a LAN`);
  return n;
}

// Data plane: a UDP flow from a host behind CE `from` to a host behind CE `to`.
export function dataWalk(net, from = 'CE1', to = 'CE2', flowOverride = {}) {
  const src = ceOf(net, from);
  const dst = ceOf(net, to);
  const host = (lan, h) => lan.replace(/\.0\/\d+$/, `.${h}`);
  const flow = { ...DEFAULT_FLOW, src: host(src.lan, 10), dst: host(dst.lan, 20), ...flowOverride };
  const pkt = {
    ip: { src: flow.src, dst: flow.dst, ttl: 64, proto: flow.proto },
    l4: { sport: flow.sport, dport: flow.dport },
    labels: [],
  };
  const steps = forward(net, from, pkt, { flow });
  return {
    kind: 'data',
    layer: 'physical',
    title: `Data plane ${from} -> ${to} (L3VPN, ${net.mpls.mode.toUpperCase()})`,
    flow,
    steps,
    delivered: steps.at(-1).status === 'delivered',
  };
}

// Control plane: IS-IS LSP flood from `origin` (a refresh with seq + 1).
export function isisFloodWalk(net, origin = 'PE1') {
  const base = net.isis.lsps[origin];
  if (!base) throw new Error(`${origin} does not run IS-IS`);
  const lsp = { ...base, seq: base.seq + 1 };
  const node = nodeById(net.topo, origin);
  const level = net.topo.isis?.level ?? 2;
  const pduHeaders = (from, to, link) => {
    const l = net.topo.links.find((x) => x.id === link);
    const tx = transmit(net, from, l.id, { src: from, dst: to, proto: 'ISIS', sport: 0, dport: 0 });
    return [
      { name: 'IEEE 802.3', fields: { dst: '09:00:2b:00:00:05 (AllISs)', src: mac(net, from, tx.local.if), length: '(LLC + PDU)' } },
      { name: 'LLC', fields: { dsap: '0xfe', ssap: '0xfe', control: '0x03' } },
      { name: 'IS-IS', fields: { nlpid: '0x83', pduType: level === 1 ? '18 (L1 LSP)' : '20 (L2 LSP)', lspId: lsp.lspId, seq: `0x${lsp.seq.toString(16).padStart(8, '0')}`, lifetime: lsp.lifetime } },
      { name: 'TLV 22 Ext IS Reach', fields: Object.fromEntries(lsp.isReach.map((r) => [`${r.neighbor}.00`, `metric ${r.metric}`])) },
      { name: 'TLV 135 Ext IP Reach', fields: Object.fromEntries(lsp.ipReach.map((r) => [r.prefix, `metric ${r.metric}`])) },
    ];
  };
  const txs = floodLsp(net.isis, origin, lsp, net.vendor);
  const steps = [
    {
      node: origin,
      t: 0,
      title: `${origin} originates LSP ${lsp.lspId} seq ${lsp.seq}`,
      lookup: null,
      actions: [`${lspId(node)}: ${lsp.isReach.length} IS neighbours, ${lsp.ipReach.length} prefixes`, 'set SRM on every Up circuit'],
      headers: pduHeaders(origin, lsp.isReach[0]?.neighbor ?? origin, lsp.isReach[0]?.link ?? net.topo.links[0].id),
      moves: [],
      status: 'forward',
    },
  ];
  const rounds = [...new Set(txs.map((x) => x.t))];
  for (const t of rounds) {
    const now = txs.filter((x) => x.t === t);
    steps.push({
      node: now[0].from,
      t,
      title: `t=${t} ms: ${now.length} LSP transmission${now.length > 1 ? 's' : ''}`,
      lookup: { table: 'LSDB', key: lsp.lspId, result: now.map((x) => `${x.to}: ${x.result}`).join(', ') },
      actions: now.map((x) =>
        x.result === 'installed'
          ? `${x.from} -> ${x.to}: newer seq, install, ack (PSNP), flood on other circuits`
          : `${x.from} -> ${x.to}: same seq already held, ack (PSNP), discard`,
      ),
      headers: pduHeaders(now[0].from, now[0].to, now[0].link),
      moves: now.map((x) => ({ from: x.from, to: x.to, link: x.link, member: null, duplicate: x.result !== 'installed' })),
      status: 'forward',
    });
  }
  steps.push({
    node: origin,
    t: rounds.at(-1) ?? 0,
    title: 'Flood complete: LSDBs synchronized',
    actions: [`every router holds ${lsp.lspId} seq ${lsp.seq}`, 'SPF runs only if the LSP content changed'],
    headers: [],
    moves: [],
    status: 'delivered',
  });
  return { kind: 'isis', layer: 'isis', title: `IS-IS LSP flood from ${origin}`, steps, transmissions: txs };
}

// Control plane: BGP UPDATE for one VPN prefix from PE `from` to PE `to`,
// carried in TCP between loopbacks through the MPLS core.
export function bgpUpdateWalk(net, from = 'PE2', to = 'PE1', prefix = null) {
  const route = net.bgp.originated[from]?.find((r) => !prefix || r.prefix === prefix);
  if (!route) throw new Error(`${from} originates no VPN route${prefix ? ` for ${prefix}` : ''}`);
  const session = net.bgp.sessions.find((s) => (s.a === from && s.b === to) || (s.a === to && s.b === from));
  const update = buildUpdate(route);
  const app = { name: 'BGP UPDATE', fields: flattenUpdate(update) };
  const title = `BGP UPDATE ${from} -> ${to}: ${route.rd}:${route.prefix}`;
  const first = {
    node: from,
    title: `${from} exports ${route.prefix} from VRF ${route.vrf}`,
    lookup: { table: `VRF ${route.vrf}`, key: route.prefix, result: `${route.site.ce ?? 'PE-originated'} static/connected -> VPN-IPv4 ${route.rd}:${route.prefix}` },
    actions: [
      `allocate VPN label ${route.label} (per prefix)`,
      `attach RT ${route.rts.join(', ')}; NEXT_HOP ${route.nextHop} (own loopback)`,
      `session to ${to}: ${session?.state ?? 'none'}`,
    ],
    headers: [app],
    moves: [],
    status: 'forward',
  };
  if (!session || session.state !== 'Established') {
    return {
      kind: 'bgp',
      layer: 'bgp',
      title,
      steps: [{ ...first, status: 'dropped', actions: [...first.actions, 'not sent: session not Established', ...fsmToEstablished().map((s) => `needs ${s.from} -> ${s.to} on ${s.event}`)] }],
    };
  }
  const fromLo = nodeById(net.topo, from).loopback;
  const toLo = nodeById(net.topo, to).loopback;
  const flow = { src: fromLo, dst: toLo, proto: 'TCP', sport: 179, dport: 50000 };
  const pkt = { ip: { src: fromLo, dst: toLo, ttl: 255, proto: 'TCP' }, l4: { sport: 179, dport: 50000 }, labels: [], app };
  const fwd = forward(net, from, pkt, { flow });
  const last = fwd.at(-1);
  if (last.status === 'delivered') {
    const vrfName = route.vrf;
    const installed = Object.values(net.bgp.vrfs[to] ?? {}).flatMap((t) => Object.values(t)).find((r) => r.prefix === route.prefix && r.type === 'bgp');
    last.title = `${to} receives the UPDATE`;
    last.lookup = { table: 'Adj-RIB-In -> VRF import', key: `${route.rd}:${route.prefix}`, result: installed ? `best (${installed.reason}), installed` : 'not installed' };
    last.actions = [
      'TCP :179 to local stack, BGP state Established -> UpdateMsg (Event 27)',
      `RT ${route.rts.join(', ')} matches VRF import -> candidate in VRF ${vrfName}`,
      `NEXT_HOP ${route.nextHop} resolved via ${net.mpls.mode.toUpperCase()} LSP`,
      installed ? `VRF ${vrfName}: ${route.prefix} via ${route.nextHop}, VPN label ${installed.vpnLabel}` : 'next hop unresolvable: not installed',
    ];
  }
  return { kind: 'bgp', layer: 'bgp', title, steps: [first, ...fwd] };
}

function flattenUpdate(u) {
  const a = u.pathAttributes;
  const n = a.MP_REACH_NLRI.nlri[0];
  return {
    ORIGIN: a.ORIGIN,
    AS_PATH: a.AS_PATH,
    LOCAL_PREF: a.LOCAL_PREF,
    EXT_COMMUNITIES: a.EXTENDED_COMMUNITIES.join(' '),
    'MP_REACH AFI/SAFI': `${a.MP_REACH_NLRI.afi}/${a.MP_REACH_NLRI.safi}`,
    'MP_REACH next hop': a.MP_REACH_NLRI.nextHop,
    NLRI: `label ${n.label}, RD ${n.rd}, ${n.prefix}`,
  };
}

// Control plane: the CCM stream of one link MEG; optionally fail the link.
export function ccmWalk(net, megId = null, { count = 4, failAfter = null } = {}) {
  const meg = megId ? net.cfm.megs.find((m) => m.id === megId) : net.cfm.megs[0];
  if (!meg) throw new Error(`no MEG ${megId}`);
  if (meg.pseudowire) return serviceCcmWalk(net, meg);
  const iv = meg.intervalMs;
  const failAtMs = failAfter === null ? null : failAfter * iv;
  const durationMs = failAtMs === null ? count * iv : failAtMs + 4 * iv;
  const { events } = ccmStream(meg, { durationMs, failAtMs });
  const link = net.topo.links.find((l) => l.id === meg.link);
  const steps = events.map((e) => {
    if (e.kind === 'defect') {
      return {
        node: e.mep.node,
        t: e.t,
        title: `t=${fmtMs(e.t)}: ${e.mep.node} declares loss of continuity`,
        actions: [e.text, 'raise fault alarm; set RDI in transmitted CCMs; signal clients (IS-IS) the link is down'],
        headers: [],
        moves: [],
        status: 'dropped',
      };
    }
    const src = e.from;
    return {
      node: src.node,
      t: e.t,
      title: `t=${fmtMs(e.t)}: CCM seq ${e.seq} MEP ${src.mepId} (${src.node}) -> MEP ${e.to.mepId}${e.lost ? ' LOST' : ''}`,
      actions: [e.lost ? 'link failed: frame never arrives' : `${e.to.node} resets rMEPwhile (${fmtMs(3.5 * iv)})`, ...(e.rdi ? ['RDI set'] : [])],
      headers: [
        { name: 'Ethernet II', fields: { dst: ccmGroupMac(meg.level), src: mac(net, src.node, src.if), ethertype: ETHERTYPE.CFM } },
        {
          name: 'CFM CCM',
          fields: {
            mdLevel: meg.level,
            version: 0,
            opcode: '1 (CCM)',
            flags: `RDI=${e.rdi ? 1 : 0}, interval=${meg.intervalCode} (${fmtMs(iv)})`,
            sequence: e.seq,
            mepId: src.mepId,
            maid: `${meg.id}`,
          },
        },
      ],
      moves: [{ from: src.node, to: e.to.node, link: link.id, member: null, lost: e.lost }],
      status: e.lost ? 'dropped' : 'forward',
    };
  });
  return { kind: 'ccm', layer: 'cfm', title: `CCM stream on ${meg.id}${failAtMs !== null ? ' with link failure' : ''}`, meg, steps };
}

// ---- VPWS ------------------------------------------------------------------

// A customer frame entering pseudowire `pw` at end `i`: the ingress PE pushes
// the PW label and the transport (segment list or LSP label), then the frame
// is label switched to the egress PE, which pops the PW label onto its AC.
function pwForward(net, pw, i, inner) {
  const end = pw.ends[i];
  const node = end.node;
  const t = end.transport;
  const flow = { src: node, dst: end.peer, proto: 'ETH', sport: 0, dport: pw.pwid };
  const actions = [`frame in on AC ${end.ac.name} (port ${end.ac.port}): VPWS ${pw.service}, PW ${pw.pwid} to ${end.peer}`];
  const peerFec = `${nodeById(net.topo, end.peer).loopback}/32`;
  if (pw.state !== 'Up') {
    const lookup = { table: 'PW table', key: `PW ${pw.pwid}`, result: 'Down' };
    return [{ node, title: `${node}: PW ${pw.pwid} is down`, lookup, actions: [...actions, ...pw.reasons.map((r) => `down: ${r}`)], headers: inner, moves: [], status: 'dropped' }];
  }
  const ttl = 255;
  let stack;
  let nh;
  let lookup;
  if (t.kind === 'mpls-tp') {
    stack = t.stack;
    nh = { node: t.next, link: t.link };
    const tun = net.tp.tunnels.find((x) => x.id === t.tunnel);
    lookup = { table: 'PW -> MPLS-TP tunnel', key: `PW ${pw.pwid} (static)`, result: `tunnel ${t.tunnel} ${t.dir === 'fwd' ? 'forward' : 'reverse'} LSP, out label ${t.stack[0]} -> ${t.next}` };
    actions.push(`push static PW label ${end.remoteLabel} (configured transmit label)`, `push tunnel label ${t.stack[0]} (${t.dir === 'fwd' ? 'forward' : 'reverse'} LSP ${tun.ids.lspId})`);
    if (t.switched) actions.push(`protection: working tunnel ${t.configured} failed, sending on ${t.tunnel} (RFC 6378)`);
  } else if (t.kind === 'ldp') {
    nh = pickNextHop(net, net.mpls.ftn[node][peerFec].nextHops, flow);
    stack = nh.label === IMPLICIT_NULL ? [] : [nh.label];
    lookup = { table: 'FTN (LDP)', key: peerFec, result: `label ${nh.label === IMPLICIT_NULL ? 'implicit-null' : nh.label} -> ${nh.node}` };
    actions.push(`push PW label ${end.remoteLabel} (advertised by ${end.peer}, RFC 8077)`, stack.length ? `push LDP label ${stack[0]}` : `no transport label: ${nh.node} is the egress`);
  } else {
    const r = imposeSr(net.topo, net.mpls, net.vendor, node, t.stack, (hops) => pickNextHop(net, hops, flow));
    stack = r.stack;
    nh = r.nextHop;
    lookup =
      t.kind === 'sr-policy'
        ? { table: 'SR policy (RFC 9256)', key: `color ${end.color}, endpoint ${peerFec.split('/')[0]}`, result: `${t.policy}: segment list [${t.stack.join(', ')}]` }
        : { table: 'FTN (SR)', key: peerFec, result: `Prefix-SID ${t.stack[0]}` };
    actions.push(`push PW label ${end.remoteLabel} (advertised by ${end.peer}, RFC 8077)`, `push ${t.kind === 'sr-policy' ? 'segment list' : 'SID'} [${t.stack.join(', ')}]`);
    if (r.top !== undefined && stack.length < t.stack.length) actions.push(`top SID ${r.top} is ${r.target}, adjacent with PHP: not imposed`);
  }
  if (!nh) return [{ node, title: `${node}: no next hop`, lookup, actions: [...actions, 'drop'], headers: inner, moves: [], status: 'dropped' }];
  const role = t.kind === 'ldp' ? 'LDP' : t.kind === 'mpls-tp' ? 'TP' : 'SR';
  const pkt = { inner, labels: [...stack.map((label) => ({ label, ttl, role })), { label: end.remoteLabel, ttl, role: 'PW' }] };
  const tx = transmit(net, node, nh.link, flow);
  actions.push(...lagNote(tx));
  const first = {
    node,
    title: `${node} VPWS ${pw.service}: push PW + ${t.kind === 'sr-policy' ? 'SR policy' : t.kind === 'mpls-tp' ? 'MPLS-TP tunnel' : role} labels`,
    lookup,
    actions,
    headers: [ethernet(net, tx, ETHERTYPE.MPLS), ...packetHeaders(pkt)],
    moves: [{ from: node, to: tx.remote.node, link: tx.link.id, member: tx.member }],
    status: 'forward',
  };
  if (!net.links[tx.link.id].up) {
    return [first, { node, title: `Link ${tx.link.id} is down`, actions: ['drop'], headers: [], moves: [], status: 'dropped' }];
  }
  return [first, ...forward(net, tx.remote.node, pkt, { flow, inLink: tx.link.id })];
}

function pwEnd(pw, node) {
  const i = node ? pw.ends.findIndex((e) => e.node === node) : 0;
  if (i < 0) throw new Error(`${node} is not an end of PW ${pw.id}`);
  return i;
}

// Data plane: one customer frame over a VPWS pseudowire from end `from`.
export function vpwsWalk(net, pwId = null, from = null) {
  const pw = pwId ? net.vpws.pseudowires.find((p) => p.id === pwId) : net.vpws.pseudowires[0];
  if (!pw) throw new Error(`no pseudowire ${pwId}`);
  const i = pwEnd(pw, from);
  const end = pw.ends[i];
  const inner = [
    { name: 'Ethernet II (customer)', fields: { dst: '00:00:5e:00:53:02', src: '00:00:5e:00:53:01', ethertype: ETHERTYPE.IPV4 } },
    { name: 'Payload', fields: { classifier: 'untagged', note: 'carried unchanged (RFC 4448 raw mode, no control word)' } },
  ];
  const steps = pwForward(net, pw, i, inner);
  const via = end.transport.kind === 'sr-policy' ? `SR policy ${end.transport.policy}` : end.transport.kind === 'mpls-tp' ? `MPLS-TP tunnel ${end.transport.tunnel}` : (end.transport.kind ?? 'no transport').toUpperCase();
  return { kind: 'vpws', layer: 'physical', title: `VPWS ${pw.service} ${end.node} -> ${end.peer} over ${via}`, pw, steps, delivered: steps.at(-1).status === 'delivered' };
}

// CFM between the Up MEPs of a service MEG: CCM 1 from each MEP through the
// pseudowire (each direction on its own transport), then the stream summary.
function serviceCcmWalk(net, meg) {
  const pw = net.vpws.pseudowires.find((p) => p.id === meg.pseudowire);
  if (!pw) throw new Error(`MEG ${meg.id}: no pseudowire ${meg.pseudowire}`);
  const iv = meg.intervalMs;
  const steps = [];
  for (const [k, mep] of meg.meps.entries()) {
    const peer = meg.meps[1 - k];
    const i = pwEnd(pw, mep.node);
    const inner = [
      { name: 'Ethernet II', fields: { dst: ccmGroupMac(meg.level), src: mac(net, mep.node, mep.if), ethertype: ETHERTYPE.CFM } },
      {
        name: 'CFM CCM',
        fields: { mdLevel: meg.level, version: 0, opcode: '1 (CCM)', flags: `RDI=${mep.rdi ? 1 : 0}, interval=${meg.intervalCode} (${fmtMs(iv)})`, sequence: 1, mepId: mep.mepId, maid: meg.id },
      },
    ];
    const hop = pwForward(net, pw, i, inner);
    hop[0].title = `Up MEP ${mep.mepId} on ${mep.node} sends CCM 1 into ${pw.service}`;
    const last = hop.at(-1);
    if (last.status === 'delivered') {
      last.title = `MEP ${peer.mepId} on ${peer.node} receives CCM from MEP ${mep.mepId}`;
      last.actions.push(`MEP ${peer.mepId}: CCM from remote MEP ${mep.mepId}, level ${meg.level}, MAID ${meg.id} match -> reset rMEPwhile (${fmtMs(3.5 * iv)})`);
    }
    steps.push(...hop);
  }
  const paths = pw.ends.map((e) => (e.transport.path ? e.transport.path.join(' -> ') : e.transport.kind ?? 'none'));
  const defect = meg.meps.some((m) => m.defect);
  steps.push({
    node: meg.meps[0].node,
    title: defect ? 'Loss of continuity on both MEPs' : `CCMs every ${fmtMs(iv)} each way`,
    actions: [
      `MEP ${meg.meps[0].mepId} (${meg.meps[0].node}) <-> MEP ${meg.meps[1].mepId} (${meg.meps[1].node}), MD level ${meg.level}, Up MEPs on the ACs`,
      `transport per direction: ${pw.ends[0].node}: ${paths[0]}; ${pw.ends[1].node}: ${paths[1]}`,
      defect ? `no CCMs: ${pw.reasons.join('; ')} -> DefRemoteCCM after ${fmtMs(3.5 * iv)}` : `a MEP declares DefRemoteCCM after ${fmtMs(3.5 * iv)} without CCMs (802.1Q §20.20)`,
    ],
    headers: [],
    moves: [],
    status: defect ? 'dropped' : 'delivered',
  });
  return { kind: 'ccm', layer: 'cfm', title: `CCM between MEPs ${meg.meps.map((m) => m.mepId).join(' and ')} over VPWS ${pw.service}`, meg, steps };
}

// ---- OSPF --------------------------------------------------------------------

// Control plane: `origin` refreshes its Router-LSA in `area` (seq + 1) and
// floods it (RFC 2328 §13): LS Update to AllSPFRouters on each Full
// neighbour, installed if newer, acknowledged, flooded on.
export function ospfFloodWalk(net, origin = null, area = null) {
  const o = net.ospf;
  const from = origin ?? o.routers[0];
  if (!o.lsas[from]) throw new Error(`${from} does not run OSPF`);
  const ar = area ?? o.areas[from][0];
  const base = o.lsas[from][ar];
  if (!base) throw new Error(`${from} has no interface in area ${ar}`);
  const lsa = { ...base, seq: base.seq + 1 };
  const view = areaView(o, ar);
  const headers = (src, link) => {
    const l = net.topo.links.find((x) => x.id === link);
    const tx = l ? transmit(net, src, l.id, { src, dst: ALL_SPF_ROUTERS, proto: 'OSPF', sport: 0, dport: 0 }) : null;
    return [
      ...(tx ? [{ name: 'Ethernet II', fields: { dst: '01:00:5e:00:00:05', src: mac(net, src, tx.local.if), ethertype: ETHERTYPE.IPV4 } }] : []),
      { name: 'IPv4', fields: { src: tx?.local.ip ?? nodeById(net.topo, src).loopback, dst: `${ALL_SPF_ROUTERS} (AllSPFRouters)`, ttl: 1, protocol: '89 (OSPF)' } },
      { name: 'OSPF', fields: { version: 2, type: '4 (Link State Update)', routerId: nodeById(net.topo, src).routerId ?? nodeById(net.topo, src).loopback, areaId: ar, lsas: 1 } },
      { name: 'Router-LSA', fields: { lsAge: 1, lsType: '1 (Router-LSA)', linkStateId: lsa.lsId, advRouter: lsa.advRouter, seq: fmtSeq(lsa.seq), flags: lsa.abr ? 'B (area border)' : '-', links: lsa.links.length + lsa.stubs.length } },
      {
        name: 'Router-LSA links',
        fields: Object.fromEntries([
          ...lsa.links.map((x) => [`p2p ${x.linkId}`, `data ${x.linkData}, metric ${x.metric}`]),
          ...lsa.stubs.map((x) => [`stub ${x.prefix}`, `metric ${x.metric}`]),
        ]),
      },
    ];
  };
  const txs = floodLsp(view, from, lsa, net.vendor, net.vendor.ospf.floodHopDelayMs);
  const steps = [
    {
      node: from,
      t: 0,
      title: `${from} originates Router-LSA ${lsa.lsId} seq ${fmtSeq(lsa.seq)} (area ${ar})`,
      lookup: null,
      actions: [`${lsa.links.length} point-to-point links, ${lsa.stubs.length} stub networks`, 'send an LS Update on every Full adjacency in the area'],
      headers: headers(from, lsa.links[0]?.link),
      moves: [],
      status: 'forward',
    },
  ];
  for (const t of [...new Set(txs.map((x) => x.t))]) {
    const now = txs.filter((x) => x.t === t);
    steps.push({
      node: now[0].from,
      t,
      title: `t=${t} ms: ${now.length} LS Update${now.length > 1 ? 's' : ''}`,
      lookup: { table: `LSDB area ${ar}`, key: `Router-LSA ${lsa.lsId}`, result: now.map((x) => `${x.to}: ${x.result}`).join(', ') },
      actions: now.map((x) =>
        x.result === 'installed'
          ? `${x.from} -> ${x.to}: newer seq, install, LS Ack, flood out the other interfaces in area ${ar} (§13.3)`
          : `${x.from} -> ${x.to}: same instance already held, LS Ack, discard`,
      ),
      headers: headers(now[0].from, now[0].link),
      moves: now.map((x) => ({ from: x.from, to: x.to, link: x.link, member: null, duplicate: x.result !== 'installed' })),
      status: 'forward',
    });
  }
  steps.push({
    node: from,
    t: txs.at(-1)?.t ?? 0,
    title: `Flood complete: area ${ar} LSDBs synchronized`,
    actions: [`every router in area ${ar} holds Router-LSA ${lsa.lsId} seq ${fmtSeq(lsa.seq)}`, 'SPF runs only if the LSA content changed'],
    headers: [],
    moves: [],
    status: 'delivered',
  });
  return { kind: 'ospf', layer: 'isis', title: `OSPF Router-LSA flood from ${from} (area ${ar})`, steps, transmissions: txs };
}

// ---- MPLS-TP -----------------------------------------------------------------

// One proactive CC packet each way through tunnel `id` (RFC 6428 BFD CC on
// the G-ACh: LSP label over GAL 13): shows the static forward and reverse
// label tables hop by hop.
export function tpTunnelWalk(net, id = null) {
  const t = id ? net.tp.tunnels.find((x) => x.id === id) : net.tp.tunnels[0];
  if (!t) throw new Error(`no MPLS-TP tunnel ${id}`);
  const steps = [];
  for (const [end, dir] of [[t.src, 'fwd'], [t.dst, 'rev']]) {
    const peer = end === t.src ? t.dst : t.src;
    const h = net.tp.head[end]?.[t.id];
    const name = dir === 'fwd' ? 'forward' : 'reverse';
    const oam = `${ACH_BFD_CC} (BFD CC, RFC 6428), MEP ${t.ids.meps[end]} -> ${t.ids.meps[peer]}`;
    const app = { name: 'G-ACh BFD CC', fields: { ach: `0x1 ver 0, channel ${ACH_BFD_CC}`, myDiscr: t.ids.meps[end], yourDiscr: t.ids.meps[peer], interval: t.oam ? `${t.oam.intervalMs ?? net.vendor.bfd.intervalMs} ms` : '- (no OAM configured: shown for the label path)' } };
    if (!h) {
      steps.push({ node: end, title: `${end}: tunnel ${t.id} not installed (${t.admin})`, actions: t.reasons, headers: [], moves: [], status: 'dropped' });
      continue;
    }
    const pkt = { inner: [], labels: [{ label: h.outLabel, ttl: 255, role: 'TP' }, { label: GAL, ttl: 1, role: 'GAL' }], app, oam };
    const flow = { src: end, dst: peer, proto: 'TP', sport: 0, dport: 0 };
    const tx = transmit(net, end, h.link, flow);
    const first = {
      node: end,
      title: `${end} sends CC on the ${name} LSP of ${t.id}`,
      lookup: { table: 'MPLS-TP tunnel (static)', key: t.ids.lspId, result: `out label ${h.outLabel} -> ${h.next}` },
      actions: [`push GAL ${GAL} (G-ACh), push ${name} LSP label ${h.outLabel}`, ...lagNote(tx)],
      headers: [ethernet(net, tx, ETHERTYPE.MPLS), ...packetHeaders(pkt)],
      moves: [{ from: end, to: tx.remote.node, link: tx.link.id, member: tx.member }],
      status: 'forward',
    };
    steps.push(first);
    if (!net.links[tx.link.id].up) {
      steps.push({ node: end, title: `Link ${tx.link.id} is down`, actions: ['drop'], headers: [], moves: [], status: 'dropped' });
      continue;
    }
    steps.push(...forward(net, tx.remote.node, pkt, { flow, inLink: tx.link.id }));
  }
  const det = t.detectionMs === null ? 'no proactive OAM: only a local interface failure is seen' : `loss of continuity after ${fmtMs(t.detectionMs)} without CC`;
  steps.push({
    node: t.src,
    title: `Tunnel ${t.id}: ${t.state}`,
    actions: [`LSP_ID ${t.ids.lspId} (RFC 6370)`, `path ${t.path.join(' -> ')}, reverse on the same hops`, det, ...t.reasons],
    headers: [],
    moves: [],
    status: t.state === 'Up' ? 'delivered' : 'dropped',
  });
  return { kind: 'tp', layer: 'mpls', title: `MPLS-TP tunnel ${t.id}: ${t.src} <-> ${t.dst}`, tunnel: t, steps };
}

// ---- hosts -----------------------------------------------------------------------

// Data plane: an IP packet from host (or CE) `from` to address `dst`, e.g. a
// DCN gateway reaching a node's loopback in a VRF; or, with `vrf`, from PE
// `from`'s loopback in that VRF (e.g. a node's management traffic to the DCN).
export function hostWalk(net, from, dst, { vrf = null, ...flowOverride } = {}) {
  const node = nodeById(net.topo, from);
  if (node.role !== 'ce' && !vrf) throw new Error(`${from} is not a host or CE (give a VRF to source from a PE)`);
  const lo = vrf ? (net.topo.vrfs ?? []).find((v) => v.name === vrf)?.sites.find((s) => s.pe === from)?.interfaces?.find((i) => i.kind === 'loopback') : null;
  if (vrf && !lo) throw new Error(`${from} has no loopback in VRF ${vrf}`);
  const src = lo?.ip ?? net.topo.links.flatMap((l) => [l.a, l.b]).find((e) => e.node === from && e.ip)?.ip ?? node.lan?.replace(/\.0\/\d+$/, '.10');
  const flow = { ...DEFAULT_FLOW, src, dst, ...flowOverride };
  const pkt = { ip: { src, dst, ttl: 64, proto: flow.proto }, l4: { sport: flow.sport, dport: flow.dport }, labels: [] };
  const steps = forward(net, from, pkt, { flow, vrf });
  return { kind: 'host', layer: 'physical', title: `${from}${vrf ? ` (VRF ${vrf})` : ''} -> ${dst} (${net.mpls.mode.toUpperCase()})`, flow, steps, delivered: steps.at(-1).status === 'delivered' };
}

// Addresses a host walk can target: VRF loopbacks and interfaces, and hosts.
export function hostTargets(net) {
  const out = [];
  for (const v of net.topo.vrfs ?? []) for (const s of v.sites) for (const i of s.interfaces ?? []) if (i.kind === 'loopback') out.push({ ip: i.ip, label: `${s.pe} ${i.name} (VRF ${v.name})` });
  for (const n of net.topo.nodes.filter((x) => x.host)) for (const l of net.topo.links) for (const e of [l.a, l.b]) if (e.node === n.id && e.ip) out.push({ ip: e.ip, label: `${n.id} ${e.if}` });
  return out;
}
