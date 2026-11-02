// SPDX-License-Identifier: Apache-2.0
// Generated from schema/view-v1.schema.json by scripts/generate.mjs; do not edit.
/* eslint-disable */

/**
 * A named set of properties applied over the defaults: card-frames (rotating 2D frames, one per layer, for a lab card), lab-snapshot (the exploded 3D snapshot, full screen), protocol-stack (every layer as a stacked plane, the classic 3D viewer).
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "PresetName".
 */
export type PresetName = "card-frames" | "lab-snapshot" | "protocol-stack";
/**
 * A layer: physical (devices, links, LAGs), ring (G.8032 rings), igp (IS-IS / OSPF adjacencies), mpls (SR policies, LSPs, MPLS-TP tunnels), srv6 (SRv6 locators, Flex-Algo), bgp (BGP sessions), vrf (VRFs / L3VPN), pw (VPWS pseudowires), evpn (EVPN instances), cfm (CFM MEGs and MEPs).
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "LayerId".
 */
export type LayerId = "physical" | "ring" | "igp" | "mpls" | "srv6" | "bgp" | "vrf" | "pw" | "evpn" | "cfm";
/**
 * The 3D view point: fit (front and above, far enough back for the whole stack), top (straight down), iso (isometric, from a corner).
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "Camera".
 */
export type Camera = "fit" | "top" | "iso";

/**
 * View properties: what a page or a card shows of a facts file, so a consumer never computes a layout or draws a diagram itself. Every property is optional: a view is merged, lowest first, from the built-in defaults, a preset, a view file, then URL parameters. View 1.x: minor versions only add optional properties, so a reader reports properties it does not know and ignores them.
 */
export interface ViewFile {
  /**
   * The view schema version the file follows (major.minor; this schema is 1.x).
   */
  view_version?: string;
  preset?: PresetName;
  /**
   * A title for the view; null: the consumer names it after the lab.
   */
  title?: string | null;
  /**
   * The layers that may be shown, as planes of the 3D snapshot and as 2D frames. A layer the facts have no content for is left out whatever this says. Absent or empty: every layer.
   */
  layers?: LayerId[];
  frames?: Frames;
  snapshot?: Snapshot;
  layout?: Layout;
  /**
   * Devices without facts (status skipped, such as a device of the topology with no configuration) are drawn as plain boxes with their name; false leaves them out.
   */
  plain?: boolean;
  camera?: Camera;
}
/**
 * The 2D frames a card rotates through, one per layer.
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "Frames".
 */
export interface Frames {
  /**
   * auto: one frame per shown layer the facts have content for, in the standard layer order; list: the layers of `list`, in that order (a layer without content is still skipped).
   */
  rule?: "auto" | "list";
  /**
   * The frames and their order, for rule list.
   */
  list?: LayerId[];
  /**
   * The frame shown first: signature (the layer that tells this lab apart: the first shown frame in the order pw, evpn, vrf, mpls, srv6, ring, igp, bgp, cfm, physical, so its services, else its transport, else its IGP), first (the first frame), or a layer id (when that frame is shown; else signature).
   */
  start?: ("signature" | "first") | LayerId;
  /**
   * A hint for consumers: seconds each frame stays before the next one; a consumer may slow down or pause (offscreen, reduced motion).
   */
  period_s?: number;
}
/**
 * The 3D snapshot: the shown layers as planes.
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "Snapshot".
 */
export interface Snapshot {
  /**
   * exploded: the planes spread apart so each one reads on its own, with the links between them; stacked: the planes close together, one above the other.
   */
  variant?: "exploded" | "stacked";
}
/**
 * Where devices go: one layout shared by every frame and plane.
 *
 * This interface was referenced by `ViewFile`'s JSON-Schema
 * via the `definition` "Layout".
 */
export interface Layout {
  /**
   * auto: chosen from the topology (a ring as a circle, a chain in columns, else force-directed); force: force-directed; hints: the positions of `hints`, the rest placed around them.
   */
  algorithm?: "auto" | "force" | "hints";
  /**
   * Device name to [x, y]: diagram coordinates in any unit, y down (the same as a positions file). Used by algorithm hints; with another algorithm they seed it.
   */
  hints?: {
    /**
     * @minItems 2
     * @maxItems 2
     */
    [k: string]: [number, number];
  };
  /**
   * The shape to fit: card (a small landscape card: at most `max_columns` columns, wrapping into rows so text stays readable), wide (a full screen), free (the topology's own shape).
   */
  aspect?: "card" | "wide" | "free";
  /**
   * For aspect card: the most device columns before the layout wraps.
   */
  max_columns?: number;
}
