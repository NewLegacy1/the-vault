import type { CohortFirmMcEntry, CohortRecord } from "@/lib/cohort";
import type { StrategyPhase } from "@/lib/lab-profile";
import { mcRateToPct, normalizeMcPct } from "@/lib/mc-pct";
import { runMonteCarlo } from "@/lib/monte-carlo";
import type { PropPhaseRuleSet } from "@/lib/prop-phase-types";
import { phaseById, ruleById } from "@/lib/prop-firms";

/** Firms shown on F8 matrix results tabs — eval $50K class. */
export const MATRIX_COMPARE_FIRM_IDS = [
  "tpt50",
  "alpha-zero-50",
  "alpha-premium-50",
  "apex50-eod",
] as const;

/** Reference firm for Lab fan chart, scorecard, and TPT consistency panel. */
export const MATRIX_REFERENCE_FIRM_ID = "tpt50" as const;

export type MatrixCompareFirmId = (typeof MATRIX_COMPARE_FIRM_IDS)[number];

export type McCompareMode = "eval" | "funded";

export { mcRateToPct, normalizeMcPct } from "@/lib/mc-pct";

/** @deprecated Use normalizeMcPct */
export function normalizeStoredMcPct(pct: number, cohortMcPassPct?: number): number {
  return normalizeMcPct(pct, cohortMcPassPct);
}

export function mcCompareModeForPhase(phase: StrategyPhase | string | undefined): McCompareMode {
  return phase === "funded" ? "funded" : "eval";
}

export function parsePayoutConsistencyPct(phase: PropPhaseRuleSet | undefined): number {
  const s = phase?.payout?.payoutConsistency ?? "";
  if (!s || /^none/i.test(s)) return 0;
  const m = s.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : 0;
}

export interface FirmMcSnapshot {
  ruleId: string;
  firmName: string;
  mcMode: McCompareMode;
  passPct: number;
  bustPct: number;
  payoutPct: number;
  recyclePct?: number;
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  passAt: number;
  trailingDD: number;
  consistencyPct: number;
  ddMode: "eod" | "intraday";
}

export function ruleIdFromFirmLabel(firm: string): string | null {
  const f = firm.toLowerCase();
  if (f.includes("tpt") || f.includes("take profit")) return "tpt50";
  if (f.includes("alpha zero")) return "alpha-zero-50";
  if (f.includes("alpha premium")) return "alpha-premium-50";
  if (f.includes("alpha advanced")) return "alpha-advanced-50";
  if (f.includes("apex") && f.includes("intraday")) return "apex50-intraday";
  if (f.includes("apex")) return "apex50-eod";
  if (f.includes("topstep")) return "topstep50";
  return null;
}

function buildMcParamsForFirm(
  ruleId: string,
  opts: {
    trades: number[];
    dates: string[];
    sims: number;
    maxTrades: number;
    payoutBuffer: number;
    compareMode: McCompareMode;
  }
) {
  const rule = ruleById(ruleId);
  if (!rule) return null;

  const evalPhase = phaseById(rule, "eval");
  const fundedPhase = phaseById(rule, "funded");

  if (opts.compareMode === "funded") {
    const funded = fundedPhase ?? evalPhase;
    if (!funded) return null;
    return {
      rule,
      evalPhase,
      fundedPhase: funded,
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
        simMode: "funded_only" as const,
        funded: {
          payoutProfitTarget: opts.payoutBuffer,
          recycleProfitCap: rule.id === "tpt50" ? 5000 : undefined,
          accountRecycling: rule.id === "tpt50",
          payoutConsistencyPct: parsePayoutConsistencyPct(funded),
        },
        bootstrap: "week" as const,
      },
    };
  }

  const evalRules = evalPhase;
  const passAt = evalRules?.passAt ?? rule.passAt;
  const trailingDD = evalRules?.trailingDD ?? rule.trailingDD;
  const consistencyPct = evalRules?.evalConsistencyPct ?? rule.consistencyPct;
  const minDays = evalRules?.minTradingDays ?? rule.minDays;

  return {
    rule,
    evalPhase,
    fundedPhase,
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
      consistency:
        consistencyPct > 0 ? { consistencyPct, minDays } : undefined,
      simMode: "eval_path" as const,
      bootstrap: "week" as const,
    },
  };
}

function snapshotFromMc(
  ruleId: string,
  ruleName: string,
  compareMode: McCompareMode,
  mc: ReturnType<typeof runMonteCarlo>,
  ruleMeta: {
    passAt: number;
    trailingDD: number;
    consistencyPct: number;
    ddMode: "eod" | "intraday";
  }
): FirmMcSnapshot {
  const payoutPct = mcRateToPct(mc.economics.payoutRate);
  const passPct =
    compareMode === "funded" ? payoutPct : mcRateToPct(mc.passRate);

  return {
    ruleId,
    firmName: ruleName,
    mcMode: compareMode,
    passPct,
    bustPct: mcRateToPct(mc.bustRate),
    payoutPct,
    recyclePct:
      compareMode === "funded" && mc.recycleRate != null
        ? mcRateToPct(mc.recycleRate)
        : undefined,
    weeksToPassP50:
      compareMode === "funded"
        ? mc.economics.weeksToPayoutP50
        : mc.economics.weeksToPassP50,
    weeksToPayoutP50: mc.economics.weeksToPayoutP50,
    passAt: ruleMeta.passAt,
    trailingDD: ruleMeta.trailingDD,
    consistencyPct: ruleMeta.consistencyPct,
    ddMode: ruleMeta.ddMode,
  };
}

