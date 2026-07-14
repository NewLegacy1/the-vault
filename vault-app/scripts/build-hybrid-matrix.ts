/**
 * Build H-series portfolio ledgers from matrix PRB + Macro A CSVs + calendar.
 * Usage: npx tsx scripts/build-hybrid-matrix.ts
 */
import fs from "fs";
import path from "path";
import { parseTvCsv, type ParsedTrade } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { profileCalendar, type CalendarEvent } from "../lib/economic-calendar";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const CAL = path.join(__dirname, "../data/calendar-bundle.json");

type Row = { date: string; pnl: number; signal: string; tier?: string };

function loadAny(file: string): Row[] {
  const p = path.join(MATRIX, file);
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  const text = fs.readFileSync(p, "utf8");
  if (text.startsWith("date,") || text.startsWith("\ufeffdate,")) {
    return text
      .replace(/^\ufeff/, "")
      .split(/\r?\n/)
      .slice(1)
      .filter((l) => l.trim())
      .map((l) => {
        const c = l.split(",");
        return {
          date: normalizeTradeDate(c[0]),
          pnl: parseFloat(c[1]),
          signal: c[4] || c[3] || "LEDGER",
          tier: c[3] || undefined,
        };
      })
      .filter((t) => Number.isFinite(t.pnl) && t.date);
  }
  return parseTvCsv(text).map((t: ParsedTrade) => ({
    date: normalizeTradeDate(t.date),
    pnl: t.pnl,
    signal: t.signal || "TV",
    tier: t.tier,
  }));
}

function isRedFolder(
  date: string,
  profiles: ReturnType<typeof profileCalendar>
): boolean {
  return profiles.get(date)?.tags.includes("red-folder") ?? false;
}

function union(
  prb: Row[],
  mac: Row[],
  opts: { quietMacroOnly: boolean; prbTag: string; macTag: string },
  profiles: ReturnType<typeof profileCalendar>
): Row[] {
  const macFiltered = opts.quietMacroOnly
    ? mac.filter((t) => !isRedFolder(t.date, profiles))
    : mac;
  const tagged = [
    ...prb.map((t) => ({ ...t, signal: `${opts.prbTag}|${t.signal}` })),
    ...macFiltered.map((t) => ({ ...t, signal: `${opts.macTag}|${t.signal}` })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return tagged;
}

function writeLedger(name: string, rows: Row[]) {
  const header = "date,pnl_usd,trade_num,tier,signal";
  const body = rows.map((r, i) => {
    const tier = r.signal.startsWith("MAC") ? r.tier || "A" : "PRB";
    return `${r.date},${r.pnl.toFixed(2)},${i + 1},${tier},${r.signal}`;
  });
  const out = path.join(MATRIX, name);
  fs.writeFileSync(out, [header, ...body].join("\n"), "utf8");
  const net = rows.reduce((s, r) => s + r.pnl, 0);
  const w = rows.filter((r) => r.pnl > 50).length;
  const l = rows.filter((r) => r.pnl < -50).length;
  console.log(
    `${name}: n=${rows.length} W/L=${w}/${l} net=$${Math.round(net)} → ${out}`
  );
}

function main() {
  const cal = JSON.parse(fs.readFileSync(CAL, "utf8")) as { events: CalendarEvent[] };
  const profiles = profileCalendar(cal.events);

  const a0a = loadAny("prb-matrix-a0a.csv");
  const d1 = loadAny("prb-matrix-d1.csv");
  const b1a = loadAny("macro-matrix-b1a.csv");

  writeLedger(
    "hybrid-h0a.csv",
    union(a0a, b1a, { quietMacroOnly: false, prbTag: "PRB", macTag: "MAC" }, profiles)
  );
  writeLedger(
    "hybrid-h0b.csv",
    union(d1, b1a, { quietMacroOnly: false, prbTag: "PRB", macTag: "MAC" }, profiles)
  );
  writeLedger(
    "hybrid-h1a.csv",
    union(a0a, b1a, { quietMacroOnly: true, prbTag: "PRB", macTag: "MACQ" }, profiles)
  );
  writeLedger(
    "hybrid-h1b.csv",
    union(d1, b1a, { quietMacroOnly: true, prbTag: "PRB", macTag: "MACQ" }, profiles)
  );

  const dropped = b1a.filter((t) => isRedFolder(t.date, profiles));
  console.log(
    `\nQuiet filter drops ${dropped.length} Macro A red-folder trade(s):`,
    dropped.map((t) => `${t.date}:$${Math.round(t.pnl)}`).join(", ") || "(none)"
  );
}

main();
