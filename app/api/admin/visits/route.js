import { listVisits, getStats } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;
  const format = searchParams.get("format");

  const visits = await listVisits({ limit, offset });
  const stats = await getStats();

  if (format === "csv") {
    const header = Object.keys(visits[0] || { id: "" }).join(",");
    const rows = visits.map((v) =>
      Object.values(v)
        .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=visits.csv",
      },
    });
  }

  return Response.json({ visits, stats });
}
