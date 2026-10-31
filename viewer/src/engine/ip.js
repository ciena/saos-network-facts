// SPDX-License-Identifier: Apache-2.0
// IP helpers for both address families: IPv4 dotted quads <-> 32-bit unsigned integers, IPv6
// (RFC 4291 §2.2 text forms) <-> 128-bit BigInts, prefixes, longest match, host routes.
// An IPv4 address never matches an IPv6 prefix and the other way round.

export const isV6 = (ip) => String(ip ?? '').includes(':');

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

// An IPv6 address (with `::`, without a zone) as a BigInt.
export function ip6ToBig(ip) {
  const text = String(ip);
  const halves = text.split('::');
  if (halves.length > 2) throw new Error(`bad IPv6 address: ${ip}`);
  const words = (s) => (s ? s.split(':') : []);
  const head = words(halves[0]);
  const tail = halves.length === 2 ? words(halves[1]) : [];
  const fill = 8 - head.length - tail.length;
  if ((halves.length === 2 && fill < 1) || (halves.length === 1 && fill !== 0)) throw new Error(`bad IPv6 address: ${ip}`);
  const all = [...head, ...Array(halves.length === 2 ? fill : 0).fill('0'), ...tail];
  let n = 0n;
  for (const w of all) {
    if (!/^[0-9a-f]{1,4}$/i.test(w)) throw new Error(`bad IPv6 address: ${ip}`);
    n = (n << 16n) | BigInt(parseInt(w, 16));
  }
  return n;
}

// A BigInt as an IPv6 address in the RFC 5952 canonical text form (lower case, the longest run of
// two or more zero words as `::`, the first such run on a tie).
export function bigToIp6(n) {
  const w = [];
  for (let i = 7; i >= 0; i--) w.push(Number((n >> BigInt(i * 16)) & 0xffffn));
  let best = { at: -1, len: 1 };
  for (let i = 0; i < 8; ) {
    if (w[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && w[j] === 0) j++;
    if (j - i > best.len) best = { at: i, len: j - i };
    i = j;
  }
  const hex = (a) => a.map((x) => x.toString(16)).join(':');
  return best.at < 0 ? hex(w) : `${hex(w.slice(0, best.at))}::${hex(w.slice(best.at + best.len))}`;
}

const MASK128 = (1n << 128n) - 1n;

export function parsePrefix(prefix) {
  const [addr, len] = prefix.split('/');
  if (isV6(addr)) {
    const bits = len === undefined ? 128 : Number(len);
    const mask = bits === 0 ? 0n : (MASK128 << BigInt(128 - bits)) & MASK128;
    return { net: ip6ToBig(addr) & mask, bits, mask, v6: true };
  }
  const bits = len === undefined ? 32 : Number(len);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { net: (ipToInt(addr) & mask) >>> 0, bits, mask, v6: false };
}

export function inPrefix(ip, prefix) {
  const p = parsePrefix(prefix);
  if (p.v6 !== isV6(ip)) return false;
  if (p.v6) return (ip6ToBig(ip) & p.mask) === p.net;
  return ((ipToInt(ip) & p.mask) >>> 0) === p.net;
}

// The network of `ip/len` as text (`2001:db8:0:11::/127`, `10.1.1.0/31`).
export function networkOf(ip, len) {
  const { net, v6 } = parsePrefix(`${ip}/${len}`);
  return `${v6 ? bigToIp6(net) : intToIp(net)}/${len}`;
}

// The host route of an address: /32 for IPv4, /128 for IPv6.
export const hostPrefix = (ip) => `${ip}/${isV6(ip) ? 128 : 32}`;
export const isHostPrefix = (prefix) => (/\/32$/.test(prefix) && !isV6(prefix)) || /\/128$/.test(prefix);

// Longest-prefix match over `entries` (objects with a `prefix` field).
export function longestMatch(entries, ip) {
  let best = null;
  for (const e of entries) {
    if (!inPrefix(ip, e.prefix)) continue;
    if (!best || parsePrefix(e.prefix).bits > parsePrefix(best.prefix).bits) best = e;
  }
  return best;
}

// Address order: IPv4 before IPv6, then numeric.
export function compareIp(a, b) {
  const [va, vb] = [isV6(a), isV6(b)];
  if (va !== vb) return va ? 1 : -1;
  if (!va) return ipToInt(a) - ipToInt(b);
  const [x, y] = [ip6ToBig(a), ip6ToBig(b)];
  return x < y ? -1 : x > y ? 1 : 0;
}
