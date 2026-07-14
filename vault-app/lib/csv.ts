/**
 * Parse a TradingView Strategy Tester "List of trades" CSV export.
 * Pairs Entry/Exit rows per trade number; enriches from both rows when available.
 * Premium columns (MFE/MAE/duration/%/size value/entry time) are preserved for Lab + cohorts.
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
  /** Notional size from TV "Size (value)" */
  sizeValue?: number;
  entryPrice?: number;
  exitPrice?: number;
  /** Full "Date and time" from entry row */
  entryDatetime?: string;
  /** Full "Date and time" from exit row */
  exitDatetime?: string;
  mfeUsd?: number;
  maeUsd?: number;
  mfePct?: number;
  maePct?: number;
  returnPct?: number;
  durationBars?: number;
  cumPnlUsd?: number;
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
  const raw = (cols[i] ?? "").replace(/%/g, "").trim();
  if (!raw) return undefined;
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : undefined;
}

function parseDateOnly(datetime: string | undefined): string {
  if (!datetime) return "";
  return datetime.split(" ")[0] ?? "";
}

/** Macro v1.4+ entry ids: Long_AP, Long_A, Long_H, Short_AP, … */
export function parseTierFromSignal(signal?: string): string | undefined {
  if (!signal) return undefined;
  if (signal.endsWith("_AP")) return "A+";
  if (signal.endsWith("_H")) return "H";
  if (signal.endsWith("_A")) return "A";
  return undefined;
}

