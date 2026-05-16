import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type CategoriaInput = {
  nome?: string;
};

// GET: lista categorias
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar categorias', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: cria categoria
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as CategoriaInput;

    if (!body.nome) {
      return NextResponse.json(
        { sucesso: false, erro: 'Campos obrigatórios inválidos', detalhe: 'Envie nome.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome: body.nome })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar categoria', detalhe: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 201 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
