import type { McResult } from "./monte-carlo";
import type { EvalConsistencyReport } from "./eval-consistency";
import type { CohortRecord } from "./cohort";
import { runMonteCarlo } from "./monte-carlo";
import type { PropRule } from "./types";

/** Primary benchmark — PRB v1.5 12mo control (Jul 13 exports, TPT $50K). */
export const PRB_BENCHMARK_ID = "prb-v15-12mo-control";

export interface LabScorecardMetrics {
  id: string;
  label: string;
  dataset: string;
  span: string;
  /** #1 — expectancy × trades/week */
  weeklyEdgeUsd: number;
  /** #2 — calendar speed */
  weeksToPassP50: number | null;
  /** #3 — MC pass probability */
  passRatePct: number;
  /** #4 — share of trades below −$200 */
  fullLossRatePct: number;
  /** #5 — longest −$200 streak */
  maxConsecutiveFullLosses: number;
  /** #6 — concentration risk for eval */
  top3DayPnlSharePct: number;
  /** #7 — eval attempt cost */
  expectedAccounts: number;
  /** #8 — fees-adjusted */
  expectedNetUntilPass: number;
  bustRatePct: number;
  netPnlUsd: number;
  tradesPerWeek: number;
  avgPerTradeUsd: number;
  winRatePct: number;
  bestDayPctOfTotal: number;
  /** MC on second chronological half — regime stability proxy */
  secondHalfPassRatePct: number | null;
  trades: number;
}

export interface ScorecardKpiRow {
  key: string;
  label: string;
  priority: number;
  higherIsBetter: boolean;
  format: (v: number | null) => string;
  benchmark: number | null;
  current: number | null;
  delta: number | null;
  improved: boolean | null;
}

export type ScorecardVerdict = "advance" | "hold" | "regress";

export interface ScorecardComparison {
  current: LabScorecardMetrics;
  benchmark: LabScorecardMetrics;
  rows: ScorecardKpiRow[];
  verdict: ScorecardVerdict;
  verdictDetail: string;
  compositeScore: number;
}

export interface ScorecardRunEntry {
  id: string;
  at: string;
  variant: string;
  dataset: string;
  verdict: ScorecardVerdict;
  compositeScore: number;
  metrics: LabScorecardMetrics;
}

const FULL_LOSS_USD = -200;

function groupDailyPnl(trades: number[], dates: string[]): { date: string; pnl: number }[] {
  const byDay = new Map<string, number>();
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    byDay.set(d, (byDay.get(d) ?? 0) + trades[i]);
  }
  return [...byDay.entries()]
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeReplayKpis(
  trades: number[],
  dates: string[],
  stats: { wins: number; losses: number; n: number; net: number; avg: number; tpw: number }
): Pick<
  LabScorecardMetrics,
  | "fullLossRatePct"
  | "maxConsecutiveFullLosses"
  | "top3DayPnlSharePct"
  | "avgPerTradeUsd"
  | "winRatePct"
  | "weeklyEdgeUsd"
  | "tradesPerWeek"
  | "netPnlUsd"
  | "trades"
