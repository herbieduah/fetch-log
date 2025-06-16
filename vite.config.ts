import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-files",
      writeBundle() {
        // Copy manifest.json
        copyFileSync("manifest.json", "dist/manifest.json");

        // Copy icons directory
        if (!existsSync("dist/icons")) {
          mkdirSync("dist/icons", { recursive: true });
        }

        // Copy all icon files
        if (existsSync("icons/icon.svg")) {
          copyFileSync("icons/icon.svg", "dist/icons/icon.svg");
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
