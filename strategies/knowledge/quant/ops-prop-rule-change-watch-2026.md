---
topic: ops-prop-rule-change-watch-2026
researched: 2026-07-18
sources: 8
agent-cycle: cycle3-laneB
---
# Prop Rule-Change Watch 2026: What Changed at Topstep / Apex / TPT vs the Landscape Note

*Delta-audit against `quant/prop-firm-landscape-2026.md` (researched 2026-07-17). Only differences and new facts are recorded here; the landscape note remains the base inventory. All sources are affiliate/secondary — re-verify on firm help centers at purchase time.*

## Key findings

- **TOPSTEP — April 28, 2026 payout-cap cut (NOT in the landscape note, material):** new 50K No-Activation-Fee accounts have per-payout caps of **$2,000 Standard / $3,000 Consistency** (down from $5,000/$6,000); 100K = $3,000/$4,000–6,000 (sources conflict on the Consistency figure: tradecovex says $6,000, Phidias says $4,000 — verify); 150K unchanged at $5,000/$6,000. Pre-Apr-28 accounts keep old caps, but a reset purchased after Apr 28 falls under the new caps. Also: 5%-of-balance per-request limit applies independently; minimum payout $125; $30 fee per payout on some rails (Phidias).
- **TOPSTEP — Max Loss Limit resets to $0 after the first Express payout (NOT in the landscape note, critical):** after payout #1 the account can never dip below starting balance — the entire cushion is removed. One normal drawdown after a withdrawal can end the account. This directly modifies the payout-cadence note's phase-2 math for Topstep: the "frozen floor + 8R cushion" model must use *starting balance* as the floor post-payout, and the cushion must be rebuilt from retained profit before each subsequent withdrawal.
- **TOPSTEP — Consistency path detail confirmed:** 3 trading days + largest-day ≤40% of window profit, vs Standard 5 winning days (>$150/day) with no consistency test. Payout timeline of changes: Nov 2025 → Apr 2026 documented in tradecovex's dated timeline (90/10 from Jan 12, path split Feb 5, Live Funded restructure Feb 17, Futures Desk acquisition Apr, TopstepX platform mandatory for new sign-ups).
- **APEX — CONFLICT with the landscape note's "$85/mo per PA":** every 4.0-era source this cycle describes **one-time PA activation fees ($69–149 by size/type: EOD ≈ $99, Intraday ≈ $79, due within 7 calendar days of passing or the funded account is forfeit)** and *no recurring funded cost* on 4.0 accounts; monthly billing was one of the six things eliminated on 2026-03-01. The $85/mo figure appears to be a legacy-account artifact. **Verdict: treat Apex 4.0 funded accounts as $0/mo + one-time activation; verify on apextraderfunding.com before purchase.** This materially improves Apex's ranking in the landscape note (its biggest cited negative was the recurring fee).
- **APEX — new since May 2026 (post-dates some landscape sourcing):** a **No Activation Fee** purchase track on all sizes (eval price covers activation; PA activates immediately) and a **Five Pack** bulk-purchase option. Also confirmed 4.0 facts the landscape note carried: 6-payout lifetime cap, 50% consistency, mandatory bracket orders (platform-enforced), automated payouts ("payout denials eliminated"), 30-day eval expiry, overnight ban. New detail: **EOD accounts carry a tier-based Daily Loss Limit** ($1,000 on 50K — pauses the session, doesn't kill the account); Intraday accounts have no DLL but tick-by-tick trailing. Sources conflict on 50K EOD drawdown ($2,000 vs $2,500) and DLL/contract tiers — verify.
- **TPT — no major rule changes found since the landscape note.** The 2026 picture is stable: Test (EOD trail, 50% consistency during Test) → PRO (intraday trail, buffer = full DD, 80/20, daily payouts, no consistency) → PRO+ at $10k cumulative (90/10, EOD, no buffer). The one open flag from the payout-cadence note stands: the reported ≤60-day early-withdrawal 50% penalty is secondary-sourced and unconfirmed. TPT remains the anti-copier, anti-automation outlier.
- **Meta-finding: cap compression is the 2026 industry direction.** Topstep cut caps in April; Apex ladders + 6-payout cap bound lifetime extraction (~$13–14.5k per 50K PA); TPT keeps flat caps. Per-account lifetime value is shrinking while eval prices fall — the industry is converting funded accounts into consumables. Income modeling must amortize over account *cycles*, not perpetual seats (already the landscape note's direction; now stronger).

## Details / mechanics

**Reconciled 50K funded-stage snapshot (2026-07-18; conflicts marked):**

| | Apex 4.0 EOD | Apex 4.0 Intraday | Topstep XFA (post-4/28) | TPT PRO |
|---|---|---|---|---|
| Trailing DD | $2,000–2,500 (sources conflict) EOD | same, tick-by-tick | $2,000 MLL EOD → **$0 after 1st payout** | ~$2,000 intraday |
| DLL | $1,000 (pauses, doesn't kill) | none | $1,000 daily loss limit | none |
| Consistency | 50% | 50% | none (Std) / 40% (Consist.) | none |
| Per-payout cap | ladder $1.5k→$3k | ladder | **$2,000 (Std) / $3,000 (Consist.)** | none |
| Lifetime cap | 6 payouts ≈ $13k | 6 ≈ $14.5k | none | none |
| Funded recurring fee | **$0 (4.0)** — landscape note's $85/mo looks stale | $0 | $0 | $0 |
| Activation | ~$99 one-time (or No-Activation-Fee track) | ~$79 | $0 on No-Activation Combine | $130 |

**Watch procedure going forward (repeatable):** once per month, or the week before any purchase: (1) pull tradecovex's dated rule-change timeline pages for Topstep/Apex/TPT (they cite firm help-center article numbers); (2) diff against this note + the landscape note; (3) verify any purchase-relevant number on the firm's own help center. The firms have changed rules on average every ~6–8 weeks in 2026 — a quarterly check is too slow if a purchase is imminent.

## APPLICATION TO THE VAULT

- **Re-rank alert: Apex's worst feature ($85/mo) is probably gone on 4.0 accounts.** With $0 recurring + 100% split + EOD option + No-Activation-Fee track, Apex EOD moves up the landscape note's ranking — its remaining negatives are the 6-payout cap, ladder, and 50% consistency. Re-run the ranking before the first purchase; don't rely on the 07-17 ordering.
- **Topstep's post-payout $0 MLL changes the extraction rhythm:** at Topstep, the payout-cadence note's "sweep everything above 8R" is too aggressive after payout #1 — each withdrawal resets the account to a zero-cushion state. Topstep policy: retain enough post-payout to rebuild ~8R of working room before the next request, or accept elevated account-death probability per cycle. Apex/TPT do not have this reset.
- **Topstep's new $2k cap on 50K Standard is binding for Dual46**: a good month (~$2.5–3.5k gross at 10 MNQ) now takes 2 payout cycles to extract at 50K. Either buy 100K+ ($3k cap) or accept the lag; factor into E[$/wk].
- **The conflicting numbers (Apex 50K DD $2,000 vs $2,500; Topstep 100K Consistency cap $4k vs $6k; Apex fee structure) are purchase-blockers, not research tasks** — resolve them on the firm's own help center in the same session as checkout, per the watch procedure above.
- **Update cadence:** this note supersedes the landscape note where they conflict; next delta-audit due before first funded purchase or ~2026-09, whichever comes first.

## Sources

1. tradecovex — Topstep Rule Changes 2026, dated timeline incl. Apr 28 payout cut (cites Topstep help articles 8284233, 14289835): https://tradecovex.com/guides/topstep-rule-changes-2026
2. tradecovex — Topstep Payout Rules 2026 ($2k/$3k caps, 90/10 from Jan 12, paths, $125 min): https://tradecovex.com/guides/topstep-payout-rules-2026
3. Phidias — Topstep Payout Rules: Costs, Caps and Traps (MLL→$0 after first payout; $30 payout fee; conflicting 100K Consistency cap $4k): https://phidiaspropfirm.com/education/topstep-payout-rules
4. tradecovex — Topstep Combine Rules 2026 (Combine targets/MLL, Feb 5 path split mechanics): https://tradecovex.com/guides/topstep-combine-rules-2026
5. SpicyFutures — Apex 4.0 review (May 2026 No-Activation-Fee + Five Pack; EOD DLL tiers; mandatory brackets; overnight ban): https://spicyfutures.com/apex-trader-funding-4-0-review-2026/
6. DealPropFirm — Apex March 2026 rules (six rules removed; payout denials eliminated; one-time fees): https://dealpropfirm.com/articles/apex-trader-funding-march-2026-new-rules
7. proptradingvibes — Apex 4.0 tested (PA activation $99 EOD / $79 Intraday, 7-day forfeit window; TPT comparison): https://proptradingvibes.com/blog/why-traders-leave-apex
8. futuresfirms — Apex review 2026 (fee ranges $69–149, tier table — note its DD figures conflict with SpicyFutures): https://futuresfirms.com/apex-trader-funding-review.html
