// SPDX-License-Identifier: Apache-2.0
// Generated from schema/facts-v1.schema.json by scripts/generate.mjs; do not edit.
/* eslint-disable */

/**
 * Per-device network facts extracted from SAOS 6 / 8 / 10 configurations (saos-network-facts). Schema 1.x: minor versions only add optional fields, so a reader must ignore fields it does not know.
 */
export interface FactsFile {
  /**
   * The schema version the file follows (semver; this schema is 1.x).
   */
  schema_version: string;
  generator: Generator;
  /**
   * One record per device, in input order.
   */
  devices: DeviceRecord[];
  /**
   * Physical links between devices, as the input topology declares them (the `links` of a containerlab file given with `--clab`), in topology order. Optional: present only when the extractor was given a topology; absent in files before schema 1.4. Since schema 1.5.
   */
  links?: Link[];
}
/**
 * What wrote the file.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Generator".
 */
export interface Generator {
  /**
   * The producing tool (`saos-network-facts`).
   */
  name: string;
  /**
   * The producing tool's version.
   */
  version: string;
  /**
   * The SAOS 10 translator used, as `translator <version> (<backend>)`; null when none was needed or used.
   */
  translator: string | null;
}
/**
 * One device: where its facts came from, whether extraction worked, and the facts.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "DeviceRecord".
 */
export interface DeviceRecord {
  /**
   * Optional label for the lab / recipe / design the device belongs to (`extract --recipe`).
   */
  recipe?: string;
  /**
   * The device name: the containerlab node, the platform-map key, or the configuration file name up to its first dot.
   */
  device: string;
  /**
   * The device type as given by the inputs (`5164-10x`, `3930-6x`, a containerlab `type` such as `5164`); null when unknown.
   */
  type: string | null;
  /**
   * SAOS 10 only: the translator platform the files were parsed for (`cn5164`).
   */
  platform?: string;
  /**
   * `saos6` (SAOS 6 and SAOS 8 CLI, parsed directly), `saos10` (CLI or NETCONF XML through the translator's pivot JSON), or null when no extractor applies.
   */
  extractor: "saos6" | "saos10" | null;
  /**
   * The device's configuration files, in the order they were applied (relative to the configs directory or the clab file).
   */
  templates: string[];
  /**
   * `ok`: every file was read. `partial`: some SAOS 10 files failed (see `failed_templates`); `facts` holds the rest. `error`: nothing could be read. `skipped`: no extractor, no configuration, or no translator (`--no-saos10`); see `reason`.
   */
  status: "ok" | "partial" | "error" | "skipped";
  /**
   * The device's facts; null when `status` is `error` or `skipped`.
   */
  facts: DeviceFacts | null;
  /**
   * Why the status is not `ok`.
   */
  reason?: string;
  /**
   * `partial` / `error` SAOS 10 devices: the files the translator refused.
   */
  failed_templates?: FailedTemplate[];
}
/**
 * What the device's configuration says. Every value read from a configuration is text, as written; flags derived by the extractor are booleans. The SAOS 10 fields are absent on SAOS 6 / 8 devices.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Facts".
 */
