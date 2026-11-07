import nextEnv from '@next/env';
import { randomUUID, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';
nextEnv.loadEnvConfig(process.cwd());
const email = process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.PLATFORM_ADMIN_PASSWORD;
if (!email || !password || password.length < 20) throw new Error('Set PLATFORM_ADMIN_EMAIL and a password of at least 20 characters.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const salt = randomBytes(16).toString('hex');
  const key = await promisify(scrypt)(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
  const digest = `${salt}:${key.toString('hex')}`;
  await client.query('INSERT INTO accounts(id,email,password_hash,workspace,is_platform_admin,email_verification_required) VALUES($1,$2,$3,$4,true,false) ON CONFLICT(email) DO UPDATE SET is_platform_admin=true', [randomUUID(), email, digest, 'MileDesk operations']);
  console.log('Platform admin ready.');
} finally { await client.end(); }
