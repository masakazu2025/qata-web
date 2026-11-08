// デモ版（vite build --mode demo）。本物の server の代わりに、ブラウザの中の偽の server を使う。
// データは親の契約の例を写したもの（data/）と、電卓のスクショ（screenshots/）。再読み込みで最初に戻る。
import { useState } from "react";
import { App } from "../App";
import { createApi, type Run, type Testcase, type TestcaseRecord } from "../api";
import addExample from "./data/testcase.add.json";
import recordExample from "./data/testcase-record.json";
import runExample from "./data/run.json";
import { createFakeServer } from "./fakeServer";

const screenshots = import.meta.glob<string>("./screenshots/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const copy = <T,>(value: unknown): T => structuredClone(value) as T;

export function createDemo(origin = window.location.origin) {
  const server = createFakeServer([copy(recordExample)], [copy(runExample)], {
    nextRun: (testcaseId, runId) => {
      const finished = new Date();
      const started = new Date(finished.getTime() - 3000);
      return {
        ...copy<Run>(runExample),
        id: runId,
        testcase_id: testcaseId,
        started_at: started.toISOString(),
        finished_at: finished.toISOString(),
      };
    },
  });
  const baseUrl = `${origin}/api`;
  const api = {
    ...createApi(baseUrl, server.fetch),
    screenshotUrl: (id: string) => screenshots[`./screenshots/${id}.png`] ?? "",
  };
  /** AI が MCP で登録する代わりに、契約の例を登録する。 */
  const register = async (): Promise<TestcaseRecord> => {
    const response = await server.fetch(
      new Request(`${baseUrl}/testcases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy<Testcase>(addExample)),
      }),
    );
    return (await response.json()) as TestcaseRecord;
  };
  return { api, register };
}

export type Demo = ReturnType<typeof createDemo>;

export function DemoApp({ demo, pollMs = 1000 }: { demo: Demo; pollMs?: number }) {
  const [registered, setRegistered] = useState(0);
  const onRegister = async () => {
    await demo.register();
    setRegistered((n) => n + 1);
  };
  return (
    <>
      <aside className="demo-banner" aria-label="デモ版">
        <p>
          <strong>デモ版</strong>
          です。server と runner
          の代わりに、ブラウザの中の偽物が動きます。スクショは本物の電卓を撮ったものです。再読み込みで最初に戻ります。
        </p>
        <p>
          本物では、AI に日本語で「電卓で 1 + 2 = を押して、表示が 3
          になることを確かめて」と頼むと、AI がテストケースを作って登録し、ここに出ます。
        </p>
        <button type="button" className="primary" onClick={() => void onRegister()}>
          AI に頼んだことにして、登録する
        </button>
        {registered > 0 && (
          <span className="muted" role="status">
            登録しました。一覧の「確認待ち」を選んで、承認してから実行してください。
          </span>
        )}
      </aside>
      <App api={demo.api} pollMs={pollMs} />
    </>
  );
}
