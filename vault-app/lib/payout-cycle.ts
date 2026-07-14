/**
 * Business-loop metrics derived from Monte Carlo economics.
 * Primary product metric: expected $ after fees per calendar week.
 */
import type { McEconomics, McResult } from "./monte-carlo";

export interface PayoutCycleMetrics {
  passPct: number;
  payoutPct: number;
  /** P(payout | pass) — null when pass rate ~0 */
  payoutGivenPassPct: number | null;
  bustPct: number;
  recyclePct: number | null;
  medianWithdrawnUsd: number;
  medianNetPerAccountUsd: number;
  expectedNetPerAccountUsd: number;
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  /** expectedNetPerAccountUsd / weeksToPayout (or weeksToPass fallback) */
  expectedUsdPerCalendarWeek: number | null;
  expectedAccounts: number;
}

export function derivePayoutCycle(res: McResult): PayoutCycleMetrics {
  const eco = res.economics;
  const passPct = Math.round(res.passRate * 1000) / 10;
  const payoutPct = Math.round(eco.payoutRate * 1000) / 10;
  const bustPct = Math.round(res.bustRate * 1000) / 10;
  const payoutGivenPassPct =
    res.passRate > 0.01
      ? Math.round((eco.payoutRate / res.passRate) * 1000) / 10
      : null;
  const weeks = eco.weeksToPayoutP50 ?? eco.weeksToPassP50;
  const expectedUsdPerCalendarWeek =
    weeks != null && weeks > 0
      ? Math.round(eco.expectedNetPerAccountUsd / weeks)
      : null;

  return {
    passPct,
    payoutPct,
    payoutGivenPassPct,
    bustPct,
    recyclePct:
      res.recycleRate != null ? Math.round(res.recycleRate * 1000) / 10 : null,
    medianWithdrawnUsd: Math.round(eco.medianWithdrawnUsd),
    medianNetPerAccountUsd: Math.round(eco.medianNetPerAccountUsd),
    expectedNetPerAccountUsd: Math.round(eco.expectedNetPerAccountUsd),
    weeksToPassP50: eco.weeksToPassP50,
    weeksToPayoutP50: eco.weeksToPayoutP50,
    expectedUsdPerCalendarWeek,
    expectedAccounts: eco.expectedAccounts,
  };
}

/** Compact YAML fields for cohort frontmatter. */
export function payoutCycleYamlFields(m: PayoutCycleMetrics): Record<string, number | null> {
  return {
    payout_given_pass_pct: m.payoutGivenPassPct,
    median_withdrawn_usd: m.medianWithdrawnUsd,
    expected_net_per_account_usd: m.expectedNetPerAccountUsd,
    expected_usd_per_calendar_week: m.expectedUsdPerCalendarWeek,
    recycle_pct: m.recyclePct,
  };
}

export function weeksForCycleRate(eco: McEconomics): number | null {
  return eco.weeksToPayoutP50 ?? eco.weeksToPassP50;
}