export interface DeviceFacts {
  /**
   * The configured hostname.
   */
  hostname: string | null;
  /**
   * Layer-3 interfaces, in configuration order.
   */
  interfaces: Interface[];
  /**
   * SAOS 6: the default gateway.
   */
  gateway: string | null;
  /**
   * VLANs by id (as text).
   */
  vlans: {
    [k: string]: Vlan;
  };
  /**
   * Ports by name.
   */
  ports: {
    [k: string]: Port;
  };
  /**
   * LAGs.
   */
  lags: Lag[];
  /**
   * SAOS 6 sub-ports.
   */
  sub_ports: SubPort[];
  /**
   * G.8032 rings configured on the device (SAOS 6 / 8 logical rings, SAOS 10 `g8032-ring`s), with their protection instances since schema 1.5.
   */
  rings: Ring[];
  /**
   * MPLS VCs, MPLS-TP tunnel ends and BGP neighbours.
   */
  peers: Peer[];
  isis: Isis;
  segment_routing: SegmentRouting;
  bgp: Bgp;
  /**
   * Pseudowires.
   */
  pseudowires: Pseudowire[];
  cfm: Cfm;
  /**
   * SAOS 6: command lines seen. SAOS 10: top-level YANG objects seen (same as `objects`).
   */
  lines: number;
  /**
   * Lines (SAOS 6) or top-level objects (SAOS 10) that produced a fact.
   */
  recognised: number;
  /**
   * SAOS 10 forwarding domains.
   */
  fds?: ForwardingDomain[];
  /**
   * SAOS 10 flow points.
   */
  fps?: FlowPoint[];
  /**
   * SAOS 10 classifiers by name: the VLAN ids they match.
   */
  classifiers?: {
    /**
     * VLAN ids.
     */
    [k: string]: string[];
  };
  /**
   * SAOS 10 VRF names.
   */
  vrfs?: string[];
  /**
   * SAOS 10 EVPN ethernet segments.
   */
  segments?: EthernetSegment[];
  /**
   * SAOS 10: top-level YANG objects seen across the device's files.
   */
  objects?: number;
  ospf?: Ospf;
  /**
   * SAOS 10 MPLS-TP co-routed tunnels, one entry per tunnel this node is on. Since schema 1.2.
   */
  tp_corouted_tunnels?: TpCoroutedTunnel[];
  /**
   * SAOS 10 L2VPN services. Since schema 1.2.
   */
  l2vpn_services?: L2VpnService[];
  /**
   * SAOS 10 EVPN instances (EVPN-VPLS, EVPN-VPWS, FXC). Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  evpn_instances?: EvpnInstance[];
}
/**
 * A layer-3 interface: loopback, IP interface, management interface (SAOS 6), or any SAOS 10 openconfig interface that is not a physical port.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Interface".
 */
export interface Interface {
  /**
   * The interface name (`remote` / `local` for the SAOS 6 management interfaces).
   */
  name: string;
  /**
   * SAOS 6: `loopback`, `ip` or `management`. SAOS 10: the interface type as configured (`loopback`, `ip`, `lag`, `point-to-point`, ...; `system` is the management bridge, mgmtbr0). Management interfaces (`management`, `system`) address the management network, not a link between devices.
   */
  kind: string;
  /**
   * The (first IPv4) address with its prefix length, as written (`192.0.2.1/32`).
   */
  ip: string | null;
  /**
   * SAOS 6: the VLAN the IP interface sits on. Null on SAOS 10 (see `fd`).
   */
  vlan: string | null;
  /**
   * SAOS 6: the virtual switch the IP interface sits on.
   */
  vs: string | null;
  /**
   * SAOS 10: every IPv4 address, `ip/len`.
   */
  ipv4?: string[];
  /**
   * SAOS 10: every IPv6 address, `ip/len`.
   */
  ipv6?: string[];
  /**
   * SAOS 10: the forwarding domain the interface is bound to (underlay binding); a flow point on the same fd ties it to a port.
   */
  fd?: string | null;
  /**
   * SAOS 10: the VRF the interface is in.
   */
  vrf?: string | null;
  /**
   * SAOS 10: the interface description.
   */
  description?: string | null;
  /**
   * SAOS 10: the MTU as written.
   */
  mtu?: string | null;
  /**
   * SAOS 10: the IS-IS instance the interface is attached to.
   */
  isis?: string;
}
/**
 * A VLAN and the ports that carry it.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Vlan".
 */
export interface Vlan {
  /**
   * Ports (or LAGs) in the VLAN.
   */
  ports: string[];
}
/**
 * A physical port, LAG or SAOS 10 logical port, keyed by its name.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Port".
 */
export interface Port {
  /**
   * The port description.
   */
  description: string | null;
  /**
   * VLANs the port carries: SAOS 6 VLAN membership; SAOS 10 the VLANs of the classifiers on the flow points that use the port.
   */
  vlans: string[];
  /**
   * The LAG the port is a member of.
   */
  lag: string | null;
  /**
   * What uses the port: `aggregation`, `sub-port`, `virtual-switch`, `ring`, `cfm-mep` (SAOS 6 / 8), `fp`, `ring`, `cfm-mep` (SAOS 10).
   */
  roles: string[];
  /**
   * SAOS 10: the logical port's binding.
   */
  binding?: string;
  /**
   * SAOS 10: the ettp interface's PTP id.
   */
  ptp_id?: string;
  /**
   * SAOS 10: the ettp interface's port speed.
   */
  port_speed?: string;
  /**
   * SAOS 10: the ettp interface's auto-negotiation setting.
   */
  auto_negotiation?: string;
  tx?: Transmitter;
  /**
   * SAOS 10: the pluggable's mode (`400GZR+`, ...).
   */
  xcvr_mode?: string;
}
/**
 * SAOS 10: the optical transmitter configured on a port (`ptps`).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Transmitter".
 */
export interface Transmitter {
  /**
   * Frequency in GHz, as written.
   */
  frequency?: string;
  /**
   * Transmitter state.
   */
  state?: string;
  /**
   * Transmit power, as written.
   */
  power?: string;
}
/**
 * A link aggregation group.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Lag".
 */
export interface Lag {
  /**
   * The LAG name.
   */
  name: string;
  /**
   * Member ports.
   */
  members: string[];
}
/**
 * SAOS 6 sub-port.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "SubPort".
 */
export interface SubPort {
  /**
   * Sub-port name.
   */
  name: string;
  /**
   * Parent port.
   */
  parent: string | null;
}
/**
 * A G.8032 ring on this device: a SAOS 6 / 8 logical ring (`ring-protection logical-ring`) or a SAOS 10 `g8032-ring`. `name`, `west` and `east` are the schema 1.0 fields; the rest are optional and absent in files before schema 1.4.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Ring".
 */
export interface Ring {
  /**
   * The ring name (SAOS 6 / 8 logical ring name, SAOS 10 ring name).
   */
  name: string | null;
  /**
   * The west ring port: SAOS 6 / 8 `west-port`; SAOS 10 the interface of ring port `port0`.
   */
  west: string | null;
  /**
   * The east ring port: SAOS 6 / 8 `east-port`; SAOS 10 the interface of ring port `port1`.
   */
  east: string | null;
  /**
   * The G.8032 ring id (`ring-id`), as written; null when not configured. Since schema 1.5.
   */
  ring_id?: string | null;
  /**
   * The ring ports as configured, in configuration order: SAOS 6 / 8 `west` and `east`, SAOS 10 `port0` and `port1`. Since schema 1.5.
   */
  ports?: RingPort[];
  /**
   * The Ethernet ring protection instances on the ring (SAOS 10 `erp-instance`, SAOS 6 / 8 virtual ring), in configuration order; empty when the configuration creates none. Since schema 1.5.
   */
  instances?: RingInstance[];
}
/**
 * One of a ring's two ports. Values are text, as written. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "RingPort".
 */
export interface RingPort {
  /**
   * The ring port's name in the configuration: SAOS 6 / 8 `west` / `east`, SAOS 10 `port0` / `port1`.
   */
  name: string;
  /**
   * The port or interface the ring port is on (a port, a LAG, or a SAOS 10 logical port); null when the configuration does not say.
   */
  interface: string | null;
  /**
   * SAOS 6 / 8: the port's hold-off time in milliseconds (`west-port-holdoff-time` / `east-port-holdoff-time`), as configured; null when not configured. Always null on SAOS 10, whose hold-off is per instance (`RingTimers.hold_off`).
   */
  hold_off: string | null;
}
/**
 * An Ethernet ring protection (ERP) instance on a ring: a SAOS 10 `erp-instance` or a SAOS 6 / 8 virtual ring (`ring-protection virtual-ring`). Values are as configured: nothing is filled in from defaults, and null means the configuration does not say. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "RingInstance".
 */
export interface RingInstance {
  /**
   * The instance name (SAOS 10 `erp-instance` name, SAOS 6 / 8 virtual ring name).
   */
  name: string;
  /**
   * The VLAN id of the R-APS control channel (`raps-vid`), as written.
   */
  raps_vid: string | null;
  /**
   * The maintenance entity group (MEG / MD) level of the R-APS messages (SAOS 10 `raps-level`, SAOS 6 / 8 `mel`), as written; null when not configured.
   */
  raps_level: string | null;
  /**
   * `major` for a major ring instance, `sub` for a sub-ring instance (SAOS 10 `erp-instance-construct`; SAOS 6 / 8 `sub-ring` on the virtual ring, else major); null when the configuration does not say.
   */
  type: "major" | "sub" | null;
  /**
   * For a sub-ring, whether its R-APS channel is carried over the major ring (SAOS 10 `sub-ring-virtual-channel` true, `sub-ring-no-virtual-channel` false). Null for a major ring and on SAOS 6 / 8, where the configuration does not say.
   */
  virtual_channel: boolean | null;
  /**
   * SAOS 6 / 8 sub-rings: the ring port the sub-ring terminates on at this node (`sub-ring west-port-termination` / `east-port-termination`), or `none` (`no-port-termination`: the sub-ring passes through this node). Null for a major ring and on SAOS 10, which has no such leaf (a terminating node lists one port in `rpl`).
   */
  termination: "west" | "east" | "none" | null;
  /**
   * Derived: for a sub-ring instance on an interconnection node, the name of the other ring on this device that shares one of this ring's ports (the ring the sub-ring is attached to). Null on a node where the sub-ring passes through, and for a major ring.
   */
  sub_ring_of: string | null;
  /**
   * The RPL role configured per ring port, in configuration order (SAOS 10 `ports port <id> rpl <role>`; SAOS 6 / 8 `west-port-rpl owner` / `east-port-rpl owner`). Empty when the configuration sets none.
   */
  rpl: RplPort[];
  /**
   * What the instance protects, as named in the configuration: SAOS 10 forwarding domains (`data-members`), SAOS 6 VLAN ids (`virtual-ring add ... vid`), SAOS 8 virtual switches (`virtual-ring add ... vs`).
   */
  members: string[];
  timers: RingTimers;
  /**
   * Whether the instance reverts to the RPL after a failure clears (SAOS 10 `reversion revertive` / `non-revertive`, SAOS 6 / 8 `revertive on` / `off`); null when not configured (the device default).
   */
  revertive: boolean | null;
}
/**
 * The ring protection link (RPL) role configured on one ring port of an instance. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "RplPort".
 */
export interface RplPort {
  /**
   * The ring port, as in `Ring.ports[].name` (`port0` / `port1`, `west` / `east`).
   */
  port: string;
  /**
   * The port or interface of that ring port (`Ring.ports[].interface`), for convenience; null when unknown.
   */
  interface: string | null;
  /**
   * The configured RPL role: `owner` (this port is the RPL and blocks in the idle state), `neighbor` (the other end of the RPL), `next-neighbor`, or `none` (written explicitly, as SAOS 10 `rpl none`). A port the configuration says nothing about has no entry.
   */
  role: "owner" | "neighbor" | "next-neighbor" | "none";
}
/**
 * The protection timers of an instance, as configured; null when the configuration does not set one (the device uses its default). Values are text, as written. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "RingTimers".
 */
export interface RingTimers {
  /**
   * Wait-to-restore time in minutes (SAOS 10 `wtr-timer`; SAOS 6 / 8 `wtr` on the logical ring, reported on each of its instances).
   */
  wtr: string | null;
  /**
   * Guard time in milliseconds (SAOS 10 `guard-timer`; SAOS 6 / 8 `guard-time` on the logical ring, reported on each of its instances).
   */
  guard: string | null;
  /**
   * SAOS 10: hold-off time in milliseconds (`hold-off-time`). Always null on SAOS 6 / 8, whose hold-off is per ring port (`RingPort.hold_off`).
   */
  hold_off: string | null;
}
/**
 * A remote end the device is configured to talk to.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Peer".
 */
export interface Peer {
  /**
   * `mpls-vc` (SAOS 6 static VC), `tp-tunnel` (SAOS 6 MPLS-TP tunnel end) or `bgp` (SAOS 10 BGP neighbour).
   */
  kind: string;
  /**
   * The VC or tunnel name; for `bgp` the local AS as `as<N>`.
   */
  name: string;
  /**
   * The peer address.
   */
  ip: string | null;
  /**
   * `tp-tunnel`: `dest-ip` or `src-ip`.
   */
  role?: string;
  /**
   * `bgp`: the neighbour's AS.
   */
  remote_as?: string | null;
  /**
   * `bgp`: the neighbour is a route-reflector client of this device in at least one address family.
   */
  route_reflector_client?: boolean;
  /**
   * `bgp`: the neighbour's address families, `<afi> <safi>` (`vpnv4 unicast`, `l2vpn evpn`).
   */
  address_families?: string[];
  /**
   * `bgp` (SAOS 10): the peer group the neighbour is configured in (`peer <ip> peer-group <name>`); null when none. Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  peer_group?: string | null;
}
/**
 * IS-IS instances and their interfaces.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Isis".
 */
export interface Isis {
  /**
   * IS-IS instances.
   */
  instances: IsisInstance[];
  /**
   * Interface attachments.
   */
  interfaces: IsisInterface[];
}
/**
 * An IS-IS instance.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "IsisInstance".
 */
export interface IsisInstance {
  /**
   * The instance tag / name.
   */
  name: string | null;
  /**
   * The level as written: SAOS 6 `L1` / `L2` / `L1L2`, SAOS 10 `level-1` / `level-2` / `level-1-2`.
   */
  level: string | null;
  /**
   * Kept for compatibility, as written: SAOS 6 the area (`49.0011`), SAOS 10 the first NET. Use `area_id` and `net`.
   */
  area: string | null;
  /**
   * Every NET configured on the instance.
   */
  nets: string[];
  /**
   * The first NET (`49.0001.1920.0000.2001.00`).
   */
  net: string | null;
  /**
   * The area: the NET without its system id and NSEL (`49.0001`); SAOS 6 the configured area when no NET is set.
   */
  area_id: string | null;
  /**
   * The system id part of the NET (`1920.0000.2001`).
   */
  system_id: string | null;
  /**
   * SAOS 10: segment routing is enabled on the instance; null when not configured.
   */
  sr_enabled: boolean | null;
  /**
   * SAOS 10: the address families the instance runs, the union over its interfaces (`ipv4 unicast`, `ipv6 unicast`): IPv4 unicast runs on an interface unless `ipv4-unicast-default-disable`, IPv6 unicast where `address-family ipv6 unicast` is configured. An IPv6-only IGP lists only `ipv6 unicast`. Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  address_families?: string[];
  /**
   * SAOS 10: multi-topology routing (RFC 5120, IPv6 in its own topology) is on: `multi-topology-mode enable` or the deprecated `multi-topology <level>`; null when not configured (single topology). Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  multi_topology?: boolean | null;
  /**
   * SAOS 10: the instance advertises at least one SRv6 locator (see `srv6_locators`). Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  srv6_enabled?: boolean;
  /**
   * SAOS 10: names of the SRv6 locators (`segment_routing.srv6.locators`) the instance advertises: those whose `instances` name it, and those that name no instance (advertised in every instance). Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  srv6_locators?: string[];
}
/**
 * An interface attached to an IS-IS instance.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "IsisInterface".
 */
export interface IsisInterface {
  /**
   * The interface name (see `interfaces`).
   */
  interface: string;
  /**
   * The IS-IS instance.
   */
  instance: string | null;
  /**
   * The interface's level, as written; null when it follows the instance.
   */
  level: string | null;
  /**
   * The interface type (`point-to-point`, `broadcast`); null when not configured.
   */
  type: string | null;
  /**
   * The metrics configured on the interface, one entry per level in configuration order (SAOS 10 `level-1` / `level-2` `metric` and `wide-metric`; SAOS 6 / 8 `isis interface-level set ... level L1|L2 wide-metric`). An empty list when the configuration sets no metric (the interface advertises its default). Optional: absent in files before schema 1.3. Since schema 1.3.
   */
  metrics?: IsisMetric[];
  /**
   * SAOS 10: the address families the interface runs: `ipv4 unicast` unless `ipv4-unicast-default-disable true`, then each configured `address-families address-family <afi> <safi>` (`ipv6 unicast`). Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  address_families?: string[];
}
/**
 * The metric an IS-IS interface advertises at one level. Values are text, as written. Since schema 1.3.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "IsisMetric".
 */
export interface IsisMetric {
  /**
   * The level, in the configuration's own spelling: SAOS 10 `level-1` / `level-2`, SAOS 6 / 8 `L1` / `L2`.
   */
  level: string;
  /**
   * SAOS 10: the narrow (ISO 10589, 6-bit) metric of the level; null when not configured, and always null on SAOS 6 / 8, which have no narrow metric.
   */
  metric: string | null;
  /**
   * The wide (RFC 5305, 24-bit) metric of the level; null when not configured.
   */
  wide_metric: string | null;
}
/**
 * Segment routing (SR-MPLS / SRv6). SAOS 10 only; empty on SAOS 6 / 8.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "SegmentRouting".
 */
export interface SegmentRouting {
  /**
   * SRGBs, one per IS-IS instance that sets one.
   */
  srgb: LabelBlock[];
  /**
   * Prefix and node SIDs.
   */
  prefix_sids: PrefixSid[];
  /**
   * SR-TE policies.
   */
  policies: SrPolicy[];
  /**
   * Explicit segment lists by name: the SIDs (labels or SRv6 SIDs) in order.
   */
  segment_lists: {
    /**
     * SIDs in order.
     */
    [k: string]: string[];
  };
  srv6?: Srv6;
  /**
   * SAOS 10: Flex-Algo definitions, in configuration order. Optional: absent in files before schema 1.6. Since schema 1.6.
   */
  flex_algorithms?: FlexAlgorithm[];
}
/**
 * A segment-routing label block (SRGB).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Srgb".
 */
export interface LabelBlock {
  /**
   * The IS-IS instance that sets it.
   */
  instance: string | null;
  /**
   * Lowest label.
   */
  lower: string | null;
  /**
   * Highest label.
   */
  upper: string | null;
}
/**
 * A prefix SID (SAOS 10 connected-prefix-sid-map).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "PrefixSid".
 */
export interface PrefixSid {
  /**
   * The prefix (`192.0.2.1/32`).
   */
  prefix: string;
  /**
   * The interface the prefix is on.
   */
  interface: string | null;
  /**
   * The SID value, as written: an index into the SRGB or an absolute label, per `value_type`.
   */
  sid: string | null;
  /**
   * `index` or `absolute`.
   */
  value_type: string | null;
  /**
   * A node SID: a host prefix (/32, /128) on a loopback.
   */
  node: boolean;
}
/**
 * An SR-TE policy, keyed by color and endpoint.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "SrPolicy".
 */
export interface SrPolicy {
  /**
   * Policy name.
   */
  name: string | null;
  /**
   * Color.
   */
  color: string | null;
  /**
   * Endpoint address.
   */
  endpoint: string | null;
  /**
   * Source address.
   */
  source: string | null;
  /**
   * Candidate paths.
   */
  candidate_paths: CandidatePath[];
}
/**
 * A candidate path of an SR policy.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "CandidatePath".
 */
export interface CandidatePath {
  /**
   * Protocol origin (`local`, ...).
   */
  origin: string | null;
  /**
   * Originator address.
   */
  originator: string | null;
  /**
   * Discriminator.
   */
  discriminator: string | null;
  /**
   * Preference; the highest valid path is active.
   */
  preference: string | null;
  /**
   * Flex-algorithm, for a dynamic path.
   */
  flex_algorithm: string | null;
  /**
   * Names of the explicit segment lists (see `segment_lists`).
   */
  segment_lists: string[];
}
/**
 * SAOS 10: SRv6 locators. Optional: absent in files before schema 1.6. Since schema 1.6.
 */
export interface Srv6 {
  /**
   * SRv6 locators, in configuration order.
   */
  locators: Srv6Locator[];
}
/**
 * An SRv6 locator (`segment-routing srv6 locators locator`): the IPv6 prefix the node's SRv6 SIDs are allocated from. Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Srv6Locator".
 */
export interface Srv6Locator {
  /**
   * Locator name (what EVPN instances and IS-IS refer to).
   */
  name: string;
  /**
   * The locator prefix (`2001:db8:0:1::/64`).
   */
  prefix: string | null;
  /**
   * The SID format: `u-sid` (compressed micro-SIDs) or `uncompressed-sid`; null when not configured.
   */
  sid_type: string | null;
  /**
   * The Flex-Algo (128-255) the locator belongs to (see `flex_algorithms`); null for algorithm 0 (SPF).
   */
  algorithm: string | null;
  /**
   * Length in bits of the SID locator block; null when not configured.
   */
  block_length: string | null;
  /**
   * Length in bits of the SID node part; null when not configured.
   */
  node_length: string | null;
  /**
   * Length in bits of the SID function part; null when not configured.
   */
  function_length: string | null;
  /**
   * The End behavior type as written (`End.PSP_USD`, `End_NEXT_CSID_PSP_USD`); null when not configured.
   */
  end_behavior: string | null;
  /**
   * IS-IS instances the locator is restricted to (`instances instance`); empty when every instance advertises it.
   */
  instances: string[];
}
/**
 * A Flex-Algo definition (`segment-routing flex-algorithm`, RFC 9350). Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "FlexAlgorithm".
 */
export interface FlexAlgorithm {
  /**
   * The algorithm number (128-255).
   */
  algorithm: string;
  /**
   * The metric the computation minimises: `igp`, `latency` or `te`; null when not configured (IGP).
   */
  metric_type: string | null;
  /**
   * This node advertises the definition (`advertise-definition`); otherwise it only takes part in the algorithm and follows the highest-priority definition in the area.
   */
  advertise_definition: boolean;
  /**
   * The advertised definition's priority (0-255, highest wins); null when not configured.
   */
  priority: string | null;
  admin_groups: FlexAlgoAdminGroups;
  /**
   * Shared risk link groups excluded from the computation (`srlg-exclude`).
   */
  srlg_exclude: string[];
}
/**
 * Link affinities included or excluded.
 */
export interface FlexAlgoAdminGroups {
  /**
   * A link is used only if it has at least one of these groups (`include-any-admin-group`).
   */
  include_any: string[];
  /**
   * A link is used only if it has all of these groups (`include-all-admin-group`).
   */
  include_all: string[];
  /**
   * A link with any of these groups is not used (`exclude-any-admin-group`).
   */
  exclude_any: string[];
}
/**
 * BGP instances; the neighbours are `peers` of kind `bgp`.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Bgp".
 */
export interface Bgp {
  /**
   * BGP instances.
   */
  instances: BgpInstance[];
}
/**
 * A BGP instance (SAOS 10).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "BgpInstance".
 */
export interface BgpInstance {
  /**
   * The local AS.
   */
  as: string | null;
  /**
   * Router id.
   */
  router_id: string | null;
  /**
   * Route-reflector cluster id; null when not set.
   */
  cluster_id: string | null;
  /**
   * The device reflects routes: at least one neighbour of the instance is a route-reflector client.
   */
  route_reflector: boolean;
}
/**
 * A pseudowire (VPWS / VPLS spoke or mesh PW).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Pseudowire".
 */
export interface Pseudowire {
  /**
   * The pseudowire / VC name.
   */
  name: string;
  /**
   * SAOS 6: `static` or `dynamic` (LDP) VC. SAOS 10: `configured` (ietf-pseudowires).
   */
  kind: string | null;
  /**
   * The far-end PE address.
   */
  peer: string | null;
  /**
   * The PW / VC id.
   */
  pw_id: string | null;
  /**
   * Static PW: receive label.
   */
  in_label: string | null;
  /**
   * Static PW: transmit label.
   */
  out_label: string | null;
  /**
   * `mesh` or `spoke`, as configured.
   */
  mode: string | null;
  /**
   * The tunnel the PW rides on, when configured (MPLS-TP tunnel name).
   */
  tunnel: string | null;
  /**
   * SAOS 10: the transport the PW is steered onto, as configured (`sr-policy`, `rsvp-te`, ...); null when not configured (the device resolves the peer address over its default transport: the peer's Prefix-SID or LDP LSP). Since schema 1.1.
   */
  tunnel_type?: string | null;
  /**
   * SAOS 10: with `tunnel_type` `sr-policy`, the color of the SR policy to the peer that carries the PW. Since schema 1.1.
   */
  tunnel_color?: string | null;
  /**
   * The service carrying the PW: SAOS 6 the virtual switch it is attached to, SAOS 10 the l2vpn service.
   */
  service: string | null;
  /**
   * SAOS 10: `vpws` or `vpls`, from the mode of the service's forwarding domain; null when unknown.
   */
  service_type: string | null;
}
/**
 * Ethernet CFM (802.1ag / Y.1731).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Cfm".
 */
export interface Cfm {
  /**
   * Local MEPs.
   */
  meps: Mep[];
}
/**
 * A CFM maintenance-association end point on this device.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Mep".
 */
export interface Mep {
  /**
   * Maintenance domain (SAOS 10 MD id; null on SAOS 6, where the MA carries the level).
   */
  md: string | null;
  /**
   * Maintenance association (SAOS 10 MA id, SAOS 6 CFM service name).
   */
  ma: string | null;
  /**
   * The MEP id.
   */
  mep_id: string | null;
  /**
   * The MD level.
   */
  level: string | null;
  /**
   * `up` or `down`.
   */
  direction: string | null;
  /**
   * SAOS 10: the flow point the MEP sits on; SAOS 6: the sub-port, when it is on one.
   */
  interface: string | null;
  /**
   * The port the MEP sits on (SAOS 10: the flow point's logical port).
   */
  port: string | null;
  /**
   * The VLAN of the MEP (SAOS 10: from the flow point's classifier).
   */
  vlan: string | null;
  /**
   * SAOS 10: the MA's forwarding domain; SAOS 6: the CFM service's virtual switch.
   */
  service: string | null;
  /**
   * The CCM interval of the MEP's maintenance association as written (since schema 1.4): SAOS 10 `ccm-interval` (`3.3ms`, `10ms`, `100ms`, `1s`, `10s`, `1min`, `10min`); SAOS 6 `cfm service set ... ccm-interval` (`3.33ms`, `1sec`, `10sec`, `1min`, ..., `off`, or the 802.1Q interval index `0`-`7`). Null when not configured (the device default, 1 s).
   */
  ccm_interval?: string | null;
}
/**
 * SAOS 10 forwarding domain.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Fd".
 */
export interface ForwardingDomain {
  /**
   * Name.
   */
  name: string;
  /**
   * `vpls`, `vpws`, `vlan`, ...
   */
  mode: string | null;
}
/**
 * SAOS 10 flow point: a logical port's attachment to a forwarding domain.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Fp".
 */
export interface FlowPoint {
  /**
   * Name.
   */
  name: string;
  /**
   * Forwarding domain.
   */
  fd: string | null;
  /**
   * Logical port (see `ports`).
   */
  logical_port: string | null;
  /**
   * Classifiers that select the flow point's frames (see `classifiers`).
   */
  classifiers: string[];
}
/**
 * SAOS 10 EVPN ethernet segment (multihoming / EVLAG).
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Segment".
 */
export interface EthernetSegment {
  /**
   * Name.
   */
  name: string;
  /**
   * Logical port (a LAG or a port).
   */
  port: string | null;
  /**
   * The segment is an EVLAG.
   */
  evlag: boolean;
  /**
   * The ESI as `<type> <value>` (`mac 02:00:00:00:00:01`).
   */
  esi: string | null;
  /**
   * Redundancy mode (`all-active`, `single-active`).
   */
  mode: string | null;
  /**
   * DF-election preference.
   */
  preference: string | null;
}
/**
 * SAOS 10 OSPFv2 (`ciena-ospf`). Since schema 1.2.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Ospf".
 */
export interface Ospf {
  /**
   * OSPF instances.
   */
  instances: OspfInstance[];
  /**
   * Interfaces per instance, in configuration order.
   */
  interfaces: OspfInterface[];
}
/**
 * An OSPFv2 instance (SAOS 10). Since schema 1.2.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "OspfInstance".
 */
export interface OspfInstance {
  /**
   * The instance tag.
   */
  name: string;
  /**
   * Router id; null when not configured (the device picks one).
   */
  router_id: string | null;
  /**
   * The VRF the instance runs in; null when not configured (the default VRF).
   */
  vrf: string | null;
  /**
   * Areas, in configuration order.
   */
  areas: OspfArea[];
}
/**
 * An OSPF area of an instance.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "OspfArea".
 */
export interface OspfArea {
  /**
   * The area id, dotted (`0.0.0.0` is the backbone).
   */
  area: string;
  /**
   * Area type when configured (`stub`, `nssa`); null for a normal area.
   */
  type: string | null;
  /**
   * The prefixes whose interfaces are in the area, as configured (`network`).
   */
  networks: string[];
}
/**
 * An interface an OSPF instance runs on (SAOS 10). Since schema 1.2.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "OspfInterface".
 */
export interface OspfInterface {
  /**
   * The instance tag.
   */
  instance: string;
  /**
   * The interface name (an entry of `interfaces`).
   */
  interface: string;
  /**
   * The area: the area of the instance whose `networks` cover the interface's address (derived); null when none does.
   */
  area: string | null;
  /**
   * Network type (`point-to-point`, `broadcast`); null when not configured.
   */
  type: string | null;
  /**
   * Interface cost; null when not configured.
   */
  metric: string | null;
  /**
   * Hello interval in seconds; null when not configured.
   */
  hello_interval: string | null;
  /**
   * Dead interval in seconds; null when not configured.
   */
  dead_interval: string | null;
  /**
   * DR election priority; null when not configured.
   */
  priority: string | null;
  /**
   * No adjacency is formed: configured `passive`, or the interface is a loopback (advertised as a stub network).
   */
  passive: boolean;
  /**
   * BFD is enabled on the interface.
   */
  bfd: boolean;
}
/**
 * One node's segment of a static MPLS-TP co-routed (bidirectional) tunnel (SAOS 10 `ciena-mpls-tp-corouted`). Every node on the path configures the tunnel under the same name, source and destination: the ingress its forward-out and reverse-in labels, a transit node all four, the egress forward-in and reverse-out. Labels are null where the node's role has none. Since schema 1.2.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "TpCoroutedTunnel".
 */
export interface TpCoroutedTunnel {
  /**
   * Tunnel name.
   */
  name: string;
  /**
   * Source (ingress) address.
   */
  source: string | null;
  /**
   * Destination (egress) address.
   */
  destination: string | null;
  /**
   * This node's role in the tunnel: `static-ingress-corouted`, `static-transit-corouted` or `static-egress-corouted`.
   */
  type: string | null;
  /**
   * `primary` or `backup` (1:1 protection); `primary` when not configured.
   */
  role: string;
  /**
   * A backup tunnel: the primary it protects; null otherwise.
   */
  primary: TpTunnelRef | null;
  /**
   * `enable` or `disable`; `enable` when not configured.
   */
  admin_state: string;
  /**
   * Reversion to the primary after a protection switch, `enable` or `disable`; `enable` when not configured.
   */
  reversion: string;
  /**
   * Reversion hold time in seconds; null when not configured.
   */
  reversion_hold_time: string | null;
  /**
   * Label received in the forward direction (transit, egress).
   */
  forward_in_label: string | null;
  /**
   * Label sent in the forward direction (ingress, transit).
   */
  forward_out_label: string | null;
  /**
   * Forward-direction next hop (ingress, transit).
   */
  next_hop_ip: string | null;
  /**
   * Label received in the reverse direction (ingress, transit).
   */
  reverse_in_label: string | null;
  /**
   * Label sent in the reverse direction (transit, egress).
   */
  reverse_out_label: string | null;
  /**
   * Reverse-direction next hop: the previous node of the forward path (transit, egress).
   */
  prev_hop_ip: string | null;
  /**
   * LSP BFD parameters; null when not configured.
   */
  bfd: TpTunnelBfd | null;
}
/**
 * The primary tunnel a backup tunnel protects.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "TpTunnelRef".
 */
export interface TpTunnelRef {
  /**
   * Primary tunnel name.
   */
  name: string | null;
  /**
   * Primary tunnel type.
   */
  type: string | null;
}
/**
 * LSP BFD (proactive OAM) on an MPLS-TP tunnel.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "TpTunnelBfd".
 */
export interface TpTunnelBfd {
  /**
   * BFD runs: configured and not `admin-down`.
   */
  enabled: boolean;
  /**
   * Desired minimum transmit interval in milliseconds (derived: SAOS 10 configures microseconds); null when not configured.
   */
  interval_ms: number | null;
}
/**
 * A SAOS 10 L2VPN service (`ciena-l2vpn`): binds a forwarding domain to pseudowires. Since schema 1.2.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "L2vpnService".
 */
export interface L2VpnService {
  /**
   * Service name (the `service` of its pseudowires).
   */
  name: string;
  /**
   * The forwarding domain carrying the attachment circuits.
   */
  fd: string | null;
  /**
   * Pseudowire names, in configuration order.
   */
  pseudowires: string[];
  /**
   * Service MTU; null when not configured.
   */
  mtu: string | null;
  /**
   * `static` or `ldp`; null when not configured.
   */
  signaling_type: string | null;
}
/**
 * A SAOS 10 EVPN instance (`evpn evpn-instances evpn-instance`): binds a forwarding domain to the EVPN control plane. Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "EvpnInstance".
 */
export interface EvpnInstance {
  /**
   * The EVPN instance id (EVI).
   */
  evi: string;
  /**
   * Description; null when not configured.
   */
  description: string | null;
  /**
   * The service: `vpls` (EVPN-VPLS, `vpls-fd`), `vpws` (EVPN-VPWS, `vpws-cross-connect-fd`) or `fxc` (VLAN-aware flexible cross-connect); null when no forwarding domain is bound.
   */
  type: string | null;
  /**
   * The forwarding domain (see `fds`); the first one when the instance binds several.
   */
  fd: string | null;
  /**
   * Every forwarding domain the instance binds, in configuration order.
   */
  fds: string[];
  /**
   * EVPN-VPWS: the service id of the local attachment circuit; the remote end configures it as its `remote_service_id`.
   */
  local_service_id: string | null;
  /**
   * EVPN-VPWS: the service id of the remote end.
   */
  remote_service_id: string | null;
  /**
   * The control word setting of the forwarding domain binding; null when not configured (the default is on).
   */
  control_word: boolean | null;
  /**
   * The route distinguisher (`192.0.2.1:100`); null when not configured (auto).
   */
  route_distinguisher: string | null;
  /**
   * Route targets.
   */
  route_targets: RouteTarget[];
  /**
   * The SRv6 locator the instance's service SIDs come from (`segment-routing-srv6 locator`, see `segment_routing.srv6.locators`); null when it does not run over SRv6.
   */
  srv6_locator: string | null;
  /**
   * The SR policy color that steers the instance (`sr-policy color`); null when not configured.
   */
  sr_policy_color: string | null;
}
/**
 * A route target of an EVPN instance (`vpn-target`). Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "RouteTarget".
 */
export interface RouteTarget {
  /**
   * The route target as written (`64496:100`).
   */
  route_target: string;
  /**
   * `import`, `export` or `both`; null when not configured.
   */
  type: string | null;
}
/**
 * A configuration file the SAOS 10 translator could not parse.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "FailedTemplate".
 */
export interface FailedTemplate {
  /**
   * The file, as in `templates`.
   */
  template: string;
  /**
   * The translator's message (first line).
   */
  error: string;
}
/**
 * A physical link between two device ports, as the input topology declares it. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Link".
 */
export interface Link {
  a: LinkEnd;
  b: LinkEnd;
}
/**
 * One end of a physical link. Since schema 1.5.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "LinkEnd".
 */
export interface LinkEnd {
  /**
   * The device, as in `devices[].device`.
   */
  device: string;
  /**
   * The port on that device, as the topology names it (`2`, `eth1`).
   */
  port: string;
}
/**
 * SRv6 configuration. Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Srv6".
 */
export interface Srv61 {
  /**
   * SRv6 locators, in configuration order.
   */
  locators: Srv6Locator[];
}
/**
 * The link affinities (admin groups, by name) a Flex-Algo computation uses. Since schema 1.6.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "AdminGroups".
 */
export interface FlexAlgoAdminGroups1 {
  /**
   * A link is used only if it has at least one of these groups (`include-any-admin-group`).
   */
  include_any: string[];
  /**
   * A link is used only if it has all of these groups (`include-all-admin-group`).
   */
  include_all: string[];
  /**
   * A link with any of these groups is not used (`exclude-any-admin-group`).
   */
  exclude_any: string[];
}
