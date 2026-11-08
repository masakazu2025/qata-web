// 偽の server。openapi.yaml の道と応答を、メモリの中だけで返す。
// テスト（tests/fakeServer.ts）とデモ版（src/demo/index.ts）で使う。
// テストは check に親の契約の判定を渡し、返すものがすべて契約に合うことを確かめる。
import type { Run, Testcase, TestcaseRecord } from "../api";

export type FakeServer = {
  fetch: typeof fetch;
  testcases: TestcaseRecord[];
  runs: Run[];
  /** 次の実行の結果を決める。null なら runner に届かない（502）。 */
  nextRun: (testcaseId: string, runId: string) => Run | null;
  calls: string[];
};

export type FakeServerOptions = {
  nextRun: FakeServer["nextRun"];
  /** 返すものを、server.schema.json の $defs の名前で判定する。合わなければ投げる。 */
  check?: (def: string, value: unknown) => void;
  now?: () => string;
};

export function createFakeServer(
  testcases: TestcaseRecord[],
  runs: Run[],
  options: FakeServerOptions,
): FakeServer {
  const check = options.check ?? (() => {});
  const now = options.now ?? (() => new Date().toISOString());
  let seq = 0;
  const server: FakeServer = {
    testcases,
    runs,
    calls: [],
    nextRun: options.nextRun,
    fetch: async (input) => {
      const request = input as Request;
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/api/, "");
      server.calls.push(`${request.method} ${path}${url.search}`);
      return handle(request, path, url.searchParams);
    },
  };

  function json(status: number, body: unknown, def?: string): Response {
    if (def) check(def, body);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
  const errorBody = (code: string, message: string) => ({ error: { code, message } });
  const notFound = () => json(404, errorBody("not_found", "見つかりません"), "error_response");

  async function handle(request: Request, path: string, query: URLSearchParams) {
    const method = request.method;
    if (method === "GET" && path === "/testcases") {
      server.testcases.forEach((t) => check("testcase_record", t));
      return json(200, server.testcases);
    }
    if (method === "POST" && path === "/testcases") {
      // 本物の server の関門（形式と部品の辞書）は持たない。受け取ったものをそのまま登録する。
      const testcase = (await request.json()) as Testcase;
      const at = now();
      const record: TestcaseRecord = {
        id: `tc_new_${++seq}`,
        testcase,
        review_status: testcase.needs_review ? "pending" : "not_required",
        created_at: at,
        updated_at: at,
      };
      server.testcases.unshift(record);
      return json(201, record, "testcase_record");
    }
    if (method === "GET" && path === "/runs") {
      const list = server.runs.filter((r) => r.testcase_id === query.get("testcase_id"));
      list.forEach((r) => check("run", r));
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
      const approved: TestcaseRecord = { ...record, review_status: "approved", updated_at: now() };
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
