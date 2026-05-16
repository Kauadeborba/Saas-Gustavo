import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StoreProvider } from '@/lib/store-context';
import AdminPage from '@/components/admin-page';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth-session';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  // Sem sessão: ir para login
  if (!session) {
    redirect('/login');
  }

  // Sessão existe, mas tipo não é admin: ir para acesso negado
  if (session.tipo !== 'admin') {
    redirect('/admin/acesso-negado');
  }

  return (
    <StoreProvider>
      <AdminPage currentUser={session} />
    </StoreProvider>
  );
}
