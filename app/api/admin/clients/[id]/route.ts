import { z } from 'zod';
import { database } from '@/lib/database';
import { account, sameOrigin } from '@/lib/session';
export const runtime = 'nodejs';
const update = z.object({ service_status: z.enum(['trial','active','paused','canceled']), payment_status: z.enum(['unknown','unpaid','paid_externally']), plan_name: z.string().trim().min(1).max(80), renewal_date: z.iso.date().nullable(), payment_reference: z.string().trim().max(120), notes: z.string().trim().max(1000) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (!user?.is_platform_admin) return Response.json({ error: 'Not authorized.' }, { status: 403 });
  const parsed = update.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Check the subscription fields.' }, { status: 400 });
  const data = parsed.data;
  if (data.payment_status === 'paid_externally' && !data.payment_reference) return Response.json({ error: 'Add a payment reference before marking paid externally.' }, { status: 400 });
  const { id } = await params;
  const client = await database.connect();
  try {
  await client.query('BEGIN');
  const before = await client.query('SELECT service_status,payment_status,plan_name,renewal_date,payment_reference,notes FROM subscriptions WHERE account_id=$1 FOR UPDATE', [id]);
  if (!before.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Client not found.' }, { status: 404 }); }
  const result = await client.query(`UPDATE subscriptions s SET service_status=$2,payment_status=$3,plan_name=$4,
    renewal_date=$5,payment_reference=$6,notes=$7,updated_at=now(),updated_by=$8
    WHERE s.account_id=$1 AND EXISTS(SELECT 1 FROM accounts a WHERE a.id=s.account_id AND a.is_platform_admin=false) RETURNING s.service_status,s.payment_status,s.plan_name,s.renewal_date,s.payment_reference,s.notes`,
    [id,data.service_status,data.payment_status,data.plan_name,data.renewal_date,data.payment_reference,data.notes,user.id]);
  if (!result.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Client not found.' }, { status: 404 }); }
  await client.query('INSERT INTO subscription_events(account_id,actor_id,previous,current) VALUES($1,$2,$3,$4)', [id,user.id,before.rows[0],result.rows[0]]);
  await client.query('COMMIT');
  return Response.json({ ok: true });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
