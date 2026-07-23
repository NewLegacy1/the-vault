"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MSV46_LIVE_2026_07_23_END_BALANCE,
  MSV46_LIVE_2026_07_23_IDS,
  buildMsv46Live20260723Entries,
  findApex50LiveAccount,
} from "@/lib/msv46-live-2026-07-23";
import type { Account, JournalEntry } from "@/lib/types";

type Status =
  | { kind: "working" }
  | { kind: "ok"; accountLabel: string; accountId: string; upserted: number; balance: number }
  | { kind: "err"; message: string };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function InjectMsv46Live20260723Page() {
  const [status, setStatus] = useState<Status>({ kind: "working" });

  useEffect(() => {
    try {
      const accounts = readJson<Account[]>("vault.accounts", []);
      const acct = findApex50LiveAccount(accounts);
      if (!acct) {
        setStatus({
          kind: "err",
          message:
            "No Apex account in this browser. Open Accounts → Add Apex $50K Intraday eval (or your funded book), then reload this page.",
        });
        return;
      }

      const journal = readJson<JournalEntry[]>("vault.journal", []);
      const incoming = buildMsv46Live20260723Entries(acct.id);
      const byId = new Map(journal.map((j) => [j.id, j]));
      let upserted = 0;
      for (const row of incoming) {
        const prev = byId.get(row.id);
        if (!prev) upserted += 1;
        byId.set(row.id, row);
      }
      const nextJournal = [...byId.values()];
      localStorage.setItem("vault.journal", JSON.stringify(nextJournal));

      const nextAccounts = accounts.map((a) =>
        a.id === acct.id ? { ...a, currentBalance: MSV46_LIVE_2026_07_23_END_BALANCE } : a
      );
      localStorage.setItem("vault.accounts", JSON.stringify(nextAccounts));
      localStorage.setItem("vault.activeAccount", JSON.stringify(acct.id));

      setStatus({
        kind: "ok",
        accountLabel: acct.label,
        accountId: acct.id,
        upserted,
        balance: MSV46_LIVE_2026_07_23_END_BALANCE,
      });
    } catch (e) {
      setStatus({
        kind: "err",
        message: e instanceof Error ? e.message : "Inject failed",
      });
    }
  }, []);

  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Inject · MSv46 live 2026-07-23</h1>
      <p style={{ color: "#888", fontSize: 14, lineHeight: 1.5 }}>
        Writes 4 Tradovate broker fills into <code>vault.journal</code> under your Apex account
        in <b>this</b> browser&apos;s localStorage. Ids:{" "}
        {MSV46_LIVE_2026_07_23_IDS.join(", ")}.
      </p>

      {status.kind === "working" && <p>Writing…</p>}

      {status.kind === "err" && (
        <p style={{ color: "#c44", lineHeight: 1.5 }}>{status.message}</p>
      )}

      {status.kind === "ok" && (
        <div style={{ lineHeight: 1.6 }}>
          <p style={{ color: "#3a3" }}>
            Done · <b>{status.accountLabel}</b> ({status.accountId.slice(0, 8)}…) · upserted{" "}
            {status.upserted} new / refreshed 4 · balance → ${status.balance.toLocaleString()}
          </p>
          <p>
            <Link href="/journal">Open Journal →</Link> · mode <b>MSv46 live</b> · that account
          </p>
          <p style={{ color: "#888", fontSize: 13 }}>
            Gross path −$695 / +$7.50 / −$275 / +$1,095 · net cash +$96.10 after fees. T1–T3 disc ·
            T4 script Cont/OTE.
          </p>
        </div>
      )}
    </main>
  );
}
