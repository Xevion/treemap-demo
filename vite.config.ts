import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const BASE_PATH = process.env.BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          deck: [
            '@deck.gl/core',
            '@deck.gl/layers',
            '@deck.gl/react',
            '@luma.gl/core',
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
