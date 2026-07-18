---
topic: ops-copier-limit-entry-divergence-mechanics
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneB
---
# Multi-Account Copier Execution Mechanics: LIMIT-Entry Divergence Numbers, Modes, and Mitigation Practice

*Deep-dive extension of `trade-copiers-prop-accounts.md` (which established: fill divergence, not compliance, is what kills copy-stacks). This note adds the vendor-published divergence numbers, the mode decision tree for a resting-limit strategy, and the measurement/mitigation SOP.*

## Key findings

- **The one structural exemption that favors Dual46: for a RESTING limit placed well before the trigger, copier latency is irrelevant.** Tradecovex's latency guide states it plainly: "if you are placing a limit order 20 ticks off the current market and waiting for price to come to you, the fill at 40 ms and at 3 ms are identical — the order is sitting in the book until price arrives." In Orders Mode, a pre-staged Dual46 limit mirrors to all followers *minutes before* 10:00; every account's order rests at CME with its own (nearly simultaneous) queue timestamp. **The copier-latency horror stories apply to fill-chasing, not to pre-staged limits.** The residual divergence is queue-position noise (adjacent timestamps at the same price), which matters only on exact-touch fills — the same FIFO problem the leader already has.
- **CLAIM (vendor tables, unaudited but internally consistent): fill-mirroring (Executions Mode) slippage per follower entry scales with copier latency:** ~0.1 ticks at 1.6 ms (local), ~0.5 at 20 ms (fast cloud), ~1.5 at 50 ms (typical cloud), ~3 ticks at 100 ms (poor cloud/home) on NQ in normal session (Copilink); cloud-relay at ~150 ms = 0.5–1.5 ticks per entry, 1–3 round trip, **5–10 tick spikes during news** (tradecovex). Affordable Indicators' NinjaTrader-local copier estimate: 1–2 ticks normal, more on releases. Treat as order-of-magnitude — all three are copier vendors quoting their own advantage.
- **The two modes trade the exact risks the fill-modeling note predicts:** *Orders Mode* (mirror the limit) → followers keep limit economics but can miss fills the leader got ("a limit that fills on the leader may not fill on a follower a few hundred milliseconds later" — tradecovex bracket guide); partial fills create position mismatches. *Executions Mode* (market orders on leader fill) → everyone participates, followers pay the latency-slippage table above and lose the limit-entry edge on N−1 accounts. Vendor consensus for 10+ account stacks is Executions Mode "for reliability" — **but that consensus is built for market/momentum entries, not wick-anchored limits.**
- **For a pre-staged limit strategy the mode answer inverts: Orders Mode, staged early, is strictly better** — because (a) the latency exemption above applies, (b) the entry price *is* the edge (a market-converted follower entry 1–3 ticks late has a different R geometry on a 20–30 pt stop), and (c) divergence appears as *missed fills* (measurable, bounded, already the leader's own risk) rather than *degraded fills* (which silently corrupt every follower's expectancy). The exception: the conversion rule — a converted (marketable) leader order copies as a chase; that specific event inherits the Executions-Mode slippage table.
- **Measured-divergence protocol exists and is cheap (tradecovex):** brokers timestamp fills to the millisecond; latency = follower fill time − leader fill time, per trade, from order history. Divergence stats worth keeping: per-follower fill-lag ms, fill-rate delta on limits (follower fills ÷ leader fills), entry-price delta ticks. "If follower fills are 100+ ms behind lead on average, you are running a cloud relay whether the marketing says so or not."
- **No independent (non-vendor) published study of limit-order fill-rate divergence across copied futures accounts was found** — the "one fills, one doesn't" rate for orders resting simultaneously at the same price is queue-depletion-dependent and nobody publishes it. House protocol: it equals the difference in fill outcomes between N accounts' resting orders, directly observable from day one of any 2-account test.

## Details / mechanics

**Divergence taxonomy for a Dual46 stack (Orders Mode, pre-staged):**

