import { z } from "zod";
import { database } from "@/lib/database";
import { createMobileSession, mobileAccount } from "@/lib/mobile-session";
import { hash, verifyPassword } from "@/lib/session";

export const runtime = "nodejs";
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
});
export async function GET(request: Request) {
  const user = await mobileAccount(request);
  return user
    ? Response.json(
        { account: user },
        { headers: { "Cache-Control": "no-store" } },
      )
    : Response.json({ error: "Sign in required." }, { status: 401 });
}
export async function POST(request: Request) {
  const parsed = credentials.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  const { email, password } = parsed.data;
  const limit = await database.query(
    "INSERT INTO auth_limits(key,count,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_limits.expires_at<now() THEN 1 ELSE auth_limits.count+1 END,expires_at=CASE WHEN auth_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE auth_limits.expires_at END RETURNING count",
    [`mobile:${hash(email)}`],
  );
  if (limit.rows[0].count > 10)
    return Response.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  const found = await database.query(
    "SELECT a.id,a.password_hash,a.email_verification_required,a.email_verified_at FROM accounts a JOIN workspace_memberships m ON m.account_id=a.id AND m.role='driver' WHERE a.email=$1",
    [email],
  );
  const valid = await verifyPassword(
    password,
    found.rows[0]?.password_hash ?? `${"0".repeat(32)}:${"0".repeat(128)}`,
  );
  if (!found.rowCount || !valid)
    return Response.json(
      { error: "Email or password is incorrect." },
      { status: 401 },
    );
  if (found.rows[0].email_verification_required && !found.rows[0].email_verified_at)
    return Response.json({ error: "Verify your email before signing in." }, { status: 403 });
  const token = await createMobileSession(found.rows[0].id);
  return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (token)
    await database.query("DELETE FROM mobile_sessions WHERE token_hash=$1", [
      hash(token),
    ]);
  return Response.json({ ok: true });
}
