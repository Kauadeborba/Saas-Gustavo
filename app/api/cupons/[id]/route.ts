import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CupomUpdateInput = {
  codigo?: string;
  descricao?: string;
  percentual_desconto?: number;
  ativo?: boolean;
  data_inicio?: string | null;
  data_fim?: string | null;
  parceiro_id?: string | null;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('cupons')
      .select('*, parceiros(id, nome)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Cupom não encontrado' }, { status: 404 });
      }
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar cupom', detalhe: error.message },
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
    const body = (await request.json()) as CupomUpdateInput;

    if (
      body.percentual_desconto !== undefined &&
      (body.percentual_desconto < 1 || body.percentual_desconto > 100)
    ) {
      return NextResponse.json(
        { sucesso: false, erro: 'Percentual de desconto inválido', detalhe: 'O percentual deve ser entre 1 e 100.' },
        { status: 400 }
      );
    }

    const rawPayload: Record<string, unknown> = {
      codigo: body.codigo?.toUpperCase().trim(),
      descricao: body.descricao,
      percentual_desconto: body.percentual_desconto,
      ativo: body.ativo,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      parceiro_id: body.parceiro_id,
    };

    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('cupons')
      .update(payload)
      .eq('id', id)
      .select('*, parceiros(id, nome)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Cupom não encontrado' }, { status: 404 });
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { sucesso: false, erro: 'Código de cupom já existe', detalhe: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar cupom', detalhe: error.message },
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

    const { error } = await supabase.from('cupons').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover cupom', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, mensagem: 'Cupom removido com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
