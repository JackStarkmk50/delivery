"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
type Client = { id:string; email:string; workspace:string; created_at:string; service_status:'trial'|'active'|'paused'|'canceled'; payment_status:'unknown'|'unpaid'|'paid_externally'; plan_name:string; renewal_date:string|null; payment_reference:string; notes:string; delivery_count:number; updated_at:string|null };
type Summary = { total:number;active:number;trials:number;unpaid:number;externallyPaid:number };
export default function AdminDashboard() {
  const [clients,setClients]=useState<Client[]>([]);
  const [summary,setSummary]=useState<Summary>({total:0,active:0,trials:0,unpaid:0,externallyPaid:0});
  const [selected,setSelected]=useState<string|null>(null);
  const [query,setQuery]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [draft,setDraft]=useState<Partial<Client>>({});
  const refresh=useCallback(async()=>{
    const response=await fetch('/api/admin/clients',{cache:'no-store'});
    if(!response.ok) throw new Error('Client list unavailable.');
    const data=await response.json();setClients(data.clients);setSummary(data.summary);
  },[]);
  useEffect(()=>{let active=true;const timer=window.setTimeout(()=>{refresh().catch(error=>{if(active)setMessage(error.message)}).finally(()=>{if(active)setLoading(false)})},0);return()=>{active=false;window.clearTimeout(timer)}},[refresh]);
  const rows=useMemo(()=>clients.filter(client=>`${client.workspace} ${client.email}`.toLowerCase().includes(query.toLowerCase())),[clients,query]);
  const current=clients.find(client=>client.id===selected);
  function select(client:Client){setSelected(client.id);setDraft(client);setMessage('')}
  async function save(){
    if(!current)return;setSaving(true);setMessage('');
    try{
      const response=await fetch(`/api/admin/clients/${current.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_status:draft.service_status,payment_status:draft.payment_status,plan_name:draft.plan_name,renewal_date:draft.renewal_date||null,payment_reference:draft.payment_reference||'',notes:draft.notes||''})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save changes.');
      await refresh();setMessage(`${current.workspace} updated.`);
    }catch(error){setMessage((error as Error).message)}finally{setSaving(false)}
  }
  return <main className="admin-shell"><header className="admin-top"><Link className="brand" href="/product"><span className="brand-mark">m</span>MileDesk</Link><Link href="/live">Business workspace</Link></header><section className="admin-intro"><div><p className="sample-tag">Platform operations</p><h1>Client accounts</h1><p>Review service access and manually recorded payment details.</p></div><span className="admin-disclosure">Manual records. No payment provider connected.</span></section>
    <section className="admin-stats" aria-label="Client summary"><article><span>Total clients</span><strong>{summary.total}</strong></article><article><span>Active service</span><strong>{summary.active}</strong></article><article><span>Trials</span><strong>{summary.trials}</strong></article><article><span>Unpaid</span><strong>{summary.unpaid}</strong></article><article><span>Paid externally</span><strong>{summary.externallyPaid}</strong></article></section>
    <div className="admin-content"><section className="panel admin-list"><div className="admin-list-head"><h2>Businesses</h2><label>Search clients<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Name or email"/></label></div>{loading?<p role="status">Loading clients…</p>:rows.length?rows.map(client=><button className={`admin-row ${selected===client.id?'selected':''}`} key={client.id} onClick={()=>select(client)}><span><strong>{client.workspace}</strong><small>{client.email}</small></span><span><span className="admin-chip">{client.service_status}</span><small>{client.delivery_count} deliveries</small></span></button>):<p className="empty-state">No clients match this search.</p>}</section>
      <section className="panel admin-detail">{current?<><h2>{current.workspace}</h2><p>{current.email}</p><dl><div><dt>Joined</dt><dd>{new Date(current.created_at).toLocaleDateString('en-IN')}</dd></div><div><dt>Deliveries</dt><dd>{current.delivery_count}</dd></div></dl><label>Service status<select value={draft.service_status} onChange={event=>setDraft({...draft,service_status:event.target.value as Client['service_status']})}><option value="trial">Trial</option><option value="active">Active</option><option value="paused">Paused</option><option value="canceled">Canceled</option></select></label><label>Payment record<select value={draft.payment_status} onChange={event=>setDraft({...draft,payment_status:event.target.value as Client['payment_status']})}><option value="unknown">Unknown</option><option value="unpaid">Unpaid</option><option value="paid_externally">Paid externally</option></select></label><label>Plan name<input value={draft.plan_name||''} maxLength={80} onChange={event=>setDraft({...draft,plan_name:event.target.value})}/></label><label>Renewal date<input type="date" value={draft.renewal_date?.slice(0,10)||''} onChange={event=>setDraft({...draft,renewal_date:event.target.value||null})}/></label><label>External payment reference<input value={draft.payment_reference||''} maxLength={120} onChange={event=>setDraft({...draft,payment_reference:event.target.value})}/></label><label>Internal note<textarea value={draft.notes||''} maxLength={1000} onChange={event=>setDraft({...draft,notes:event.target.value})}/></label><button className="primary-button" disabled={saving} onClick={save}>{saving?'Saving…':'Save client record'}</button><p className="admin-hint">An active service status does not prove payment. Record external payments only with a reference.</p></>:<div className="admin-placeholder"><h2>Choose a business</h2><p>Select a client to review service and payment details.</p></div>}</section></div>{message&&<p className="admin-notice" role="status">{message}</p>}</main>;
}
