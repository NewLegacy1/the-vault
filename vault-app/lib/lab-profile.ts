/** Strategy family and prop-firm phase for Obsidian cohort organization. */
export type StrategyFamily = "prb" | "macro" | "datahl" | "hybrid" | "custom";
export type StrategyPhase = "eval" | "funded" | "combined" | "research";
/** premium365 = control matrix; experimental = new series under test */
export type MatrixTrack = "premium365" | "experimental";
/** Ledger provenance for Lab upload / filter UX */
export type PresetDataSource = "tv-export" | "derived-b0" | "prebuilt-ledger";

export interface StrategyPreset {
  id: string;
  label: string;
  version: string;
  config: string;
  defaultRegimes: string[];
  family: StrategyFamily;
  phase: StrategyPhase;
  matrixBranch?: string;
  /** Show in Lab matrix grid */
  inMatrix?: boolean;
  matrixTrack?: MatrixTrack;
  /**
   * Experiment series for matrix grouping (see experiment-series.ts).
   * Premium control study = "premium365"; hybrid sleeve = "hybrid-sleeve"; etc.
   */
  seriesId?: string;
  /** tv-export = TV run; derived-b0 = filter from Macro B0; prebuilt-ledger = vault-built CSV */
  dataSource?: PresetDataSource;
  uploadHint?: string;
  defaultHypothesis?: string;
}

function premiumRow(
  partial: Omit<StrategyPreset, "matrixTrack" | "seriesId" | "inMatrix"> &
    Partial<Pick<StrategyPreset, "matrixTrack" | "seriesId" | "inMatrix" | "dataSource">>
): StrategyPreset {
  return {
    inMatrix: true,
    matrixTrack: "premium365",
    seriesId: "premium365",
    dataSource: "tv-export",
    ...partial,
  };
}

/** Premium 365d matrix — control study shown in F4 LAB dropdown. */
export const LAB_STRATEGY_PRESETS: StrategyPreset[] = [
  premiumRow({
    id: "matrix-a0a",
    label: "A0a · PRB control",
    version: "v1.5",
    matrixBranch: "A0a",
    config: "BE@1R · Both · trail OFF · $400 · RR 5",
    defaultRegimes: ["baseline", "be-only"],
    family: "prb",
    phase: "eval",
    uploadHint: "Your A0a TV CSV — or matrix/prb-a0a-3y.csv (3y) / prb-matrix-a0a.csv (1y).",
    defaultHypothesis: "3y / premium eval baseline · max trades ≥ trade count",
  }),
  premiumRow({
    id: "matrix-a0b",
    label: "A0b · PRB BE@2R + PDH/PDL",
    version: "v1.5",
    matrixBranch: "A0b",
    config: "BE@2R · Auto PDH/PDL · $400 · RR 5",
    defaultRegimes: ["baseline", "be-only"],
    family: "prb",
    phase: "eval",
    uploadHint: "Your A0b TV CSV (one file).",
    defaultHypothesis: "Premium 365d BE@2R+PDH",
  }),
  premiumRow({
    id: "matrix-a1c",
    label: "A1c · PRB BE@2R + PDH + cap $1,490",
    version: "v1.5",
    matrixBranch: "A1c",
    config: "A0b · RR 6 · eval max win cap $1,490",
    defaultRegimes: ["baseline", "be-only"],
    family: "prb",
    phase: "eval",
    uploadHint: "Your A1c TV CSV (one file).",
    defaultHypothesis: "TPT consistency-safe eval",
  }),
  premiumRow({
    id: "matrix-d1",
    label: "D1 · PRB RR6 funded raw",
    version: "v1.5",
    matrixBranch: "D1",
    config: "Control · RR 6 · eval cap OFF",
    defaultRegimes: ["runner", "baseline"],
    family: "prb",
    phase: "funded",
    uploadHint: "Your D1 TV CSV — or matrix/prb-d1-3y.csv.",
    defaultHypothesis: "PRO economics — no consistency · max trades ≥ trade count",
  }),
  premiumRow({
    id: "matrix-b0",
    label: "B0 · Macro v1.4 full book",
    version: "v1.4",
    matrixBranch: "B0",
    config: "CE confirm · tiered · $800 · pivot 5",
    defaultRegimes: ["baseline", "be-only"],
    family: "macro",
    phase: "funded",
    uploadHint:
      "Full Macro TV CSV (v1.4 or Macro_v2) — or matrix/macro-v2-full-3y.csv. Then pick B1a for A-tier filter.",
    defaultHypothesis: "Macro full book · feed for B1* derived filters",
  }),
  premiumRow({
    id: "matrix-b1a",
    label: "B1a · Macro A-tier only",
    version: "v1.4",
    matrixBranch: "B1a",
    config: "Filtered: tier A only",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "Derived from B0 — upload Macro full CSV on B0 first, then select B1a.",
    defaultHypothesis: "Funded primary — A-tier only",
    dataSource: "derived-b0",
  }),
  premiumRow({
    id: "matrix-b1b",
    label: "B1b · Macro A + H (no A+)",
    version: "v1.4",
    matrixBranch: "B1b",
    config: "Filtered: tiers A + H",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "macro-matrix-b1b.csv or filter from B0.",
    defaultHypothesis: "Drop A+ — keep A and H",
    dataSource: "derived-b0",
  }),
  premiumRow({
    id: "matrix-b1c",
    label: "B1c · Macro A+ only",
    version: "v1.4",
    matrixBranch: "B1c",
    config: "Filtered: tier A+ only",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "macro-matrix-b1c.csv or filter from B0.",
    defaultHypothesis: "Isolate A+ tier",
    dataSource: "derived-b0",
  }),
  premiumRow({
    id: "matrix-b3a",
    label: "B3a · Macro A-tier @ 0.5× risk",
    version: "v1.4",
    matrixBranch: "B3a",
    config: "A-tier · PnL × 0.5",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "macro-matrix-b3a.csv or filter from B0.",
    defaultHypothesis: "Halved risk on A-tier",
    dataSource: "derived-b0",
  }),
  premiumRow({
    id: "matrix-b3b",
    label: "B3b · Macro full book @ 0.5× risk",
    version: "v1.4",
    matrixBranch: "B3b",
    config: "Full book · PnL × 0.5",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "macro-matrix-b3b.csv or filter from B0.",
    defaultHypothesis: "Halved risk full book",
    dataSource: "derived-b0",
  }),
];

