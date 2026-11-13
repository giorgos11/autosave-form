import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), msw()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
});
