/**
 * Phase-0 MNQ morning regime tags (Dual46 May walk).
 * Pre-registered — do not retune bands mid-walk.
 * Source: strategies/knowledge/quant/mnq-relevant-regime-variables.md
 */

/** Prior-day VIX close bands (predictive — never same-day close). */
export type VixBand = "lt16" | "16-20" | "gt20";

/** OR 09:30–10:00 ÷ 20-session median — frozen terciles. */
export type Or30Band = "lt0.75" | "0.75-1.25" | "gt1.25";

/** Frozen oil-shock rule (adjust once only, then lock). */
export const OIL_SHOCK_1D_PCT = 3;
export const OIL_SHOCK_5D_PCT = 8;

/** High-impact prints in this NY window collide with Dual46 arm timing. */
export const RELEASE10_START_HHMM = 950;
export const RELEASE10_END_HHMM = 1010;

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

export function or30BandFromRatio(or30ratio: number): Or30Band {
  if (!Number.isFinite(or30ratio) || or30ratio < 0) {
    throw new Error(`or30BandFromRatio: invalid ratio ${or30ratio}`);
  }
  if (or30ratio < 0.75) return "lt0.75";
  if (or30ratio <= 1.25) return "0.75-1.25";
  return "gt1.25";
}

export function or30BandLabel(band: Or30Band): string {
  switch (band) {
    case "lt0.75":
      return "<0.75";
    case "0.75-1.25":
      return "0.75–1.25";
    case "gt1.25":
      return ">1.25";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

/** Parse "10:00" / "1000" / "9:55" → HHMM int, or null. */
export function parseHhmm(time: string | undefined | null): number | null {
  if (!time) return null;
  const cleaned = time.trim().replace(":", "");
  if (!/^\d{3,4}$/.test(cleaned)) return null;
  const n = parseInt(cleaned, 10);
  if (!Number.isFinite(n) || n < 0 || n > 2359) return null;
  return n;
}

/** True if any high-impact event time falls in 09:50–10:10 NY. */
export function release10FromEventTimes(
  times: Array<string | undefined | null>
): boolean {
  return times.some((t) => {
    const hhmm = parseHhmm(t);
    return hhmm != null && hhmm >= RELEASE10_START_HHMM && hhmm <= RELEASE10_END_HHMM;
  });
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
