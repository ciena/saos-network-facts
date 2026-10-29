# AGENTS.md

Guidance for coding agents working in this repository.

## What this is

A public library: per-device facts from SAOS 6/8/10 configurations, written to a versioned JSON
facts file. Python extractor + CLI in `src/saos_network_facts/`, npm reader in `js/`.

| Path | |
|---|---|
| `src/saos_network_facts/saos6.py` | SAOS 6/8 flat CLI parser (one command per line) |
| `src/saos_network_facts/saos10.py` | walker over the SAOS 10 translator's pivot JSON |
| `src/saos_network_facts/translator.py` | MCP-over-HTTP client for `convert_cli` / `convert_xml`, local-checkout backend; `DEFAULT_TRANSLATOR_URL` |
| `src/saos_network_facts/extract.py` | inputs (configs, clab, platform map) -> devices -> records, file merging, status |
| `src/saos_network_facts/schema/facts-v1.schema.json` | **the** schema (single source) |
| `js/` | npm package: schema copy, generated types (`src/generated/facts.ts`), reader (`src/index.ts`, `src/node.ts`) |
| `tests/fixtures/` | synthetic labs, recorded translator replies, expected facts files |

## Rules

- **Public repo.** Never commit lab, customer or internal configurations, hostnames, IP addresses,
  credentials, tokens, internal URLs or repository paths, or anything derived from them (including
  extractor output). Fixtures are synthetic (documentation address ranges) or from the public
  ciena/saos-labs. `tests/test_extract.py::test_fixtures_are_synthetic` guards addresses and secrets.
- Licence: Apache-2.0, Copyright 2026 Ciena Corporation (`NOTICE`). New source files start with an
  `SPDX-License-Identifier: Apache-2.0` comment (after any shebang); a test checks it.
- No translator code here: SAOS 10 parsing goes through the translator's MCP tools only.
- Tests must not use the network. A changed SAOS 10 fixture needs `scripts/record_pivots.py`
  (run by someone with a translator), then `UPDATE_GOLDEN=1 pytest -q`; review the golden diff.
- Every fact the extractor emits must be declared and described in the schema
  (`test_every_emitted_field_is_documented`). After a schema edit run `npm run generate` in `js/`.
- Schema compatibility: adding an optional field is a minor schema version; anything else is major.
- Dependencies stay minimal: PyYAML and jsonschema for Python, none at runtime for npm.
- Match the surrounding style: small functions, docstrings that say what a config construct means.

## Checks

```bash
.venv/bin/ruff check . && .venv/bin/pytest -q
cd js && npm run check-generated && npm run typecheck && npm test && npm run build
```

## Releases

Semver, one version for Python, npm and the changelog (`pyproject.toml`, `js/package.json`,
`src/saos_network_facts/__init__.py`). Every PR adds a `CHANGELOG.md` entry and cuts a release
section; squash merge only; `release.yml` tags and publishes the GitHub Release on merge.
