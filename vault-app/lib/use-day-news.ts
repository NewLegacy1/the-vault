"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "./economic-calendar";

/** Module-level cache so every form/date-change shares one /api/calendar fetch. */
let cache: CalendarEvent[] | null = null;
let pending: Promise<CalendarEvent[]> | null = null;

async function loadCalendar(): Promise<CalendarEvent[]> {
  if (cache) return cache;
  if (!pending) {
    pending = fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        cache = (d.events ?? []) as CalendarEvent[];
        return cache;
      })
      .catch(() => {
        pending = null;
        return [] as CalendarEvent[];
      });
  }
  return pending;
}

/** All calendar events for a YYYY-MM-DD date (empty until loaded / none found). */
export function useDayNews(date: string): CalendarEvent[] {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  useEffect(() => {
    let live = true;
    loadCalendar().then((all) => {
      if (live) setEvents(all.filter((e) => e.date === date));
    });
    return () => {
      live = false;
    };
  }, [date]);
  return events;
}

export interface AutoRedFolder {
  redFolder: "yes" | "no";
  /** HHMM NY of the first high-impact print. */
  time?: string;
  /** Short label, e.g. "CPI · PPI". */
  event?: string;
}

/** Collapse a day's events into the journal red-folder fields (high impact only). */
export function autoRedFolder(events: CalendarEvent[]): AutoRedFolder {
  const red = events.filter((e) => e.impact === "high");
  if (!red.length) return { redFolder: "no" };
  const first = [...red].sort((a, b) => a.time.localeCompare(b.time))[0];
  return {
    redFolder: "yes",
    time: first.time ? first.time.replace(":", "") : undefined,
    event: red.map((e) => shortTitle(e.title)).join(" · "),
  };
}

function shortTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("consumer price")) return "CPI";
  if (t.includes("producer price")) return "PPI";
  if (t.includes("employment situation") || t.includes("non-farm") || t.includes("nonfarm")) return "NFP";
  if (t.includes("gross domestic")) return "GDP";
  if (t.includes("retail")) return "Retail Sales";
  if (t.includes("fomc")) return "FOMC";
  if (t.includes("powell")) return "Powell speaks";
  if (t.includes("jobless")) return "Jobless Claims";
  if (t.includes("ism")) return "ISM";
  return title.length > 26 ? title.slice(0, 24) + "…" : title;
}
