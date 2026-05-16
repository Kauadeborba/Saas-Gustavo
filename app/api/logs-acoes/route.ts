import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type LogAcaoInput = {
  usuario_id?: string | null;
  produto_id?: string | null;
  acao?: string;
  data?: string;
};

// GET: lista logs de ações (mais recentes primeiro)
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('logs_acoes')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar logs', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: registra nova ação
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as LogAcaoInput;

    if (!body.acao) {
      return NextResponse.json(
        { sucesso: false, erro: 'Campos obrigatórios inválidos', detalhe: 'Envie acao.' },
        { status: 400 }
      );
    }

    const novoLog = {
      usuario_id: body.usuario_id ?? null,
      produto_id: body.produto_id ?? null,
      acao: body.acao,
      data: body.data ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('logs_acoes')
      .insert(novoLog)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar log', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 201 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
