"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocal, fmtUsd } from "@/lib/store";
import { parseCalendarCsv, CalendarEvent, SopDayTag, profileDay } from "@/lib/economic-calendar";
import { joinTradesWithNews, newsSummaryStats, analyzePrbRedFolderDays, SOP_TAG_LABELS } from "@/lib/trade-news-join";
import { ALL_SEED_TRADES } from "@/lib/prb-data";
import { normalizeTradeDate } from "@/lib/normalize-date";
import {
  buildMonthGrid,
  listMonthsInSpan,
  monthKey,
  parseMonthKey,
} from "@/lib/calendar-view";

interface Dataset {
  id: string;
  name: string;
  label?: string;
  trades: number[];
  dates: string[];
}

interface CalendarMeta {
  source: string;
  uploadedAt: string;
  eventCount: number;
  span: { start: string; end: string };
}

const SEED: Dataset = {
  id: "seed-all",
  name: "PRB v1 — full record Dec 25–Jul 26",
  trades: ALL_SEED_TRADES.map((t) => t.pnl),
  dates: ALL_SEED_TRADES.map((t) => t.date),
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function tagClass(tag: SopDayTag): string {
  if (tag === "skip-fade" || tag === "trend-day-risk") return "neg";
  if (tag === "data-hl-ok" || tag === "mixed-prints") return "cyan";
  if (tag === "quiet") return "dim";
  return "warn";
}

function cellClass(red: number, hasTrade: boolean, inMonth: boolean): string {
  const parts = ["cal-cell"];
  if (!inMonth) parts.push("cal-cell--pad");
  if (red > 0) parts.push("cal-cell--red");
  if (hasTrade) parts.push("cal-cell--trade");
  return parts.join(" ");
}

export default function NewsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meta, setMeta] = useState<CalendarMeta | null>(null);
  const [uploads] = useLocal<Dataset[]>("vault.lab.datasets", []);
  const [dsId, setDsId] = useState("seed-all");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [monthIdx, setMonthIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const datasets = useMemo(() => [SEED, ...uploads], [uploads]);
  const ds = datasets.find((d) => d.id === dsId) ?? SEED;

  const trades = useMemo(
    () =>
      ds.dates.map((date, i) => ({
        date: normalizeTradeDate(date),
        pnl: ds.trades[i] ?? 0,
      })),
    [ds]
  );

  const tradeByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of trades) m.set(t.date, t.pnl);
    return m;
  }, [trades]);

  const joined = useMemo(() => joinTradesWithNews(trades, events), [trades, events]);
  const stats = useMemo(
    () => (events.length ? newsSummaryStats(joined, events) : null),
    [joined, events]
  );
  const redFolderAnalysis = useMemo(
    () => (events.length ? analyzePrbRedFolderDays(joined) : null),
    [joined, events.length]
  );

  const diagnostics = useMemo(() => {
    const eventDates = new Set(events.map((e) => e.date));
    const tradeDates = trades.map((t) => t.date);
    const overlap = tradeDates.filter((d) => eventDates.has(d)).length;
    const calDates = [...eventDates].sort();
    const td = [...tradeDates].sort();
    let gapNote: string | null = null;
    if (calDates.length && td.length) {
      const cs = calDates[0];
      const ce = calDates[calDates.length - 1];
      const ts = td[0];
      const te = td[td.length - 1];
      if (ts > ce) {
        gapNote = `Trades start ${ts} but calendar ends ${ce} — extend data/calendar/ or run scripts/scrape-fred-gap.mjs.`;
      } else if (te < cs) {
        gapNote = `Trades end ${te} but calendar starts ${cs} — upload a wider CSV.`;
      } else if (overlap === 0) {
        gapNote = "No date overlap between trades and calendar — check formats or extend calendar range.";
      }
    }
    return {
      eventCount: events.length,
      calSpan: calDates.length ? { start: calDates[0], end: calDates[calDates.length - 1] } : null,
      tradeSpan: td.length ? { start: td[0], end: td[td.length - 1] } : null,
      overlap,
      gapNote,
    };
  }, [events, trades]);

  const viewSpan = useMemo(() => {
    const starts: string[] = [];
    const ends: string[] = [];
    if (diagnostics.calSpan) {
      starts.push(diagnostics.calSpan.start);
      ends.push(diagnostics.calSpan.end);
    }
    if (diagnostics.tradeSpan) {
      starts.push(diagnostics.tradeSpan.start);
      ends.push(diagnostics.tradeSpan.end);
    }
    if (!starts.length) return { start: "2025-01-01", end: "2025-04-07" };
    starts.sort();
    ends.sort();
    return { start: starts[0], end: ends[ends.length - 1] };
  }, [diagnostics]);

  const months = useMemo(() => listMonthsInSpan(viewSpan.start, viewSpan.end), [viewSpan]);
  const currentMonth = months[monthIdx] ?? months[0] ?? monthKey(2025, 0);
  const { year, month } = parseMonthKey(currentMonth);
  const grid = useMemo(
    () => buildMonthGrid(year, month, events, tradeByDate),
    [year, month, events, tradeByDate]
  );

  const selectedProfile = useMemo(() => {
    if (!selectedDate) return null;
    const dayEvents = events.filter((e) => e.date === selectedDate);
    const j = joined.find((x) => x.date === selectedDate);
    const sop = profileDay(selectedDate, dayEvents);
    return { date: selectedDate, events: dayEvents, trade: j ?? null, sop };
  }, [selectedDate, events, joined]);

  const jumpToDate = (date: string) => {
    if (!date) return;
    setSelectedDate(date);
    const mk = date.slice(0, 7);
    const idx = months.indexOf(mk);
    if (idx >= 0) setMonthIdx(idx);
  };

  const loadFromServer = () => {
    setLoading(true);
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setEvents(d.events ?? []);
        setMeta(d.meta ?? null);
        setErr("");
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFromServer();
  }, []);

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      const csv = String(reader.result ?? "");
      const parsed = parseCalendarCsv(csv);
      if (parsed.length === 0) {
        setErr("No events parsed — need Date/DateTime + Event columns.");
        return;
      }
      setInfo(`Parsed ${parsed.length} rows from file — saving USD-only to server…`);
      fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, source: files[0].name, usdOnly: true }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.error) throw new Error(d.error);
          setEvents(d.events ?? []);
          setMeta(d.meta ?? null);
          setErr("");
          setInfo(`Loaded ${d.meta?.eventCount ?? 0} USD events (${d.meta?.span?.start} → ${d.meta?.span?.end})`);
        })
        .catch((e) => setErr(String(e)));
    };
    reader.readAsText(files[0]);
  };

  const redEvents = selectedProfile?.events.filter((e) => e.impact === "high") ?? [];

  return (
    <>
      <div className="panel">
        <div className="panel-title">
          Look up a day
          <span className="sub">
            Morningstar replay · red folder without Forex Factory ·{" "}
            {loading ? "loading…" : meta ? `${meta.span.start} → ${meta.span.end}` : "no calendar"}
          </span>
        </div>
        <div className="panel-body">
          <div className="frm-row" style={{ marginBottom: 12 }}>
            <label className="fld">
              Date
              <input
                type="date"
                value={selectedDate ?? ""}
                min={meta?.span.start}
                max={meta?.span.end}
                onChange={(e) => jumpToDate(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn"
              onClick={() => jumpToDate(selectedDate ?? meta?.span.end ?? "")}
              disabled={!selectedDate && !meta?.span.end}
            >
              Show day
            </button>
            <button type="button" className="btn-ghost" onClick={loadFromServer}>
              Reload calendar
            </button>
          </div>

          {err && <p className="small neg" style={{ marginTop: 0 }}>{err}</p>}
          {events.length === 0 && !loading && (
            <p className="small warn" style={{ marginTop: 0 }}>
              No calendar on disk — upload a Forex Factory CSV below (USD high-impact). Bundle on this machine
              spans ~2023-07 → 2026-07.
            </p>
          )}

          {selectedProfile && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
                <span className="accent" style={{ fontSize: 18 }}>
                  {selectedProfile.date}
                </span>
                <span className={selectedProfile.sop.redCount > 0 ? "neg" : "pos"} style={{ fontWeight: 600 }}>
                  {selectedProfile.sop.redCount > 0
                    ? `RED FOLDER · ${selectedProfile.sop.redCount} high-impact`
                    : "Quiet · no USD red folder"}
                </span>
                {selectedProfile.sop.tags.map((t) => (
                  <span key={t} className={"chip " + tagClass(t)}>
                    {SOP_TAG_LABELS[t]}
                  </span>
                ))}
              </div>
              <p className="small" style={{ lineHeight: 1.55, margin: "8px 0 0" }}>
                {selectedProfile.sop.guidance}
              </p>
              {redEvents.length > 0 ? (
                <>
                  <div className="small dim mt" style={{ letterSpacing: 1 }}>
                    JOURNAL TIP — copy time(s) into Morningstar red-folder fields
                  </div>
                  <table className="mt">
                    <thead>
                      <tr>
                        <th>Time (NY)</th>
                        <th>Event</th>
                        <th>Actual</th>
                        <th>Forecast</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redEvents.map((e, i) => (
                        <tr key={`red-${e.time}-${e.title}-${i}`}>
                          <td className="accent">{(e.time || "—").replace(":", "")}</td>
                          <td>{e.title}</td>
                          <td>{e.actual || "—"}</td>
                          <td className="dim">{e.forecast || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="small dim mt" style={{ marginBottom: 0 }}>
                  No high-impact USD prints — Journal red folder = <b>no</b>.
                </p>
              )}
              {selectedProfile.events.filter((e) => e.impact !== "high").length > 0 && (
                <details className="mt">
                  <summary className="small dim" style={{ cursor: "pointer" }}>
                    All events this day ({selectedProfile.events.length})
                  </summary>
                  <table className="mt">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Impact</th>
                        <th>Event</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProfile.events.map((e, i) => (
                        <tr key={`all-${e.time}-${e.title}-${i}`}>
                          <td>{e.time || "—"}</td>
                          <td className={e.impact === "high" ? "neg" : "dim"}>{e.impact}</td>
                          <td>{e.title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </div>
          )}
          {!selectedProfile && !loading && events.length > 0 && (
            <p className="small dim" style={{ marginBottom: 0 }}>
              Pick a date above (or click a cell in the month calendar) for red-folder status + times.
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Economic calendar data
          <span className="sub">
            {loading ? "loading…" : meta ? `${meta.eventCount} events · ${meta.span.start} → ${meta.span.end}` : "no data"}
          </span>
        </div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label className="btn ghost" style={{ cursor: "pointer" }}>
              Upload calendar CSV
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
            <button type="button" className="btn ghost" onClick={loadFromServer}>
              Reload server cache
            </button>
            <span className="small dim">
              {meta?.source ? <>Source: <span className="accent">{meta.source}</span></> : "Uses data/calendar/ on disk"}
            </span>
          </div>
          {info && <p className="small cyan mt">{info}</p>}
          {diagnostics.gapNote && (
            <p className="small warn mt" style={{ lineHeight: 1.6 }}>
              {diagnostics.gapNote}
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          PRB on red-folder days
          <span className="sub">does live PRB already capture news-day edge? · answers whether Data H/L replay is worth your time</span>
        </div>
        <div className="panel-body">
          <label className="fld" style={{ maxWidth: 480, marginBottom: 12 }}>
            PRB trade dataset
            <select value={dsId} onChange={(e) => setDsId(e.target.value)}>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label ?? d.name} — {d.trades.length} tr
                </option>
              ))}
            </select>
          </label>

          {events.length === 0 && !loading && (
            <p className="small warn">Upload or reload calendar first — this panel joins PRB trades with red-folder tags.</p>
          )}

          {redFolderAnalysis && diagnostics.overlap > 0 && (
            <>
              <p className="small accent" style={{ marginTop: 0, lineHeight: 1.5 }}>
                {redFolderAnalysis.headline}
              </p>
              <p className="small" style={{ lineHeight: 1.65 }}>
                {redFolderAnalysis.verdict}
              </p>

              <table className="mt kv-table">
                <tbody>
                  <tr>
                    <td className="dim">Total PRB net (dataset)</td>
                    <td className={redFolderAnalysis.totalNet >= 0 ? "pos" : "neg"}>
                      {fmtUsd(redFolderAnalysis.totalNet, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="dim">Trades in calendar range</td>
                    <td>
                      {redFolderAnalysis.inCalendar} / {redFolderAnalysis.totalTrades}
                      {redFolderAnalysis.outsideCalendar > 0 && (
                        <span className="dim small"> ({redFolderAnalysis.outsideCalendar} outside span)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="mt">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th className="num">Trades</th>
                    <th className="num">W / L</th>
                    <th className="num">Net P&L</th>
                    <th className="num">Avg / trade</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Quiet (no USD red)", redFolderAnalysis.quiet],
                      ["Red-folder days", redFolderAnalysis.red],
                      ["CPI / NFP / PPI", redFolderAnalysis.cpi],
                      ["Data H/L eligible (SOP tag)", redFolderAnalysis.dataHl],
                    ] as const
                  ).map(([label, s]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className="num">{s.trades}</td>
                      <td className="num">
                        {s.wins} / {s.losses}
                      </td>
                      <td className={"num " + (s.netPnl >= 0 ? "pos" : "neg")}>{fmtUsd(s.netPnl, true)}</td>
                      <td className={"num " + (s.avgPnl >= 0 ? "pos" : "neg")}>{fmtUsd(s.avgPnl, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {redFolderAnalysis.redTrades.length > 0 && (
                <>
                  <div className="accent small mt" style={{ letterSpacing: 1 }}>
                    RED-FOLDER TRADES (your actual PRB fills)
                  </div>
                  <table className="mt">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="num">P&L</th>
                        <th>Tags</th>
                        <th>Headlines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redFolderAnalysis.redTrades.map((j) => (
                        <tr
                          key={j.date}
                          onClick={() => setSelectedDate(j.date)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{j.date}</td>
                          <td className={"num " + (j.pnl >= 0 ? "pos" : "neg")}>{fmtUsd(j.pnl, true)}</td>
                          <td className="small">
                            {j.profile?.tags.map((t) => (
                              <span key={t} className={"chip " + tagClass(t)} style={{ marginRight: 4 }}>
                                {SOP_TAG_LABELS[t]}
                              </span>
                            ))}
                          </td>
                          <td className="small dim">{j.headlines.join(" · ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="small dim mt" style={{ lineHeight: 1.6 }}>
                Data H/L Pine (<code className="inline">Powell_DataHL_v0.pine</code>) is{" "}
                <span className="warn">manual replay only</span> — use it on dates above only if this panel
                shows PRB is missing news-day edge. Pine cannot auto-skip quiet days.
              </div>
            </>
          )}

          {redFolderAnalysis && diagnostics.overlap === 0 && (
            <p className="small warn">Calendar loaded but zero matching trade dates — fix span overlap in diagnostics above.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Month calendar
          <span className="sub">red = USD high impact · ring = trade day · click day for detail</span>
        </div>
        <div className="panel-body">
          <div className="cal-nav">
            <button
              type="button"
              className="btn ghost"
              disabled={monthIdx <= 0}
              onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
            >
              ←
            </button>
            <span className="accent" style={{ minWidth: 120, textAlign: "center" }}>
              {currentMonth}
            </span>
            <button
              type="button"
              className="btn ghost"
              disabled={monthIdx >= months.length - 1}
              onClick={() => setMonthIdx((i) => Math.min(months.length - 1, i + 1))}
            >
              →
            </button>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => (
              <div key={d} className="cal-dow">
                {d}
              </div>
            ))}
            {grid.map((cell) => (
              <button
                key={cell.date}
                type="button"
                className={cellClass(cell.redCount, cell.hasTrade, cell.inMonth)}
                onClick={() => setSelectedDate(cell.date)}
                title={cell.events.map((e) => `${e.time} ${e.title}`).join("\n")}
              >
                <span className="cal-day-num">{cell.date.slice(8)}</span>
                {cell.redCount > 0 && <span className="cal-red-dot">{cell.redCount}</span>}
                {cell.hasTrade && (
                  <span className={"cal-trade-pnl " + ((cell.tradePnl ?? 0) >= 0 ? "pos" : "neg")}>
                    {fmtUsd(cell.tradePnl ?? 0, true)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="small dim mt" style={{ marginBottom: 0 }}>
            Day detail is in <b>Look up a day</b> at the top — calendar click jumps there.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Trade ↔ news join
          <span className="sub">same dataset as F4 LAB</span>
        </div>
        <div className="panel-body">
          <label className="fld" style={{ maxWidth: 480 }}>
            Trade dataset
            <select value={dsId} onChange={(e) => setDsId(e.target.value)}>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label ?? d.name} — {d.trades.length} tr
                </option>
              ))}
            </select>
          </label>

          {events.length === 0 && !loading && (
            <p className="small warn mt">No calendar loaded. Upload CSV or add files to data/calendar/ and reload.</p>
          )}

          {stats && diagnostics.overlap > 0 && (
            <table className="mt">
              <thead>
                <tr>
                  <th>Day type (SOP)</th>
                  <th className="num">Trades</th>
                  <th className="num">W / L</th>
                  <th className="num">Net P&L</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Quiet days", stats.quiet],
                    ["Red-folder days", stats.red],
                    ["CPI / NFP / PPI", stats.cpi],
                    ["Data H/L eligible", stats.dataHl],
                    ["Trend-day risk", stats.trendRisk],
                  ] as const
                ).map(([label, s]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="num">{s.trades}</td>
                    <td className="num">
                      {s.wins} / {s.losses}
                    </td>
                    <td className={"num " + (s.netPnl >= 0 ? "pos" : "neg")}>{fmtUsd(s.netPnl, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <table className="mt">
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">P&L</th>
                <th>News</th>
                <th>Red events</th>
              </tr>
            </thead>
            <tbody>
              {joined.map((j, i) => (
                <tr key={`${j.date}-${i}`} onClick={() => setSelectedDate(j.date)} style={{ cursor: "pointer" }}>
                  <td>{j.date}</td>
                  <td className={"num " + (j.pnl >= 0 ? "pos" : "neg")}>{fmtUsd(j.pnl, true)}</td>
                  <td className="small">
                    {j.profile ? (
                      j.profile.tags.map((t) => (
                        <span key={t} className={"chip " + tagClass(t)} style={{ marginRight: 4 }}>
                          {SOP_TAG_LABELS[t]}
                        </span>
                      ))
                    ) : (
                      <span className="neg">outside calendar range</span>
                    )}
                  </td>
                  <td className="small dim">{j.headlines.join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
