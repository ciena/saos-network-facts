// SPDX-License-Identifier: Apache-2.0
// FNV-1a 32-bit (http://www.isthe.com/chongo/tech/comp/fnv/). Deterministic and
// simple to hand-check: fnv1a32('a') === 0xe40c292c.
export function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
