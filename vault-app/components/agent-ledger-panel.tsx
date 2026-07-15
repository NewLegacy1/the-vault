"use client";

import { useMemo } from "react";
import type { ParsedTrade } from "@/lib/csv";
import type { ScorecardVerdict } from "@/lib/lab-scorecard";

function monthTag(d: string): string {
  return d.slice(0, 7) || "—";
}

function rMultiple(pnl: number, riskGuess = 340): string {
  if (!riskGuess) return "—";
  return `${(pnl / riskGuess).toFixed(2)}R`;
}

function verdictClass(v: ScorecardVerdict | null | undefined): string {
  switch (v) {
    case "advance":
      return "pos";
    case "regress":
      return "neg";
    case "hold":
      return "warn";
    default:
      return "dim";
  }
}

/** Thin Hermes-style scored ledger — read-only from active parse. */
export function AgentLedgerPanel({
  parsed,
  scorecardVerdict,
  maxRows = 40,
}: {
  parsed: ParsedTrade[];
  scorecardVerdict?: ScorecardVerdict | null;
  maxRows?: number;
}) {
  const rows = useMemo(() => {
    return [...parsed]
      .sort((a, b) => b.date.localeCompare(a.date) || b.num - a.num)
      .slice(0, maxRows);
  }, [parsed, maxRows]);

  if (parsed.length === 0) return null;

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="panel-title">
        Agent ledger
        <span className="sub">
          scored strip · {parsed.length} fills · SCORECARD{" "}
          <span className={verdictClass(scorecardVerdict)}>
            {(scorecardVerdict ?? "—").toUpperCase()}
          </span>
        </span>
      </div>
      <div className="panel-body" style={{ overflowX: "auto" }}>
        <table className="scorecard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Month</th>
              <th>Side</th>
              <th className="num">PnL</th>
              <th className="num">~R</th>
              <th className="num">MFE</th>
              <th className="num">MAE</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={`${t.num}-${t.date}-${t.pnl}`}>
                <td className="dim">{t.num}</td>
                <td>{t.date}</td>
                <td className="dim">{monthTag(t.date)}</td>
                <td>{t.direction ?? "—"}</td>
                <td className={"num " + (t.pnl >= 0 ? "pos" : "neg")}>
                  {Math.round(t.pnl)}
                </td>
                <td className="num dim">{rMultiple(t.pnl)}</td>
                <td className="num dim">{t.mfeUsd != null ? Math.round(t.mfeUsd) : "—"}</td>
                <td className="num dim">{t.maeUsd != null ? Math.round(t.maeUsd) : "—"}</td>
                <td className="small dim">{t.signal ?? t.tier ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {parsed.length > maxRows && (
          <p className="small dim" style={{ marginBottom: 0, marginTop: 8 }}>
            Showing latest {maxRows} of {parsed.length}. Weekly review script dumps full path MC + EV.
          </p>
        )}
      </div>
    </div>
  );
}
