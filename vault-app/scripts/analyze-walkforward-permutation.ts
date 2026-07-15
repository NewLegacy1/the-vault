/**
 * Walk-forward + WF price-permutation (Donchian demo on synthetic OHLC).
 *
 * Usage: npx tsx scripts/analyze-walkforward-permutation.ts
 */
import fs from "fs";
import path from "path";
import {
  donchianSignal,
  optimizeDonchian,
  permuteBars,
  profitFactor,
  strategyLogReturns,
  syntheticOhlc,
  type OhlcBar,
} from "../lib/permute-bars";

const OUT = path.join(
  __dirname,
  "../data/tv-exports/wf-permutation-donchian-demo.json"
);
const N_BARS = 5000;
const TRAIN = 2000;
const STEP = 250;
const N_PERM = 80; // WF is expensive; demo budget
const LOOKBACKS = [10, 15, 20, 25, 30, 40];

function walkForwardPf(bars: OhlcBar[]): number {
  const pos = new Array(bars.length).fill(0);
  let nextTrain = TRAIN;
  let lb = LOOKBACKS[2]!;
  for (let i = TRAIN; i < bars.length; i++) {
    if (i === nextTrain || i === TRAIN) {
      const trainSlice = bars.slice(Math.max(0, i - TRAIN), i);
      lb = optimizeDonchian(trainSlice, LOOKBACKS).lookback;
      nextTrain = i + STEP;
    }
    const window = bars.slice(Math.max(0, i - lb), i + 1);
    const sig = donchianSignal(window, lb);
    pos[i] = sig[sig.length - 1] ?? 0;
  }
  return profitFactor(strategyLogReturns(bars, pos));
}

function main() {
  const real = syntheticOhlc(N_BARS, 11);
  const realPf = walkForwardPf(real);

  let better = 0;
  const permPfs: number[] = [];
  for (let i = 0; i < N_PERM; i++) {
    const perm = permuteBars(real, TRAIN, 2000 + i);
    const pf = walkForwardPf(perm);
    permPfs.push(pf);
    if (pf >= realPf) better++;
  }
  const quasiP = better / N_PERM;
  permPfs.sort((a, b) => a - b);

  const report = {
    title: "WF price-permutation demo — Donchian synthetic",
    note: "Demo only. WF-perm permutes bars after first train fold.",
    nBars: N_BARS,
    train: TRAIN,
    step: STEP,
    nPerm: N_PERM,
    realWalkForwardPf: realPf,
    quasiP,
    permPfMedian: permPfs[Math.floor(N_PERM / 2)],
    passHint:
      "Lenient ~0.05 on short OOS; ~0.01 on multi-year — measures not fiddled targets",
  };

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(`WF PF=${realPf.toFixed(3)} quasiP=${quasiP.toFixed(3)}`);
  console.log("Wrote", OUT);
}

main();
