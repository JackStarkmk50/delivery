import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { database } from './database';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
}
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(':');
  const actual = await derive(password, salt);
  const expected = Buffer.from(digest, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function account() {
  const token = (await cookies()).get('miledesk-session')?.value;
  if (!token) return null;
  const result = await database.query("SELECT a.id,a.email,a.workspace,a.is_platform_admin,coalesce(sub.service_status,'trial') AS service_status FROM accounts a JOIN sessions s ON s.account_id=a.id LEFT JOIN subscriptions sub ON sub.account_id=a.id WHERE s.token_hash=$1 AND s.expires_at>now()", [hash(token)]);
  return result.rows[0] as { id: string; email: string; workspace: string; is_platform_admin: boolean; service_status: string } | undefined;
}
export async function createSession(accountId: string) {
  const token = randomBytes(32).toString('hex');
  await database.query("INSERT INTO sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '7 days')", [hash(token), accountId]);
  (await cookies()).set('miledesk-session', token, { httpOnly: true, secure: process.env.APP_ORIGIN?.startsWith('https://') ?? false, sameSite: 'lax', path: '/', maxAge: 604800 });
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === (process.env.APP_ORIGIN ?? 'http://localhost:3000');
}
