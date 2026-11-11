import { NextResponse } from "next/server";

// Edge-safe check: we only verify a cookie is *present* here (fast path).
// The real session validity check (expiry, existence in SQLite) happens
// in the Node-runtime API routes / dashboard page, since better-sqlite3
// cannot run on the Edge runtime that middleware uses.
export function middleware(request) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard"],
};
