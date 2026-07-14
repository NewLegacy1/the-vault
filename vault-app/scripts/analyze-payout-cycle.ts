/**
 * Business-loop economics: pass → payout → recycle → expected $/calendar week.
 * Usage: npx tsx scripts/analyze-payout-cycle.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { payoutConfigForFirm } from "../lib/firm-payout-economics";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const SIMS = 2000;
const MAX = 80;

const BOOKS = [
  { id: "A0a", file: "prb-matrix-a0a.csv", phase: "eval" as const },
  { id: "A0b", file: "prb-matrix-a0b.csv", phase: "eval" as const },
  { id: "D1", file: "prb-matrix-d1.csv", phase: "funded" as const },
  { id: "H0a", file: "hybrid-tv-h0a.csv", phase: "eval" as const },
  { id: "H0b", file: "hybrid-tv-h0b.csv", phase: "funded" as const },
  { id: "B1a", file: "macro-matrix-b1a.csv", phase: "funded" as const },
  { id: "M2", file: "macro-v2-m2-volume.csv", phase: "funded" as const },
];

function run(file: string, phase: "eval" | "funded") {
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8"));
  const rule = ruleById("tpt50")!;
  const payoutEconomics = payoutConfigForFirm("tpt50", phase)!;
  const funded =
    phase === "funded"
      ? {
          payoutProfitTarget: 2000,
          recycleProfitCap: 5000,
          accountRecycling: true,
          payoutConsistencyPct: 0,
        }
      : {
          payoutProfitTarget: 2000,
          recycleProfitCap: 5000,
          accountRecycling: true,
          payoutConsistencyPct: 0,
        };

  const r = runMonteCarlo({
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    sims: SIMS,
    maxTrades: MAX,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistency:
      phase === "eval"
        ? { consistencyPct: rule.consistencyPct ?? 50, minDays: rule.minDays ?? 5 }
        : undefined,
    funded,
    simMode: phase === "funded" ? "funded_only" : "eval_path",
    payoutEconomics,
    fees: {
      evalFee: rule.evalFee ?? 170,
      activationFee: rule.activationFee ?? 130,
      monthlyFee: phase === "eval" ? rule.monthlyFee ?? 180 : 0,
      payoutBuffer: 2000,
    },
  });

  const eco = r.economics;
  const passPct = Math.round(r.passRate * 1000) / 10;
  const payoutPct = Math.round(eco.payoutRate * 1000) / 10;
  const bustPct = Math.round(r.bustRate * 1000) / 10;
  const recyclePct =
    r.recycleRate != null ? Math.round(r.recycleRate * 1000) / 10 : null;
  const payoutGivenPass =
    r.passRate > 0.01 ? Math.round((eco.payoutRate / r.passRate) * 1000) / 10 : null;

  // Expected calendar $/week: expected net per account / median weeks through one payout cycle
  const weeks = eco.weeksToPayoutP50 ?? eco.weeksToPassP50;
  const expectPerAcct = eco.expectedNetPerAccountUsd;
  const perWeek =
    weeks && weeks > 0 ? Math.round(expectPerAcct / weeks) : null;

  return {
    n: trades.length,
    passPct,
    payoutPct,
    bustPct,
    recyclePct,
    payoutGivenPass,
    medianWithdraw: eco.medianWithdrawnUsd,
    medianNetOnPayout: eco.medianNetPerAccountUsd,
    expectNetPerAcct: expectPerAcct,
    weeksToPass: eco.weeksToPassP50,
    weeksToPayout: eco.weeksToPayoutP50,
    expectPerWeek: perWeek,
    expectedAccounts: eco.expectedAccounts,
  };
}

function main() {
  console.log("=== TPT $50K BUSINESS LOOP (pass → payout → recycle) ===\n");
  console.log(
    "Primary metric: expectedNetPerAccount / weeksToPayoutP50 = $ calendar-week after fees\n"
  );

  for (const b of BOOKS) {
    if (!fs.existsSync(path.join(MATRIX, b.file))) {
      console.log(b.id, "MISSING", b.file);
      continue;
    }
    const m = run(b.file, b.phase);
    console.log(
      JSON.stringify(
        {
          book: b.id,
          mode: b.phase,
          ...m,
        },
        null,
        2
      )
    );
  }

  console.log(`
=== HOW TO READ ===
passPct          % of sims that clear eval (or survive into funded path)
payoutPct        % of ALL sims that take ≥1 withdrawal (includes fails)
payoutGivenPass  P(payout | pass) — of survivors, who actually extract
medianWithdraw   median gross trader take-home on paths that paid
expectNetPerAcct mean $ after fees across ALL sims (busts = -$fees)
expectPerWeek    expectNetPerAcct / weeksToPayout — calendar $/wk business rate
recyclePct       funded-only: % that completed ≥1 withdraw+reset before $5k PRO+

Fee math: you care about expectPerWeek > 0 after buying accounts. A 50% pass
with tiny payouts can lose to a 40% pass with larger/faster extracts.
`);
}

main();
