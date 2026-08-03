import type { FirmPayoutConfig } from "./firm-payout-economics";
import { pathFeesUsd, withdrawableAtEquity } from "./firm-payout-economics";
import {
  applyDayPnl,
  createRulePackState,
  evalPassReadyWithPack,
  isRulePackBust,
  isWinningDay,
  legacyRulePack,
  payoutReadyWithPack,
  updateRulePackState,
  type McRulePack,
} from "./mc-rule-pack";
import { MC_ENGINE_VERSION } from "./mc-engine-version";
import { rulePackFeatureIds } from "./mc-calibration";
import { calendarSpanWeeks, tradesPerWeekFromDates } from "./time-units";

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
  /** F4: lifetime payout cap — account closes after this many payouts (Apex 4.0: 6). */
  maxPayouts?: number;
}

export type McSimMode = "eval_path" | "funded_only";

export interface McParams {
  trades: number[];
  dates?: string[];
  /**
   * Per-trade unrealized MFE in $ (aligned with `trades`, from enriched ledgers' mfeUsd).
   * When present with ≥50% coverage and the rule pack trails intraday, the trail
   * ratchets on eqBefore + dayMFE instead of day-close equity (Apex Intraday semantics).
   */
  mfes?: (number | undefined)[];
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
  /** Firm-specific payout split, buffer, caps — drives net $/account. */
  payoutEconomics?: FirmPayoutConfig;
  /** Optional calibrated rule pack — defaults to legacy intraday trail. */
  rulePack?: McRulePack;
  /**
   * F6: rule pack for the funded phase of eval_path sims. On eval pass the
   * account state resets (fresh equity/trail/counters) and this pack takes
   * over — models eval EOD trail vs funded intraday trail differences.
   */
  fundedRulePack?: McRulePack;
}

export interface McEconomics {
  tradesPerWeek: number;
  /** Resample steps per calendar week — day steps for day/week bootstrap, trade steps for trade mode. */
  stepsPerWeek: number;
  /** Unit of one MC step (what weeks* fields divide by). */
  stepUnit: "trade" | "day";
  weeksToPassP50: number | null;
  weeksToPassP90: number | null;
  weeksToPayoutP50: number | null;
  weeksToPayoutP90: number | null;
  tradesToPayoutP50: number | null;
  payoutRate: number;
  expectedAccounts: number;
  accountsFor90Pct: number;
  evalCostPerAttempt: number;
  /** @deprecated F9 — now the clean per-sim mean, identical to expectedNetPerAccountUsd. */
  expectedNetPerAttempt: number;
  expectedNetUntilPass: number;
  medianNetOnPass: number;
  payoutAt: number;
  /** Median trader take-home $ after fees on sims that reached ≥1 payout. */
  medianNetPerAccountUsd: number;
  /** Expected (mean) net $ per MC sim — payouts minus eval/activation/monthly fees. */
  expectedNetPerAccountUsd: number;
  /** Median gross trader withdrawal before fees on payout paths. */
  medianWithdrawnUsd: number;
  /**
   * F5: mean calendar weeks each sim occupies the account — ALL sims, including
   * busts and timeouts (they consume calendar time too). Payout/bust paths end
   * at their event; timeout paths span the full window.
   */
  weeksOccupiedMean: number | null;
  /**
   * F5: honest E[$/wk] = E[net per account] / E[weeks occupied]. Replaces the
   * biased mean-net ÷ median-payout-weeks division for ranking books.
   */
  expectedUsdPerWeekOccupied: number | null;
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
  /** Engine + rule-pack metadata for UI / cohort versioning. */
  engineVersion?: number;
  rulePackFeatures?: string[];
  /** Net EV after fees — percentile band across sims (dashboard). */
  netEvP05?: number;
  netEvP95?: number;
  /** Approximate calendar days to terminal outcome (from step count / steps-per-week). */
  avgDaysPass?: number | null;
  avgDaysBust?: number | null;
  avgDaysTimeout?: number | null;
  /** F2: intraday trail ratcheted on unrealized MFE peaks (needs mfes + intraday trailing). */
  mfeTrailApplied?: boolean;
  /** Fraction of trades carrying a real mfeUsd (0–1). */
  mfeCoveragePct?: number;
}

