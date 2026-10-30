// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from 'vite';
import { labsPlugin } from './labs.config.js';

// Relative base so the static build works from any path (GitHub Pages serves it under /saos-network-facts/
// and under pr-preview/pr-N/). The viewer imports the bundled example (../examples) and the npm reader
// (../js/src), so the dev server may read the repository root. labsPlugin stages labs/index.json and
// the labs it lists (labs.config.js) beside the page, in the build and on the dev server.
export default defineConfig({
  base: './',
  plugins: [labsPlugin()],
  server: { fs: { allow: ['..'] } },
  build: { chunkSizeWarningLimit: 900 },
  test: { include: ['test/**/*.test.js'] },
});
