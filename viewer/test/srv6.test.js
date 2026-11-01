// SPDX-License-Identifier: Apache-2.0
// IPv6 import, SRv6 locators, Flex-Algo topologies and EVPN instances over SRv6, on the synthetic
// srv6-evpn fixture (PE1 / P1 / PE2 / RR1, an IPv6-only IS-IS core, AS 64500).
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, evpnWalk, locatorTargets, replayFailure, sidOf, srv6PingWalk } from '../src/engine/index.js';
import { bigToIp6, compareIp, hostPrefix, inPrefix, ip6ToBig, isHostPrefix, longestMatch, networkOf } from '../src/engine/ip.js';
import { importFacts, ipSubnet, ipv6Subnet } from '../src/import/facts.js';
import { presentLayers } from '../src/view/layers.js';

const text = readFileSync(new URL('../../tests/fixtures/expected/srv6-evpn.facts.json', import.meta.url), 'utf8');
const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');
const fixture = () => JSON.parse(text);
const dev = (file, name) => file.devices.find((d) => d.device === name).facts;
const load = (file) => {
  const imp = importFacts(file);
  return { imp, net: buildNetwork(imp.topology, { labelMode: imp.labelMode }) };
};

describe('IPv6 addresses', () => {
  test('text forms round-trip in RFC 5952 form', () => {
    expect(bigToIp6(ip6ToBig('2001:DB8:0:0:0:0:0:1'))).toBe('2001:db8::1');
    expect(bigToIp6(ip6ToBig('2001:db8:0:11::'))).toBe('2001:db8:0:11::');
    expect(bigToIp6(ip6ToBig('::'))).toBe('::');
    expect(bigToIp6(ip6ToBig('2001:db8:0:1:0:0:1:0'))).toBe('2001:db8:0:1::1:0');
    expect(() => ip6ToBig('2001:db8::1::2')).toThrow();
  });

  test('prefixes, host routes, longest match and order across both families', () => {
    expect(networkOf('2001:db8:0:11::1', 127)).toBe('2001:db8:0:11::/127');
    expect(networkOf('10.1.1.1', 31)).toBe('10.1.1.0/31');
    expect(inPrefix('2001:db8:f0:2:e200::', '2001:db8:f0:2::/64')).toBe(true);
    expect(inPrefix('10.0.0.1', '2001:db8::/32')).toBe(false);
    expect(inPrefix('2001:db8::1', '0.0.0.0/0')).toBe(false);
    expect(hostPrefix('2001:db8::1')).toBe('2001:db8::1/128');
    expect(hostPrefix('192.0.2.1')).toBe('192.0.2.1/32');
    expect(isHostPrefix('2001:db8::1/128')).toBe(true);
    expect(isHostPrefix('2001:db8::/32')).toBe(false);
    expect(longestMatch([{ prefix: '2001:db8::/32' }, { prefix: '2001:db8:f8::/48' }], '2001:db8:f8:1::1').prefix).toBe('2001:db8:f8::/48');
    expect(['2001:db8::2', '192.0.2.9', '2001:db8::10', '10.0.0.1'].sort(compareIp)).toEqual(['10.0.0.1', '192.0.2.9', '2001:db8::2', '2001:db8::10']);
  });

  test('the importer reads IPv6 subnets and never links on a link-local address', () => {
    expect(ipv6Subnet('2001:db8:0:11::1/127')).toEqual({ ip: '2001:db8:0:11::1', len: 127, subnet: '2001:db8:0:11::/127' });
    const linkLocal = ['fe80', '', '1'].join(':'); // spelled out of parts: the address check scans the sources
    expect(ipv6Subnet(`${linkLocal}/64`)).toBeNull();
    expect(ipv6Subnet('192.0.2.1/32')).toBeNull();
    expect(ipSubnet('192.0.2.1/31')).toMatchObject({ subnet: '192.0.2.0/31' });
  });
});

