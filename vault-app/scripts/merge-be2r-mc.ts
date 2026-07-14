/**
 * Merge PRB BE@2R + Auto PDH/PDL draw TV exports and run Monte Carlo.
 * Usage: npx tsx scripts/merge-be2r-mc.ts
 */
import fs from "fs";
import path from "path";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek, dedupeOnePerDay } from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { analyzeEvalConsistency } from "../lib/eval-consistency";
import { buildEquityCurve } from "../lib/equity-curve";
import { ruleById } from "../lib/prop-firms";
import { ALL_SEED_TRADES } from "../lib/prb-data";

const EXPORT_DIR = path.join(__dirname, "../data/tv-exports/prb-be2r-pdh-2026-07-14");
const OUT_DIR = path.join(__dirname, "../data/tv-exports");
const SIMS = 2000;
const MAX_TRADES = 80;
const PAYOUT_BUFFER = 1000;

function sortFiles(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const na = a.match(/\((\d+)\)/)?.[1];
    const nb = b.match(/\((\d+)\)/)?.[1];
    const ia = na ? parseInt(na, 10) : a.endsWith("2026-07-14.csv") ? 0 : 999;
    const ib = nb ? parseInt(nb, 10) : b.endsWith("2026-07-14.csv") ? 0 : 999;
    return ia - ib;
  });
}

function main() {
  const files = sortFiles(fs.readdirSync(EXPORT_DIR).filter((f) => f.endsWith(".csv")));
  const texts = files.map((f) => fs.readFileSync(path.join(EXPORT_DIR, f), "utf8"));
  const rawCount = texts.reduce((n, t) => n + parseTvCsv(t).length, 0);
  const rawMerged = mergeTvCsvs(texts);
  const merged = dedupeOnePerDay(rawMerged, ALL_SEED_TRADES);

  const trades = merged.map((t) => t.pnl);
  const dates = merged.map((t) => t.date);
  const span = dates.length >= 2 ? `${dates[0]} → ${dates[dates.length - 1]}` : "—";

  const wins = trades.filter((p) => p > 50).length;
  const losses = trades.filter((p) => p < -50).length;
  const scr = trades.length - wins - losses;
  const net = trades.reduce((s, p) => s + p, 0);

  const rule = ruleById("tpt50")!;
  const mc = runMonteCarlo({
    trades,
    dates,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    fees: {
      evalFee: rule.evalFee ?? 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: rule.monthlyFee ?? 0,
      payoutBuffer: PAYOUT_BUFFER,
    },
  });

  const consistency = analyzeEvalConsistency(trades, dates, rule, { winCapUsd: 1490 });
  const equity = buildEquityCurve(trades, dates);

  const mergedCsvLines = [
    "date,pnl_usd,trade_num",
    ...merged.map((t) => `${t.date},${t.pnl.toFixed(2)},${t.num}`),
  ];
  fs.writeFileSync(path.join(OUT_DIR, "prb-be2r-pdh-merged.csv"), mergedCsvLines.join("\n"), "utf8");

  const tsBody = `// Auto-imported from PRB BE@2R + Auto PDH/PDL draw exports Jul 14 2026.
// 10 chunk CSVs merged with 1 trade/day dedupe. Re-gen: npx tsx scripts/merge-be2r-mc.ts

import type { SeedTrade } from "./prb-data";

export const TRADES_BE2R_PDH_12MO: SeedTrade[] = [
${merged.map((t) => `  { date: "${t.date}", dir: "L" as const, pnl: ${t.pnl} },`).join("\n")}
];
`;
  fs.writeFileSync(path.join(__dirname, "../lib/prb-be2r-data.ts"), tsBody, "utf8");

  const report = {
    experiment: "BE at +2R (was +1R) + Direction filter Auto PDH/PDL draw",
    generatedAt: new Date().toISOString(),
    sourceDir: "data/tv-exports/prb-be2r-pdh-2026-07-14",
    filesImported: files.length,
    rawTradeRows: rawCount,
    mergedTrades: merged.length,
    span,
    stats: {
      wins,
      losses,
      scratches: scr,
      winRatePct: merged.length ? Math.round((wins / merged.length) * 1000) / 10 : 0,
      netPnlUsd: Math.round(net * 100) / 100,
      avgPerTrade: Math.round((net / (merged.length || 1)) * 100) / 100,
      tradesPerWeek: Math.round(tradesPerWeek(dates) * 10) / 10,
      maxDrawdownUsd: Math.round(equity.maxDd),
      peakEquityUsd: Math.round(equity.peak),
    },
    monteCarlo: {
      firm: rule.name,
      sims: SIMS,
      passRatePct: Math.round(mc.passRate * 1000) / 10,
      bustRatePct: Math.round(mc.bustRate * 1000) / 10,
      timeoutRatePct: Math.round(mc.timeoutRate * 1000) / 10,
      tradesToPassP50: mc.tradesToPassP50,
      tradesToPassP90: mc.tradesToPassP90,
      weeksToPassP50: mc.economics.weeksToPassP50,
      weeksToPassP90: mc.economics.weeksToPassP90,
      expectedAccounts: mc.economics.expectedAccounts,
      accountsFor90Pct: mc.economics.accountsFor90Pct,
      payoutRatePct: Math.round((mc.economics.payoutRate ?? 0) * 1000) / 10,
      expectedNetUntilPass: Math.round(mc.economics.expectedNetUntilPass),
    },
    evalConsistency: {
      passRequestReady: consistency.passRequestReady,
      totalPnl: Math.round(consistency.totalPnl),
      bestDayPctOfTotal: Math.round(consistency.bestDayPctOfTotal * 10) / 10,
      recommendation: consistency.recommendation,
    },
    perFile: files.map((f) => {
      const parsed = parseTvCsv(fs.readFileSync(path.join(EXPORT_DIR, f), "utf8"));
      const d = parsed.map((t) => t.date).filter(Boolean);
      return {
        file: f,
        trades: parsed.length,
        span: d.length >= 2 ? `${d[0]} → ${d[d.length - 1]}` : "—",
        net: Math.round(parsed.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
      };
    }),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "prb-be2r-pdh-mc-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log(JSON.stringify(report, null, 2));
}

main();