function hybridRow(
  partial: Omit<
    StrategyPreset,
    "matrixTrack" | "seriesId" | "inMatrix" | "family" | "dataSource" | "defaultRegimes"
  > &
    Partial<Pick<StrategyPreset, "defaultRegimes" | "dataSource">> & { phase: StrategyPhase }
): StrategyPreset {
  return {
    family: "hybrid",
    inMatrix: true,
    matrixTrack: "experimental",
    seriesId: "hybrid-sleeve",
    dataSource: "tv-export",
    ...partial,
    defaultRegimes: partial.defaultRegimes ?? ["baseline"],
  };
}

function macroIncomeRow(
  partial: Omit<
    StrategyPreset,
    "matrixTrack" | "seriesId" | "inMatrix" | "family" | "dataSource" | "defaultRegimes" | "version"
  > &
    Partial<Pick<StrategyPreset, "defaultRegimes" | "dataSource" | "version">> & { phase: StrategyPhase }
): StrategyPreset {
  return {
    family: "macro",
    version: partial.version ?? "v2",
    inMatrix: true,
    matrixTrack: "experimental",
    seriesId: "macro-income",
    dataSource: "tv-export",
    ...partial,
    defaultRegimes: partial.defaultRegimes ?? ["baseline", "be-only"],
  };
}

