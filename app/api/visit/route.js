import { createVisit } from "../../../lib/db";
import { parseUserAgent } from "../../../lib/ua";

// Free, keyless IP geolocation for local/demo use. Swap for IPinfo/MaxMind
// with IPINFO_TOKEN in production (see README).
async function lookupIp(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return {
      country: "Local",
      region: "Local",
      city: "Local",
      isp: "Local dev",
      asn: null,
      lat: null,
      lng: null,
    };
  }
  try {
    const token = process.env.IPINFO_TOKEN;
    if (token) {
      const res = await fetch(`https://ipinfo.io/${ip}/json?token=${token}`);
      const data = await res.json();
      const [lat, lng] = (data.loc || ",").split(",").map(Number);
      return {
        country: data.country || null,
        region: data.region || null,
        city: data.city || null,
        isp: data.org || null,
        asn: data.asn?.asn || (data.org || "").match(/^AS\d+/)?.[0] || null,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
      };
    }
    // Fallback: ip-api.com free tier (no key, rate-limited, HTTP only — fine for a demo).
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,as,lat,lon`
    );
    const data = await res.json();
    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
      isp: data.isp || null,
      asn: data.as || null,
      lat: data.lat ?? null,
      lng: data.lon ?? null,
    };
  } catch (e) {
    console.error("IP lookup failed", e);
    return { country: null, region: null, city: null, isp: null, asn: null, lat: null, lng: null };
  }
}

function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const ip = getClientIp(request);
  const geo = await lookupIp(ip);
  const userAgent = request.headers.get("user-agent") || body.userAgent || null;
  const { browser, browserVersion, os, deviceType } = parseUserAgent(userAgent);

  const visitId = await createVisit({
    ip,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    isp: geo.isp,
    asn: geo.asn,
    ipLat: geo.lat,
    ipLng: geo.lng,
    browser,
    browserVersion,
    operatingSystem: os,
    deviceType,
    userAgent,
    referrer: request.headers.get("referer") || null,
  });

  return Response.json({
    visitId,
    location: {
      source: "ip",
      approximate: true,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      isp: geo.isp,
      asn: geo.asn,
      lat: geo.lat,
      lng: geo.lng,
    },
  });
}
