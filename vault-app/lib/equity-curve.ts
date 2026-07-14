export interface EquityPoint {
  i: number;
  date: string;
  pnl: number;
  cum: number;
  peak: number;
  dd: number;
}

export interface EquityStats {
  points: EquityPoint[];
  net: number;
  maxDd: number;
  peak: number;
  wins: number;
  losses: number;
  scratches: number;
}

export function buildEquityCurve(trades: number[], dates: string[]): EquityStats {
  const points: EquityPoint[] = [];
  let cum = 0;
  let peak = 0;
  let maxDd = 0;
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < trades.length; i++) {
    const pnl = trades[i];
    cum += pnl;
    peak = Math.max(peak, cum);
    maxDd = Math.max(maxDd, peak - cum);
    if (pnl > 50) wins++;
    else if (pnl < -50) losses++;
    points.push({
      i: i + 1,
      date: dates[i] ?? "",
      pnl,
      cum,
      peak,
      dd: peak - cum,
    });
  }

  return {
    points,
    net: cum,
    maxDd,
    peak,
    wins,
    losses,
    scratches: trades.length - wins - losses,
  };
}
