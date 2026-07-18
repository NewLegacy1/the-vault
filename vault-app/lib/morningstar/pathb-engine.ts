import { PATHB_DEFAULTS, type PathBDefaults } from "./defaults";
import { aggregateTo5m, detectRbAt, type Bar } from "./rb-pack";

export type Arm = {
  sleeve: "leave" | "powell";
  dir: 1 | -1;
  time: number;
  entry: number;
  stop: number;
  tp: number;
  tag: string;
  ymd: number;
};

export type ReplayResult = {
  arms: Arm[];
  leaveByDay: Record<string, Arm | undefined>;
  powellByDay: Record<string, Arm | undefined>;
};

function nyParts(ms: number): { hhmm: number; ymd: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(new Date(ms));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return {
    hhmm: hour * 100 + minute,
    ymd: year * 10000 + month * 100 + day,
  };
}

function near(a: number, b: number, align: number): boolean {
  return Math.abs(a - b) <= align;
}

function nearBand(hi: number, lo: number, lvl: number, align: number): boolean {
  return lo <= lvl + align && hi >= lvl - align;
}

function plan(
  wickStart: number,
  ce: number,
  extreme: number,
  isShort: boolean,
  cfg: PathBDefaults
): { entry: number; stop: number } | null {
  const stopPx = isShort ? extreme + cfg.stopBufPts : extreme - cfg.stopBufPts;
  const riskWs = Math.abs(stopPx - wickStart);
  const riskCe = Math.abs(stopPx - ce);
  let entryPx: number | null =
    riskWs >= cfg.minStopPts && riskWs <= cfg.maxStopPts
      ? wickStart
      : riskCe >= cfg.minStopPts && riskCe <= cfg.maxStopPts
        ? ce
        : null;
  let stopOut = entryPx == null ? null : stopPx;
  if (entryPx == null && riskCe > cfg.maxStopPts && riskCe > 0) {
    entryPx = ce;
    stopOut = isShort ? ce + cfg.maxStopPts : ce - cfg.maxStopPts;
  }
  if (entryPx == null || stopOut == null) return null;
  return { entry: entryPx, stop: stopOut };
}

/** Fixed R target with hard pt cap (mirrors pine f_fixedTp). */
function fixedTp(entry: number, risk: number, dir: 1 | -1, cfg: PathBDefaults): number {
  const rew = Math.min(cfg.rr * risk, cfg.powellMaxTpPts);
  return dir === 1 ? entry + rew : entry - rew;
}

/**
 * Dual46 Path B replay — mirrors pine Morningstar v46:
 * - LIVE Powell = 1m RB wick · OTE+KO gate · Fixed R capped at powellMaxTpPts
 * - Fib 0.62/0.705 = eyes / freeze only
 */
