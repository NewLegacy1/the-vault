/** Normalize trade/calendar dates to YYYY-MM-DD for joins. */

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/** TradingView / FF / ISO → YYYY-MM-DD. Returns "" if unparseable. */
export function normalizeTradeDate(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // 2025/12/09 or 12/09/2025
  const ymd = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  }
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (mdy) {
    return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  }

  // Dec 16, 2025 or Dec 16 2025
  const mon = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (mon) {
    const mm = MONTHS[mon[1].slice(0, 3).toLowerCase()];
    if (mm) return `${mon[3]}-${mm}-${mon[2].padStart(2, "0")}`;
  }

  const d = new Date(s);
  if (Number.isFinite(d.getTime())) {
    return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  }
  return s;
}

export function dateSpan(dates: string[]): { start: string; end: string } | null {
  const ok = dates.map(normalizeTradeDate).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (!ok.length) return null;
  return { start: ok[0], end: ok[ok.length - 1] };
}

export function countOverlap(tradeDates: string[], eventDates: Set<string>): number {
  let n = 0;
  for (const t of tradeDates) {
    if (eventDates.has(normalizeTradeDate(t))) n++;
  }
  return n;
}
