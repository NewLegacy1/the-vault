/**
 * Parse a TradingView Strategy Tester "List of trades" CSV export.
 * Pairs Entry/Exit rows per trade number; enriches from both rows when available.
 */
export interface ParsedTrade {
  num: number;
  date: string;
  pnl: number;
  /** Entry id from Signal column — e.g. Long_AP, Short_H */
  signal?: string;
  /** A+, A, or H (half) parsed from signal */
  tier?: string;
  direction?: "long" | "short";
  qty?: number;
  entryPrice?: number;
  exitPrice?: number;
  mfeUsd?: number;
  maeUsd?: number;
  durationBars?: number;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function colIndex(header: string[], names: string[]): number {
  for (const name of names) {
    const i = header.findIndex((h) => h === name || h.startsWith(name));
    if (i >= 0) return i;
  }
  return -1;
}

function parseFloatCol(cols: string[], i: number): number | undefined {
  if (i < 0) return undefined;
  const v = parseFloat(cols[i]);
  return Number.isFinite(v) ? v : undefined;
}

/** Macro v1.4+ entry ids: Long_AP, Long_A, Long_H, Short_AP, … */
export function parseTierFromSignal(signal?: string): string | undefined {
  if (!signal) return undefined;
  if (signal.endsWith("_AP")) return "A+";
  if (signal.endsWith("_H")) return "H";
  if (signal.endsWith("_A")) return "A";
  return undefined;
}

export function parseTvCsv(text: string): ParsedTrade[] {
  const lines = stripBom(text).split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]);
  const iNum = header.indexOf("Trade number");
  const iType = header.indexOf("Type");
  const iDate = header.indexOf("Date and time");
  const iSignal = header.indexOf("Signal");
  const iPnl = colIndex(header, ["Net PnL"]);
  const iQty = colIndex(header, ["Size (qty)"]);
  const iPrice = colIndex(header, ["Price USD"]);
  const iMfe = colIndex(header, ["Favorable excursion USD"]);
  const iMae = colIndex(header, ["Adverse excursion USD"]);
  const iDur = colIndex(header, ["Duration (bars)"]);
  if (iNum < 0 || iType < 0 || iPnl < 0) return [];

  const pending = new Map<
    number,
    Partial<{
      date: string;
      signal?: string;
      qty?: number;
      entryPrice?: number;
      exitDate: string;
      pnl: number;
      exitPrice?: number;
      mfeUsd?: number;
      maeUsd?: number;
      durationBars?: number;
      exitType: string;
    }>
  >();
  const trades: ParsedTrade[] = [];

  const flush = (num: number) => {
    const row = pending.get(num);
    if (!row || row.pnl === undefined || !row.exitType) return;
    pending.delete(num);
    const signal = row.signal;
    const dir = row.exitType.toLowerCase().includes("long")
      ? "long"
      : row.exitType.toLowerCase().includes("short")
        ? "short"
        : signal?.startsWith("Long")
          ? "long"
          : signal?.startsWith("Short")
            ? "short"
            : undefined;
    trades.push({
      num,
      date: row.exitDate || row.date || "",
      pnl: row.pnl,
      signal,
      tier: parseTierFromSignal(signal),
      direction: dir,
      qty: row.qty,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice,
      mfeUsd: row.mfeUsd,
      maeUsd: row.maeUsd,
      durationBars: row.durationBars,
    });
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const num = parseInt(cols[iNum], 10);
    if (!Number.isFinite(num)) continue;
    const type = cols[iType] ?? "";
    const row = pending.get(num) ?? {};

    if (type.startsWith("Entry")) {
      row.date = iDate >= 0 ? (cols[iDate] || "").split(" ")[0] : "";
      row.signal = iSignal >= 0 ? cols[iSignal] : undefined;
      row.qty = parseFloatCol(cols, iQty);
      row.entryPrice = parseFloatCol(cols, iPrice);
      pending.set(num, row);
      if (row.pnl !== undefined) flush(num);
    } else if (type.startsWith("Exit")) {
      const pnl = parseFloat(cols[iPnl]);
      if (!Number.isFinite(pnl)) continue;
      row.exitDate = iDate >= 0 ? (cols[iDate] || "").split(" ")[0] : "";
      row.pnl = pnl;
      row.exitType = type;
      row.exitPrice = parseFloatCol(cols, iPrice);
      row.mfeUsd = parseFloatCol(cols, iMfe);
      row.maeUsd = parseFloatCol(cols, iMae);
      row.durationBars = parseFloatCol(cols, iDur);
      pending.set(num, row);
      if (row.signal !== undefined || row.entryPrice !== undefined) flush(num);
    }
  }

  for (const num of pending.keys()) flush(num);

  return trades.sort((a, b) => a.num - b.num);
}

