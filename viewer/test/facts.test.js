// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, ccmWalk, replayFailure, vpwsWalk } from '../src/engine/index.js';
import { importFacts, ipv4Subnet } from '../src/import/facts.js';
import { layoutNodes } from '../src/import/layout.js';

const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');

// A minimal SAOS 10 device record: a loopback, IS-IS and the given interfaces / extras.
function device(name, lo, ifs = [], extra = {}) {
  const interfaces = [{ name: 'lb1', kind: 'loopback', ip: `${lo}/32`, ipv4: [`${lo}/32`] }];
  const fps = [];
  ifs.forEach(([ifname, ip, port]) => {
    interfaces.push({ name: ifname, kind: 'ip', ip, ipv4: [ip], fd: ifname, isis: 'CORE' });
    fps.push({ name: ifname, fd: ifname, logical_port: port, classifiers: [] });
  });
  const ports = Object.fromEntries(fps.map((f) => [f.logical_port, { roles: ['fp'], vlans: [], lag: null }]));
  return {
    device: name,
    type: '5164-10x',
    status: 'ok',
    facts: {
      hostname: name,
      interfaces,
      fps: [...fps, ...(extra.fps ?? [])],
      ports,
      isis: { instances: [{ name: 'CORE', level: 'level-2', net: `49.0001.0000.0000.000${name.at(-1)}.00`, system_id: `0000.0000.000${name.at(-1)}` }], interfaces: [] },
      peers: extra.peers ?? [],
      pseudowires: extra.pseudowires ?? [],
      cfm: { meps: extra.meps ?? [] },
    },
  };
}

const file = (devices) => ({ schema_version: '1.1.0', generator: { name: 'test', version: '0' }, devices });

