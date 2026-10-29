# @ciena/saos-network-facts

The facts-file schema, TypeScript types generated from it, and a reader, for files written by the
[saos-network-facts](https://github.com/ciena/saos-network-facts) extractor.

```ts
import { readFacts } from "@ciena/saos-network-facts/node";   // Node: read a file
import { parseFacts, devicesByName, interfacesOnPort, loopbacks, bgpPeers, isisArea, isisAreaId, isisSystemId }
  from "@ciena/saos-network-facts";                          // anywhere: no Node APIs
import type { FactsFile, DeviceFacts } from "@ciena/saos-network-facts";
import schema from "@ciena/saos-network-facts/schema" with { type: "json" };
```

- `parseFacts(jsonOrValue)` / `readFacts(file)`: a schema 1.x file; a pre-schema bare list of device
  records is wrapped with `schema_version` `"0.0.0"`; anything else throws `FactsFormatError`.
- `devicesByName(file)`: the facts of every `ok` / `partial` device.
- `interfacesOnPort(facts, port)`: the IP interfaces on a port (or its LAG): SAOS 10 through flow
  point -> forwarding domain -> interface, SAOS 6 through the VLANs the port carries.
- `isisAreaId(net)`, `isisSystemId(net)`, `isisArea(instance)`: the parts of an IS-IS NET.

Types and `schema/` are generated from the Python package's schema (`npm run generate`).
