import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/database';
import { account, sameOrigin } from '@/lib/session';
export const runtime = 'nodejs';
const delivery = z.object({ customer: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(30), address: z.string().trim().min(5).max(300), landmark: z.string().trim().max(300), driver: z.string().trim().max(120).default('') });
export async function GET() {
  const user = await account();
  if (!user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  const result = await database.query('SELECT id,customer,phone,address,landmark,status,driver,version,created_at FROM deliveries WHERE account_id=$1 ORDER BY created_at DESC LIMIT 200', [user.id]);
  return Response.json({ deliveries: result.rows }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const user = await account();
  if (!user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  const parsed = delivery.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Check the customer, phone, and destination fields.' }, { status: 400 });
  const item = parsed.data;
  const id = randomUUID();
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('INSERT INTO deliveries(id,account_id,customer,phone,address,landmark,status,driver) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [id,user.id,item.customer,item.phone,item.address,item.landmark,!item.landmark ? 'Address check' : item.driver ? 'Assigned' : 'Ready to assign',item.driver]);
    await client.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [id,'Delivery created']);
    await client.query('COMMIT');
    return Response.json({ delivery: result.rows[0] }, { status: 201 });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
