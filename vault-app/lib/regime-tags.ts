/**
 * Phase-0 MNQ morning regime tags (Dual46 May walk).
 * Pre-registered — do not retune bands mid-walk.
 * Source: strategies/knowledge/quant/vol-regime-dependence-setup-frequency.md
 *          strategies/knowledge/quant/macro-regime-context-data-options.md
 */

/** Prior-day VIX close bands (predictive — never same-day close). */
export type VixBand = "lt16" | "16-20" | "gt20";

/** Frozen oil-shock rule (adjust once only, then lock). */
export const OIL_SHOCK_1D_PCT = 3;
export const OIL_SHOCK_5D_PCT = 8;

export const MEGA_CAP_TICKERS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "NVDA",
] as const;

export function vixBandFromClose(vixPrevClose: number): VixBand {
  if (!Number.isFinite(vixPrevClose)) {
    throw new Error(`vixBandFromClose: invalid VIX ${vixPrevClose}`);
  }
  if (vixPrevClose < 16) return "lt16";
  if (vixPrevClose <= 20) return "16-20";
  return "gt20";
}

export function vixBandLabel(band: VixBand): string {
  switch (band) {
    case "lt16":
      return "<16";
    case "16-20":
      return "16–20";
    case "gt20":
      return ">20";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

/**
 * CL oil shock from absolute percent moves.
 * True if |1-day %| ≥ 3 OR |5-day %| ≥ 8 (frozen).
 */
export function oilShockFromClMoves(
  oneDayPct: number,
  fiveDayPct: number
): boolean {
  return (
    Math.abs(oneDayPct) >= OIL_SHOCK_1D_PCT ||
    Math.abs(fiveDayPct) >= OIL_SHOCK_5D_PCT
  );
}
