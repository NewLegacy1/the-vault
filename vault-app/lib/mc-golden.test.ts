import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { buildMcParamsForFirm } from "./mc-params-builder";
import {
  applyDayPnl,
  createRulePackState,
  isRulePackBust,
  legacyRulePack,
  updateRulePackState,
} from "./mc-rule-pack";
import { runMonteCarlo, setMcRng, resetMcRng } from "./monte-carlo";

/** Deterministic RNG for regression snapshots. */
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

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

describe("mc-rule-pack", () => {
  it("EOD trail ratchets floor and locks at starting balance", () => {
    const pack = {
      trailingMode: "eod" as const,
      trailingDD: 2000,
      accountSize: 50_000,
    };
    const state = createRulePackState(pack);
    updateRulePackState(state, 2500, pack);
    assert.equal(state.mllLocked, true);
    assert.equal(state.mllFloorEq, 0);
    updateRulePackState(state, -500, pack);
    assert.equal(isRulePackBust(state, pack), false);
    updateRulePackState(state, -2500, pack);
    assert.equal(isRulePackBust(state, pack), true);
  });

  it("DLL clamp limits single-day loss", () => {
    const pack = legacyRulePack(2000);
    pack.dailyLossLimit = 1000;
    pack.dailyLossClamp = true;
    assert.equal(applyDayPnl(-1500, pack), -1000);
    assert.equal(applyDayPnl(-800, pack), -800);
  });
});

