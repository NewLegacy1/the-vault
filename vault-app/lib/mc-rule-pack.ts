import type { McConsistencyRule } from "./monte-carlo";

export type TrailingMode = "intraday" | "eod";

export type ConsistencyMode = "best_day_pct_of_total" | "best_day_pct_of_target";

export type WinningDaysGate = "eval_pass" | "first_payout" | "both";

export interface McWinningDaysRule {
  minCount: number;
  minPnlUsd: number;
  appliesTo: WinningDaysGate;
}

export interface McRulePackConsistency {
  mode: ConsistencyMode;
  pct: number;
  targetUsd?: number;
  minCalendarSteps: number;
}

export interface McRulePack {
  trailingMode: TrailingMode;
  trailingDD: number;
  /** Account starting balance for EOD floor lock (e.g. $50k). */
  accountSize?: number;
  dailyLossLimit?: number | null;
  /** Clamp single-day loss to DLL when resampling (approximates flatten-at-limit). */
  dailyLossClamp?: boolean;
  winningDays?: McWinningDaysRule;
  consistency?: McRulePackConsistency;
}

export interface McRulePackState {
  eq: number;
  peak: number;
  /** Minimum cumulative PnL before bust (EOD MLL), e.g. -2000 on $50k. */
  mllFloorEq: number;
  mllLocked: boolean;
}

export function createRulePackState(pack: McRulePack): McRulePackState {
  return {
    eq: 0,
    peak: 0,
    mllFloorEq: -pack.trailingDD,
    mllLocked: false,
  };
}

/** Apply one day's PnL with optional DLL clamp. Returns adjusted day PnL. */
export function applyDayPnl(dayPnl: number, pack: McRulePack): number {
  if (
    pack.dailyLossClamp &&
    pack.dailyLossLimit != null &&
    pack.dailyLossLimit > 0 &&
    dayPnl < -pack.dailyLossLimit
  ) {
    return -pack.dailyLossLimit;
  }
  return dayPnl;
}

export function updateRulePackState(
  state: McRulePackState,
  dayPnl: number,
  pack: McRulePack
): void {
  state.eq += dayPnl;
  state.peak = Math.max(state.peak, state.eq);

  if (pack.trailingMode !== "eod") return;

  const size = pack.accountSize ?? 50_000;
  const balance = size + state.eq;

  if (!state.mllLocked && balance >= size + pack.trailingDD) {
    state.mllFloorEq = 0;
    state.mllLocked = true;
    return;
  }

  if (!state.mllLocked) {
    const newFloorEq = balance - pack.trailingDD - size;
    state.mllFloorEq = Math.max(state.mllFloorEq, newFloorEq);
  }
}

export function isRulePackBust(state: McRulePackState, pack: McRulePack): boolean {
  if (pack.trailingMode === "eod") {
    return state.eq <= state.mllFloorEq;
  }
  return state.peak - state.eq >= pack.trailingDD;
}

export function isWinningDay(dayPnl: number, pack: McRulePack): boolean {
  const rule = pack.winningDays;
  if (!rule) return false;
  return dayPnl >= rule.minPnlUsd;
}

export function evalPassReadyWithPack(opts: {
  cumulative: number;
  bestDayPnl: number;
  tradingDays: number;
  winningDays: number;
  passAt: number;
  pack?: McRulePack;
  legacyConsistency?: McConsistencyRule;
}): boolean {
  const { cumulative, bestDayPnl, tradingDays, winningDays, passAt, pack, legacyConsistency } =
    opts;

  if (cumulative < passAt) return false;

  const winRule = pack?.winningDays;
  if (
    winRule &&
    (winRule.appliesTo === "eval_pass" || winRule.appliesTo === "both") &&
    winningDays < winRule.minCount
  ) {
    return false;
  }

  if (pack?.consistency) {
    const c = pack.consistency;
    if (tradingDays < c.minCalendarSteps) return false;
    const denom = c.mode === "best_day_pct_of_target" ? (c.targetUsd ?? passAt) : cumulative;
    if (denom <= 0) return false;
    const bestPct = (bestDayPnl / denom) * 100;
    return bestPct < c.pct;
  }

  if (legacyConsistency && legacyConsistency.consistencyPct > 0) {
    if (tradingDays < legacyConsistency.minDays) return false;
    const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 100;
    return bestPct < legacyConsistency.consistencyPct;
  }

  return true;
}

export function payoutReadyWithPack(opts: {
  cumulative: number;
  bestDayPnl: number;
  winningDays: number;
  payoutConsistencyPct: number;
  pack?: McRulePack;
}): boolean {
  const { cumulative, bestDayPnl, winningDays, payoutConsistencyPct, pack } = opts;

  const winRule = pack?.winningDays;
  if (
    winRule &&
    (winRule.appliesTo === "first_payout" || winRule.appliesTo === "both") &&
    winningDays < winRule.minCount
  ) {
    return false;
  }

  if (payoutConsistencyPct > 0) {
    if (cumulative < 0) return false;
    const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 100;
    return bestPct < payoutConsistencyPct;
  }

  return true;
}

/** Default pack mirrors legacy intraday peak−eq trail with no DLL / winning days. */
export function legacyRulePack(trailingDD: number): McRulePack {
  return {
    trailingMode: "intraday",
    trailingDD,
    dailyLossLimit: null,
    dailyLossClamp: false,
  };
}
