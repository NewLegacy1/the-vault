import type { McResult } from "./monte-carlo";
import type { ScorecardComparison } from "./lab-scorecard";

const CACHE_KEY = "vault.lab.runCache";
const MAX_ENTRIES = 16;

export interface LabRunKeyInput {
  dsId: string;
  presetId: string;
  customLabel: string;
  hypothesis: string;
  ruleId: string;
  sims: number;
  maxTrades: number;
  payoutBuffer: number;
  winCapUsd: number;
}

export interface LabRunCacheEntry {
  runKey: string;
  res: McResult;
  comparison: ScorecardComparison;
  cohortSaved: boolean;
  saveMsg: string;
  savedAt: string;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function buildLabRunKey(input: LabRunKeyInput): string {
  return [
    input.dsId,
    input.presetId,
    input.customLabel.trim(),
    input.hypothesis.trim(),
    input.ruleId,
    input.sims,
    input.maxTrades,
    input.payoutBuffer,
    input.winCapUsd,
  ].join("|");
}

function readAll(): Record<string, LabRunCacheEntry> {
  const ls = storage();
  if (!ls) return {};
  try {
    const raw = ls.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LabRunCacheEntry>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, LabRunCacheEntry>): void {
  const ls = storage();
  if (!ls) return;
  const entries = Object.values(map).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const trimmed: Record<string, LabRunCacheEntry> = {};
  for (const e of entries.slice(0, MAX_ENTRIES)) {
    trimmed[e.runKey] = e;
  }
  try {
    ls.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // quota — drop oldest half and retry once
    const half = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
    const fallback: Record<string, LabRunCacheEntry> = {};
    for (const e of half) fallback[e.runKey] = e;
    try {
      ls.setItem(CACHE_KEY, JSON.stringify(fallback));
    } catch {
      // give up silently
    }
  }
}

export function loadLabRunCache(runKey: string): LabRunCacheEntry | null {
  return readAll()[runKey] ?? null;
}

export function saveLabRunCache(
  runKey: string,
  res: McResult,
  comparison: ScorecardComparison,
  opts?: { cohortSaved?: boolean; saveMsg?: string }
): void {
  const map = readAll();
  const prev = map[runKey];
  map[runKey] = {
    runKey,
    res,
    comparison,
    cohortSaved: opts?.cohortSaved ?? prev?.cohortSaved ?? false,
    saveMsg: opts?.saveMsg ?? prev?.saveMsg ?? "",
    savedAt: new Date().toISOString(),
  };
  writeAll(map);
}

export function markLabRunCohortSaved(runKey: string, saveMsg: string): void {
  const map = readAll();
  const entry = map[runKey];
  if (!entry) return;
  map[runKey] = { ...entry, cohortSaved: true, saveMsg, savedAt: entry.savedAt };
  writeAll(map);
}

export function isLabRunCohortSaved(runKey: string): boolean {
  return readAll()[runKey]?.cohortSaved ?? false;
}
