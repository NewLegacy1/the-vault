/**
 * In-sample price-permutation test (Donchian demo on synthetic OHLC).
 * Proves Masters-style tooling; not a live Vault strategy.
 *
 * Usage: npx tsx scripts/analyze-is-permutation.ts
 */
import fs from "fs";
import path from "path";
import {
  optimizeDonchian,
  permuteBars,
  syntheticOhlc,
} from "../lib/permute-bars";

const OUT = path.join(
  __dirname,
  "../data/tv-exports/is-permutation-donchian-demo.json"
);
const N_BARS = 4000;
const N_PERM = 200; // demo budget; production ≥1000 when feasible
const LOOKBACKS = [10, 15, 20, 25, 30, 40, 50];

function main() {
  const real = syntheticOhlc(N_BARS, 7);
  const realOpt = optimizeDonchian(real, LOOKBACKS);

  let better = 0;
  const permPfs: number[] = [];
  for (let i = 0; i < N_PERM; i++) {
    const perm = permuteBars(real, 0, 1000 + i);
    const opt = optimizeDonchian(perm, LOOKBACKS);
    permPfs.push(opt.pf);
    if (opt.pf >= realOpt.pf) better++;
  }
  permPfs.sort((a, b) => a - b);
  const quasiP = better / N_PERM;

  const report = {
    title: "IS price-permutation demo — Donchian on synthetic OHLC",
    note: "Demo of tooling only. Do not trade. Production edges use real OHLC + SCORECARD.",
    nBars: N_BARS,
    nPerm: N_PERM,
    lookbacks: LOOKBACKS,
    real: realOpt,
    quasiP,
    permPfMedian: permPfs[Math.floor(N_PERM / 2)],
    passHint: "IS target roughly quasiP < 0.01 with N≥1000 when feasible",
    vsLabPropMc:
      "This resamples OHLC paths + re-optimizes. Lab MC resamples trade PnLs for prop barriers.",
  };

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    `real PF=${realOpt.pf.toFixed(3)} lb=${realOpt.lookback} quasiP=${quasiP.toFixed(3)}`
  );
  console.log("Wrote", OUT);
}

main();
