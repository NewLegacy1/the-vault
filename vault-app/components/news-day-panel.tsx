"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtUsd } from "@/lib/store";
import type { CalendarEvent } from "@/lib/economic-calendar";
import {
  joinTradesWithNews,
  analyzeNewsDayPerformance,
  SOP_TAG_LABELS,
  type NewsDayAnalysis,
} from "@/lib/trade-news-join";

export interface NewsDayPanelProps {
  trades: number[];
  dates: string[];
  strategyLabel?: string;
}

function tradeCalendarDiagnostics(events: CalendarEvent[], tradeDates: string[]) {
  const eventDateSet = new Set(events.map((e) => e.date));
  const overlap = tradeDates.filter((d) => d && eventDateSet.has(d.slice(0, 10))).length;
  const calDates = events.map((e) => e.date).filter(Boolean).sort();
  const tradeSorted = tradeDates.filter(Boolean).sort();
  const calSpan = calDates.length ? { start: calDates[0], end: calDates[calDates.length - 1] } : null;
  const tradeSpan = tradeSorted.length
    ? { start: tradeSorted[0].slice(0, 10), end: tradeSorted[tradeSorted.length - 1].slice(0, 10) }
    : null;

  let gapNote: string | null = null;
  if (calSpan && tradeSpan) {
    if (tradeSpan.start > calSpan.end) {
      gapNote = `Trades start ${tradeSpan.start} but calendar ends ${calSpan.end}. Extend data/calendar/.`;
    } else if (tradeSpan.end < calSpan.start) {
      gapNote = `Trades end ${tradeSpan.end} before calendar starts ${calSpan.start}.`;
    } else if (overlap === 0) {
      gapNote = "Spans overlap but no trade day matches — check date formats.";
    }
  }

  return {
    overlapDays: overlap,
    tradeCount: tradeDates.filter(Boolean).length,
    unmatchedTrades: tradeDates.filter(Boolean).length - overlap,
    calSpan,
    gapNote,
  };
}

export function NewsDayPanel({ trades, dates, strategyLabel }: NewsDayPanelProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setEvents(data.events ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const analysis: NewsDayAnalysis | null = useMemo(() => {
    if (!events.length || !trades.length) return null;
    const ledger = trades.map((pnl, i) => ({ date: dates[i] ?? "", pnl }));
    const joined = joinTradesWithNews(ledger, events);
    return analyzeNewsDayPerformance(joined, strategyLabel);
  }, [events, trades, dates, strategyLabel]);

  const diagnostics = useMemo(() => {
    if (!events.length) return null;
    return tradeCalendarDiagnostics(events, dates);
  }, [events, dates]);

  if (loading) {
    return <p className="small dim">Loading economic calendar…</p>;
  }

  if (!events.length) {
    return (
      <p className="small warn">
        No calendar loaded — upload FF CSV on F7 News or rebuild calendar bundle. News-day splits need red-folder tags.
      </p>
    );
  }

  if (!analysis || !diagnostics) return null;

  return (
    <>
      <p className="small accent" style={{ marginTop: 0, lineHeight: 1.5 }}>
        {analysis.headline}
      </p>
      <p className="small" style={{ lineHeight: 1.65 }}>
        {analysis.verdict}
      </p>
      <table className="mt kv-table">
        <tbody>
          <tr>
            <td className="dim">Calendar coverage</td>
            <td>
              {diagnostics.overlapDays} / {diagnostics.tradeCount} trade days matched
              {diagnostics.unmatchedTrades > 0 && (
                <span className="dim small"> ({diagnostics.unmatchedTrades} outside span)</span>
              )}
            </td>
          </tr>
          {diagnostics.calSpan && (
            <tr>
              <td className="dim">Calendar span</td>
              <td>
                {diagnostics.calSpan.start} → {diagnostics.calSpan.end}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {diagnostics.gapNote && (
        <p className="small warn mt" style={{ lineHeight: 1.6 }}>
          {diagnostics.gapNote}
        </p>
      )}
      {diagnostics.overlapDays > 0 && (
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
                ["Quiet (no USD red)", analysis.quiet],
                ["Red-folder days", analysis.red],
                ["CPI / NFP / PPI", analysis.cpi],
                ["Data H/L eligible", analysis.dataHl],
              ] as const
            ).map(([label, s]) => (
              <tr key={label}>
                <td className="small">{label}</td>
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
      )}
      <p className="small dim mt" style={{ marginBottom: 0, lineHeight: 1.55 }}>
        Tags from F7 calendar ({SOP_TAG_LABELS["red-folder"]}). Agent can compare any uploaded CSV the same way.
      </p>
    </>
  );
}
