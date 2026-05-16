// API de Usuário Específico - item único
//
// Esta rota lida com um usuário por ID:
// - GET    /api/usuarios/[id] -> busca 1 usuário
// - PATCH  /api/usuarios/[id] -> atualização parcial
// - DELETE /api/usuarios/[id] -> remove usuário

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-session';
import { logAction } from '@/lib/audit-log';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/security';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UsuarioUpdateInput = {
  nome?: string;
  email?: string;
  senha?: string;
  senha_hash?: string;
  tipo?: 'admin' | 'operador';
};

// GET: Retorna um usuário pelo ID
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Usuário não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar usuário', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PATCH: Atualiza parcialmente um usuário pelo ID
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as UsuarioUpdateInput;

    const payload = {
      nome: body.nome,
      email: body.email,
      senha_hash: body.senha ? hashPassword(body.senha) : body.senha_hash,
      tipo: body.tipo,
    };

    const payloadLimpo = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('usuarios')
      .update(payloadLimpo)
      .eq('id', id)
      .select('id, nome, email, tipo')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Usuário não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar usuário', detalhe: error.message },
        { status: 500 }
      );
    }

    const currentSession = await getCurrentSession();

    await logAction({
      usuarioId: currentSession?.id,
      acao: `usuario_atualizado:${data.id}`,
    });

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PUT: atualização total reaproveitando lógica do PATCH.
export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}

// DELETE: Remove um usuário pelo ID
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const currentSession = await getCurrentSession();

    const { error } = await supabase.from('usuarios').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover usuário', detalhe: error.message },
        { status: 500 }
      );
    }

    await logAction({
      usuarioId: currentSession?.id,
      acao: `usuario_removido:${id}`,
    });

    return NextResponse.json({ sucesso: true, mensagem: 'Usuário removido com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
