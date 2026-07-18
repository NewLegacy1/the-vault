---
topic: ops-order-types-prop-platforms
researched: 2026-07-18
sources: 8
agent-cycle: cycle3-laneB
---
# Order Types on Prop Platforms 2026: Server-Side vs Client-Side Brackets, Stop-Limit vs Stop-Market, OCO Reliability

*Extends `execution-latency-reaction-time-replay-realism.md` ("make the bracket native and server-side") with platform-by-platform specifics for the stacks the major prop firms actually run.*

## Key findings

- **Who runs on what (2026):** Apex, MFFU, Tradeify, OneUp → **Tradovate-brokered** (Tradovate web/mobile, NinjaTrader via native connection, TradingView via Tradovate integration; Rithmic unavailable at Apex-Tradovate stacks though Apex still offers a Rithmic route). Topstep → **TopstepX (ProjectX)** exclusively for day-to-day; ProjectX platform tech is Topstep-ecosystem-exclusive as of 2026. Earn2Trade and some others → **Rithmic** (R|Trader Pro, or NinjaTrader/Sierra/Quantower via Rithmic plugin). (Corroborated: copier-ecosystem mapping in the trade-copiers note + Apex's own Rithmic-vs-Tradovate pages + TradoxVPS.)
- **All three stacks offer server-side OCO — but not by default everywhere.** Tradovate: chart-trader bracket orders are stored server-side (cloud) and survive disconnects. Rithmic: OCO is enforced on Rithmic's servers at the exchange-adjacent layer — the strongest guarantee; brackets stay live if the PC dies. TopstepX: **must be switched on** — the default "Position Brackets" mode aggregates TP/SL per position; "Auto OCO Brackets" (Settings → Risk Settings) links TP/SL per entry order server-side. (Damn Prop Firms OCO glossary; TopstepX help center — primary; Apex Rithmic-vs-Tradovate pages.)
- **Client-side OCO is the failure mode to engineer out.** NexusFi (citing @Fat Tails from a NinjaTrader outage thread): "in most cases OCO orders are not native exchange orders — the OCO functionality is controlled by the trading front-end or the broker"; front-end OCO can leave both legs live (or both filled) if the connection drops or the cancel race loses during a news spike. NinjaTrader ATM strategies specifically are *local* (client-managed) unless the broker's server-side mode is used — an ATM on a dying PC stops managing the trade. Verify per setup, before going live: "if the broker hedges on whether OCO is server-side, that is your answer."
- **Stop-market beats stop-limit for the protective leg — uniform recommendation.** A stop-limit does not fill when price gaps through the limit — exactly the fast-tape scenario a 10:00-window MNQ strategy must survive; the slippage cost of stop-market is "the cost of certainty" (NexusFi bracket guide). TopstepX's Position-Bracket mode uses stop-market for all SLs (good); its Auto-OCO mode listed trailing/break-even/stop-limit as "coming soon" as of the help-center snapshot — i.e. SLs there are stop-market today. ProjectX's API enum shows StopLimit exists in the schema (type 3) but platform exposure lags.
- **Platform-native brackets (parent → children on fill) beat manual OCO assembly**: children only transmit after the parent fills, so a rejected/cancelled entry cannot orphan a naked stop or target working in the market (NexusFi). Tradovate chart brackets, TopstepX Auto-OCO, and Rithmic bracket tickets all implement this; hand-building three separate orders does not.
- **Latency differences between stacks are real but irrelevant to this strategy's entry (resting limit = zero latency), and mildly relevant to the conversion order**: Rithmic's DMA path is quoted 40–90 ms faster than Tradovate's cloud aggregation during high-volatility events (Apex's own comparison page — marketing-tinged but directionally consistent with architecture). For one conversion order per day on MNQ, 40–90 ms ≈ well under a tick most of the time; stability and server-side brackets dominate the platform choice, not speed. (Consistent with the latency note: manual traders can't use sub-100 ms gains.)
- **Apex mandates bracket-attached stops since 2026-03-01** (landscape note) — so on Apex the server-side bracket isn't just best practice, it's compliance.

## Details / mechanics

**Stack comparison for the Dual46 workflow (entry limit + stop + capped target, one trade/day):**

| | Tradovate (Apex/MFFU/Tradeify) | TopstepX / ProjectX (Topstep) | Rithmic stack (R|Trader / NT-via-Rithmic) |
|---|---|---|---|
| Bracket residency | Tradovate cloud servers (survives client loss) | ProjectX servers — Auto-OCO mode only | Rithmic servers (strongest; exchange-adjacent) |
| Default mode caveat | Chart-trader bracket must be configured with TP/SL before entry | **Default = Position Brackets; switch to Auto OCO in Risk Settings** | Use the bracket section of the order ticket, not manual legs |
| SL order type | Stop-market (configurable) | Stop-market (stop-limit "coming soon") | Stop-market recommended; stop-limit available |
| TradingView execution | Native integration (their charting = TradingView already) | No TV execution; TV alerts via 3rd-party bridges only | No native TV execution |
| API for automation | REST/WebSocket (OAuth) | ProjectX Gateway API (documented order/bracket schema) | R API+ (broker-gated) |
| Scaling behavior | Brackets per entry | Position mode aggregates to avg price; Auto-OCO keeps per-entry TP/SL | Per-ticket |

**OCO race condition, concretely:** with client-side OCO during a print, price can trade through both the stop and the target inside the cancel-propagation window → both legs fill → position flips instead of flattening. Server-side OCO cancels atomically at the server; Damn Prop Firms' glossary calls server-side "essentially failsafe" and flags client-side as the news-spike hazard. For a strategy whose window contains 10:00 ET releases, this is not theoretical.

**Irreducible checklist before first live-sim session (any platform):**
1. Confirm in writing (help center / support ticket) that the bracket TP+SL live server-side for the exact platform + connection combo used.
2. Confirm the SL leg is stop-MARKET.
3. Kill-test it: place a sim bracket, then kill the platform process / disconnect the network; verify from a second device (mobile app) that the working orders persist.
4. Confirm what happens to children if the parent limit is cancelled (should auto-cancel; verify).
5. On TopstepX: switch to Auto OCO Brackets before session 1 and save the bracket preset (stop ticks + target ticks).
6. On Apex: bracket-attached stop is mandatory — a bare entry gets rejected; preset accordingly.

## APPLICATION TO THE VAULT

- **Decision simplifier: the user charts on TradingView → Tradovate-brokered firms (MFFU, Apex) let them execute from the same TradingView chart with server-side brackets.** Topstep forces a second platform (TopstepX) with a different DOM/chart-trader and a settings trap (Position vs Auto-OCO). That is a real switching cost during the calibration month — factor it into firm choice alongside the landscape note's rule ranking.
- **The Dual46 bracket preset, written once per platform:** entry = LIMIT at RB level; SL = stop-market at block-extreme+buffer; TP = limit at min(5R, 100 pt); all as ONE native bracket. Add the conversion variant: aggressive limit entry (per the slippage note) with the same attached children.
- **Run the 6-item checklist above as a pre-live gate** and log the kill-test result in the journal. The disconnect test is 10 minutes and permanently answers the client-vs-server question for the actual setup, superseding all vendor claims.
- **Never stop-limit on the protective leg.** If a platform preset ever defaults to stop-limit (or a future TopstepX update makes it selectable), the SOP line is: protective stop = stop-market, always; slippage there is budgeted (1–2 ticks, slippage note), a no-fill is not.
- **The conversion order is the only latency-sensitive element — and it doesn't justify Rithmic complexity.** One discretionary marketable order/day on MNQ gains nothing actionable from 40–90 ms; take the Tradovate/TradingView integration and spend the attention on the calibration metrics instead.

## Sources

1. Damn Prop Firms — OCO Order glossary (server-side vs client-side cancel race, per-platform bracket residency, news-spike double-fill hazard): https://damnpropfirms.com/glossary/oco/
2. NexusFi Academy — Bracket Trading for Futures (native vs manual brackets, orphan-order mechanics, stop-market doctrine, @Fat Tails front-end-OCO quote): https://nexusfi.com/a/strategies/bracket-trading-futures
3. TopstepX Help Center — Auto OCO Brackets (PRIMARY: Position vs Auto-OCO modes, stop-market default, stop-limit "coming soon", Risk Settings switch): https://help.topstepx.com/settings/risk-settings/auto-oco-brackets
4. PickMyTrade docs — Switching from Position Brackets to OCO Brackets in TopstepX (the settings trap, error message when unswitched): https://docs.pickmytrade.io/docs/oco-brackets-in-topstepx/
5. Apex Trader Funding — Rithmic vs Tradovate (server-side bracket residency per stack; both offered at Apex): https://apextraderfunding.com/resources/day-trading/rithmic-vs-tradovate/ and https://www.apextraderfunding.global/cms-default-country/trading-tools-resources/rithmic-vs-tradovate
6. TradoxVPS — Rithmic vs Tradovate 2026 (infrastructure-vs-broker distinction, server-side risk enforcement, latency context): https://tradoxvps.com/rithmic-vs-tradovate/
7. ProjectX Gateway API docs / project-x-py (order-type enum incl. StopLimit, Bracket schema — what the platform's backend supports): https://project-x-py.readthedocs.io/en/stable/api/trading.html
8. Vault note — `trade-copiers-prop-accounts.md` (firm→broker ecosystem mapping, corroborating source for who-runs-on-what): internal
