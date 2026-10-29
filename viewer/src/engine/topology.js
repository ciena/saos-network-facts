// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// Topology model: nodes, links (every link has >= 1 physical member; a LAG has
// several), and L3VPN sites. Plain data, so it serializes and diffs cleanly.
//
// node: { id, role: 'ce' | 'pe' | 'p', loopback?, systemId?, lan?, pos: { x, z } }
// link: { id, kind: 'core' | 'access', metric, subnet, lag, a: end, b: end,
//         members: [{ id, a: ifname, b: ifname }] }
// end:  { node, if, ip }
// vrf:  { name, rt: { import, export }, sites: [{ pe, ce, rd, link }] }

export const ROLES = ['ce', 'pe', 'p'];

export function builtinTopology() {
  return {
    name: 'SP core (built-in)',
    asn: 65000,
    nodes: [
      { id: 'CE1', role: 'ce', lan: '192.168.1.0/24', pos: { x: -24, z: 0 } },
      { id: 'PE1', role: 'pe', loopback: '10.0.0.1', systemId: '0000.0000.0001', pos: { x: -13, z: 0 } },
      { id: 'P1', role: 'p', loopback: '10.0.0.2', systemId: '0000.0000.0002', pos: { x: -3, z: -5 } },
      { id: 'P2', role: 'p', loopback: '10.0.0.3', systemId: '0000.0000.0003', pos: { x: 7, z: -11 } },
      { id: 'PE2', role: 'pe', loopback: '10.0.0.4', systemId: '0000.0000.0004', pos: { x: 15, z: 0 } },
      { id: 'CE2', role: 'ce', lan: '192.168.2.0/24', pos: { x: 26, z: 0 } },
    ],
    links: [
      access('CE1-PE1', 'CE1', 'eth1', '172.16.1.1', 'PE1', 'eth1', '172.16.1.2', '172.16.1.0/30'),
      {
        id: 'PE1-P1',
        kind: 'core',
        metric: 10,
        subnet: '10.1.1.0/31',
        lag: true,
        a: { node: 'PE1', if: 'lag1', ip: '10.1.1.0' },
        b: { node: 'P1', if: 'lag1', ip: '10.1.1.1' },
        members: [
          { id: 'PE1-P1/1', a: 'eth2', b: 'eth1' },
          { id: 'PE1-P1/2', a: 'eth3', b: 'eth2' },
        ],
      },
      core('P1-P2', 'P1', 'eth3', '10.1.2.0', 'P2', 'eth1', '10.1.2.1', '10.1.2.0/31', 10),
      core('P2-PE2', 'P2', 'eth2', '10.1.3.0', 'PE2', 'eth1', '10.1.3.1', '10.1.3.0/31', 10),
      // Cross link: the failover path when P1-P2 or P2-PE2 fails.
      core('P1-PE2', 'P1', 'eth4', '10.1.4.0', 'PE2', 'eth2', '10.1.4.1', '10.1.4.0/31', 30),
      access('PE2-CE2', 'PE2', 'eth3', '172.16.2.2', 'CE2', 'eth1', '172.16.2.1', '172.16.2.0/30'),
    ],
    vrfs: [
      {
        name: 'CUST-A',
        rt: { import: ['65000:100'], export: ['65000:100'] },
        sites: [
          { pe: 'PE1', ce: 'CE1', rd: '10.0.0.1:1', link: 'CE1-PE1' },
          { pe: 'PE2', ce: 'CE2', rd: '10.0.0.4:1', link: 'PE2-CE2' },
        ],
      },
    ],
  };
}

function core(id, an, aif, aip, bn, bif, bip, subnet, metric) {
  return {
    id,
    kind: 'core',
    metric,
    subnet,
    lag: false,
    a: { node: an, if: aif, ip: aip },
    b: { node: bn, if: bif, ip: bip },
    members: [{ id, a: aif, b: bif }],
  };
}

function access(id, an, aif, aip, bn, bif, bip, subnet) {
  return { ...core(id, an, aif, aip, bn, bif, bip, subnet, 0), kind: 'access', metric: undefined };
}

export function nodeById(topo, id) {
  const n = topo.nodes.find((x) => x.id === id);
  if (!n) throw new Error(`unknown node ${id}`);
  return n;
}

export function nodeOrdinal(topo, id) {
  return topo.nodes.findIndex((x) => x.id === id) + 1;
}

export function linksOf(topo, nodeId) {
  return topo.links.filter((l) => l.a.node === nodeId || l.b.node === nodeId);
}

// The two ends of a link seen from `nodeId`: { local, remote }.
export function ends(link, nodeId) {
  if (link.a.node === nodeId) return { local: link.a, remote: link.b, localSide: 'a' };
  if (link.b.node === nodeId) return { local: link.b, remote: link.a, localSide: 'b' };
  throw new Error(`${nodeId} is not on link ${link.id}`);
}

export function linkBetween(topo, x, y) {
  return topo.links.filter(
    (l) => (l.a.node === x && l.b.node === y) || (l.a.node === y && l.b.node === x),
  );
}

// Interface ordinal (1-based) of an interface name on a node, for MAC derivation.
export function ifOrdinal(topo, nodeId, ifname) {
  const names = [];
  for (const l of linksOf(topo, nodeId)) {
    const side = ends(l, nodeId).localSide;
    names.push(l[side].if);
    for (const m of l.members) names.push(m[side]);
  }
  const uniq = [...new Set(names)].sort();
  return uniq.indexOf(ifname) + 1;
}

export function validateTopology(topo) {
  const errors = [];
  const ids = new Set();
  for (const n of topo.nodes) {
    if (ids.has(n.id)) errors.push(`duplicate node ${n.id}`);
    ids.add(n.id);
    if (!ROLES.includes(n.role)) errors.push(`${n.id}: bad role ${n.role}`);
    if (n.role !== 'ce' && !n.loopback) errors.push(`${n.id}: router without loopback`);
  }
  for (const l of topo.links) {
    for (const e of [l.a, l.b]) if (!ids.has(e.node)) errors.push(`${l.id}: unknown node ${e.node}`);
    if (!l.members?.length) errors.push(`${l.id}: no members`);
  }
  return errors;
}
