// SPDX-License-Identifier: Apache-2.0
// buildNetwork: the whole control plane for one topology + failure set, as
// plain data. Pure and deterministic: the same inputs give the same output.

import { computeLag } from './lag.js';
import { computeIsis } from './isis.js';
import { computeOspf } from './ospf.js';
import { computeMplsTp } from './mplstp.js';
import { labelProtocols } from './mpls.js';
import { computeBgp } from './bgp.js';
import { computeCfm } from './cfm.js';
import { computeG8032 } from './g8032.js';
import { computeSrPolicies } from './srpolicy.js';
import { computeVpws } from './vpws.js';
import { computeEvpn, computeSrv6 } from './srv6.js';
import { computeL3vpn } from './l3vpn.js';
import { rfcVendor } from './vendor.js';
import { validateTopology } from './topology.js';

// The IGP the label protocols, BGP and pseudowires resolve over: IS-IS by
// default, OSPF when topo.igp is 'ospf'. The other one is computed empty, so
// net.isis / net.ospf are always there; net.igp is the one in use.
const EMPTY_IGP = { routers: [], adjacencies: [], lsps: {}, lsdb: {}, spf: {}, rib: {} };

// ringOverrides: per ring id, blocked ports and state in place of the computed ones (engine/g8032.js).
export function buildNetwork(topo, { failures = [], labelMode = 'ldp', vendor = rfcVendor, isisSeqs = {}, ospfSeqs = {}, ringOverrides = {} } = {}) {
  const errors = validateTopology(topo);
  if (errors.length) throw new Error(`invalid topology: ${errors.join('; ')}`);
  const failed = new Set(failures);
  const links = computeLag(topo, failed, vendor);
  const igpName = topo.igp ?? 'isis';
  if (!['isis', 'ospf'].includes(igpName)) throw new Error(`unknown IGP ${igpName}`);
  const isis = igpName === 'isis' ? computeIsis(topo, links, vendor, isisSeqs) : EMPTY_IGP;
  const ospf = igpName === 'ospf' ? computeOspf(topo, links, vendor, ospfSeqs) : { ...EMPTY_IGP, areas: {}, abrs: [], lsas: {}, summaries: {} };
  const igp = igpName === 'ospf' ? ospf : isis;
  const labels = labelProtocols[labelMode];
  if (!labels) throw new Error(`unknown label mode ${labelMode}`);
  const mpls = labels.build(topo, igp, vendor);
  const srv6 = computeSrv6(topo, igp);
  const bgp = computeBgp(topo, igp, mpls, vendor, links, srv6);
  const sr = computeSrPolicies(topo, igp, mpls, vendor);
  const tp = computeMplsTp(topo, links, vendor);
  const vpws = computeVpws(topo, igp, mpls, sr, vendor, tp);
  const cfm = computeCfm(topo, links, vendor, vpws);
  const g8032 = computeG8032(topo, links, vendor, ringOverrides);
  const evpn = computeEvpn(topo, bgp, srv6);
  const l3vpn = computeL3vpn(topo, bgp);
  return { topo, vendor, failures: [...failed].sort(), labelMode, links, igpName, igp, isis, ospf, mpls, bgp, sr, tp, vpws, cfm, g8032, srv6, evpn, l3vpn };
}
