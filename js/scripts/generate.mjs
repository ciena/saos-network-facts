// SPDX-License-Identifier: Apache-2.0
// Copies the schemas from the Python package (the single source) into schema/ and generates from
// them: src/generated/facts.ts (facts file types), src/generated/view.ts (view file types) and
// src/generated/view-presets.ts (the view defaults and presets). `--check` fails when any of them
// is out of date instead of writing.
import fs from "node:fs";
import path from "node:path";
import { compile } from "json-schema-to-typescript";

const here = path.dirname(new URL(import.meta.url).pathname);
const js = path.resolve(here, "..");
const sourceDir = path.resolve(js, "..", "src", "saos_network_facts", "schema");
const read = (name) => fs.readFileSync(path.join(sourceDir, name), "utf8");
const banner = (from) => `// SPDX-License-Identifier: Apache-2.0\n// Generated from ${from} by scripts/generate.mjs; do not edit.\n/* eslint-disable */\n`;
const options = (from) => ({
  bannerComment: banner(from),
  additionalProperties: false,
  unreachableDefinitions: true,
  style: { singleQuote: false, printWidth: 120 },
});

const factsSchema = read("facts-v1.schema.json");
const viewSchema = read("view-v1.schema.json");
const presets = read("view-presets-v1.json");
const presetsTs =
  banner("src/saos_network_facts/schema/view-presets-v1.json") +
  'import type { PresetName, ViewFile } from "./view.ts";\n\n' +
  "/** The built-in view defaults (every property set) and the named presets. */\n" +
  `export const VIEW_PRESETS_DATA: { defaults: ViewFile; presets: Record<PresetName, ViewFile> } = ${JSON.stringify(JSON.parse(presets), null, 2)};\n`;

const outputs = [
  [path.join(js, "schema", "facts-v1.schema.json"), factsSchema],
  [path.join(js, "schema", "view-v1.schema.json"), viewSchema],
  [path.join(js, "src", "generated", "facts.ts"), await compile(JSON.parse(factsSchema), "FactsFile", options("schema/facts-v1.schema.json"))],
  [path.join(js, "src", "generated", "view.ts"), await compile(JSON.parse(viewSchema), "ViewFile", options("schema/view-v1.schema.json"))],
  [path.join(js, "src", "generated", "view-presets.ts"), presetsTs],
];

const check = process.argv.includes("--check");
let stale = false;
for (const [file, text] of outputs) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (current === text) continue;
  if (check) {
    console.error(`${path.relative(js, file)} is out of date: run npm run generate`);
    stale = true;
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    console.log(`wrote ${path.relative(js, file)}`);
  }
}
process.exit(stale ? 1 : 0);
