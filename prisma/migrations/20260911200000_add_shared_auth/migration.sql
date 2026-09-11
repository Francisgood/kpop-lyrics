CREATE TABLE "SharedAuthIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SharedAuthIdentity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SharedAuthIdentity_userId_key" ON "SharedAuthIdentity"("userId");
CREATE UNIQUE INDEX "SharedAuthIdentity_issuer_subject_key" ON "SharedAuthIdentity"("issuer", "subject");
ALTER TABLE "SharedAuthIdentity" ADD CONSTRAINT "SharedAuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD COLUMN "providerSessionId" TEXT,
ADD COLUMN "authenticatedAt" TIMESTAMP(3),
ADD COLUMN "providerCheckedAt" TIMESTAMP(3),
ADD COLUMN "securityVersion" INTEGER,
ADD COLUMN "passwordResetAt" TIMESTAMP(3);
