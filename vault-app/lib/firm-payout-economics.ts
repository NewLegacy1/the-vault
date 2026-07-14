import { phaseById, ruleById } from "./prop-firms";
import type { PropPhaseRuleSet } from "./prop-phase-types";

export type McCompareMode = "eval" | "funded";

export type MatrixFirmId =
  | "tpt50"
  | "topstep50"
  | "alpha-zero-50"
  | "alpha-premium-50"
  | "apex50-eod";

/**
 * Numeric payout economics for matrix firms ($50K class).
 * Sourced from official help centers (Jul 2026) — see `source` on each entry.
 */
export interface FirmPayoutConfig {
  /** Trader share of approved withdrawal request (0.8 = 80%). */
  traderKeepPct: number;
  /** Profit that must remain as buffer before withdrawable (TPT/Apex: max DD). */
  profitBufferUsd: number;
  /** Max gross removed from account per request (before split). */
  maxPayoutPerRequestUsd?: number;
  /** Max fraction of account profit requestable per cycle (Alpha: 50%). */
  maxWithdrawFractionOfProfit?: number;
  evalFeeUsd: number;
  activationFeeUsd: number;
  monthlyFeeUsd: number;
  /** Eval subscription only — $0 once account is activated (funded/PRO). */
  /** TPT recycle: new test fee when restarting after withdraw. */
  recycleEvalFeeUsd?: number;
  source: string;
}

/** Funded-phase payout consistency % (official, Jul 2026). Topstep Standard XFA = 0; Consistency path = 40. */
export function fundedPayoutConsistencyPct(ruleId: string): number {
  switch (ruleId as MatrixFirmId) {
    case "alpha-zero-50":
      return 40;
    case "apex50-eod":
      return 50;
    case "topstep50":
      return 0;
    default:
      return 0;
  }
}

export interface WithdrawableResult {
  grossRequestUsd: number;
  traderReceivesUsd: number;
}

/** Parse "80/20 (you keep 80%)" → 0.8 */
export function parseTraderKeepPct(split: string | undefined, fallback: number): number {
  if (!split) return fallback;
  const keep = split.match(/you keep\s*(\d+(?:\.\d+)?)\s*%/i);
  if (keep) return parseFloat(keep[1]) / 100;
  const leading = split.match(/^(\d+(?:\.\d+)?)\s*\/\s*\d+/);
  if (leading) return parseFloat(leading[1]) / 100;
  if (/100\s*%|100%/.test(split)) return 1;
  return fallback;
}

export function withdrawableAtEquity(
  equityUsd: number,
  config: FirmPayoutConfig
): WithdrawableResult {
  const aboveBuffer = Math.max(0, equityUsd - config.profitBufferUsd);
  if (aboveBuffer <= 0) {
    return { grossRequestUsd: 0, traderReceivesUsd: 0 };
  }

  let grossRequest = aboveBuffer;
  if (config.maxWithdrawFractionOfProfit != null && config.maxWithdrawFractionOfProfit > 0) {
    grossRequest = Math.min(grossRequest, equityUsd * config.maxWithdrawFractionOfProfit);
  }
  if (config.maxPayoutPerRequestUsd != null && config.maxPayoutPerRequestUsd > 0) {
    grossRequest = Math.min(grossRequest, config.maxPayoutPerRequestUsd);
  }

  const traderReceivesUsd = Math.round(grossRequest * config.traderKeepPct);
  return {
    grossRequestUsd: Math.round(grossRequest),
    traderReceivesUsd,
  };
}

const TPT_EVAL: FirmPayoutConfig = {
  traderKeepPct: 0.8,
  profitBufferUsd: 2000,
  evalFeeUsd: 170,
  activationFeeUsd: 130,
  monthlyFeeUsd: 180,
  recycleEvalFeeUsd: 170,
  source: "takeprofittraderhelp.zendesk.com — PRO profit split & buffer",
};

const TPT_FUNDED: FirmPayoutConfig = {
  ...TPT_EVAL,
  monthlyFeeUsd: 0,
};

const ALPHA_ZERO_FUNDED: FirmPayoutConfig = {
  traderKeepPct: 0.9,
  profitBufferUsd: 0,
  maxPayoutPerRequestUsd: 1500,
  maxWithdrawFractionOfProfit: 0.5,
  evalFeeUsd: 0,
  activationFeeUsd: 0,
  monthlyFeeUsd: 0,
  source: "help.alpha-futures.com — Zero qualified payout policy",
};

const ALPHA_PREMIUM_FUNDED: FirmPayoutConfig = {
  traderKeepPct: 0.9,
  profitBufferUsd: 0,
  maxPayoutPerRequestUsd: 2000,
  maxWithdrawFractionOfProfit: 0.5,
  evalFeeUsd: 0,
  activationFeeUsd: 149,
  monthlyFeeUsd: 0,
  source: "help.alpha-futures.com — Premium qualified payout policy",
};

