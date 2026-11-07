import { z } from 'zod';
import { database } from '@/lib/database';
import { createSession, hash, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
const schema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid verification link.' }, { status: 400 });
  const client = await database.connect();
  let id: string;
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT account_id FROM email_verification_tokens WHERE token_hash=$1 AND expires_at>now() FOR UPDATE', [hash(parsed.data.token)]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Verification link expired or already used.' }, { status: 410 }); }
    id = found.rows[0].account_id;
    await client.query('UPDATE accounts SET email_verified_at=now() WHERE id=$1', [id]);
    await client.query('DELETE FROM email_verification_tokens WHERE account_id=$1', [id]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
  await createSession(id!);
  return Response.json({ ok: true });
}
