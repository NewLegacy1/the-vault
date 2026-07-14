/** Locked chart findings + eval/funded playbook for F4 LAB. */

import type { BeRetestAudit } from "./ghost-autopsy";
import { AB_GRAVEYARD, ALL_SEED_TRADES } from "./prb-data";

export interface ChartFinding {
  id: string;
  area: string;
  verdict: "keep" | "reject" | "watch" | "try";
  summary: string;
  action: string;
}

export interface BeAuditVerdict {
  headline: string;
  detail: string;
  tone: "pos" | "warn" | "neg" | "dim";
  recommendations: string[];
}

const seedWins = ALL_SEED_TRADES.filter((t) => t.pnl > 500);
const seedFullLosses = ALL_SEED_TRADES.filter((t) => t.pnl < -200);
const seedNet = ALL_SEED_TRADES.reduce((s, t) => s + t.pnl, 0);

export const VERIFIED_BASELINE = {
  trades: ALL_SEED_TRADES.length,
  wins: seedWins.length,
  fullLosses: seedFullLosses.length,
  netUsd: seedNet,
  winRatePct: Math.round((seedWins.length / ALL_SEED_TRADES.length) * 100),
  avgWinUsd: Math.round(seedWins.reduce((s, t) => s + t.pnl, 0) / (seedWins.length || 1)),
  span: "Dec 9 2025 – Jul 1 2026",
};

/** Settled A/B + verified replay — PRB only. */
export const CHART_FINDINGS_PRB: ChartFinding[] = [
  {
    id: "be-only",
    area: "Risk — BE +1R",
    verdict: "keep",
    summary: "Converts pop-and-fade give-backs into scratches; core of eval survivability.",
    action: "Keep ON for eval and funded. Use BE +1R retest table to measure cost (missed 5R) vs benefit.",
  },
  {
    id: "trail-off",
    area: "Risk — trail 2.0/1.5",
    verdict: "reject",
    summary: "8-month A/B: demoted Jan 2/8, Feb 10, May 22, Jun 5 winners — net ≈ −$1,040 vs BE-only.",
    action: "Leave trail OFF. Only flip Give-back regime toggle if rolling give-backs ≥ 2 in 10 sessions.",
  },
  {
    id: "approach-guard",
    area: "RB — approach guard",
    verdict: "reject",
    summary: "Feb–Mar run killed Feb 10 +$1,943 winner; net −$803.",
    action: "Keep approach guard at 0. Winners need aggressive limit fills the guard blocks.",
  },
  {
    id: "confirming-close",
    area: "RB — confirming close",
    verdict: "keep",
    summary: "Disabling confirmed net-negative in v1 postmortem.",
    action: "Do not turn OFF from ghost table alone — graveyard rule.",
  },
  {
    id: "auto-pdh-pdl",
    area: "Session — Auto PDH/PDL draw",
    verdict: "reject",
    summary: "Apr–Jul: −$1,528 vs Both; blocked May 22 +$1,969 long.",
    action: "Use manual morning bias (Long/Short only) — not mechanical Auto draw on eval.",
  },
  {
    id: "window-trades",
    area: "Session — widen window / 2 trades",
    verdict: "reject",
    summary: "Apr–Jul ghosts: 0W / 9L / 6 scr, −34R.",
    action: "Keep 10:00–13:00 and 1 trade/day.",
  },
  {
    id: "eval-cap",
    area: "Eval — win cap $1,490",
    verdict: "try",
    summary: "Full 5R winners ≈ $1,900 blow TPT 50% consistency (one day > half of total).",
    action: "Eval exports: RR 6 + eval max win cap $1,490 — plan 3+ winning days before $4k pass request.",
  },
  {
    id: "rr-375-eval",
    area: "Eval — RR 3.75 target",
    verdict: "try",
    summary: "Alternative to cap: $400 × 3.75 ≈ $1,500/win without hard cap input.",
    action: "A/B vs cap preset on same 12mo window — pick whichever passes consistency checker faster.",
  },
  {
    id: "rr-6-funded",
    area: "Funded — RR 6 raw",
    verdict: "keep",
    summary: "TPT PRO has no payout consistency — edge lives in fewer, larger wins.",
    action: "After pass: eval cap OFF, target 5–6R, same BE-only profile. This is where PRB economics work.",
  },
  {
    id: "risk-300",
    area: "Eval — risk $300",
    verdict: "watch",
    summary: "Smaller footprint before +$1k cushion — more runway vs daily stop.",
    action: "Fresh eval only until cushion built; return to $400 when DD buffer allows.",
  },
  {
    id: "bias-manual",
    area: "Session — manual bias",
    verdict: "watch",
    summary: "Feb–Mar long bleed (0-for-9) — discretionary Short-only may help; not locked in data.",
    action: "Log F2 bias daily; spot-check Short-only on Feb–Mar slice before changing control.",
  },
  {
    id: "give-back-toggle",
    area: "Give-back regime trail",
    verdict: "watch",
    summary: "Situational: +$684 vs BE in one pop-and-fade month — not default.",
    action: "Watch funnel give-back counter; toggle only when ≥ threshold, then re-export month.",
  },
];

