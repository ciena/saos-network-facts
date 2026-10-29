// SPDX-License-Identifier: Apache-2.0
// Derived from Ciena packet-flow-3d (see NOTICE).
// Vendor profile: every knob the RFC models leave to the implementation lives
// here, so a vendor model (e.g. Ciena SAOS) can be dropped in later by passing a
// different profile to buildNetwork(). The default is a neutral, standards-only
// profile with the protocol defaults named in the RFCs/IEEE standards.

import { fnv1a32 } from './hash.js';

export const rfcVendor = {
  name: 'RFC reference (vendor-neutral)',

  // Interface MAC: locally administered (U/L bit set), derived from node and
  // interface ordinals so walks are deterministic.
  mac(nodeOrdinal, ifOrdinal) {
    const h = (n) => n.toString(16).padStart(2, '0');
    return `02:00:00:${h(nodeOrdinal)}:${h(ifOrdinal)}:00`;
  },

  mpls: {
    // RFC 3032 §2.1 reserves 0-15; dynamic labels start above. Each LSR gets its
    // own block so labels differ between LSRs in the view (allocation is local).
    ldpLabelBase: (nodeOrdinal) => 24000 + nodeOrdinal * 1000,
    vpnLabelBase: (nodeOrdinal) => 100000 + nodeOrdinal * 1000,
    pwLabelBase: (nodeOrdinal) => 200000 + nodeOrdinal * 1000,
    // RFC 8402 §2: SRGB. 16000-23999 is the common default block.
    srgb: { base: 16000, size: 8000 },
  },

  isis: {
    defaultMetric: 10, // RFC 5305 wide metric default used for every link
    helloIntervalS: 10,
    holdMultiplier: 3, // ISO 10589: holding time = 3 x hello
    lspLifetimeS: 1200, // ISO 10589 MaxAge
    lspGenDelayMs: 50, // implementation timer
    floodHopDelayMs: 10, // transmit + processing per hop (model)
    spfDelayMs: 50, // implementation timer
  },

  ospf: {
    defaultCost: 10, // RFC 2328 leaves the interface cost to the operator
    helloIntervalS: 10, // RFC 2328 Appendix C.3 HelloInterval
    deadIntervalS: 40, // RouterDeadInterval = 4 x HelloInterval
    lsaGenDelayMs: 50, // implementation throttle (RFC 2328 MinLSInterval is 5 s)
    floodHopDelayMs: 10, // transmit + processing per hop (model)
    spfDelayMs: 50, // implementation timer
  },

  bfd: {
    // RFC 5880 §6.8.4: detection time = remote Detect Mult x agreed interval.
    intervalMs: 10,
    detectMult: 3,
  },

  mplsTp: {
    // RFC 6370 §3: Global_ID 0 when no globally unique ID is configured.
    globalId: 0,
    protectionSwitchMs: 50, // RFC 6378 linear protection target (G.8131)
  },

  bgp: {
    holdTimeS: 90, // RFC 4271 §10 suggested HoldTime
    updateDelayMs: 10, // UPDATE generation + one iBGP hop (model; iBGP MRAI 0)
    localPref: 100,
  },

  lacp: {
    systemPriority: 32768, // IEEE 802.1AX default
    shortTimeout: true, // fast LACPDUs (1 s)
    // 802.1AX leaves the frame distribution algorithm to the implementation
    // (it must keep a conversation on one link). Hash the flow 5-tuple.
    hash(flow) {
      return fnv1a32([flow.src, flow.dst, flow.proto, flow.sport, flow.dport].join('|'));
    },
  },

  cfm: {
    linkMdLevel: 2, // operator-level link MEGs
    ccmIntervalCode: 2, // 802.1Q Table 21-15: 2 = 10 ms
    serviceMdLevel: 4, // MEF 30.1 EVC MEG level
    serviceCcmIntervalCode: 4, // 1 s
  },
};
