import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Run } from "../src/api";
import { DemoApp, createDemo } from "../src/demo";
import { contractsDir } from "./contract";

const demoDir = resolve("src/demo");
// 改行は git の設定で CRLF にも LF にもなるので、そろえて比べる。
const readText = (path: string) => readFileSync(path, "utf8").replace(/
/g, "
");

describe("デモ版に写したもの", () => {
  it("data/ のファイルは、親の契約の例とまったく同じ", () => {
    const files = readdirSync(`${demoDir}/data`);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const copied = readText(`${demoDir}/data/${file}`);
      expect(copied, file).toBe(readText(`${contractsDir}examples/${file}`));
    }
  });

  it("実行の例のスクショが、すべて PNG で揃っている", () => {
    const run = JSON.parse(readFileSync(`${demoDir}/data/run.json`, "utf8")) as Run;
    for (const { screenshot_id } of run.steps) {
      const png = readFileSync(`${demoDir}/screenshots/${screenshot_id}.png`);
      expect(png.subarray(1, 4).toString("ascii"), screenshot_id).toBe("PNG");
    }
  });
});

describe("デモ版の画面", () => {
  it("デモ版であることを出す", () => {
    render(<DemoApp demo={createDemo("http://localhost")} pollMs={0} />);
    expect(screen.getByRole("complementary", { name: "デモ版" })).toHaveTextContent(
      "再読み込みで最初に戻ります",
    );
  });

  it("登録 → 承認 → 実行 → スクショを一通り触れる", async () => {
    const user = userEvent.setup();
    render(<DemoApp demo={createDemo("http://localhost")} pollMs={20} />);
    const sidebar = screen.getByRole("navigation", { name: "テストケースの一覧" });
    await within(sidebar).findByRole("button", { name: /承認済み/ });

    await user.click(screen.getByRole("button", { name: "AI に頼んだことにして、登録する" }));
    await user.click(await within(sidebar).findByRole("button", { name: /確認待ち/ }));

    expect(screen.getByRole("button", { name: "実行する" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "承認する" }));
    await user.click(await screen.findByRole("button", { name: "実行する" }));

    const shots = await screen.findAllByRole("img");
    expect(shots).toHaveLength(5);
    shots.forEach((img) => expect(img.getAttribute("src")).toMatch(/ss_\d\.png/));
  });
});
