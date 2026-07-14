/**
 * Post-process a Hybrid Sleeve (or any) TV/ledger CSV against the F7 calendar.
 * Deep Backtest cannot toggle red-folder days — do the split here afterward.
 *
 * Usage:
 *   npx tsx scripts/filter-hybrid-news.ts path/to/Hybrid_export.csv
 *   npx tsx scripts/filter-hybrid-news.ts   # defaults to newest hybrid-* or prompts matrix H0
 */
import fs from "fs";
import path from "path";
import { parseLabLedger, type ParsedTrade } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { profileCalendar, type CalendarEvent } from "../lib/economic-calendar";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const CAL = path.join(__dirname, "../data/calendar-bundle.json");

function isMacroSignal(signal?: string): boolean {
  if (!signal) return false;
  const s = signal.toUpperCase();
  return (
    s.includes("MAC") ||
    s.endsWith("_A") ||
    s.endsWith("_AP") ||
    s.endsWith("_H") ||
    s === "LONG_A" ||
    s === "SHORT_A" ||
    /^LONG_A\b/.test(s) ||
    /^SHORT_A\b/.test(s)
  );
}

function isPrbSignal(signal?: string): boolean {
  if (!signal) return false;
  const s = signal.toUpperCase();
  return s.includes("PRB") || s.includes("RB");
}

function loadTrades(filePath: string): ParsedTrade[] {
  const text = fs.readFileSync(filePath, "utf8");
  return parseLabLedger(text).map((t) => ({
    ...t,
    date: normalizeTradeDate(t.date),
  }));
}

function summarize(
  label: string,
  trades: ParsedTrade[],
  profiles: ReturnType<typeof profileCalendar>
) {
  let redN = 0,
    redNet = 0,
    quietN = 0,
    quietNet = 0;
  for (const t of trades) {
    const red = profiles.get(t.date)?.tags.includes("red-folder") ?? false;
    if (red) {
      redN++;
      redNet += t.pnl;
    } else {
      quietN++;
      quietNet += t.pnl;
    }
  }
  console.log(
    `${label}: n=${trades.length} | RED ${redN} net $${Math.round(redNet)} | QUIET ${quietN} net $${Math.round(quietNet)}`
  );
}

function writeLedger(name: string, trades: ParsedTrade[]) {
  const header = "date,pnl_usd,trade_num,tier,signal";
  const body = trades.map((t, i) => {
    const signal = t.signal || "UNK";
    const tier = t.tier || (isMacroSignal(signal) ? "A" : "PRB");
    return `${t.date},${t.pnl.toFixed(2)},${i + 1},${tier},${signal}`;
  });
  const out = path.join(MATRIX, name);
  fs.writeFileSync(out, [header, ...body].join("\n"), "utf8");
  const net = trades.reduce((s, t) => s + t.pnl, 0);
  console.log(`  → ${name}: n=${trades.length} net $${Math.round(net)}`);
}

function main() {
  const arg = process.argv[2];
  const src = arg
    ? path.resolve(arg)
    : path.join(MATRIX, "hybrid-h0a.csv");
  if (!fs.existsSync(src)) {
    console.error("Missing file:", src);
    console.error("Pass your Deep Backtest CSV path, e.g.:");
    console.error('  npx tsx scripts/filter-hybrid-news.ts "$HOME/Downloads/Hybrid_Sleeve*.csv"');
    process.exit(1);
  }

  const cal = JSON.parse(fs.readFileSync(CAL, "utf8")) as { events: CalendarEvent[] };
  const profiles = profileCalendar(cal.events);
  const trades = loadTrades(src);

  console.log(`\nSource: ${src} (${trades.length} trades)\n`);

  summarize("ALL", trades, profiles);

  const macTagged = trades.filter((t) => isMacroSignal(t.signal));
  const prbTagged = trades.filter((t) => isPrbSignal(t.signal));

  if (macTagged.length || prbTagged.length) {
    summarize("  Macro engine", macTagged, profiles);
    summarize("  PRB engine", prbTagged.length ? prbTagged : trades.filter((t) => !isMacroSignal(t.signal)), profiles);
  } else {
    console.log("(No MAC/PRB Signal tags — reporting ALL only. Hybrid_Sleeve_v0 exports Long_A / Long_PRB.)");
  }

  // H1-style: drop Macro legs on red-folder days; keep all PRB
  const quietMacroBook = trades.filter((t) => {
    if (!isMacroSignal(t.signal)) return true;
    return !(profiles.get(t.date)?.tags.includes("red-folder") ?? false);
  });
  const dropped = trades.filter(
    (t) =>
      isMacroSignal(t.signal) &&
      (profiles.get(t.date)?.tags.includes("red-folder") ?? false)
  );

  console.log(`\nH1 filter drops ${dropped.length} Macro red-folder trade(s):`);
  for (const t of dropped) {
    console.log(`  ${t.date} $${Math.round(t.pnl)} ${t.signal}`);
  }

  const base = path.basename(src, path.extname(src)).replace(/[^a-zA-Z0-9_-]+/g, "_");
  writeLedger(`${base}-news-split-all.csv`, trades);
  writeLedger(`${base}-h1-quiet-macro.csv`, quietMacroBook);

  console.log(`\nF7 Lab: upload the Deep Backtest CSV → NewsDay panel also splits red vs quiet.`);
  console.log(`MC H1 candidate: matrix/${base}-h1-quiet-macro.csv → Lab preset H1a / H1b\n`);
}

main();
