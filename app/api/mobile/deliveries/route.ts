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
    "SELECT d.id,d.customer,d.phone,d.address,d.landmark,d.status,d.version,d.created_at,d.failure_reason,d.location_latitude,d.location_longitude,d.location_accuracy_m,EXISTS(SELECT 1 FROM delivery_proofs p WHERE p.delivery_id=d.id AND p.uploaded_at>now()-interval '30 days') AS has_proof FROM deliveries d WHERE d.account_id=$1 AND d.driver_account_id=$2 ORDER BY CASE WHEN d.status IN ('Delivered','Failed') THEN 1 ELSE 0 END,d.created_at DESC LIMIT 100",
    [user.workspace_id, user.id],
  );
  return Response.json(
    { deliveries: result.rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
