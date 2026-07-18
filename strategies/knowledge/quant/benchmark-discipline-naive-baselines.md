---
topic: benchmark-discipline-naive-baselines · researched: 2026-07-18 · sources: 6 · agent-cycle: cycle3-laneA
---
# Benchmark Discipline: Naive Baselines as Mandatory Scorecard Columns

Extends `event-study-methodology-intraday-setups.md` (which introduced baseline logic) and operationalizes DeltaTrend's Worlin lesson (a "profitable" ICT strategy at +107% vs +311% for buy-and-hold Nasdaq — "this strategy made money but so did the market and a lot more"). Question: which naive baselines professional evaluation actually requires, how they are constructed, and which become mandatory scorecard columns.

## Key findings

- **CLAIM (the null-hypothesis framing, QuantBeckman "Monkey Test"):** the first question of any backtest is "is this distinguishable from dumb luck?" Method: generate N random signal series that **preserve the strategy's trading frequency / time-in-market**, run each through the *identical* exit/risk pipeline, and read where the real strategy sits in the resulting distribution. Deep inside the distribution = a dart-throwing monkey matches it; far right tail (empirical p < 0.05) = evidence of entry edge.
- **CLAIM (like-for-like constraint, Build Alpha):** the random baseline must share **every constraint** of the real strategy — same session window, same stop/target geometry, same sizing, same trade frequency, same optimization freedom. "If one strategy generation process can use X, the random generation process should use X." And crucially: if the real strategy was *selected/optimized*, the baseline must be the **best of an equally-sized random search**, not the average random run — otherwise the comparison flatters selection luck (bridges into topic 51's multiple-testing note).
- **CLAIM (three distinct baselines answer three distinct questions):**
  1. **Random-entry, same-exit** — does the *entry* carry information beyond the exit geometry? (Fixed-bracket exits on a drifting/volatile instrument produce non-zero EV by themselves; this baseline prices that.)
  2. **Time-matched buy-hold** — did the strategy beat *owning the underlying during the same clock time*? The Worlin case shows technically-profitable ≠ investable. For an intraday-long-biased strategy on a rising index, part of any edge is just beta-during-session; this baseline isolates it.
  3. **Shuffle/sign-flip of realized PnLs** — is the *sequence/asymmetry* of outcomes distinguishable from a signless coin with the same magnitudes? (Cheapest to compute — the Vault's `analyze-event-study.ts` already implements exactly this: absolute PnLs, random sign at 50/50 — it is a legitimate member of the family, but it tests the weakest null.)
- **EVIDENCE (already in vault):** kill card B3 (`kill-lessons-track-b.md`) records "random baseline not worse" as a kill input — the machinery exists and has already earned a kill. What's missing is *mandatory* status and the other two baseline flavors.
- **CLAIM (percentile reporting):** a single random run is meaningless (luck dominates); professional practice reports the random distribution's p25/p50/p75 (or full percentile position of the real result) across ≥ 1,000 runs. TradingView-native random-entry benchmark scripts exist that do this with configurable stop/RR to match the candidate's geometry — usable within the Vault's TV-export bottleneck.

## Details / mechanics

**Construction recipes (concrete for the Vault's pipeline):**

- **B-RAND (random-entry same-exit):** for each real trade date, draw a random entry time uniformly within the candidate's session window (e.g. 09:30–13:00), same direction distribution as the candidate (or 50/50 if direction is part of the claimed edge), then apply the candidate's exact bracket (stop distance, target, cap, EOD flat). Repeat the whole ledger 1,000×. Report the real EV's percentile in the random-EV distribution. Requires bar data — for TV-bottlenecked candidates, the TradingView random-entry benchmark script configured to the same geometry is the practical stand-in.
- **B-HOLD (time-matched buy-hold):** for each real trade, the PnL of buying at the candidate's entry *time* (not price logic) and exiting at the session flat time, same size. Sum over the ledger. One column, no simulation. If the candidate's edge disappears against B-HOLD on longs, the "edge" was the index drifting up between 10:00 and 13:00.
- **B-FLIP (sign-flip, existing):** keep as-is in `analyze-event-study.ts`; label it clearly as the weakest null (tests only sign asymmetry given magnitudes, not entry timing).

**Decision rules (proposed defaults, consistent with kill-lessons):**

| Comparison | Verdict |
|---|---|
| real EV ≤ B-RAND p50 | kill — entry carries no information |
| real EV in B-RAND p50–p90 | thin — needs more n before any promote talk |
| real EV > B-RAND p90 **and** > B-HOLD | proceed to path MC |
| real EV > B-RAND p90 but ≤ B-HOLD | edge is session beta — reframe or kill |

**What this does *not* replace:** baselines gate the *trade-EV* tier of the prop-math hierarchy. Path MC `E[$/wk]` remains supreme — a candidate can beat every baseline and still fail the trailing-DD barrier math. Baselines are a cheap pre-filter below the MC, exactly where geometry diagnostics sit.

## APPLICATION TO THE VAULT

1. **Scorecard change: three baseline columns become mandatory** for every candidate sleeve — `vsRandom (pctile)`, `vsBuyHold ($Δ)`, `vsFlip (pctile)` — with the decision rules above. B-FLIP is already computed; B-HOLD is a trivial addition to `analyze-event-study.ts` *if* the export carries entry timestamps and session-close prices (it carries fills — B-HOLD needs one extra price column per trade; add to the TV-export request template). B-RAND needs bar data or the TV-side benchmark script — record which variant was used.
2. **Retroactive honesty is not required, but the *next* Stage-0 is.** Kill-lessons already showed B-RAND-style thinking kills candidates (B3). Making the columns mandatory prevents the failure DeltaTrend documented: 3,500 trades, +107%, real money made, and still strictly dominated by doing nothing but holding.
3. **Dual46 has never been benchmarked against B-HOLD.** Post-May backlog item: compute B-HOLD for the June+May ledger (buy at entry time, flat at 13:00 or at Dual46's exit time, both variants). Expected result given short-and-long mix and a 65–70% WR at 1:5: comfortable dominance — but "expected" is precisely what the charter says to verify rather than assert. If the walk months coincide with a strong index drift, this column is the defense against a flattering month narrative.
4. **Baseline-vs-selection interaction (forward pointer):** after k killed candidates, the honest random benchmark for survivor k+1 is the *best of k+1 random searches* (Build Alpha's point). The mechanics live in the multiple-testing note (topic 51); the scorecard hook is one field: `candidatesTriedBeforeThis: k`.
5. **One-trade/day frequency makes baselines cheap.** At ~20 trades/month, B-HOLD is a spreadsheet column and B-RAND's 1,000 replications run in seconds — there is no computational excuse for skipping them.

## Sources

- QuantBeckman, "[WITH CODE] Backtesting" (Monkey Test / MC permutation; frequency-preserving nulls; block-bootstrap variant for harder nulls) — https://www.quantbeckman.com/p/with-code-backtesting
- Build Alpha, "Vs. Random Test" (like-for-like constraints; best-of-random as the bar under optimization; same-metric comparison) — https://www.buildalpha.com/vs-random-test/
- TradingView "Random Entry Benchmark" (hermes_trisme) — configurable stop/RR random-entry percentile benchmark, TV-native — https://www.tradingview.com/script/ObbtMmcy-Random-Entry-Benchmark/
- TradeInsight, "A Monte Carlo Method for System Validation" (shuffle-outcomes permutation; p-value read) — https://tradeinsight.ai/blog/all/trading-edges-a-monte-carlo-method-for-system-validation
- DeltaTrend/Worlin benchmark case (+107% vs +311% buy-hold, Sharpe 0.165) — `deltatrend-guru-quantification-powell-detail.md`
- Cross-refs: `event-study-methodology-intraday-setups.md`, `kill-lessons-track-b.md` (B3 random-baseline precedent), `vault-app/scripts/analyze-event-study.ts` (existing B-FLIP), topic 51 note (selection-adjusted baselines)
