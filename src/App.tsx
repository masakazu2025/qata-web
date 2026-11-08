import { useCallback, useEffect, useState } from "react";
import type { Api, TestcaseRecord } from "./api";
import { TestcaseDetail } from "./TestcaseDetail";
import { formatTime, reviewLabel } from "./labels";

type Props = {
  api: Api;
  /** 一覧を読み直す間隔（ミリ秒）。AI が MCP で登録したものが、開いたままの画面に出るように。0 なら読み直さない。 */
  pollMs?: number;
};

export function App({ api, pollMs = 0 }: Props) {
  const [testcases, setTestcases] = useState<TestcaseRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const list = await api.listTestcases();
      setTestcases(list);
      setLoadError(null);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    void reload();
    if (pollMs <= 0) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void reload();
    }, pollMs);
    return () => clearInterval(timer);
  }, [reload, pollMs]);

  const selected = testcases?.find((t) => t.id === selectedId) ?? null;

  const onChanged = (record: TestcaseRecord) =>
    setTestcases((list) => list?.map((t) => (t.id === record.id ? record : t)) ?? list);

  const onDeleted = (id: string) => {
    setTestcases((list) => list?.filter((t) => t.id !== id) ?? list);
    setSelectedId(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>qata</h1>
        <p>日本語の手順から作ったテストケースを確かめて、実行する</p>
      </header>
      <div className="layout">
        <nav className="sidebar" aria-label="テストケースの一覧">
          <div className="sidebar-head">
            <h2>テストケース</h2>
            <button type="button" className="ghost" onClick={() => void reload()}>
              読み直す
            </button>
          </div>
          {loadError && (
            <p role="alert" className="alert">
              {loadError}
            </p>
          )}
          {testcases === null && !loadError && <p className="muted">読み込み中…</p>}
          {testcases?.length === 0 && (
            <p className="muted">
              まだありません。AI に日本語で頼むと、MCP で登録されてここに出ます。
            </p>
          )}
          <ul className="testcase-list">
            {testcases?.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={t.id === selectedId ? "testcase-item selected" : "testcase-item"}
                  aria-current={t.id === selectedId ? "true" : undefined}
                  onClick={() => setSelectedId(t.id)}
                >
                  <span className="testcase-title">{t.testcase.title}</span>
                  <span className="testcase-meta">
                    <span className={`badge review-${t.review_status}`}>
                      {reviewLabel[t.review_status]}
                    </span>
                    <span>{t.testcase.app_id}</span>
                    <span>{formatTime(t.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="main">
          {selected ? (
            <TestcaseDetail
              key={selected.id}
              api={api}
              record={selected}
              onChanged={onChanged}
              onDeleted={onDeleted}
            />
          ) : (
            <p className="muted empty">左の一覧からテストケースを選んでください。</p>
          )}
        </main>
      </div>
    </div>
  );
}
