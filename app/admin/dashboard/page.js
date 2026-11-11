"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/visits?limit=50");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Failed to load data");
      return;
    }
    setData(await res.json());
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (error) return <p style={{ padding: 24, color: "#f28b82" }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>Loading…</p>;

  const { visits, stats } = data;

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22 }}>Visitor Dashboard</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="/api/admin/visits?format=csv"
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              background: "#2a2e37",
              color: "#e6e6e6",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Export CSV
          </a>
          <button
            onClick={logout}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              background: "#3a3f4b",
              color: "#e6e6e6",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          margin: "20px 0",
        }}
      >
        <StatCard label="Total visits" value={stats.total} />
        <StatCard label="GPS granted" value={stats.gpsGranted} />
        <StatCard label="GPS denied" value={stats.gpsDenied} />
        <StatCard label="Countries seen" value={stats.byCountry.length} />
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>Recent visits</h2>
      <div style={{ overflowX: "auto", border: "1px solid #2a2e37", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a1d24", textAlign: "left" }}>
              {[
                "Time",
                "IP",
                "Country",
                "Region",
                "City",
                "ISP",
                "ASN",
                "Browser",
                "OS",
                "Device",
                "GPS",
                "Map",
              ].map((h) => (
                <th key={h} style={{ padding: 10, borderBottom: "1px solid #2a2e37", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => {
              // Prefer the GPS point (precise, consented) over the
              // IP-derived one (approximate) when both exist.
              const hasGps = v.gpsConsent === "granted" && v.gpsLat != null && v.gpsLng != null;
              const hasIpLoc = v.ipLat != null && v.ipLng != null;
              const mapLat = hasGps ? v.gpsLat : v.ipLat;
              const mapLng = hasGps ? v.gpsLng : v.ipLng;
              const mapHref =
                hasGps || hasIpLoc
                  ? `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=14/${mapLat}/${mapLng}`
                  : null;

              return (
                <tr key={v.id} style={{ borderBottom: "1px solid #20232b" }}>
                  <td style={{ padding: 10, whiteSpace: "nowrap" }}>
                    {new Date(v.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: 10 }}>{v.ip}</td>
                  <td style={{ padding: 10 }}>{v.country || "—"}</td>
                  <td style={{ padding: 10 }}>{v.region || "—"}</td>
                  <td style={{ padding: 10 }}>{v.city || "—"}</td>
                  <td style={{ padding: 10 }}>{v.isp || "—"}</td>
                  <td style={{ padding: 10 }}>{v.asn || "—"}</td>
                  <td style={{ padding: 10 }}>
                    {v.browser ? `${v.browser} ${v.browserVersion || ""}`.trim() : "—"}
                  </td>
                  <td style={{ padding: 10 }}>{v.operatingSystem || "—"}</td>
                  <td style={{ padding: 10 }}>{v.deviceType || "—"}</td>
                  <td style={{ padding: 10, whiteSpace: "nowrap" }}>
                    {hasGps
                      ? `✅ ${v.gpsLat.toFixed(4)}, ${v.gpsLng.toFixed(4)}`
                      : v.gpsConsent === "denied"
                      ? "❌ denied"
                      : "— not asked"}
                  </td>
                  <td style={{ padding: 10 }}>
                    {mapHref ? (
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6ea8fe" }}
                      >
                        {hasGps ? "Open (GPS)" : "Open (approx.)"}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>
        "Map" links to OpenStreetMap at the GPS point when the visitor shared
        it (precise), otherwise at the IP-derived point (city-level
        approximate only — never shown as if it were precise).
      </p>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#1a1d24",
        border: "1px solid #2a2e37",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9aa0a6" }}>{label}</div>
    </div>
  );
}
