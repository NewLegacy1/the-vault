/**
 * Phase 2.3 — Chain EV ungated vs gated (regime-gate-v0 Jul+Oct STAND_DOWN).
 * Lane B of strategies/strategy-dev/parallel-impl-gated-prb.md
 *
 * Usage: npx tsx scripts/analyze-chain-ev-gated.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import {
  computeChainEv,
  payoutCycleFromCohort,
  payoutCycleFromMc,
  runMcForPreset,
} from "../lib/chain-ev";
import { parseCohortMeta, type CohortRecord } from "../lib/cohort";
import { chainPairById } from "../lib/strategy-chain";

const ROOT = path.join(__dirname, "../..");
const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const COHORTS = path.join(ROOT, "strategies/cohorts");
const OUT_JSON = path.join(
  __dirname,
  "../data/tv-exports/chain-ev-gated-vs-ungated.json"
);
const OUT_MD = path.join(
  ROOT,
  "strategies/strategy-dev/phase2-chain-ev-gated.md"
);

const SIMS = 2000;
const MAX_TRADES = 220;
const PAYOUT_BUFFER = 2000;
const OOS_START = "2025-07-14";
const PASS_TOLERANCE = 0.05; // gated may be within −5% of ungated

const PAIR = chainPairById("prb-a0a-d1")!;

type LedgerSpec = {
  label: string;
  evalFile: string;
  fundedFile: string;
  evalCohortRel?: string;
  fundedCohortRel?: string;
};

const SPECS: Record<"ungated_full" | "gated_full" | "ungated_oos" | "gated_oos", LedgerSpec> = {
  ungated_full: {
    label: "Ungated full 3y",
    evalFile: "prb-a0a-3y.csv",
    fundedFile: "prb-d1-3y.csv",
    evalCohortRel: "eval/2026-07-14_222805698_a0a_prb_control.md",
    fundedCohortRel: "funded/2026-07-14_222828594_d1_prb_rr6_funded_raw.md",
  },
  gated_full: {
    label: "Gated full 3y (Jul+Oct STAND_DOWN)",
    evalFile: "prb-a0a-3y-gate-jul-oct.csv",
    fundedFile: "prb-d1-3y-gate-jul-oct.csv",
    evalCohortRel: "eval/2026-07-14_230813710_a0a_prb_control_regime_gate_v0.md",
    fundedCohortRel: "funded/2026-07-14_230815341_d1_prb_rr6_funded_raw_regime_gate_v0.md",
  },
  ungated_oos: {
    label: "Ungated OOS ≥2025-07-14",
    evalFile: "prb-a0a-3y.csv",
    fundedFile: "prb-d1-3y.csv",
  },
  gated_oos: {
    label: "Gated OOS ≥2025-07-14",
    evalFile: "prb-a0a-3y-gate-jul-oct.csv",
    fundedFile: "prb-d1-3y-gate-jul-oct.csv",
    evalCohortRel: "eval/2026-07-14_230814501_a0a_prb_control_regime_gate_v0_oos.md",
    fundedCohortRel: "funded/2026-07-14_230816068_d1_prb_rr6_funded_raw_regime_gate_v0_oos.md",
  },
};

function loadLedger(file: string, oosOnly: boolean) {
  const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8")).map(
    (t) => ({ ...t, date: normalizeTradeDate(t.date) })
  );
  const filtered = oosOnly ? trades.filter((t) => t.date >= OOS_START) : trades;
  return {
    pnls: filtered.map((t) => t.pnl),
    dates: filtered.map((t) => t.date),
    n: filtered.length,
  };
}

function loadCohort(rel: string | undefined): CohortRecord | null {
  if (!rel) return null;
  const full = path.join(COHORTS, rel);
  if (!fs.existsSync(full)) return null;
  return parseCohortMeta(fs.readFileSync(full, "utf8"), path.basename(rel), rel);
}

function runPair(specKey: keyof typeof SPECS) {
  const spec = SPECS[specKey];
  const oosOnly = specKey.includes("oos");
  const evalLed = loadLedger(spec.evalFile, oosOnly);
  const fundedLed = loadLedger(spec.fundedFile, oosOnly);

  const evalMc = runMcForPreset({
    presetId: "matrix-a0a",
    trades: evalLed.pnls,
    dates: evalLed.dates,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    payoutBuffer: PAYOUT_BUFFER,
  });
  const fundedMc = runMcForPreset({
    presetId: "matrix-d1",
    trades: fundedLed.pnls,
    dates: fundedLed.dates,
    sims: SIMS,
    maxTrades: MAX_TRADES,
    payoutBuffer: PAYOUT_BUFFER,
  });
  if (!evalMc || !fundedMc) {
    throw new Error(`MC failed for ${specKey}`);
  }

  const evalMetrics = payoutCycleFromMc(evalMc);
  const fundedMetrics = payoutCycleFromMc(fundedMc);
  const chain = computeChainEv({
    pair: PAIR,
    evalMetrics,
    fundedMetrics,
    method: "live_dual_run",
  });

  const evalCohort = loadCohort(spec.evalCohortRel);
  const fundedCohort = loadCohort(spec.fundedCohortRel);
  let chainFromCohort = null;
  if (evalCohort && fundedCohort) {
    chainFromCohort = computeChainEv({
      pair: PAIR,
      evalMetrics: payoutCycleFromCohort(evalCohort, "eval"),
      fundedMetrics: payoutCycleFromCohort(fundedCohort, "funded"),
      method: "cohort_pair",
    });
  }

  return {
    key: specKey,
    label: spec.label,
    nEval: evalLed.n,
    nFunded: fundedLed.n,
    evalFile: spec.evalFile,
    fundedFile: spec.fundedFile,
    labEngine: {
      evalPassPct: evalMetrics.passPct,
      evalBustPct: evalMetrics.bustPct,
      evalWeeksToPassP50: evalMetrics.weeksToPassP50,
      evalEWeek: evalMetrics.expectedUsdPerCalendarWeek,
      fundedPassPct: fundedMetrics.passPct,
      fundedBustPct: fundedMetrics.bustPct,
      fundedWeeksToPayoutP50: fundedMetrics.weeksToPayoutP50,
      fundedEWeek: fundedMetrics.expectedUsdPerCalendarWeek,
      fundedExpectedNetPerAccountUsd: fundedMetrics.expectedNetPerAccountUsd,
      chainExpectedNetPerAccountUsd: chain.expectedNetPerAccountUsd,
      chainEWeek: chain.expectedUsdPerCalendarWeek,
      weeksChainP50: chain.weeksChainP50,
    },
    cohortPair: chainFromCohort
      ? {
          evalSource: spec.evalCohortRel,
          fundedSource: spec.fundedCohortRel,
          chainEWeek: chainFromCohort.expectedUsdPerCalendarWeek,
          chainExpectedNetPerAccountUsd: chainFromCohort.expectedNetPerAccountUsd,
          weeksChainP50: chainFromCohort.weeksChainP50,
          evalPassPct: chainFromCohort.eval.passPct,
          fundedPayoutPct: chainFromCohort.funded.payoutPct,
        }
      : null,
  };
}

function main() {
  const ungatedFull = runPair("ungated_full");
  const gatedFull = runPair("gated_full");
  const ungatedOos = runPair("ungated_oos");
  const gatedOos = runPair("gated_oos");

  const u = ungatedFull.labEngine.chainEWeek ?? 0;
  const g = gatedFull.labEngine.chainEWeek ?? 0;
  const floor = u * (1 - PASS_TOLERANCE);
  const verdict: "PASS" | "FAIL" | "FLAT" =
    g > u ? "PASS" : g >= floor ? "FLAT" : "FAIL";
  // Spec: PASS if gated ≥ ungated (±5%). Treat FLAT as PASS for promotion of ops overlay.
  const settle: "PASS" | "FAIL" = g >= floor ? "PASS" : "FAIL";

  const oosU = ungatedOos.labEngine.chainEWeek ?? 0;
  const oosG = gatedOos.labEngine.chainEWeek ?? 0;
  const oosSettle: "PASS" | "FAIL" = oosG >= oosU * (1 - PASS_TOLERANCE) ? "PASS" : "FAIL";

  const payload = {
    generated: new Date().toISOString(),
    gate: "regime-gate-v0",
    rule: "STAND_DOWN calendar month in {7,10}",
    pair: PAIR.id,
    mc: { sims: SIMS, maxTrades: MAX_TRADES, payoutBuffer: PAYOUT_BUFFER },
    oosStart: OOS_START,
    passTolerance: PASS_TOLERANCE,
    primaryMetric: "labEngine.chainEWeek (buildMcParamsForLab dual-run)",
    settleFull: settle,
    settleOos: oosSettle,
    verdictNote: verdict,
    deltaFullUsdPerWeek: Math.round((g - u) * 10) / 10,
    deltaOosUsdPerWeek: Math.round((oosG - oosU) * 10) / 10,
    pairs: {
      ungated_full: ungatedFull,
      gated_full: gatedFull,
      ungated_oos: ungatedOos,
      gated_oos: gatedOos,
    },
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  fs.writeFileSync(OUT_MD, renderMd(payload));
  console.log(JSON.stringify({
    settleFull: settle,
    settleOos: oosSettle,
    ungatedFullEWeek: u,
    gatedFullEWeek: g,
    ungatedOosEWeek: oosU,
    gatedOosEWeek: oosG,
    outJson: OUT_JSON,
    outMd: OUT_MD,
  }, null, 2));
}

function renderMd(p: ReturnType<typeof Object.assign> & typeof payloadShape): string {
  const uf = p.pairs.ungated_full.labEngine;
  const gf = p.pairs.gated_full.labEngine;
  const uo = p.pairs.ungated_oos.labEngine;
  const go = p.pairs.gated_oos.labEngine;
  const cf = p.pairs.gated_full.cohortPair;
  const cu = p.pairs.ungated_full.cohortPair;

  return `---
updated: ${p.generated.slice(0, 10)}
status: settled
settle_full: ${p.settleFull}
settle_oos: ${p.settleOos}
tags: [phase2, chain-ev, regime-gate-v0, strategy-dev]
---
# Phase 2.3 — Chain EV: ungated vs gated A0a→D1

> Lane B of [[parallel-impl-gated-prb]] · parent [[execution-plan-post-3y]].  
> Script: \`vault-app/scripts/analyze-chain-ev-gated.ts\` · JSON: \`vault-app/data/tv-exports/chain-ev-gated-vs-ungated.json\`  
> Engine: \`buildMcParamsForLab\` via \`runMcForPreset\` · sims ${p.mc.sims} · max trades ${p.mc.maxTrades} · buffer ${p.mc.payoutBuffer}.

## Verdict

| Window | Ungated E[$/wk] | Gated E[$/wk] | Δ | Settle |
|---|---:|---:|---:|---|
| **Full 3y** (primary) | **$${uf.chainEWeek}** | **$${gf.chainEWeek}** | **$${p.deltaFullUsdPerWeek}** | **${p.settleFull}** |
| OOS ≥ ${p.oosStart} | $${uo.chainEWeek} | $${go.chainEWeek} | $${p.deltaOosUsdPerWeek} | ${p.settleOos} |

**Rule:** PASS if gated chain E[$/wk] ≥ ungated × (1 − ${p.passTolerance}) (±5% tolerance).

${p.settleFull === "PASS"
  ? "Gated Jul+Oct STAND_DOWN **improves** (or holds within tolerance) the **full business loop** A0a→D1 — not only single-leg Lab stats."
  : "Gated single-leg wins did **not** carry to chained E[$/wk] — do not claim business-loop upgrade; keep calendar stand-down as caution-only."}

## Lab-engine chain detail

### Full 3y

| Leg | Ungated | Gated |
|---|---|---|
| Eval n (A0a) | ${p.pairs.ungated_full.nEval} | ${p.pairs.gated_full.nEval} |
| Funded n (D1) | ${p.pairs.ungated_full.nFunded} | ${p.pairs.gated_full.nFunded} |
| Eval pass% | ${uf.evalPassPct} | ${gf.evalPassPct} |
| Eval bust% | ${uf.evalBustPct} | ${gf.evalBustPct} |
| Eval weeks→pass p50 | ${uf.evalWeeksToPassP50} | ${gf.evalWeeksToPassP50} |
| Funded E[$/acct] | $${uf.fundedExpectedNetPerAccountUsd} | $${gf.fundedExpectedNetPerAccountUsd} |
| Funded weeks→payout p50 | ${uf.fundedWeeksToPayoutP50} | ${gf.fundedWeeksToPayoutP50} |
| Funded bust% | ${uf.fundedBustPct} | ${gf.fundedBustPct} |
| **Chain weeks p50** | ${uf.weeksChainP50} | ${gf.weeksChainP50} |
| **Chain E[$/acct]** | $${uf.chainExpectedNetPerAccountUsd} | $${gf.chainExpectedNetPerAccountUsd} |
| **Chain E[$/wk]** | **$${uf.chainEWeek}** | **$${gf.chainEWeek}** |

### OOS (last ~12m)

| | Ungated | Gated |
|---|---:|---:|
| Chain E[$/wk] | $${uo.chainEWeek} | $${go.chainEWeek} |
| Eval pass% | ${uo.evalPassPct} | ${go.evalPassPct} |
| Funded bust% | ${uo.fundedBustPct} | ${go.fundedBustPct} |
| n eval / funded | ${p.pairs.ungated_oos.nEval} / ${p.pairs.ungated_oos.nFunded} | ${p.pairs.gated_oos.nEval} / ${p.pairs.gated_oos.nFunded} |

## Cohort cross-check (saved Lab notes)

Uses explicit cohort paths (not latest-by-preset — gated would otherwise shadow ungated).

| Pair | Chain E[$/wk] from cohort YAML |
|---|---:|
| Ungated A0a+D1 | ${cu?.chainEWeek ?? "—"} |
| Gated A0a+D1 | ${cf?.chainEWeek ?? "—"} |

Sources: \`${cu?.evalSource ?? ""}\` + \`${cu?.fundedSource ?? ""}\` · gated \`${cf?.evalSource ?? ""}\` + \`${cf?.fundedSource ?? ""}\`.

Primary settlement uses **lab-engine dual-run** (same path as Phase 2.1 confirm), not cohort YAML alone.

## Implications

- Ops Jul+Oct STAND_DOWN: ${p.settleFull === "PASS" ? "**supported** as business-loop overlay" : "caution-only — single-leg OK, chain did not clear"}.
- Income still modest — gate is survival/EV lift, not Phase 4 multi-account unlock.
- Still blocked: March stack · min-day pad until asked · Track B unless user opens it · Macro/Hybrid polish.

## Links

- [[findings-prb]] · [[parallel-impl-gated-prb]] · [[execution-plan-post-3y]] · [[chain-ev-spec]] · [[phase1-autopsy-a0a-d1]]
`;
}

// type trick for renderMd
type payloadShape = {
  generated: string;
  passTolerance: number;
  oosStart: string;
  settleFull: string;
  settleOos: string;
  deltaFullUsdPerWeek: number;
  deltaOosUsdPerWeek: number;
  mc: { sims: number; maxTrades: number; payoutBuffer: number };
  pairs: {
    ungated_full: ReturnType<typeof runPair>;
    gated_full: ReturnType<typeof runPair>;
    ungated_oos: ReturnType<typeof runPair>;
    gated_oos: ReturnType<typeof runPair>;
  };
};

main();
