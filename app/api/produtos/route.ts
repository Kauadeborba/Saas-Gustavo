// API de Produtos - CRUD (coleção)
//
// Esta rota lida com a coleção de produtos:
// - GET  /api/produtos     -> lista produtos
// - POST /api/produtos     -> cria produto
//
// Aqui já estamos usando Supabase (dados reais).

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-session';
import { logAction } from '@/lib/audit-log';
import { createSupabaseServerClient } from '@/lib/supabase';

// Tipo básico para entrada de criação.
// Mantivemos opcional para facilitar evolução do formulário.
type ProdutoInput = {
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
    .eq('nome', name)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: created, error } = await supabase
    .from('marcas')
    .insert({ nome: name })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Falha ao criar marca: ${error.message}`);
  }

  return created.id as string;
}

// GET: Lista todos os produtos
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Busca todos os produtos ordenando pelos mais recentes.
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao listar produtos', detalhe: error.message },
        { status: 500 }
      );
    }

    // Resolve os nomes de categoria/marca para manter compatibilidade com o frontend atual.
    const categoryIds = Array.from(new Set((data ?? []).map((p) => p.categoria_id).filter(Boolean)));
    const brandIds = Array.from(new Set((data ?? []).map((p) => p.marca_id).filter(Boolean)));

    const [{ data: categorias }, { data: marcas }] = await Promise.all([
      categoryIds.length
        ? supabase.from('categorias').select('id, nome').in('id', categoryIds)
        : Promise.resolve({ data: [] as Array<{ id: string; nome: string }> }),
      brandIds.length
        ? supabase.from('marcas').select('id, nome').in('id', brandIds)
        : Promise.resolve({ data: [] as Array<{ id: string; nome: string }> }),
    ]);

    const categoriasMap = new Map((categorias ?? []).map((c) => [c.id, c.nome]));
    const marcasMap = new Map((marcas ?? []).map((m) => [m.id, m.nome]));

    const dadosFormatados = (data ?? []).map((p) => ({
      ...p,
      category: p.categoria_id ? categoriasMap.get(p.categoria_id) ?? 'Sem categoria' : 'Sem categoria',
      brand: p.marca_id ? marcasMap.get(p.marca_id) ?? 'Sem marca' : 'Sem marca',
    }));

    return NextResponse.json({ sucesso: true, dados: dadosFormatados }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// POST: Cria um novo produto
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as ProdutoInput;

    // Validação didática mínima para evitar inserts vazios.
    const nome = body.nome ?? body.name;
    const preco = body.preco ?? body.price;
    const categoriaNome = body.category;
    const marcaNome = body.brand;

    if (!nome || typeof preco !== 'number') {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Campos obrigatórios inválidos',
          detalhe: 'Envie ao menos nome (string) e preco (number).',
        },
        { status: 400 }
      );
    }

    // Campos com fallback para defaults amigáveis.
    const categoriaId = body.categoria_id ?? (categoriaNome ? await resolveOrCreateCategoryIdByName(categoriaNome) : null);
    const marcaId = body.marca_id ?? (marcaNome ? await resolveOrCreateBrandIdByName(marcaNome) : null);

    const novoProduto = {
      nome,
      descricao: body.descricao ?? body.description ?? '',
      especificacoes: body.especificacoes ?? body.specifications ?? '',
      categoria_id: categoriaId,
      marca_id: marcaId,
      modelo: body.modelo ?? body.model ?? '',
      preco,
      preco_custo: body.preco_custo ?? body.costPrice ?? 0,
      condicao: body.condicao ?? 'novo',
      status: body.status ?? 'disponivel',
      quantidade: body.quantidade ?? body.quantity ?? 0,
      publicado: body.publicado ?? body.isPublished ?? false,
      observacoes_internas: body.observacoes_internas ?? body.internalNotes ?? '',
      imagem_url: body.imagem_url ?? body.imageUrl ?? '',
    };

    const { data, error } = await supabase
      .from('produtos')
      .insert(novoProduto)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Falha ao criar produto', detalhe: error.message },
        { status: 500 }
      );
    }

    const currentSession = await getCurrentSession();

    await logAction({
      usuarioId: currentSession?.id,
      produtoId: data.id,
      acao: 'produto_criado',
    });

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          ...data,
          category: categoriaNome ?? 'Sem categoria',
          brand: marcaNome ?? 'Sem marca',
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}

// PUT/PATCH/DELETE ficam em /api/produtos/[id]
