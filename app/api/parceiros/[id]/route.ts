import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ParceiroUpdateInput = {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Parceiro não encontrado' }, { status: 404 });
      }
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar parceiro', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as ParceiroUpdateInput;

    const payload = Object.fromEntries(
      Object.entries({ nome: body.nome, descricao: body.descricao, ativo: body.ativo }).filter(
        ([, value]) => value !== undefined
      )
    );

    const { data, error } = await supabase
      .from('parceiros')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Parceiro não encontrado' }, { status: 404 });
      }
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar parceiro', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { error } = await supabase.from('parceiros').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover parceiro', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Parceiro removido com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
