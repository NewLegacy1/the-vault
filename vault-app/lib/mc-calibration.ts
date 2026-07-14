import type { McRulePackFeature } from "./mc-engine-version";
import type { McRulePack } from "./mc-rule-pack";

export interface McCalibrationReport {
  modeled: string[];
  approximated: string[];
  notModeled: string[];
  features: McRulePackFeature[];
}

const MODELED_LABELS: Record<string, string> = {
  eod_trail: "EOD trailing MLL",
  intraday_trail: "Intraday trailing DD",
  daily_loss_limit: "Daily loss limit (day clamp)",
  winning_days: "Winning days gate",
  consistency_target: "Consistency vs profit target",
  consistency_total: "Consistency vs total profit",
  payout_economics: "Payout split, buffer, caps",
  account_recycling: "Account recycling (TPT)",
};

const NOT_MODELED_DEFAULT = [
  "Intraday MAE within a day (DLL is day-total clamp only)",
  "Topstep XFA balance reset at activation",
  "Repeat payout two-rule structure",
  "Min payout $125 floor",
  "Live Funded benchmark days",
];

export function activeRulePackFeatures(pack?: McRulePack): McRulePackFeature[] {
  if (!pack) return [];
  const out: McRulePackFeature[] = [];

  if (pack.trailingMode === "eod") out.push("eod_trail");
  else out.push("intraday_trail");

  if (pack.dailyLossLimit != null && pack.dailyLossLimit > 0 && pack.dailyLossClamp) {
    out.push("daily_loss_limit");
  }

  if (pack.winningDays) out.push("winning_days");

  if (pack.consistency?.mode === "best_day_pct_of_target") out.push("consistency_target");
  if (pack.consistency?.mode === "best_day_pct_of_total") out.push("consistency_total");

  return out;
}

export function describeMcCalibration(opts: {
  rulePack?: McRulePack;
  simMode?: "eval_path" | "funded_only";
  hasPayoutEconomics?: boolean;
  accountRecycling?: boolean;
}): McCalibrationReport {
  const features = [...activeRulePackFeatures(opts.rulePack)];

  if (opts.hasPayoutEconomics) features.push("payout_economics");
  if (opts.accountRecycling) features.push("account_recycling");

  const modeled = features.map((f) => MODELED_LABELS[f] ?? f);
  const approximated: string[] = [];
  const notModeled = [...NOT_MODELED_DEFAULT];

  if (opts.rulePack?.dailyLossClamp) {
    approximated.push("DLL uses daily PnL clamp — not tick-level intraday flatten");
  }
  if (opts.rulePack?.winningDays) {
    approximated.push("Winning days count resampled calendar steps (week bootstrap)");
  }
  if (opts.simMode === "eval_path") {
    approximated.push("Eval → funded uses continuous equity (no XFA $0 reset)");
  }

  return { modeled, approximated, notModeled, features };
}

export function rulePackFeatureIds(pack?: McRulePack): string[] {
  return activeRulePackFeatures(pack);
}
