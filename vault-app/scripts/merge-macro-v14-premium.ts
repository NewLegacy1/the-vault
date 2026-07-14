/**
 * Analyze Macro v1.4 premium deep-backtest export.
 * Usage: npx tsx scripts/merge-macro-v14-premium.ts
 */
import fs from "fs";
import path from "path";
import {
  parseTvCsv,
  enrichedTradeToCsvRow,
  ENRICHED_TRADE_CSV_HEADER,
} from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { buildEquityCurve } from "../lib/equity-curve";
import { analyzeEvalConsistency } from "../lib/eval-consistency";
import { ruleById } from "../lib/prop-firms";

const EXPORT_DIR = path.join(__dirname, "../data/tv-exports/macro-v1.4-premium-2026-07-14");
const OUT_DIR = path.join(__dirname, "../data/tv-exports");
const SIMS = 2000;

function main() {
  const files = fs.readdirSync(EXPORT_DIR).filter((f) => f.endsWith(".csv"));
  const file = files[0];
  if (!file) throw new Error("No CSV in " + EXPORT_DIR);

  const trades = parseTvCsv(fs.readFileSync(path.join(EXPORT_DIR, file), "utf8"));
  const pnls = trades.map((t) => t.pnl);
  const dates = trades.map((t) => t.date);
  const rule = ruleById("tpt50")!;

  const mc = runMonteCarlo({
    trades: pnls,
    dates,
    sims: SIMS,
    maxTrades: 80,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    fees: {
      evalFee: rule.evalFee ?? 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: rule.monthlyFee ?? 0,
      payoutBuffer: 1000,
    },
  });

  const eq = buildEquityCurve(pnls, dates);
  const cons = analyzeEvalConsistency(pnls, dates, rule, { winCapUsd: 1490 });
  const wins = trades.filter((t) => t.pnl > 50);
  const losses = trades.filter((t) => t.pnl < -50);

  const byTier: Record<string, { n: number; w: number; l: number; net: number }> = {};
  for (const t of trades) {
    const tier = t.tier ?? "unknown";
    if (!byTier[tier]) byTier[tier] = { n: 0, w: 0, l: 0, net: 0 };
    byTier[tier].n++;
    byTier[tier].net += t.pnl;
    if (t.pnl > 50) byTier[tier].w++;
    else if (t.pnl < -50) byTier[tier].l++;
  }

  for (const k of Object.keys(byTier)) {
    byTier[k].net = Math.round(byTier[k].net * 100) / 100;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    strategy: "Macro Model v1.4 — premium 365d deep backtest",
    sourceFile: file,
    span: dates.length >= 2 ? `${dates[0]} → ${dates[dates.length - 1]}` : "—",
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRatePct: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : 0,
    netPnlUsd: Math.round(pnls.reduce((s, p) => s + p, 0) * 100) / 100,
    maxDdUsd: Math.round(eq.maxDd),
    avgWinUsd: wins.length ? Math.round(wins.reduce((s, t) => s + t.pnl, 0) / wins.length) : 0,
    avgLossUsd: losses.length ? Math.round(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0,
    monteCarlo: {
      firm: rule.name,
      sims: SIMS,
      passRatePct: Math.round(mc.passRate * 1000) / 10,
      bustRatePct: Math.round(mc.bustRate * 1000) / 10,
      timeoutRatePct: Math.round(mc.timeoutRate * 1000) / 10,
      tradesToPassP50: mc.tradesToPassP50,
      tradesToPassP90: mc.tradesToPassP90,
      expectedAccounts: mc.economics.expectedAccounts,
      accountsFor90Pct: mc.economics.accountsFor90Pct,
    },
    evalConsistency: {
      passRequestReady: cons.passRequestReady,
      bestDayPctOfTotal: Math.round(cons.bestDayPctOfTotal * 10) / 10,
      bestDayDate: cons.bestDayDate,
      recommendation: cons.recommendation,
    },
    byTier,
    tradeList: trades.map((t) => ({
      date: t.date,
      pnl: Math.round(t.pnl * 100) / 100,
      tier: t.tier,
      signal: t.signal,
      mfeUsd: t.mfeUsd,
      maeUsd: t.maeUsd,
      durationBars: t.durationBars,
    })),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "macro-v1.4-premium-merged.csv"),
    [ENRICHED_TRADE_CSV_HEADER, ...trades.map(enrichedTradeToCsvRow)].join("\n"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "macro-v1.4-premium-mc-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));
}

main();
