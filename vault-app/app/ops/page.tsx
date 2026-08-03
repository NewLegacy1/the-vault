"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** OPS moved to the home screen — this route stays as a redirect. */
export default function OpsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <p className="small dim">OPS is the home screen now — redirecting…</p>;
}
