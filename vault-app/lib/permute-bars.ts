/**
 * Relative OHLC + gap shuffle permutation (Masters-style path randomization).
 * Preserves first open / last close band; destroys bar-path patterns.
 * Prop Lab MC (trade bootstrap) is a different tool — see permutation-tests.md
 */

export type OhlcBar = {
  open: number;
  high: number;
  low: number;
  close: number;
};

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * @param bars OHLC series
 * @param startIndex bars before this index are copied unchanged (walk-forward)
 * @param seed RNG seed
 */
export function permuteBars(
  bars: OhlcBar[],
  startIndex = 0,
  seed = 1
): OhlcBar[] {
  const n = bars.length;
  if (n === 0) return [];
  if (startIndex < 0 || startIndex >= n) {
    throw new Error(`startIndex ${startIndex} out of range for length ${n}`);
  }
  const rng = mulberry32(seed);

  // Relative to bar open (log space); gap = open - prior close
  const relH: number[] = [];
  const relL: number[] = [];
  const relC: number[] = [];
  const gaps: number[] = [];

  for (let i = startIndex; i < n; i++) {
    const b = bars[i]!;
    const o = Math.log(Math.max(b.open, 1e-12));
    relH.push(Math.log(Math.max(b.high, 1e-12)) - o);
    relL.push(Math.log(Math.max(b.low, 1e-12)) - o);
    relC.push(Math.log(Math.max(b.close, 1e-12)) - o);
    if (i === startIndex) {
      gaps.push(0);
    } else {
      const prevC = Math.log(Math.max(bars[i - 1]!.close, 1e-12));
      gaps.push(o - prevC);
    }
  }

  const m = relH.length;
  const idxIntra = Array.from({ length: m }, (_, i) => i);
  const idxGap = Array.from({ length: m }, (_, i) => i);
  shuffleInPlace(idxIntra, rng);
  shuffleInPlace(idxGap, rng);

  const out: OhlcBar[] = bars.slice(0, startIndex).map((b) => ({ ...b }));
  let logClose =
    startIndex > 0
      ? Math.log(Math.max(bars[startIndex - 1]!.close, 1e-12))
      : Math.log(Math.max(bars[0]!.open, 1e-12));

  for (let k = 0; k < m; k++) {
    const gi = idxGap[k]!;
    const ii = idxIntra[k]!;
    const logOpen = k === 0 && startIndex === 0
      ? Math.log(Math.max(bars[startIndex]!.open, 1e-12))
      : logClose + gaps[gi]!;
    const logH = logOpen + relH[ii]!;
    const logL = logOpen + relL[ii]!;
    const logC = logOpen + relC[ii]!;
    const hi = Math.exp(Math.max(logH, logOpen, logC, logL));
    const lo = Math.exp(Math.min(logL, logOpen, logC, logH));
    const open = Math.exp(logOpen);
    const close = Math.exp(logC);
    out.push({
      open,
      high: Math.max(hi, open, close),
      low: Math.min(lo, open, close),
      close,
    });
    logClose = logC;
  }
  return out;
}

/** Synthetic GBM-ish OHLC for demos when vault has no bar CSV. */
export function syntheticOhlc(
  n: number,
  seed = 42,
  startPrice = 100
): OhlcBar[] {
  const rng = mulberry32(seed);
  const bars: OhlcBar[] = [];
  let p = startPrice;
  for (let i = 0; i < n; i++) {
    const open = p;
    const ret = (rng() - 0.48) * 0.02;
    const close = open * (1 + ret);
    const wick = open * 0.005 * rng();
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    bars.push({ open, high, low, close });
    p = close;
  }
  return bars;
}

/** Donchian channel breakout positions: +1 long, -1 short, 0 flat. */
export function donchianSignal(bars: OhlcBar[], lookback: number): number[] {
  const pos = new Array(bars.length).fill(0);
  for (let i = lookback; i < bars.length; i++) {
    let hh = -Infinity;
    let ll = Infinity;
    for (let j = i - lookback; j < i; j++) {
      hh = Math.max(hh, bars[j]!.high);
      ll = Math.min(ll, bars[j]!.low);
    }
    const c = bars[i]!.close;
    if (c >= hh) pos[i] = 1;
    else if (c <= ll) pos[i] = -1;
    else pos[i] = pos[i - 1] ?? 0;
  }
  return pos;
}

/** Bar-level strategy log returns (position on bar i applied to return i→i+1). */
export function strategyLogReturns(bars: OhlcBar[], pos: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < bars.length - 1; i++) {
    const r =
      Math.log(Math.max(bars[i + 1]!.close, 1e-12)) -
      Math.log(Math.max(bars[i]!.close, 1e-12));
    out.push((pos[i] ?? 0) * r);
  }
  return out;
}

export function profitFactor(returns: number[]): number {
  let gp = 0;
  let gl = 0;
  for (const r of returns) {
    if (r > 0) gp += r;
    else if (r < 0) gl += -r;
  }
  if (gl < 1e-12) return gp > 0 ? 99 : 1;
  return gp / gl;
}

export function optimizeDonchian(
  bars: OhlcBar[],
  lookbacks: number[]
): { lookback: number; pf: number } {
  let best = { lookback: lookbacks[0] ?? 20, pf: -Infinity };
  for (const lb of lookbacks) {
    if (lb < 2 || lb >= bars.length - 2) continue;
    const pf = profitFactor(strategyLogReturns(bars, donchianSignal(bars, lb)));
    if (pf > best.pf) best = { lookback: lb, pf };
  }
  return best;
}
