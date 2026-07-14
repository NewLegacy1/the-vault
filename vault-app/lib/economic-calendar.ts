/** Forex Factory–style economic calendar rows + SOP day tags (Powell §5, §8). */

import { normalizeTradeDate } from "./normalize-date";

export type Impact = "high" | "medium" | "low" | "holiday" | "unknown";

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM NY or empty
  currency: string;
  impact: Impact;
  title: string;
  actual: string;
  forecast: string;
  previous: string;
}

export type SopDayTag =
  | "quiet"
  | "red-folder"
  | "cpi-nfp-ppi"
  | "fomc"
  | "mixed-prints"
  | "one-sided-beat"
  | "data-hl-ok"
  | "trend-day-risk"
  | "skip-fade";

export interface DayNewsProfile {
  date: string;
  events: CalendarEvent[];
  tags: SopDayTag[];
  /** Plain-language SOP guidance for replay review. */
  guidance: string;
  redCount: number;
  cpiNfpPpi: boolean;
}

const CPI_NFP_RE =
  /consumer price|cpi|ppi|producer price|non.?farm|nfp|employment situation|jobless claims/i;
const FOMC_RE = /fomc|fed (interest|funds|rate)|interest rate decision|powell speaks/i;
const DATA_830_RE = /consumer price|cpi|ppi|producer price|non.?farm|nfp|retail sales|gdp|ism manufacturing|ism services/i;

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function normImpact(raw: string): Impact {
  const s = raw.toLowerCase();
  if (s.includes("high") || s === "red" || s === "3") return "high";
  if (s.includes("medium") || s === "orange" || s === "2") return "medium";
  if (s.includes("low") || s === "yellow" || s === "1") return "low";
  if (s.includes("non-economic") || s.includes("holiday") || s.includes("bank")) return "holiday";
  return "unknown";
}

