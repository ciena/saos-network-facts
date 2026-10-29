import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import {
  bgpPeers, devicesByName, FactsFormatError, interfacesOnPort, isisArea, isisAreaId, isisSystemId, loopbacks, parseFacts, readFacts,
} from "../src/node.ts";

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
