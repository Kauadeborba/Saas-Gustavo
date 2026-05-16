import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginPage } from '@/components/login-page';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth-session';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (session) {
    redirect('/admin');
  }

  return <LoginPage />;
}
