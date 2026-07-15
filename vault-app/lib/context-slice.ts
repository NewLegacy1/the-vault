import { bootstrapEvCi, computeRiskGeometry, type BootstrapEvCi, type RiskGeometry } from "./risk-geometry";

export type ContextSliceId =
  | "all"
  | "year_odd"
  | "year_even"
  | "h1"
  | "h2"
  | "jul_oct"
  | "not_jul_oct"
  | "q1"
  | "q2"
  | "q3"
  | "q4";

export type ContextSliceDef = {
  id: ContextSliceId;
  label: string;
  /** Purpose tag: which role this slice plays in Stage-0. */
  purpose: "event" | "context" | "reference" | "outcome";
};

export const CONTEXT_SLICES: ContextSliceDef[] = [
  { id: "all", label: "All trades", purpose: "reference" },
  { id: "h1", label: "H1 (Jan–Jun)", purpose: "context" },
  { id: "h2", label: "H2 (Jul–Dec)", purpose: "context" },
  { id: "jul_oct", label: "Jul+Oct stand-down months", purpose: "context" },
  { id: "not_jul_oct", label: "Excl. Jul+Oct", purpose: "context" },
  { id: "q1", label: "Q1", purpose: "context" },
  { id: "q2", label: "Q2", purpose: "context" },
  { id: "q3", label: "Q3", purpose: "context" },
  { id: "q4", label: "Q4", purpose: "context" },
  { id: "year_odd", label: "Odd years", purpose: "reference" },
  { id: "year_even", label: "Even years", purpose: "reference" },
];

function month(d: string): number {
  return Number(d.slice(5, 7)) || 0;
}

function year(d: string): number {
  return Number(d.slice(0, 4)) || 0;
}

export function filterByContextSlice(
  trades: number[],
  dates: string[],
  slice: ContextSliceId
): { trades: number[]; dates: string[] } {
  if (slice === "all") return { trades, dates };
  const outT: number[] = [];
  const outD: string[] = [];
  for (let i = 0; i < trades.length; i++) {
    const d = dates[i] ?? "";
    if (!d) continue;
    const m = month(d);
    const y = year(d);
    let keep = false;
    switch (slice) {
      case "h1":
        keep = m >= 1 && m <= 6;
        break;
      case "h2":
        keep = m >= 7 && m <= 12;
        break;
      case "jul_oct":
        keep = m === 7 || m === 10;
        break;
      case "not_jul_oct":
        keep = m !== 7 && m !== 10;
        break;
      case "q1":
        keep = m >= 1 && m <= 3;
        break;
      case "q2":
        keep = m >= 4 && m <= 6;
        break;
      case "q3":
        keep = m >= 7 && m <= 9;
        break;
      case "q4":
        keep = m >= 10 && m <= 12;
        break;
      case "year_odd":
        keep = y % 2 === 1;
        break;
      case "year_even":
        keep = y % 2 === 0;
        break;
      default: {
        const _exhaustive: never = slice;
        void _exhaustive;
        keep = true;
      }
    }
    if (keep) {
      outT.push(trades[i]!);
      outD.push(d);
    }
  }
  return { trades: outT, dates: outD };
}

export type ContextSliceResult = {
  id: ContextSliceId;
  label: string;
  purpose: ContextSliceDef["purpose"];
  n: number;
  geometry: RiskGeometry;
  evCi: BootstrapEvCi;
  coversZero: boolean;
};

export function analyzeContextSlices(
  trades: number[],
  dates: string[],
  nBoot = 800
): ContextSliceResult[] {
  return CONTEXT_SLICES.map((def) => {
    const sliced = filterByContextSlice(trades, dates, def.id);
    const geometry = computeRiskGeometry(sliced.trades);
    const evCi = bootstrapEvCi(sliced.trades, nBoot);
    return {
      id: def.id,
      label: def.label,
      purpose: def.purpose,
      n: sliced.trades.length,
      geometry,
      evCi,
      coversZero: evCi.ciLow <= 0 && evCi.ciHigh >= 0,
    };
  }).filter((r) => r.n > 0 || r.id === "all");
}