export function compareFirmsForTrades(opts: {
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  winCapUsd?: number;
  firmIds?: readonly string[];
  strategyPhase?: StrategyPhase | string;
  compareMode?: McCompareMode;
}): FirmMcSnapshot[] {
  const ids = opts.firmIds ?? MATRIX_COMPARE_FIRM_IDS;
  const compareMode =
    opts.compareMode ?? mcCompareModeForPhase(opts.strategyPhase);
  const out: FirmMcSnapshot[] = [];

  for (const id of ids) {
    const built = buildMcParamsForFirm(id, {
      trades: opts.trades,
      dates: opts.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      payoutBuffer: opts.payoutBuffer,
      compareMode,
    });
    if (!built) continue;

    const mc = runMonteCarlo(built.params);
    const evalPhase = built.evalPhase;
    const fundedPhase = built.fundedPhase;
    const phaseRules = compareMode === "funded" ? fundedPhase : evalPhase;

    out.push(
      snapshotFromMc(id, built.rule.name, compareMode, mc, {
        passAt: phaseRules?.passAt ?? built.rule.passAt,
        trailingDD: phaseRules?.trailingDD ?? built.rule.trailingDD,
        consistencyPct:
          compareMode === "funded"
            ? parsePayoutConsistencyPct(fundedPhase)
            : (evalPhase?.evalConsistencyPct ?? built.rule.consistencyPct),
        ddMode: phaseRules?.ddMode ?? built.rule.ddMode,
      })
    );
  }

  return out;
}

export function firmSnapshotsToCohortMc(
  snapshots: FirmMcSnapshot[]
): Record<string, CohortFirmMcEntry> {
  const out: Record<string, CohortFirmMcEntry> = {};
  for (const s of snapshots) {
    out[s.ruleId] = {
      passPct: s.passPct,
      bustPct: s.bustPct,
      payoutPct: s.payoutPct,
      recyclePct: s.recyclePct,
      mcMode: s.mcMode,
      weeksToPassP50: s.weeksToPassP50,
      weeksToPayoutP50: s.weeksToPayoutP50,
      passAt: s.passAt,
      trailingDD: s.trailingDD,
      consistencyPct: s.consistencyPct,
      firmName: s.firmName,
    };
  }
  return out;
}

function normalizeFirmMcEntry(
  entry: CohortFirmMcEntry,
  cohort: CohortRecord
): CohortFirmMcEntry {
  const refPass = normalizeMcPct(cohort.mcPassPct);
  const refPayout = normalizeMcPct(cohort.mcPayoutPct, refPass);
  return {
    ...entry,
    passPct: normalizeMcPct(entry.passPct, refPass),
    bustPct: normalizeMcPct(entry.bustPct, normalizeMcPct(cohort.mcBustPct, refPass)),
    payoutPct: normalizeMcPct(entry.payoutPct, refPayout),
    recyclePct:
      entry.recyclePct != null
        ? normalizeMcPct(entry.recyclePct, refPayout)
        : undefined,
  };
}

export function firmMcForTab(
  cohort: CohortRecord,
  firmId: MatrixCompareFirmId
): CohortFirmMcEntry | null {
  const fromMulti = cohort.firmMc?.[firmId];
  if (fromMulti) {
    return normalizeFirmMcEntry(fromMulti, cohort);
  }
  const savedAs = ruleIdFromFirmLabel(cohort.firm);
  if (savedAs !== firmId) return null;
  const rule = ruleById(firmId);
  if (!rule) return null;
  const isFunded = mcCompareModeForPhase(cohort.phase) === "funded";
  const refPass = normalizeMcPct(cohort.mcPassPct);
  const refPayout = normalizeMcPct(cohort.mcPayoutPct, refPass);
  return {
    passPct: isFunded ? refPayout : refPass,
    bustPct: normalizeMcPct(cohort.mcBustPct, refPass),
    payoutPct: refPayout,
    mcMode: isFunded ? "funded" : "eval",
    weeksToPassP50: isFunded ? cohort.weeksToPayoutP50 : cohort.weeksToPassP50,
    weeksToPayoutP50: cohort.weeksToPayoutP50,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistencyPct: rule.consistencyPct,
    firmName: rule.name,
  };
}

/** Primary matrix cell % — eval shows pass, funded shows payout. */
export function matrixPrimaryMcPct(
  presetPhase: StrategyPhase | string | undefined,
  mc: CohortFirmMcEntry | null
): number | null {
  if (!mc) return null;
  const mode = mc.mcMode ?? mcCompareModeForPhase(presetPhase);
  return mode === "funded" ? mc.payoutPct : mc.passPct;
}

export function matrixWeeksMc(
  presetPhase: StrategyPhase | string | undefined,
  mc: CohortFirmMcEntry | null
): number | null | undefined {
  if (!mc) return null;
  const mode = mc.mcMode ?? mcCompareModeForPhase(presetPhase);
  return mode === "funded" ? mc.weeksToPayoutP50 : mc.weeksToPassP50;
}
