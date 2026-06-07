import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion') || id.includes('zustand')) {
              return 'vendor-react';
            }
            if (id.includes('@monaco-editor') || id.includes('prismjs')) {
              return 'vendor-editor';
            }
            if (id.includes('lucide-react') || id.includes('dagre')) {
              return 'vendor-utils';
            }
            if (id.includes('gifshot')) {
              return 'vendor-export';
            }
            return 'vendor-core';
          }
        }
      }
    }
  }
})
