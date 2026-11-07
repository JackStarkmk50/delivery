import { randomBytes } from 'node:crypto';
import { database } from './database';
import { sendMail } from './mail';
import { hash } from './session';

export async function sendVerification(accountId: string, email: string) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hash(token);
  await database.query("INSERT INTO email_verification_tokens(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '24 hours')", [tokenHash,accountId]);
  try {
    const url = `${process.env.APP_ORIGIN ?? 'http://localhost:3000'}/verify/${token}`;
    await sendMail(email, 'Verify your MileDesk email', `Open this link to verify your MileDesk email. It expires in 24 hours.\n\n${url}\n\nIf you did not create this account, you can ignore this message.`);
    return true;
  } catch {
    await database.query('DELETE FROM email_verification_tokens WHERE token_hash=$1', [tokenHash]);
    return false;
  }
}
