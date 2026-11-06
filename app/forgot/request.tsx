'use client';
import { FormEvent, useState } from 'react';

export default function PasswordRequest() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/password/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('If this email has an account, a reset link is on its way. Check your inbox.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="panel team-panel" style={{ maxWidth: 460, margin: '72px auto' }}><h1>Reset your password</h1><p>Enter the email address you use for MileDesk. The link expires in 30 minutes.</p><form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" required/></label><button className="primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form>{message && <p role="status">{message}</p>}</section>;
}
