'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function PasswordReset({ token }: { token: string }) {
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/password/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: data.get('password') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDone(true); setMessage('Password updated. Sign in with your new password.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="panel team-panel" style={{ maxWidth: 460, margin: '72px auto' }}><h1>Choose a new password</h1>{!done && <form onSubmit={submit}><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button></form>}{message && <p role="status">{message}</p>}{done && <Link href="/live">Return to sign in</Link>}</section>;
}
