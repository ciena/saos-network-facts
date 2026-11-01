// SPDX-License-Identifier: Apache-2.0
// Which layers the viewer lists and draws: only those the loaded facts give something to draw
// (view/layers.js LAYERS[].has), for every published lab and a file a user loads, per layer; and the
// toggle state, kept only for layers that are shown.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';
import { LAYERS, peLsps, presentLayers, toggleState } from '../src/view/layers.js';
import { LABS } from '../labs.config.js';

const read = (source) => readFileSync(new URL(`../${source}`, import.meta.url), 'utf8');
const netOf = (input) => {
  const imp = importFacts(input);
  return buildNetwork(imp.topology, { labelMode: imp.labelMode });
};
const ids = (net) => presentLayers(net).map((l) => l.id);
const has = (id, net) => LAYERS.find((l) => l.id === id).has(net);

describe('every published lab lists only the layers it has', () => {
  const expected = {
    'adaptive-sr-cfm': ['physical', 'ring', 'isis', 'mpls', 'bgp', 'pw', 'cfm'],
    'g8032-two-ring': ['physical', 'ring'],
    'g8032-by-name': ['physical', 'ring'],
    'srv6-evpn': ['physical', 'isis', 'mpls', 'srv6', 'bgp', 'vrf', 'evpn'],
    'l3vpn-hosts': ['physical', 'isis', 'mpls', 'bgp', 'vrf'],
  };
  test('the lab index has exactly these labs', () => {
    expect(LABS.map((l) => l.id)).toEqual(Object.keys(expected));
  });
  for (const lab of LABS) {
    test(lab.id, () => {
      expect(ids(netOf(read(lab.source)))).toEqual(expected[lab.id]);
    });
  }
});

// A small user file: two SAOS 10 routers on one subnet, no IGP, nothing else.
function userFile() {
  const device = (name, ip) => ({
    device: name, type: '5164-10x', extractor: 'saos10', templates: [`${name}.cfg`], status: 'ok',
    facts: { hostname: name, interfaces: [{ name: 'to-peer', kind: 'ip', ip, ipv4: [ip] }], ports: {}, lags: [], vlans: [], peers: [], pseudowires: [], cfm: { meps: [] } },
  });
  return { schema_version: '1.8.0', generator: { name: 'test', version: '0', translator: null }, devices: [device('A', '192.0.2.0/31'), device('B', '192.0.2.1/31')] };
}

describe('a file a user loads', () => {
  test('two devices with only a subnet between them: the physical layer alone', () => {
    const net = netOf(userFile());
    expect(net.topo.links).toHaveLength(1);
    expect(ids(net)).toEqual(['physical']);
  });
});

describe('each layer appears exactly when it has something to draw', () => {
  const example = netOf(read('../examples/adaptive-sr-cfm/facts.json'));
  const srv6 = netOf(read('../tests/fixtures/expected/srv6-evpn.facts.json'));
  const l3vpn = netOf(read('../tests/fixtures/expected/l3vpn-hosts.facts.json'));
  const user = netOf(userFile());
  const without = (net, patch) => ({ ...net, ...patch });

  test('physical: any node', () => {
    expect(has('physical', user)).toBe(true);
    expect(has('physical', without(user, { topo: { ...user.topo, nodes: [] } }))).toBe(false);
  });
  test('G.8032 rings: a ring', () => {
    expect(has('ring', example)).toBe(true);
    expect(has('ring', l3vpn)).toBe(false);
  });
  test('IGP: a router running IS-IS or OSPF', () => {
    expect(has('isis', l3vpn)).toBe(true);
    expect(has('isis', user)).toBe(false);
  });
  test('MPLS: an MPLS-TP tunnel, an SR policy or an LSP between PEs', () => {
    expect(has('mpls', example)).toBe(true); // SR policies
    expect(peLsps(l3vpn).map((p) => `${p.src}>${p.dst}`)).toContain('PE1>PE2');
    expect(has('mpls', l3vpn)).toBe(true); // LSPs only
    expect(has('mpls', without(l3vpn, { mpls: { ...l3vpn.mpls, ftn: {} } }))).toBe(false);
    expect(has('mpls', user)).toBe(false);
  });
  test('SRv6: a locator or a Flex-Algo', () => {
    expect(has('srv6', srv6)).toBe(true);
    expect(has('srv6', l3vpn)).toBe(false);
  });
  test('BGP: a session', () => {
    expect(has('bgp', l3vpn)).toBe(true);
    expect(has('bgp', user)).toBe(false);
  });
  test('VRFs / L3VPN: a VRF', () => {
    expect(has('vrf', l3vpn)).toBe(true);
    expect(has('vrf', example)).toBe(false);
  });
  test('pseudowires: a pseudowire', () => {
    expect(has('pw', example)).toBe(true);
    expect(has('pw', srv6)).toBe(false);
  });
  test('EVPN: an instance', () => {
    expect(has('evpn', srv6)).toBe(true);
    expect(has('evpn', example)).toBe(false);
  });
  test('CFM: a MEG', () => {
    expect(has('cfm', example)).toBe(true);
    expect(has('cfm', l3vpn)).toBe(false);
  });
  test('every layer has a check', () => {
    expect(LAYERS.every((l) => typeof l.has === 'function')).toBe(true);
  });
  test('with no network loaded every layer is listed', () => {
    expect(presentLayers(null)).toEqual(LAYERS);
  });
});

describe('toggle state', () => {
  test('kept for layers shown, forgotten for the others', () => {
    const after = toggleState({ ring: false, bgp: false, cfm: false }, ['physical', 'ring', 'bgp']);
    expect(after.ring).toBe(false);
    expect(after.bgp).toBe(false);
    expect(after.cfm).toBe(true); // not in this network: comes back visible in the next one that has it
    expect(after.physical).toBe(true);
    expect(Object.keys(after)).toEqual(LAYERS.map((l) => l.id));
  });
});
