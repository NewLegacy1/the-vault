import type { CohortRecord } from "./cohort";
import { cohortForPresetId } from "./matrix-cohort";
import { presetById } from "./lab-profile";
import { buildMcParamsForLab } from "./mc-params-builder";
import { MATRIX_REFERENCE_FIRM_ID } from "./firm-matrix-compare";
import { runMonteCarlo, type McResult } from "./monte-carlo";
import { derivePayoutCycle, type PayoutCycleMetrics } from "./payout-cycle";
import { ruleById } from "./prop-firms";
import {
  CHAIN_BASELINE_PAIR_ID,
  chainPairById,
  chainPairForPreset,
  type StrategyChainPair,
} from "./strategy-chain";

export type ChainEvMethod = "cohort_pair" | "live_dual_run" | "same_ledger_approx";

export interface ChainEvFees {
  evalFee: number;
  activationFee: number;
  monthlyFee: number;
}

export interface ChainEvResult {
  pairId: string;
  firmId: string;
  eval: PayoutCycleMetrics;
  funded: PayoutCycleMetrics;
  expectedNetPerAccountUsd: number;
  expectedUsdPerCalendarWeek: number | null;
  medianNetPerAccountUsd: number;
  medianUsdPerCalendarWeek: number | null;
  weeksChainP50: number | null;
  sprintScore: number | null;
  portfolioLegUsdPerWeek: number | null;
  combinedUsdPerCalendarWeek: number | null;
  warnings: string[];
  method: ChainEvMethod;
}

export interface ChainEvContext {
  pair: StrategyChainPair;
  result: ChainEvResult;
  evalPresetId: string;
  fundedPresetId: string;
  evalCohortSaved: boolean;
  fundedCohortSaved: boolean;
  baselineExpectedUsdPerWeek: number | null;
}

const DEFAULT_FEES: ChainEvFees = {
  evalFee: ruleById(MATRIX_REFERENCE_FIRM_ID)?.evalFee ?? 0,
  activationFee: ruleById(MATRIX_REFERENCE_FIRM_ID)?.activationFee ?? 0,
  monthlyFee: ruleById(MATRIX_REFERENCE_FIRM_ID)?.monthlyFee ?? 0,
};

export function payoutCycleFromMc(mc: McResult): PayoutCycleMetrics {
  return derivePayoutCycle(mc);
}

/** Reconstruct cycle metrics from a saved cohort (TPT reference firm when available). */
export function payoutCycleFromCohort(
  cohort: CohortRecord,
  role: "eval" | "funded"
): PayoutCycleMetrics {
  const tpt = cohort.firmMc?.tpt50;
  const passPct = role === "funded" ? (tpt?.payoutPct ?? cohort.mcPayoutPct) : (tpt?.passPct ?? cohort.mcPassPct);
  const payoutPct = tpt?.payoutPct ?? cohort.mcPayoutPct;
  const bustPct = tpt?.bustPct ?? cohort.mcBustPct;
  const passRate = passPct / 100;
  const payoutRate = payoutPct / 100;
  const payoutGivenPassPct = passRate > 0.01 ? Math.round((payoutRate / passRate) * 1000) / 10 : null;

  const weeksToPassP50 =
    role === "funded" ? (tpt?.weeksToPassP50 ?? cohort.weeksToPayoutP50) : (tpt?.weeksToPassP50 ?? cohort.weeksToPassP50);
  const weeksToPayoutP50 = tpt?.weeksToPayoutP50 ?? cohort.weeksToPayoutP50;

  const expectedNetPerAccountUsd =
    tpt?.expectedNetPerAccountUsd ??
    Math.round(passRate * (tpt?.medianNetPerAccountUsd ?? 0) - (1 - passRate) * (ruleById(MATRIX_REFERENCE_FIRM_ID)?.evalFee ?? 0));

  const medianNetPerAccountUsd = tpt?.medianNetPerAccountUsd ?? 0;
  const medianWithdrawnUsd = tpt?.medianWithdrawnUsd ?? 0;
  const weeks = weeksToPayoutP50 ?? weeksToPassP50;
  const expectedUsdPerCalendarWeek =
    weeks != null && weeks > 0 ? Math.round(expectedNetPerAccountUsd / weeks) : null;

  return {
    passPct,
    payoutPct,
    payoutGivenPassPct,
    bustPct,
    recyclePct: tpt?.recyclePct ?? null,
    medianWithdrawnUsd,
    medianNetPerAccountUsd,
    expectedNetPerAccountUsd,
    weeksToPassP50,
    weeksToPayoutP50,
    expectedUsdPerCalendarWeek,
    expectedAccounts: cohort.expectedAccounts,
  };
}

