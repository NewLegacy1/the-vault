import type { CohortFirmMcEntry, CohortRecord } from "@/lib/cohort";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { ruleById } from "@/lib/prop-firms";

/** Firms shown on F8 matrix results tabs — eval $50K class. */
export const MATRIX_COMPARE_FIRM_IDS = [
  "tpt50",
  "alpha-zero-50",
  "alpha-premium-50",
  "apex50-eod",
] as const;

export type MatrixCompareFirmId = (typeof MATRIX_COMPARE_FIRM_IDS)[number];

export interface FirmMcSnapshot {
  ruleId: string;
  firmName: string;
  passPct: number;
  bustPct: number;
  payoutPct: number;
  weeksToPassP50: number | null;
  weeksToPayoutP50: number | null;
  passAt: number;
  trailingDD: number;
  consistencyPct: number;
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

export function compareFirmsForTrades(opts: {
  trades: number[];
  dates: string[];
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  winCapUsd?: number;
  firmIds?: readonly string[];
}): FirmMcSnapshot[] {
  const ids = opts.firmIds ?? MATRIX_COMPARE_FIRM_IDS;
  const out: FirmMcSnapshot[] = [];

  for (const id of ids) {
    const rule = ruleById(id);
    if (!rule) continue;
    const mc = runMonteCarlo({
      trades: opts.trades,
      dates: opts.dates,
      sims: opts.sims,
      maxTrades: opts.maxTrades,
      passAt: rule.passAt,
      trailingDD: rule.trailingDD,
      fees: {
        evalFee: rule.evalFee ?? 0,
        activationFee: rule.activationFee ?? 0,
        monthlyFee: rule.monthlyFee ?? 0,
        payoutBuffer: opts.payoutBuffer,
      },
      consistency:
        rule.consistencyPct > 0
          ? { consistencyPct: rule.consistencyPct, minDays: rule.minDays }
          : undefined,
      bootstrap: "week",
    });

    out.push({
      ruleId: rule.id,
      firmName: rule.name,
      passPct: Math.round(mc.passRate * 10) / 10,
      bustPct: Math.round(mc.bustRate * 10) / 10,
      payoutPct: Math.round(mc.economics.payoutRate * 10) / 10,
      weeksToPassP50: mc.economics.weeksToPassP50,
      weeksToPayoutP50: mc.economics.weeksToPayoutP50,
      passAt: rule.passAt,
      trailingDD: rule.trailingDD,
      consistencyPct: rule.consistencyPct,
    });
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

export function firmMcForTab(
  cohort: CohortRecord,
  firmId: MatrixCompareFirmId
): CohortFirmMcEntry | null {
  const fromMulti = cohort.firmMc?.[firmId];
  if (fromMulti) return fromMulti;
  const savedAs = ruleIdFromFirmLabel(cohort.firm);
  if (savedAs !== firmId) return null;
  const rule = ruleById(firmId);
  if (!rule) return null;
  return {
    passPct: cohort.mcPassPct,
    bustPct: cohort.mcBustPct,
    payoutPct: cohort.mcPayoutPct,
    weeksToPassP50: cohort.weeksToPassP50,
    weeksToPayoutP50: cohort.weeksToPayoutP50,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistencyPct: rule.consistencyPct,
    firmName: rule.name,
  };
}
