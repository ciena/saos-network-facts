// SPDX-License-Identifier: Apache-2.0
// Linux hosts (schema 1.8) and VRFs / L3VPN (schema 1.7) from a facts file: the synthetic
// l3vpn-hosts fixture (PE1 / P1 / PE2 on IS-IS + SR-MPLS, P1 the VPNv4 / VPNv6 route reflector, VRF
// BLUE with per-VRF labels between hosts h1 and h2, the management VRF MGMT with two DCN gateways on
// PE1 and floating static defaults) and srv6-evpn with its hosts file (VRF CUST-A over SRv6).
// RFC 4364 (BGP/MPLS IP VPNs), RFC 4659 (VPN-IPv6), RFC 4456 (route reflection), RFC 8986 and
// RFC 9252 (SRv6 L3 services).
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, failureModes, hostSources, hostTargets, hostWalk, replayFailure, vpnRouteChoices, vpnUpdateWalk } from '../src/engine/index.js';
import { buildUpdate } from '../src/engine/bgp.js';
import { importFacts } from '../src/import/facts.js';
import { presentLayers } from '../src/view/layers.js';
import { renderDevice, renderOverview, roleText } from '../src/panels.js';

const read = (name) => readFileSync(new URL(`../../tests/fixtures/expected/${name}.facts.json`, import.meta.url), 'utf8');
const l3vpnText = read('l3vpn-hosts');
const srv6Text = read('srv6-evpn');
const dev = (file, name) => file.devices.find((d) => d.device === name).facts;
const load = (file) => {
  const imp = importFacts(file);
  return { imp, net: buildNetwork(imp.topology, { labelMode: imp.labelMode }) };
};
const { imp, net } = load(l3vpnText);
const srv6 = load(srv6Text);
const hops = (w) => w.steps.flatMap((s) => s.moves).map((m) => m.to);
const headerNames = (w) => w.steps.flatMap((s) => (s.headers ?? []).map((h) => h.name));

describe('Linux hosts (schema 1.8)', () => {
  test('hosts are CE nodes with their addresses and routes, linked to their PE by subnet', () => {
    const h1 = imp.topology.nodes.find((n) => n.id === 'h1');
    expect(h1).toMatchObject({ role: 'ce', host: true, addresses: ['192.168.10.10', '2001:db8:10::10'] });
    expect(h1.routes).toEqual([{ prefix: '0.0.0.0/0', nextHop: '192.168.10.1', metric: 0 }, { prefix: '::/0', nextHop: '2001:db8:10::1', metric: 0 }]);
    const link = imp.topology.links.find((l) => l.id === 'PE1-h1');
    expect(link).toMatchObject({ kind: 'access', subnet: '192.168.10.0/24', subnet6: '2001:db8:10::/64', a: { node: 'PE1', if: 'TO-H1', port: '5' }, b: { node: 'h1', if: 'eth1', port: 'eth1' } });
    expect(imp.topology.nodes.filter((n) => n.host).map((n) => n.id)).toEqual(['h1', 'h2', 'dcn1', 'dcn2']);
  });

  test('a host record is not reported as a device not shown; exec lines not read are listed', () => {
    expect(imp.report.warnings).toEqual([]);
    const item = imp.report.gaps.physical.find((g) => g.item === 'host exec lines not read');
    expect(item.detail).toContain('h1: ip link set eth1 up');
    expect(item.detail).toContain('dcn1: sysctl -w net.ipv4.ip_forward=1');
  });

  test('hosts from a hosts file link by subnet without links[]', () => {
    expect(srv6.imp.topology.links.filter((l) => l.kind === 'access').map((l) => [l.id, l.subnet, l.subnet6 ?? null])).toEqual([
      ['PE1-ce-a', '198.51.100.0/31', '2001:db8:100::/127'],
      ['PE2-ce-b', '203.0.113.0/31', null],
    ]);
  });

  test('a host named like a device with facts is left out with a warning', () => {
    const file = JSON.parse(l3vpnText);
    file.hosts.push({ ...file.hosts[0], name: 'PE1' });
    expect(importFacts(file).report.warnings).toContain('host PE1: also a device with facts; the device is shown');
  });

  test('a file without hosts (schema 1.7) imports as before, its Linux records as plain boxes', () => {
    const file = JSON.parse(l3vpnText);
    delete file.hosts;
    const x = importFacts(file);
    expect(x.topology.nodes.some((n) => n.host)).toBe(false);
    expect(x.report.warnings.filter((w) => w.endsWith('shown as plain box'))).toHaveLength(4);
    expect(x.topology.plain.nodes.map((n) => n.id)).toEqual(['h1', 'h2', 'dcn1', 'dcn2']);
    expect(importFacts(file, { plain: false }).report.warnings.filter((w) => w.endsWith('not shown'))).toHaveLength(4);
  });
});

