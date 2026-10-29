// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { importClab } from '../src/engine/clab.js';
import { buildNetwork } from '../src/engine/network.js';
import { dataWalk } from '../src/engine/walk.js';

// The built-in SP core as a containerlab topology (nodes and links only).
// Two links between pe1 and p1 import as a 2-member LAG.
const example = `
name: sp-core
topology:
  nodes:
    ce1: { kind: linux, image: alpine:3 }
    pe1: { kind: linux, image: frrouting/frr:v8.4.1 }
    p1: { kind: linux, image: frrouting/frr:v8.4.1 }
    p2: { kind: linux, image: frrouting/frr:v8.4.1 }
    pe2: { kind: linux, image: frrouting/frr:v8.4.1 }
    ce2: { kind: linux, image: alpine:3 }
  links:
    - endpoints: ["ce1:eth1", "pe1:eth1"]
    - endpoints: ["pe1:eth2", "p1:eth1"]
    - endpoints: ["pe1:eth3", "p1:eth2"]
    - endpoints: ["p1:eth3", "p2:eth1"]
    - endpoints: ["p2:eth2", "pe2:eth1"]
    - endpoints: ["p1:eth4", "pe2:eth2"]
    - endpoints: ["pe2:eth3", "ce2:eth1"]
`;

describe('containerlab import', () => {
  const { topology, warnings } = importClab(example);

  test('takes nodes and links, roles from names', () => {
    expect(warnings).toEqual([]);
    expect(topology.nodes.map((n) => `${n.id}:${n.role}`)).toEqual(['ce1:ce', 'pe1:pe', 'p1:p', 'p2:p', 'pe2:pe', 'ce2:ce']);
  });

  test('bundles parallel router links into a LAG', () => {
    const lag = topology.links.find((l) => l.lag);
    expect(lag.id).toBe('p1-pe1');
    expect(lag.members.map((m) => m.id)).toEqual(['p1-pe1/1', 'p1-pe1/2']);
  });

  test('builds a working L3VPN between the CEs', () => {
    expect(topology.vrfs[0].sites.map((s) => `${s.ce}@${s.pe}`)).toEqual(['ce1@pe1', 'ce2@pe2']);
    expect(dataWalk(buildNetwork(topology), 'ce1', 'ce2').delivered).toBe(true);
  });

  test('accepts the extended endpoint syntax and reports bad links', () => {
    const { topology: t, warnings: w } = importClab(`
topology:
  nodes: { pe1: {}, p1: {} }
  links:
    - endpoints: [{ node: pe1, interface: e1 }, { node: p1, interface: e1 }]
    - endpoints: ["pe1:e2", "ghost:e1"]
`);
    expect(t.links.map((l) => l.id)).toEqual(['p1-pe1']);
    expect(w).toEqual(['skipped link to unknown node: pe1-ghost']);
  });

  test('rejects a file that is not a containerlab topology', () => {
    expect(() => importClab('name: x')).toThrow(/topology.nodes/);
  });
});
