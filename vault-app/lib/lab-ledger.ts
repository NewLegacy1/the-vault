import type { ParsedTrade } from "./csv";
import { parseLabLedger } from "./csv";
import { applyMacroMatrixFilter, isDerivedMacroPreset, macroBranchFromPreset } from "./macro-matrix";
import { presetById } from "./lab-profile";

export interface PresetLedgerEntry {
  fileName: string;
  csv: string;
  uploadedAt: string;
}

export type PresetLedgerStore = Record<string, PresetLedgerEntry>;

export interface ActiveLabDataset {
  id: string;
  presetId: string;
  label: string;
  fileName: string;
  trades: number[];
  dates: string[];
  /** Full Premium / enriched trade rows — used for Lab stats + cohort enrichment. */
  parsed: ParsedTrade[];
  sources: string[];
  derivedFromB0: boolean;
}

function suggestDatasetLabel(dates: string[]): string {
  if (dates.length < 2) return "";
  const y0 = dates[0].slice(2, 4);
  const y1 = dates[dates.length - 1].slice(2, 4);
  return y0 !== y1 ? `${y0}–${y1}` : dates[0].slice(0, 7);
}

export function datasetLabelForPreset(presetId: string, dates: string[]): string {
  const branch = presetById(presetId)?.matrixBranch ?? presetId;
  const span = suggestDatasetLabel(dates);
  return span ? `${span} · ${branch}` : branch;
}

export function buildActiveDataset(
  presetId: string,
  ledgers: PresetLedgerStore
): ActiveLabDataset | null {
  const preset = presetById(presetId);
  if (!preset) return null;

  if (isDerivedMacroPreset(presetId)) {
    const b0 = ledgers["matrix-b0"];
    if (!b0?.csv) return null;
    const branch = macroBranchFromPreset(presetId);
    if (!branch) return null;
    const filtered = applyMacroMatrixFilter(parseLabLedger(b0.csv), branch);
    if (filtered.length === 0) return null;
    const label = datasetLabelForPreset(presetId, filtered.map((t) => t.date));
    return {
      id: `derived-${presetId}`,
      presetId,
      label,
      fileName: `${b0.fileName} → ${preset.matrixBranch}`,
      trades: filtered.map((t) => t.pnl),
      dates: filtered.map((t) => t.date),
      parsed: filtered,
      sources: [`Derived from B0 (${b0.fileName}) — ${preset.matrixBranch} filter`],
      derivedFromB0: true,
    };
  }

  const entry = ledgers[presetId];
  if (!entry?.csv) return null;
  const parsed = parseLabLedger(entry.csv);
  if (parsed.length === 0) return null;
  const label = datasetLabelForPreset(presetId, parsed.map((t) => t.date));
  return {
    id: `ledger-${presetId}`,
    presetId,
    label,
    fileName: entry.fileName,
    trades: parsed.map((t) => t.pnl),
    dates: parsed.map((t) => t.date),
    parsed,
    sources: [entry.fileName],
    derivedFromB0: false,
  };
}

export function saveLedgerEntry(
  store: PresetLedgerStore,
  presetId: string,
  fileName: string,
  csv: string
): PresetLedgerStore {
  return {
    ...store,
    [presetId]: { fileName, csv, uploadedAt: new Date().toISOString() },
  };
}

export function parsedFromLedger(csv: string): ParsedTrade[] {
  return parseLabLedger(csv);
}
