export interface McFees {
  evalFee: number;
  activationFee: number;
  monthlyFee: number;
  /** Extra profit on funded account before first payout request (withdrawable buffer). */
  payoutBuffer: number;
}

export interface McParams {
  trades: number[];
  dates?: string[];
  sims: number;
  maxTrades: number;
  /** Firm-derived pass line (includes consistency buffer). */
  passAt: number;
  trailingDD: number;
  fees?: McFees;
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
}

export interface McSamplePath {
  equity: number[];
  outcome: "payout" | "pass" | "bust" | "open";
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

type SimPhase = "eval" | "funded" | "bust" | "done";

export function runMonteCarlo(params: McParams): McResult {
  const { trades, dates, sims, maxTrades, trailingDD, passAt } = params;
  const fees: McFees = params.fees ?? {
    evalFee: 0,
    activationFee: 0,
    monthlyFee: 0,
    payoutBuffer: 1000,
  };
  const payoutAt = passAt + fees.payoutBuffer;
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

  for (let s = 0; s < sims; s++) {
    let eq = 0;
    let peak = 0;
    let maxDD = 0;
    let phase: SimPhase = "eval";
    let passed = false;
    let gotPayout = false;
    const pathTrace: number[] = [0];
    paths[0][s] = 0;

    for (let t = 1; t <= maxTrades; t++) {
      if (phase === "eval" || phase === "funded") {
        eq += trades[Math.floor(Math.random() * trades.length)];
        peak = Math.max(peak, eq);
        maxDD = Math.max(maxDD, peak - eq);

        if (peak - eq >= trailingDD) {
          phase = "bust";
        } else if (phase === "eval" && eq >= passAt) {
          phase = "funded";
          passed = true;
          tradesToPass.push(t);
        } else if (phase === "funded" && eq >= payoutAt) {
          tradesToPayout.push(t);
          const wks = weeksFromTrades(t, tpw) ?? 0;
          const evalMonths = evalMonthsForWeeks(wks, fees.monthlyFee);
          const totalFees = fees.evalFee + fees.activationFee + evalMonths * fees.monthlyFee;
          netOnPass.push(payoutAt - totalFees);
          payouts++;
          gotPayout = true;
          phase = "done";
        }
      }

      paths[t][s] = eq;
      pathTrace.push(eq);
    }

    if (passed) passes++;
    else if (phase === "bust") busts++;

    finalEquities.push(eq);
    maxDDs.push(maxDD);

    if (s % Math.max(1, Math.floor(sims / MAX_SAMPLES)) === 0 && samplePaths.length < MAX_SAMPLES) {
      const outcome: McSamplePath["outcome"] = gotPayout
        ? "payout"
        : passed
          ? "pass"
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

  const passRate = passes / sims;
  const bustRate = busts / sims;
  const timeoutRate = (sims - passes - busts) / sims;
  const payoutRate = payouts / sims;

  const expectedAccounts = passRate > 0 ? Math.round((1 / passRate) * 10) / 10 : Infinity;
  const accountsFor90Pct =
    passRate > 0 ? Math.ceil(Math.log(0.1) / Math.log(1 - passRate)) : Infinity;

  const weeksPassP50 = weeksFromTrades(ttpSorted.length ? percentile(ttpSorted, 0.5) : null, tpw);
  const medianNet = netSorted.length ? percentile(netSorted, 0.5) : 0;
  const costOnFail = evalCost;

  const expectedNetPerAttempt = payoutRate * medianNet - bustRate * costOnFail;
  const expectedNetUntilPass =
    passRate > 0
      ? Math.round(medianNet - (expectedAccounts - 1) * costOnFail)
      : -costOnFail * accountsFor90Pct;

  const outcomeHist = [
    { label: "PAYOUT", count: payouts, color: "#39ffba" },
    { label: "PASS", count: passes - payouts, color: "#00ff41" },
    { label: "BUST", count: busts, color: "#ff3355" },
    { label: "OPEN", count: sims - passes - busts, color: "#6a6a6a" },
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
  };
}
