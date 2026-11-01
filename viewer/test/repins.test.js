// SPDX-License-Identifier: Apache-2.0
// The defects the 0.11.0 consumer re-pins found, on synthetic repros: the global and empty VRFs (V1), a
// management VRF without a role (V2), and two hosts sharing a subnet across a VPWS (L3).
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, hostWalk } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';
import { presentLayers } from '../src/view/layers.js';

const read = (name) => readFileSync(new URL(`../../tests/fixtures/expected/${name}.facts.json`, import.meta.url), 'utf8');
const load = (file) => {
  const imp = importFacts(file);
  return { imp, net: buildNetwork(imp.topology, { labelMode: imp.labelMode }) };
};
const facts = (file, name) => file.devices.find((d) => d.device === name).facts;
const vrf = (name, extra = {}) => ({
  name, description: null, role: null, bgp_as: null, route_distinguisher: null, address_families: [], route_targets: [],
  srv6_locators: {}, srv6_locator_address: null, srv6_sid_type: null, sr_policy_color: null, label_allocation: {},
  redistribute: {}, interfaces: [], ...extra,
});

// l3vpn-hosts as a consumer's facts can look: the management VRF without a role, the global `default`
// VRF listed on every router, and bare VRFs (a name only) on PE2.
export function vrfRepro() {
  const file = JSON.parse(read('l3vpn-hosts'));
  for (const d of ['PE1', 'P1', 'PE2']) {
    const f = facts(file, d);
    f.vrf_instances.find((v) => v.name === 'MGMT').role = null;
    f.vrf_instances.unshift(vrf('default', { bgp_as: '64500' }));
  }
  facts(file, 'PE2').vrf_instances.push(vrf('vlan501'), vrf('vlan502'));
  return file;
}

describe('V1: the global and empty VRFs are not L3VPNs', () => {
  const { imp, net } = load(vrfRepro());
  test('default and the bare vlan50x VRFs are neither listed nor drawn', () => {
    expect(net.l3vpn.vrfs.map((v) => v.name)).toEqual(['BLUE', 'MGMT']);
    expect(net.l3vpn.vrfs.every((v) => v.state === 'Up')).toBe(true);
    const item = imp.report.gaps.vrf.find((g) => g.item === '3 VRFs left out');
    expect(item.detail).toContain('default (the global table; PE1, P1, PE2)');
    expect(item.detail).toContain('vlan501 (no route distinguisher, route target, interface or static route; PE2)');
  });
  test('they make no router a PE', () => {
    expect(imp.topology.nodes.find((n) => n.id === 'P1')).toMatchObject({ role: 'p', rr: true });
  });
  test('a VRF with interfaces but no RD (VRF-lite) is still listed', () => {
    const file = vrfRepro();
    facts(file, 'PE2').vrf_instances.find((v) => v.name === 'vlan501').interfaces = ['TO-H2'];
    expect(load(file).net.l3vpn.vrfs.map((v) => v.name)).toContain('vlan501');
  });
});

describe('V2: a management VRF without a role', () => {
  const { imp, net } = load(vrfRepro());
  test('is recognised by use: loopbacks, DCN gateway interfaces and default statics only', () => {
    const mgmt = net.l3vpn.vrfs.find((v) => v.name === 'MGMT');
    expect(mgmt).toMatchObject({ role: 'management', roleFrom: 'use' });
    expect(imp.report.gaps.vrf.some((g) => g.item === 'management VRFs by use')).toBe(true);
    expect(imp.topology.nodes.filter((n) => !n.host).map((n) => [n.id, n.role])).toEqual([['PE1', 'pe'], ['P1', 'p'], ['PE2', 'pe']]);
  });
  test('the name alone does not count: a VRF named MGMT used for a customer stays a service', () => {
    const file = vrfRepro();
    // BLUE renamed MGMT2: a customer VRF (interfaces to hosts, no loopback) is no management VRF
    for (const d of ['PE1', 'PE2']) facts(file, d).vrf_instances.find((v) => v.name === 'BLUE').name = 'MGMT2';
    const x = load(file);
    expect(x.net.l3vpn.vrfs.find((v) => v.name === 'MGMT2').role).toBe(null);
  });
  test('a role in the facts wins over use', () => {
    const file = vrfRepro();
    for (const d of ['PE1', 'P1', 'PE2']) facts(file, d).vrf_instances.find((v) => v.name === 'MGMT').role = 'data';
    const x = load(file);
    expect(x.net.l3vpn.vrfs.find((v) => v.name === 'MGMT')).toMatchObject({ role: 'data', roleFrom: 'facts' });
    expect(x.imp.topology.nodes.find((n) => n.id === 'P1').role).toBe('pe');
  });
  test('a VRF with a static route other than a default is not management by use', () => {
    const file = vrfRepro();
    facts(file, 'PE1').static_routes.push({ vrf: 'MGMT', prefix: '192.168.99.0/24', family: 'ipv4', next_hop: '10.60.255.1', interface: null, preference: null, tag: null, description: null });
    expect(load(file).net.l3vpn.vrfs.find((v) => v.name === 'MGMT').role).toBe(null);
  });
});

describe('L3: hosts sharing a subnet across a VPWS', () => {
  const { imp, net } = load(read('vpws-hosts'));
  test('only the cables are drawn, no host-to-host link', () => {
    // (PE1-PE2 is an access link: the view does not read SAOS 6 IS-IS interfaces yet)
    expect(imp.topology.links.map((l) => [l.id, l.kind])).toEqual([['PE1-PE2', 'access'], ['PE1-c1', 'l2'], ['PE2-c2', 'l2']]);
    expect(imp.report.gaps.physical.find((g) => g.item === '1 host subnets across an L2 service').detail).toContain('c1 and c2 (192.168.50.0/24)');
  });
  test('the PEs (containerlab kind linux, SAOS 6) are devices with the pseudowire; the hosts are hosts', () => {
    expect(imp.topology.nodes.map((n) => [n.id, n.host ? 'host' : n.role])).toEqual([['PE1', 'pe'], ['PE2', 'pe'], ['c1', 'host'], ['c2', 'host']]);
    expect(net.vpws.pseudowires.map((p) => p.pwid)).toEqual([300]);
    expect(presentLayers(net).map((l) => l.id)).toContain('pw');
  });
  test('a host walk to the other host does not take a shortcut that is not there', () => {
    const w = hostWalk(net, 'c1', '192.168.50.2');
    expect(w.steps.flatMap((s) => s.moves).some((m) => m.to === 'c2')).toBe(false);
  });
  test('two hosts on one subnet cabled to each other still link', () => {
    const file = JSON.parse(read('vpws-hosts'));
    file.links = [{ a: { device: 'PE1', port: '1' }, b: { device: 'PE2', port: '1' } }, { a: { device: 'c1', port: 'eth1' }, b: { device: 'c2', port: 'eth1' } }];
    for (const h of file.hosts) h.interfaces[0].attached = null;
    file.hosts[0].interfaces[0].attached = { device: 'c2', port: 'eth1' };
    file.hosts[1].interfaces[0].attached = { device: 'c1', port: 'eth1' };
    expect(importFacts(file).topology.links.map((l) => l.id)).toContain('c1-c2');
  });
});
