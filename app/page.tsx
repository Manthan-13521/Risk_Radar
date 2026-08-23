export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export default async function RootPage() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
