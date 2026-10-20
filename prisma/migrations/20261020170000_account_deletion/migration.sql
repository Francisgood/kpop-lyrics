CREATE TABLE "AccountDeletionReceipt" (
  "requestId" UUID PRIMARY KEY,
  "issuer" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "manifest" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("issuer","subject")
);
-- Old OAuth callbacks must never re-provision a deleted subject.
CREATE FUNCTION aegyo_reject_deleted_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.issuer || ':' || NEW.subject));
  IF EXISTS (SELECT 1 FROM "AccountDeletionReceipt" WHERE issuer=NEW.issuer AND subject=NEW.subject) THEN
    RAISE EXCEPTION 'account_deleted';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER aegyo_reject_deleted_identity BEFORE INSERT OR UPDATE ON "SharedAuthIdentity"
FOR EACH ROW EXECUTE FUNCTION aegyo_reject_deleted_identity();
ALTER TABLE "AccountDeletionReceipt" ADD COLUMN "reviewRecords" JSONB NOT NULL DEFAULT '[]';
-- Raw legacy tables lack User foreign keys. Enforce account existence under a row lock.
CREATE FUNCTION aegyo_guard_account_row() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE account_id text;
BEGIN
  IF TG_TABLE_NAME='PollVote' AND to_jsonb(NEW)->>'voterType'<>'profile' THEN RETURN NEW; END IF;
  account_id=to_jsonb(NEW)->>TG_ARGV[0];
  PERFORM 1 FROM "User" WHERE id=account_id FOR KEY SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'account_unavailable'; END IF;
  RETURN NEW;
END $$;
CREATE FUNCTION aegyo_install_account_guard(table_name text, column_name text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF (table_name,column_name) NOT IN (('Follow','followerId'),('TeachClip','userId'),
      ('TeachClipVote','userId'),('PointsEvent','userId'),('SlangVote','userId'),('PollVote','voterRef')) THEN
    RAISE EXCEPTION 'unsupported_account_table';
  END IF;
  IF to_regclass(format('%I',table_name)) IS NOT NULL AND NOT EXISTS
    (SELECT 1 FROM pg_trigger WHERE tgrelid=to_regclass(format('%I',table_name)) AND tgname='aegyo_account_exists') THEN
    EXECUTE format('CREATE TRIGGER aegyo_account_exists BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION aegyo_guard_account_row(%L)',table_name,column_name);
  END IF;
END $$;
DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['Follow','TeachClip','TeachClipVote','PointsEvent','SlangVote','PollVote'] LOOP
    PERFORM aegyo_install_account_guard(t,CASE t WHEN 'Follow' THEN 'followerId' WHEN 'PollVote' THEN 'voterRef' ELSE 'userId' END);
  END LOOP;
END $$;
