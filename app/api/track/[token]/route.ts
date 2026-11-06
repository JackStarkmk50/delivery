import { z } from "zod";
import { database } from "@/lib/database";
import { hash } from "@/lib/session";

export const runtime = "nodejs";
const correction = z.object({
  version: z.number().int().positive(),
  address: z.string().trim().min(5).max(300),
  landmark: z.string().trim().max(300),
});
async function find(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await database.query(
    "SELECT d.id,d.customer,d.address,d.landmark,d.status,d.version,a.workspace FROM deliveries d JOIN accounts a ON a.id=d.account_id WHERE d.tracking_token_hash=$1 AND d.tracking_expires_at>now()",
    [hash(token)],
  );
  return result.rows[0] as
    | {
        id: string;
        customer: string;
        address: string;
        landmark: string;
        status: string;
        version: number;
        workspace: string;
      }
    | undefined;
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const delivery = await find(token);
  return delivery
    ? Response.json(
        { delivery },
        {
          headers: {
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        },
      )
    : Response.json(
        { error: "Tracking link expired or unavailable." },
        { status: 404 },
      );
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token))
    return Response.json(
      { error: "Tracking link expired or unavailable." },
      { status: 404 },
    );
  const parsed = correction.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Check the address and entrance details." },
      { status: 400 },
    );
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query(
      "SELECT id,status,version FROM deliveries WHERE tracking_token_hash=$1 AND tracking_expires_at>now() FOR UPDATE",
      [hash(token)],
    );
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Tracking link expired or unavailable." },
        { status: 404 },
      );
    }
    const previous = found.rows[0];
    if (previous.version !== parsed.data.version) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Delivery changed. Refresh and try again." },
        { status: 409 },
      );
    }
    if (
      !["Address check", "Ready to assign", "Assigned"].includes(
        previous.status,
      )
    ) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Contact the shop to change this delivery now." },
        { status: 403 },
      );
    }
    await client.query(
      "UPDATE deliveries SET address=$2,landmark=$3,status='Address check',version=version+1 WHERE id=$1",
      [previous.id, parsed.data.address, parsed.data.landmark],
    );
    await client.query(
      "INSERT INTO delivery_events(delivery_id,message) VALUES($1,$2)",
      [previous.id, "Customer submitted an address correction"],
    );
    await client.query("COMMIT");
    const delivery = await find(token);
    return Response.json(
      { delivery },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
