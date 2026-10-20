import { test, expect, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { userInfo } from "node:os";
import { readFileSync } from "node:fs";

test.skipIf(process.env.AEGYO_DELETION_PG_TEST !== "1")("deletes confirmed content, tracks ambiguous records privately and blocks stale writes", async () => {
  const name = `social_delete_${randomUUID().replaceAll("-", "")}`;
  const sql = (database: string, text: string) => execFileSync("psql",["-h","/tmp","-U",userInfo().username,"-d",database,"-v","ON_ERROR_STOP=1","-q"],{input:text,encoding:"utf8",stdio:["pipe","pipe","pipe"]});
  sql("postgres",`CREATE DATABASE ${name}`);
  const url = `postgresql://${userInfo().username}@localhost/${name}?host=%2Ftmp`;
  vi.stubEnv("DATABASE_URL",url);
  let disconnect: (() => Promise<void>) | undefined;
  try {
    execFileSync(process.execPath,["node_modules/prisma/build/index.js","db","push","--skip-generate"],{env:{...process.env,DATABASE_URL:url},stdio:"pipe"});
    const { prisma } = await import("../lib/prisma"); disconnect=()=>prisma.$disconnect();
    const { deleteSocialAccount } = await import("../lib/account-deletion");
    const { ensureTeachTables } = await import("../lib/teach");
    const { ensurePollTables } = await import("../lib/polls-db");
    // Production's custom build can ship code before the additive migration.
    await ensureTeachTables(); await ensurePollTables();
    sql(name, readFileSync(new URL("../prisma/migrations/20261020170000_account_deletion/migration.sql",import.meta.url),"utf8"));
    await prisma.user.createMany({data:[{id:"fan",email:"fan@example.test",displayName:"Same Name",passwordHash:"unused"},{id:"peer",email:"peer@example.test",displayName:"Same Name",passwordHash:"unused"}]});
    const issuer="https://accounts.example.test/api/auth";
    await prisma.sharedAuthIdentity.create({data:{id:"binding",userId:"fan",issuer,subject:"subject-fan"}});
    await prisma.chatMessage.createMany({data:[{id:"own-msg",authorId:"fan",authorName:"Same Name",body:"remove"},{id:"peer-msg",authorId:"peer",authorName:"Same Name",body:"keep"}]});
    sql(name, `CREATE TABLE "CommunityComment"(id text, "authorSlug" text, body text);
      INSERT INTO "CommunityComment" VALUES('ambiguous-1','same-name','ambiguous');
      CREATE TABLE "Tip"(id text,email text,tip text); INSERT INTO "Tip" VALUES('tip','fan@example.test','remove');
      INSERT INTO "TeachClip"(id,"userId",title,"videoId") VALUES('clip','fan','title','abcdef');
      INSERT INTO "PollVote"(id,"pollSlug",option,"voterRef","voterType") VALUES('own-vote','poll','a','fan','profile'),('anonymous','poll','b','device','device');`);
    const input={requestId:randomUUID(),issuer,subject:"subject-fan"};
    const receipt=await deleteSocialAccount(input);
    expect(receipt.status).toBe("needs_review");
    expect(await prisma.user.count()).toBe(1);
    expect((await prisma.chatMessage.findMany()).map(m=>m.id)).toEqual(["peer-msg"]);
    const remaining=await prisma.$queryRawUnsafe<Array<{id:string}>>('SELECT id FROM "PollVote"');
    expect(remaining).toEqual([{id:"anonymous"}]);
    expect(await prisma.$queryRawUnsafe('SELECT * FROM "TeachClip"')).toEqual([]);
    expect(await prisma.$queryRawUnsafe('SELECT * FROM "Tip"')).toEqual([]);
    expect(JSON.stringify(receipt)).not.toContain("fan@example.test");
    const ledger=await prisma.$queryRawUnsafe<Array<{reviewRecords:unknown}>>('SELECT "reviewRecords" FROM "AccountDeletionReceipt"');
    expect(JSON.stringify(ledger)).toContain("ambiguous-1");
    expect(await deleteSocialAccount(input)).toEqual(receipt);
    await expect(deleteSocialAccount({...input,subject:"peer"})).rejects.toThrow("request_conflict");
    await expect(prisma.$executeRawUnsafe('INSERT INTO "TeachClip"(id,"userId",title,"videoId") VALUES(\'late\',\'fan\',\'late\',\'late\')')).rejects.toThrow("account_unavailable");
    await expect(prisma.sharedAuthIdentity.create({data:{id:"late-binding",userId:"peer",issuer,subject:"subject-fan"}})).rejects.toThrow("account_deleted");
    expect((await deleteSocialAccount({requestId:randomUUID(),issuer,subject:"no-local-account"})).status).toBe("no_link");
  } finally {
    await disconnect?.(); vi.unstubAllEnvs(); sql("postgres",`DROP DATABASE ${name}`);
  }
},30000);
