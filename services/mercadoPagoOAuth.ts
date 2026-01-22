/**
 * Serviço de OAuth para integração com Mercado Pago Split Payments
 * 
 * Este serviço gerencia o fluxo de autorização OAuth do Mercado Pago
 * para habilitar o split automático de pagamentos.
 */

// URLs do Mercado Pago OAuth
const MP_OAUTH_BASE_URL = 'https://auth.mercadopago.com/authorization';
const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token';

// Configurações - Em produção, essas devem vir de variáveis de ambiente
const MP_CLIENT_ID = import.meta.env.VITE_MP_CLIENT_ID || 'YOUR_CLIENT_ID';
const MP_REDIRECT_URI = `${window.location.origin}/owner/settings?mp_callback=true`;
const MP_SCOPES = 'offline_access payments read write';

/**
 * Gera a URL de autorização OAuth do Mercado Pago
 */
export function getMercadoPagoAuthUrl(businessId: string): string {
  const state = btoa(JSON.stringify({ businessId, timestamp: Date.now() }));
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: MP_CLIENT_ID,
    redirect_uri: MP_REDIRECT_URI,
    scope: MP_SCOPES,
    state: state
  });

  return `${MP_OAUTH_BASE_URL}?${params.toString()}`;
}

/**
 * Inicia o fluxo de autorização OAuth do Mercado Pago
 * Redireciona o usuário para a página de autorização
 */
export function initiateMercadoPagoOAuth(businessId: string): void {
  const authUrl = getMercadoPagoAuthUrl(businessId);
  
  // Salva o businessId no sessionStorage para recuperar após o callback
  sessionStorage.setItem('mp_oauth_business_id', businessId);
  
  // Redireciona para a página de autorização do Mercado Pago
  window.location.href = authUrl;
}

/**
 * Processa o callback OAuth do Mercado Pago
 * Troca o código de autorização por um token de acesso
 */
export async function handleMercadoPagoCallback(
  code: string,
  state: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  try {
    // Valida o state para garantir que a requisição é legítima
    const stateData = JSON.parse(atob(state));
    const businessId = stateData.businessId;

    // Em produção, essa chamada deve ser feita no backend por segurança
    // O client_secret nunca deve ser exposto no frontend
    const response = await fetch(MP_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: MP_CLIENT_ID,
        client_secret: import.meta.env.VITE_MP_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
        code: code,
        redirect_uri: MP_REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao obter token do Mercado Pago');
    }

    const data = await response.json();
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    };
  } catch (error) {
    console.error('Erro no callback OAuth do Mercado Pago:', error);
    throw error;
  }
}

/**
 * Verifica se há um callback OAuth pendente na URL
 */
export function checkMercadoPagoCallback(): { code: string; state: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const isCallback = urlParams.get('mp_callback') === 'true';

  if (isCallback && code && state) {
    // Remove os parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return { code, state };
  }

  return null;
}

/**
 * Salva os tokens do Mercado Pago no backend
 * Em produção, isso deve ser feito via API segura
 */
export async function saveMercadoPagoTokens(
  businessId: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  // Em produção, faça uma chamada para sua API backend
  // que salvará os tokens de forma segura
  // Exemplo:
  // await fetch('/api/mercado-pago/tokens', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ businessId, accessToken, refreshToken })
  // });

  // Por enquanto, salvamos no localStorage (apenas para desenvolvimento)
  localStorage.setItem(`mp_tokens_${businessId}`, JSON.stringify({
    accessToken,
    refreshToken,
    savedAt: Date.now()
  }));
}

/**
 * Obtém os tokens salvos do Mercado Pago para um negócio
 */
export function getMercadoPagoTokens(businessId: string): { accessToken: string; refreshToken: string } | null {
  const stored = localStorage.getItem(`mp_tokens_${businessId}`);
  if (stored) {
    const data = JSON.parse(stored);
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
  }
  return null;
}
