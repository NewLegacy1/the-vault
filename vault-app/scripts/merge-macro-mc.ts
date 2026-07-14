/**
 * Merge Macro v1 TV exports and run Monte Carlo + consistency check.
 * Usage: npx tsx scripts/merge-macro-mc.ts
 */
import fs from "fs";
import path from "path";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek, dedupeOnePerDay } from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { analyzeEvalConsistency } from "../lib/eval-consistency";
import { buildEquityCurve } from "../lib/equity-curve";
import { ruleById } from "../lib/prop-firms";

const EXPORT_DIR = path.join(__dirname, "../data/tv-exports/macro-v1-ce-confirm-2026-07-14");
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
  const deduped = rawCount - rawMerged.length;
  const merged = dedupeOnePerDay(rawMerged);
  const sameDayCollisions = rawMerged.length - new Set(rawMerged.map((t) => t.date)).size;

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
  fs.writeFileSync(path.join(OUT_DIR, "macro-v1-ce-confirm-merged.csv"), mergedCsvLines.join("\n"), "utf8");

  const perFile = files.map((f) => {
    const parsed = parseTvCsv(fs.readFileSync(path.join(EXPORT_DIR, f), "utf8"));
    const d = parsed.map((t) => t.date).filter(Boolean);
    return {
      file: f,
      trades: parsed.length,
      span: d.length >= 2 ? `${d[0]} → ${d[d.length - 1]}` : "—",
      net: Math.round(parsed.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    strategy: "Macro Model v1 — CE confirm (tap + lift)",
    settingsNote:
      "User-tuned: $800 risk, 50pt TP, 80pt max entry→stop, prem/disc ON, PDL↔session high",
    sourceDir: "data/tv-exports/macro-v1-ce-confirm-2026-07-14",
    filesImported: files.length,
    rawTradeRows: rawCount,
    dedupedRows: deduped,
    sameDayCollisions,
    mergedTrades: merged.length,
    mergedTradesBeforeOnePerDay: rawMerged.length,
    span,
    stats: {
      wins,
      losses,
      scratches: scr,
      winRatePct: merged.length ? Math.round((wins / merged.length) * 1000) / 10 : 0,
      netPnlUsd: Math.round(net * 100) / 100,
      avgPerTrade: Math.round((net / (merged.length || 1)) * 100) / 100,
      avgWinUsd: wins ? Math.round((trades.filter((p) => p > 50).reduce((s, p) => s + p, 0) / wins) * 100) / 100 : 0,
      avgLossUsd: losses ? Math.round((trades.filter((p) => p < -50).reduce((s, p) => s + p, 0) / losses) * 100) / 100 : 0,
      tradesPerWeek: Math.round(tradesPerWeek(dates) * 10) / 10,
      maxDrawdownUsd: Math.round(equity.maxDd),
      peakEquityUsd: Math.round(equity.peak),
    },
    monteCarlo: {
      firm: rule.name,
      sims: SIMS,
      passAt: rule.passAt,
      trailingDD: rule.trailingDD,
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
      applicable: consistency.applicable,
      passRequestReady: consistency.passRequestReady,
      blockedAtTarget: consistency.blockedAtTarget,
      totalPnl: Math.round(consistency.totalPnl),
      bestDayPnl: Math.round(consistency.bestDayPnl),
      bestDayDate: consistency.bestDayDate,
      bestDayPctOfTotal: Math.round(consistency.bestDayPctOfTotal * 10) / 10,
      oversizedWinDays: consistency.oversizedWins.length,
      recommendation: consistency.recommendation,
    },
    perFile,
    tradeList: merged.map((t) => ({ date: t.date, pnl: Math.round(t.pnl * 100) / 100 })),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "macro-v1-ce-confirm-mc-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));
}

main();
