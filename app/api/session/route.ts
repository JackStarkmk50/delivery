import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { database } from '@/lib/database';
import { account, createSession, hash, passwordHash, sameOrigin, verifyPassword } from '@/lib/session';
import { sendVerification } from '@/lib/verification';
export const runtime = 'nodejs';
const credentials = z.object({ email: z.email().max(254).transform(value => value.toLowerCase()), password: z.string().min(12).max(128), workspace: z.string().trim().min(2).max(100).optional(), mode: z.enum(['register','login']) });
export async function GET() { return Response.json({ account: await account() }, { headers: { 'Cache-Control': 'no-store' } }); }
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = credentials.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Enter a valid email and a password of 12 to 128 characters.' }, { status: 400 });
  const { email, password, workspace, mode } = parsed.data;
  const limit = await database.query("INSERT INTO auth_limits(key,count,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_limits.expires_at<now() THEN 1 ELSE auth_limits.count+1 END, expires_at=CASE WHEN auth_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE auth_limits.expires_at END RETURNING count", [hash(email)]);
  if (limit.rows[0].count > 10) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (mode === 'register') {
    if (process.env.ALLOW_REGISTRATION !== 'true') return Response.json({ error: 'Registration is closed.' }, { status: 403 });
    if (!workspace) return Response.json({ error: 'Workspace name is required.' }, { status: 400 });
    const id = randomUUID();
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('INSERT INTO accounts(id,email,password_hash,workspace) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id', [id, email, await passwordHash(password), workspace]);
      if (!result.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Unable to create account with these details.' }, { status: 409 }); }
      await client.query('INSERT INTO subscriptions(account_id) VALUES($1)', [id]);
      await client.query("INSERT INTO workspace_memberships(account_id,workspace_id,role) VALUES($1,$1,'owner')", [id]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    if (!(await sendVerification(id,email))) return Response.json({ error: 'Account created, but email is unavailable. Request a new verification link later.' }, { status: 503 });
    return Response.json({ needs_verification: true });
  } else {
    const result = await database.query('SELECT id,password_hash,email_verification_required,email_verified_at FROM accounts WHERE email=$1', [email]);
    const found = result.rows[0];
    const valid = await verifyPassword(password, found?.password_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`);
    if (!found || !valid) return Response.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    if (found.email_verification_required && !found.email_verified_at) return Response.json({ error: 'Verify your email before signing in. Request a new link if needed.' }, { status: 403 });
    await createSession(found.id);
  }
  return Response.json({ account: await account() });
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const jar = await cookies(); const token = jar.get('miledesk-session')?.value;
  if (token) await database.query('DELETE FROM sessions WHERE token_hash=$1', [hash(token)]);
  jar.delete('miledesk-session'); return Response.json({ ok: true });
}
