/**
 * One-off verification script — run: npx tsx scripts/verify-lab-logic.ts
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { mergeTvCsvs, parseTvCsv, tradesPerWeek } from "../vault-app/lib/csv";
import { runMonteCarlo } from "../vault-app/lib/monte-carlo";
import { ALL_SEED_TRADES } from "../vault-app/lib/prb-data";
import { ruleById } from "../vault-app/lib/prop-firms";

const DL = "C:/Users/Admin/Downloads";
const files = readdirSync(DL)
  .filter((f) => f.startsWith("PRB_v1") && f.endsWith(".csv"))
  .sort((a, b) => a.localeCompare(b));

function span(trades: { date: string }[]) {
  const d = trades.map((t) => t.date).filter(Boolean).sort();
  return d.length ? `${d[0]} → ${d[d.length - 1]}` : "no dates";
}

function summarize(label: string, parsed: ReturnType<typeof parseTvCsv>) {
  const net = parsed.reduce((s, t) => s + t.pnl, 0);
  const wins = parsed.filter((t) => t.pnl > 50).length;
  const losses = parsed.filter((t) => t.pnl < -50).length;
  const tpw = tradesPerWeek(parsed.map((t) => t.date));
  console.log(
    `${label}: n=${parsed.length} net=$${net.toFixed(0)} W/L=${wins}/${losses} tpw=${tpw.toFixed(2)} span=${span(parsed)}`
  );
}

console.log(`Found ${files.length} CSV files in Downloads`);
const perFile: Record<string, ReturnType<typeof parseTvCsv>> = {};
for (const f of files) {
  const text = readFileSync(join(DL, f), "utf-8");
  const parsed = parseTvCsv(text);
  perFile[f] = parsed;
  if (parsed.length > 0) summarize(f.slice(-12), parsed);
}

// Batch merge like lab (files 20-29 = likely latest year chunks)
const batch = files.filter((f) => /\((2[0-9])\)/.test(f));
// Also test full year merge (files 1-12 + 20-29 style)
const allTexts = files.map((f) => readFileSync(join(DL, f), "utf-8"));
const mergedAll = mergeTvCsvs(allTexts);
console.log("\n=== Batch merge (20-29) ===");
const batchTexts = batch.map((f) => readFileSync(join(DL, f), "utf-8"));
summarize("MERGED 20-29", mergeTvCsvs(batchTexts));

console.log("\n=== Full merge (all 30 files) ===");
summarize("MERGED ALL", mergedAll);
const merged = mergedAll;

// Check chronological order
let orderOk = true;
for (let i = 1; i < merged.length; i++) {
  if (merged[i].date < merged[i - 1].date) {
    console.log(`ORDER BUG at ${i}: ${merged[i - 1].date} then ${merged[i].date}`);
    orderOk = false;
  }
}
console.log(`Chronological order: ${orderOk ? "OK" : "BROKEN"}`);

// Duplicate detection (same date + pnl)
const keys = new Map<string, number>();
let dupes = 0;
for (const t of merged) {
  const k = `${t.date}|${t.pnl.toFixed(2)}`;
  keys.set(k, (keys.get(k) ?? 0) + 1);
  if (keys.get(k)! > 1) dupes++;
}
console.log(`Potential duplicate trades (date+pnl): ${dupes}`);

// Compare exit-date parsing: old first-row vs proper exit row
function parseExitOnly(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",");
  const iNum = header.indexOf("Trade number");
  const iType = header.indexOf("Type");
  const iDate = header.indexOf("Date and time");
  const iPnl = header.findIndex((h) => h.startsWith("Net PnL"));
  const out: { date: string; pnl: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (!cols[iType]?.startsWith("Exit")) continue;
    out.push({
      date: cols[iDate]?.split(" ")[0] ?? "",
      pnl: parseFloat(cols[iPnl]),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

const sample = readFileSync(join(DL, files.find((f) => f.includes("(23)"))!), "utf-8");
const current = parseTvCsv(sample);
const proper = parseExitOnly(sample);
const dateMismatches = current.filter((t, i) => proper[i] && t.date !== proper[i].date).length;
console.log(`\nFile 23 date mismatches (current vs exit-only): ${dateMismatches}/${current.length}`);

// MC outcome mutual exclusivity check
const rule = ruleById("tpt50")!;
const pnls = merged.map((t) => t.pnl);
const dates = merged.map((t) => t.date);
const mc = runMonteCarlo({
  trades: pnls,
  dates,
  sims: 5000,
  maxTrades: 80,
  passAt: rule.passAt,
  trailingDD: rule.trailingDD,
  fees: { evalFee: 170, activationFee: 130, monthlyFee: 180, payoutBuffer: 1000 },
});

const histSum = mc.outcomeHist.reduce((s, h) => s + h.count, 0);
const rateSum = mc.passRate + mc.bustRate + mc.timeoutRate;
console.log("\n=== Monte Carlo (merged year, TPT) ===");
console.log(`Pass ${(mc.passRate * 100).toFixed(1)}% · Bust ${(mc.bustRate * 100).toFixed(1)}% · Open ${(mc.timeoutRate * 100).toFixed(1)}%`);
console.log(`Rates sum to ${(rateSum * 100).toFixed(1)}% (should be 100%)`);
console.log(`Outcome hist sum ${histSum} vs sims ${mc.sims}`);
console.log(`PASS+BUST > sims? ${mc.outcomeHist[0] && mc.outcomeHist[1] && mc.outcomeHist[0].count + mc.outcomeHist[1].count > mc.sims ? "YES — BUG" : "no"}`);
console.log(`Trades to pass p50: ${mc.tradesToPassP50} · weeks p50: ${mc.economics.weeksToPassP50}`);
console.log(`Payout weeks p50: ${mc.economics.weeksToPayoutP50} · expected accounts: ${mc.economics.expectedAccounts}`);

// Seed baseline
const seedMc = runMonteCarlo({
  trades: ALL_SEED_TRADES.map((t) => t.pnl),
  dates: ALL_SEED_TRADES.map((t) => t.date),
  sims: 5000,
  maxTrades: 80,
  passAt: rule.passAt,
  trailingDD: rule.trailingDD,
  fees: { evalFee: 170, activationFee: 130, monthlyFee: 180, payoutBuffer: 1000 },
});
console.log("\n=== Seed baseline (37 trades) ===");
console.log(`Pass ${(seedMc.passRate * 100).toFixed(1)}% · Bust ${(seedMc.bustRate * 100).toFixed(1)}%`);
console.log(`PASS+BUST > sims? ${seedMc.outcomeHist.reduce((s,h)=>s+h.count,0) === seedMc.sims ? "no (mutually exclusive)" : "YES — BUG"}`);
console.log(`Rates sum: ${((seedMc.passRate + seedMc.bustRate + seedMc.timeoutRate)*100).toFixed(1)}%`);
