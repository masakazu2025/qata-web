import { useEffect, useState } from "react";
import type { Api, Run, TestcaseRecord } from "./api";
import { RunView } from "./RunView";
import { describeStep, formatTime, reviewLabel, runLabel } from "./labels";

type Props = {
  api: Api;
  record: TestcaseRecord;
  onChanged: (record: TestcaseRecord) => void;
  onDeleted: (id: string) => void;
};

export function TestcaseDetail({ api, record, onChanged, onDeleted }: Props) {
  const { testcase } = record;
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"approve" | "run" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .listRuns(record.id)
      .then((list) => {
        if (!alive) return;
        setRuns(list);
        setSelectedRunId(list[0]?.id ?? null);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [api, record.id]);

  const pending = record.review_status === "pending";

  async function act(kind: "approve" | "run" | "delete") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "approve") {
        onChanged(await api.approveTestcase(record.id));
      } else if (kind === "run") {
        const run = await api.runTestcase(record.id);
        setRuns((list) => [run, ...(list ?? [])]);
        setSelectedRunId(run.id);
      } else {
        await api.deleteTestcase(record.id);
        onDeleted(record.id);
        return;
      }
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  const selectedRun = runs?.find((r) => r.id === selectedRunId) ?? null;

  return (
    <article className="detail">
      <div className="detail-head">
        <div>
          <h2>{testcase.title}</h2>
          <p className="testcase-meta">
            <span className={`badge review-${record.review_status}`}>
              {reviewLabel[record.review_status]}
            </span>
            <span>アプリ：{testcase.app_id}</span>
            <span>登録：{formatTime(record.created_at)}</span>
          </p>
        </div>
        <button
          type="button"
          className="ghost danger"
          disabled={busy !== null}
          onClick={() => {
            if (window.confirm(`「${testcase.title}」を消しますか？（実行の結果は残ります）`)) {
              void act("delete");
            }
          }}
        >
          消す
        </button>
      </div>

      <section className="compare" aria-label="手順とステップの見比べ">
        <div className="panel">
          <h3>元の手順（日本語）</h3>
          <p className="instruction">{testcase.instruction}</p>
          <label className="check">
            <input type="checkbox" checked={testcase.needs_review} readOnly disabled />
            実行の前に人が確認する
          </label>
        </div>
        <div className="panel">
          <h3>生成されたステップ</h3>
          <ol className="steps">
            {testcase.steps.map((step, i) => (
              <li key={i} className={step.type === "expect_text" ? "step expect" : "step"}>
                <span>{describeStep(step)}</span>
                {step.note && <span className="note">{step.note}</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="actions" aria-label="操作">
        {pending && (
          <>
            <p className="muted">
              人の確認待ちです。ステップを見比べて、よければ承認してください。
            </p>
            <button
              type="button"
              className="primary"
              disabled={busy !== null}
              onClick={() => void act("approve")}
            >
              {busy === "approve" ? "承認中…" : "承認する"}
            </button>
          </>
        )}
        <button
          type="button"
          className={pending ? "" : "primary"}
          disabled={pending || busy !== null}
          title={pending ? "承認するまで実行できません" : undefined}
          onClick={() => void act("run")}
        >
          {busy === "run" ? "実行中…" : "実行する"}
        </button>
      </section>

      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}

      <section className="runs" aria-label="実行の結果">
        <h3>実行の結果</h3>
        {runs === null && !error && <p className="muted">読み込み中…</p>}
        {runs?.length === 0 && <p className="muted">まだ実行していません。</p>}
        {runs && runs.length > 0 && (
          <ul className="run-tabs">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  aria-current={run.id === selectedRunId ? "true" : undefined}
                  className={run.id === selectedRunId ? "run-tab selected" : "run-tab"}
                  onClick={() => setSelectedRunId(run.id)}
                >
                  <span className={`badge run-${run.status}`}>{runLabel[run.status]}</span>
                  {formatTime(run.started_at)}
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedRun && <RunView api={api} run={selectedRun} />}
      </section>
    </article>
  );
}
