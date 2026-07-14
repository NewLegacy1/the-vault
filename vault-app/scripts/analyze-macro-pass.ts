/**
 * Diagnose Macro pass-rate drivers and simulate risk/filter variants.
 * Usage: npx tsx scripts/analyze-macro-pass.ts
 */
import fs from "fs";
import path from "path";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { buildEquityCurve } from "../lib/equity-curve";

interface Trade {
  date: string;
  pnl: number;
}

const REPORT = path.join(__dirname, "../data/tv-exports/macro-v1-ce-confirm-mc-report.json");
const SIMS = 2000;
const MAX_TRADES = 80;

function mc(pnls: number[], dates: string[]) {
  const rule = ruleById("tpt50")!;
  const r = runMonteCarlo({
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
      payoutBuffer: 1000,
    },
  });
  return {
    pass: Math.round(r.passRate * 1000) / 10,
    bust: Math.round(r.bustRate * 1000) / 10,
    payout: Math.round((r.economics.payoutRate ?? 0) * 1000) / 10,
    tPass: r.tradesToPassP50,
  };
}

function stats(trades: Trade[]) {
  const pnls = trades.map((t) => t.pnl);
  const wins = pnls.filter((p) => p > 50);
  const losses = pnls.filter((p) => p < -50);
  const net = pnls.reduce((s, p) => s + p, 0);
  const eq = buildEquityCurve(pnls, trades.map((t) => t.date));
  return {
    n: trades.length,
    wr: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : 0,
    net: Math.round(net),
    avgWin: wins.length ? Math.round(wins.reduce((s, p) => s + p, 0) / wins.length) : 0,
    avgLoss: losses.length ? Math.round(losses.reduce((s, p) => s + p, 0) / losses.length) : 0,
    maxDd: Math.round(eq.maxDd),
    lossGt800: losses.filter((p) => p < -800).length,
    lossGt1000: losses.filter((p) => p < -1000).length,
    win391: wins.filter((p) => p > 350 && p < 430).length,
    win782: wins.filter((p) => p > 700 && p < 850).length,
  };
}

function scaleRisk(trades: Trade[], factor: number): Trade[] {
  return trades.map((t) => ({ ...t, pnl: Math.round(t.pnl * factor * 100) / 100 }));
}

function maxLossStreak(pnls: number[]): number {
  let max = 0;
  let cur = 0;
  for (const p of pnls) {
    if (p < -50) {
      cur++;
      max = Math.max(max, cur);
    } else cur = 0;
  }
  return max;
}

function rollingBustPaths(trades: Trade[], dd = 2000): { worst3Loss: number; daysToRecover2k: number | null } {
  const pnls = trades.map((t) => t.pnl);
  let eq = 0;
  let peak = 0;
  let worst3 = 0;
  let streak = 0;
  let streakSum = 0;
  for (const p of pnls) {
    if (p < -50) {
      streak++;
      streakSum += p;
      if (streak === 3) worst3 = Math.min(worst3, streakSum);
    } else {
      streak = 0;
      streakSum = 0;
    }
    eq += p;
    peak = Math.max(peak, eq);
    if (peak - eq >= dd) break;
  }
  return { worst3Loss: Math.round(worst3), daysToRecover2k: null };
}

function filterFrom(trades: Trade[], date: string) {
  return trades.filter((t) => t.date >= date);
}

function filterLossCap(trades: Trade[], capUsd: number) {
  return trades.filter((t) => t.pnl >= -capUsd);
}

function filterWinMin(trades: Trade[], minUsd: number) {
  return trades.filter((t) => t.pnl < 0 || t.pnl >= minUsd);
}

function monthlyBreakdown(trades: Trade[]) {
  const byM = new Map<string, { n: number; net: number; w: number; l: number }>();
  for (const t of trades) {
    const m = t.date.slice(0, 7);
    const row = byM.get(m) ?? { n: 0, net: 0, w: 0, l: 0 };
    row.n++;
    row.net += t.pnl;
    if (t.pnl > 50) row.w++;
    if (t.pnl < -50) row.l++;
    byM.set(m, row);
  }
  return [...byM.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, r]) => ({ month: m, ...r, net: Math.round(r.net) }));
}

