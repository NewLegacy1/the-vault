---
topic: structural-target-sleeve-evidence
researched: 2026-07-18
sources: 8
agent-cycle: cycle3-laneC
---
# Structural-Target Variant vs Fixed 1:5/100pt — the Assembled Case, Both Directions

Stage-0 research brief for the post-May backlog. **Nothing here touches the Dual46 freeze.** Question: should a structural-TP variant (TP at nearest internal H/L / unfilled gap / opposing liquidity instead of fixed 1:5 capped 100 pts) enter Stage-0 as a candidate after the May walk closes?

## Key findings

- **Powell's practice is structural, but his teaching sanctions both.** The full statement from his official RB video (`pd-array-6-figures.txt`): "you can aim for the very low of the low-resistance-liquidity range, or you can aim for internal structure like imbalances right in this leg, or you can aim for a fib" [4:29–4:56], and the closer: **"you just aim for some internal structure or a static RR. It's up to you"** [6:32–6:38]. A fixed R is not a deviation from Powell — it is one of his two sanctioned options.
- **His realized band is 1:3–1:8, centered near the Dual46 cap:** live 10 AM trade 1:8 to "an unfilled gap… an old low" — "If I did have my stop loss at the low, 1:5 still very acceptable" (`60k-february-setup.txt` [17:58–18:14]); "conservative target of this first internal low… 6.6 RR… I go for like everything from 1 to 4 to 1 to 6" (`tick-precision-entries.txt` [6:46–6:59]); "I just do my little one to three" when that's what structure offers (`rb-entry-structure.txt`); live stream 1:7 with "TP is like a relative equal high… low-hanging fruit," runner idea = all-time high (`live-trade-1-7rr.txt` [2:49, 4:43–4:56]).
- **His headline stat CLAIM:** "it's been like 60-ish% win rate with an average of 1-to-7 RR… average win 660, average loss 95… profit factor 5.88… closer to 60-65% [after BE bookkeeping]" (`high-probability-conditions.txt` [11:19–12:26]). Self-reported dashboard, unaudited, survivor-of-the-month accounts — but it is *the* number the structural-TP case rests on: if real, variable structural TPs materially out-earn a 1:5 cap at similar WR.
- **His management kit assumes structural TPs:** BE after an internal high is taken, exit on SMT, "hold runners past NFP low" (`stop-getting-manipulated.txt` [8:30, 11:01]) — the trade-management teachings in `powell-risk-trade-management.md` mostly *presuppose* a structure-referenced target; a fixed-cap arm uses almost none of them.
- **The strongest AGAINST datapoint is quantified:** DeltaTrend's faithful build used exactly the structural-TP rule (nearest 5m pivot within a viable distance band) and produced the low-WR/high-RR shape that **timed out on 55% of simulated TopStep evals, 22.4% pass, +$206 EV/account** (`quant/deltatrend-guru-quantification-powell-detail.md`). Caveat both ways: his build lacked the 10:00 KO context (so WR was lower than Dual46's), *and* the structural-TP rule is precisely where he had to invent free parameters (distance band, min-R filter) — the overfitting surface a fixed cap doesn't have.
- **ICT canon sides with structural:** MMXM delivery aims at engineered liquidity → original consolidation → HTF draw (`ict/market-maker-buy-sell-models.md`); Silver Bullet targets the draw with a ≥10-handle framework check (`ict/silver-bullet.md`). No fixed-R teaching exists anywhere in ICT canon.
- **Walk evidence cuts both ways:** June's missed ~200–250pt NWOG reversal is the upside a cap forfeits; but the Vault's own capped-R expectancy work (`quant/expectancy-math-wr-rr-capped-payoffs.md`) and streak math (`quant/losing-streak-math.md`) show the capped shape's virtue is *path* quality under trailing DD — fewer timeout-shaped equity paths, which is what prop survival prices.

## Details / mechanics — the two cases

### FOR a structural-TP Stage-0 candidate
1. **Source fidelity:** it is what Powell actually does; his claimed 1:7-at-60% dashboard, if even half-true, dominates 1:5-at-same-WR. The 60k trade shows the same entry repriced: full-wick stop ⇒ 1:5, his looser stop ⇒ 1:8 — structure gave more than the cap took.
2. **Canon alignment:** every ICT delivery model targets structure; a 100pt cap regularly exits mid-void where canon expects fast continuation (cross-ref `ict/liquidity-voids-vs-fvgs.md` — a void past the cap is literally paid-for travel forfeited).
3. **Management unlock:** BE-after-internal-high, SMT exits, runner logic all become usable, matching `powell-risk-trade-management.md` instead of ignoring it.
4. **Walk data will already contain the answer cheaply:** the May/June MFE ledger (per `quant/mfe-mae-exit-analysis.md` logging) gives realized MFE beyond +5R per trade — the structural-TP upside can be *estimated from existing fills* before any new sim is built. That makes this the cheapest Stage-0 question in the queue.
5. **Fill realism favors it slightly:** a TP resting at an obvious liquidity level is a limit into a magnet; the fixed 100pt line sometimes sits in dead air 3 pts short of the magnet and gets edged.

