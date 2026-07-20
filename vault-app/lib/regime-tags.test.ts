import { describe, expect, it } from "vitest";
import {
  oilShockFromClMoves,
  vixBandFromClose,
  vixBandLabel,
} from "./regime-tags";

describe("vixBandFromClose", () => {
  it("bands prior-day VIX into pre-registered terciles", () => {
    expect(vixBandFromClose(15.99)).toBe("lt16");
    expect(vixBandFromClose(16)).toBe("16-20");
    expect(vixBandFromClose(20)).toBe("16-20");
    expect(vixBandFromClose(20.01)).toBe("gt20");
  });

  it("labels bands for UI", () => {
    expect(vixBandLabel("lt16")).toBe("<16");
    expect(vixBandLabel("16-20")).toBe("16–20");
    expect(vixBandLabel("gt20")).toBe(">20");
  });
});

describe("oilShockFromClMoves", () => {
  it("fires on |1d|≥3 or |5d|≥8", () => {
    expect(oilShockFromClMoves(3, 0)).toBe(true);
    expect(oilShockFromClMoves(-3.1, 0)).toBe(true);
    expect(oilShockFromClMoves(2.9, 8)).toBe(true);
    expect(oilShockFromClMoves(2.9, 7.9)).toBe(false);
  });
});
