// 電卓のデモの流れを、端から端まで一本通す。
// AI の代わりに MCP のクライアントでテストケースを登録し、web で承認して実行し、結果とスクショを見る。
import { readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { expect, test } from "@playwright/test";
import { dataDir, runnerUrl, serverDir, workDir } from "../playwright.config";

type Structured = Record<string, unknown>;

async function connectMcp(): Promise<Client> {
  const client = new Client({ name: "qata-e2e", version: "0.1.0" });
  await client.connect(
    new StdioClientTransport({
      command: "uv",
      args: ["run", "--directory", serverDir, "qata-server-mcp"],
      // REST の server と同じ保存先を見る（qata-server の README）
      env: { ...process.env, QATA_DATA_DIR: dataDir, QATA_RUNNER_URL: runnerUrl } as Record<
        string,
        string
      >,
      stderr: "pipe",
    }),
  );
  return client;
}

async function call(client: Client, name: string, args: Structured = {}): Promise<Structured> {
  const result = await client.callTool({ name, arguments: args });
  expect(result.isError, `${name} が失敗した：${JSON.stringify(result.content)}`).toBeFalsy();
  return result.structuredContent as Structured;
}

test("MCP で登録したテストケースを、web で承認して実行し、結果とスクショを見る", async ({
  page,
}) => {
  const title = `1 + 2 の足し算（${new Date().toISOString()}）`;

  await test.step("AI が MCP で部品の辞書を読み、テストケースを登録する", async () => {
    const client = await connectMcp();
    try {
      const { apps } = await call(client, "list_apps");
      expect(apps).toEqual(
        expect.arrayContaining([expect.objectContaining({ app_id: "calculator" })]),
      );

      const dictionary = await call(client, "get_part_dictionary", { app_id: "calculator" });
      const parts = dictionary.parts as Record<string, unknown>;
      for (const name of ["1", "足す", "2", "等号", "表示"]) expect(parts).toHaveProperty(name);

      // 日本語の手順から AI が作るものとして、契約の例を使う
      const example = JSON.parse(
        readFileSync(path.join(workDir, "qata/contracts/examples/testcase.add.json"), "utf-8"),
      );
      const testcase = { ...example, title, needs_review: true };

      const validation = await call(client, "validate_testcase", { testcase });
      expect(validation).toMatchObject({ valid: true });

      const registered = await call(client, "register_testcase", { testcase });
      expect(registered).toMatchObject({
        registered: true,
        testcase_record: { review_status: "pending" },
      });
    } finally {
      await client.close();
    }
  });

  await test.step("web の一覧に出て、確認待ちなので実行できない", async () => {
    await page.goto("/");
    const item = page.getByRole("button", { name: new RegExp(escape(title)) });
    await expect(item).toBeVisible({ timeout: 10_000 }); // 一覧は 3 秒ごとに読み直す
    await item.click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("電卓で 1 + 2 = を押して")).toBeVisible();
    await expect(page.getByRole("button", { name: "実行する" })).toBeDisabled();
  });

  await test.step("承認して実行する", async () => {
    await page.getByRole("button", { name: "承認する" }).click();
    const run = page.getByRole("button", { name: "実行する" });
    await expect(run).toBeEnabled();
    await run.click();
  });

  await test.step("結果とスクショを見る", async () => {
    const result = page.getByRole("region", { name: "実行の結果" });
    await expect(result.locator(".run-summary strong")).toHaveText("成功", { timeout: 30_000 });
    await expect(result.locator(".run-step")).toHaveCount(5);
    await expect(result.locator(".run-step .badge")).toHaveText(["OK", "OK", "OK", "OK", "OK"]);
    await expect(result.getByText("期待：3　実際：3")).toBeVisible();

    const shots = result.getByRole("img", { name: /のあとのスクショ/ });
    await expect(shots).toHaveCount(5);
    for (const shot of await shots.all()) {
      await shot.scrollIntoViewIfNeeded();
      await expect
        .poll(() => shot.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
        .toBeGreaterThan(0);
    }

    await result.getByRole("button", { name: "ステップ 5 のあとのスクショを大きく見る" }).click();
    await expect(page.getByRole("dialog", { name: "ステップ 5 のあとのスクショ" })).toBeVisible();
    await page.getByRole("button", { name: "閉じる" }).click();
  });
});

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
