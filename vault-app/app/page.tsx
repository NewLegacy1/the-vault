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

/**
 * Today = account pulse + jump to Journal.
 * Pre-trade / Path B fields live on Journal → MSv46 live (one place).
 */
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
    (j) => j.date === day && (j.strategy === "MSv46" || j.strategy === "ForwardDisc")
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
              : "F2 Accounts — add Apex"}
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
          <div className={"v " + (payouts - fees >= 0 ? "pos" : "neg")}>
            {fmtUsd(payouts - fees, true)}
          </div>
          <div className="d">fees vs payouts</div>
        </div>
        <div className="stat">
          <div className="k">Logged today</div>
          <div className="v">{liveToday.length}</div>
          <div className="d">{dualToday.length} Dual46 study</div>
        </div>
      </div>

      {apexIntra && active?.phase === "eval" && (
        <div className="panel">
          <div className="panel-body warn" style={{ lineHeight: 1.5 }}>
            <b>Apex $50K Intraday</b> — $3k target · <b>$2k intraday trail</b> (peak incl. open P&L) ·
            no DLL. Don&apos;t let a runner give back into the floor.
          </div>
        </div>
      )}

      {isMonday && (
        <div className="panel">
          <div className="panel-body warn">Monday — tag it in the journal notes if you take live.</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">
          Journal
          <span className="sub">one place for bias · Path B · fills · Apex P&amp;L</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.55 }}>
            <b>MSv46 live</b> — Apex / prop takes (week + day bias, Cont/Judas, grade, stop, R,
            outcome). <b>Dual46 study</b> — May replay only. Don&apos;t mix scorecards.
          </p>
          <Link href="/journal" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Open Journal →
          </Link>
          {liveToday.length > 0 && (
            <ul className="small mt" style={{ paddingLeft: 16 }}>
              {liveToday.map((j) => (
                <li key={j.id}>
                  {j.direction.toUpperCase()} · {j.structureTag ?? j.strategy ?? "—"} ·{" "}
                  {j.dualOutcome ?? "—"} · {fmtUsd(j.pnl, true)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
