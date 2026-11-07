'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ConfirmVerification({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  async function confirm() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/verification/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDone(true); setMessage('Email verified. You can sign in to the app now.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="panel team-panel" style={{ maxWidth: 460, margin: '72px auto' }}><h1>Confirm your email</h1><p>Verification is required before this account can sign in.</p>{!done && <button className="primary-button" disabled={busy} onClick={confirm}>{busy ? 'Verifying…' : 'Verify email'}</button>}{message && <p role="status">{message}</p>}{done && <Link href="/live">Open web workspace</Link>}{!done && <p><Link href="/verify">Request another link</Link></p>}</section>;
}
