import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type ParceiroInput = {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
};

// GET: lista parceiros
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar parceiros', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: cria parceiro
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as ParceiroInput;

    if (!body.nome) {
      return NextResponse.json(
        { sucesso: false, erro: 'Campo obrigatório ausente', detalhe: 'Envie nome.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('parceiros')
      .insert({
        nome: body.nome,
        descricao: body.descricao ?? null,
        ativo: body.ativo ?? true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar parceiro', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 201 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
