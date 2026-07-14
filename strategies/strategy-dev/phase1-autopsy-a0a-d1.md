---
updated: 2026-07-14
status: settled
owner: strategy-dev
tags: [phase1, autopsy, a0a, d1, regime-gate]
---
# Phase 1 autopsy — A0a / D1 3y

> Tables from `vault-app/scripts/analyze-prb-3y-autopsy.ts` · JSON `vault-app/data/tv-exports/prb-3y-autopsy.json`.  
> Window: `prb-a0a-3y.csv` / `prb-d1-3y.csv` · OOS from **2025-07-14** · MC max 220 · buffer 2000.  
> Gated ledgers: `prb-a0a-3y-gate-jul-oct.csv` · `prb-d1-3y-gate-jul-oct.csv`

Parent brief: [[execution-plan-post-3y]].

## A0a (eval)

**Overall:** n=120 · net $8528 · WR 13.3% · E/trade $80 · maxDD $5663 · raw $/wk $55
**MC (TPT50 · max 220 · buf 2000):** pass 35.6% · bust 64.4% · E[$/wk] $4 · weeks→payout 26

### Year / half-year splits

| Window | n | net | WR% | E/trade | maxDD | raw $/wk |
|---|---:|---:|---:|---:|---:|---:|
| 2023 | 22 | $-3723 | 4.5 | $-161 | $3892 | $-165 |
| 2024 | 39 | $1607 | 10.3 | $50 | $3000 | $34 |
| 2025 | 34 | $5689 | 17.6 | $177 | $4864 | $116 |
| 2026 | 25 | $4955 | 20 | $204 | $1636 | $185 |
| 2023-H2 | 22 | $-3723 | 4.5 | $-161 | $3892 | $-165 |
| 2024-H1 | 16 | $1223 | 12.5 | $83 | $1940 | $77 |
| 2024-H2 | 23 | $384 | 8.7 | $27 | $3000 | $15 |
| 2025-H1 | 17 | $-1316 | 5.9 | $-64 | $3161 | $-54 |
| 2025-H2 | 17 | $7004 | 29.4 | $419 | $1703 | $294 |
| 2026-H1 | 24 | $5371 | 20.8 | $230 | $1622 | $217 |
| 2026-H2 | 1 | $-416 | 0 | $-416 | $416 | $null |

**In-sample (< 2025-07-14):** n=80 net $-4226 E/trade $-43 · MC E[$/wk] $-18
**OOS (≥ 2025-07-14):** n=40 net $12754 E/trade $325 · MC E[$/wk] $103 · pass 78.6% bust 21.5%

### Calendar-month expectancy (pooled across years)

| Mo | n | net | E/trade | WR% |
|---|---:|---:|---:|---:|
| 07 | 11 | $-2944 | $-263 | 0 |
| 10 | 9 | $-1959 | $-208 | 0 |
| 03 | 11 | $-1465 | $-120 | 0 |
| 02 | 8 | $507 | $71 | 12.5 |
| 01 | 12 | $858 | $75 | 16.7 |
| 06 | 8 | $608 | $90 | 12.5 |
| 09 | 10 | $781 | $90 | 10 |
| 12 | 10 | $1600 | $166 | 20 |
| 08 | 12 | $1964 | $175 | 16.7 |
| 04 | 10 | $1980 | $206 | 20 |
| 11 | 11 | $3807 | $354 | 27.3 |
| 05 | 8 | $2791 | $354 | 25 |

### Winner clusters

Winners (pnl>$50): **16** · big (≥$1500): **16** · news mix: {"unknown":7,"red":8,"quiet":1}

| Date | PnL | WD | Red? | Headlines |
|---|---:|---|---|---|
| 2025-09-30 | $1975 | Tue |  |  |
| 2024-12-19 | $1963 | Thu | Y | Final GDP q/q; Core PCE Price Index m/m |
| 2026-02-10 | $1943 | Tue | Y | Advance Monthly Sales for Retail and Food Services |
| 2026-06-05 | $1939 | Fri | Y | Employment Situation |
| 2026-05-29 | $1938 | Fri |  |  |
| 2025-11-18 | $1935 | Tue |  |  |
| 2025-12-16 | $1935 | Tue | Y | Employment Situation; Advance Monthly Sales for Retail and F |
| 2026-05-21 | $1924 | Thu |  |  |
| 2025-11-04 | $1916 | Tue |  |  |
| 2024-04-30 | $1908 | Tue | Y | CB Consumer Confidence; JOLTS Job Openings |
| 2026-01-02 | $1905 | Fri |  |  |
| 2023-11-16 | $1894 | Thu | Y | Unemployment Claims |
| 2024-04-16 | $1891 | Tue |  |  |
| 2025-08-07 | $1888 | Thu |  |  |

