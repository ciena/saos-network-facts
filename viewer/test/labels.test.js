// SPDX-License-Identifier: Apache-2.0
// The Labels panel's options (view/labels.js): device names only, iBGP labels only when a session
// is down, LAG labels on or off; the defaults keep every label as before.
import { describe, expect, test } from 'vitest';
import { DEFAULT_LABELS, bgpLabel, labelOptions, lagLabel, nodeLabel } from '../src/view/labels.js';

describe('label options', () => {
  test('defaults draw every label as before', () => {
    expect(DEFAULT_LABELS).toEqual({ node: 'full', bgp: 'all', lag: true, scale: 1 });
    expect(nodeLabel({ id: 'PE1', loopback: '2001:db8::1' })).toBe('PE1 2001:db8::1');
    expect(nodeLabel({ id: 'CE1', lan: '192.168.1.0/24' })).toBe('CE1 192.168.1.0/24');
    expect(bgpLabel({ state: 'Established', client: 'PE1' })).toBe('iBGP Established · RR client PE1');
    expect(bgpLabel({ state: 'Established', client: null }, DEFAULT_LABELS, false)).toBe('iBGP Established · VPNv4');
    expect(lagLabel({ a: { if: 'lag1' }, members: [1, 2] }, 2)).toBe('lag1 LAG 2/2');
  });

  test('names only', () => {
    expect(nodeLabel({ id: 'PE1', loopback: '2001:db8::1' }, labelOptions({ node: 'name' }))).toBe('PE1');
  });

  test('iBGP labels only for sessions that are down, or none', () => {
    const down = labelOptions({ bgp: 'down' });
    expect(bgpLabel({ state: 'Established', client: 'PE1' }, down)).toBeNull();
    expect(bgpLabel({ state: 'Active', client: 'PE1' }, down)).toBe('iBGP Active · RR client PE1');
    expect(bgpLabel({ state: 'Active' }, labelOptions({ bgp: 'none' }))).toBeNull();
  });

  test('LAG labels behind a toggle', () => {
    expect(lagLabel({ a: { if: 'lag1' }, members: [1, 2] }, 1, labelOptions({ lag: false }))).toBeNull();
  });

  test('stored options keep only known keys and values', () => {
    expect(labelOptions({ node: 'x', bgp: 'down', lag: 'no', scale: 9, extra: 1 })).toEqual({ node: 'full', bgp: 'down', lag: true, scale: 1 });
    expect(labelOptions({ scale: '1.2' }).scale).toBe(1.2);
    expect(labelOptions(null)).toEqual(DEFAULT_LABELS);
  });
});
