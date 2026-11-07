'use client';
import { FormEvent, useState } from 'react';

export default function RequestVerification() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/verification/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('If this account needs verification, a link is on its way. Check your inbox.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="panel team-panel" style={{ maxWidth: 460, margin: '72px auto' }}><h1>Verify your email</h1><p>Enter the email address used for your MileDesk account. The link expires in 24 hours.</p><form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" required/></label><button className="primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send verification link'}</button></form>{message && <p role="status">{message}</p>}</section>;
}
