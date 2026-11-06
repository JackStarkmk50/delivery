import { redirect } from 'next/navigation';
import { account } from '@/lib/session';
import AdminDashboard from './workspace';
import './admin.css';
export const metadata = { title: 'MileDesk | Platform operations' };
export default async function Page() {
  const user = await account();
  if (!user?.is_platform_admin) redirect('/live');
  return <AdminDashboard/>;
}