export function runMcForPreset(opts: {
  presetId: string;
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
}): McResult | null {
  const preset = presetById(opts.presetId);
  if (!preset || opts.trades.length === 0) return null;

  const built = buildMcParamsForLab({
    ruleId: MATRIX_REFERENCE_FIRM_ID,
    strategyPhase: preset.phase,
    trades: opts.trades,
    dates: opts.dates,
    sims: opts.sims,
    maxTrades: opts.maxTrades,
    payoutBuffer: opts.payoutBuffer,
  });
  if (!built) return null;
  return runMonteCarlo(built.params);
}

function evalFailCost(weeksToPass: number | null, fees: ChainEvFees): number {
  const months = Math.max(1, Math.ceil((weeksToPass ?? 4) / 4));
  return fees.evalFee + fees.monthlyFee * months;
}

export function sprintScore(passPct: number, weeksToPass: number | null): number | null {
  if (weeksToPass == null || weeksToPass <= 0) return null;
  return Math.round((passPct / weeksToPass) * 10) / 10;
}

export function computeChainEv(opts: {
  pair: StrategyChainPair;
  evalMetrics: PayoutCycleMetrics;
  fundedMetrics: PayoutCycleMetrics;
  fees?: ChainEvFees;
  method: ChainEvMethod;
  firmId?: string;
  portfolioLegMetrics?: PayoutCycleMetrics;
}): ChainEvResult {
  const fees = opts.fees ?? DEFAULT_FEES;
  const warnings: string[] = [];
  const pPass = opts.evalMetrics.passPct / 100;
  const failCost = evalFailCost(opts.evalMetrics.weeksToPassP50, fees);

  const expectedNetPerAccountUsd = Math.round(
    pPass * opts.fundedMetrics.expectedNetPerAccountUsd + (1 - pPass) * -failCost
  );
  const medianNetPerAccountUsd = Math.round(
    pPass * opts.fundedMetrics.medianNetPerAccountUsd + (1 - pPass) * -failCost
  );

  const weeksChainP50 =
    opts.evalMetrics.weeksToPassP50 != null && opts.fundedMetrics.weeksToPayoutP50 != null
      ? Math.round((opts.evalMetrics.weeksToPassP50 + opts.fundedMetrics.weeksToPayoutP50) * 10) / 10
      : opts.evalMetrics.weeksToPassP50 != null && opts.fundedMetrics.weeksToPassP50 != null
        ? Math.round((opts.evalMetrics.weeksToPassP50 + opts.fundedMetrics.weeksToPassP50) * 10) / 10
        : null;

  const expectedUsdPerCalendarWeek =
    weeksChainP50 != null && weeksChainP50 > 0
      ? Math.round(expectedNetPerAccountUsd / weeksChainP50)
      : null;
  const medianUsdPerCalendarWeek =
    weeksChainP50 != null && weeksChainP50 > 0
      ? Math.round(medianNetPerAccountUsd / weeksChainP50)
      : null;

  let portfolioLegUsdPerWeek: number | null = null;
  let combinedUsdPerCalendarWeek = expectedUsdPerCalendarWeek;

  if (opts.pair.mode === "portfolio_parallel" && opts.portfolioLegMetrics) {
    portfolioLegUsdPerWeek = opts.portfolioLegMetrics.expectedUsdPerCalendarWeek;
    if (portfolioLegUsdPerWeek != null && expectedUsdPerCalendarWeek != null) {
      combinedUsdPerCalendarWeek = expectedUsdPerCalendarWeek + portfolioLegUsdPerWeek;
    }
    warnings.push("Parallel accounts — not sequential chain; combined E[$/wk] sums independent legs.");
  }

  if (opts.method === "same_ledger_approx") {
    warnings.push("Funded leg uses same CSV as eval — exit profile may differ from funded preset book.");
  }

  warnings.push(
    "Passed eval but blew PRO before withdraw ≈ −activation fee only (not modeled per path in v1)."
  );

  return {
    pairId: opts.pair.id,
    firmId: opts.firmId ?? MATRIX_REFERENCE_FIRM_ID,
    eval: opts.evalMetrics,
    funded: opts.fundedMetrics,
    expectedNetPerAccountUsd,
    expectedUsdPerCalendarWeek,
    medianNetPerAccountUsd,
    medianUsdPerCalendarWeek,
    weeksChainP50,
    sprintScore: sprintScore(opts.evalMetrics.passPct, opts.evalMetrics.weeksToPassP50),
    portfolioLegUsdPerWeek,
    combinedUsdPerCalendarWeek,
    warnings,
    method: opts.method,
  };
}

