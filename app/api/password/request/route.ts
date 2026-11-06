import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/database';
import { sendMail } from '@/lib/mail';
import { hash, sameOrigin } from '@/lib/session';

export const runtime = 'nodejs';
const schema = z.object({ email: z.email().max(254).transform(value => value.toLowerCase()) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const email = parsed.data.email;
  const limit = await database.query("INSERT INTO auth_limits(key,count,expires_at) VALUES($1,1,now()+interval '30 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_limits.expires_at<now() THEN 1 ELSE auth_limits.count+1 END,expires_at=CASE WHEN auth_limits.expires_at<now() THEN now()+interval '30 minutes' ELSE auth_limits.expires_at END RETURNING count", [`reset:${hash(email)}`]);
  if (limit.rows[0].count > 3) return Response.json({ error: 'Too many requests. Try again in 30 minutes.' }, { status: 429 });
  const found = await database.query('SELECT id FROM accounts WHERE email=$1', [email]);
  if (found.rowCount) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = hash(token);
    await database.query("INSERT INTO password_reset_tokens(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')", [tokenHash,found.rows[0].id]);
    try {
      const link = `${process.env.APP_ORIGIN ?? 'http://localhost:3000'}/reset/${token}`;
      await sendMail(email, 'Reset your MileDesk password', `Use this link to reset your MileDesk password. It expires in 30 minutes.\n\n${link}\n\nIf you did not request this, you can ignore this message.`);
    } catch {
      await database.query('DELETE FROM password_reset_tokens WHERE token_hash=$1', [tokenHash]);
      return Response.json({ error: 'Email is unavailable. Try again later.' }, { status: 503 });
    }
  }
  return Response.json({ ok: true });
}
