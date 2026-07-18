"use client";

import Link from "next/link";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import { Account, JournalEntry, LedgerEntry, MORNINGSTAR_STUDY_ID, isCost } from "@/lib/types";
import { ruleById } from "@/lib/prop-firms";

/** Today = account pulse + jump to Journal. Dual46 study lives only on /journal. */
export default function TodayPage() {
  const day = todayStr();
  const [accounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId] = useLocal<string>("vault.activeAccount", "");
  const [ledger] = useLocal<LedgerEntry[]>("vault.ledger", []);
  const [journal] = useLocal<JournalEntry[]>("vault.journal", []);

  const active = accounts.find((a) => a.id === activeId);
  const rule = active ? ruleById(active.ruleId) : undefined;
  const fees = ledger.filter((l) => isCost(l.type)).reduce((s, l) => s + l.amount, 0);
  const payouts = ledger.filter((l) => l.type === "payout").reduce((s, l) => s + l.amount, 0);
  const acctPnl = active
    ? journal.filter((j) => j.accountId === active.id).reduce((s, j) => s + j.pnl, 0)
    : 0;
  const toTarget = active && rule ? rule.passAt - acctPnl : null;

  const dualToday = journal.filter(
    (j) =>
      j.date === day &&
      (j.dualVersion === "Dual46" ||
        j.accountId === MORNINGSTAR_STUDY_ID ||
        j.strategy === "Morningstar")
  );
  const isMonday = new Date().getDay() === 1;

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Active account</div>
          <div className="v accent">{active ? active.label : "NONE SET"}</div>
          <div className="d">{active ? `${active.firm} · ${active.phase.toUpperCase()}` : "F2 Accounts"}</div>
        </div>
        <div className="stat">
          <div className="k">Acct P&L</div>
          <div className={"v " + (acctPnl >= 0 ? "pos" : "neg")}>{fmtUsd(acctPnl, true)}</div>
          <div className="d">
            {toTarget != null ? `to target ${fmtUsd(Math.max(0, toTarget))}` : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="k">Net cash</div>
          <div className={"v " + (payouts - fees >= 0 ? "pos" : "neg")}>{fmtUsd(payouts - fees, true)}</div>
          <div className="d">all firms</div>
        </div>
        <div className="stat">
          <div className="k">Dual46 today</div>
          <div className="v">{dualToday.length}</div>
          <div className="d">{day}</div>
        </div>
      </div>

      {isMonday && (
        <div className="panel">
          <div className="panel-body warn">MONDAY — Dual46 SHADOW only. Log in Journal if studying; don&apos;t take live.</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">
          Dual46 study <span className="sub">all logging is on one page</span>
        </div>
        <div className="panel-body">
          <p className="small dim" style={{ marginTop: 0, lineHeight: 1.55 }}>
            Checklist + chart paste + auto tag read + review live on{" "}
            <Link href="/journal">
              <b>F5 Journal</b>
            </Link>
            . Paste a TradingView snap — we pull LONG/SHORT · Cont/Judas · OTE+KO · RR · WIN/LOSS from the
            plan label.
          </p>
          <Link href="/journal" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Open Journal →
          </Link>
          {dualToday.length > 0 && (
            <ul className="small mt" style={{ paddingLeft: 16 }}>
              {dualToday.map((j) => (
                <li key={j.id}>
                  {j.direction.toUpperCase()} · {j.structureTag ?? "—"} · {j.dualOutcome ?? "—"}
                  {j.chartShot ? " · 📷" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
