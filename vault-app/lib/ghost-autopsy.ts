/** Missed-trade autopsy — PRB + Macro Model tables. */

import { analyzeBeRetest } from "./lab-findings";

export interface GhostReasonRow {
  id: number;
  reason: string;
  n: number;
  wins: number;
  losses: number;
  scratches: number;
  netR: number;
}

export interface BeRetestAudit {
  ghostScratch: number;
  ghostMissed5R: number;
  ghostRetestWin: number;
  realScratch: number;
  realMissed5R: number;
  realRetestWin: number;
}

export interface GhostAutopsyReport {
  rows: GhostReasonRow[];
  beAudit: BeRetestAudit | null;
  strategyKind: "prb" | "macro";
  totalN: number;
  totalWins: number;
  totalLosses: number;
  totalScratches: number;
  totalNetR: number;
  relaxCandidates: GhostReasonRow[];
  keepStrict: GhostReasonRow[];
  watchList: GhostReasonRow[];
  confluenceRows: GhostReasonRow[];
  recommendations: string[];
  pineHints: { reason: string; input: string; note: string }[];
}

export const GHOST_REASON_LABELS: string[] = [
  "",
  "Before window (9:30→start)",
  "Monday",
  "Slot used (1/day, in pos)",
  "4H wick too small",
  "No liquidity sweep",
  "No confirming close",
  "Stop out of bounds",
  "Daily P&L lock",
  "Not near key open",
  "Bias filter",
  "After window (end→15:00)",
];

export const MACRO_MISSED_LABELS: string[] = [
  "",
  "Outside macro window",
  "No staging DOL sweep",
  "Premium/discount mismatch",
  "No turtle soup",
  "No SMT",
  "No FVG disrespect",
  "Slot used (1/day)",
  "Stop too wide",
];

export const MACRO_CONFLUENCE_LABELS: string[] = [
  "",
  "Neither TS nor SMT",
  "TS only (no SMT)",
  "SMT only (no TS)",
  "TS + SMT both",
];

const PRB_PINE_HINTS: Record<number, { input: string; note: string }> = {
  1: { input: "Session → Entries from (HHMM)", note: "Widen window start — only if ghost row is clearly net-positive" },
  2: { input: "Session → Skip Mondays", note: "Turn OFF — SOP says lower expectancy but ghosts may show missed edge" },
  3: { input: "Session → Max 1 trade per day", note: "Usually keep ON — slot used is structural" },
  4: { input: "Context → Min 4H wick (pts)", note: "Lower toward 8 grey-zone — A/B before live" },
  5: { input: "Rejection block → Require liquidity sweep", note: "Risky relax — sweep is core SOP; need strong net R" },
  6: { input: "Rejection block → Require confirming close", note: "FAILED in v1 postmortem — do not disable without new A/B" },
  7: { input: "Risk → Max stop / Min stop", note: "Widen max only with prop DD math — often skip oversized wicks" },
  8: { input: "Risk → Daily profit lock / loss stop", note: "Tight lock blocks re-entry not first winner — check eval cap instead" },
  9: { input: "Key opens → Require RB near key open", note: "Turn OFF proximity filter if blocking green ghosts" },
  10: { input: "Session → Direction filter", note: "Discretionary — compare F2 bias journal, not auto Both" },
  11: { input: "Session → Last order (HHMM)", note: "Extend window end — only if net R clearly positive" },
};

const MACRO_MISSED_HINTS: Record<number, { input: string; note: string }> = {
  1: { input: "ICT macro windows → enable 10:50–11:10", note: "Only if outside-macro ghosts are net-positive" },
  2: { input: "Live filters → Require staging DOL sweep", note: "Turn OFF if 9:30–9:45 sweep ghosts win — reversal may not need it" },
  3: { input: "Live filters → Require premium/discount", note: "Turn OFF if mismatch ghosts are green — continuation may enter wrong half" },
  4: { input: "Live filters → Require turtle soup", note: "Turn OFF if no-TS ghosts net positive — TS not always mandatory per SOP" },
  5: { input: "Live filters → Require SMT", note: "Turn OFF if no-SMT ghosts net positive — SMT not always mandatory" },
  6: { input: "Live filters → Require FVG disrespect", note: "Core trigger — only relax if FVG-less ghosts dominate (unlikely)" },
  7: { input: "Session → Max 1 trade per day", note: "Structural — keep ON" },
  8: { input: "Risk → Max stop (pts)", note: "Widen only with DD math" },
};

const MACRO_CONFLUENCE_HINTS: Record<number, { input: string; note: string }> = {
  1: { input: "Live profile", note: "Core-only (no TS/SMT) — viable if net R>0 with n≥3" },
  2: { input: "Live profile", note: "TS-only path — consider require SMT OFF, require TS ON" },
  3: { input: "Live profile", note: "SMT-only path — consider require TS OFF, require SMT ON" },
  4: { input: "Live profile", note: "Full stack TS+SMT — tighten live to both if best net R" },
};

