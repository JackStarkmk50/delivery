import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const version of [1, 2, 3, 4, 5, 6]) {
    const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version=$1', [version]);
    if (applied.rowCount) continue;
    const name = String(version).padStart(3, '0') + ['-initial.sql','-platform.sql','-team.sql','-password-reset.sql','-driver.sql','-tracking.sql'][version - 1];
    await client.query(await readFile(new URL(`../database/${name}`, import.meta.url), 'utf8'));
    await client.query('INSERT INTO schema_migrations(version) VALUES($1)', [version]);
  }
  await client.query('COMMIT');
  console.log('Database schema ready.');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { await client.end(); }
