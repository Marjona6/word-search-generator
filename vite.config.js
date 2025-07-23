import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "script-bundled.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  server: {
    port: 8000,
  },
});
