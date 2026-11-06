import { database } from "@/lib/database";
import { mobileAccount } from "@/lib/mobile-session";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const user = await mobileAccount(request);
  if (!user)
    return Response.json(
      { error: "Driver sign in required." },
      { status: 401 },
    );
  const result = await database.query(
    "SELECT id,customer,phone,address,landmark,status,version,created_at,failure_reason FROM deliveries WHERE account_id=$1 AND driver_account_id=$2 ORDER BY CASE WHEN status IN ('Delivered','Failed') THEN 1 ELSE 0 END,created_at DESC LIMIT 100",
    [user.workspace_id, user.id],
  );
  return Response.json(
    { deliveries: result.rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
