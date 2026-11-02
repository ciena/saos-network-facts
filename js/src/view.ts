// SPDX-License-Identifier: Apache-2.0
// View properties: what a page or a card shows of a facts file (schema/view-v1.schema.json). A view
// is resolved by merging, lowest first, the built-in defaults, a preset, a view file, then URL
// parameters. Every property is optional; an unknown property or a bad value is reported as a
// warning and ignored (the lower layer's value stays), never fatal, so an older reader still shows a
// newer view. Pure functions, no Node or DOM APIs.

import type { Camera, Frames, LayerId, Layout, PresetName, Snapshot, ViewFile } from "./generated/view.ts";
import { VIEW_PRESETS_DATA } from "./generated/view-presets.ts";

export type * from "./generated/view.ts";

/** The view schema version this reader writes and understands (any 1.x view is read). */
export const VIEW_VERSION = "1.0";
/** The view schema major version this reader understands. */
export const VIEW_MAJOR = 1;

/** Every layer, in the standard order (planes bottom to top, frames first to last). */
export const LAYER_IDS: readonly LayerId[] = ["physical", "ring", "igp", "mpls", "srv6", "bgp", "vrf", "pw", "evpn", "cfm"];
/** The order `frames.start: "signature"` picks from: the lab's services, else its transport, else its IGP. */
export const SIGNATURE_ORDER: readonly LayerId[] = ["pw", "evpn", "vrf", "mpls", "srv6", "ring", "igp", "bgp", "cfm", "physical"];
export const PRESET_NAMES = Object.keys(VIEW_PRESETS_DATA.presets) as PresetName[];

/** A view with every property set: what a consumer reads after `resolveView`. */
export interface ResolvedView {
  view_version: string;
  /** The preset applied, or null. */
  preset: PresetName | null;
  title: string | null;
  layers: LayerId[];
  frames: Required<Frames>;
  snapshot: Required<Snapshot>;
  layout: Required<Layout>;
  plain: boolean;
  camera: Camera;
}

export interface ResolvedViewResult {
  view: ResolvedView;
  /** What was ignored and why: unknown properties, bad values, an unknown preset, another major version. */
  warnings: string[];
}

/** The URL parameters `resolveView` reads; any other parameter belongs to the page and is left alone. */
export const VIEW_PARAMS = ["preset", "title", "layers", "frames", "start", "period", "variant", "layout", "aspect", "columns", "plain", "camera"] as const;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** The built-in defaults, as a resolved view. */
export const VIEW_DEFAULTS: ResolvedView = Object.freeze({ ...clone(VIEW_PRESETS_DATA.defaults), preset: null }) as ResolvedView;
/** The presets, by name: partial views applied over the defaults. */
export const VIEW_PRESETS: Readonly<Record<PresetName, ViewFile>> = VIEW_PRESETS_DATA.presets;

// ---- value checks: each returns the value to use, or undefined after a warning -----------------

type Warn = (message: string) => void;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const quote = (v: unknown) => JSON.stringify(v);

function oneOf<T extends string>(where: string, value: unknown, allowed: readonly T[], warn: Warn): T | undefined {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) return value as T;
  warn(`${where}: ${quote(value)} is not one of ${allowed.join(", ")}`);
  return undefined;
}

// A list of layer ids; unknown ids are reported and dropped, the rest kept in the given order.
function layerList(where: string, value: unknown, warn: Warn): LayerId[] | undefined {
  if (!Array.isArray(value)) {
    warn(`${where}: expected a list of layers`);
    return undefined;
  }
  const out: LayerId[] = [];
  for (const id of value) {
    if (!(LAYER_IDS as readonly unknown[]).includes(id)) warn(`${where}: unknown layer ${quote(id)}`);
    else if (!out.includes(id as LayerId)) out.push(id as LayerId);
  }
  return out;
}

