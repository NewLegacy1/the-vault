/**
 * Autopsy Macro_Model_v2 M-series TV exports + define keep/kill gates.
 * Usage: npx tsx scripts/analyze-macro-v2-m-series.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger, type ParsedTrade } from "../lib/csv";
import { summarizeTradeEnrichment } from "../lib/trade-enrichment";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const SIMS = 2000;
const MAX = 80;

const FILES = [
  { id: "small-a", file: "macro-v2-91e69.csv" },
  { id: "small-b", file: "macro-v2-20f59.csv" },
  { id: "volume", file: "macro-v2-9da9b.csv" },
];

function mc(trades: ParsedTrade[], mode: "eval" | "funded") {
  const rule = ruleById("tpt50")!;
  const r = runMonteCarlo({
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    sims: SIMS,
    maxTrades: MAX,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistency:
      mode === "eval"
        ? { consistencyPct: rule.consistencyPct ?? 50, minDays: rule.minDays ?? 5 }
        : undefined,
    fees: {
      evalFee: rule.evalFee ?? 0,
      activationFee: rule.activationFee ?? 0,
      monthlyFee: rule.monthlyFee ?? 0,
      payoutBuffer: 1000,
    },
  });
  return {
    pass: Math.round(r.passRate * 1000) / 10,
    bust: Math.round(r.bustRate * 1000) / 10,
    payout: Math.round((r.economics.payoutRate ?? 0) * 1000) / 10,
    weeksPass: r.economics.weeksToPassP50,
    weeksPay: r.economics.weeksToPayoutP50,
  };
}

function stats(trades: ParsedTrade[]) {
  const net = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 50);
  const losses = trades.filter((t) => t.pnl < -50);
  const scr = trades.filter((t) => Math.abs(t.pnl) <= 50);
  const days = new Set(trades.map((t) => t.date)).size;
  const spanMs =
    Date.parse(trades[trades.length - 1]!.date) - Date.parse(trades[0]!.date);
  const weeks = spanMs / (7 * 24 * 3600 * 1000);
  return {
    n: trades.length,
    days,
    net: Math.round(net),
    wr: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : 0,
    w: wins.length,
    l: losses.length,
    scr: scr.length,
    avgWin: wins.length ? Math.round(wins.reduce((s, t) => s + t.pnl, 0) / wins.length) : 0,
    avgLoss: losses.length
      ? Math.round(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
      : 0,
    tpw: weeks > 0.25 ? Math.round((trades.length / weeks) * 10) / 10 : 0,
    edge: weeks > 0.25 ? Math.round(net / weeks) : 0,
  };
}

function hourBucket(dt?: string): string {
  if (!dt) return "?";
  const m = dt.match(/ (\d{2}):(\d{2})/);
  if (!m) return "?";
  const hhmm = parseInt(m[1]!, 10) * 100 + parseInt(m[2]!, 10);
  if (hhmm >= 950 && hhmm < 1010) return "9:50–10:10";
  if (hhmm >= 1010 && hhmm < 1050) return "10:10–10:50";
  if (hhmm >= 1050 && hhmm < 1110) return "10:50–11:10";
  if (hhmm >= 930 && hhmm < 950) return "9:30–9:50";
  if (hhmm >= 1110 && hhmm < 1200) return "11:10–12:00";
  return `other (${m[1]}:${m[2]})`;
}

function byHour(trades: ParsedTrade[]) {
  const map = new Map<string, ParsedTrade[]>();
  for (const t of trades) {
    const k = hourBucket(t.entryDatetime);
    const list = map.get(k) ?? [];
    list.push(t);
    map.set(k, list);
  }
  return [...map.entries()]
    .map(([k, list]) => {
      const net = list.reduce((s, t) => s + t.pnl, 0);
      const w = list.filter((t) => t.pnl > 50).length;
      return {
        bucket: k,
        n: list.length,
        net: Math.round(net),
        wr: Math.round((w / list.length) * 1000) / 10,
      };
    })
    .sort((a, b) => b.n - a.n);
}

function byMonth(trades: ParsedTrade[]) {
  const map = new Map<string, ParsedTrade[]>();
  for (const t of trades) {
    const k = t.date.slice(0, 7);
    const list = map.get(k) ?? [];
    list.push(t);
    map.set(k, list);
  }
  return [...map.entries()].map(([k, list]) => ({
    month: k,
    n: list.length,
    net: Math.round(list.reduce((s, t) => s + t.pnl, 0)),
    wr: Math.round((list.filter((t) => t.pnl > 50).length / list.length) * 1000) / 10,
  }));
}

function byTierignal(trades: ParsedTrade[]) {
  const map = new Map<string, ParsedTrade[]>();
  for (const t of trades) {
    const k = t.tier ?? t.signal ?? "?";
    const list = map.get(k) ?? [];
    list.push(t);
    map.set(k, list);
  }
  return [...map.entries()].map(([k, list]) => ({
    tier: k,
    n: list.length,
    net: Math.round(list.reduce((s, t) => s + t.pnl, 0)),
    wr: Math.round((list.filter((t) => t.pnl > 50).length / list.length) * 1000) / 10,
  }));
}

function fingerprint(trades: ParsedTrade[]): string {
  return trades
    .slice(0, 5)
    .map((t) => `${t.date}:${t.pnl.toFixed(0)}`)
    .join("|");
}

function maxLossStreak(trades: ParsedTrade[]): number {
  let max = 0;
  let cur = 0;
  for (const t of trades) {
    if (t.pnl < -50) {
      cur++;
      max = Math.max(max, cur);
    } else cur = 0;
  }
  return max;
}

function compareBooks(a: ParsedTrade[], b: ParsedTrade[]) {
  if (a.length !== b.length) return { sameLen: false, identicalPnls: false, pnlDelta: 0 };
  let same = true;
  let delta = 0;
  for (let i = 0; i < a.length; i++) {
    delta += b[i]!.pnl - a[i]!.pnl;
    if (Math.abs(a[i]!.pnl - b[i]!.pnl) > 0.02) same = false;
  }
  return { sameLen: true, identicalPnls: same, pnlDelta: Math.round(delta) };
}

function main() {
  const loaded = FILES.map(({ id, file }) => {
    const trades = parseLabLedger(fs.readFileSync(path.join(MATRIX, file), "utf8"));
    return { id, file, trades };
  });

  console.log("=== FILE IDENTITY ===");
  for (const L of loaded) {
    console.log(L.id, L.file, "n="+L.trades.length, "fp="+fingerprint(L.trades));
  }
  const [sa, sb, vol] = loaded;
  console.log("small-a vs small-b", compareBooks(sa!.trades, sb!.trades));

  // Infer labels: volume = M2; of the two small ones, more scratches / less avg |loss| ≈ BE@2R (M1)
  const small = [sa!, sb!].map((L) => {
    const enr = summarizeTradeEnrichment(L.trades)!;
    const st = stats(L.trades);
    return { ...L, enr, st, lossStreak: maxLossStreak(L.trades) };
  });
  // Prefer BE book = more BE scratch candidates + more scratches count
  const ranked = [...small].sort(
    (a, b) =>
      (b.enr.beScratchCandidates ?? 0) - (a.enr.beScratchCandidates ?? 0) ||
      b.st.scr - a.st.scr
  );
  const m1 = ranked[0]!;
  const m0 = ranked[1]!;
  const m2 = {
    ...vol!,
    enr: summarizeTradeEnrichment(vol!.trades)!,
    st: stats(vol!.trades),
    lossStreak: maxLossStreak(vol!.trades),
  };

  const labeled = [
    { label: "M0 · $400 BE OFF", ...m0 },
    { label: "M1 · $400 BE@2R", ...m1 },
    { label: "M2 · Volume BE@2R", ...m2 },
  ];

  console.log("\n=== INFERRED LABELS ===");
  for (const L of labeled) {
    console.log(
      L.label,
      "file="+L.file,
      "scr="+L.st.scr,
      "beCand="+L.enr.beScratchCandidates,
      "avgLoss="+L.st.avgLoss
    );
  }

  console.log("\n=== LEDGER + MC (funded) ===");
  for (const L of labeled) {
    const funded = mc(L.trades, "funded");
    const evalR = mc(L.trades, "eval");
    console.log(JSON.stringify({
      label: L.label,
      ...L.st,
      lossStreak: L.lossStreak,
      enrich: {
        cov: L.enr.coveragePct,
        durAvg: L.enr.avgDurationBars,
        dur0: L.enr.duration0Pct,
        mfe: L.enr.avgMfeUsd,
        mae: L.enr.avgMaeUsd,
        loserMae: L.enr.medianLoserMaeUsd,
        beCand: L.enr.beScratchCandidates,
        giveback: L.enr.winnerGivebackN,
        qty: L.enr.avgQty,
      },
      funded,
      eval: evalR,
    }, null, 2));
  }

  console.log("\n=== TIME OF DAY (entry) ===");
  for (const L of labeled) {
    console.log("\n"+L.label);
    console.log(byHour(L.trades));
  }

  console.log("\n=== TIER ===");
  for (const L of labeled) {
    console.log("\n"+L.label);
    console.log(byTierignal(L.trades));
  }

  console.log("\n=== MONTHLY (M2 volume — regime) ===");
  console.log(byMonth(m2.trades));

  // Duration buckets on M1 and M2
  console.log("\n=== DURATION BUCKETS ===");
  for (const L of labeled) {
    const buckets = [
      { name: "0 bars", pred: (t: ParsedTrade) => (t.durationBars ?? -1) === 0 },
      { name: "1-2 bars", pred: (t: ParsedTrade) => (t.durationBars ?? -1) >= 1 && (t.durationBars ?? 0) <= 2 },
      { name: "3-6 bars", pred: (t: ParsedTrade) => (t.durationBars ?? 0) >= 3 && (t.durationBars ?? 0) <= 6 },
      { name: "7+ bars", pred: (t: ParsedTrade) => (t.durationBars ?? 0) >= 7 },
    ];
    console.log("\n"+L.label);
    for (const b of buckets) {
      const list = L.trades.filter(b.pred);
      if (!list.length) continue;
      const net = Math.round(list.reduce((s, t) => s + t.pnl, 0));
      const wr = Math.round((list.filter((t) => t.pnl > 50).length / list.length) * 1000) / 10;
      console.log({ bucket: b.name, n: list.length, net, wr });
    }
  }

  // Write JSON for canvas
  const out = {
    inferred: labeled.map((L) => ({
      label: L.label,
      file: L.file,
      stats: L.st,
      lossStreak: L.lossStreak,
      enrich: L.enr,
      funded: mc(L.trades, "funded"),
      eval: mc(L.trades, "eval"),
      byHour: byHour(L.trades),
      byTier: byTierignal(L.trades),
      byMonth: L.label.startsWith("M2") ? byMonth(L.trades) : undefined,
    })),
  };
  fs.writeFileSync(
    path.join(MATRIX, "macro-v2-m-series-report.json"),
    JSON.stringify(out, null, 2)
  );
  console.log("\nWrote matrix/macro-v2-m-series-report.json");
}

main();
