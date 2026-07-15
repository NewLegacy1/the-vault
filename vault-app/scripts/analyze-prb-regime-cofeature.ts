/**
 * Phase 2.4 — pre-session co-feature vs calendar Jul+Oct (Lane C).
 *
 * PRE-REGISTERED RULES (written before measuring lift — do not reorder after seeing results):
 * 1. calendar_jul_oct — STAND_DOWN if month ∈ {7,10}  [baseline]
 * 2. path_cold_3L — STAND_DOWN next trade if prior 3 trades are all losses (pnl < -50)
 * 3. path_roll10_neg — STAND_DOWN if sum of prior 10 trade pnls < 0
 * 4. gap_vol_top_q — STAND_DOWN if |Δlog entry_price| vs previous trade’s entry
 *    is ≥ 75th pct of the prior 40 absolute gaps (high-gap regime). Uses only
 *    past trades’ entry prices — known before the current fill.
 *
 * Verdict: PROMOTE feature only if OOS E[$/wk] ≥ calendar and bust not worse.
 * Else KEEP calendar v0.
 *
 * Usage: npx tsx scripts/analyze-prb-regime-cofeature.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger, type ParsedTrade } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { runMonteCarlo } from "../lib/monte-carlo";
import { buildMcParamsForLab } from "../lib/mc-params-builder";
import { MATRIX_REFERENCE_FIRM_ID } from "../lib/firm-matrix-compare";
import { derivePayoutCycle } from "../lib/payout-cycle";
import { presetById } from "../lib/lab-profile";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const OUT_JSON = path.join(__dirname, "../data/tv-exports/prb-regime-cofeature.json");
const OUT_MD = path.join(
  __dirname,
  "../../strategies/strategy-dev/phase2-4-cofeature.md"
);

const OOS_START = "2025-07-14";
const SIMS = 800; // screen budget — enough to rank gates; confirm cohort engines use 2000 elsewhere
const MAX_TRADES = 220;
const PAYOUT_BUFFER = 2000;
const LOSS = -50;

/** Pre-registered gate ids — order fixed before any metric computation. */
const PRE_REGISTERED = [
  {
    id: "calendar_jul_oct",
    label: "STAND_DOWN Jul+Oct (baseline)",
    kind: "calendar" as const,
  },
  {
    id: "path_cold_3L",
    label: "STAND_DOWN after 3 consecutive losses",
    kind: "path" as const,
  },
  {
    id: "path_roll10_neg",
    label: "STAND_DOWN when prior-10 pnl sum < 0",
    kind: "path" as const,
  },
  {
    id: "gap_vol_top_q",
    label: "STAND_DOWN when |entry gap| ≥ prior-40 p75",
    kind: "price" as const,
  },
] as const;

type GateId = (typeof PRE_REGISTERED)[number]["id"];

