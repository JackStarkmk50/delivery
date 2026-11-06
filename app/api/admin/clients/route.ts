import { database } from '@/lib/database';
import { account } from '@/lib/session';
export const runtime = 'nodejs';
export async function GET() {
  const user = await account();
  if (!user?.is_platform_admin) return Response.json({ error: 'Not authorized.' }, { status: 403 });
  const result = await database.query(`SELECT a.id,a.email,a.workspace,a.created_at,
    coalesce(s.service_status,'trial') AS service_status,coalesce(s.payment_status,'unknown') AS payment_status,
    coalesce(s.plan_name,'Pilot') AS plan_name,s.renewal_date,s.payment_reference,s.notes,s.updated_at,
    count(d.id)::integer AS delivery_count
    FROM accounts a LEFT JOIN subscriptions s ON s.account_id=a.id
    LEFT JOIN deliveries d ON d.account_id=a.id
    WHERE a.is_platform_admin=false AND EXISTS(SELECT 1 FROM workspace_memberships m WHERE m.account_id=a.id AND m.role='owner')
    GROUP BY a.id,s.account_id ORDER BY a.created_at DESC`, []);
  const clients = result.rows;
  return Response.json({ clients, summary: { total: clients.length, active: clients.filter(client => client.service_status === 'active').length,
    trials: clients.filter(client => client.service_status === 'trial').length,
    unpaid: clients.filter(client => client.payment_status === 'unpaid').length,
    externallyPaid: clients.filter(client => client.payment_status === 'paid_externally').length } }, { headers: { 'Cache-Control': 'no-store' } });
}
