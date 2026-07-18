import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  LineChart,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

/**
 * Dual46 June 2026 walk P&L — MONTH COMPLETE. Journal (vault.journal) is source of truth.
 * WIN = stopPts × RR · LOSS = −stopPts · 10 MNQ = $20/pt · gross, no fees.
 */
const ROWS = [
  { date: "06-02", src: "disc", side: "L", tag: "Judas · KO", stop: 11.5, rr: "1:5", out: "WIN", pts: 57.5, usd: 1150 },
  { date: "06-03", src: "—", side: "—", tag: "Judas · OTE", stop: null, rr: "—", out: "skip (RB never retraced)", pts: 0, usd: 0 },
  { date: "06-04", src: "disc", side: "L", tag: "Cont · KO", stop: 20.75, rr: "1:5", out: "WIN", pts: 103.75, usd: 2075 },
  { date: "06-05", src: "disc", side: "L", tag: "Cont · OTE", stop: 15, rr: "1:5", out: "WIN", pts: 75, usd: 1500 },
  { date: "06-08 Mon", src: "disc", side: "L", tag: "Judas · KO", stop: 18.25, rr: "1:5", out: "WIN", pts: 91.25, usd: 1825 },
  { date: "06-09", src: "disc", side: "L", tag: "Cont · KO · NWOG+PDL", stop: 16.75, rr: "1:5", out: "LOSS", pts: -16.75, usd: -335 },
  { date: "06-10", src: "disc", side: "S", tag: "Judas · KO · NWOG", stop: 33.25, rr: "1:5", out: "WIN", pts: 166.25, usd: 3325 },
  { date: "06-11", src: "disc", side: "S", tag: "Cont · KO", stop: 19.5, rr: "1:3.5", out: "LOSS", pts: -19.5, usd: -390 },
  { date: "06-11", src: "disc", side: "L", tag: "Judas · OTE (live catch)", stop: 6, rr: "1:15", out: "WIN", pts: 90, usd: 1800 },
  { date: "06-11", src: "disc", side: "S", tag: "Judas · KO · NWOG", stop: 9.75, rr: "1:8", out: "WIN", pts: 78, usd: 1560 },
  { date: "06-12", src: "disc", side: "L", tag: "Cont · KO · 1800KO+IFVG", stop: 13.75, rr: "1:3.8", out: "WIN", pts: 52.25, usd: 1045 },
  { date: "06-12", src: "disc", side: "L", tag: "Judas · OTE+KO (A+)", stop: null, rr: "1:6", out: "no fill — by a tick", pts: 0, usd: 0 },
  { date: "06-16", src: "disc", side: "L", tag: "Cont · OTE+KO (A+)", stop: 15.25, rr: "1:3.8", out: "missed — limit late", pts: 0, usd: 0 },
  { date: "06-17", src: "disc", side: "S", tag: "Judas · KO · MN KO loose GP", stop: 16.5, rr: "1:2.77", out: "LOSS", pts: -16.5, usd: -330 },
  { date: "06-18", src: "disc", side: "L", tag: "Cont · OTE+KO (A+)", stop: 16.5, rr: "1:6.73", out: "missed — limit late", pts: 0, usd: 0 },
  { date: "06-19", src: "disc", side: "S", tag: "Judas · OTE+KO — against bias", stop: 4.75, rr: "1:9.95", out: "LOSS — full loss, good data", pts: -4.75, usd: -95 },
  { date: "06-22 Mon", src: "—", side: "—", tag: "— (date inferred)", stop: null, rr: "—", out: "no setup", pts: 0, usd: 0 },
  { date: "06-23", src: "disc", side: "L", tag: "Cont · KO · 5m FVG", stop: 9.75, rr: "1:7.28", out: "LOSS — wicked, then ran", pts: -9.75, usd: -195 },
  { date: "06-23", src: "SCRIPT", side: "S", tag: "Judas · KO", stop: 22, rr: "1:4.5", out: "WIN — first captured arm", pts: 99, usd: 1980 },
  { date: "06-24", src: "SCRIPT", side: "L", tag: "Judas · KO", stop: 19, rr: "1:5", out: "no fill — would have hit", pts: 0, usd: 0 },
  { date: "06-26", src: "—", side: "—", tag: "—", stop: null, rr: "—", out: "no setup (news day?)", pts: 0, usd: 0 },
  { date: "06-29 Mon", src: "SCRIPT", side: "S", tag: "Cont · OTE+KO (A+)", stop: 33.5, rr: "1:3 (100pt cap)", out: "WIN — market-order fill", pts: 100.5, usd: 2010 },
];

const APLUS = [
  { date: "06-12", result: "no fill — by a tick", captured: false },
  { date: "06-16", result: "missed — limit not placed in time", captured: false },
  { date: "06-18", result: "missed — limit not placed in time", captured: false },
  { date: "06-19", result: "taken AGAINST bias → LOSS (bias filter matters)", captured: true },
  { date: "06-29", result: "captured with bias (market order) → WIN +$2,010", captured: true },
];

const gross = ROWS.reduce((s, r) => s + r.usd, 0);
const pts = ROWS.reduce((s, r) => s + r.pts, 0);
const takes = ROWS.filter((r) => r.out.startsWith("WIN") || r.out.startsWith("LOSS"));
const wins = takes.filter((r) => r.out.startsWith("WIN")).length;
const scriptPnl = ROWS.filter((r) => r.src === "SCRIPT").reduce((s, r) => s + r.usd, 0);

const equity: number[] = [];
ROWS.reduce((s, r) => {
  const next = s + r.usd;
  equity.push(next);
  return next;
}, 0);

