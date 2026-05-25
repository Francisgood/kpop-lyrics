import { Prisma } from "@prisma/client";
import { apiError } from "./errors";

export function handlePrismaError(e: unknown) {
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return apiError("AA-DB-001", "Database unavailable — try again shortly", 503, e.message);
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return apiError("AA-DB-003", "That entry already exists", 409, e.message);
    if (e.code === "P2025") return apiError("AA-DB-004", "Record not found", 404, e.message);
  }
  return apiError("AA-SYS-001", "Unexpected server error", 500, String(e));
}
