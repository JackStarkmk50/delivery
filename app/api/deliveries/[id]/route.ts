import { z } from 'zod';
import { database } from '@/lib/database';
import { account, sameOrigin } from '@/lib/session';
export const runtime = 'nodejs';
const change = z.object({ version: z.number().int().positive(), customer: z.string().trim().min(2).max(120).optional(), phone: z.string().trim().min(7).max(30).optional(), address: z.string().trim().min(5).max(300).optional(), landmark: z.string().trim().max(300).optional(), driver: z.string().trim().max(120).optional(), status: z.enum(['Address check','Ready to assign','Assigned','Picked up','On the way','Delivered','Failed']).optional() });
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await account();
  if (!user?.workspace_id) return Response.json({ error: 'Workspace access required.' }, { status: 403 });
  const { id } = await params;
  const result = await database.query('SELECT d.*,coalesce(json_agg(json_build_object(\'message\',e.message,\'at\',e.created_at) ORDER BY e.id) FILTER (WHERE e.id IS NOT NULL),\'[]\'::json) AS history FROM deliveries d LEFT JOIN delivery_events e ON e.delivery_id=d.id WHERE d.id=$1 AND d.account_id=$2 GROUP BY d.id', [id,user.workspace_id]);
  return result.rowCount ? Response.json({ delivery: result.rows[0] }) : Response.json({ error: 'Delivery not found.' }, { status: 404 });
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (!user?.workspace_id) return Response.json({ error: 'Workspace access required.' }, { status: 403 });
  const parsed = change.safeParse(await request.json().catch(() => null));
  if (!['trial','active'].includes(user.service_status)) return Response.json({ error: 'Workspace access is paused. Contact MileDesk support.' }, { status: 403 });
  if (!parsed.success) return Response.json({ error: 'Check the delivery fields.' }, { status: 400 });
  const { id } = await params;
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM deliveries WHERE id=$1 AND account_id=$2 FOR UPDATE', [id,user.workspace_id]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Delivery not found.' }, { status: 404 }); }
    const previous = found.rows[0];
    if (previous.version !== parsed.data.version) { await client.query('ROLLBACK'); return Response.json({ error: 'This delivery changed. Refresh and try again.' }, { status: 409 }); }
    const next = { ...previous, ...parsed.data };
    if (next.status === 'Address check' && next.landmark) next.status = next.driver ? 'Assigned' : 'Ready to assign';
    if (['Assigned','Picked up','On the way','Delivered'].includes(next.status) && (!next.landmark || !next.driver)) { await client.query('ROLLBACK'); return Response.json({ error: 'Confirm the landmark and assign a driver before dispatch.' }, { status: 400 }); }
    const result = await client.query('UPDATE deliveries SET customer=$3,phone=$4,address=$5,landmark=$6,driver=$7,status=$8,version=version+1 WHERE id=$1 AND account_id=$2 RETURNING *', [id,user.workspace_id,next.customer,next.phone,next.address,next.landmark,next.driver,next.status]);
    const message = next.status !== previous.status ? `Status changed to ${next.status}` : 'Delivery details updated';
    await client.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [id,message]);
    await client.query('COMMIT');
    return Response.json({ delivery: result.rows[0] });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
