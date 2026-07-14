/**
 * Cross-reference premium-365d matrix ledgers (PRB × Macro × news).
 * Usage: npx tsx scripts/analyze-hybrid-matrix.ts
 */
import fs from "fs";
import path from "path";
import { parseTvCsv, type ParsedTrade } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import {
  joinTradesWithNews,
  analyzeNewsDayPerformance,
} from "../lib/trade-news-join";
import type { CalendarEvent } from "../lib/economic-calendar";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { buildEquityCurve } from "../lib/equity-curve";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const CAL = path.join(__dirname, "../data/calendar-bundle.json");
const OUT = path.join(__dirname, "../data/tv-exports/hybrid-matrix-analysis.json");

const FILES: Record<string, string> = {
  A0a: "prb-matrix-a0a.csv",
  A0b: "prb-matrix-a0b.csv",
  A1c: "prb-matrix-a1c.csv",
  D1: "prb-matrix-d1.csv",
  B0: "macro-matrix-b0.csv",
  B1a: "macro-matrix-b1a.csv",
  B1b: "macro-matrix-b1b.csv",
  B1c: "macro-matrix-b1c.csv",
};

function load(name: string): ParsedTrade[] {
  const p = path.join(MATRIX, FILES[name]);
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  const text = fs.readFileSync(p, "utf8");
  // Lab ledger (date,pnl) vs raw TV
  if (text.startsWith("date,") || text.startsWith("\ufeffdate,")) {
    return text
      .replace(/^\ufeff/, "")
      .split(/\r?\n/)
      .slice(1)
      .filter((l) => l.trim())
      .map((l, i) => {
        const [date, pnl, , tier, signal] = l.split(",");
        return {
          num: i + 1,
          date: normalizeTradeDate(date),
          pnl: parseFloat(pnl),
          tier: tier || undefined,
          signal: signal || undefined,
        };
      })
      .filter((t) => Number.isFinite(t.pnl) && t.date);
  }
  return parseTvCsv(text).map((t) => ({
    ...t,
    date: normalizeTradeDate(t.date),
  }));
}

function classify(pnl: number): "W" | "L" | "S" {
  if (pnl > 50) return "W";
  if (pnl < -50) return "L";
  return "S";
}

function maxLossStreak(pnls: number[]): number {
  let max = 0;
  let cur = 0;
  for (const p of pnls) {
    if (p < -50) {
      cur++;
      max = Math.max(max, cur);
    } else cur = 0;
  }
  return max;
}

function streakHist(pnls: number[]): Record<number, number> {
  const hist: Record<number, number> = {};
  let cur = 0;
  for (const p of pnls) {
    if (p < -50) {
      cur++;
    } else {
      if (cur > 0) hist[cur] = (hist[cur] ?? 0) + 1;
      cur = 0;
    }
  }
  if (cur > 0) hist[cur] = (hist[cur] ?? 0) + 1;
  return hist;
}

function bookStats(trades: ParsedTrade[], label: string) {
  const pnls = trades.map((t) => t.pnl);
  const wins = pnls.filter((p) => p > 50);
  const losses = pnls.filter((p) => p < -50);
  const scratches = pnls.filter((p) => Math.abs(p) <= 50);
  const net = pnls.reduce((s, p) => s + p, 0);
  const eq = buildEquityCurve(pnls, trades.map((t) => t.date));
  const avgWin = wins.length ? wins.reduce((s, p) => s + p, 0) / wins.length : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, p) => s + p, 0) / losses.length)
    : 0;
  const expectancy =
    trades.length === 0
      ? 0
      : (wins.length * avgWin - losses.length * avgLoss) / trades.length;
  const rr = avgLoss > 0 ? avgWin / avgLoss : 0;
  return {
    label,
    n: trades.length,
    net: Math.round(net),
    w: wins.length,
    l: losses.length,
    s: scratches.length,
    wr: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : 0,
    avgWin: Math.round(avgWin),
    avgLoss: Math.round(avgLoss),
    rr: Math.round(rr * 100) / 100,
    expectancy: Math.round(expectancy),
    maxDd: Math.round(eq.maxDd),
    maxLossStreak: maxLossStreak(pnls),
    lossStreakHist: streakHist(pnls),
    avgMfe:
      trades.filter((t) => t.mfeUsd != null).length > 0
        ? Math.round(
            trades
              .filter((t) => t.mfeUsd != null)
              .reduce((s, t) => s + (t.mfeUsd ?? 0), 0) /
              trades.filter((t) => t.mfeUsd != null).length
          )
        : null,
  };
}