function parseEnrichedLedgerCsv(text: string): ParsedTrade[] {
  const lines = stripBom(text).split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2 || !lines[0].startsWith("date,pnl_usd")) return [];
  const header = splitCsvLine(lines[0]);
  const byName = header.length > 12;
  const idx = (name: string, fallback: number) => {
    if (!byName) return fallback;
    const i = header.indexOf(name);
    return i >= 0 ? i : fallback;
  };

  const out: ParsedTrade[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const pnl = parseFloat(cols[idx("pnl_usd", 1)]);
    const num = parseInt(cols[idx("trade_num", 2)], 10);
    if (!Number.isFinite(pnl) || !Number.isFinite(num)) continue;
    const signal = cols[idx("signal", 4)] || undefined;
    const dirRaw = cols[idx("direction", 5)];
    out.push({
      num,
      date: cols[idx("date", 0)] ?? "",
      pnl,
      tier: cols[idx("tier", 3)] || parseTierFromSignal(signal),
      signal,
      direction: dirRaw === "long" || dirRaw === "short" ? dirRaw : undefined,
      qty: parseFloatCol(cols, idx("qty", 6)),
      mfeUsd: parseFloatCol(cols, idx("mfe_usd", 7)),
      maeUsd: parseFloatCol(cols, idx("mae_usd", 8)),
      durationBars: parseFloatCol(cols, idx("duration_bars", 9)),
      entryPrice: parseFloatCol(cols, idx("entry_price", 10)),
      exitPrice: parseFloatCol(cols, idx("exit_price", 11)),
      entryDatetime: cols[idx("entry_datetime", 12)] || undefined,
      exitDatetime: cols[idx("exit_datetime", 13)] || undefined,
      returnPct: parseFloatCol(cols, idx("return_pct", 14)),
      mfePct: parseFloatCol(cols, idx("mfe_pct", 15)),
      maePct: parseFloatCol(cols, idx("mae_pct", 16)),
      sizeValue: parseFloatCol(cols, idx("size_value", 17)),
      cumPnlUsd: parseFloatCol(cols, idx("cum_pnl_usd", 18)),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);
}

/** TV list-of-trades export or vault enriched ledger CSV. */
export function parseLabLedger(text: string): ParsedTrade[] {
  const enriched = parseEnrichedLedgerCsv(text);
  if (enriched.length > 0) return enriched;
  return parseTvCsv(text);
}

export function parseTvCsv(text: string): ParsedTrade[] {
  const lines = stripBom(text).split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]);
  const iNum = header.indexOf("Trade number");
  const iType = header.indexOf("Type");
  const iDate = header.indexOf("Date and time");
  const iSignal = header.indexOf("Signal");
  const iPnl = colIndex(header, ["Net PnL USD", "Net P&L USD", "Net PnL"]);
  const iQty = colIndex(header, ["Size (qty)"]);
  const iSizeVal = colIndex(header, ["Size (value)"]);
  const iPrice = colIndex(header, ["Price USD", "Price"]);
  const iMfe = colIndex(header, ["Favorable excursion USD"]);
  const iMae = colIndex(header, ["Adverse excursion USD"]);
  const iMfePct = colIndex(header, ["Favorable excursion %"]);
  const iMaePct = colIndex(header, ["Adverse excursion %"]);
  const iRet = colIndex(header, ["Return %"]);
  const iDur = colIndex(header, ["Duration (bars)"]);
  const iCum = colIndex(header, ["Cumulative PnL USD", "Cumulative P&L USD"]);
  if (iNum < 0 || iType < 0 || iPnl < 0) return [];

  type Pending = {
    date?: string;
    entryDatetime?: string;
    signal?: string;
    qty?: number;
    sizeValue?: number;
    entryPrice?: number;
    exitDate?: string;
    exitDatetime?: string;
    pnl?: number;
    exitPrice?: number;
    mfeUsd?: number;
    maeUsd?: number;
    mfePct?: number;
    maePct?: number;
    returnPct?: number;
    durationBars?: number;
    cumPnlUsd?: number;
    exitType?: string;
  };

  const pending = new Map<number, Pending>();
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
      sizeValue: row.sizeValue,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice,
      entryDatetime: row.entryDatetime,
      exitDatetime: row.exitDatetime,
      mfeUsd: row.mfeUsd,
      maeUsd: row.maeUsd,
      mfePct: row.mfePct,
      maePct: row.maePct,
      returnPct: row.returnPct,
      durationBars: row.durationBars,
      cumPnlUsd: row.cumPnlUsd,
    });
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const num = parseInt(cols[iNum], 10);
    if (!Number.isFinite(num)) continue;
    const type = cols[iType] ?? "";
    const row = pending.get(num) ?? {};

    if (type.startsWith("Entry")) {
      const dt = iDate >= 0 ? cols[iDate] || "" : "";
      row.entryDatetime = dt || undefined;
      row.date = parseDateOnly(dt);
      row.signal = iSignal >= 0 ? cols[iSignal] : undefined;
      row.qty = parseFloatCol(cols, iQty);
      row.sizeValue = parseFloatCol(cols, iSizeVal);
      row.entryPrice = parseFloatCol(cols, iPrice);
      // Premium sometimes duplicates excursion/duration on entry rows too
      if (row.mfeUsd === undefined) row.mfeUsd = parseFloatCol(cols, iMfe);
      if (row.maeUsd === undefined) row.maeUsd = parseFloatCol(cols, iMae);
      if (row.durationBars === undefined) row.durationBars = parseFloatCol(cols, iDur);
      pending.set(num, row);
      if (row.pnl !== undefined) flush(num);
    } else if (type.startsWith("Exit")) {
      const pnl = parseFloat(cols[iPnl]);
      if (!Number.isFinite(pnl)) continue;
      const dt = iDate >= 0 ? cols[iDate] || "" : "";
      row.exitDatetime = dt || undefined;
      row.exitDate = parseDateOnly(dt);
      row.pnl = pnl;
      row.exitType = type;
      row.exitPrice = parseFloatCol(cols, iPrice);
      row.mfeUsd = parseFloatCol(cols, iMfe) ?? row.mfeUsd;
      row.maeUsd = parseFloatCol(cols, iMae) ?? row.maeUsd;
      row.mfePct = parseFloatCol(cols, iMfePct);
      row.maePct = parseFloatCol(cols, iMaePct);
      row.returnPct = parseFloatCol(cols, iRet);
      row.durationBars = parseFloatCol(cols, iDur) ?? row.durationBars;
      row.cumPnlUsd = parseFloatCol(cols, iCum);
      if (row.qty === undefined) row.qty = parseFloatCol(cols, iQty);
      if (row.sizeValue === undefined) row.sizeValue = parseFloatCol(cols, iSizeVal);
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
      out.push(list[0]!);
      continue;
    }
    const seedPnl = seedByDate.get(list[0]!.date);
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
    out.push(sorted[0]!);
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
    all.push(...parseLabLedger(text));
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

/** CSV header for enriched vault ledger exports (superset of Premium fields). */
export const ENRICHED_TRADE_CSV_HEADER =
  "date,pnl_usd,trade_num,tier,signal,direction,qty,mfe_usd,mae_usd,duration_bars,entry_price,exit_price,entry_datetime,exit_datetime,return_pct,mfe_pct,mae_pct,size_value,cum_pnl_usd";

export function enrichedTradeToCsvRow(t: ParsedTrade): string {
  const f = (v: number | undefined) => (v === undefined ? "" : Number.isInteger(v) ? String(v) : v.toFixed(2));
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
    t.entryDatetime ?? "",
    t.exitDatetime ?? "",
    f(t.returnPct),
    f(t.mfePct),
    f(t.maePct),
    f(t.sizeValue),
    f(t.cumPnlUsd),
  ].join(",");
}

/** Trades per calendar week inferred from date span; defaults to 5 (~1/day) if unknown. */
export function tradesPerWeek(dates: string[]): number {
  const ts = dates
    .map((d) => Date.parse(d))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (ts.length < 2) return 5;
  const weeks = (ts[ts.length - 1]! - ts[0]!) / (7 * 24 * 3600 * 1000);
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