/** New strategies under development — add rows here; they appear in matrix + dropdown. */
export const EXPERIMENTAL_STRATEGY_PRESETS: StrategyPreset[] = [
  macroIncomeRow({
    id: "matrix-m0",
    label: "M0 · Macro $400 · BE OFF",
    matrixBranch: "M0",
    phase: "funded",
    config: "Macro_Model_v2 · Profile M0 · v1.4 entries · $400 · BE OFF",
    uploadHint:
      "TV: Macro_Model_v2 · Profile M0 → Deep Backtest List of Trades CSV.",
    defaultHypothesis: "Control — $400 alone (no BE) vs v1.4 $800 parent",
  }),
  macroIncomeRow({
    id: "matrix-m1",
    label: "M1 · Macro $400 · BE@2R",
    matrixBranch: "M1",
    phase: "funded",
    config: "Macro_Model_v2 · Profile M1 · v1.4 entries · $400 · BE@2R",
    uploadHint:
      "TV: Macro_Model_v2 · Profile M1 → Deep Backtest List of Trades CSV. PRIMARY Track 4.1 test.",
    defaultHypothesis: "BE@2R kills symmetric-loss trail busts at $400 risk",
  }),
  macroIncomeRow({
    id: "matrix-m2",
    label: "M2 · Volume · $400 · BE@2R",
    matrixBranch: "M2",
    phase: "funded",
    config: "Macro_Model_v2 · Profile M2 · TS optional · $400 · BE@2R",
    defaultRegimes: ["runner", "baseline", "be-only"],
    uploadHint:
      "TV: Macro_Model_v2 · Profile M2 → Deep Backtest CSV. Volume unlock after M1 settles.",
    defaultHypothesis: "Frequency unlock — TS optional + same management as M1",
  }),
  hybridRow({
    id: "matrix-h0a",
    label: "H0a · Eval · A0a + B1a",
    version: "h0",
    matrixBranch: "H0a",
    phase: "eval",
    config: "EVAL · PRB BE@1R RR5 ∪ Macro A · Hybrid_Sleeve_v0",
    uploadHint:
      "TV: Hybrid_Sleeve_v0 · Profile H0a → export CSV. Or upload matrix/hybrid-h0a.csv.",
    defaultHypothesis: "Eval pass rate — PRB control + Macro A sleeve",
  }),
  hybridRow({
    id: "matrix-h0b",
    label: "H0b · Funded · D1 + B1a",
    version: "h0",
    matrixBranch: "H0b",
    phase: "funded",
    config: "FUNDED · PRB RR6 ∪ Macro A · Hybrid_Sleeve_v0",
    defaultRegimes: ["runner", "baseline"],
    uploadHint:
      "TV: Hybrid_Sleeve_v0 · Profile H0b → export CSV. Or upload matrix/hybrid-h0b-3y.csv.",
    defaultHypothesis: "Funded payout / recycle — D1 RR + Macro A",
  }),
  hybridRow({
    id: "matrix-h2a",
    label: "H2a · Eval · Macro 9:50 only",
    version: "h2",
    matrixBranch: "H2a",
    phase: "eval",
    config: "EVAL · PRB ∪ Macro A · 9:50 ON · 10:50 OFF",
    uploadHint:
      "TV: Hybrid_Sleeve · Macro 9:50 ON · 10:50 OFF. Or matrix/hybrid-h2a-3y.csv.",
    defaultHypothesis: "Drop Macro 10:50 window — safer vs H0a",
  }),
  hybridRow({
    id: "matrix-h1a",
    label: "H1a · Eval · quiet Macro",
    version: "h1",
    matrixBranch: "H1a",
    phase: "eval",
    config: "EVAL · A0a ∪ Macro A quiet-only · Hybrid_Sleeve_v0",
    defaultRegimes: ["baseline", "news"],
    uploadHint:
      "TV: Hybrid_Sleeve_v0 · Profile H1a (Macro red skip ON). Or matrix/hybrid-h1a.csv.",
    defaultHypothesis: "Eval — Macro skips red-folder; PRB unrestricted",
  }),
  hybridRow({
    id: "matrix-h1b",
    label: "H1b · Funded · quiet Macro",
    version: "h1",
    matrixBranch: "H1b",
    phase: "funded",
    config: "FUNDED · D1 ∪ Macro A quiet-only · Hybrid_Sleeve_v0",
    defaultRegimes: ["runner", "baseline", "news"],
    uploadHint:
      "TV: Hybrid_Sleeve_v0 · Profile H1b (Macro red skip ON). Or matrix/hybrid-h1b.csv.",
    defaultHypothesis: "Funded — Macro quiet-only + D1 RR6",
  }),
  {
    id: "datahl-v0-cisd",
    label: "X0a · Data H/L v0",
    version: "v0",
    matrixBranch: "X0a",
    config: "8:30 CISD · manual replay days",
    defaultRegimes: ["news"],
    family: "datahl",
    phase: "research",
    inMatrix: true,
    matrixTrack: "experimental",
    seriesId: "datahl",
    dataSource: "tv-export",
    uploadHint: "Data H/L replay CSV (F7 tags CPI/NFP days first).",
    defaultHypothesis: "News-window edge vs PRB 10am",
  },
  {
    id: "custom",
    label: "Custom experiment",
    version: "custom",
    matrixBranch: "custom",
    config: "User-defined Pine variant",
    defaultRegimes: [],
    family: "custom",
    phase: "research",
    inMatrix: true,
    matrixTrack: "experimental",
    seriesId: "custom",
    dataSource: "tv-export",
    uploadHint: "Any TV export — name in hypothesis.",
    defaultHypothesis: "",
  },
];

