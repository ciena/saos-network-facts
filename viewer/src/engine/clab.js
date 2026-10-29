// SPDX-License-Identifier: Apache-2.0
// Containerlab topology import (nodes and links only; configs are ignored).
// https://containerlab.dev/manual/topo-def-file/
//
// Roles come from node names: ce* -> CE, pe* -> PE, anything else -> P; a
// router a CE attaches to is promoted to PE. Parallel links between the same
// two routers are bundled into one LAG. Addresses, system IDs, metrics and one
// L3VPN (CUST-A) joining every CE are generated deterministically.

import { parse } from 'yaml';

function roleOf(name) {
  if (/^ce/i.test(name)) return 'ce';
  if (/^pe/i.test(name)) return 'pe';
  return 'p';
}

function splitEndpoint(ep) {
  if (typeof ep === 'object' && ep) return { node: ep.node, if: ep.interface };
  const i = String(ep).indexOf(':');
  if (i < 0) throw new Error(`bad endpoint "${ep}" (want node:interface)`);
  return { node: ep.slice(0, i), if: ep.slice(i + 1) };
}

export function importClab(text) {
  const doc = parse(text);
  const t = doc?.topology;
  if (!t?.nodes) throw new Error('not a containerlab topology: missing topology.nodes');
  const warnings = [];
  const names = Object.keys(t.nodes);
  const nodes = names.map((id) => ({ id, role: roleOf(id) }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const raw = [];
  for (const l of t.links ?? []) {
    if (!Array.isArray(l.endpoints) || l.endpoints.length !== 2) {
      warnings.push(`skipped link without two endpoints: ${JSON.stringify(l)}`);
      continue;
    }
    const [a, b] = l.endpoints.map(splitEndpoint);
    if (!byId[a.node] || !byId[b.node]) {
      warnings.push(`skipped link to unknown node: ${a.node}-${b.node}`);
      continue;
    }
    if (byId[a.node].role === 'ce' && byId[b.node].role === 'ce') {
      warnings.push(`skipped CE-CE link ${a.node}-${b.node}`);
      continue;
    }
    raw.push(a.node <= b.node ? { a, b } : { a: b, b: a });
  }
  // A router with a CE attached is a PE.
  for (const { a, b } of raw) {
    for (const [x, y] of [[a, b], [b, a]]) {
      if (byId[x.node].role === 'ce' && byId[y.node].role === 'p') byId[y.node].role = 'pe';
    }
  }

  let r = 0;
  for (const n of nodes) {
    if (n.role === 'ce') continue;
    r++;
    n.loopback = `10.0.0.${r}`;
    n.systemId = `0000.0000.${String(r).padStart(4, '0')}`;
  }

  // Group parallel router-router links into LAGs.
  const groups = new Map();
  for (const l of raw) {
    const key = `${l.a.node}|${l.b.node}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(l);
  }
  const links = [];
  const lagCount = {};
  let core = 0;
  let acc = 0;
  let ceLan = 0;
  const sites = [];
  for (const [, group] of groups) {
    const { a, b } = group[0];
    const access = byId[a.node].role === 'ce' || byId[b.node].role === 'ce';
    const id = `${a.node}-${b.node}`;
    if (access) {
      for (const [i, l] of group.entries()) {
        acc++;
        const ce = byId[l.a.node].role === 'ce' ? l.a : l.b;
        const pe = ce === l.a ? l.b : l.a;
        const lid = group.length > 1 ? `${id}#${i + 1}` : id;
        const ceIp = `172.16.${acc}.1`;
        const peIp = `172.16.${acc}.2`;
        links.push({
          id: lid,
          kind: 'access',
          subnet: `172.16.${acc}.0/30`,
          lag: false,
          a: { node: l.a.node, if: l.a.if, ip: l.a === ce ? ceIp : peIp },
          b: { node: l.b.node, if: l.b.if, ip: l.b === ce ? ceIp : peIp },
          members: [{ id: lid, a: l.a.if, b: l.b.if }],
        });
        const ceNode = byId[ce.node];
        if (ceNode.lan) {
          warnings.push(`${ce.node}: multihomed CE, only the first attachment joins the VPN`);
          continue;
        }
        ceLan++;
        ceNode.lan = `192.168.${ceLan}.0/24`;
        const peNode = byId[pe.node];
        sites.push({ pe: pe.node, ce: ce.node, rd: `${peNode.loopback}:${ceLan}`, link: lid });
      }
      continue;
    }
    core++;
    const lag = group.length > 1;
    const ifName = (n) => `lag${(lagCount[n] = (lagCount[n] ?? 0) + 1)}`;
    links.push({
      id,
      kind: 'core',
      metric: 10,
      subnet: `10.1.${core}.0/31`,
      lag,
      a: { node: a.node, if: lag ? ifName(a.node) : a.if, ip: `10.1.${core}.0` },
      b: { node: b.node, if: lag ? ifName(b.node) : b.if, ip: `10.1.${core}.1` },
      members: group.map((l, i) => ({ id: lag ? `${id}/${i + 1}` : id, a: l.a.if, b: l.b.if })),
    });
  }

  const topo = {
    name: doc.name ? `${doc.name} (containerlab)` : 'containerlab import',
    asn: 65000,
    nodes,
    links,
    vrfs: sites.length ? [{ name: 'CUST-A', rt: { import: ['65000:100'], export: ['65000:100'] }, sites }] : [],
  };
  layout(topo);
  return { topology: topo, warnings };
}

// Deterministic layered layout: BFS from the first CE (or first node), one
// column per hop, nodes in a column spread along z.
export function layout(topo) {
  const start = topo.nodes.find((n) => n.role === 'ce') ?? topo.nodes[0];
  if (!start) return topo;
  const depth = { [start.id]: 0 };
  const queue = [start.id];
  while (queue.length) {
    const u = queue.shift();
    const nbrs = topo.links
      .filter((l) => l.a.node === u || l.b.node === u)
      .map((l) => (l.a.node === u ? l.b.node : l.a.node))
      .sort();
    for (const v of nbrs) {
      if (depth[v] === undefined) {
        depth[v] = depth[u] + 1;
        queue.push(v);
      }
    }
  }
  const maxD = Math.max(0, ...Object.values(depth));
  for (const n of topo.nodes) if (depth[n.id] === undefined) depth[n.id] = maxD + 1;
  const cols = {};
  for (const n of topo.nodes) (cols[depth[n.id]] ??= []).push(n);
  const nCols = Object.keys(cols).length;
  for (const [d, col] of Object.entries(cols)) {
    col.forEach((n, i) => {
      n.pos = { x: (Number(d) - (nCols - 1) / 2) * 10, z: (i - (col.length - 1) / 2) * 9 };
    });
  }
  return topo;
}
