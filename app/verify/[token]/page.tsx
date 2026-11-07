import Link from 'next/link';
import ConfirmVerification from './confirm';
import '../../team/team.css';

export const metadata = { title: 'MileDesk | Confirm email', referrer: 'no-referrer' };
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <main className="team-shell"><header className="team-header"><Link href="/" className="brand"><span className="brand-mark">m</span>MileDesk</Link></header><ConfirmVerification token={token}/></main>;
}
