import Link from 'next/link';
import PasswordReset from './reset';
import '../../team/team.css';

export const metadata = { title: 'MileDesk | New password', referrer: 'no-referrer' };
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <main className="team-shell"><header className="team-header"><Link href="/" className="brand"><span className="brand-mark">m</span>MileDesk</Link></header><PasswordReset token={token}/></main>;
}