/** @deprecated use CHART_FINDINGS_PRB or getChartFindings() */
export const CHART_FINDINGS = CHART_FINDINGS_PRB;

/** Settled Macro Model findings — from v1.2→v1.4 cohort work. */
export const CHART_FINDINGS_MACRO: ChartFinding[] = [
  {
    id: "ce-confirm",
    area: "Entry — CE tap + lift",
    verdict: "keep",
    summary: "Best entry mode tested; limit retest and signal-market underperformed.",
    action: "Keep CE confirm as default for Macro v1.4+.",
  },
  {
    id: "ts-required",
    area: "Filter — turtle soup required",
    verdict: "keep",
    summary: "Optional TS did nothing; requiring SMT always lost trades.",
    action: "TS required in macro window; SMT boosts TP only, does not gate.",
  },
  {
    id: "tier-a",
    area: "Tier — A only (TS, 40pt TP)",
    verdict: "keep",
    summary: "v1.4 year: A-tier +$4,966 on 14 trades — carries entire book.",
    action: "Funded candidate: filter ledger to tier=A before next MC.",
  },
  {
    id: "tier-ap",
    area: "Tier — A+ (TS+SMT, 50pt TP)",
    verdict: "watch",
    summary: "8 trades, 2W/6L, −$2,410. Large MFE before reversal — overshoots 40pt.",
    action: "Test A+ with 40pt TP (same as A) — roadmap 2.1.",
  },
  {
    id: "tier-h",
    area: "Tier — H half risk",
    verdict: "watch",
    summary: "4 trades, 2W/2L, −$208 — low sample; wick 56–80 half-risk logic unproven.",
    action: "Keep until more year data; do not promote to primary funded path.",
  },
  {
    id: "pivot-5",
    area: "Structure — pivot 5 vs 10",
    verdict: "reject",
    summary: "Marginal +1 trade in mixed export — not a meaningful lever.",
    action: "Default pivot 5; do not A/B pivot unless staging logic changes.",
  },
  {
    id: "macro-volume",
    area: "Frequency — v1.2 high volume",
    verdict: "reject",
    summary: "229 trades, 30.5% pass — symmetric $800 W/L busts $2k trail.",
    action: "Do not return to v1.2 trade count without halving risk or fixing loss asymmetry.",
  },
  {
    id: "macro-v13-filter",
    area: "Filters — v1.3 over-tight",
    verdict: "reject",
    summary: "25 trades/year, 42% pass but −89% trade count vs v1.2.",
    action: "v1.4 architecture (TS req, SMT optional) is the right middle ground.",
  },
  {
    id: "macro-eval",
    area: "Phase — Macro for eval",
    verdict: "watch",
    summary: "v1.4 pass 33% vs PRB 55% — Macro not eval-primary today.",
    action: "Use Macro for funded weekly edge; PRB for eval pass (see hybrid playbook).",
  },
  {
    id: "ghost-confluence",
    area: "Autopsy — CONFLUENCE table",
    verdict: "keep",
    summary: "Ghost confluence ≠ executed trades; use for filter tuning only.",
    action: "Paste MISSED + CONFLUENCE after replay; compare to CSV tier breakdown.",
  },
];

export type FindingFamily = "prb" | "macro" | "datahl" | "hybrid" | "custom";

