---
topic: 5m-vs-1m-entry-trigger
researched: 2026-07-18
sources: 5
agent-cycle: cycle3-laneC
---
# 5m vs 1m Entry Trigger — What Powell Actually Says, Verified Against Transcripts

DeltaTrend's code-review note reported "Powell now prefers 5m triggers" (quoting [19:57] of his video, which is Powell's clip at `60k-february-setup.txt` [7:54]). This note verifies that against the full Powell archive. **Verdict: the paraphrase is directional but overstated — Powell rates the 5m trigger higher-WR, still uses the 1m "every single day," and his actual recommendation is a hybrid: 5m confirmation → 1m entry.** No new uploads exist to supersede this (channel checked 2026-07-18; latest video 2026-05-31, already transcribed).

## Key findings

- **The exact quote in context** (`60k-february-setup.txt` [7:47–7:55]): "we get a 5-minute entry trigger after tapping into discount. **5-minute entry trigger is better than a 1-minute, by the way.**" Two lines later that very 5m trigger **takes the loss** [8:06–8:20] — he uses it as the psychology lesson ("I thought the win rate was 100%?"). So the on-tape claim is *better*, not *safe*.
- **He has not switched away from 1m.** Same video [5:13–5:25]: "we can scale down in timeframe and use 1-minute entry triggers to get us into the trade… **I use these every single day.** They are great. They have saved me from a lot of losses." And `stop-getting-manipulated.txt` [16:40–16:57]: "if you can afford to go heavy risk on the funded accounts then by all means use the one minute. **I use the one minute a lot. I just like to validate them pretty hard.**"
- **The trade-off, in his own numbers-free framing** (`stop-getting-manipulated.txt` [16:22–16:38]): the 5m route requires "five times more patience" and gives "a win rate that is probably five times as high" (rhetorical multiplier, not a stat). The 1m route wins on risk-reward — it is "the second best thing" after top/bottom-ticking limits for RR (`60k-february-setup.txt` [5:33–5:43]).
- **The hybrid is the actual teaching** (`stop-getting-manipulated.txt` [17:00–17:09]): "**Five minutes are great. You can even take one-minute entry triggers out of five minutes — just wait for five-minute confirmation and then look for a one-minute entry. It's like a little hybrid.**" Note: Dual46 already approximates this — the freeze-leg fib and structure context are 5m-scale, the RB trigger is 1m.
- **Where each wins/loses (assembled from all appearances):**
  - *1m wins:* RR (10–15pt stops vs ~15+ on 5m — the 5m RB in `stop-getting-manipulated.txt` [8:15–8:26] priced 15pt risk ⇒ 1:3, vs CE 10pt ⇒ 5.7RR), trigger frequency, tick-precision entries at fib extremes.
  - *1m loses:* news-day noise — sequences of 1m RBs "absolutely ran through" around NFP; his on-camera fix is "see how we just cut through all that noise… with one click [switch to 5m]" [11:54–12:07]; and it needs hard validation (sweep + close + level) to avoid junk triggers.
  - *5m wins:* WR, noise immunity, fewer-but-cleaner triggers ("first five-minute entry trigger after 10 [a.m.]" [14:36] as the news-day pattern); oversized 5m RBs still yield fine risk via CE/25% internal levels.
  - *5m loses:* patience/frequency, raw RR, and it is *not* loss-proof (the 60k video's featured 5m trigger lost).
- **CLAIM vs EVIDENCE:** everything above is teaching + anecdote. Powell publishes no WR-by-timeframe split. The only third-party quantification (DeltaTrend's build) used **5m PD-array triggers throughout** and still produced a low-WR shape without the 10:00 KO context — it cannot arbitrate 1m-vs-5m for Dual46.

## APPLICATION TO THE VAULT

1. **Dual46's frozen 1m RB is not contradicted by source** — Powell uses 1m daily, and the frozen spec's validation stack (KO leave + freeze-leg fib OTE + sweep + validating close) is exactly the "validate them pretty hard" condition he attaches to 1m usage. The freeze stays.
2. **The Stage-0 question is now sharper than "5m vs 1m":** the source-faithful variant to test post-May is the **hybrid** — require a 5m validating close (or 5m RB/PD-array) before accepting the 1m RB trigger — not a wholesale move to 5m triggers, which would cut trigger frequency ~5x on a one-trade/day system that is already frequency-poor for sample building.
3. **Cheapest evidence first:** before any sim, re-annotate the May/June ledger with one boolean — `5m_confirm_present?` (was there a same-direction 5m close/PD-array at entry time). If losers cluster in `false` rows, the hybrid gate has a case; if not, it dies free of charge. Same pattern as the structural-TP MFE test (`structural-target-sleeve-evidence.md`) — both Stage-0 candidates are ledger-first, sim-second.
4. **News days are the 5m case's home turf** (cross-ref `ict/red-folder-playbooks-1000-window.md`): if a red-folder split ever shows event-day bleed in the 1m arm, the hybrid gate is the doctrine-approved fix — not skipping the day.
5. **One open Stage-0 slot rule:** this competes with structural-TP. Recommendation stands (structural-TP first — its evidence is already in the ledger); the hybrid-gate annotation can be collected in the same replay pass at zero extra cost, so both die-or-advance decisions can be made together after May.

## Sources

1. **Powell (primary, Vault archive)** — `60k-february-setup.txt` [5:03–8:23] (1m daily use, "second best for RR," the 5m-is-better quote and its immediate loss); `stop-getting-manipulated.txt` [8:15–8:26 CE risk math · 10:20 oversized 5m RB · 11:54–12:07 news-noise timeframe elevation · 14:36 first-5m-trigger-after-10 pattern · 16:22–17:09 patience/WR trade-off, heavy-risk-1m, hybrid teaching]; `rb-entry-structure.txt` [7:48]; `tick-precision-entries.txt` (1m at fib extremes)
2. `quant/deltatrend-guru-quantification-powell-detail.md` — the [19:57] paraphrase this note verifies; his all-5m build
3. Channel sweep 2026-07-18 (`vault-app/data/tv-exports` n/a — yt-dlp listing): no Powell upload newer than 2026-05-31 (`top-5-mistakes.txt`), so no newer statement exists
4. Cross-refs: `powell/powell-rb-entry-teachings.md` §7, `ict/red-folder-playbooks-1000-window.md`, `powell/structural-target-sleeve-evidence.md`
