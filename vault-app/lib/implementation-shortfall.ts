import type { McResult } from "./monte-carlo";
import type { BootstrapEvCi } from "./risk-geometry";

/**
 * Prop form of implementation shortfall:
 * paper gross (ledger EV × cadence) vs net path economics after fees/barriers.
 */
export type ImplementationShortfall = {
  /** Mean trade PnL from ledger (no fees). */
  grossTradeEv: number;
  /** Gross EV × trades/week — fee-unaware paper weekly edge. */
  grossUsdPerWeek: number;
  tradesPerWeek: number;
  /** MC expected net $/account after fees. */
  netExpectedPerAccountUsd: number;
  /** Fee-aware E[$/wk] from payout cycle when available. */
  netUsdPerWeek: number | null;
  /** grossUsdPerWeek − netUsdPerWeek (null if net week unknown). */
  shortfallUsdPerWeek: number | null;
  /** Fraction of gross weekly edge lost to barriers/fees (0–1+). */
  leakagePct: number | null;
  note: string;
};

export function computeImplementationShortfall(opts: {
  tradeEv: number;
  tradesPerWeek: number;
  mc: McResult;
  /** Prefer derivePayoutCycle().expectedUsdPerCalendarWeek when passed. */
  netUsdPerWeek?: number | null;
}): ImplementationShortfall {
  const grossTradeEv = Math.round(opts.tradeEv * 100) / 100;
  const tpw = opts.tradesPerWeek;
  const grossUsdPerWeek = Math.round(grossTradeEv * tpw * 10) / 10;
  const netExpectedPerAccountUsd = opts.mc.economics.expectedNetPerAccountUsd;
  const netUsdPerWeek =
    opts.netUsdPerWeek !== undefined
      ? opts.netUsdPerWeek
      : (() => {
          const w =
            opts.mc.economics.weeksToPayoutP50 ?? opts.mc.economics.weeksToPassP50;
          if (w == null || w <= 0) return null;
          return Math.round(netExpectedPerAccountUsd / w);
        })();

  const shortfallUsdPerWeek =
    netUsdPerWeek == null ? null : Math.round((grossUsdPerWeek - netUsdPerWeek) * 10) / 10;

  let leakagePct: number | null = null;
  if (shortfallUsdPerWeek != null && Math.abs(grossUsdPerWeek) > 1) {
    leakagePct = Math.round((shortfallUsdPerWeek / Math.abs(grossUsdPerWeek)) * 1000) / 10;
  }

  return {
    grossTradeEv,
    grossUsdPerWeek,
    tradesPerWeek: tpw,
    netExpectedPerAccountUsd,
    netUsdPerWeek,
    shortfallUsdPerWeek,
    leakagePct,
    note: "Gross = ledger EV×cadence. Net = path MC after fees. Gap = prop implementation shortfall (barriers + fees + timeout opp. cost).",
  };
}

export function shortfallFromEvCi(
  evCi: BootstrapEvCi,
  tradesPerWeek: number,
  mc: McResult,
  netUsdPerWeek?: number | null
): ImplementationShortfall {
  return computeImplementationShortfall({
    tradeEv: evCi.mean,
    tradesPerWeek,
    mc,
    netUsdPerWeek,
  });
}
