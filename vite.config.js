import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'PixelDrift',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'pixel-drift.mjs' : 'pixel-drift.js'),
    },
  },
  server: {
    open: '/demo/',
  },
});