import fs from 'fs';
import path from 'path';

// Load .env.local if present when invoked via CLI
function loadEnvFileIfExists(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    let val = line.slice(eqIndex + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function main() {
  loadEnvFileIfExists(path.resolve(process.cwd(), '.env.local'));
  const { seedFirestore } = await import('../src/server/db/seed');
  const report = await seedFirestore();

  console.log('=== Firestore Idempotent Seed Summary ===');
  for (const row of report.results) {
    const status = row.skipped ? 'SKIPPED (non-empty)' : `SEEDED (${row.seeded} docs)`;
    console.log(`- ${row.collection}: ${status}`);
  }
}

main().catch((err) => {
  console.error('[SEED_ERROR]', err?.message || err);
  process.exit(1);
});
