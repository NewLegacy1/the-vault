---
topic: limit-order-fill-modeling-queue-position
researched: 2026-07-17
sources: 10
agent-cycle: wave-3
---
# Limit-Order Fill Modeling: CME FIFO Queues, Touch vs Trade-Through, Adverse Selection

## Key findings
- **CME Globex equity index futures (including MNQ) match strictly by price-time priority (FIFO)**: at a given price, the earliest-arriving order fills first; modifying price, increasing quantity, or changing account number sends you to the back of the queue (CME Group, Supported Matching Algorithms).
- **A touch is not a fill.** When price only touches a level, only the front of the queue transacts; a resting order joined late may get nothing even though the chart shows the level traded (FXRISK, "A Touch Is Not a Fill"; NexusFi backtesting guides).
- **The conservative simulation standard is trade-through**: count a limit fill only when price trades at least 1 tick beyond the limit price. Touch-based fill logic in backtest/replay engines is "deeply optimistic" and can manufacture an edge that lives entirely in the execution model (NexusFi, Backtesting Futures Strategies).
- **Fill probability and post-fill return are negatively correlated (adverse selection).** If the next move is against your resting order, it fills with probability ~1; if the next move is in your favor, you may not fill at all. This "negative drift of maker orders" is strongest at short timescales (arXiv 2502.18625, The Market Maker's Dilemma; Menkveld 2013 cited therein).
- **Queue position has measurable dollar value.** For large-tick instruments, the value of a front-of-queue position can be the same order of magnitude as the half-spread (Moallemi & Yuan, Columbia, "A Model for Queue Position Valuation in a Limit Order Book").
- **Published touch-fill estimates are conditional, not universal.** Fill probability at the touch is a decreasing function of the queue ahead of you; a tractable estimate is P(fill on next trade) = P(taker size ≥ queue ahead + own size), read off the CDF of historical aggressive-order sizes (Aligrithm 5.16; arXiv 2403.02572 derives semi-analytical fill probabilities from state-dependent birth-death queue models). There is no honest flat number like "60% of touches fill" — it depends on when you joined and how deep the queue was.
- **Marketable conversion is an EV trade-off, not a failure.** Fill certainty costs roughly the spread plus expected slippage; missing a fill costs the full expected value of the trade. When per-trade EV is multiple R and the slippage cost is a small fraction of R, conversion near the level is systematically favorable (inference from the above sources; see mechanics).

## Details / mechanics
**FIFO mechanics (CME).** CME lists the matching algorithm per product; equity index outrights use FIFO (algorithm code F). During a match event, resting orders at the touched price fill strictly in timestamp order until the aggressor's quantity is exhausted. CME's own example: first order in queue fills fully, second partially, third gets zero "despite offering a price the buyer is willing to pay" (CME matching algorithm docs). Consequences for a retail 1-lot:
- Joining a level seconds before it trades means being behind whatever size accumulated there over minutes — often thousands of contracts on MNQ at round/structural prices.
- A 1-lot deep in the queue only fills if cumulative aggressive volume at that price exceeds everything ahead of it — which usually requires price to *trade through* the level, not just touch it.

**Why the fills you do get are biased (adverse selection).** The market maker literature (arXiv 2502.18625; Moallemi & Yuan; Ayyar, "Queue Priority as Adverse-Selection Exposure") formalizes the asymmetry:
1. Price trades through your limit → you fill with certainty → but "trade-through" is exactly the event where momentum continues against your entry side more often than baseline.
2. Price touches and reverses (the perfect wick rejection) → the queue ahead absorbed the touch → you don't fill → the *best* outcomes are systematically the ones you miss.
This is not bad luck; it is the structural price of providing liquidity. Passive fills = adverse-selection-weighted sample of your setups.

**Estimating touch-fill probability.** With top-of-book data: track displayed queue at your price when you join, deplete it with observed trades/cancels, and you fill when queue-ahead reaches zero (ordersim/Acheron simulator docs describe exactly this pessimistic/conservative fill-model split). Without book data, the trade-size-CDF shortcut (Aligrithm) gives a per-trade fill probability; academic queue models (arXiv 2403.02572) show fill probability decays rapidly for orders even one level away from the best quote.

**Practical conversion rules (synthesized from the above):**
- Decide *before* the trade whether the setup's value lies in the price (limit; accept misses) or in participation (convert; accept slippage). "Missed fills are information. Don't fix them by chasing" applies to unplanned chases, not pre-planned conversion logic (FXRISK).
- A standing rule that converts the resting limit to a marketable order when (a) price comes within N ticks of the limit and the setup trigger is confirmed, or (b) price touches without filling and begins to leave, bounds the worst case at ~1–2 ticks of slippage.
- Alternative: place the limit 1 tick *inside* the wick extreme. You give up 1 tick of price on every fill but convert many would-be touches into trade-throughs relative to your order.

## APPLICATION TO THE VAULT
- **The 06-12 one-tick miss is the textbook FIFO outcome, and it will recur at a predictable rate.** A limit resting exactly at a 1-minute rejection-block wick extreme is, by construction, at a price the market only *touched* once before rejecting. FIFO says only queue-front orders filled there. Expect the miss rate to concentrate in the *best* setups (cleanest single-touch rejections) — precisely matching the June experience where both fill failures were high-grade setups.
- **EV math says convert, almost always.** Their nominal geometry is 1:5. Cost of converting at touch-failure: ~1–2 ticks = 0.25–0.5 MNQ points = $0.50–$1.00/contract; on a 20-point stop that is 1.25–2.5% of one R. Cost of a missed winner: +5R gone. Even if only 40% of missed setups would have won, conversion buys back +2R of expectation per event for ~0.02R of slippage. The 06-12-style fallback-to-market behavior should be a *codified rule*, not an improvisation.
- **Replay fill accounting must use trade-through.** Any Stage-0 or Dual46 tally that counts a fill when the 1-minute wick merely touched the limit price inflates both fill rate and win rate (missed touches are disproportionately winners, so touch-counting steals live-unattainable wins into the sample). Rule for the journal: entry counts only if the bar traded ≥1 tick beyond the limit, OR the trade was actually converted to marketable — and log which of the two it was.
- **Track a fill-mode column.** With 15–17 candidate events per month, 3–6 months of logging (limit-clean / limit-trade-through / converted / missed) is enough to estimate the true touch-fill and miss rates for this specific setup, replacing generic estimates with house data.
- **Adverse-selection check for the scorecard:** compare win rate of trade-through fills vs converted fills once n permits. If trade-through entries underperform, that is the maker's negative drift showing up in their own book — an argument for defaulting to conversion on A-grade setups rather than resting at the extreme.

## Sources
1. CME Group — Supported Matching Algorithms (Client Systems Wiki): https://www.cmegroup.com/confluence/display/EPICSANDBOX/Supported%2BMatching%2BAlgorithms
2. CME Group — CME Globex Matching Algorithm Steps: https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457218521
3. Moallemi & Yuan — A Model for Queue Position Valuation in a Limit Order Book (Columbia Business School): https://business.columbia.edu/sites/default/files-efs/pubfiles/25461/queue-value-2016.pdf
4. The Market Maker's Dilemma: Fill Probability vs. Post-Fill Returns (arXiv 2502.18625): https://arxiv.org/abs/2502.18625
5. Ayyar — Queue Priority as Adverse-Selection Exposure: https://www.aryanayyar.com/queue-priority-adverse-selection-exposure.pdf
6. Fill Probabilities in a Limit Order Book with State-Dependent Stochastic Order Flows (arXiv 2403.02572): https://arxiv.org/abs/2403.02572
7. NexusFi Academy — Backtesting Futures Strategies (fill assumptions / execution bias): https://nexusfi.com/a/platforms/backtesting-futures-strategies
8. NexusFi Academy — Backtesting Trading Strategies (trade-through rule, slippage budgets): https://nexusfi.com/a/automation/backtesting-trading-strategies
9. Aligrithm — 5.16 Fill Probability from Trade Size CDFs: https://aligrithm.com/fill-probability-from-trade-size-cdfs/
10. FXRISK Manual — A Touch Is Not a Fill / The Market Is a Queue: https://fxrisk.ai/truth/a-touch-is-not-a-fill/
