/**
 * Risk geometry + trade EV bootstrap CI.
 * WR / RR / SD are distribution-shape diagnostics — not promotion KPIs.
 * See strategies/strategy-dev/00-charter/SCORECARD.md · prop-firm-math.md
 */

export type RiskGeometry = {
  n: number;
  wins: number;
  losses: number;
  scratches: number;
  winRatePct: number;
  avgWin: number;
  avgLoss: number;
  /** avgWin / |avgLoss|; 0 if no losses */
  rr: number;
  tradePnlSd: number;
  tradeEv: number;
  medianPnl: number;
};

export type BootstrapEvCi = {
  mean: number;
  ciLow: number;
  ciHigh: number;
  nBoot: number;
};

const SCRATCH = 50; // |pnl| below this ≈ scratch for geometry

export function computeRiskGeometry(pnls: number[]): RiskGeometry {
  const n = pnls.length;
  if (n === 0) {
    return {
      n: 0,
      wins: 0,
      losses: 0,
      scratches: 0,
      winRatePct: 0,
      avgWin: 0,
      avgLoss: 0,
      rr: 0,
      tradePnlSd: 0,
      tradeEv: 0,
      medianPnl: 0,
    };
  }
  let wins = 0;
  let losses = 0;
  let scratches = 0;
  let winSum = 0;
  let lossSum = 0;
  let sum = 0;
  for (const p of pnls) {
    sum += p;
    if (p > SCRATCH) {
      wins++;
      winSum += p;
    } else if (p < -SCRATCH) {
      losses++;
      lossSum += p;
    } else {
      scratches++;
    }
  }
  const tradeEv = sum / n;
  const avgWin = wins ? winSum / wins : 0;
  const avgLoss = losses ? lossSum / losses : 0;
  const rr = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;
  let varSum = 0;
  for (const p of pnls) {
    const d = p - tradeEv;
    varSum += d * d;
  }
  const tradePnlSd = Math.sqrt(varSum / n);
  const sorted = [...pnls].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const medianPnl =
    n % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  return {
    n,
    wins,
    losses,
    scratches,
    winRatePct: n ? Math.round((wins / n) * 1000) / 10 : 0,
    avgWin: round2(avgWin),
    avgLoss: round2(avgLoss),
    rr: Math.round(rr * 100) / 100,
    tradePnlSd: round2(tradePnlSd),
    tradeEv: round2(tradeEv),
    medianPnl: round2(medianPnl),
  };
}

/** Nonparametric bootstrap CI for mean PnL (trade EV). */
export function bootstrapEvCi(
  pnls: number[],
  nBoot = 2000,
  alpha = 0.05,
  rng: () => number = Math.random
): BootstrapEvCi {
  const n = pnls.length;
  if (n === 0) return { mean: 0, ciLow: 0, ciHigh: 0, nBoot: 0 };
  const mean = pnls.reduce((a, b) => a + b, 0) / n;
  const samples: number[] = [];
  for (let b = 0; b < nBoot; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) {
      s += pnls[Math.floor(rng() * n)]!;
    }
    samples.push(s / n);
  }
  samples.sort((a, b) => a - b);
  const lo = samples[Math.floor((alpha / 2) * nBoot)] ?? mean;
  const hi = samples[Math.min(nBoot - 1, Math.floor((1 - alpha / 2) * nBoot))] ?? mean;
  return {
    mean: round2(mean),
    ciLow: round2(lo),
    ciHigh: round2(hi),
    nBoot,
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