/** Chain EV from saved cohorts only — no live MC (for Results page). */
export function buildChainEvFromCohorts(opts: {
  activePresetId: string;
  cohorts: CohortRecord[];
}): ChainEvContext | null {
  const pair = chainPairForPreset(opts.activePresetId);
  if (!pair) return null;

  const evalCohort = cohortForPresetId(
    opts.cohorts,
    pair.evalPresetId,
    presetById(pair.evalPresetId)?.matrixBranch
  );
  const fundedCohort = cohortForPresetId(
    opts.cohorts,
    pair.fundedPresetId,
    presetById(pair.fundedPresetId)?.matrixBranch
  );
  if (!evalCohort || !fundedCohort) return null;

  let portfolioLegMetrics: PayoutCycleMetrics | undefined;
  if (pair.portfolioLegPresetId) {
    const legCohort = cohortForPresetId(
      opts.cohorts,
      pair.portfolioLegPresetId,
      presetById(pair.portfolioLegPresetId)?.matrixBranch
    );
    if (legCohort) portfolioLegMetrics = payoutCycleFromCohort(legCohort, "funded");
  }

  const result = computeChainEv({
    pair,
    evalMetrics: payoutCycleFromCohort(evalCohort, "eval"),
    fundedMetrics: payoutCycleFromCohort(fundedCohort, "funded"),
    method: "cohort_pair",
    portfolioLegMetrics,
  });

  let baselineExpectedUsdPerWeek: number | null = null;
  if (pair.id !== CHAIN_BASELINE_PAIR_ID) {
    const baseline = chainPairById(CHAIN_BASELINE_PAIR_ID);
    if (baseline) {
      const bEval = cohortForPresetId(opts.cohorts, baseline.evalPresetId, "A0a");
      const bFunded = cohortForPresetId(opts.cohorts, baseline.fundedPresetId, "D1");
      if (bEval && bFunded) {
        baselineExpectedUsdPerWeek = computeChainEv({
          pair: baseline,
          evalMetrics: payoutCycleFromCohort(bEval, "eval"),
          fundedMetrics: payoutCycleFromCohort(bFunded, "funded"),
          method: "cohort_pair",
        }).expectedUsdPerCalendarWeek;
      }
    }
  }

  return {
    pair,
    result,
    evalPresetId: pair.evalPresetId,
    fundedPresetId: pair.fundedPresetId,
    evalCohortSaved: true,
    fundedCohortSaved: true,
    baselineExpectedUsdPerWeek,
  };
}

function resolveTradesForPreset(
  presetId: string,
  cohorts: CohortRecord[],
  fallbackTrades: number[],
  fallbackDates: string[]
): { trades: number[]; dates: string[]; fromCohort: boolean } {
  const preset = presetById(presetId);
  const cohort = cohortForPresetId(cohorts, presetId, preset?.matrixBranch);
  if (cohort?.tradePnls?.length) {
    return {
      trades: cohort.tradePnls,
      dates: cohort.tradeDates ?? fallbackDates,
      fromCohort: true,
    };
  }
  return { trades: fallbackTrades, dates: fallbackDates, fromCohort: false };
}

