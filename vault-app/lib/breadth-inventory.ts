import type { StrategyChainPair } from "./strategy-chain";

export type BreadthKind = "independent" | "sequential_same_family" | "correlated_filter" | "unknown";

export type BreadthLeg = {
  id: string;
  label: string;
  role: "eval" | "funded" | "parallel";
  familyHint: "prb" | "macro" | "hybrid" | "other";
};

export type BreadthInventory = {
  pairId: string;
  pairLabel: string;
  kind: BreadthKind;
  /** Effective independent bet count for √breadth intuition (soft score). */
  effectiveBreadth: number;
  legs: BreadthLeg[];
  verdict: string;
  note: string;
};

function familyFromPresetId(id: string): BreadthLeg["familyHint"] {
  if (id.includes("h0") || id.includes("h1") || id.includes("hybrid")) return "hybrid";
  if (id.includes("b0") || id.includes("b1") || id.includes("macro") || id.includes("m0")) return "macro";
  if (id.includes("a0") || id.includes("a1") || id.includes("d1") || id.includes("prb")) return "prb";
  return "other";
}

function leg(id: string, role: BreadthLeg["role"]): BreadthLeg {
  return {
    id,
    label: id.replace(/^matrix-/, "").toUpperCase(),
    role,
    familyHint: familyFromPresetId(id),
  };
}

/**
 * Grinold breadth inventory — independent books vs correlated same-family filters.
 */
export function inventoryChainBreadth(pair: StrategyChainPair): BreadthInventory {
  const legs: BreadthLeg[] = [
    leg(pair.evalPresetId, "eval"),
    leg(pair.fundedPresetId, "funded"),
  ];
  if (pair.portfolioLegPresetId) {
    legs.push(leg(pair.portfolioLegPresetId, "parallel"));
  }

  const evalFam = legs[0]!.familyHint;
  const fundedFam = legs[1]!.familyHint;
  const parallel = legs.find((l) => l.role === "parallel");

  let kind: BreadthKind;
  let effectiveBreadth: number;
  let verdict: string;
  let note: string;

  if (pair.mode === "portfolio_parallel" && parallel) {
    const distinct =
      parallel.familyHint !== evalFam && parallel.familyHint !== "hybrid"
        ? true
        : parallel.familyHint !== evalFam;
    if (distinct || parallel.familyHint === "macro") {
      kind = "independent";
      effectiveBreadth = 2;
      verdict = "Real breadth — sequential PRB chain + parallel Macro sleeve";
      note = "Count ~2 independent books for √breadth. Do not treat sleeve filters as a third book.";
    } else {
      kind = "correlated_filter";
      effectiveBreadth = 1.2;
      verdict = "Weak parallel — same family as chain; little true diversification";
      note = "Portfolio_parallel in name only if the leg is another ICT coat.";
    }
  } else if (evalFam === fundedFam && (evalFam === "prb" || evalFam === "macro")) {
    kind = "sequential_same_family";
    effectiveBreadth = 1;
    verdict = "One family, two phases (eval→funded) — not √2 skill";
    note = "A0a→D1 is ops phase design, not two independent alphas. Gate A/Bs on the same fills stay breadth≈1.";
  } else if (evalFam === "hybrid" || fundedFam === "hybrid") {
    kind = "correlated_filter";
    effectiveBreadth = 1.1;
    verdict = "Hybrid mixes families on overlapping cadence — treat as ≤1.2 breadth";
    note = "Frequency stack ≠ independent bets. H0b speed can raise DD without adding √breadth.";
  } else {
    kind = "unknown";
    effectiveBreadth = 1;
    verdict = "Unclassified pair — assume breadth 1 until proven independent";
    note = "Register new pairs with family tags before claiming diversification.";
  }

  return {
    pairId: pair.id,
    pairLabel: pair.label,
    kind,
    effectiveBreadth,
    legs,
    verdict,
    note,
  };
}
