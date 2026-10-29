// SPDX-License-Identifier: Apache-2.0
// MPLS-TP co-routed bidirectional LSPs (RFC 5654/5921/5960, IDs RFC 6370):
// static per-hop label tables in both directions, a static PW over the
// tunnel, OAM-driven failure detection and 1:1 protection (RFC 6378).
// Hand-built topology, OSPF as the IGP, no LDP/SR:
//
//   A ── B ── E ── C        working LSP  W: A -> B -> E -> C
//   └─── D ───────┘         protection   P: A -> D -> C
import { describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/network.js';
import { GAL, labelErrors } from '../src/engine/mplstp.js';
import { tpTunnelWalk, vpwsWalk } from '../src/engine/walk.js';
import { replayFailure } from '../src/engine/replay.js';

function link(id, a, b, n) {
  return { id, kind: 'core', metric: 10, subnet: `10.2.${n}.0/30`, lag: false, a: { node: a, if: `to-${b}`, ip: `10.2.${n}.1` }, b: { node: b, if: `to-${a}`, ip: `10.2.${n}.2` }, members: [{ id, a: `to-${b}`, b: `to-${a}` }] };
}

function tpTopo({ oam = { kind: 'bfd' }, backup = true } = {}) {
  const W = {
    id: 'W', src: 'A', dst: 'C', role: 'primary', oam,
    hops: [
      { node: 'A', fwdIn: null, fwdOut: 101, revIn: 204, revOut: null },
      { node: 'B', fwdIn: 101, fwdOut: 102, revIn: 203, revOut: 204 },
      { node: 'E', fwdIn: 102, fwdOut: 103, revIn: 202, revOut: 203 },
      { node: 'C', fwdIn: 103, fwdOut: null, revIn: null, revOut: 202 },
    ],
    links: ['A-B', 'B-E', 'C-E'],
  };
  const P = {
    id: 'P', src: 'A', dst: 'C', role: 'backup', protects: 'W', oam,
    hops: [
      { node: 'A', fwdIn: null, fwdOut: 501, revIn: 602, revOut: null },
      { node: 'D', fwdIn: 501, fwdOut: 502, revIn: 601, revOut: 602 },
      { node: 'C', fwdIn: 502, fwdOut: null, revIn: null, revOut: 601 },
    ],
    links: ['A-D', 'C-D'],
  };
  return {
    name: 'tp test',
    igp: 'ospf',
    cfm: { linkMegs: false },
    nodes: ['A', 'B', 'E', 'C', 'D'].map((id, i) => ({ id, role: ['A', 'C'].includes(id) ? 'pe' : 'p', loopback: `10.0.1.${i + 1}`, pos: { x: i * 5, z: 0 } })),
    links: [link('A-B', 'A', 'B', 1), link('B-E', 'B', 'E', 2), link('C-E', 'C', 'E', 3), link('A-D', 'A', 'D', 4), link('C-D', 'C', 'D', 5)],
    vrfs: [],
    tpTunnels: backup ? [W, P] : [W],
    pseudowires: [
      {
        id: 'PW7', service: 'svc7', pwid: 7, static: true,
        ends: [
          { node: 'A', ac: { name: 'ac7', port: '9' }, underlay: 'mpls-tp', tunnel: 'W', rxLabel: 7001, txLabel: 7002 },
          { node: 'C', ac: { name: 'ac7', port: '9' }, underlay: 'mpls-tp', tunnel: 'W', rxLabel: 7002, txLabel: 7001 },
        ],
      },
    ],
  };
}

const net = buildNetwork(tpTopo(), { labelMode: 'none' });
const stacks = (w) => w.steps.map((s) => s.headers.filter((h) => h.name === 'MPLS').map((h) => h.fields.label));

describe('MPLS-TP static label tables (RFC 5960 §3)', () => {
  test('installs swap entries on transit nodes for both directions', () => {
    expect(net.tp.lfib.B[101]).toMatchObject({ tunnel: 'W', dir: 'fwd', op: 'swap', outLabel: 102, next: 'E', link: 'B-E' });
    expect(net.tp.lfib.B[203]).toMatchObject({ tunnel: 'W', dir: 'rev', op: 'swap', outLabel: 204, next: 'A', link: 'A-B' });
    expect(net.tp.lfib.E[102]).toMatchObject({ dir: 'fwd', outLabel: 103, next: 'C' });
    expect(net.tp.lfib.E[202]).toMatchObject({ dir: 'rev', outLabel: 203, next: 'B' });
  });

  test('pops at the ultimate hop of each direction (no PHP)', () => {
    expect(net.tp.lfib.C[103]).toMatchObject({ dir: 'fwd', op: 'pop', next: null });
    expect(net.tp.lfib.A[204]).toMatchObject({ dir: 'rev', op: 'pop', next: null });
  });

  test('has the ingress of each direction push its out label', () => {
    expect(net.tp.head.A.W).toEqual({ dir: 'fwd', outLabel: 101, link: 'A-B', next: 'B' });
    expect(net.tp.head.C.W).toEqual({ dir: 'rev', outLabel: 202, link: 'C-E', next: 'E' });
  });

  test('names tunnel, LSP and MEPs per RFC 6370', () => {
    const w = net.tp.tunnels.find((t) => t.id === 'W');
    // Global_ID::Node_ID::Tunnel_Num (and ::LSP_Num, ::MEP); compared field by field because the
    // address check would read the Global_ID, "::" and the start of the Node_ID as an IPv6 address.
    const fields = (id) => id.split('::');
    expect(fields(w.ids.tunnelId)).toEqual(['0', '10.0.1.1', '1', '0', '10.0.1.4', '1']);
    expect(fields(w.ids.lspId)).toEqual(['0', '10.0.1.1', '1', '0', '10.0.1.4', '1', '1']);
    expect(fields(w.ids.meps.A)).toEqual(['0', '10.0.1.1', '1', '1']);
    expect(fields(w.ids.meps.C)).toEqual(['0', '10.0.1.4', '1', '1']);
    expect(Object.keys(w.ids.meps)).toEqual(['A', 'C']);
    expect(net.tp.tunnels.find((t) => t.id === 'P').ids.lspNum).toBe(2);
  });

  test('reports label mismatches between neighbours', () => {
    const t = tpTopo().tpTunnels[0];
    t.hops[2].fwdIn = 999;
    t.hops[1].revOut = 888;
    expect(labelErrors(tpTopo(), t)).toEqual(['reverse B out 888 != A in 204', 'forward B out 102 != E in 999']);
  });

  test('runs both tunnels up with the working one active at both ends', () => {
    expect(net.tp.tunnels.map((t) => `${t.id}:${t.state}`)).toEqual(['W:Up', 'P:Up']);
    expect(net.tp.groups).toEqual([{ primary: 'W', backups: ['P'], active: { A: 'W', C: 'W' } }]);
    expect(net.tp.conflicts).toEqual([]);
  });
});

describe('PW over an MPLS-TP tunnel', () => {
  test('uses the configured static PW labels, no targeted LDP', () => {
    const pw = net.vpws.pseudowires[0];
    expect(pw).toMatchObject({ state: 'Up', tldp: 'static' });
    expect(pw.ends.map((e) => [e.node, e.localLabel, e.remoteLabel, e.transport.tunnel])).toEqual([
      ['A', 7001, 7002, 'W'],
      ['C', 7002, 7001, 'W'],
    ]);
  });

  test('A -> C: push PW + tunnel label, swap per hop, pop tunnel then PW at C', () => {
    const w = vpwsWalk(net, 'PW7', 'A');
    expect(w.title).toBe('VPWS svc7 A -> C over MPLS-TP tunnel W');
    expect(w.steps.map((s) => s.node)).toEqual(['A', 'B', 'E', 'C']);
    expect(stacks(w)).toEqual([[101, 7002], [102, 7002], [103, 7002], []]);
    expect(w.steps[1].actions[0]).toContain('swap 101 -> 102 (static forward LSP of W)');
    expect(w.steps[3].actions).toContain('pop 103: forward LSP of W ends here (no PHP in MPLS-TP)');
    expect(w.delivered).toBe(true);
  });

  test('C -> A runs the reverse LSP over the same hops', () => {
    const w = vpwsWalk(net, 'PW7', 'C');
    expect(w.steps.map((s) => s.node)).toEqual(['C', 'E', 'B', 'A']);
    expect(stacks(w)).toEqual([[202, 7001], [203, 7001], [204, 7001], []]);
    expect(w.delivered).toBe(true);
  });

  test('goes down when the static labels do not match', () => {
    const topo = tpTopo();
    topo.pseudowires[0].ends[1].txLabel = 1234;
    const pw = buildNetwork(topo, { labelMode: 'none' }).vpws.pseudowires[0];
    expect(pw.state).toBe('Down');
    expect(pw.reasons).toEqual(['C sends PW label 1234, A expects 7001']);
  });
});

describe('MPLS-TP CC walk', () => {
  test('sends BFD CC over GAL each way and delivers it to the MEP', () => {
    const w = tpTunnelWalk(net, 'W');
    expect(stacks(w).slice(0, 4)).toEqual([[101, GAL], [102, GAL], [103, GAL], []]);
    expect(w.steps.filter((s) => s.title.includes('MEP receives')).map((s) => s.node)).toEqual(['C', 'A']);
    expect(w.steps.at(-1)).toMatchObject({ title: 'Tunnel W: Up', status: 'delivered' });
  });
});

describe('MPLS-TP failures', () => {
  test('BFD: a transit failure is loss of continuity at both ends; protection takes over', () => {
    const after = buildNetwork(tpTopo(), { labelMode: 'none', failures: ['B-E'] });
    const w = after.tp.tunnels.find((t) => t.id === 'W');
    expect(w.endState).toEqual({ A: 'Down', C: 'Down' });
    expect(after.tp.groups[0].active).toEqual({ A: 'P', C: 'P' });
    const walk = vpwsWalk(after, 'PW7', 'A');
    expect(walk.steps.map((s) => s.node)).toEqual(['A', 'D', 'C']);
    expect(stacks(walk)).toEqual([[501, 7002], [502, 7002], []]);
    expect(walk.steps[0].actions).toContain('protection: working tunnel W failed, sending on P (RFC 6378)');
  });

  test('no OAM: a transit failure is not seen, the PW stays up and black-holes', () => {
    const after = buildNetwork(tpTopo({ oam: null }), { labelMode: 'none', failures: ['B-E'] });
    const w = after.tp.tunnels.find((t) => t.id === 'W');
    expect(w).toMatchObject({ state: 'Down', endState: { A: 'Up', C: 'Up' } });
    expect(w.reasons).toEqual(['link B-E down: undetected without OAM, traffic black-holed']);
    expect(after.vpws.pseudowires[0].state).toBe('Up');
    const walk = vpwsWalk(after, 'PW7', 'A');
    expect(walk.steps.at(-1)).toMatchObject({ title: 'Link B-E is down', status: 'dropped' });
  });

  test('no OAM, no backup: the end next to the failure sees it, the PW goes down', () => {
    const after = buildNetwork(tpTopo({ oam: null, backup: false }), { labelMode: 'none', failures: ['C-E'] });
    expect(after.tp.tunnels[0].endState).toEqual({ A: 'Up', C: 'Down' });
    expect(after.vpws.pseudowires[0]).toMatchObject({ state: 'Down', reasons: ['C: MPLS-TP tunnel W down at C'] });
  });

  test('replay: BFD loss of continuity -> protection switch -> PW on the backup', () => {
    const r = replayFailure(tpTopo(), 'B-E', { labelMode: 'none' });
    const titles = r.replay.steps.map((s) => s.title);
    expect(titles).toContain('t=30 ms: A: tunnel W Down');
    expect(titles).toContain('t=30 ms: C: tunnel W Down');
    expect(titles).toContain('t=80 ms: A: protection switch W -> P');
    expect(titles).toContain('t=80 ms: PW 7 (svc7): stays Up, on P / P');
    expect(r.replay.steps.at(-1).actions).toContain('MPLS-TP P: Up');
  });

  test('replay without OAM says the failure goes unseen', () => {
    const r = replayFailure(tpTopo({ oam: null }), 'B-E', { labelMode: 'none' });
    expect(r.replay.steps.map((s) => s.title)).toContain('t=0 ms: A: tunnel W still Up');
    expect(r.replay.steps.some((s) => s.title.includes('protection switch'))).toBe(false);
  });
});
