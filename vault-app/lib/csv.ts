/**
 * Parse a TradingView Strategy Tester "List of trades" CSV export.
 * Pairs Entry/Exit rows per trade number; uses the Exit row for date and P&L.
 */
export interface ParsedTrade {
  num: number;
  date: string;
  pnl: number;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function parseTvCsv(text: string): ParsedTrade[] {
  const lines = stripBom(text).split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]);
  const iNum = header.indexOf("Trade number");
  const iType = header.indexOf("Type");
  const iDate = header.indexOf("Date and time");
  const iPnl = header.findIndex((h) => h.startsWith("Net PnL"));
  if (iNum < 0 || iType < 0 || iPnl < 0) return [];

  const pending = new Map<number, { date: string }>();
  const trades: ParsedTrade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const num = parseInt(cols[iNum], 10);
    if (!Number.isFinite(num)) continue;
    const type = cols[iType] ?? "";

    if (type.startsWith("Entry")) {
      pending.set(num, {
        date: iDate >= 0 ? (cols[iDate] || "").split(" ")[0] : "",
      });
    } else if (type.startsWith("Exit")) {
      const pnl = parseFloat(cols[iPnl]);
      if (!Number.isFinite(pnl)) continue;
      const exitDate = iDate >= 0 ? (cols[iDate] || "").split(" ")[0] : "";
      const entry = pending.get(num);
      pending.delete(num);
      trades.push({
        num,
        date: exitDate || entry?.date || "",
        pnl,
      });
    }
  }

  return trades.sort((a, b) => a.num - b.num);
}

/** Dedupe key: same exit day + same P&L = likely duplicate across overlapping exports. */
export function tradeDedupeKey(t: ParsedTrade): string {
  return `${t.date}|${t.pnl.toFixed(2)}`;
}

/** Merge multiple TV exports chronologically; drops duplicate date+pnl rows. */
export function mergeTvCsvs(texts: string[]): ParsedTrade[] {
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
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);
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
