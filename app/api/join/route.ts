import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/database';
import { createSession, hash, passwordHash, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
const join = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(12).max(128), name: z.string().trim().min(2).max(80) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = join.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid invitation or password.' }, { status: 400 });
  const { token, password, name } = parsed.data;
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const invite = await client.query("SELECT i.email,i.workspace_id,i.role,a.workspace FROM team_invitations i JOIN accounts a ON a.id=i.workspace_id WHERE token_hash=$1 AND accepted_at IS NULL AND expires_at>now() FOR UPDATE OF i", [hash(token)]);
    if (!invite.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Invitation expired or already used.' }, { status: 410 }); }
    const { email, workspace_id, workspace, role } = invite.rows[0];
    const id = randomUUID();
    const created = await client.query('INSERT INTO accounts(id,email,password_hash,workspace,display_name) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO NOTHING RETURNING id', [id,email,await passwordHash(password),workspace,name]);
    if (!created.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'This email already has an account.' }, { status: 409 }); }
    await client.query('INSERT INTO workspace_memberships(account_id,workspace_id,role) VALUES($1,$2,$3)', [id,workspace_id,role]);
    await client.query('UPDATE team_invitations SET accepted_at=now() WHERE token_hash=$1', [hash(token)]);
    await client.query('COMMIT');
    await createSession(id);
    return Response.json({ ok: true });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
