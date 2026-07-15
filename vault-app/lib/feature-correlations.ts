import type { ParsedTrade } from "./csv";

export type FeatureCorrRow = {
  feature: string;
  n: number;
  pearsonR: number | null;
  note: string;
};

function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 8) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i]!;
    sy += ys[i]!;
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i]! - mx;
    const b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx <= 0 || dy <= 0) return null;
  return num / Math.sqrt(dx * dy);
}

function pairs(
  trades: ParsedTrade[],
  extract: (t: ParsedTrade) => number | undefined
): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const t of trades) {
    const x = extract(t);
    if (x == null || !Number.isFinite(x)) continue;
    xs.push(x);
    ys.push(t.pnl);
  }
  return { xs, ys };
}

/** Read-only feature↔outcome correlations from enriched ledger (not causal). */
export function computeFeatureCorrelations(trades: ParsedTrade[]): FeatureCorrRow[] {
  if (trades.length < 8) return [];

  const specs: { feature: string; extract: (t: ParsedTrade) => number | undefined; note: string }[] = [
    {
      feature: "MFE $",
      extract: (t) => t.mfeUsd,
      note: "Higher MFE vs PnL — excursion reach vs realized",
    },
    {
      feature: "MAE $",
      extract: (t) => t.maeUsd,
      note: "Adverse excursion vs PnL — trail/geometry shape",
    },
    {
      feature: "|MFE|−|MAE|",
      extract: (t) =>
        t.mfeUsd != null && t.maeUsd != null ? Math.abs(t.mfeUsd) - Math.abs(t.maeUsd) : undefined,
      note: "Asymmetry of excursion envelope",
    },
    {
      feature: "Duration bars",
      extract: (t) => t.durationBars,
      note: "Hold time vs outcome",
    },
    {
      feature: "Return %",
      extract: (t) => t.returnPct,
      note: "Should track PnL closely when size stable",
    },
    {
      feature: "Month (1–12)",
      extract: (t) => {
        const m = Number(t.date.slice(5, 7));
        return Number.isFinite(m) ? m : undefined;
      },
      note: "Seasonal calendar context (not causal)",
    },
    {
      feature: "Long=1 / Short=0",
      extract: (t) => (t.direction === "long" ? 1 : t.direction === "short" ? 0 : undefined),
      note: "Side vs PnL",
    },
  ];

  return specs.map((s) => {
    const { xs, ys } = pairs(trades, s.extract);
    const r = pearson(xs, ys);
    return {
      feature: s.feature,
      n: xs.length,
      pearsonR: r != null ? Math.round(r * 1000) / 1000 : null,
      note: s.note,
    };
  });
}
