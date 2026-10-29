// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// IPv4 helpers: dotted quads <-> 32-bit unsigned integers, prefixes, longest match.

export function ipToInt(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
    throw new Error(`bad IPv4 address: ${ip}`);
  }
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

export function intToIp(n) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

export function parsePrefix(prefix) {
  const [addr, len] = prefix.split('/');
  const bits = len === undefined ? 32 : Number(len);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { net: (ipToInt(addr) & mask) >>> 0, bits, mask };
}

export function inPrefix(ip, prefix) {
  const { net, mask } = parsePrefix(prefix);
  return ((ipToInt(ip) & mask) >>> 0) === net;
}

// Longest-prefix match over `entries` (objects with a `prefix` field).
export function longestMatch(entries, ip) {
  let best = null;
  for (const e of entries) {
    if (!inPrefix(ip, e.prefix)) continue;
    if (!best || parsePrefix(e.prefix).bits > parsePrefix(best.prefix).bits) best = e;
  }
  return best;
}

export function compareIp(a, b) {
  return ipToInt(a) - ipToInt(b);
}
