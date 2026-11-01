// SPDX-License-Identifier: Apache-2.0
// Label density: what the layer labels say, from the Labels panel's options. Kept apart from the
// three.js code so it can be tested on its own. The defaults draw every label, as before.
//
//   node   'full' (name and loopback, or a host's LAN) | 'name'
//   bgp    'all' (every iBGP session) | 'down' (only sessions not Established) | 'none'
//   lag    true: the LAG label on each LAG link (aggregator, distributing / members)
//   scale  label size, 0.6 to 1.6 times the stylesheet's

export const DEFAULT_LABELS = Object.freeze({ node: 'full', bgp: 'all', lag: true, scale: 1 });

// Options from a stored value, keeping only known keys and values.
export function labelOptions(stored = {}) {
  const o = { ...DEFAULT_LABELS };
  if (['full', 'name'].includes(stored?.node)) o.node = stored.node;
  if (['all', 'down', 'none'].includes(stored?.bgp)) o.bgp = stored.bgp;
  if (typeof stored?.lag === 'boolean') o.lag = stored.lag;
  const s = Number(stored?.scale);
  if (Number.isFinite(s) && s >= 0.6 && s <= 1.6) o.scale = s;
  return o;
}

// A node's label: its name, then its loopback (a host: its LAN) unless names only.
export function nodeLabel(node, opts = DEFAULT_LABELS) {
  if (opts.node === 'name') return node.id;
  const sub = node.loopback ?? node.lan ?? null;
  return sub ? `${node.id} ${sub}` : node.id;
}

// An iBGP session's label, or null when the options hide it. `withRoles`: the topology names the
// sessions (a facts import), so the route reflector client is worth saying; else it is VPNv4.
export function bgpLabel(session, opts = DEFAULT_LABELS, withRoles = true) {
  if (opts.bgp === 'none') return null;
  if (opts.bgp === 'down' && session.state === 'Established') return null;
  const kind = withRoles ? (session.client ? `RR client ${session.client}` : '') : 'VPNv4';
  return `iBGP ${session.state}${kind ? ` · ${kind}` : ''}`;
}

// A LAG link's label, or null when LAG labels are off.
export function lagLabel(link, distributing, opts = DEFAULT_LABELS) {
  return opts.lag ? `${link.a.if} LAG ${distributing}/${link.members.length}` : null;
}
