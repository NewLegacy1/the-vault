import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bootstrapEvCi, computeRiskGeometry } from "./risk-geometry";

describe("risk-geometry", () => {
  it("computes EV and geometry for mixed book", () => {
    const pnls = [400, -200, 400, -200, 0];
    const g = computeRiskGeometry(pnls);
    assert.equal(g.n, 5);
    assert.equal(g.wins, 2);
    assert.equal(g.losses, 2);
    assert.ok(Math.abs(g.tradeEv - 80) < 0.01);
    assert.ok(g.rr > 0);
  });

  it("bootstrap CI contains mean for constant series", () => {
    const pnls = [10, 10, 10, 10];
    const ci = bootstrapEvCi(pnls, 500, 0.05, () => 0.5);
    assert.equal(ci.mean, 10);
    assert.ok(ci.ciLow <= 10 && ci.ciHigh >= 10);
  });
});