const APEX_FUNDED: FirmPayoutConfig = {
  traderKeepPct: 1,
  profitBufferUsd: 2100,
  maxPayoutPerRequestUsd: 1500,
  evalFeeUsd: 197,
  activationFeeUsd: 99,
  monthlyFeeUsd: 0,
  source: "apextraderfunding.com — EOD PA payouts (4.0, 50% consistency)",
};

/** XFA Standard path — Apr 2026 $50K cap; 50% of balance per request. */
const TOPSTEP_EVAL: FirmPayoutConfig = {
  traderKeepPct: 0.9,
  profitBufferUsd: 0,
  maxPayoutPerRequestUsd: 2000,
  maxWithdrawFractionOfProfit: 0.5,
  evalFeeUsd: 0,
  activationFeeUsd: 149,
  monthlyFeeUsd: 49,
  source: "topstep.com — Standard Combine $49/mo + $149 XFA activation",
};

const TOPSTEP_FUNDED: FirmPayoutConfig = {
  ...TOPSTEP_EVAL,
  monthlyFeeUsd: 0,
};

/** Eval-path configs reuse funded withdrawal math; eval fees differ per firm. */
const MATRIX_PAYOUT_CONFIG: Record<
  MatrixFirmId,
  { eval: FirmPayoutConfig; funded: FirmPayoutConfig }
> = {
  tpt50: {
    eval: TPT_EVAL,
    funded: TPT_FUNDED,
  },
  topstep50: {
    eval: TOPSTEP_EVAL,
    funded: TOPSTEP_FUNDED,
  },
  "alpha-zero-50": {
    eval: {
      ...ALPHA_ZERO_FUNDED,
      evalFeeUsd: 0,
      activationFeeUsd: 0,
      monthlyFeeUsd: 77,
      maxPayoutPerRequestUsd: 1500,
    },
    funded: ALPHA_ZERO_FUNDED,
  },
  "alpha-premium-50": {
    eval: {
      ...ALPHA_PREMIUM_FUNDED,
      evalFeeUsd: 0,
      activationFeeUsd: 149,
      monthlyFeeUsd: 79,
    },
    funded: ALPHA_PREMIUM_FUNDED,
  },
  "apex50-eod": {
    eval: {
      ...APEX_FUNDED,
      profitBufferUsd: 2100,
    },
    funded: APEX_FUNDED,
  },
};

export function payoutConfigForFirm(
  ruleId: string,
  compareMode: McCompareMode
): FirmPayoutConfig | null {
  const matrix = MATRIX_PAYOUT_CONFIG[ruleId as MatrixFirmId];
  if (matrix) {
    return compareMode === "funded" ? matrix.funded : matrix.eval;
  }

  const rule = ruleById(ruleId);
  if (!rule) return null;
  const phase: PropPhaseRuleSet | undefined =
    compareMode === "funded"
      ? phaseById(rule, "funded")
      : phaseById(rule, "eval");
  const payout = phase?.payout;
  const bufferMatch = payout?.bufferRequired?.match(/\$?([\d,]+)/);
  const buffer = bufferMatch ? parseInt(bufferMatch[1].replace(/,/g, ""), 10) : 2000;

  return {
    traderKeepPct: parseTraderKeepPct(payout?.profitSplit, 0.8),
    profitBufferUsd: compareMode === "funded" && ruleId === "apex50-eod" ? 2100 : 2000,
    maxPayoutPerRequestUsd: undefined,
    evalFeeUsd: rule.evalFee ?? 0,
    activationFeeUsd: rule.activationFee ?? phase?.activationFee ?? 0,
    monthlyFeeUsd: rule.monthlyFee ?? phase?.monthlyFee ?? 0,
    source: phase?.source ?? rule.source,
  };
}

export function pathFeesUsd(opts: {
  config: FirmPayoutConfig;
  weeksToEvent: number | null;
  /** Weeks in eval only — monthly subscription stops once activated. */
  weeksInEval?: number | null;
  fundedOnly: boolean;
  passedEval: boolean;
  recycleCycles: number;
}): number {
  const evalWeeks =
    opts.weeksInEval != null
      ? opts.weeksInEval
      : opts.passedEval
        ? null
        : opts.weeksToEvent;

  const evalMonths =
    evalWeeks != null && evalWeeks > 0 ? Math.max(1, Math.ceil(evalWeeks / 4)) : 0;

  if (opts.fundedOnly) {
    return (
      opts.config.activationFeeUsd +
      (opts.recycleCycles > 0 ? opts.recycleCycles * (opts.config.recycleEvalFeeUsd ?? 0) : 0)
    );
  }

  let fees = opts.config.evalFeeUsd;

  if (opts.passedEval) {
    fees += opts.config.activationFeeUsd;
    if (opts.config.monthlyFeeUsd > 0 && evalMonths > 0) {
      fees += evalMonths * opts.config.monthlyFeeUsd;
    }
  } else if (evalMonths > 0 && opts.config.monthlyFeeUsd > 0) {
    fees += Math.min(evalMonths, 2) * opts.config.monthlyFeeUsd;
  }

  if (opts.recycleCycles > 0) {
    fees += opts.recycleCycles * (opts.config.recycleEvalFeeUsd ?? opts.config.evalFeeUsd);
  }

  return fees;
}
