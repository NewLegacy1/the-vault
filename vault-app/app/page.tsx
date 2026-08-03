"use client";

import OpsCockpit from "@/components/ops-cockpit";

/**
 * Home = Ops cockpit. The former TODAY pulse (account, net cash, logged today)
 * is merged into the cockpit — one landing screen for a live trading day.
 */
export default function HomePage() {
  return <OpsCockpit />;
}
