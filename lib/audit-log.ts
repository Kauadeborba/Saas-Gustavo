import { createSupabaseServerClient } from '@/lib/supabase';

type LogActionInput = {
	usuarioId?: string;
	produtoId?: string;
	acao: string;
};

// Registra ação no banco sem quebrar o fluxo principal se o log falhar.
export async function logAction({ usuarioId, produtoId, acao }: LogActionInput) {
	try {
		const supabase = await createSupabaseServerClient();

		await supabase.from('logs_acoes').insert({
			usuario_id: usuarioId ?? null,
			produto_id: produtoId ?? null,
			acao,
			data: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Falha ao registrar log de ação:', error);
	}
}