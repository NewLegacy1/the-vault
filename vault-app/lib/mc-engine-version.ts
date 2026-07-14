/** Bump when simulation rules change materially — cohorts with older version should re-RUN. */
export const MC_ENGINE_VERSION = 2;

export const MC_RULE_PACK_FEATURES = [
  "eod_trail",
  "intraday_trail",
  "daily_loss_limit",
  "winning_days",
  "consistency_target",
  "consistency_total",
  "payout_economics",
  "account_recycling",
] as const;

export type McRulePackFeature = (typeof MC_RULE_PACK_FEATURES)[number];
