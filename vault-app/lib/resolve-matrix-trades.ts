import type { CohortRecord } from "@/lib/cohort";
import { buildActiveDataset, type PresetLedgerStore } from "@/lib/lab-ledger";

export type TradeSource = "ledger" | "cohort" | "none";

export interface ResolvedMatrixTrades {
  trades: number[];
  dates: string[];
  source: TradeSource;
  label: string;
}

export function tradesFromCohort(cohort: CohortRecord | undefined): ResolvedMatrixTrades | null {
  if (!cohort?.tradePnls?.length) return null;
  return {
    trades: cohort.tradePnls,
    dates: cohort.tradeDates ?? [],
    source: "cohort",
    label: cohort.datasetName || cohort.variant,
  };
}

export function tradesFromLedger(
  presetId: string,
  ledgers: PresetLedgerStore
): ResolvedMatrixTrades | null {
  const ds = buildActiveDataset(presetId, ledgers);
  if (!ds?.trades.length) return null;
  return {
    trades: ds.trades,
    dates: ds.dates,
    source: "ledger",
    label: ds.label,
  };
}

export function resolveMatrixTrades(
  presetId: string,
  ledgers: PresetLedgerStore,
  cohort?: CohortRecord
): ResolvedMatrixTrades | null {
  return tradesFromLedger(presetId, ledgers) ?? tradesFromCohort(cohort);
}
