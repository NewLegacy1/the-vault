import { DayNewsProfile, profileCalendar, CalendarEvent, NewsTradeStats, aggregateByTag, SopDayTag } from "./economic-calendar";
import { normalizeTradeDate } from "./normalize-date";

export interface TradeWithNews {
  date: string;
  pnl: number;
  num?: number;
  entryTime?: string;
  profile: DayNewsProfile | null;
  /** Top red-folder headlines that day. */
  headlines: string[];
}

export function joinTradesWithNews(
  trades: { date: string; pnl: number; num?: number; entryTime?: string }[],
  events: CalendarEvent[]
): TradeWithNews[] {
  const profiles = profileCalendar(events);
  return trades.map((t) => {
    const date = normalizeTradeDate(t.date);
    const profile = profiles.get(date) ?? null;
    const headlines =
      profile?.events
        .filter((e) => e.impact === "high")
        .slice(0, 3)
        .map((e) => `${e.time ? e.time + " " : ""}${e.title}`) ?? [];
    return { ...t, date, profile, headlines };
  });
}

export function newsSummaryStats(
  joined: TradeWithNews[],
  allEvents: CalendarEvent[]
): { quiet: NewsTradeStats; red: NewsTradeStats; dataHl: NewsTradeStats; trendRisk: NewsTradeStats; cpi: NewsTradeStats } {
  const profiles = profileCalendar(allEvents);
  const base = joined.map((j) => ({ date: j.date, pnl: j.pnl }));

  return {
    quiet: aggregateByTag(base, profiles, "quiet"),
    red: aggregateByTag(base, profiles, "red-folder"),
    dataHl: aggregateByTag(base, profiles, "data-hl-ok"),
    trendRisk: aggregateByTag(base, profiles, "trend-day-risk"),
    cpi: aggregateByTag(base, profiles, "cpi-nfp-ppi"),
  };
}

export interface PrbRedFolderAnalysis {
  totalTrades: number;
  totalNet: number;
  inCalendar: number;
  outsideCalendar: number;
  quiet: NewsTradeStats;
  red: NewsTradeStats;
  cpi: NewsTradeStats;
  dataHl: NewsTradeStats;
  redTrades: TradeWithNews[];
  quietTrades: TradeWithNews[];
  /** Plain-language takeaway for whether 8:30 Data H/L is worth manual replay. */
  verdict: string;
  /** One-line comparison headline. */
  headline: string;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;
}

/** PRB performance split: red-folder vs quiet — answers "is news-day edge missing from live PRB?" */
export function analyzePrbRedFolderDays(joined: TradeWithNews[]): PrbRedFolderAnalysis {
  const inCalendar = joined.filter((j) => j.profile !== null);
  const outsideCalendar = joined.length - inCalendar.length;
  const totalNet = joined.reduce((s, t) => s + t.pnl, 0);

  const redTrades = inCalendar.filter((j) => j.profile?.tags.includes("red-folder"));
  const quietTrades = inCalendar.filter((j) => j.profile?.tags.includes("quiet"));

  const sum = (rows: TradeWithNews[]): NewsTradeStats => {
    const wins = rows.filter((t) => t.pnl > 50).length;
    const losses = rows.filter((t) => t.pnl < -50).length;
    const net = rows.reduce((s, t) => s + t.pnl, 0);
    return {
      label: "",
      trades: rows.length,
      wins,
      losses,
      netPnl: net,
      avgPnl: rows.length ? net / rows.length : 0,
    };
  };

  const red = sum(redTrades);
  const quiet = sum(quietTrades);
  const cpi = sum(inCalendar.filter((j) => j.profile?.tags.includes("cpi-nfp-ppi")));
  const dataHl = sum(inCalendar.filter((j) => j.profile?.tags.includes("data-hl-ok")));

  red.label = "red-folder";
  quiet.label = "quiet";
  cpi.label = "cpi-nfp-ppi";
  dataHl.label = "data-hl-ok";

  let headline = "Not enough calendar overlap to compare.";
  let verdict =
    "Load or extend the economic calendar so trade dates join with red-folder tags. Until then you cannot tell if PRB is leaving money on news days.";

  if (inCalendar.length >= 5) {
    const redShare = totalNet !== 0 ? (red.netPnl / totalNet) * 100 : 0;
    headline = `Red-folder: ${red.trades} trades · ${fmtUsd(red.netPnl)} net · Quiet: ${quiet.trades} trades · ${fmtUsd(quiet.netPnl)} net`;

    if (red.trades === 0) {
      verdict =
        "No PRB trades landed on red-folder days in this dataset. Either PRB skipped news sessions (10 AM window) or the calendar gap still misses those dates — check matching days above.";
    } else if (red.netPnl > 200 && red.avgPnl >= quiet.avgPnl) {
      verdict = `PRB is already profitable on red-folder days (${fmtUsd(red.netPnl)} on ${red.trades} trades). A separate 8:30 Data H/L model is unlikely to beat what's working at 10 AM — manual replay is optional curiosity, not a live priority.`;
    } else if (red.netPnl < -200 && quiet.netPnl > 0) {
      verdict = `PRB loses on red-folder days (${fmtUsd(red.netPnl)}) but makes money on quiet days (${fmtUsd(quiet.netPnl)}). That gap is where 8:30 Data H/L *might* help — but only via manual replay on tagged CPI/NFP days (Pine cannot pick those days for you).`;
    } else if (red.netPnl < 0 && quiet.netPnl < 0) {
      verdict = "Both red-folder and quiet buckets are negative in this window — fix PRB mechanics before adding a second news model.";
    } else if (Math.abs(red.netPnl) < 200) {
      verdict = `Red-folder P&L is roughly flat (${fmtUsd(red.netPnl)} on ${red.trades} trades). PRB may be skipping or scratching news sessions — manual Data H/L replay on CPI/NFP days is the only honest way to test if 8:30 adds edge.`;
    } else {
      verdict = `Red-folder days contribute ~${fmtPct(redShare)} of total net P&L. Use the per-trade table below before spending replay time on Data H/L — F7 tags tell you which sessions were actually news days.`;
    }
  }

  return {
    totalTrades: joined.length,
    totalNet,
    inCalendar: inCalendar.length,
    outsideCalendar,
    quiet,
    red,
    cpi,
    dataHl,
    redTrades,
    quietTrades,
    verdict,
    headline,
  };
}

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export const SOP_TAG_LABELS: Record<SopDayTag, string> = {
  quiet: "Quiet (no USD red)",
  "red-folder": "Red-folder day",
  "cpi-nfp-ppi": "CPI / NFP / PPI",
  fomc: "FOMC / Fed",
  "mixed-prints": "Mixed surprises",
  "one-sided-beat": "One-sided beat",
  "data-hl-ok": "Data H/L eligible",
  "trend-day-risk": "Trend-day risk",
  "skip-fade": "Skip fade (SOP)",
};
