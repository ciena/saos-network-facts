// SPDX-License-Identifier: Apache-2.0
// G.8032 ring protection: the rings imported from the example facts, their idle and protection
// states, and the R-APS replay of a ring link failure and its repair.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, replayFailure } from '../src/engine/index.js';
import { rapsGroupMac, rapsHops, ringDataPath } from '../src/engine/g8032.js';
import { importFacts } from '../src/import/facts.js';

const example = readFileSync(new URL('../../examples/adaptive-sr-cfm/facts.json', import.meta.url), 'utf8');
const imp = importFacts(example);
const topo = imp.topology;
const net = buildNetwork(topo, { labelMode: imp.labelMode });
const titles = (r) => r.replay.steps.map((s) => s.title);

describe('rings imported from the example facts', () => {
  test('a major ring and a sub-ring, joined by ring id across the devices', () => {
    expect(topo.rings.map((r) => [r.id, r.name, r.type, r.rapsVid, r.level])).toEqual([
      ['1', 'ring-core', 'major', 4094, 7],
      ['2', 'ring-access', 'sub', 4093, 7],
    ]);
    const [core, access] = topo.rings;
    expect(core.path).toEqual({ nodes: ['P3', 'PE4', 'P2', 'PE1'], links: ['P3-PE4', 'P2-PE4', 'P2-PE1', 'P3-PE1'], closed: true });
    expect(core.rpl).toEqual({ link: 'P3-PE4', owner: 'P3', neighbor: 'PE4' });
    expect(core).toMatchObject({ members: ['ring-data'], wtrMin: 1, guardMs: 500, holdOffMs: null, revertive: true, interconnect: [], subRingOf: null });
    // The sub-ring is open: P2 and PE4 terminate it (one ring port each in the instance) and attach it to ring-core.
    expect(access.path).toEqual({ nodes: ['P2', 'PE5', 'PE6', 'PE4'], links: ['P2-PE5', 'PE5-PE6', 'PE4-PE6'], closed: false });
    expect(access.rpl).toEqual({ link: 'PE5-PE6', owner: 'PE6', neighbor: 'PE5' });
    expect(access).toMatchObject({ interconnect: ['P2', 'PE4'], subRingOf: '1', virtualChannel: false, revertive: null, guardMs: null });
    const p2 = access.nodes.find((n) => n.node === 'P2');
    expect(p2).toMatchObject({ terminates: true, ports: [{ name: 'port1', if: '4', link: 'P2-PE5' }] });
    expect(imp.report.warnings).toEqual(['BGP P8-PE6: configured on P8 only']);
    expect(imp.report.gaps.ring.map((i) => [i.source, i.item])).toEqual([
      ['facts', '2 G.8032 rings'], ['derived', 'ring links'], ['derived', 'interconnection nodes'], ['default', 'protection timers'],
    ]);
  });

  test('idle state: the RPL owner and neighbour block the RPL, nothing else', () => {
    const [core, access] = net.g8032.rings;
    expect(core).toMatchObject({ state: 'idle', failed: [], blocked: [{ node: 'P3', link: 'P3-PE4', why: 'RPL' }, { node: 'PE4', link: 'P3-PE4', why: 'RPL' }] });
    expect(access).toMatchObject({ state: 'idle', blocked: [{ node: 'PE6', link: 'PE5-PE6', why: 'RPL' }, { node: 'PE5', link: 'PE5-PE6', why: 'RPL' }] });
    expect(core.timers).toEqual({ wtrMin: 1, guardMs: 500, holdOffMs: 0, revertive: true });
    expect(access.timers).toEqual({ wtrMin: 1, guardMs: 500, holdOffMs: 0, revertive: true }); // G.8032 defaults where not configured
    expect(ringDataPath(topo, net.g8032, '1', 'P3', 'PE4').nodes).toEqual(['P3', 'PE1', 'P2', 'PE4']); // around, not over the RPL
    // sub-ring frames cross the major ring between the interconnection nodes
    expect(ringDataPath(topo, net.g8032, '2', 'PE5', 'PE6').nodes).toEqual(['PE5', 'P2', 'PE4', 'PE6']);
  });

  test('protection state: a failed ring link is blocked at both ends and the RPL forwards', () => {
    const after = buildNetwork(topo, { labelMode: imp.labelMode, failures: ['P2-PE1'] });
    const core = after.g8032.rings[0];
    expect(core).toMatchObject({ state: 'protection', failed: ['P2-PE1'], blocked: [{ node: 'P2', link: 'P2-PE1', why: 'SF' }, { node: 'PE1', link: 'P2-PE1', why: 'SF' }] });
    expect(ringDataPath(topo, after.g8032, '1', 'P2', 'PE1').nodes).toEqual(['P2', 'PE4', 'P3', 'PE1']);
    expect(after.g8032.rings[1].state).toBe('idle'); // the sub-ring is not on that link
    // a link off every ring changes nothing
    expect(buildNetwork(topo, { labelMode: imp.labelMode, failures: ['P7-PE9'] }).g8032.rings.map((r) => r.state)).toEqual(['idle', 'idle']);
  });

  test('R-APS: group MAC per ring id; a frame sent on both ports covers the ring hop by hop', () => {
    expect(rapsGroupMac(1)).toBe('01:19:a7:00:00:01');
    expect(rapsGroupMac('2')).toBe('01:19:a7:00:00:02');
    const hops = rapsHops(topo, topo.rings[0], 'P2', { avoid: 'P2-PE1' });
    expect(hops).toEqual([
      { from: 'P2', to: 'PE4', link: 'P2-PE4', depth: 1 },
      { from: 'PE4', to: 'P3', link: 'P3-PE4', depth: 2 },
      { from: 'P3', to: 'PE1', link: 'P3-PE1', depth: 3 },
    ]);
    // the sub-ring's R-APS ends at the interconnection node
    expect(rapsHops(topo, topo.rings[1], 'PE5', { avoid: 'PE5-PE6' })).toEqual([{ from: 'PE5', to: 'P2', link: 'P2-PE5', depth: 1 }]);
  });
});

