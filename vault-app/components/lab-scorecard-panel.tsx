"use client";

import { fmtUsd } from "@/lib/store";
import type {
  LabScorecardMetrics,
  ScorecardComparison,
  ScorecardRunEntry,
  ScorecardVerdict,
} from "@/lib/lab-scorecard";
import { PRB_BENCHMARK, PRB_BENCHMARK_ID } from "@/lib/lab-scorecard";

function verdictClass(v: ScorecardVerdict): string {
  switch (v) {
    case "advance":
      return "pos";
    case "regress":
      return "neg";
    default:
      return "warn";
  }
}

function verdictLabel(v: ScorecardVerdict): string {
  switch (v) {
    case "advance":
      return "ADVANCE";
    case "regress":
      return "REGRESS";
    default:
      return "HOLD";
  }
}

export function LabScorecardPanel({
  comparison,
  history,
  savedCohorts,
}: {
  comparison: ScorecardComparison;
  history: ScorecardRunEntry[];
  savedCohorts: LabScorecardMetrics[];
}) {
  const { current, benchmark, rows, verdict, verdictDetail, compositeScore } = comparison;
  const primaryRows = rows.filter((r) => r.priority <= 7);
  const secondaryRows = rows.filter((r) => r.priority > 7);

  return (
    <div className="scorecard-panel">
      <div className="scorecard-header">
        <div>
          <div className="small">
            <span className="accent">Experiment scorecard</span>
            <span className="dim"> · vs {benchmark.label}</span>
          </div>
          <div className="scorecard-verdict-row">
            <span className={`scorecard-verdict ${verdictClass(verdict)}`}>{verdictLabel(verdict)}</span>
            <span className="scorecard-composite">Composite {compositeScore}</span>
            <span className="small subtext">{verdictDetail}</span>
          </div>
        </div>
        <div className="scorecard-current-tag small">
          <span className="cyan">{current.label}</span>
          <span className="dim"> · {current.dataset}</span>
        </div>
      </div>

      <table className="scorecard-table">
        <thead>
          <tr>
            <th>Priority KPI</th>
            <th className="num">Benchmark</th>
            <th className="num">This run</th>
            <th className="num">Δ</th>
          </tr>
        </thead>
        <tbody>
          {primaryRows.map((r) => (
            <tr key={r.key} className={r.improved === true ? "row-up" : r.improved === false ? "row-down" : ""}>
              <td>
                <span className="kpi-priority">#{r.priority}</span> {r.label}
              </td>
              <td className="num dim">{r.format(r.benchmark)}</td>
              <td className={`num ${r.improved === true ? "pos" : r.improved === false ? "neg" : ""}`}>
                {r.format(r.current)}
              </td>
              <td
                className={`num ${r.improved === true ? "pos" : r.improved === false ? "neg" : "dim"}`}
              >
                {r.delta == null
                  ? "—"
                  : `${r.delta > 0 ? "+" : ""}${
                      r.key.includes("Pct") || r.key === "bustRatePct"
                        ? `${r.delta.toFixed(1)}%`
                        : r.key.includes("Usd") || r.key === "expectedNetUntilPass"
                          ? fmtUsd(r.delta, true)
                          : r.delta
                    }`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <details className="scorecard-secondary">
        <summary className="small dim">Secondary metrics + replay detail</summary>
        <table className="scorecard-table">
          <tbody>
            {secondaryRows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td className="num dim">{r.format(r.benchmark)}</td>
                <td className="num">{r.format(r.current)}</td>
                <td className={`num ${r.improved === true ? "pos" : r.improved === false ? "neg" : "dim"}`}>
                  {r.delta == null ? "—" : `${r.delta > 0 ? "+" : ""}${r.format(r.delta)}`}
                </td>
              </tr>
            ))}
            <tr>
              <td>Trades in sample</td>
              <td className="num dim">{benchmark.trades}</td>
              <td className="num">{current.trades}</td>
              <td className="num dim">{current.trades - benchmark.trades > 0 ? "+" : ""}{current.trades - benchmark.trades}</td>
            </tr>
            <tr>
              <td>Span</td>
              <td colSpan={3} className="dim">{current.span}</td>
            </tr>
          </tbody>
        </table>
      </details>

      {history.length > 0 && (
        <div className="scorecard-history">
          <div className="small accent" style={{ marginBottom: 8 }}>
            Session history ({history.length} runs)
          </div>
          <table className="scorecard-table compact">
            <thead>
              <tr>
                <th>When</th>
                <th>Variant</th>
                <th className="num">$/wk</th>
                <th className="num">Pass%</th>
                <th className="num">Wks</th>
                <th className="num">Score</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="dim">{new Date(h.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td>{h.variant.slice(0, 36)}{h.variant.length > 36 ? "…" : ""}</td>
                  <td className="num">{fmtUsd(h.metrics.weeklyEdgeUsd)}</td>
                  <td className="num">{h.metrics.passRatePct.toFixed(1)}%</td>
                  <td className="num">{h.metrics.weeksToPassP50 ?? "—"}</td>
                  <td className="num">{h.compositeScore}</td>
                  <td className={verdictClass(h.verdict)}>{verdictLabel(h.verdict)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {savedCohorts.length > 0 && (
        <div className="scorecard-history">
          <div className="small accent" style={{ marginBottom: 8 }}>
            Saved cohorts (GitHub / local)
          </div>
          <table className="scorecard-table compact">
            <thead>
              <tr>
                <th>Variant</th>
                <th className="num">$/wk</th>
                <th className="num">Pass%</th>
                <th className="num">Net</th>
                <th className="num">Trades</th>
              </tr>
            </thead>
            <tbody>
              {savedCohorts.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td>{c.label.slice(0, 40)}{c.label.length > 40 ? "…" : ""}</td>
                  <td className="num">{fmtUsd(c.weeklyEdgeUsd)}</td>
                  <td className="num">{c.passRatePct.toFixed(1)}%</td>
                  <td className="num">{fmtUsd(c.netPnlUsd)}</td>
                  <td className="num">{c.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="small dim scorecard-foot">
        Promotion rule: beat benchmark on <span className="accent">weekly edge</span> and{" "}
        <span className="accent">weeks-to-pass</span> with pass rate within 5pts. Net PnL is tiebreaker only.
        Park PRB as reference — ship what clears ADVANCE on the same replay windows.
      </p>
    </div>
  );
}

export { PRB_BENCHMARK, PRB_BENCHMARK_ID };
