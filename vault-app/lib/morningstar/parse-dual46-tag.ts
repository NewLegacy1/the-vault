/**
 * Parse Morningstar v46 plan labels / KPI text from OCR or clipboard.
 * Example: "LONG · Powell · Cont · 1RB · OTE+KO · 1:5 WIN"
 * Fuzzy: OCR often turns · into . | - or spaces.
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

/** Extract Dual46 fields from free text (OCR dump or copied label). */
export function parseDual46Tag(raw: string): ParsedDual46Tag {
  if (!raw || !raw.trim()) return { confidence: "none" };
  const t = normalize(raw);
  const out: ParsedDual46Tag = { confidence: "none" };

  // Plan label — allow OCR junk between tokens
  const plan =
    /\b(LONG|SHORT)\b[\s·.\-]{0,6}Powell[\s·.\-]{0,6}(Cont|Judas)?[\s·.\-]{0,6}(?:1\s*)?RB[\s·.\-]{0,6}(OTE\s*\+?\s*KO|OTE\+KO|OTEKO|OTE|KO)[\s·.\-]{0,6}(?:1\s*[:：]\s*([\d.]+))?[\s·.\-]{0,8}(SHADOW)?[\s·.\-]{0,6}(WIN|LOSS|NO\s*FILL)?/i.exec(
      t
    );

  if (plan) {
    out.matched = plan[0];
    out.direction = plan[1].toUpperCase() === "LONG" ? "long" : "short";
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
    p.pathBModel,
    p.pathBGrade,
    p.planRr != null ? `1:${p.planRr}` : null,
    p.dualOutcome,
    p.stopPts != null ? `stop ${p.stopPts}` : null,
    p.shadow ? "SHADOW" : null,
  ].filter(Boolean);
  return bits.join(" · ");
}
