---
topic: auction-order-flow-tv-premium-vs-sierra-prop · researched: 2026-07-21 · sources: 8 · agent-cycle: adhoc-of-tv-sierra-2026-07-21
status: active
---
# Auction / order flow — TV Premium first, Sierra later (prop path)

> Learn to read auction data **on TradingView Premium you already pay for**. Buy Sierra only when a **pre-registered** Stage-0 hypothesis needs TPO / depth / Numbers Bars fidelity TV cannot give. Dual46 freeze stays untouched.

## Key findings

- **EVIDENCE (TV Help / Blog 2025–2026):** Premium+ unlocks native **Volume Footprint** chart type + Pine `request.footprint()` (buy/sell vol, delta, POC, VA, row imbalances). Also: Session / Visible Range / Fixed Range / Anchored Volume Profile (plan matrix — verify current pricing page).
- **EVIDENCE (TV footprint calculation):** TV categorizes “buy/sell” from **intrabar OHLC direction**, not true bid/ask aggressor prints. Useful for learning + countable rules; **not identical** to Sierra Numbers Bars tick aggressor logic. Do not mix feeds in one Stage-0 sample.
- **EVIDENCE (Sierra packages):** Advanced / Integrated Advanced (~Pkg 5/11, ~$36–46/mo software) for TPO + Numbers Bars; CME/Denali fees extra; Pkg 12 adds MBO (~$56). DDY (~$45/mo) optional study pack — not required.
- **CLAIM:** For Vault prop work, OF value is **location + trigger + invalidation + path risk**, not “who is in control” vibes. Hierarchy unchanged: path MC / `E[$/wk]` → trade EV±CI → geometry.
- **CLAIM:** DOM/heatmaps are the last layer to learn — resting size spoofs/pulls; beginners over-trade them. Footprint + session VP first.

## What Premium already unlocked (use this before Sierra)

| Tool | Where | Use |
|---|---|---|
| Volume Footprint chart | Chart type dropdown | Per-bar buy/sell distribution, POC, VA, imbalance lines, bar delta |
| `request.footprint()` | Pine v6 | Measure / alert / eventual export of delta·POC·imbalance events |
| Session / VR / FR Volume Profile | Indicators + drawing tools | Prior VAH/VAL/POC, HVN/LVN maps |
| CVD | Built-ins / community | Confirm / diverge / trap **at pre-marked levels only** |
| Bar Replay | TV | 2-week learn protocol (below) |

**Still weak / missing on TV vs Sierra:** true TPO letter profiles + single prints, Market Depth Historical Graph, MBO/iceberg tooling, L2 DOM replay fidelity, Numbers Bars aggressor tick model.

## How to read (minimum useful set)

1. **Profile first:** open vs prior VAH/VAL/POC · ONH/ONL · LVN vs HVN — *accept or reject?*
2. **Footprint at the level:** large aggression + no displacement = absorption candidate; thin push = exhaustion candidate; stacked imbalance + fail-back = trap.
3. **CVD:** only classify confirm / diverge / trap when the **level was marked before** the event.
4. **DOM later:** “did resting size absorb, pull, or break?” — never “big bid = support.”

Absorption vs exhaustion definitions: [[order-flow-absorption]]. Profiles: [[volume-profile-poc-vah-val]], [[tpo-market-profile-basics]].

## Prop applicability (Topstep-style)

| Pattern family | Prop fit | Why |
|---|---|---|
| Profile reclaim / failed auction at VAH·VAL·LVN | Best Stage-0 shape | Levels pre-markable; exportable |
| Footprint absorption at pre-marked level | Possible Stage-0 if delta+close rules are objective | n often small; TV≠Sierra delta |
| Imbalance stacks / tape feel / DOM spoof | Discretionary only | Hard to automate; selection bias |
| Beautiful screenshots | Never income | No path MC |

**Why OF often fails prop math:** tiny n · selection bias · no Deep BT path · trail-hostile loss clusters · discretionary variance under eval pressure.

