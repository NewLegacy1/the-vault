/**
 * Paste into DevTools Console on the LIVE Vault site (same origin as your journal).
 * Upserts 4 Tradovate fills for 2026-07-23 under your Apex account.
 * Winner (T4) is tagged entrySource: "script" · Cont · OTE.
 *
 * Usage: open live app → F12 → Console → paste all → Enter → reload Journal.
 */
(() => {
  const END = 50096.1;
  const IDS = [
    "msv46-20260723-t1",
    "msv46-20260723-t2",
    "msv46-20260723-t3",
    "msv46-20260723-t4",
  ];
  const MARKER = "tradovate csv 2026-07-23";

  const accounts = JSON.parse(localStorage.getItem("vault.accounts") || "[]");
  const apex =
    accounts.find((a) => /apex/i.test(a.firm + a.label) && a.phase === "funded") ||
    accounts.find((a) => a.ruleId === "apex50-intraday") ||
    accounts.find((a) => /apex/i.test(a.firm + a.label));
  if (!apex) return "NO APEX ACCOUNT — add it on Accounts first";

  const loggedAt = new Date().toISOString();
  const date = "2026-07-23";
  const accountId = apex.id;

  const rows = [
    {
      id: IDS[0],
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
      notes: `${MARKER} · T1 disc · mkt 28734 → SL 28699.25 · −34.75pt −$695 · missed limit · chart scale · stop invisible`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · wide RB · market entry",
    },
    {
      id: IDS[1],
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
      notes: `${MARKER} · T2 disc · 5-lot TP mis-set · 28739.75 → 28740.5 · +$7.50 · ticket error`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · ½ risk · TP ticket error",
    },
    {
      id: IDS[2],
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
      notes: `${MARKER} · T3 disc · short 28708.5 → SL 28722.25 · −$275 · no RB · against bias`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "disc · fade · no RB",
    },
    {
      id: IDS[3],
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
      notes: `${MARKER} · T4 SCRIPT · lmt 28699 → TP 28753.75 · +54.75pt +$1095 · Powell Cont 1RB OTE · net +$96.10 end $50096.10`,
      strategy: "MSv46",
      structureTf: "chart",
      structureTag: "Powell · Cont · 1RB · OTE",
    },
  ];

  const journal = JSON.parse(localStorage.getItem("vault.journal") || "[]");
  const map = new Map(journal.map((j) => [j.id, j]));
  for (const r of rows) map.set(r.id, r);
  localStorage.setItem("vault.journal", JSON.stringify([...map.values()]));

  const nextAccounts = accounts.map((a) =>
    a.id === apex.id ? { ...a, currentBalance: END } : a
  );
  localStorage.setItem("vault.accounts", JSON.stringify(nextAccounts));
  localStorage.setItem("vault.activeAccount", JSON.stringify(apex.id));

  return {
    ok: true,
    account: apex.label,
    winner: {
      id: IDS[3],
      entrySource: "script",
      tag: "Powell · Cont · 1RB · OTE",
      pnl: 1095,
      dualOutcome: "WIN",
    },
    tip: "Reload Journal → Mode MSv46 live → confirm Src column shows script on the winner",
  };
})();
