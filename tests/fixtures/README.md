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
- `labs/g8032-saos6/`: a configs directory of three SAOS 6 devices and one SAOS 8 device:
  interconnection node A1 (major ring `lr1` with RPL owner on its east port, sub-ring `lr2` terminating
  on its east port), A2 on the major ring, S1 and S2 on the sub-ring (S1 owns the sub-ring's RPL; S2 is
  SAOS 8 and protects a virtual switch instead of VLANs); `platform-map.yaml` gives the device types.
- `cases.yaml`: the extraction cases the tests run; `expected/`: their facts files.
- `pivots.json`: the translator's recorded replies for every SAOS 10 file (`scripts/record_pivots.py`),
  all recorded with translator 4.2.1.
