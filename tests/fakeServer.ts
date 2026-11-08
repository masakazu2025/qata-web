// テストの偽の server。返すものはすべて親の契約で判定する（偽物が契約からずれないように）。
import type { Run, TestcaseRecord } from "../src/api";
import { createFakeServer as create, type FakeServer } from "../src/demo/fakeServer";
import { assertServerShape, readExample } from "./contract";

export type { FakeServer };

export const exampleRecord = (): TestcaseRecord => readExample("testcase-record.json");
export const exampleRun = (): Run => readExample("run.json");

export function createFakeServer(testcases: TestcaseRecord[], runs: Run[] = []): FakeServer {
  return create(testcases, runs, {
    check: assertServerShape,
    nextRun: (testcaseId, runId) => ({ ...exampleRun(), id: runId, testcase_id: testcaseId }),
  });
}
