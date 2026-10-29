// SPDX-License-Identifier: Apache-2.0
// BGP: RFC 4271 (FSM §8, decision process §9.1), RFC 4760 (MP_REACH_NLRI),
// RFC 4364 (VPN-IPv4, RD, RT import/export).
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { bestPath, buildUpdate, fsmToEstablished, ORIGIN } from '../src/engine/bgp.js';
import { dataWalk } from '../src/engine/walk.js';

const base = {
  localPref: 100,
  asPath: [],
  origin: ORIGIN.IGP,
  med: 0,
  neighborAs: 65000,
  ebgp: false,
  igpCost: 10,
  bgpId: '10.0.0.9',
  peerAddr: '10.0.0.9',
};
const r = (id, over) => ({ id, ...base, ...over });

describe('RFC 4271 §9.1.2.2 best path', () => {
  test('a single candidate wins as the only path', () => {
    expect(bestPath([r('a', {})])).toMatchObject({ best: { id: 'a' }, reason: 'only path' });
  });
  test('highest LOCAL_PREF first', () => {
    expect(bestPath([r('a', {}), r('b', { localPref: 200, asPath: [1, 2, 3] })]).best.id).toBe('b');
  });
  test('then shortest AS_PATH', () => {
    expect(bestPath([r('a', { asPath: [1, 2] }), r('b', { asPath: [1] })]).best.id).toBe('b');
  });
  test('then lowest ORIGIN (IGP < EGP < INCOMPLETE)', () => {
    expect(bestPath([r('a', { origin: ORIGIN.INCOMPLETE }), r('b', { origin: ORIGIN.EGP })]).best.id).toBe('b');
  });
  test('then lowest MED, only among routes from the same neighbour AS', () => {
    expect(bestPath([r('a', { med: 50 }), r('b', { med: 10 })]).best.id).toBe('b');
    // Different neighbour ASes: MED not compared, falls through to IGP cost.
    const res = bestPath([r('a', { med: 50, neighborAs: 1, igpCost: 5 }), r('b', { med: 10, neighborAs: 2 })]);
    expect(res.best.id).toBe('a');
    expect(res.reason).toMatch(/IGP cost/);
  });
  test('then eBGP over iBGP', () => {
    expect(bestPath([r('a', {}), r('b', { ebgp: true })]).best.id).toBe('b');
  });
  test('then lowest IGP cost to NEXT_HOP', () => {
    expect(bestPath([r('a', { igpCost: 40 }), r('b', { igpCost: 30 })]).best.id).toBe('b');
  });
  test('then lowest BGP Identifier, then lowest peer address', () => {
    expect(bestPath([r('a', { bgpId: '10.0.0.4' }), r('b', { bgpId: '10.0.0.10' })]).best.id).toBe('a');
    const res = bestPath([r('a', { peerAddr: '10.0.0.20' }), r('b', { peerAddr: '10.0.0.3' })]);
    expect(res).toMatchObject({ best: { id: 'b' }, reason: 'lowest peer address (§9.1.2.2 g)' });
  });
});

describe('RFC 4271 §8 FSM', () => {
  test('Idle -> Connect -> OpenSent -> OpenConfirm -> Established', () => {
    const t = fsmToEstablished();
    expect([t[0].from, ...t.map((x) => x.to)]).toEqual(['Idle', 'Connect', 'OpenSent', 'OpenConfirm', 'Established']);
  });
});

describe('L3VPN between PE loopbacks (RFC 4364)', () => {
  const net = buildNetwork(builtinTopology());

  test('iBGP PE1-PE2 is Established over IGP-reachable loopbacks', () => {
    expect(net.bgp.sessions).toEqual([{ a: 'PE1', b: 'PE2', aAddr: '10.0.0.1', bAddr: '10.0.0.4', client: null, state: 'Established' }]);
  });

  test('PE2 exports CE2 routes with RD 10.0.0.4:1, RT 65000:100 and per-prefix labels', () => {
    // PE2 ordinal 5: VPN label block 100000 + 5*1000.
    expect(net.bgp.originated.PE2.map((x) => `${x.rd}:${x.prefix}/${x.label}`)).toEqual([
      '10.0.0.4:1:192.168.2.0/24/105000',
      '10.0.0.4:1:172.16.2.0/30/105001',
    ]);
  });

  test('PE1 imports by RT into VRF CUST-A with NEXT_HOP PE2 and IGP cost 30', () => {
    expect(net.bgp.vrfs.PE1['CUST-A']['192.168.2.0/24']).toMatchObject({
      type: 'bgp',
      nextHop: '10.0.0.4',
      vpnLabel: 105000,
      igpCost: 30,
      rd: '10.0.0.4:1',
    });
  });

  test('a route target that does not match the import policy is not imported', () => {
    const topo = builtinTopology();
    topo.vrfs[0].rt.import = ['65000:999'];
    const n = buildNetwork(topo);
    expect(n.bgp.vrfs.PE1['CUST-A']['192.168.2.0/24']).toBeUndefined();
  });

  test('UPDATE carries the route in MP_REACH_NLRI, AFI 1 / SAFI 128 (RFC 4760 §3)', () => {
    const u = buildUpdate(net.bgp.originated.PE2[0]);
    expect(u.pathAttributes.MP_REACH_NLRI).toEqual({
      afi: 1,
      safi: 128,
      nextHop: '0:0:10.0.0.4',
      nlri: [{ label: 105000, rd: '10.0.0.4:1', prefix: '192.168.2.0/24' }],
    });
    expect(u.pathAttributes.EXTENDED_COMMUNITIES).toEqual(['RT:65000:100']);
  });

  test('with PE1 isolated the session drops and no VPN routes resolve (§9.1.2.1)', () => {
    const n = buildNetwork(builtinTopology(), { failures: ['PE1-P1'] });
    expect(n.bgp.sessions[0].state).toBe('Active');
    expect(Object.values(n.bgp.vrfs.PE1['CUST-A']).filter((x) => x.type === 'bgp')).toEqual([]);
  });
});

describe('route reflection (RFC 4456) instead of the full mesh', () => {
  // PE1 and PE2 peer only with P1, both as its clients.
  const topo = { ...builtinTopology(), bgp: { sessions: [{ a: 'P1', b: 'PE1', client: 'PE1' }, { a: 'P1', b: 'PE2', client: 'PE2' }] } };
  const net = buildNetwork(topo);

  test('P1 reflects a client route to the other client with ORIGINATOR_ID', () => {
    const r = net.bgp.adjRibIn.PE1.find((x) => x.prefix === '192.168.2.0/24');
    expect(r).toMatchObject({ from: 'P1', reflectedBy: 'P1', originatorId: 'PE2', nextHop: '10.0.0.4' });
    expect(net.bgp.adjRibIn.PE2.some((x) => x.originator === 'PE2')).toBe(false);
  });

  test('PE1 installs CE2 with the unchanged next hop PE2 and the data walk still delivers', () => {
    expect(net.bgp.vrfs.PE1['CUST-A']['192.168.2.0/24']).toMatchObject({ type: 'bgp', nextHop: '10.0.0.4', from: 'P1' });
    expect(dataWalk(net, 'CE1', 'CE2').delivered).toBe(true);
  });

  test('a session configured on one end only stays Active', () => {
    const one = buildNetwork({ ...topo, bgp: { sessions: [{ a: 'P1', b: 'PE1', client: 'PE1', configuredOn: ['PE1'] }] } });
    expect(one.bgp.sessions[0]).toMatchObject({ state: 'Active', reason: 'not configured on P1' });
  });
});
