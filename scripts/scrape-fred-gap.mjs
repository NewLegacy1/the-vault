/**
 * Scrape FRED release calendars (no API key, no Cloudflare) for gap fill Apr 2025–Jul 2026.
 * Merges with existing data/calendar/*.csv → forexfactory_merged_*.csv + vault_calendar.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, "..");
const CAL_DIR = path.join(VAULT, "data", "calendar");

/** FRED release IDs for Powell SOP red-folder events */
const RELEASES = [
  { rid: 50, title: "Employment Situation", impact: "high", aliases: ["Non-Farm Employment Change", "NFP"] },
  { rid: 10, title: "Consumer Price Index", impact: "high", aliases: ["CPI m/m", "CPI y/y"] },
  { rid: 46, title: "Producer Price Index", impact: "high", aliases: ["PPI m/m"] },
  { rid: 53, title: "Gross Domestic Product", impact: "high", aliases: ["Advance GDP", "GDP q/q"] },
  { rid: 9, title: "Advance Monthly Sales for Retail and Food Services", impact: "high", aliases: ["Retail Sales"] },
];

const MONTHS = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function parseFredCalendarHtml(html, release) {
  const rows = [];
  const dayRe = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\w+)\s+(\d{1,2}),\s+(\d{4})/gi;
  let m;
  while ((m = dayRe.exec(html)) !== null) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (!mon) continue;
    const date = `${m[4]}-${mon}-${m[3].padStart(2, "0")}`;
    rows.push({
      Date: date,
      Time: "08:30",
      Currency: "USD",
      Impact: release.impact,
      Event: release.title,
      Actual: "",
      Forecast: "",
      Previous: "",
      _source: `fred-rid-${release.rid}`,
    });
  }
  return rows;
}

async function fetchReleaseYear(rid, year) {
  const url = `https://fred.stlouisfed.org/releases/calendar?rid=${rid}&y=${year}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VaultCalendarBot/1.0 (research)" },
  });
  if (!res.ok) throw new Error(`FRED ${rid} ${year}: ${res.status}`);
  return res.text();
}

function readExistingCsv() {
  const files = fs.readdirSync(CAL_DIR).filter((f) => f.endsWith(".csv") && f.startsWith("forexfactory_"));
  const seen = new Set();
  const rows = [];
  for (const f of files) {
    if (f.includes("merged")) continue;
    const text = fs.readFileSync(path.join(CAL_DIR, f), "utf8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const hdr = lines[0];
    for (let i = 1; i < lines.length; i++) {
      const k = lines[i];
      if (seen.has(k)) continue;
      seen.add(k);
      rows.push(k);
    }
  }
  return { header: "Date,Time,Currency,Impact,Event,Actual,Forecast,Previous", body: rows };
}

function esc(s) {
  return s.includes(",") || s.includes('"') ? `"${String(s).replace(/"/g, '""')}"` : s;
}

async function main() {
  const years = [2025, 2026];
  const gapStart = "2025-04-08";
  const gapEnd = "2026-07-31";
  const fredRows = [];

  for (const rel of RELEASES) {
    for (const year of years) {
      process.stderr.write(`FRED rid=${rel.rid} year=${year}… `);
      try {
        const html = await fetchReleaseYear(rel.rid, year);
        const parsed = parseFredCalendarHtml(html, rel);
        const inRange = parsed.filter((r) => r.Date >= gapStart && r.Date <= gapEnd);
        fredRows.push(...inRange);
        process.stderr.write(`${inRange.length} events\n`);
      } catch (e) {
        process.stderr.write(`FAIL ${e.message}\n`);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const existing = readExistingCsv();
  const seen = new Set(existing.body);
  let added = 0;
  for (const r of fredRows) {
    const line = [r.Date, r.Time, r.Currency, r.Impact, r.Event, r.Actual, r.Forecast, r.Previous]
      .map(esc)
      .join(",");
    if (!seen.has(line)) {
      seen.add(line);
      existing.body.push(line);
      added++;
    }
  }

  // Build vault_calendar.json for API
  // Also merge faireconomy this-week USD high/medium (supplement for recent gap)
  try {
    process.stderr.write("Faireconomy this-week… ");
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: { "User-Agent": "VaultCalendarBot/1.0" },
    });
    if (res.ok) {
      const week = await res.json();
      for (const ev of week) {
        if (ev.country !== "USD") continue;
        const imp = String(ev.impact || "").toLowerCase();
        if (imp !== "high" && imp !== "medium") continue;
        const d = new Date(ev.date);
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(d);
        const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
        const date = `${get("year")}-${get("month")}-${get("day")}`;
        const time = `${get("hour")}:${get("minute")}`;
        const line = [date, time, "USD", imp, ev.title, "", "", ""].map(esc).join(",");
        if (!seen.has(line)) {
          seen.add(line);
          existing.body.push(line);
          added++;
        }
      }
      process.stderr.write(`+${week.filter((e) => e.country === "USD").length} USD rows\n`);
    }
  } catch (e) {
    process.stderr.write(`skip (${e.message})\n`);
  }

  existing.body.sort((a, b) => a.localeCompare(b));
  const dates = existing.body.map((l) => l.split(",")[0]).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const span = `${dates[0]}_${dates[dates.length - 1]}`;
  const outCsv = path.join(CAL_DIR, `forexfactory_merged_${span}.csv`);
  fs.writeFileSync(outCsv, [existing.header, ...existing.body].join("\n"), "utf8");

  // Build vault_calendar.json for API
  const events = existing.body.map((line) => {
    const cols = line.split(",");
    return {
      date: cols[0],
      time: cols[1] ?? "",
      currency: cols[2] ?? "USD",
      impact: (cols[3] ?? "unknown").toLowerCase(),
      title: cols[4] ?? "",
      actual: cols[5] ?? "",
      forecast: cols[6] ?? "",
      previous: cols[7] ?? "",
    };
  });

  const payload = {
    source: `merged HF + FRED gap (+${added} rows)`,
    uploadedAt: new Date().toISOString(),
    eventCount: events.length,
    span: { start: dates[0], end: dates[dates.length - 1] },
    events,
  };
  fs.writeFileSync(path.join(CAL_DIR, "vault_calendar.json"), JSON.stringify(payload), "utf8");

  console.log(`FRED gap: +${added} rows (${fredRows.length} scraped, deduped)`);
  console.log(`Merged CSV: ${outCsv} (${existing.body.length} rows)`);
  console.log(`vault_calendar.json updated · ${dates[0]} → ${dates[dates.length - 1]}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
