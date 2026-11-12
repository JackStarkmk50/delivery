import { z } from 'zod';
import { database } from '@/lib/database';
import { mobileAccount } from '@/lib/mobile-session';

export const runtime = 'nodejs';
const maxImage = 3145728;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await mobileAccount(request);
  if (!user) return Response.json({ error: 'Driver sign in required.' }, { status: 401 });
  if (!['trial','active'].includes(user.service_status)) return Response.json({ error: 'Workspace access is paused.' }, { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return Response.json({ error: 'Delivery not found.' }, { status: 404 });
  const length = Number(request.headers.get('content-length'));
  if (!Number.isFinite(length) || length < 1 || length > maxImage + 65536) return Response.json({ error: 'Choose a photo under 3 MB.' }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const photo = form?.get('photo');
  if (!(photo instanceof File) || photo.size < 1 || photo.size > maxImage) return Response.json({ error: 'Choose a photo under 3 MB.' }, { status: 400 });
  const bytes = Buffer.from(await photo.arrayBuffer());
  const jpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length > 8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (!jpeg && !png) return Response.json({ error: 'Choose a JPEG or PNG photo.' }, { status: 400 });
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT status FROM deliveries WHERE id=$1 AND account_id=$2 AND driver_account_id=$3 FOR UPDATE', [id,user.workspace_id,user.id]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'Delivery not found.' }, { status: 404 }); }
    if (found.rows[0].status !== 'Delivered') { await client.query('ROLLBACK'); return Response.json({ error: 'Mark this delivery as delivered before adding a photo.' }, { status: 409 }); }
    await client.query("DELETE FROM delivery_proofs WHERE delivery_id=$1 AND uploaded_at<=now()-interval '30 days'", [id]);
    const added = await client.query('INSERT INTO delivery_proofs(delivery_id,driver_id,driver_name,mime_type,image) VALUES($1,$2,$3,$4,$5) ON CONFLICT(delivery_id) DO NOTHING RETURNING delivery_id', [id,user.id,user.display_name || user.email,jpeg ? 'image/jpeg' : 'image/png',bytes]);
    if (!added.rowCount) { await client.query('ROLLBACK'); return Response.json({ error: 'A photo is already attached to this delivery.' }, { status: 409 }); }
    await client.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [id,'Driver added delivery photo']);
    await client.query('COMMIT');
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