export function getChartFindings(family: FindingFamily): ChartFinding[] {
  switch (family) {
    case "macro":
      return CHART_FINDINGS_MACRO;
    case "prb":
      return CHART_FINDINGS_PRB;
    case "datahl":
    case "hybrid":
    case "custom":
      return [];
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

export const MACRO_VERIFIED_BASELINE = {
  trades: 26,
  wins: 13,
  fullLosses: 13,
  netUsd: 2348,
  winRatePct: 50,
  avgWinUsd: 926,
  span: "Jul 28 2025 – Jul 10 2026",
  note: "Macro v1.4 premium 365d — tier A net +$4,966",
};

export function verifiedBaselineForFamily(
  family: FindingFamily
): typeof VERIFIED_BASELINE | typeof MACRO_VERIFIED_BASELINE | null {
  switch (family) {
    case "prb":
      return VERIFIED_BASELINE;
    case "macro":
      return MACRO_VERIFIED_BASELINE;
    default:
      return null;
  }
}

export const EVAL_VS_FUNDED = {
  headline: "Two profiles — same PRB entries, different exit economics",
  evalGoal: "Pass eval fastest: survive DD, spread profit across days, stay under 50% best-day rule.",
  fundedGoal: "Maximize TNL after pass: let 5–6R winners run; no consistency cap on TPT PRO.",
  notWrong:
    "You are not wrong. High RR + low WR is the real edge — but eval consistency punishes exactly that. Treat eval as a constrained phase, not the same game as funded.",
  evalProfile: [
    "Target: RR 6 + eval max win cap $1,490 (or RR 3.75)",
    "BE +1R ON · trail OFF · $400 risk ($300 until +$1k cushion)",
    "Check F4 consistency panel before trusting MC pass %",
    "Expect more winning days, smaller per-day spikes",
  ],
  fundedProfile: [
    "Target: 5–6R · eval cap OFF",
    "Same entries, filters, BE +1R, trail OFF",
    "Win rate stays low — one 5R ≈ offsets 4–5 full losses",
    "This is where the strategy is designed to make money",
  ],
  fastestPass:
    "Fastest pass ≠ highest RR on eval. MC pass rate answers gross path; consistency checker answers whether you can actually click Request Pass. Run both.",
};

export function analyzeBeRetest(be: BeRetestAudit | null): BeAuditVerdict | null {
  if (!be) return null;

  const scratch = be.ghostScratch + be.realScratch;
  const missed = be.ghostMissed5R + be.realMissed5R;
  const retestWin = be.ghostRetestWin + be.realRetestWin;
  const recs: string[] = [];

  if (scratch === 0) {
    return {
      headline: "No BE scratches in paste",
      detail: "Paste Ghosts + Real fills rows from Pine bottom-center table after replay.",
      tone: "dim",
      recommendations: ["Run full replay with i_ghost ON and paste both MISSED + BE tables."],
    };
  }

  const missedPct = scratch > 0 ? Math.round((missed / scratch) * 100) : 0;

  if (missed > retestWin && missed >= 2) {
    recs.push(
      `BE cost visible: ${missed} of ${scratch} BE scratches (${missedPct}%) would have hit 5R with original stop. That is the explicit tradeoff for eval DD protection — do not disable BE without a new A/B.`
    );
    if (missed > 0) {
      recs.push(
        "On funded (cap OFF), those missed 5Rs are real upside — eval cap already trims winners; BE trims a different set (give-backs). Both layers are intentional."
      );
    }
    return {
      headline: `BE cost: ${missed} missed 5R vs ${retestWin} retest→win`,
      detail: `${scratch} total BE scratches (ghost ${be.ghostScratch} · real ${be.realScratch}). Counterfactual holds use original stop after entry scratch.`,
      tone: "warn",
      recommendations: recs,
    };
  }

  if (missed === 0 && scratch > 0) {
    recs.push("BE is doing its job — scratches were true give-backs, not demoted winners.");
    if (retestWin > 0) {
      recs.push(
        `${retestWin} trade${retestWin === 1 ? "" : "s"} retested entry after +1R and still reached target — BE did not kill the runner.`
      );
    }
    return {
      headline: `BE validated — ${scratch} scratch${scratch === 1 ? "" : "es"}, 0 missed 5R`,
      detail: `Retest→win: ${retestWin} (ghost ${be.ghostRetestWin} · real ${be.realRetestWin}).`,
      tone: "pos",
      recommendations: recs,
    };
  }

  recs.push(
    `Mixed BE ledger: ${missed} missed 5R, ${retestWin} retest→win, ${scratch} scratches. Re-run after full 12mo before changing BE threshold.`
  );
  return {
    headline: `BE mixed — ${missed} missed 5R · ${retestWin} retest→win`,
    detail: `${scratch} scratches total. Compare to verified baseline: ~${VERIFIED_BASELINE.winRatePct}% WR, winners ~$${VERIFIED_BASELINE.avgWinUsd}.`,
    tone: "warn",
    recommendations: recs,
  };
}

export function abGraveyardRows(): { test: string; window: string; result: string; verdict: string }[] {
  return AB_GRAVEYARD.map((r) => ({
    test: r.test,
    window: r.window,
    result: r.result,
    verdict: r.verdict === "rejected" ? "REJECT" : "KEEP",
  }));
}

export function nextExperimentsToTry(): string[] {
  return [
    "12mo control (RR 5, cap OFF) — baseline distribution for MC",
    "RR 6 + eval cap $1,490 — eval pass path with consistency checker",
    "RR 3.75 eval — compare days-to-pass vs cap preset",
    "Risk $300 fresh eval — bust rate vs $400 on same window",
    "Short-only Feb–Mar slice — manual bias fix for long bleed",
  ];
}
