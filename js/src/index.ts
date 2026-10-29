// SPDX-License-Identifier: Apache-2.0
// Reader for saos-network-facts facts files, and the helpers every consumer needs: which IP
// interfaces ride a port (SAOS 10: flow point -> forwarding domain -> interface; SAOS 6: the VLANs
// the port carries), loopbacks, BGP neighbours, and the parts of an IS-IS NET. Pure functions, no
// Node APIs, so this entry point works in a browser too; `@ciena/saos-network-facts/node` adds
// `readFacts(file)`.

import type { DeviceFacts, DeviceRecord, FactsFile, Interface, IsisInstance } from "./generated/facts.ts";

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

/** A routed interface that can sit on a port: anything addressed that is not a loopback, a LAG,
 * a physical port or the management interface (SAOS 10 types `ip`, `point-to-point`, ...). */
export function isRouted(i: Interface): boolean {
  return Boolean(i.ip) && !["loopback", "lag", "ettp", "management"].includes(i.kind);
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
 * another source; only an explicit flag is true or false. */
export function bgpPeers(facts: DeviceFacts): Array<{ ip: string | null; remoteAs: number | null; routeReflectorClient: boolean | null }> {
  return (facts.peers ?? [])
    .filter((p) => p.kind === "bgp")
    .map((p) => ({
      ip: p.ip,
      remoteAs: p.remote_as == null ? null : Number(p.remote_as),
      routeReflectorClient: p.route_reflector_client == null ? null : Boolean(p.route_reflector_client),
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