describe('VRFs from the facts', () => {
  test('one site per PE: RD, route targets per family, families, label allocation, interfaces and statics', () => {
    expect(imp.topology.vrfs.map((v) => [v.name, v.role, v.sites.map((s) => s.pe)])).toEqual([['BLUE', null, ['PE1', 'PE2']], ['MGMT', 'management', ['PE1', 'P1', 'PE2']]]);
    const pe1 = imp.topology.vrfs[0].sites[0];
    expect(pe1).toMatchObject({ rd: '0:64500:10', families: ['ipv4 unicast', 'ipv6 unicast'], labelAllocation: { ipv4: 'per-vrf', ipv6: 'per-vrf' } });
    expect(pe1.rts['ipv6 unicast']).toEqual({ import: ['0:64500:100'], export: ['0:64500:100'] });
    expect(pe1.interfaces).toEqual([
      { name: 'TO-H1', kind: 'ip', ip: '192.168.10.1', prefix: '192.168.10.0/24', link: 'PE1-h1' },
      { name: 'TO-H1', kind: 'ip', ip: '2001:db8:10::1', prefix: '2001:db8:10::/64', link: 'PE1-h1' },
    ]);
    const mgmt = imp.topology.vrfs[1].sites[0];
    expect(mgmt.statics).toEqual([{ prefix: '0.0.0.0/0', nextHop: '10.60.255.1', preference: 10, discard: false }, { prefix: '0.0.0.0/0', nextHop: '10.60.255.3', preference: 20, discard: false }]);
    expect(mgmt.interfaces[0]).toEqual({ name: 'lo-mgmt', kind: 'loopback', ip: '10.60.0.1', prefix: '10.60.0.1/32' });
  });

  test('roles: a PE has a service; the route reflector with only a management VRF is P / RR', () => {
    expect(imp.topology.nodes.filter((n) => !n.host).map((n) => [n.id, n.role, Boolean(n.rr)])).toEqual([['PE1', 'pe', false], ['P1', 'p', true], ['PE2', 'pe', false]]);
    expect(srv6.imp.topology.nodes.find((n) => n.id === 'RR1')).toMatchObject({ role: 'p', rr: true });
    expect(roleText(imp.topology.nodes.find((n) => n.id === 'P1'))).toBe('P / RR');
    expect(roleText(imp.topology.nodes.find((n) => n.id === 'h1'))).toBe('host');
    // a P with a VRF still has its VRF table, exports and imports
    expect(net.bgp.vrfs.P1.MGMT['0.0.0.0/0']).toMatchObject({ type: 'bgp', originator: 'PE1' });
    expect(net.bgp.originated.P1.map((r) => r.prefix)).toEqual(['10.60.0.2/32']);
    expect(hostWalk(net, 'P1', '198.51.100.10', { vrf: 'MGMT' }).delivered).toBe(true);
    expect(presentLayers(net).map((l) => l.id)).toContain('vrf');
  });

  test('the overview lists hosts under Hosts (kind, role host), not as skipped devices', () => {
    const el = { innerHTML: '' };
    renderOverview(el, imp, net);
    const section = (title) => el.innerHTML.split(`<h2>${title}</h2>`)[1].split('<h2>')[0];
    expect(section('Devices')).toContain('PE1');
    expect(section('Devices')).not.toContain('>h1<');
    expect(section('Devices')).not.toContain('skipped');
    expect(section('Devices')).toContain('P / RR');
    expect(section('Hosts')).toContain('<td>linux</td><td>host</td>');
    const dev = { innerHTML: '', querySelector: () => ({ innerHTML: '' }) };
    renderDevice(dev, imp, net, 'h1');
    expect(dev.innerHTML).toContain('HOST · linux');
    expect(dev.innerHTML).not.toContain('skipped');
    expect(dev.innerHTML).not.toContain('5164');
  });

  test('a per-VRF site has one label per family; a per-prefix one a label per prefix', () => {
    const blue = net.bgp.originated.PE2.filter((r) => r.vrf === 'BLUE');
    expect(new Set(blue.filter((r) => r.family === 'ipv4 unicast').map((r) => r.label)).size).toBe(1);
    expect(new Set(blue.map((r) => r.label)).size).toBe(2);
    const mgmt = net.bgp.originated.PE1.filter((r) => r.vrf === 'MGMT');
    expect(new Set(mgmt.map((r) => r.label)).size).toBe(mgmt.length);
  });

  test('VPN-IPv4 and VPN-IPv6 cross the route reflector; each VRF imports by route target', () => {
    expect(net.bgp.vrfs.PE1.BLUE['192.168.20.0/24']).toMatchObject({ type: 'bgp', originator: 'PE2', from: 'P1', nextHop: '10.255.0.3', transport: 'mpls' });
    expect(net.bgp.vrfs.PE1.BLUE['2001:db8:20::/64']).toMatchObject({ type: 'bgp', family: 'ipv6 unicast', originator: 'PE2' });
    expect(net.bgp.vrfs.PE1.MGMT['192.168.20.0/24']).toBeUndefined();
    expect(net.bgp.vrfs.PE2.MGMT['0.0.0.0/0']).toMatchObject({ type: 'bgp', originator: 'PE1' });
    expect(net.l3vpn.vrfs.map((v) => [v.name, v.state])).toEqual([['BLUE', 'Up'], ['MGMT', 'Up']]);
    expect(net.l3vpn.vrfs[1].sites[0].attached.map((a) => a.node)).toEqual(['dcn1', 'dcn2']);
  });

  test('redistribution decides what a PE exports: connected only keeps the static route home', () => {
    const file = JSON.parse(l3vpnText);
    dev(file, 'PE2').vrf_instances.find((v) => v.name === 'BLUE').redistribute['ipv4 unicast'] = ['connected'];
    const x = load(file).net;
    expect(x.bgp.originated.PE2.map((r) => r.prefix)).not.toContain('192.168.120.0/24');
    expect(x.bgp.vrfs.PE2.BLUE['192.168.120.0/24'].type).toBe('static');
  });

  test('a route target mismatch leaves the VRF down with the reason', () => {
    const file = JSON.parse(l3vpnText);
    dev(file, 'PE2').vrf_instances.find((v) => v.name === 'BLUE').route_targets = [{ address_family: null, route_target: '0:64500:199', type: 'both' }];
    const blue = load(file).net.l3vpn.vrfs.find((v) => v.name === 'BLUE');
    expect(blue.state).toBe('Down');
    expect(blue.reasons).toContain('PE1 imports 0:64500:100 in ipv4 unicast, none of PE2\'s 0:64500:199');
  });

  test('without a session carrying vpnv6, IPv6 VPN routes do not cross', () => {
    const file = JSON.parse(l3vpnText);
    for (const p of dev(file, 'P1').peers) p.address_families = (p.address_families ?? []).filter((f) => f !== 'vpnv6 unicast');
    const blue = load(file).net.l3vpn.vrfs.find((v) => v.name === 'BLUE');
    expect(blue.state).toBe('Partial');
    expect(blue.reasons[0]).toMatch(/^no BGP IPv6 VPN path from PE\d to PE\d/);
  });

  test('over SRv6 each family gets End.DT4 / End.DT6 from its locator; a family the far PE lacks is a note', () => {
    const v = srv6.net.l3vpn.vrfs[0];
    expect(v.sites[0].transport).toEqual({
      'ipv4 unicast': { kind: 'srv6', sid: '2001:db8:f0:1:e300::', behavior: 'End.DT4', locator: 'LOC' },
      'ipv6 unicast': { kind: 'srv6', sid: '2001:db8:f8:1:e400::', behavior: 'End.DT6', locator: 'LOC-ALGO128' },
    });
    expect(v.state).toBe('Up');
    expect(v.notes).toEqual(['PE2 runs no ipv6 unicast in VRF CUST-A: PE1\'s IPv6 routes stay out of it']);
    expect(srv6.net.bgp.vrfs.PE1['CUST-A']['203.0.113.128/25']).toMatchObject({ type: 'bgp', sid: '2001:db8:f0:2:e300::', transport: 'srv6', vpnLabel: null });
  });

  test('a VPN-IPv6 UPDATE over MPLS carries an IPv4-mapped next hop; an SRv6 one its SID in the Prefix-SID', () => {
    const v6 = net.bgp.originated.PE1.find((r) => r.prefix === '2001:db8:10::/64');
    expect(buildUpdate(v6).pathAttributes.MP_REACH_NLRI).toMatchObject({ afi: 2, safi: 128, nextHop: '0:0:::ffff:10.255.0.1' });
    const s = srv6.net.bgp.originated.PE2[0];
    expect(buildUpdate(s).pathAttributes.PREFIX_SID).toBe('SRv6 L3 Service TLV: SID 2001:db8:f0:2:e300:: (End.DT4, locator LOC)');
  });
});

