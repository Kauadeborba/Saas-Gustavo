// API de Autenticação (login)
//
// Faz login consultando a tabela usuarios.
// A senha é validada com hash (sem texto puro).

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { verifyPassword } from '@/lib/security';
import { AUTH_COOKIE_NAME, createSessionToken } from '@/lib/auth-session';
import { logAction } from '@/lib/audit-log';

// POST: Login
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { email, senha } = (await request.json()) as { email?: string; senha?: string };

    if (!email || !senha) {
      return NextResponse.json(
        { sucesso: false, erro: 'Campos obrigatórios inválidos', detalhe: 'Envie email e senha.' },
        { status: 400 }
      );
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, senha_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao consultar usuário', detalhe: error.message },
        { status: 500 }
      );
    }

    if (!usuario || !verifyPassword(senha, usuario.senha_hash)) {
      return NextResponse.json({ sucesso: false, erro: 'Credenciais inválidas' }, { status: 401 });
    }

    // Token/sessão ainda simplificado para não quebrar seu fluxo atual.
    // Próximo passo pode ser usar JWT assinado ou Supabase Auth completo.
    const token = createSessionToken({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    });

    const response = NextResponse.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAction({
      usuarioId: usuario.id,
      acao: `login:${usuario.tipo}`,
    });

    return response;
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

