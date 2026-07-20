/**
 * Stage-0 / Lab execution haircut presets (CLAIM → VERIFY).
 * Doctrine: strategies/knowledge/quant/fill-haircut-defaults-stage0-lab.md
 * Not Deep BT results. Not E[$/wk]. Cost assumptions for netting paper ledgers.
 */

export type HaircutPresetId =
  | "open-elev-1tick"
  | "open-elev-2tick"
  | "quiet-0tick"
  | "quiet-1tick"
  | "release-4tick"
  | "house-tca";

export type HaircutVerify = "pending" | "measured";

export interface HaircutPreset {
  id: HaircutPresetId;
  label: string;
  windowEt: string;
  ticksExpected: number;
  ticksConservative: number;
  usdPerTick: number;
  verify: HaircutVerify;
  note: string;
}

export const MNQ_USD_PER_TICK = 0.5;

export const HAIRCUT_PRESETS: Record<HaircutPresetId, HaircutPreset> = {
  "open-elev-1tick": {
    id: "open-elev-1tick",
    label: "Open elevated · expected",
    windowEt: "09:30–10:30",
    ticksExpected: 1,
    ticksConservative: 1,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "pending",
    note: "Default expected conversion cost in Dual46 / open hour",
  },
  "open-elev-2tick": {
    id: "open-elev-2tick",
    label: "Open elevated · conservative",
    windowEt: "09:30–10:30",
    ticksExpected: 2,
    ticksConservative: 2,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "pending",
    note: "Stage-0 default before house TCA",
  },
  "quiet-0tick": {
    id: "quiet-0tick",
    label: "Quieter RTH · expected",
    windowEt: "10:30–15:00 ex-release",
    ticksExpected: 0,
    ticksConservative: 0,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "pending",
    note: "Aggressive limit / trade-through mid-day",
  },
  "quiet-1tick": {
    id: "quiet-1tick",
    label: "Quieter RTH · conservative",
    windowEt: "10:30–15:00 ex-release",
    ticksExpected: 1,
    ticksConservative: 1,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "pending",
    note: "Conservative midday conversion",
  },
  "release-4tick": {
    id: "release-4tick",
    label: "Release-adjacent",
    windowEt: "print ±120s",
    ticksExpected: 4,
    ticksConservative: 4,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "pending",
    note: "Prefer stand-down; do not blend into open-elev",
  },
  "house-tca": {
    id: "house-tca",
    label: "House TCA (measured)",
    windowEt: "measured",
    ticksExpected: 0,
    ticksConservative: 0,
    usdPerTick: MNQ_USD_PER_TICK,
    verify: "measured",
    note: "Replace after ≥30 shortfall events — set ticks from house median",
  },
};

/** Stage-0 default until house TCA exists. */
export const STAGE0_DEFAULT_HAIRCUT: HaircutPresetId = "open-elev-2tick";

export function haircutUsdPerContract(
  presetId: HaircutPresetId,
  conservative = true
): number {
  const p = HAIRCUT_PRESETS[presetId];
  const ticks = conservative ? p.ticksConservative : p.ticksExpected;
  return ticks * p.usdPerTick;
}

export function applyHaircutToPnls(
  pnls: number[],
  opts: {
    presetId?: HaircutPresetId;
    contracts?: number;
    conservative?: boolean;
    /** If ledger is already net of slip, pass true → no subtract. */
    alreadyNet?: boolean;
  } = {}
): number[] {
  if (opts.alreadyNet) return [...pnls];
  const id = opts.presetId ?? STAGE0_DEFAULT_HAIRCUT;
  const contracts = opts.contracts ?? 10;
  const perTrade = haircutUsdPerContract(id, opts.conservative ?? true) * contracts;
  return pnls.map((p) => p - perTrade);
}