### AGAINST (keep the fixed 1:5/100pt; kill the variant early unless data insists)
1. **Prop math:** DeltaTrend's structural-TP build produced the timeout-heavy shape — 55% eval timeouts. The Vault's scorecard is `E[$/wk]` under path MC; fatter right tail + lower WR usually *loses* that metric under trailing DD even when trade EV rises.
2. **Free-parameter surface:** "nearest structure within a viable band" required DeltaTrend to invent a distance band, a min-R filter, and a fallback — three tunables that don't exist today. Each is Stage-0 overfitting surface, and the kill-lessons doctrine says param-shopping is how Track-B candidates die.
3. **Powell sanctions static RR explicitly** [6:35] — the freeze is not un-Powell; and his own dashboard mixes "DJ accounts" where he admits taking junk trades [12:31–12:46], so the 1:7-at-60% figure is not a clean benchmark.
4. **Variance & psychology:** the capped shape's tight R distribution is why the walk's daily routine works (one trade, known worst case, known best case). Structural TPs reintroduce the "should I have taken partials" loop Powell himself describes agonizing over (`different-version-of-you.txt` [10:44]).
5. **Sample-size cost:** variable-R outcomes need materially more trades for the same expectancy CI (`quant/minimum-sample-size-statistical-significance.md`) — a 20–40 trade walk that cleanly validates a fixed-R arm says much less about a variable-R arm.

### Verdict framing for the orchestrator
The honest synthesis: **entry logic is settled; exit logic is the live question, and the data to answer it is nearly free.** The MFE column of the May ledger is the deciding evidence — if median MFE meaningfully exceeds +5R *and* the excess concentrates at identifiable structure (gap fills, internal H/L), a structural-TP Stage-0 spec is justified; if MFE clusters at/below +5R, the cap is already harvesting the move and the variant dies without a sim. Spec must pre-register: structure-type whitelist, max-distance band, min-R floor, and fallback-to-cap — the DeltaTrend assumption log names all four.

## APPLICATION TO THE VAULT

1. **Post-May Stage-0 gate, one candidate at a time:** structural-TP competes with the 5m-trigger question (`5m-vs-1m-entry-trigger.md`) for the single open Stage-0 slot. Recommendation: structural-TP first, because it can be adjudicated from the existing walk ledger's MFE data without new TV exports; the 5m question needs fresh event-study data.
2. **Required before any sim:** MFE/MAE columns fully populated for May (already mandated by the MFE note); add a `structure_at_MFE` annotation (what level did price actually turn at past the cap) — that column alone converts the June "missed 200–250pt" anecdote into countable evidence.
3. **Never** implement as a retune of the frozen arm or of killed Track-B candidates; if promoted, it is a new Stage-0 spec through `analyze-event-study.ts` → SCORECARD → path MC, with the four pre-registered assumptions above.
4. **The NWOG sleeve should adopt structural TPs from day one** — it is discretionary, in census, and its winners (June: NWOG-to-NWOG travel) are structure-to-structure by construction; the fixed cap was never part of that sleeve's design.

## Sources

1. **Powell (primary, Vault archive)** — `pd-array-6-figures.txt` [4:29–6:38]; `60k-february-setup.txt` [17:58–18:14]; `tick-precision-entries.txt` [6:46–6:59]; `high-probability-conditions.txt` [11:11–12:46]; `live-trade-1-7rr.txt` [2:49–4:56]; `stop-getting-manipulated.txt` [6:30–8:30, 11:01]; `40000-traders-struggle.txt` [10:53–13:28] (1:40 story, "RR doesn't matter — consistency does"); `different-version-of-you.txt` [10:44]
2. Vault notes — `powell/powell-rb-entry-teachings.md` (target-divergence table), `powell/powell-risk-trade-management.md`, `quant/deltatrend-guru-quantification-powell-detail.md` (structural-TP build → 55% timeout), `quant/expectancy-math-wr-rr-capped-payoffs.md`, `quant/losing-streak-math.md`, `quant/mfe-mae-exit-analysis.md`, `quant/minimum-sample-size-statistical-significance.md`, `ict/market-maker-buy-sell-models.md`, `ict/silver-bullet.md`, `ict/liquidity-voids-vs-fvgs.md`
