// lib/supabase.ts
//
// Este arquivo centraliza a criação dos clientes do Supabase.
// A ideia é ter funções prontas para:
// 1) Browser (componentes client-side)
// 2) Server (Route Handlers / Server Components)
//
// Assim, você evita repetir configuração em vários arquivos.

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Função utilitária: garante que a env existe e já retorna string.
// Isso ajuda muito no TypeScript strict, evitando "string | undefined".
function getRequiredEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Variável de ambiente ausente: ${name}`);
	}
	return value;
}

// Lê as variáveis públicas do ambiente.
// Elas vêm do seu arquivo .env.local.
const rawSupabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabasePublishableKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

// Aceita tanto:
// - https://projeto.supabase.co
// - https://projeto.supabase.co/rest/v1/
// e normaliza para o formato correto da SDK.
function normalizeSupabaseUrl(url: string) {
	return url.replace(/\/rest\/v1\/?$/, '');
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

// Cliente para uso no browser (componentes "use client").
// Exemplo de uso: const supabase = createSupabaseBrowserClient();
export function createSupabaseBrowserClient() {
	return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

// Cliente para uso no server (APIs do Next.js App Router).
// Este cliente usa cookies para manter sessão quando você implementar auth completa.
// Exemplo de uso em route.ts: const supabase = await createSupabaseServerClient();
export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(supabaseUrl, supabasePublishableKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: Record<string, unknown>) {
				cookieStore.set({ name, value, ...(options as object) });
			},
			remove(name: string, options: Record<string, unknown>) {
				cookieStore.set({ name, value: '', ...(options as object), maxAge: 0 });
			},
		},
	});
}