> {
  const fullLosses = trades.filter((p) => p < FULL_LOSS_USD).length;
  let maxStreak = 0;
  let streak = 0;
  for (const p of trades) {
    if (p < FULL_LOSS_USD) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  const daily = groupDailyPnl(trades, dates);
  const totalNet = stats.net;
  const top3 = [...daily].sort((a, b) => b.pnl - a.pnl).slice(0, 3);
  const top3Sum = top3.reduce((s, d) => s + Math.max(0, d.pnl), 0);
  const top3DayPnlSharePct =
    totalNet > 0 ? Math.round((top3Sum / totalNet) * 1000) / 10 : 0;

  return {
    trades: stats.n,
    netPnlUsd: Math.round(stats.net * 100) / 100,
    avgPerTradeUsd: Math.round(stats.avg * 100) / 100,
    tradesPerWeek: stats.tpw,
    weeklyEdgeUsd: Math.round(stats.avg * stats.tpw * 100) / 100,
    winRatePct: stats.n ? Math.round((stats.wins / stats.n) * 1000) / 10 : 0,
    fullLossRatePct: stats.n ? Math.round((fullLosses / stats.n) * 1000) / 10 : 0,
    maxConsecutiveFullLosses: maxStreak,
    top3DayPnlSharePct,
  };
}

export function mcPassRateSecondHalf(
  trades: number[],
  dates: string[],
  rule: PropRule,
  sims: number,
  maxTrades: number,
  payoutBuffer: number
): number | null {
  if (trades.length < 12 || dates.length < 12) return null;
  const paired = trades.map((pnl, i) => ({ pnl, date: dates[i] ?? "" }));
  const sorted = [...paired].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(sorted.length / 2);
  const half = sorted.slice(mid);
  if (half.length < 6) return null;
  const mc = runMonteCarlo({
    trades: half.map((t) => t.pnl),
    dates: half.map((t) => t.date),
    sims: Math.min(sims, 1500),
    maxTrades,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    fees: {
      evalFee: rule.evalFee ?? 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: rule.monthlyFee ?? 0,
      payoutBuffer,
    },
    consistency:
      rule.consistencyPct > 0
        ? { consistencyPct: rule.consistencyPct, minDays: rule.minDays }
        : undefined,
    bootstrap: "week",
  });
  return Math.round(mc.passRate * 1000) / 10;
}

export function buildScorecardMetrics(input: {
  id: string;
  label: string;
  dataset: string;
  span: string;
  trades: number[];
  dates: string[];
  stats: { wins: number; losses: number; n: number; net: number; avg: number; tpw: number };
  mc: McResult;
  consistency: EvalConsistencyReport;
  secondHalfPassRatePct: number | null;
}): LabScorecardMetrics {
  const replay = computeReplayKpis(input.trades, input.dates, input.stats);
  const eco = input.mc.economics;
  return {
    id: input.id,
    label: input.label,
    dataset: input.dataset,
    span: input.span,
    ...replay,
    weeksToPassP50: eco.weeksToPassP50,
    passRatePct: Math.round(input.mc.passRate * 1000) / 10,
    bustRatePct: Math.round(input.mc.bustRate * 1000) / 10,
    expectedAccounts: Number.isFinite(eco.expectedAccounts) ? eco.expectedAccounts : 999,
    expectedNetUntilPass: Math.round(eco.expectedNetUntilPass),
    bestDayPctOfTotal: Math.round(input.consistency.bestDayPctOfTotal * 10) / 10,
    secondHalfPassRatePct: input.secondHalfPassRatePct,
  };
}

/** Frozen benchmark from prb-ytd-mc-report.json + May17+ second-half pass. */
export const PRB_BENCHMARK: LabScorecardMetrics = {
  id: PRB_BENCHMARK_ID,
  label: "PRB v1.5 — 12mo control",
  dataset: "PRB YTD Jul 14 — 1/day dedupe",
  span: "2024-12-31 → 2026-07-10",
  weeklyEdgeUsd: 171.5,
  weeksToPassP50: 7.4,
  passRatePct: 41.7,
  fullLossRatePct: 54.6,
  maxConsecutiveFullLosses: 8,
  top3DayPnlSharePct: 42,
  expectedAccounts: 2.4,
  expectedNetUntilPass: 3922,
  bustRatePct: 58.3,
  netPnlUsd: 13232,
  tradesPerWeek: 1.4,
  avgPerTradeUsd: 122.5,
  winRatePct: 15.7,
  bestDayPctOfTotal: 18,
  secondHalfPassRatePct: 51.8,
  trades: 108,
};

function fmtUsd(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v < 0 ? "−" : "";
  return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v.toFixed(1)}%`;
}

function fmtNum(v: number | null, suffix = ""): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v}${suffix}`;
}

function delta(current: number | null, benchmark: number | null): number | null {
  if (current == null || benchmark == null || !Number.isFinite(current) || !Number.isFinite(benchmark)) {
    return null;
  }
  return Math.round((current - benchmark) * 100) / 100;
}

function improved(current: number | null, benchmark: number | null, higherIsBetter: boolean): boolean | null {
  const d = delta(current, benchmark);
  if (d == null) return null;
  if (d === 0) return false;
  return higherIsBetter ? d > 0 : d < 0;
}

