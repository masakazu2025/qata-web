import { useState } from "react";
import type { Api, Run } from "./api";
import { describeStep, formatTime, runLabel, runStepLabel } from "./labels";

type Props = { api: Api; run: Run };

export function RunView({ api, run }: Props) {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);
  const seconds = (Date.parse(run.finished_at) - Date.parse(run.started_at)) / 1000;

  return (
    <div className="run" aria-label={`実行 ${run.id}`}>
      <p className={`run-summary run-${run.status}`}>
        <strong>{runLabel[run.status]}</strong>
        <span>
          {formatTime(run.started_at)} に実行
          {Number.isFinite(seconds) && `（${seconds.toFixed(1)} 秒）`}
        </span>
      </p>
      {run.error && (
        <p role="alert" className="alert">
          {run.error.message}（{run.error.code}）
        </p>
      )}
      <ol className="run-steps">
        {run.steps.map((s) => {
          const alt = `ステップ ${s.index + 1} のあとのスクショ`;
          const src = s.screenshot_id ? api.screenshotUrl(s.screenshot_id) : null;
          return (
            <li key={s.index} className={`run-step run-step-${s.status}`}>
              <div className="run-step-text">
                <span className="run-step-head">
                  <span className="index">{s.index + 1}</span>
                  <span className={`badge step-${s.status}`}>{runStepLabel[s.status]}</span>
                </span>
                <span>{describeStep(s.step)}</span>
                {s.step.type === "expect_text" && s.actual !== undefined && (
                  <span className="compare-values">
                    期待：<code>{s.step.expected}</code>　実際：<code>{s.actual}</code>
                  </span>
                )}
                {s.message && <span className="note">{s.message}</span>}
              </div>
              {src ? (
                <button
                  type="button"
                  className="thumb"
                  onClick={() => setZoomed({ src, alt })}
                  aria-label={`${alt}を大きく見る`}
                >
                  <img src={src} alt={alt} loading="lazy" />
                </button>
              ) : (
                <span className="thumb none">スクショなし</span>
              )}
            </li>
          );
        })}
      </ol>
      {zoomed && (
        <div
          className="overlay"
          role="dialog"
          aria-label={zoomed.alt}
          onClick={() => setZoomed(null)}
          onKeyDown={(e) => e.key === "Escape" && setZoomed(null)}
        >
          <img src={zoomed.src} alt={zoomed.alt} />
          <button type="button" className="close" autoFocus onClick={() => setZoomed(null)}>
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