## Three product paths (pick lane; don’t blend ledgers)

| Path | Role | Dual46 |
|---|---|---|
| **A — Eyes-only** | Journal OF at Dual46 RB tap / leave | Freeze intact; census columns only |
| **B — Separate Stage-0 OF sleeve** | One pre-registered rule → EV → path MC | Never mutates Dual46 |
| **C — Regime-split disc** | Two discretionary sleeves by regime (e.g. RTH Dual46 vs ETH/midnight auction) | Separate P&L, sizing, daily stops |

Active Lab Stage-0 remains whatever `sim-queue.md` says (do **not** open a parallel OF Stage-0 until that slot frees). Parked sketches: [[../../strategy-dev/60-track-b/parked-of-auction-sleeve-sketches]].

## 2-week learn protocol (TV Premium only — no Sierra spend)

**Constraints:** MNQ · no Dual46 Pine edits · no income language · levels marked **before** events.

**Layout:** 5m + 1m · Volume Footprint · Session VP · Fixed Range VP · CVD · prior RTH H/L + VAH/VAL/POC · ONH/ONL · RTH open.

| Days | Focus |
|---|---|
| 1 | Profile map only — accept/reject each pre-marked level |
| 2 | Add bar delta at levels — confirm / diverge / trap / unclear |
| 3 | Absorption-only study at pre-marked levels |
| 4 | Imbalance stacks — most are **not** trades |
| 5 | CVD context; week review: which levels were cleanest |
| 6 | Replay one RTH day; pause → decide long/short/skip → score |
| 7 | Profile reclaim practice only |
| 8 | Overnight / midnight levels only |
| 9 | Absorption practice with objective stop candidate |
| 10 | Write **one** candidate rule or explicitly “no Stage-0 yet” |

Ledger columns: level-known-before? · profile context · delta class · footprint class · accept/reject · objective stop? · next magnet target?

## Sierra buy gate (only if blocked)

Pay Sierra Advanced+data when a **registered** hypothesis needs: true TPO single prints · historical depth/heatmap · DOM replay · MBO · aggressor Numbers Bars. Not for “more signals.” DIY chartbook: [[sierra-chart-tpo-volume-diy-template]]. Skip DDY until native stack is fluent.

## APPLICATION TO THE VAULT

1. **Start on Premium now** — footprint + session VP; update old assumption that TV cannot do footprint (it can; aggressor model differs).
2. **Dual46:** Path A census only during May walk — `open_vs_prior_VA`, `absorp_at_tap?` optional; no lock edits.
3. **Midnight RB forward-test** (against bias · 1:4 · ~73pt): log as **disc**; feed Candidate 1 sketch when OF Stage-0 slot opens — not Dual46 scorecard.
4. **No Lab / income claim** from OF until toward Stage-0 + path MC `E[$/wk]`.
5. Hub: [[../hubs/hub-auction]].

## Sources

1. TradingView — Volume footprint charts complete guide — https://www.tradingview.com/support/solutions/43000726164-volume-footprint-charts-a-complete-guide/
2. TradingView Blog — Volume footprints in Pine (`request.footprint`) — https://www.tradingview.com/blog/en/volume-footprints-in-pine-scripts-56908/
3. TradingView Blog — Volume footprint chart type — https://www.tradingview.com/blog/en/new-chart-type-volume-footprint-44399/
4. TradingView — Session Volume Profile — https://www.tradingview.com/support/solutions/43000703072-session-volume-profile/
5. Sierra Chart — Service packages / pricing — https://www.sierrachart.com/index.php?page=doc/Packages.php
6. SCS — Sierra Footprint / Numbers Bars guide — https://www.scstudies.com/blog/sierra-chart-footprint-complete-guide
7. Vault companions: [[order-flow-absorption]], [[volume-profile-poc-vah-val]], [[tpo-market-profile-basics]], [[sierra-chart-tpo-volume-diy-template]]
8. Agent research cycle `adhoc-of-tv-sierra-2026-07-21` (literacy + Stage-0 sketches)
