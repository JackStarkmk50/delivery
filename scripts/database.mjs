import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(await readFile(new URL('../database/001-initial.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT');
  console.log('Database schema ready.');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { await client.end(); }
