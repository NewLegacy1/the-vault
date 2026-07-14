import { fundedPayoutConsistencyPct, payoutConfigForFirm } from "./firm-payout-economics";
import type { McParams } from "./monte-carlo";
import {
  type McRulePack,
  type McRulePackConsistency,
} from "./mc-rule-pack";
import type { PropPhaseRuleSet } from "./prop-phase-types";
import { phaseById, ruleById } from "./prop-firms";
import type { PropRule } from "./types";

export type McCompareMode = "eval" | "funded";

export interface BuildMcParamsOpts {
  ruleId: string;
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  compareMode: McCompareMode;
}

export interface BuiltMcParams {
  rule: PropRule;
  evalPhase?: PropPhaseRuleSet;
  fundedPhase?: PropPhaseRuleSet;
  params: McParams;
  rulePack: McRulePack;
}

function parseWinningDayMinPnl(note?: string): number {
  const m = note?.match(/\$(\d+)/);
  return m ? parseInt(m[1], 10) : 150;
}

function buildConsistencyFromPhase(
  phase: PropPhaseRuleSet | undefined,
  passAt: number,
  ruleId: string
): McRulePackConsistency | undefined {
  const pct = phase?.evalConsistencyPct ?? 0;
  if (pct <= 0) return undefined;

  if (ruleId === "topstep50") {
    return {
      mode: "best_day_pct_of_target",
      pct,
      targetUsd: phase?.profitTarget ?? passAt,
      minCalendarSteps: phase?.minTradingDays ?? 0,
    };
  }

  return {
    mode: "best_day_pct_of_total",
    pct,
    minCalendarSteps: phase?.minTradingDays ?? 0,
  };
}

function buildWinningDaysRule(
  phase: PropPhaseRuleSet | undefined,
  gate: "eval_pass" | "first_payout" | "both"
): McRulePack["winningDays"] {
  const minDays = phase?.minTradingDays ?? 0;
  if (minDays < 1) return undefined;
  const note = phase?.minTradingDaysNote ?? phase?.payout?.minWinningDays ?? "";
  if (!/\$?\d+/.test(note) && !/winning/i.test(note)) return undefined;

  return {
    minCount: minDays,
    minPnlUsd: parseWinningDayMinPnl(note),
    appliesTo: gate,
  };
}

export function buildRulePackForPhase(opts: {
  ruleId: string;
  phase: PropPhaseRuleSet | undefined;
  compareMode: McCompareMode;
  passAt: number;
  trailingDD: number;
  accountSize: number;
}): McRulePack {
  const { ruleId, phase, compareMode, passAt, trailingDD, accountSize } = opts;
  const ddMode = phase?.ddMode ?? "eod";
  const dll = phase?.dailyLossLimit ?? null;

  const pack: McRulePack = {
    trailingMode: ddMode === "eod" ? "eod" : "intraday",
    trailingDD,
    accountSize,
    dailyLossLimit: dll,
    dailyLossClamp: dll != null && dll > 0,
  };

  const consistency = buildConsistencyFromPhase(phase, passAt, ruleId);
  if (consistency) pack.consistency = consistency;

  if (ruleId === "topstep50") {
    if (compareMode === "eval") {
      pack.winningDays = buildWinningDaysRule(phase, "eval_pass");
    } else {
      pack.winningDays = {
        minCount: 5,
        minPnlUsd: 150,
        appliesTo: "first_payout",
      };
    }
  }

  return pack;
}

export function buildMcParamsForFirm(opts: BuildMcParamsOpts): BuiltMcParams | null {
  const rule = ruleById(opts.ruleId);
  if (!rule) return null;

  const evalPhase = phaseById(rule, "eval");
  const fundedPhase = phaseById(rule, "funded");
  const accountSize = rule.size ?? 50_000;

  if (opts.compareMode === "funded") {
    const funded = fundedPhase ?? evalPhase;
    if (!funded) return null;
    const payoutEconomics = payoutConfigForFirm(opts.ruleId, "funded");
    const payoutProfitTarget =
      opts.ruleId === "topstep50" ? 4000 : opts.payoutBuffer;
    const rulePack = buildRulePackForPhase({
      ruleId: opts.ruleId,
      phase: funded,
      compareMode: "funded",
      passAt: 0,
      trailingDD: funded.trailingDD,
      accountSize,
    });

    return {
      rule,
      evalPhase,
      fundedPhase: funded,
      rulePack,
      params: {
        trades: opts.trades,
        dates: opts.dates,
        sims: opts.sims,
        maxTrades: opts.maxTrades,
        passAt: 0,
        trailingDD: funded.trailingDD,
        fees: {
          evalFee: 0,
          activationFee: rule.activationFee ?? funded.activationFee ?? 0,
          monthlyFee: 0,
          payoutBuffer: opts.payoutBuffer,
        },
        simMode: "funded_only",
        payoutEconomics: payoutEconomics ?? undefined,
        funded: {
          payoutProfitTarget,
          recycleProfitCap: rule.id === "tpt50" ? 5000 : undefined,
          accountRecycling: rule.id === "tpt50",
          payoutConsistencyPct: fundedPayoutConsistencyPct(opts.ruleId),
        },
        bootstrap: "week",
        rulePack,
      },
    };
  }

  const evalRules = evalPhase;
  const passAt = evalRules?.passAt ?? rule.passAt;
  const trailingDD = evalRules?.trailingDD ?? rule.trailingDD;
  const consistencyPct = evalRules?.evalConsistencyPct ?? rule.consistencyPct;
  const minDays = evalRules?.minTradingDays ?? rule.minDays;
  const payoutEconomics = payoutConfigForFirm(opts.ruleId, "eval");

  const rulePack = buildRulePackForPhase({
    ruleId: opts.ruleId,
    phase: evalRules,
    compareMode: "eval",
    passAt,
    trailingDD,
    accountSize,
  });

  const useLegacyConsistency = !rulePack.consistency && consistencyPct > 0;

  return {
    rule,
    evalPhase,
    fundedPhase,
    rulePack,
    params: {
      trades: opts.trades,
      dates: opts.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      passAt,
      trailingDD,
      fees: {
        evalFee: rule.evalFee ?? 0,
        activationFee: rule.activationFee ?? evalRules?.activationFee ?? 0,
        monthlyFee: rule.monthlyFee ?? evalRules?.monthlyFee ?? 0,
        payoutBuffer: opts.payoutBuffer,
      },
      consistency: useLegacyConsistency
        ? { consistencyPct, minDays }
        : undefined,
      simMode: "eval_path",
      payoutEconomics: payoutEconomics ?? undefined,
      funded: {
        payoutProfitTarget: opts.payoutBuffer,
        payoutConsistencyPct: fundedPayoutConsistencyPct(opts.ruleId),
      },
      bootstrap: "week",
      rulePack,
    },
  };
}

/** Primary Lab MC for reference firm + strategy phase. */
export function buildMcParamsForLab(opts: {
  ruleId: string;
  strategyPhase: string | undefined;
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
}): BuiltMcParams | null {
  const compareMode = opts.strategyPhase === "funded" ? "funded" : "eval";
  return buildMcParamsForFirm({ ...opts, compareMode });
}
