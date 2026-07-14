/** MC passRate/bustRate are 0–1; UI and cohort notes use 0–100 percent. */
export function mcRateToPct(rate: number): number {
  return Math.round(rate * 1000) / 10;
}

/**
 * Normalize MC percent fields from cohort storage (0–1 rates, ×10 bugs, or proper 0–100).
 */
export function normalizeMcPct(pct: number, refPct?: number): number {
  if (!Number.isFinite(pct)) return 0;
  if (pct > 0 && pct <= 1) return mcRateToPct(pct);
  if (refPct != null && refPct > 0 && refPct <= 1) refPct = mcRateToPct(refPct);
  if (refPct != null && refPct > 15 && pct > 0 && pct < 15) {
    return Math.round(pct * 10 * 10) / 10;
  }
  if (refPct != null && refPct > 20 && pct > 0 && pct < refPct * 0.25) {
    return Math.round(pct * 100) / 10;
  }
  return pct;
}
