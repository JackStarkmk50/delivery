import { randomUUID } from 'node:crypto';
import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd());
const origin = process.env.APP_ORIGIN ?? 'http://localhost:3000';
const suffix = randomUUID().slice(0, 8);
const ownerEmail = `owner-${suffix}@example.test`;
const memberEmail = `dispatcher-${suffix}@example.test`;
const outsiderEmail = `outsider-${suffix}@example.test`;
const password = `MileDesk-${randomUUID()}`;
const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
await database.connect();

async function call(path, method = 'GET', body, cookie) {
  const response = await fetch(`${origin}${path}`, {
    method, headers: { origin, ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
function expect(value, message) { if (!value) throw new Error(message); }

try {
  const owner = await call('/api/session', 'POST', { mode: 'register', email: ownerEmail, password, workspace: 'Team test' });
  expect(owner.status === 200 && owner.cookie, `Owner registration failed: ${JSON.stringify(owner.data)}`);
  const memberBefore = await call('/api/team');
  expect(memberBefore.status === 403, 'Unauthenticated team access was allowed.');
  const invite = await call('/api/team', 'POST', { email: memberEmail }, owner.cookie);
  expect(invite.status === 201, `Invitation failed: ${JSON.stringify(invite.data)}`);
  const token = invite.data.invite_url.split('/').at(-1);
  const joined = await call('/api/join', 'POST', { token, password });
  expect(joined.status === 200 && joined.cookie, `Join failed: ${JSON.stringify(joined.data)}`);
  const reused = await call('/api/join', 'POST', { token, password });
  expect(reused.status === 410, 'Invitation was reusable.');
  const created = await call('/api/deliveries', 'POST', { customer: 'Test customer', phone: '9876543210', address: 'Test street, Salem', landmark: 'North gate', driver: '' }, joined.cookie);
  expect(created.status === 201, `Dispatcher could not create delivery: ${JSON.stringify(created.data)}`);
  const ownerQueue = await call('/api/deliveries', 'GET', undefined, owner.cookie);
  expect(ownerQueue.data.deliveries?.some(item => item.id === created.data.delivery.id), 'Owner did not see dispatcher delivery.');
  const outsider = await call('/api/session', 'POST', { mode: 'register', email: outsiderEmail, password, workspace: 'Other test' });
  expect(outsider.status === 200 && outsider.cookie, 'Outsider registration failed.');
  const outsiderQueue = await call('/api/deliveries', 'GET', undefined, outsider.cookie);
  expect(!outsiderQueue.data.deliveries?.some(item => item.id === created.data.delivery.id), 'Delivery leaked to another workspace.');
  const removed = await call(`/api/team/${joined.data.account_id ?? (await database.query('SELECT id FROM accounts WHERE email=$1', [memberEmail])).rows[0].id}`, 'DELETE', undefined, owner.cookie);
  expect(removed.status === 200, `Removal failed: ${JSON.stringify(removed.data)}`);
  const afterRemoval = await call('/api/deliveries', 'GET', undefined, joined.cookie);
  expect(afterRemoval.status === 403, 'Removed dispatcher retained delivery access.');
  const requested = await call('/api/password/request', 'POST', { email: ownerEmail });
  expect(requested.status === 200, `Reset email failed: ${JSON.stringify(requested.data)}`);
  const emailResponse = await fetch(`http://127.0.0.1:8025/view/latest.txt?query=${encodeURIComponent(`to:${ownerEmail}`)}`);
  const emailText = await emailResponse.text();
  const resetToken = emailText.match(/\/reset\/([a-f0-9]{64})/)?.[1];
  expect(resetToken, 'Reset link did not arrive in Mailpit.');
  const newPassword = `Updated-${randomUUID()}`;
  const reset = await call('/api/password/reset', 'POST', { token: resetToken, password: newPassword });
  expect(reset.status === 200, `Password reset failed: ${JSON.stringify(reset.data)}`);
  const resetAgain = await call('/api/password/reset', 'POST', { token: resetToken, password: newPassword });
  expect(resetAgain.status === 410, 'Reset link was reusable.');
  const previousSession = await call('/api/deliveries', 'GET', undefined, owner.cookie);
  expect(previousSession.status === 403, 'Old session stayed active after password reset.');
  const newLogin = await call('/api/session', 'POST', { mode: 'login', email: ownerEmail, password: newPassword });
  expect(newLogin.status === 200, 'New password did not sign in.');
  console.log('Team and recovery passed: invite, join, one-use tokens, shared queue, tenant isolation, removal, reset, session revocation.');
} finally {
  await database.query('DELETE FROM accounts WHERE email = ANY($1)', [[ownerEmail, memberEmail, outsiderEmail]]);
  await database.end();
}
