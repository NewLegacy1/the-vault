import type { PathBDefaults } from "./defaults";

export type Bar = {
  time: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type RbHit = {
  bear: boolean;
  bull: boolean;
  /** Block-candle extremes (bear extreme = high, bull extreme = low). */
  high: number;
  low: number;
  /** Wick-start = end of candle-A body (bear = max(oA,cA), bull = min(oA,cA)). */
  wsBear: number;
  wsBull: number;
};

/**
 * Two-candle Powell RB (Dual29 spec — mirrors pine f_pb1Pack):
 *   BULL: candle A (idx-1) BEARISH → candle B (idx) BULLISH block.
 *         B's wick sweeps A's wick low (toggle) and extends past A's body end.
 *         Zone = A body end (wick-start) → B low (extreme). Height ≥ minW.
 *   BEAR: exact mirror.
 * A lone long-wick candle is NEVER an RB.
 */
export function detectRbAt(
  bars: Bar[],
  idx: number,
  minW: number,
  cfg: Pick<PathBDefaults, "rbSweepWick">
): RbHit | null {
  if (idx < 1 || idx >= bars.length) return null;
  const a = bars[idx - 1]!;
  const b = bars[idx]!;
  const wsBull = Math.min(a.open, a.close);
  const wsBear = Math.max(a.open, a.close);
  const sweepLoOk = !cfg.rbSweepWick || b.low < a.low;
  const sweepHiOk = !cfg.rbSweepWick || b.high > a.high;
  const bull =
    a.close < a.open &&
    b.close > b.open &&
    sweepLoOk &&
    b.low < wsBull &&
    wsBull - b.low >= minW;
  const bear =
    a.close > a.open &&
    b.close < b.open &&
    sweepHiOk &&
    b.high > wsBear &&
    b.high - wsBear >= minW;

  return {
    bear,
    bull,
    high: b.high,
    low: b.low,
    wsBear,
    wsBull,
  };
}

/** Aggregate contiguous 1m bars into 5m OHLC (floor to 5m boundaries in ms). */
export function aggregateTo5m(bars1: Bar[]): Bar[] {
  const map = new Map<number, Bar>();
  for (const b of bars1) {
    const t = Math.floor(b.time / (5 * 60 * 1000)) * (5 * 60 * 1000);
    const cur = map.get(t);
    if (!cur) {
      map.set(t, { time: t, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume ?? 0 });
    } else {
      cur.high = Math.max(cur.high, b.high);
      cur.low = Math.min(cur.low, b.low);
      cur.close = b.close;
      cur.volume = (cur.volume ?? 0) + (b.volume ?? 0);
    }
  }
  return [...map.values()].sort((a, b) => a.time - b.time);
}
