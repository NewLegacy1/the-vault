import { CalendarEvent, DayNewsProfile, profileDay } from "./economic-calendar";

export interface CalendarDayCell {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  hasTrade: boolean;
  tradePnl: number | null;
  redCount: number;
  tags: string[];
  events: CalendarEvent[];
  profile: DayNewsProfile | null;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m - 1 };
}

export function buildMonthGrid(
  year: number,
  month: number,
  events: CalendarEvent[],
  tradeByDate: Map<string, number>,
  today = new Date()
): CalendarDayCell[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1);
    const iso = d.toLocaleDateString("en-CA");
    const dayEvents = events.filter((e) => e.date === iso);
    cells.push({
      date: iso,
      inMonth: false,
      isToday: iso === today.toLocaleDateString("en-CA"),
      hasTrade: tradeByDate.has(iso),
      tradePnl: tradeByDate.get(iso) ?? null,
      redCount: dayEvents.filter((e) => e.impact === "high").length,
      tags: dayEvents.length ? profileDay(iso, dayEvents).tags : [],
      events: dayEvents,
      profile: dayEvents.length ? profileDay(iso, dayEvents) : null,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === iso);
    cells.push({
      date: iso,
      inMonth: true,
      isToday: iso === today.toLocaleDateString("en-CA"),
      hasTrade: tradeByDate.has(iso),
      tradePnl: tradeByDate.get(iso) ?? null,
      redCount: dayEvents.filter((e) => e.impact === "high").length,
      tags: dayEvents.length ? profileDay(iso, dayEvents).tags : [],
      events: dayEvents,
      profile: dayEvents.length ? profileDay(iso, dayEvents) : null,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const d = new Date(last.date + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const iso = d.toLocaleDateString("en-CA");
    const dayEvents = events.filter((e) => e.date === iso);
    cells.push({
      date: iso,
      inMonth: false,
      isToday: iso === today.toLocaleDateString("en-CA"),
      hasTrade: tradeByDate.has(iso),
      tradePnl: tradeByDate.get(iso) ?? null,
      redCount: dayEvents.filter((e) => e.impact === "high").length,
      tags: dayEvents.length ? profileDay(iso, dayEvents).tags : [],
      events: dayEvents,
      profile: dayEvents.length ? profileDay(iso, dayEvents) : null,
    });
  }

  return cells;
}

export function listMonthsInSpan(start: string, end: string): string[] {
  if (!start || !end) return [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const out: string[] = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(monthKey(y, m - 1));
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}
