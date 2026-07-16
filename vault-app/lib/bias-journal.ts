import { JournalEntry, MorningBias, PrbFilter } from "./types";

export interface BiasJournalStats {
  logged: number;
  withBias: number;
  trades: number;
  skips: number;
  filterMismatch: number;
  mismatchLosses: number;
  mismatchNet: number;
  bothOnBearishRead: number;
  alignedWins: number;
  alignedLosses: number;
}

function filterAllows(filter: PrbFilter | undefined, dir: "long" | "short"): boolean {
  if (!filter || filter === "Both") return true;
  if (filter === "Long only") return dir === "long";
  return dir === "short";
}

function biasFavorsShort(bias: MorningBias): boolean {
  return bias === "short" || bias === "skip";
}

function biasFavorsLong(bias: MorningBias): boolean {
  return bias === "long";
}

/** Morning bias vs PRB filter vs trade direction — surfaces Feb–Mar-style bleed. */
export function analyzeBiasJournal(entries: JournalEntry[]): BiasJournalStats {
  let withBias = 0;
  let filterMismatch = 0;
  let mismatchLosses = 0;
  let mismatchNet = 0;
  let bothOnBearishRead = 0;
  let alignedWins = 0;
  let alignedLosses = 0;

  const trades = entries.filter((e) => e.direction !== "skip");
  const skips = entries.length - trades.length;

  for (const e of entries) {
    // Morningstar study logs stay on Direction=Both — skip PRB filter-mismatch math
    if (e.accountId.startsWith("study:") || e.strategy === "Morningstar") {
      if (e.morningBias) withBias += 1;
      continue;
    }

    if (e.morningBias) withBias += 1;

    if (e.morningBias && e.prbFilter === "Both" && biasFavorsShort(e.morningBias)) {
      bothOnBearishRead += 1;
    }

    if (e.direction === "skip" || !e.morningBias || !e.prbFilter) continue;

    const dir = e.direction;
    const allowed = filterAllows(e.prbFilter, dir);
    const aligned =
      (biasFavorsLong(e.morningBias) && dir === "long") ||
      (biasFavorsShort(e.morningBias) && dir === "short") ||
      e.morningBias === "neutral";

    if (!allowed || (!aligned && e.morningBias !== "neutral")) {
      filterMismatch += 1;
      mismatchNet += e.pnl;
      if (e.pnl < -50) mismatchLosses += 1;
    } else if (e.pnl > 50) {
      alignedWins += 1;
    } else if (e.pnl < -50) {
      alignedLosses += 1;
    }
  }

  return {
    logged: entries.length,
    withBias,
    trades: trades.length,
    skips,
    filterMismatch,
    mismatchLosses,
    mismatchNet,
    bothOnBearishRead,
    alignedWins,
    alignedLosses,
  };
}
