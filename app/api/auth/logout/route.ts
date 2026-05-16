import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-session';

// POST: encerra a sessão removendo o cookie HTTP-only.
export async function POST() {
  const response = NextResponse.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' }, { status: 200 });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