function parseNyDateTime(raw: string): { date: string; time: string } {
  const s = raw.trim();
  if (!s) return { date: "", time: "" };
  if (s.includes("T")) {
    const d = new Date(s);
    if (Number.isFinite(d.getTime())) {
      const date = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      const time = d.toLocaleTimeString("en-GB", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { date, time };
    }
    return { date: s.slice(0, 10), time: s.length > 16 ? s.slice(11, 16) : "" };
  }
  return { date: normDatePlain(s), time: "" };
}

function normDatePlain(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (mdy) {
    const y = mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3];
    return `${y}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  }
  const d = new Date(s);
  if (Number.isFinite(d.getTime())) return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return s;
}

function parseNum(s: string): number | null {
  const t = s.replace(/[%$,]/g, "").trim();
  if (!t || t === "—" || t === "-") return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** Surprise direction for USD macro: actual > forecast often bad for NQ (SOP §8). */
function usdSurpriseBadForNq(actual: string, forecast: string): "beat" | "miss" | "inline" | "na" {
  const a = parseNum(actual);
  const f = parseNum(forecast);
  if (a === null || f === null || f === 0) return "na";
  const pct = Math.abs((a - f) / f);
  if (pct < 0.05) return "inline";
  return a > f ? "beat" : "miss";
}

function findCol(header: string[], patterns: RegExp[]): number {
  return header.findIndex((h) => patterns.some((p) => p.test(h)));
}

/**
 * Parse Forex Factory export CSV, Apify scrape, or forexfactory-go output.
 * Required: date + title. Other columns detected by header names.
 */
export function parseCalendarCsv(text: string): CalendarEvent[] {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const iDateTime = findCol(header, [/^datetime$/]);
  const iDate = iDateTime >= 0 ? iDateTime : findCol(header, [/^date$/]);
  const iTime = findCol(header, [/^time/, /timestamp/]);
  const iCur = findCol(header, [/^currency/, /^cur$/]);
  const iImpact = findCol(header, [/^impact/, /^importance/]);
  const iTitle = findCol(header, [/^event/, /^title/, /^name/]);
  const iActual = findCol(header, [/^actual/]);
  const iForecast = findCol(header, [/^forecast/, /^consensus/]);
  const iPrev = findCol(header, [/^previous/, /^prior/]);

  if (iDate < 0 || iTitle < 0) return [];

  const out: CalendarEvent[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const rawDt = cols[iDate] ?? "";
    const parsed = rawDt.includes("T") ? parseNyDateTime(rawDt) : { date: normDatePlain(rawDt), time: "" };
    const date = parsed.date;
    const time =
      parsed.time || (iTime >= 0 ? (cols[iTime] ?? "").slice(0, 8) : "");
    const title = cols[iTitle] ?? "";
    if (!date || !title) continue;
    out.push({
      date,
      time,
      currency: iCur >= 0 ? (cols[iCur] ?? "").toUpperCase() : "USD",
      impact: iImpact >= 0 ? normImpact(cols[iImpact] ?? "") : "unknown",
      title,
      actual: iActual >= 0 ? cols[iActual] ?? "" : "",
      forecast: iForecast >= 0 ? cols[iForecast] ?? "" : "",
      previous: iPrev >= 0 ? cols[iPrev] ?? "" : "",
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function eventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const m = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = m.get(e.date) ?? [];
    list.push(e);
    m.set(e.date, list);
  }
  return m;
}

/** Build SOP tags for a single session day (Powell §8 fundamentals filter). */
export function profileDay(date: string, events: CalendarEvent[]): DayNewsProfile {
  const usd = events.filter((e) => e.currency === "USD" || e.currency === "US");
  const red = usd.filter((e) => e.impact === "high");
  const cpiNfp = usd.some((e) => CPI_NFP_RE.test(e.title));
  const fomc = usd.some((e) => FOMC_RE.test(e.title));
  const data830 = usd.some((e) => DATA_830_RE.test(e.title));

  const surprises = red
    .map((e) => usdSurpriseBadForNq(e.actual, e.forecast))
    .filter((s) => s !== "na");
  const beats = surprises.filter((s) => s === "beat").length;
  const misses = surprises.filter((s) => s === "miss").length;
  const oneSided = (beats >= 2 && misses === 0) || (misses >= 2 && beats === 0);
  const mixed = beats > 0 && misses > 0;

  const tags: SopDayTag[] = [];
  if (events.length === 0 || red.length === 0) tags.push("quiet");
  if (red.length > 0) tags.push("red-folder");
  if (cpiNfp) tags.push("cpi-nfp-ppi");
  if (fomc) tags.push("fomc");
  if (mixed) tags.push("mixed-prints");
  if (oneSided && cpiNfp) tags.push("one-sided-beat");
  if (cpiNfp && (mixed || !oneSided)) tags.push("data-hl-ok");
  if (oneSided && (cpiNfp || fomc)) tags.push("trend-day-risk");
  if (oneSided && cpiNfp) tags.push("skip-fade");

  let guidance = "Normal 10 AM RB rules — no major USD red folder.";
  if (tags.includes("skip-fade")) {
    guidance =
      "SOP: one-sided CPI/NFP beat — expect trend day. Do NOT fade early; skip session or demand A+ only. PRB 10:00 window likely misses 8:30 data H/L.";
  } else if (tags.includes("data-hl-ok")) {
    guidance =
      "SOP: data H/L model eligible — mark 8:30 reaction H/L, first side swept → opposing target. Use CISD/IFVG/RB after confirm; messy tape = extra caution.";
  } else if (tags.includes("trend-day-risk")) {
    guidance = "SOP: strong one-sided macro — fading is dangerous. Manual bias required before any RB.";
  } else if (tags.includes("red-folder")) {
    guidance = "Red-folder day — check FF per release; mixed prints favor data H/L, not blind RB.";
  }

  return {
    date,
    events,
    tags: [...new Set(tags)],
    guidance,
    redCount: red.length,
    cpiNfpPpi: cpiNfp,
  };
}

export function profileCalendar(events: CalendarEvent[]): Map<string, DayNewsProfile> {
  const byDate = eventsByDate(events);
  const out = new Map<string, DayNewsProfile>();
  for (const [date, list] of byDate) {
    out.set(date, profileDay(date, list));
  }
  return out;
}

export interface NewsTradeStats {
  label: string;
  trades: number;
  wins: number;
  losses: number;
  netPnl: number;
  avgPnl: number;
}

export function aggregateByTag(
  trades: { date: string; pnl: number }[],
  profiles: Map<string, DayNewsProfile>,
  tag: SopDayTag
): NewsTradeStats {
  const subset = trades.filter((t) => profiles.get(normalizeTradeDate(t.date))?.tags.includes(tag));
  const wins = subset.filter((t) => t.pnl > 50).length;
  const losses = subset.filter((t) => t.pnl < -50).length;
  const net = subset.reduce((s, t) => s + t.pnl, 0);
  return {
    label: tag,
    trades: subset.length,
    wins,
    losses,
    netPnl: net,
    avgPnl: subset.length ? net / subset.length : 0,
  };
}
