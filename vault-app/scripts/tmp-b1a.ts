import fs from "fs";
import { parseLabLedger } from "../lib/csv";
import { applyMacroMatrixFilter } from "../lib/macro-matrix";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { payoutConfigForFirm } from "../lib/firm-payout-economics";
import { derivePayoutCycle } from "../lib/payout-cycle";

const t = parseLabLedger(fs.readFileSync("data/tv-exports/matrix/macro-v2-full-3y.csv", "utf8"));
console.log("sample", t.slice(0, 3).map((x) => ({ sig: x.signal, tier: x.tier })));
const a = applyMacroMatrixFilter(t, "b1a");
console.log("B1a A-tier", a.length, "net", Math.round(a.reduce((s, x) => s + x.pnl, 0)));

function go(label: string, file: string, phase: "eval" | "funded") {
  const trades = parseLabLedger(fs.readFileSync(file, "utf8"));
  const rule = ruleById("tpt50")!;
  const r = runMonteCarlo({
    trades: trades.map((x) => x.pnl),
    dates: trades.map((x) => x.date),
    sims: 2000,
    maxTrades: 220,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistency:
      phase === "eval"
        ? { consistencyPct: rule.consistencyPct ?? 50, minDays: rule.minDays ?? 5 }
        : undefined,
    funded: {
      payoutProfitTarget: 2000,
      recycleProfitCap: 5000,
      accountRecycling: true,
      payoutConsistencyPct: 0,
    },
    simMode: phase === "funded" ? "funded_only" : "eval_path",
    payoutEconomics: payoutConfigForFirm("tpt50", phase)!,
    fees: {
      evalFee: rule.evalFee ?? 170,
      activationFee: rule.activationFee ?? 130,
      monthlyFee: phase === "eval" ? rule.monthlyFee ?? 180 : 0,
      payoutBuffer: 2000,
    },
  });
  const c = derivePayoutCycle(r);
  console.log(
    label.padEnd(12),
    `n=${trades.length}`,
    `pass=${(r.passRate * 100).toFixed(1)}%`,
    `bust=${(r.bustRate * 100).toFixed(1)}%`,
    `eWk=$${c.expectedUsdPerCalendarWeek}`,
    `wPay=${c.weeksToPayoutP50}`
  );
}

const M = "data/tv-exports/matrix";
go("A0a", `${M}/prb-a0a-3y.csv`, "eval");
go("D1", `${M}/prb-d1-3y.csv`, "funded");
go("H0a", `${M}/hybrid-h0a-3y.csv`, "eval");
go("H0b", `${M}/hybrid-h0b-3y.csv`, "funded");
go("H2a", `${M}/hybrid-h2a-3y.csv`, "eval");
const rule = ruleById("tpt50")!;
const r = runMonteCarlo({
  trades: a.map((x) => x.pnl),
  dates: a.map((x) => x.date),
  sims: 2000,
  maxTrades: 220,
  passAt: rule.passAt,
  trailingDD: rule.trailingDD,
  funded: { payoutProfitTarget: 2000, recycleProfitCap: 5000, accountRecycling: true, payoutConsistencyPct: 0 },
  simMode: "funded_only",
  payoutEconomics: payoutConfigForFirm("tpt50", "funded")!,
  fees: { evalFee: rule.evalFee ?? 170, activationFee: rule.activationFee ?? 130, monthlyFee: 0, payoutBuffer: 2000 },
});
const c = derivePayoutCycle(r);
console.log("B1a".padEnd(12), `n=${a.length}`, `pass=${(r.passRate * 100).toFixed(1)}%`, `bust=${(r.bustRate * 100).toFixed(1)}%`, `eWk=${c.expectedUsdPerCalendarWeek}`, `wPay=${c.weeksToPayoutP50}`);

