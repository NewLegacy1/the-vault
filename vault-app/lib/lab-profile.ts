/** Strategy variants for Lab studies — define BEFORE running Monte Carlo. */
export interface StrategyPreset {
  id: string;
  label: string;
  version: string;
  config: string;
  defaultRegimes: string[];
}

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "prb-v110-12mo-control",
    label: "PRB v1.10 — 12mo control (Aug 25–Jul 26)",
    version: "v1.10",
    config: "BE +1R retest audit · MNQ sizing · Both bias · $400 risk · BE-only · ghost autopsy",
    defaultRegimes: ["baseline", "be-only"],
  },
  {
    id: "prb-v15-12mo-control",
    label: "PRB v1.5 — 12mo control (Jul 25–Jul 26)",
    version: "v1.5",
    config: "Locked live profile · Both bias · $400 risk · BE +1R · 5m MNQ full year replay",
    defaultRegimes: ["baseline", "be-only"],
  },
  {
    id: "prb-v15-be2r-pdh",
    label: "PRB v1.5 — BE@2R + Auto PDH/PDL (Jul 14)",
    version: "v1.5",
    config: "BE at +2R (was +1R) · Direction filter Auto PDH/PDL draw · $400 risk · skip Mon",
    defaultRegimes: ["baseline", "be-only"],
  },
  {
    id: "prb-v15-be-live",
    label: "PRB v1.5 — BE-only (live locked)",
    version: "v1.5",
    config: "BE +1R · trail OFF · limit retest · 1/day · skip Mon · Both bias manual",
    defaultRegimes: ["baseline", "be-only"],
  },
  {
    id: "prb-v15-trail",
    label: "PRB v1.5 — Trail 2.0/1.5 regime",
    version: "v1.5",
    config: "Give-back regime trail toggle ON · otherwise locked v1.5",
    defaultRegimes: ["trail-on", "give-back"],
  },
  {
    id: "prb-v15-bias-long",
    label: "PRB v1.5 — Long-only bias",
    version: "v1.5",
    config: "Direction filter Long only · BE-only · trail OFF",
    defaultRegimes: ["be-only"],
  },
  {
    id: "prb-v15-bias-short",
    label: "PRB v1.5 — Short-only bias",
    version: "v1.5",
    config: "Direction filter Short only · BE-only · trail OFF",
    defaultRegimes: ["be-only"],
  },
  {
    id: "prb-v14-be",
    label: "PRB v1.4 — BE-only (pre-declutter)",
    version: "v1.4",
    config: "v1.4 pine · BE +1R · trail OFF",
    defaultRegimes: ["be-only"],
  },
  {
    id: "datahl-v0-cisd",
    label: "Data H/L v0 — manual replay (CISD 1m)",
    version: "v0",
    config: "8:30 formation · first soup → opposing pool · CISD trigger · BE +1R",
    defaultRegimes: ["news", "be-only"],
  },
  {
    id: "custom",
    label: "Custom experiment",
    version: "custom",
    config: "User-defined variant — describe in hypothesis field",
    defaultRegimes: [],
  },
];

export interface LabStudy {
  presetId: string;
  customLabel: string;
  regimes: string[];
  /** What you're testing vs baseline — saved to Obsidian. */
  hypothesis: string;
}

export const DEFAULT_STUDY: LabStudy = {
  presetId: "prb-v15-be-live",
  customLabel: "",
  regimes: ["baseline", "be-only"],
  hypothesis: "",
};

export function presetById(id: string): StrategyPreset | undefined {
  return STRATEGY_PRESETS.find((p) => p.id === id);
}

/** Display + Obsidian variant string from study config. */
export function studyVariantName(study: LabStudy): string {
  const preset = presetById(study.presetId);
  if (!preset) return study.customLabel.trim() || "Unnamed study";
  if (study.presetId === "custom") return study.customLabel.trim() || "Custom experiment";
  return preset.label;
}

export function studyReady(study: LabStudy): boolean {
  if (study.presetId === "custom") return study.customLabel.trim().length > 0;
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
