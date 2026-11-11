import { PrismaClient } from "@prisma/client";

// Standard Next.js-dev-mode-safe singleton: avoids exhausting Postgres
// connections from a new PrismaClient on every hot reload.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
