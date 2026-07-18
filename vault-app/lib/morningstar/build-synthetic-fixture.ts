import type { Bar } from "./rb-pack";

/** July 2026 is EDT (UTC−4). */
function ny(y: number, mo: number, d: number, h: number, mi: number): number {
  return Date.UTC(y, mo - 1, d, h + 4, mi, 0);
}

function pushBar(out: Bar[], t: number, o: number, h: number, l: number, c: number): void {
  out.push({ time: t, open: o, high: h, low: l, close: c, volume: 1 });
}

/**
 * Dual44 fixture — away-only leave + two-candle RB.
 *
 * 2026-07-16 (control day):
 *   away-up leave (≥25pts above KO), rally freezes fib,
 *   OTE pullback prints bull RB (11:14/11:15) containing KO → Powell Cont.
 *
 * 2026-07-17 (negative day):
 *   away leave happens, but lone long-wick at KO is NOT an RB → no arm.
 */
export function buildSyntheticBars(): Bar[] {
  const out: Bar[] = [];

  // ─── Jul 15 warmup ─────────────────────────────────────────────────────────
  let px = 29350;
  for (let mi = 0; mi < 60; mi++) {
    const t = ny(2026, 7, 15, 15, mi);
    const o = px;
    const c = px + (mi % 3 === 0 ? -1 : 1);
    pushBar(out, t, o, Math.max(o, c) + 2, Math.min(o, c) - 2, c);
    px = c;
  }

  // ─── Jul 16 ───────────────────────────────────────────────────────────────
  px = 29340;
  for (let mi = 30; mi < 50; mi++) {
    const t = ny(2026, 7, 16, 9, mi);
    const o = px;
    const c = px - 2;
    pushBar(out, t, o, o + 1, c - 1, c);
    px = c;
  }
  pushBar(out, ny(2026, 7, 16, 9, 50), px, px + 2, 29295, 29305);
  px = 29305;
  for (let mi = 51; mi < 60; mi++) {
    const t = ny(2026, 7, 16, 9, mi);
    const o = px;
    const c = px + 1.5;
    pushBar(out, t, o, Math.max(o, c) + 1, Math.min(o, c) - 1, c);
    px = c;
  }
  // 10:00 KO = 29320
  pushBar(out, ny(2026, 7, 16, 10, 0), 29320, 29328, 29315, 29322);
  // Dual44: away-up leave (pierce above + ≥25pts away) — NOT reclaim
  pushBar(out, ny(2026, 7, 16, 10, 1), 29322, 29352, 29318, 29348);
  // 10:02–10:03 mild
  pushBar(out, ny(2026, 7, 16, 10, 2), 29348, 29350, 29340, 29344);
  pushBar(out, ny(2026, 7, 16, 10, 3), 29344, 29346, 29330, 29332);
  // 10:04 leave-sleeve RB @ KO (bearish→bullish) for parity leave arm
  pushBar(out, ny(2026, 7, 16, 10, 4), 29332, 29334, 29319, 29321);
  pushBar(out, ny(2026, 7, 16, 10, 5), 29321, 29328, 29310, 29327);
  px = 29327;
  // 10:06–10:35 away run
  for (let mi = 6; mi <= 35; mi++) {
    const t = ny(2026, 7, 16, 10, mi);
    const o = px;
    const c = px + 2;
    pushBar(out, t, o, c + 1, o - 1, c);
    px = c;
  }
  for (let mi = 36; mi <= 44; mi++) {
    const t = ny(2026, 7, 16, 10, mi);
    const o = px;
    const c = px + 0.5;
    pushBar(out, t, o, c + 1, o - 1, c);
    px = c;
  }
  for (let mi = 45; mi < 60; mi++) {
    const t = ny(2026, 7, 16, 10, mi);
    const o = px;
    const c = px - 3;
    pushBar(out, t, o, o + 1, c - 1, c);
    px = c;
  }
  for (let mi = 0; mi <= 13; mi++) {
    const t = ny(2026, 7, 16, 11, mi);
    const o = px;
    const c = px - 2.5;
    pushBar(out, t, o, o + 1, c - 1, c);
    px = c;
  }
  // 11:14–11:15 two-candle RB whose zone CONTAINS KO 29320
  pushBar(out, ny(2026, 7, 16, 11, 14), 29332, 29333, 29326, 29328);
  pushBar(out, ny(2026, 7, 16, 11, 15), 29328, 29340, 29312, 29336);
  px = 29336;
  for (let mi = 16; mi < 60; mi++) {
    const t = ny(2026, 7, 16, 11, mi);
    const o = px;
    const c = px + 1;
    pushBar(out, t, o, c + 1, o - 1, c);
    px = c;
  }

  // ─── Jul 17 — lone long-wick candle must NOT arm ──────────────────────────
  px = 28680;
  for (let mi = 30; mi < 60; mi++) {
    const t = ny(2026, 7, 17, 9, mi);
    const o = px;
    const c = px + 1;
    pushBar(out, t, o, Math.max(o, c) + 2, Math.min(o, c) - 1, c);
    px = c;
  }
  pushBar(out, ny(2026, 7, 17, 10, 0), 28665, 28675, 28660, 28670);
  // away-up leave
  pushBar(out, ny(2026, 7, 17, 10, 1), 28670, 28700, 28668, 28695);
  // LONE bullish long-wick (prior also bullish) → NOT an RB
  pushBar(out, ny(2026, 7, 17, 10, 2), 28690, 28696, 28645, 28688);
  px = 28688;
  for (let mi = 3; mi < 30; mi++) {
    const t = ny(2026, 7, 17, 10, mi);
    const o = px;
    const c = px + 4;
    pushBar(out, t, o, c + 2, o - 1, c);
    px = c;
  }

  return out;
}

export function barsToCsv(bars: Bar[]): string {
  const lines = ["time,open,high,low,close,volume"];
  for (const b of bars) {
    const iso = new Date(b.time).toISOString();
    lines.push(`${iso},${b.open},${b.high},${b.low},${b.close},${b.volume ?? 0}`);
  }
  return lines.join("\n") + "\n";
}
