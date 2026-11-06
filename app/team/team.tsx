'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Member = { id: string; email: string; role: 'owner' | 'dispatcher'; joined_at: string };
export default function Team() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [invite, setInvite] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const response = await fetch('/api/team', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setMembers(data.members);
  }, []);
  useEffect(() => {
    let active = true;
    fetch('/api/team', { cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (active) setMembers(data.members);
    }).catch(error => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setInvite('');
    try {
      const response = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInvite(data.invite_url); setEmail(''); setMessage('Invitation link created. Share it privately with the invited dispatcher. It expires in 48 hours.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  async function remove(member: Member) {
    if (!window.confirm(`Remove ${member.email} from this workspace?`)) return;
    setMessage('');
    try {
      const response = await fetch(`/api/team/${member.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await refresh(); setMessage(`${member.email} removed.`);
    } catch (error) { setMessage((error as Error).message); }
  }
  return <main className="team-shell"><header className="team-header"><Link href="/live" className="brand"><span className="brand-mark">m</span>MileDesk</Link><Link href="/live">Back to deliveries</Link></header>
    <div className="team-heading"><p className="sample-tag">Workspace settings</p><h1>Team access</h1><p>Give each dispatcher a separate sign in to work in the same delivery queue.</p></div>
    <div className="team-grid"><section className="panel team-panel"><h2>Invite a dispatcher</h2><p>Create a one-use link for the intended email. Share it privately with that person.</p><form onSubmit={send}><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email"/></label><button className="primary-button" disabled={busy}>{busy ? 'Creating…' : 'Create invite link'}</button></form>{invite && <div className="team-invite"><label>Private invite link<input readOnly value={invite} onFocus={event => event.currentTarget.select()}/></label><button className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(invite); setMessage('Link copied.'); } catch { setMessage('Copy the link from the field above.'); } }}>Copy link</button></div>}</section>
    <section className="panel team-panel"><h2>Members</h2>{loading ? <p role="status">Loading team…</p> : members.length ? <ul className="team-list">{members.map(member => <li key={member.id}><div><strong>{member.email}</strong><span>{member.role === 'owner' ? 'Owner' : 'Dispatcher'} · Joined {new Date(member.joined_at).toLocaleDateString('en-IN')}</span></div>{member.role === 'dispatcher' && <button className="team-remove" onClick={() => remove(member)}>Remove</button>}</li>)}</ul> : <p>No members found.</p>}</section></div>{message && <p className="team-message" role="status">{message}</p>}</main>;
}
