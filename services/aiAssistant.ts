/**
 * Serviço de IA Assistant
 * 
 * IMPORTANTE: Este serviço NÃO usa Gemini diretamente no frontend.
 * Ele chama uma Edge Function do Supabase que processa o Gemini no servidor.
 * Isso evita erros de "API Key must be set" no browser.
 */

const getEnvVar = (key: string): string => {
  const env = (import.meta as any).env;
  return env?.[key] || '';
};

export async function getBusinessAdvice(businessName: string, recentSales: number, role: string) {
  try {
    const prompt = `Você é um consultor especialista para o mercado de beleza e estética. 
    Analise o negócio "${businessName}" que teve ${recentSales} vendas recentemente. 
    Dê 3 dicas práticas para aumentar o faturamento ou fidelizar clientes. Seja breve e encorajador.
    O usuário é um ${role}.`;

    const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
    const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase não configurado. Retornando mensagem padrão.');
      return "Não foi possível carregar as dicas de IA no momento. Continue o excelente trabalho!";
    }

    // Chamar Edge Function do Supabase
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "Não foi possível carregar as dicas de IA no momento. Continue o excelente trabalho!";
  } catch (error) {
    console.error("Erro ao consultar Gemini via Edge Function:", error);
    return "Não foi possível carregar as dicas de IA no momento. Continue o excelente trabalho!";
  }
}
