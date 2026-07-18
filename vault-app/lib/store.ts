"use client";

import { useEffect, useState } from "react";

/** localStorage-backed state, hydration-safe for Next.js. */
export function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setVal(JSON.parse(raw) as T);
    } catch {
      // corrupted entry — fall back to initial
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync writes from other tabs — otherwise a stale tab silently overwrites
  // entries logged elsewhere the next time it saves (journal data loss).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setVal(JSON.parse(e.newValue) as T);
      } catch {
        // ignore malformed cross-tab payload
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, ready]);

  return [val, setVal, ready] as const;
}

export function fmtUsd(n: number, sign = false): string {
  const s = Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const p = n < 0 ? "-$" : sign && n > 0 ? "+$" : "$";
  return p + s;
}

export function todayStr(): string {
  // Local calendar date (UTC would roll the trading day over at 8 PM ET).
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
