import type { ScorecardVerdict } from "./lab-scorecard";

const CACHE_KEY = "vault.lab.runCache";
const MAX_ENTRIES = 24;

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

/** Slim cache — flags only; MC is re-run on restore (avoids huge/corrupt JSON). */
export interface LabRunCacheEntry {
  runKey: string;
  hasRun: boolean;
  cohortSaved: boolean;
  saveMsg: string;
  savedAt: string;
  verdict?: ScorecardVerdict;
  compositeScore?: number;
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
    const parsed = JSON.parse(raw) as Record<string, LabRunCacheEntry>;
    const out: Record<string, LabRunCacheEntry> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === "object" && v.hasRun) out[k] = v;
    }
    return out;
  } catch {
    try {
      ls.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
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
    try {
      ls.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
  }
}

export function loadLabRunCache(runKey: string): LabRunCacheEntry | null {
  return readAll()[runKey] ?? null;
}

export function saveLabRunCache(
  runKey: string,
  opts: {
    cohortSaved?: boolean;
    saveMsg?: string;
    verdict?: ScorecardVerdict;
    compositeScore?: number;
  }
): void {
  const map = readAll();
  const prev = map[runKey];
  map[runKey] = {
    runKey,
    hasRun: true,
    cohortSaved: opts.cohortSaved ?? prev?.cohortSaved ?? false,
    saveMsg: opts.saveMsg ?? prev?.saveMsg ?? "",
    savedAt: new Date().toISOString(),
    verdict: opts.verdict ?? prev?.verdict,
    compositeScore: opts.compositeScore ?? prev?.compositeScore,
  };
  writeAll(map);
}

export function markLabRunCohortSaved(runKey: string, saveMsg: string): void {
  const map = readAll();
  const entry = map[runKey];
  if (!entry) {
    map[runKey] = {
      runKey,
      hasRun: true,
      cohortSaved: true,
      saveMsg,
      savedAt: new Date().toISOString(),
    };
  } else {
    map[runKey] = { ...entry, cohortSaved: true, saveMsg };
  }
  writeAll(map);
}

export function isLabRunCohortSaved(runKey: string): boolean {
  return readAll()[runKey]?.cohortSaved ?? false;
}

export function clearLabRunCache(): void {
  storage()?.removeItem(CACHE_KEY);
}
