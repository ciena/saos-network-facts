# Test fixtures

Everything here is synthetic, written for these tests: device names, addresses (RFC 5737
documentation ranges) and services are made up.

- `labs/sr-l2/`: a containerlab topology with two SAOS 10 PEs (one CLI, one NETCONF XML) running
  IS-IS with SR-MPLS, an SR policy, BGP with a route-reflector client, a VPWS pseudowire and CFM
  MEPs (CCM interval 10 ms, set in the CLI on PE1 and in the XML on PE2), plus a Linux host (skipped).
- `labs/mixed/`: a configs directory without a topology: a SAOS 6 device (`AGG1.cfg`, with a CFM
  service whose `cfm service set ... ccm-interval` is 100 ms) and a SAOS 10
  device with three files applied in order (`PE3/`), the second removing objects over NETCONF and the
  third rejected by the translator (status `partial`); `platform-map.yaml` gives the device types.
  The `mixed-detected` case reads it without the map: PE3 has no platform, so it is `error` and
  nothing is sent to the translator.
- `labs/ospf-tp/`: a configs directory of four SAOS 10 devices in a ring (PE1, P1, PE2, P2) running
  OSPF area 0, an MPLS-TP co-routed tunnel PE1 - P1 - PE2 with a 1:1 backup over P2 (LSP BFD on
  both) and a static VPWS pseudowire on it; `platform-map.yaml` gives the device types.
- `labs/leaf-delete/`: one SAOS 10 device in two files, the second deleting leaves of a port it
  does not configure (`no oc-if:interfaces interface 9 config ptp-id`, ...): no interface or port 9
  may appear.
- `labs/g8032-two-ring/`: a two-ring G.8032 lab on SAOS 10 (nine 5162s, a containerlab topology with its
  links): a four-node major ring RM_1 - RM_2 - RM_3 - RM_4 (ring id 1, R-APS VID 4090, RPL owner RM_4
  port1, neighbour RM_1 port0) and a sub-ring RM_1 - RS_1 - RS_2 - RM_4 without a virtual channel (ring
  id 2, VID 4089, RPL owner RM_1 port1, neighbour RS_1 port0), both protecting the VPLS forwarding
  domain `ring_1-fd`; CE_1..3 hang off RM_2, RM_3 and RS_1 with no rings.
- `labs/g8032-by-name/`: a G.8032 major ring on four SAOS 10 devices (5162s, a containerlab topology with
  its links) written in the CLI's nested form with quoted names and **no ring-id**, as SAOS 10 CLI configs
  usually are (the YANG key is the ring name; ring-id is optional): ring `RING_A` AR_1 - AR_2 - AR_3 - AR_4,
  instance `VR_A` (R-APS VID 4000, level 1, WTR 1 min, RPL owner AR_2 port1, neighbour AR_3 port0)
  protecting the VPLS forwarding domain `ring-fd`. The viewer joins the devices' rings by name.
- `labs/g8032-saos6/`: a configs directory of three SAOS 6 devices and one SAOS 8 device:
  interconnection node A1 (major ring `lr1` with RPL owner on its east port, sub-ring `lr2` terminating
  on its east port), A2 on the major ring, S1 and S2 on the sub-ring (S1 owns the sub-ring's RPL; S2 is
  SAOS 8 and protects a virtual switch instead of VLANs); A2 writes its virtual-ring commands in the CLI's
  short form (`ring virtual-ring ...`, partial command recognition); `platform-map.yaml` gives the device types.
- `labs/srv6-evpn/`: a configs directory of four SAOS 10 devices (PE1 - P1 - PE2, RR1 off P1) running
  IS-IS with SR over IPv6 links, each device split into layered files that share its name up to the
  first dot (`PE1.1-base.cfg`, `PE1.3-device.cfg`, `PE1.6-services.cfg`): the base layer types `lo0`
  as a loopback, the device layer adds its addresses and the services layer its MTU. RR1 reflects
  for PE1 and PE2 through the peer group `CLIENTS` (remote AS, address families, route-reflector
  client) and the PEs reach it through the peer group `RR`; RR1 turns route-reflector-client off for
  PE2 in `ipv6 unicast` only. No VRFs and no Linux hosts; `platform-map.yaml` gives the device types.
- `cases.yaml`: the extraction cases the tests run; `expected/`: their facts files.
- `pivots.json`: the translator's recorded replies for every SAOS 10 file (`scripts/record_pivots.py`),
  all recorded with translator 4.2.1.
