---
topic: volume-profile-poc-vah-val
researched: 2026-07-21
sources: 6
agent-cycle: adhoc-auction-2026-07-21
---
# Volume Profile: POC, VA, HVN, LVN (vs TPO)

## Key findings

- **CLAIM:** **Volume Profile** histograms **contracts (or shares) traded at each price**, independent of how long price lingered. **TPO** histograms **time**. Same auction, different measure. **EVIDENCE:** Sierra Chart splits **TPO Profile Chart** vs **Volume by Price (VBP)**; practitioner compare-notes converge on this split.
- **CLAIM:** **Volume POC** = price with the most traded volume in the profile window. **Volume VA (~70%)** → **VAH/VAL** from volume distribution (same geometry idea as TPO VA, different input). **EVIDENCE:** Standard VP study definitions; % is configurable.
- **CLAIM:** **HVN** (High Volume Node) = local volume peaks (acceptance / balance). **LVN** (Low Volume Node) = troughs (rejection / fast travel). Markets often rotate between HVNs and accelerate through LVNs. **EVIDENCE:** Practitioner CLAIM — not Vault-measured on MNQ.
- **CLAIM (practitioner):** For **NQ/MNQ**, prefer **volume POC** over TPO POC when the question is *participation / where size printed*, because index futures have clean tick volume and institutional flow shows in contracts, not dwell time. **EVIDENCE:** Practitioner blogs (FuturesIndicators, marketprofile.info, GrandAlgo, OPO) — **no Vault event-study**. Treat as working preference, not proof.
- **CLAIM:** When **TPO POC and Volume POC diverge**, follow the **volume** side for “where capital committed”; TPO side for “where the auction was comfortable.” Align = stronger consensus level. **EVIDENCE:** Same practitioner cluster; directional bias from divergence direction is **CLAIM**, not validated here.

## Details / mechanics

| Concept | TPO | Volume Profile |
|---|---|---|
| Input | Time brackets (letters) | Contracts at price |
| POC | Longest letter row | Tallest volume bar |
| VA | ~70% of TPOs | ~70% of volume |
| Blind spot | Quiet grinding at a price looks “important” | One burst prints “important” even if brief |

**Session vs fixed-range.** Session VP (RTH day) matches Dual46 day tags; fixed-range VP from a swing low→high is a separate structural tool (candidate TP / invalidation zones — still not Dual46 lock).

**Sierra.** Add **Volume by Price**; can align period to TPO chart. Developing VPOC updates live; prior-day VAH/VAL/POC are the usual reference lines.

**TV.** TradingView session/fixed-range volume profile is usable for eyes-only levels; it is **not** TPO. Depth/tick quality still lags Sierra for order-flow work (see absorption note).

## APPLICATION TO THE VAULT

- **Journal (optional columns):** `priorVAH` / `priorVAL` / `priorPOC` (specify **volume** vs TPO in the column header). Context for May walk harvest — **not** arm criteria.
- **Structural-TP candidates:** prior VA edges / POC / LVN as *candidate* targets for sleeves that already use structural exits (NWOG census, post-May backlog). Dual46 stays **1:5 capped-R** unless a separate pre-registered sleeve says otherwise.
- **Regime link:** `or30` / OR30 bands already measure open-range expansion — related family to IB width and early session balance. Do **not** replace frozen `or30Band` with profile day-types mid-walk.
- No Stage-0 promote from “price at LVN” stories. Any profile filter needs measurable event definition → `analyze-event-study.ts` → EV±CI → path MC.
- Cross-link: TPO basics → [[tpo-market-profile-basics]]; absorption → [[order-flow-absorption]]; hub → [[../hubs/hub-auction]].

## Sources

1. Sierra Chart — TPO Profile Charts (notes VBP pairing) — https://www.sierrachart.com/index.php?page=doc%2FStudiesReference%2FTimePriceOpportunityCharts.html
2. Axia Futures — Sierra Market Profiles (TPO + independent VBP) — https://axiafutures.com/blog/how-to-sierra-chart-market-profile/
3. FuturesIndicators — Volume Profile vs Market Profile — https://futuresindicators.com/learn/volume-profile-vs-market-profile
4. marketprofile.info — Market Profile vs Volume Profile / POC divergence — https://marketprofile.info/articles/market-profile-vs-volume-profile
5. GrandAlgo — TPO Profile vs Volume Profile — https://grandalgo.com/blog/tpo-profile-vs-volume-profile
6. OPO Finance — Market Profile vs Volume Profile (5 differences) — https://blog.opofinance.com/en/market-profile-vs-volume-profile/
