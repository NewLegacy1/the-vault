/**
 * Speed-focused comparison: hybrid H-series vs PRB/Macro parents.
 * Optimizes median weeks-to-pass / weeks-to-payout alongside pass rate.
 */
import fs from "fs";
import path from "path";
import { parseCohortMeta, type CohortRecord } from "../lib/cohort";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { profileCalendar, type CalendarEvent } from "../lib/economic-calendar";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";

const ROOT = path.join(__dirname, "../../strategies/cohorts");
const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const CAL = path.join(__dirname, "../data/calendar-bundle.json");

function loadCohort(rel: string): CohortRecord {
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const rec = parseCohortMeta(text, path.basename(rel), rel);
  if (!rec) throw new Error(`Failed to parse ${rel}`);
  return rec;
}

function tptSnap(c: CohortRecord) {
  const t = c.firmMc?.tpt50;
  return {
    pass: t?.passPct ?? c.mcPassPct,
    bust: t?.bustPct ?? c.mcBustPct,
    payout: t?.payoutPct ?? c.mcPayoutPct,
    recycle: t?.recyclePct,
    wPass: t?.weeksToPassP50 ?? c.weeksToPassP50,
    wPay: t?.weeksToPayoutP50 ?? c.weeksToPayoutP50,
    mode: t?.mcMode ?? c.phase,
  };
}

function mcLedger(file: string, mode: "eval" | "funded") {
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8"));
  const rule = ruleById("tpt50")!;
  const pnls = trades.map((t) => t.pnl);
  const dates = trades.map((t) => normalizeTradeDate(t.date));
  if (mode === "eval") {
    const r = runMonteCarlo({
      trades: pnls,
      dates,
      sims: 2000,
      maxTrades: 80,
      passAt: rule.passAt,
      trailingDD: rule.trailingDD,
      consistency: { consistencyPct: 50, minDays: 5 },
      fees: {
        evalFee: rule.evalFee ?? 0,
        activationFee: rule.activationFee ?? 0,
        monthlyFee: rule.monthlyFee ?? 0,
        payoutBuffer: 1000,
      },
      bootstrap: "week",
    });
    return {
      n: trades.length,
      net: Math.round(pnls.reduce((a, b) => a + b, 0)),
      pass: Math.round(r.passRate * 1000) / 10,
      bust: Math.round(r.bustRate * 1000) / 10,
      wPass: r.economics.weeksToPassP50,
      wPay: r.economics.weeksToPayoutP50,
    };
  }
  const r = runMonteCarlo({
    trades: pnls,
    dates,
    sims: 2000,
    maxTrades: 80,
    passAt: 0,
    trailingDD: rule.trailingDD,
    fees: {
      evalFee: 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: 0,
      payoutBuffer: 1000,
    },
    simMode: "funded_only",
    funded: {
      payoutProfitTarget: 1000,
      recycleProfitCap: 5000,
      accountRecycling: true,
      payoutConsistencyPct: 0,
    },
    bootstrap: "week",
  });
  return {
    n: trades.length,
    net: Math.round(pnls.reduce((a, b) => a + b, 0)),
    pass: Math.round((r.economics.payoutRate ?? 0) * 1000) / 10,
    bust: Math.round(r.bustRate * 1000) / 10,
    recycle: r.recycleRate != null ? Math.round(r.recycleRate * 1000) / 10 : null,
    wPass: r.economics.weeksToPayoutP50,
    wPay: r.economics.weeksToPayoutP50,
  };
}

function newsSplit(file: string) {
  const cal = JSON.parse(fs.readFileSync(CAL, "utf8")) as { events: CalendarEvent[] };
  const profiles = profileCalendar(cal.events);
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8"));
  let redN = 0,
    redNet = 0,
    qN = 0,
    qNet = 0;
  let macRed = 0,
    macRedNet = 0,
    prbRed = 0,
    prbRedNet = 0;
  for (const t of trades) {
    const d = normalizeTradeDate(t.date);
    const red = profiles.get(d)?.tags.includes("red-folder") ?? false;
    const sig = (t.signal || "").toUpperCase();
    const isMac = sig.includes("_A") || sig.includes("MAC") || sig.endsWith("_AP") || sig.endsWith("_H");
    if (red) {
      redN++;
      redNet += t.pnl;
      if (isMac) {
        macRed++;
        macRedNet += t.pnl;
      } else {
        prbRed++;
        prbRedNet += t.pnl;
      }
    } else {
      qN++;
      qNet += t.pnl;
    }
  }
  return {
    redN,
    redNet: Math.round(redNet),
    qN,
    qNet: Math.round(qNet),
    macRed,
    macRedNet: Math.round(macRedNet),
    prbRed,
    prbRedNet: Math.round(prbRedNet),
  };
}

