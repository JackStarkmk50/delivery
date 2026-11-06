import { randomBytes } from "node:crypto";
import { z } from "zod";
import { database } from "@/lib/database";
import { account, hash, sameOrigin } from "@/lib/session";

export const runtime = "nodejs";
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
  if (!z.uuid().safeParse(id).success)
    return Response.json({ error: "Delivery not found." }, { status: 404 });
  const token = randomBytes(32).toString("hex");
  const result = await database.query(
    "UPDATE deliveries SET tracking_token_hash=$3,tracking_expires_at=now()+interval '30 days' WHERE id=$1 AND account_id=$2 RETURNING id",
    [id, user.workspace_id, hash(token)],
  );
  if (!result.rowCount)
    return Response.json({ error: "Delivery not found." }, { status: 404 });
  return Response.json(
    {
      url: `${process.env.APP_ORIGIN ?? "http://localhost:3000"}/track/${token}`,
      expires_in_days: 30,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
