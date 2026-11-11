"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const GPS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "granted", label: "Granted" },
  { value: "denied", label: "Denied" },
  { value: "not_asked", label: "Not asked" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [gpsStatus, setGpsStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(
    async (filters = {}) => {
      const params = new URLSearchParams({ limit: "50" });
      if (filters.search) params.set("search", filters.search);
      if (filters.gpsStatus && filters.gpsStatus !== "all") params.set("gpsStatus", filters.gpsStatus);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      const res = await fetch(`/api/admin/visits?${params.toString()}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Failed to load data");
        return;
      }
      setData(await res.json());
    },
    [router]
  );

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters(e) {
    e?.preventDefault();
    load({ search, gpsStatus, from, to });
  }

  function clearFilters() {
    setSearch("");
    setGpsStatus("all");
    setFrom("");
    setTo("");
    load({});
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (error) return <p style={{ padding: 24, color: "#f28b82" }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>Loading…</p>;

  const { visits, stats, filteredTotal } = data;

  const exportParams = new URLSearchParams({ format: "csv", limit: "200" });
  if (search) exportParams.set("search", search);
  if (gpsStatus !== "all") exportParams.set("gpsStatus", gpsStatus);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);

  return (
    <main style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Visitor Dashboard</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href={`/api/admin/visits?${exportParams.toString()}`}
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

      <form
        onSubmit={applyFilters}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "flex-end",
          background: "#1a1d24",
          border: "1px solid #2a2e37",
          borderRadius: 8,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <Field label="Search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="IP, city, country, ISP, browser…"
            style={inputStyle}
          />
        </Field>
        <Field label="GPS status">
          <select value={gpsStatus} onChange={(e) => setGpsStatus(e.target.value)} style={inputStyle}>
            {GPS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="To">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </Field>
        <button type="submit" className="btn" style={{ height: 36 }}>
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="btn btn-ghost"
          style={{ height: 36 }}
        >
          Clear
        </button>
      </form>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        Recent visits {typeof filteredTotal === "number" ? `(${filteredTotal} match)` : ""}
      </h2>

      <div style={{ border: "1px solid #2a2e37", borderRadius: 8, overflow: "hidden" }}>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <colgroup>
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "#1a1d24", textAlign: "left" }}>
              {["Time", "IP", "Location", "Network", "Client", "GPS", "Map"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid #2a2e37",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 20, textAlign: "center", color: "var(--text-faint)" }}>
                  No visits match these filters.
                </td>
              </tr>
            )}
            {visits.map((v) => {
              const hasGps = v.gpsConsent === "granted" && v.gpsLat != null && v.gpsLng != null;
              const hasIpLoc = v.ipLat != null && v.ipLng != null;
              const mapLat = hasGps ? v.gpsLat : v.ipLat;
              const mapLng = hasGps ? v.gpsLng : v.ipLng;
              const mapHref =
                hasGps || hasIpLoc
                  ? `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=14/${mapLat}/${mapLng}`
                  : null;

              const location = [v.city, v.region, v.country].filter(Boolean).join(", ") || "—";
              const network = [v.isp, v.asn].filter(Boolean).join(" · ") || "—";
              const client = [
                v.browser ? `${v.browser} ${v.browserVersion || ""}`.trim() : null,
                v.operatingSystem,
                v.deviceType,
              ]
                .filter(Boolean)
                .join(" · ") || "—";

              return (
                <tr key={v.id} style={{ borderBottom: "1px solid #20232b" }}>
                  <td style={cellStyle}>{new Date(v.createdAt).toLocaleString()}</td>
                  <td style={cellStyle}>{v.ip}</td>
                  <td style={cellStyle} title={location}>
                    {location}
                  </td>
                  <td style={cellStyle} title={network}>
                    {network}
                  </td>
                  <td style={cellStyle} title={client}>
                    {client}
                  </td>
                  <td style={cellStyle}>
                    {hasGps
                      ? `✅ ${v.gpsLat.toFixed(3)}, ${v.gpsLng.toFixed(3)}`
                      : v.gpsConsent === "denied"
                      ? "❌ denied"
                      : "— not asked"}
                  </td>
                  <td style={cellStyle}>
                    {mapHref ? (
                      <a href={mapHref} target="_blank" rel="noopener noreferrer" style={{ color: "#6ea8fe" }}>
                        Map
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
        approximate only — never shown as if it were precise). Hover a
        truncated cell to see its full value.
      </p>
    </main>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 13,
  height: 36,
  boxSizing: "border-box",
};

const cellStyle = {
  padding: "8px 10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
      {label}
      {children}
    </label>
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
