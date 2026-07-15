---
updated: 2026-07-14
tags: [tpt, prop-rules, reference, strategy-dev]
sources:
  - https://takeprofittraderhelp.zendesk.com/hc/en-us/categories/15135982702621-Test-Rules
  - https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171769361053-PRO-Account-Rules
  - https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15172219527581-PRO-Account-Profit-Split-Withdrawal-Rules
  - https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171978600349-PRO-Account-Upgrade-Process-Overview-and-Guidelines
---
# Take Profit Trader — official rules ($50K focus)

> Canonical agent reference scraped from TPT Zendesk (Jul 2026). Use for MC pass modeling, eval vs PRO playbooks, and recycle-before-PRO+ planning. Code mirror: `vault-app/lib/prop-firms.ts` (`tpt50`).

## Account table ($50K futures)

| Field | Test | PRO | PRO+ |
|---|---|---|---|
| Starting balance | $50,000 | $50,000 | $0 (new account) |
| Max contracts | 6 | 6 | 6 |
| Profit target | $3,000 | — | — |
| Max trailing DD | $2,000 | $2,000 | $2,000 EOD on PRO+ |
| DD mode | **EOD** | **Intraday** | EOD (PRO+ article) |
| Consistency | **50% + 5 min days** | **None** | None |
| Bots / algos | Allowed on test | **Prohibited** | Prohibited |
| News trading | Allowed on test | Flat ±1 min FOMC/NFP/CPI | Same + instrument-specific |

---

## Test (evaluation) — 6 core rules

