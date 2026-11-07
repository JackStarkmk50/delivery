"use client";
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDialog } from '../use-dialog';
type Account = { id: string; email: string; workspace: string; role: 'owner' | 'dispatcher' | 'driver' | null; is_platform_admin: boolean; service_status: string };
type Delivery = { id: string; customer: string; phone: string; address: string; landmark: string; driver: string; driver_account_id: string | null; status: string; version: number; history?: { message: string; at: string }[] };
type Driver = { id: string; display_name: string; email: string };
const statuses = ['Address check','Ready to assign','Assigned','Picked up','On the way','Delivered','Failed'];
async function call(path: string, method = 'GET', body?: object) {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
export default function LiveWorkspace() {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [trackingLink, setTrackingLink] = useState('');
  const closeDialog = useCallback(() => setSelected(null), []);
  useDialog(!!selected, closeDialog);
  const [mode, setMode] = useState<'login'|'register'>('register');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { setOrders((await call('/api/deliveries')).deliveries); setDrivers((await call('/api/drivers')).drivers); }, []);
  useEffect(() => {
    let active = true;
    Promise.all([call('/api/session'), call('/api/deliveries').catch(() => ({ deliveries: [] })), call('/api/drivers').catch(() => ({ drivers: [] }))])
      .then(([session, deliveries, roster]) => { if (active) { setAccount(session.account); setOrders(deliveries.deliveries); setDrivers(roster.drivers); } })
      .catch(error => { if (active) setMessage(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('');
    const data = new FormData(event.currentTarget);
    try { const result = await call('/api/session','POST',{ mode, email: data.get('email'), password: data.get('password'), workspace: data.get('workspace') }); if (result.needs_verification) { setMode('login'); setMessage('Check your email to verify this account before signing in.'); return; } setAccount(result.account); await refresh(); }
    catch (error) { setMessage((error as Error).message); }
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(''); const form = event.currentTarget; const data = new FormData(form);
    try { await call('/api/deliveries','POST',{ customer:data.get('customer'),phone:data.get('phone'),address:data.get('address'),landmark:data.get('landmark'),driver_account_id:data.get('driver_account_id') || null }); form.reset(); await refresh(); setMessage('Delivery added.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  async function open(id: string) { try { setSelected((await call(`/api/deliveries/${id}`)).delivery); setTrackingLink(''); } catch (error) { setMessage((error as Error).message); } }
  async function createTracking() {
    if (!selected) return;
    try { const result = await call(`/api/deliveries/${selected.id}/tracking`, 'POST'); setTrackingLink(result.url); setMessage('Customer link created. Share it privately; creating another link replaces this one.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setMessage(''); const data = new FormData(event.currentTarget);
    try { const result = await call(`/api/deliveries/${selected.id}`,'PATCH',{version:selected.version,customer:data.get('customer'),phone:data.get('phone'),address:data.get('address'),landmark:data.get('landmark'),driver_account_id:data.get('driver_account_id') || null,status:data.get('status')}); await refresh(); await open(result.delivery.id); setMessage('Delivery updated.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  async function logout() { try { await call('/api/session','DELETE'); setAccount(null);setOrders([]);setSelected(null); } catch (error) { setMessage((error as Error).message); } }
  return <main className="live-shell"><header className="live-header"><Link href="/" className="brand"><span className="brand-mark">m</span>MileDesk</Link><Link href="/product">About MileDesk</Link></header>
    {loading ? <p role="status">Loading workspace…</p> : !account ? <section className="live-auth panel"><h1>{mode === 'register' ? 'Create a workspace' : 'Sign in to MileDesk'}</h1><p>Keep your business deliveries together.</p><form onSubmit={submitAuth}><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={12} required/></label>{mode === 'register' && <label>Business name<input name="workspace" required minLength={2}/></label>}<button className="primary-button">{mode === 'register' ? 'Create workspace' : 'Sign in'}</button></form><button className="live-link" onClick={() => { setMode(mode === 'register' ? 'login' : 'register');setMessage(''); }}>{mode === 'register' ? 'Already have an account? Sign in' : 'Create a workspace'}</button>{mode === 'login' && <p><Link href="/forgot">Forgot your password?</Link><br/><Link href="/verify">Need a verification link?</Link></p>}</section> : <><div className="live-heading"><div><p className="sample-tag">{account.is_platform_admin ? 'Platform operations' : `${account.service_status} service · ${account.role}`}</p><h1>{account.workspace}</h1><p>Signed in as {account.email}</p></div><div className="live-heading-actions">{account.role === 'owner' && <Link className="secondary-button" href="/team">Team access</Link>}{account.is_platform_admin && <Link className="secondary-button" href="/admin">Client accounts</Link>}<button className="secondary-button" onClick={logout}>Sign out</button></div></div>{account.role && account.role !== "driver" && <section className="live-grid"><form className="panel live-form" onSubmit={create}><h2>New delivery</h2><p>Keep the address and entrance details together.</p><label>Customer<input name="customer" required minLength={2}/></label><label>Phone<input name="phone" type="tel" required minLength={7}/></label><label>Street address<input name="address" required minLength={5}/></label><label>Landmark or entrance<input name="landmark"/></label><label>Driver<select name="driver_account_id" defaultValue=""><option value="">Assign later</option>{drivers.map(driver => <option key={driver.id} value={driver.id}>{driver.display_name || driver.email}</option>)}</select></label><button className="primary-button">Add delivery</button></form><section className="panel live-queue"><div className="live-queue-head"><h2>Delivery queue</h2><span>{orders.length} orders</span></div>{orders.length ? orders.map(order => <button key={order.id} className="live-order" onClick={() => open(order.id)}><span><strong>{order.customer}</strong><small>{order.address}</small><small>{order.landmark || 'Landmark needed'}</small></span><span className="badge badge-pending">{order.status}</span></button>) : <p className="empty-state">No deliveries yet. Add the first order to start the queue.</p>}</section></section>}
    {account.role !== "driver" && selected && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section className="modal detail-modal live-detail" role="dialog" aria-modal="true" aria-labelledby="live-detail-title"><div className="detail-head"><div><h2 id="live-detail-title">{selected.customer}</h2><p>Delivery {selected.id.slice(0,8)}</p></div><button className="modal-close" aria-label="Close delivery" onClick={() => setSelected(null)}>×</button></div><form onSubmit={update} key={`${selected.id}-${selected.version}`}><label>Customer<input name="customer" defaultValue={selected.customer} required/></label><label>Phone<input name="phone" defaultValue={selected.phone} required/></label><label>Street address<input name="address" defaultValue={selected.address} required/></label><label>Landmark or entrance<input name="landmark" defaultValue={selected.landmark}/></label><label>Driver<select name="driver_account_id" defaultValue={selected.driver_account_id ?? ""}><option value="">{selected.driver && !selected.driver_account_id ? `Unlinked: ${selected.driver}` : "Assign later"}</option>{drivers.map(driver => <option key={driver.id} value={driver.id}>{driver.display_name || driver.email}</option>)}</select></label><label>Status<select name="status" defaultValue={selected.status}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><button className="primary-button">Save delivery</button></form><div className="live-track"><h3>Customer tracking</h3><p>Create a private link the customer can open in a browser or the MileDesk customer app.</p><button className="secondary-button" onClick={createTracking}>Create customer link</button>{trackingLink && <label>Share this link<input readOnly value={trackingLink} onFocus={event => event.currentTarget.select()}/></label>}</div><h3>Activity</h3><ol className="delivery-history">{selected.history?.map((event,index) => <li key={index}>{event.message}<time>{new Date(event.at).toLocaleString('en-IN')}</time></li>)}</ol></section></div>}
    </>}{message && <p className="live-message" role="status">{message}</p>}</main>;
}