/** Archived presets — lookup only (old cohort notes), not shown in Lab. */
const LEGACY_STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "prb-v110-12mo-control",
    label: "PRB v1.10 — 12mo control",
    version: "v1.10",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "prb",
    phase: "eval",
  },
  {
    id: "prb-v15-12mo-control",
    label: "PRB v1.5 — 12mo control",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "prb",
    phase: "eval",
  },
  {
    id: "prb-v15-be2r-pdh",
    label: "PRB v1.5 — BE@2R + PDH/PDL",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "prb",
    phase: "eval",
  },
  {
    id: "prb-v15-be-live",
    label: "PRB v1.5 — BE-only live",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "prb",
    phase: "eval",
  },
  {
    id: "prb-v15-trail",
    label: "PRB v1.5 — Trail",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["trail-on"],
    family: "prb",
    phase: "funded",
  },
  {
    id: "prb-v15-bias-long",
    label: "PRB v1.5 — Long only",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["be-only"],
    family: "prb",
    phase: "research",
  },
  {
    id: "prb-v15-bias-short",
    label: "PRB v1.5 — Short only",
    version: "v1.5",
    config: "legacy",
    defaultRegimes: ["be-only"],
    family: "prb",
    phase: "research",
  },
  {
    id: "prb-v14-be",
    label: "PRB v1.4 — BE-only",
    version: "v1.4",
    config: "legacy",
    defaultRegimes: ["be-only"],
    family: "prb",
    phase: "eval",
  },
  {
    id: "macro-v0-journal",
    label: "Macro v0 journal",
    version: "v0",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
  },
  {
    id: "macro-v0-pine",
    label: "Macro v1.3",
    version: "v1.3",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
  },
  {
    id: "macro-v14-ce",
    label: "Macro v1.4 CE",
    version: "v1.4",
    config: "legacy",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
  },
];

/** All presets (Lab + legacy) for cohort resolution. */
export const STRATEGY_PRESETS: StrategyPreset[] = [
  ...LAB_STRATEGY_PRESETS,
  ...EXPERIMENTAL_STRATEGY_PRESETS,
  ...LEGACY_STRATEGY_PRESETS,
];

export interface LabStudy {
  presetId: string;
  customLabel: string;
  regimes: string[];
  hypothesis: string;
}

export const DEFAULT_STUDY: LabStudy = {
  presetId: "matrix-a0a",
  customLabel: "",
  regimes: ["baseline", "be-only"],
  hypothesis: "Premium 365d eval baseline",
};

export function isMatrixPreset(id: string): boolean {
  return id.startsWith("matrix-");
}

/** All presets shown in F4 LAB strategy dropdown. */
export function labDropdownPresets(): StrategyPreset[] {
  return [...LAB_STRATEGY_PRESETS, ...EXPERIMENTAL_STRATEGY_PRESETS];
}

/** Rows for the matrix results grid at top of Lab. */
export function matrixPresets(): StrategyPreset[] {
  return [...LAB_STRATEGY_PRESETS, ...EXPERIMENTAL_STRATEGY_PRESETS].filter(
    (p) => p.inMatrix !== false && Boolean(p.matrixBranch)
  );
}

/** Group matrix rows by experiment series (order from experiment-series.ts). */
export function matrixPresetsBySeries(): { seriesId: string; presets: StrategyPreset[] }[] {
  const rows = matrixPresets();
  const by = new Map<string, StrategyPreset[]>();
  for (const p of rows) {
    const sid = p.seriesId ?? (p.matrixTrack === "experimental" ? "custom" : "premium365");
    const list = by.get(sid) ?? [];
    list.push(p);
    by.set(sid, list);
  }
  // Lazy import avoided — keep order via known ids + leftovers
  const ORDER = ["premium365", "hybrid-sleeve", "macro-income", "datahl", "custom"];
  const seen = new Set<string>();
  const out: { seriesId: string; presets: StrategyPreset[] }[] = [];
  for (const id of ORDER) {
    const presets = by.get(id);
    if (presets?.length) {
      out.push({ seriesId: id, presets });
      seen.add(id);
    }
  }
  for (const [id, presets] of by) {
    if (!seen.has(id) && presets.length) out.push({ seriesId: id, presets });
  }
  return out;
}

export function isLabPresetId(id: string): boolean {
  return labDropdownPresets().some((p) => p.id === id);
}

export function presetById(id: string): StrategyPreset | undefined {
  return STRATEGY_PRESETS.find((p) => p.id === id);
}

export function studyVariantName(study: LabStudy): string {
  const preset = presetById(study.presetId);
  if (!preset) return study.customLabel.trim() || "Unnamed study";
  if (study.presetId === "custom") return study.customLabel.trim() || "Custom experiment";
  return preset.label;
}

export function studyReady(study: LabStudy): boolean {
  return !!presetById(study.presetId);
}

export const REGIME_PRESETS = [
  "baseline",
  "runner",
  "give-back",
  "chop",
  "news",
  "trend",
  "trail-on",
  "be-only",
] as const;