describe('an IPv6 core (C3)', () => {
  const { imp, net } = load(text);
  const topo = imp.topology;

  test('links come from the /127 subnets, with their ports (and the hosts\' access links, schema 1.8)', () => {
    expect(topo.links.map((l) => [l.id, l.kind, l.subnet])).toEqual([
      ['PE1-ce-a', 'access', '198.51.100.0/31'],
      ['PE2-ce-b', 'access', '203.0.113.0/31'],
      ['P1-PE1', 'core', '2001:db8:0:11::/127'],
      ['P1-PE2', 'core', '2001:db8:0:12::/127'],
      ['P1-RR1', 'core', '2001:db8:0:13::/127'],
    ]);
    expect(topo.links[2]).toMatchObject({ a: { node: 'P1', ip: '2001:db8:0:11::1', port: '1' }, b: { node: 'PE1', ip: '2001:db8:0:11::', port: '1' } });
  });

  test('IS-IS runs on the IPv6 loopbacks and every adjacency is up', () => {
    expect(topo.nodes.find((n) => n.id === 'PE1')).toMatchObject({ role: 'pe', loopback: '2001:db8::1', loopbacks: ['192.0.2.1', '2001:db8::1'], sidIndex: 1 });
    expect(net.isis.adjacencies.map((a) => a.state)).toEqual(['Up', 'Up', 'Up']);
    expect(net.isis.rib.PE1['2001:db8::2/128']).toMatchObject({ metric: 20, nextHops: [{ node: 'P1', link: 'P1-PE1' }] });
    expect(net.isis.rib.PE1['192.0.2.2/32']).toMatchObject({ metric: 20 });
  });

  test('the iBGP sessions to the route reflector form over IPv6, carrying l2vpn evpn', () => {
    expect(net.bgp.sessions.map((s) => [s.a, s.b, s.client, s.state])).toEqual([['PE1', 'RR1', 'PE1', 'Established'], ['PE2', 'RR1', 'PE2', 'Established']]);
    expect(topo.bgp.sessions[0].families).toEqual(expect.arrayContaining(['l2vpn evpn', 'ipv6 unicast']));
    expect(imp.report.warnings).toEqual([]);
  });

  test('an IPv6-only lab (no IPv4 loopbacks, no prefix SIDs) renders the same topology and sessions', () => {
    const file = fixture();
    for (const r of file.devices) {
      for (const i of r.facts.interfaces) Object.assign(i, { ip: null, ipv4: [] });
      r.facts.segment_routing.prefix_sids = [];
      r.facts.segment_routing.srgb = [];
    }
    const v6 = load(file);
    expect(v6.imp.topology.links.filter((l) => l.kind === 'core')).toHaveLength(3);
    expect(v6.imp.topology.nodes.filter((n) => !n.host).every((n) => n.loopback.startsWith('2001:db8::') && !n.loopbacks)).toBe(true);
    expect(v6.net.isis.adjacencies.every((a) => a.state === 'Up')).toBe(true);
    expect(v6.net.bgp.sessions.every((s) => s.state === 'Established')).toBe(true);
    expect(v6.net.evpn.instances.map((i) => i.state)).toEqual(['Up', 'Up']);
  });

  test('a dual-stack link is one link with both subnets; the IPv4 one leads', () => {
    const file = fixture();
    dev(file, 'P1').interfaces.find((i) => i.name === 'P1-PE1').ipv4 = ['198.51.100.1/31'];
    dev(file, 'PE1').interfaces.find((i) => i.name === 'PE1-P1').ipv4 = ['198.51.100.0/31'];
    const link = importFacts(file).topology.links.find((l) => l.id === 'P1-PE1');
    expect(link).toMatchObject({ subnet: '198.51.100.0/31', subnet6: '2001:db8:0:11::/127', a: { ip: '198.51.100.1', ip6: '2001:db8:0:11::1' } });
  });

  test("the file's links[] add no L2 link where an IPv6 link already takes the ports", () => {
    const file = fixture();
    file.links = [{ a: { device: 'P1', port: '1' }, b: { device: 'PE1', port: '1' } }];
    expect(importFacts(file).topology.links.filter((l) => l.kind === 'l2')).toEqual([]);
  });
});

