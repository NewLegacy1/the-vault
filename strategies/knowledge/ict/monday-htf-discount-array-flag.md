---
topic: monday-htf-discount-array-flag
researched: 2026-07-18
sources: 6
agent-cycle: cycle3-laneC
---
# The Monday HTF-Discount-Array Flag — Source Validation & Exact Ledger Protocol

Operationalizes application §2 of `weekly-profiles-premium-discount.md`: *"bullish week + unreached discount array below Monday → expect the Tuesday drive into it — a Monday long fighting that template is a census flag, not a veto."* This note checks the template against all source material and defines exactly how to score it on Monday ledger rows.

## Key findings

- **Canon support is direct and archived.** Month 07 transcript (`vault-app/data/ict-transcripts/weekly-range-profiles-month07.txt`): "price hovering above a higher-timeframe discount array on Monday, then drops into [it Tuesday]… **when the market fails to drop into that array [Monday], odds are Tuesday will likely see the drive lower** — Tuesday London open and/or New York session." The anticipation rule *is* the flag: array unreached by Monday's close ⇒ elevated odds the drive comes Tuesday.
- **Canon also contains the flag's own escape hatches — three, all important for scoring:**
  1. **Wednesday variants:** the Wednesday-Low profile has Monday *and Tuesday* hovering ("Monday and Tuesday can also be down days") before the Wednesday drive — so "no Tuesday drive" does not falsify the template; the drive may arrive Wednesday. The flag predicts *a pending drive*, not its exact day.
  2. **Array reached ON Monday:** if Monday itself taps the discount array, the classic profile's precondition dies — the manipulation already happened; Monday reversal trades *at* the array are template-consistent, not counter-template.
  3. **Consolidation profiles:** on rate/NFP-wait weeks (S&D, consolidation-Thursday), the drive is deferred to Thursday/Friday or degrades to shallow both-side runs — flag scoring must exclude or tag red-folder weeks (cross-ref `red-folder-playbooks-1000-window.md`).
- **The community 5-day model *contradicts* the Tuesday timing but *agrees* with the risk statement.** ictkillzone's Monday-accumulation template holds that "on a bullish week, the Monday low is the first SSL cluster… the Monday range defines what the **Wednesday** manipulation will target." Different day, same warning: early-week longs sit above engineered sell-side that the week intends to sweep. Under either timing, a flag-TRUE Monday long must survive a pending sweep below.
- **One genuinely contradicting data point (from the gap statistics, `nwog-published-statistics.md`):** Monday RTH gaps have the *lowest* fill rate of the week (53.9%) because Monday moves more often carry genuine weekend sentiment. If Monday's drift is real more often than other days', then Monday intraday momentum trades (what Dual46 takes) have a structural tailwind that the weekly-profile lens doesn't see. This is the best available counterweight to "Monday is just positioning" — and consistent with June's 2W/0L.
- **No frequency data exists for any profile** (canon offers none; nobody has published "classic-Tuesday-low occurs X% of bullish weeks"). The flag therefore cannot carry a prior — it can only be *counted* on the Vault's own Mondays. Tools exist to self-measure (twingall HoW/LoW indicator) if the count ever needs a base rate.
- **June's two Monday wins do not yet test the flag** — neither was scored for it at the time. 06-29 is particularly instructive: price ran down to the daily intermediate low and reversed exactly at the NWOG — i.e. the discount array was **reached on Monday** (escape hatch #2), making both the script win and the missed NWOG reversal *template-consistent*, not counter-template. Retro-annotation required before the flag is called 0-for-2 or 2-for-2.

## Details / mechanics — exact evaluation protocol for Monday ledger rows

