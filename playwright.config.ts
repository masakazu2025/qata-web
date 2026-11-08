// 端から端までのテスト（npm run e2e）。
// 隣に並べた qata-server・qata-runner（偽の操作）と、この web を立ち上げてつなぐ（W3）。
// 開発で立ち上げたものとぶつからないように、既定とは別の番号で待ち受ける。
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";

export const workDir = path.resolve(import.meta.dirname, "..");
export const serverDir = path.join(workDir, "qata-server");
export const runnerDir = path.join(workDir, "qata-runner");
// 親のリポジトリ。環境変数 QATA_PARENT_DIR で指せる（runner・server にもそのまま渡る）。
export const parentDir = path.resolve(process.env.QATA_PARENT_DIR || path.join(workDir, "qata"));

export const ports = { runner: 18001, server: 18000, web: 15173 };
export const runnerUrl = `http://127.0.0.1:${ports.runner}`;
const serverUrl = `http://127.0.0.1:${ports.server}`;
const webUrl = `http://127.0.0.1:${ports.web}`;

// 保存先は実行ごとに新しく作る。設定は worker でも読み直されるので、最初の一回だけ作って環境変数で渡す。
process.env.QATA_E2E_DATA_DIR ??= mkdtempSync(path.join(tmpdir(), "qata-e2e-"));
export const dataDir = process.env.QATA_E2E_DATA_DIR;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: webUrl, screenshot: "on", trace: "retain-on-failure" },
  webServer: [
    {
      name: "runner",
      command: `uv run --directory "${runnerDir}" qata-runner`,
      url: `${runnerUrl}/openapi.json`,
      env: { QATA_RUNNER_PORT: String(ports.runner) },
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      name: "server",
      command: `uv run --directory "${serverDir}" qata-server`,
      url: `${serverUrl}/apps`,
      env: { QATA_PORT: String(ports.server), QATA_RUNNER_URL: runnerUrl, QATA_DATA_DIR: dataDir },
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      name: "web",
      command: `npx vite --port ${ports.web} --strictPort`,
      url: webUrl,
      env: { QATA_SERVER_URL: serverUrl },
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
});
