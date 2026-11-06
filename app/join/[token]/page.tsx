import Join from './join';
import '../../team/team.css';

export const metadata = { title: 'MileDesk | Join team', referrer: 'no-referrer' };
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <Join token={token}/>;
}
