// SPDX-License-Identifier: Apache-2.0
// Reader for saos-network-facts facts files, and the helpers every consumer needs: which IP
// interfaces ride a port (SAOS 10: flow point -> forwarding domain -> interface; SAOS 6: the VLANs
// the port carries), loopbacks, BGP neighbours, the parts of an IS-IS NET, IS-IS interface metrics,
// CCM intervals, G.8032 rings and the devices on a ring, SRv6 locators, Flex-Algo definitions and
// EVPN instances. Pure functions, no Node APIs, so this entry
// point works in a browser too; `@ciena/saos-network-facts/node` adds `readFacts(file)`.

import type {
  DeviceFacts, DeviceRecord, EvpnInstance, FactsFile, FlexAlgorithm, Interface, IsisInstance, Mep, Ring, RingInstance, RingPort, Srv6Locator,
} from "./generated/facts.ts";

export type * from "./generated/facts.ts";

/** The schema major version this reader understands. */
export const SCHEMA_MAJOR = 1;
/** `schema_version` given to a pre-schema file (a bare list of device records) by `parseFacts`. */
export const LEGACY_SCHEMA_VERSION = "0.0.0";

export class FactsFormatError extends Error {
  override name = "FactsFormatError";
}

/** A facts file from its JSON text or parsed value. Accepts schema 1.x, and the pre-schema bare list of
 * device records (wrapped, with `schema_version` "0.0.0"). Throws FactsFormatError otherwise. */
export function parseFacts(input: string | unknown): FactsFile {
  const value: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (Array.isArray(value)) {
    return { schema_version: LEGACY_SCHEMA_VERSION, generator: { name: "legacy", version: "", translator: null }, devices: value as DeviceRecord[] };
  }
  if (!value || typeof value !== "object") throw new FactsFormatError("a facts file is a JSON object");
  const file = value as Partial<FactsFile>;
  const major = Number(String(file.schema_version ?? "").split(".")[0]);
  if (major !== SCHEMA_MAJOR) {
    throw new FactsFormatError(`schema_version ${JSON.stringify(file.schema_version)}: this reader reads ${SCHEMA_MAJOR}.x`);
  }
  if (!Array.isArray(file.devices)) throw new FactsFormatError("devices: expected a list of device records");
  return file as FactsFile;
}

/** The facts of every device that has some (`ok` or `partial`), by device name. */
export function devicesByName(file: FactsFile): Map<string, DeviceFacts> {
  const out = new Map<string, DeviceFacts>();
  for (const r of file.devices) {
    if ((r.status === "ok" || r.status === "partial") && r.facts) out.set(r.device, r.facts);
  }
  return out;
}

/** Interface kinds that never form a link between devices: loopbacks, LAG and physical-port
 * interfaces, and the management plane (SAOS 6 `management`; SAOS 10 `system`, the mgmtbr0-style
 * management bridge, which shares a management network with every other device). */
export const UNROUTED_KINDS: readonly string[] = ["loopback", "lag", "ettp", "management", "system"];

/** A routed interface that can sit on a port: anything addressed that is not a loopback, a LAG,
 * a physical port or a management interface (SAOS 10 types `ip`, `point-to-point`, ...). */
export function isRouted(i: Interface): boolean {
  return Boolean(i.ip) && !UNROUTED_KINDS.includes(i.kind);
}

export type PortInterface = {
  name: string;
  /** address with prefix length, as in the facts (`192.0.2.1/31`) */
  ip: string;
  /** the VLAN it is reached on, null when untagged */
  vlan: string | null;
  /** the IS-IS instance the interface is attached to, null when none */
  isis: string | null;
  /** the LAG the port belongs to, when the interface is reached through it */
  lag: string | null;
};

/** Every IP interface a device uses on a port, in facts order: through the flow points on the port
 * (SAOS 10: fp -> fd -> the interface bound to that fd; the VLAN from the flow point's classifier)
 * and through the VLANs the port carries (SAOS 6: the IP interface on that VLAN). The port's LAG
 * counts as the port. */
