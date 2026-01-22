/**
 * Cliente Supabase para o frontend
 * 
 * Este arquivo inicializa o cliente Supabase com as variáveis de ambiente
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Acessar variáveis de ambiente do Vite
const getEnvVar = (key: string): string => {
  const env = (import.meta as any).env;
  return env?.[key] || '';
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Obtém ou cria o cliente Supabase
 * Inicialização lazy para evitar erros se variáveis não estiverem configuradas
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
  const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

  // Validar se as variáveis estão configuradas
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const errorMsg = `
⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!

Por favor, configure no arquivo .env:
- VITE_SUPABASE_URL=https://seu-projeto.supabase.co
- VITE_SUPABASE_ANON_KEY=sua_chave_anon

Ou no Vercel (Environment Variables):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Após configurar, reinicie o servidor de desenvolvimento.
`;
    console.error(errorMsg);
    throw new Error('Supabase environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file and restart the dev server.');
  }

  // Criar cliente Supabase
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Cliente Supabase inicializado:', SUPABASE_URL);
  
  return supabaseInstance;
}

// Exportar instância para compatibilidade
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  }
});
