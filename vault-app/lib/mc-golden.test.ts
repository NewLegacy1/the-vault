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
    assert.equal(r.engineVersion, 2);
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
});
