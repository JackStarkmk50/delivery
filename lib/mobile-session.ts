import { randomBytes } from "node:crypto";
import { database } from "./database";
import { hash } from "./session";

export async function mobileAccount(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return null;
  const result = await database.query(
    "SELECT a.id,a.email,a.display_name,m.workspace_id,owner.workspace,coalesce(sub.service_status,'trial') AS service_status FROM mobile_sessions s JOIN accounts a ON a.id=s.account_id JOIN workspace_memberships m ON m.account_id=a.id AND m.role='driver' JOIN accounts owner ON owner.id=m.workspace_id LEFT JOIN subscriptions sub ON sub.account_id=m.workspace_id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [hash(token)],
  );
  return result.rows[0] as
    | {
        id: string;
        email: string;
        display_name: string;
        workspace_id: string;
        workspace: string;
        service_status: string;
      }
    | undefined;
}

export async function createMobileSession(accountId: string) {
  const token = randomBytes(32).toString("hex");
  await database.query(
    "INSERT INTO mobile_sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '30 days')",
    [hash(token), accountId],
  );
  return token;
}