function detectStrategyKind(text: string): "prb" | "macro" {
  const t = text.toLowerCase();
  if (
    t.includes("confluence") ||
    t.includes("neither ts") ||
    t.includes("no turtle soup") ||
    t.includes("outside macro")
  ) {
    return "macro";
  }
  return "prb";
}

function matchLabel(line: string, labels: string[]): number {
  const lower = line.toLowerCase();
  for (let i = 1; i < labels.length; i++) {
    const label = labels[i];
    if (label && lower.includes(label.slice(0, Math.min(14, label.length)).toLowerCase())) {
      return i;
    }
  }
  return -1;
}

export function parseGhostAutopsyPaste(text: string): GhostReasonRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: GhostReasonRow[] = [];
  const kind = detectStrategyKind(text);
  const missedLabels = kind === "macro" ? MACRO_MISSED_LABELS : GHOST_REASON_LABELS;
  const confLabels = MACRO_CONFLUENCE_LABELS;

  for (const line of lines) {
    if (/^total/i.test(line) || /^missed/i.test(line) || /^confluence/i.test(line)) continue;
    if (/^be \+1r/i.test(line)) continue;
    if (/^---/.test(line)) continue;

    const parts = line.split(/[\t|,]+/).map((p) => p.trim());
    if (parts.length < 2) continue;

    const head = parts[0].toLowerCase();
    if ((head === "ghosts" || head === "real fills" || head === "total") && parts.length >= 4 && !parts[1].includes("/")) {
      continue;
    }

    let reason = parts[0];
    let nIdx = 1;
    let wlIdx = 2;
    let rIdx = 3;

    if (/^\d+$/.test(parts[0]) && parts.length >= 3) {
      const id = parseInt(parts[0], 10);
      reason = missedLabels[id] ?? confLabels[id] ?? parts[1];
      nIdx = 2;
      wlIdx = 3;
      rIdx = 4;
    }

    const n = parseInt(parts[nIdx] ?? "0", 10);
    if (!Number.isFinite(n)) continue;

    const wl = parts[wlIdx] ?? "0/0/0";
    const wlMatch = wl.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
    const wins = wlMatch ? parseInt(wlMatch[1], 10) : 0;
    const losses = wlMatch ? parseInt(wlMatch[2], 10) : 0;
    const scratches = wlMatch ? parseInt(wlMatch[3], 10) : 0;
    const netR = parseFloat((parts[rIdx] ?? parts[wlIdx + 1] ?? "0").replace(/[^\d.-]/g, ""));

    let id = matchLabel(reason, missedLabels);
    if (id < 0) id = matchLabel(reason, confLabels);
    if (id < 0 && kind === "prb") {
      id = GHOST_REASON_LABELS.findIndex(
        (label) => label && reason.toLowerCase().includes(label.slice(0, 12).toLowerCase())
      );
    }

    rows.push({
      id: id > 0 ? id : rows.length + 1,
      reason: id > 0 ? (missedLabels[id] ?? confLabels[id] ?? reason) : reason,
      n,
      wins,
      losses,
      scratches,
      netR: Number.isFinite(netR) ? netR : 0,
    });
  }

  return rows;
}

export function parseBeRetestAudit(text: string): BeRetestAudit | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: Partial<BeRetestAudit> = {};

  for (const line of lines) {
    const parts = line.split(/[\t|,]+/).map((p) => p.trim());
    if (parts.length < 4) continue;
    const head = parts[0].toLowerCase();
    const a = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    const c = parseInt(parts[3], 10);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;

    if (head === "ghosts") {
      out.ghostScratch = a;
      out.ghostMissed5R = b;
      out.ghostRetestWin = c;
    } else if (head === "real fills") {
      out.realScratch = a;
      out.realMissed5R = b;
      out.realRetestWin = c;
    } else if (head === "total") {
      if (out.ghostScratch === undefined) {
        out.ghostScratch = 0;
        out.ghostMissed5R = 0;
        out.ghostRetestWin = 0;
        out.realScratch = 0;
        out.realMissed5R = 0;
        out.realRetestWin = 0;
      }
    }
  }

  if (out.ghostScratch === undefined && out.realScratch === undefined) return null;
  return {
    ghostScratch: out.ghostScratch ?? 0,
    ghostMissed5R: out.ghostMissed5R ?? 0,
    ghostRetestWin: out.ghostRetestWin ?? 0,
    realScratch: out.realScratch ?? 0,
    realMissed5R: out.realMissed5R ?? 0,
    realRetestWin: out.realRetestWin ?? 0,
  };
}