export function replayPathB(bars1: Bar[], cfg: PathBDefaults = PATHB_DEFAULTS): ReplayResult {
  const bars5 = aggregateTo5m(bars1);
  const arms: Arm[] = [];
  const tick = 0.25;

  let ko1000: number | null = null;
  let lastYmd = -1;

  let pbDir = 0;
  let pbManip = false;
  let pbLeft = false;
  let pbPierceAbove = false;
  let pbPierceBelow = false;
  let pbAway = 0;
  let pbLeaveTime: number | null = null;
  let pbAwayPeakTime: number | null = null;
  let pbHi = NaN;
  let pbLo = NaN;
  let pbFibHi = NaN;
  let pbFibLo = NaN;
  let pbFibHiBody = NaN;
  let pbFibLoBody = NaN;
  let pbIntHi = NaN;
  let pbIntHiBody = NaN;
  let pbIntLo = NaN;
  let pbIntLoBody = NaN;
  let pbOriginArmed = false;
  let pbFibFrozen = false;
  let pbFibInvalid = false;
  let pbPierceLo = NaN;
  let pbPierceHi = NaN;
  let amLo = NaN;
  let amHi = NaN;
  let scanHi = NaN;
  let scanLo = NaN;
  let open930 = NaN;

  let eArmed = false;
  let oArmed = false;

  const wantLeave = cfg.sleeve !== "KO-retest only";
  const wantRetest = cfg.sleeve !== "KO-leave only";

  for (let i = 0; i < bars1.length; i++) {
    const bar = bars1[i]!;
    const { hhmm, ymd } = nyParts(bar.time);
    const newCalDay = lastYmd !== -1 && ymd !== lastYmd;
    if (newCalDay) {
      ko1000 = null;
      pbDir = 0;
      pbManip = false;
      pbLeft = false;
      pbPierceAbove = false;
      pbPierceBelow = false;
      pbAway = 0;
      pbLeaveTime = null;
      pbAwayPeakTime = null;
      pbHi = NaN;
      pbLo = NaN;
      pbFibHi = NaN;
      pbFibLo = NaN;
      pbFibHiBody = NaN;
      pbFibLoBody = NaN;
      pbIntHi = NaN;
      pbIntHiBody = NaN;
      pbIntLo = NaN;
      pbIntLoBody = NaN;
      pbFibFrozen = false;
      pbFibInvalid = false;
      pbOriginArmed = false;
      pbPierceLo = NaN;
      pbPierceHi = NaN;
      amLo = NaN;
      amHi = NaN;
      scanHi = NaN;
      scanLo = NaN;
      open930 = NaN;
      eArmed = false;
      oArmed = false;
    }
    lastYmd = ymd;

    if (hhmm >= 1000 && ko1000 == null) {
      ko1000 = bar.open;
    }

    if (hhmm >= 930 && !pbLeft && hhmm < cfg.flatTime) {
      if (Number.isNaN(amLo) || bar.low < amLo) amLo = bar.low;
      if (Number.isNaN(amHi) || bar.high > amHi) amHi = bar.high;
    }
    if (hhmm >= 930 && Number.isNaN(open930)) {
      open930 = bar.open;
    }
    // Dual43: biggest morning HI/LO from scan start → leave
    if (hhmm >= cfg.fibScanStart && !pbLeft && hhmm < cfg.flatTime) {
      if (Number.isNaN(scanLo) || bar.low < scanLo) scanLo = bar.low;
      if (Number.isNaN(scanHi) || bar.high > scanHi) scanHi = bar.high;
    }

    const closed1 = i >= 1 ? i - 1 : -1;
    let live5 = -1;
    for (let k = 0; k < bars5.length; k++) {
      if (bars5[k]!.time <= bar.time) live5 = k;
      else break;
    }
    const closed5 = live5 >= 1 ? live5 - 1 : -1;

    const rb1 = closed1 >= 0 ? detectRbAt(bars1, closed1, cfg.minWick1, cfg) : null;
    const rb5 = closed5 >= 0 ? detectRbAt(bars5, closed5, cfg.minWick5, cfg) : null;
    const on5Boundary =
      i >= 1 &&
      Math.floor(bar.time / (5 * 60 * 1000)) !== Math.floor(bars1[i - 1]!.time / (5 * 60 * 1000));

    const trig1 = true;
    const trig5 = on5Boundary;

    const canPlace = hhmm < cfg.winEnd;
    const pbOn =
      cfg.pathB && ko1000 != null && hhmm >= 1000 && (hhmm < cfg.winEnd || pbLeft || eArmed || oArmed);

    if (!pbOn) continue;

    if (Number.isNaN(pbHi) || bar.high >= pbHi) pbHi = bar.high;
    if (Number.isNaN(pbLo) || bar.low <= pbLo) pbLo = bar.low;
    if (bar.high > ko1000!) {
      pbPierceAbove = true;
      pbManip = true;
      if (Number.isNaN(pbPierceHi) || bar.high > pbPierceHi) pbPierceHi = bar.high;
    }
    if (bar.low < ko1000!) {
      pbPierceBelow = true;
      pbManip = true;
      if (Number.isNaN(pbPierceLo) || bar.low < pbPierceLo) pbPierceLo = bar.low;
    }

    if (pbManip && !pbLeft && canPlace) {
      const awayDown =
        pbPierceBelow && bar.close < ko1000! && ko1000! - bar.low >= cfg.pathBAwayPts;
      const awayUp =
        pbPierceAbove && bar.close > ko1000! && bar.high - ko1000! >= cfg.pathBAwayPts;
      // Dual44: away-only leave (reclaim is entry, not leave)
      if (awayDown) {
        pbLeft = true;
        pbDir = -1;
        pbLeaveTime = bar.time;
        pbAway = 0;
        pbAwayPeakTime = null;
        pbFibInvalid = false;
        let seedHi = !Number.isNaN(scanHi) ? scanHi : amHi;
        if (cfg.fibUseOpen && !Number.isNaN(open930) && (Number.isNaN(seedHi) || open930 > seedHi)) {
          seedHi = open930;
        }
        if (Number.isNaN(seedHi)) seedHi = bar.high;
        let seedLo = bar.low;
        if (!Number.isNaN(pbPierceLo) && pbPierceLo < seedLo) seedLo = pbPierceLo;
        pbFibHi = seedHi;
        pbFibLo = seedLo;
        pbFibHiBody = Math.max(bar.open, bar.close);
        pbFibLoBody = Math.min(bar.open, bar.close);
        pbIntHi = NaN;
        pbIntHiBody = NaN;
        pbIntLo = NaN;
        pbIntLoBody = NaN;
        pbFibFrozen = false;
        pbOriginArmed = false;
      } else if (awayUp) {
        pbLeft = true;
        pbDir = 1;
        pbLeaveTime = bar.time;
        pbAway = 0;
        pbAwayPeakTime = null;
        pbFibInvalid = false;
        let seedLo = !Number.isNaN(scanLo) ? scanLo : amLo;
        if (cfg.fibUseOpen && !Number.isNaN(open930) && (Number.isNaN(seedLo) || open930 < seedLo)) {
          seedLo = open930;
        }
        if (Number.isNaN(seedLo)) seedLo = bar.low;
        let seedHi = bar.high;
        if (!Number.isNaN(pbPierceHi) && pbPierceHi > seedHi) seedHi = pbPierceHi;
        pbFibLo = seedLo;
        pbFibHi = seedHi;
        pbFibHiBody = Math.max(bar.open, bar.close);
        pbFibLoBody = Math.min(bar.open, bar.close);
        pbIntHi = NaN;
        pbIntHiBody = NaN;
        pbIntLo = NaN;
        pbIntLoBody = NaN;
        pbFibFrozen = false;
        pbOriginArmed = false;
      }
    }

    if (pbLeft) {
      const minsOk =
        pbLeaveTime != null && bar.time - pbLeaveTime >= cfg.fibFreezeMinMin * 60 * 1000;
      const legH =
        !Number.isNaN(pbFibHi) && !Number.isNaN(pbFibLo) ? pbFibHi - pbFibLo : 0;
      const legOk = legH >= cfg.fibMinLegPts;
      const awayForFreeze = pbAway >= cfg.pathBAwayPts;
      const freezeAllowed = minsOk && legOk && awayForFreeze && !pbFibInvalid;

      if (pbDir === 1) {
        if (!Number.isNaN(pbFibLo) && bar.low < pbFibLo - tick) pbFibInvalid = true;
        if (!pbFibFrozen && !pbFibInvalid && bar.high >= pbFibHi) {
          pbFibHi = bar.high;
          pbFibHiBody = Math.max(bar.open, bar.close);
        }
        if (
          !pbFibFrozen &&
          freezeAllowed &&
          !Number.isNaN(pbFibHi) &&
          pbFibHi - bar.low >= cfg.fibFreezePull
        ) {
          pbFibFrozen = true;
        }
      }
      if (pbDir === -1) {
        if (!Number.isNaN(pbFibHi) && bar.high > pbFibHi + tick) pbFibInvalid = true;
        if (!pbFibFrozen && !pbFibInvalid && bar.low <= pbFibLo) {
          pbFibLo = bar.low;
          pbFibLoBody = Math.min(bar.open, bar.close);
        }
        if (
          !pbFibFrozen &&
          freezeAllowed &&
          !Number.isNaN(pbFibLo) &&
          bar.high - pbFibLo >= cfg.fibFreezePull
        ) {
          pbFibFrozen = true;
        }
      }

      if (pbFibFrozen && !pbFibInvalid && !oArmed) {
        if (pbDir === 1 && Number.isFinite(pbFibHi)) {
          if (!pbOriginArmed && pbFibHi - bar.low >= cfg.originMinPull) pbOriginArmed = true;
          if (pbOriginArmed && bar.high < pbFibHi) {
            if (Number.isNaN(pbIntHi) || bar.high > pbIntHi) {
              pbIntHi = bar.high;
              pbIntHiBody = Math.max(bar.open, bar.close);
            }
          }
        }
        if (pbDir === -1 && Number.isFinite(pbFibLo)) {
          if (!pbOriginArmed && bar.high - pbFibLo >= cfg.originMinPull) pbOriginArmed = true;
          if (pbOriginArmed && bar.low > pbFibLo) {
            if (Number.isNaN(pbIntLo) || bar.low < pbIntLo) {
              pbIntLo = bar.low;
              pbIntLoBody = Math.min(bar.open, bar.close);
            }
          }
        }
      }
      const awayNow = pbDir === 1 ? bar.high - ko1000! : pbDir === -1 ? ko1000! - bar.low : 0;
      if (awayNow > pbAway) {
        pbAway = awayNow;
        pbAwayPeakTime = bar.time;
      }
    }

    const hasAway = pbAway >= cfg.pathBAwayPts;
    const inLeaveWin = pbLeaveTime != null && bar.time - pbLeaveTime <= cfg.leaveWinMin * 60 * 1000;
    const longEnoughAfterLeave =
      pbLeaveTime != null && bar.time - pbLeaveTime >= cfg.retestMinAfterLeave * 60 * 1000;
    const powellWindow = pbLeft && hasAway && longEnoughAfterLeave && !pbFibInvalid;

    const rangeF = !Number.isNaN(pbFibHi) && !Number.isNaN(pbFibLo) ? pbFibHi - pbFibLo : NaN;
    let oteLoPx = NaN;
    let oteHiPx = NaN;
    if (pbFibFrozen && !pbFibInvalid && Number.isFinite(rangeF) && rangeF > 0) {
      if (pbDir === 1) {
        oteLoPx = pbFibHi - rangeF * 0.79;
        oteHiPx = pbFibHi - rangeF * 0.62;
      } else if (pbDir === -1) {
        oteLoPx = pbFibLo + rangeF * 0.62;
        oteHiPx = pbFibLo + rangeF * 0.79;
      }
    }

    const nearKo5U =
      rb5 != null &&
      (near(rb5.low, ko1000!, cfg.pathBAlign) ||
        near(rb5.wsBull, ko1000!, cfg.pathBAlign) ||
        nearBand(rb5.wsBull, rb5.low, ko1000!, cfg.pathBAlign));
    const nearKo5B =
      rb5 != null &&
      (near(rb5.high, ko1000!, cfg.pathBAlign) ||
        near(rb5.wsBear, ko1000!, cfg.pathBAlign) ||
        nearBand(rb5.high, rb5.wsBear, ko1000!, cfg.pathBAlign));
    const nearKo1U =
      rb1 != null &&
      (near(rb1.low, ko1000!, cfg.pathBAlign) ||
        near(rb1.wsBull, ko1000!, cfg.pathBAlign) ||
        nearBand(rb1.wsBull, rb1.low, ko1000!, cfg.pathBAlign));
    const nearKo1B =
      rb1 != null &&
      (near(rb1.high, ko1000!, cfg.pathBAlign) ||
        near(rb1.wsBear, ko1000!, cfg.pathBAlign) ||
        nearBand(rb1.high, rb1.wsBear, ko1000!, cfg.pathBAlign));

    let leaveDir = 0;
    let leaveWs = NaN;
    let leaveCe = NaN;
    let leaveEx = NaN;
    let leaveTf = "5RB";

    if (pbLeft) {
      if (pbDir === 1) {
        if (cfg.leavePrefer5 && trig5 && rb5?.bull && nearKo5U) {
          leaveDir = 1;
          leaveWs = rb5.wsBull;
          leaveEx = rb5.low;
          leaveCe = (rb5.low + rb5.wsBull) * 0.5;
          leaveTf = "5RB";
        } else if (trig1 && rb1?.bull && nearKo1U) {
          leaveDir = 1;
          leaveWs = rb1.wsBull;
          leaveEx = rb1.low;
          leaveCe = (rb1.low + rb1.wsBull) * 0.5;
          leaveTf = "1RB";
        }
      }
      if (pbDir === -1) {
        if (cfg.leavePrefer5 && trig5 && rb5?.bear && nearKo5B) {
          leaveDir = -1;
          leaveWs = rb5.wsBear;
          leaveEx = rb5.high;
          leaveCe = (rb5.high + rb5.wsBear) * 0.5;
          leaveTf = "5RB";
        } else if (trig1 && rb1?.bear && nearKo1B) {
          leaveDir = -1;
          leaveWs = rb1.wsBear;
          leaveEx = rb1.high;
          leaveCe = (rb1.high + rb1.wsBear) * 0.5;
          leaveTf = "1RB";
        }
      }
    }

    const singleSlotLock = cfg.oneTradeDay && cfg.sleeve !== "KO-leave + KO-retest" && (eArmed || oArmed);
    const leaveTick = leaveTf === "5RB" ? trig5 : trig1;

    if (
      wantLeave &&
      !eArmed &&
      canPlace &&
      !singleSlotLock &&
      leaveDir !== 0 &&
      leaveTick &&
      inLeaveWin
    ) {
      let useWs = leaveWs;
      let useCe = leaveCe;
      let useEx = leaveEx;
      let useDir = leaveDir;
      let useTf = leaveTf;
      let p = plan(useWs, useCe, useEx, useDir === -1, cfg);
      let risk = p ? Math.abs(p.stop - p.entry) : NaN;
      if ((!p || risk < cfg.leaveMinRisk) && trig1 && pbDir === 1 && rb1?.bull && nearKo1U) {
        useWs = rb1.wsBull;
        useCe = (rb1.low + rb1.wsBull) * 0.5;
        useEx = rb1.low;
        useDir = 1;
        useTf = "1RB";
        p = plan(useWs, useCe, useEx, false, cfg);
        risk = p ? Math.abs(p.stop - p.entry) : NaN;
      }
      if ((!p || risk < cfg.leaveMinRisk) && trig1 && pbDir === -1 && rb1?.bear && nearKo1B) {
        useWs = rb1.wsBear;
        useCe = (rb1.high + rb1.wsBear) * 0.5;
        useEx = rb1.high;
        useDir = -1;
        useTf = "1RB";
        p = plan(useWs, useCe, useEx, true, cfg);
        risk = p ? Math.abs(p.stop - p.entry) : NaN;
      }
      if (p && risk >= cfg.leaveMinRisk) {
        eArmed = true;
        arms.push({
          sleeve: "leave",
          dir: useDir as 1 | -1,
          time: bar.time,
          entry: p.entry,
          stop: p.stop,
          tp: fixedTp(p.entry, risk, useDir as 1 | -1, cfg),
          tag: `leave · ${useTf}`,
          ymd,
        });
      }
    }

    if (wantRetest && !oArmed && canPlace && !singleSlotLock && powellWindow && trig1 && rb1) {
      let pDir = 0;
      let pWs = NaN;
      let pEx = NaN;
      if (pbDir === 1 && rb1.bull) {
        pDir = 1;
        pWs = rb1.wsBull;
        pEx = rb1.low;
      }
      if (pbDir === -1 && rb1.bear) {
        pDir = -1;
        pWs = rb1.wsBear;
        pEx = rb1.high;
      }
      if (pDir !== 0) {
        const zHi = Math.max(pWs, pEx);
        const zLo = Math.min(pWs, pEx);
        const zoneInOte = Number.isFinite(oteLoPx) && zLo <= oteHiPx && zHi >= oteLoPx;
        const koInZone =
          ko1000 != null && zLo - cfg.powellKoTol <= ko1000 && ko1000 <= zHi + cfg.powellKoTol;
        const koDeeperThanOte =
          ko1000 != null &&
          Number.isFinite(oteLoPx) &&
          (pbDir === 1
            ? ko1000 < oteLoPx - cfg.powellKoTol
            : ko1000 > oteHiPx + cfg.powellKoTol);
        const deferOte = cfg.powellWaitDeepKo && koDeeperThanOte && !koInZone;
        const oteOk = (!cfg.powellRequireOte || zoneInOte) && !deferOte;
        const stackOk = cfg.powellRequireKoStack ? zoneInOte && koInZone : oteOk;
        const armDeep = cfg.powellAllowDeepKo && koInZone && koDeeperThanOte;
        const armOk = stackOk || armDeep;
        if (armOk) {
          const pCe = (pWs + pEx) * 0.5;
          const p = plan(pWs, pCe, pEx, pDir === -1, cfg);
          const risk = p ? Math.abs(p.stop - p.entry) : NaN;
          if (p && risk >= cfg.retestMinRisk) {
            oArmed = true;
            const grade =
              zoneInOte && koInZone ? "OTE+KO" : koInZone ? "KO" : zoneInOte ? "OTE" : "—";
            const legEx = pDir === 1 ? pbFibHi : pbFibLo;
            const legBody = pDir === 1 ? pbFibHiBody : pbFibLoBody;
            const intEx = pDir === 1 ? pbIntHi : pbIntLo;
            const intBody = pDir === 1 ? pbIntHiBody : pbIntLoBody;
            let tp = fixedTp(p.entry, risk, pDir as 1 | -1, cfg);
            let tpTag = "R";
            let structTp = NaN;
            let tag = "R";
            if (
              (cfg.powellTp === "Origin CE" || cfg.powellTp === "Internal CE") &&
              Number.isFinite(intEx)
            ) {
              structTp = Number.isFinite(intBody) ? (intEx + intBody) * 0.5 : intEx;
              tag = "oCE";
            } else if (
              (cfg.powellTp === "Origin high" || cfg.powellTp === "Internal high") &&
              Number.isFinite(intEx)
            ) {
              structTp = intEx;
              tag = "oHI";
            } else if (cfg.powellTp === "Leg CE" && Number.isFinite(legEx)) {
              structTp = Number.isFinite(legBody) ? (legEx + legBody) * 0.5 : legEx;
              tag = "CE";
            } else if (cfg.powellTp === "Leg high" && Number.isFinite(legEx)) {
              structTp = legEx;
              tag = "HI";
            }
            if (cfg.powellTp !== "Fixed R" && Number.isFinite(structTp)) {
              const rew = pDir === 1 ? structTp - p.entry : p.entry - structTp;
              const sideOk = pDir === 1 ? structTp > p.entry : structTp < p.entry;
              const minOk = rew >= risk * cfg.powellMinTpR;
              const maxOk = rew <= risk * cfg.powellMaxTpR && rew <= cfg.powellMaxTpPts;
              if (sideOk && minOk && maxOk) {
                tp = structTp;
                tpTag = tag;
              }
            }
            arms.push({
              sleeve: "powell",
              dir: pDir as 1 | -1,
              time: bar.time,
              entry: p.entry,
              stop: p.stop,
              tp,
              tag: `Powell · 1RB · ${grade} · ${tpTag}`,
              ymd,
            });
          }
        }
      }
    }
  }

  const leaveByDay: Record<string, Arm | undefined> = {};
  const powellByDay: Record<string, Arm | undefined> = {};
  for (const a of arms) {
    const key = String(a.ymd);
    if (a.sleeve === "leave" && !leaveByDay[key]) leaveByDay[key] = a;
    if (a.sleeve === "powell" && !powellByDay[key]) powellByDay[key] = a;
  }
  return { arms, leaveByDay, powellByDay };
}