/** Dedupe key: same exit day + same P&L = likely duplicate across overlapping exports. */
export function tradeDedupeKey(t: ParsedTrade): string {
  return `${t.date}|${t.pnl.toFixed(2)}`;
}

/** One trade per calendar day — PRB max 1/day; resolves overlapping chunk exports. */
export function dedupeOnePerDay(
  trades: ParsedTrade[],
  seed?: { date: string; pnl: number }[]
): ParsedTrade[] {
  const seedByDate = new Map((seed ?? []).map((s) => [s.date, s.pnl]));
  const byDate = new Map<string, ParsedTrade[]>();
  for (const t of trades) {
    if (!t.date) continue;
    const list = byDate.get(t.date) ?? [];
    list.push(t);
    byDate.set(t.date, list);
  }

  const out: ParsedTrade[] = [];
  for (const [, list] of byDate) {
    if (list.length === 1) {
      out.push(list[0]);
      continue;
    }
    const seedPnl = seedByDate.get(list[0].date);
    if (seedPnl !== undefined) {
      const hit = list.find((t) => Math.abs(t.pnl - seedPnl) < 0.02);
      if (hit) {
        out.push(hit);
        continue;
      }
    }
    const sorted = [...list].sort((a, b) => {
      const score = (p: number) => {
        if (p > 1200) return 3;
        if (p < -200) return 2;
        return 1;
      };
      return score(b.pnl) - score(a.pnl) || Math.abs(b.pnl) - Math.abs(a.pnl);
    });
    out.push(sorted[0]);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);
}

/** Merge multiple TV exports chronologically; drops duplicate date+pnl rows. */
export function mergeTvCsvs(
  texts: string[],
  options?: { onePerDay?: boolean; seed?: { date: string; pnl: number }[] }
): ParsedTrade[] {
  const all: ParsedTrade[] = [];
  for (const text of texts) {
    all.push(...parseTvCsv(text));
  }
  const seen = new Set<string>();
  const out: ParsedTrade[] = [];
  for (const t of all) {
    if (!t.date) continue;
    const k = tradeDedupeKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  const sorted = out.sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);
  if (options?.onePerDay) {
    return dedupeOnePerDay(sorted, options.seed);
  }
  return sorted;
}

/** CSV header for enriched macro ledger exports. */
export const ENRICHED_TRADE_CSV_HEADER =
  "date,pnl_usd,trade_num,tier,signal,direction,qty,mfe_usd,mae_usd,duration_bars,entry_price,exit_price";

export function enrichedTradeToCsvRow(t: ParsedTrade): string {
  const f = (v: number | undefined) => (v === undefined ? "" : v.toFixed(2));
  return [
    t.date,
    t.pnl.toFixed(2),
    t.num,
    t.tier ?? "",
    t.signal ?? "",
    t.direction ?? "",
    t.qty ?? "",
    f(t.mfeUsd),
    f(t.maeUsd),
    t.durationBars ?? "",
    f(t.entryPrice),
    f(t.exitPrice),
  ].join(",");
}

/** Trades per calendar week inferred from date span; defaults to 5 (~1/day) if unknown. */
export function tradesPerWeek(dates: string[]): number {
  const ts = dates
    .map((d) => Date.parse(d))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (ts.length < 2) return 5;
  const weeks = (ts[ts.length - 1] - ts[0]) / (7 * 24 * 3600 * 1000);
  return weeks > 0.25 ? dates.length / weeks : 5;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
