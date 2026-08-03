import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bootstrapEvCi,
  computeRiskGeometry,
  deriveScratchThreshold,
} from "./risk-geometry";

describe("risk-geometry", () => {
  it("computes EV and geometry for mixed book", () => {
    const pnls = [400, -200, 400, -200, 0];
    const g = computeRiskGeometry(pnls);
    assert.equal(g.n, 5);
    assert.equal(g.wins, 2);
    assert.equal(g.losses, 2);
    assert.ok(Math.abs(g.tradeEv - 80) < 0.01);
    assert.ok(g.rr > 0);
    // only 2 losses → modal risk not computable → $50 fallback
    assert.equal(g.scratchThreshold, 50);
  });

  it("derives scratch threshold as 10% of modal risk ($25 buckets)", () => {
    // 5 losses clustered around $150 → modal bucket 150 → threshold 15
    const pnls = [-150, -155, -145, -150, -160, 20, 10, 200];
    assert.equal(deriveScratchThreshold(pnls), 15);
    const g = computeRiskGeometry(pnls);
    assert.equal(g.scratchThreshold, 15);
    assert.equal(g.wins, 2); // 20 and 200 clear the $15 line
    assert.equal(g.losses, 5);
    assert.equal(g.scratches, 1); // 10 is a scratch
  });

  it("falls back to $50 when too few losses to find modal risk", () => {
    const pnls = [-30, 10, 20, 60];
    assert.equal(deriveScratchThreshold(pnls), 50);
    const g = computeRiskGeometry(pnls);
    assert.equal(g.scratchThreshold, 50);
    assert.equal(g.wins, 1);
    assert.equal(g.losses, 0);
    assert.equal(g.scratches, 3);
  });

  it("falls back to $50 when modal loss bucket rounds to $0", () => {
    const pnls = [-5, -6, -4, -7, -5, 100, 200];
    assert.equal(deriveScratchThreshold(pnls), 50);
  });

  it("honors an explicit scratchThreshold override", () => {
    const pnls = [40, -40, 60, -60];
    const g = computeRiskGeometry(pnls, { scratchThreshold: 50 });
    assert.equal(g.scratchThreshold, 50);
    assert.equal(g.wins, 1);
    assert.equal(g.losses, 1);
    assert.equal(g.scratches, 2);
  });

  it("bootstrap CI contains mean for constant series", () => {
    const pnls = [10, 10, 10, 10];
    const ci = bootstrapEvCi(pnls, 500, 0.05, () => 0.5);
    assert.equal(ci.mean, 10);
    assert.ok(ci.ciLow <= 10 && ci.ciHigh >= 10);
  });
});
