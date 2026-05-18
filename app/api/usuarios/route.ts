// API de Usuários - CRUD (coleção)
//
// Esta rota lida com a coleção de usuários:
// - GET  /api/usuarios -> lista usuários
// - POST /api/usuarios -> cria usuário

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-session';
import { logAction } from '@/lib/audit-log';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/security';

type UsuarioInput = {
  nome?: string;
  email?: string;
  senha?: string;
  senha_hash?: string;
  tipo?: 'admin' | 'operador';
};

// GET: Lista todos os usuários
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo')
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar usuários', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: Cria um novo usuário
export async function POST(request: NextRequest) {
  try {
    // Use a service role key (admin) que ignora RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = (await request.json()) as UsuarioInput;

    const senhaHash = body.senha ? hashPassword(body.senha) : body.senha_hash;

    if (!body.nome || !body.email || !senhaHash) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Campos obrigatórios inválidos',
          detalhe: 'Envie nome, email e senha (ou senha_hash).',
        },
        { status: 400 }
      );
    }

    const novoUsuario = {
      nome: body.nome,
      email: body.email,
      senha_hash: senhaHash,
      tipo: body.tipo ?? 'operador',
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert(novoUsuario)
      .select('id, nome, email, tipo')
      .single();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar usuário', detalhe: error.message },
        { status: 500 }
      );
    }

    const currentSession = await getCurrentSession();

    await logAction({
      usuarioId: currentSession?.id,
      acao: `usuario_criado:${data.id}`,
    });

    return NextResponse.json({ sucesso: true, dados: data }, { status: 201 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PUT/PATCH/DELETE ficam em /api/usuarios/[id]
