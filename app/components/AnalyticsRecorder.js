"use client";

import { useEffect, useRef } from "react";

// Records one visit per full page load (disclosed on /privacy, and in the
// banner on every page), then automatically asks the browser's native
// geolocation permission prompt — the visitor still has to approve or
// deny that real browser prompt; this just removes the extra click
// before it appears. A denial is recorded as a denial, never bypassed.
export default function AnalyticsRecorder() {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAgent: navigator.userAgent }),
    })
      .then((r) => r.json())
      .then((data) => {
        try {
          sessionStorage.setItem("visitId", data.visitId);
        } catch (e) {
          // sessionStorage can be unavailable (private mode, blocked
          // storage); the visit is still recorded server-side either way.
        }
        requestGps(data.visitId);
      })
      .catch((e) => console.error("Failed to record visit", e));
  }, []);

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
