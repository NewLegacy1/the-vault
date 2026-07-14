/**
 * Normalize Hugging Face forex_factory_cache.csv → vault canonical CSV.
 * Usage: node scripts/normalize-ff-calendar.mjs <input.csv> [--usd-only] [--start YYYY-MM-DD] [--end YYYY-MM-DD]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(VAULT, "data", "calendar");

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const usdOnly = args.includes("--usd-only");
const start = args.includes("--start") ? args[args.indexOf("--start") + 1] : null;
const end = args.includes("--end") ? args[args.indexOf("--end") + 1] : null;

if (!input) {
  console.error("Usage: node scripts/normalize-ff-calendar.mjs <input.csv> [--usd-only] [--start YYYY-MM-DD] [--end YYYY-MM-DD]");
  process.exit(1);
}

function stripBom(t) {
  return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t;
}

function splitCsvLine(line) {
  const out = [];
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

function normImpact(raw) {
  const s = (raw || "").toLowerCase();
  if (s.includes("non-economic") || s.includes("bank holiday")) return "holiday";
  if (s.includes("high")) return "high";
  if (s.includes("medium")) return "medium";
  if (s.includes("low")) return "low";
  return "unknown";
}

function nyParts(iso) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return { date: iso.slice(0, 10), time: "" };
  const date = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time };
}

const text = stripBom(fs.readFileSync(input, "utf8"));
const lines = text.split(/\r?\n/).filter((l) => l.trim());
const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
const iDt = header.findIndex((h) => h === "datetime");
const iDate = iDt >= 0 ? iDt : header.findIndex((h) => h === "date");
const iTime = header.findIndex((h) => h === "time");
const iCur = header.findIndex((h) => h === "currency");
const iImp = header.findIndex((h) => h.includes("impact"));
const iEvt = header.findIndex((h) => h === "event" || h === "title");
const iAct = header.findIndex((h) => h === "actual");
const iFc = header.findIndex((h) => h.includes("forecast"));
const iPrev = header.findIndex((h) => h === "previous");

const seen = new Set();
const rows = [];

for (let i = 1; i < lines.length; i++) {
  const cols = splitCsvLine(lines[i]);
  const title = cols[iEvt] ?? "";
  if (!title) continue;
  let date = "";
  let time = "";
  const raw = cols[iDate] ?? "";
  if (raw.includes("T")) {
    ({ date, time } = nyParts(raw));
  } else {
    date = raw.slice(0, 10);
    time = iTime >= 0 ? (cols[iTime] ?? "").slice(0, 8) : "";
  }
  const currency = (cols[iCur] ?? "USD").toUpperCase();
  if (usdOnly && currency !== "USD" && currency !== "US") continue;
  if (start && date < start) continue;
  if (end && date > end) continue;
  const key = `${date}|${time}|${title}`;
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push({
    Date: date,
    Time: time,
    Currency: currency,
    Impact: normImpact(cols[iImp] ?? ""),
    Event: title,
    Actual: iAct >= 0 ? cols[iAct] ?? "" : "",
    Forecast: iFc >= 0 ? cols[iFc] ?? "" : "",
    Previous: iPrev >= 0 ? cols[iPrev] ?? "" : "",
  });
}

rows.sort((a, b) => a.Date.localeCompare(b.Date) || a.Time.localeCompare(b.Time));
if (rows.length === 0) {
  console.error("No rows after filter");
  process.exit(1);
}

const span = `${rows[0].Date}_${rows[rows.length - 1].Date}`;
const outPath = path.join(OUT_DIR, `forexfactory_${span}.csv`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) => (s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s);
const hdr = "Date,Time,Currency,Impact,Event,Actual,Forecast,Previous";
const body = rows.map((r) =>
  [r.Date, r.Time, r.Currency, r.Impact, r.Event, r.Actual, r.Forecast, r.Previous].map(esc).join(",")
);
fs.writeFileSync(outPath, [hdr, ...body].join("\n"), "utf8");

console.log(`Wrote ${rows.length} events (${rows[0].Date} → ${rows[rows.length - 1].Date})`);
console.log(`→ ${outPath}`);
console.log("Upload this file in Vault F7 NEWS");
