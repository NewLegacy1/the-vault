# MC calibration plan (engine v2)

Monte Carlo in The Vault now uses an explicit **rule pack** per firm/phase instead of a single intraday trailing-DD approximation for every account.

## Goals

1. Model eval vs funded rule differences (EOD vs intraday trail, DLL, winning days, consistency modes).
2. Keep economics fields (`McEconomics`, payout-cycle) stable for downstream compare UI.
3. Version saved cohorts so stale runs show **Re-RUN in Lab** when `mc_engine_version < MC_ENGINE_VERSION`.

## Architecture

| Module | Role |
|--------|------|
| `lib/monte-carlo.ts` | Kernel; optional `params.rulePack`; returns `engineVersion`, `rulePackFeatures` |
| `lib/mc-rule-pack.ts` | EOD trail, DLL clamp, winning days, consistency gates |
| `lib/mc-params-builder.ts` | `buildMcParamsForFirm`, `buildMcParamsForLab` from `prop-firms` phases |
| `lib/mc-calibration.ts` | `describeMcCalibration()` for modeled / approximated / not modeled |
| `lib/mc-engine-version.ts` | `MC_ENGINE_VERSION` (currently **2**) |
| `components/mc-calibration-banner.tsx` | Disclosure in Lab, Results, Firm compare |

## Rule pack features (v2)

- **EOD trailing** — floor ratchets on end-of-day equity; locks at starting balance (TPT eval, Topstep, Apex eval).
- **Intraday trailing** — legacy peak−equity bust (TPT funded, legacy path without pack).
- **DLL clamp** — single-day loss capped (Topstep $1k, Apex soft cap).
- **Winning days** — min count of days with PnL ≥ threshold before pass/payout gate.
- **Consistency** — `best_day_pct_of_total` or `best_day_pct_of_target` (Topstep).

## What is still approximated / not modeled

- News restrictions, inactivity rules, activation/subscription fees (except payout economics module).
- Multi-account stacking, combine sizing, XFA-specific live transition rules.
- Exact Apex trailing unlock mechanics beyond EOD floor ratchet.

Bump `MC_ENGINE_VERSION` when bust/pass/payout **logic** changes (not copy-only prop-firms edits).

## Cohort metadata

Saved cohort YAML frontmatter:

```yaml
mc_engine_version: 2
mc_rule_pack: { trailingMode: eod, ... }
```

## Tests

```bash
cd vault-app && npm test
```

`lib/mc-golden.test.ts` — seeded RNG + rule-pack unit cases. Pass rates are not snapshotted to fixed decimals (bootstrap variance); structural features and bust/trail math are asserted.

## UI surfaces

- **Lab** — full banner before stat strip; cohort save includes version + pack.
- **F8 Results** — compact banner per firm tab; stale cohort warning when selected preset cohort is older engine.
- **Firm compare** — compact banner for selected firm chip.

## Parallel work boundary

Do not change `payout-cycle.ts` fee formulas or withdrawal simulation without coordinating. Rule pack affects **pass/bust gates** only; economics module remains separate.

## Expected behavior change

Re-RUN cohorts after deploy: Topstep/Apex/TPT **eval** pass rates may shift vs v1 because EOD trail + DLL + winning days replace pure intraday DD.