| Divergence source | Mechanism | Expected size | Mitigation |
|---|---|---|---|
| Queue position | Followers' limits join FIFO ms after leader's | Only bites on exact-touch fills; trade-throughs fill all | Stage early (arm phase); accept; or 1-tick-inside placement (fills all accounts on touch) |
| Missed fill split | Touch depletes queue between leader & follower orders | The "one fills, one doesn't" event; rate unknown, measurable | Conversion rule per account: any account whose limit misses while others fill converts immediately (bounded 1–2 tick cost) |
| Conversion chase | Converted leader order → market chase on followers | Executions-table: 0.5–3 ticks by copier class | Local copier (1–15 ms) if stacking; accept on 2–3 accounts |
| Bracket propagation | SL/TP modifications may not mirror on some products | Catastrophic if unnoticed (naked position) | Verify copier replicates bracket *modifications*, not just entries, in sim; never modify mid-trade anyway (Dual46 doesn't) |
| Partial fills | 10-lot leader partially filled → follower sizing mismatch | Rare at MNQ depth for 10 lots | Log and reconcile EOD |
| News spike | Copier + platform latency both blow out | 5–10 ticks on conversions | The stand-down note's T−2m→T+1m rule applies stack-wide |

**Worked EV check — does Executions Mode ever make sense for Dual46?** Follower market entry at leader-fill +1.5 ticks (typical cloud) on a 25-pt (100-tick) stop: R degrades ~1.5%, and the 5R target degrades ~7.5 ticks of R-multiple — small but systematic; across a 2-account stack it is a permanent ~1–2% expectancy tax *plus* the loss of miss-information (you never learn the true fill rate). Versus Orders Mode: divergence cost = occasional single-account missed winner, bounded by the per-account conversion fallback at 1–2 ticks. Orders Mode + per-account conversion dominates unless/until measured miss-splits exceed ~10–15% of fills — a threshold the house data will settle within two months of a 2-account test.

**Infrastructure implication (only if stacking):** the copier-class table says local (NinjaTrader add-on or same-machine copier, 1–15 ms) vs cloud (20–150 ms) is a 0.5–3 tick difference *on conversions and chases only*. At Dual46's one trade/day with rare conversions, cloud-copier convenience (Tradesyncer-style, ~$50/mo, runs 24/7, no VPS) likely beats local for operational simplicity — the opposite of the scalper-oriented vendor advice, again because pre-staged limits are latency-exempt.

## APPLICATION TO THE VAULT

- **Standing decision, recorded: when a second account happens, copier runs Orders Mode with pre-staged brackets, staged in the arm phase (≥ 1 min before the window).** The strategy's own architecture (pre-computed level, minutes-early staging) is exactly the shape that neutralizes copier latency. Executions Mode would voluntarily re-import the slippage the limit entry exists to avoid.
- **Extend the conversion rule to per-account form now (one sentence, costs nothing pre-stack):** "If any account's limit remains unfilled while another account's fills, convert the unfilled account immediately (aggressive limit)." This converts the worst divergence mode (split trade histories) into a bounded 1–2 tick cost and keeps the stack's decision-history identical.
- **Journal fields when (and only when) a stack exists:** per account per trade — `fill_lag_ms` (from broker timestamps), `fill_mode` (already defined), `entry_delta_ticks` vs leader. The "one fills, one doesn't" rate = difference in the fill-rate column between accounts; no new machinery needed beyond the calibration protocol's existing columns.
- **Pre-stack gate (extends the copiers note's "nothing to buy yet"):** before any second account, the single-account calibration data must show (a) limit fill rate and (b) conversion frequency — these two numbers parameterize the Orders-vs-Executions EV check above with house data instead of vendor tables.
- **Bracket-modification verification joins the order-types kill-test:** in sim, modify a leader SL and confirm the follower's SL moves. Dual46 never modifies mid-trade, but the disc sleeve might — and an unmirrored SL is the one catastrophic copier failure.

## Sources

1. Copilink — Latency Arbitrage in Multi-Account Futures (latency→slippage table 1.6/20/50/100 ms; limit-boundary miss mechanics; vendor): https://copilink.com/articles/latency-arbitrage-why-milliseconds-matter-multi-account-futures
2. tradecovex — Trade Copier Latency (resting-limit latency exemption; 0.5–1.5 ticks/entry at 150 ms cloud; 5–10 tick news spikes; timestamp measurement protocol): https://tradecovex.com/guides/trade-copier-latency
3. tradecovex — Bracket Trade Copier 2026 (Executions vs Orders mode trade-offs; ATM propagation caveat; partial-fill mismatch): https://tradecovex.com/guides/bracket-orders-trade-copier
4. Affordable Indicators — Executions Mode vs Orders Mode, NinjaTrader Trade Copier (1–2 ticks normal / more on releases; mode-switch guidance; vendor): https://affordableindicators.com/articles/executions-mode-vs-orders-mode-ninjatrader-trade-copier/
5. MT4Copier — Why Speed Matters in Trade Copying (local vs cloud 20–100 ms routing overhead; VPS-adjacent 1–5 ms; FX but mechanism-identical; vendor): https://www.mt4copier.com/why-speed-matters-in-trade-copying-boost-profits/
6. Vault notes — `trade-copiers-prop-accounts.md` (base ecosystem/compliance), `limit-order-fill-modeling-queue-position.md` (FIFO/touch mechanics the divergence rides on), `ops-mnq-slippage-market-orders-open.md` (aggressive-limit conversion): internal
