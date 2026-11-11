"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_FLAG = "signalnoise_visit_recorded";

// Records one visit per browser tab (disclosed on /privacy, and in the
// banner on every page), then automatically asks the browser's native
// geolocation permission prompt — the visitor still has to approve or
// deny that real browser prompt; this just removes the extra click
// before it appears. A denial is recorded as a denial, never bypassed.
//
// Guards:
// 1. Skipped entirely on /admin routes — the site owner isn't a visitor.
// 2. Guarded by sessionStorage (not just a ref), so React 18 Strict
//    Mode's dev-only mount→unmount→remount cycle, and client-side
//    navigation between pages in the same tab, don't each create a new
//    database row.
export default function AnalyticsRecorder() {
  const pathname = usePathname();
  const requested = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (requested.current) return;
    requested.current = true;

    let alreadyRecorded = false;
    try {
      alreadyRecorded = sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch (e) {
      // sessionStorage unavailable — fall back to recording once per
      // mount only (ref guard above still prevents same-mount dupes).
    }
    if (alreadyRecorded) return;

    try {
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch (e) {
      // ignore — worst case this tab records more than once
    }

    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAgent: navigator.userAgent }),
    })
      .then((r) => r.json())
      .then((data) => {
        try {
          sessionStorage.setItem("visitId", data.visitId);
          if (data.location) {
            sessionStorage.setItem("ipLocation", JSON.stringify(data.location));
          }
        } catch (e) {
          // sessionStorage can be unavailable (private mode, blocked
          // storage); the visit is still recorded server-side either way.
        }
        requestGps(data.visitId);
      })
      .catch((e) => console.error("Failed to record visit", e));
  }, [pathname]);

  function requestGps(visitId) {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!visitId) return;
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitId,
            consent: "granted",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        }).catch((e) => console.error(e));
      },
      () => {
        if (!visitId) return;
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitId, consent: "denied" }),
        }).catch((e) => console.error(e));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return null;
}