describe('ring link failure replay', () => {
  const r = replayFailure(topo, 'P2-PE1', { labelMode: imp.labelMode, detection: 'los' });
  const ring = r.replay.steps.filter((s) => s.layer === 'ring');

  test('loss of signal: SF at both ends at once, R-APS(SF) around the ring, RPL unblocked at 20 ms, protection at 30 ms', () => {
    expect(ring.slice(0, 2).map((s) => [s.title, s.status, s.network])).toEqual([
      ['t=0 ms: P2: ring-core Signal Fail on P2-PE1', 'dropped', 'after'],
      ['t=0 ms: PE1: ring-core Signal Fail on P2-PE1', 'dropped', 'after'],
    ]);
    expect(ring[0].actions).toContain('block ring port port0, flush the FDB');
    const owner = r.replay.steps.find((s) => s.title === 't=10 ms: ring-core R-APS(SF) PE1 -> P3');
    expect(owner.actions).toEqual(['R-APS(SF) from PE1 (node id, BPR): flush the FDB (§10.1.10)', 'RPL owner: unblock the RPL port on P3-PE4']);
    expect(owner.moves).toEqual([{ from: 'PE1', to: 'P3', link: 'P3-PE1', member: null }]);
    expect(owner.headers.map((h) => h.name)).toEqual(['Ethernet II', 'R-APS']);
    expect(owner.headers[0].fields).toMatchObject({ dst: '01:19:a7:00:00:01', 'VLAN (R-APS)': 4094, ethertype: '0x8902 (CFM)' });
    expect(owner.headers[1].fields).toMatchObject({ 'MEG level': 7, opcode: 40, request: 'SF (1011)', RB: 0 });
    const prot = r.replay.steps.find((s) => /protection state/.test(s.title));
    expect(prot.title).toBe('t=30 ms: ring-core: protection state');
    expect(prot.actions[0]).toBe('RPL P3-PE4 forwarding (unblocked by P3 and PE4); P2-PE1 blocked at P2 and PE1');
    expect(prot.actions[1]).toBe('ring-data: P2 -> PE1 now P2 -> PE4 -> P3 -> PE1');
    expect(prot).toMatchObject({ status: 'delivered', network: 'after' });
    expect(r.replay.steps.find((s) => /Converged/.test(s.title)).actions).toContain('G.8032 ring-core: protection (RPL forwarding, P2-PE1 blocked)');
  });

  test('repair: guard timer, R-APS(NR), WTR at the owner, R-APS(NR, RB) blocks the RPL again', () => {
    expect(titles(r)).toContain('t=60 s: P2-PE1 repaired');
    expect(titles(r)).toContain('t=60.5 s: P2, PE1: ring-core guard timer expires');
    const nr = r.replay.steps.find((s) => s.title === 't=60.01 s: ring-core R-APS(NR) PE1 -> P3');
    expect(nr.actions).toContain('RPL owner, revertive: start wait-to-restore (1 min, §10.1.4 c)');
    expect(titles(r)).toContain('t=120.01 s: P3: ring-core WTR expires');
    const rb = r.replay.steps.find((s) => s.title === 't=120.02 s: ring-core R-APS(NR, RB) P3 -> PE1');
    expect(rb.actions).toEqual(['R-APS(NR, RB) from P3: flush the FDB', 'unblock the recovered ring port on P2-PE1']);
    expect(rb.headers[1].fields).toMatchObject({ request: 'NR (0000)', RB: 1 });
    const last = r.replay.steps.at(-1);
    expect(last).toMatchObject({ title: 't=120.03 s: ring-core: idle state restored', status: 'delivered', network: 'before' });
    // the network while the repaired link waits for R-APS: up, RPL forwarding, the recovered ports blocked
    expect(r.networks.pending.g8032.rings[0]).toMatchObject({ state: 'pending', failed: [], blocked: [{ node: 'P2', link: 'P2-PE1', why: 'recovered' }, { node: 'PE1', link: 'P2-PE1', why: 'recovered' }] });
    expect(r.networks.pending.links['P2-PE1'].up).toBe(true);
    const ts = r.replay.steps.map((s) => s.t);
    expect(ts).toEqual([...ts].sort((a, b) => a - b));
  });

  test('silent failure without CFM on the ring ports: G.8032 acts when the port is declared down (IS-IS hold time)', () => {
    const s = replayFailure(topo, 'PE5-PE6', { labelMode: imp.labelMode, detection: 'ccm' });
    const sf = s.replay.steps.find((x) => /PE5: ring-access Signal Fail/.test(x.title));
    expect(sf.title).toBe('t=30 s: PE5: ring-access Signal Fail on PE5-PE6');
    expect(sf.actions[0]).toMatch(/^no CFM MEP on ring port port1 \(2\) in the facts/);
    // the RPL itself failed: it was blocked already, the sub-ring's R-APS ends at the interconnection nodes
    expect(sf.actions).toContain('ring port port1 is the RPL port: it was blocked already; flush the FDB');
    const hop = s.replay.steps.find((x) => /R-APS\(SF\) PE5 -> P2/.test(x.title));
    expect(hop.actions.at(-1)).toMatch(/interconnection node: the sub-ring's R-APS channel ends here/);
    const prot = s.replay.steps.find((x) => /ring-access: protection state/.test(x.title));
    expect(prot.actions[0]).toMatch(/^the failed link is the RPL/);
    expect(prot.actions[1]).toBe('ring-data: PE5 -> PE6 now PE5 -> P2 -> PE4 -> PE6 (through the interconnection nodes when it crosses the major ring)');
  });

  test('a link on no ring replays without ring steps', () => {
    const s = replayFailure(topo, 'P7-PE9', { labelMode: imp.labelMode });
    expect(s.replay.steps.some((x) => x.layer === 'ring')).toBe(false);
    expect(s.networks).toEqual({});
  });
});

describe('a pure L2 ring lab placed by the facts file\'s links[]', () => {
  // No interface on the two-ring fixture has an address: its links come from the extractor's
  // --clab topology (top-level links[], schema 1.5), and the rings sit on them.
  const file = readFileSync(new URL('../../tests/fixtures/expected/g8032-two-ring.facts.json', import.meta.url), 'utf8');
  const two = importFacts(file);

  test('the topology links become L2 links and carry both rings', () => {
    expect(two.topology.links.map((l) => [l.id, l.kind])).toEqual([
      ['RM_1-RM_2', 'l2'], ['RM_2-RM_3', 'l2'], ['RM_3-RM_4', 'l2'], ['RM_4-RM_1', 'l2'], ['RM_1-RS_1', 'l2'],
      ['RS_1-RS_2', 'l2'], ['RS_2-RM_4', 'l2'], ['CE_1-RM_2', 'l2'], ['CE_2-RM_3', 'l2'], ['CE_3-RS_1', 'l2'],
    ]);
    expect(two.report.gaps.physical.map((i) => i.item)).toContain('10 L2 links');
    const [major, sub] = two.topology.rings;
    expect(major.path).toEqual({ nodes: ['RM_4', 'RM_1', 'RM_2', 'RM_3'], links: ['RM_4-RM_1', 'RM_1-RM_2', 'RM_2-RM_3', 'RM_3-RM_4'], closed: true });
    expect(major.rpl).toEqual({ link: 'RM_4-RM_1', owner: 'RM_4', neighbor: 'RM_1' });
    expect(sub).toMatchObject({ type: 'sub', interconnect: ['RM_1', 'RM_4'], subRingOf: '1', rpl: { link: 'RM_1-RS_1', owner: 'RM_1', neighbor: 'RS_1' } });
    expect(sub.path).toEqual({ nodes: ['RM_1', 'RS_1', 'RS_2', 'RM_4'], links: ['RM_1-RS_1', 'RS_1-RS_2', 'RS_2-RM_4'], closed: false });
    expect(two.report.warnings.filter((w) => /ring/.test(w))).toEqual([]);
  });

  test('a ring link failure replays the R-APS exchange over the L2 links', () => {
    const s = replayFailure(two.topology, 'RM_2-RM_3', { labelMode: two.labelMode });
    expect(titles(s)).toContain('t=30 ms: ring_1: protection state');
    expect(titles(s)).toContain('t=120.01 s: RM_4: ring_1 WTR expires');
    expect(titles(s).at(-1)).toBe('t=120.03 s: ring_1: idle state restored');
    expect(buildNetwork(two.topology, { labelMode: two.labelMode }).g8032.rings.map((r) => r.state)).toEqual(['idle', 'idle']);
  });
});

describe('a SAOS 10 CLI ring without ring ids, joined by name', () => {
  // SAOS 10 CLI configs normally leave `ring-id` out (the YANG key is the ring name): the four
  // devices' rings carry ring_id null and are one ring, RING_A, by their name.
  const file = readFileSync(new URL('../../tests/fixtures/expected/g8032-by-name.facts.json', import.meta.url), 'utf8');
  const named = importFacts(file);
  const topo4 = named.topology;

  test('one ring across the four devices, with its RPL and path', () => {
    expect(topo4.rings).toHaveLength(1);
    const [ring] = topo4.rings;
    expect(ring).toMatchObject({ id: 'name:RING_A', ringId: null, joinedBy: 'name', name: 'RING_A', type: 'major', rapsVid: 4000, level: 1, wtrMin: 1, members: ['ring-fd'] });
    expect(ring.nodes.map((n) => [n.node, n.rpl])).toEqual([['AR_1', null], ['AR_2', 'owner'], ['AR_3', 'neighbor'], ['AR_4', null]]);
    expect(ring.rpl).toEqual({ link: 'AR_2-AR_3', owner: 'AR_2', neighbor: 'AR_3' });
    expect(ring.path).toEqual({ nodes: ['AR_2', 'AR_1', 'AR_4', 'AR_3'], links: ['AR_1-AR_2', 'AR_4-AR_1', 'AR_3-AR_4', 'AR_2-AR_3'], closed: true });
    expect(named.report.warnings).toEqual([]);
    expect(named.report.gaps.ring.map((i) => [i.source, i.item])).toEqual([
      ['facts', '1 G.8032 rings'], ['derived', 'ring links'], ['derived', 'rings joined by name'], ['default', 'protection timers'],
    ]);
    expect(named.report.gaps.ring[2].detail).toMatch(/^RING_A: no device configures a ring id/);
  });

  test('idle state and a failure replay on the name-joined ring: the RPL blocks, R-APS uses the default ring id 1', () => {
    const net4 = buildNetwork(topo4, { labelMode: named.labelMode });
    expect(net4.g8032.rings[0]).toMatchObject({ state: 'idle', blocked: [{ node: 'AR_2', link: 'AR_2-AR_3', why: 'RPL' }, { node: 'AR_3', link: 'AR_2-AR_3', why: 'RPL' }] });
    const s = replayFailure(topo4, 'AR_4-AR_1', { labelMode: named.labelMode, detection: 'los' });
    const sf = s.replay.steps.find((x) => x.title === 't=10 ms: RING_A R-APS(SF) AR_1 -> AR_2');
    expect(sf.actions).toContain('RPL owner: unblock the RPL port on AR_2-AR_3');
    expect(sf.headers[0].fields).toMatchObject({ dst: '01:19:a7:00:00:01', 'VLAN (R-APS)': 4000 });
    const prot = s.replay.steps.find((x) => x.title === 't=30 ms: RING_A: protection state');
    expect(prot.actions[0]).toBe('RPL AR_2-AR_3 forwarding (unblocked by AR_2 and AR_3); AR_4-AR_1 blocked at AR_4 and AR_1');
    expect(titles(s).at(-1)).toBe('t=120.03 s: RING_A: idle state restored');
  });

  // Hand-made files for the join rules: a ring id wins over the name; an id-less ring joins the one
  // ring id its name has elsewhere; two ids under one name leave the id-less ring alone.
  const ring = (ringName, ringId, rapsVid, ports, rpl = []) => ({
    name: ringName, ring_id: ringId, west: ports[0], east: ports[1], ports: [{ name: 'port0', interface: ports[0] }, { name: 'port1', interface: ports[1] }],
    instances: [{ name: `${ringName}-i`, type: 'major', raps_vid: rapsVid, raps_level: 7, virtual_channel: null, termination: null, sub_ring_of: null, revertive: null, timers: {}, members: [], rpl }],
  });
  const dev = (name, rings) => ({ device: name, type: '5162', status: 'ok', facts: { hostname: name, interfaces: [], fps: [], ports: {}, isis: { instances: [], interfaces: [] }, peers: [], pseudowires: [], cfm: { meps: [] }, rings } });
  const square = (a, b, c, d) => [{ a: { device: a, port: '2' }, b: { device: b, port: '1' } }, { a: { device: b, port: '2' }, b: { device: c, port: '1' } }, { a: { device: c, port: '2' }, b: { device: d, port: '1' } }, { a: { device: d, port: '2' }, b: { device: a, port: '1' } }];
  const fileOf = (devices, links) => JSON.stringify({ schema_version: '1.5.0', generator: { name: 'test', version: '0' }, links, devices });

  test('join rules: ring id first, then the one id a name has, else the name; two ids under one name is an ambiguity', () => {
    // X and Y configure ring id 5 as "R"; Z writes "R" with no id: it joins ring 5
    const one = importFacts(fileOf([dev('X', [ring('R', '5', 100, ['1', '2'], [{ port: 'port1', interface: '2', role: 'owner' }])]), dev('Y', [ring('R', '5', 100, ['1', '2'])]), dev('Z', [ring('R', null, 100, ['1', '2'])])], square('X', 'Y', 'Z', 'X')));
    expect(one.topology.rings.map((r) => [r.id, r.ringId, r.joinedBy, r.nodes.map((n) => n.node)])).toEqual([['5', '5', 'id', ['X', 'Y', 'Z']]]);
    expect(one.report.warnings.filter((w) => /join/.test(w))).toEqual([]);
    // "R" is ring id 5 on X and ring id 6 on Y: Z's id-less "R" could be either
    const two = importFacts(fileOf([dev('X', [ring('R', '5', 100, ['1', '2'])]), dev('Y', [ring('R', '6', 100, ['1', '2'])]), dev('Z', [ring('R', null, 100, ['1', '2'])])], []));
    expect(two.topology.rings.map((r) => [r.id, r.joinedBy, r.nodes.map((n) => n.node)])).toEqual([['5', 'id', ['X']], ['6', 'id', ['Y']], ['Z:R', 'device', ['Z']]]);
    expect(two.report.warnings).toContain('Z: ring R has no ring id and R is ring id 5 and 6 on other devices; it cannot be joined with either');
    // two id-less rings named "R" with different R-APS VIDs join by name, with the one warning that says why that may be wrong
    const vid = importFacts(fileOf([dev('X', [ring('R', null, 100, ['1', '2'])]), dev('Y', [ring('R', null, 101, ['1', '2'])])], []));
    expect(vid.topology.rings.map((r) => [r.id, r.nodes.length])).toEqual([['name:R', 2]]);
    expect(vid.report.warnings.filter((w) => /joined by name/.test(w))).toEqual(['ring R (joined by name, no ring id): R-APS VID 100 on X and 101 on Y; the two may be different rings']);
  });
});

describe('a subnet over the ring VLAN does not take the ring ports from the file\'s links[]', () => {
  // X - Y - Z is a cabled ring (links[]); X and Y also have a routed interface in one subnet on a
  // VLAN around the ring, on X port 1 (cabled to Z) and Y port 1 (cabled to X port 2). The subnet is
  // an L3 adjacency over the ring, not a cable: the cabled links keep the ports and carry the ring.
  const ring = (ports, rpl = []) => ({
    name: 'RING', ring_id: null, west: ports[0], east: ports[1], ports: [{ name: 'port0', interface: ports[0] }, { name: 'port1', interface: ports[1] }],
    instances: [{ name: 'RING-i', type: 'major', raps_vid: 4000, raps_level: 7, virtual_channel: null, termination: null, sub_ring_of: null, revertive: null, timers: {}, members: ['ring-fd'], rpl }],
  });
  const dev = (name, ip) => ({
    device: name, type: '5162', status: 'ok',
    facts: {
      hostname: name,
      interfaces: ip ? [{ name: 'svc', kind: 'ip', ip, ipv4: [ip], fd: 'svc-fd' }] : [],
      fps: ip ? [{ name: 'svc-fp', fd: 'svc-fd', logical_port: '1', classifiers: [] }] : [],
      ports: { 1: { roles: ['ring'], vlans: [], lag: null }, 2: { roles: ['ring'], vlans: [], lag: null } },
      isis: { instances: [], interfaces: [] }, peers: [], pseudowires: [], cfm: { meps: [] },
      rings: [ring(['1', '2'], name === 'Y' ? [{ port: 'port1', interface: '2', role: 'owner' }] : name === 'Z' ? [{ port: 'port0', interface: '1', role: 'neighbor' }] : [])],
    },
  });
  const links = [{ a: { device: 'X', port: '2' }, b: { device: 'Y', port: '1' } }, { a: { device: 'Y', port: '2' }, b: { device: 'Z', port: '1' } }, { a: { device: 'Z', port: '2' }, b: { device: 'X', port: '1' } }];
  const imp = importFacts(JSON.stringify({ schema_version: '1.5.0', generator: { name: 'test', version: '0' }, links, devices: [dev('X', '10.0.0.1/30'), dev('Y', '10.0.0.2/30'), dev('Z', null)] }));

  test('the subnet is a link without ports, the cables are L2 links, the ring is closed with its RPL', () => {
    expect(imp.topology.links.map((l) => [l.id, l.kind, l.a.port ?? null, l.b.port ?? null])).toEqual([
      ['X-Y', 'access', null, null], ['X-Y 2/1', 'l2', '2', '1'], ['Y-Z', 'l2', '2', '1'], ['Z-X', 'l2', '2', '1'],
    ]);
    const [r] = imp.topology.rings;
    expect(r.path).toMatchObject({ closed: true, links: expect.arrayContaining(['X-Y 2/1', 'Y-Z', 'Z-X']) });
    expect(r.rpl).toEqual({ link: 'Y-Z', owner: 'Y', neighbor: 'Z' });
    expect(imp.report.warnings.filter((w) => /ring/.test(w))).toEqual([]);
    const item = imp.report.gaps.physical.find((i) => /bridged domain/.test(i.item));
    expect(item.detail).toMatch(/^X-Y \(10\.0\.0\.0\/30\): X svc \(port 1, cabled to Z port 2\), Y svc \(port 1, cabled to X port 2\): the file's links\[\] cable those ports to other devices/);
  });
});
