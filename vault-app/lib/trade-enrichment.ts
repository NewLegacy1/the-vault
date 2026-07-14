/**
 * Summaries over Premium TV / enriched ledger fields (MFE, MAE, duration, qty).
 * Used by F4 LAB + cohort notes — MC still shuffles PnL only.
 */
import type { ParsedTrade } from "./csv";

export interface TradeEnrichmentSummary {
  n: number;
  /** Trades with at least one of MFE / MAE / duration populated */
  enrichedN: number;
  coveragePct: number;
  avgDurationBars: number | null;
  medianDurationBars: number | null;
  duration0Pct: number | null;
  avgMfeUsd: number | null;
  avgMaeUsd: number | null;
  /** Median |MAE| on losers — typical realized stop pressure */
  medianLoserMaeUsd: number | null;
  /** Wins that showed MFE ≥ 2× final PnL (gave back before TP) */
  winnerGivebackN: number | null;
  /** Exits with |pnl| < $50 that reached MFE ≥ $200 (likely BE scratches) */
  beScratchCandidates: number | null;
  avgQty: number | null;
  avgReturnPct: number | null;
  hasPremiumExcursion: boolean;
  hasDuration: boolean;
  hasEntryTime: boolean;
}

function median(vals: number[]): number | null {
  if (vals.length === 0) return null;
  const s = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function avg(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function round1(n: number | null): number | null {
  if (n === null || !Number.isFinite(n)) return null;
  return Math.round(n * 10) / 10;
}

function round0(n: number | null): number | null {
  if (n === null || !Number.isFinite(n)) return null;
  return Math.round(n);
}

/** Build enrichment summary; returns null when ledger is bare date+pnl only. */
export function summarizeTradeEnrichment(trades: ParsedTrade[]): TradeEnrichmentSummary | null {
  if (trades.length === 0) return null;

  const mfe = trades.map((t) => t.mfeUsd).filter((v): v is number => v !== undefined && Number.isFinite(v));
  const mae = trades.map((t) => t.maeUsd).filter((v): v is number => v !== undefined && Number.isFinite(v));
  const durs = trades
    .map((t) => t.durationBars)
    .filter((v): v is number => v !== undefined && Number.isFinite(v));
  const qtys = trades.map((t) => t.qty).filter((v): v is number => v !== undefined && Number.isFinite(v));
  const rets = trades
    .map((t) => t.returnPct)
    .filter((v): v is number => v !== undefined && Number.isFinite(v));

  const enrichedN = trades.filter(
    (t) =>
      t.mfeUsd !== undefined ||
      t.maeUsd !== undefined ||
      t.durationBars !== undefined ||
      t.entryDatetime !== undefined
  ).length;

  if (enrichedN === 0) return null;

  const losers = trades.filter((t) => t.pnl < -50);
  const loserMae = losers
    .map((t) => (t.maeUsd !== undefined ? Math.abs(t.maeUsd) : undefined))
    .filter((v): v is number => v !== undefined);

  let winnerGivebackN: number | null = null;
  const winsWithMfe = trades.filter((t) => t.pnl > 50 && t.mfeUsd !== undefined && t.mfeUsd > 0);
  if (winsWithMfe.length > 0) {
    winnerGivebackN = winsWithMfe.filter((t) => (t.mfeUsd ?? 0) >= 2 * t.pnl).length;
  }

  let beScratchCandidates: number | null = null;
  const withMfe = trades.filter((t) => t.mfeUsd !== undefined);
  if (withMfe.length > 0) {
    beScratchCandidates = withMfe.filter((t) => Math.abs(t.pnl) < 50 && (t.mfeUsd ?? 0) >= 200).length;
  }

  return {
    n: trades.length,
    enrichedN,
    coveragePct: Math.round((enrichedN / trades.length) * 1000) / 10,
    avgDurationBars: round1(avg(durs)),
    medianDurationBars: round1(median(durs)),
    duration0Pct: durs.length ? round1((durs.filter((d) => d === 0).length / durs.length) * 100) : null,
    avgMfeUsd: round0(avg(mfe)),
    avgMaeUsd: round0(avg(mae.map(Math.abs))),
    medianLoserMaeUsd: round0(median(loserMae)),
    winnerGivebackN,
    beScratchCandidates,
    avgQty: round1(avg(qtys)),
    avgReturnPct: round1(avg(rets)),
    hasPremiumExcursion: mfe.length > 0 || mae.length > 0,
    hasDuration: durs.length > 0,
    hasEntryTime: trades.some((t) => Boolean(t.entryDatetime)),
  };
}

/** Compact YAML/object for cohort frontmatter. */
export function enrichmentToYamlFields(s: TradeEnrichmentSummary): Record<string, number | null> {
  return {
    enrich_coverage_pct: s.coveragePct,
    avg_duration_bars: s.avgDurationBars,
    median_duration_bars: s.medianDurationBars,
    duration_0_pct: s.duration0Pct,
    avg_mfe_usd: s.avgMfeUsd,
    avg_mae_usd: s.avgMaeUsd,
    median_loser_mae_usd: s.medianLoserMaeUsd,
    winner_giveback_n: s.winnerGivebackN,
    be_scratch_candidates: s.beScratchCandidates,
    avg_qty: s.avgQty,
  };
}
