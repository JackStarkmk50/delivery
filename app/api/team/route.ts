import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/database';
import { account, hash, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
const invitation = z.object({ email: z.email().max(254).transform(value => value.toLowerCase()), role: z.enum(['dispatcher','driver']).default('dispatcher') });

export async function GET() {
  const user = await account();
  if (user?.role !== 'owner') return Response.json({ error: 'Owner access required.' }, { status: 403 });
  const members = await database.query("SELECT a.id,a.email,a.display_name,m.role,m.joined_at FROM workspace_memberships m JOIN accounts a ON a.id=m.account_id WHERE m.workspace_id=$1 ORDER BY CASE m.role WHEN 'owner' THEN 0 ELSE 1 END,a.email", [user.workspace_id]);
  return Response.json({ members: members.rows }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (user?.role !== 'owner') return Response.json({ error: 'Owner access required.' }, { status: 403 });
  if (!['trial','active'].includes(user.service_status)) return Response.json({ error: 'Workspace access is paused.' }, { status: 403 });
  const parsed = invitation.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const { email, role } = parsed.data;
  const existing = await database.query('SELECT 1 FROM accounts WHERE email=$1', [email]);
  if (existing.rowCount) return Response.json({ error: 'This email already has an account.' }, { status: 409 });
  const pending = await database.query('SELECT count(*)::int AS count FROM team_invitations WHERE workspace_id=$1 AND accepted_at IS NULL AND expires_at>now()', [user.workspace_id]);
  if (pending.rows[0].count >= 20) return Response.json({ error: 'Too many pending invitations.' }, { status: 429 });
  const token = randomBytes(32).toString('hex');
  await database.query("INSERT INTO team_invitations(token_hash,workspace_id,email,role,expires_at) VALUES($1,$2,$3,$4,now()+interval '48 hours')", [hash(token),user.workspace_id,email,role]);
  return Response.json({ invite_url: `${process.env.APP_ORIGIN ?? 'http://localhost:3000'}/join/${token}`, expires_in_hours: 48 }, { status: 201 });
}
