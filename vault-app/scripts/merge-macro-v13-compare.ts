/**
 * Merge Macro v1.3 tiered exports + compare vs v1.2 CE-confirm baseline.
 * Usage: npx tsx scripts/merge-macro-v13-compare.ts
 */
import fs from "fs";
import path from "path";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek, dedupeOnePerDay } from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { analyzeEvalConsistency } from "../lib/eval-consistency";
import { buildEquityCurve } from "../lib/equity-curve";
import { ruleById } from "../lib/prop-firms";

const V13_DIR = path.join(__dirname, "../data/tv-exports/macro-v1-tiered-2026-07-14");
const OUT_DIR = path.join(__dirname, "../data/tv-exports");
const BASELINE_REPORT = path.join(OUT_DIR, "macro-v1-ce-confirm-mc-report.json");
const SIMS = 2000;
const MAX_TRADES = 80;
const PAYOUT_BUFFER = 1000;

/** User note: chunk (11) = most recent window, exported with TS pivot 5; (12)–(20) = pivot 10 */
const PIVOT5_FILES = new Set(["Macro_v1_CME_MINI_MNQ1!_2026-07-14 (11).csv"]);

function sortFiles(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const na = a.match(/\((\d+)\)/)?.[1];
    const nb = b.match(/\((\d+)\)/)?.[1];
    const ia = na ? parseInt(na, 10) : 0;
    const ib = nb ? parseInt(nb, 10) : 0;
    return ia - ib;
  });
}

