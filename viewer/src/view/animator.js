// SPDX-License-Identifier: Apache-2.0
// Animates the moves of the current walk step as packets travelling over links.

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { layerColor } from './layers.js';

export const TRAVEL_MS = 1100;
export const DWELL_MS = 700;

function packetLabel(step) {
  const mpls = step.headers.filter((h) => h.name === 'MPLS').map((h) => h.fields.label);
  if (mpls.length) return `MPLS ${mpls.join(' | ')}`;
  const names = step.headers.map((h) => h.name);
  if (names.includes('IS-IS')) return 'LSP';
  if (names.includes('CFM CCM')) return 'CCM';
  if (names.includes('R-APS')) return step.headers.find((h) => h.name === 'R-APS').fields.request.split(' ')[0] === 'SF' ? 'R-APS(SF)' : 'R-APS(NR)';
  if (names.includes('BGP UPDATE')) return 'BGP';
  if (names.includes('IPv4')) return 'IPv4';
  return '';
}

export class Animator {
  constructor(scene, layers) {
    this.scene = scene;
    this.layers = layers;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.packets = [];
    this.pulse = null;
  }

  clear() {
    for (const p of this.packets) {
      p.label?.element.remove();
      this.group.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.packets = [];
    if (this.pulse) {
      this.group.remove(this.pulse.mesh);
      this.pulse = null;
    }
  }

  // Start animating `step` of a walk whose default layer is `layer`.
  show(step, layer) {
    this.clear();
    const L = step.layer ?? layer;
    const color = step.status === 'dropped' ? 0xff5f56 : layerColor(L === 'physical' ? 'mpls' : L);
    const text = packetLabel(step);
    for (const mv of step.moves) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 12),
        new THREE.MeshStandardMaterial({ color: mv.duplicate ? 0x8b98a8 : color, emissive: mv.duplicate ? 0x000000 : color, emissiveIntensity: 0.6 }),
      );
      this.group.add(mesh);
      let lbl = null;
      if (text && step.moves.length === 1) {
        const el = document.createElement('div');
        el.className = 'pkt-label';
        el.textContent = text;
        lbl = new CSS2DObject(el);
        lbl.position.set(0, 1.1, 0);
        mesh.add(lbl);
      }
      this.packets.push({ mesh, move: mv, layer: L, label: lbl });
    }
    if (!step.moves.length && step.node) {
      const n = this.layers.pos(step.node, L);
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.7, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(n).setY(n.y + 0.1);
      this.group.add(mesh);
      this.pulse = { mesh };
    }
    this.update(0);
  }

  // progress in [0, 1] across the travel phase.
  update(progress) {
    for (const p of this.packets) {
      const t = p.move.lost ? Math.min(progress, 0.5) : progress;
      const pos = this.layers.linkPoint(p.move.link, p.move.member, p.move.from, p.move.to, t, p.layer);
      pos.y += p.layer === 'physical' ? 1.2 : 0.6;
      p.mesh.position.copy(pos);
      if (p.move.lost && progress > 0.5) {
        p.mesh.material.color.setHex(0xff5f56);
        p.mesh.material.emissive.setHex(0xff5f56);
        p.mesh.scale.setScalar(Math.max(0.05, 1.5 - progress * 1.5));
      }
    }
    if (this.pulse) {
      const s = 1 + 0.25 * Math.sin(progress * Math.PI * 4);
      this.pulse.mesh.scale.set(s, s, s);
    }
  }
}
