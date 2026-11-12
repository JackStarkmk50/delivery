import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const result = await client.query("DELETE FROM delivery_proofs WHERE uploaded_at < now() - interval '30 days'");
  console.log(`Removed ${result.rowCount} expired delivery photos.`);
} finally {
  await client.end();
}
