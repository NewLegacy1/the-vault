/**
 * Print chained E[$/calendar week] for all strategy pairs with saved cohorts.
 * Usage: npx tsx scripts/analyze-chain-ev.ts
 */
import fs from "fs";
import path from "path";
import { parseCohortMeta, type CohortRecord } from "../lib/cohort";
import { parseLabLedger } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import {
  computeChainEv,
  payoutCycleFromCohort,
  runMcForPreset,
  payoutCycleFromMc,
} from "../lib/chain-ev";
import { cohortForPresetId } from "../lib/matrix-cohort";
import { presetById } from "../lib/lab-profile";
import { STRATEGY_CHAIN_PAIRS } from "../lib/strategy-chain";

const COHORT_ROOT = path.join(__dirname, "../../strategies/cohorts");
const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");

function loadAllCohorts(): CohortRecord[] {
  const out: CohortRecord[] = [];
  const phases = ["eval", "funded", "combined", "research"];
  for (const phase of phases) {
    const dir = path.join(COHORT_ROOT, phase);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const rel = `${phase}/${file}`;
      const text = fs.readFileSync(path.join(COHORT_ROOT, rel), "utf8");
      const rec = parseCohortMeta(text, file, rel);
      if (rec) out.push(rec);
    }
  }
  return out;
}

function ledgerFileForPreset(presetId: string): string | null {
  const map: Record<string, string> = {
    "matrix-a0a": "prb-matrix-a0a.csv",
    "matrix-d1": "prb-matrix-d1.csv",
    "matrix-h0a": "hybrid-h0a.csv",
    "matrix-h0b": "hybrid-h0b.csv",
    "matrix-b1a": "macro-matrix-b1a.csv",
  };
  const f = map[presetId];
  return f && fs.existsSync(path.join(MATRIX, f)) ? f : null;
}

function metricsForPreset(
  presetId: string,
  role: "eval" | "funded",
  cohorts: CohortRecord[]
): { metrics: ReturnType<typeof payoutCycleFromCohort>; source: string } | null {
  const preset = presetById(presetId);
  const cohort = cohortForPresetId(cohorts, presetId, preset?.matrixBranch);
  if (cohort) {
    return { metrics: payoutCycleFromCohort(cohort, role), source: `cohort ${cohort.relativePath}` };
  }

  const file = ledgerFileForPreset(presetId);
  if (!file) return null;
  const text = fs.readFileSync(path.join(MATRIX, file), "utf8");
  const trades = parseLabLedger(text);
  const mc = runMcForPreset({
    presetId,
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => normalizeTradeDate(t.date)),
    sims: 2000,
    maxTrades: 80,
    payoutBuffer: 1000,
  });
  if (!mc) return null;
  return { metrics: payoutCycleFromMc(mc), source: `ledger ${file}` };
}

function main() {
  const cohorts = loadAllCohorts();
  console.log("\n=== CHAIN EV — eval → funded business loop (TPT $50K) ===\n");
  console.log(
    "pair".padEnd(28) +
      "pass%".padStart(6) +
      "pay%".padStart(6) +
      "wks".padStart(5) +
      "E[$/wk]".padStart(9) +
      "E[$/acct]".padStart(10) +
      "  source"
  );
  console.log("-".repeat(90));

  for (const pair of STRATEGY_CHAIN_PAIRS) {
    const evalLeg = metricsForPreset(pair.evalPresetId, "eval", cohorts);
    const fundedLeg = metricsForPreset(pair.fundedPresetId, "funded", cohorts);
    if (!evalLeg || !fundedLeg) {
      console.log(`${pair.label.padEnd(28)}  — missing ${!evalLeg ? "eval" : "funded"} leg`);
      continue;
    }

    let portfolioLegMetrics;
    if (pair.portfolioLegPresetId) {
      const leg = metricsForPreset(pair.portfolioLegPresetId, "funded", cohorts);
      portfolioLegMetrics = leg?.metrics;
    }

    const result = computeChainEv({
      pair,
      evalMetrics: evalLeg.metrics,
      fundedMetrics: fundedLeg.metrics,
      method: "cohort_pair",
      portfolioLegMetrics,
    });

    const wk = result.combinedUsdPerCalendarWeek ?? result.expectedUsdPerCalendarWeek;
    console.log(
      pair.label.padEnd(28) +
        String(result.eval.passPct.toFixed(1)).padStart(6) +
        String(result.funded.payoutPct.toFixed(1)).padStart(6) +
        String(result.weeksChainP50 ?? "—").padStart(5) +
        String(wk != null ? `$${wk}` : "—").padStart(9) +
        String(`$${result.expectedNetPerAccountUsd}`).padStart(10) +
        `  ${evalLeg.source} + ${fundedLeg.source}`
    );
  }

  console.log("\nPrimary metric: chained E[$/calendar week] = P(pass) × E[funded/acct] ÷ (wks_pass + wks_pay)\n");
}

main();
