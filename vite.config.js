import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'framer';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase';
          }
          if (id.includes('node_modules/three/')) {
            return 'three';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
        }
      }
    }
  }
});
