---
topic: sierra-chart-tpo-volume-diy-template · researched: 2026-07-21 · sources: 4 · agent-cycle: adhoc-auction-2026-07-21
---
# Sierra Chart DIY template — TPO + Volume Profile (+ footprint)

Build your own **MNQ/NQ auction chartbook** without buying a branded “DDY” pack.
Sierra’s native names: **TPO Profile Chart** + **Volume by Price (VBP)** + **Numbers Bars**.

> Needs Sierra **Advanced** package for TPO / Numbers Bars / full VBP (Package 5+ per Sierra support docs — verify current package matrix). CME real-time data has its own exchange + funded-account rules.

## Key findings

- **EVIDENCE (Sierra docs):** Market Profile in Sierra = **TPO Profile Chart** study. Letters default ~30 minutes; Value Area default ~70%; POC highlighted.
- **EVIDENCE (Axia / Sierra practice):** Volume Profile is a **separate** study (VBP). For day profiles beside TPO, set VBP so it is **not** “Independent Volume Profile for TPO” in a way that orphans session sync — follow Axia: attach VBP to the TPO chart with independent = **No** when you want one volume profile per TPO day.
- **CLAIM (practitioner):** Use **volume POC** for “where money traded,” **TPO** for “balance vs trend / IB shape.” When both POCs agree, level is stronger.
- **Unresolved:** User’s **“DDY template”** — no standard Sierra study by that name found. Build this DIY chartbook first; rename later when DDY is clarified.

## DIY chartbook recipe (MNQ RTH)

### Chart A — Session auction (primary)

1. New chart → symbol **MNQ** (or NQ) continuous / front month you actually trade.
2. **Chart → Chart Settings → Session Times:** RTH for CME equity index (typically 09:30–16:00 NY). Overnight can be a second profile if you want — keep Dual46 eyes on RTH.
3. **Analysis → Studies → Add:**
   - **TPO Profile Chart**
     - Profile period: **1 Day**
     - Letter/Block time: **30 Minutes**
     - Value Area %: **70**
     - Show POC, VAH, VAL (extend prior day levels into today if the study option exists — or draw manually)
   - **Volume by Price (VBP)**
     - Period aligned to **day / TPO session**
     - Show volume POC + VA
     - Prefer volume POC as the participation magnet for NQ/MNQ (CLAIM — see [[volume-profile-poc-vah-val]])
4. Save as chartbook: `MNQ_Auction_RTH.cht` in `SierraChart\Data\`.

### Chart B — Footprint / absorption (secondary)

1. Duplicate chart or new chart, same symbol, **1-minute** or **volume bars**.
2. **Chart → Chart Settings → Chart Type → Numbers Bars** (or add Numbers Bars study — follow current Sierra UI).
3. Display bid×ask or delta background so you can see **high volume + no displacement** (absorption signature — CLAIM).
4. Optional: Market Depth Historical Graph / DOM for refill watching.
5. Save into same chartbook as `MNQ_NumbersBars`.

### Morning Dual46 glance (eyes only — freeze safe)

| Glance | Question |
|---|---|
| Open vs **prior** VAH/VAL/POC | Inside value / above / below? |
| Developing IB (first 60m) vs your **OR30** | Wide IB ≈ balance bias; narrow ≈ expansion risk (CLAIM) |
| 10:00 leave vs prior LVN/HVN | Leave into thin air vs into volume node? |
| Footprint at RB tap | Absorption at wick? (`absorp_at_tap?` journal — census only) |

**Do not** let these veto or arm Dual46 mid-May walk.

## Buying third-party templates

Paid “Market Profile TPO NQ” chartbooks exist (various vendors). They are convenience, not edge. Prefer DIY so you know every setting. If a vendor labels something **DDY**, send a screenshot — we will map it to native Sierra studies.

## APPLICATION TO THE VAULT

1. **Prefer TV Premium footprint + Session VP first** ([[auction-order-flow-tv-premium-vs-sierra-prop]]) — buy Sierra when a Stage-0 hypothesis is blocked by missing TPO/depth/Numbers Bars fidelity.
2. Optional tool for learning auction context alongside Dual46 / NWOG — **not** a new Stage-0 candidate by itself; parked sketches: [[../../strategy-dev/60-track-b/parked-of-auction-sleeve-sketches]].
3. Journal enums later: `open_vs_prior_VA`, `prior_vol_poc_dist_pts`, `absorp_at_tap` — only after May walk logging capacity allows.
4. Sierra ≠ TV Deep BT path; do not invent Lab `E[$/wk]` from profile screenshots.
5. Hub: [[../hubs/hub-auction]].

## Sources

1. Sierra Chart — TPO Profile Charts — https://www.sierrachart.com/index.php?page=doc%2FStudiesReference%2FTimePriceOpportunityCharts.html
2. Axia Futures — Sierra Market Profiles / TPO + VBP — https://axiafutures.com/blog/how-to-sierra-chart-market-profile/
3. Sierra Support — Advanced package needed for TPO / Numbers Bars — https://www.sierrachart.com/SupportBoard.php?ThreadID=88799
4. Companion Vault notes: [[tpo-market-profile-basics]], [[volume-profile-poc-vah-val]], [[order-flow-absorption]]
