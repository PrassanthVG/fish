// Called only after the visitor has explicitly chosen to share GPS
// location (or explicitly been denied by the browser). Updates the
// existing visit row created by /api/visit — never creates a new
// hidden record, and never runs without a prior visitId from this
// browser's own session.

import { updateVisitGps } from "../../../lib/db";

export async function POST(request) {
  const data = await request.json().catch(() => ({}));
  const { visitId, consent, lat, lng, accuracy } = data || {};

  if (!visitId || !["granted", "denied"].includes(consent)) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (consent === "granted" && (typeof lat !== "number" || typeof lng !== "number")) {
    return new Response(JSON.stringify({ error: "Missing coordinates" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await updateVisitGps(visitId, { consent, lat, lng, accuracy });

  return Response.json({ ok: true });
}
