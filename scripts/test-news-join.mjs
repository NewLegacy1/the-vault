import { parseCalendarCsv, profileCalendar, eventsByDate } from "./economic-calendar.ts";
import { joinTradesWithNews } from "./trade-news-join.ts";
import fs from "fs";

const calPath = process.argv[2] || "C:/Users/Admin/Desktop/The Vault/data/calendar/forexfactory_2024-01-01_2025-04-07.csv";
const rawPath = process.argv[3] || "C:/Users/Admin/Downloads/forex_factory_cache.csv";

const trades = [
  { date: "2025-12-09", pnl: -302 },
  { date: "2026-01-02", pnl: 1905 },
  { date: "2026-02-10", pnl: 1942 },
];

for (const label of ["normalized", "raw-hf"]) {
  const path = label === "normalized" ? calPath : rawPath;
  const text = fs.readFileSync(path, "utf8");
  const events = parseCalendarCsv(text);
  const joined = joinTradesWithNews(trades, events);
  const dates = [...new Set(events.map((e) => e.date))].sort();
  console.log(`\n=== ${label} (${path}) ===`);
  console.log("parsed events:", events.length);
  console.log("date span:", dates[0], "→", dates[dates.length - 1]);
  for (const j of joined) {
    console.log(j.date, "profile?", !!j.profile, "tags", j.profile?.tags?.join(",") || "NONE", "red", j.headlines.length);
  }
}