export function interfacesOnPort(facts: DeviceFacts, port: string | number): PortInterface[] {
  const ports = facts.ports ?? {};
  const name = String(port);
  const lag = ports[name]?.lag ?? null;
  const names = [name, ...(lag ? [lag] : [])];
  const routed = (facts.interfaces ?? []).filter(isRouted);
  const classifiers = facts.classifiers ?? {};
  const attached = new Map((facts.isis?.interfaces ?? []).map((x) => [x.interface, x.instance ?? null] as const));
  const out: PortInterface[] = [];
  const add = (i: Interface, vlan: string | null) => {
    if (!out.some((o) => o.name === i.name)) {
      out.push({ name: i.name, ip: i.ip!, vlan, isis: i.isis ?? attached.get(i.name) ?? null, lag });
    }
  };
  for (const fp of facts.fps ?? []) {
    if (!fp.fd || !fp.logical_port || !names.includes(String(fp.logical_port))) continue;
    const i = routed.find((x) => x.fd === fp.fd);
    if (i) add(i, (fp.classifiers ?? []).flatMap((c) => classifiers[c] ?? [])[0] ?? null);
  }
  for (const n of names) {
    for (const vlan of ports[n]?.vlans ?? []) {
      const i = routed.find((x) => x.vlan !== null && x.vlan !== undefined && String(x.vlan) === String(vlan));
      if (i) add(i, String(vlan));
    }
  }
  return out;
}

/** The loopbacks that have an address, in facts order. */
export function loopbacks(facts: DeviceFacts): Array<{ name: string; ip: string; isis: string | null }> {
  return (facts.interfaces ?? []).filter((i) => i.kind === "loopback" && i.ip).map((i) => ({ name: i.name, ip: i.ip!, isis: i.isis ?? null }));
}

/** BGP neighbours, with the remote AS as a number (null when not set). `routeReflectorClient` is null
 * when the record does not say (a SAOS 6 peer, a pre-schema file), so a caller can fall back to
 * another source; only an explicit flag is true or false. `peerGroup` is the neighbour's peer group
 * (schema 1.6), null when it has none or the file predates it. */
export function bgpPeers(
  facts: DeviceFacts,
): Array<{ ip: string | null; remoteAs: number | null; routeReflectorClient: boolean | null; peerGroup: string | null }> {
  return (facts.peers ?? [])
    .filter((p) => p.kind === "bgp")
    .map((p) => ({
      ip: p.ip,
      remoteAs: p.remote_as == null ? null : Number(p.remote_as),
      routeReflectorClient: p.route_reflector_client == null ? null : Boolean(p.route_reflector_client),
      peerGroup: p.peer_group ?? null,
    }));
}

function netParts(net: string | null | undefined): string[] | null {
  if (!net) return null;
  const parts = net.trim().split(".");
  return parts.length < 5 ? null : parts;
}

/** The IS-IS area of a NET: everything before the 6-byte system id and the NSEL
 * (`49.0001.1720.1600.0001.00` -> `49.0001`). Null when the NET is not well formed. */
export function isisAreaId(net: string | null | undefined): string | null {
  const parts = netParts(net);
  return parts ? parts.slice(0, -4).join(".") : null;
}

/** The system id of a NET (`49.0001.1720.1600.0001.00` -> `1720.1600.0001`), or null. */
export function isisSystemId(net: string | null | undefined): string | null {
  const parts = netParts(net);
  return parts ? parts.slice(-4, -1).join(".") : null;
}

/** An instance's area: `area_id`, else from its NET, else (a pre-schema file) from `area`, which
 * holds the NET on SAOS 10 and the area itself on SAOS 6. */
export function isisArea(instance: Pick<IsisInstance, "area"> & Partial<IsisInstance>): string | null {
  if (instance.area_id) return instance.area_id;
  if (instance.net) return isisAreaId(instance.net);
  return isisAreaId(instance.area) ?? instance.area ?? null;
}

/** An IS-IS level as a number: `level-1` / `L1` / `1` -> 1, `level-2` / `L2` / `2` -> 2, else null. */
function levelOf(level: string | number): 1 | 2 | null {
  const m = /([12])$/.exec(String(level).trim());
  return m ? (Number(m[1]) as 1 | 2) : null;
}

/** The IS-IS metric an interface advertises at `level` (1 / 2, or as written: `level-2`, `L2`): the
 * wide metric (RFC 5305) the configuration sets for that level, else its narrow metric, else null
 * (the interface advertises its default). Reads `isis.interfaces[].metrics` (schema 1.3); null for
 * older files. With the interface on several instances, the first that sets one. */
