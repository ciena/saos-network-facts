// SPDX-License-Identifier: Apache-2.0
// Link aggregation: IEEE 802.1AX-2014 (LACP state §6.4.2.3, distribution §6.6).
import { describe, expect, test } from 'vitest';
import { builtinTopology } from '../src/engine/topology.js';
import { buildNetwork } from '../src/engine/network.js';
import { describeLacpState, selectMember } from '../src/engine/lag.js';
import { fnv1a32 } from '../src/engine/hash.js';
import { rfcVendor } from '../src/engine/vendor.js';

const topo = builtinTopology();

describe('FNV-1a 32 (flow hash)', () => {
  test('matches the published test vectors', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
    expect(fnv1a32('a')).toBe(0xe40c292c);
    expect(fnv1a32('foobar')).toBe(0xbf9cf968);
  });
});

describe('LACP bundling', () => {
  test('both members of PE1-P1 collect and distribute: state 0x3f', () => {
    const lag = buildNetwork(topo).links['PE1-P1'];
    expect(lag.up).toBe(true);
    expect(lag.distributing).toEqual(['PE1-P1/1', 'PE1-P1/2']);
    // Activity 0x01 | Timeout 0x02 | Aggregation 0x04 | Sync 0x08 | Collecting 0x10 | Distributing 0x20
    expect(lag.members[0].actorState).toBe(0x3f);
    expect(describeLacpState(0x3f)).toEqual(['activity', 'timeout', 'aggregation', 'synchronization', 'collecting', 'distributing']);
  });

  test('a failed member leaves the bundle; the LAG stays up on the other', () => {
    const lag = buildNetwork(topo, { failures: ['PE1-P1/1'] }).links['PE1-P1'];
    expect(lag.up).toBe(true);
    expect(lag.distributing).toEqual(['PE1-P1/2']);
    expect(lag.members[0].actorState).toBe(0x07); // out of sync, not collecting/distributing
  });

  test('with every member down the LAG is down', () => {
    const lag = buildNetwork(topo, { failures: ['PE1-P1/1', 'PE1-P1/2'] }).links['PE1-P1'];
    expect(lag.up).toBe(false);
  });

  test('a plain link is one member and carries no LACP state', () => {
    const l = buildNetwork(topo).links['P1-P2'];
    expect(l).toMatchObject({ lag: false, up: true, distributing: ['P1-P2'] });
    expect(l.members[0].actorState).toBeUndefined();
  });
});

describe('frame distribution: member = hash(flow) mod N', () => {
  const fixed = (h) => ({ ...rfcVendor, lacp: { ...rfcVendor.lacp, hash: () => h } });
  const lag = buildNetwork(topo).links['PE1-P1'];

  test('hash 7 mod 2 = 1 -> second member; hash 8 mod 2 = 0 -> first', () => {
    expect(selectMember(lag, {}, fixed(7))).toEqual({ member: 'PE1-P1/2', hash: 7, index: 1, of: 2 });
    expect(selectMember(lag, {}, fixed(8)).member).toBe('PE1-P1/1');
  });

  test('a conversation always maps to the same member', () => {
    const flow = { src: '192.168.1.10', dst: '192.168.2.20', proto: 'UDP', sport: 49152, dport: 5001 };
    const a = selectMember(lag, flow, rfcVendor);
    expect(selectMember(lag, { ...flow }, rfcVendor)).toEqual(a);
    expect(a.hash).toBe(fnv1a32('192.168.1.10|192.168.2.20|UDP|49152|5001'));
  });

  test('one distributing member takes every flow', () => {
    const one = buildNetwork(topo, { failures: ['PE1-P1/2'] }).links['PE1-P1'];
    expect(selectMember(one, {}, fixed(7)).member).toBe('PE1-P1/1');
  });
});
