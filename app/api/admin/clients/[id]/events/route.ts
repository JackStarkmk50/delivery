import { z } from 'zod';
import { database } from '@/lib/database';
import { account } from '@/lib/session';

export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await account();
  if (!user?.is_platform_admin) return Response.json({ error: 'Not authorized.' }, { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return Response.json({ error: 'Client not found.' }, { status: 404 });
  const result = await database.query('SELECT e.id,e.created_at,e.previous,e.current,a.email AS actor_email FROM subscription_events e LEFT JOIN accounts a ON a.id=e.actor_id WHERE e.account_id=$1 ORDER BY e.created_at DESC LIMIT 50', [id]);
  return Response.json({ events: result.rows }, { headers: { 'Cache-Control': 'no-store' } });
}
