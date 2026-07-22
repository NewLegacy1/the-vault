"use client";

import { useMemo, useState } from "react";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import {
  Account, LedgerEntry, JournalEntry, LedgerType, Phase,
  LEDGER_LABELS, isCost, isPaperAccount, makePaperAccount, uid,
} from "@/lib/types";
import { PROP_RULES, ruleById } from "@/lib/prop-firms";
import { PropRulePhaseId } from "@/lib/prop-phase-types";
import { phaseDetailRows, suggestedPhaseTab, transitionChecklist } from "@/lib/prop-rulebook";

const PHASES: Phase[] = ["paper", "eval", "funded", "passed", "blown", "retired"];
const LEDGER_TYPES: LedgerType[] = [
  "eval_fee", "reset_fee", "activation_fee", "monthly_fee", "data_fee", "payout", "other",
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useLocal<Account[]>("vault.accounts", []);
  const [ledger, setLedger] = useLocal<LedgerEntry[]>("vault.ledger", []);
  const [journal] = useLocal<JournalEntry[]>("vault.journal", []);
  const [activeId, setActiveId] = useLocal<string>("vault.activeAccount", "");

  // new-account form
  const [nLabel, setNLabel] = useState("");
  const [nRule, setNRule] = useState(PROP_RULES[0].id);
  const [nFee, setNFee] = useState("");

  // ledger form
  const [lAcct, setLAcct] = useState("");
  const [lType, setLType] = useState<LedgerType>("monthly_fee");
  const [lAmount, setLAmount] = useState("");
  const [lNote, setLNote] = useState("");

  const addPaperAccount = () => {
    const existing = accounts.find(isPaperAccount);
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const acct = makePaperAccount("Paper / forward test", todayStr());
    setAccounts([...accounts, acct]);
    setActiveId(acct.id);
  };

  const addApex50IntradayEval = () => {
    const rule = ruleById("apex50-intraday");
    if (!rule) return;
    const existing = accounts.find(
      (a) => a.ruleId === "apex50-intraday" && a.phase === "eval" && a.firm === rule.firm
    );
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const acct: Account = {
      id: uid(),
      firm: rule.firm,
      label: "Apex 50K Intraday eval",
      size: rule.size,
      phase: "eval",
      startDate: todayStr(),
      ruleId: rule.id,
      currentBalance: rule.size,
      notes: "Intraday $2k trail · $3k target · no DLL · no eval consistency",
    };
    setAccounts([...accounts, acct]);
    setActiveId(acct.id);
  };

  const addAccount = () => {
    const rule = ruleById(nRule);
    if (!rule || !nLabel.trim()) return;
    const acct: Account = {
      id: uid(),
      firm: rule.firm,
      label: nLabel.trim(),
      size: rule.size,
      phase: "eval",
      startDate: todayStr(),
      ruleId: rule.id,
      currentBalance: rule.size,
      notes: "",
    };
    const entries: LedgerEntry[] = [];
    const fee = parseFloat(nFee);
    if (Number.isFinite(fee) && fee > 0) {
      entries.push({ id: uid(), accountId: acct.id, date: todayStr(), type: "eval_fee", amount: fee, note: "initial eval fee" });
    }
    setAccounts([...accounts, acct]);
    if (entries.length) setLedger([...ledger, ...entries]);
    if (!activeId) setActiveId(acct.id);
    setNLabel(""); setNFee("");
  };

  const addLedger = () => {
    const amt = parseFloat(lAmount);
    if (!lAcct || !Number.isFinite(amt) || amt <= 0) return;
    setLedger([...ledger, { id: uid(), accountId: lAcct, date: todayStr(), type: lType, amount: amt, note: lNote }]);
    setLAmount(""); setLNote("");
  };

  const updateAccount = (id: string, patch: Partial<Account>) =>
    setAccounts(accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const acctFees = (id: string) => ledger.filter((l) => l.accountId === id && isCost(l.type)).reduce((s, l) => s + l.amount, 0);
  const acctPayouts = (id: string) => ledger.filter((l) => l.accountId === id && l.type === "payout").reduce((s, l) => s + l.amount, 0);
  const acctTradePnl = (id: string) => journal.filter((j) => j.accountId === id).reduce((s, j) => s + j.pnl, 0);

  const totalFees = ledger.filter((l) => isCost(l.type)).reduce((s, l) => s + l.amount, 0);
  const totalPayouts = ledger.filter((l) => l.type === "payout").reduce((s, l) => s + l.amount, 0);

  const activeAccount = accounts.find((a) => a.id === activeId);
  const activeRule = activeAccount ? ruleById(activeAccount.ruleId) : undefined;
  const [rulebookId, setRulebookId] = useState(PROP_RULES[0].id);
  const [phaseTab, setPhaseTab] = useState<PropRulePhaseId | "transition">("eval");

  const displayRuleId = activeRule?.id ?? rulebookId;
  const displayRule = ruleById(displayRuleId) ?? PROP_RULES[0];

  const suggestedTab = activeAccount ? suggestedPhaseTab(activeAccount.phase) : "eval";

  const activePhase = useMemo(() => {
    if (phaseTab === "transition") return null;
    return displayRule.phases.find((p) => p.id === phaseTab) ?? displayRule.phases[0];
  }, [displayRule, phaseTab]);

  const phaseTabs = useMemo(() => {
    const tabs: { id: PropRulePhaseId | "transition"; label: string }[] = displayRule.phases.map((p) => ({
      id: p.id,
      label: p.shortLabel,
    }));
    tabs.push({ id: "transition", label: "PASS → FUNDED" });
    return tabs;
  }, [displayRule]);

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Total spent (all fees)</div>
          <div className="v neg">{fmtUsd(totalFees)}</div>
        </div>
        <div className="stat">
          <div className="k">Total payouts</div>
          <div className="v pos">{fmtUsd(totalPayouts)}</div>
        </div>
        <div className="stat">
          <div className="k">NET CASH P&L</div>
          <div className={"v " + (totalPayouts - totalFees >= 0 ? "pos" : "neg")}>
            {fmtUsd(totalPayouts - totalFees, true)}
          </div>
          <div className="d">payouts − every dollar sent to prop firms</div>
        </div>
        <div className="stat">
          <div className="k">Accounts</div>
          <div className="v">{accounts.length}</div>
          <div className="d">{accounts.filter((a) => a.phase === "funded").length} funded</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Accounts <span className="sub">radio = active account (tags journal + Today page)</span></div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Active</th><th>Label</th><th>Firm / rules</th><th>Phase</th>
                <th className="num">Balance</th><th className="num">DD headroom</th>
                <th className="num">Trade P&L</th><th className="num">Fees</th>
                <th className="num">Payouts</th><th className="num">Net cash</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const rule = ruleById(a.ruleId);
                const paper = isPaperAccount(a);
                const fees = acctFees(a.id);
                const pays = acctPayouts(a.id);
                const pnl = acctTradePnl(a.id);
                const headroom =
                  !paper && rule
                    ? a.currentBalance - (Math.max(a.currentBalance, a.size) - rule.trailingDD)
                    : null;
                return (
                  <tr key={a.id}>
                    <td>
                      <input type="radio" name="active" checked={activeId === a.id} onChange={() => setActiveId(a.id)} />
                    </td>
                    <td className="accent">
                      {a.label}
                      {paper && <span className="dim"> · paper</span>}
                    </td>
                    <td className="small">
                      {paper ? "Paper / forward test" : rule ? rule.name : a.firm}
                      {rule && !rule.verified && <span className="warn"> (verify)</span>}
                    </td>
                    <td>
                      <select value={a.phase} onChange={(e) => updateAccount(a.id, { phase: e.target.value as Phase })}>
                        {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="num">
                      <input
                        style={{ width: 90, textAlign: "right" }}
                        type="number"
                        value={a.currentBalance}
                        onChange={(e) => updateAccount(a.id, { currentBalance: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td className={"num " + (headroom !== null && headroom < 800 ? "neg" : "")}>
                      {headroom !== null ? fmtUsd(headroom) : "—"}
                    </td>
                    <td className={"num " + (pnl >= 0 ? "pos" : "neg")}>{fmtUsd(pnl, true)}</td>
                    <td className="num neg">{fmtUsd(fees)}</td>
                    <td className="num pos">{fmtUsd(pays)}</td>
                    <td className={"num " + (pays - fees >= 0 ? "pos" : "neg")}>{fmtUsd(pays - fees, true)}</td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr><td colSpan={10} className="dim">No accounts yet — add a paper / forward test or a TPT eval below.</td></tr>
              )}
            </tbody>
          </table>

          <hr className="hr" />
          <div className="frm-row">
            <button type="button" className="btn" onClick={addPaperAccount}>
              Add paper / forward test
            </button>
            <button type="button" className="btn" onClick={addApex50IntradayEval}>
              Add Apex $50K Intraday eval
            </button>
            <span className="small dim" style={{ alignSelf: "center" }}>
              Apex: $3k target · $2k intraday trail · no DLL — sets active for Journal Live
            </span>
          </div>
          <div className="frm-row mt">
            <label className="fld">Label
              <input value={nLabel} onChange={(e) => setNLabel(e.target.value)} placeholder="TPT 50K #1" />
            </label>
            <label className="fld">Firm preset
              <select value={nRule} onChange={(e) => setNRule(e.target.value)}>
                {PROP_RULES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label className="fld">Eval fee (optional)
              <input type="number" value={nFee} onChange={(e) => setNFee(e.target.value)} placeholder="e.g. 170" style={{ width: 100 }} />
            </label>
            <button className="btn" onClick={addAccount}>Add prop account</button>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">Fee / payout ledger</div>
          <div className="panel-body">
            <div className="frm-row">
              <label className="fld">Account
                <select value={lAcct} onChange={(e) => setLAcct(e.target.value)}>
                  <option value="">—</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </label>
              <label className="fld">Type
                <select value={lType} onChange={(e) => setLType(e.target.value as LedgerType)}>
                  {LEDGER_TYPES.map((t) => <option key={t} value={t}>{LEDGER_LABELS[t]}</option>)}
                </select>
              </label>
              <label className="fld">Amount $
                <input type="number" value={lAmount} onChange={(e) => setLAmount(e.target.value)} style={{ width: 90 }} />
              </label>
              <label className="fld">Note
                <input value={lNote} onChange={(e) => setLNote(e.target.value)} placeholder="optional" />
              </label>
              <button className="btn" onClick={addLedger}>Add</button>
            </div>
            <table>
              <thead>
                <tr><th>Date</th><th>Account</th><th>Type</th><th className="num">Amount</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                {[...ledger].reverse().map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{accounts.find((a) => a.id === l.accountId)?.label ?? "?"}</td>
                    <td className={l.type === "payout" ? "pos" : ""}>{LEDGER_LABELS[l.type]}</td>
                    <td className={"num " + (l.type === "payout" ? "pos" : "neg")}>
                      {l.type === "payout" ? "+" : "−"}{fmtUsd(l.amount)}
                    </td>
                    <td className="small dim">{l.note}</td>
                    <td>
                      <button className="btn danger" style={{ padding: "1px 7px" }}
                        onClick={() => setLedger(ledger.filter((x) => x.id !== l.id))}>x</button>
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && <tr><td colSpan={6} className="dim">Empty — log eval fees, resets, monthly costs, payouts.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            Phase rulebook
            <span className="sub">
              eval vs funded vs payout — rules change when you pass
              {activeAccount ? ` · linked: ${activeAccount.label}` : ""}
            </span>
          </div>
          <div className="panel-body">
            <div className="frm-row" style={{ marginBottom: 12 }}>
              <label className="fld">
                Firm / plan
                <select
                  value={displayRuleId}
                  onChange={(e) => {
                    setRulebookId(e.target.value);
                    setPhaseTab("eval");
                  }}
                >
                  {PROP_RULES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              {activeAccount && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => setPhaseTab(suggestedTab === "transition" ? "transition" : suggestedTab)}
                >
                  Jump to {activeAccount.phase} rules
                </button>
              )}
            </div>

            <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {phaseTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip ${phaseTab === t.id ? "locked" : ""} ${t.id === suggestedTab ? "warn-chip" : ""}`}
                  onClick={() => setPhaseTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {phaseTab === "transition" ? (
              <>
                <p className="small accent" style={{ marginTop: 0 }}>
                  Checklist before moving eval → funded ({displayRule.firm})
                </p>
                <ul className="small" style={{ lineHeight: 1.65, paddingLeft: 18 }}>
                  {transitionChecklist(displayRule).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {displayRule.phases.find((p) => p.id === "funded")?.criticalWarnings.map((w) => (
                  <p key={w} className="small warn mt">
                    {w}
                  </p>
                ))}
              </>
            ) : activePhase ? (
              <>
                <p className="small accent" style={{ marginTop: 0 }}>
                  {activePhase.label}
                  {displayRule.lastReviewed && (
                    <span className="dim"> · reviewed {displayRule.lastReviewed}</span>
                  )}
                </p>
                <table className="kv-table">
                  <tbody>
                    {phaseDetailRows(activePhase).map((row) => (
                      <tr key={row.label}>
                        <td className="dim" style={{ width: "38%" }}>
                          {row.label}
                        </td>
                        <td className={row.warn ? "warn" : ""}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {activePhase.criticalWarnings.length > 0 && (
                  <>
                    <div className="accent small mt" style={{ letterSpacing: 1 }}>
                      CRITICAL FOR PRB
                    </div>
                    <ul className="small warn" style={{ lineHeight: 1.6, paddingLeft: 18 }}>
                      {activePhase.criticalWarnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </>
                )}

                {activePhase.notes && activePhase.notes.length > 0 && (
                  <ul className="small dim mt" style={{ lineHeight: 1.6, paddingLeft: 18 }}>
                    {activePhase.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}

                {activePhase.payout && activePhase.payout.extras.length > 0 && (
                  <>
                    <div className="accent small mt" style={{ letterSpacing: 1 }}>
                      PAYOUT EXTRAS
                    </div>
                    <ul className="small dim" style={{ lineHeight: 1.6, paddingLeft: 18 }}>
                      {activePhase.payout.extras.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </>
                )}

                {activePhase.source && (
                  <p className="small dim mt">Source: {activePhase.source}</p>
                )}
              </>
            ) : null}

            <hr className="hr" />
            <p className="small dim" style={{ lineHeight: 1.6, marginBottom: 0 }}>
              Vault MC (F4 LAB) uses <strong>eval-phase</strong> pass line ({fmtUsd(displayRule.passAt)}) and{" "}
              {fmtUsd(displayRule.trailingDD)} {displayRule.ddMode.toUpperCase()} DD only. Funded intraday trail and
              payout gates are not simulated — read this panel before going live on PRO.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Eval quick compare <span className="sub">MC uses eval row only</span></div>
          <div className="panel-body">
            <table>
              <thead>
                <tr>
                  <th>Firm / plan</th>
                  <th className="num">Target</th>
                  <th className="num">Pass at</th>
                  <th className="num">Trail DD</th>
                  <th>Mode</th>
                  <th className="num">DLL</th>
                  <th>Consistency</th>
                </tr>
              </thead>
              <tbody>
                {PROP_RULES.map((r) => (
                  <tr key={r.id}>
                    <td className="small">{r.name}</td>
                    <td className="num">{fmtUsd(r.profitTarget)}</td>
                    <td className="num accent">{fmtUsd(r.passAt)}</td>
                    <td className="num">{fmtUsd(r.trailingDD)}</td>
                    <td>{r.ddMode.toUpperCase()}</td>
                    <td className="num">{r.dailyLossLimit ? fmtUsd(r.dailyLossLimit) : "—"}</td>
                    <td className="small">{r.consistencyPct > 0 ? `${r.consistencyPct}% eval` : "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr className="hr" />
            <div className="small dim">
              Select an account above to highlight the phase tab for its current status. TPT: eval consistency
              applies at PRO request; funded PRO has no payout consistency but requires $52K buffer. Topstep: funded
              payout path (Standard vs Consistency) is chosen once at activation.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
