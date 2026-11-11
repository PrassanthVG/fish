"use client";

import { useEffect, useState } from "react";

export default function PrivacyPage() {
  const [visitId, setVisitId] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | asking | granted | denied | error
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    try {
      setVisitId(sessionStorage.getItem("visitId"));
    } catch (e) {
      // sessionStorage unavailable — GPS opt-in button still works below,
      // it just won't be able to attach to this visit's record.
    }
  }, []);

  function shareGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("error");
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }
    setGpsStatus("asking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setGpsCoords(coords);
        setGpsStatus("granted");
        if (visitId) {
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitId, consent: "granted", ...coords }),
          }).catch((e) => console.error(e));
        }
      },
      async (err) => {
        setGpsStatus("denied");
        setGpsError(err.message || "Permission denied or unavailable.");
        if (visitId) {
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitId, consent: "denied" }),
          }).catch((e) => console.error(e));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 30 }}>Privacy &amp; analytics disclosure</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Signal/Noise is a demo blog built to show exactly what a website can
        and can't learn about a visitor. This page tells you precisely what
        gets recorded, when, and why — nothing here is hidden.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>What's recorded automatically</h2>
      <ul style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
        <li>Your public IP address</li>
        <li>An approximate country/region/city/ISP derived from that IP (city-level at best, never precise)</li>
        <li>Your browser, operating system and device type, parsed from your user-agent string</li>
        <li>The page referrer and the time of your visit</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Precise GPS location</h2>
      <p style={{ color: "var(--text-muted)" }}>
        When any page on this site loads, your browser will show its own
        native permission prompt asking whether to share your precise GPS
        location (latitude, longitude, accuracy). We request it automatically
        so you can see the real prompt without an extra click — but the
        prompt itself is entirely your browser's, and nothing is stored
        unless you approve it there. If you deny it, we record that you
        denied it, not any location data. You can also trigger the same
        prompt manually below.
      </p>

      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 24,
          marginTop: 24,
        }}
      >
        <button className="btn" onClick={shareGps} disabled={gpsStatus === "asking"}>
          {gpsStatus === "asking" ? "Waiting for permission…" : "Share my precise GPS location"}
        </button>

        {gpsStatus === "granted" && gpsCoords && (
          <div style={{ marginTop: 16 }}>
            <p>✅ Permission granted. Recorded:</p>
            <pre style={{ fontSize: 13 }}>{JSON.stringify(gpsCoords, null, 2)}</pre>
          </div>
        )}
        {gpsStatus === "denied" && (
          <p style={{ color: "#f28b82", marginTop: 16 }}>❌ Permission denied: {gpsError}</p>
        )}
        {gpsStatus === "error" && <p style={{ color: "#f28b82", marginTop: 16 }}>⚠️ {gpsError}</p>}
      </div>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>What we never collect</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Passwords, cookies or tokens from other sites, clipboard contents,
        files on your device, or anything from outside this one page's own
        browser permissions.
      </p>
    </div>
  );
}