export function isisMetric(facts: DeviceFacts, iface: string, level: string | number): number | null {
  const want = levelOf(level);
  if (want === null) return null;
  for (const item of facts.isis?.interfaces ?? []) {
    if (item.interface !== iface) continue;
    const m = (item.metrics ?? []).find((x) => levelOf(x.level) === want);
    const value = m?.wide_metric ?? m?.metric ?? null;
    if (value !== null && value !== "" && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

/** The CCM interval a MEP's maintenance association is configured with, in milliseconds: the
 * `ccm_interval` text as SAOS 10 (`3.3ms`, `10ms`, `100ms`, `1s`, `10s`, `1min`, `10min`) or
 * SAOS 6 / 8 (`3.33ms`, `1sec`, `10sec`, ... or the 802.1Q interval index `1`-`7`) write it.
 * Null when not configured (the device sends at its default), or when CCMs are off (`0`, `off`). */
export function ccmIntervalMs(mep: Pick<Mep, "ccm_interval"> | string | null | undefined): number | null {
  const text = (typeof mep === "string" ? mep : mep?.ccm_interval) ?? null;
  if (text === null) return null;
  const s = String(text).trim().toLowerCase();
  const byIndex: Record<string, number> = { "1": 10 / 3, "2": 10, "3": 100, "4": 1000, "5": 10000, "6": 60000, "7": 600000 };
  const byIndexMs = byIndex[s];
  if (byIndexMs !== undefined) return byIndexMs;
  const m = /^(\d+(?:\.\d+)?)\s*(ms|s|sec|min)$/.exec(s);
  if (!m) return null;
  const value = Number(m[1]);
  const unit = m[2];
  if (unit === "ms") return Math.abs(value - 3.3) < 0.1 ? 10 / 3 : value;
  return unit === "min" ? value * 60000 : value * 1000;
}

/** The G.8032 rings a device configures (SAOS 6 / 8 logical rings, SAOS 10 `g8032-ring`s), in facts
 * order, each with `ports` and `instances` (empty lists for a file before schema 1.5, where a ring
 * has only `name`, `west` and `east`). Takes a device's facts or its record; empty when the device
 * has no rings or no facts. */
export type RingFacts = Ring & { ports: RingPort[]; instances: RingInstance[] };

/** A device's facts from its facts or its record (null when it has none). */
function factsOf(device: DeviceFacts | DeviceRecord | null | undefined): DeviceFacts | null | undefined {
  return device && "facts" in device && !("hostname" in device) ? device.facts : (device as DeviceFacts | null | undefined);
}

export function ringsOf(device: DeviceFacts | DeviceRecord | null | undefined): RingFacts[] {
  const facts = factsOf(device);
  return (facts?.rings ?? []).map((r) => ({ ...r, ports: r.ports ?? [], instances: r.instances ?? [] }));
}

export type RingMember = {
  /** the device name, as in `devices[].device` */
  device: string;
  /** that device's ring with the ring id */
  ring: RingFacts;
};

/** Every device of the file that configures a ring with this ring id (`ring_id`, as written in the
 * configurations: `1` and `"1"` match), with its ring, in file order. Rings without a ring id (a
 * file before schema 1.5, a ring whose configuration sets none) are never members. */
export function ringMembers(file: FactsFile, ringId: string | number): RingMember[] {
  const want = String(ringId);
  const out: RingMember[] = [];
  for (const [device, facts] of devicesByName(file)) {
    for (const ring of ringsOf(facts)) {
      if (ring.ring_id != null && String(ring.ring_id) === want) out.push({ device, ring });
    }
  }
  return out;
}

/** The SRv6 locators a device configures (SAOS 10, schema 1.6), in configuration order; empty for a
 * device without any, a SAOS 6 / 8 device or an older file. Takes a device's facts or its record. */
export function srv6Locators(device: DeviceFacts | DeviceRecord | null | undefined): Srv6Locator[] {
  return factsOf(device)?.segment_routing?.srv6?.locators ?? [];
}

/** The Flex-Algo definitions a device configures (SAOS 10, schema 1.6); empty when there are none. */
export function flexAlgorithms(device: DeviceFacts | DeviceRecord | null | undefined): FlexAlgorithm[] {
  return factsOf(device)?.segment_routing?.flex_algorithms ?? [];
}

/** The EVPN instances a device configures (SAOS 10, schema 1.6); empty when there are none. */
export function evpnInstances(device: DeviceFacts | DeviceRecord | null | undefined): EvpnInstance[] {
  return factsOf(device)?.evpn_instances ?? [];
}

export type EvpnMember = {
  /** the device name, as in `devices[].device` */
  device: string;
  /** that device's EVPN instance */
  instance: EvpnInstance;
};

/** Every device of the file that configures an EVPN instance with this EVI (`1` and `"1"` match),
 * with its instance, in file order: the PEs of one EVPN-VPLS, or the two ends of an EVPN-VPWS
 * (whose `local_service_id` / `remote_service_id` mirror each other). */
export function evpnMembers(file: FactsFile, evi: string | number): EvpnMember[] {
  const want = String(evi);
  const out: EvpnMember[] = [];
  for (const [device, facts] of devicesByName(file)) {
    for (const instance of evpnInstances(facts)) {
      if (String(instance.evi) === want) out.push({ device, instance });
    }
  }
  return out;
}
