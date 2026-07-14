import type { ParsedTrade } from "./csv";

export type MacroMatrixBranch = "b1a" | "b1b" | "b1c" | "b3a" | "b3b";

const PRESET_BRANCH: Record<string, MacroMatrixBranch> = {
  "matrix-b1a": "b1a",
  "matrix-b1b": "b1b",
  "matrix-b1c": "b1c",
  "matrix-b3a": "b3a",
  "matrix-b3b": "b3b",
};

export function isDerivedMacroPreset(presetId: string): boolean {
  return presetId in PRESET_BRANCH;
}

export function macroBranchFromPreset(presetId: string): MacroMatrixBranch | null {
  return PRESET_BRANCH[presetId] ?? null;
}

export function applyMacroMatrixFilter(
  trades: ParsedTrade[],
  branch: MacroMatrixBranch
): ParsedTrade[] {
  switch (branch) {
    case "b1a":
      return trades.filter((t) => t.tier === "A");
    case "b1b":
      return trades.filter((t) => t.tier === "A" || t.tier === "H");
    case "b1c":
      return trades.filter((t) => t.tier === "A+");
    case "b3a":
      return trades
        .filter((t) => t.tier === "A")
        .map((t) => ({ ...t, pnl: t.pnl * 0.5 }));
    case "b3b":
      return trades.map((t) => ({ ...t, pnl: t.pnl * 0.5 }));
    default: {
      const _exhaustive: never = branch;
      return _exhaustive;
    }
  }
}

export function applyMacroMatrixPreset(
  trades: ParsedTrade[],
  presetId: string
): ParsedTrade[] | null {
  const branch = macroBranchFromPreset(presetId);
  if (!branch) return null;
  const filtered = applyMacroMatrixFilter(trades, branch);
  return filtered.length > 0 ? filtered : null;
}
