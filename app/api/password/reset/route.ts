import { z } from 'zod';
import { database } from '@/lib/database';
import { hash, passwordHash, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
const schema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(12).max(128) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid link or password.' }, { status: 400 });
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT account_id FROM password_reset_tokens WHERE token_hash=$1 AND expires_at>now() FOR UPDATE', [hash(parsed.data.token)]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Reset link expired or already used.' }, { status: 410 }); }
    const id = found.rows[0].account_id;
    await client.query('UPDATE accounts SET password_hash=$2,email_verified_at=now() WHERE id=$1', [id,await passwordHash(parsed.data.password)]);
    await client.query('DELETE FROM sessions WHERE account_id=$1', [id]);
    await client.query('DELETE FROM mobile_sessions WHERE account_id=$1', [id]);
    await client.query('DELETE FROM password_reset_tokens WHERE account_id=$1', [id]);
    await client.query('COMMIT');
    return Response.json({ ok: true });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
