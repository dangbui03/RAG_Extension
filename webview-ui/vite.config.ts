import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'), // Ensure the output directory is correct
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js', // Dynamic file names to avoid conflict
        assetFileNames: '[name][extname]', // Keeps the original asset file names
      }
    }
  }
});
