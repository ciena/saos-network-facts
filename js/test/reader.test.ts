// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import {
  bgpPeers, ccmIntervalMs, devicesByName, FactsFormatError, interfacesOnPort, isisArea, isisAreaId, isisMetric, isisSystemId, isRouted, loopbacks,
  parseFacts, readFacts, ringMembers, ringsOf,
} from "../src/node.ts";
import type { DeviceFacts, Interface } from "../src/generated/facts.ts";

const expected = path.resolve(import.meta.dirname, "..", "..", "tests", "fixtures", "expected");
const srl2 = readFacts(path.join(expected, "sr-l2.facts.json"));
const mixed = readFacts(path.join(expected, "mixed.facts.json"));
const g8032 = readFacts(path.join(expected, "g8032-two-ring.facts.json"));
const g8032saos6 = readFacts(path.join(expected, "g8032-saos6.facts.json"));

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

test("isRouted: addressed interfaces that can link devices; not loopbacks, LAGs, ports or the management plane", () => {
  const iface = (kind: string, ip: string | null = "192.0.2.1/24") => ({ name: kind, kind, ip } as unknown as Interface);
  assert.deepEqual(["ip", "point-to-point", "unknown"].map((k) => isRouted(iface(k))), [true, true, true]);
  // SAOS 6 `management` and SAOS 10 `system` (mgmtbr0) address the shared management network
  assert.deepEqual(["loopback", "lag", "ettp", "management", "system"].map((k) => isRouted(iface(k))), [false, false, false, false, false]);
  assert.equal(isRouted(iface("ip", null)), false);
});

test("ccmIntervalMs: SAOS 10 and SAOS 6 spellings, 802.1Q indexes; null when unset or off", () => {
  const pe1 = devicesByName(srl2).get("PE1")!;
  assert.equal(ccmIntervalMs(pe1.cfm.meps[0]!), 10);
  assert.equal(ccmIntervalMs(devicesByName(mixed).get("AGG1")!.cfm.meps[0]!), 100);
  assert.deepEqual(["3.3ms", "10ms", "100ms", "1s", "10s", "1min", "10min"].map(ccmIntervalMs), [10 / 3, 10, 100, 1000, 10000, 60000, 600000]);
  assert.deepEqual(["3.33ms", "1sec", "10sec", "1min", "4", "7"].map(ccmIntervalMs), [10 / 3, 1000, 10000, 60000, 1000, 600000]);
  assert.deepEqual([null, undefined, "off", "0", "soon", { ccm_interval: null }].map(ccmIntervalMs), [null, null, null, null, null, null]);
});

test("ringsOf: a device's rings with their instances; empty without rings", () => {
  const rm1 = ringsOf(devicesByName(g8032).get("RM_1"));
  assert.deepEqual(rm1.map((r) => [r.name, r.ring_id, r.west, r.east]), [["ring_1", "1", "1", "2"], ["ring_2", "2", "2", "3"]]);
  const erp1 = rm1[0]!.instances[0]!;
  assert.equal(erp1.type, "major");
  assert.deepEqual(erp1.rpl.map((p) => [p.port, p.interface, p.role]), [["port0", "1", "neighbor"], ["port1", "2", "none"]]);
  const erp2 = rm1[1]!.instances[0]!;
  assert.deepEqual([erp2.type, erp2.virtual_channel, erp2.sub_ring_of, erp2.members, erp2.timers.wtr], ["sub", false, "ring_1", ["ring_1-fd"], "1"]);
  assert.deepEqual(ringsOf(devicesByName(g8032).get("CE_1")), []);
  assert.deepEqual(ringsOf(g8032.devices.find((d) => d.device === "RS_1")).map((r) => r.name), ["ring_2"]); // a device record works too
  assert.deepEqual(ringsOf(g8032.devices.find((d) => d.device === "CE_2")), []);
  assert.deepEqual(ringsOf(null), []);
  // a pre-1.5 ring (name / west / east only) gets empty ports and instances
  const old = { rings: [{ name: "lr1", west: "1", east: "3" }] } as unknown as DeviceFacts;
  assert.deepEqual(ringsOf(old), [{ name: "lr1", west: "1", east: "3", ports: [], instances: [] }]);
});

test("ringMembers: the devices on a ring id, with the RPL owner and the interconnection nodes", () => {
  const major = ringMembers(g8032, 1);
  assert.deepEqual(major.map((m) => m.device), ["RM_1", "RM_2", "RM_3", "RM_4"]);
  const owner = major.filter((m) => m.ring.instances.some((i) => i.rpl.some((p) => p.role === "owner")));
  assert.deepEqual(owner.map((m) => m.device), ["RM_4"]);
  const sub = ringMembers(g8032, "2");
  assert.deepEqual(sub.map((m) => m.device), ["RM_1", "RM_4", "RS_1", "RS_2"]);
  assert.deepEqual(sub.filter((m) => m.ring.instances[0]!.sub_ring_of === "ring_1").map((m) => m.device), ["RM_1", "RM_4"]);
  assert.deepEqual(ringMembers(g8032, 9), []);
  assert.deepEqual(ringMembers(g8032saos6, 2).map((m) => [m.device, m.ring.name]), [["A1", "lr2"], ["S1", "lr2"], ["S2", "lr2"]]);
  assert.deepEqual(ringMembers(srl2, 1), []);
  assert.equal(g8032.links?.length, 10);
});
