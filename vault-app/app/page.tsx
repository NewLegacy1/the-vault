"use client";

import Link from "next/link";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import {
  Account,
  JournalEntry,
  LedgerEntry,
  MORNINGSTAR_STUDY_ID,
  isCost,
  isPaperAccount,
} from "@/lib/types";
import { ruleById } from "@/lib/prop-firms";
import { MsPretradeChecklist } from "@/components/MsPretradeChecklist";

/** Today = account pulse + MSv46 checklist. Dual46 study logging stays on /journal. */
export default function TodayPage() {
  const day = todayStr();
  const [accounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId] = useLocal<string>("vault.activeAccount", "");
  const [ledger] = useLocal<LedgerEntry[]>("vault.ledger", []);
  const [journal] = useLocal<JournalEntry[]>("vault.journal", []);

  const active = accounts.find((a) => a.id === activeId);
  const rule = active ? ruleById(active.ruleId) : undefined;
  const paper = active ? isPaperAccount(active) : false;
  const fees = ledger.filter((l) => isCost(l.type)).reduce((s, l) => s + l.amount, 0);
  const payouts = ledger.filter((l) => l.type === "payout").reduce((s, l) => s + l.amount, 0);
  const acctPnl = active
    ? journal.filter((j) => j.accountId === active.id).reduce((s, j) => s + j.pnl, 0)
    : 0;
  const toTarget = active && rule && !paper ? rule.passAt - acctPnl : null;

  const dualToday = journal.filter(
    (j) =>
      j.date === day &&
      (j.dualVersion === "Dual46" ||
        j.accountId === MORNINGSTAR_STUDY_ID ||
        j.strategy === "Morningstar")
  );
  const liveToday = journal.filter(
    (j) => j.date === day && j.strategy === "MSv46" && j.accountId === activeId
  );
  const isMonday = new Date().getDay() === 1;
  const apexIntra = active?.ruleId === "apex50-intraday";

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Active account</div>
          <div className="v accent">{active ? active.label : "NONE SET"}</div>
          <div className="d">
            {active
              ? `${active.firm} · ${active.phase.toUpperCase()}${paper ? " · paper" : ""}`
              : "F2 Accounts"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Acct P&L</div>
          <div className={"v " + (acctPnl >= 0 ? "pos" : "neg")}>{fmtUsd(acctPnl, true)}</div>
          <div className="d">
            {toTarget != null ? `to target ${fmtUsd(Math.max(0, toTarget))}` : paper ? "paper book" : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Net cash</div>
          <div className={"v " + (payouts - fees >= 0 ? "pos" : "neg")}>{fmtUsd(payouts - fees, true)}</div>
          <div className="d">all firms</div>
        </div>
        <div className="stat">
          <div className="k">MSv46 today</div>
          <div className="v">{liveToday.length}</div>
          <div className="d">{dualToday.length} Dual46 study</div>
        </div>
      </div>

      {apexIntra && active?.phase === "eval" && (
        <div className="panel">
          <div className="panel-body warn" style={{ lineHeight: 1.5 }}>
            <b>Apex $50K Intraday eval</b> — $3k target · <b>$2k intraday trail</b> (follows peak
            incl. open P&L) · <b>no DLL</b>. Do not let a runner give back into the floor.
          </div>
        </div>
      )}

      {isMonday && (
        <div className="panel">
          <div className="panel-body warn">
            MONDAY — Dual46 study SHADOW nuance still applies; live Apex is your call — tag Monday in
            notes.
          </div>
        </div>
      )}

      <MsPretradeChecklist />

      <div className="panel">
        <div className="panel-title">
          Log the take
          <span className="sub">checklist above → Journal MSv46 live on your Apex account</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.55 }}>
            After the checklist:{" "}
            <Link href="/journal">
              <b>F5 Journal</b>
            </Link>{" "}
            → mode <b>MSv46 live (prop)</b> → account = Apex 50K Intraday. Dual46 Path B study stays a
            separate mode for May replay.
          </p>
          <Link href="/journal" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Open Journal →
          </Link>
          {liveToday.length > 0 && (
            <ul className="small mt" style={{ paddingLeft: 16 }}>
              {liveToday.map((j) => (
                <li key={j.id}>
                  {j.direction.toUpperCase()} · {j.structureTag ?? "—"} · {j.dualOutcome ?? "—"} ·{" "}
                  {fmtUsd(j.pnl, true)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
