import { z } from "zod";
import { database } from "@/lib/database";
import { mobileAccount } from "@/lib/mobile-session";

export const runtime = "nodejs";
const update = z.object({
  version: z.number().int().positive(),
  status: z.enum(["Picked up", "On the way", "Delivered", "Failed"]),
  reason: z.string().trim().max(500).default(""),
});
const nextStatus: Record<string, string> = {
  Assigned: "Picked up",
  "Picked up": "On the way",
  "On the way": "Delivered",
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await mobileAccount(request);
  if (!user)
    return Response.json(
      { error: "Driver sign in required." },
      { status: 401 },
    );
  if (!["trial", "active"].includes(user.service_status))
    return Response.json(
      { error: "Workspace access is paused." },
      { status: 403 },
    );
  const parsed = update.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    (parsed.data.status === "Failed" && parsed.data.reason.length < 5)
  )
    return Response.json(
      { error: "Enter a valid status and a failure reason when needed." },
      { status: 400 },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return Response.json({ error: "Delivery not found." }, { status: 404 });
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query(
      "SELECT status,version FROM deliveries WHERE id=$1 AND account_id=$2 AND driver_account_id=$3 FOR UPDATE",
      [id, user.workspace_id, user.id],
    );
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Delivery not found." }, { status: 404 });
    }
    const previous = found.rows[0];
    if (previous.version !== parsed.data.version) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "This delivery changed. Refresh and try again." },
        { status: 409 },
      );
    }
    const { status, reason } = parsed.data;
    if (
      status !== nextStatus[previous.status] &&
      !(
        status === "Failed" &&
        ["Assigned", "Picked up", "On the way"].includes(previous.status)
      )
    ) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "This status change is not available." },
        { status: 400 },
      );
    }
    const result = await client.query(
      "UPDATE deliveries SET status=$4,failure_reason=$5,version=version+1 WHERE id=$1 AND account_id=$2 AND driver_account_id=$3 RETURNING id,customer,phone,address,landmark,status,version,created_at,failure_reason",
      [
        id,
        user.workspace_id,
        user.id,
        status,
        status === "Failed" ? reason : "",
      ],
    );
    await client.query(
      "INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)",
      [
        id,
        status === "Failed"
          ? `Driver reported failed attempt: ${reason}`
          : `Driver changed status to ${status}`,
      ],
    );
    await client.query("COMMIT");
    return Response.json({ delivery: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
