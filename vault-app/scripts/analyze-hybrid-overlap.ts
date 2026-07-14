import fs from "fs";
import path from "path";
import { parseTvCsv } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { profileCalendar } from "../lib/economic-calendar";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");

function load(file: string) {
  const text = fs.readFileSync(path.join(MATRIX, file), "utf8");
  if (text.startsWith("date,") || text.startsWith("\ufeffdate,")) {
    return text
      .replace(/^\ufeff/, "")
      .split(/\r?\n/)
      .slice(1)
      .filter((l) => l.trim())
      .map((l) => {
        const [date, pnl] = l.split(",");
        return { date: normalizeTradeDate(date), pnl: parseFloat(pnl) };
      });
  }
  return parseTvCsv(text).map((t) => ({
    date: normalizeTradeDate(t.date),
    pnl: t.pnl,
  }));
}

function inter(a: Set<string>, b: Set<string>) {
  return [...a].filter((d) => b.has(d)).sort();
}

const a0a = load("prb-matrix-a0a.csv");
const a0b = load("prb-matrix-a0b.csv");
const b0 = load("macro-matrix-b0.csv");
const b1a = load("macro-matrix-b1a.csv");
const sa = new Set(a0a.map((t) => t.date));
const sb = new Set(a0b.map((t) => t.date));
const s0 = new Set(b0.map((t) => t.date));
const s1 = new Set(b1a.map((t) => t.date));

console.log("A0a", a0a.length, a0a[0].date, "->", a0a[a0a.length - 1].date);
console.log("A0b", a0b.length, a0b[0].date, "->", a0b[a0b.length - 1].date);
console.log("B0", b0.length, b0[0].date, "->", b0[b0.length - 1].date);
console.log("B1a", b1a.length, b1a[0].date, "->", b1a[b1a.length - 1].date);
console.log("A0a∩B0", inter(sa, s0));
console.log("A0a∩B1a", inter(sa, s1));
console.log("A0b∩B0", inter(sb, s0));
console.log("A0b∩B1a", inter(sb, s1));
console.log("B0 dates", b0.map((t) => t.date).join(", "));
console.log("B1a dates", b1a.map((t) => t.date).join(", "));
console.log("A0a dates", a0a.map((t) => t.date).join(", "));

const merged = [
  ...a0a.map((t) => ({ ...t, s: "PRB" })),
  ...b1a.map((t) => ({ ...t, s: "MAC" })),
].sort((a, b) => a.date.localeCompare(b.date) || a.s.localeCompare(b.s));

let cur = 0;
let max = 0;
const streaks: number[] = [];
for (const t of merged) {
  if (t.pnl < -50) {
    cur++;
    max = Math.max(max, cur);
  } else {
    if (cur) streaks.push(cur);
    cur = 0;
  }
}
if (cur) streaks.push(cur);

console.log(
  "Merged n",
  merged.length,
  "maxLStreak",
  max,
  "streaks>=3",
  streaks.filter((x) => x >= 3).length,
  "hist",
  streaks.reduce((h: Record<number, number>, x) => {
    h[x] = (h[x] ?? 0) + 1;
    return h;
  }, {})
);
console.log(
  "Merged WLS",
  merged.map((t) => (t.pnl > 50 ? "W" : t.pnl < -50 ? "L" : "S")).join("")
);
console.log(
  "A0a WLS",
  a0a.map((t) => (t.pnl > 50 ? "W" : t.pnl < -50 ? "L" : "S")).join("")
);
console.log(
  "B1a WLS",
  b1a.map((t) => (t.pnl > 50 ? "W" : t.pnl < -50 ? "L" : "S")).join("")
);

// Where Macro fills a PRB loss cluster chronologically
console.log("\nMerged timeline (date src pnl):");
for (const t of merged) {
  const mark = t.pnl > 50 ? "W" : t.pnl < -50 ? "L" : "S";
  console.log(`${t.date} ${t.s} ${mark} $${Math.round(t.pnl)}`);
}

const cal = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/calendar-bundle.json"), "utf8")
);
const profiles = profileCalendar(cal.events);
let tagged = 0;
let quiet = 0;
let red = 0;
let none = 0;
const tagHist: Record<string, number> = {};
for (const t of a0a) {
  const p = profiles.get(t.date);
  if (!p) {
    none++;
    continue;
  }
  tagged++;
  for (const tg of p.tags) tagHist[tg] = (tagHist[tg] ?? 0) + 1;
  if (p.tags.includes("quiet")) quiet++;
  if (p.tags.includes("red-folder")) red++;
}
console.log("\nA0a calendar tagged", tagged, "quiet", quiet, "red", red, "none", none);
console.log("tagHist", tagHist);
console.log("sample", a0a[5].date, profiles.get(a0a[5].date));
