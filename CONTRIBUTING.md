# Contributing to saos-network-facts

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`, `chore/...`). Keep it short-lived.
2. Open a pull request. CI (`ci`) and the `changelog` check must pass.
3. **Squash merge** only; the branch is deleted on merge. History stays linear.
4. No direct pushes to `main`: it is protected by a repository ruleset (`rulesets/main.json`).

## Checks

```bash
python -m venv .venv && .venv/bin/pip install -e '.[dev]'
.venv/bin/ruff check . && .venv/bin/pytest -q
cd js && npm ci && npm run check-generated && npm run typecheck && npm test && npm run build
cd ../viewer && npm ci && npm test && npm run build     # the example site
```

Tests never touch the network: SAOS 10 translator replies for the fixtures are recorded in
`tests/fixtures/pivots.json`. After changing a SAOS 10 fixture, re-record them with a translator
(`scripts/record_pivots.py --translator-url URL` or `--translator-root DIR`), then
`UPDATE_GOLDEN=1 pytest -q` and review the diff of `tests/fixtures/expected/`.

## Changing the schema

The schema lives in `src/saos_network_facts/schema/facts-v1.schema.json`. After editing it run
`npm run generate` in `js/` (copies it to `js/schema/` and regenerates `js/src/generated/facts.ts`).
A new optional field is a minor schema version; removing or changing a field is a major one (a new
`facts-v2.schema.json`). Bump `SCHEMA_VERSION` in `src/saos_network_facts/__init__.py` with it.

## Licence headers

The project is Apache-2.0 (`LICENSE`, `NOTICE`). Every source file (`.py`, `.ts`, `.mjs`, `.sh`, `.js`, `.css`, `.html`)
starts with `SPDX-License-Identifier: Apache-2.0` as a comment (after the shebang line, if any);
`tests/test_repo.py` checks it.

## Fixtures

Fixtures are synthetic (written for this repo, documentation address space only: 192.0.2.0/24,
198.51.100.0/24, 203.0.113.0/24) or come from the public
[ciena/saos-labs](https://github.com/ciena/saos-labs). Never commit configurations from a real lab
or customer, or anything derived from them.

Every address in the repository (any tracked file, not only fixtures) must be private or for
documentation: RFC 1918 (10/8, 172.16/12, 192.168/16), RFC 5737 (192.0.2/24, 198.51.100/24,
203.0.113/24), 0.0.0.0/8 ("this network", where OSPF area ids are written), and for IPv6
2001:db8::/32, :: and ::1. `scripts/check_addresses.py` checks it in CI; run it before you push. Renumber a lab's other addresses into those ranges.

## Previewing the site

The example site (the viewer with the bundled example) is deployed from `main` to the root of the
`gh-pages` branch by `.github/workflows/pages.yml`; GitHub Pages serves that branch (the one-time
repository setting is *Settings > Pages > Build and deployment > Source: Deploy from a branch*,
branch `gh-pages`, folder `/ (root)`).

Every pull request from a branch of this repository gets a live preview of the site it builds, at
`https://ciena.github.io/saos-network-facts/pr-preview/pr-<N>/`: `.github/workflows/pr-preview.yml`
deploys the build to `pr-preview/pr-<N>/` on `gh-pages` and keeps a comment on the PR with the link,
updated on every push and removed (with the preview) when the PR closes or merges. A `main` deploy
leaves the previews in place, and a weekly job prunes the previews of PRs that are no longer open.

A pull request from a fork has no live preview: its workflow token is read-only, so it can neither
push `gh-pages` nor comment, and no fork code is ever run with a write token (there is no
`pull_request_target`). Every PR, fork or not, still has the built site as the `site-preview`
artifact of its `pr-preview` run: download it from the run's summary page and serve the folder,
`python3 -m http.server -d site-preview`, then open `http://localhost:8000/`.

## Changelog and versioning

Every PR updates `CHANGELOG.md` (or carries the `skip-changelog` label) and cuts a release: rename
`## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD`, start a fresh empty `## [Unreleased]`, and bump the
version in `pyproject.toml`, `js/package.json` and `src/saos_network_facts/__init__.py` (a test
checks they agree). `python3 scripts/changelog.py check` explains any gap. On merge,
`.github/workflows/release.yml` tags `main` `vX.Y.Z` and creates the GitHub Release with the wheel,
sdist and npm tarball attached.
