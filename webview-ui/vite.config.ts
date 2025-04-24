import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/

const configs = () => {
  // let count = 0;
  return defineConfig({
    plugins: [react(), tailwindcss(), visualizer({ open: false })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: resolve(__dirname, "dist"), // Ensure the output directory is correct
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // manualChunks: (id) => {
          //   if (id.includes("refractor")) {
          //     count++;
          //     return count <= 150 ? `refractor-1-vendor` : `refractor-2-vendor`;
          //   } 
          //   else if (id.includes("react-dom")) {
          //     return "react-dom-vendor";
          //   }
          //   else if (id.includes("react-syntax-highlighter")) {
          //     return "react-syntax-highlighter-vendor";
          //   }
          // },
          chunkFileNames: "[name].js",
          entryFileNames: "[name].js", // Dynamic file names to avoid conflict
          assetFileNames: "[name][extname]", // Keeps the original asset file names
        },
      },
      chunkSizeWarningLimit: 100000,
    },
  });
};

export default configs;
