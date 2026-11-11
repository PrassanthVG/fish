import { getAdminByEmail, createSession } from "../../../../lib/db";
import { verifyPassword, SESSION_COOKIE } from "../../../../lib/auth";

// Very small in-memory rate limiter (per-process, fine for a demo —
// use a real store like Redis/Upstash in production).
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimited(key) {
  const now = Date.now();
  const rec = attempts.get(key) || { count: 0, windowStart: now };
  if (now - rec.windowStart > WINDOW_MS) {
    rec.count = 0;
    rec.windowStart = now;
  }
  rec.count += 1;
  attempts.set(key, rec);
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many attempts, try again later." }, { status: 429 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const admin = await getAdminByEmail(email);
  if (!admin) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(admin.id);

  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${new Date(
      expiresAt
    ).toUTCString()}`
  );
  return res;
}
