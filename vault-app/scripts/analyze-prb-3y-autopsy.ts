/**
 * Phase 1 autopsy — post-3y execution plan.
 * Year/half splits · winner clusters · loss streaks · news overlay · gate draft.
 *
 * Usage: npx tsx scripts/analyze-prb-3y-autopsy.ts
 */
import fs from "fs";
import path from "path";
import { parseLabLedger, type ParsedTrade } from "../lib/csv";
import { normalizeTradeDate } from "../lib/normalize-date";
import { buildEquityCurve } from "../lib/equity-curve";
import {
  joinTradesWithNews,
  analyzeNewsDayPerformance,
} from "../lib/trade-news-join";
import { profileCalendar, type CalendarEvent } from "../lib/economic-calendar";
import { runMonteCarlo } from "../lib/monte-carlo";
import { ruleById } from "../lib/prop-firms";
import { payoutConfigForFirm } from "../lib/firm-payout-economics";

const MATRIX = path.join(__dirname, "../data/tv-exports/matrix");
const CAL = path.join(__dirname, "../data/calendar-bundle.json");
const OUT_JSON = path.join(__dirname, "../data/tv-exports/prb-3y-autopsy.json");
const OUT_MD = path.join(
  __dirname,
  "../../strategies/strategy-dev/phase1-autopsy-a0a-d1.md"
);

const BOOKS = [
  { id: "A0a", file: "prb-a0a-3y.csv", phase: "eval" as const },
  { id: "D1", file: "prb-d1-3y.csv", phase: "funded" as const },
];

const WIN_FLOOR = 50;
const LOSS_FLOOR = -50;
const OOS_START = "2025-07-14"; // last ~12m of 2023-07→2026-07 window
const SIMS = 2000;
const MAX_TRADES = 220;
const PAYOUT_BUFFER = 2000;

function load(file: string): ParsedTrade[] {
  const text = fs.readFileSync(path.join(MATRIX, file), "utf8");
  return parseLabLedger(text).map((t) => ({
    ...t,
    date: normalizeTradeDate(t.date),
  }));
}

function cls(pnl: number): "W" | "L" | "S" {
  if (pnl > WIN_FLOOR) return "W";
  if (pnl < LOSS_FLOOR) return "L";
  return "S";
}

function expectancy(trades: ParsedTrade[]) {
  const wins = trades.filter((t) => t.pnl > WIN_FLOOR);
  const losses = trades.filter((t) => t.pnl < LOSS_FLOOR);
  const scratches = trades.filter((t) => Math.abs(t.pnl) <= WIN_FLOOR);
  const net = trades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length
    ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
    : 0;
  const exp =
    trades.length === 0
      ? 0
      : (wins.length * avgWin - losses.length * avgLoss) / trades.length;
  const eq = buildEquityCurve(
    trades.map((t) => t.pnl),
    trades.map((t) => t.date)
  );
  const span = dateSpanWeeks(trades);
  return {
    n: trades.length,
    net: Math.round(net),
    w: wins.length,
    l: losses.length,
    s: scratches.length,
    wr: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : 0,
    avgWin: Math.round(avgWin),
    avgLoss: Math.round(avgLoss),
    rr: avgLoss > 0 ? Math.round((avgWin / avgLoss) * 100) / 100 : 0,
    expectancy: Math.round(exp),
    maxDd: Math.round(eq.maxDd),
    rawPerWeek: span > 0 ? Math.round(net / span) : null,
    weeks: Math.round(span * 10) / 10,
  };
}

function dateSpanWeeks(trades: ParsedTrade[]): number {
  const dates = trades
    .map((t) => t.date)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  if (dates.length < 2) return 0;
  const a = new Date(dates[0] + "T12:00:00Z").getTime();
  const b = new Date(dates[dates.length - 1] + "T12:00:00Z").getTime();
  return Math.max((b - a) / (7 * 86400000), 1 / 7);
}

function yearKey(d: string): string {
  return d.slice(0, 4);
}

function halfKey(d: string): string {
  const y = d.slice(0, 4);
  const m = parseInt(d.slice(5, 7), 10);
  return `${y}-H${m <= 6 ? "1" : "2"}`;
}

function monthKey(d: string): string {
  return d.slice(0, 7);
}

function calendarMonth(d: string): number {
  return parseInt(d.slice(5, 7), 10);
}

function weekday(d: string): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dt = new Date(d + "T12:00:00Z");
  return names[dt.getUTCDay()] ?? "?";
}