const SPECS: Record<string, (where: string, v: unknown, warn: Warn) => unknown> = {
  view_version: (where, v, warn) => {
    if (typeof v !== "string" || !/^\d+\.\d+$/.test(v)) return warn(`${where}: expected "major.minor"`);
    if (Number(v.split(".")[0]) !== VIEW_MAJOR) warn(`${where}: ${v}, this reader understands ${VIEW_MAJOR}.x; reading what it knows`);
    return undefined; // the resolved view always carries the reader's version
  },
  title: (where, v, warn) => (v === null || typeof v === "string" ? v : warn(`${where}: expected a string or null`)),
  layers: layerList,
  plain: (where, v, warn) => (typeof v === "boolean" ? v : warn(`${where}: expected true or false`)),
  camera: (where, v, warn) => oneOf(where, v, ["fit", "top", "iso"], warn),
};

const OBJECT_SPECS: Record<"frames" | "snapshot" | "layout", Record<string, (where: string, v: unknown, warn: Warn) => unknown>> = {
  frames: {
    rule: (where, v, warn) => oneOf(where, v, ["auto", "list"], warn),
    list: layerList,
    start: (where, v, warn) => oneOf(where, v, ["signature", "first", ...LAYER_IDS], warn),
    period_s: (where, v, warn) => (typeof v === "number" && v > 0 && Number.isFinite(v) ? v : warn(`${where}: expected a number of seconds above 0`)),
  },
  snapshot: {
    variant: (where, v, warn) => oneOf(where, v, ["exploded", "stacked"], warn),
  },
  layout: {
    algorithm: (where, v, warn) => oneOf(where, v, ["auto", "force", "hints"], warn),
    hints: (where, v, warn) => {
      if (!isObject(v)) return warn(`${where}: expected { "NAME": [x, y] }`);
      const out: Record<string, [number, number]> = {};
      for (const [name, xy] of Object.entries(v)) {
        if (Array.isArray(xy) && xy.length === 2 && xy.every((n) => typeof n === "number" && Number.isFinite(n))) out[name] = [xy[0], xy[1]];
        else warn(`${where}.${name}: expected [x, y]`);
      }
      return out;
    },
    aspect: (where, v, warn) => oneOf(where, v, ["card", "wide", "free"], warn),
    max_columns: (where, v, warn) => (Number.isInteger(v) && (v as number) >= 1 ? v : warn(`${where}: expected a whole number from 1`)),
  },
};

// Applies one partial view over `into` (in place). `source` names it in warnings.
function apply(into: ResolvedView, view: unknown, source: string, warn: Warn): void {
  if (view === undefined || view === null) return;
  if (!isObject(view)) return warn(`${source}: expected an object`);
  for (const [key, value] of Object.entries(view)) {
    const where = `${source}: ${key}`;
    if (key === "preset") continue; // chosen before merging
    if (key in OBJECT_SPECS) {
      const specs = OBJECT_SPECS[key as keyof typeof OBJECT_SPECS];
      if (!isObject(value)) {
        warn(`${where}: expected an object`);
        continue;
      }
      const target = into[key as keyof typeof OBJECT_SPECS] as unknown as Record<string, unknown>;
      for (const [sub, subValue] of Object.entries(value)) {
        const check = specs[sub];
        if (!check) {
          warn(`${where}.${sub}: unknown property, ignored`);
          continue;
        }
        const ok = check(`${where}.${sub}`, subValue, warn);
        if (ok === undefined) continue;
        // Hints add to (and override) the lower layers' hints, device by device; the rest replace.
        target[sub] = sub === "hints" ? { ...(target[sub] as object), ...(ok as object) } : ok;
      }
      continue;
    }
    const check = SPECS[key];
    if (!check) {
      warn(`${where}: unknown property, ignored`);
      continue;
    }
    const ok = check(where, value, warn);
    if (ok !== undefined) (into as unknown as Record<string, unknown>)[key] = ok;
  }
}

/** The partial view that URL parameters ask for (see VIEW_PARAMS): lists are comma-separated, `frames`
 * sets `frames.rule` to list, `plain` is 1/0 (or true/false). Values are checked by `resolveView`. */
