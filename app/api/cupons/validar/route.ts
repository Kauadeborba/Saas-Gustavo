import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

// POST /api/cupons/validar
// Body: { codigo: string }
// Returns: cupom data with validation status
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as { codigo?: string };

    if (!body.codigo) {
      return NextResponse.json(
        { sucesso: false, erro: 'Código do cupom não informado' },
        { status: 400 }
      );
    }

    const codigo = body.codigo.toUpperCase().trim();

    const { data, error } = await supabase
      .from('cupons')
      .select('*, parceiros(id, nome)')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { sucesso: false, erro: 'Erro ao verificar cupom', detalhe: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { sucesso: false, erro: 'Cupom não encontrado', codigo: 'CUPOM_NAO_ENCONTRADO' },
        { status: 404 }
      );
    }

    if (!data.ativo) {
      return NextResponse.json(
        { sucesso: false, erro: 'Este cupom está inativo', codigo: 'CUPOM_INATIVO' },
        { status: 422 }
      );
    }

    const agora = new Date();

    if (data.data_inicio) {
      const inicio = new Date(data.data_inicio as string);
      if (agora < inicio) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: 'Este cupom ainda não está disponível',
            codigo: 'CUPOM_NAO_INICIADO',
            data_inicio: data.data_inicio,
          },
          { status: 422 }
        );
      }
    }

    if (data.data_fim) {
      const fim = new Date(data.data_fim as string);
      // Set fim to end of that day
      fim.setHours(23, 59, 59, 999);
      if (agora > fim) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: 'Este cupom está expirado',
            codigo: 'CUPOM_EXPIRADO',
            data_fim: data.data_fim,
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ sucesso: true, dados: data }, { status: 200 });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ sucesso: false, erro: mensagem }, { status: 500 });
  }
}