function main() {
  const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  const all: Trade[] = report.tradeList;

  const pnls = all.map((t) => t.pnl);
  const dates = all.map((t) => t.date);

  console.log("=== BASELINE ===");
  console.log(stats(all));
  console.log("maxLossStreak:", maxLossStreak(pnls));
  console.log("MC:", mc(pnls, dates));

  console.log("\n=== RISK SCALING (same trades, scaled P&L) ===");
  for (const f of [1, 0.75, 0.5, 0.4]) {
    const scaled = scaleRisk(all, f);
    const s = stats(scaled);
    const m = mc(
      scaled.map((t) => t.pnl),
      dates
    );
    console.log({ riskUsd: Math.round(800 * f), ...s, mc: m });
  }

  console.log("\n=== DATE REGIME FILTERS ===");
  for (const from of ["2025-10-01", "2025-05-28", "2026-01-01"]) {
    const sub = filterFrom(all, from);
    const s = stats(sub);
    const m = mc(
      sub.map((t) => t.pnl),
      sub.map((t) => t.date)
    );
    console.log({ from, ...s, mc: m });
  }

  console.log("\n=== TAIL LOSS EXCLUSION (what if wide stops were skipped?) ===");
  for (const cap of [700, 800, 900]) {
    const sub = filterLossCap(all, cap);
    const removed = all.length - sub.length;
    const s = stats(sub);
    const m = mc(
      sub.map((t) => t.pnl),
      sub.map((t) => t.date)
    );
    console.log({ maxLossUsd: cap, removed, ...s, mc: m });
  }

  console.log("\n=== WIN SIZE TIERS (position sizing artifact) ===");
  const tiers = [
    { label: "~$391 (wide stop / small size)", min: 350, max: 430 },
    { label: "~$547–626", min: 450, max: 650 },
    { label: "~$782–860 (full $800 risk wins)", min: 700, max: 900 },
    { label: "~$1k+ (multi-lot / tight stop)", min: 1000, max: 99999 },
  ];
  for (const tier of tiers) {
    const n = all.filter((t) => t.pnl >= tier.min && t.pnl <= tier.max).length;
    console.log(tier.label, n);
  }

  console.log("\n=== MONTHLY NET (find bleed months) ===");
  const months = monthlyBreakdown(all);
  const bleed = months.filter((m) => m.net < -1500);
  const hot = months.filter((m) => m.net > 2000);
  console.log("worst months:", bleed.slice(0, 8));
  console.log("best months:", hot.slice(-6));

  console.log("\n=== CONSECUTIVE LOSS CLUSTERS ===");
  let streak = 0;
  let streakStart = "";
  const clusters: { start: string; end: string; n: number; sum: number }[] = [];
  for (const t of all) {
    if (t.pnl < -50) {
      if (streak === 0) streakStart = t.date;
      streak++;
    } else {
      if (streak >= 3) {
        const slice = all.filter((x) => x.date >= streakStart && x.date <= t.date);
        const lossTrades = slice.filter((x) => x.pnl < -50);
        clusters.push({
          start: streakStart,
          end: lossTrades[lossTrades.length - 1]?.date ?? streakStart,
          n: streak,
          sum: Math.round(lossTrades.reduce((s, x) => s + x.pnl, 0)),
        });
      }
      streak = 0;
    }
  }
  console.log(clusters.sort((a, b) => a.sum - b.sum).slice(0, 6));

  console.log("\n=== COMBO VARIANTS (scaled / proxy filters) ===");
  const combos: { label: string; trades: Trade[] }[] = [
    { label: "A control ($800, all trades)", trades: all },
    { label: "B $600 risk (scale 0.75)", trades: scaleRisk(all, 0.75) },
    { label: "C max stop proxy: skip loss > $750", trades: filterLossCap(all, 750) },
    { label: "D B+C: $600 + skip loss>$750", trades: scaleRisk(filterLossCap(all, 750), 0.75) },
    { label: "E max stop proxy 60pt (~$600 loss cap)", trades: filterLossCap(all, 600) },
    { label: "F $600 + max stop 60pt proxy", trades: scaleRisk(filterLossCap(all, 600), 0.75) },
  ];
  for (const c of combos) {
    const s = stats(c.trades);
    const m = mc(
      c.trades.map((t) => t.pnl),
      c.trades.map((t) => t.date)
    );
    console.log(c.label, { ...s, mc: m });
  }
}

main();
