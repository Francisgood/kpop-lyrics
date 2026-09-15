#!/bin/sh
# One-shot production-catalog installer for the additive shared-auth schema.
set -eu

expected_project='a719c26e-33b9-4a1c-8759-d5401c1e181a'
expected_environment='27e2f29a-5846-48f8-9727-694a97c36ef6'
expected_service='726d0c13-88e6-4167-b1ac-521b4a7b1216'
expected_database='kpopdb'
expected_user='kpop'
expected_checksum='506016c2f155c984ecce34b4c67f49ce513fa5f4040493aa07b640d89bb4c865'

refuse() { echo "schema_installer_error=$1" >&2; exit 2; }
[ "${AEGYO_AUTH_SCHEMA_CONFIRM:-}" = 'install-reviewed-additive-schema-only' ] || refuse confirmation_missing
[ "${RAILWAY_PROJECT_ID:-}" = "$expected_project" ] || refuse project_mismatch
[ "${RAILWAY_ENVIRONMENT_ID:-}" = "$expected_environment" ] || refuse environment_mismatch
[ "${RAILWAY_SERVICE_ID:-}" = "$expected_service" ] || refuse service_mismatch
[ "${POSTGRES_DB:-}" = "$expected_database" ] || refuse database_environment_mismatch
[ "${POSTGRES_USER:-}" = "$expected_user" ] || refuse database_owner_mismatch
[ -z "${DATABASE_URL:-}" ] || refuse database_url_forbidden
[ "${AEGYO_SHARED_AUTH_ENABLED:-false}" != 'true' ] || refuse shared_auth_must_remain_disabled
[ "$#" -eq 1 ] || refuse expected_migration_path
migration=$1
[ -f "$migration" ] && [ ! -L "$migration" ] || refuse migration_not_regular_file
actual_checksum="$(sha256sum "$migration" | awk '{print $1}')"
[ "$actual_checksum" = "$expected_checksum" ] || refuse migration_checksum_mismatch

workdir="$(mktemp -d /tmp/aegyo-auth-schema.XXXXXX)"
chmod 700 "$workdir"
error_log="$workdir/error.log"
sql="$workdir/install.sql"
cleanup() { rm -rf "$workdir"; }
trap cleanup EXIT INT TERM

cat >"$sql" <<'SQL'
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '300s';
SET LOCAL idle_in_transaction_session_timeout = '330s';
SELECT pg_advisory_xact_lock(hashtext('aegyo-additive-auth-schema-v1'));
DO $$
BEGIN
  IF current_database() <> 'kpopdb' OR current_user <> 'kpop' THEN
    RAISE EXCEPTION 'catalog identity mismatch';
  END IF;
  IF to_regclass('public."SharedAuthIdentity"') IS NOT NULL
     OR to_regclass('public."AuthCutoverLatch"') IS NOT NULL
     OR to_regclass('public."AegyoAuthOperatorJournal"') IS NOT NULL
     OR to_regprocedure('public.reject_auth_cutover_latch_mutation()') IS NOT NULL
     OR EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='Session'
         AND column_name IN ('providerSessionId','authenticatedAt','providerCheckedAt','securityVersion','passwordResetAt')
     ) THEN
    RAISE EXCEPTION 'unexpected preexisting or partial shared-auth schema';
  END IF;
END $$;

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT c.oid::regclass AS table_name FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.oid
  LOOP EXECUTE format('LOCK TABLE %s IN SHARE MODE', r.table_name); END LOOP;
END $$;

