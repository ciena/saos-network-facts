# Test fixtures

Everything here is synthetic, written for these tests: device names, addresses (RFC 5737
documentation ranges) and services are made up.

- `labs/sr-l2/`: a containerlab topology with two SAOS 10 PEs (one CLI, one NETCONF XML) running
  IS-IS with SR-MPLS, an SR policy, BGP with a route-reflector client, a VPWS pseudowire and CFM
  MEPs, plus a Linux host (skipped).
- `labs/mixed/`: a configs directory without a topology: a SAOS 6 device (`AGG1.cfg`) and a SAOS 10
  device with three files applied in order (`PE3/`), the second removing objects over NETCONF and the
  third rejected by the translator (status `partial`); `platform-map.yaml` gives the device types.
- `cases.yaml`: the extraction cases the tests run; `expected/`: their facts files.
- `pivots.json`: the translator's recorded replies for every SAOS 10 file (`scripts/record_pivots.py`).
