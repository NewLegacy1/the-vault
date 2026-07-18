---
topic: smt-divergence-nq-es
researched: 2026-07-18
sources: 7
agent-cycle: cycle3-laneC
---
# SMT Divergence (NQ/ES) — Mechanics, Invalidation, Timeframes

## Key findings

- **Definition (consistent across all sources):** SMT ("Smart Money Technique/Tool") divergence = two tightly correlated instruments, viewed on the **same timeframe**, printing opposing swing extremes at the same structural moment — e.g. NQ sweeps a prior high while ES prints a lower high. The asset that made the new extreme is read as the **false/manufactured move** (a liquidity sweep), and it is expected to reverse first and hardest. ICT introduced the technique on NQ/ES, still considered the cleanest pair (innercircletrader.net; tradingfinder/ForexFactory).
- **The logic is "crack in correlation":** both indices ride the same macro flow; if only one needed to run its stops, the run was engineered. SMT is **not** a strength/weakness read — it identifies *whose liquidity was targeted* (ictkillzone). NQ, being more volatile, is the more frequent false-move candidate.
- **Validity conditions (community consensus, consistent with ICT usage):** (1) the extreme must be a *structural* swing (a level where stops cluster), not a random candle wick; (2) same timeframe both charts; (3) the divergence gap must be material, not spread/timing noise (a 2–3 tick difference is nothing); (4) strongest inside killzones / at HTF PD arrays — an SMT at a 4H/daily array upgrades to a reversal signal, mid-range it's noise.
- **SMT is confirmation, never a standalone entry.** The standard sequence: SMT at the extreme → wait for MSS (market structure shift) on the false-move asset's 5m/15m → enter on the retrace array → **stop beyond the SMT sweep wick; trade back through that wick = the divergence is invalidated** (the move may have been genuine). This gives SMT a clean, binary invalidation — rare among ICT concepts.
- **Timeframe guidance splits by role:** execution reads on **15m or lower** (higher TFs print too slowly to enter); HTF (1H/4H/daily) SMTs carry more weight but serve bias, not triggers. For a 10:00-window strategy the relevant read is the 1m–5m SMT *at the manipulation extreme*.
- **Evidence status:** ICT publishes **no statistics**. The only quantified claim found: ictkillzone's self-reported 2024–25 log — NQ-high-unconfirmed-by-ES reversed in **79% of 88 logged instances**, average 78 NQ pts to the next pullback — methodology described but data unpublished; treat as folklore-grade.
- **Powell uses SMT as trade *management*, not entry** (Vault transcripts): in the live 1:7 trade he adds ES mid-trade — "There is an SMT… ES is almost about to take out this high, which is not great for my trade… either if we have an SMT you can trail aggressively or just close full position" [live-trade-1-7rr, 3:51–4:32]; and in the 60k video his ideal full-wick stop exists precisely "in case there's going to be SMTs" [60k-february-setup, 17:34]. So in Powell's system SMT appears *after* entry, as an exit accelerant and as the reason stops cover the full RB wick.

## Details / mechanics

### Reading an SMT at a swing (bearish example)
1. NQ and ES both approach a prior high (relative equal highs = buy-side liquidity).
2. NQ trades above it (sweep); ES fails to make the new high on the same timeframe → **bearish SMT**. NQ's high is the manufactured move; short NQ (or if ES had swept alone, short ES).
3. Confirmation = MSS down on the false-move asset; entry at the retrace array (FVG/OB/RB).
4. Stop above the sweep wick. **Invalidation = both assets subsequently confirm** (ES takes its high too) or price closes back above the sweep wick — the divergence "heals" and the signal is dead.
5. Bullish SMT mirrors at lows. Hidden/continuation variants exist in community material (higher low on one, lower low on the other inside a trend) but ICT's core teaching is the reversal form at swept extremes.