function loadA0a(): ParsedTrade[] {
  return parseLabLedger(
    fs.readFileSync(path.join(MATRIX, "prb-a0a-3y.csv"), "utf8")
  )
    .map((t) => ({ ...t, date: normalizeTradeDate(t.date) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.num - b.num);
}

function month(d: string): number {
  return Number(d.slice(5, 7));
}

function isLoss(t: ParsedTrade): boolean {
  return t.pnl < LOSS;
}

/** Feature vectors known strictly from trades with index < i */
function allowTrade(trades: ParsedTrade[], i: number, gate: GateId): boolean {
  const t = trades[i];
  if (gate === "calendar_jul_oct") {
    const m = month(t.date);
    return m !== 7 && m !== 10;
  }
  if (gate === "path_cold_3L") {
    if (i < 3) return true;
    return !(isLoss(trades[i - 1]) && isLoss(trades[i - 2]) && isLoss(trades[i - 3]));
  }
  if (gate === "path_roll10_neg") {
    if (i < 10) return true;
    let s = 0;
    for (let k = i - 10; k < i; k++) s += trades[k].pnl;
    return s >= 0;
  }
  if (gate === "gap_vol_top_q") {
    if (i < 2) return true;
    const gaps: number[] = [];
    for (let k = 1; k < i; k++) {
      const a = trades[k - 1].entryPrice;
      const b = trades[k].entryPrice;
      if (a == null || b == null || a <= 0 || b <= 0) continue;
      gaps.push(Math.abs(Math.log(b / a)));
    }
    if (gaps.length < 20) return true;
    const window = gaps.slice(-40);
    const sorted = [...window].sort((x, y) => x - y);
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
    const prev = trades[i - 1].entryPrice;
    const cur = t.entryPrice;
    if (prev == null || cur == null || prev <= 0 || cur <= 0) return true;
    const gap = Math.abs(Math.log(cur / prev));
    return gap < p75;
  }
  return true;
}

function filterByGate(trades: ParsedTrade[], gate: GateId): ParsedTrade[] {
  return trades.filter((_, i) => allowTrade(trades, i, gate));
}

function filterAnd(trades: ParsedTrade[], a: GateId, b: GateId): ParsedTrade[] {
  return trades.filter((_, i) => allowTrade(trades, i, a) && allowTrade(trades, i, b));
}

function mcEv(trades: ParsedTrade[], phase: "eval" | "funded") {
  const net = Math.round(trades.reduce((s, t) => s + t.pnl, 0));
  const preset = presetById(phase === "eval" ? "matrix-a0a" : "matrix-d1");
  if (!preset || trades.length === 0) {
    return { n: 0, eWeek: null as number | null, bust: null as number | null, pass: null as number | null, net: 0 };
  }
  try {
    const built = buildMcParamsForLab({
      ruleId: MATRIX_REFERENCE_FIRM_ID,
      strategyPhase: preset.phase,
      trades: trades.map((t) => t.pnl),
      dates: trades.map((t) => t.date),
      sims: SIMS,
      maxTrades: MAX_TRADES,
      payoutBuffer: PAYOUT_BUFFER,
    });
    if (!built) {
      return { n: trades.length, eWeek: null, bust: null, pass: null, net };
    }
    const mc = runMonteCarlo(built.params);
    const cyc = derivePayoutCycle(mc);
    return {
      n: trades.length,
      eWeek: cyc.expectedUsdPerCalendarWeek,
      bust: cyc.bustPct,
      pass: cyc.passPct,
      net,
    };
  } catch (e) {
    console.error("mcEv failed", e);
    return { n: trades.length, eWeek: null, bust: null, pass: null, net };
  }
}

function windowOf(trades: ParsedTrade[], oos: boolean): ParsedTrade[] {
  return oos ? trades.filter((t) => t.date >= OOS_START) : trades;
}

function evalGateOnWindow(
  fullBook: ParsedTrade[],
  selector: (book: ParsedTrade[]) => ParsedTrade[],
  oos: boolean
) {
  // Apply gate on full chronology, then slice window — features need history before OOS.
  const gatedFull = selector(fullBook);
  const gated = windowOf(gatedFull, oos);
  // Ungated window for baseline compare n
  const ungated = windowOf(fullBook, oos);
  const m = mcEv(gated, "eval");
  return { ...m, nUngatedWindow: ungated.length };
}

function main() {
  const book = loadA0a();
  console.error(`loaded ${book.length} A0a trades`);

  type Row = {
    id: string;
    label: string;
    kind: string;
    full: ReturnType<typeof evalGateOnWindow>;
    oos: ReturnType<typeof evalGateOnWindow>;
  };

  const rows: Row[] = [];

  function add(
    id: string,
    label: string,
    kind: string,
    selector: (b: ParsedTrade[]) => ParsedTrade[]
  ) {
    console.error(`gate ${id}…`);
    rows.push({
      id,
      label,
      kind,
      full: evalGateOnWindow(book, selector, false),
      oos: evalGateOnWindow(book, selector, true),
    });
  }

  add("ungated", "Always trade (no stand-down)", "control", (b) => b);

  for (const g of PRE_REGISTERED) {
    add(g.id, g.label, g.kind, (b) => filterByGate(b, g.id));
  }

  // Only one combo to limit MC budget: calendar + best logical refinement (cold streak)
  add(
    "calendar_and_path_cold_3L",
    "Jul+Oct AND after 3 consecutive losses",
    "combo",
    (b) => filterAnd(b, "calendar_jul_oct", "path_cold_3L")
  );

  const cal = rows.find((r) => r.id === "calendar_jul_oct")!;
  const candidates = rows.filter(
    (r) => r.id !== "ungated" && r.id !== "calendar_jul_oct"
  );

  function beatsCalendar(r: Row): boolean {
    const calOos = cal.oos.eWeek;
    const candOos = r.oos.eWeek;
    if (calOos == null || candOos == null) return false;
    if (candOos < calOos) return false;
    if (r.oos.bust != null && cal.oos.bust != null && r.oos.bust > cal.oos.bust + 1) return false;
    if (r.oos.n < 25) return false;
    return true;
  }

  const promoters = candidates.filter(beatsCalendar);
  const best = promoters.sort(
    (a, b) => (b.oos.eWeek ?? -999) - (a.oos.eWeek ?? -999)
  )[0];

  const verdict: "PROMOTE_FEATURE" | "KEEP_CALENDAR_V0" = best
    ? "PROMOTE_FEATURE"
    : "KEEP_CALENDAR_V0";

  const payload = {
    generated: new Date().toISOString(),
    phase: "2.4",
    note: "Features 2–4 are path/price proxies from the trade ledger (no external OHLC in vault). Prefixed as live-known-before-next-trade.",
    preRegistered: PRE_REGISTERED,
    oosStart: OOS_START,
    mc: { sims: SIMS, maxTrades: MAX_TRADES, payoutBuffer: PAYOUT_BUFFER },
    verdict,
    promotedId: best?.id ?? null,
    calendarOosEWeek: cal.oos.eWeek,
    rows,
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  fs.writeFileSync(OUT_MD, renderMd(payload));
  console.log(
    JSON.stringify(
      {
        verdict,
        promotedId: best?.id ?? null,
        calendarOosEWeek: cal.oos.eWeek,
        bestOosEWeek: best?.oos.eWeek ?? null,
        outJson: OUT_JSON,
        outMd: OUT_MD,
      },
      null,
      2
    )
  );
}

function renderMd(p: {
  generated: string;
  verdict: string;
  promotedId: string | null;
  calendarOosEWeek: number | null;
  oosStart: string;
  rows: Array<{
    id: string;
    label: string;
    kind: string;
    full: { n: number; eWeek: number | null; bust: number | null; pass: number | null; net: number };
    oos: { n: number; eWeek: number | null; bust: number | null; pass: number | null; net: number };
  }>;
}): string {
  const lines = p.rows
    .map(
      (r) =>
        `| \`${r.id}\` | ${r.kind} | ${r.full.n} | $${r.full.eWeek ?? "—"} | ${r.full.bust ?? "—"}% | ${r.oos.n} | $${r.oos.eWeek ?? "—"} | ${r.oos.bust ?? "—"}% | $${r.full.net} |`
    )
    .join("\n");

  return `---
updated: ${p.generated.slice(0, 10)}
status: settled
verdict: ${p.verdict}
tags: [phase2.4, cofeature, regime-gate, strategy-dev]
---
# Phase 2.4 — market / path co-feature vs calendar Jul+Oct

> Lane C of [[parallel-impl-sprint2]] · parent [[execution-plan-post-3y]].  
> Script: \`vault-app/scripts/analyze-prb-regime-cofeature.ts\` · JSON: \`vault-app/data/tv-exports/prb-regime-cofeature.json\`

## Pre-registered rules (before lift)

| id | Rule |
|---|---|
| \`calendar_jul_oct\` | STAND_DOWN month ∈ {7,10} — **baseline** |
| \`path_cold_3L\` | STAND_DOWN next trade after 3 consecutive losses |
| \`path_roll10_neg\` | STAND_DOWN when sum of prior 10 trade pnls < 0 |
| \`gap_vol_top_q\` | STAND_DOWN when \\|Δlog entry_price\\| ≥ p75 of prior 40 gaps |

No external OHLC in vault — gap feature uses **prior entry prices** from the ledger (known before the current fill). Path features use only completed prior trades.

## Verdict

**${p.verdict}**${p.promotedId ? ` · promoted: \`${p.promotedId}\`` : ""}

Promote only if OOS E[$/wk] ≥ calendar ($${p.calendarOosEWeek}) · bust not worse · n≥25.

${p.verdict === "KEEP_CALENDAR_V0"
    ? "No tested co-feature beat calendar Jul+Oct on OOS with the required gates. **Keep `regime-gate-v0` calendar ops.** Path filters may still be useful later as discretionary overlays — not promoted."
    : "Promoted feature beats calendar on OOS — consider encoding into gate Pine next (new lane)."}

## Results (A0a · Lab-engine eval MC)

| Gate | Kind | n full | E[$/wk] full | bust full | n OOS | E[$/wk] OOS | bust OOS | net full |
|---|---|---:|---:|---:|---:|---:|---:|---:|
${lines}

OOS start: **${p.oosStart}**.

## Implications

- Calendar Jul+Oct remains the default ops overlay unless PROMOTE.
- True market vol/trend from daily bars still needed for a stronger “regime roster” — vault lacks OHLC; this sprint used ledger proxies only.
- Still blocked: March stack · multi-account · claiming income from gated PRB alone.

## Links

- [[findings-prb]] · [[parallel-impl-sprint2]] · [[phase1-autopsy-a0a-d1]] · [[phase2-chain-ev-gated]]
`;
}

main();
