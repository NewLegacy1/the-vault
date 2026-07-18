---
topic: mnq-vs-nq-instrument-comparison
researched: 2026-07-17
sources: 9
agent-cycle: cycle2-wave1
---
# MNQ vs NQ: Total Cost per Unit of Risk, Fill Quality, and Sizing Granularity

## Key findings

- **The contracts are fungible in price but not in cost structure.** MNQ = $2/pt ($0.50/tick), NQ = $20/pt ($5/tick), identical 0.25-pt tick, same Globex engine, same index; 10 MNQ = 1 NQ in notional (CME FAQ; CFTC filing confirms MNQ aggregates into NQ at 10:1 for position limits). Fact.
- **All-in round-turn cost at 1-NQ-equivalent size: ~$13–19 for 10 MNQ vs ~$3.90–5.80 for 1 NQ — micros cost roughly 3–4× more in commissions+fees for the same notional.** NinjaTrader 2026 all-in per side: MNQ $0.65/$0.85/$0.95 (Lifetime/Monthly/Free plans), NQ $2.18/$2.58/$2.88. AMP all-in: MNQ $0.60/side, NQ $1.95/side. Itemized: exchange+NFA is $0.37/contract on MNQ vs $1.40 on NQ; clearing $0.19 both (NinjaTrader commission PDF, current Jan 2026; Tradovate 2026 pricing page). Fact, current.
- **Spread cost at 1 tick is identical in dollars at equal notional**: crossing a 1-tick spread costs 10 × $0.50 = $5.00 on 10 MNQ and 1 × $5.00 = $5.00 on 1 NQ. The cost difference is therefore *entirely* commissions, except when MNQ's spread widens to 2 ticks (overnight, news spikes) while NQ holds 1 tick — then MNQ pays double (PropScorer; Volatility Box; Comborb). Fact + practitioner consensus.
- **Fill quality: during RTH both trade at 1-tick spreads and retail size (1–20 MNQ) fills with negligible slippage; NQ's deeper book only matters for news-spike market orders and sub-minute scalps** (TraderVerdict funded-account experience; PropScorer; Comborb). Practitioner reports, not hard data — no rigorous published micro-vs-mini fill-quality study was found (see companion microstructure note).
- **The decisive factor for this user is granularity: with fixed $150 risk and 5–35 pt stops, NQ cannot take a single trade.** 1 NQ at a 10-pt stop risks $200 (33% over budget); at 35 pts, $700. MNQ flexes 2–15 contracts across the same stop range. Arithmetic, not opinion.
- **Practitioner rule of thumb (TraderVerdict): stay on micros while standard size is <5 MNQ; blend NQ in only when routinely trading 10+ MNQ *at fixed contract counts*.** That heuristic assumes constant sizing — under a contracts-flex-to-stop rule the granularity value persists at any average size. Opinion, flagged as such.

## Details / mechanics

**Cost stack per contract, round turn (2026 numbers):**

| Component | MNQ | NQ | Source |
|---|---|---|---|
| Exchange + NFA fees | $0.74 | $2.80 | NinjaTrader itemized (per side ×2) |
| Clearing | $0.38 | $0.38 | NinjaTrader itemized |
| Broker commission (free plan) | $0.78 | $2.58 | Tradovate/NinjaTrader Free tier |
| **All-in RT (free tier)** | **$1.90** | **$5.76** | |
| All-in RT (AMP, cheapest found) | $1.20 | $3.90 | AMP all-in quote |