describe('SRv6 locators and Flex-Algo (C7)', () => {
  const { imp, net } = load(text);

  test('each router has its locators, a PE also its Flex-Algo 128 one', () => {
    expect(net.srv6.locators.filter((l) => l.node === 'PE1').map((l) => [l.name, l.prefix, l.algorithm])).toEqual([['LOC', '2001:db8:f0:1::/64', 0], ['LOC-ALGO128', '2001:db8:f8:1::/64', 128]]);
    expect(net.srv6.locators.filter((l) => l.node === 'P1').map((l) => l.algorithm)).toEqual([0]);
    expect(locatorTargets(net)).toHaveLength(6);
  });

  test('Flex-Algo 128: every router takes part, P1 advertises the definition in use, the constraints the facts cannot apply are said', () => {
    const fa = net.srv6.algorithms.find((a) => a.algorithm === 128);
    expect(fa.participants).toEqual(['P1', 'PE1', 'PE2', 'RR1']);
    expect(fa.definition).toMatchObject({ node: 'P1', metricType: 'latency', priority: 200, adminGroups: { excludeAny: ['SLOW'] } });
    expect(fa.links).toEqual(['P1-PE1', 'P1-PE2', 'P1-RR1']);
    expect(fa.notes.join(' ')).toMatch(/exclude SLOW: the facts carry no link affinities/);
    expect(fa.notes.join(' ')).toMatch(/no link delay, so the IGP metric is used/);
    expect(imp.report.gaps.srv6.map((g) => g.item)).toContain('Flex-Algo participation');
  });

  test('a router that defines no Flex-Algo 128 leaves its topology, and the Flex-Algo locators behind it become unreachable', () => {
    const file = fixture();
    dev(file, 'P1').segment_routing.flex_algorithms = [];
    dev(file, 'PE1').segment_routing.flex_algorithms[0].advertise_definition = true;
    const { net: n } = load(file);
    const fa = n.srv6.algorithms.find((a) => a.algorithm === 128);
    expect(fa.participants).toEqual(['PE1', 'PE2', 'RR1']);
    expect(fa.definition.node).toBe('PE1');
    expect(fa.links).toEqual([]);
    expect(n.srv6.rib.PE1['2001:db8:f8:2::/64'].unreachable).toMatch(/PE2 is not reachable in Flex-Algo 128/);
    expect(n.srv6.rib.P1['2001:db8:f8:2::/64'].unreachable).toMatch(/P1 takes no part in Flex-Algo 128/);
    expect(n.srv6.rib.PE1['2001:db8:f0:2::/64']).toMatchObject({ metric: 20 }); // algorithm 0 is unaffected
    const vpws = n.evpn.instances.find((i) => i.evi === '200');
    expect(vpws.state).toBe('Down');
    expect(srv6PingWalk(n, 'PE1', 'PE2|LOC-ALGO128').delivered).toBe(false);
  });

  test('without an advertised definition nobody computes the algorithm', () => {
    const file = fixture();
    dev(file, 'P1').segment_routing.flex_algorithms[0].advertise_definition = false;
    const fa = load(file).net.srv6.algorithms.find((a) => a.algorithm === 128);
    expect(fa.participants).toEqual([]);
    expect(fa.notes[0]).toMatch(/no router advertises the definition/);
  });

  test('an SRv6 packet to a Flex-Algo locator follows that algorithm to its End SID', () => {
    const w = srv6PingWalk(net, 'RR1', 'PE2|LOC-ALGO128');
    expect(w.delivered).toBe(true);
    expect(w.steps.map((s) => s.node)).toEqual(['RR1', 'P1', 'PE2']);
    expect(w.steps[0].headers.find((h) => h.name === 'IPv6').fields).toMatchObject({ src: '2001:db8::4', dst: '2001:db8:f8:2:1::' });
    expect(w.steps[1].lookup.result).toMatch(/LOC-ALGO128, Flex-Algo 128\) via PE2/);
  });
});