export function compareToBenchmark(
  current: LabScorecardMetrics,
  benchmark: LabScorecardMetrics = PRB_BENCHMARK
): ScorecardComparison {
  const defs: Omit<ScorecardKpiRow, "benchmark" | "current" | "delta" | "improved">[] = [
    { key: "weeklyEdgeUsd", label: "Weekly edge (E[$/wk])", priority: 1, higherIsBetter: true, format: fmtUsd },
    { key: "weeksToPassP50", label: "Weeks to pass (P50)", priority: 2, higherIsBetter: false, format: (v) => fmtNum(v, " wks") },
    { key: "passRatePct", label: "Pass probability", priority: 3, higherIsBetter: true, format: fmtPct },
    { key: "secondHalfPassRatePct", label: "2nd-half pass % (regime)", priority: 4, higherIsBetter: true, format: fmtPct },
    { key: "fullLossRatePct", label: "Full-loss rate (<$200)", priority: 5, higherIsBetter: false, format: fmtPct },
    { key: "maxConsecutiveFullLosses", label: "Max loss streak", priority: 6, higherIsBetter: false, format: (v) => fmtNum(v, "") },
    { key: "top3DayPnlSharePct", label: "Top-3-day PnL share", priority: 7, higherIsBetter: false, format: fmtPct },
    { key: "expectedAccounts", label: "Expected accounts", priority: 8, higherIsBetter: false, format: (v) => fmtNum(v, "") },
    { key: "expectedNetUntilPass", label: "Net until pass (fees)", priority: 9, higherIsBetter: true, format: fmtUsd },
    { key: "netPnlUsd", label: "Replay net PnL", priority: 10, higherIsBetter: true, format: fmtUsd },
    { key: "tradesPerWeek", label: "Trades / week", priority: 11, higherIsBetter: true, format: (v) => fmtNum(v, "") },
    { key: "avgPerTradeUsd", label: "Avg / trade", priority: 12, higherIsBetter: true, format: fmtUsd },
    { key: "bustRatePct", label: "Bust rate", priority: 13, higherIsBetter: false, format: fmtPct },
    { key: "bestDayPctOfTotal", label: "Best day % of total", priority: 14, higherIsBetter: false, format: fmtPct },
  ];

  const rows: ScorecardKpiRow[] = defs.map((d) => {
    const b = benchmark[d.key as keyof LabScorecardMetrics] as number | null;
    const c = current[d.key as keyof LabScorecardMetrics] as number | null;
    return {
      ...d,
      benchmark: typeof b === "number" ? b : null,
      current: typeof c === "number" ? c : null,
      delta: delta(c, b),
      improved: improved(c, b, d.higherIsBetter),
    };
  });

  const primary = rows.filter((r) => r.priority <= 7);
  const wins = primary.filter((r) => r.improved === true).length;
  const losses = primary.filter((r) => r.improved === false).length;

  const weeklyUp = rows.find((r) => r.key === "weeklyEdgeUsd")?.improved === true;
  const weeksDown = rows.find((r) => r.key === "weeksToPassP50")?.improved === true;
  const passOk =
    (current.passRatePct ?? 0) >= benchmark.passRatePct - 5;
  const weeklyDown = rows.find((r) => r.key === "weeklyEdgeUsd")?.improved === false;
  const passBad = (current.passRatePct ?? 0) < benchmark.passRatePct - 10;

  let verdict: ScorecardVerdict = "hold";
  let verdictDetail = "Mixed vs benchmark — review primary KPIs before promoting.";
  if (weeklyUp && (weeksDown || passOk) && wins >= losses + 2) {
    verdict = "advance";
    verdictDetail = "Beating benchmark on weekly edge and speed/stability — candidate to keep testing.";
  } else if (weeklyDown || passBad || losses >= wins + 3) {
    verdict = "regress";
    verdictDetail = "Trailing benchmark on throughput or pass stability — not a promotion path.";
  }

  const weights: Record<string, number> = {
    weeklyEdgeUsd: 0.22,
    weeksToPassP50: 0.18,
    passRatePct: 0.15,
    secondHalfPassRatePct: 0.12,
    fullLossRatePct: 0.1,
    top3DayPnlSharePct: 0.08,
    expectedAccounts: 0.08,
    netPnlUsd: 0.07,
  };

  let composite = 50;
  let weightSum = 0;
  for (const [key, w] of Object.entries(weights)) {
    const row = rows.find((r) => r.key === key);
    if (!row || row.benchmark == null || row.current == null || row.benchmark === 0) continue;
    const ratio = row.higherIsBetter
      ? row.current / row.benchmark
      : row.benchmark / row.current;
    composite += (Math.min(1.5, Math.max(0.5, ratio)) - 1) * w * 100;
    weightSum += w;
  }
  if (weightSum > 0) composite = Math.round(Math.min(99, Math.max(1, composite)));

  return { current, benchmark, rows, verdict, verdictDetail, compositeScore: composite };
}

export function cohortToScorecardMetrics(c: CohortRecord): LabScorecardMetrics | null {
  if (!c.trades || !c.mcPassPct) return null;
  const avg = c.trades ? c.netPnl / c.trades : 0;
  const tpw = c.tradesPerWeek || 0;
  const weeklyEdge = c.weeklyEdgeUsd || Math.round(avg * tpw * 100) / 100;
  return {
    id: c.id,
    label: c.variant,
    dataset: c.datasetName,
    span: c.span,
    weeklyEdgeUsd: weeklyEdge,
    weeksToPassP50: c.weeksToPassP50,
    passRatePct: c.mcPassPct,
    fullLossRatePct: c.trades ? Math.round((c.losses / c.trades) * 1000) / 10 : 0,
    maxConsecutiveFullLosses: 0,
    top3DayPnlSharePct: 0,
    expectedAccounts: c.expectedAccounts,
    expectedNetUntilPass: 0,
    bustRatePct: c.mcBustPct,
    netPnlUsd: c.netPnl,
    tradesPerWeek: tpw,
    avgPerTradeUsd: Math.round(avg * 100) / 100,
    winRatePct: c.trades ? Math.round((c.wins / c.trades) * 1000) / 10 : 0,
    bestDayPctOfTotal: 0,
    secondHalfPassRatePct: null,
    trades: c.trades,
  };
}

export function rankScorecardEntries(
  entries: LabScorecardMetrics[],
  benchmark: LabScorecardMetrics = PRB_BENCHMARK
): { metrics: LabScorecardMetrics; compositeScore: number }[] {
  return entries
    .map((m) => ({
      metrics: m,
      compositeScore: compareToBenchmark(m, benchmark).compositeScore,
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}