### Claim vs evidence
| Claim | Status |
| --- | --- |
| Definition, NQ/ES pairing, confirmation-not-entry role | ICT teaching (2022 mentorship era), uniformly echoed |
| Stop-beyond-sweep-wick invalidation; heal-on-confirmation | Community formalization, internally consistent |
| 79% reversal in 88 logged NQ/ES instances, avg 78 pts | Self-reported community study (ictkillzone) — no public data |
| "Near-automatic short at BSL + SMT" | Community enthusiasm — not evidence |

### Refreshing the archived Vault SMT script
`pine/archive/Vault_TS_SMT_v1.pine` already implements the canon-correct read: SMT evaluated **at the sweep bar** (NQ swept its level, ES held its own swing), as an Off / Prefer (label-only) / Require filter ahead of MSS + displacement. Two gaps vs this note if it's ever revived:
- It has no **heal/invalidation** logic — if ES confirms (takes its level) while the NQ trade is pending or open, canon says the SMT is dead; the script keeps the label.
- ES swing reference uses the same pivot params as NQ; the noise-threshold condition (material gap, not ticks) is unmodeled — `i_minSweepPts` covers NQ's sweep but nothing requires ES's *failure margin* to be material.

## APPLICATION TO THE VAULT

1. **Do not add SMT to Dual46 entry logic — freeze stays.** Canon itself says SMT is confirmation, and Powell (whose system Dual46 mechanizes) demonstrably uses it only mid-trade. There is no source basis for an SMT entry gate.
2. **The one Powell-faithful use is a management tag, post-May question:** "ES on second monitor after fill; SMT against the position → trail aggressively / exit at next objective." That is a discretionary overlay and belongs, if anywhere, in the disc sleeve — for the frozen script arm it is journal-only: log a boolean `SMT_against_at_exit?` column so the May/June ledger can later say whether SMT-flagged runners underperformed the 1:5 hold. Costs one glance, changes no rule.
3. **NWOG sleeve synergy is real:** a NWOG tap where NQ tapped/swept the level but ES did *not* reach its equivalent is the textbook "manufactured extreme at an HTF array" — the highest-grade SMT context in canon. Add an optional `SMT_at_tap?` column to the sleeve census; it is exactly the kind of cheap boolean the census exists to adjudicate.
4. **Invalidation discipline transfers:** the "heal" rule (divergence dead once the second index confirms) is the cleanest binary in ICT-land — if the census SMT column graduates to a rule, implement heal-checking, which the archived Pine script currently lacks.
5. **Ignore the 79%/88 figure** for any prop math; unpublished ledger. If SMT-at-tap matters, the census will show it in the Vault's own rows.

## Sources

1. innercircletrader.net — ICT SMT Divergence tutorial (definition, NQ/ES origin 2022, 15m-or-lower execution guidance) — https://innercircletrader.net/tutorials/ict-smt-divergence-smart-money-technique/
2. ictkillzone.com — ICT SMT Divergence complete guide (validity conditions, entry sequence, stop-beyond-wick invalidation; the self-reported 79%/88-instance log) — https://www.ictkillzone.com/ict-smt-divergence
3. TradingFinder via ForexFactory — SMT comprehensive guide (correlated-pairs list, PD-array confluence, 15m-or-lower) — https://www.forexfactory.com/thread/1342743-ict-smt-divergence-a-comprehensive-guide-tflab
4. arbitragescanner.io — SMT divergence guide ("crack in correlation" framing; multi-TF usage; session frequency) — https://arbitragescanner.io/blog/smt-divergence
5. michaeljhuddleston.org — SMT notes (regular vs hidden variants; TF trade-offs) — https://michaeljhuddleston.org/notes/ict-smt-divergence-explained-trade-reversals-like-smart-money/
6. **Powell (primary, Vault archive)** — `vault-app/data/powell-transcripts/live-trade-1-7rr.txt` [3:51–4:32] and `60k-february-setup.txt` [17:34] — SMT as exit accelerant and stop-width rationale
7. Vault internal — `pine/archive/Vault_TS_SMT_v1.pine` (existing SMT-at-sweep implementation reviewed against canon)
