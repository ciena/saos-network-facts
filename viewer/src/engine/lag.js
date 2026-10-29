// SPDX-License-Identifier: Apache-2.0
// Link aggregation, IEEE 802.1AX-2014 (LACP, clause 6).
//
// Each physical member runs LACP. A member that is up and exchanges LACPDUs
// with a partner presenting the same aggregation key is Selected, in sync, and
// collecting/distributing (§6.4.2.3 actor/partner state bits). The aggregated
// link is up while at least one member distributes (min-links = 1).
// Plain (non-LAG) links have one member and no LACP; they are up iff it is up.

// §6.4.2.3: actor_state / partner_state bit layout.
export const LACP_STATE = {
  ACTIVITY: 0x01,
  TIMEOUT: 0x02, // 1 = short timeout
  AGGREGATION: 0x04,
  SYNCHRONIZATION: 0x08,
  COLLECTING: 0x10,
  DISTRIBUTING: 0x20,
  DEFAULTED: 0x40,
  EXPIRED: 0x80,
};

export function describeLacpState(bits) {
  return Object.entries(LACP_STATE)
    .filter(([, v]) => bits & v)
    .map(([k]) => k.toLowerCase());
}

// failures: Set of link ids and/or member ids that are down.
export function computeLag(topo, failures, vendor) {
  const S = LACP_STATE;
  const base = S.ACTIVITY | S.AGGREGATION | (vendor.lacp.shortTimeout ? S.TIMEOUT : 0);
  const links = {};
  for (const link of topo.links) {
    const linkDown = failures.has(link.id);
    const members = link.members.map((m, i) => {
      const up = !linkDown && !failures.has(m.id);
      if (!link.lag) return { id: m.id, up, distributing: up };
      // Same key on both ends (one key per LAG), so an up member always selects.
      const actorUp = base | S.SYNCHRONIZATION | S.COLLECTING | S.DISTRIBUTING;
      const state = up ? actorUp : base; // disabled port: UNSELECTED, out of sync
      return {
        id: m.id,
        up,
        distributing: up,
        port: i + 1,
        key: topo.links.indexOf(link) + 1,
        actorState: state,
        partnerState: up ? actorUp : 0,
      };
    });
    const distributing = members.filter((m) => m.distributing).map((m) => m.id).sort();
    links[link.id] = { id: link.id, lag: link.lag, up: distributing.length > 0, members, distributing };
  }
  return links;
}

// Frame distribution (§6.6): every frame of one conversation goes on the same
// member. The member is hash(flow) mod N over the distributing members.
export function selectMember(linkState, flow, vendor) {
  const d = linkState.distributing;
  if (d.length === 0) return null;
  if (d.length === 1) return { member: d[0], hash: null, index: 0, of: 1 };
  const hash = vendor.lacp.hash(flow);
  const index = hash % d.length;
  return { member: d[index], hash, index, of: d.length };
}
