// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, ccmWalk, replayFailure, vpwsWalk } from '../src/engine/index.js';
import { importFacts, ipv4Subnet, naturalCompare } from '../src/import/facts.js';
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

  test('every device is a node; CE1 is the only CE; a router without a service is a P whatever its name', () => {
    expect(topo.nodes.map((n) => n.id)).toEqual(['CE1', 'P2', 'P3', 'P7', 'P8', 'PE1', 'PE4', 'PE5', 'PE6', 'PE9']);
    expect(topo.nodes.filter((n) => n.role === 'ce').map((n) => n.id)).toEqual(['CE1']);
    // P8 and PE5 are iBGP clients of PE6 with no pseudowire, VRF, EVPN instance or CE: transit routers.
    expect(topo.nodes.filter((n) => n.role === 'p').map((n) => n.id)).toEqual(['P2', 'P7', 'P8', 'PE5']);
    expect(topo.nodes.filter((n) => n.rr).map((n) => `${n.id} ${n.role}`)).toEqual(['PE6 pe']);
    const pe1 = topo.nodes.find((n) => n.id === 'PE1');
    expect(pe1).toMatchObject({ loopback: '10.255.10.1', systemId: '0102.5501.0001', sidIndex: 1 });
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
      megs: [{ id: 'testcfm', md: 'md3', pseudowire: 'testcfm P3-PE6', intervalCode: 4, meps: [{ mepId: 22, node: 'P3', if: 'testcfm_1' }, { mepId: 33, node: 'PE6', if: 'testcfm_1' }] }],
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
  test('a third interface in a subnet, a PW without a far end and a failed device are reported; the device is a plain box', () => {
    const imp = importFacts(file([
      device('R1', '192.0.2.1', [['a', '198.51.100.1/29', '1']], { pseudowires: [{ name: 'PW', peer: '192.0.2.2', pw_id: '7', service: 'S' }] }),
      device('R2', '192.0.2.2', [['a', '198.51.100.2/29', '1']]),
      device('R3', '192.0.2.3', [['a', '198.51.100.3/29', '1']]),
      { device: 'R4', type: '5164-10x', status: 'error', reason: 'convert failed', facts: null },
    ]));
    expect(imp.topology.links).toEqual([]);
    expect(imp.topology.pseudowires).toEqual([]);
    expect(imp.topology.plain.nodes.map((n) => n.id)).toEqual(['R4']);
    expect(imp.report.warnings).toEqual([
      'R4: error (convert failed); shown as plain box',
      '198.51.100.0/29: 3 interfaces (R1 a, R2 a, R3 a) and no two of different devices run IS-IS; only point-to-point links are drawn',
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

  test('a VRF neighbour (a CE of an L3VPN, schema 1.7) is no iBGP session and no warning', () => {
    const ibgp = (ip) => ({ kind: 'bgp', name: 'as64500', ip, remote_as: '64500', route_reflector_client: false, vrf: null });
    const imp = importFacts(file([
      device('R1', '192.0.2.1', [['a', '198.51.100.0/31', '1']], {
        peers: [ibgp('192.0.2.2'), { kind: 'bgp', name: 'as64500', ip: '203.0.113.1', remote_as: '64510', vrf: 'CUST-A' }],
      }),
      device('R2', '192.0.2.2', [['a', '198.51.100.1/31', '1']], { peers: [ibgp('192.0.2.1')] }),
    ]));
    expect(buildNetwork(imp.topology, { labelMode: imp.labelMode }).bgp.sessions.map((s) => [s.a, s.b])).toEqual([['R1', 'R2']]);
    expect(imp.report.warnings).toEqual([]);
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

// Three routers in a line: R1 - R2 over LAG1 (ports 1 and 2 at R1, 11 and 12 at R2), R2 - R3 plain.
function lagLab({ r2Members = ['11', '12'] } = {}) {
  const withLag = (d, lag, members) => {
    d.facts.lags = [{ name: lag, members }];
    for (const m of members) d.facts.ports[m] = { roles: ['aggregation'], vlans: [], lag };
    return d;
  };
  return file([
    withLag(device('R1', '192.0.2.1', [['to-r2', '198.51.100.0/31', 'LAG1']]), 'LAG1', ['1', '2']),
    withLag(device('R2', '192.0.2.2', [['to-r1', '198.51.100.1/31', 'LAG1'], ['to-r3', '198.51.100.2/31', '3']]), 'LAG1', r2Members),
    device('R3', '192.0.2.3', [['to-r2', '198.51.100.3/31', '1']]),
  ]);
}

describe('LAG links from the facts', () => {
  const imp = importFacts(lagLab());
  const topo = imp.topology;

  test('a link whose interfaces ride a LAG at both ends is a LAG, members paired by port', () => {
    const lag = topo.links.find((l) => l.id === 'R1-R2');
    expect(lag).toMatchObject({ lag: true, a: { node: 'R1', if: 'to-r2', port: 'LAG1' }, b: { node: 'R2', if: 'to-r1', port: 'LAG1' } });
    expect(lag.members).toEqual([
      { id: 'R1-R2/1', a: '1', b: '11' },
      { id: 'R1-R2/2', a: '2', b: '12' },
    ]);
    expect(topo.links.find((l) => l.id === 'R2-R3')).toMatchObject({ lag: false, members: [{ id: 'R2-R3', a: 'to-r3', b: 'to-r2' }] });
    expect(imp.report.gaps.physical.map((i) => i.item)).toContain('1 LAG links');
    expect(imp.report.warnings).toEqual([]);
  });

  test('the engine runs LACP on it: a member failure keeps the LAG and the IS-IS adjacency up', () => {
    const net = buildNetwork(topo, { failures: ['R1-R2/1'] });
    expect(net.links['R1-R2']).toMatchObject({ lag: true, up: true, distributing: ['R1-R2/2'] });
    expect(net.isis.adjacencies.find((a) => a.link === 'R1-R2').state).toBe('Up');
    const r = replayFailure(topo, 'R1-R2/1', { labelMode: imp.labelMode, detection: 'los' });
    expect(r.replay.steps.map((s) => s.title)).toContain('t=0 ms: LACP removes R1-R2/1 from to-r2');
    expect(r.after.isis.rib).toEqual(r.before.isis.rib);
  });

  test('every member down takes the LAG and its adjacency down', () => {
    const net = buildNetwork(topo, { failures: ['R1-R2/1', 'R1-R2/2'] });
    expect(net.links['R1-R2'].up).toBe(false);
    expect(net.isis.adjacencies.find((a) => a.link === 'R1-R2')?.state ?? 'Down').not.toBe('Up');
  });

  test('members pair by port in natural order at both ends, not in configured order', () => {
    // R1 lists 2 before 1; R2 lists 12 before 11: 1 still meets 11. Slot names sort numerically: 29/30 meets 29/30, not 29/100.
    const f = lagLab({ r2Members: ['12', '11'] });
    f.devices[0].facts.lags[0].members = ['2', '1'];
    expect(importFacts(f).topology.links.find((l) => l.id === 'R1-R2').members).toEqual([
      { id: 'R1-R2/1', a: '1', b: '11' },
      { id: 'R1-R2/2', a: '2', b: '12' },
    ]);
    const slots = lagLab({ r2Members: ['29/100', '29/30', '29/4'] });
    slots.devices[0].facts.lags[0].members = ['29/30', '29/4', '29/100'];
    for (const d of slots.devices.slice(0, 2)) for (const m of d.facts.lags[0].members) d.facts.ports[m] = { roles: ['aggregation'], vlans: [], lag: 'LAG1' };
    expect(importFacts(slots).topology.links.find((l) => l.id === 'R1-R2').members.map((m) => [m.a, m.b])).toEqual([['29/4', '29/4'], ['29/30', '29/30'], ['29/100', '29/100']]);
    expect(naturalCompare('1/2', '1/10')).toBeLessThan(0);
    expect(['b1', 'a10', 'a2'].sort(naturalCompare)).toEqual(['a2', 'a10', 'b1']);
  });

  test('a port that is a member of the LAG, not the LAG itself, also makes it a LAG link', () => {
    const f = lagLab();
    f.devices[0].facts.fps[0].logical_port = '1';
    expect(importFacts(f).topology.links.find((l) => l.id === 'R1-R2').lag).toBe(true);
  });

  test('unequal member counts draw the pairs there are; a LAG at one end only is a plain link', () => {
    const uneven = importFacts(lagLab({ r2Members: ['11'] }));
    expect(uneven.topology.links.find((l) => l.id === 'R1-R2').members).toEqual([{ id: 'R1-R2/1', a: '1', b: '11' }]);
    expect(uneven.report.warnings).toEqual(['R1-R2: R1 LAG1 has 2 members, R2 LAG1 1; 1 are drawn']);
    const f = lagLab();
    f.devices[1].facts.lags = [];
    for (const p of ['11', '12']) delete f.devices[1].facts.ports[p];
    const oneSided = importFacts(f);
    expect(oneSided.topology.links.find((l) => l.id === 'R1-R2')).toMatchObject({ lag: false, members: [{ id: 'R1-R2', a: 'to-r2', b: 'to-r1' }] });
    expect(oneSided.report.warnings).toEqual(['R1-R2: R1 rides LAG LAG1, R2 no LAG; drawn as a plain link']);
  });
});

describe('links from interface subnets: what does not link', () => {
  // R1 - R2 core link; R1 and R2 both have a management interface on 192.168.100.0/24 (a SAOS 10
  // `system` interface, mgmtbr0, on R1; a SAOS 6 `management` one on R2), like every device of a lab.
  const mgmt = (d, name, kind, ip) => {
    d.facts.interfaces.push({ name, kind, ip, ipv4: [ip] });
    return d;
  };
  test('management interfaces (kind system / management) never form a link, so nobody turns PE for it', () => {
    const imp = importFacts(file([
      mgmt(device('R1', '192.0.2.1', [['to-r2', '198.51.100.0/31', '1']]), 'mgmtbr0', 'system', '192.168.100.11/24'),
      mgmt(device('R2', '192.0.2.2', [['to-r1', '198.51.100.1/31', '1']]), 'remote', 'management', '192.168.100.12/24'),
    ]));
    expect(imp.topology.links.map((l) => [l.id, l.kind])).toEqual([['R1-R2', 'core']]);
    expect(imp.topology.nodes.map((n) => n.role)).toEqual(['p', 'p']);
    expect(imp.report.warnings).toEqual([]);
  });

  test('a third interface in a point-to-point subnet: the link joins the two that run the IGP', () => {
    // R2 kept a stale copy of its interface to R1, on a port that runs no IS-IS.
    const f = file([
      device('R1', '192.0.2.1', [['to-r2', '198.51.100.0/31', '1']]),
      device('R2', '192.0.2.2', [['to-r1', '198.51.100.1/31', '1'], ['to-r1-old', '198.51.100.1/31', '7']]),
    ]);
    f.devices[1].facts.interfaces.find((i) => i.name === 'to-r1-old').isis = null;
    const imp = importFacts(f);
    expect(imp.topology.links).toHaveLength(1);
    expect(imp.topology.links[0]).toMatchObject({ id: 'R1-R2', kind: 'core', a: { node: 'R1', if: 'to-r2' }, b: { node: 'R2', if: 'to-r1' } });
    expect(imp.report.warnings).toEqual(['198.51.100.0/31: 3 interfaces; drawn between the two that run IS-IS (R1 to-r2, R2 to-r1), ignoring R2 to-r1-old']);
    // With the IGP on all three (or on one only) there is no pair to pick: skipped, and the Import tab names the subnet.
    const all = importFacts(file([
      device('R1', '192.0.2.1', [['to-r2', '198.51.100.0/31', '1']]),
      device('R2', '192.0.2.2', [['to-r1', '198.51.100.1/31', '1'], ['to-r1-old', '198.51.100.1/31', '7']]),
    ]));
    expect(all.topology.links).toEqual([]);
    expect(all.report.warnings).toEqual(['198.51.100.0/31: 3 interfaces (R1 to-r2, R2 to-r1, R2 to-r1-old) and no two of different devices run IS-IS; only point-to-point links are drawn']);
  });
});

describe('CFM CCM interval from the facts (schema 1.4)', () => {
  // R1 - R2 with a VPWS pseudowire and an Up MEP on each end; ccm as each test sets it per MEP.
  const lab = (ccm1, ccm2) => {
    const pw = (peer) => ({ name: 'PW', peer, pw_id: '7', service: 'S', tunnel_type: null });
    const mep = (id, ccm) => ({ md: 'MD5', ma: 'MA', mep_id: id, level: '5', direction: 'up', interface: 'S-AC', port: '9', vlan: null, service: 'S', ccm_interval: ccm });
    const ac = { fps: [{ name: 'S-AC', fd: 'S', logical_port: '9' }] };
    return file([
      device('R1', '192.0.2.1', [['a', '198.51.100.0/31', '1']], { ...ac, pseudowires: [pw('192.0.2.2')], meps: [mep('1', ccm1)] }),
      device('R2', '192.0.2.2', [['a', '198.51.100.1/31', '1']], { ...ac, pseudowires: [pw('192.0.2.1')], meps: [mep('2', ccm2)] }),
    ]);
  };
  const megOf = (imp) => buildNetwork(imp.topology, { labelMode: imp.labelMode }).cfm.megs.find((m) => m.id === 'MA');
  const intervalLine = (imp) => imp.report.gaps.cfm.find((i) => i.item === 'CCM interval');

  test('the configured interval, shown instead of the 1 s default', () => {
    const imp = importFacts(lab('10ms', '10ms'));
    expect(imp.topology.cfm.megs[0]).toMatchObject({ id: 'MA', intervalCode: 2 });
    expect(megOf(imp).intervalMs).toBe(10);
    expect(intervalLine(imp)).toMatchObject({ source: 'facts' });
    expect(imp.report.warnings).toEqual([]);
    expect(megOf(importFacts(lab('3.3ms', null))).intervalMs).toBeCloseTo(10 / 3);
    expect(megOf(importFacts(lab(null, '1min'))).intervalMs).toBe(60000);
  });

  test('no interval in the facts: 1 s, reported as a default; a text the view cannot read too', () => {
    const imp = importFacts(lab(null, null));
    expect(imp.topology.cfm.megs[0].intervalCode).toBeUndefined();
    expect(megOf(imp).intervalMs).toBe(1000);
    expect(intervalLine(imp)).toMatchObject({ source: 'default', detail: 'the facts carry no CCM interval: shown at 1 s' });
    const odd = importFacts(lab('soon', null));
    expect(megOf(odd).intervalMs).toBe(1000);
    expect(odd.report.warnings).toEqual(['CFM MD5/MA: CCM interval "soon" is not an interval the view knows; shown at 1 s']);
  });

  test('two MEPs with different intervals: the first is used, with a warning', () => {
    const imp = importFacts(lab('100ms', '1s'));
    expect(megOf(imp).intervalMs).toBe(100);
    expect(imp.report.warnings).toEqual(['CFM MD5/MA: CCM interval 100ms and 1s on its two MEPs; the view uses 100ms']);
  });

  test('the bundled example: 1 s as configured on both MAs', () => {
    const imp = importFacts(example);
    expect(imp.topology.cfm.megs.map((m) => [m.id, m.intervalCode])).toEqual([['testcfm', 4]]);
    expect(intervalLine(imp)).toMatchObject({ source: 'facts' });
  });
});

describe('IS-IS interface metrics from the facts (schema 1.3)', () => {
  test('the sr-l2 fixture: wide metric 100 at both ends of PE1-PE2 (PE2 also sets narrow 30)', () => {
    const imp = importFacts(readFileSync(new URL('../../tests/fixtures/expected/sr-l2.facts.json', import.meta.url), 'utf8'));
    expect(imp.topology.links.find((l) => l.id === 'PE1-PE2')).toMatchObject({ kind: 'core', metric: 100 });
    expect(imp.topology.links.find((l) => l.id === 'PE1-PE2').cost).toBeUndefined();
    expect(imp.report.gaps.isis.find((i) => i.item === 'link metrics')).toMatchObject({ source: 'facts' });
  });

  // R1 - R2 - R3 and R1 - R3; metrics as each test sets them on the interfaces.
  function triangle(metrics, level = 'level-2') {
    const f = file([
      device('R1', '192.0.2.1', [['r1-r2', '198.51.100.0/31', '1'], ['r1-r3', '198.51.100.4/31', '2']]),
      device('R2', '192.0.2.2', [['r2-r1', '198.51.100.1/31', '1'], ['r2-r3', '198.51.100.2/31', '2']]),
      device('R3', '192.0.2.3', [['r3-r2', '198.51.100.3/31', '1'], ['r3-r1', '198.51.100.5/31', '2']]),
    ]);
    for (const d of f.devices) {
      d.facts.isis.instances[0].level = level;
      d.facts.isis.interfaces = d.facts.interfaces.filter((i) => i.isis).map((i) => ({ interface: i.name, instance: 'CORE', level: null, type: null, metrics: metrics[i.name] ?? [] }));
    }
    return f;
  }
  const wide = (level, v) => ({ level, metric: null, wide_metric: String(v) });

  test('per end metrics: wide, else narrow, else 10; SPF follows them', () => {
    const imp = importFacts(triangle({
      'r1-r3': [wide('level-2', 100)],
      'r3-r1': [{ level: 'level-2', metric: '40', wide_metric: null }],
      'r1-r2': [wide('level-1', 5), wide('level-2', 20)],
      'r2-r1': [wide('level-2', 20)],
    }));
    const link = (id) => imp.topology.links.find((l) => l.id === id);
    expect(link('R1-R2')).toMatchObject({ metric: 20 });
    expect(link('R1-R3')).toMatchObject({ metric: 100, cost: { a: 100, b: 40 } });
    expect(link('R2-R3')).toMatchObject({ metric: 10 });
    expect(imp.report.gaps.isis.find((i) => i.item === 'link metrics')).toMatchObject({ source: 'default', detail: expect.stringMatching(/^1 of 3 core links/) });
    const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
    // R1 -> R3: via R2 (20 + 10) beats the direct link (100); R3 -> R1: via R2 (10 + 20) beats its direct end (40).
    expect(net.isis.rib.R1['192.0.2.3/32']).toMatchObject({ metric: 30, nextHops: [expect.objectContaining({ node: 'R2' })] });
    expect(net.isis.rib.R3['192.0.2.1/32']).toMatchObject({ metric: 30 });
  });

  test('level 1 and level 1-2: the level the view runs (1-2 runs as 2)', () => {
    const m = { 'r1-r2': [wide('L1', 7), wide('L2', 70)], 'r2-r1': [wide('L1', 7), wide('L2', 70)] };
    expect(importFacts(triangle(m, 'level-1')).topology.links.find((l) => l.id === 'R1-R2').metric).toBe(7);
    expect(importFacts(triangle(m, 'level-1-2')).topology.links.find((l) => l.id === 'R1-R2').metric).toBe(70);
  });
});
