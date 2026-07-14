"use client";

import type { TradeEnrichmentSummary } from "@/lib/trade-enrichment";

function fmtUsd(n: number | null): string {
  if (n === null) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

export function LedgerEnrichmentPanel({ summary }: { summary: TradeEnrichmentSummary | null }) {
  if (!summary) {
    return (
      <p className="small dim" style={{ marginTop: 8, marginBottom: 0 }}>
        No Premium fields on this ledger (date + PnL only). Re-upload a TradingView List of trades
        CSV — Favorable/Adverse excursion and Duration columns unlock MFE/MAE/duration diagnostics.
      </p>
    );
  }

  return (
    <div className="lab-enrichment" style={{ marginTop: 10 }}>
      <div className="small dim" style={{ marginBottom: 4 }}>
        Premium trade stats · {summary.coveragePct}% coverage ({summary.enrichedN}/{summary.n})
      </div>
      <div
        className="small"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "4px 12px",
        }}
      >
        <span>
          Duration avg/med{" "}
          <span className="accent">
            {summary.avgDurationBars ?? "—"}/{summary.medianDurationBars ?? "—"}
          </span>{" "}
          bars
        </span>
        <span>
          Same-bar (0){" "}
          <span className="accent">
            {summary.duration0Pct != null ? `${summary.duration0Pct}%` : "—"}
          </span>
        </span>
        <span>
          Avg MFE/MAE{" "}
          <span className="accent">
            {fmtUsd(summary.avgMfeUsd)} / {fmtUsd(summary.avgMaeUsd)}
          </span>
        </span>
        <span>
          Loser MAE med <span className="accent">{fmtUsd(summary.medianLoserMaeUsd)}</span>
        </span>
        <span>
          BE-scratch cand.{" "}
          <span className="accent">{summary.beScratchCandidates ?? "—"}</span>
        </span>
        <span>
          Winner give-back{" "}
          <span className="accent">{summary.winnerGivebackN ?? "—"}</span>
        </span>
        <span>
          Avg qty <span className="accent">{summary.avgQty ?? "—"}</span>
        </span>
      </div>
      <p className="small dim" style={{ marginTop: 4, marginBottom: 0 }}>
        Used for management diagnosis (BE vs full stop, give-back). Monte Carlo still shuffles PnL
        only.
      </p>
    </div>
  );
}
