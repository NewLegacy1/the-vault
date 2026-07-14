"use client";

import Link from "next/link";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import { Account, JournalEntry, LedgerEntry, isCost } from "@/lib/types";
import { BIAS_TO_FILTER, FINDING_BIAS_FLOW, FINDING_BIAS_RULES } from "@/lib/finding-bias";
import { ruleById } from "@/lib/prop-firms";

interface ChkItem {
  id: string;
  text: string;
}

const BEFORE_10: ChkItem[] = [
  { id: "news", text: "News checked — red folder = skip or A+ only" },
  { id: "bias", text: "Bias + TV Direction match — set Long only / Short only / Both" },
  { id: "levels", text: "PDH · PDL · PM H/L on chart" },
];

const TAKE_IT: ChkItem[] = [
  { id: "draw", text: "Trade matches the draw" },
  { id: "liq", text: "Real sweep (PDH/PDL, PM, or key open)" },
  { id: "eqhl", text: "No unswept equal H/L in the way" },
  { id: "take", text: "I'd take it — if not, skip and log" },
];

const DONE: ChkItem[] = [
  { id: "be", text: "BE at +1R — don't move stop" },
  { id: "log", text: "Logged in Journal" },
];

function ChecklistSection({
  title,
  hint,
  items,
  storageKey,
}: {
  title: string;
  hint?: string;
  items: ChkItem[];
  storageKey: string;
}) {
  const [done, setDone] = useLocal<Record<string, boolean>>(storageKey, {});
  const checked = items.filter((it) => done[it.id]).length;
  const allDone = checked === items.length;

  const clear = () => setDone({});

  return (
    <div className="chk-section">
      <div className="chk-head">
        <div>
          <div className="chk-title">{title}</div>
          {hint && <div className="chk-hint">{hint}</div>}
        </div>
        <div className="chk-meta">
          <span className={allDone ? "pos" : "dim"}>
            {checked}/{items.length}
          </span>
          <button type="button" className="btn-ghost" onClick={clear}>
            Clear
          </button>
        </div>
      </div>
      <div className="chk-list">
        {items.map((it) => (
          <label key={it.id} className={"chk chk-lg" + (done[it.id] ? " done" : "")}>
            <input
              type="checkbox"
              checked={!!done[it.id]}
              onChange={(e) => setDone({ ...done, [it.id]: e.target.checked })}
            />
            <span className="chk-box" aria-hidden="true" />
            <span className="txt">{it.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

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
  const ddHeadroom =
    active && rule ? active.currentBalance - (Math.max(active.currentBalance, active.size) - rule.trailingDD) : null;
  const toTarget = active && rule ? rule.passAt - acctPnl : null;

  const isMonday = new Date().getDay() === 1;

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Active account</div>
          <div className="v accent">{active ? active.label : "NONE SET"}</div>
          <div className="d">{active ? `${active.firm} · ${active.phase.toUpperCase()}` : "Add one in F2 ACCOUNTS"}</div>
        </div>
        <div className="stat">
          <div className="k">Acct trading P&L</div>
          <div className={"v " + (acctPnl >= 0 ? "pos" : "neg")}>{fmtUsd(acctPnl, true)}</div>
          <div className="d">from journal entries</div>
        </div>
        <div className="stat">
          <div className="k">To profit target</div>
          <div className="v">{toTarget !== null ? fmtUsd(Math.max(0, toTarget)) : "—"}</div>
          <div className="d">{rule ? `pass line ${fmtUsd(rule.passAt)} · target ${fmtUsd(rule.profitTarget)}` : ""}</div>
        </div>
        <div className="stat">
          <div className="k">Net cash (all firms)</div>
          <div className={"v " + (payouts - fees >= 0 ? "pos" : "neg")}>{fmtUsd(payouts - fees, true)}</div>
          <div className="d">payouts {fmtUsd(payouts)} − fees {fmtUsd(fees)}</div>
        </div>
      </div>

      {isMonday && (
        <div className="panel">
          <div className="panel-body warn">MONDAY — locked config skips Mondays. No trades today.</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">
          Checklist <span className="sub">tap through · {day}</span>
        </div>
        <div className="panel-body chk-grid">
          <ChecklistSection
            title="Before 10:00"
            hint="~2 min"
            items={BEFORE_10}
            storageKey={`vault.chk.pre.${day}`}
          />
          <ChecklistSection
            title="Take it?"
            hint="when boxes arm · 2+ no = skip"
            items={TAKE_IT}
            storageKey={`vault.chk.setup.${day}`}
          />
          <ChecklistSection
            title="After"
            hint="in trade or flat"
            items={DONE}
            storageKey={`vault.chk.post.${day}`}
          />
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">Live config <span className="sub">PRB v1 · locked</span></div>
          <div className="panel-body">
            <div className="kv">
              <span className="k">Window</span><span>10:00–13:00 NY · 1 trade/day · skip Mon</span>
              <span className="k">Sizing</span><span>MNQ · $400 risk · 5R target · BE +1R</span>
              <span className="k">Daily</span><span>loss $800 · lock $1,400 · flat 15:55</span>
              <span className="k">Regime</span><span className="warn">Give-backs ≥2/10 → trail ON in TV</span>
            </div>
            <hr className="hr" />
            <div className="small">
              <Link href="/strategies">Full config →</Link>
              {" · "}
              <Link href="/journal">Journal →</Link>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Day rules</div>
          <div className="panel-body small">
            <div className="rule-line"><span className="accent">Win</span> first trade → done for the day</div>
            <div className="rule-line"><span className="accent">Loss</span> → half risk if you had a second (script = 1/day)</div>
            <div className="rule-line"><span className="accent">+5R</span> (~$1,900) → walk away, lock handles rest</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Finding Bias <span className="sub">SOP §3 · before you set Direction in TV</span>
        </div>
        <div className="panel-body bias-ref-grid">
          <div>
            <div className="bias-ref-head">Read top-down</div>
            <ul className="bias-ref-list">
              {FINDING_BIAS_FLOW.map((r) => (
                <li key={r.id}>{r.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="bias-ref-head">Rules</div>
            <ul className="bias-ref-list">
              {FINDING_BIAS_RULES.map((r) => (
                <li key={r.id}>{r.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="bias-ref-head">→ TV Direction filter</div>
            <ul className="bias-ref-list">
              {BIAS_TO_FILTER.map((r) => (
                <li key={r.bias}>
                  <span className="accent">{r.bias}</span>
                  <span className="dim"> → </span>
                  {r.filter}
                </li>
              ))}
            </ul>
            <div className="small dim mt">
              Log bias + filter in <Link href="/journal">Journal</Link> — must match.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
