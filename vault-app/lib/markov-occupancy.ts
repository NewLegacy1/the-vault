/**
 * Light regime occupancy — non-overlapping windows only.
 * Complementary to prop trade-bootstrap MC; not a promotion KPI.
 */

export type RegimeLabel = string;

export type MarkovOccupancyResult = {
  labels: RegimeLabel[];
  /** Count of non-overlapping window observations per label. */
  counts: Record<RegimeLabel, number>;
  /** Empirical occupancy π̂ from counts. */
  pi: Record<RegimeLabel, number>;
  /** Transition counts P[i→j] using consecutive non-overlapping windows. */
  transitions: Record<RegimeLabel, Record<RegimeLabel, number>>;
  /** Row-normalized transition probs. */
  transitionP: Record<RegimeLabel, Record<RegimeLabel, number>>;
  nWindows: number;
  windowDays: number;
  note: string;
};

function dayKey(d: string): string {
  return d.slice(0, 10);
}

/** Assign each calendar day a regime via user-supplied tagger. */
export function buildMarkovOccupancy(opts: {
  /** Sorted trade dates YYYY-MM-DD (used to define timeline span). */
  dates: string[];
  /** Regime for a calendar day — return null to skip day. */
  tagDay: (date: string) => RegimeLabel | null;
  /** Non-overlapping window length in calendar days. */
  windowDays?: number;
}): MarkovOccupancyResult {
  const windowDays = opts.windowDays ?? 7;
  const dates = [...new Set(opts.dates.map(dayKey).filter(Boolean))].sort();
  if (dates.length === 0) {
    return {
      labels: [],
      counts: {},
      pi: {},
      transitions: {},
      transitionP: {},
      nWindows: 0,
      windowDays,
      note: "No dates — empty occupancy.",
    };
  }

  const start = new Date(`${dates[0]}T00:00:00Z`);
  const end = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
  const windows: RegimeLabel[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += windowDays * 86_400_000) {
    const tags: RegimeLabel[] = [];
    for (let d = 0; d < windowDays; d++) {
      const day = new Date(t + d * 86_400_000).toISOString().slice(0, 10);
      const label = opts.tagDay(day);
      if (label) tags.push(label);
    }
    if (tags.length === 0) continue;
    // Majority vote in the window — one non-overlapping token.
    const tally = new Map<RegimeLabel, number>();
    for (const x of tags) tally.set(x, (tally.get(x) ?? 0) + 1);
    let best = tags[0]!;
    let bestN = 0;
    for (const [k, n] of tally) {
      if (n > bestN) {
        best = k;
        bestN = n;
      }
    }
    windows.push(best);
  }

  const labels = [...new Set(windows)].sort();
  const counts: Record<RegimeLabel, number> = {};
  for (const L of labels) counts[L] = 0;
  for (const w of windows) counts[w] = (counts[w] ?? 0) + 1;

  const nWindows = windows.length;
  const pi: Record<RegimeLabel, number> = {};
  for (const L of labels) {
    pi[L] = nWindows > 0 ? Math.round(((counts[L] ?? 0) / nWindows) * 1000) / 1000 : 0;
  }

  const transitions: Record<RegimeLabel, Record<RegimeLabel, number>> = {};
  for (const a of labels) {
    transitions[a] = {};
    for (const b of labels) transitions[a]![b] = 0;
  }
  for (let i = 0; i < windows.length - 1; i++) {
    const a = windows[i]!;
    const b = windows[i + 1]!;
    transitions[a]![b] = (transitions[a]![b] ?? 0) + 1;
  }

  const transitionP: Record<RegimeLabel, Record<RegimeLabel, number>> = {};
  for (const a of labels) {
    transitionP[a] = {};
    const row = transitions[a]!;
    const rowSum = labels.reduce((s, b) => s + (row[b] ?? 0), 0);
    for (const b of labels) {
      transitionP[a]![b] =
        rowSum > 0 ? Math.round(((row[b] ?? 0) / rowSum) * 1000) / 1000 : 0;
    }
  }

  return {
    labels,
    counts,
    pi,
    transitions,
    transitionP,
    nWindows,
    windowDays,
    note: "Non-overlapping windows · majority vote · Lab footnote only — not a promote KPI.",
  };
}

/** Calendar stand-down vs trade months (PRB Jul+Oct lane). */
export function tagJulOctRegime(date: string): RegimeLabel {
  const m = Number(date.slice(5, 7));
  return m === 7 || m === 10 ? "STAND_DOWN" : "TRADE";
}
