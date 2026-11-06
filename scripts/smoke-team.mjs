import { randomUUID } from 'node:crypto';
import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd());
const origin = process.env.APP_ORIGIN ?? 'http://localhost:3000';
const suffix = randomUUID().slice(0, 8);
const ownerEmail = `owner-${suffix}@example.test`;
const memberEmail = `dispatcher-${suffix}@example.test`;
const driverEmail = `driver-${suffix}@example.test`;
const outsiderEmail = `outsider-${suffix}@example.test`;
const password = `MileDesk-${randomUUID()}`;
const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
await database.connect();

async function call(path, method = 'GET', body, cookie, bearer) {
  const response = await fetch(`${origin}${path}`, {
    method, headers: { origin, ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(bearer ? { authorization: `Bearer ${bearer}` } : {}) },
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
  const joined = await call('/api/join', 'POST', { token, password, name: 'Test dispatcher' });
  expect(joined.status === 200 && joined.cookie, `Join failed: ${JSON.stringify(joined.data)}`);
  const reused = await call('/api/join', 'POST', { token, password, name: 'Test dispatcher' });
  expect(reused.status === 410, 'Invitation was reusable.');
  const created = await call('/api/deliveries', 'POST', { customer: 'Test customer', phone: '9876543210', address: 'Test street, Salem', landmark: 'North gate', driver: '' }, joined.cookie);
  expect(created.status === 201, `Dispatcher could not create delivery: ${JSON.stringify(created.data)}`);
  const ownerQueue = await call('/api/deliveries', 'GET', undefined, owner.cookie);
  expect(ownerQueue.data.deliveries?.some(item => item.id === created.data.delivery.id), 'Owner did not see dispatcher delivery.');
  const outsider = await call('/api/session', 'POST', { mode: 'register', email: outsiderEmail, password, workspace: 'Other test' });
  expect(outsider.status === 200 && outsider.cookie, 'Outsider registration failed.');
  const outsiderQueue = await call('/api/deliveries', 'GET', undefined, outsider.cookie);
  expect(!outsiderQueue.data.deliveries?.some(item => item.id === created.data.delivery.id), 'Delivery leaked to another workspace.');
  const forbiddenLink = await call(`/api/deliveries/${created.data.delivery.id}/tracking`, 'POST', undefined, outsider.cookie);
  expect(forbiddenLink.status === 404, 'Another workspace created a tracking link.');
  const tracking = await call(`/api/deliveries/${created.data.delivery.id}/tracking`, 'POST', undefined, owner.cookie);
  expect(tracking.status === 200, 'Customer tracking link creation failed.');
  const trackingToken = tracking.data.url.split('/').at(-1);
  const customerView = await call(`/api/track/${trackingToken}`);
  expect(customerView.status === 200 && customerView.data.delivery.address === 'Test street, Salem', 'Customer could not view delivery.');
  expect(!('phone' in customerView.data.delivery), 'Customer tracking exposed the phone number.');
  const correction = await call(`/api/track/${trackingToken}`, 'PATCH', { version: customerView.data.delivery.version, address: 'Corrected street, Salem', landmark: 'East gate' });
  expect(correction.status === 200 && correction.data.delivery.status === 'Address check', 'Customer address correction failed.');
  const rotated = await call(`/api/deliveries/${created.data.delivery.id}/tracking`, 'POST', undefined, owner.cookie);
  expect(rotated.status === 200, 'Tracking link rotation failed.');
  const oldLink = await call(`/api/track/${trackingToken}`);
  expect(oldLink.status === 404, 'Old tracking link remained active after rotation.');
  const driverInvite = await call('/api/team', 'POST', { email: driverEmail, role: 'driver' }, owner.cookie);
  expect(driverInvite.status === 201, 'Driver invitation failed.');
  const driverToken = driverInvite.data.invite_url.split('/').at(-1);
  const driverJoined = await call('/api/join', 'POST', { token: driverToken, password, name: 'Test driver' });
  expect(driverJoined.status === 200, 'Driver join failed.');
  const driverId = (await database.query('SELECT id FROM accounts WHERE email=$1', [driverEmail])).rows[0].id;
  const driverWeb = await call('/api/deliveries', 'GET', undefined, driverJoined.cookie);
  expect(driverWeb.status === 403, 'Driver could read dispatcher queue.');
  const driverLogin = await call('/api/mobile/session', 'POST', { email: driverEmail, password });
  expect(driverLogin.status === 200 && driverLogin.data.token, 'Driver mobile login failed.');
  const assigned = await call('/api/deliveries', 'POST', { customer: 'Assigned test', phone: '9876543210', address: 'Test gate, Salem', landmark: 'North gate', driver_account_id: driverId }, joined.cookie);
  expect(assigned.status === 201 && assigned.data.delivery.status === 'Assigned', 'Driver assignment failed.');
  const driverQueue = await call('/api/mobile/deliveries', 'GET', undefined, undefined, driverLogin.data.token);
  expect(driverQueue.data.deliveries?.some(item => item.id === assigned.data.delivery.id), 'Assigned stop missing on driver API.');
  expect(!driverQueue.data.deliveries?.some(item => item.id === created.data.delivery.id), 'Unassigned stop leaked to driver.');
  const pickup = await call(`/api/mobile/deliveries/${assigned.data.delivery.id}`, 'PATCH', { version: assigned.data.delivery.version, status: 'Picked up' }, undefined, driverLogin.data.token);
  expect(pickup.status === 200, `Pickup update failed: ${JSON.stringify(pickup.data)}`);
  const activeRemoval = await call(`/api/team/${driverId}`, 'DELETE', undefined, owner.cookie);
  expect(activeRemoval.status === 409, 'Driver was removed during an in-progress delivery.');
  const activeTracking = await call(`/api/deliveries/${assigned.data.delivery.id}/tracking`, 'POST', undefined, owner.cookie);
  const activeToken = activeTracking.data.url.split('/').at(-1);
  const lateCorrection = await call(`/api/track/${activeToken}`, 'PATCH', { version: pickup.data.delivery.version, address: 'Another road, Salem', landmark: 'South gate' });
  expect(lateCorrection.status === 403, 'Customer changed the address after pickup.');
  const stale = await call(`/api/mobile/deliveries/${assigned.data.delivery.id}`, 'PATCH', { version: assigned.data.delivery.version, status: 'On the way' }, undefined, driverLogin.data.token);
  expect(stale.status === 409, 'Stale driver update was accepted.');
  const invalid = await call(`/api/mobile/deliveries/${assigned.data.delivery.id}`, 'PATCH', { version: pickup.data.delivery.version, status: 'Delivered' }, undefined, driverLogin.data.token);
  expect(invalid.status === 400, 'Driver skipped a required status.');
  const issue = await call(`/api/mobile/deliveries/${assigned.data.delivery.id}`, 'PATCH', { version: pickup.data.delivery.version, status: 'Failed', reason: 'Customer unavailable' }, undefined, driverLogin.data.token);
  expect(issue.status === 200 && issue.data.delivery.failure_reason === 'Customer unavailable', 'Failed attempt was not recorded.');
  const removeDriver = await call(`/api/team/${driverId}`, 'DELETE', undefined, owner.cookie);
  expect(removeDriver.status === 200, 'Driver removal failed.');
  const revoked = await call('/api/mobile/deliveries', 'GET', undefined, undefined, driverLogin.data.token);
  expect(revoked.status === 401, 'Removed driver retained mobile access.');
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
  console.log('Team, recovery, driver, and customer flows passed: assignment, isolation, transitions, address correction, link rotation, revocation, reset.');
} finally {
  await database.query('DELETE FROM accounts WHERE email = ANY($1)', [[ownerEmail, memberEmail, driverEmail, outsiderEmail]]);
  await database.end();
}
