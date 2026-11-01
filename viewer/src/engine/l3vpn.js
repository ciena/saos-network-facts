// SPDX-License-Identifier: Apache-2.0
// L3VPN (RFC 4364) state per VRF over a built network: each site's transport per address family
// (an SRv6 End.DT4 / End.DT6 SID, RFC 9252, or an MPLS VPN label), the hosts and CEs on its
// interfaces, and per ordered pair of sites whether the routes one exports end up in the other's
// VRF table: a BGP path for the family (a session or a route reflector), an import route target
// that matches an export one, and a next hop that resolves over the transport (an LSP, or the
// route to the far locator). A VRF is Up when every pair with routes to send gets them; a family
// the receiving site does not run is a note, not a failure.

import { familyOf, siteRts } from './bgp.js';

const short = (family) => (family === 'ipv6 unicast' ? 'IPv6' : 'IPv4');

// The hosts / CEs at the far end of a site's interfaces (the PE-CE attachments).
function attachments(topo, site) {
  const out = [];
  for (const i of site.interfaces ?? []) {
    const link = i.link ? topo.links.find((l) => l.id === i.link) : null;
    if (!link) continue;
    const far = link.a.node === site.pe ? link.b : link.a;
    const node = topo.nodes.find((n) => n.id === far.node);
    if (node?.role === 'ce' && !out.some((a) => a.node === far.node)) out.push({ node: far.node, link: link.id, if: i.name, host: Boolean(node.host) });
  }
  return out;
}

// Why the routes of `y` (in this VRF and family) do not reach `x`'s VRF table, or [] when they do.
function pairReasons(bgp, vrf, x, y, family) {
  const sent = bgp.originated[y.pe]?.filter((r) => r.vrf === vrf.name && r.family === family) ?? [];
  if (!sent.length) return null; // nothing to send in this family
  if (x.families && !x.families.includes(family)) return { note: `${x.pe} runs no ${family} in VRF ${vrf.name}: ${y.pe}'s ${short(family)} routes stay out of it` };
  const got = (bgp.adjRibIn[x.pe] ?? []).filter((r) => r.originator === y.pe && r.vrf === vrf.name && r.family === family);
  if (!got.length) return [`no BGP ${short(family)} VPN path from ${y.pe} to ${x.pe} (no Established session carrying it, and no route reflector between them)`];
  const want = siteRts(vrf, x, family, 'import');
  if (!got.some((r) => r.rts.some((rt) => want.includes(rt)))) return [`${x.pe} imports ${want.join(', ') || 'no route target'} in ${family}, none of ${y.pe}'s ${[...new Set(sent.flatMap((r) => r.rts))].join(', ') || '(none)'}`];
  const table = Object.values(bgp.vrfs[x.pe]?.[vrf.name] ?? {});
  if (!table.some((r) => r.type === 'bgp' && r.originator === y.pe && familyOf(r.prefix) === family)) {
    const local = sent.every((r) => bgp.vrfs[x.pe]?.[vrf.name]?.[r.prefix] && bgp.vrfs[x.pe][vrf.name][r.prefix].type !== 'bgp');
    if (local) return [];
    return [`${x.pe} cannot resolve ${y.pe}'s next hop ${sent[0].nextHop} over ${sent[0].sid ? `the route to locator ${sent[0].locator}` : 'an LSP'}`];
  }
  return [];
}

export function computeL3vpn(topo, bgp) {
  const vrfs = (topo.vrfs ?? []).map((vrf) => {
    const sites = vrf.sites.map((site) => {
      const families = site.families ?? ['ipv4 unicast'];
      const transport = {};
      for (const family of families) {
        const sid = Object.entries(bgp.sids[site.pe] ?? {}).find(([, s]) => s.vrf === vrf.name && s.family === family);
        transport[family] = sid
          ? { kind: 'srv6', sid: sid[0], behavior: sid[1].behavior, locator: sid[1].locator }
          : { kind: 'mpls', allocation: site.labelAllocation?.[family === 'ipv6 unicast' ? 'ipv6' : 'ipv4'] ?? 'per-prefix' };
      }
      return { ...site, families, transport, attached: attachments(topo, site) };
    });
    const pairs = [];
    const reasons = [];
    const notes = [];
    for (const x of sites) {
      for (const y of sites) {
        if (x === y || x.pe === y.pe) continue;
        for (const family of y.families) {
          const why = pairReasons(bgp, vrf, x, y, family);
          if (why === null) continue;
          if (why.note) {
            notes.push(why.note);
            continue;
          }
          pairs.push({ from: y.pe, to: x.pe, family, ok: !why.length, reasons: why });
          for (const r of why) if (!reasons.includes(r)) reasons.push(r);
        }
      }
    }
    if (sites.length < 2) reasons.push(`only ${sites[0]?.pe ?? 'no device'} has VRF ${vrf.name}`);
    const state = !reasons.length && pairs.length ? 'Up' : pairs.some((p) => p.ok) ? 'Partial' : 'Down';
    return { name: vrf.name, role: vrf.role ?? null, roleFrom: vrf.roleFrom ?? (vrf.role ? 'facts' : null), description: vrf.description ?? null, sites, pairs, state, reasons, notes };
  });
  return { vrfs };
}
