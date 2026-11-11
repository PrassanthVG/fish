import { deleteSession } from "../../../../lib/db";
import { SESSION_COOKIE } from "../../../../lib/auth";

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function POST(request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) await deleteSession(token);

  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
  return res;
}