function row(label: string, c: CohortRecord) {
  const s = tptSnap(c);
  console.log(
    `${label.padEnd(28)} n=${String(c.trades).padStart(2)} net=$${String(c.netPnl).padStart(6)}  pass=${String(s.pass).padStart(5)}% bust=${String(s.bust).padStart(5)}%  wPass=${String(s.wPass ?? "—").padStart(4)}  wPay=${String(s.wPay ?? "—").padStart(4)}  edge/wk=$${c.weeklyEdgeUsd}`
  );
}

function main() {
  console.log("\n=== LAB COHORTS (headline + TPT firm_mc where present) ===\n");
  const a0a = loadCohort("eval/2026-07-14_201545539_a0a_prb_control.md");
  const h0a = loadCohort("eval/2026-07-14_203537283_h0a_eval_a0a_b1a.md");
  const h1a = loadCohort("eval/2026-07-14_203619332_h1a_eval_quiet_macro.md");
  const d1 = loadCohort("funded/2026-07-14_192328829_d1_prb_rr6_funded_raw.md");
  const h0b = loadCohort("funded/2026-07-14_203605891_h0b_funded_d1_b1a.md");
  const h1b = loadCohort("funded/2026-07-14_203628734_h1b_funded_quiet_macro.md");
  const b1a = loadCohort("funded/2026-07-14_200010144_b1a_macro_a_tier_only.md");

  console.log("--- EVAL (speed to pass) ---");
  row("A0a PRB control", a0a);
  row("H0a Hybrid TV", h0a);
  row("H1a (same ledger!)", h1a);

  console.log("\n--- FUNDED (speed to payout) ---");
  row("D1 PRB RR6", d1);
  row("H0b Hybrid TV", h0b);
  row("H1b (same ledger!)", h1b);
  row("B1a Macro A only", b1a);

  // Identical check
  const sameH0H1 =
    JSON.stringify(h0a.tradePnls) === JSON.stringify(h1a.tradePnls);
  console.log(`\nH0a === H1a trade series? ${sameH0H1}`);
  console.log(
    `H0b === H1b trade series? ${JSON.stringify(h0b.tradePnls) === JSON.stringify(h1b.tradePnls)}`
  );

  console.log("\n=== TPT firm_mc detail (eval uses pass%; funded uses payout/recycle) ===\n");
  for (const [lab, c] of [
    ["A0a", a0a],
    ["H0a", h0a],
    ["D1", d1],
    ["H0b", h0b],
  ] as const) {
    console.log(lab, JSON.stringify(tptSnap(c)));
  }

  console.log("\n=== POST-HOC NEWS FILTER MC (true H1 from H0a TV export) ===\n");
  if (fs.existsSync(path.join(MATRIX, "hybrid-tv-h0a-h1-quiet-macro.csv"))) {
    const h0 = mcLedger("hybrid-tv-h0a.csv", "eval");
    const h1 = mcLedger("hybrid-tv-h0a-h1-quiet-macro.csv", "eval");
    console.log("H0a TV eval   ", h0);
    console.log("H1 quiet Macro", h1);
    console.log(
      `Δ pass ${(h1.pass - h0.pass).toFixed(1)}pt · Δ wPass ${((h1.wPass ?? 0) - (h0.wPass ?? 0)).toFixed(1)}w`
    );
  }
  if (fs.existsSync(path.join(MATRIX, "hybrid-tv-h0b-h1-quiet-macro.csv"))) {
    const h0 = mcLedger("hybrid-tv-h0b.csv", "funded");
    const h1 = mcLedger("hybrid-tv-h0b-h1-quiet-macro.csv", "funded");
    console.log("\nH0b TV funded ", h0);
    console.log("H1b quiet Mac ", h1);
  }

  console.log("\n=== NEWS SPLIT (Hybrid TV H0a Deep Backtest) ===\n");
  console.log(newsSplit("hybrid-tv-h0a.csv"));

  // Speed score: pass rate / weeks (higher = better: high pass, fast)
  console.log("\n=== SPEED SCORE (pass% / weeksToPass) — higher is better ===\n");
  for (const [lab, c] of [
    ["A0a", a0a],
    ["H0a", h0a],
    ["D1", d1],
    ["H0b", h0b],
    ["B1a", b1a],
  ] as const) {
    const s = tptSnap(c);
    const w = s.wPass || s.wPay || 99;
    const rate = c.phase === "funded" ? s.payout : s.pass;
    // normalize weird >100% storage
    const pct = rate > 100 ? rate / 1 : rate > 1.5 ? rate : rate;
    const score = w > 0 ? Math.round((pct / w) * 10) / 10 : 0;
    console.log(
      `${lab}: score=${score}  (${pct}% in ${w}w)  weeklyEdge=$${c.weeklyEdgeUsd}`
    );
  }
}

main();