export interface McSamplePath {
  equity: number[];
  outcome: "payout" | "pass" | "bust" | "open" | "cons-block";
}

interface DailyPnl {
  date: string;
  pnl: number;
}

/** One resample step: day (day/week bootstrap) or trade (trade bootstrap). */
interface McStep {
  pnl: number;
  /** Intraday unrealized peak above the step's starting equity (≥ max(0, pnl)); null when unknown. */
  mfe: number | null;
}

interface DailyStep extends DailyPnl {
  /** Intraday peak above the day's starting equity — real MFE where present, running realized peak otherwise. */
  mfe: number;
  /** At least one trade in the day carried a real mfeUsd. */
  hasMfe: boolean;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[idx];
}

/**
 * F1 fix: one MC step is a DAY under day/week bootstrap and a TRADE under trade
 * bootstrap. Weeks/E[$/wk] must divide step counts by steps-per-week in the SAME
 * unit — dividing day steps by trades/week understated calendar time by the
 * trades-per-day factor for books with >1 trade per day.
 */
function stepsPerWeekFor(bootstrap: McBootstrap, dates: string[] | undefined, dayCount: number): number {
  if (bootstrap === "trade") return tradesPerWeekFromDates(dates);
  const weeks = calendarSpanWeeks(dates);
  if (weeks == null || dayCount <= 0) return 5;
  return dayCount / weeks;
}