### Loss streaks (≥2) & trail-death paths

- **5L** 2025-07-02→2025-07-25 sum $-1703 · 2025-07-02:$-382, 2025-07-08:$-412, 2025-07-16:$-395, 2025-07-23:$-429, 2025-07-25:$-84
- **4L** 2025-01-14→2025-02-28 sum $-1702 · 2025-01-14:$-434, 2025-01-28:$-424, 2025-01-30:$-413, 2025-02-28:$-431
- **4L** 2026-06-10→2026-07-08 sum $-1636 · 2026-06-10:$-404, 2026-06-17:$-405, 2026-06-24:$-411, 2026-07-08:$-416
- **4L** 2023-08-31→2023-10-12 sum $-1317 · 2023-08-31:$-412, 2023-09-05:$-406, 2023-10-06:$-419, 2023-10-12:$-80
- **4L** 2026-01-16→2026-01-28 sum $-1173 · 2026-01-16:$-177, 2026-01-21:$-337, 2026-01-22:$-231, 2026-01-28:$-427
- **3L** 2024-09-20→2024-10-04 sum $-968 · 2024-09-20:$-402, 2024-10-02:$-162, 2024-10-04:$-404

- **Trail≥$2k drop** 2023-07-14→2023-08-31 drop $2077 over 8 trades
- **Trail≥$2k drop** 2023-11-21→2024-02-09 drop $2304 over 10 trades
- **Trail≥$2k drop** 2024-08-22→2024-11-01 drop $2184 over 14 trades
- **Trail≥$2k drop** 2025-01-14→2025-03-26 drop $2180 over 9 trades

### News overlay

- Quiet: n=13 net $-557 avg $-43
- Red: n=67 net $1583 avg $24
- Red-folder: 67 trades · +$1,583 net · Quiet: 13 trades · $557 net
- A0a is profitable on red-folder days (+$1,583 on 67 trades). News days are not a drag in this window.

### Gate candidates (MC lift)

| Gate | kept | dropped net | E[$/wk] full→gated | OOS E[$/wk] full→gated | lift | OOS lift |
|---|---:|---:|---|---|---:|---:|
| STAND_DOWN red-folder days | 53 | $1583 | $3→$0 | $103→$67 | -3 | -36 |
| STAND_DOWN calendar months 08+09 (Aug–Sep) | 98 | $2745 | $4→$-2 | $102→$59 | -6 | -43 |
| STAND_DOWN calendar months 02+03 (Feb–Mar) | 101 | $-958 | $6→$7 | $103→$85 | 1 | -18 |
| STAND_DOWN months 07+10 (Jul+Oct) — primary candidate | 100 | $-4903 | $1→$17 | $103→$139 | 16 | 36 |
| STAND_DOWN month 07 only (Jul) | 109 | $-2944 | $4→$10 | $102→$143 | 6 | 41 |
| STAND_DOWN months 07+10+03 (Jul+Oct+Mar) | 89 | $-6369 | $4→$22 | $97→$143 | 18 | 46 |
| STAND_DOWN Mondays | 120 | $0 | $2→$3 | $103→$100 | 1 | -3 |
| STAND_DOWN IS-worst months 07+10 (exploratory) | 100 | $-4903 | $3→$17 | $106→$141 | 14 | 35 |
| STAND_DOWN IS-worst half 2023-H2 (historical one-shot) | 98 | $-3723 | $2→$21 | $97→$95 | 19 | -2 |

## D1 (funded)

**Overall:** n=120 · net $10056 · WR 11.7% · E/trade $93 · maxDD $7489 · raw $/wk $65
**MC (TPT50 · max 220 · buf 2000):** pass 91.7% · bust 44.5% · E[$/wk] $27 · weeks→payout 11.7

### Year / half-year splits

| Window | n | net | WR% | E/trade | maxDD | raw $/wk |
|---|---:|---:|---:|---:|---:|---:|
| 2023 | 22 | $-3340 | 4.5 | $-144 | $3892 | $-148 |
| 2024 | 39 | $-1503 | 5.1 | $-29 | $4129 | $-31 |
| 2025 | 34 | $8003 | 17.6 | $246 | $4864 | $164 |
| 2026 | 25 | $6895 | 20 | $282 | $1636 | $258 |
| 2023-H2 | 22 | $-3340 | 4.5 | $-144 | $3892 | $-148 |
| 2024-H1 | 16 | $1991 | 12.5 | $131 | $1940 | $126 |
| 2024-H2 | 23 | $-3493 | 0 | $-140 | $3493 | $-140 |
| 2025-H1 | 17 | $-944 | 5.9 | $-42 | $3161 | $-39 |
| 2025-H2 | 17 | $8947 | 29.4 | $533 | $1703 | $375 |
| 2026-H1 | 24 | $7312 | 20.8 | $311 | $1622 | $296 |
| 2026-H2 | 1 | $-416 | 0 | $-416 | $416 | $null |

