/** Strategy family and prop-firm phase for Obsidian cohort organization. */
export type StrategyFamily = "prb" | "macro" | "datahl" | "hybrid" | "custom";
export type StrategyPhase = "eval" | "funded" | "combined" | "research";
/** premium365 = current matrix; experimental = new strategies under test */
export type MatrixTrack = "premium365" | "experimental";

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
  /** tv-export = separate TradingView run; derived-b0 = filter from Macro B0 */
  dataSource?: "tv-export" | "derived-b0";
  uploadHint?: string;
  defaultHypothesis?: string;
}

/** Premium 365d matrix — the only presets shown in F4 LAB dropdown. */
export const LAB_STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "matrix-a0a",
    label: "A0a · PRB control",
    version: "v1.5",
    matrixBranch: "A0a",
    config: "BE@1R · Both · trail OFF · $400 · RR 5",
    defaultRegimes: ["baseline", "be-only"],
    family: "prb",
    phase: "eval",
    uploadHint: "Your A0a TV CSV (one file).",
    defaultHypothesis: "Premium 365d eval baseline",
    inMatrix: true,
    matrixTrack: "premium365",
    dataSource: "tv-export",
  },
  {
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
  },
  {
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
  },
  {
    id: "matrix-d1",
    label: "D1 · PRB RR6 funded raw",
    version: "v1.5",
    matrixBranch: "D1",
    config: "Control · RR 6 · eval cap OFF",
    defaultRegimes: ["runner", "baseline"],
    family: "prb",
    phase: "funded",
    uploadHint: "Your D1 TV CSV (one file).",
    defaultHypothesis: "PRO economics — no consistency",
  },
  {
    id: "matrix-b0",
    label: "B0 · Macro v1.4 full book",
    version: "v1.4",
    matrixBranch: "B0",
    config: "CE confirm · tiered · $800 · pivot 5",
    defaultRegimes: ["baseline", "be-only"],
    family: "macro",
    phase: "funded",
    uploadHint: "Your B0 Macro TV CSV (one file).",
    defaultHypothesis: "Macro v1.4 premium 365d full",
    dataSource: "tv-export",
  },
  {
    id: "matrix-b1a",
    label: "B1a · Macro A-tier only",
    version: "v1.4",
    matrixBranch: "B1a",
    config: "Filtered: tier A only",
    defaultRegimes: ["baseline"],
    family: "macro",
    phase: "funded",
    uploadHint: "macro-matrix-b1a.csv or filter from B0.",
    defaultHypothesis: "Funded primary — A-tier only",
    dataSource: "derived-b0",
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

/** New strategies under development — add rows here; they appear in matrix + dropdown. */
export const EXPERIMENTAL_STRATEGY_PRESETS: StrategyPreset[] = [
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
