/**
 * Parse Morningstar v46 plan labels / KPI text / v47 JOURNAL CARD from OCR or clipboard.
 * Example plan: "LONG · Powell · Cont · 1RB · OTE+KO · 1:5 WIN"
 * Example card: "MS JRN\nD=20260718 T=1008\nSIDE=SHORT\nTAG=Powell Cont 1RB OTE+KO\n..."
 * Fuzzy: OCR often turns · into . | - or spaces; = into : sometimes.
 */

export type ParsedDual46Tag = {
  direction?: "long" | "short";
  pathBModel?: "Cont" | "Judas";
  pathBGrade?: "OTE+KO" | "OTE" | "KO";
  planRr?: number;
  dualOutcome?: "WIN" | "LOSS" | "no fill";
  shadow?: boolean;
  stopPts?: number;
  tpPts?: number;
  /** Matched plan line if found */
  matched?: string;
  confidence: "high" | "low" | "none";
  /** From MS JRN card — NY calendar YYYYMMDD */
  entryYmd?: number;
  /** Arm/entry HHMM NY */
  entryHhmm?: string;
  atrPts?: number;
  dailyAtrPts?: number;
  /** stop / ATR1 at arm */
  xAtr?: number;
  mfeR?: number;
  fiveMinConfirm?: boolean;
  vixPrevClose?: number;
  or30ratio?: number;
  fillStatus?: "yes" | "no" | "no-arm" | "converted";
  sleeve?: "leave" | "powell" | "none";
};

