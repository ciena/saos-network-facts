// SPDX-License-Identifier: Apache-2.0
// The static renders (src/render) as Node ES modules in dist-render/render/: the CLI
// saos-network-facts-render.mjs and render.js (frames, snapshot), with the importer, engine and npm
// reader bundled in and no three.js, so a CI job runs them from the viewer release asset alone.
// Kept out of dist/ (the Pages site): scripts/package-release.sh adds render/ to the viewer tgz.
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    outDir: 'dist-render/render',
    emptyOutDir: true,
    target: 'node22',
    minify: false,
    rollupOptions: {
      input: { 'saos-network-facts-render': 'bin/saos-network-facts-render.mjs', render: 'src/render/index.js' },
      output: { format: 'es', entryFileNames: (c) => (c.name === 'render' ? 'render.js' : '[name].mjs'), chunkFileNames: 'chunks/[name].js' },
    },
  },
  ssr: { noExternal: true },
});
