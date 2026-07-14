/** Per-phase prop firm rules — eval vs funded vs payout differ on every plan. */

export type PropRulePhaseId = "eval" | "funded" | "funded_plus";

export interface PropPayoutRules {
  /** e.g. "80/20 (you keep 80%)" */
  profitSplit: string;
  /** Balance / buffer before first withdrawal — "None (PRO+)" */
  bufferRequired: string;
  minPayoutUsd?: number;
  maxPerPayout: string;
  frequency: string;
  /** Funded-phase consistency on withdrawals, if any */
  payoutConsistency: string;
  minDaysBeforeFirstPayout: string;
  minWinningDays: string;
  extras: string[];
}

export interface PropPhaseRuleSet {
  id: PropRulePhaseId;
  label: string;
  /** Short badge: TEST · PRO · PRO+ */
  shortLabel: string;
  profitTarget?: number;
  /** MC / pass-request line for this phase (eval only usually) */
  passAt?: number;
  passAtNote?: string;
  trailingDD: number;
  ddMode: "eod" | "intraday";
  /** Plain English DD behavior */
  ddBehavior: string;
  dailyLossLimit?: number | null;
  /** Eval consistency — single-day cap as % of total profit */
  evalConsistencyPct?: number;
  evalConsistencyNote?: string;
  minTradingDays?: number;
  minTradingDaysNote?: string;
  payout?: PropPayoutRules;
  /** Red flags that change how you trade PRB */
  criticalWarnings: string[];
  notes: string[];
  activationFee?: number;
  monthlyFee?: number;
  source?: string;
}

export function formatPhaseConsistency(phase: PropPhaseRuleSet): string {
  if (phase.evalConsistencyPct && phase.evalConsistencyPct > 0) {
    return `${phase.evalConsistencyPct}% best-day cap (eval)`;
  }
  if (phase.payout?.payoutConsistency && phase.payout.payoutConsistency !== "None") {
    return phase.payout.payoutConsistency;
  }
  return "None";
}

export function payoutSummary(p: PropPayoutRules): string[] {
  const lines = [
    `Split: ${p.profitSplit}`,
    `Buffer: ${p.bufferRequired}`,
    `First payout: ${p.minDaysBeforeFirstPayout}`,
    `Winning days: ${p.minWinningDays}`,
    `Consistency: ${p.payoutConsistency}`,
    `Frequency: ${p.frequency}`,
    `Max per request: ${p.maxPerPayout}`,
  ];
  if (p.minPayoutUsd) lines.push(`Minimum request: $${p.minPayoutUsd}`);
  return [...lines, ...p.extras];
}
