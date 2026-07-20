import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  oilShockFromClMoves,
  or30BandFromRatio,
  or30BandLabel,
  release10FromEventTimes,
  vixBandFromClose,
  vixBandLabel,
} from "./regime-tags";

describe("vixBandFromClose", () => {
  it("bands prior-day VIX into pre-registered terciles", () => {
    assert.equal(vixBandFromClose(15.99), "lt16");
    assert.equal(vixBandFromClose(16), "16-20");
    assert.equal(vixBandFromClose(20), "16-20");
    assert.equal(vixBandFromClose(20.01), "gt20");
  });

  it("labels bands for UI", () => {
    assert.equal(vixBandLabel("lt16"), "<16");
    assert.equal(vixBandLabel("16-20"), "16–20");
    assert.equal(vixBandLabel("gt20"), ">20");
  });
});

describe("or30BandFromRatio", () => {
  it("bands OR ratio into frozen terciles", () => {
    assert.equal(or30BandFromRatio(0.74), "lt0.75");
    assert.equal(or30BandFromRatio(0.75), "0.75-1.25");
    assert.equal(or30BandFromRatio(1.25), "0.75-1.25");
    assert.equal(or30BandFromRatio(1.26), "gt1.25");
  });

  it("labels bands for UI", () => {
    assert.equal(or30BandLabel("lt0.75"), "<0.75");
    assert.equal(or30BandLabel("0.75-1.25"), "0.75–1.25");
    assert.equal(or30BandLabel("gt1.25"), ">1.25");
  });
});

describe("release10FromEventTimes", () => {
  it("flags high-impact prints in 09:50–10:10 NY", () => {
    assert.equal(release10FromEventTimes(["10:00"]), true);
    assert.equal(release10FromEventTimes(["0950"]), true);
    assert.equal(release10FromEventTimes(["8:30", "14:00"]), false);
    assert.equal(release10FromEventTimes(["10:15"]), false);
  });
});

describe("oilShockFromClMoves", () => {
  it("fires on |1d|≥3 or |5d|≥8", () => {
    assert.equal(oilShockFromClMoves(3, 0), true);
    assert.equal(oilShockFromClMoves(-3.1, 0), true);
    assert.equal(oilShockFromClMoves(2.9, 8), true);
    assert.equal(oilShockFromClMoves(2.9, 7.9), false);
  });
});
