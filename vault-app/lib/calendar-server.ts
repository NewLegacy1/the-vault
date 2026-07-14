import fs from "fs";
import path from "path";
import { parseCalendarCsv, CalendarEvent } from "@/lib/economic-calendar";
import { normalizeTradeDate, dateSpan, countOverlap } from "@/lib/normalize-date";

function calendarDir(): string {
  const inApp = path.join(process.cwd(), "data", "calendar");
  const inRepo = path.join(process.cwd(), "..", "data", "calendar");
  if (fs.existsSync(inApp)) return inApp;
  return inRepo;
}

const CAL_DIR = calendarDir();
const ACTIVE = path.join(CAL_DIR, "vault_calendar.json");

export function calendarActivePath(): string {
  return ACTIVE;
}

export interface StoredCalendar {
  source: string;
  uploadedAt: string;
  eventCount: number;
  span: { start: string; end: string };
  events: CalendarEvent[];
}

function spanOf(events: CalendarEvent[]): { start: string; end: string } {
  if (!events.length) return { start: "", end: "" };
  const dates = events.map((e) => e.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

export function readStoredCalendar(): StoredCalendar | null {
  if (!fs.existsSync(ACTIVE)) return null;
  try {
    return JSON.parse(fs.readFileSync(ACTIVE, "utf8")) as StoredCalendar;
  } catch {
    return null;
  }
}

export function writeStoredCalendar(source: string, events: CalendarEvent[]): StoredCalendar {
  fs.mkdirSync(CAL_DIR, { recursive: true });
  const payload: StoredCalendar = {
    source,
    uploadedAt: new Date().toISOString(),
    eventCount: events.length,
    span: spanOf(events),
    events,
  };
  fs.writeFileSync(ACTIVE, JSON.stringify(payload), "utf8");
  return payload;
}

function mergeEvents(lists: CalendarEvent[][]): CalendarEvent[] {
  const seen = new Set<string>();
  const out: CalendarEvent[] = [];
  for (const list of lists) {
    for (const e of list) {
      const k = `${e.date}|${e.time}|${e.title}|${e.currency}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(e);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

/** Load active JSON or merge all forexfactory_*.csv in data/calendar. */
export function loadServerCalendar(): StoredCalendar | null {
  const active = readStoredCalendar();
  if (active?.events?.length) return active;

  if (!fs.existsSync(CAL_DIR)) return null;
  const csvs = fs
    .readdirSync(CAL_DIR)
    .filter((f) => f.endsWith(".csv") && f.startsWith("forexfactory_"))
    .map((f) => path.join(CAL_DIR, f));

  const parsed: CalendarEvent[][] = [];
  for (const fp of csvs) {
    const events = parseCalendarCsv(fs.readFileSync(fp, "utf8"));
    if (events.length) parsed.push(events);
  }
  if (!parsed.length) return null;
  const merged = mergeEvents(parsed);
  return writeStoredCalendar(
    csvs.map((f) => path.basename(f)).join(" + "),
    merged
  );
}

export function slimEventsForUpload(events: CalendarEvent[], opts?: { usdOnly?: boolean }): CalendarEvent[] {
  if (opts?.usdOnly === false) return events;
  return events.filter((e) => e.currency === "USD" || e.currency === "US");
}

export function calendarDiagnostics(events: CalendarEvent[], tradeDates: string[]) {
  const eventDateSet = new Set(events.map((e) => e.date));
  const normTrades = tradeDates.map(normalizeTradeDate);
  const overlap = countOverlap(tradeDates, eventDateSet);
  const calSpan = dateSpan(events.map((e) => e.date));
  const tradeSpan = dateSpan(normTrades);

  let gapNote: string | null = null;
  if (calSpan && tradeSpan) {
    if (tradeSpan.start > calSpan.end) {
      gapNote = `Trades start ${tradeSpan.start} but calendar ends ${calSpan.end}. Scrape Apr 2025 → today to cover your replay window.`;
    } else if (tradeSpan.end < calSpan.start) {
      gapNote = `Trades end ${tradeSpan.end} before calendar starts ${calSpan.start}.`;
    } else if (overlap === 0) {
      gapNote = "Spans overlap but no trade day matches a calendar day — check date formats.";
    }
  } else if (events.length && tradeDates.length && overlap === 0) {
    gapNote = "No matching dates between trades and calendar.";
  }

  return {
    eventCount: events.length,
    calSpan,
    tradeSpan,
    overlapDays: overlap,
    tradeCount: tradeDates.length,
    unmatchedTrades: tradeDates.length - overlap,
    gapNote,
  };
}