export function viewFromParams(params: string | URLSearchParams | Record<string, string>): ViewFile {
  const q = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  const get = (k: string) => q.get(k)?.trim() || null;
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const out: Record<string, unknown> = {};
  const set = (path: string, value: unknown) => {
    const [a, b] = path.split(".") as [string, string?];
    if (b) out[a] = { ...((out[a] as object) ?? {}), [b]: value };
    else out[a] = value;
  };
  for (const [param, path] of [["preset", "preset"], ["title", "title"], ["start", "frames.start"], ["variant", "snapshot.variant"], ["layout", "layout.algorithm"], ["aspect", "layout.aspect"], ["camera", "camera"]] as const) {
    const v = get(param);
    if (v !== null) set(path, v);
  }
  const layers = get("layers");
  if (layers !== null) set("layers", list(layers));
  const frames = get("frames");
  if (frames !== null) {
    set("frames.rule", "list");
    set("frames.list", list(frames));
  }
  const period = get("period");
  if (period !== null) set("frames.period_s", Number.isNaN(Number(period)) ? period : Number(period));
  const columns = get("columns");
  if (columns !== null) set("layout.max_columns", Number.isNaN(Number(columns)) ? columns : Number(columns));
  const plain = get("plain");
  if (plain !== null) set("plain", ["1", "true", "yes"].includes(plain) ? true : ["0", "false", "no"].includes(plain) ? false : plain);
  return out as ViewFile;
}

/** The view to show: the defaults, then the preset (named by the URL, else by the view file), then
 * the view file (parsed JSON, or its text), then the URL parameters (a query string, URLSearchParams
 * or a plain object; only VIEW_PARAMS are read). Never throws on bad input: what is ignored is listed
 * in `warnings`. */
export function resolveView(view?: unknown, urlParams?: string | URLSearchParams | Record<string, string>): ResolvedViewResult {
  const warnings: string[] = [];
  const warn: Warn = (message) => {
    warnings.push(message);
  };
  let file: unknown = view;
  if (typeof view === "string") {
    try {
      file = JSON.parse(view);
    } catch (err) {
      warn(`view: not JSON (${(err as Error).message})`);
      file = undefined;
    }
  }
  const url = urlParams === undefined ? undefined : viewFromParams(urlParams);

  const resolved = clone(VIEW_DEFAULTS);
  const named = [url?.preset, isObject(file) ? file.preset : undefined];
  for (const [i, name] of named.entries()) {
    if (name === undefined) continue;
    if ((PRESET_NAMES as unknown[]).includes(name)) {
      resolved.preset = name as PresetName;
      break;
    }
    warn(`${i === 0 ? "URL" : "view"}: preset: ${quote(name)} is not one of ${PRESET_NAMES.join(", ")}`);
  }
  if (resolved.preset) apply(resolved, VIEW_PRESETS[resolved.preset], `preset ${resolved.preset}`, warn);
  apply(resolved, file, "view", warn);
  apply(resolved, url, "URL", warn);
  if (!resolved.layers.length) resolved.layers = [...LAYER_IDS];
  return { view: resolved, warnings };
}

/** The frames a card shows for a resolved view, given the layers the facts have content for, and the
 * frame to start on. `start` is null when there is no frame. */
export function viewFrames(view: ResolvedView, present: Iterable<string>): { frames: LayerId[]; start: LayerId | null } {
  const have = new Set(present);
  const shown = (id: LayerId) => have.has(id) && view.layers.includes(id);
  const order = view.frames.rule === "list" ? view.frames.list : LAYER_IDS;
  const frames = order.filter(shown);
  const { start } = view.frames;
  const signature = SIGNATURE_ORDER.find((id) => frames.includes(id)) ?? null;
  if (start === "first") return { frames, start: frames[0] ?? null };
  if (start !== "signature" && frames.includes(start as LayerId)) return { frames, start: start as LayerId };
  return { frames, start: signature };
}