describe('L3VPN walks', () => {
  test('a host to a host through VRF BLUE over SR-MPLS, IPv6 (6VPE)', () => {
    const w = hostWalk(net, 'h1', '2001:db8:20::20');
    expect(w.delivered).toBe(true);
    expect(hops(w)).toEqual(['PE1', 'P1', 'PE2', 'h2']);
    expect(w.steps[1].actions).toEqual(['push VPN label 103001 (BGP, from P1)', 'push transport label 16003 (SR FEC 10.255.0.3/32)']);
    expect(w.flow.src).toBe('2001:db8:10::10');
    expect(w.layer).toBe('vrf');
  });

  test('a host to a prefix behind a static route on the far PE', () => {
    const w = hostWalk(net, 'h1', '192.168.120.1');
    expect(w.delivered).toBe(true);
    expect(w.steps.at(-2).lookup.result).toContain('192.168.120.0/24 static 192.168.20.20');
  });

  test('over SRv6: H.Encaps.Red to the far End.DT4 SID, decapsulated into the VRF', () => {
    const w = hostWalk(srv6.net, 'ce-a', '203.0.113.129');
    expect(w.delivered).toBe(true);
    expect(w.title).toBe('ce-a -> 203.0.113.129 (SRv6)');
    expect(hops(w)).toEqual(['PE1', 'P1', 'PE2', 'ce-b']);
    expect(w.steps[1].headers.map((h) => h.name)).toEqual(['Ethernet II', 'IPv6 (outer, SRv6)', 'IPv4', 'UDP']);
    expect(w.steps[1].headers[1].fields).toMatchObject({ dst: '2001:db8:f0:2:e300::', nextHeader: '4 (IPv4)' });
    expect(w.steps[3].actions[1]).toContain('End.DT4: remove the outer IPv6 header');
    expect(headerNames(w).filter((n) => n === 'MPLS')).toEqual([]);
  });

  test('a VRF Null0 route discards', () => {
    const w = hostWalk(srv6.net, 'ce-a', '203.0.113.70');
    expect(w.delivered).toBe(false);
    expect(w.steps.at(-1).title).toBe('PE2 discards it (VRF CUST-A Null0)');
  });

  test('from a PE in the management VRF to the DCN: the floating static takes over when the gateway link fails', () => {
    const w = hostWalk(net, 'PE2', '198.51.100.10', { vrf: 'MGMT' });
    expect(hops(w)).toEqual(['P1', 'PE1', 'dcn1']);
    const r = replayFailure(imp.topology, 'PE1-dcn1', { labelMode: imp.labelMode, host: { from: 'PE2', vrf: 'MGMT', dst: '198.51.100.10' } });
    expect(hops(r.walkAfter)).toEqual(['P1', 'PE1', 'dcn2']);
    expect(r.walkAfter.delivered).toBe(true);
  });

  test('the BGP UPDATE of a VPN route: originated, reflected with ORIGINATOR_ID / CLUSTER_LIST, imported by route target', () => {
    const w = vpnUpdateWalk(net, 'PE2|BLUE|192.168.20.0/24');
    expect(w.delivered).toBe(true);
    const received = w.steps.filter((s) => s.status === 'delivered');
    expect(received.map((s) => s.node)).toEqual(['P1', 'PE1']);
    const reflected = w.steps.find((s) => s.title === 'P1 sends the UPDATE to PE1 (reflected)');
    expect(reflected.actions[0]).toBe('reflect (route reflector P1): ORIGINATOR_ID 10.255.0.3 (PE2), CLUSTER_LIST 10.255.0.2 (RFC 4456 §8)');
    expect(reflected.headers.at(-1).fields).toMatchObject({ ORIGINATOR_ID: '10.255.0.3 (PE2)', CLUSTER_LIST: '10.255.0.2', NLRI: 'label 103000, RD 0:64500:20, 192.168.20.0/24' });
    expect(received[1].actions).toContain('VRF MGMT: imports 0:64500:900, none of 0:64500:100: not imported');
    expect(received[1].actions.some((a) => a.startsWith('VRF BLUE: RT 0:64500:100 imported; best (only path), installed'))).toBe(true);
  });

  test('failure modes: a silent failure only where something detects it, named', () => {
    expect(failureModes(net, 'PE1-P1').map((m) => m.label)).toEqual(['Silent failure: found by the IS-IS hold timer', 'Loss of signal: interfaces go down at once']);
    expect(failureModes(net, 'PE1-h1').map((m) => m.value)).toEqual(['los']); // a host link: no CFM, BFD, LACP or IGP
    expect(failureModes(net, null).map((m) => m.value)).toEqual(['los']);
  });

  test('walk choices: sources, targets and VPN routes', () => {
    expect(hostSources(net).map((s) => s.value)).toEqual(['h1', 'h2', 'dcn1', 'dcn2', 'PE1|BLUE', 'PE2|BLUE', 'PE1|MGMT', 'P1|MGMT', 'PE2|MGMT']);
    expect(hostTargets(net).slice(0, 3).map((t) => t.ip)).toEqual(['192.168.10.10', '2001:db8:10::10', '192.168.20.20']);
    expect(vpnRouteChoices(srv6.net)[0]).toEqual({ value: 'PE1|CUST-A|198.51.100.0/31', label: 'PE1 VRF CUST-A 198.51.100.0/31 (SRv6 End.DT4)' });
    expect(() => vpnUpdateWalk(net, 'PE1|BLUE|10.0.0.0/8')).toThrow('PE1 exports no VPN route 10.0.0.0/8 from VRF BLUE');
  });
});
