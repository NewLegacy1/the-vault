import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { auditLabIngest } from "./ingest-audit";
import { inventoryChainBreadth } from "./breadth-inventory";
import { computeImplementationShortfall } from "./implementation-shortfall";
import { chainPairById } from "./strategy-chain";
import type { McResult } from "./monte-carlo";

function emptyMc(over: Partial<McResult> & { economics: McResult["economics"] }): McResult {
  return {
    sims: 100,
    passRate: 0.4,
    bustRate: 0.5,
    timeoutRate: 0.1,
    tradesToPassP50: 40,
    tradesToPassP90: 80,
    worstDrawdownP95: 2000,
    bands: { p05: [], p25: [], p50: [], p75: [], p95: [] },
    samplePaths: [],
    finalEquities: [],
    outcomeHist: [],
    bootstrap: "week",
    consistencyAware: false,
    ...over,
  };
}

describe("ingest-audit", () => {
  it("blocks empty books", () => {
    const a = auditLabIngest({ trades: [], dates: [] });
    assert.equal(a.canRunMc, false);
    assert.equal(a.severity, "block");
  });

  it("warns on large calendar gaps", () => {
    const a = auditLabIngest({
      trades: [100, -50],
      dates: ["2023-01-01", "2024-06-01"],
    });
    assert.ok(a.maxGapDays != null && a.maxGapDays > 45);
    assert.ok(a.findings.some((f) => f.id === "gap_warn" || f.id === "gap_block"));
  });
});

describe("breadth-inventory", () => {
  it("counts A0a→D1 as sequential same-family breadth≈1", () => {
    const pair = chainPairById("prb-a0a-d1")!;
    const b = inventoryChainBreadth(pair);
    assert.equal(b.kind, "sequential_same_family");
    assert.equal(b.effectiveBreadth, 1);
  });

  it("counts portfolio A0a+B1a as independent", () => {
    const pair = chainPairById("portfolio-a0a-b1a")!;
    const b = inventoryChainBreadth(pair);
    assert.equal(b.kind, "independent");
    assert.equal(b.effectiveBreadth, 2);
  });
});

describe("implementation-shortfall", () => {
  it("computes gross vs net gap", () => {
    const mc = emptyMc({
      economics: {
        tradesPerWeek: 1,
        weeksToPassP50: 10,
        weeksToPassP90: 20,
        weeksToPayoutP50: 12,
        weeksToPayoutP90: 24,
        tradesToPayoutP50: 40,
        payoutRate: 0.3,
        expectedAccounts: 2,
        accountsFor90Pct: 5,
        evalCostPerAttempt: 150,
        expectedNetPerAttempt: 0,
        expectedNetUntilPass: 0,
        medianNetOnPass: 500,
        payoutAt: 3000,
        medianNetPerAccountUsd: 400,
        expectedNetPerAccountUsd: 240,
        medianWithdrawnUsd: 500,
      },
    });
    const s = computeImplementationShortfall({
      tradeEv: 100,
      tradesPerWeek: 1,
      mc,
      netUsdPerWeek: 20,
    });
    assert.equal(s.grossUsdPerWeek, 100);
    assert.equal(s.netUsdPerWeek, 20);
    assert.equal(s.shortfallUsdPerWeek, 80);
  });
});
