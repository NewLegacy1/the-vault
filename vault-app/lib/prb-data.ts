// PRB v1 verified backtest record (BE-only, bias Both, no trail).
// Sources: TradingView Strategy Tester exports, cross-checked Jul 13 2026.

export interface SeedTrade {
  date: string;
  dir: "L" | "S";
  pnl: number;
}

// Dec 9 2025 – Mar 31 2026 bar-replay control: +$6,005 / 23 trades
export const TRADES_DEC_MAR: SeedTrade[] = [
  { date: "2025-12-09", dir: "S", pnl: -302.28 },
  { date: "2025-12-16", dir: "S", pnl: 1935.12 },
  { date: "2025-12-19", dir: "S", pnl: -27.84 },
  { date: "2026-01-02", dir: "L", pnl: 1905.12 },
  { date: "2026-01-06", dir: "S", pnl: -27.84 },
  { date: "2026-01-07", dir: "S", pnl: -403.84 },
  { date: "2026-01-08", dir: "L", pnl: 1877.6 },
  { date: "2026-01-13", dir: "S", pnl: 1900.16 },
  { date: "2026-01-15", dir: "L", pnl: -17.4 },
  { date: "2026-01-16", dir: "L", pnl: -177.4 },
  { date: "2026-01-21", dir: "S", pnl: -337.4 },
  { date: "2026-01-22", dir: "S", pnl: -230.62 },
  { date: "2026-01-28", dir: "L", pnl: -427.32 },
  { date: "2026-02-10", dir: "S", pnl: 1942.64 },
  { date: "2026-02-17", dir: "L", pnl: -402.36 },
  { date: "2026-02-26", dir: "L", pnl: -289.12 },
  { date: "2026-03-05", dir: "L", pnl: -395.36 },
  { date: "2026-03-13", dir: "L", pnl: -17.4 },
  { date: "2026-03-19", dir: "S", pnl: -20.88 },
  { date: "2026-03-20", dir: "L", pnl: -22.62 },
  { date: "2026-03-26", dir: "L", pnl: -17.4 },
  { date: "2026-03-27", dir: "L", pnl: -19.14 },
  { date: "2026-03-31", dir: "S", pnl: -419.84 },
];

// Apr 10 – Jul 1 2026 merged exports (13)+(12): +$5,536 / 14 trades
export const TRADES_APR_JUL: SeedTrade[] = [
  { date: "2026-04-10", dir: "L", pnl: -29.58 },
  { date: "2026-04-16", dir: "S", pnl: -393.14 },
  { date: "2026-04-21", dir: "S", pnl: -398.64 },
  { date: "2026-04-28", dir: "L", pnl: -117.4 },
  { date: "2026-04-30", dir: "S", pnl: -26.1 },
  { date: "2026-05-21", dir: "S", pnl: 1924.16 },
  { date: "2026-05-22", dir: "L", pnl: 1968.9 },
  { date: "2026-05-26", dir: "S", pnl: -20.88 },
  { date: "2026-05-29", dir: "S", pnl: 1937.6 },
  { date: "2026-06-05", dir: "L", pnl: 1938.86 },
  { date: "2026-06-10", dir: "S", pnl: -404.14 },
  { date: "2026-06-17", dir: "L", pnl: -404.88 },
  { date: "2026-06-24", dir: "S", pnl: -410.88 },
  { date: "2026-07-01", dir: "L", pnl: -27.84 },
];

export const ALL_SEED_TRADES: SeedTrade[] = [...TRADES_DEC_MAR, ...TRADES_APR_JUL];

export interface ConfigItem {
  group: string;
  name: string;
  value: string;
  locked: boolean;
  note?: string;
}

