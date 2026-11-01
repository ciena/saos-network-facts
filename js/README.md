# @ciena/saos-network-facts

The facts-file schema, TypeScript types generated from it, and a reader, for files written by the
[saos-network-facts](https://github.com/ciena/saos-network-facts) extractor.

```ts
import { readFacts } from "@ciena/saos-network-facts/node";   // Node: read a file
import { parseFacts, devicesByName, interfacesOnPort, isRouted, loopbacks, bgpPeers, isisArea, isisAreaId, isisSystemId, isisMetric, ccmIntervalMs, ringsOf, ringMembers,
         srv6Locators, flexAlgorithms, evpnInstances, evpnMembers, vrfInstances, vrfMembers, vrfRouteTargets, staticRoutes,
         hosts, hostByName, hostGateway }
  from "@ciena/saos-network-facts";                          // anywhere: no Node APIs
import type { FactsFile, DeviceFacts } from "@ciena/saos-network-facts";
import schema from "@ciena/saos-network-facts/schema" with { type: "json" };
```

- `parseFacts(jsonOrValue)` / `readFacts(file)`: a schema 1.x file; a pre-schema bare list of device
  records is wrapped with `schema_version` `"0.0.0"`; anything else throws `FactsFormatError`.
- `devicesByName(file)`: the facts of every `ok` / `partial` device.
- `interfacesOnPort(facts, port)`: the IP interfaces on a port (or its LAG): SAOS 10 through flow
  point -> forwarding domain -> interface, SAOS 6 through the VLANs the port carries.
- `isRouted(interface)`: an addressed interface that can link two devices: not a loopback, a LAG or
  port interface, or the management plane (`management`, SAOS 10 `system` such as mgmtbr0).
- `isisAreaId(net)`, `isisSystemId(net)`, `isisArea(instance)`: the parts of an IS-IS NET;
  `isisMetric(facts, interface, level)`: the wide, else narrow, metric at a level (schema 1.3).
- `ccmIntervalMs(mep | text)`: a MEP's `ccm_interval` (schema 1.4) in milliseconds, in the SAOS 10
  (`1s`, `3.3ms`) and SAOS 6 (`1sec`, `3.33ms`, an 802.1Q index) spellings; null when not set or off.
- `ringsOf(device)`: a device's G.8032 rings with their ports and protection instances (schema 1.5;
  empty lists for older files); `ringMembers(file, ringId)`: every device on a ring id, with its ring.
- `bgpPeers(facts)`: BGP neighbours with `remoteAs`, `routeReflectorClient`, `peerGroup` (schema 1.6) and
  `vrf` (schema 1.7: the VRF of an L3VPN CE neighbour, null for the global table).
- `srv6Locators(device)`, `flexAlgorithms(device)`, `evpnInstances(device)`: a SAOS 10 device's SRv6
  locators, Flex-Algo definitions and EVPN instances (schema 1.6; empty for older files and SAOS 6 / 8);
  `evpnMembers(file, evi)`: every device with an EVPN instance of that EVI (the PEs of an EVPN-VPLS,
  the two ends of an EVPN-VPWS), with its instance.
- `vrfInstances(device)`, `staticRoutes(device, vrf?)`: a SAOS 10 device's VRFs (route distinguisher,
  route targets, address families, SRv6 locators, bound interfaces) and static routes, optionally of one
  VRF (`default` is the global table) (schema 1.7; empty for older files and SAOS 6 / 8);
  `vrfMembers(file, name)`: every device with a VRF of that name, with its VRF;
  `vrfRouteTargets(vrf, addressFamily, "import" | "export")`: the route targets the VRF imports or
  exports in one address family (its own and the VRF-wide ones, `both` counting as each).
- `hosts(file)`, `hostByName(file, name)`: the Linux hosts (schema 1.8: addresses, routes, the device
  port each interface is cabled to, `ignored_commands`; empty for older files);
  `hostGateway(host, "ipv4" | "ipv6")`: its default gateway in that family, or null.

Types and `schema/` are generated from the Python package's schema (`npm run generate`).