### Flag definition (computed at Monday 09:45, before the 10:00 window)
1. **Weekly dealing range:** last significant weekly swing high ↔ low; EQ = 50%. Weekly bias = the user's three daily-bias gates read at week-scale (or simply: price below EQ + bullish HTF story = bullish week; mirror for bearish).
2. **Nearest unreached HTF array against the bias side:** bullish week → nearest *discount* array below (daily/4H FVG, OB, RB, old low, NWOG, CE of a large gap); bearish week → mirror premium array above. Record: array type, price, distance from Monday open (pts, and ×daily-ATR).
3. **Flag state:**
   - `FLAG_TRUE` — bias-aligned HTF array unreached and ≥ ~1 daily ATR away in the adverse direction (a pending drive has somewhere to go);
   - `FLAG_DEAD` — array already tapped Monday pre-10:00 (escape hatch #2 — manipulation done; reversal trades at the array are template-aligned);
   - `FLAG_NA` — no clean HTF array within ~2 ATR, or red-folder week (CPI/FOMC/NFP-wait — consolidation profiles govern instead).
4. **Trade-relation column:** for the day's Dual46 trade (and any disc/NWOG take): `WITH-template` (trade direction toward the array / at the tapped array) or `AGAINST-template` (e.g. long while FLAG_TRUE discount array sits below).

### Scoring (weekly, after Friday close)
5. **Template outcome:** did price reach the flagged array this week? On which day? Did the weekly extreme print there (±0.5 ATR)? Grade: `HIT-TUE`, `HIT-WED` (both canon-consistent), `HIT-LATE`, `MISS` (array never reached).
6. **Flag performance vs ledger:** maintain four cells — {FLAG_TRUE, FLAG_DEAD} × {trade WITH, trade AGAINST} — with W/L and R per cell. The canon prediction to test: **AGAINST-template trades under FLAG_TRUE underperform the other three cells.** The Monday-gap counterweight predicts the effect is weaker than lore claims.
7. **Decision rule (pre-registered):** the flag stays journal-only until ≥10 FLAG_TRUE Mondays exist. If AGAINST/FLAG_TRUE shows ≥2R average underperformance vs WITH rows at that n, it graduates to a *disc-sleeve* consideration; it never becomes a script-arm gate without the full Stage-0 pipeline. If cells look flat, retire the flag and log the kill in the harvest note.

### Retro-annotation task (May + June Mondays)
8. Replay each Monday row already in the ledger (June: 06-08, 06-29; May: all Mondays as the walk processes) and fill columns 1–6 retroactively. 06-29 is expected to score FLAG_DEAD (array tapped Monday) — verify.

## APPLICATION TO THE VAULT

1. **Keep Mondays un-skipped — nothing found reverses the cycle-2 verdict.** Canon never banned Mondays; the flag is the *only* Monday-specific caution canon actually supports, and even it has three escape hatches. The Monday-gap statistic actively supports trading genuine Monday moves.
2. **The flag costs one fib + one array check at Sunday/Monday prep** (already recommended in the weekly-profiles note) plus four journal cells. It changes no rule; it converts the "bullish week + array below" anecdote into countable evidence at ~1 row/week.
3. **NWOG sleeve interaction:** a Monday NWOG tap below price in a bullish week is simultaneously (a) a discount-array tap (FLAG_DEAD trigger, template-aligned reversal context — exactly 06-29), and (b) a sleeve census row. Score both; the overlap cell ("NWOG tap = the flagged HTF array") is probably the sleeve's best setup and canon agrees.
4. **Red-folder weeks are excluded by design** — consolidation profiles govern there, and the red-folder note's decision table already handles those days.

## Sources

1. **ICT (primary)** — Month 07 weekly-profiles transcript, archived: `vault-app/data/ict-transcripts/weekly-range-profiles-month07.txt` (anticipation rule; Wednesday variants; consolidation profiles)
2. innercircletrader.net — Weekly profiles tutorial (restates the anticipation rule; profile-selection heuristic "if the HTF discount sits below and bias is bullish, expect Tuesday or Wednesday low") — https://innercircletrader.net/tutorials/ict-weekly-range-profiles/
3. ictkillzone.com — 5-Day Delivery Model (Monday range = accumulation; Monday low as first SSL target for the *Wednesday* Judas — the contradicting-timing community template) — https://www.ictkillzone.com/ict-weekly-profile
4. theforexgeek.com / time-price-research — corroborating restatements of the classic Tuesday-low anticipation rule
5. Vault internal — `strategies/strategy-dev/50-analyses/morningstar-dual46-june-week1-harvest.md` (Monday 2W/0L; 06-29 NWOG reversal at daily intermediate low), `ict/nwog-published-statistics.md` (Monday gap fill 53.9% — genuine-move counterweight)
6. Cross-refs: `ict/weekly-profiles-premium-discount.md` (parent note), `ict/red-folder-playbooks-1000-window.md`