export const LOCKED_CONFIG: ConfigItem[] = [
  { group: "Session", name: "Chart / instrument", value: "5m MNQ", locked: true },
  { group: "Session", name: "Entry window", value: "10:00 – 13:00 NY", locked: true, note: "Script default winEnd is 1130 — override to 1300" },
  { group: "Session", name: "Max trades / day", value: "1", locked: true },
  { group: "Session", name: "Skip Mondays", value: "ON", locked: true },
  { group: "Session", name: "Direction filter", value: "Both (manual Long/Short only from morning bias)", locked: false, note: "Set from Daily→4H read each morning" },
  { group: "Rejection block", name: "Confirming close", value: "ON", locked: true },
  { group: "Rejection block", name: "Require sweep", value: "ON", locked: true },
  { group: "Rejection block", name: "Rolling 20-bar sweep", value: "OFF", locked: true },
  { group: "Rejection block", name: "Leave-then-retest", value: "1R (strict OFF)", locked: true },
  { group: "Rejection block", name: "Approach guard", value: "OFF (0)", locked: true, note: "FAILED A/B — do not re-enable" },
  { group: "Entry", name: "Entry mode", value: "Auto (CE if stop too big) — LIMIT orders", locked: true },
  { group: "Risk", name: "Risk per trade", value: "$400 ($300 in fresh eval until +$1,000 cushion)", locked: false },
  { group: "Risk", name: "Target", value: "1:5", locked: true },
  { group: "Risk", name: "Breakeven", value: "+1R", locked: true },
  { group: "Risk", name: "Trail", value: "OFF (BE-only) — regime toggle available", locked: false, note: "Flip trail ON only when give-backs >= 2 in 10 sessions" },
  { group: "Risk", name: "Daily loss stop / profit lock", value: "$800 / $1,400", locked: true },
  { group: "Risk", name: "Max stop", value: "20 pts (skip 25+)", locked: true },
];

export interface AbResult {
  test: string;
  window: string;
  result: string;
  verdict: "rejected" | "kept";
}

export const AB_GRAVEYARD: AbResult[] = [
  { test: "Strict retest (leave after RB bar)", window: "Full replay", result: "Win rate -> 0", verdict: "rejected" },
  { test: "Approach guard 2R", window: "Feb–Mar", result: "Killed Feb 10 +$1,943 winner; net -$803", verdict: "rejected" },
  { test: "Trail 2.0/1.5 always-on", window: "8 months", result: "Net ~ -$1,040 vs BE-only (demoted Jan 2/8, Feb 10, May 22, Jun 5)", verdict: "rejected" },
  { test: "Widen window + 2 trades/day", window: "Apr–Jul ghosts", result: "0W / 9L / 6 scratch, -34R", verdict: "rejected" },
  { test: "Auto PDH/PDL draw bias", window: "Apr–Jul", result: "-$1,528 vs Both (blocked May 22 +$1,969)", verdict: "rejected" },
  { test: "BE at +1R", window: "Full replay", result: "Core of the edge — converts give-backs to scratches", verdict: "kept" },
  { test: "Give-back regime trail toggle (situational)", window: "Feb–Mar", result: "+$684 vs BE in pop-and-fade month", verdict: "kept" },
];

export const CHANGELOG: { ver: string; note: string }[] = [
  { ver: "v1.0", note: "Formal RB + key opens + sweep pool + 4 entry modes + TPT risk engine" },
  { ver: "v1.1", note: "Leave-then-retest 1R, confirming close, rolling sweep off — fixed duration-0 blow-through fills" },
  { ver: "v1.2", note: "Approach guard A/B failed (reverted); Direction filter input for manual bias" },
  { ver: "v1.3", note: "Auto PDH/PDL draw bias mode (A/B failed vs Both — keep off); ghost trade autopsy table" },
  { ver: "v1.4", note: "Give-back regime: one-click trail toggle (2.0/1.5) + rolling give-back counter in funnel" },
  { ver: "v1.5", note: "Chart declutter (soup/ghost marks off) + armed-limit order zone boxes with LIMIT/STOP/TP label" },
];
