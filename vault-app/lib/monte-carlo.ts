export interface McFees {
  evalFee: number;
  activationFee: number;
  monthlyFee: number;
  /** Extra funded profit on funded account before first payout request (withdrawable buffer). */
  payoutBuffer: number;
}

/** How historical outcomes are resampled into each simulated path. */
export type McBootstrap = "trade" | "day" | "week";

export interface McConsistencyRule {
  consistencyPct: number;
  minDays: number;
}

/** Funded-phase sim — survival, payout buffer, optional account recycling before PRO+. */
export interface McFundedRules {
  /** Profit above $0 required to clear buffer (TPT: $2,000 → $52k balance). */
  payoutProfitTarget: number;
  /** Cumulative PRO profit cap before recycle complete (TPT PRO+ trigger: $5,000). */
  recycleProfitCap?: number;
  /** Reset account after each payout to model withdraw + fresh PRO. */
  accountRecycling?: boolean;
  /** Funded payout-request consistency (e.g. Alpha Zero ~40%). 0 = none. */
  payoutConsistencyPct?: number;
}

export type McSimMode = "eval_path" | "funded_only";

export interface McParams {
  trades: number[];
  dates?: string[];
  sims: number;
  maxTrades: number;
  /** Firm-derived pass line (includes consistency buffer). */
  passAt: number;
  trailingDD: number;
  fees?: McFees;
  /** Eval consistency gate — pass only when best-day % and min days satisfied. */
  consistency?: McConsistencyRule;
  /** Resample mode; defaults from dates + consistency when omitted. */
  bootstrap?: McBootstrap;
  /** eval_path = eval → funded → payout (default). funded_only = PRO survival + recycle. */
  simMode?: McSimMode;
  funded?: McFundedRules;
}

export interface McEconomics {
  tradesPerWeek: number;
  weeksToPassP50: number | null;
  weeksToPassP90: number | null;
  weeksToPayoutP50: number | null;
  weeksToPayoutP90: number | null;
  tradesToPayoutP50: number | null;
  payoutRate: number;
  expectedAccounts: number;
  accountsFor90Pct: number;
  evalCostPerAttempt: number;
  expectedNetPerAttempt: number;
  expectedNetUntilPass: number;
  medianNetOnPass: number;
  payoutAt: number;
}

export interface McResult {
  sims: number;
  /** Consistency-aware pass rate when consistency rule is active; else gross pass. */
  passRate: number;
  bustRate: number;
  timeoutRate: number;
  tradesToPassP50: number | null;
  tradesToPassP90: number | null;
  worstDrawdownP95: number;
  economics: McEconomics;
  bands: { p05: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] };
  /** Representative sim paths for spaghetti chart (up to 120). */
  samplePaths: McSamplePath[];
  /** Final equity values per sim — for terminal histogram. */
  finalEquities: number[];
  outcomeHist: { label: string; count: number; color: string }[];
  /** Resampling mode used for this run. */
  bootstrap: McBootstrap;
  /** Whether eval consistency was enforced on pass. */
  consistencyAware: boolean;
  /** Hit pass line before DD without meeting consistency (only when consistencyAware). */
  grossPassRate?: number;
  /** Crossed pass line but never cleared consistency before bust/timeout. */
  consistencyBlockedRate?: number;
  /** Funded-only: % of sims that completed ≥1 withdraw + account recycle before cap. */
  recycleRate?: number;
}

export interface McSamplePath {
  equity: number[];
  outcome: "payout" | "pass" | "bust" | "open" | "cons-block";
}

interface DailyPnl {
  date: string;
  pnl: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[idx];
}

function tradesPerWeekFromDates(dates?: string[]): number {
  if (!dates || dates.length < 2) return 5;
  const ts = dates
    .map((d) => Date.parse(d))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (ts.length < 2) return 5;
  const weeks = (ts[ts.length - 1] - ts[0]) / (7 * 24 * 3600 * 1000);
  return weeks > 0.25 ? dates.length / weeks : 5;
}

function weeksFromTrades(trades: number | null, tpw: number): number | null {
  if (trades == null || tpw <= 0) return null;
  return Math.round((trades / tpw) * 10) / 10;
}

function evalMonthsForWeeks(weeks: number | null, monthlyFee: number): number {
  if (!monthlyFee || weeks == null) return 0;
  return Math.max(1, Math.ceil(weeks / 4));
}

