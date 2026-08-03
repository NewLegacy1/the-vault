"use client";

import Link from "next/link";
import { useLocal, fmtUsd, todayStr } from "@/lib/store";
import { isCost, type Account, type JournalEntry, type LedgerEntry } from "@/lib/types";

/**
 * Ops cockpit — the app's home screen. Account pulse (former TODAY page) +
 * the active Apex $50K Intraday sprint card
 * (strategies/strategy-dev/20-playbooks/apex-50k-intraday-eval-sprint.md):
 * pass progress, trail room (day-close proxy), DLL / profit-lock triggers,
 * process adherence, and the Sunday weekly rollup — computed live from the
 * journal (server-backed via /api/vault-store).
 */

const SPRINT = {
  ruleId: "apex50-intraday",
  passTarget: 3000,
  trailDD: 2000,
  personalDll: -600,
  profitLock: 1200,
  riskPreferred: 300,
  riskMax: 400,
  maxStopPts: 20,
};

function weekKey(dateStr: string): string {
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return dateStr;
  const d = new Date(t);
  const day = d.getUTCDay();
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function isFill(j: JournalEntry): boolean {
  if (j.direction === "skip") return false;
  if (j.dualOutcome === "skipped" || j.dualOutcome === "no fill") return false;
  return true;
}

export default function OpsCockpit() {
  const [accounts] = useLocal<Account[]>("vault.accounts", []);
  const [activeId] = useLocal<string>("vault.activeAccount", "");
  const [journal] = useLocal<JournalEntry[]>("vault.journal", []);
  const [ledger] = useLocal<LedgerEntry[]>("vault.ledger", []);

  const fees = ledger.filter((l) => isCost(l.type)).reduce((s, l) => s + l.amount, 0);
  const payouts = ledger.filter((l) => l.type === "payout").reduce((s, l) => s + l.amount, 0);
  const netCash = payouts - fees;
  const loggedToday = journal.filter((j) => j.date === todayStr()).length;

  const sprintAcct =
    accounts.find((a) => a.ruleId === SPRINT.ruleId && a.phase === "eval") ??
    accounts.find((a) => a.ruleId === SPRINT.ruleId) ??
    accounts.find((a) => a.id === activeId);

  if (!sprintAcct) {
    return (
      <div className="panel">
        <div className="panel-title">Ops cockpit</div>
        <div className="panel-body">
          <p className="small subtext">
            No Apex Intraday account found. Add one in <b>Accounts</b> with
            rule <code className="inline">apex50-intraday</code> — this page
            binds to the sprint playbook automatically.
          </p>
          <Link href="/accounts" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Open Accounts →
          </Link>
        </div>
      </div>
    );
  }

  const rows = journal
    .filter((j) => j.accountId === sprintAcct.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const fills = rows.filter(isFill);

  // Daily P&L → cumulative, peak, trail room (day-close proxy — intraday
  // unrealized peaks can be tighter; broker dashboard is authority).
  const byDay = new Map<string, number>();
  for (const j of fills) byDay.set(j.date, (byDay.get(j.date) ?? 0) + j.pnl);
  const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  let cum = 0;
  let peak = 0;
  for (const [, pnl] of days) {
    cum += pnl;
    peak = Math.max(peak, cum);
  }
  const trailRoom = SPRINT.trailDD - (peak - cum);
  const passPct = Math.min(100, Math.max(0, (cum / SPRINT.passTarget) * 100));
  const bestDay = days.reduce((m, [, p]) => Math.max(m, p), 0);

  const today = todayStr();
  const todayPnl = byDay.get(today) ?? 0;
  const dllHit = todayPnl <= SPRINT.personalDll;
  const lockHit = todayPnl >= SPRINT.profitLock;

  const thisWeek = weekKey(today);
  const weekFills = fills.filter((j) => weekKey(j.date) === thisWeek);
  const weekLosses = weekFills.filter((j) => j.pnl < 0).length;

  // Process adherence (playbook §9 success criteria)
  const n = fills.length;
  const pct = (k: number) => (n > 0 ? Math.round((k / n) * 100) : 0);
  const withStop = fills.filter((j) => j.stopPts != null).length;
  const wideStop = fills.filter((j) => (j.stopPts ?? 0) > SPRINT.maxStopPts).length;
  const scriptArm = fills.filter(
    (j) => j.entrySource === "script" || j.sleeve === "script"
  ).length;
  const discLive = fills.filter(
    (j) => j.entrySource === "disc" || j.sleeve === "disc"
  ).length;
  const withRisk = fills.filter((j) => j.riskUsd != null).length;
  const beLogged = fills.filter((j) => j.beMoved != null).length;
  const giveBacks = fills.filter((j) => j.giveBack).length;

  // Weekly rollup (Sunday review table)
  const weeks = new Map<string, { takes: number; net: number; wins: number; losses: number; best: number; worst: number }>();
  for (const j of fills) {
    const k = weekKey(j.date);
    const w = weeks.get(k) ?? { takes: 0, net: 0, wins: 0, losses: 0, best: 0, worst: 0 };
    w.takes++;
    w.net += j.pnl;
    if (j.pnl > 0) w.wins++;
    if (j.pnl < 0) w.losses++;
    w.best = Math.max(w.best, j.pnl);
    w.worst = Math.min(w.worst, j.pnl);
    weeks.set(k, w);
  }
  const weekRows = [...weeks.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <>
      <div className="stat-strip">
        <div className="stat">
          <div className="k">Pass progress</div>
          <div className={"v " + (cum >= 0 ? "pos" : "neg")}>{fmtUsd(cum, true)}</div>
          <div className="d">
            {passPct.toFixed(0)}% of {fmtUsd(SPRINT.passTarget)} target
          </div>
        </div>
        <div className="stat">
          <div className="k">Trail room (day-close)</div>
          <div className={"v " + (trailRoom > 400 ? "pos" : "neg")}>{fmtUsd(trailRoom)}</div>
          <div className="d">
            floor chases peak — intraday incl. open P&L is tighter
          </div>
        </div>
        <div className="stat">
          <div className="k">Today</div>
          <div className={"v " + (todayPnl >= 0 ? "pos" : "neg")}>{fmtUsd(todayPnl, true)}</div>
          <div className="d">
            {dllHit ? "personal DLL HIT — done for day" : lockHit ? "profit lock HIT — done for day" : `DLL ${fmtUsd(SPRINT.personalDll)} · lock +${fmtUsd(SPRINT.profitLock)}`}
          </div>
        </div>
        <div className="stat">
          <div className="k">Losses this week</div>
          <div className={"v " + (weekLosses >= 2 ? "neg" : "")}>{weekLosses}</div>
          <div className="d">
            {weekLosses >= 3
              ? "3L — pause Apex live, paper only"
              : weekLosses === 2
                ? "2L — size $200 next trade + checklist review"
                : "under trigger"}
          </div>
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <div className="k">Sprint book</div>
          <div className="v accent">{sprintAcct.label}</div>
          <div className="d">
            {sprintAcct.firm} · {sprintAcct.phase.toUpperCase()}
          </div>
        </div>
        <div className="stat">
          <div className="k">Net cash (all accounts)</div>
          <div className={"v " + (netCash >= 0 ? "pos" : "neg")}>{fmtUsd(netCash, true)}</div>
          <div className="d">payouts vs fees</div>
        </div>
        <div className="stat">
          <div className="k">Logged today</div>
          <div className="v">{loggedToday}</div>
          <div className="d">all books</div>
        </div>
        <div className="stat">
          <div className="k">Journal</div>
          <div className="v">
            <Link href="/journal" className="accent" style={{ textDecoration: "none" }}>
              OPEN →
            </Link>
          </div>
          <div className="d">bias · fills · skips — one place</div>
        </div>
      </div>

      {(dllHit || lockHit || weekLosses >= 2 || trailRoom <= 400) && (
        <div className="panel">
          <div className="panel-body warn" style={{ lineHeight: 1.6 }}>
            <b>Kill / pause triggers active:</b>
            {dllHit && <> day ≤ −$600 → flat for the day.</>}
            {lockHit && <> day ≥ +$1,200 → soft lock, protect trail.</>}
            {weekLosses >= 3 && <> 3 losses this week → pause live, review before next arm.</>}
            {weekLosses === 2 && <> 2 losses this week → $200 risk next trade.</>}
            {trailRoom <= 400 && <> trail room ≤ $400 → no open-runner giveback allowed.</>}
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">
            Sprint card
            <span className="sub">{sprintAcct.label} · apex-50k-intraday-eval-sprint.md</span>
          </div>
          <div className="panel-body small subtext" style={{ lineHeight: 1.9 }}>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li>Script arm only (Dual46/v47 or gated PRB) · disc sleeve OFF</li>
              <li>Risk ${SPRINT.riskPreferred} (hard max ${SPRINT.riskMax}) · stop ≤ {SPRINT.maxStopPts} pts or skip</li>
              <li>BE mandatory at +1R · max 1 armed take/day · flat by 15:55 ET</li>
              <li>Target 3R soft bank · hard max 5R / 100-pt cap</li>
              <li>Broker dashboard is authority on the trail — this page is a day-close proxy</li>
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            Process adherence
            <span className="sub">{n} fills logged</span>
          </div>
          <div className="panel-body">
            <table>
              <tbody>
                <tr>
                  <td className="small">Stop pts logged</td>
                  <td className={"num " + (pct(withStop) >= 80 ? "pos" : "neg")}>{pct(withStop)}%</td>
                </tr>
                <tr>
                  <td className="small">Stops &gt; {SPRINT.maxStopPts} pts (should be 0)</td>
                  <td className={"num " + (wideStop === 0 ? "pos" : "neg")}>{wideStop}</td>
                </tr>
                <tr>
                  <td className="small">Script-arm share</td>
                  <td className={"num " + (pct(scriptArm) >= 80 ? "pos" : "neg")}>{pct(scriptArm)}%</td>
                </tr>
                <tr>
                  <td className="small">Disc live takes (must stay 0)</td>
                  <td className={"num " + (discLive === 0 ? "pos" : "neg")}>{discLive}</td>
                </tr>
                <tr>
                  <td className="small">riskUsd logged</td>
                  <td className={"num " + (pct(withRisk) >= 80 ? "pos" : "")}>{pct(withRisk)}%</td>
                </tr>
                <tr>
                  <td className="small">BE decision logged</td>
                  <td className={"num " + (pct(beLogged) >= 80 ? "pos" : "")}>{pct(beLogged)}%</td>
                </tr>
                <tr>
                  <td className="small">Give-backs (≥2R → &lt;1R)</td>
                  <td className={"num " + (giveBacks === 0 ? "pos" : "neg")}>{giveBacks}</td>
                </tr>
                <tr>
                  <td className="small">Best day vs total</td>
                  <td className="num">
                    {cum > 0 ? `${Math.round((bestDay / cum) * 100)}%` : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="small dim" style={{ marginBottom: 0 }}>
              Best-day % matters at the <b>PA payout</b> stage (Apex 4.0: best day
              &lt;50% of profit since last payout) — build the habit in eval.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Weekly rollup
          <span className="sub">Sunday review · gross journal $ per week</span>
        </div>
        <div className="panel-body">
          {weekRows.length === 0 && (
            <p className="small dim">
              No fills on {sprintAcct.label} yet — log takes in the Journal with
              this account selected and this page fills in live.
            </p>
          )}
          {weekRows.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Week (Mon)</th>
                  <th className="num">Takes</th>
                  <th className="num">Net</th>
                  <th className="num">W / L</th>
                  <th className="num">Best</th>
                  <th className="num">Worst</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.map(([k, w]) => (
                  <tr key={k}>
                    <td className="small">{k}</td>
                    <td className="num">{w.takes}</td>
                    <td className={"num " + (w.net >= 0 ? "pos" : "neg")}>{fmtUsd(w.net, true)}</td>
                    <td className="num small">
                      {w.wins} / {w.losses}
                    </td>
                    <td className="num pos">{fmtUsd(w.best, true)}</td>
                    <td className="num neg">{fmtUsd(w.worst, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
