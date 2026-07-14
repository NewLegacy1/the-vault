import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeChainEv,
  payoutCycleFromMc,
  runMcForPreset,
  sprintScore,
} from "./chain-ev";
import { chainPairById } from "./strategy-chain";
import { runMonteCarlo } from "./monte-carlo";

const SAMPLE_TRADES = [400, -200, 350, -150, 500, -300, 250, 200, -400, 600];
const SAMPLE_DATES = [
  "2025-01-06",
  "2025-01-07",
  "2025-01-08",
  "2025-01-09",
  "2025-01-10",
  "2025-01-13",
  "2025-01-14",
  "2025-01-15",
  "2025-01-16",
  "2025-01-17",
];

describe("chain-ev", () => {
  it("sprintScore divides pass by weeks", () => {
    assert.equal(sprintScore(79, 12), 6.6);
    assert.equal(sprintScore(50, 0), null);
  });

  it("computeChainEv combines eval pass with funded expected net", () => {
    const pair = chainPairById("prb-a0a-d1")!;
    const evalMetrics = {
      passPct: 80,
      payoutPct: 70,
      payoutGivenPassPct: 87.5,
      bustPct: 20,
      recyclePct: null,
      medianWithdrawnUsd: 3800,
      medianNetPerAccountUsd: 3200,
      expectedNetPerAccountUsd: 500,
      weeksToPassP50: 12,
      weeksToPayoutP50: 18,
      expectedUsdPerCalendarWeek: 28,
      expectedAccounts: 1.3,
    };
    const fundedMetrics = {
      passPct: 72,
      payoutPct: 72,
      payoutGivenPassPct: 100,
      bustPct: 28,
      recyclePct: 40,
      medianWithdrawnUsd: 3800,
      medianNetPerAccountUsd: 2500,
      expectedNetPerAccountUsd: 1800,
      weeksToPassP50: 6,
      weeksToPayoutP50: 6,
      expectedUsdPerCalendarWeek: 300,
      expectedAccounts: 1.4,
    };

    const result = computeChainEv({
      pair,
      evalMetrics,
      fundedMetrics,
      method: "cohort_pair",
      fees: { evalFee: 180, activationFee: 130, monthlyFee: 180 },
    });

    assert.equal(result.weeksChainP50, 18);
    assert.ok(result.expectedNetPerAccountUsd > 0);
    assert.ok(result.expectedUsdPerCalendarWeek != null && result.expectedUsdPerCalendarWeek > 0);
    assert.equal(result.sprintScore, sprintScore(80, 12));
  });

  it("live dual-run produces chain from matrix presets", () => {
    const evalMc = runMcForPreset({
      presetId: "matrix-a0a",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 400,
      maxTrades: 40,
      payoutBuffer: 1000,
    });
    const fundedMc = runMcForPreset({
      presetId: "matrix-d1",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 400,
      maxTrades: 40,
      payoutBuffer: 1000,
    });
    assert.ok(evalMc && fundedMc);

    const pair = chainPairById("prb-a0a-d1")!;
    const result = computeChainEv({
      pair,
      evalMetrics: payoutCycleFromMc(evalMc),
      fundedMetrics: payoutCycleFromMc(fundedMc),
      method: "same_ledger_approx",
    });

    assert.ok(result.expectedUsdPerCalendarWeek != null);
    assert.ok(result.weeksChainP50 != null);
  });

  it("portfolio_parallel adds parallel leg weekly rate", () => {
    const pair = chainPairById("portfolio-a0a-b1a")!;
    const evalMetrics = {
      passPct: 79,
      payoutPct: 70,
      payoutGivenPassPct: 88.6,
      bustPct: 21,
      recyclePct: null,
      medianWithdrawnUsd: 3800,
      medianNetPerAccountUsd: 3000,
      expectedNetPerAccountUsd: 1900,
      weeksToPassP50: 12,
      weeksToPayoutP50: 18,
      expectedUsdPerCalendarWeek: 105,
      expectedAccounts: 1.3,
    };
    const fundedMetrics = {
      passPct: 72,
      payoutPct: 72,
      payoutGivenPassPct: 100,
      bustPct: 28,
      recyclePct: 35,
      medianWithdrawnUsd: 1200,
      medianNetPerAccountUsd: 900,
      expectedNetPerAccountUsd: 700,
      weeksToPassP50: 5,
      weeksToPayoutP50: 5,
      expectedUsdPerCalendarWeek: 140,
      expectedAccounts: 1.4,
    };
    const portfolioLeg = {
      passPct: 45,
      payoutPct: 45,
      payoutGivenPassPct: 100,
      bustPct: 55,
      recyclePct: null,
      medianWithdrawnUsd: 800,
      medianNetPerAccountUsd: 400,
      expectedNetPerAccountUsd: 200,
      weeksToPassP50: 20,
      weeksToPayoutP50: 20,
      expectedUsdPerCalendarWeek: 10,
      expectedAccounts: 2.2,
    };

    const result = computeChainEv({
      pair,
      evalMetrics,
      fundedMetrics,
      portfolioLegMetrics: portfolioLeg,
      method: "cohort_pair",
    });

    assert.equal(
      result.combinedUsdPerCalendarWeek,
      (result.expectedUsdPerCalendarWeek ?? 0) + (result.portfolioLegUsdPerWeek ?? 0)
    );
    assert.ok(result.warnings.some((w) => w.includes("Parallel accounts")));
  });
});