**In-sample (< 2025-07-14):** n=80 net $-6581 E/trade $-72 · MC E[$/wk] $-5
**OOS (≥ 2025-07-14):** n=40 net $16637 E/trade $423 · MC E[$/wk] $117 · pass 190.4% bust 10.3%

### Calendar-month expectancy (pooled across years)

| Mo | n | net | E/trade | WR% |
|---|---:|---:|---:|---:|
| 07 | 11 | $-2944 | $-263 | 0 |
| 10 | 9 | $-1959 | $-208 | 0 |
| 03 | 11 | $-1465 | $-120 | 0 |
| 12 | 10 | $10 | $8 | 10 |
| 08 | 12 | $447 | $51 | 8.3 |
| 02 | 8 | $899 | $120 | 12.5 |
| 09 | 10 | $1181 | $130 | 10 |
| 01 | 12 | $1614 | $138 | 16.7 |
| 06 | 8 | $998 | $139 | 12.5 |
| 04 | 10 | $2747 | $283 | 20 |
| 05 | 8 | $3565 | $451 | 25 |
| 11 | 11 | $4962 | $459 | 27.3 |

### Winner clusters

Winners (pnl>$50): **14** · big (≥$1500): **14** · news mix: {"unknown":7,"red":6,"quiet":1}

| Date | PnL | WD | Red? | Headlines |
|---|---:|---|---|---|
| 2025-09-30 | $2375 | Tue |  |  |
| 2026-02-10 | $2335 | Tue | Y | Advance Monthly Sales for Retail and Food Services |
| 2026-06-05 | $2329 | Fri | Y | Employment Situation |
| 2026-05-29 | $2328 | Fri |  |  |
| 2025-11-18 | $2325 | Tue |  |  |
| 2025-12-16 | $2325 | Tue | Y | Employment Situation; Advance Monthly Sales for Retail and F |
| 2026-05-21 | $2308 | Thu |  |  |
| 2025-11-04 | $2299 | Tue |  |  |
| 2024-04-30 | $2293 | Tue | Y | CB Consumer Confidence; JOLTS Job Openings |
| 2026-01-02 | $2289 | Fri |  |  |
| 2023-11-16 | $2276 | Thu | Y | Unemployment Claims |
| 2024-04-16 | $2274 | Tue |  |  |
| 2025-08-07 | $2268 | Thu |  |  |
| 2025-01-08 | $2217 | Wed | Y | ADP Non-Farm Employment Change; Unemployment Claims |

### Loss streaks (≥2) & trail-death paths

- **5L** 2025-07-02→2025-07-25 sum $-1703 · 2025-07-02:$-382, 2025-07-08:$-412, 2025-07-16:$-395, 2025-07-23:$-429, 2025-07-25:$-84
- **4L** 2025-01-14→2025-02-28 sum $-1702 · 2025-01-14:$-434, 2025-01-28:$-424, 2025-01-30:$-413, 2025-02-28:$-431
- **4L** 2026-06-10→2026-07-08 sum $-1636 · 2026-06-10:$-404, 2026-06-17:$-405, 2026-06-24:$-411, 2026-07-08:$-416
- **4L** 2023-08-31→2023-10-12 sum $-1317 · 2023-08-31:$-412, 2023-09-05:$-406, 2023-10-06:$-419, 2023-10-12:$-80
- **4L** 2026-01-16→2026-01-28 sum $-1173 · 2026-01-16:$-177, 2026-01-21:$-337, 2026-01-22:$-231, 2026-01-28:$-427
- **3L** 2024-09-20→2024-10-04 sum $-968 · 2024-09-20:$-402, 2024-10-02:$-162, 2024-10-04:$-404

- **Trail≥$2k drop** 2023-07-14→2023-08-31 drop $2077 over 8 trades
- **Trail≥$2k drop** 2023-11-21→2024-02-09 drop $2304 over 10 trades
- **Trail≥$2k drop** 2024-05-07→2024-10-02 drop $2059 over 17 trades
- **Trail≥$2k drop** 2024-10-04→2024-12-31 drop $2070 over 10 trades

### News overlay

