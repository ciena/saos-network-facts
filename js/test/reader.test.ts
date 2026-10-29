// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import {
  bgpPeers, devicesByName, FactsFormatError, interfacesOnPort, isisArea, isisAreaId, isisMetric, isisSystemId, loopbacks, parseFacts, readFacts,
} from "../src/node.ts";
import type { DeviceFacts } from "../src/generated/facts.ts";

const expected = path.resolve(import.meta.dirname, "..", "..", "tests", "fixtures", "expected");
const srl2 = readFacts(path.join(expected, "sr-l2.facts.json"));
const mixed = readFacts(path.join(expected, "mixed.facts.json"));

test("readFacts reads schema 1.x and keeps devices with facts", () => {
  assert.equal(srl2.schema_version.split(".")[0], "1");
  assert.deepEqual([...devicesByName(srl2).keys()], ["PE1", "PE2"]);
  assert.deepEqual([...devicesByName(mixed).keys()], ["AGG1", "PE3"]);
});

test("parseFacts wraps a pre-schema list and refuses other majors", () => {
  assert.equal(parseFacts("[]").schema_version, "0.0.0");
  assert.throws(() => parseFacts({ schema_version: "2.0.0", devices: [] }), FactsFormatError);
  assert.throws(() => parseFacts({ schema_version: "1.0.0" }), FactsFormatError);
  assert.throws(() => parseFacts(42), FactsFormatError);
});

test("SAOS 10: fp -> fd -> interface on a port", () => {
  const pe1 = devicesByName(srl2).get("PE1")!;
  assert.deepEqual(interfacesOnPort(pe1, 1), [{ name: "PE1-PE2", ip: "198.51.100.0/31", vlan: null, isis: "CORE", lag: null }]);
  assert.deepEqual(interfacesOnPort(pe1, "3"), []); // a VPWS attachment circuit: no IP interface
  assert.deepEqual(interfacesOnPort(pe1, "99"), []);
});

test("SAOS 6: the IP interface on a VLAN the port's LAG carries", () => {
  const agg = devicesByName(mixed).get("AGG1")!;
  assert.deepEqual(interfacesOnPort(agg, "1"), [{ name: "core1", ip: "198.51.100.10/31", vlan: "100", isis: "CORE", lag: "LAG1" }]);
});

test("loopbacks and BGP peers", () => {
  const pe1 = devicesByName(srl2).get("PE1")!;
  assert.deepEqual(loopbacks(pe1), [{ name: "lb0", ip: "192.0.2.1/32", isis: "CORE" }]);
  assert.deepEqual(bgpPeers(pe1), [{ ip: "192.0.2.2", remoteAs: 65000, routeReflectorClient: true }]);
});

test("BGP peers: a missing route-reflector-client flag stays unknown", () => {
  const peers = [
    { kind: "bgp", name: "as65000", ip: "192.0.2.3", remote_as: "65000" },
    { kind: "bgp", name: "as65000", ip: "192.0.2.4", remote_as: null, route_reflector_client: false },
  ];
  assert.deepEqual(bgpPeers({ peers } as unknown as DeviceFacts), [
    { ip: "192.0.2.3", remoteAs: 65000, routeReflectorClient: null },
    { ip: "192.0.2.4", remoteAs: null, routeReflectorClient: false },
  ]);
});

test("IS-IS NET parsing", () => {
  assert.equal(isisAreaId("49.0001.1720.1600.0001.00"), "49.0001");
  assert.equal(isisAreaId("49.0001.0002.1720.1600.0001.00"), "49.0001.0002");
  assert.equal(isisSystemId("49.0001.1720.1600.0001.00"), "1720.1600.0001");
  assert.equal(isisAreaId("49.0001"), null);
  assert.equal(isisAreaId(null), null);
  // schema 1 instance, and pre-schema SAOS 10 (NET in area) and SAOS 6 (area in area) instances
  assert.equal(isisArea(devicesByName(srl2).get("PE2")!.isis.instances[0]!), "49.0001");
  assert.equal(isisArea({ area: "49.0002.2030.0011.3030.00" }), "49.0002");
  assert.equal(isisArea({ area: "49.0011" }), "49.0011");
});

test("IS-IS interface metrics: wide, else narrow, per level; null when not set", () => {
  const pe1 = devicesByName(srl2).get("PE1")!;
  const pe2 = devicesByName(srl2).get("PE2")!;
  assert.equal(isisMetric(pe1, "PE1-PE2", 2), 100);
  assert.equal(isisMetric(pe2, "PE2-PE1", "level-2"), 100); // wide 100 over narrow 30
  assert.equal(isisMetric(pe1, "PE1-PE2", 1), null);
  assert.equal(isisMetric(pe1, "lb0", 2), null);
  assert.equal(isisMetric(devicesByName(mixed).get("AGG1")!, "core1", "L2"), 50);
  const narrow = { isis: { instances: [], interfaces: [{ interface: "x", instance: "I", level: null, type: null, metrics: [{ level: "level-1", metric: "7", wide_metric: null }] }] } } as unknown as DeviceFacts;
  assert.equal(isisMetric(narrow, "x", "L1"), 7);
  const old = { isis: { instances: [], interfaces: [{ interface: "x", instance: "I", level: null, type: null }] } } as unknown as DeviceFacts;
  assert.equal(isisMetric(old, "x", 2), null);
});
