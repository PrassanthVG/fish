"use client";

import { useEffect, useState } from "react";

export default function ConsentBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden until we check storage

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem("analytics-banner-dismissed") === "1");
    } catch (e) {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("analytics-banner-dismissed", "1");
    } catch (e) {
      // ignore — purely a per-viewer convenience
    }
  }

  if (dismissed) return null;

  return (
    <div className="consent-banner" role="dialog" aria-label="Analytics disclosure">
      <span>
        This site records approximate (IP-based) visit analytics automatically, and will also ask
        your browser's native permission prompt for precise GPS location — nothing is stored
        unless you approve that prompt.{" "}
        <a href="/privacy">See exactly what's recorded →</a>
      </span>
      <button className="btn btn-ghost" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
