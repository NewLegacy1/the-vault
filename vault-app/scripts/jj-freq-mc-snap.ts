import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const files = ["jj-f1-mnq-1m-12m.csv", "jj-f2-mnq-1m-12m.csv", "jj-f3-mnq-1m-12m.csv"];
const rule = ruleById("apex50-intraday")!;

for (const f of files) {
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, f), "utf8"));
  const pnls = trades.map((t) => t.pnl);
  let streak = 0;
  let maxL = 0;
  let maxWin = -1e99;
  let maxLoss = 1e99;
  let sum = 0;
  for (const p of pnls) {
    sum += p;
    maxWin = Math.max(maxWin, p);
    maxLoss = Math.min(maxLoss, p);
    if (p < 0) {
      streak += 1;
      maxL = Math.max(maxL, streak);
    } else {
      streak = 0;
    }
  }
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const mc = runMonteCarlo({
    trades: pnls,
    dates: trades.map((t) => t.date),
    sims: 2000,
    maxTrades: 120,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    simMode: "eval_path",
    fees: {
      evalFee: rule.evalFee ?? 131,
      activationFee: rule.activationFee ?? 79,
      monthlyFee: 0,
      payoutBuffer: 2000,
    },
    funded: { payoutProfitTarget: 2000, accountRecycling: false },
  });
  console.log(
    [
      f,
      `n=${pnls.length}`,
      `WR=${((wins.length / pnls.length) * 100).toFixed(1)}%`,
      `sum=$${sum.toFixed(0)}`,
      `EV=$${(sum / pnls.length).toFixed(2)}`,
      `maxWin=$${maxWin.toFixed(0)}`,
      `maxLoss=$${maxLoss.toFixed(0)}`,
      `maxL=${maxL}`,
      `avgW=$${wins.length ? (wins.reduce((a, b) => a + b, 0) / wins.length).toFixed(0) : 0}`,
      `avgL=$${losses.length ? (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(0) : 0}`,
      `ApexPass=${(mc.passRate * 100).toFixed(1)}%`,
      `ApexBust=${(mc.bustRate * 100).toFixed(1)}%`,
      `wksP50=${mc.economics?.weeksToPassP50 ?? "null"}`,
    ].join(" | ")
  );
}
