import { getSession } from "./db";
import { SESSION_COOKIE } from "./auth";

export function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function requireAdmin(request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const session = await getSession(token);
  return session;
}
