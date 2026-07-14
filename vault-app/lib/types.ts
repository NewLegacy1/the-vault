export type Phase = "eval" | "funded" | "passed" | "blown" | "retired";

export interface Account {
  id: string;
  firm: string;
  label: string;
  size: number;
  phase: Phase;
  startDate: string;
  ruleId: string;
  currentBalance: number;
  notes: string;
}

export type LedgerType =
  | "eval_fee"
  | "reset_fee"
  | "activation_fee"
  | "monthly_fee"
  | "data_fee"
  | "payout"
  | "other";

export interface LedgerEntry {
  id: string;
  accountId: string;
  date: string;
  type: LedgerType;
  amount: number;
  note: string;
}

export type MorningBias = "long" | "short" | "neutral" | "skip";
export type PrbFilter = "Both" | "Long only" | "Short only";
export type RedFolderTag = "yes" | "no" | "unknown";

export interface JournalEntry {
  id: string;
  date: string;
  accountId: string;
  direction: "long" | "short" | "skip";
  grade: "A+" | "B" | "C" | "-";
  pnl: number;
  rMultiple: number;
  giveBack: boolean;
  checklistFails: string;
  notes: string;
  /** D→4H morning read before session (discretion dataset). */
  morningBias?: MorningBias;
  /** PRB Pine direction filter actually used that day. */
  prbFilter?: PrbFilter;
  /** Red-folder / CPI·NFP day — from FF or F7. */
  redFolder?: RedFolderTag;
}

import { PropPhaseRuleSet } from "./prop-phase-types";

export interface PropRule {
  id: string;
  firm: string;
  name: string;
  size: number;
  /** Published profit target (eval) — kept for Monte Carlo backward compat. */
  profitTarget: number;
  /**
   * P&L level the Monte Carlo sim treats as "passed" — may exceed profitTarget
   * when a consistency rule forces you to keep trading (e.g. TPT request at $4k).
   */
  passAt: number;
  passAtNote: string;
  trailingDD: number;
  ddMode: "eod" | "intraday";
  dailyLossLimit?: number;
  /** Eval consistency: no single day > this % of total profit at pass. 0 = none. */
  consistencyPct: number;
  minDays: number;
  evalFee?: number;
  monthlyFee?: number;
  activationFee?: number;
  source: string;
  verified: boolean;
  /** Full rule breakdown by account phase — eval vs funded vs payout. */
  phases: PropPhaseRuleSet[];
  lastReviewed?: string;
}

export const LEDGER_LABELS: Record<LedgerType, string> = {
  eval_fee: "Eval fee",
  reset_fee: "Reset fee",
  activation_fee: "Activation fee",
  monthly_fee: "Monthly fee",
  data_fee: "Data fee",
  payout: "PAYOUT",
  other: "Other",
};

export function isCost(t: LedgerType): boolean {
  return t !== "payout";
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
