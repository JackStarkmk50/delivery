import { redirect } from 'next/navigation';
import { account } from '@/lib/session';
import Team from './team';
import './team.css';

export const metadata = { title: 'MileDesk | Team' };
export default async function Page() {
  const user = await account();
  if (user?.role !== 'owner') redirect('/live');
  return <Team/>;
}
