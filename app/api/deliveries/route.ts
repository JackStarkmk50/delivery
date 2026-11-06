import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/database';
import { account, sameOrigin } from '@/lib/session';
export const runtime = 'nodejs';
const delivery = z.object({ customer: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(30), address: z.string().trim().min(5).max(300), landmark: z.string().trim().max(300), driver_account_id: z.uuid().nullable().optional() });
export async function GET() {
  const user = await account();
  if (!user?.workspace_id || !['owner','dispatcher'].includes(user.role ?? '')) return Response.json({ error: 'Dispatcher access required.' }, { status: 403 });
  const result = await database.query('SELECT id,customer,phone,address,landmark,status,driver,driver_account_id,failure_reason,version,created_at FROM deliveries WHERE account_id=$1 ORDER BY created_at DESC LIMIT 200', [user.workspace_id]);
  return Response.json({ deliveries: result.rows }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (!user?.workspace_id || !['owner','dispatcher'].includes(user.role ?? '')) return Response.json({ error: 'Dispatcher access required.' }, { status: 403 });
  const parsed = delivery.safeParse(await request.json().catch(() => null));
  if (!['trial','active'].includes(user.service_status)) return Response.json({ error: 'Workspace access is paused. Contact MileDesk support.' }, { status: 403 });
  if (!parsed.success) return Response.json({ error: 'Check the customer, phone, and destination fields.' }, { status: 400 });
  const item = parsed.data;
  const driver = item.driver_account_id ? await database.query("SELECT a.display_name FROM workspace_memberships m JOIN accounts a ON a.id=m.account_id WHERE m.account_id=$1 AND m.workspace_id=$2 AND m.role='driver'", [item.driver_account_id,user.workspace_id]) : null;
  if (item.driver_account_id && !driver?.rowCount) return Response.json({ error: 'Choose a driver from this workspace.' }, { status: 400 });
  const id = randomUUID();
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('INSERT INTO deliveries(id,account_id,customer,phone,address,landmark,status,driver,driver_account_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [id,user.workspace_id,item.customer,item.phone,item.address,item.landmark,!item.landmark ? 'Address check' : item.driver_account_id ? 'Assigned' : 'Ready to assign',driver?.rows[0]?.display_name ?? '',item.driver_account_id ?? null]);
    await client.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [id,'Delivery created']);
    await client.query('COMMIT');
    return Response.json({ delivery: result.rows[0] }, { status: 201 });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
