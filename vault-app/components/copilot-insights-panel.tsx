"use client";

import { useMemo } from "react";
import type { ParsedTrade } from "@/lib/csv";
import { computeFeatureCorrelations } from "@/lib/feature-correlations";
import { buildMarkovOccupancy, tagJulOctRegime } from "@/lib/markov-occupancy";
import type { ScorecardVerdict } from "@/lib/lab-scorecard";
import { bootstrapEvCi, computeRiskGeometry } from "@/lib/risk-geometry";

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

function letterGrade(composite: number): string {
  if (composite >= 75) return "A";
  if (composite >= 60) return "B";
  if (composite >= 45) return "C";
  if (composite >= 30) return "D";
  return "F";
}

export function CopilotVerdictChip({
  verdict,
  compositeScore,
  detail,
}: {
  verdict: ScorecardVerdict;
  compositeScore: number;
  detail?: string;
}) {
  return (
    <div className="copilot-verdict-chip">
      <span className={`copilot-letter ${verdictClass(verdict)}`}>{letterGrade(compositeScore)}</span>
      <div>
        <div className={`scorecard-verdict ${verdictClass(verdict)}`}>{verdictLabel(verdict)}</div>
        <div className="small dim">
          Composite {compositeScore}
          {detail ? ` · ${detail}` : ""}
        </div>
      </div>
    </div>
  );
}

/** Regime-sliced trade EV (not a second MC kernel) + feature correlations + Markov footnote. */
export function CopilotInsightsPanel({
  trades,
  dates,
  parsed,
}: {
  trades: number[];
  dates: string[];
  parsed?: ParsedTrade[];
}) {
  const regimeSlices = useMemo(() => {
    const julOct: number[] = [];
    const tradeMo: number[] = [];
    for (let i = 0; i < trades.length; i++) {
      const m = Number((dates[i] ?? "").slice(5, 7));
      if (m === 7 || m === 10) julOct.push(trades[i]!);
      else tradeMo.push(trades[i]!);
    }
    return [
      { id: "TRADE months", pnls: tradeMo },
      { id: "Jul+Oct", pnls: julOct },
    ].map((s) => {
      const g = computeRiskGeometry(s.pnls);
      const ci = bootstrapEvCi(s.pnls, 500);
      return { ...s, g, ci, coversZero: ci.ciLow <= 0 && ci.ciHigh >= 0 };
    });
  }, [trades, dates]);

  const corrs = useMemo(
    () => (parsed && parsed.length >= 8 ? computeFeatureCorrelations(parsed) : []),
    [parsed]
  );

  const markov = useMemo(
    () =>
      buildMarkovOccupancy({
        dates,
        tagDay: tagJulOctRegime,
        windowDays: 7,
      }),
    [dates]
  );

  return (
    <div className="panel">
      <div className="panel-title">
        Co-Pilot insights
        <span className="sub">read-only · regime EV · feature↔PnL · Markov occupancy footnote</span>
      </div>
      <div className="panel-body">
        <div className="small dim" style={{ marginBottom: 8 }}>
          Regime-sliced trade EV (filtered resample intuition — full path MC stays authority).
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {regimeSlices.map((s) => (
            <div key={s.id} className="stat">
              <div className="k">{s.id}</div>
              <div className={"v " + (s.ci.mean >= 0 ? "pos" : "neg")}>
                ${Math.round(s.ci.mean)}
              </div>
              <div className="d">
                n={s.g.n} · CI [{Math.round(s.ci.ciLow)}, {Math.round(s.ci.ciHigh)}]
                {s.coversZero ? " · 0∈CI" : ""}
              </div>
            </div>
          ))}
        </div>

        {corrs.length > 0 && (
          <>
            <div className="small accent" style={{ marginBottom: 6 }}>
              Feature ↔ outcome (Pearson r vs PnL)
            </div>
            <table className="scorecard-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="num">n</th>
                  <th className="num">r</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {corrs.map((c) => (
                  <tr key={c.feature}>
                    <td>{c.feature}</td>
                    <td className="num">{c.n}</td>
                    <td className="num">
                      {c.pearsonR == null ? (
                        <span className="dim">—</span>
                      ) : (
                        <span className={Math.abs(c.pearsonR) >= 0.25 ? "accent" : "dim"}>
                          {c.pearsonR.toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td className="small dim">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="small" style={{ marginTop: 14 }}>
          <span className="accent">Markov occupancy</span>
          <span className="dim"> · {markov.note}</span>
        </div>
        <div className="small dim" style={{ marginTop: 4 }}>
          Non-overlap {markov.windowDays}d windows · n={markov.nWindows}
          {markov.labels.map((L) => (
            <span key={L}>
              {" "}
              · π({L})={(markov.pi[L] ?? 0) * 100}%
            </span>
          ))}
        </div>
        {markov.labels.length >= 2 && (
          <p className="small dim" style={{ marginTop: 4, marginBottom: 0 }}>
            P(STAND_DOWN→TRADE)≈{markov.transitionP.STAND_DOWN?.TRADE ?? "—"} · P(TRADE→STAND_DOWN)≈
            {markov.transitionP.TRADE?.STAND_DOWN ?? "—"}. Footnote only — do not promote on stickiness.
          </p>
        )}
      </div>
    </div>
  );
}
