/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// web は /api を qata-server に中継する（server に CORS の設定を足さずに済むように）。
const serverUrl = process.env.QATA_SERVER_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: serverUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    // e2e/ は Playwright で別に回す（npm run e2e）
    include: ["tests/**/*.test.{ts,tsx}"],
    server: { deps: { inline: [] } },
  },
});