Source: [Test Rules category](https://takeprofittraderhelp.zendesk.com/hc/en-us/categories/15135982702621-Test-Rules)

### Rule 1 — Hit profit target

- $50K target: **$3,000** net profit.
- Hitting $3,000 alone does **not** finish the test — Rule 5 also applies.

### Rule 2 — Max position size

- $50K: **6 contracts** max.

### Rule 3 — EOD maximum trailing drawdown

- $50K: **$2,000** trailing drawdown, calculated **end of day only** (not intraday).
- Minimum account balance trails highest **EOD** balance upward until it locks at starting balance ($50,000).
- Touching minimum balance (realized or unrealized) → immediate liquidation.
- **No separate daily loss limit** on test.

### Rule 4 — Approved products & hours

- Trade only permitted instruments during permitted session hours (see TPT product list).

### Rule 5 — Be consistent (critical for MC)

Source: [Rule 5: Be Consistent](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15170316538013-Rule-5-Be-Consistent)

**A. Minimum 5 trading days**

- A trading day = any day with **≥1 trade placed**.
- Reaching profit target in 2 days still requires **3 more active days**.
- No maximum time limit (monthly subscription continues until pass or cancel).

**B. Profit consistency (50% rule)**

```
Consistency % = Highest profit day ÷ Net P/L
```

- Must be **strictly below 50%** to qualify for PRO.
- Breach does **not** fail the account — you keep trading until total profit rises.
- **Updated profit goal** (shown on dashboard):

```
Updated Profit Goal = Net P/L × 2
```

**Worked example ($50K)**

| Day | P&L | Running net |
|---|---|---|
| 1 | +$2,000 | $2,000 |
| 2–5 | +$1,100 | $3,100 |

- Consistency: $2,000 / $3,100 = **65%** → blocked.
- Need net ≥ $4,000 so $2,000 / $4,001 < 50%.
- **Vault MC `passAt`:** use **$4,000** (not $3,000) when typical best day ≈ $2,000.

### Rule 6 — No counter positions

- No opposite-direction open positions in same or closely related products (all phases).

### Test subscription

- Monthly billing until pass; auto-cancels on PRO upgrade.
- Resets available for a fee; breaking a rule does **not** auto-cancel subscription.

---

## PRO (funded sim) — rules

Source: [PRO Account Rules](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171769361053-PRO-Account-Rules)

| # | Rule | Design impact |
|---|---|---|
| 1 | **No bots/algos** — manual only | Pine alerts OK; no auto-execution |
| 2 | **Exit before limit up/down** | Liquidation risk on circuit breakers |
| 3 | **≥1 round-trip per calendar week** (Sun–Fri) | Idle accounts may close |
| 4 | **No counter positions** | Same as test |
| 5 | **Intraday trailing DD** | Peak balance includes **unrealized** P&L; trails in real time until locks at start |
| 6 | **News flat ±1 min** | FOMC (Wed 2pm ET), NFP (Fri 8:30am ET), CPI; calendar on dashboard |

### Mechanical shift: test → PRO

```
Test:     EOD trail only  →  forgiving intraday give-back
PRO:      Intraday trail   →  peak unrealized profit raises floor immediately
```

- Same $2,000 distance, **much stricter** enforcement.
- **No consistency rule on PRO** — single large win days are allowed.
- Implication: after eval pass, **higher R multiples and larger size** are viable once intraday DD discipline is proven.

---

## PRO — profit split & withdrawals

Source: [PRO Profit Split & Withdrawal Rules](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15172219527581-PRO-Account-Profit-Split-Withdrawal-Rules)

| Topic | Rule |
|---|---|
| Split | **80/20** (trader keeps 80%) |
| First withdrawal timing | Day one eligible **once buffer cleared** |
| $50K buffer | Balance must reach **$52,000** (= $50,000 + $2,000 max DD) |
| Withdrawable amount | **80% of profit above buffer** (not inside buffer) |
| Inside-buffer withdrawal | Only on **account termination**; split 50% if ≤60 **trading** days on PRO, else 80% |

**Vault MC note:** funded-phase payout modeling uses `payoutBuffer: 2000` (profit above start + DD), not eval `passAt`.

---

## PRO+ upgrade (avoid — recycle strategy)

Source: [PRO+ Upgrade Process](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171978600349-PRO-Account-Upgrade-Process-Overview-and-Guidelines)

| Trigger | Effect |
|---|---|
| **$5,000 cumulative profit** on PRO | Email invitation to PRO+ (trader opts in) |
| On upgrade | PRO frozen with **$5,000 profit locked**; excess withdrawable at 80% |
| PRO+ account | Starts at **$0** balance, EOD DD, **90/10** split, no buffer zone |

### Recycle-before-PRO+ playbook (our intent)

We **do not** want PRO+ complexity. Plan:

1. **Eval:** distributed wins, 5+ days, MC at `passAt: 4000`, `consistencyPct: 50`, `minDays: 5`.
2. **Early PRO:** conservative size until intraday trail behavior is validated (BE at +1R).
3. **Scale phase:** no consistency → allow **higher RR** and **stepped lot size** once +$1,000–$1,500 cushion vs intraday peak.
4. **Exit band:** target **$2,000–$4,500** realized on PRO, withdraw at **$52,000** balance, **before** $5,000 cumulative triggers PRO+ eligibility.
5. **Recycle:** open fresh test (promo/no-fee stack) rather than ride into PRO+; repeat eval → PRO cycle.

**Why recycle beats PRO+ for us**

- PRO+ starts at $0 with EOD DD — different risk profile.
- $5,000 frozen on PRO reduces capital flexibility.
- 80/20 on a recycled PRO account may beat 90/10 on one long PRO+ climb if pass rate stays high.

---

## F4 LAB / MC mapping

| Parameter | Test value | PRO value (funded MC) |
|---|---|---|
| `passAt` | 4000 | N/A (survival + payout) |
| `trailingDD` | 2000 | 2000 |
| `ddMode` | `eod` | `intraday` |
| `consistencyPct` | 50 | 0 |
| `minDays` | 5 | 0 |
| `payoutBuffer` | — | 2000 ($52k balance) |

Engine: `vault-app/lib/monte-carlo.ts` · rules: `vault-app/lib/prop-firms.ts`.

---

## Quick links

- [Rule 1: Profit target](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15169070804125-Rule-1-Hit-Your-Profit-Target)
- [Rule 3: EOD drawdown](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15170265979165-Rule-3-Do-Not-Hit-End-Of-Day-EOD-Maximum-Trailing-Drawdown)
- [Rule 5: Consistency](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15170316538013-Rule-5-Be-Consistent)
- [PRO+ rules](https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15172006753821-PRO-Account-Rules)
- [Trader calendar (news)](https://takeprofittrader.com/user-info/calendar)
