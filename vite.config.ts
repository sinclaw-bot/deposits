import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/deposits/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@gravity-ui')) return 'vendor-gravity';
            return 'vendor';
          }
          if (id.includes('/src/')) return 'app';
        },
      },
    },
  },
});
