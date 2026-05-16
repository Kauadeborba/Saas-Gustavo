import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CategoriaUpdateInput = {
  nome?: string;
};

// GET: busca categoria por ID
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Categoria não encontrada' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar categoria', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PATCH: atualiza parcialmente categoria
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as CategoriaUpdateInput;

    const payload = Object.fromEntries(
      Object.entries({ nome: body.nome }).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('categorias')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Categoria não encontrada' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar categoria', detalhe: error.message },
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

// DELETE: remove categoria
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { error } = await supabase.from('categorias').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover categoria', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Categoria removida com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
