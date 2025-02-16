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
  build: {
    outDir: resolve(__dirname, 'dist'), // Ensure the output directory is correct
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js', // Ensures JS file is named index.js
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'index.css'; // Ensures CSS file is named index.css
          }
          return 'assets/[name][extname]'; // Keeps other assets in the assets folder
        }
      }
    }
  }
});