function runMc(pnls: number[], dates: string[]) {
  const rule = ruleById("tpt50")!;
  const mc = runMonteCarlo({
    trades: pnls,
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
  return {
    firm: rule.name,
    passRatePct: Math.round(mc.passRate * 1000) / 10,
    bustRatePct: Math.round(mc.bustRate * 1000) / 10,
    payoutRatePct: Math.round((mc.economics.payoutRate ?? 0) * 1000) / 10,
    tradesToPassP50: mc.tradesToPassP50,
    weeksToPassP50: mc.economics.weeksToPassP50,
    expectedAccounts: mc.economics.expectedAccounts,
    accountsFor90Pct: mc.economics.accountsFor90Pct,
    expectedNetUntilPass: Math.round(mc.economics.expectedNetUntilPass),
  };
}

function buildStats(merged: { date: string; pnl: number; num: number }[]) {
  const trades = merged.map((t) => t.pnl);
  const dates = merged.map((t) => t.date);
  const wins = trades.filter((p) => p > 50).length;
  const losses = trades.filter((p) => p < -50).length;
  const net = trades.reduce((s, p) => s + p, 0);
  const eq = buildEquityCurve(trades, dates);
  const winPnls = trades.filter((p) => p > 50);
  const lossPnls = trades.filter((p) => p < -50);
  return {
    mergedTrades: merged.length,
    span: dates.length >= 2 ? `${dates[0]} → ${dates[dates.length - 1]}` : "—",
    wins,
    losses,
    scratches: merged.length - wins - losses,
    winRatePct: merged.length ? Math.round((wins / merged.length) * 1000) / 10 : 0,
    netPnlUsd: Math.round(net * 100) / 100,
    avgPerTrade: Math.round((net / (merged.length || 1)) * 100) / 100,
    avgWinUsd: winPnls.length ? Math.round(winPnls.reduce((s, p) => s + p, 0) / winPnls.length) : 0,
    avgLossUsd: lossPnls.length ? Math.round(lossPnls.reduce((s, p) => s + p, 0) / lossPnls.length) : 0,
    tradesPerWeek: Math.round(tradesPerWeek(dates) * 10) / 10,
    maxDrawdownUsd: Math.round(eq.maxDd),
    peakEquityUsd: Math.round(eq.peak),
    monteCarlo: runMc(trades, dates),
  };
}

function main() {
  const files = sortFiles(fs.readdirSync(V13_DIR).filter((f) => f.endsWith(".csv")));
  const texts = files.map((f) => fs.readFileSync(path.join(V13_DIR, f), "utf8"));
  const rawCount = texts.reduce((n, t) => n + parseTvCsv(t).length, 0);
  const rawMerged = mergeTvCsvs(texts);
  const merged = dedupeOnePerDay(rawMerged);

  const perFile = files.map((f) => {
    const parsed = parseTvCsv(fs.readFileSync(path.join(V13_DIR, f), "utf8"));
    const d = parsed.map((t) => t.date).filter(Boolean);
    return {
      file: f,
      tsPivot: PIVOT5_FILES.has(f) ? 5 : 10,
      trades: parsed.length,
      span: d.length >= 2 ? `${d[0]} → ${d[d.length - 1]}` : "—",
      netPnlUsd: Math.round(parsed.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
    };
  });

  const pivot5Only = dedupeOnePerDay(
    mergeTvCsvs(files.filter((f) => PIVOT5_FILES.has(f)).map((f) => fs.readFileSync(path.join(V13_DIR, f), "utf8")))
  );
  const pivot10Only = dedupeOnePerDay(
    mergeTvCsvs(files.filter((f) => !PIVOT5_FILES.has(f)).map((f) => fs.readFileSync(path.join(V13_DIR, f), "utf8")))
  );

  const statsAll = buildStats(merged);
  const statsP5 = buildStats(pivot5Only);
  const statsP10 = buildStats(pivot10Only);

  const trades = merged.map((t) => t.pnl);
  const dates = merged.map((t) => t.date);
  const rule = ruleById("tpt50")!;
  const consistency = analyzeEvalConsistency(trades, dates, rule, { winCapUsd: 1490 });

  const mergedCsvLines = [
    "date,pnl_usd,trade_num",
    ...merged.map((t) => `${t.date},${t.pnl.toFixed(2)},${t.num}`),
  ];
  fs.writeFileSync(path.join(OUT_DIR, "macro-v1-tiered-merged.csv"), mergedCsvLines.join("\n"), "utf8");

  const baseline = fs.existsSync(BASELINE_REPORT)
    ? JSON.parse(fs.readFileSync(BASELINE_REPORT, "utf8"))
    : null;

  const comparison = baseline
    ? {
        netPnlDelta: Math.round((statsAll.netPnlUsd - baseline.stats.netPnlUsd) * 100) / 100,
        winRateDelta: Math.round((statsAll.winRatePct - baseline.stats.winRatePct) * 10) / 10,
        tradesDelta: statsAll.mergedTrades - baseline.mergedTrades,
        maxDdDelta: statsAll.maxDrawdownUsd - baseline.stats.maxDrawdownUsd,
        passRateDelta: Math.round((statsAll.monteCarlo.passRatePct - baseline.monteCarlo.passRatePct) * 10) / 10,
        bustRateDelta: Math.round((statsAll.monteCarlo.bustRatePct - baseline.monteCarlo.bustRatePct) * 10) / 10,
        verdict:
          statsAll.monteCarlo.passRatePct > baseline.monteCarlo.passRatePct &&
          statsAll.netPnlUsd >= baseline.stats.netPnlUsd * 0.7
            ? "v1.3 improves prop math without destroying edge"
            : statsAll.winRatePct > baseline.stats.winRatePct + 5 && statsAll.maxDrawdownUsd < baseline.stats.maxDrawdownUsd
              ? "v1.3 quality up — check if trade count supports live frequency"
              : "mixed — review tier frequency before promoting",
      }
    : null;

  const report = {
    generatedAt: new Date().toISOString(),
    strategy: "Macro Model v1.3 — tiered TS/SMT + CE confirm",
    settingsNote:
      "Tiered A+/A/B · MES SMT · tiered TP 50/40/30 · MIXED export: chunk (11) pivot 5 recent, chunks (12)–(20) pivot 10",
    sourceDir: "data/tv-exports/macro-v1-tiered-2026-07-14",
    filesImported: files.length,
    rawTradeRows: rawCount,
    dedupedRows: rawCount - rawMerged.length,
    sameDayCollisions: rawMerged.length - new Set(rawMerged.map((t) => t.date)).size,
    pivotSplitNote: "File (11) tagged pivot 5 (May–Jul 2026 recent). Files (12)–(20) tagged pivot 10.",
    ...statsAll,
    evalConsistency: {
      applicable: consistency.applicable,
      passRequestReady: consistency.passRequestReady,
      totalPnl: Math.round(consistency.totalPnl),
      bestDayPctOfTotal: Math.round(consistency.bestDayPctOfTotal * 10) / 10,
      recommendation: consistency.recommendation,
    },
    pivot5Subset: statsP5,
    pivot10Subset: statsP10,
    perFile,
    baselineV12: baseline
      ? {
          strategy: baseline.strategy,
          mergedTrades: baseline.mergedTrades,
          stats: baseline.stats,
          monteCarlo: baseline.monteCarlo,
        }
      : null,
    comparison,
    tradeList: merged.map((t) => ({ date: t.date, pnl: Math.round(t.pnl * 100) / 100 })),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "macro-v1-tiered-mc-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));
}

main();