- Quiet: n=13 net $-174 avg $-13
- Red: n=67 net $18 avg $0
- Red-folder: 67 trades · +$18 net · Quiet: 13 trades · $174 net
- Red-folder P&L is roughly flat (+$18 on 67 trades). D1 may be skipping or scratching news sessions — manual Data H/L replay on CPI/NFP days is the only honest way to test if 8:30 adds edge.

### Gate candidates (MC lift)

| Gate | kept | dropped net | E[$/wk] full→gated | OOS E[$/wk] full→gated | lift | OOS lift |
|---|---:|---:|---|---|---:|---:|
| STAND_DOWN red-folder days | 53 | $18 | $26→$23 | $113→$81 | -3 | -32 |
| STAND_DOWN calendar months 08+09 (Aug–Sep) | 98 | $1628 | $30→$25 | $109→$87 | -5 | -22 |
| STAND_DOWN calendar months 02+03 (Feb–Mar) | 101 | $-566 | $27→$27 | $114→$97 | 0 | -17 |
| STAND_DOWN months 07+10 (Jul+Oct) — primary candidate | 100 | $-4903 | $28→$36 | $120→$149 | 8 | 29 |
| STAND_DOWN month 07 only (Jul) | 109 | $-2944 | $28→$38 | $119→$151 | 10 | 32 |
| STAND_DOWN months 07+10+03 (Jul+Oct+Mar) | 89 | $-6369 | $32→$39 | $121→$138 | 7 | 17 |
| STAND_DOWN Mondays | 120 | $0 | $28→$28 | $120→$117 | 0 | -3 |
| STAND_DOWN IS-worst months 12+07 (exploratory) | 99 | $-2934 | $31→$36 | $112→$114 | 5 | 2 |
| STAND_DOWN IS-worst half 2023-H2 (historical one-shot) | 98 | $-3340 | $30→$39 | $113→$117 | 9 | 4 |

## Settlement (2026-07-14)

### Regime structure — **found** (not pure noise)

| Finding | Evidence |
|---|---|
| Edge is **non-stationary** | A0a IS (<2025-07-14): net **−$4.2k**, MC E[$/wk] **−$18**. OOS: net **+$12.7k**, E[$/wk] **~$100**. Same pattern on D1. |
| Winners are rare ~$1.9–2.3k RR hits | 14–16 winners / 120 trades over 3y; almost all after mid-2025 |
| **Jul + Oct are barren** | Pooled: Jul n=11 WR **0%** net −$2.9k · Oct n=9 WR **0%** net −$2.0k (both books) |
| Mar also WR 0% | Weaker / risk of overfit if stacked — keep as optional Tier-2, not v0 |
| Red-folder stand-down **fails** for PRB | A0a red net **+$1.6k**; skipping red **hurts** E[$/wk] |
| Trail deaths | Multiple ≥$2k drop paths in 2023–early 2025; cold streaks of 4–5 losses (~$400) fit inside trail almost by themselves |

### Primary gate — `regime-gate-v0`

```text
TRADE     if calendar month ∉ {7, 10}
STAND_DOWN if calendar month ∈ {7, 10}   // July, October
```

Falsifiable prediction: gated ledgers beat ungated on **full 3y** and **OOS last 12m** `E[$/wk]`, with bust ↓, without wiping cadence (n stays ≥ ~80–100).

| Book | kept | E[$/wk] full | E[$/wk] gated | OOS ungated → gated | bust full → gated |
|---|---:|---:|---:|---|---|
| **A0a** | 100 | ~$1–4 | **~$17** | ~$103 → **~$139** | ~66% → **~48%** |
| **D1** | 100 | ~$28–30 | **~$36** | ~$119 → **~$150** | ~45% → **~32%** |

Dropped Jul+Oct net ≈ **−$4.9k** (pure loser mass). Sample after gate: **100 trades** (above research floor).

**Kill / do-not-promote gates:** red-folder stand-down · Aug–Sep stand-down · Monday (already skipped in PRB) · dropping only “2023-H2” (historical one-shot, not forward-operable).

**Optional aggressive variant (not v0):** also skip March (WR 0%) → `07+10+03`. Higher A0a lift, n=89 — promote only if Lab Phase 2 confirms and cadence still acceptable.

### Phase 1 → Phase 2

- Regime structure **exists** → stay on **Track A** (do not jump to Track B yet).
- Next: Lab MC on `*-gate-jul-oct.csv` with hypothesis `regime-gate-v0` · save research/eval cohorts · settle in [[findings-prb]].
- Caveat: full-sample still thin income; gate improves survival + EV/wk but does **not** invent a forever cohesive ICT edge.
