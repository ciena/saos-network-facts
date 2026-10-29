// SPDX-License-Identifier: Apache-2.0
// Copies the schema from the Python package (the single source) into schema/ and generates
// src/generated/facts.ts from it. `--check` fails when either is out of date instead of writing.
import fs from "node:fs";
import path from "node:path";
import { compile } from "json-schema-to-typescript";

const here = path.dirname(new URL(import.meta.url).pathname);
const js = path.resolve(here, "..");
const source = path.resolve(js, "..", "src", "saos_network_facts", "schema", "facts-v1.schema.json");
const schemaOut = path.join(js, "schema", "facts-v1.schema.json");
const typesOut = path.join(js, "src", "generated", "facts.ts");

const schemaText = fs.readFileSync(source, "utf8");
const banner = "// SPDX-License-Identifier: Apache-2.0\n// Generated from schema/facts-v1.schema.json by scripts/generate.mjs; do not edit.\n/* eslint-disable */\n";
const types = await compile(JSON.parse(schemaText), "FactsFile", {
  bannerComment: banner,
  additionalProperties: false,
  unreachableDefinitions: true,
  style: { singleQuote: false, printWidth: 120 },
});

const check = process.argv.includes("--check");
let stale = false;
for (const [file, text] of [[schemaOut, schemaText], [typesOut, types]]) {
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
