---
updated: 2026-07-15
status: settled
tags: [track-b, synthesis, kill-lessons, strategy-dev]
---
# Track B error synthesis — B0–B10 (pre–next Stage-0)

> Written before activating the next Stage-0. Sources: [[kill-lessons-track-b]], event-study JSONs under `vault-app/data/tv-exports/`, [[phase1-autopsy-a0a-d1]], [[findings-prb]], [[phase2-4-cofeature]].  
> Purpose: stop costume-swapping clocks/labels; only combine **settled analytics** that still obey hard constraints.

## Cross-book EV map (Stage-0 trade EV, MNQ)

| Book | n | EV $ | CI covers 0? | RR (geom) | OOS EV | Pattern |
|---|---:|---:|---|---:|---:|---|
| B2 MPSF | 30 | −76 | **no** (negative) | ~1.4 | −83 | Hard poison — rare *and* wrong |
| B3 NRExp | 27 | −18 | yes | ~1.4 | −26 | Thin + still away |
| B4 VWAPz | 147 | −15 | yes | ~2.3 | −22 | Low WR / high RR trap · maxL hostile |
| B5 1005 | 61 | −5 | yes | ~1.4 | −36 | PRB-adjacent clock · soft reject |
| B6 GapFade | 340 | −9 | yes | ~1.3 | −13 | **High-n soft drain** |
| B7 PMCont | 516 | −8 | yes | ~1.4 | −20 | Same drain, afternoon label |
| B9 MTF PMCont | 425 | −9 | yes | ~1.4 | −18 | HTF wrap ≠ edge |
| B10 LOM | 465 | −5 | yes | ~2.5 | −0.4 | Open-magnet fade · still soft drain |
| B0 ORB / B1 ERXor | (prior notes) | neg | — | — | — | Trail / xor costume dead |

No Track B Stage-0 printed **toward**. Useful elimination only.

## Error classes (what we kept repeating)

### E1 — Geometry trap costume

Many books land near **~WR 25–40% · RR ~1.3–2.5 · EV ≈ −$5 to −$15** on spammy or semi-spammy events. Raising RR (B4, B10) without changing the **event rarity** still drains. SCORECARD rank-3 geometry never rescued rank-2 EV.

### E2 — High-n soft reject

B6/B7/B9/B10 all n≳340 with slight-negative EV and CIs covering 0. That is a *settled drain shape*, not “almost edge.” Filters or MTF wrappers on the same family do not create breadth ([[SCORECARD]] Grinold note).

### E3 — Polarity-blind MR

Overnight / session magnets were tested as **fades** (B2, B4, B6, B10). Opposite claim (continuation) was drafted as B8 then **shelved** while the spray continued into B9/B10 — skipped the one flip already licensed by harvest.

### E4 — Frequency lever ignored

Kill-lessons soft + B7 soft: if revisiting continuation, need **rare** threshold (n≪200/3y) **or** a new barrier. Overnight spray ignored rarity and kept cloning clocks (10:05, 12:05, 14:30).

### E5 — Independence ≠ edge

B2–B10 were often independent of PRB time box / levels and still died. Independence is a **search constraint**, not a promote argument.

### E6 — Costume stacking

ER xor (B1), MTF on PMCont (B9), open-magnet late fade (B10) = new *labels* on dead *families*. Forbidden under retune / costume rules.

## Winning analytics that *can* combine (and which must not)

### From Track A — keep as design habits, not ICT clones

| Analytic | Status | How to use in next Track B |
|---|---|---|
| Loss shape vs $2k trail first | Settled | Cap risk ($150 Stage-0) · pin maxL budget before cadence claims |
| 1 trade/day slot | Settled PRB context | Keep in measure Pine (already in GapCont) |
| BE@2R / small losses matter more than WR | Settled management | Stage-0: simple hard stop + 1.5R — do **not** import 5–6R PRB barriers |
| Jul+Oct STAND_DOWN | Ops overlay PASS | **Ops for gated PRB only** — not a free Track B “edge” in the event def ([[kill-lessons-track-b]] soft) |
| Red-folder stand-down | **FAIL** for PRB | Do not invent news stand-down as Track B rescue |
| Path cold-3L / roll10 co-features | Didn’t beat calendar on OOS | Do not stack as Stage-0 event filters |
| Auto PDH/PDL / formal RB | PRB event | **Forbidden** as Track B costume |
| Macro A-tier filter | Sleeve-only | Not a new book |

### From Track B harvest — transferable

| Analytic | Source | Combine into next book |
|---|---|---|
| Change **polarity** after a kill (fade→cont) | B6 soft · B8 draft | Allowed — new claim, same level family only if polarity flips |
| Force **event rarity** before cont | B7/B9 soft | \|gap\| ≥ 1.0×ATR frozen — fail if n&gt;300 |
| Barrier stays Stage-0-simple (1.5R) | Meta trap | Do not “fix” with RR5 |
| HTF plumbing is ready | B9 process win | Use later **after** a toward — not as the idea |
| Skip PRB-morning clocks | B5 | Arm may touch open, but event ≠ 10:05 impulse / RB |

## Combinations **rejected** this cycle

- Jul+Oct gate × any killed Track B ledger — calendar is PRB ops; stacking ≠ new alpha.  
- MTF × AM→PM cont — already killed (B9).  
- VWAP z × ER regime — killed path (B1→B4).  
- Gap fade × tighter mult — retune of B6.  
- Open-magnet × rarer ATR — retune of B10.  
- NR compression × PDH/PDL break — B3 family.

## Chosen synthesis → next Stage-0

**B8 GapCont** (already drafted + measure Pine) is the only pre-registered candidate that stacks *allowed* analytics without reopening a kill:

1. Flip of B6 fade → **gap continuation** (new falsifiable claim).  
2. Rarity lever from B7/B9 → **1.0×ATR** frozen (not a post-hoc sweep).  
3. Trail-safe Stage-0 barrier from meta trap → **$150 / 1.5R**.  
4. Slot discipline from Track A → **1/day**.  
5. Outside B10 open-magnet / B7–B9 AM→PM / VWAP / ORB / NR / PD sweep.

If B8 dies, harvest again — do **not** invent B11 the same day.

## Links

- Active candidate: [[track-b-b8-gap-cont-v0]] · [[event-study-b8-gap-cont]]  
- Ledger: [[kill-lessons-track-b]] · [[track-b-meta-progress]] · [[track-b-ideas]]