export default function Dual46JunePnl() {
  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Dual46 June 2026 · month complete · 10 MNQ</H1>
        <Text tone="secondary">
          06-02 → 06-29 · journal source of truth · MNQ $2/pt × 10 = $20/pt · gross, no fees ·
          fills monitored live-style in replay
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={`$${gross.toLocaleString()}`} label="Gross June" tone="success" />
        <Stat value={`+${pts}`} label="Net points" tone="success" />
        <Stat value={`${wins}W / ${takes.length - wins}L`} label={`Takes (${Math.round((wins / takes.length) * 100)}% WR)`} />
        <Stat value="2W / 0L" label={`Script arms filled (+$${scriptPnl.toLocaleString()})`} tone="success" />
      </Grid>

      <Callout tone="success" title="The script sleeve is alive">
        After thirteen sessions with zero arms, June closed with three script arms in the last
        five sessions: 06-23 WIN (+$1,980), 06-24 no-fill (would have hit), 06-29 WIN (+$2,010,
        100-pt TP cap did its job on a 33.5-pt stop — the exact wide-stop case it was built
        for). The mid-month "conditions too hard" read was premature — arms cluster.
      </Callout>

      <Card>
        <CardHeader>Cumulative equity by trade ($, gross @ 10 MNQ)</CardHeader>
        <CardBody>
          <LineChart
            categories={ROWS.map((r) => r.date)}
            series={[{ name: "Equity ($)", data: equity, tone: "success" }]}
            valuePrefix="$"
            fill
            height={220}
          />
          <Text tone="secondary" size="small" style={{ marginTop: 8 }}>
            Source: vault.journal · flat segments are skips / no-fills / missed A+ · five losses
            cost $1,345 combined vs $18,270 from ten wins (13.6 : 1 asymmetry).
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>A+ (OTE+KO) census — 4 in June, capture arc fixed mid-month</CardHeader>
        <CardBody>
          <Table
            headers={["Date", "Result"]}
            rows={APLUS.map((m) => [m.date, m.result])}
            rowTone={APLUS.map((m) => (m.captured ? "success" : "warning"))}
          />
          <Text tone="secondary" size="small" style={{ marginTop: 8 }}>
            0/3 captured while placing limits late → journal note to pre-stage on the 10AM KO →
            1/1 captured after. Process fix, no pine retune.
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Per trade ledger (script arms uppercase in Src)</CardHeader>
        <CardBody>
          <Table
            headers={["Date", "Src", "Side", "Tag", "Stop (pts)", "RR", "Outcome", "Pts", "$ @ 10 MNQ"]}
            rows={ROWS.map((r) => [
              r.date,
              r.src,
              r.side,
              r.tag,
              r.stop == null ? "—" : String(r.stop),
              r.rr,
              r.out,
              r.pts > 0 ? `+${r.pts}` : String(r.pts),
              r.usd > 0 ? `+$${r.usd.toLocaleString()}` : r.usd < 0 ? `-$${Math.abs(r.usd)}` : "$0",
            ])}
            rowTone={ROWS.map((r) => (r.usd > 0 ? "success" : r.usd < 0 ? "danger" : undefined))}
          />
        </CardBody>
      </Card>

      <Grid columns={5} gap={12}>
        <Stat value="+$9,540" label="06-02 → 06-10" tone="success" />
        <Stat value="+$4,015" label="06-11 → 06-12" tone="success" />
        <Stat value="-$425" label="06-16 → 06-22" tone="danger" />
        <Stat value="+$1,785" label="06-23 → 06-26" tone="success" />
        <Stat value="+$2,010" label="06-29" tone="success" />
      </Grid>

      <Card>
        <CardHeader>NWOG sleeve census (separate candidate — not in Dual46, not in P&amp;L)</CardHeader>
        <CardBody>
          <Table
            headers={["Date", "Trade", "Result"]}
            rows={[
              ["06-09", "NWOG (filled) + PDL reversal long", "LOSS — stopped ticks before the run"],
              ["06-10", "S off NWOG, stop above gap", "WIN +166.25 pts"],
              ["06-11", "S limit on NWOG after run under", "WIN +78 pts"],
              ["06-29", "would-have: NWOG tap at daily int. low", "not taken — ~200-250 pt reversal (~+100 capped)"],
            ]}
            rowTone={["danger", "success", "success", "warning"]}
          />
          <Text tone="secondary" size="small" style={{ marginTop: 8 }}>
            Live 2W/1L. 06-09 is the counter-case for a fixed 10-pt stop — a 16.75-pt stop
            still got wicked there. Log-only census through the May walk; Dual46 stays frozen.
          </Text>
        </CardBody>
      </Card>

      <Callout tone="warning" title="Honest status">
        Discretionary sleeve dominates the P&amp;L (13 takes) — script sleeve is 2 fills, both
        wins, far too small for prop math. No path MC / E[$/wk] claims. Data notes: 06-22 date
        inferred (was a 06-17 dup; its chart shows off-scale prices — TV crash suspected);
        06-25 and 06-30 unlogged; news cross-reference for 06-08 / 06-26 / 06-29 still open
        (calendar bundle empty for those dates).
      </Callout>

      <Row gap={8} wrap>
        <Pill tone="success">{`June gross $${gross.toLocaleString()}`}</Pill>
        <Pill tone="success">Script 2W/0L +$3,990</Pill>
        <Pill>Judas 6W/1L · Cont 4W/3L</Pill>
        <Pill>A+ ~1/week · capture fixed</Pill>
        <Pill>Mondays 2W/0L (both sleeves)</Pill>
        <Pill tone="neutral">Next: May 2026 walk</Pill>
      </Row>
    </Stack>
  );
}
