/** Defaults mirrored from pine/Morningstar_v46.pine Path B inputs. */
export const PATHB_DEFAULTS = {
  winEnd: 1300,
  flatTime: 1555,
  oneTradeDay: false,
  pathB: true,
  /** Pine default is Powell-only; the parity gate overrides to both sleeves. */
  sleeve: "KO-retest only" as "KO-leave + KO-retest" | "KO-leave only" | "KO-retest only",
  pathBAlign: 50,
  powellKoTol: 3,
  powellWaitDeepKo: true,
  leaveWinMin: 45,
  pathBAwayPts: 25,
  retestMinRisk: 10,
  leaveMinRisk: 6,
  leavePrefer5: true,
  powellRequireOte: true,
  powellRequireKoStack: true,
  powellShowEyes: true,
  powellAllowDeepKo: false,
  /** Dual46: live = RB wick; fib option is study/eyes only in Pine. */
  powellGeom: "1m RB wick" as "0.62 / 0.705" | "1m RB wick" | "0.62 / 0.705 (eyes study)",
  /** Dual44: Continuation / Judas / Both */
  powellModel: "Both" as "Continuation" | "Judas reverse" | "Both",
  powellNeedRb: true,
  koStack: false,
  fibFreezePull: 25,
  fibFreezeMinMin: 15,
  fibMinLegPts: 80,
  fibScanStart: 830,
  fibLegLookback: 120,
  fibUseOpen: true,
  fibManipMaxDist: 220,
  retestMinAfterLeave: 15,
  minWick1: 4,
  minWick5: 6,
  rbSweepWick: true,
  dilBounce: 15,
  dilPivot: 2,
  maxStopPts: 40,
  minStopPts: 3,
  stopBufPts: 2,
  /** Dual46: Fixed 1:5 with tight RB stops; hard-capped by powellMaxTpPts. */
  rr: 5,
  powellTp: "Fixed R" as
    | "Fixed R"
    | "Origin CE"
    | "Origin high"
    | "Leg CE"
    | "Leg high"
    | "Internal CE"
    | "Internal high",
  powellMinTpR: 1.0,
  powellMaxTpR: 2.5,
  /** Hard cap on Fixed R / structure TP distance (pts). */
  powellMaxTpPts: 100,
  originMinPull: 40,
  intPivot: 3,
};

export type PathBDefaults = typeof PATHB_DEFAULTS;
