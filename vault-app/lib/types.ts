export type Phase = "eval" | "funded" | "passed" | "blown" | "retired" | "paper";

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
export type JournalLogMode = "morningstar" | "forward" | "live";
export type StructTf = "15" | "30" | "60" | "240" | "chart";
/** Prior-day VIX tercile — Phase-0 regime tag (see lib/regime-tags.ts). */
export type VixBand = "lt16" | "16-20" | "gt20";
/** OR30 ratio tercile — Phase-0 regime tag. */
export type Or30Band = "lt0.75" | "0.75-1.25" | "gt1.25";
export type SkipReason =
  | "no_setup"
  | "no_poi"
  | "counter_draw"
  | "eqhl"
  | "ndog"
  | "news"
  | "gut"
  | "low_grade"
  | "other";

/** Fixed journal bucket for Morningstar Manual study (no prop account). */
export const MORNINGSTAR_STUDY_ID = "study:morningstar";
/**
 * Default Paper / forward-test account id (no prop fees).
 * Create via Accounts → Add paper / forward test, or Journal Live one-click.
 */
export const FORWARD_DISC_ID = "study:forward-disc";
/** ruleId marker for paper accounts (not a PropRule). */
export const PAPER_FORWARD_RULE_ID = "paper-forward";

export function isPaperAccount(a: Account): boolean {
  return a.phase === "paper" || a.ruleId === PAPER_FORWARD_RULE_ID || a.id === FORWARD_DISC_ID;
}

/** Stable default paper book — one per vault unless user adds more. */
export function makePaperAccount(
  label = "Paper / forward test",
  startDate: string,
  id: string = FORWARD_DISC_ID
): Account {
  return {
    id,
    firm: "Paper",
    label,
    size: 50_000,
    phase: "paper",
    startDate,
    ruleId: PAPER_FORWARD_RULE_ID,
    currentBalance: 50_000,
    notes: "No prop fees · forward / disc / paper book — not Dual46",
  };
}

export interface JournalEntry {
  id: string;
  date: string;
  /** ISO timestamp when the entry was logged — review table sorts newest-logged first. */
  loggedAt?: string;
  accountId: string;
  direction: "long" | "short" | "skip";
  grade: "A+" | "B" | "C" | "-";
  pnl: number;
  rMultiple: number;
  /** Peaked ≥2R then exited &lt;1R (trail-toggle signal). */
  giveBack: boolean;
  checklistFails: string;
  notes: string;
  /** D→4H morning read before session (discretion dataset). */
  morningBias?: MorningBias;
  /** PRB Pine direction filter — live logs only; unused for Morningstar study. */
  prbFilter?: PrbFilter;
  /** Red-folder / CPI·NFP day — from FF or F7. */
  redFolder?: RedFolderTag;
  /** Morningstar study vs live prop account log. */
  strategy?: "Morningstar" | "PRB" | "ForwardDisc" | "MSv46";
  structureTf?: StructTf;
  structureTag?: string;
  /** Journal confluence count (context + LTF flags checked). */
  msScore?: number;
  msPoi?: boolean;
  msH4?: boolean;
  msCisd?: boolean;
  msIfvg1?: boolean;
  msIfvg5?: boolean;
  /** 5m RB inside HTF wick (chart LTF slot). */
  msRb5?: boolean;
  /** HTF PDA / OTE context used on the take (eyes — not chart LTF score). */
  msWFvg?: boolean;
  msHtfFvg?: boolean;
  msRb?: boolean;
  msOb?: boolean;
  msKeyOpen?: boolean;
  msOteOverlap?: boolean;
  /** NY news time HHMM when redFolder=yes. */
  redFolderTime?: string;
  redFolderEvent?: string;
  mfeR?: number;
  skipReasons?: SkipReason[];
  /** Compressed JPEG data URL (chart snapshot). */
  chartShot?: string;
  /** Extra Dual46 chart shots (same compress). chartShot = first for back-compat. */
  chartShots?: string[];

  // ── Dual46 Path B day-study (additive · optional) ─────────────────
  /** Legacy single-value NWOG read (kept for old rows) — use nwogPos + nwogFilled going forward. */
  nwog?: "above" | "below" | "filled" | "inside";
  /** Price at 9:30 relative to the NWOG — independent of fill state. */
  nwogPos?: "above" | "below" | "inside";
  /** Gap already filled (CE traded through) — June finding: still viable as S/R. */
  nwogFilled?: boolean;
  /** NWOG gap size in points (census column). */
  nwogGapPts?: number;
  /** Where price tapped the gap. */
  nwogTapLoc?: "near-edge" | "ce" | "far-edge";
  /** ATR(14) on 1-min at entry, in points (May-walk logging). */
  atrPts?: number;
  /** 5m confirmation present at the 1m trigger (Powell hybrid-trigger study). */
  fiveMinConfirm?: boolean;
  /** Daily ATR in points at the session (normalizes NWOG gap size to ×dATR). */
  dailyAtrPts?: number;
  /** Entry (or tap) time HH:MM NY — needed for the 9:50–10:10 NWOG window question. */
  entryTime?: string;
  weekBias?: "long" | "short" | "none";
  dayBias?: "long" | "short" | "none";
  /** Cont = same side as leave · Judas = reverse */
  pathBModel?: "Cont" | "Judas" | "—";
  /** Script grade on the arm */
  pathBGrade?: "OTE+KO" | "OTE" | "KO" | "—";
  stopPts?: number;
  planRr?: number;
  /** converted = limit turned marketable per the conversion rule (tag real R). */
  fillStatus?: "yes" | "no" | "no-arm" | "converted";
  /** WIN / LOSS / no fill / skipped */
  dualOutcome?: "WIN" | "LOSS" | "no fill" | "skipped";
  /** Dual46 freeze stamp */
  dualVersion?: "Dual46";
  /** script = Morningstar arm · disc = discretionary note (NWOG / reverse fib / etc.) */
  entrySource?: "script" | "disc";

  // ── Phase-0 regime tags (census only — never Dual46 lock) ─────────
  /** Prior trading day's VIX close (predictive; no same-day leakage). */
  vixPrevClose?: number;
  /** Pre-registered band from vixPrevClose: &lt;16 / 16–20 / &gt;20. */
  vixBand?: VixBand;
  /** Any of AAPL/MSFT/GOOGL/AMZN/META/NVDA reporting Mon–Fri of this calendar week. */
  megaCapEarnWeek?: boolean;
  /** Frozen: |CL 1d %|≥3 OR |CL 5d %|≥8 (see lib/regime-tags.ts). */
  oilShock?: boolean;
  /** 09:30–10:00 MNQ range ÷ trailing 20-session median of same. */
  or30ratio?: number;
  /** Pre-registered OR30 band: &lt;0.75 / 0.75–1.25 / &gt;1.25. */
  or30Band?: Or30Band;
  /** High-impact calendar print in 09:50–10:10 NY (Dual46 arm window). */
  release10?: boolean;
}

/** Map journal confluence count → letter suggestion. 0 = empty stack (no setup) → "-". */
export function letterFromMsScore(n: number): JournalEntry["grade"] {
  if (n <= 0) return "-";
  if (n >= 6) return "A+";
  if (n >= 3) return "B";
  if (n <= 2) return "C";
  return "-";
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