function weeksFromSteps(steps: number | null, spw: number): number | null {
  if (steps == null || spw <= 0) return null;
  return Math.round((steps / spw) * 10) / 10;
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

/**
 * Aggregate trades into daily steps. Day MFE = the highest intraday equity
 * excursion above the day's starting equity: for each trade (in ledger order),
 * cumBefore + max(0, tradeMfe) when mfeUsd is present, cumBefore + max(0, pnl)
 * (running realized peak) otherwise. Always ≥ max(0, dayPnl).
 */
function buildDailySteps(
  trades: number[],
  dates: string[],
  mfes?: (number | undefined)[]
): DailyStep[] {
  const byDay = new Map<string, DailyStep & { cum: number }>();
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    const row = byDay.get(d) ?? { date: d, pnl: 0, mfe: 0, hasMfe: false, cum: 0 };
    const tradeMfe = mfes?.[i];
    const hasTradeMfe = typeof tradeMfe === "number" && Number.isFinite(tradeMfe);
    const excursion = row.cum + Math.max(0, hasTradeMfe ? tradeMfe : trades[i]);
    row.mfe = Math.max(row.mfe, excursion);
    row.cum += trades[i];
    row.pnl = row.cum;
    row.hasMfe = row.hasMfe || hasTradeMfe;
    byDay.set(d, row);
  }
  return [...byDay.values()]
    .map(({ date, pnl, mfe, hasMfe }) => ({ date, pnl, mfe: Math.max(mfe, pnl, 0), hasMfe }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildDailyPnls(trades: number[], dates: string[]): DailyPnl[] {
  return buildDailySteps(trades, dates).map(({ date, pnl }) => ({ date, pnl }));
}

function buildWeekStepBlocks(daily: DailyStep[]): DailyStep[][] {
  if (daily.length === 0) return [];
  const blocks: DailyStep[][] = [];
  let currentKey = weekKey(daily[0].date);
  let current: DailyStep[] = [];
  for (const row of daily) {
    const k = weekKey(row.date);
    if (k !== currentKey && current.length > 0) {
      blocks.push(current);
      current = [];
      currentKey = k;
    }
    current.push(row);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

export function buildWeekBlocks(daily: DailyPnl[]): number[][] {
  const steps = daily.map((d) => ({ ...d, mfe: Math.max(0, d.pnl), hasMfe: false }));
  return buildWeekStepBlocks(steps).map((block) => block.map((s) => s.pnl));
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
  return arr[Math.floor(mcRng() * arr.length)];
}

/** Test-only: inject deterministic RNG. */
let mcRng: () => number = Math.random;

export function setMcRng(fn: () => number): void {
  mcRng = fn;
}

export function resetMcRng(): void {
  mcRng = Math.random;
}

function generateBootstrapSequence(
  tradeSteps: McStep[],
  daySteps: McStep[],
  weekBlocks: McStep[][],
  maxSteps: number,
  mode: McBootstrap
): McStep[] {
  const out: McStep[] = [];
  while (out.length < maxSteps) {
    if (mode === "week" && weekBlocks.length >= 2) {
      const block = pickRandom(weekBlocks);
      for (const step of block) {
        out.push(step);
        if (out.length >= maxSteps) break;
      }
    } else if (mode === "day" && daySteps.length > 0) {
      out.push(pickRandom(daySteps));
    } else if (mode === "week" && weekBlocks.length === 1) {
      out.push(pickRandom(weekBlocks[0]));
    } else if (daySteps.length > 0 && mode !== "trade") {
      out.push(pickRandom(daySteps));
    } else {
      out.push(pickRandom(tradeSteps));
    }
  }
  return out;
}

function evalPassReady(
  cumulative: number,
  bestDayPnl: number,
  tradingDays: number,
  winningDays: number,
  passAt: number,
  consistency?: McConsistencyRule,
  rulePack?: McRulePack
): boolean {
  if (rulePack) {
    return evalPassReadyWithPack({
      cumulative,
      bestDayPnl,
      tradingDays,
      winningDays,
      passAt,
      pack: rulePack,
      legacyConsistency: consistency,
    });
  }
  if (cumulative < passAt) return false;
  if (!consistency || consistency.consistencyPct <= 0) return true;
  const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 0;
  return bestPct < consistency.consistencyPct && tradingDays >= consistency.minDays;
}

function payoutConsistencyReady(
  cumulative: number,
  bestDayPnl: number,
  winningDays: number,
  payoutConsistencyPct: number,
  rulePack?: McRulePack
): boolean {
  if (rulePack) {
    return payoutReadyWithPack({
      cumulative,
      bestDayPnl,
      winningDays,
      payoutConsistencyPct,
      pack: rulePack,
    });
  }
  if (payoutConsistencyPct <= 0) return true;
  if (cumulative < 0) return false;
  const bestPct = cumulative > 0 ? (bestDayPnl / cumulative) * 100 : 100;
  return bestPct < payoutConsistencyPct;
}

type SimPhase = "eval" | "funded" | "bust" | "done";

export function runMonteCarlo(params: McParams): McResult {
  const { trades, dates, sims, maxTrades, trailingDD, passAt } = params;
  const payoutEcon = params.payoutEconomics;
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
  const dailySteps = dates ? buildDailySteps(trades, dates, params.mfes) : [];
  const daySteps: McStep[] = dailySteps.map((d) => ({ pnl: d.pnl, mfe: d.mfe }));
  const weekStepBlocks = buildWeekStepBlocks(dailySteps).map((block) =>
    block.map((d): McStep => ({ pnl: d.pnl, mfe: d.mfe }))
  );
  const tradeSteps: McStep[] = trades.map((pnl, i) => {
    const m = params.mfes?.[i];
    const has = typeof m === "number" && Number.isFinite(m);
    return { pnl, mfe: has ? Math.max(0, m, pnl) : null };
  });
  const bootstrap = resolveMcBootstrap(trades, dates, params.bootstrap, consistency);
  const consistencyAware = Boolean(consistency) || Boolean(params.rulePack?.consistency);
  const payoutAt = fundedOnly
    ? (fundedRules?.payoutProfitTarget ?? fees.payoutBuffer)
    : passAt + fees.payoutBuffer;
  const tpw = tradesPerWeekFromDates(dates);
  const spw = stepsPerWeekFor(bootstrap, dates, dailySteps.length);
  const stepUnit: "trade" | "day" = bootstrap === "trade" ? "trade" : "day";
  const evalCost = fees.evalFee || fees.monthlyFee || 0;
  const rulePack = params.rulePack ?? legacyRulePack(trailingDD);
  const usePack = params.rulePack != null;

  // F2: trail on unrealized MFE peaks — only meaningful for intraday trailing
  // (Apex/legacy). Requires ≥50% of trades to carry a real mfeUsd.
  const mfeCoverage =
    trades.length > 0 && params.mfes
      ? trades.filter((_, i) => {
          const m = params.mfes?.[i];
          return typeof m === "number" && Number.isFinite(m);
        }).length / trades.length
      : 0;
  const mfeAvailable = mfeCoverage >= 0.5;
  const mfeTrailApplied =
    mfeAvailable &&
    (rulePack.trailingMode === "intraday" ||
      params.fundedRulePack?.trailingMode === "intraday");

  // F6: funded phase of eval_path runs on a fresh account with its own pack.
  const fundedPack = params.fundedRulePack ?? null;
  const fundedPayoutTarget = fundedRules?.payoutProfitTarget ?? fees.payoutBuffer;

  const emptyEconomics: McEconomics = {
    tradesPerWeek: tpw,
    stepsPerWeek: spw,
    stepUnit,
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
    medianNetPerAccountUsd: 0,
    expectedNetPerAccountUsd: 0,
    medianWithdrawnUsd: 0,
    weeksOccupiedMean: null,
    expectedUsdPerWeekOccupied: null,
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
  const simNetPerAccount: number[] = [];
  const grossWithdrawnPerSim: number[] = [];
  const weeksOccupiedPerSim: number[] = [];
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
  const daysPass: number[] = [];
  const daysBust: number[] = [];
  const daysTimeout: number[] = [];

  for (let s = 0; s < sims; s++) {
    const sequence = generateBootstrapSequence(tradeSteps, daySteps, weekStepBlocks, maxTrades, bootstrap);
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
    let winningDays = 0;
    let cumulativeFundedProfit = 0;
    let recycleCycles = 0;
    let simPayouts = 0;
    let hadAnyPayout = false;
    let totalWithdrawnUsd = 0;
    let eventTrades = maxTrades;
    let passAtTrade: number | null = null;
    /** F6: cumulative equity banked in prior phases — keeps charts continuous across the reset. */
    let eqOffset = 0;
    let activePack = rulePack;
    let activeUsePack = usePack;
    const pathTrace: number[] = [0];
    paths[0][s] = 0;
    const packState = createRulePackState(activePack);

    for (let t = 1; t <= maxTrades; t++) {
      if (phase === "eval" || phase === "funded") {
        const step = sequence[t - 1];
        const dayPnl = applyDayPnl(step.pnl, activePack);
        const stepMfe =
          mfeAvailable && activePack.trailingMode === "intraday" ? step.mfe : null;

        if (activeUsePack) {
          updateRulePackState(packState, dayPnl, activePack, stepMfe);
          eq = packState.eq;
          peak = packState.peak;
        } else {
          const eqBefore = eq;
          eq += dayPnl;
          peak = Math.max(peak, eq);
          if (stepMfe != null && stepMfe > 0) peak = Math.max(peak, eqBefore + stepMfe);
        }

        cumulative += dayPnl;
        tradingDays++;
        if (dayPnl > bestDayPnl) bestDayPnl = dayPnl;
        if (isWinningDay(dayPnl, activePack)) winningDays++;

        maxDD = Math.max(maxDD, peak - eq);

        if (!fundedOnly && phase === "eval" && cumulative >= passAt) hitGrossPass = true;

        const busted = activeUsePack
          ? isRulePackBust(packState, activePack)
          : peak - eq >= activePack.trailingDD;

        if (busted) {
          phase = "bust";
          eventTrades = t;
        } else if (
          !fundedOnly &&
          phase === "eval" &&
          evalPassReady(
            cumulative,
            bestDayPnl,
            tradingDays,
            winningDays,
            passAt,
            consistency,
            activePack
          )
        ) {
          phase = "funded";
          passed = true;
          passAtTrade = t;
          tradesToPass.push(t);
          // F6: fund a FRESH account — bank eval equity for display, reset
          // equity/trail/counters, and swap to the funded-phase rule pack.
          eqOffset += eq;
          eq = 0;
          peak = 0;
          cumulative = 0;
          bestDayPnl = 0;
          tradingDays = 0;
          winningDays = 0;
          if (fundedPack) {
            activePack = fundedPack;
            activeUsePack = true;
          }
          const fresh = createRulePackState(activePack);
          packState.eq = fresh.eq;
          packState.peak = fresh.peak;
          packState.mllFloorEq = fresh.mllFloorEq;
          packState.mllLocked = fresh.mllLocked;
        } else if (phase === "funded" && eq >= (fundedOnly ? payoutAt : fundedPayoutTarget)) {
          const payoutConsPct = fundedRules?.payoutConsistencyPct ?? 0;
          const payoutReady = payoutConsistencyReady(
            cumulative,
            bestDayPnl,
            winningDays,
            payoutConsPct,
            activePack
          );

          if (payoutReady) {
            tradesToPayout.push(t);
            eventTrades = t;

            const withdrawn = payoutEcon
              ? withdrawableAtEquity(eq, payoutEcon).traderReceivesUsd
              : Math.max(0, eq - (fundedOnly ? fees.activationFee : fees.evalFee + fees.activationFee));
            totalWithdrawnUsd += withdrawn;
            payouts++;
            simPayouts++;
            hadAnyPayout = true;
            gotPayout = true;
            cumulativeFundedProfit += eq;

            const recycleCap = fundedRules?.recycleProfitCap ?? Infinity;
            // F4: lifetime payout cap (Apex 4.0: account closes after 6 payouts).
            const underPayoutCap = simPayouts < (fundedRules?.maxPayouts ?? Infinity);
            const canRecycle =
              fundedOnly &&
              fundedRules?.accountRecycling &&
              cumulativeFundedProfit < recycleCap &&
              underPayoutCap;

            if (canRecycle) {
              recycleCycles++;
              eq = 0;
              peak = 0;
              cumulative = 0;
              bestDayPnl = 0;
              tradingDays = 0;
              winningDays = 0;
              gotPayout = false;
              if (activeUsePack) {
                const fresh = createRulePackState(activePack);
                packState.eq = fresh.eq;
                packState.peak = fresh.peak;
                packState.mllFloorEq = fresh.mllFloorEq;
                packState.mllLocked = fresh.mllLocked;
              }
            } else {
              phase = "done";
            }
          }
        }
      }

      paths[t][s] = eqOffset + eq;
      pathTrace.push(eqOffset + eq);
    }

    if (hitGrossPass && !passed) {
      blockedByConsistency = true;
      consistencyBlocked++;
    }
    if (hitGrossPass) grossPasses++;

    if (passed) passes++;
    if (phase === "bust") busts++;
    if (fundedOnly && recycleCycles >= 1 && phase !== "bust") recycleCompletes++;

    const weeksEvent = weeksFromSteps(eventTrades, spw);
    const weeksInEval = passed
      ? weeksFromSteps(passAtTrade, spw)
      : fundedOnly
        ? null
        : weeksEvent;
    const pathFees = payoutEcon
      ? pathFeesUsd({
          config: payoutEcon,
          weeksToEvent: weeksEvent,
          weeksInEval,
          fundedOnly,
          passedEval: passed || hadAnyPayout,
          recycleCycles,
        })
      : evalCost;

    const simNet = totalWithdrawnUsd - pathFees;
    simNetPerAccount.push(simNet);
    grossWithdrawnPerSim.push(totalWithdrawnUsd);
    if (weeksEvent != null) weeksOccupiedPerSim.push(weeksEvent);
    if (hadAnyPayout) {
      netOnPass.push(simNet);
    }

    if (hadAnyPayout) outcomeCounts.payout++;
    else if (passed) outcomeCounts.pass++;
    else if (hitGrossPass) outcomeCounts.consBlock++;
    else if (phase === "bust") outcomeCounts.bust++;
    else outcomeCounts.open++;

    const daysApprox = (eventTrades / Math.max(spw, 0.01)) * 7;
    if (passed || hadAnyPayout) daysPass.push(daysApprox);
    else if (phase === "bust") daysBust.push(daysApprox);
    else daysTimeout.push(daysApprox);

    finalEquities.push(eqOffset + eq);
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
  const simNetSorted = [...simNetPerAccount].sort((a, b) => a - b);
  const payoutSimNets = simNetPerAccount.filter((_, idx) => grossWithdrawnPerSim[idx] > 0);
  const withdrawnSorted = grossWithdrawnPerSim.filter((w) => w > 0).sort((a, b) => a - b);

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
    ? weeksFromSteps(ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null, spw)
    : weeksFromSteps(ttpSorted.length ? percentile(ttpSorted, 0.5) : null, spw);
  const medianNet = payoutSimNets.length
    ? percentile([...payoutSimNets].sort((a, b) => a - b), 0.5)
    : 0;
  const expectedNetPerAccount =
    simNetPerAccount.length > 0
      ? Math.round(simNetPerAccount.reduce((s, x) => s + x, 0) / simNetPerAccount.length)
      : 0;
  const medianNetPerAccount = simNetSorted.length ? Math.round(percentile(simNetSorted, 0.5)) : 0;
  const medianWithdrawn = withdrawnSorted.length ? Math.round(percentile(withdrawnSorted, 0.5)) : 0;
  const netEvP05 = simNetSorted.length ? Math.round(percentile(simNetSorted, 0.05)) : 0;
  const netEvP95 = simNetSorted.length ? Math.round(percentile(simNetSorted, 0.95)) : 0;
  const avgDays = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  const costOnFail = evalCost;

  // F5: E[net] / E[weeks occupied] over ALL sims — busts and timeouts consume
  // calendar weeks too, so they belong in the denominator.
  const weeksOccupiedMean = weeksOccupiedPerSim.length
    ? Math.round((weeksOccupiedPerSim.reduce((a, b) => a + b, 0) / weeksOccupiedPerSim.length) * 10) / 10
    : null;
  const expectedUsdPerWeekOccupied =
    weeksOccupiedMean != null && weeksOccupiedMean > 0
      ? Math.round(expectedNetPerAccount / weeksOccupiedMean)
      : null;

  // F9: clean per-sim mean (was payoutRate × medianNet − bustRate × fee — a
  // mixed estimator that ignored timeout-path fees).
  const expectedNetPerAttempt = expectedNetPerAccount;
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
      stepsPerWeek: Math.round(spw * 10) / 10,
      stepUnit,
      weeksToPassP50: weeksPassP50,
      weeksToPassP90: weeksFromSteps(ttpSorted.length ? percentile(ttpSorted, 0.9) : null, spw),
      weeksToPayoutP50: weeksFromSteps(ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null, spw),
      weeksToPayoutP90: weeksFromSteps(ttpaySorted.length ? percentile(ttpaySorted, 0.9) : null, spw),
      tradesToPayoutP50: ttpaySorted.length ? percentile(ttpaySorted, 0.5) : null,
      payoutRate,
      expectedAccounts,
      accountsFor90Pct,
      evalCostPerAttempt: evalCost,
      expectedNetPerAttempt: Math.round(expectedNetPerAttempt),
      expectedNetUntilPass,
      medianNetOnPass: Math.round(medianNet),
      payoutAt,
      medianNetPerAccountUsd: medianNetPerAccount,
      expectedNetPerAccountUsd: expectedNetPerAccount,
      medianWithdrawnUsd: medianWithdrawn,
      weeksOccupiedMean,
      expectedUsdPerWeekOccupied,
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
    engineVersion: MC_ENGINE_VERSION,
    rulePackFeatures: params.rulePack ? rulePackFeatureIds(params.rulePack) : [],
    netEvP05,
    netEvP95,
    avgDaysPass: avgDays(daysPass),
    avgDaysBust: avgDays(daysBust),
    avgDaysTimeout: avgDays(daysTimeout),
    mfeTrailApplied,
    mfeCoveragePct: Math.round(mfeCoverage * 100) / 100,
  };
}
