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
   * SAOS 6 logical rings.
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
   * SAOS 6: `loopback`, `ip` or `management`. SAOS 10: the interface type as configured (`loopback`, `ip`, `lag`, `point-to-point`, ...).
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
   * What uses the port: `aggregation`, `sub-port`, `virtual-switch`, `ring`, `cfm-mep` (SAOS 6), `fp`, `cfm-mep` (SAOS 10).
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
 * SAOS 6 G.8032 logical ring.
 *
 * This interface was referenced by `FactsFile`'s JSON-Schema
 * via the `definition` "Ring".
 */
export interface Ring {
  /**
   * Ring name.
   */
  name: string | null;
  /**
   * West port.
   */
  west: string | null;
  /**
   * East port.
   */
  east: string | null;
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
