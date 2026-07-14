import type { ConfigItem, AbResult } from "./prb-data";
import { LOCKED_CONFIG, AB_GRAVEYARD, CHANGELOG } from "./prb-data";

export type StrategyVariantId = "prb-v15" | "datahl-v0";

export interface ExperimentField {
  key: string;
  label: string;
  def: string;
  /** Pine input hint for TV sync copy */
  pineHint?: string;
  type?: "text" | "select" | "bool";
  options?: string[];
}

export interface StrategyVariant {
  id: StrategyVariantId;
  label: string;
  status: "locked-live" | "experiment" | "manual-replay";
  pineFile: string;
  shorttitle: string;
  description: string;
  lockedConfig: ConfigItem[];
  experimentFields: ExperimentField[];
  abGraveyard?: AbResult[];
  changelog?: { ver: string; note: string }[];
}

export const STRATEGY_VARIANTS: StrategyVariant[] = [
  {
    id: "prb-v15",
    label: "PRB v1.5 — Rejection Block (live)",
    status: "locked-live",
    pineFile: "pine/Powell_Rejection_Block_v1.pine",
    shorttitle: "PRB v1",
    description:
      "10 AM RB hybrid — limit retest after liquidity sweep. Live locked profile; experiment sandbox never touches the account until A/B'd in LAB.",
    lockedConfig: LOCKED_CONFIG,
    experimentFields: [
      { key: "winStart", label: "Entries from (HHMM)", def: "1000", pineHint: "Session → Entries from" },
      { key: "winEnd", label: "Last order (HHMM)", def: "1300", pineHint: "Session → Last order" },
      { key: "biasMode", label: "Direction filter", def: "Both", type: "select", options: ["Both", "Long only", "Short only", "Auto PDH/PDL draw"], pineHint: "Session → Direction filter" },
      { key: "entryMode", label: "Entry mode", def: "Auto (CE if stop too big)", type: "select", options: ["Limit at wick start", "Limit at wick CE", "Auto (CE if stop too big)", "CISD trigger (for 1m)"], pineHint: "Entry → Entry mode" },
      { key: "trailRegime", label: "Give-back regime trail", def: "OFF", type: "bool", pineHint: "Give-back regime → trail ON" },
      { key: "leaveR", label: "Leave-then-retest (×R)", def: "1", pineHint: "Rejection block → leave by N×risk" },
      { key: "maxStopPts", label: "Max stop pts", def: "20", pineHint: "Risk → Max stop" },
      { key: "riskUsd", label: "Risk per trade $", def: "400", pineHint: "Risk → Risk per trade" },
      { key: "instrMode", label: "Sizing mode", def: "Auto (chart symbol)", type: "select", options: ["Auto (chart symbol)", "MNQ micro ($2/pt)", "NQ mini ($20/pt)"], pineHint: "Instrument / contract size → Sizing mode" },
      { key: "rr", label: "Target R", def: "5", pineHint: "Risk → Target (R multiple)" },
      { key: "evalMaxWinUsd", label: "Eval max win cap $", def: "0", pineHint: "Risk → Eval max win cap (USD, 0 = off)" },
      { key: "beAtR", label: "BE at +R", def: "1", pineHint: "Risk → Breakeven at +N R" },
      { key: "dailyProfitLock", label: "Daily profit lock $", def: "1400", pineHint: "Risk → Daily profit lock" },
      { key: "manualOnly", label: "Manual levels only", def: "OFF", type: "bool", pineHint: "Manual / discretionary replay → Manual levels only" },
      { key: "skipMonday", label: "Skip Mondays", def: "ON", type: "bool", pineHint: "Session → Skip Mondays" },
    ],
    abGraveyard: AB_GRAVEYARD,
    changelog: CHANGELOG,
  },
  {
    id: "datahl-v0",
    label: "Data H/L v0 — manual replay only",
    status: "manual-replay",
    pineFile: "pine/Powell_DataHL_v0.pine",
    shorttitle: "DataHL v0",
    description:
      "NOT a live strategy. Pine cannot read Forex Factory — you manually open TV bar replay on CPI/PPI/NFP days and load this script to practice SOP §8 mechanics. Whether 8:30 is worth studying at all: see F7 NEWS → PRB on red-folder days.",
    lockedConfig: [
      { group: "Status", name: "Live account", value: "DO NOT USE", locked: true, note: "Manual replay sandbox only" },
      { group: "Status", name: "Day selection", value: "You pick news days in FF / F7", locked: true, note: "Script fires on every session unless you navigate replay manually" },
      { group: "Session", name: "Chart / instrument", value: "1m MNQ on red-folder replay", locked: true },
      { group: "Session", name: "Formation window", value: "8:30 – 9:15 NY", locked: true },
      { group: "Session", name: "Entry window", value: "8:30 – 11:30 NY", locked: false },
      { group: "Data H/L", name: "Opposing draw", value: "First soup sets target pool", locked: true },
      { group: "Data H/L", name: "Target", value: "Opposing data pool (mechanical)", locked: false },
      { group: "Entry", name: "Entry mode", value: "CISD trigger (1m default)", locked: false },
      { group: "Risk", name: "Max stop", value: "15 pts", locked: false },
      { group: "Risk", name: "BE / trail", value: "BE +1R · trail OFF", locked: true },
    ],
    experimentFields: [
      { key: "formStart", label: "Formation from (HHMM)", def: "830", pineHint: "Data H/L → Formation from" },
      { key: "formEnd", label: "Formation until (HHMM)", def: "915", pineHint: "Data H/L → Formation until" },
      { key: "tradeStart", label: "Entries from (HHMM)", def: "830", pineHint: "Session → Entries from" },
      { key: "tradeEnd", label: "Last order (HHMM)", def: "1130", pineHint: "Session → Last order" },
      { key: "entryMode", label: "Entry mode", def: "CISD trigger (for 1m)", type: "select", options: ["Limit at wick start", "Limit at wick CE", "Auto (CE if stop too big)", "CISD trigger (for 1m)"], pineHint: "Entry after first sweep → Entry mode" },
      { key: "targetMode", label: "Target", def: "Opposing data pool", type: "select", options: ["Opposing data pool", "Fixed R multiple"], pineHint: "Entry → Target" },
      { key: "minReactPts", label: "Min reaction range pts", def: "12", pineHint: "Data H/L → Min reaction range" },
      { key: "maxStopPts", label: "Max stop pts", def: "15", pineHint: "Risk → Max stop" },
      { key: "rr", label: "Fixed R (if not data pool)", def: "4", pineHint: "Risk → Fixed R target" },
      { key: "riskUsd", label: "Risk per trade $", def: "400", pineHint: "Risk → Risk per trade" },
      { key: "beAtR", label: "BE at +R", def: "1", pineHint: "Risk → Breakeven at +N R" },
      { key: "leaveR", label: "Leave-then-retest (×R)", def: "0.5", pineHint: "Entry → Leave-then-retest" },
    ],
    changelog: [
      { ver: "v0", note: "Manual replay only — mechanics harness after YOU pick CPI/PPI/NFP day in bar replay" },
    ],
  },
];

export function variantById(id: string): StrategyVariant | undefined {
  return STRATEGY_VARIANTS.find((v) => v.id === id);
}

export const DEFAULT_VARIANT_ID: StrategyVariantId = "prb-v15";

/** localStorage key: vault.experiment.{variantId} */
export function experimentStorageKey(variantId: string): string {
  return `vault.experiment.${variantId}`;
}

export function experimentDiffs(
  variant: StrategyVariant,
  exp: Record<string, string>
): ExperimentField[] {
  return variant.experimentFields.filter((f) => (exp[f.key] ?? f.def) !== f.def);
}

export function buildTvSyncLines(
  variant: StrategyVariant,
  exp: Record<string, string>
): string[] {
  return experimentDiffs(variant, exp).map((f) => {
    const val = exp[f.key] ?? f.def;
    const hint = f.pineHint ?? f.label;
    return `${hint}: ${f.def} → ${val}`;
  });
}
