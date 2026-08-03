/**
 * Shared calendar-time helpers (F11) — the single source of truth for
 * span-weeks and per-week rates. monte-carlo.ts and csv.ts both delegate here
 * so a semantics fix can never silently miss one of them again.
 *
 * F1 reminder: trades/week is a TRADE-step rate. Day/week bootstrap MC uses
 * day steps — divide day-step counts by stepsPerWeek (distinct trading
 * days / span weeks), never by trades/week.
 */

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Calendar span of a date list in weeks; null when unknown or < ~2 days. */
export function calendarSpanWeeks(dates?: string[]): number | null {
  if (!dates || dates.length < 2) return null;
  const ts = dates
    .map((d) => Date.parse(d))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (ts.length < 2) return null;
  const weeks = (ts[ts.length - 1]! - ts[0]!) / WEEK_MS;
  return weeks > 0.25 ? weeks : null;
}

/** Trades per calendar week inferred from date span; defaults to 5 (~1/day) if unknown. */
export function tradesPerWeekFromDates(dates?: string[]): number {
  const weeks = calendarSpanWeeks(dates);
  return weeks != null && dates ? dates.length / weeks : 5;
}

/** Distinct trading days per calendar week; defaults to 5 if unknown. */
export function tradingDaysPerWeekFromDates(dates?: string[]): number {
  const weeks = calendarSpanWeeks(dates);
  if (weeks == null || !dates) return 5;
  const days = new Set(dates.filter(Boolean)).size;
  return days > 0 ? days / weeks : 5;
}
