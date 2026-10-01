import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as typeof global & { prisma?: PrismaClient };

// Railway exposes many host CPUs to Prisma, whose default pool grows beyond
// this database's 100-client limit. Keep the app pool bounded while preserving
// any explicit limit already set in DATABASE_URL.
const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
if (databaseUrl && !databaseUrl.searchParams.has("connection_limit")) {
  databaseUrl.searchParams.set("connection_limit", "8");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl.toString() } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