function splitBy(
  trades: ParsedTrade[],
  keyFn: (d: string) => string
): Record<string, ReturnType<typeof expectancy>> {
  const buckets = new Map<string, ParsedTrade[]>();
  for (const t of trades) {
    const k = keyFn(t.date);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(t);
  }
  const out: Record<string, ReturnType<typeof expectancy>> = {};
  for (const [k, ts] of [...buckets.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    out[k] = expectancy(ts);
  }
  return out;
}

function lossStreaks(trades: ParsedTrade[]) {
  const streaks: {
    start: string;
    end: string;
    len: number;
    sum: number;
    trades: { date: string; pnl: number }[];
  }[] = [];
  let cur: ParsedTrade[] = [];
  for (const t of trades) {
    if (t.pnl < LOSS_FLOOR) {
      cur.push(t);
    } else {
      if (cur.length >= 2) {
        streaks.push({
          start: cur[0].date,
          end: cur[cur.length - 1].date,
          len: cur.length,
          sum: Math.round(cur.reduce((s, x) => s + x.pnl, 0)),
          trades: cur.map((x) => ({ date: x.date, pnl: Math.round(x.pnl) })),
        });
      }
      cur = [];
    }
  }
  if (cur.length >= 2) {
    streaks.push({
      start: cur[0].date,
      end: cur[cur.length - 1].date,
      len: cur.length,
      sum: Math.round(cur.reduce((s, x) => s + x.pnl, 0)),
      trades: cur.map((x) => ({ date: x.date, pnl: Math.round(x.pnl) })),
    });
  }
  streaks.sort((a, b) => b.len - a.len || a.sum - b.sum);
  return streaks;
}

function trailDeathSequences(trades: ParsedTrade[], trail = 2000) {
  /** Sliding windows where cumulative losses from a local peak exceed trail. */
  const deaths: {
    from: string;
    to: string;
    drop: number;
    n: number;
    path: { date: string; pnl: number; eq: number }[];
  }[] = [];
  let peak = 0;
  let eq = 0;
  let path: { date: string; pnl: number; eq: number }[] = [];
  let fromIdx = 0;

  for (let i = 0; i < trades.length; i++) {
    const t = trades[i];
    eq += t.pnl;
    if (eq > peak) {
      peak = eq;
      fromIdx = i + 1;
      path = [];
    }
    path.push({ date: t.date, pnl: Math.round(t.pnl), eq: Math.round(eq) });
    const dd = peak - eq;
    if (dd >= trail && path.length > 0) {
      deaths.push({
        from: trades[fromIdx]?.date ?? path[0].date,
        to: t.date,
        drop: Math.round(dd),
        n: path.length,
        path: [...path],
      });
      // reset peak to current so we don't double-count same trough forever
      peak = eq;
      fromIdx = i + 1;
      path = [];
    }
  }
  return deaths;
}

function mcEvWeek(trades: ParsedTrade[], phase: "eval" | "funded") {
  if (trades.length < 5) {
    return { passPct: null, bustPct: null, expectPerWeek: null, weeksToPayout: null };
  }
  const rule = ruleById("tpt50")!;
  const payoutEconomics = payoutConfigForFirm("tpt50", phase)!;
  const funded = {
    payoutProfitTarget: 2000,
    recycleProfitCap: 5000,
    accountRecycling: true,
    payoutConsistencyPct: 0,
  };
  const r = runMonteCarlo({
    trades: trades.map((t) => t.pnl),
    dates: trades.map((t) => t.date),
    sims: SIMS,
    maxTrades: MAX_TRADES,
    passAt: rule.passAt,
    trailingDD: rule.trailingDD,
    consistency:
      phase === "eval"
        ? { consistencyPct: rule.consistencyPct ?? 50, minDays: rule.minDays ?? 5 }
        : undefined,
    funded,
    simMode: phase === "funded" ? "funded_only" : "eval_path",
    payoutEconomics,
    fees: {
      evalFee: rule.evalFee ?? 170,
      activationFee: rule.activationFee ?? 130,
      monthlyFee: phase === "eval" ? rule.monthlyFee ?? 180 : 0,
      payoutBuffer: PAYOUT_BUFFER,
    },
  });
  const eco = r.economics;
  const weeks = eco.weeksToPayoutP50 ?? eco.weeksToPassP50;
  const perWeek =
    weeks && weeks > 0 ? Math.round(eco.expectedNetPerAccountUsd / weeks) : null;
  return {
    passPct: Math.round(r.passRate * 1000) / 10,
    bustPct: Math.round(r.bustRate * 1000) / 10,
    expectPerWeek: perWeek,
    weeksToPayout: weeks,
    expectNet: Math.round(eco.expectedNetPerAccountUsd),
  };
}

type GateFn = (t: ParsedTrade, red: boolean) => boolean;

function evaluateGate(
  trades: ParsedTrade[],
  profiles: ReturnType<typeof profileCalendar>,
  phase: "eval" | "funded",
  name: string,
  keep: GateFn
) {
  const kept: ParsedTrade[] = [];
  const dropped: ParsedTrade[] = [];
  for (const t of trades) {
    const red = profiles.get(t.date)?.tags.includes("red-folder") ?? false;
    if (keep(t, red)) kept.push(t);
    else dropped.push(t);
  }
  const full = expectancy(trades);
  const gated = expectancy(kept);
  const oosAll = trades.filter((t) => t.date >= OOS_START);
  const oosGated = kept.filter((t) => t.date >= OOS_START);
  const mcFull = mcEvWeek(trades, phase);
  const mcGated = mcEvWeek(kept, phase);
  const mcOosAll = mcEvWeek(oosAll, phase);
  const mcOosGated = mcEvWeek(oosGated, phase);
  return {
    name,
    kept: kept.length,
    dropped: dropped.length,
    droppedNet: Math.round(dropped.reduce((s, t) => s + t.pnl, 0)),
    full,
    gated,
    oos: {
      all: expectancy(oosAll),
      gated: expectancy(oosGated),
    },
    mc: { full: mcFull, gated: mcGated, oosAll: mcOosAll, oosGated: mcOosGated },
    liftEvWeek:
      mcFull.expectPerWeek != null && mcGated.expectPerWeek != null
        ? mcGated.expectPerWeek - mcFull.expectPerWeek
        : null,
    liftOosEvWeek:
      mcOosAll.expectPerWeek != null && mcOosGated.expectPerWeek != null
        ? mcOosGated.expectPerWeek - mcOosAll.expectPerWeek
        : null,
  };
}

function autopsOne(
  id: string,
  trades: ParsedTrade[],
  phase: "eval" | "funded",
  events: CalendarEvent[],
  profiles: ReturnType<typeof profileCalendar>
) {
  const overall = expectancy(trades);
  const byYear = splitBy(trades, yearKey);
  const byHalf = splitBy(trades, halfKey);
  const byMonth = splitBy(trades, monthKey);
  const byCalMonth = splitBy(trades, (d) => String(calendarMonth(d)).padStart(2, "0"));
  const byWeekday = splitBy(trades, weekday);

  const winners = trades
    .filter((t) => t.pnl > WIN_FLOOR)
    .sort((a, b) => b.pnl - a.pnl);
  const bigWinners = winners.filter((t) => t.pnl >= 1500);
  const joined = joinTradesWithNews(trades, events);
  const news = analyzeNewsDayPerformance(joined, id);

  const winnerMonths: Record<string, number> = {};
  const winnerNews: Record<string, number> = {};
  for (const w of winners) {
    const mk = monthKey(w.date);
    winnerMonths[mk] = (winnerMonths[mk] ?? 0) + 1;
    const profile = profiles.get(w.date);
    const tag = profile?.tags.includes("red-folder")
      ? "red"
      : profile
        ? "quiet"
        : "unknown";
    winnerNews[tag] = (winnerNews[tag] ?? 0) + 1;
  }

  const streaks = lossStreaks(trades);
  const trailDeaths = trailDeathSequences(trades, 2000);

  // Rank months by expectancy for data-driven seasonal gate
  const monthRank = Object.entries(byCalMonth)
    .map(([m, s]) => ({ m, ...s }))
    .sort((a, b) => a.expectancy - b.expectancy);

  // Worst calendar months from IN-SAMPLE only (avoid OOS peek for gate invent)
  const inSampleTrades = trades.filter((t) => t.date < OOS_START);
  const inSampleByCalMonth = splitBy(inSampleTrades, (d) =>
    String(calendarMonth(d)).padStart(2, "0")
  );
  const worstTwoMonths = Object.entries(inSampleByCalMonth)
    .map(([m, s]) => ({ m, expectancy: s.expectancy, n: s.n }))
    .filter((r) => r.n >= 3)
    .sort((a, b) => a.expectancy - b.expectancy)
    .slice(0, 2)
    .map((r) => r.m);

  const inSampleByHalf = splitBy(inSampleTrades, halfKey);
  const worstHalf = Object.entries(inSampleByHalf)
    .map(([h, s]) => ({ h, expectancy: s.expectancy, n: s.n }))
    .filter((r) => r.n >= 5)
    .sort((a, b) => a.expectancy - b.expectancy)[0]?.h;

  // Candidate gates (falsifiable, observables already in vault)
  const gates = [
    evaluateGate(trades, profiles, phase, "STAND_DOWN red-folder days", (_t, red) => !red),
    evaluateGate(
      trades,
      profiles,
      phase,
      "STAND_DOWN calendar months 08+09 (Aug–Sep)",
      (t) => {
        const m = calendarMonth(t.date);
        return m !== 8 && m !== 9;
      }
    ),
    evaluateGate(
      trades,
      profiles,
      phase,
      "STAND_DOWN calendar months 02+03 (Feb–Mar)",
      (t) => {
        const m = calendarMonth(t.date);
        return m !== 2 && m !== 3;
      }
    ),
    evaluateGate(
      trades,
      profiles,
      phase,
      "STAND_DOWN months 07+10 (Jul+Oct) — primary candidate",
      (t) => {
        const m = calendarMonth(t.date);
        return m !== 7 && m !== 10;
      }
    ),
    evaluateGate(
      trades,
      profiles,
      phase,
      "STAND_DOWN month 07 only (Jul)",
      (t) => calendarMonth(t.date) !== 7
    ),
    evaluateGate(
      trades,
      profiles,
      phase,
      "STAND_DOWN months 07+10+03 (Jul+Oct+Mar)",
      (t) => {
        const m = calendarMonth(t.date);
        return m !== 7 && m !== 10 && m !== 3;
      }
    ),
    evaluateGate(trades, profiles, phase, "STAND_DOWN Mondays", (t) => weekday(t.date) !== "Mon"),
    evaluateGate(
      trades,
      profiles,
      phase,
      `STAND_DOWN IS-worst months ${worstTwoMonths.join("+") || "n/a"} (exploratory)`,
      (t) => {
        const m = String(calendarMonth(t.date)).padStart(2, "0");
        return !worstTwoMonths.includes(m);
      }
    ),
    evaluateGate(
      trades,
      profiles,
      phase,
      `STAND_DOWN IS-worst half ${worstHalf ?? "n/a"} (historical one-shot)`,
      (t) => halfKey(t.date) !== worstHalf
    ),
  ];

  const oos = trades.filter((t) => t.date >= OOS_START);
  const inSample = trades.filter((t) => t.date < OOS_START);

  return {
    id,
    phase,
    overall,
    mc: mcEvWeek(trades, phase),
    byYear,
    byHalf,
    byMonth,
    byCalMonth,
    byWeekday,
    monthRank,
    oos: {
      start: OOS_START,
      inSample: expectancy(inSample),
      oos: expectancy(oos),
      mcInSample: mcEvWeek(inSample, phase),
      mcOos: mcEvWeek(oos, phase),
    },
    winners: {
      n: winners.length,
      bigN: bigWinners.length,
      list: winners.slice(0, 20).map((t) => ({
        date: t.date,
        pnl: Math.round(t.pnl),
        dir: t.direction,
        weekday: weekday(t.date),
        red: profiles.get(t.date)?.tags.includes("red-folder") ?? false,
        headlines:
          profiles
            .get(t.date)
            ?.events.filter((e) => e.impact === "high")
            .slice(0, 2)
            .map((e) => e.title) ?? [],
      })),
      byMonth: winnerMonths,
      byNews: winnerNews,
    },
    lossStreaks: streaks.slice(0, 12),
    trailDeaths: trailDeaths.slice(0, 8).map((d) => ({
      from: d.from,
      to: d.to,
      drop: d.drop,
      n: d.n,
      pathPreview: d.path.slice(0, 8),
    })),
    news: {
      quiet: news.quiet,
      red: news.red,
      cpi: news.cpi,
      headline: news.headline,
      verdict: news.verdict,
    },
    gates,
  };
}

function mdSection(book: ReturnType<typeof autopsOne>): string {
  const lines: string[] = [];
  lines.push(`## ${book.id} (${book.phase})`);
  lines.push("");
  lines.push(
    `**Overall:** n=${book.overall.n} · net $${book.overall.net} · WR ${book.overall.wr}% · E/trade $${book.overall.expectancy} · maxDD $${book.overall.maxDd} · raw $/wk $${book.overall.rawPerWeek}`
  );
  lines.push(
    `**MC (TPT50 · max ${MAX_TRADES} · buf ${PAYOUT_BUFFER}):** pass ${book.mc.passPct}% · bust ${book.mc.bustPct}% · E[$/wk] $${book.mc.expectPerWeek} · weeks→payout ${book.mc.weeksToPayout}`
  );
  lines.push("");
  lines.push("### Year / half-year splits");
  lines.push("");
  lines.push("| Window | n | net | WR% | E/trade | maxDD | raw $/wk |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const [k, s] of Object.entries(book.byYear)) {
    lines.push(
      `| ${k} | ${s.n} | $${s.net} | ${s.wr} | $${s.expectancy} | $${s.maxDd} | $${s.rawPerWeek} |`
    );
  }
  for (const [k, s] of Object.entries(book.byHalf)) {
    lines.push(
      `| ${k} | ${s.n} | $${s.net} | ${s.wr} | $${s.expectancy} | $${s.maxDd} | $${s.rawPerWeek} |`
    );
  }
  lines.push("");
  lines.push(
    `**In-sample (< ${OOS_START}):** n=${book.oos.inSample.n} net $${book.oos.inSample.net} E/trade $${book.oos.inSample.expectancy} · MC E[$/wk] $${book.oos.mcInSample.expectPerWeek}`
  );
  lines.push(
    `**OOS (≥ ${OOS_START}):** n=${book.oos.oos.n} net $${book.oos.oos.net} E/trade $${book.oos.oos.expectancy} · MC E[$/wk] $${book.oos.mcOos.expectPerWeek} · pass ${book.oos.mcOos.passPct}% bust ${book.oos.mcOos.bustPct}%`
  );
  lines.push("");
  lines.push("### Calendar-month expectancy (pooled across years)");
  lines.push("");
  lines.push("| Mo | n | net | E/trade | WR% |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const row of book.monthRank) {
    lines.push(
      `| ${row.m} | ${row.n} | $${row.net} | $${row.expectancy} | ${row.wr} |`
    );
  }
  lines.push("");
  lines.push("### Winner clusters");
  lines.push("");
  lines.push(
    `Winners (pnl>$${WIN_FLOOR}): **${book.winners.n}** · big (≥$1500): **${book.winners.bigN}** · news mix: ${JSON.stringify(book.winners.byNews)}`
  );
  lines.push("");
  lines.push("| Date | PnL | WD | Red? | Headlines |");
  lines.push("|---|---:|---|---|---|");
  for (const w of book.winners.list.slice(0, 14)) {
    lines.push(
      `| ${w.date} | $${w.pnl} | ${w.weekday} | ${w.red ? "Y" : ""} | ${(w.headlines ?? []).join("; ").slice(0, 60)} |`
    );
  }
  lines.push("");
  lines.push("### Loss streaks (≥2) & trail-death paths");
  lines.push("");
  for (const s of book.lossStreaks.slice(0, 6)) {
    lines.push(
      `- **${s.len}L** ${s.start}→${s.end} sum $${s.sum} · ${s.trades.map((t) => `${t.date}:$${t.pnl}`).join(", ")}`
    );
  }
  lines.push("");
  for (const d of book.trailDeaths.slice(0, 4)) {
    lines.push(
      `- **Trail≥$2k drop** ${d.from}→${d.to} drop $${d.drop} over ${d.n} trades`
    );
  }
  lines.push("");
  lines.push("### News overlay");
  lines.push("");
  lines.push(
    `- Quiet: n=${book.news.quiet.trades} net $${Math.round(book.news.quiet.netPnl)} avg $${Math.round(book.news.quiet.avgPnl)}`
  );
  lines.push(
    `- Red: n=${book.news.red.trades} net $${Math.round(book.news.red.netPnl)} avg $${Math.round(book.news.red.avgPnl)}`
  );
  lines.push(`- ${book.news.headline}`);
  lines.push(`- ${book.news.verdict}`);
  lines.push("");
  lines.push("### Gate candidates (MC lift)");
  lines.push("");
  lines.push(
    "| Gate | kept | dropped net | E[$/wk] full→gated | OOS E[$/wk] full→gated | lift | OOS lift |"
  );
  lines.push("|---|---:|---:|---|---|---:|---:|");
  for (const g of book.gates) {
    lines.push(
      `| ${g.name} | ${g.kept} | $${g.droppedNet} | $${g.mc.full.expectPerWeek}→$${g.mc.gated.expectPerWeek} | $${g.mc.oosAll.expectPerWeek}→$${g.mc.oosGated.expectPerWeek} | ${g.liftEvWeek ?? "—"} | ${g.liftOosEvWeek ?? "—"} |`
    );
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const cal = JSON.parse(fs.readFileSync(CAL, "utf8")) as { events: CalendarEvent[] };
  const profiles = profileCalendar(cal.events);

  const report: {
    generated: string;
    oosStart: string;
    books: ReturnType<typeof autopsOne>[];
  } = {
    generated: new Date().toISOString(),
    oosStart: OOS_START,
    books: [],
  };

  console.log("=== Phase 1 autopsy: A0a / D1 3y ===\n");

  for (const b of BOOKS) {
    if (!fs.existsSync(path.join(MATRIX, b.file))) {
      console.error("MISSING", b.file);
      continue;
    }
    const trades = load(b.file);
    console.log(`${b.id}: loaded ${trades.length} trades`);
    const book = autopsOne(b.id, trades, b.phase, cal.events, profiles);
    report.books.push(book);

    console.log(
      `  overall net $${book.overall.net} E/trade $${book.overall.expectancy} MC E[$/wk] $${book.mc.expectPerWeek}`
    );
    console.log(
      `  OOS n=${book.oos.oos.n} net $${book.oos.oos.net} MC E[$/wk] $${book.oos.mcOos.expectPerWeek}`
    );
    const best = [...book.gates].sort(
      (a, b) => (b.liftOosEvWeek ?? -9999) - (a.liftOosEvWeek ?? -9999)
    )[0];
    console.log(
      `  best OOS-lift gate: ${best?.name} lift=${best?.liftOosEvWeek} (n=${best?.kept})`
    );
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), "utf8");

  // Write primary gate ledgers for Lab (Jul+Oct stand-down)
  for (const b of BOOKS) {
    const trades = load(b.file).filter((t) => {
      const m = calendarMonth(t.date);
      return m !== 7 && m !== 10;
    });
    const outName = b.file.replace(/\.csv$/, "-gate-jul-oct.csv");
    const header = "date,pnl_usd,trade_num,tier,signal";
    const body = trades.map((t, i) =>
      [
        t.date,
        t.pnl.toFixed(2),
        String(i + 1),
        t.tier || "PRB",
        t.signal || "PRB",
      ].join(",")
    );
    fs.writeFileSync(path.join(MATRIX, outName), [header, ...body].join("\n"), "utf8");
    console.log(
      `  gated ledger ${outName}: n=${trades.length} net $${Math.round(trades.reduce((s, t) => s + t.pnl, 0))}`
    );
  }

  const md: string[] = [];
  md.push("---");
  md.push("updated: 2026-07-14");
  md.push("status: draft");
  md.push("owner: strategy-dev");
  md.push("tags: [phase1, autopsy, a0a, d1, regime-gate]");
  md.push("---");
  md.push("# Phase 1 autopsy — A0a / D1 3y");
  md.push("");
  md.push(
    `> Auto-generated by \`scripts/analyze-prb-3y-autopsy.ts\` · ${report.generated}`
  );
  md.push(
    `> Window: matrix \`prb-a0a-3y.csv\` / \`prb-d1-3y.csv\` · OOS from **${OOS_START}** · MC max trades ${MAX_TRADES} · buffer ${PAYOUT_BUFFER}.`
  );
  md.push("");
  md.push("Parent brief: [[execution-plan-post-3y]].");
  md.push("");
  for (const book of report.books) {
    md.push(mdSection(book));
  }

  // Preserve any existing ## Settlement block (agent edits) across re-runs
  let settlement = "";
  if (fs.existsSync(OUT_MD)) {
    const prev = fs.readFileSync(OUT_MD, "utf8");
    const idx = prev.indexOf("## Settlement");
    if (idx >= 0) settlement = "\n" + prev.slice(idx).trimEnd() + "\n";
  }
  if (!settlement) {
    settlement =
      "\n## Settlement\n\nSee chat / update after reading gate tables.\n";
  }
  // Drop script placeholder if we already collected a real settlement above
  const body = md.join("\n").replace(
    /\n## Settlement[\s\S]*$/,
    ""
  );
  fs.writeFileSync(OUT_MD, body.trimEnd() + "\n" + settlement, "utf8");
  console.log(`\nWrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_MD}`);
}

main();
