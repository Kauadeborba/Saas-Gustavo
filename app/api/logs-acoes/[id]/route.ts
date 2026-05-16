import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type LogAcaoUpdateInput = {
  usuario_id?: string | null;
  produto_id?: string | null;
  acao?: string;
  data?: string;
};

// GET: busca log por ID
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('logs_acoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Log não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar log', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PATCH: atualiza parcialmente log
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as LogAcaoUpdateInput;

    const payload = Object.fromEntries(
      Object.entries({
        usuario_id: body.usuario_id,
        produto_id: body.produto_id,
        acao: body.acao,
        data: body.data,
      }).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('logs_acoes')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Log não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar log', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PUT: atualização total reaproveitando lógica do PATCH
export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}

// DELETE: remove log
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { error } = await supabase.from('logs_acoes').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover log', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Log removido com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
