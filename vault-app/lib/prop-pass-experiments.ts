/** Prop-pass replay experiments — one input change per TV export → F4 LAB Monte Carlo. */

export interface PropPassPreset {
  id: string;
  label: string;
  tier: "control" | "tier1" | "tier2";
  description: string;
  /** Suggested F4 LAB dataset label after CSV upload */
  labLabel: string;
  /** Keys match PRB experiment fields in strategy-variants.ts */
  overrides: Record<string, string>;
  /** User marks done after export uploaded */
  status?: "pending" | "exported" | "in-lab";
}

/** 12-month control replay window (one year ago → today). */
export const REPLAY_12MO_CONTROL = {
  start: "2025-07-13",
  end: "2026-07-13",
  chart: "CME_MINI:MNQ1!",
  timeframe: "5m",
  pine: "pine/Powell_Rejection_Block_v1.pine",
  labPresetId: "prb-v15-12mo-control",
  labDatasetLabel: "PRB v1.5 — 12mo control Jul25–Jul26",
  checklist: [
    "PRB v1.5 locked defaults (BE-only, trail OFF, skip Mon, win 10:00–13:00)",
    "Direction filter: Both (control — no manual bias gate)",
    "Risk $400 · daily loss $800 · profit lock $1400",
    "Bar replay Jul 13 2025 → Jul 13 2026 on 5m MNQ",
    "Export Strategy Tester CSV → F4 LAB label: PRB v1.5 — 12mo control Jul25–Jul26",
    "Run Monte Carlo on TPT $50K (pass line $4,000)",
    "Eval exports: RR 6 + eval win cap $1490 OR RR 3.75 — check F4 consistency panel before trusting MC pass %",
    "Funded economics: RR 6 raw (eval cap OFF) — PRO has no payout consistency on TPT",
  ],
} as const;

export const PROP_PASS_STORAGE_KEY = "vault.propPass.status";

export const PROP_PASS_EXPERIMENTS: PropPassPreset[] = [
  {
    id: "12mo-control",
    label: "12-month control (START HERE)",
    tier: "control",
    description:
      "Full year PRB v1.5 locked profile — baseline pass rate, bust rate, and trades/week before any risk tweaks.",
    labLabel: REPLAY_12MO_CONTROL.labDatasetLabel,
    overrides: {
      riskUsd: "400",
      trailRegime: "OFF",
      biasMode: "Both",
      winStart: "1000",
      winEnd: "1300",
      rr: "5",
      beAtR: "1",
      dailyProfitLock: "1400",
    },
  },
  {
    id: "risk-300",
    label: "Risk $300 (fresh eval)",
    tier: "tier1",
    description: "Same 12mo window · smaller DD footprint per trade — more runway before daily stop.",
    labLabel: "PRB 12mo — risk $300",
    overrides: { riskUsd: "300" },
  },
  {
    id: "risk-350",
    label: "Risk $350",
    tier: "tier1",
    description: "Middle ground between $300 cushion and $400 full size.",
    labLabel: "PRB 12mo — risk $350",
    overrides: { riskUsd: "350" },
  },
  {
    id: "rr-6-funded",
    label: "RR 6R — funded economics (raw)",
    tier: "tier1",
    description:
      "Max TNL after PRO pass. Winners ≈ $2,400 at $400 risk — breaks TPT eval consistency if used on test account.",
    labLabel: "PRB 12mo — RR 6 funded raw",
    overrides: { rr: "6", evalMaxWinUsd: "0" },
  },
  {
    id: "eval-max-win-1490",
    label: "RR 6 + eval win cap $1,490 (TPT-safe)",
    tier: "tier1",
    description:
      "6R setup with hard TP cap ≈ $1,490/win for eval export. Plan 3+ winning days before $4k PRO request.",
    labLabel: "PRB 12mo — 6R eval cap 1490",
    overrides: { rr: "6", evalMaxWinUsd: "1490" },
  },
  {
    id: "rr-375-eval",
    label: "RR 3.75 — eval via target only",
    tier: "tier1",
    description:
      "Lower target R ($400 × 3.75 ≈ $1,500) without win-cap input — alternative to eval-max-win preset.",
    labLabel: "PRB 12mo — RR 3.75 eval",
    overrides: { rr: "3.75", evalMaxWinUsd: "0" },
  },
  {
    id: "profit-lock-1200",
    label: "Profit lock $1,200",
    tier: "tier2",
    description: "Blocks re-entry only — does not trim a single full TP. Use eval win cap for consistency.",
    labLabel: "PRB 12mo — profit lock 1200",
    overrides: { riskUsd: "400", dailyProfitLock: "1200" },
  },
  {
    id: "bias-short-febmar",
    label: "Short-only (Feb–Mar spot)",
    tier: "tier2",
    description:
      "Re-export Feb–Mar 2026 only with Direction filter Short only — tests manual bias fix for 0-for-9 long bleed.",
    labLabel: "PRB Feb–Mar 26 — Short only",
    overrides: { biasMode: "Short only", riskUsd: "400" },
  },
];

export function propPassTvSyncLines(
  preset: PropPassPreset,
  baseDefaults: Record<string, string>
): string[] {
  return Object.entries(preset.overrides).map(([key, val]) => {
    const def = baseDefaults[key] ?? "—";
    return `${key}: ${def} → ${val}`;
  });
}

export function mergePropPassOverrides(
  current: Record<string, string>,
  preset: PropPassPreset
): Record<string, string> {
  return { ...current, ...preset.overrides };
}
