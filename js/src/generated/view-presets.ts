// SPDX-License-Identifier: Apache-2.0
// Generated from src/saos_network_facts/schema/view-presets-v1.json by scripts/generate.mjs; do not edit.
/* eslint-disable */
import type { PresetName, ViewFile } from "./view.ts";

/** The built-in view defaults (every property set) and the named presets. */
export const VIEW_PRESETS_DATA: { defaults: ViewFile; presets: Record<PresetName, ViewFile> } = {
  "defaults": {
    "view_version": "1.0",
    "title": null,
    "layers": [
      "physical",
      "ring",
      "igp",
      "mpls",
      "srv6",
      "bgp",
      "vrf",
      "pw",
      "evpn",
      "cfm"
    ],
    "frames": {
      "rule": "auto",
      "list": [],
      "start": "signature",
      "period_s": 4
    },
    "snapshot": {
      "variant": "exploded"
    },
    "layout": {
      "algorithm": "auto",
      "hints": {},
      "aspect": "free",
      "max_columns": 6
    },
    "plain": true,
    "camera": "fit"
  },
  "presets": {
    "card-frames": {
      "frames": {
        "rule": "auto",
        "start": "signature",
        "period_s": 4
      },
      "layout": {
        "aspect": "card",
        "max_columns": 4
      },
      "camera": "fit"
    },
    "lab-snapshot": {
      "snapshot": {
        "variant": "exploded"
      },
      "layout": {
        "aspect": "wide"
      },
      "camera": "iso"
    },
    "protocol-stack": {
      "snapshot": {
        "variant": "stacked"
      },
      "layout": {
        "aspect": "wide"
      },
      "camera": "fit"
    }
  }
};
