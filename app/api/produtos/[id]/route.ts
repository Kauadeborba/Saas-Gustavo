// API de Produto Específico - item único
//
// Esta rota lida com um produto por ID:
// - GET    /api/produtos/[id] -> busca 1 produto
// - PATCH  /api/produtos/[id] -> atualização parcial
// - DELETE /api/produtos/[id] -> remove produto

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-session';
import { logAction } from '@/lib/audit-log';
import { createSupabaseServerClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProdutoUpdateInput = {
  // Formato novo (banco)
  nome?: string;
  descricao?: string;
  especificacoes?: string;
  categoria_id?: string | null;
  marca_id?: string | null;
  modelo?: string;
  preco?: number;
  preco_custo?: number;
  condicao?: 'novo' | 'usado' | 'recondicionado';
  status?: 'disponivel' | 'reservado' | 'vendido' | 'sem_estoque';
  quantidade?: number;
  publicado?: boolean;
  observacoes_internas?: string;
  imagem_url?: string;
  // Formato antigo/frontend (compatibilidade)
  name?: string;
  description?: string;
  specifications?: string;
  category?: string;
  brand?: string;
  model?: string;
  price?: number;
  costPrice?: number;
  quantity?: number;
  isPublished?: boolean;
  internalNotes?: string;
  imageUrl?: string;
};

async function resolveOrCreateCategoryIdByName(name: string) {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('categorias')
    .select('id')
    .eq('nome', name)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: created, error } = await supabase
    .from('categorias')
    .insert({ nome: name })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Falha ao criar categoria: ${error.message}`);
  }

  return created.id as string;
}

async function resolveOrCreateBrandIdByName(name: string) {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('marcas')
    .select('id')
    .eq('marca', name)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: created, error } = await supabase
    .from('marcas')
    .insert({ marca: name })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Falha ao criar marca: ${error.message}`);
  }

  return created.id as string;
}

// GET: Retorna um produto pelo ID
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Produto não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao buscar produto', detalhe: error.message },
        { status: 500 }
      );
    }

    const [categoriaResult, marcaResult] = await Promise.all([
      data.categoria_id
        ? supabase.from('categorias').select('nome').eq('id', data.categoria_id).maybeSingle()
        : Promise.resolve({ data: null as { nome?: string } | null }),
      data.marca_id
        ? supabase.from('marcas').select('nome').eq('id', data.marca_id).maybeSingle()
        : Promise.resolve({ data: null as { nome?: string } | null }),
    ]);

    const currentSession = await getCurrentSession();

    await logAction({
      usuarioId: currentSession?.id,
      produtoId: data.id,
      acao: 'produto_atualizado',
    });

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          ...data,
          category: categoriaResult.data?.nome ?? 'Sem categoria',
          brand: marcaResult.data?.marca ?? 'Sem marca',
        },
      },
      { status: 200 }
    );
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PATCH: Atualiza parcialmente um produto pelo ID
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const body = (await request.json()) as ProdutoUpdateInput;

    const categoriaId =
      body.categoria_id !== undefined
        ? body.categoria_id
        : body.category
          ? await resolveOrCreateCategoryIdByName(body.category)
          : undefined;

    const marcaId =
      body.marca_id !== undefined
        ? body.marca_id
        : body.brand
          ? await resolveOrCreateBrandIdByName(body.brand)
          : undefined;

    const payload = {
      name: body.nome ?? body.name,
      descricao: body.descricao ?? body.description,
      especificacoes: body.especificacoes ?? body.specifications,
      categoria_id: categoriaId,
      marca_id: marcaId,
      modelo: body.modelo ?? body.model,
      preco: body.preco ?? body.price,
      preco_custo: body.preco_custo ?? body.costPrice,
      condicao: body.condicao,
      status: body.status,
      quantidade: body.quantidade ?? body.quantity,
      publicado: body.publicado ?? body.isPublished,
      observacoes_internas: body.observacoes_internas ?? body.internalNotes,
      imagem_url: body.imagem_url ?? body.imageUrl,
    };

    const payloadLimpo = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('produtos')
      .update(payloadLimpo)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ sucesso: false, erro: 'Produto não encontrado' }, { status: 404 });
      }

      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao atualizar produto', detalhe: error.message },
        { status: 500 }
      );
    }

    const [categoriaResult, marcaResult] = await Promise.all([
      data.categoria_id
        ? supabase.from('categorias').select('nome').eq('id', data.categoria_id).maybeSingle()
        : Promise.resolve({ data: null as { nome?: string } | null }),
      data.marca_id
        ? supabase.from('marcas').select('marca').eq('id', data.marca_id).maybeSingle()
        : Promise.resolve({ data: null as { marca?: string } | null }),
    ]);

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          ...data,
          category: categoriaResult.data?.nome ?? 'Sem categoria',
          brand: marcaResult.data?.marca ?? 'Sem marca',
        },
      },
      { status: 200 }
    );
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PUT: atualização total reaproveitando a lógica do PATCH.
export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}

// DELETE: Remove um produto pelo ID
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await context.params;
    const currentSession = await getCurrentSession();

    const { error } = await supabase.from('produtos').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao remover produto', detalhe: error.message },
        { status: 500 }
      );
    }

    await logAction({
      usuarioId: currentSession?.id,
      produtoId: id,
      acao: 'produto_removido',
    });

    return NextResponse.json({ sucesso: true, mensagem: 'Produto removido com sucesso' }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
