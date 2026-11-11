// One-time setup script: creates (or updates) the initial admin user in
// Postgres via Prisma.
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_INITIAL_PASSWORD=change-me node scripts/create-admin.mjs
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!email || !password) {
  console.error(
    "Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD env vars before running this script."
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const hash = bcrypt.hashSync(password, 12);

await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash: hash },
  create: { email, passwordHash: hash },
});

console.log(`Admin ready: ${email}`);
await prisma.$disconnect();
