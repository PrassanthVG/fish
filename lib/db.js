// Postgres (via Supabase) + Prisma storage layer. All functions here are
// async now — every caller must await them.

import crypto from "crypto";
import { prisma } from "./prisma";

export async function createVisit({
  ip,
  country,
  region,
  city,
  isp,
  asn,
  ipLat,
  ipLng,
  browser,
  browserVersion,
  operatingSystem,
  deviceType,
  userAgent,
  referrer,
}) {
  const visit = await prisma.visit.create({
    data: {
      ip,
      country,
      region,
      city,
      isp,
      asn: asn ?? null,
      ipLat: ipLat ?? null,
      ipLng: ipLng ?? null,
      browser: browser ?? null,
      browserVersion: browserVersion ?? null,
      operatingSystem: operatingSystem ?? null,
      deviceType: deviceType ?? null,
      userAgent,
      referrer,
    },
  });
  return visit.id;
}

export async function updateVisitGps(id, { consent, lat, lng, accuracy }) {
  await prisma.visit.update({
    where: { id },
    data: {
      gpsConsent: consent,
      gpsLat: lat ?? null,
      gpsLng: lng ?? null,
      gpsAccuracy: accuracy ?? null,
    },
  });
}

export function buildVisitWhere({ search, gpsStatus, from, to } = {}) {
  const where = {};

  if (search) {
    where.OR = [
      { ip: { contains: search, mode: "insensitive" } },
      { country: { contains: search, mode: "insensitive" } },
      { region: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { isp: { contains: search, mode: "insensitive" } },
      { browser: { contains: search, mode: "insensitive" } },
      { operatingSystem: { contains: search, mode: "insensitive" } },
    ];
  }

  if (gpsStatus && gpsStatus !== "all") {
    where.gpsConsent = gpsStatus;
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  return where;
}

export async function listVisits({ limit = 50, offset = 0, filters = {} } = {}) {
  return prisma.visit.findMany({
    where: buildVisitWhere(filters),
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countFilteredVisits(filters = {}) {
  return prisma.visit.count({ where: buildVisitWhere(filters) });
}

export async function countVisits() {
  return prisma.visit.count();
}

export async function getStats() {
  const [total, gpsGranted, gpsDenied, grouped] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.count({ where: { gpsConsent: "granted" } }),
    prisma.visit.count({ where: { gpsConsent: "denied" } }),
    prisma.visit.groupBy({
      by: ["country"],
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
  ]);

  const byCountry = grouped.map((g) => ({
    country: g.country || "unknown",
    c: g._count.country,
  }));

  return { total, gpsGranted, gpsDenied, byCountry };
}

// --- admin ---

export async function getAdminByEmail(email) {
  return prisma.adminUser.findUnique({ where: { email } });
}

export async function createAdmin(email, passwordHash) {
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  return admin.id;
}

export async function createSession(adminId, ttlMs = 1000 * 60 * 60 * 8) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);
  await prisma.adminSession.create({ data: { token, adminId, expiresAt } });
  return { token, expiresAt: expiresAt.toISOString() };
}

export async function getSession(token) {
  const row = await prisma.adminSession.findUnique({ where: { token } });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return row;
}

export async function deleteSession(token) {
  await prisma.adminSession.deleteMany({ where: { token } });
}