export function analyzeGhostAutopsy(rows: GhostReasonRow[], fullPaste = ""): GhostAutopsyReport {
  const kind = detectStrategyKind(fullPaste);
  const hints = kind === "macro" ? { ...MACRO_MISSED_HINTS, ...MACRO_CONFLUENCE_HINTS } : PRB_PINE_HINTS;
  const confluenceNames = new Set(MACRO_CONFLUENCE_LABELS.slice(1));

  const relaxCandidates: GhostReasonRow[] = [];
  const keepStrict: GhostReasonRow[] = [];
  const watchList: GhostReasonRow[] = [];
  const confluenceRows: GhostReasonRow[] = [];
  const recommendations: string[] = [];
  const pineHints: GhostAutopsyReport["pineHints"] = [];

  let totalN = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let totalScratches = 0;
  let totalNetR = 0;

  for (const row of rows) {
    if (confluenceNames.has(row.reason)) {
      confluenceRows.push(row);
    }

    totalN += row.n;
    totalWins += row.wins;
    totalLosses += row.losses;
    totalScratches += row.scratches;
    totalNetR += row.netR;

    if (row.n === 0) continue;

    if (row.netR > 0 && row.n >= 3 && row.wins >= 2) {
      relaxCandidates.push(row);
      const hint = hints[row.id];
      if (hint) {
        pineHints.push({ reason: row.reason, input: hint.input, note: hint.note });
        recommendations.push(
          `Consider A/B relaxing "${row.reason}": ghost net +${row.netR.toFixed(1)}R (${row.wins}W/${row.losses}L). Pine: ${hint.input}`
        );
      }
    } else if (row.netR <= 0 && row.n >= 3) {
      keepStrict.push(row);
      recommendations.push(
        `Keep "${row.reason}" — ${row.n} ghosts net ${row.netR.toFixed(1)}R (filter earning its keep).`
      );
    } else if (row.n > 0 && row.netR > 0) {
      watchList.push(row);
    }
  }

  if (kind === "macro" && confluenceRows.length > 0) {
    const best = [...confluenceRows].filter((r) => r.n >= 2).sort((a, b) => b.netR - a.netR)[0];
    if (best) {
      recommendations.unshift(
        `Confluence leader: "${best.reason}" — net ${best.netR.toFixed(1)}R (${best.wins}W/${best.losses}L, n=${best.n}). Use this row to pick live TS/SMT requirements.`
      );
    }
    recommendations.push(
      "Macro confluence rows answer: did trades work WITHOUT TS, WITHOUT SMT, or only with both? TS/SMT are optional per SOP — tune Live filters from the green confluence row, not from MISSED alone."
    );
  }

  if (relaxCandidates.length === 0 && rows.some((r) => r.n > 0)) {
    recommendations.push(
      "No green-light relax candidates (need n≥3, wins≥2, net R>0). Filters are doing their job or sample is thin — run full 12mo before changing inputs."
    );
  }

  if (rows.length === 0) {
    recommendations.push(
      kind === "macro"
        ? "Paste MISSED + CONFLUENCE tables from Macro Model v1 Pine (bottom right) after replay."
        : "Paste rows from the Pine MISSED table (bottom right) after your replay finishes."
    );
  }

  if (kind === "prb") {
    recommendations.push(
      "Graveyard rules still apply: confirming close OFF, approach guard ON, trail ON — settled failures, do not relax from ghosts alone."
    );
  }

  const beAudit = fullPaste ? parseBeRetestAudit(fullPaste) : null;
  const beVerdict = analyzeBeRetest(beAudit);
  if (beVerdict) {
    recommendations.push(`BE +1R: ${beVerdict.headline} — ${beVerdict.detail}`);
    recommendations.push(...beVerdict.recommendations);
  } else if (fullPaste.trim() && kind === "prb") {
    recommendations.push(
      "BE +1R table not detected — include Ghosts / Real fills rows from Pine bottom-center (v1.10+)."
    );
  }

  return {
    rows,
    beAudit,
    strategyKind: kind,
    totalN,
    totalWins,
    totalLosses,
    totalScratches,
    totalNetR,
    relaxCandidates,
    keepStrict,
    watchList,
    confluenceRows,
    recommendations,
    pineHints,
  };
}

export const GHOST_PASTE_TEMPLATE = `Before window (9:30→start)	0	0/0/0	0
Monday	0	0/0/0	0
Slot used (1/day, in pos)	0	0/0/0	0
4H wick too small	0	0/0/0	0
No liquidity sweep	0	0/0/0	0
No confirming close	0	0/0/0	0
Stop out of bounds	0	0/0/0	0
Daily P&L lock	0	0/0/0	0
Not near key open	0	0/0/0	0
Bias filter	0	0/0/0	0
After window (end→15:00)	0	0/0/0	0
---
BE +1R retest	scratch	missed 5R	retest→win
Ghosts	0	0	0
Real fills	0	0	0
TOTAL	0	0	0`;

export const MACRO_GHOST_PASTE_TEMPLATE = `Outside macro window	0	0/0/0	0
No staging DOL sweep	0	0/0/0	0
Premium/discount mismatch	0	0/0/0	0
No turtle soup	0	0/0/0	0
No SMT	0	0/0/0	0
No FVG disrespect	0	0/0/0	0
Slot used (1/day)	0	0/0/0	0
Stop too wide	0	0/0/0	0
---
CONFLUENCE (core setup outcomes)
Neither TS nor SMT	0	0/0/0	0
TS only (no SMT)	0	0/0/0	0
SMT only (no TS)	0	0/0/0	0
TS + SMT both	0	0/0/0	0`;
