// SPDX-License-Identifier: Apache-2.0
// The labs the site stages beside the page as labs/index.json (see src/labs.js): the example,
// which stays the default lab, and the fixture labs worth looking at live. Each facts file is
// the repository's own copy (the example's facts.json, a fixture's expected facts), copied as
// is into labs/<id>/facts.json by the vite plugin below, so the site and the files it serves
// come from the same commit. The dev server serves the same paths.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const LABS = [
  {
    id: 'adaptive-sr-cfm',
    title: 'Adaptive-SR-CFM (example)',
    source: '../examples/adaptive-sr-cfm/facts.json',
    default: true,
  },
  {
    id: 'g8032-two-ring',
    title: 'G.8032 two-ring lab (fixture, links from --clab)',
    source: '../tests/fixtures/expected/g8032-two-ring.facts.json',
  },
  {
    id: 'g8032-by-name',
    title: 'G.8032 ring without ring ids (fixture, joined by name)',
    source: '../tests/fixtures/expected/g8032-by-name.facts.json',
  },
  {
    id: 'srv6-evpn',
    title: 'SRv6, Flex-Algo and EVPN over an IPv6 core (fixture)',
    source: '../tests/fixtures/expected/srv6-evpn.facts.json',
  },
];

// The files to stage: labs/index.json and one facts.json per lab, as { path: text }.
export function labFiles(labs = LABS, base = import.meta.url) {
  const files = {};
  const index = { labs: labs.map(({ id, title, default: dflt }) => ({ id, title, facts: `${id}/facts.json`, ...(dflt ? { default: true } : {}) })) };
  files['labs/index.json'] = `${JSON.stringify(index, null, 2)}\n`;
  for (const lab of labs) files[`labs/${lab.id}/facts.json`] = readFileSync(fileURLToPath(new URL(lab.source, base)), 'utf8');
  return files;
}

// Vite plugin: emits the lab files into the build and serves them from the dev server.
export function labsPlugin() {
  return {
    name: 'saos-network-facts-labs',
    generateBundle() {
      for (const [fileName, source] of Object.entries(labFiles())) this.emitFile({ type: 'asset', fileName, source });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0].replace(/^\//, '');
        const files = path.startsWith('labs/') ? labFiles() : {};
        if (!(path in files)) return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(files[path]);
      });
    },
  };
}
