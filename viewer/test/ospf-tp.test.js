// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildNetwork, replayFailure } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';
import { scalePositions } from '../src/import/layout.js';

// The synthetic OSPF / MPLS-TP lab of the Python tests: PE1 - P1 - PE2 (TP-1) and PE1 - P2 - PE2
// (TP-1-B, its 1:1 backup), LSP BFD on both, a static VPWS pseudowire on TP-1.
const text = readFileSync(new URL('../../tests/fixtures/expected/ospf-tp.facts.json', import.meta.url), 'utf8');

describe('OSPF and MPLS-TP from the facts', () => {
  const imp = importFacts(text);
  const topo = imp.topology;
  const net = buildNetwork(topo, { labelMode: imp.labelMode });

  test('OSPF is the IGP when only OSPF is configured; router ids and loopback areas from the facts', () => {
    expect(topo.igp).toBe('ospf');
    expect(topo.nodes.map((n) => [n.id, n.role, n.routerId, n.loopbackArea])).toEqual([
      ['P1', 'p', '192.0.2.12', '0.0.0.0'],
      ['P2', 'p', '192.0.2.14', '0.0.0.0'],
      ['PE1', 'pe', '192.0.2.11', '0.0.0.0'],
      ['PE2', 'pe', '192.0.2.13', '0.0.0.0'],
    ]);
    expect(imp.report.warnings).toEqual([]);
  });

  test('core links carry the area and the configured metric', () => {
    expect(topo.links.map((l) => [l.id, l.kind, l.area, l.metric])).toEqual([
      ['P1-PE1', 'core', '0.0.0.0', 10],
      ['P1-PE2', 'core', '0.0.0.0', 10],
      ['P2-PE1', 'core', '0.0.0.0', 20],
      ['P2-PE2', 'core', '0.0.0.0', 20],
    ]);
    expect(net.igpName).toBe('ospf');
    expect(net.ospf.adjacencies.every((a) => a.state === 'Up')).toBe(true);
    expect(net.ospf.adjacencies).toHaveLength(4);
  });

  test('tunnel segments are stitched from the ingress; the backup protects the primary', () => {
    expect(topo.tpTunnels.map((t) => [t.id, t.src, t.dst, t.role, t.protects, t.links, t.oam])).toEqual([
      ['TP-1', 'PE1', 'PE2', 'primary', undefined, ['P1-PE1', 'P1-PE2'], { kind: 'bfd', intervalMs: 10 }],
      ['TP-1-B', 'PE1', 'PE2', 'backup', 'TP-1', ['P2-PE1', 'P2-PE2'], { kind: 'bfd', intervalMs: 10 }],
    ]);
    expect(topo.tpTunnels[0].hops.map((h) => [h.node, h.fwdIn, h.fwdOut, h.revIn, h.revOut])).toEqual([
      ['PE1', null, 1001, 1002, null],
      ['P1', 1001, 1003, 1004, 1002],
      ['PE2', 1003, null, null, 1004],
    ]);
    expect(net.tp.tunnels.map((t) => [t.id, t.state])).toEqual([['TP-1', 'Up'], ['TP-1-B', 'Up']]);
    expect(imp.labelMode).toBe('none');
  });

  test('the static pseudowire rides TP-1 with its configured labels, and TP-1-B when TP-1 fails', () => {
    const [pw] = net.vpws.pseudowires;
    expect(pw).toMatchObject({ service: 'VPWS-200', pwid: 200, static: true, state: 'Up' });
    expect(pw.ends.map((e) => [e.node, e.ac.name, e.transport.tunnel, e.localLabel, e.remoteLabel])).toEqual([
      ['PE1', 'FP-AC-200', 'TP-1', 2001, 2001],
      ['PE2', 'FP-AC-200', 'TP-1', 2001, 2001],
    ]);
    const { after } = replayFailure(topo, 'P1-PE1', { labelMode: imp.labelMode });
    expect(after.vpws.pseudowires[0].state).toBe('Up');
    expect(after.vpws.pseudowires[0].ends.map((e) => e.transport.tunnel)).toEqual(['TP-1-B', 'TP-1-B']);
  });

  test('the import report has OSPF and MPLS-TP rows', () => {
    expect(Object.keys(imp.report.gaps)).toEqual(expect.arrayContaining(['ospf', 'mpls-tp', 'pw']));
    expect(imp.report.gaps.isis).toBeUndefined();
  });
});

describe('authored positions', () => {
  const positions = { positions: { PE1: [100, 300], P1: [300, 150], P2: [300, 450], PE2: [500, 300] } };

  test('used when they place every device, scaled into the scene with y down as z', () => {
    const imp = importFacts(text, { positions });
    const pos = Object.fromEntries(imp.topology.nodes.map((n) => [n.id, n.pos]));
    expect(pos.PE1.x).toBeLessThan(pos.P1.x);
    expect(pos.P1.x).toBeCloseTo(pos.P2.x);
    expect(pos.P1.z).toBeLessThan(pos.P2.z);
    expect(imp.report.gaps.physical.find((i) => i.item === 'positions').source).toBe('authored');
  });

  test('a device without a position falls back to the layout, with a warning', () => {
    const imp = importFacts(text, { positions: { PE1: [0, 0], P1: { x: 1, y: 2 } } });
    expect(imp.report.warnings).toEqual(['positions: no position for P2, PE2; the layout is computed instead']);
    expect(imp.report.gaps.physical.find((i) => i.item === 'positions').source).toBe('derived');
  });

  test('scalePositions takes arrays or {x, y} and reports the ids it lacks', () => {
    expect(scalePositions(['A', 'B'], { A: [0, 0], B: { x: 10, y: 0 } }).missing).toEqual([]);
    expect(scalePositions(['A', 'B'], { A: [0, 'x'] }).missing).toEqual(['A', 'B']);
  });
});