describe('the bundled Adaptive-SR-CFM example', () => {
  const imp = importFacts(example);
  const topo = imp.topology;
  const net = buildNetwork(topo, { labelMode: imp.labelMode });

  test('every device is a node; CE1 is the only host and P2 / P7 the only P routers', () => {
    expect(topo.nodes.map((n) => n.id)).toEqual(['CE1', 'P2', 'P3', 'P7', 'P8', 'PE1', 'PE4', 'PE5', 'PE6', 'PE9']);
    expect(topo.nodes.filter((n) => n.role === 'ce').map((n) => n.id)).toEqual(['CE1']);
    expect(topo.nodes.filter((n) => n.role === 'p').map((n) => n.id)).toEqual(['P2', 'P7']);
    const pe1 = topo.nodes.find((n) => n.id === 'PE1');
    expect(pe1).toMatchObject({ loopback: '10.255.10.1', systemId: '0200.1001.0001', sidIndex: 1 });
  });

  test('links come from the interface subnets, with the port each interface rides on', () => {
    expect(topo.links).toHaveLength(14);
    expect(topo.links.filter((l) => l.kind === 'access').map((l) => l.id)).toEqual(['CE1-PE1']);
    const p2p3 = topo.links.find((l) => l.id === 'P2-P3');
    expect(p2p3).toMatchObject({ subnet: '172.30.10.8/30', a: { node: 'P2', if: 'if2', ip: '172.30.10.9', port: '2' }, b: { node: 'P3', if: 'if2', ip: '172.30.10.10', port: '22' } });
  });

  test('IS-IS adjacencies are up on every core link, at level 1', () => {
    expect(topo.isis.level).toBe(1);
    expect(net.isis.adjacencies).toHaveLength(13);
    expect(net.isis.adjacencies.every((a) => a.state === 'Up')).toBe(true);
  });

  test('the SR policies take their segment lists and all resolve', () => {
    expect(topo.srgb).toEqual({ base: 16000, size: 1001 });
    const pe1 = topo.srPolicies.find((p) => p.headend === 'PE1');
    expect(pe1).toEqual({ name: 'SR1to9color2', headend: 'PE1', color: 2, endpoint: '10.255.10.9', segmentList: { name: 'PE1_PE9', sids: [16003, 16004, 16009] } });
    expect(net.sr.policies.map((p) => [p.name, p.valid])).toEqual([
      ['SR3to6color2', true], ['SR1to9color2', true], ['SR4to3color2', true], ['SR6to3color2', true], ['SR9to1color2', true],
    ]);
    expect(net.sr.policies.find((p) => p.name === 'SR1to9color2').path).toEqual(['PE1', 'P3', 'PE4', 'PE6', 'P8', 'PE9']);
  });

  test('pseudowires pair their two ends and ride the configured transport', () => {
    expect(topo.pseudowires.map((p) => p.id)).toEqual(['testsat P3-PE4', 'testcfm P3-PE6', 'testsat PE1-PE9']);
    const transports = Object.fromEntries(net.vpws.pseudowires.map((p) => [p.id, p.ends.map((e) => e.transport.policy ?? e.transport.kind)]));
    expect(transports).toEqual({
      'testsat P3-PE4': ['sr', 'sr'], // no tunnel type configured: the peer's Prefix-SID
      'testcfm P3-PE6': ['SR3to6color2', 'SR6to3color2'],
      'testsat PE1-PE9': ['SR1to9color2', 'SR9to1color2'],
    });
    expect(net.vpws.pseudowires.every((p) => p.state === 'Up')).toBe(true);
    expect(topo.pseudowires[1].ends[1].ac).toEqual({ port: '5', name: 'testcfm_1' });
  });

  test('the CFM MEPs form one service MEG on the testcfm pseudowire', () => {
    expect(topo.cfm).toEqual({
      linkMegs: false,
      megs: [{ id: 'testcfm', md: 'md3', pseudowire: 'testcfm P3-PE6', meps: [{ mepId: 22, node: 'P3', if: 'testcfm_1' }, { mepId: 33, node: 'PE6', if: 'testcfm_1' }] }],
    });
    expect(net.cfm.megs[0].meps.map((m) => m.defect)).toEqual([null, null]);
    expect(imp.report.gaps.cfm.some((i) => i.source === 'default' && /level/.test(i.item))).toBe(true);
  });

  test('BGP sessions follow the neighbours; one configured on one end only stays Active', () => {
    const sessions = Object.fromEntries(net.bgp.sessions.map((s) => [`${s.a}-${s.b}`, [s.client, s.state]]));
    expect(sessions).toEqual({
      'P8-PE6': [null, 'Active'],
      'PE1-PE6': ['PE1', 'Established'],
      'PE4-PE6': ['PE4', 'Established'],
      'PE5-PE6': ['PE5', 'Established'],
      'PE6-PE9': ['PE9', 'Established'],
    });
    expect(imp.report.warnings).toEqual(['BGP P8-PE6: configured on P8 only']);
  });

  test('services: one per pseudowire, with its MEG and attachment circuits', () => {
    expect(imp.services.find((s) => s.name === 'testcfm')).toEqual({
      id: 'testcfm P3-PE6', name: 'testcfm', type: 'vpws', pseudowire: 'testcfm P3-PE6', meg: 'testcfm',
      ends: [{ node: 'P3', port: '1', fp: 'testcfm_1' }, { node: 'PE6', port: '5', fp: 'testcfm_1' }],
    });
  });

  test('walks and failure replays run on the imported topology', () => {
    expect(vpwsWalk(net, 'testsat PE1-PE9', 'PE1').delivered).toBe(true);
    expect(ccmWalk(net, 'testcfm').steps.length).toBeGreaterThan(0);
    for (const l of topo.links.filter((x) => x.kind === 'core')) {
      expect(replayFailure(topo, l.id, { labelMode: 'sr' }).replay.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('importing other facts files', () => {
  test('a third interface in a subnet, a PW without a far end and a failed device are reported, not drawn', () => {
    const imp = importFacts(file([
      device('R1', '192.0.2.1', [['a', '198.51.100.1/29', '1']], { pseudowires: [{ name: 'PW', peer: '192.0.2.2', pw_id: '7', service: 'S' }] }),
      device('R2', '192.0.2.2', [['a', '198.51.100.2/29', '1']]),
      device('R3', '192.0.2.3', [['a', '198.51.100.3/29', '1']]),
      { device: 'R4', type: '5164-10x', status: 'error', reason: 'convert failed', facts: null },
    ]));
    expect(imp.topology.links).toEqual([]);
    expect(imp.topology.pseudowires).toEqual([]);
    expect(imp.report.warnings).toEqual([
      'R4: error (convert failed); not shown',
      '198.51.100.0/29: 3 interfaces (R1 a, R2 a, R3 a); only point-to-point links are drawn',
      'R1: PW PW (id 7) to 192.0.2.2: R2 has no PW 7 back; not drawn',
    ]);
  });

  test('a pseudowire with no tunnel type rides LDP when the devices have no segment routing', () => {
    const pw = (peer) => ({ name: 'PW', peer, pw_id: '7', service: 'S', tunnel_type: null });
    const ac = { fps: [{ name: 'S-AC', fd: 'S', logical_port: '9' }] };
    const imp = importFacts(file([
      device('R1', '192.0.2.1', [['a', '198.51.100.0/31', '1']], { ...ac, pseudowires: [pw('192.0.2.2')] }),
      device('R2', '192.0.2.2', [['a', '198.51.100.1/31', '1']], { ...ac, pseudowires: [pw('192.0.2.1')] }),
    ]));
    expect(imp.labelMode).toBe('ldp');
    expect(imp.topology.pseudowires[0].ends).toEqual([
      { node: 'R1', ac: { port: '9', name: 'S-AC' }, underlay: 'ldp' },
      { node: 'R2', ac: { port: '9', name: 'S-AC' }, underlay: 'ldp' },
    ]);
    const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
    expect(net.vpws.pseudowires[0].state).toBe('Up');
  });

  test('a pre-schema bare list is read; another schema major is refused', () => {
    expect(importFacts([device('R1', '192.0.2.1')]).topology.nodes).toHaveLength(1);
    expect(() => importFacts({ schema_version: '2.0.0', devices: [] })).toThrow(/schema_version/);
    expect(() => importFacts(file([]))).toThrow(/no device/);
  });

  test('ipv4Subnet', () => {
    expect(ipv4Subnet('172.30.10.26/30')).toEqual({ ip: '172.30.10.26', len: 30, subnet: '172.30.10.24/30' });
    expect(ipv4Subnet('2001:db8::1/64')).toBeNull();
    expect(ipv4Subnet(null)).toBeNull();
  });
});

describe('layout', () => {
  const ids = ['A', 'B', 'C', 'D', 'E'];
  const edges = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A']];

  test('is deterministic, inside the frame, and keeps nodes apart', () => {
    const a = layoutNodes(ids, edges);
    expect(layoutNodes(ids, edges)).toEqual(a);
    const pts = Object.values(a);
    for (const p of pts) expect(Math.abs(p.x) <= 25 && Math.abs(p.z) <= 15).toBe(true);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z)).toBeGreaterThan(3);
  });

  test('handles one node and no links', () => {
    expect(layoutNodes(['A'], [])).toEqual({ A: { x: 0, z: 0 } });
    expect(layoutNodes([], [])).toEqual({});
  });
});
