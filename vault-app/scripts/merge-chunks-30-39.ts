import fs from "fs";
import path from "path";
import { parseTvCsv, mergeTvCsvs, dedupeOnePerDay } from "../lib/csv";
import { ALL_SEED_TRADES } from "../lib/prb-data";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";

const CHUNK_IDS = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
const dl = "C:/Users/Admin/Downloads";
const vaultDir = path.join(__dirname, "../data/tv-exports/prb-chunks-30-39");

fs.mkdirSync(vaultDir, { recursive: true });

const files = CHUNK_IDS.map((n) => {
  const name = `PRB_v1_CME_MINI_MNQ1!_2026-07-13 (${n}).csv`;
  const src = path.join(dl, name);
  const dest = path.join(vaultDir, name);
  fs.copyFileSync(src, dest);
  return { n, name, src, dest };
});

const texts = files.map((f) => fs.readFileSync(f.src, "utf8"));
const raw = texts.reduce((n, t) => n + parseTvCsv(t).length, 0);
const afterKey = mergeTvCsvs(texts);
const merged = dedupeOnePerDay(afterKey, ALL_SEED_TRADES);

const trades = merged.map((t) => t.pnl);
const dates = merged.map((t) => t.date);
const rule = ruleById("tpt50")!;
const mc = runMonteCarlo({
  trades,
  dates,
  sims: 2000,
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

const seedMatch = ALL_SEED_TRADES.filter((s) =>
  merged.some((m) => m.date === s.date && Math.abs(m.pnl - s.pnl) < 0.02)
).length;

const outCsv = [
  "date,pnl_usd,trade_num",
  ...merged.map((t) => `${t.date},${t.pnl.toFixed(2)},${t.num}`),
].join("\n");
fs.writeFileSync(path.join(__dirname, "../data/tv-exports/prb-chunks-30-39-merged.csv"), outCsv);

console.log(
  JSON.stringify(
    {
      chunks: CHUNK_IDS,
      copiedTo: vaultDir,
      perFile: files.map((f, i) => {
        const p = parseTvCsv(texts[i]);
        const d = p.map((t) => t.date).filter(Boolean);
        return {
          file: f.name,
          trades: p.length,
          span: d.length >= 2 ? `${d[0]} → ${d[d.length - 1]}` : "—",
          net: Math.round(p.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
        };
      }),
      rawRows: raw,
      afterDatePnlDedupe: afterKey.length,
      mergedTrades: merged.length,
      span: dates.length >= 2 ? `${dates[0]} → ${dates[dates.length - 1]}` : "—",
      wins: trades.filter((p) => p > 50).length,
      losses: trades.filter((p) => p < -50).length,
      netPnl: Math.round(trades.reduce((s, p) => s + p, 0) * 100) / 100,
      seedMatch: `${seedMatch}/${ALL_SEED_TRADES.length}`,
      passRatePct: Math.round(mc.passRate * 1000) / 10,
      bustRatePct: Math.round(mc.bustRate * 1000) / 10,
    },
    null,
    2
  )
);
