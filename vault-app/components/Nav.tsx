"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Tab nav. Chrome/Edge reserve many bare F-keys (F1 help, F5 reload, F11/F12, …)
 * — a webpage cannot take priority over those. Primary chords are Alt+1…9 / Alt+0.
 * Bare F-keys are still attempted where the browser allows.
 */
const TABS = [
  { href: "/", digit: "1", fkey: "F1", label: "TODAY" },
  { href: "/accounts", digit: "2", fkey: "F2", label: "ACCOUNTS" },
  { href: "/strategies", digit: "3", fkey: "F3", label: "STRATEGY" },
  { href: "/lab", digit: "4", fkey: "F4", label: "LAB" },
  { href: "/journal", digit: "5", fkey: "F5", label: "JOURNAL" },
  { href: "/data", digit: "6", fkey: "F6", label: "DATA" },
  { href: "/news", digit: "7", fkey: "F7", label: "NEWS" },
  { href: "/results", digit: "8", fkey: "F8", label: "RESULTS" },
  { href: "/brain", digit: "9", fkey: "F9", label: "BRAIN" },
] as const;

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " NY"
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;

      // Primary: Alt+digit (works in Chrome; F-keys often do not)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const hit = TABS.find((t) => t.digit === e.key);
        if (hit) {
          e.preventDefault();
          router.push(hit.href);
          return;
        }
      }

      // Best-effort F-keys — browser may still steal F1/F5/F11/F12
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const hit = TABS.find((t) => t.fkey === e.key);
        if (hit) {
          e.preventDefault();
          router.push(hit.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <div className="term-header">
        <div className="term-logo">
          THE VAULT <span>/ FUTURES PROP TERMINAL</span>
        </div>
        <div className="term-clock">{clock}</div>
      </div>
      <nav className="term-nav" title="Navigate with Alt+1…9 (Chrome steals many bare F-keys)">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={path === t.href ? "active" : ""}>
            <span className="fkey">
              ⌥{t.digit}
              <span className="fkey-f">{t.fkey}</span>
            </span>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="ticker">
        <b>PRB v1</b> LOCKED · Dual46 May walk · path MC first ·{" "}
        <b>NAV</b> Alt+1…9 (F-keys unreliable in Chrome)
      </div>
    </>
  );
}
