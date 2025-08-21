import { defineConfig } from 'vite';
import { resolve } from 'path';

const BASE_PATH = process.env.BASE_PATH || '/';

export default defineConfig({
  root: 'src',
  base: BASE_PATH,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
