import { z } from 'zod';
import { database } from '@/lib/database';
import { hash, sameOrigin } from '@/lib/session';
import { sendVerification } from '@/lib/verification';

export const runtime = 'nodejs';
const schema = z.object({ email: z.email().max(254).transform(value => value.toLowerCase()) });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const email = parsed.data.email;
  const limit = await database.query("INSERT INTO auth_limits(key,count,expires_at) VALUES($1,1,now()+interval '30 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_limits.expires_at<now() THEN 1 ELSE auth_limits.count+1 END,expires_at=CASE WHEN auth_limits.expires_at<now() THEN now()+interval '30 minutes' ELSE auth_limits.expires_at END RETURNING count", [`verify:${hash(email)}`]);
  if (limit.rows[0].count > 3) return Response.json({ error: 'Too many requests. Try again in 30 minutes.' }, { status: 429 });
  const result = await database.query('SELECT id FROM accounts WHERE email=$1 AND email_verification_required=true AND email_verified_at IS NULL', [email]);
  if (result.rowCount && !(await sendVerification(result.rows[0].id,email))) return Response.json({ error: 'Email is unavailable. Try again later.' }, { status: 503 });
  return Response.json({ ok: true });
}
