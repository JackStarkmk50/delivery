import { z } from 'zod';
import { database } from '@/lib/database';
import { account } from '@/lib/session';

export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await account();
  if (!user?.workspace_id || !['owner','dispatcher'].includes(user.role ?? '')) return Response.json({ error: 'Dispatcher access required.' }, { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return Response.json({ error: 'Photo not found.' }, { status: 404 });
  const result = await database.query("SELECT p.image,p.mime_type FROM delivery_proofs p JOIN deliveries d ON d.id=p.delivery_id WHERE p.delivery_id=$1 AND d.account_id=$2 AND p.uploaded_at>now()-interval '30 days'", [id,user.workspace_id]);
  if (!result.rowCount) return Response.json({ error: 'Photo not found.' }, { status: 404 });
  return new Response(new Uint8Array(result.rows[0].image), { headers: { 'Content-Type': result.rows[0].mime_type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } });
}
