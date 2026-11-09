// SPDX-License-Identifier: Apache-2.0
// The 3D page draws every link over the line system (a routed link with `over`, a connection over it
// from import/facts.js lightpathsOf) with the rainbow of dashes (src/rainbow.js) as thick tubes, wider
// than a link's own tube, for every fixture lab with a line system; a connection over it between two
// routers a routed link already joins wraps that link's tube rather than hide inside it (at 0.23.3 a
// grey tube on a CAL lab, its 1 px rainbow inside it).
import { readdirSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { beforeAll, describe, expect, test } from 'vitest';
import { buildNetwork } from '../src/engine/index.js';
import { importFacts } from '../src/import/facts.js';
import { LayerView, RAINBOW_R } from '../src/view/layers.js';
import { RAINBOW } from '../src/rainbow.js';

// the labels are CSS2D objects: a stand-in document is enough to build the scene graph without a page
beforeAll(() => {
  const el = () => ({ className: '', textContent: '', style: {}, setAttribute() {}, appendChild() {}, remove() {} });
  globalThis.document ??= { createElement: el };
});

const dir = new URL('../../tests/fixtures/expected/', import.meta.url);
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.facts.json')).map((f) => ({ name: f.replace('.facts.json', ''), text: readFileSync(new URL(f, dir), 'utf8') }));
const withLineSystem = fixtures.filter(({ text }) => (importFacts(text).topology.plain?.nodes ?? []).some((n) => n.equipment));

const view = (text) => {
  const imp = importFacts(text);
  const net = buildNetwork(imp.topology, { labelMode: imp.labelMode });
  const v = new LayerView(new THREE.Scene());
  v.build(net);
  return { v, net };
};
// the rainbows drawn on the physical plane: link id -> its instanced dash meshes
const rainbows = (v) => {
  const out = new Map();
  v.groups.physical.traverse((o) => {
    if (o.isInstancedMesh && o.userData.rainbow) out.set(o.userData.rainbow, [...(out.get(o.userData.rainbow) ?? []), o]);
  });
  return out;
};
const overLinks = (net) => [...net.topo.links.filter((l) => l.over), ...(net.topo.lightpaths ?? [])];
// a copy of a lab whose routers' cables to the line system leave from another port name than their routed
// link's (a link from port 2, its cables from 2/1): the link has no `over`, a connection is derived
const portsApart = (text) => {
  const file = JSON.parse(text);
  const members = new Set(file.devices.filter((d) => d.role && !['pe', 'p', 'ce'].includes(d.role)).map((d) => d.device));
  for (const l of file.links ?? []) for (const [e, f] of [[l.a, l.b], [l.b, l.a]]) if (!members.has(e.device) && members.has(f.device)) e.port = `${e.port}/1`;
  return JSON.stringify(file);
};

test('the fixture labs with a line system', () => {
  expect(withLineSystem.map((f) => f.name)).toEqual(['els-line-system', 'line-system']);
});

describe('every link over the line system gets the rainbow in 3D', () => {
  const cases = withLineSystem.flatMap(({ name, text }) => [
    { name, text },
    { name: `${name}, cables from other ports than the routed link`, text: portsApart(text) },
  ]);
  for (const { name, text } of cases) {
    test(name, () => {
      const { v, net } = view(text);
      const links = overLinks(net);
      expect(links.length).toBeGreaterThan(0);
      const drawn = rainbows(v);
      expect([...drawn.keys()].sort()).toEqual(links.map((l) => l.id).sort());
      for (const meshes of drawn.values()) {
        // a dash of each colour, each a tube wider than a link's own (0.13)
        expect(meshes.map((m) => `#${m.material.color.getHexString()}`)).toEqual(RAINBOW);
        for (const m of meshes) {
          expect(m.count).toBeGreaterThan(0);
          expect(m.geometry.parameters.radiusTop).toBe(RAINBOW_R);
          expect(RAINBOW_R).toBeGreaterThan(0.13);
        }
      }
    });
  }
});

test('a connection over the line system between two routers a routed link joins wraps that link', () => {
  const { v, net } = view(portsApart(withLineSystem.find((f) => f.name === 'line-system').text));
  const [lp] = net.topo.lightpaths;
  const link = net.topo.links.find((l) => [l.a.node, l.b.node].sort().join() === [lp.a.node, lp.b.node].sort().join());
  expect(link.over).toBeUndefined();
  const a = v.pos(link.a.node), b = v.pos(link.b.node);
  // every dash centre on the link's own line (one member, no offset), in xz
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (const mesh of rainbows(v).get(lp.id)) {
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, m);
      p.setFromMatrixPosition(m);
      const cross = (b.x - a.x) * (p.z - a.z) - (b.z - a.z) * (p.x - a.x);
      expect(Math.abs(cross) / Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(1e-6);
    }
  }
});
