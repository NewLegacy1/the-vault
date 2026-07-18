---
topic: red-folder-playbooks-1000-window
researched: 2026-07-18
sources: 8
agent-cycle: cycle3-laneC
---
# Red-Folder Playbooks — CPI / NFP / FOMC Around the 10:00 Window

Doctrine side of the news problem (lane B's #55 covers the microstructure/spread side). Three source layers: **Powell's own transcripts** (Vault archive, primary for Dual46), an **ICT-derived practitioner month-map** (GatieTrades, "How to READ the Economic Calendar Like ICT", 2026-03-01 — detailed, but a small channel; treat as community synthesis of ICT's calendar teachings), and **prop-firm rule mechanics**.

## Key findings

- **Powell's stated stand-down list** (`high-probability-conditions.txt` [18:15–18:35]): "no news Mondays I don't trade those · any London session before CPI PPI NFP — don't trade those · day before NFP sometimes, don't trade that." Plus a session-budget rule [18:41–19:10]: if London/Asia already expanded hugely ("like 600 points"), skip New York — "there's usually like one big move during the day and if it already happened… I'm just going to expect accumulation."
- **Powell's event signatures** (`stop-getting-manipulated.txt` [3:52–4:17]): **"NFP usually makes a move and it makes that move until market opens and then we usually reverse that move. CPI is the opposite — CPI usually makes a move and it usually just keeps making that move for the entire day. That is at least what the probabilities are like."** CLAIM, no stats — but it is the single most actionable sentence for a 10:00 strategy: on NFP days the 10:00 reversal structure is *with* the expected post-open reversal; on CPI days a counter-CPI 10:00 fade fights an all-day trend.
- **Powell's 8:30 routine** (`tick-precision-entries.txt` [18:22–18:31]): "If there's news at 8:30, I'll trade like a data high-low setup at 8:30 if it appears. If not, I'll look at 10 a.m." — 8:30 releases don't cancel his 10:00 look; they create the data-H/L levels that become the session's draws. His news-day *failure mode* is granularity, not direction: sequences of 1m RBs get "absolutely ran through" around NFP; his fix is elevating to 5m (cross-ref `powell/powell-rb-entry-teachings.md` §7).
- **Practitioner 10:00-release protocol** (GatieTrades, echoing ICT calendar teachings): with red/orange news *at* 10:00, (1) don't be entering fresh at 9:55–9:56 — "I don't want to get wicked out just by random on PMI"; (2) pre-10:00 entries only if price action before the print is "very clear with an obvious target"; (3) if the first 30 min of RTH look sloppy, the market is waiting for the release — trade *after* it; (4) 9:45-scheduled news = same protocol as 10:00. Being already-in-profit into a 10:00 print is acceptable ("10 a.m. just helps my position go towards the objective").
- **FOMC (always ~Wednesday) is a two-stage delivery**: 2:00 PM statement injection, 2:30 press-conference injection; "by the time 2:30 comes you start to see the real move… I am not trading any day or any time before 2:30 on FOMC Wednesday. FOMC morning is an absolutely no-trading day" (GatieTrades). This matches ICT canon's Consolidation-Thursday-Reversal profile anchoring weekly reversals to ~2 PM rate releases (`weekly-profiles-premium-discount.md`). Prop-firm layer: the post-2:30 Q&A whipsaw is where funded traders die after surviving 2:00 (propfirmscan).
- **NFP day itself is tradeable post-9:30 under a "special protocol"**: half risk, expect a 9:30 expansion / double-purge, 10:00–11:00 continuation Silver Bullet as second bite; if the 8:30 candle consumed all nearby liquidity, the data high/low are the only levels left (GatieTrades; consistent with Powell's data-H/L setup).
- **Day-before effects are doctrine everywhere**: day before NFP = no-trade (Gatie: "for sure"; Powell: "sometimes"); ICT canon's Seek-&-Destroy profile prints on NFP/rate-*wait* weeks — shallow both-side stop runs while the market waits. Pre-FOMC Monday/Tuesday = "safety protocol" (reduced expectation, not full skip).
- **Universal mechanical rules** (prop/practitioner consensus, not ICT-specific): no new entries within ~5 min of a red print; hard server-side stops always; prop 2-minute no-open/no-close windows around restricted events at some firms; FOMC = close/halve before 2:30 if holding.

## Details / mechanics — decision table for red days (10:00-window strategy)

Applies to the frozen Dual46 arm as *journal/prep guidance* and to the disc sleeve as actual rules. Dual46's own frozen rules are untouched; rows marked ⚠ are census/backlog flags, not lock changes.

| Calendar situation | Doctrine verdict for the 10:00 trade | Rationale (source) |
| --- | --- | --- |
| **No red news all day** | Normal protocol | Baseline |
| **8:30 red — CPI** | Trade, but flag `counter-CPI?` in journal ⚠ — a 10:00 entry *against* the CPI-move direction fights an all-day-trend tendency | Powell: CPI "keeps making that move the entire day" |
| **8:30 red — NFP (Fri)** | Tradeable post-9:30 at reduced expectation; half-risk is the practitioner norm; expect 1m noise → the 5m context matters more than usual; data H/L = the day's draws | Powell NFP-reversal signature + 1m-RBs-run-through failure mode; Gatie half-risk protocol |
| **8:30 red — PPI / retail / claims** | Normal 10:00 protocol; volatility already injected pre-open is *good* ("that's a good thing" — Gatie) | 8:30 red + 9:30 trade regularly |
| **Red/orange AT 10:00 (ISM, JOLTS…)** | The dangerous case for a strategy whose limit rests at 10:00: don't arm a *fresh* limit into the print window (~9:55–10:05); if the pre-print tape is clear the setup may form early — otherwise wait for post-release structure ⚠ (disc sleeve: hard rule; script arm: census column `news_at_1000?`) | Gatie 10:00 protocol; wick-out risk on the print |
| **9:45 scheduled news** | Same as 10:00-release row | Gatie: "if it's 9:45, do the same thing you would do if it's 10 a.m." |
| **FOMC Wednesday** | Morning = lowest-quality window of the month (market waiting); doctrine consensus is stand down all morning; anything after 2:30 belongs to a different (non-Dual46) playbook | Gatie two-stage protocol; ICT ~2 PM rate-release anchor; prop Q&A whipsaw |
| **Day before NFP** | Skip or minimum expectation; S&D-style shallow both-side runs expected | Gatie hard skip; Powell "sometimes"; ICT S&D profile |
| **Day before CPI / pre-FOMC Mon–Tue** | Reduced expectation ("safety protocol"); the good days are *after* the release | Gatie; Powell London-before-CPI/PPI/NFP skip |
| **London/Asia already expanded very large** | Skip NY per Powell — the day's one big move already happened; expect accumulation | Powell [18:41–19:10] |
| **Any position open into a red print** | Powell holds if in profit toward the draw (10:00 news "helps the position"); prop rules may force flat (2-min rules); hard stop non-negotiable | Gatie/Powell vs prop-firm layer — check the firm's restricted list |

### Claim vs evidence
| Claim | Status |
| --- | --- |
| Powell stand-down list, session-budget rule, NFP/CPI signatures | Powell primary (on tape, Vault transcripts) — **his journal-derived claims, zero published stats** |
| 10:00-print protocol, NFP half-risk, FOMC 2:30 rule | Community practitioner synthesis of ICT calendar teachings — internally consistent, no data |
| ICT canon anchor points (2 PM rate-release Thursday reversal, S&D on news-wait weeks) | ICT canon (Month 07, transcript archived) |
| Any quantified event-day WR/expectancy for these rules | **Does not exist** — the Vault's own event-study pipeline is the only path to numbers |

## APPLICATION TO THE VAULT

1. **The decision table is journal-first, freeze-safe.** For the script arm, add two booleans to the daily row: `red_folder_slot` (none / 8:30 / 10:00 / 2:00) and `counter-CPI?`. May-walk replay can then produce the Vault's own event-day split — the number nobody publishes. No gate changes.
2. **The 10:00-release row is the sleeve's real exposure.** Dual46's limit rests exactly where a 10:00 print wicks. June's latency finding means a fresh arm at 9:58 on an ISM day is the worst-case combination (late arm + print wick). Disc-sleeve rule now; script-arm Stage-0 question later: "skip / delay arming when red-orange news is scheduled 9:45–10:15."
3. **NFP days are structurally *friendly* to the model, per Powell himself** — the NFP move "reverses at market open," which is the shape Dual46 monetizes; the danger is 1m granularity, not direction. This pairs with the 5m-trigger Stage-0 question (`powell/5m-vs-1m-entry-trigger.md`): news days are exactly where Powell's 5m elevation claim should show up in data.
4. **FOMC Wednesdays and day-before-NFP are the cleanest candidate skip days** if the May ledger ever shows event-day bleed — they are the only two slots where all three source layers agree on stand-down.
5. **Never import the half-risk convention silently** — Dual46 sizing is frozen; half-risk on NFP is a disc-sleeve option only.

## Sources

1. **Powell (primary, Vault archive)** — `vault-app/data/powell-transcripts/high-probability-conditions.txt` [18:15–19:10]; `stop-getting-manipulated.txt` [1:02–1:08, 3:43–4:17]; `tick-precision-entries.txt` [18:22–18:31]
2. GatieTrades — "How to READ the Economic Calendar Like ICT" (2026-03-01, YouTube Lm9CqqpKIUY) — month-map: NFP week / CPI week / FOMC week protocols, 10:00-print rules, half-risk convention — https://www.youtube.com/watch?v=Lm9CqqpKIUY
3. ictkillzonetimes.com — killzone news cautions (no fresh entries ±5 min of red prints; news spikes fake MSS/FVG signals) — https://ictkillzonetimes.com/
4. bellsforex.com — catalyst event management (flat-to-event rule, liquidity contraction pre-print, 15–30 min post-event wait) — https://bellsforex.com/trading-guide/trading-during-news-releases.html
5. propfirmscan.com — prop news calendars & event risk (2-minute rules, FOMC 2:30 Q&A whipsaw, hard-stop doctrine) — https://propfirmscan.com/guides/prop-firm-news-trading-calendars-the-ultimate-guide-to-event-risk
6. completetradersedge.com — economic-calendar impact tiers and timing rules — https://completetradersedge.com/forex-economic-calendar-guide/
7. Cross-refs: `ict/weekly-profiles-premium-discount.md` (Thursday 2 PM reversal, S&D weeks), `powell/powell-rb-entry-teachings.md` §7 (news-day 1m failure mode), lane B topic #55 (microstructure quantification)
8. Vault internal — June walk finding: missed A+ setups were latency (arming-into-print interaction)
