import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MarcaUpdateInput = {
  nome?: string;
};

// GET: busca marca por ID
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Marca não encontrada' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar marca', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PATCH: atualiza parcialmente marca
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as MarcaUpdateInput;

    const payload = Object.fromEntries(
      Object.entries({ nome: body.nome }).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('marcas')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Marca não encontrada' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar marca', detalhe: error.message },
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

// DELETE: remove marca
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { error } = await supabase.from('marcas').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover marca', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Marca removida com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
