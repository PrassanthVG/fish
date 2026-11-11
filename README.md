# Visitor Analytics Demo

A transparent, honestly-labeled demo of visitor analytics: IP-derived
approximate location recorded automatically (disclosed on the page before
it happens), and precise GPS location recorded only after the visitor
explicitly clicks a button and approves their browser's permission
prompt. Data is stored in SQLite. There's a small password-protected
admin dashboard to view it.

**This is not, and does not pretend to be, Microsoft, Google, or any
other company.** It's a standalone app you can look at end-to-end.

## Features

- Public page: records IP + approximate geolocation on load (shown to
  the visitor, not hidden), with an explicit opt-in button for precise
  GPS location.
- SQLite storage (`better-sqlite3`) — a `data.db` file, no external DB
  needed for local use.
- Admin login (`/admin/login`) — bcrypt-hashed password, HttpOnly
  session cookie, basic rate limiting, session expiry.
- Admin dashboard (`/admin/dashboard`) — visit counts, GPS grant/deny
  stats, a table of recent visits, CSV export.
- Playwright end-to-end tests covering the real flows: page load +
  disclosure, IP recording, GPS granted, GPS denied, admin auth
  (reject/accept), dashboard load.

## Database: Supabase (Postgres) + Prisma

This app stores data in Postgres via Prisma — works locally and on Vercel
(unlike SQLite, which needs a persistent filesystem serverless functions
don't have).

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database → Connection string**, copy:
   - the **Transaction pooler** URL (port `6543`) → `DATABASE_URL`
   - the **Session/direct** URL (port `5432`) → `DIRECT_URL`
3. Put both in `.env.local` (see `.env.example`).
4. Create the tables:

```bash
npx prisma migrate dev --name init
```

## Setup

```bash
npm install            # also runs `prisma generate` via postinstall
cp .env.example .env.local   # fill in DATABASE_URL / DIRECT_URL from Supabase, optional IPINFO_TOKEN
npx prisma migrate dev --name init
ADMIN_EMAIL=you@example.com ADMIN_INITIAL_PASSWORD=change-me npm run create-admin
npm run dev
```

Open http://localhost:3000, and http://localhost:3000/admin/login with
the credentials you just created.

## Run the end-to-end tests

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The Playwright config seeds its own throwaway admin account
(`test@example.com` / `test-password-123`) and starts the dev server on
port 3200 automatically.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

In the Vercel project's **Settings → Environment Variables**, add
`DATABASE_URL`, `DIRECT_URL`, and optionally `IPINFO_TOKEN` (same values
as your `.env.local`). Redeploy after adding them. Run
`ADMIN_EMAIL=... ADMIN_INITIAL_PASSWORD=... npm run create-admin` locally
once (pointed at the same Supabase DB) to seed your admin login — it
writes straight to Postgres, so it works the same whether you run it
locally or from anywhere else with those env vars set.

## What's recorded, and why

- **On page load:** public IP, a best-effort approximate
  country/region/city/ISP from a free IP-geolocation lookup, user agent,
  referrer, timestamp. This is standard for almost any website's server
  logs — it's surfaced here instead of hidden.
- **Only after you click "Share my precise GPS location" and approve
  the browser prompt:** latitude, longitude, accuracy. If you deny, that
  denial is recorded instead of coordinates.
- Nothing is collected from other sites, no cookies/passwords/tokens
  from elsewhere, and the browser's permission system is never bypassed
  — the real native prompt is the only way GPS data is ever obtained.
