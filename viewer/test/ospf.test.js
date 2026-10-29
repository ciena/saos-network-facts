// SPDX-License-Identifier: Apache-2.0
// OSPFv2, RFC 2328: Router-LSAs, area-scoped flooding, intra- and inter-area
// SPF, and the reconvergence replay. Hand-built topology:
//
//   area 0.0.0.0                       area 0.0.0.1
//   R1 ──10── R2 ──10── R3 ──10── R4 ──5/50── R5
//    └────────30────────┘ (ABR)
//
// R4-R5 has asymmetric costs (R4 end 5, R5 end 50).
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/network.js';
import { neighborFsm, normArea, fmtSeq, INITIAL_SEQ } from '../src/engine/ospf.js';
import { ospfFloodWalk, dataWalk } from '../src/engine/walk.js';
import { replayFailure } from '../src/engine/replay.js';

function link(id, a, b, n, metric, extra = {}) {
  return { id, kind: 'core', metric, subnet: `10.1.${n}.0/30`, lag: false, a: { node: a, if: `to-${b}`, ip: `10.1.${n}.1` }, b: { node: b, if: `to-${a}`, ip: `10.1.${n}.2` }, members: [{ id, a: `to-${b}`, b: `to-${a}` }], ...extra };
}

export function ospfTopo() {
  return {
    name: 'ospf test',
    igp: 'ospf',
    nodes: [1, 2, 3, 4, 5].map((i) => ({ id: `R${i}`, role: i === 1 || i === 5 ? 'pe' : 'p', loopback: `10.0.0.${i}`, pos: { x: i * 5, z: 0 }, ...(i >= 4 ? { loopbackArea: '0.0.0.1' } : {}) })),
    links: [
      link('R1-R2', 'R1', 'R2', 1, 10),
      link('R2-R3', 'R2', 'R3', 2, 10),
      link('R1-R3', 'R1', 'R3', 3, 30),
      link('R3-R4', 'R3', 'R4', 4, 10, { area: '0.0.0.1' }),
      link('R4-R5', 'R4', 'R5', 5, 5, { area: 1, cost: { a: 5, b: 50 } }),
    ],
    vrfs: [],
  };
}

const net = buildNetwork(ospfTopo(), { labelMode: 'none' });

describe('OSPF adjacencies and Router-LSAs (RFC 2328 §10, §12.4)', () => {
  test('normalizes area IDs to dotted quad', () => {
    expect(normArea(0)).toBe('0.0.0.0');
    expect(normArea('1')).toBe('0.0.0.1');
    expect(normArea('0.0.0.7')).toBe('0.0.0.7');
    expect(normArea(null)).toBeNull();
  });

  test('brings every p2p neighbour to Full, in the link area', () => {
    expect(net.igpName).toBe('ospf');
    expect(net.isis.routers).toEqual([]);
    expect(net.ospf.adjacencies.map((a) => `${a.link}:${a.area}:${a.nbrState}`)).toEqual([
      'R1-R2:0.0.0.0:Full', 'R2-R3:0.0.0.0:Full', 'R1-R3:0.0.0.0:Full', 'R3-R4:0.0.0.1:Full', 'R4-R5:0.0.0.1:Full',
    ]);
    expect(net.ospf.abrs).toEqual(['R3']);
    expect(net.ospf.areas.R3).toEqual(['0.0.0.0', '0.0.0.1']);
  });

  test('walks the neighbour FSM Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full', () => {
    const fsm = neighborFsm('R1', 'R2', '10.0.0.1', '10.0.0.2');
    expect(fsm.map((s) => s.state)).toEqual(['Init', '2-Way', 'ExStart', 'Exchange', 'Loading', 'Full']);
    expect(fsm[2].note).toContain('R2 is master'); // higher router ID
  });

  test('originates a Router-LSA with p2p links (type 1) and stubs (type 3)', () => {
    const lsa = net.ospf.lsas.R1['0.0.0.0'];
    expect(lsa).toMatchObject({ lsType: 1, lsId: '10.0.0.1', advRouter: '10.0.0.1', seq: INITIAL_SEQ, abr: false });
    expect(fmtSeq(lsa.seq)).toBe('0x80000001');
    expect(lsa.links.map((l) => [l.linkId, l.linkData, l.metric])).toEqual([
      ['10.0.0.2', '10.1.1.1', 10],
      ['10.0.0.3', '10.1.3.1', 30],
    ]);
    expect(lsa.stubs.map((s) => `${s.prefix}:${s.metric}`)).toEqual(['10.0.0.1/32:0', '10.1.1.0/30:10', '10.1.3.0/30:30']);
    expect(net.ospf.lsas.R3['0.0.0.1'].abr).toBe(true);
    expect(net.ospf.lsas.R5['0.0.0.1'].links[0].metric).toBe(50); // R5's own end cost
  });

  test('keeps each area\'s LSDB to the routers of that area', () => {
    expect(net.ospf.lsdb.R1['0.0.0.0'].map((l) => l.origin)).toEqual(['R1', 'R2', 'R3']);
    expect(net.ospf.lsdb.R5['0.0.0.1'].map((l) => l.origin)).toEqual(['R3', 'R4', 'R5']);
  });
});