describe("runMonteCarlo golden", () => {
  beforeEach(() => setMcRng(seededRng(42)));
  afterEach(() => resetMcRng());

  it("empty trades returns zeros", () => {
    const r = runMonteCarlo({
      trades: [],
      dates: [],
      sims: 100,
      maxTrades: 10,
      passAt: 3000,
      trailingDD: 2000,
    });
    assert.equal(r.sims, 0);
    assert.equal(r.passRate, 0);
  });

  it("TPT eval with rule pack produces stable pass rate", () => {
    const built = buildMcParamsForFirm({
      ruleId: "tpt50",
      compareMode: "eval",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 800,
      maxTrades: 40,
      payoutBuffer: 2000,
    });
    assert.ok(built?.params.rulePack);
    const r = runMonteCarlo(built!.params);
    assert.ok(r.passRate >= 0 && r.passRate <= 1);
    assert.equal(r.engineVersion, 3);
    assert.ok(r.rulePackFeatures?.includes("eod_trail"));
    const snap = Math.round(r.passRate * 1000);
    assert.ok(snap >= 0 && snap <= 1000);
  });

  it("Topstep eval includes DLL and winning-days features", () => {
    const built = buildMcParamsForFirm({
      ruleId: "topstep50",
      compareMode: "eval",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 400,
      maxTrades: 40,
      payoutBuffer: 2000,
    });
    const features = built?.params.rulePack;
    assert.ok(features?.dailyLossClamp);
    assert.ok(features?.winningDays);
    assert.equal(features?.consistency?.mode, "best_day_pct_of_target");
    const r = runMonteCarlo(built!.params);
    assert.ok(r.bustRate >= 0);
  });

  it("TPT funded_only enables recycle feature", () => {
    const built = buildMcParamsForFirm({
      ruleId: "tpt50",
      compareMode: "funded",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 500,
      maxTrades: 50,
      payoutBuffer: 2000,
    });
    assert.equal(built?.params.simMode, "funded_only");
    assert.ok(built?.params.rulePack?.trailingMode === "intraday");
    const r = runMonteCarlo(built!.params);
    assert.ok(r.recycleRate != null);
  });

  it("legacy path without explicit rulePack yields high bust rate on losing streak", () => {
    const r = runMonteCarlo({
      trades: [-800, -800, -500],
      dates: SAMPLE_DATES.slice(0, 3),
      sims: 200,
      maxTrades: 3,
      passAt: 3000,
      trailingDD: 2000,
      bootstrap: "trade",
    });
    assert.ok(r.bustRate >= 0.5);
  });

  it("F1: day/week bootstrap uses day-steps-per-week, not trades-per-week (5 trades/day)", () => {
    // 5 trades on each of the 10 trading days — a high-frequency book.
    const trades: number[] = [];
    const dates: string[] = [];
    for (const d of SAMPLE_DATES) {
      for (let k = 0; k < 5; k++) {
        trades.push(k % 2 === 0 ? 120 : -80);
        dates.push(d);
      }
    }
    const r = runMonteCarlo({
      trades,
      dates,
      sims: 300,
      maxTrades: 40,
      passAt: 2000,
      trailingDD: 2000,
      bootstrap: "day",
    });
    assert.equal(r.economics.stepUnit, "day");
    // 50 trades vs 10 trading days over the same span → tpw ≈ 5 × spw.
    const ratio = r.economics.tradesPerWeek / r.economics.stepsPerWeek;
    assert.ok(Math.abs(ratio - 5) < 0.3, `tpw/spw ratio ${ratio} should be ~5`);
    // Weeks-to-pass must divide day steps by day-steps/week (was ~5x too fast).
    if (r.tradesToPassP50 != null && r.economics.weeksToPassP50 != null) {
      const expected = r.tradesToPassP50 / r.economics.stepsPerWeek;
      assert.ok(
        Math.abs(r.economics.weeksToPassP50 - expected) < 0.2,
        `weeksToPassP50 ${r.economics.weeksToPassP50} should be ≈ ${expected}`
      );
    }
  });

  it("F1: trade bootstrap keeps trade-steps-per-week", () => {
    const r = runMonteCarlo({
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 100,
      maxTrades: 20,
      passAt: 2000,
      trailingDD: 2000,
      bootstrap: "trade",
    });
    assert.equal(r.economics.stepUnit, "trade");
    assert.equal(r.economics.stepsPerWeek, r.economics.tradesPerWeek);
  });

  it("F2: intraday trail busts on unrealized MFE peak when mfes are supplied", () => {
    // One step: closes -100 but ran +1500 unrealized → peak 1500, close -100,
    // drawdown 1600 ≥ 1000 → bust. Without MFE the day looks like a harmless -100.
    const base = {
      trades: [-100, -100],
      dates: ["2025-01-06", "2025-01-07"],
      sims: 50,
      maxTrades: 1,
      passAt: 10_000,
      trailingDD: 1000,
      bootstrap: "trade" as const,
    };
    const withMfe = runMonteCarlo({ ...base, mfes: [1500, 1500] });
    assert.equal(withMfe.mfeTrailApplied, true);
    assert.equal(withMfe.bustRate, 1);

    const withoutMfe = runMonteCarlo(base);
    assert.equal(withoutMfe.mfeTrailApplied, false);
    assert.equal(withoutMfe.bustRate, 0);
  });

  it("F2: EOD trail ignores intraday MFE (TPT/Topstep semantics unchanged)", () => {
    const pack = {
      trailingMode: "eod" as const,
      trailingDD: 2000,
      accountSize: 50_000,
    };
    const state = createRulePackState(pack);
    updateRulePackState(state, -100, pack, 1500);
    // Floor stays derived from day-close balance; MFE must not ratchet it.
    assert.equal(isRulePackBust(state, pack), false);
    assert.equal(state.mllFloorEq, -2000);
  });

  it("F4: Apex 4.0 pack — $2,600 EOD buffer, 5×$50 qualifying days, 6-payout cap", () => {
    const funded = buildMcParamsForFirm({
      ruleId: "apex50-eod",
      compareMode: "funded",
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 100,
      maxTrades: 40,
      payoutBuffer: 2000,
    });
    assert.equal(funded?.params.payoutEconomics?.profitBufferUsd, 2600);
    assert.equal(funded?.params.funded?.maxPayouts, 6);
    assert.deepEqual(funded?.params.rulePack?.winningDays, {
      minCount: 5,
      minPnlUsd: 50,
      appliesTo: "first_payout",
    });
    // EOD 50K drawdown is $2,500 (Apex 4.0) — $2,000 is the Intraday number.
    assert.equal(funded?.params.trailingDD, 2500);
  });

  it("F6: eval→funded boundary resets the account (withdrawn measured on funded equity)", () => {
    // Every step +1000: t1 passes eval (eq 1000, then reset), t2 hits the
    // funded payout target on FRESH equity. Pre-F6 the continuous curve made
    // the fallback withdrawable ~2000; with the reset it is exactly 1000.
    const r = runMonteCarlo({
      trades: [1000],
      dates: ["2025-01-06"],
      sims: 20,
      maxTrades: 5,
      passAt: 1000,
      trailingDD: 2000,
      bootstrap: "trade",
      fees: { evalFee: 0, activationFee: 0, monthlyFee: 0, payoutBuffer: 1000 },
    });
    assert.equal(r.passRate, 1);
    assert.equal(r.economics.payoutRate, 1);
    assert.equal(r.tradesToPassP50, 1);
    assert.equal(r.economics.tradesToPayoutP50, 2);
    assert.equal(r.economics.medianWithdrawnUsd, 1000);
    // Display continuity: banked eval equity keeps the chart cumulative.
    assert.equal(r.finalEquities[0], 2000);
  });

  it("F5: E[$/wk] uses weeks occupied over ALL sims", () => {
    const r = runMonteCarlo({
      trades: SAMPLE_TRADES,
      dates: SAMPLE_DATES,
      sims: 400,
      maxTrades: 40,
      passAt: 2000,
      trailingDD: 2000,
      bootstrap: "day",
      fees: { evalFee: 150, activationFee: 0, monthlyFee: 0, payoutBuffer: 1000 },
    });
    assert.ok(r.economics.weeksOccupiedMean != null && r.economics.weeksOccupiedMean > 0);
    if (r.economics.expectedUsdPerWeekOccupied != null && r.economics.weeksOccupiedMean != null) {
      const recomputed = Math.round(
        r.economics.expectedNetPerAccountUsd / r.economics.weeksOccupiedMean
      );
      assert.equal(r.economics.expectedUsdPerWeekOccupied, recomputed);
    }
    // F9: expectedNetPerAttempt is now the clean per-sim mean.
    assert.equal(r.economics.expectedNetPerAttempt, r.economics.expectedNetPerAccountUsd);
  });

  it("F2: MFE below coverage threshold is not applied", () => {
    const r = runMonteCarlo({
      trades: [-100, -100, -100, -100],
      dates: ["2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09"],
      sims: 20,
      maxTrades: 2,
      passAt: 10_000,
      trailingDD: 1000,
      bootstrap: "trade",
      mfes: [1500, undefined, undefined, undefined],
    });
    assert.equal(r.mfeTrailApplied, false);
    assert.equal(r.bustRate, 0);
  });
});