function weekKey(dateStr: string): string {
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return dateStr;
  const d = new Date(t);
  const day = d.getUTCDay();
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function buildDailyPnls(trades: number[], dates: string[]): DailyPnl[] {
  const byDay = new Map<string, number>();
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    byDay.set(d, (byDay.get(d) ?? 0) + trades[i]);
  }
  return [...byDay.entries()]
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildWeekBlocks(daily: DailyPnl[]): number[][] {
  if (daily.length === 0) return [];
  const blocks: number[][] = [];
  let currentKey = weekKey(daily[0].date);
  let current: number[] = [];
  for (const row of daily) {
    const k = weekKey(row.date);
    if (k !== currentKey && current.length > 0) {
      blocks.push(current);
      current = [];
      currentKey = k;
    }
    current.push(row.pnl);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function hasUsableDates(trades: number[], dates?: string[]): boolean {
  if (!dates || dates.length < 6) return false;
  const valid = dates.filter(Boolean).length;
  return valid >= Math.min(6, Math.floor(trades.length * 0.5));
}

export function resolveMcBootstrap(
  trades: number[],
  dates: string[] | undefined,
  requested?: McBootstrap,
  consistency?: McConsistencyRule
): McBootstrap {
  if (requested) return requested;
  if (!hasUsableDates(trades, dates)) return "trade";
  if (consistency && consistency.consistencyPct > 0) return "week";
  return "week";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBootstrapSequence(
  trades: number[],
  dailyPnls: number[],
  weekBlocks: number[][],
  maxSteps: number,
  mode: McBootstrap
): number[] {
  const out: number[] = [];
  while (out.length < maxSteps) {
    if (mode === "week" && weekBlocks.length >= 2) {
      const block = pickRandom(weekBlocks);
      for (const pnl of block) {
        out.push(pnl);
        if (out.length >= maxSteps) break;
      }
    } else if (mode === "day" && dailyPnls.length > 0) {
      out.push(pickRandom(dailyPnls));
    } else if (mode === "week" && weekBlocks.length === 1) {
      out.push(pickRandom(weekBlocks[0]));
    } else if (dailyPnls.length > 0 && mode !== "trade") {
      out.push(pickRandom(dailyPnls));
    } else {
      out.push(pickRandom(trades));
    }
  }
  return out;
}

function evalPassReady(
  cumulative: number,
  bestDayPnl: number,
  tradingDays: number,
  passAt: number,
  consistency?: McConsistencyRule
): boolean {
  if (cumulative < passAt) return false;
  if (!consistency || consistency.consistencyPct <= 0) return true;
  const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 0;
  return bestPct < consistency.consistencyPct && tradingDays >= consistency.minDays;
}

function payoutConsistencyReady(
  cumulative: number,
  bestDayPnl: number,
  payoutConsistencyPct: number
): boolean {
  if (payoutConsistencyPct <= 0) return true;
  if (cumulative < 0) return false;
  const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 100;
  return bestPct < payoutConsistencyPct;
}

type SimPhase = "eval" | "funded" | "bust" | "done";

export function runMonteCarlo(params: McParams): McResult {
  const { trades, dates, sims, maxTrades, trailingDD, passAt } = params;
  const fundedOnly = params.simMode === "funded_only";
  const fundedRules = params.funded;
  const fees: McFees = params.fees ?? {
    evalFee: 0,
    activationFee: 0,
    monthlyFee: 0,
    payoutBuffer: 1000,
  };
  const consistency =
    !fundedOnly && params.consistency && params.consistency.consistencyPct > 0
      ? params.consistency
      : undefined;
  const daily = dates ? buildDailyPnls(trades, dates) : [];
  const dailyPnls = daily.map((d) => d.pnl);
  const weekBlocks = buildWeekBlocks(daily);
  const bootstrap = resolveMcBootstrap(trades, dates, params.bootstrap, consistency);
  const consistencyAware = Boolean(consistency);
  const payoutAt = fundedOnly
    ? (fundedRules?.payoutProfitTarget ?? fees.payoutBuffer)
    : passAt + fees.payoutBuffer;
  const tpw = tradesPerWeekFromDates(dates);
  const evalCost = fees.evalFee || fees.monthlyFee || 0;

  const emptyEconomics: McEconomics = {
    tradesPerWeek: tpw,
    weeksToPassP50: null,
    weeksToPassP90: null,
    weeksToPayoutP50: null,
    weeksToPayoutP90: null,
    tradesToPayoutP50: null,
    payoutRate: 0,
    expectedAccounts: 0,
    accountsFor90Pct: 0,
    evalCostPerAttempt: evalCost,
    expectedNetPerAttempt: 0,
    expectedNetUntilPass: 0,
    medianNetOnPass: 0,
    payoutAt,
  };

  if (trades.length === 0 || sims <= 0 || maxTrades <= 0) {
    return {
      sims: 0,
      passRate: 0,
      bustRate: 0,
      timeoutRate: 0,
      tradesToPassP50: null,
      tradesToPassP90: null,
      worstDrawdownP95: 0,
      economics: emptyEconomics,
      bands: { p05: [], p25: [], p50: [], p75: [], p95: [] },
      samplePaths: [],
      finalEquities: [],
      outcomeHist: [],
      bootstrap,
      consistencyAware,
    };
  }

  const paths: number[][] = Array.from({ length: maxTrades + 1 }, () => new Array<number>(sims));
  const tradesToPass: number[] = [];
  const tradesToPayout: number[] = [];
  const netOnPass: number[] = [];
  const maxDDs: number[] = [];
  const samplePaths: McSamplePath[] = [];
  const finalEquities: number[] = [];
  const MAX_SAMPLES = 120;
  let passes = 0;
  let busts = 0;
  let payouts = 0;
  let grossPasses = 0;
  let consistencyBlocked = 0;
  let recycleCompletes = 0;
  let outcomeCounts = { payout: 0, pass: 0, consBlock: 0, bust: 0, open: 0 };

  for (let s = 0; s < sims; s++) {
    const sequence = generateBootstrapSequence(trades, dailyPnls, weekBlocks, maxTrades, bootstrap);
    let eq = 0;
    let peak = 0;
    let maxDD = 0;
    let phase: SimPhase = fundedOnly ? "funded" : "eval";
    let passed = false;
    let gotPayout = false;
    let hitGrossPass = false;
    let blockedByConsistency = false;
    let cumulative = 0;
    let bestDayPnl = 0;
    let tradingDays = 0;
    let cumulativeFundedProfit = 0;
    let recycleCycles = 0;
    let hadAnyPayout = false;
    const pathTrace: number[] = [0];
    paths[0][s] = 0;

    for (let t = 1; t <= maxTrades; t++) {
      if (phase === "eval" || phase === "funded") {
        const dayPnl = sequence[t - 1];
        eq += dayPnl;
        cumulative += dayPnl;
        tradingDays++;
        if (dayPnl > bestDayPnl) bestDayPnl = dayPnl;

        peak = Math.max(peak, eq);
        maxDD = Math.max(maxDD, peak - eq);

        if (!fundedOnly && cumulative >= passAt) hitGrossPass = true;

        if (peak - eq >= trailingDD) {
          phase = "bust";
        } else if (!fundedOnly && phase === "eval" && evalPassReady(cumulative, bestDayPnl, tradingDays, passAt, consistency)) {
          phase = "funded";
          passed = true;
          tradesToPass.push(t);
        } else if (phase === "funded" && eq >= payoutAt) {
          const payoutConsPct = fundedOnly ? (fundedRules?.payoutConsistencyPct ?? 0) : 0;
          const payoutReady =
            !fundedOnly || payoutConsistencyReady(cumulative, bestDayPnl, payoutConsPct);

          if (payoutReady) {
            tradesToPayout.push(t);
            const wks = weeksFromTrades(t, tpw) ?? 0;
            const evalMonths = evalMonthsForWeeks(wks, fees.monthlyFee);
            const totalFees = fundedOnly
              ? fees.activationFee
              : fees.evalFee + fees.activationFee + evalMonths * fees.monthlyFee;
            netOnPass.push(eq - totalFees);
            payouts++;
            hadAnyPayout = true;
            gotPayout = true;
            cumulativeFundedProfit += eq;

            const recycleCap = fundedRules?.recycleProfitCap ?? Infinity;
            const canRecycle =
              fundedOnly &&
              fundedRules?.accountRecycling &&
              cumulativeFundedProfit < recycleCap;

            if (canRecycle) {
              recycleCycles++;
              eq = 0;
              peak = 0;
              cumulative = 0;
              bestDayPnl = 0;
              tradingDays = 0;
              gotPayout = false;
            } else {
              phase = "done";
            }
          }
        }
      }

      paths[t][s] = eq;
      pathTrace.push(eq);
    }

    if (hitGrossPass && !passed) {
      blockedByConsistency = true;
      consistencyBlocked++;
    }
    if (hitGrossPass) grossPasses++;

    if (passed) passes++;
    if (phase === "bust") busts++;
    if (fundedOnly && recycleCycles >= 1 && phase !== "bust") recycleCompletes++;

    if (hadAnyPayout) outcomeCounts.payout++;
    else if (passed) outcomeCounts.pass++;
    else if (hitGrossPass) outcomeCounts.consBlock++;
    else if (phase === "bust") outcomeCounts.bust++;
    else outcomeCounts.open++;

    finalEquities.push(eq);
    maxDDs.push(maxDD);

    if (s % Math.max(1, Math.floor(sims / MAX_SAMPLES)) === 0 && samplePaths.length < MAX_SAMPLES) {
      const outcome: McSamplePath["outcome"] = hadAnyPayout
        ? "payout"
        : passed
          ? "pass"
          : blockedByConsistency
            ? "cons-block"
            : phase === "bust"
              ? "bust"
              : "open";
      samplePaths.push({ equity: pathTrace, outcome });
    }
  }

  const bands = { p05: [] as number[], p25: [] as number[], p50: [] as number[], p75: [] as number[], p95: [] as number[] };
  for (let t = 0; t <= maxTrades; t++) {
    const col = [...paths[t]].sort((a, b) => a - b);
    bands.p05.push(percentile(col, 0.05));
    bands.p25.push(percentile(col, 0.25));
    bands.p50.push(percentile(col, 0.5));
    bands.p75.push(percentile(col, 0.75));
    bands.p95.push(percentile(col, 0.95));
  }

  const ttpSorted = [...tradesToPass].sort((a, b) => a - b);
  const ttpaySorted = [...tradesToPayout].sort((a, b) => a - b);
  const ddSorted = [...maxDDs].sort((a, b) => a - b);
  const netSorted = [...netOnPass].sort((a, b) => a - b);

  const payoutRate = payouts / sims;
  const passRate = fundedOnly ? payoutRate : passes / sims;
  const bustRate = outcomeCounts.bust / sims;
  const timeoutRate = outcomeCounts.open / sims;
  const recycleRate = fundedOnly ? recycleCompletes / sims : undefined;

  const rateForAccounts = fundedOnly ? payoutRate : passRate;
  const expectedAccounts =
    rateForAccounts > 0 ? Math.round((1 / rateForAccounts) * 10) / 10 : Infinity;
  const accountsFor90Pct =
    rateForAccounts > 0 ? Math.ceil(Math.log(0.1) / Math.log(1 - rateForAccounts)) : Infinity;

  const weeksPassP50 = fundedOnly
    ? weeksFromTrades(ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null, tpw)
    : weeksFromTrades(ttpSorted.length ? percentile(ttpSorted, 0.5) : null, tpw);
  const medianNet = netSorted.length ? percentile(netSorted, 0.5) : 0;
  const costOnFail = evalCost;

  const expectedNetPerAttempt = payoutRate * medianNet - bustRate * costOnFail;
  const expectedNetUntilPass =
    passRate > 0
      ? Math.round(medianNet - (expectedAccounts - 1) * costOnFail)
      : -costOnFail * accountsFor90Pct;

  const outcomeHist = consistencyAware
    ? [
        { label: "PAYOUT", count: outcomeCounts.payout, color: "#39ffba" },
        { label: "PASS", count: outcomeCounts.pass, color: "#00ff41" },
        { label: "CONS-BLOCK", count: outcomeCounts.consBlock, color: "#ffb347" },
        { label: "BUST", count: outcomeCounts.bust, color: "#ff3355" },
        { label: "OPEN", count: outcomeCounts.open, color: "#6a6a6a" },
      ]
    : [
        { label: "PAYOUT", count: outcomeCounts.payout, color: "#39ffba" },
        { label: "PASS", count: outcomeCounts.pass, color: "#00ff41" },
        { label: "BUST", count: outcomeCounts.bust, color: "#ff3355" },
        { label: "OPEN", count: outcomeCounts.open, color: "#6a6a6a" },
      ];

  return {
    sims,
    passRate,
    bustRate,
    timeoutRate,
    tradesToPassP50: ttpSorted.length ? percentile(ttpSorted, 0.5) : null,
    tradesToPassP90: ttpSorted.length ? percentile(ttpSorted, 0.9) : null,
    worstDrawdownP95: percentile(ddSorted, 0.95),
    economics: {
      tradesPerWeek: Math.round(tpw * 10) / 10,
      weeksToPassP50: weeksPassP50,
      weeksToPassP90: weeksFromTrades(ttpSorted.length ? percentile(ttpSorted, 0.9) : null, tpw),
      weeksToPayoutP50: weeksFromTrades(ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null, tpw),
      weeksToPayoutP90: weeksFromTrades(ttpaySorted.length ? percentile(ttpaySorted, 0.9) : null, tpw),
      tradesToPayoutP50: ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null,
      payoutRate,
      expectedAccounts,
      accountsFor90Pct,
      evalCostPerAttempt: evalCost,
      expectedNetPerAttempt: Math.round(expectedNetPerAttempt),
      expectedNetUntilPass,
      medianNetOnPass: Math.round(medianNet),
      payoutAt,
    },
    bands,
    samplePaths,
    finalEquities,
    outcomeHist,
    bootstrap,
    consistencyAware,
    grossPassRate: consistencyAware ? grossPasses / sims : undefined,
    consistencyBlockedRate: consistencyAware ? consistencyBlocked / sims : undefined,
    recycleRate,
  };
}
