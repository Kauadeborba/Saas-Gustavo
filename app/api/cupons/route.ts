import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type CupomInput = {
  codigo?: string;
  descricao?: string;
  percentual_desconto?: number;
  ativo?: boolean;
  data_inicio?: string | null;
  data_fim?: string | null;
  parceiro_id?: string | null;
};

// GET: lista cupons (com dados do parceiro)
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('cupons')
      .select('*, parceiros(id, nome)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar cupons', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: cria cupom
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as CupomInput;

    if (!body.codigo) {
      return NextResponse.json(
        { sucesso: false, erro: 'Campo obrigatório ausente', detalhe: 'Envie codigo.' },
        { status: 400 }
      );
    }

    if (
      body.percentual_desconto === undefined ||
      body.percentual_desconto < 1 ||
      body.percentual_desconto > 100
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Percentual de desconto inválido',
          detalhe: 'O percentual deve ser entre 1 e 100.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cupons')
      .insert({
        codigo: body.codigo.toUpperCase().trim(),
        descricao: body.descricao ?? null,
        percentual_desconto: body.percentual_desconto,
        ativo: body.ativo ?? true,
        data_inicio: body.data_inicio ?? null,
        data_fim: body.data_fim ?? null,
        parceiro_id: body.parceiro_id ?? null,
      })
      .select('*, parceiros(id, nome)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { sucesso: false, erro: 'Código de cupom já existe', detalhe: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar cupom', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 201 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
