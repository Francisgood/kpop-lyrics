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

CREATE TABLE "AuthCutoverLatch" (
  "id" TEXT NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "mappingDigest" TEXT NOT NULL,
  CONSTRAINT "AuthCutoverLatch_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthCutoverLatch_fixed_id" CHECK ("id" = 'accounts-shared-auth-v1'),
  CONSTRAINT "AuthCutoverLatch_mapping_digest" CHECK ("mappingDigest" ~ '^[0-9a-f]{64}$')
);

CREATE FUNCTION "reject_auth_cutover_latch_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AuthCutoverLatch is monotonic and cannot be changed';
END;
$$;

CREATE TRIGGER "AuthCutoverLatch_reject_update_delete"
BEFORE UPDATE OR DELETE ON "AuthCutoverLatch"
FOR EACH ROW EXECUTE FUNCTION "reject_auth_cutover_latch_mutation"();

CREATE TRIGGER "AuthCutoverLatch_reject_truncate"
BEFORE TRUNCATE ON "AuthCutoverLatch"
FOR EACH STATEMENT EXECUTE FUNCTION "reject_auth_cutover_latch_mutation"();
