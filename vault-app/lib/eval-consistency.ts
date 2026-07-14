import type { PropRule } from "./types";

export interface DailyPnlRow {
  date: string;
  pnl: number;
  trades: number;
  cumulative: number;
  bestDayPnl: number;
  bestDayDate: string;
  bestDayPct: number;
  /** True when cumulative ≥ passAt and best day is strictly under consistency %. */
  passRequestOk: boolean;
}

export interface ConsistencyViolation {
  date: string;
  dayPnl: number;
  cumulative: number;
  bestDayPct: number;
  reason: string;
}

export interface OversizedWin {
  date: string;
  pnl: number;
  capUsd: number;
}

export interface EvalConsistencyReport {
  applicable: boolean;
  consistencyPct: number;
  profitTarget: number;
  passAt: number;
  minDays: number;
  totalPnl: number;
  tradingDays: number;
  winningDays: number;
  bestDayPnl: number;
  bestDayDate: string;
  bestDayPctOfTotal: number;
  /** Meets pass line + consistency + min days on full chronological path. */
  passRequestReady: boolean;
  /** Total ≥ official target but consistency would block request. */
  blockedAtTarget: boolean;
  /** Earliest date cumulative crossed passAt (if any). */
  firstPassAtDate: string | null;
  firstPassAtOk: boolean;
  daily: DailyPnlRow[];
  violations: ConsistencyViolation[];
  oversizedWins: OversizedWin[];
  minWinsNeeded: number;
  recommendation: string;
}

function groupByDay(
  trades: number[],
  dates: string[]
): { date: string; pnl: number; count: number }[] {
  const byDay = new Map<string, { pnl: number; count: number }>();
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    const cur = byDay.get(d) ?? { pnl: 0, count: 0 };
    byDay.set(d, { pnl: cur.pnl + trades[i], count: cur.count + 1 });
  }
  return [...byDay.entries()]
    .map(([date, v]) => ({ date, pnl: v.pnl, count: v.count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * TPT-style eval consistency: best profit day must be strictly under N% of total net
 * when requesting pass. Uses chronological daily buckets from TV CSV.
 */
export function analyzeEvalConsistency(
  trades: number[],
  dates: string[],
  rule: PropRule,
  options?: { winCapUsd?: number }
): EvalConsistencyReport {
  const consistencyPct = rule.consistencyPct;
  const winCapUsd = options?.winCapUsd ?? 1490;

  const empty: EvalConsistencyReport = {
    applicable: consistencyPct > 0,
    consistencyPct,
    profitTarget: rule.profitTarget,
    passAt: rule.passAt,
    minDays: rule.minDays,
    totalPnl: 0,
    tradingDays: 0,
    winningDays: 0,
    bestDayPnl: 0,
    bestDayDate: "",
    bestDayPctOfTotal: 0,
    passRequestReady: false,
    blockedAtTarget: false,
    firstPassAtDate: null,
    firstPassAtOk: false,
    daily: [],
    violations: [],
    oversizedWins: [],
    minWinsNeeded: 0,
    recommendation: consistencyPct === 0 ? "No eval consistency rule on this firm." : "",
  };

  if (consistencyPct === 0 || trades.length === 0) {
    return empty;
  }

  const sortedDays = groupByDay(trades, dates);

  let cumulative = 0;
  let bestDayPnl = 0;
  let bestDayDate = "";
  const daily: DailyPnlRow[] = [];
  const violations: ConsistencyViolation[] = [];
  let firstPassAtDate: string | null = null;
  let firstPassAtOk = false;

  for (const { date, pnl: dayPnl, count } of sortedDays) {
    cumulative += dayPnl;
    if (dayPnl > bestDayPnl) {
      bestDayPnl = dayPnl;
      bestDayDate = date;
    }
    const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 0;
    const passRequestOk =
      cumulative >= rule.passAt && bestPct < consistencyPct && daily.length + 1 >= rule.minDays;

    daily.push({
      date,
      pnl: dayPnl,
      trades: count,
      cumulative,
      bestDayPnl,
      bestDayDate,
      bestDayPct: bestPct,
      passRequestOk,
    });

    if (cumulative > 0 && dayPnl > 0 && dayPnl / cumulative >= consistencyPct / 100) {
      violations.push({
        date,
        dayPnl,
        cumulative,
        bestDayPct: bestPct,
        reason: `This day is ${bestPct.toFixed(1)}% of running total (need < ${consistencyPct}%)`,
      });
    }

    if (firstPassAtDate === null && cumulative >= rule.passAt) {
      firstPassAtDate = date;
      firstPassAtOk = bestPct < consistencyPct;
    }
  }

  const totalPnl = cumulative;
  const bestDayPctOfTotal = totalPnl > 0 ? (bestDayPnl / totalPnl) * 100 : 0;
  const tradingDays = sortedDays.length;
  const winningDays = sortedDays.filter((d) => d.pnl > 0).length;
  const passRequestReady =
    totalPnl >= rule.passAt &&
    bestDayPctOfTotal < consistencyPct &&
    tradingDays >= rule.minDays;
  const blockedAtTarget =
    totalPnl >= rule.profitTarget && !passRequestReady && bestDayPctOfTotal >= consistencyPct;

  const oversizedWins: OversizedWin[] = [];
  for (const { date, pnl } of sortedDays) {
    if (pnl > winCapUsd) {
      oversizedWins.push({ date, pnl, capUsd: winCapUsd });
    }
  }

  const cappedWin = winCapUsd;
  const minWinsNeeded = Math.ceil(rule.passAt / cappedWin);

  let recommendation: string;
  if (passRequestReady) {
    recommendation = `Ready to request pass: $${totalPnl.toFixed(0)} total, best day ${bestDayPctOfTotal.toFixed(1)}% (< ${consistencyPct}%), ${tradingDays} trading days.`;
  } else if (blockedAtTarget) {
    recommendation = `Hit $${rule.profitTarget.toLocaleString()} target but consistency blocks pass — best day $${bestDayPnl.toFixed(0)} is ${bestDayPctOfTotal.toFixed(1)}% of $${totalPnl.toFixed(0)}. Need ~$${rule.passAt.toLocaleString()} with distributed wins (cap ~$${winCapUsd}/day).`;
  } else if (totalPnl < rule.passAt) {
    recommendation = `Need $${(rule.passAt - totalPnl).toFixed(0)} more to pass line ($${rule.passAt.toLocaleString()}). Cap wins ~$${winCapUsd} → plan ${minWinsNeeded}+ winning days.`;
  } else if (tradingDays < rule.minDays) {
    recommendation = `P&L ok but only ${tradingDays}/${rule.minDays} min trading days — keep placing trades on separate calendar days.`;
  } else {
    recommendation = `Approaching pass — keep best day under ${consistencyPct}% of total; cap winners ~$${winCapUsd} on eval.`;
  }

  return {
    applicable: true,
    consistencyPct,
    profitTarget: rule.profitTarget,
    passAt: rule.passAt,
    minDays: rule.minDays,
    totalPnl,
    tradingDays,
    winningDays,
    bestDayPnl,
    bestDayDate,
    bestDayPctOfTotal,
    passRequestReady,
    blockedAtTarget,
    firstPassAtDate,
    firstPassAtOk,
    daily,
    violations,
    oversizedWins,
    minWinsNeeded,
    recommendation,
  };
}
