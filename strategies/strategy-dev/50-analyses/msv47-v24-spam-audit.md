# MSv47 v24 Deep BT — spam audit (2026-07-23)

**CSV:** `MSv47_v24_CME_MINI_MNQ1!_2026-07-23_f7ab5.csv`  
**Headline:** 96 trades · 43 wins · **+$5,954.60** — **not edge; Jul 20 machine-gun.**

## Verdict

**Away / invalid for income claims.** The equity curve’s late “carpet” of tiny bars is 77× `Powell · Judas · 1RB · KO` on **2026-07-20** (10:43–11:22). Rest of July is a normal ~1–2/day book.

| Slice | Trades | PnL |
|-------|--------|-----|
| Full July (v24) | 96 | +$5,955 |
| Jul 20 only | 78 | +$3,173 |
| July **excluding** Jul 20 | 18 | +$2,782 |

Without Jul 20 spam, cadence looks like the healthier v15 window (~20 trades), not a 93-trade/month system.

## Tag breakdown

| Entry signal | N | Wins | PnL |
|--------------|---|------|-----|
| Powell · Judas · 1RB · **KO** | 77 | 38 | +$1,610 |
| leave · 1RB | 13 | 2 | +$414 |
| Powell · Cont · OTE | 4 | 1 | +$1,200 |
| Powell · Judas · OTE | 1 | 1 | +$1,443 |
| Powell · Cont · OTE+KO | 1 | 1 | +$1,288 |

## Failure mode

1. **Judas · KO live-arm** re-fired after every stop while flat.  
2. **Daily fill counter** did not stop re-arms (failed under that loop).  
3. **Model = Both** left Judas on for Stage-0 Tester.

## v25 response (in `Morningstar_v47_strategy.pine`)

- `powellSpentToday` / `leaveSpentToday` — set on first place, clear only on `newCalDay`
- Freeze `oKpi` / `eKpi` to `"LOSS"` on place so `canUpgrade` dies
- Live arm **requires `zoneInOte`** (KO-only → eyes)
- `i_powellModel = "Continuation"` only
- `process_orders_on_close = true`, default **Limit @ wick**

## v26 result (failed)

CSV `MSv47_v26_…_b27f2.csv`: **19 trades · 4 wins · +$1,284**.

- Leave sleeve: **−$911** (v15 was **+$369**)
- Jul 23 Cont: **10:24 @ 28704**, same-bar stop, **MFE $0** — wrong RB again (live 28699)
- B-close reindex did not match live wick fill; it made the book worse

**Baseline:** v15 **+$4,072 / 20 trades**. Stop chasing Jul 23 Cont fill via index offsets.

**v27** in pine = Dual46 `A=bar[2],B=bar[1]` restored + spent locks. Optional one more export; otherwise stay on v15 as Stage-0 reference.


