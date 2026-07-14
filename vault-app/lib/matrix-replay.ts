import type { StrategyPreset } from "./lab-profile";
import { presetById } from "./lab-profile";
import {
  STRATEGY_VARIANTS,
  variantById,
  buildTvSyncLines,
  type StrategyVariant,
} from "./strategy-variants";

/** Premium 365d deep backtest window. */
export const REPLAY_365D = {
  start: "2025-04-01",
  end: "2026-07-14",
  chart: "CME_MINI:MNQ1!",
  timeframe: "5m",
} as const;

/** PRB Pine input overrides per matrix preset (defaults = A0a control). */
export const PRB_MATRIX_OVERRIDES: Record<string, Record<string, string>> = {
  "matrix-a0a": {
    beAtR: "1",
    biasMode: "Both",
    rr: "5",
    evalMaxWinUsd: "0",
    riskUsd: "400",
    trailRegime: "OFF",
  },
  "matrix-a0b": {
    beAtR: "2",
    biasMode: "Auto PDH/PDL draw",
    rr: "5",
    evalMaxWinUsd: "0",
    riskUsd: "400",
    trailRegime: "OFF",
  },
  "matrix-a1c": {
    beAtR: "2",
    biasMode: "Auto PDH/PDL draw",
    rr: "6",
    evalMaxWinUsd: "1490",
    riskUsd: "400",
    trailRegime: "OFF",
  },
  "matrix-d1": {
    beAtR: "1",
    biasMode: "Both",
    rr: "6",
    evalMaxWinUsd: "0",
    riskUsd: "400",
    trailRegime: "OFF",
  },
};

export interface MatrixReplayRecipe {
  preset: StrategyPreset;
  pineFile: string;
  pineLabel: string;
  needsTvExport: boolean;
  derivedFromB0: boolean;
  steps: string[];
  tvSyncLines: string[];
  labUrl: string;
}

function pineFileForFamily(family: StrategyPreset["family"]): { file: string; label: string } {
  switch (family) {
    case "prb":
      return { file: "pine/Powell_Rejection_Block_v1.pine", label: "PRB v1.5" };
    case "macro":
      return { file: "pine/Macro_Model_v1.pine", label: "Macro v1.4" };
    case "datahl":
      return { file: "pine/Powell_DataHL_v0.pine", label: "Data H/L v0" };
    case "hybrid":
    case "custom":
      return { file: "—", label: "Custom / hybrid" };
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

function prbVariant(): StrategyVariant {
  return variantById("prb-v15") ?? STRATEGY_VARIANTS[0];
}

export function replayRecipeForPreset(presetId: string): MatrixReplayRecipe | null {
  const preset = presetById(presetId);
  if (!preset?.matrixBranch) return null;

  const pine = pineFileForFamily(preset.family);
  const derived = preset.dataSource === "derived-b0";
  const needsTv = !derived;

  const baseSteps = [
    `Open ${REPLAY_365D.chart} · ${REPLAY_365D.timeframe} · bar replay or Deep Backtest`,
    `Window: ${REPLAY_365D.start} → ${REPLAY_365D.end}`,
    `Paste ${pine.label} from ${pine.file} if inputs are missing in TV`,
  ];

  let steps: string[];
  if (derived) {
    steps = [
      "Run B0 once in TradingView — upload full Macro CSV to F4 Lab on B0 row",
      `Select ${preset.matrixBranch} in Lab — dataset auto-filters from B0 (no re-export)`,
      "RUN Monte Carlo on TPT $50K",
    ];
  } else if (preset.family === "datahl") {
    steps = [
      "Pick red-folder days in F7 News (CPI / NFP / PPI tags)",
      "Bar replay each tagged day on 1m MNQ — manual only",
      "Export trades or log to journal — upload CSV to Lab on X0a row",
    ];
  } else if (preset.family === "macro") {
    steps = [
      ...baseSteps,
      "Macro locked defaults — CE confirm, tiered entries",
      "Export Strategy Tester CSV → F4 Lab → select B0 → RUN",
    ];
  } else {
    steps = [
      ...baseSteps,
      "Change only the Pine inputs listed below (one preset = one export)",
      "Export Strategy Tester CSV → F4 Lab → matching matrix row → RUN",
      preset.phase === "eval"
        ? "Check eval consistency panel if TPT — cap wins ~$1,490 on A1c"
        : "Funded: no consistency on TPT PRO — payout buffer matters",
    ];
  }

  const overrides = PRB_MATRIX_OVERRIDES[presetId];
  const tvSyncLines =
    preset.family === "prb" && overrides
      ? buildTvSyncLines(prbVariant(), {
          ...Object.fromEntries(prbVariant().experimentFields.map((f) => [f.key, f.def])),
          ...overrides,
        })
      : [];

  return {
    preset,
    pineFile: pine.file,
    pineLabel: pine.label,
    needsTvExport: needsTv,
    derivedFromB0: derived,
    steps,
    tvSyncLines,
    labUrl: `/lab?preset=${preset.id}`,
  };
}
