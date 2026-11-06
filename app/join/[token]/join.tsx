'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Join({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: data.get('password') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace('/live');
    } catch (error) { setMessage((error as Error).message); setBusy(false); }
  }
  return <main className="team-shell"><header className="team-header"><Link href="/" className="brand"><span className="brand-mark">m</span>MileDesk</Link></header><section className="panel team-panel" style={{ maxWidth: 460, margin: '72px auto' }}><h1>Join your team</h1><p>Create a password for your dispatcher account. Use the email address your owner invited.</p><form onSubmit={submit}><label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary-button" disabled={busy}>{busy ? 'Joining…' : 'Join workspace'}</button></form>{message && <p role="alert">{message}</p>}</section></main>;
}
