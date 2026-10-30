# Test fixtures

Everything here is synthetic, written for these tests: device names, addresses (RFC 5737
documentation ranges) and services are made up.

- `labs/sr-l2/`: a containerlab topology with two SAOS 10 PEs (one CLI, one NETCONF XML) running
  IS-IS with SR-MPLS, an SR policy, BGP with a route-reflector client, a VPWS pseudowire and CFM
  MEPs, plus a Linux host (skipped).
- `labs/mixed/`: a configs directory without a topology: a SAOS 6 device (`AGG1.cfg`) and a SAOS 10
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
- `cases.yaml`: the extraction cases the tests run; `expected/`: their facts files.
- `pivots.json`: the translator's recorded replies for every SAOS 10 file (`scripts/record_pivots.py`),
  all recorded with translator 4.2.1.