export function buildChainEvContext(opts: {
  activePresetId: string;
  primaryMc: McResult;
  cohorts: CohortRecord[];
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
}): ChainEvContext | null {
  const pair = chainPairForPreset(opts.activePresetId);
  if (!pair) return null;

  const activePreset = presetById(opts.activePresetId);
  const isEvalActive = activePreset?.phase !== "funded";

  const evalPresetId = pair.evalPresetId;
  const fundedPresetId = pair.fundedPresetId;

  const evalCohort = cohortForPresetId(opts.cohorts, evalPresetId, presetById(evalPresetId)?.matrixBranch);
  const fundedCohort = cohortForPresetId(opts.cohorts, fundedPresetId, presetById(fundedPresetId)?.matrixBranch);

  let evalMetrics: PayoutCycleMetrics;
  let fundedMetrics: PayoutCycleMetrics;
  let method: ChainEvMethod = "live_dual_run";

  if (isEvalActive) {
    evalMetrics = payoutCycleFromMc(opts.primaryMc);

    const fundedTrades = resolveTradesForPreset(
      fundedPresetId,
      opts.cohorts,
      opts.trades,
      opts.dates
    );
    const fundedMc = runMcForPreset({
      presetId: fundedPresetId,
      trades: fundedTrades.trades,
      dates: fundedTrades.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      payoutBuffer: opts.payoutBuffer,
    });

    if (fundedMc) {
      fundedMetrics = payoutCycleFromMc(fundedMc);
      if (fundedCohort && fundedTrades.fromCohort) method = "cohort_pair";
      else if (!fundedTrades.fromCohort) method = "same_ledger_approx";
    } else if (fundedCohort) {
      fundedMetrics = payoutCycleFromCohort(fundedCohort, "funded");
      method = "cohort_pair";
    } else {
      return null;
    }
  } else {
    fundedMetrics = payoutCycleFromMc(opts.primaryMc);

    const evalTrades = resolveTradesForPreset(evalPresetId, opts.cohorts, opts.trades, opts.dates);
    const evalMc = runMcForPreset({
      presetId: evalPresetId,
      trades: evalTrades.trades,
      dates: evalTrades.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      payoutBuffer: opts.payoutBuffer,
    });

    if (evalMc) {
      evalMetrics = payoutCycleFromMc(evalMc);
      if (evalCohort && evalTrades.fromCohort) method = "cohort_pair";
      else if (!evalTrades.fromCohort) method = "same_ledger_approx";
    } else if (evalCohort) {
      evalMetrics = payoutCycleFromCohort(evalCohort, "eval");
      method = "cohort_pair";
    } else {
      return null;
    }
  }

  let portfolioLegMetrics: PayoutCycleMetrics | undefined;
  if (pair.mode === "portfolio_parallel" && pair.portfolioLegPresetId) {
    const legId = pair.portfolioLegPresetId;
    const legTrades = resolveTradesForPreset(legId, opts.cohorts, [], []);
    const legMc = runMcForPreset({
      presetId: legId,
      trades: legTrades.trades,
      dates: legTrades.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      payoutBuffer: opts.payoutBuffer,
    });
    const legCohort = cohortForPresetId(opts.cohorts, legId, presetById(legId)?.matrixBranch);
    if (legMc) {
      portfolioLegMetrics = payoutCycleFromMc(legMc);
    } else if (legCohort) {
      portfolioLegMetrics = payoutCycleFromCohort(legCohort, "funded");
    }
  }

  const result = computeChainEv({
    pair,
    evalMetrics,
    fundedMetrics,
    method,
    portfolioLegMetrics,
  });

  let baselineExpectedUsdPerWeek: number | null = null;
  if (pair.id !== CHAIN_BASELINE_PAIR_ID) {
    const baseline = chainPairById(CHAIN_BASELINE_PAIR_ID);
    if (baseline) {
      const bEval = cohortForPresetId(opts.cohorts, baseline.evalPresetId, "A0a");
      const bFunded = cohortForPresetId(opts.cohorts, baseline.fundedPresetId, "D1");
      if (bEval && bFunded) {
        const bResult = computeChainEv({
          pair: baseline,
          evalMetrics: payoutCycleFromCohort(bEval, "eval"),
          fundedMetrics: payoutCycleFromCohort(bFunded, "funded"),
          method: "cohort_pair",
        });
        baselineExpectedUsdPerWeek = bResult.expectedUsdPerCalendarWeek;
      }
    }
  }

  return {
    pair,
    result,
    evalPresetId,
    fundedPresetId,
    evalCohortSaved: Boolean(evalCohort),
    fundedCohortSaved: Boolean(fundedCohort),
    baselineExpectedUsdPerWeek,
  };
}
