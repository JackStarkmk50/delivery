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
  const result = await database.query(`UPDATE subscriptions s SET service_status=$2,payment_status=$3,plan_name=$4,
    renewal_date=$5,payment_reference=$6,notes=$7,updated_at=now(),updated_by=$8
    WHERE s.account_id=$1 AND EXISTS(SELECT 1 FROM accounts a WHERE a.id=s.account_id AND a.is_platform_admin=false) RETURNING s.account_id`,
    [id,data.service_status,data.payment_status,data.plan_name,data.renewal_date,data.payment_reference,data.notes,user.id]);
  return result.rowCount ? Response.json({ ok: true }) : Response.json({ error: 'Client not found.' }, { status: 404 });
}
