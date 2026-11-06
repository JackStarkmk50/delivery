import Link from 'next/link';
import PasswordRequest from './request';
import '../team/team.css';

export const metadata = { title: 'MileDesk | Reset password' };
export default function Page() {
  return <main className="team-shell"><header className="team-header"><Link href="/" className="brand"><span className="brand-mark">m</span>MileDesk</Link><Link href="/live">Sign in</Link></header><PasswordRequest/></main>;
}