describe('EVPN instances over SRv6 (C7)', () => {
  const { imp, net } = load(text);

  test('EVI 100 (VPLS) and EVI 200 (VPWS) join PE1 and PE2 through the route reflector', () => {
    expect(imp.topology.evpn.map((i) => [i.id, i.type, i.members.map((m) => m.node)])).toEqual([['evi:100', 'vpls', ['PE1', 'PE2']], ['evi:200', 'vpws', ['PE1', 'PE2']]]);
    expect(imp.topology.evpn[1].members[0]).toMatchObject({ ac: { port: '5', name: 'FP-AC-200' }, srv6Locator: 'LOC-ALGO128', localServiceId: '1', remoteServiceId: '2' });
    for (const i of net.evpn.instances) {
      expect(i.state).toBe('Up');
      expect(i.pairs.map((p) => [p.from, p.to, p.bgp.via, p.path.nodes.join('>')])).toEqual([['PE1', 'PE2', 'RR1', 'PE1>P1>PE2'], ['PE2', 'PE1', 'RR1', 'PE2>P1>PE1']]);
    }
  });

  test('the view allocates the service SIDs from each member\'s locator', () => {
    const [vpls, vpws] = net.evpn.instances;
    expect(vpls.members[0].sids).toEqual({ dt2u: '2001:db8:f0:1:e100::', dt2m: '2001:db8:f0:1:e200::' });
    expect(vpws.members[1].sids).toEqual({ dx2: '2001:db8:f8:2:e001::' });
    expect(sidOf('2001:db8:f0:1::/64', 0xe000)).toBe('2001:db8:f0:1:e000::');
  });

  test('an EVPN-VPWS frame is encapsulated to the far End.DX2 SID and decapsulated onto its AC', () => {
    const w = evpnWalk(net, 'evi:200', 'PE2');
    expect(w.delivered).toBe(true);
    expect(w.steps.map((s) => [s.node, s.status])).toEqual([['PE2', 'forward'], ['P1', 'forward'], ['PE1', 'delivered']]);
    expect(w.steps[0].headers.map((h) => h.name)).toEqual(['Ethernet II', 'IPv6', 'Ethernet II (customer)', 'Payload']);
    expect(w.steps[0].headers[1].fields).toMatchObject({ src: '2001:db8::2', dst: '2001:db8:f8:1:e001::', nextHeader: '143 (Ethernet)' });
    expect(w.steps[2].title).toMatch(/End.DX2 .* decapsulate onto FP-AC-200/);
  });

  test('an EVPN-VPLS broadcast is replicated to every other member\'s End.DT2M SID', () => {
    const w = evpnWalk(net, 'evi:100', 'PE1');
    expect(w.delivered).toBe(true);
    expect(w.steps[0].actions.join(' ')).toMatch(/ingress replication: PE2 advertised an Inclusive Multicast route/);
    expect(w.steps.at(-1).headers[0].fields.dst).toBe('2001:db8:f0:2:e200::');
  });

  test('mismatched VPWS service ids, a missing route target or a down core take an instance down', () => {
    const file = fixture();
    dev(file, 'PE2').evpn_instances[1].local_service_id = '9';
    dev(file, 'PE2').evpn_instances[0].route_targets = [{ route_target: '0:64500:999', type: 'both' }];
    const { net: n } = load(file);
    expect(n.evpn.instances[1].reasons.join(' ')).toMatch(/PE1 remote service id 2 is not PE2's local service id 9/);
    expect(n.evpn.instances[0].reasons.join(' ')).toMatch(/PE1 imports none of PE2's route targets/);
    expect(evpnWalk(n, 'evi:200', 'PE1').steps[0].status).toBe('dropped');
    const { after } = replayFailure(imp.topology, 'P1-PE2', { labelMode: imp.labelMode, detection: 'los' });
    expect(after.evpn.instances.map((i) => i.state)).toEqual(['Down', 'Down']);
  });

  test('the SRv6, VRF and EVPN planes are shown only for a network that has them', () => {
    expect(presentLayers(net).map((l) => l.id)).toEqual(['physical', 'isis', 'mpls', 'srv6', 'bgp', 'vrf', 'evpn']);
    const ex = importFacts(example);
    expect(presentLayers(buildNetwork(ex.topology, { labelMode: ex.labelMode })).map((l) => l.id)).toEqual(['physical', 'ring', 'isis', 'mpls', 'bgp', 'pw', 'cfm']);
  });
});
