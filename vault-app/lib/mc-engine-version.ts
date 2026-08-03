/**
 * Bump when simulation rules change materially — cohorts with older version should re-RUN.
 * v3 (2026-08-02, audit batch): F1 — weeks/E[$/wk] from steps-per-week matched to the
 * bootstrap unit; F2 — intraday trail ratchets on unrealized MFE peaks (mfeUsd);
 * F5 — honest E[$/wk] = E[net]/E[weeks occupied] over all sims; F6 — eval→funded
 * boundary resets the account and swaps to the funded rule pack; F9 —
 * expectedNetPerAttempt is the clean per-sim mean; F10 — fail-path monthly fees
 * charge actual months occupied.
 */
export const MC_ENGINE_VERSION = 3;

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
