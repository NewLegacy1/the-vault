import fs from "fs";
import path from "path";
import { parseTvCsv } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { profileCalendar, type CalendarEvent } from "../lib/economic-calendar";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { buildEquityCurve } from "../lib/equity-curve";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");

type T = { date: string; pnl: number; tier?: string; signal?: string; mfe?: number; mae?: number };

function load(file: string): T[] {
  const text = fs.readFileSync(path.join(MATRIX, file), "utf8");
  if (text.startsWith("date,") || text.startsWith("\ufeffdate,")) {
    return text
      .replace(/^\ufeff/, "")
      .split(/\r?\n/)
      .slice(1)
      .filter((l) => l.trim())
      .map((l) => {
        const c = l.split(",");
        return {
          date: normalizeTradeDate(c[0]),
          pnl: parseFloat(c[1]),
          tier: c[3] || undefined,
          signal: c[4] || undefined,
          mfe: c[7] ? parseFloat(c[7]) : undefined,
          mae: c[8] ? parseFloat(c[8]) : undefined,
        };
      });
  }
  return parseTvCsv(text).map((t) => ({
    date: normalizeTradeDate(t.date),
    pnl: t.pnl,
    tier: t.tier,
    signal: t.signal,
    mfe: t.mfeUsd,
    mae: t.maeUsd,
  }));
}

function cls(p: number) {
  return p > 50 ? "W" : p < -50 ? "L" : "S";
}

function maxStreak(pnls: number[]) {
  let m = 0;
  let c = 0;
  for (const p of pnls) {
    if (p < -50) {
      c++;
      m = Math.max(m, c);
    } else c = 0;
  }
  return m;
}

function mc(trades: T[]) {
  const rule = ruleById("tpt50")!;
  const r = runMonteCarlo({
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    sims: 2000,
    maxTrades: 80,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    phase: "eval",
    consistency: { consistencyPct: 50, minDays: 5 },
    fees: {
      evalFee: rule.evalFee ?? 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: rule.monthlyFee ?? 0,
      payoutBuffer: 1000,
    },
  });
  return Math.round(r.passRate * 1000) / 10;
}

function stats(label: string, trades: T[]) {
  const pnls = trades.map((t) => t.pnl);
  const w = pnls.filter((p) => p > 50);
  const l = pnls.filter((p) => p < -50);
  const net = pnls.reduce((a, b) => a + b, 0);
  const aw = w.length ? w.reduce((a, b) => a + b, 0) / w.length : 0;
  const al = l.length ? Math.abs(l.reduce((a, b) => a + b, 0) / l.length) : 0;
  const eq = buildEquityCurve(pnls, trades.map((t) => t.date));
  return {
    label,
    n: trades.length,
    net: Math.round(net),
    wr: trades.length ? Math.round((w.length / trades.length) * 1000) / 10 : 0,
    rr: al ? Math.round((aw / al) * 100) / 100 : 0,
    avgWin: Math.round(aw),
    avgLoss: Math.round(al),
    maxDd: Math.round(eq.maxDd),
    maxLStreak: maxStreak(pnls),
    pass: mc(trades),
  };
}

const a0a = load("prb-matrix-a0a.csv");
const a0b = load("prb-matrix-a0b.csv");
const d1 = load("prb-matrix-d1.csv");
const b0 = load("macro-matrix-b0.csv");
const b1a = load("macro-matrix-b1a.csv");

const a0aMap = new Map(a0a.map((t) => [t.date, t]));
const b0Map = new Map(b0.map((t) => [t.date, t]));

const conflict = [...a0aMap.keys()].filter((d) => b0Map.has(d)).sort();
console.log("\n=== A0a × B0 CONFLICT DAYS (same calendar day both fired) ===");
for (const d of conflict) {
  const p = a0aMap.get(d)!;
  const m = b0Map.get(d)!;
  console.log(
    `${d}  PRB ${cls(p.pnl)} $${Math.round(p.pnl)}  |  MAC ${cls(m.pnl)} $${Math.round(m.pnl)} tier=${m.tier ?? "?"}  |  sum $${Math.round(p.pnl + m.pnl)}`
  );
}