function normalize(raw: string): string {
  return raw
    .replace(/\u00b7|\u2022|\u2219|\u22c5/g, "·")
    .replace(/[|]/g, "·")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGrade(s: string): ParsedDual46Tag["pathBGrade"] | undefined {
  const u = s.toUpperCase().replace(/\s+/g, "");
  if (u.includes("OTE+KO") || u.includes("OTEKO") || u.includes("OTE&KO")) return "OTE+KO";
  if (u === "OTE" || u.includes("OTE")) return "OTE";
  if (u === "KO") return "KO";
  return undefined;
}

function kv(raw: string, key: string): string | undefined {
  // KEY=val or KEY:val — stop at next KEY= or EOL
  const re = new RegExp(
    `\\b${key}\\s*[=:]\\s*([^\\n]+?)(?=\\s+[A-Z][A-Z0-9]*\\s*[=:]|$)`,
    "i"
  );
  const m = re.exec(raw);
  if (!m) return undefined;
  return m[1].trim().replace(/[—–−]/g, "-");
}

function numKv(raw: string, key: string): number | undefined {
  const v = kv(raw, key);
  if (v == null || v === "-" || v === "—") return undefined;
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Parse v47 JOURNAL CARD block (MS JRN …). */
export function parseJournalCard(raw: string): ParsedDual46Tag {
  if (!raw || !/MS\s*JRN/i.test(raw)) return { confidence: "none" };
  const t = raw.replace(/\r\n/g, "\n");
  const out: ParsedDual46Tag = { confidence: "low", matched: "MS JRN" };

  const d = kv(t, "D");
  if (d) {
    const ymd = parseInt(d.replace(/\D/g, "").slice(0, 8), 10);
    if (Number.isFinite(ymd) && ymd >= 20200101) out.entryYmd = ymd;
  }
  const tm = kv(t, "T");
  if (tm) {
    const hhmm = tm.replace(/\D/g, "").padStart(4, "0").slice(0, 4);
    if (/^\d{4}$/.test(hhmm)) out.entryHhmm = hhmm;
  }

  const side = kv(t, "SIDE");
  if (side) {
    if (/long/i.test(side)) out.direction = "long";
    else if (/short/i.test(side)) out.direction = "short";
  }

  const tag = kv(t, "TAG") ?? "";
  if (/leave/i.test(tag)) out.sleeve = "leave";
  else if (/powell/i.test(tag)) out.sleeve = "powell";
  else if (/none/i.test(tag)) out.sleeve = "none";
  if (/\bCont\b/i.test(tag)) out.pathBModel = "Cont";
  if (/\bJudas\b/i.test(tag)) out.pathBModel = "Judas";
  const g =
    /\b(OTE\s*\+?\s*KO|OTE\+KO|OTEKO|OTE|KO)\b/i.exec(tag) ??
    /\b(OTE\s*\+?\s*KO|OTE|KO)\b/i.exec(t);
  if (g) out.pathBGrade = parseGrade(g[1]);

  out.stopPts = numKv(t, "STOP");
  out.planRr = numKv(t, "PLANR");
  out.atrPts = numKv(t, "ATR1");
  out.dailyAtrPts = numKv(t, "DATR");
  out.xAtr = numKv(t, "XATR");
  out.or30ratio = numKv(t, "OR30");
  out.vixPrevClose = numKv(t, "VIX");
  out.mfeR = numKv(t, "MFER");

  const five = kv(t, "5M");
  if (five) {
    if (/^Y/i.test(five)) out.fiveMinConfirm = true;
    else if (/^N/i.test(five)) out.fiveMinConfirm = false;
  }

  const outcome = kv(t, "OUT");
  if (outcome) {
    const o = outcome.toUpperCase().replace(/\s+/g, "");
    if (o.includes("WIN")) out.dualOutcome = "WIN";
    else if (o.includes("LOSS")) out.dualOutcome = "LOSS";
    else if (o.includes("NOFILL") || o.includes("NO_FILL")) out.dualOutcome = "no fill";
  }

  const fill = kv(t, "FILL");
  if (fill) {
    const f = fill.toLowerCase();
    if (f.startsWith("yes") || f === "filled") out.fillStatus = "yes";
    else if (f === "no" || f.includes("nofill")) out.fillStatus = "no";
    else if (f.includes("no-arm") || f.includes("noarm") || f === "skip") out.fillStatus = "no-arm";
    else if (f.includes("armed") || f === "live") out.fillStatus = "no"; // armed not filled yet
  }

  const hasCore =
    out.direction != null ||
    out.vixPrevClose != null ||
    out.or30ratio != null ||
    out.atrPts != null ||
    out.stopPts != null;
  out.confidence = hasCore && (out.pathBGrade != null || out.sleeve === "leave" || out.dualOutcome != null)
    ? "high"
    : hasCore
      ? "low"
      : "none";
  return out;
}

/** Extract Dual46 fields from free text (OCR dump or copied label). */
export function parseDual46Tag(raw: string): ParsedDual46Tag {
  if (!raw || !raw.trim()) return { confidence: "none" };

  const card = parseJournalCard(raw);
  if (card.confidence !== "none") {
    // Also try to recover plan tokens if TAG was mangled
    if (!card.pathBGrade || !card.pathBModel) {
      const planBits = parsePlanOnly(raw);
      if (!card.pathBModel && planBits.pathBModel) card.pathBModel = planBits.pathBModel;
      if (!card.pathBGrade && planBits.pathBGrade) card.pathBGrade = planBits.pathBGrade;
      if (!card.direction && planBits.direction) card.direction = planBits.direction;
      if (!card.planRr && planBits.planRr != null) card.planRr = planBits.planRr;
      if (!card.dualOutcome && planBits.dualOutcome) card.dualOutcome = planBits.dualOutcome;
    }
    return card;
  }

  return parsePlanOnly(raw);
}

function parsePlanOnly(raw: string): ParsedDual46Tag {
  const t = normalize(raw);
  const out: ParsedDual46Tag = { confidence: "none" };

  // Plan label — allow OCR junk between tokens
  const plan =
    /\b(LONG|SHORT)\b[\s·.\-]{0,6}Powell[\s·.\-]{0,6}(Cont|Judas)?[\s·.\-]{0,6}(?:1\s*|5\s*)?RB[\s·.\-]{0,6}(OTE\s*\+?\s*KO|OTE\+KO|OTEKO|OTE|KO)[\s·.\-]{0,6}(?:1\s*[:：]\s*([\d.]+))?[\s·.\-]{0,8}(SHADOW)?[\s·.\-]{0,6}(WIN|LOSS|NO\s*FILL)?/i.exec(
      t
    );

  if (plan) {
    out.matched = plan[0];
    out.direction = plan[1].toUpperCase() === "LONG" ? "long" : "short";
    out.sleeve = "powell";
    if (plan[2]) {
      const m = plan[2].toLowerCase();
      out.pathBModel = m.startsWith("jud") ? "Judas" : "Cont";
    }
    const g = parseGrade(plan[3]);
    if (g) out.pathBGrade = g;
    if (plan[4]) {
      const rr = parseFloat(plan[4]);
      if (Number.isFinite(rr)) out.planRr = rr;
    }
    if (plan[5]) out.shadow = true;
    if (plan[6]) {
      const o = plan[6].toUpperCase().replace(/\s+/g, " ");
      if (o.includes("WIN")) out.dualOutcome = "WIN";
      else if (o.includes("LOSS")) out.dualOutcome = "LOSS";
      else if (o.includes("FILL")) out.dualOutcome = "no fill";
    }
    out.confidence = out.direction && out.pathBGrade ? "high" : "low";
  } else if (/\bPowell\b/i.test(t) && /\b(LONG|SHORT)\b/i.test(t)) {
    // Partial: side + Powell without full stack
    const side = /\b(LONG|SHORT)\b/i.exec(t);
    if (side) out.direction = side[1].toUpperCase() === "LONG" ? "long" : "short";
    if (/\bCont\b/i.test(t)) out.pathBModel = "Cont";
    if (/\bJudas\b/i.test(t)) out.pathBModel = "Judas";
    const g = /\b(OTE\s*\+?\s*KO|OTE|KO)\b/i.exec(t);
    if (g) out.pathBGrade = parseGrade(g[1]);
    const rr = /1\s*[:：]\s*([\d.]+)/i.exec(t);
    if (rr) out.planRr = parseFloat(rr[1]);
    if (/\bWIN\b/i.test(t)) out.dualOutcome = "WIN";
    if (/\bLOSS\b/i.test(t)) out.dualOutcome = "LOSS";
    if (/\bSHADOW\b/i.test(t)) out.shadow = true;
    out.sleeve = "powell";
    out.confidence = out.direction ? "low" : "none";
  } else if (/\bleave\b/i.test(t) && /\b(LONG|SHORT)\b/i.test(t)) {
    const side = /\b(LONG|SHORT)\b/i.exec(t);
    if (side) out.direction = side[1].toUpperCase() === "LONG" ? "long" : "short";
    out.sleeve = "leave";
    out.confidence = out.direction ? "low" : "none";
  }

  // Stop / TP pt labels near the plan ("-19.8 pt", "+100 pt")
  const negPts = [...t.matchAll(/-\s*([\d.]+)\s*pt/gi)].map((m) => parseFloat(m[1]));
  const posPts = [...t.matchAll(/\+\s*([\d.]+)\s*pt/gi)].map((m) => parseFloat(m[1]));
  if (negPts.length && out.stopPts == null) {
    out.stopPts = negPts[0];
  }
  if (posPts.length && out.tpPts == null) {
    out.tpPts = posPts[0];
  }
  // If RR missing but stop+tp present
  if (out.planRr == null && out.stopPts && out.tpPts && out.stopPts > 0) {
    out.planRr = Math.round((out.tpPts / out.stopPts) * 10) / 10;
  }

  return out;
}

export function parsedToSummary(p: ParsedDual46Tag): string {
  if (p.confidence === "none") return "No Dual46 tag found";
  const bits = [
    p.direction?.toUpperCase(),
    p.sleeve === "leave" ? "leave" : p.pathBModel,
    p.pathBGrade,
    p.planRr != null ? `1:${p.planRr}` : null,
    p.dualOutcome,
    p.stopPts != null ? `stop ${p.stopPts}` : null,
    p.vixPrevClose != null ? `VIX ${p.vixPrevClose}` : null,
    p.or30ratio != null ? `OR30 ${p.or30ratio}` : null,
    p.atrPts != null ? `ATR ${p.atrPts}` : null,
    p.mfeR != null ? `MFE ${p.mfeR}R` : null,
    p.fiveMinConfirm === true ? "5m Y" : p.fiveMinConfirm === false ? "5m N" : null,
    p.shadow ? "SHADOW" : null,
  ].filter(Boolean);
  return bits.join(" · ");
}

/** YYYYMMDD int → YYYY-MM-DD for journal date field. */
export function ymdToDateStr(ymd: number): string | undefined {
  const s = String(ymd);
  if (!/^\d{8}$/.test(s)) return undefined;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
