/** Registry of eval → funded strategy pairs for chained E[$/wk] analysis. */

export type ChainMode = "sequential" | "portfolio_parallel";

export interface StrategyChainPair {
  id: string;
  label: string;
  mode: ChainMode;
  evalPresetId: string;
  fundedPresetId: string;
  /** Parallel diversifier leg (portfolio_parallel only). */
  portfolioLegPresetId?: string;
  notes?: string;
}

export const STRATEGY_CHAIN_PAIRS: StrategyChainPair[] = [
  {
    id: "prb-a0a-d1",
    label: "PRB A0a → D1",
    mode: "sequential",
    evalPresetId: "matrix-a0a",
    fundedPresetId: "matrix-d1",
    notes: "Primary control — PRB eval → RR6 funded exits",
  },
  {
    id: "prb-a0b-d1",
    label: "PRB A0b → D1",
    mode: "sequential",
    evalPresetId: "matrix-a0b",
    fundedPresetId: "matrix-d1",
    notes: "BE@2R + PDH/PDL eval variant",
  },
  {
    id: "prb-a1c-d1",
    label: "PRB A1c → D1 (sprint)",
    mode: "sequential",
    evalPresetId: "matrix-a1c",
    fundedPresetId: "matrix-d1",
    notes: "Sprint eval — win cap $1,490",
  },
  {
    id: "hybrid-h0",
    label: "Hybrid H0a → H0b",
    mode: "sequential",
    evalPresetId: "matrix-h0a",
    fundedPresetId: "matrix-h0b",
    notes: "Hybrid sleeve TV exports",
  },
  {
    id: "hybrid-h1",
    label: "Hybrid H1a → H1b",
    mode: "sequential",
    evalPresetId: "matrix-h1a",
    fundedPresetId: "matrix-h1b",
    notes: "Quiet Macro filter",
  },
  {
    id: "portfolio-a0a-b1a",
    label: "Portfolio A0a→D1 + B1a",
    mode: "portfolio_parallel",
    evalPresetId: "matrix-a0a",
    fundedPresetId: "matrix-d1",
    portfolioLegPresetId: "matrix-b1a",
    notes: "PRB eval chain + Macro A-tier funded (0 same-day overlap)",
  },
];

/** Primary control baseline for sprint-eval comparison. */
export const CHAIN_BASELINE_PAIR_ID = "prb-a0a-d1";

export function chainPairById(id: string): StrategyChainPair | undefined {
  return STRATEGY_CHAIN_PAIRS.find((p) => p.id === id);
}

export function chainPairForPreset(presetId: string): StrategyChainPair | undefined {
  return STRATEGY_CHAIN_PAIRS.find(
    (p) =>
      p.evalPresetId === presetId ||
      p.fundedPresetId === presetId ||
      p.portfolioLegPresetId === presetId
  );
}

export function counterpartPresetId(presetId: string, pair?: StrategyChainPair): string | undefined {
  const p = pair ?? chainPairForPreset(presetId);
  if (!p) return undefined;
  if (p.evalPresetId === presetId) return p.fundedPresetId;
  if (p.fundedPresetId === presetId) return p.evalPresetId;
  if (p.portfolioLegPresetId === presetId) return p.evalPresetId;
  return undefined;
}

export function allPairsForSeries(seriesId: string): StrategyChainPair[] {
  const bySeries: Record<string, string[]> = {
    premium365: ["prb-a0a-d1", "prb-a0b-d1", "prb-a1c-d1", "portfolio-a0a-b1a"],
    "hybrid-sleeve": ["hybrid-h0", "hybrid-h1"],
  };
  const ids = bySeries[seriesId] ?? [];
  return ids.map((id) => chainPairById(id)).filter((p): p is StrategyChainPair => p != null);
}

export function evalPresetIdForPair(pair: StrategyChainPair): string {
  return pair.evalPresetId;
}

export function fundedPresetIdForPair(pair: StrategyChainPair): string {
  return pair.fundedPresetId;
}
