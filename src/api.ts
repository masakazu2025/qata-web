// server の REST API を呼ぶ。型は契約から生成したもの（src/contracts/openapi.ts）だけを使う。
import createClient from "openapi-fetch";
import type { components, paths } from "./contracts/openapi";

type Schemas = components["schemas"];
export type TestcaseRecord = Schemas["testcase_record"];
export type Testcase = TestcaseRecord["testcase"];
export type Step = Schemas["step"];
export type Run = Schemas["run"];
export type RunStep = Schemas["run_step"];
export type ReviewStatus = Schemas["review_status"];
type ErrorResponse = Schemas["error_response"];

/** API が失敗したとき。message は画面にそのまま出す。 */
export class ApiError extends Error {}

/** web から見た server。テストでは偽の fetch を渡す。 */
export function createApi(baseUrl: string, fetchImpl?: typeof fetch) {
  const client = createClient<paths>({ baseUrl, fetch: fetchImpl });

  async function unwrap<T>(
    call: Promise<{ data?: T; error?: unknown; response: Response }>,
  ): Promise<T> {
    let result;
    try {
      result = await call;
    } catch {
      throw new ApiError("server に届きません。qata-server が立ち上がっているか確かめてください。");
    }
    if (result.error !== undefined || result.data === undefined) {
      throw new ApiError(describeError(result.error, result.response));
    }
    return result.data;
  }

  return {
    listTestcases: () => unwrap(client.GET("/testcases")),
    approveTestcase: (testcaseId: string) =>
      unwrap(
        client.POST("/testcases/{testcase_id}/approve", {
          params: { path: { testcase_id: testcaseId } },
        }),
      ),
    deleteTestcase: async (testcaseId: string) => {
      const result = await client
        .DELETE("/testcases/{testcase_id}", { params: { path: { testcase_id: testcaseId } } })
        .catch(() => undefined);
      if (!result?.response.ok) {
        throw new ApiError(
          result ? describeError(result.error, result.response) : "server に届きません。",
        );
      }
    },
    runTestcase: (testcaseId: string) =>
      unwrap(
        client.POST("/testcases/{testcase_id}/runs", {
          params: { path: { testcase_id: testcaseId } },
        }),
      ),
    listRuns: (testcaseId: string) =>
      unwrap(client.GET("/runs", { params: { query: { testcase_id: testcaseId } } })),
    screenshotUrl: (screenshotId: string) =>
      `${baseUrl}/screenshots/${encodeURIComponent(screenshotId)}`,
  };
}

export type Api = ReturnType<typeof createApi>;

function describeError(error: unknown, response: Response): string {
  const message = (error as ErrorResponse | undefined)?.error?.message;
  return message ? message : `server がエラーを返しました（HTTP ${response.status}）。`;
}
