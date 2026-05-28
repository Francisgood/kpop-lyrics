/**
 * Batch-translates all @aegyo.fan bot annotations and comments to English.
 * Safe to re-run — skips records that already look like English.
 *
 * Usage:
 *   DATABASE_URL="..." ANTHROPIC_API_KEY="sk-ant-..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/translate-bot-content.ts
 */
import { prisma } from "../lib/prisma";
import { translateToEnglish } from "../lib/translate";

const BATCH = 20; // records per concurrent batch
const DELAY = 300; // ms between batches (rate-limit headroom)

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function translateAnnotations() {
  const all = await prisma.lyricAnnotation.findMany({
    where: { user: { email: { endsWith: "@aegyo.fan" } } },
    select: { id: true, note: true },
  });
  console.log(`\nAnnotations to process: ${all.length}`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async ann => {
        const translated = await translateToEnglish(ann.note);
        if (translated === ann.note) {
          skipped++;
          return;
        }
        await prisma.lyricAnnotation.update({
          where: { id: ann.id },
          data: { note: translated },
        });
        updated++;
      })
    );
    process.stdout.write(`  annotations: ${Math.min(i + BATCH, all.length)}/${all.length}\r`);
    if (i + BATCH < all.length) await sleep(DELAY);
  }
  console.log(`\n  Updated: ${updated}  Skipped (already English): ${skipped}`);
}

async function translateComments() {
  const all = await prisma.comment.findMany({
    where: { user: { email: { endsWith: "@aegyo.fan" } } },
    select: { id: true, body: true },
  });
  console.log(`\nComments to process: ${all.length}`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async cmt => {
        const translated = await translateToEnglish(cmt.body);
        if (translated === cmt.body) {
          skipped++;
          return;
        }
        await prisma.comment.update({
          where: { id: cmt.id },
          data: { body: translated },
        });
        updated++;
      })
    );
    process.stdout.write(`  comments: ${Math.min(i + BATCH, all.length)}/${all.length}\r`);
    if (i + BATCH < all.length) await sleep(DELAY);
  }
  console.log(`\n  Updated: ${updated}  Skipped (already English): ${skipped}`);
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Bot Content Translation → English");
  console.log("═══════════════════════════════════════════════════");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n❌  ANTHROPIC_API_KEY not set — aborting.");
    process.exit(1);
  }

  await translateAnnotations();
  await translateComments();

  console.log("\n✅  Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