Fee note: CME raised micro equity exchange fees over the years (the 2019 launch rate was $0.04–0.35 territory; the current non-member Globex rate embedded in the $0.37/side exchange+NFA line is ~$0.35). CME amended fee schedules effective April 1 and June 29, 2026 — the NinjaTrader table is dated Jan 2026, so treat exact pennies as **possibly stale by 1–2 quarters**; re-check the CME fee schedule or broker table before any decision that hinges on <$0.10/contract. Prop-firm data feeds route through Rithmic/Tradovate and typically land in the same $1.00–1.50 RT/MNQ zone; Take Profit Trader publishes ~$0.50/RT micros, $5/RT minis (H2T Funding table — verify on TPT's own page).

**Worked table — fixed $150 risk, contracts flex to stop (MNQ $2/pt, NQ $20/pt).**
Assumptions: all-in $1.60 RT/MNQ, $4.40 RT/NQ (mid-range retail); 1 tick paid on entry (limit-to-market conversion); winner = 1:5 (5× stop distance); costs = commissions + entry tick.

| Stop | MNQ size (risk) | NQ size (risk) | MNQ total cost | Cost % of 1:5 winner | Cost % of loser |
|---|---|---|---|---|---|
| 10 pt | 7 MNQ ($140) | 0 — 1 NQ = $200, over budget | $11.20 + $3.50 = $14.70 | $700 gross → **2.1%** | $140 → **10.5%** |
| 20 pt | 3 MNQ ($120) | 0 — 1 NQ = $400 | $4.80 + $1.50 = $6.30 | $600 → **1.1%** | $120 → **5.3%** |
| 30 pt | 2 MNQ ($120) | 0 — 1 NQ = $600 | $3.20 + $1.00 = $4.20 | $600 → **0.7%** | $120 → **3.5%** |

At a larger risk budget where NQ becomes usable ($300 risk, 15-pt stop → 1 NQ or 10 MNQ): 10 MNQ costs ~$21 (comm $16 + $5 tick) vs 1 NQ ~$9.40 (comm $4.40 + $5 tick). NQ saves ~$11.60/trade — **0.8% of the 1:5 winner ($1,500), 3.9% of the loser ($300)**. That is the entire economic case for NQ at this account scale.

**The granularity math.** NQ sizing steps are 10-MNQ-equivalents: the feasible risk ladder at a 20-pt stop is $0 → $400 → $800. MNQ steps are $40 each. With a $2.5k trailing buffer, one NQ trade at a 25-pt stop consumes 20% of the buffer; the fixed-$150 rule keeps every trade at 6%. Rounding loss is also asymmetric: MNQ rounds $150 down to $120–140 (utilization 80–93%); NQ rounds to zero or to $200+ (utilization 0% or forced over-risk).

## APPLICATION TO THE VAULT

**Do not switch. NQ is arithmetically incompatible with the current risk rule.** Under fixed $150/trade risk with 5–35 pt stops, 1 NQ only fits stops ≤7.5 pts — the thin end of the stop distribution, and exactly the wick-out-prone stops the sizing note already flags. Everywhere else NQ forces a choice between skipping the trade and risking 1.3–4.7× budget. On a $2.5k trailing buffer, the forced over-risk is the kind of variance that breaches trailing drawdown; the position-sizing note's core finding (bankroll = buffer, not balance) makes NQ's $200–700 minimum risk per trade equivalent to betting 8–28% of bankroll per trade with no ability to modulate.

Concrete numbers for the decision:
- The commission penalty for staying on micros is ~$1.16 per MNQ RT vs NQ-equivalent, i.e. **~$8–12 per trade at 7–10 MNQ, roughly $130–180/month at ~15 trades/month**. Against a 1:5 geometry where a single winner grosses $600–700, that is ~2 losers' worth of friction per year of trading — real, but an order of magnitude smaller than one forced over-risk NQ loss.
- If the buffer grows (e.g. $7.5k+ locked at breakeven on a 150k account) and average size crosses ~15–20 MNQ, revisit with a **hybrid**: 1 NQ core + MNQ remainder (e.g. target 14 micros → 1 NQ + 4 MNQ) captures most of the commission saving while keeping $40-step granularity on the flex portion. Not before.
- Powell trading NQ is not evidence for NQ: his account scale and (likely fixed) sizing regime differ. The signal to copy is the levels, not the instrument.
- Cheap optimization available now: commission plan choice matters more than instrument choice. Moving from a free tier ($0.95/side) to AMP-style all-in ($0.60/side) or a Tradovate monthly plan saves $0.20–0.70/MNQ RT — at 100+ MNQ round turns/month that is $20–70/month for zero behavioral change. (Tradovate's own break-even math: monthly plan needs ~495 micro RTs/month to beat free — count contracts, not trades, so 15 trades × 10 lots = 150 RTs; likely stay on free/AMP.)

## Sources

1. CME Group — Micro E-mini Equity Index FAQ (specs, tick values, fee schedule pointer) — https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html
2. CME Group — Clearing & Trading Fees hub (2026 fee schedule changes eff. Apr 1 / Jun 29, 2026) — https://www.cmegroup.com/company/clearing-fees.html
3. NinjaTrader — Futures Commissions PDF (itemized exchange/NFA/clearing + plan commissions, MNQ vs NQ, dated 2026) — https://ninjatrader.com/PDF/ninjatrader_futures_commissions.pdf
4. Tradovate — Pricing (2026 per-side commissions by plan; retirement of $0-commission model) — https://www.tradovate.com/pricing/
5. AMP Global — Exchange-Traded Futures all-in price quote (MNQ $0.60, NQ $1.95 per side) — https://commissions.ampglobal.com/exchange-traded-futures-price-quote
6. CFTC filing (CME) — MNQ aggregates 10:1 into NQ for position limits; micro fee schedule excerpt — https://www.cftc.gov/filings/ptc/ptc041519cmedcm001.pdf
7. TraderVerdict — Trading the Micro Nasdaq (funded-account fill-quality experience; when-to-switch heuristic) — https://traderverdict.com/blog/trading-mnq-micro-nasdaq
8. PropScorer Academy — Mini vs Micro Futures (spread/depth comparison, RTH vs overnight) — https://www.propscorer.com/academy/mini-vs-micro-futures
9. Volatility Box — NQ Futures Volatility (commission-as-points comparison: 0.75 pts MNQ vs 0.225 pts NQ RT; afterhours spread table) — https://volatilitybox.com/research/nq-futures-volatility/