CREATE TEMP TABLE _aegyo_prisma_history_before AS TABLE public._prisma_migrations;
CREATE TEMP TABLE _aegyo_schema_before (
  table_name text PRIMARY KEY, columns_json jsonb NOT NULL,
  row_count bigint NOT NULL, rows_hash text NOT NULL
) ON COMMIT DROP;
DO $$
DECLARE r record; cols jsonb; expression text; counted bigint; hashed text;
BEGIN
  FOR r IN SELECT c.oid, n.nspname, c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND c.relname <> '_prisma_migrations' ORDER BY c.relname
  LOOP
    SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attnum),
           string_agg(format('%L, %I',a.attname,a.attname), ', ' ORDER BY a.attnum)
      INTO cols, expression FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
      WHERE a.attrelid=r.oid AND a.attnum>0 AND NOT a.attisdropped;
    EXECUTE format('SELECT count(*), encode(sha256(convert_to(coalesce(string_agg(jsonb_build_object(%s)::text, E''\\n'' ORDER BY jsonb_build_object(%s)::text), ''''), ''UTF8'')), ''hex'') FROM %I.%I', expression, expression, r.nspname, r.relname)
      INTO counted, hashed;
    INSERT INTO _aegyo_schema_before VALUES (r.relname, cols, counted, hashed);
  END LOOP;
END $$;
SQL
cat "$migration" >>"$sql"
cat >>"$sql" <<SQL
CREATE TABLE "AegyoAuthOperatorJournal" (
  "id" text PRIMARY KEY CHECK ("id" = 'additive-shared-auth-v1'),
  "migrationChecksum" text NOT NULL CHECK ("migrationChecksum" ~ '^[0-9a-f]{64}$'),
  "installedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "AegyoAuthOperatorJournal" ("id", "migrationChecksum")
VALUES ('additive-shared-auth-v1', '$expected_checksum');

DO \$\$
DECLARE b record; cols jsonb; expression text; counted bigint; hashed text;
BEGIN
  IF EXISTS ((TABLE public._prisma_migrations EXCEPT ALL TABLE _aegyo_prisma_history_before) UNION ALL (TABLE _aegyo_prisma_history_before EXCEPT ALL TABLE public._prisma_migrations)) THEN
    RAISE EXCEPTION 'historical prisma journal changed';
  END IF;
  IF (SELECT count(*) FROM "SharedAuthIdentity") <> 0 OR (SELECT count(*) FROM "AuthCutoverLatch") <> 0 THEN
    RAISE EXCEPTION 'installer unexpectedly created identity or latch rows';
  END IF;
  FOR b IN SELECT * FROM _aegyo_schema_before ORDER BY table_name LOOP
    SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attnum),
           string_agg(format('%L, %I',a.attname,a.attname), ', ' ORDER BY a.attnum)
      INTO cols, expression FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
      WHERE a.attrelid=format('public.%I',b.table_name)::regclass AND a.attnum>0 AND NOT a.attisdropped
        AND NOT (b.table_name='Session' AND a.attname IN ('providerSessionId','authenticatedAt','providerCheckedAt','securityVersion','passwordResetAt'));
    EXECUTE format('SELECT count(*), encode(sha256(convert_to(coalesce(string_agg(jsonb_build_object(%s)::text, E''\\n'' ORDER BY jsonb_build_object(%s)::text), ''''), ''UTF8'')), ''hex'') FROM public.%I', expression, expression, b.table_name)
      INTO counted, hashed;
    IF cols <> b.columns_json THEN RAISE EXCEPTION 'preexisting column catalog changed: %', b.table_name; END IF;
    IF counted <> b.row_count OR hashed <> b.rows_hash THEN RAISE EXCEPTION 'preexisting rows changed: %', b.table_name; END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND c.relname NOT IN
      (SELECT table_name FROM _aegyo_schema_before UNION ALL SELECT unnest(ARRAY['_prisma_migrations','SharedAuthIdentity','AuthCutoverLatch','AegyoAuthOperatorJournal']))) THEN
    RAISE EXCEPTION 'unexpected table created';
  END IF;
END \$\$;
COMMIT;
SQL

if ! PGHOST=/var/run/postgresql PGDATABASE="$POSTGRES_DB" PGUSER="$POSTGRES_USER" \
  PGOPTIONS='-c client_min_messages=warning' psql -X -q -f "$sql" > /dev/null 2>"$error_log"; then
  echo 'schema_installer_error=transaction_failed' >&2
  exit 1
fi
echo 'schema_installed=true'
echo "migration_checksum=$expected_checksum"
echo 'preexisting_catalog_preserved=true'
echo 'latch_created=false'
echo 'mappings_created=0'
