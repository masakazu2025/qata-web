import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generate, outputPath } from "../scripts/generate-contracts.mjs";
import { assertServerShape, readExample } from "./contract";

describe("契約から生成した型", () => {
  it("親の openapi.yaml から生成し直すと、コミットしたものと同じになる", async () => {
    const committed = readFileSync(outputPath, "utf8");
    expect(await generate()).toBe(committed);
  });
});

describe("偽の server の判定", () => {
  it("契約の例は契約に通る", () => {
    expect(() =>
      assertServerShape("testcase_record", readExample("testcase-record.json")),
    ).not.toThrow();
    expect(() => assertServerShape("run", readExample("run.json"))).not.toThrow();
  });

  it("契約に合わないものをはじく", () => {
    const run = { ...readExample<object>("run.json"), status: "ok" };
    expect(() => assertServerShape("run", run)).toThrow(/契約に合わない/);
  });
});
