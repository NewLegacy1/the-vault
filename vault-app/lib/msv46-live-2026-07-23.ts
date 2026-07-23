import type { Account, JournalEntry } from "./types";

/** Stable ids — re-running inject is a no-op / upsert. */
export const MSV46_LIVE_2026_07_23_IDS = [
  "msv46-20260723-t1",
  "msv46-20260723-t2",
  "msv46-20260723-t3",
  "msv46-20260723-t4",
] as const;

const MARKER = "tradovate csv 2026-07-23";

/** Pick Apex $50K live book (eval or funded). */
export function findApex50LiveAccount(accounts: Account[]): Account | undefined {
  const apex = accounts.filter(
    (a) =>
      /apex/i.test(a.firm) ||
      /apex/i.test(a.label) ||
      a.ruleId === "apex50-intraday"
  );
  return (
    apex.find((a) => a.phase === "funded") ||
    apex.find((a) => /50/.test(a.label) && (a.phase === "eval" || a.phase === "funded")) ||
    apex[0]
  );
}

export function buildMsv46Live20260723Entries(accountId: string): JournalEntry[] {
  const loggedAt = new Date().toISOString();
  const date = "2026-07-23";

  return [
    {
      id: MSV46_LIVE_2026_07_23_IDS[0],
      date,
      loggedAt,
      accountId,
      direction: "long",
      morningBias: "long",
      weekBias: "none",
      dayBias: "long",
      pathBModel: "—",
      pathBGrade: "—",
      stopPts: 34.75,
      planRr: 5,
      fillStatus: "converted",
      dualOutcome: "LOSS",
      entryTime: "10:10",
      entrySource: "disc",
      redFolder: "unknown",
      grade: "-",
      pnl: -695,
      rMultiple: -1,
      giveBack: false,
      checklistFails: "",
      notes: `${MARKER} · T1 disc · mkt 28734 → SL 28699.25 · −34.75pt −$695 · missed limit on wide RB · chart scaled wrong · stop invisible`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · wide RB · market entry",
    },
    {
      id: MSV46_LIVE_2026_07_23_IDS[1],
      date,
      loggedAt,
      accountId,
      direction: "long",
      morningBias: "long",
      weekBias: "none",
      dayBias: "long",
      pathBModel: "—",
      pathBGrade: "—",
      stopPts: 0.75,
      planRr: 1,
      fillStatus: "yes",
      dualOutcome: "WIN",
      entryTime: "10:11",
      entrySource: "disc",
      redFolder: "unknown",
      grade: "-",
      pnl: 7.5,
      rMultiple: 1,
      giveBack: false,
      checklistFails: "",
      notes: `${MARKER} · T2 disc · 5-lot (½ risk) mkt 28739.75 → TP 28740.5 in 1s · +0.75pt +$7.50 · TP mis-set on entry (ticket error, not a real trade)`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · ½ risk · TP ticket error",
    },
    {
      id: MSV46_LIVE_2026_07_23_IDS[2],
      date,
      loggedAt,
      accountId,
      direction: "short",
      morningBias: "long",
      weekBias: "none",
      dayBias: "long",
      pathBModel: "—",
      pathBGrade: "—",
      stopPts: 13.75,
      planRr: 5,
      fillStatus: "yes",
      dualOutcome: "LOSS",
      entryTime: "10:16",
      entrySource: "disc",
      redFolder: "unknown",
      grade: "-",
      pnl: -275,
      rMultiple: -1,
      giveBack: false,
      checklistFails: "counter_draw",
      skipReasons: ["counter_draw"],
      notes: `${MARKER} · T3 disc · short 28708.5 → SL 28722.25 · −13.75pt −$275 · no rejection block · fade retrace toward KO · against day bias`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · fade · no RB",
    },
    {
      id: MSV46_LIVE_2026_07_23_IDS[3],
      date,
      loggedAt,
      accountId,
      direction: "long",
      morningBias: "long",
      weekBias: "none",
      dayBias: "long",
      pathBModel: "Cont",
      pathBGrade: "OTE",
      stopPts: 11.3,
      planRr: 5,
      fillStatus: "yes",
      dualOutcome: "WIN",
      entryTime: "10:19",
      entrySource: "script",
      redFolder: "unknown",
      grade: "B",
      pnl: 1095,
      rMultiple: 5,
      giveBack: false,
      checklistFails: "",
      notes: `${MARKER} · T4 SCRIPT · lmt 28699 → TP 28753.75 · +54.75pt +$1,095 · Powell · Cont · 1RB · OTE · ~1:5 · clawed crash back · session gross +$132.50 · fees ~$36 → net +$96.10 · end $50,096.10`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "Powell · Cont · 1RB · OTE",
    },
  ];
}

export const MSV46_LIVE_2026_07_23_END_BALANCE = 50_096.1;
