// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from 'vite';

// Relative base so the static build works from any path (GitHub Pages serves it under /saos-network-facts/).
// The viewer imports the bundled example (../examples) and the npm reader (../js/src), so the dev
// server may read the repository root.
export default defineConfig({
  base: './',
  server: { fs: { allow: ['..'] } },
  build: { chunkSizeWarningLimit: 900 },
  test: { include: ['test/**/*.test.js'] },
});