function mcTpt(trades: ParsedTrade[]) {
  const rule = ruleById("tpt50")!;
  const r = runMonteCarlo({
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    sims: 2000,
    maxTrades: 80,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    phase: "eval",
    consistency: { consistencyPct: 50, minDays: 5 },
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
    weeksToPassP50: r.economics.weeksToPassP50,
  };
}

function byDate(trades: ParsedTrade[]): Map<string, ParsedTrade> {
  const m = new Map<string, ParsedTrade>();
  for (const t of trades) {
    const d = t.date;
    const prev = m.get(d);
    if (!prev || Math.abs(t.pnl) > Math.abs(prev.pnl)) m.set(d, t);
  }
  return m;
}

type DayOutcome = {
  date: string;
  prb?: number;
  macro?: number;
  prbCls?: string;
  macroCls?: string;
  combined: number;
  tag: string;
};

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 3) return null;
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return Math.round((num / Math.sqrt(dx * dy)) * 1000) / 1000;
}

function main() {
  const bundle = JSON.parse(fs.readFileSync(CAL, "utf8")) as {
    events: CalendarEvent[];
  };
  const events = bundle.events;

  const books: Record<string, ParsedTrade[]> = {};
  for (const k of Object.keys(FILES)) books[k] = load(k);

  const summary = Object.fromEntries(
    Object.entries(books).map(([k, t]) => [k, { ...bookStats(t, k), mc: mcTpt(t) }])
  );

  // Primary hybrid candidates: A0a (PRB control) × B1a (Macro A)
  // Also A0a × B0, D1 × B1a
  const pairs: [string, string][] = [
    ["A0a", "B1a"],
    ["A0a", "B0"],
    ["A0b", "B1a"],
    ["D1", "B1a"],
    ["A0a", "B1b"],
  ];

  const pairReports = pairs.map(([prbKey, macroKey]) => {
    const prbMap = byDate(books[prbKey]);
    const macMap = byDate(books[macroKey]);
    const allDates = Array.from(
      new Set([...prbMap.keys(), ...macMap.keys()])
    ).sort();

    const bothDates = allDates.filter((d) => prbMap.has(d) && macMap.has(d));
    const prbOnly = allDates.filter((d) => prbMap.has(d) && !macMap.has(d));
    const macOnly = allDates.filter((d) => macMap.has(d) && !prbMap.has(d));

    const bothPrb = bothDates.map((d) => prbMap.get(d)!.pnl);
    const bothMac = bothDates.map((d) => macMap.get(d)!.pnl);
    const corr = pearson(bothPrb, bothMac);

    let sameLoss = 0;
    let sameWin = 0;
    let prbSave = 0; // PRB win / scratch when Macro loss
    let macSave = 0;
    let bothLoss = 0;
    for (const d of bothDates) {
      const p = classify(prbMap.get(d)!.pnl);
      const m = classify(macMap.get(d)!.pnl);
      if (p === "L" && m === "L") {
        sameLoss++;
        bothLoss++;
      }
      if (p === "W" && m === "W") sameWin++;
      if (m === "L" && p !== "L") prbSave++;
      if (p === "L" && m !== "L") macSave++;
    }

    // Strategies for combining into one book (chronological merge)
    type Mode =
      | "union_both_days_sum"
      | "union_pick_better"
      | "union_pick_prb_first"
      | "union_pick_macro_first"
      | "prb_only_when_macro_absent"
      | "macro_only_when_prb_absent"
      | "and_gate_both_must_exist_take_avg"
      | "skip_shared_days_prb_plus_macro_exclusive";

    const modes: Mode[] = [
      "union_both_days_sum",
      "union_pick_better",
      "union_pick_prb_first",
      "union_pick_macro_first",
      "prb_only_when_macro_absent",
      "macro_only_when_prb_absent",
      "and_gate_both_must_exist_take_avg",
      "skip_shared_days_prb_plus_macro_exclusive",
    ];

    const modeBooks: Record<string, ParsedTrade[]> = {};

    for (const mode of modes) {
      const out: ParsedTrade[] = [];
      let n = 0;
      for (const d of allDates) {
        const p = prbMap.get(d);
        const m = macMap.get(d);
        let pnl: number | null = null;
        let signal = "";

        switch (mode) {
          case "union_both_days_sum":
            if (p && m) {
              pnl = p.pnl + m.pnl;
              signal = "SUM";
            } else if (p) {
              pnl = p.pnl;
              signal = "PRB";
            } else if (m) {
              pnl = m.pnl;
              signal = "MAC";
            }
            break;
          case "union_pick_better":
            if (p && m) {
              pnl = p.pnl >= m.pnl ? p.pnl : m.pnl;
              signal = p.pnl >= m.pnl ? "PRB" : "MAC";
            } else {
              pnl = (p ?? m)!.pnl;
              signal = p ? "PRB" : "MAC";
            }
            break;
          case "union_pick_prb_first":
            if (p) {
              pnl = p.pnl;
              signal = "PRB";
            } else if (m) {
              pnl = m.pnl;
              signal = "MAC";
            }
            break;
          case "union_pick_macro_first":
            if (m) {
              pnl = m.pnl;
              signal = "MAC";
            } else if (p) {
              pnl = p.pnl;
              signal = "PRB";
            }
            break;
          case "prb_only_when_macro_absent":
            if (p && !m) {
              pnl = p.pnl;
              signal = "PRB";
            }
            break;
          case "macro_only_when_prb_absent":
            if (m && !p) {
              pnl = m.pnl;
              signal = "MAC";
            }
            break;
          case "and_gate_both_must_exist_take_avg":
            if (p && m) {
              pnl = (p.pnl + m.pnl) / 2;
              signal = "AVG";
            }
            break;
          case "skip_shared_days_prb_plus_macro_exclusive":
            if (p && m) break; // skip conflict days
            if (p) {
              pnl = p.pnl;
              signal = "PRB";
            } else if (m) {
              pnl = m.pnl;
              signal = "MAC";
            }
            break;
          default: {
            const _e: never = mode;
            throw new Error(_e);
          }
        }

        if (pnl == null) continue;
        n++;
        out.push({ num: n, date: d, pnl, signal });
      }
      modeBooks[mode] = out;
    }

    const modeStats = Object.fromEntries(
      Object.entries(modeBooks).map(([mode, t]) => [
        mode,
        { ...bookStats(t, mode), mc: mcTpt(t) },
      ])
    );

    // News join on each book + union exclusive
    const newsBucket = (s: { trades: number; wins: number; netPnl: number }) => ({
      n: s.trades,
      net: Math.round(s.netPnl),
      wr: s.trades ? Math.round((s.wins / s.trades) * 1000) / 10 : 0,
    });

    const newsFor = (trades: ParsedTrade[], label: string) => {
      const joined = joinTradesWithNews(
        trades.map((t) => ({ date: t.date, pnl: t.pnl, num: t.num })),
        events
      );
      const a = analyzeNewsDayPerformance(joined, label);
      return {
        quiet: newsBucket(a.quiet),
        red: newsBucket(a.red),
        cpi: newsBucket(a.cpi),
        headline: a.headline,
        verdict: a.verdict,
      };
    };

    const days: DayOutcome[] = allDates.map((d) => {
      const p = prbMap.get(d);
      const m = macMap.get(d);
      const joined = joinTradesWithNews(
        [{ date: d, pnl: (p?.pnl ?? 0) + (m?.pnl ?? 0) }],
        events
      )[0];
      const tags = joined.profile?.sopTags ?? [];
      const tag = tags.includes("red-folder")
        ? "red-folder"
        : tags.includes("cpi-nfp-ppi")
          ? "cpi-nfp-ppi"
          : tags.includes("quiet")
            ? "quiet"
            : "unknown";
      return {
        date: d,
        prb: p?.pnl,
        macro: m?.pnl,
        prbCls: p ? classify(p.pnl) : undefined,
        macroCls: m ? classify(m.pnl) : undefined,
        combined: (p?.pnl ?? 0) + (m?.pnl ?? 0),
        tag,
      };
    });

    const bothLossDays = days.filter(
      (d) => d.prbCls === "L" && d.macroCls === "L"
    );
    const conflictRed = days.filter(
      (d) => d.prb != null && d.macro != null && d.tag === "red-folder"
    );

    return {
      pair: `${prbKey}×${macroKey}`,
      overlap: {
        bothDays: bothDates.length,
        prbOnly: prbOnly.length,
        macroOnly: macOnly.length,
        correlationOnOverlap: corr,
        sameDayBothLoss: sameLoss,
        sameDayBothWin: sameWin,
        macroLossPrbHelped: prbSave,
        prbLossMacroHelped: macSave,
        bothLossDates: bothLossDays.map((d) => ({
          date: d.date,
          prb: d.prb,
          macro: d.macro,
          tag: d.tag,
        })),
        overlapOnRedFolder: conflictRed.length,
        overlapRedNetSum: Math.round(
          conflictRed.reduce((s, d) => s + d.combined, 0)
        ),
      },
      news: {
        [prbKey]: newsFor(books[prbKey], prbKey),
        [macroKey]: newsFor(books[macroKey], macroKey),
        unionExclusive: newsFor(
          modeBooks.skip_shared_days_prb_plus_macro_exclusive,
          "exclusive-union"
        ),
        unionPickBetter: newsFor(modeBooks.union_pick_better, "pick-better"),
      },
      modes: modeStats,
      sampleOverlapDays: bothDates.slice(0, 12).map((d) => ({
        date: d,
        prb: prbMap.get(d)!.pnl,
        macro: macMap.get(d)!.pnl,
        tag:
          joinTradesWithNews([{ date: d, pnl: 0 }], events)[0].profile?.sopTags?.[0] ??
          "unknown",
      })),
    };
  });

  // Win-rate / RR by news for best individuals
  const newsSplitDetail = Object.fromEntries(
    (["A0a", "A0b", "D1", "B0", "B1a"] as const).map((k) => {
      const joined = joinTradesWithNews(
        books[k].map((t) => ({ date: t.date, pnl: t.pnl })),
        events
      );
      const a = analyzeNewsDayPerformance(joined, k);
      return [
        k,
        {
          headline: a.headline,
          quiet: a.quiet,
          red: a.red,
          cpi: a.cpi,
          redTrades: a.redTrades.map((t) => ({
            date: t.date,
            pnl: Math.round(t.pnl),
            headlines: t.headlines.slice(0, 2),
          })),
        },
      ];
    })
  );

  const report = {
    builtAt: new Date().toISOString(),
    spanNote: "Premium 365d matrix CSVs from Downloads (2026-07-14 afternoon)",
    individual: summary,
    pairs: pairReports,
    newsSplitDetail,
    takeaways: [] as string[],
  };

  // Auto takeaways for A0a×B1a
  const primary = pairReports.find((p) => p.pair === "A0a×B1a")!;
  const baseA = summary.A0a;
  const baseB = summary.B1a;
  const exclusive = primary.modes.skip_shared_days_prb_plus_macro_exclusive;
  const pickBetter = primary.modes.union_pick_better;
  const prbFirst = primary.modes.union_pick_prb_first;
  const sumBoth = primary.modes.union_both_days_sum;

  report.takeaways = [
    `Overlap A0a×B1a: ${primary.overlap.bothDays} shared days, corr=${primary.overlap.correlationOnOverlap}`,
    `Same-day both-loss events: ${primary.overlap.sameDayBothLoss} (diversification ${primary.overlap.sameDayBothLoss === 0 ? "excellent" : "partial"})`,
    `A0a alone: pass ${baseA.mc.pass}% · maxLossStreak ${baseA.maxLossStreak} · RR ${baseA.rr} · n=${baseA.n}`,
    `B1a alone: pass ${baseB.mc.pass}% · maxLossStreak ${baseB.maxLossStreak} · RR ${baseB.rr} · n=${baseB.n}`,
    `Exclusive union (skip shared): pass ${exclusive.mc.pass}% · streak ${exclusive.maxLossStreak} · net $${exclusive.net} · n=${exclusive.n}`,
    `Pick-better on shared: pass ${pickBetter.mc.pass}% · streak ${pickBetter.maxLossStreak} · RR ${pickBetter.rr} · n=${pickBetter.n}`,
    `PRB-first (fill gaps with Macro): pass ${prbFirst.mc.pass}% · streak ${prbFirst.maxLossStreak} · n=${prbFirst.n}`,
    `Sum both on shared (portfolio risk): pass ${sumBoth.mc.pass}% · streak ${sumBoth.maxLossStreak} · maxDd $${sumBoth.maxDd}`,
  ];

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

  // Console summary
  console.log("\n=== INDIVIDUAL BOOKS ===");
  for (const [k, s] of Object.entries(summary)) {
    console.log(
      `${k}: n=${s.n} net=$${s.net} W/L/S=${s.w}/${s.l}/${s.s} WR=${s.wr}% RR=${s.rr} E=$${s.expectancy} maxDD=$${s.maxDd} maxLStreak=${s.maxLossStreak} MC pass=${s.mc.pass}%`
    );
  }

  console.log("\n=== PRIMARY PAIR A0a × B1a ===");
  console.log(JSON.stringify(primary.overlap, null, 2));
  console.log("\nModes:");
  for (const [mode, s] of Object.entries(primary.modes)) {
    console.log(
      `  ${mode}: n=${s.n} net=$${s.net} RR=${s.rr} streak=${s.maxLossStreak} DD=$${s.maxDd} pass=${s.mc.pass}%`
    );
  }

  console.log("\n=== NEWS (A0a / B1a) ===");
  console.log("A0a", JSON.stringify(newsSplitDetail.A0a.quiet), JSON.stringify(newsSplitDetail.A0a.red));
  console.log("B1a", JSON.stringify(newsSplitDetail.B1a.quiet), JSON.stringify(newsSplitDetail.B1a.red));
  console.log("A0a headline:", newsSplitDetail.A0a.headline);
  console.log("B1a headline:", newsSplitDetail.B1a.headline);

  console.log("\n=== TAKEAWAYS ===");
  for (const t of report.takeaways) console.log("-", t);
  console.log("\nWrote", OUT);
}

main();