describe('OSPF SPF and routing table (RFC 2328 §16)', () => {
  const route = (r, p) => net.ospf.rib[r][p];

  test('prefers the two-hop path over the expensive direct link', () => {
    expect(route('R1', '10.0.0.3/32')).toMatchObject({ metric: 20, type: 'intra', area: '0.0.0.0' });
    expect(route('R1', '10.0.0.3/32').nextHops).toEqual([{ node: 'R2', link: 'R1-R2' }]);
  });

  test('adds inter-area routes from the ABR\'s Summary-LSAs (§16.2)', () => {
    expect(net.ospf.summaries['0.0.0.0'].find((s) => s.prefix === '10.0.0.5/32')).toMatchObject({ origin: 'R3', metric: 15 });
    // R1 -> R3 (20) + R3's cost to R5 in area 1 (10 + 5)
    expect(route('R1', '10.0.0.5/32')).toMatchObject({ metric: 35, type: 'inter' });
    expect(route('R1', '10.0.0.5/32').nextHops).toEqual([{ node: 'R2', link: 'R1-R2' }]);
  });

  test('uses each end\'s own cost: the reverse path is 80, not 35', () => {
    // R5 -> R4 (50) -> R3 (10) + R3's summary of R1's loopback (20)
    expect(route('R5', '10.0.0.1/32')).toMatchObject({ metric: 80, type: 'inter', area: '0.0.0.1' });
  });

  test('prefers intra-area routes and keeps local prefixes', () => {
    expect(route('R3', '10.0.0.4/32')).toMatchObject({ type: 'intra', area: '0.0.0.1', metric: 10 });
    expect(route('R1', '10.0.0.1/32').local).toBe(true);
  });

  test('reroutes when a link fails: R1 -> R3 over the direct link', () => {
    const after = buildNetwork(ospfTopo(), { labelMode: 'none', failures: ['R2-R3'] });
    expect(after.ospf.rib.R1['10.0.0.3/32']).toMatchObject({ metric: 30, nextHops: [{ node: 'R3', link: 'R1-R3' }] });
    expect(after.ospf.adjacencies.find((a) => a.link === 'R2-R3').nbrState).toBe('Down');
  });

  test('drives LDP like IS-IS does: labels for every loopback across areas', () => {
    const ldp = buildNetwork(ospfTopo(), { labelMode: 'ldp' });
    expect(Object.keys(ldp.mpls.ftn.R1)).toContain('10.0.0.5/32');
    expect(ldp.mpls.sessions).toHaveLength(5);
  });
});

describe('OSPF flooding (RFC 2328 §13)', () => {
  const w = ospfFloodWalk(net, 'R1');

  test('floods the refreshed Router-LSA in area 0 only', () => {
    expect(w.title).toBe('OSPF Router-LSA flood from R1 (area 0.0.0.0)');
    expect(w.transmissions.map((x) => `${x.t}:${x.from}>${x.to}:${x.result}`)).toEqual([
      '10:R1>R2:installed', '10:R1>R3:installed', '20:R3>R2:duplicate', '20:R2>R3:duplicate',
    ]);
    expect(w.transmissions.some((x) => ['R4', 'R5'].includes(x.to))).toBe(false);
  });

  test('carries an LS Update to AllSPFRouters with the Router-LSA', () => {
    const h = Object.fromEntries(w.steps[0].headers.map((x) => [x.name, x.fields]));
    expect(h.IPv4).toMatchObject({ dst: '224.0.0.5 (AllSPFRouters)', protocol: '89 (OSPF)', ttl: 1 });
    expect(h.OSPF).toMatchObject({ type: '4 (Link State Update)', areaId: '0.0.0.0', routerId: '10.0.0.1' });
    expect(h['Router-LSA']).toMatchObject({ seq: '0x80000002', linkStateId: '10.0.0.1' });
  });

  test('floods in area 1 from the ABR', () => {
    const w1 = ospfFloodWalk(net, 'R3', '0.0.0.1');
    expect(w1.transmissions.map((x) => x.to)).toEqual(['R4', 'R5']);
  });

  test('IP-forwards over OSPF routes when no CE walk exists', () => {
    expect(() => dataWalk(net, 'R1', 'R5')).toThrow(/not a CE/);
  });
});

describe('OSPF failure replay', () => {
  test('lays out neighbour down -> LSA re-origination -> flood -> SPF', () => {
    const r = replayFailure(ospfTopo(), 'R2-R3', { labelMode: 'none', detection: 'los' });
    const titles = r.replay.steps.map((s) => s.title);
    expect(titles).toContain('t=0 ms: R2: OSPF neighbour R3 on R2-R3 Full -> Down');
    expect(titles).toContain('t=50 ms: R2 originates Router-LSA 10.0.0.2 seq 0x80000002 (area 0.0.0.0)');
    const spf = r.replay.steps.find((s) => s.title.includes('R1: SPF'));
    expect(spf.actions).toContain('10.0.0.3/32: via R2 (20) -> via R3 (30)');
    // R5 is in area 1: it runs SPF on the ABR's new summaries.
    expect(titles.some((t) => t.includes('R5: SPF'))).toBe(true);
    expect(r.after.ospf.lsas.R2['0.0.0.0'].seq).toBe(INITIAL_SEQ + 1);
  });

  test('detects a silent failure by BFD when both ends run it (no link MEG)', () => {
    const topo = { ...ospfTopo(), cfm: { linkMegs: false } };
    topo.links[1].bfd = true;
    const r = replayFailure(topo, 'R2-R3', { labelMode: 'none' });
    expect(r.replay.steps.map((s) => s.title)).toContain('t=30 ms: R2: BFD session on R2-R3 Down');
    expect(r.replay.steps.find((s) => s.title.includes('R2: OSPF neighbour')).t).toBe(30);
  });
});
