/** Morning bias requirements — distilled from SOP §3 (Finding Bias). */

export interface BiasRequirement {
  id: string;
  text: string;
}

/** Top-down read order before 10:00. */
export const FINDING_BIAS_FLOW: BiasRequirement[] = [
  { id: "daily", text: "Daily — which H/L are we closest to?" },
  { id: "h4", text: "4H — same read, finer structure" },
  { id: "h1", text: "1H — key opens marked (18:00 · midnight · 10:00)" },
  { id: "manip", text: "What gets manipulated into first?" },
  { id: "draw", text: "Draw on liquidity — highs or lows?" },
];

/** Mechanical rules + TV sync. */
export const FINDING_BIAS_RULES: BiasRequirement[] = [
  { id: "pdh", text: "PDH souped + close back below → draw to lows → Short only in TV" },
  { id: "pdl", text: "PDL souped + close back above → draw to highs → Long only in TV" },
  { id: "sync", text: "Morning bias and Pine Direction filter must match — never Both on a one-sided read" },
  { id: "smt", text: "Daily SMT vs ES — which index is protecting an extreme?" },
  { id: "done", text: "Draw already satisfied overnight? → today's signal is suspect" },
  { id: "range", text: "Range day? Both sides can soup — don't force one story" },
];

/** Map morning read → Pine Direction filter. */
export const BIAS_TO_FILTER: { bias: string; filter: string }[] = [
  { bias: "Draw to lows / bearish", filter: "Short only" },
  { bias: "Draw to highs / bullish", filter: "Long only" },
  { bias: "No clear read / ranging", filter: "Both (demand A+ at Take it?)" },
];
