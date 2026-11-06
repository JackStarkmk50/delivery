import { z } from 'zod';
import { database } from '@/lib/database';
import { account, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (user?.role !== 'owner') return Response.json({ error: 'Owner access required.' }, { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return Response.json({ error: 'Invalid member.' }, { status: 400 });
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const active = await client.query("SELECT status FROM deliveries WHERE account_id=$1 AND driver_account_id=$2 AND status IN ('Assigned','Picked up','On the way') FOR UPDATE", [user.workspace_id,id]);
    if (active.rows.some(delivery => delivery.status !== 'Assigned')) { await client.query('ROLLBACK'); return Response.json({ error: 'Reassign or finish this driver’s in-progress deliveries first.' }, { status: 409 }); }
    const unassigned = await client.query("UPDATE deliveries SET driver_account_id=NULL,driver='',status='Ready to assign',version=version+1 WHERE account_id=$1 AND driver_account_id=$2 AND status='Assigned' RETURNING id", [user.workspace_id,id]);
    for (const delivery of unassigned.rows) await client.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [delivery.id,'Driver removed; delivery ready to reassign']);
    const removed = await client.query("DELETE FROM workspace_memberships WHERE account_id=$1 AND workspace_id=$2 AND role IN ('dispatcher','driver') RETURNING account_id", [id,user.workspace_id]);
    if (!removed.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Team member not found.' }, { status: 404 }); }
    await client.query('DELETE FROM accounts WHERE id=$1', [id]);
    await client.query('COMMIT');
    return Response.json({ ok: true });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
