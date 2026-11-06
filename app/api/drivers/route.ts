import { database } from "@/lib/database";
import { account } from "@/lib/session";

export const runtime = "nodejs";
export async function GET() {
  const user = await account();
  if (!user || !["owner", "dispatcher"].includes(user.role ?? ""))
    return Response.json(
      { error: "Dispatcher access required." },
      { status: 403 },
    );
  const result = await database.query(
    "SELECT a.id,a.display_name,a.email FROM workspace_memberships m JOIN accounts a ON a.id=m.account_id WHERE m.workspace_id=$1 AND m.role='driver' ORDER BY a.display_name,a.email",
    [user.workspace_id],
  );
  return Response.json(
    { drivers: result.rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
