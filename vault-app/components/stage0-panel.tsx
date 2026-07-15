"use client";

import { useCallback, useState } from "react";

type Stage0Report = {
  title?: string;
  scorecard?: {
    verdict?: string;
    blockStrategy?: boolean;
    reason?: string;
  };
  windows?: {
    full?: { geometry?: { n?: number }; evCi?: { mean?: number; ciLow?: number; ciHigh?: number }; coversZero?: boolean };
    oos?: { geometry?: { n?: number }; evCi?: { mean?: number; ciLow?: number; ciHigh?: number }; coversZero?: boolean };
    is?: { geometry?: { n?: number }; evCi?: { mean?: number; ciLow?: number; ciHigh?: number }; coversZero?: boolean };
  };
  note?: string;
};

export function Stage0Panel() {
  const [report, setReport] = useState<Stage0Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Stage0Report;
        setReport(parsed);
      } catch {
        setError("Could not parse JSON — expect analyze-event-study.ts output.");
        setReport(null);
      }
    };
    reader.readAsText(file);
  }, []);

  const block = report?.scorecard?.blockStrategy === true;
  const verdict = report?.scorecard?.verdict ?? "—";

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="panel-title">
        Stage-0 / Event study
        <span className="sub">load JSON from analyze-event-study.ts · gates research Pine</span>
      </div>
      <div className="panel-body">
        <input
          type="file"
          accept="application/json,.json"
          className="small"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        {error && <p className="small warn">{error}</p>}
        {!report && !error && (
          <p className="small dim" style={{ marginBottom: 0 }}>
            Run <code>npx tsx scripts/analyze-event-study.ts</code> then upload the JSON.
            Events ≠ signals. Prop Lab MC still required for promote.
          </p>
        )}
        {report && (
          <div style={{ marginTop: 10 }}>
            <div className="small">
              <span className="accent">{report.title ?? "Event study"}</span>
              <span className="dim"> · SCORECARD </span>
              <span className={verdict === "toward" ? "pos" : "warn"}>{verdict}</span>
              <span
                className={block ? "neg" : "pos"}
                style={{ marginLeft: 10, fontWeight: 600 }}
                title={report.scorecard?.reason}
              >
                {block ? "BLOCK_STRATEGY" : "STAGE0_OK"}
              </span>
            </div>
            {report.scorecard?.reason && (
              <p className="small dim" style={{ marginTop: 4 }}>
                {report.scorecard.reason}
              </p>
            )}
            <div
              className="small"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "4px 12px",
                marginTop: 8,
              }}
            >
              {(["is", "oos", "full"] as const).map((key) => {
                const w = report.windows?.[key];
                if (!w?.evCi) return null;
                return (
                  <span key={key}>
                    {key.toUpperCase()} n={w.geometry?.n ?? "—"} EV $
                    {w.evCi.mean}{" "}
                    <span className="dim">
                      [{w.evCi.ciLow}, {w.evCi.ciHigh}]
                    </span>
                    {w.coversZero ? <span className="warn"> · 0∈CI</span> : null}
                  </span>
                );
              })}
            </div>
            {report.note && (
              <p className="small dim" style={{ marginTop: 6, marginBottom: 0 }}>
                {report.note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
