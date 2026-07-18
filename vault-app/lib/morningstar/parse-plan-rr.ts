/**
 * Parse plan RR from journal input.
 * Users type "1:5", "1-5", "1 to 5", or just "5" — all mean reward multiple 5.
 * Bare parseFloat("1-5") / parseFloat("1:5") wrongly yields 1.
 */
export function parsePlanRr(raw: string): number | undefined {
  const s = raw.trim().toLowerCase().replace(/,/g, "");
  if (!s) return undefined;

  // 1:5 · 1：5 · 1-5 · 1–5 · 1 to 5 · 1/5 (slash as ratio, not division of 0.2)
  const ratio =
    /^1\s*[:：\-–—/]\s*(\d+(?:\.\d+)?)$/i.exec(s) ||
    /^1\s+to\s+(\d+(?:\.\d+)?)$/i.exec(s) ||
    /(?:^|\s)1\s*[:：\-–—/]\s*(\d+(?:\.\d+)?)(?:\s|$)/i.exec(s);
  if (ratio) {
    const n = parseFloat(ratio[1]);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  // Plain reward multiple: "5", "3.8", "2.5"
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  return undefined;
}

export function formatPlanRr(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `1:${n}`;
}