// Policy: on conflict, prefer Macro A only if PRB is loss and Macro is win; else PRB
function portfolio(
  prb: T[],
  mac: T[],
  policy: "prb_priority" | "mac_priority" | "skip_conflict" | "best_of" | "take_both_sum"
): T[] {
  const pm = new Map(prb.map((t) => [t.date, t]));
  const mm = new Map(mac.map((t) => [t.date, t]));
  const dates = [...new Set([...pm.keys(), ...mm.keys()])].sort();
  const out: T[] = [];
  for (const d of dates) {
    const p = pm.get(d);
    const m = mm.get(d);
    if (p && m) {
      if (policy === "skip_conflict") continue;
      if (policy === "prb_priority") out.push({ ...p });
      else if (policy === "mac_priority") out.push({ ...m });
      else if (policy === "best_of") out.push(p.pnl >= m.pnl ? { ...p } : { ...m });
      else if (policy === "take_both_sum")
        out.push({ date: d, pnl: p.pnl + m.pnl, signal: "SUM" });
    } else if (p) out.push({ ...p });
    else if (m) out.push({ ...m });
  }
  return out;
}

console.log("\n=== PORTFOLIO POLICIES ===");
const combos: [string, T[], T[]][] = [
  ["A0a+B1a", a0a, b1a],
  ["A0a+B0", a0a, b0],
  ["D1+B1a", d1, b1a],
  ["A0b+B1a", a0b, b1a],
];
const policies = [
  "prb_priority",
  "mac_priority",
  "skip_conflict",
  "best_of",
  "take_both_sum",
] as const;

for (const [name, prb, mac] of combos) {
  console.log(`\n-- ${name} --`);
  console.log(JSON.stringify(stats(`${name}/prb`, prb)));
  console.log(JSON.stringify(stats(`${name}/mac`, mac)));
  for (const pol of policies) {
    console.log(JSON.stringify(stats(`${name}/${pol}`, portfolio(prb, mac, pol))));
  }
}

// News: missing profile = quiet
const cal = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/calendar-bundle.json"), "utf8")
) as { events: CalendarEvent[] };
const profiles = profileCalendar(cal.events);

function newsSplit(label: string, trades: T[]) {
  let redN = 0,
    redNet = 0,
    redW = 0;
  let quiN = 0,
    quiNet = 0,
    quiW = 0;
  const redDays: { date: string; pnl: number }[] = [];
  for (const t of trades) {
    const p = profiles.get(t.date);
    const isRed = p?.tags.includes("red-folder") ?? false;
    if (isRed) {
      redN++;
      redNet += t.pnl;
      if (t.pnl > 50) redW++;
      redDays.push({ date: t.date, pnl: Math.round(t.pnl) });
    } else {
      quiN++;
      quiNet += t.pnl;
      if (t.pnl > 50) quiW++;
    }
  }
  console.log(
    `${label} RED n=${redN} net=$${Math.round(redNet)} wr=${redN ? Math.round((redW / redN) * 100) : 0}% | QUIET/untagged n=${quiN} net=$${Math.round(quiNet)} wr=${quiN ? Math.round((quiW / quiN) * 100) : 0}%`
  );
  if (redDays.length)
    console.log(
      "  red days:",
      redDays.map((d) => `${d.date}:$${d.pnl}`).join(", ")
    );
}

console.log("\n=== NEWS (missing calendar day counted as quiet) ===");
for (const [label, trades] of [
  ["A0a", a0a],
  ["A0b", a0b],
  ["D1", d1],
  ["B0", b0],
  ["B1a", b1a],
  ["A0a+B1a union", portfolio(a0a, b1a, "prb_priority")],
] as [string, T[]][]) {
  newsSplit(label, trades);
}

// Does Macro break PRB losing streaks when inserted chronologically?
console.log("\n=== STREAK INTERRUPTIONS (A0a timeline with B1a inserts) ===");
const merged = [
  ...a0a.map((t) => ({ ...t, src: "PRB" })),
  ...b1a.map((t) => ({ ...t, src: "MAC" })),
].sort((a, b) => a.date.localeCompare(b.date));
let streak = 0;
let interruptedByMac = 0;
let macAfterPrbLoss = 0;
for (let i = 0; i < merged.length; i++) {
  const t = merged[i];
  if (t.pnl < -50) streak++;
  else {
    if (streak >= 2 && t.src === "MAC" && t.pnl > 50) interruptedByMac++;
    streak = 0;
  }
  if (
    t.src === "MAC" &&
    t.pnl > 50 &&
    i > 0 &&
    merged[i - 1].src === "PRB" &&
    merged[i - 1].pnl < -50
  ) {
    macAfterPrbLoss++;
    console.log(
      `  Macro win after PRB loss: ${merged[i - 1].date} PRB $${Math.round(merged[i - 1].pnl)} → ${t.date} MAC $${Math.round(t.pnl)}`
    );
  }
}
console.log("streak>=2 ended by Macro win:", interruptedByMac);
console.log("Macro win immediately after PRB loss:", macAfterPrbLoss);
