// テストの偽の server。openapi.yaml の道と応答を、契約に合う形で返す。
// 返すものはすべて契約で判定する（偽物が契約からずれないように）。
import type { Run, TestcaseRecord } from "../src/api";
import { assertServerShape, readExample } from "./contract";

export type FakeServer = {
  fetch: typeof fetch;
  testcases: TestcaseRecord[];
  runs: Run[];
  /** 次の実行の結果を決める。null なら runner に届かない（502）。 */
  nextRun: (testcaseId: string, runId: string) => Run | null;
  calls: string[];
};

export const exampleRecord = (): TestcaseRecord => readExample("testcase-record.json");
export const exampleRun = (): Run => readExample("run.json");

export function createFakeServer(testcases: TestcaseRecord[], runs: Run[] = []): FakeServer {
  let seq = 0;
  const server: FakeServer = {
    testcases,
    runs,
    calls: [],
    nextRun: (testcaseId, runId) => ({ ...exampleRun(), id: runId, testcase_id: testcaseId }),
    fetch: async (input) => {
      const request = input as Request;
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/api/, "");
      server.calls.push(`${request.method} ${path}${url.search}`);
      return handle(request.method, path, url.searchParams);
    },
  };

  function json(status: number, body: unknown, def?: string): Response {
    if (def) assertServerShape(def, body);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
  const errorBody = (code: string, message: string) => ({ error: { code, message } });
  const notFound = () => json(404, errorBody("not_found", "見つかりません"), "error_response");

  function handle(method: string, path: string, query: URLSearchParams): Response {
    if (method === "GET" && path === "/testcases") {
      server.testcases.forEach((t) => assertServerShape("testcase_record", t));
      return json(200, server.testcases);
    }
    if (method === "GET" && path === "/runs") {
      const list = server.runs.filter((r) => r.testcase_id === query.get("testcase_id"));
      list.forEach((r) => assertServerShape("run", r));
      return json(200, list);
    }
    const m = path.match(/^\/testcases\/([^/]+)(\/approve|\/runs)?$/);
    if (!m) return notFound();
    const id = decodeURIComponent(m[1]);
    const index = server.testcases.findIndex((t) => t.id === id);
    if (index < 0) return notFound();
    const record = server.testcases[index];

    if (method === "DELETE" && !m[2]) {
      server.testcases.splice(index, 1);
      return new Response(null, { status: 204 });
    }
    if (method === "POST" && m[2] === "/approve") {
      if (record.review_status === "not_required") {
        return json(409, errorBody("review_not_required", "確認は要りません"), "error_response");
      }
      const approved: TestcaseRecord = { ...record, review_status: "approved" };
      server.testcases[index] = approved;
      return json(200, approved, "testcase_record");
    }
    if (method === "POST" && m[2] === "/runs") {
      if (record.review_status === "pending") {
        return json(409, errorBody("review_pending", "人の確認待ちです"), "error_response");
      }
      const run = server.nextRun(id, `run_new_${++seq}`);
      if (!run) {
        return json(502, errorBody("runner_unavailable", "runner に届きません"), "error_response");
      }
      server.runs.unshift(run);
      return json(201, run, "run");
    }
    return notFound();
  }

  return server;
}
