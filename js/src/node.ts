// The Node entry point: everything from the main entry, plus reading a facts file from disk.

import fs from "node:fs";
import { parseFacts } from "./index.ts";
import type { FactsFile } from "./generated/facts.ts";

export * from "./index.ts";

/** The facts file at `file` (schema 1.x, or a pre-schema bare list); see `parseFacts`. */
export function readFacts(file: string): FactsFile {
  return parseFacts(fs.readFileSync(file, "utf8"));
}
