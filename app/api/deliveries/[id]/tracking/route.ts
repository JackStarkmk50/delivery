import { randomBytes } from "node:crypto";
import { z } from "zod";
import { database } from "@/lib/database";
import { account, hash, sameOrigin } from "@/lib/session";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";
const options = z.union([z.object({ email: z.email().max(254), consent: z.literal(true) }), z.object({}).strict()]);
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return Response.json({ error: "Origin not allowed." }, { status: 403 });
  const user = await account();
  if (!user || !["owner", "dispatcher"].includes(user.role ?? ""))
    return Response.json(
      { error: "Dispatcher access required." },
      { status: 403 },
    );
  if (!["trial", "active"].includes(user.service_status))
    return Response.json(
      { error: "Workspace access is paused." },
      { status: 403 },
    );
  const { id } = await params;
  const parsed = options.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Enter a valid email and confirm the customer agreed to receive the link." }, { status: 400 });
  if (!z.uuid().safeParse(id).success)
    return Response.json({ error: "Delivery not found." }, { status: 404 });
  const email = 'email' in parsed.data ? parsed.data.email : null;
  if (email) {
    const recent = await database.query("SELECT count(*)::int AS total FROM tracking_emails WHERE delivery_id=$1 AND sent_at>now()-interval '24 hours'", [id]);
    if (recent.rows[0].total >= 3) return Response.json({ error: "Email limit reached for this delivery. Try again tomorrow or share the link privately." }, { status: 429 });
  }
  const token = randomBytes(32).toString("hex");
  const result = await database.query(
    "UPDATE deliveries SET tracking_token_hash=$3,tracking_expires_at=now()+interval '30 days' WHERE id=$1 AND account_id=$2 RETURNING id",
    [id, user.workspace_id, hash(token)],
  );
  if (!result.rowCount)
    return Response.json({ error: "Delivery not found." }, { status: 404 });
  const url = `${process.env.APP_ORIGIN ?? "http://localhost:3000"}/track/${token}`;
  let email_sent = false;
  if (email) {
    try {
      await sendMail(email, 'Your MileDesk delivery link', `Your shop shared a private delivery link with you. Open it to check status or correct the address before pickup.\n\n${url}\n\nThis link expires in 30 days. Do not forward it.`);
      await database.query('INSERT INTO tracking_emails(delivery_id) VALUES($1)', [id]);
      await database.query('INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)', [id,'Dispatcher emailed customer tracking link']);
      email_sent = true;
    } catch { email_sent = false; }
  }
  return Response.json(
    {
      url,
      expires_in_days: 30,
      email_sent,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
