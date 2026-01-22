/**
 * Serviço para criar pagamentos no Mercado Pago
 * 
 * Este serviço gerencia a criação de pagamentos e integração com a API do Mercado Pago
 */

const MP_API_BASE_URL = 'https://api.mercadopago.com/v1';

// Acessar variáveis de ambiente do Vite
// Usando type assertion para evitar erros de TypeScript
const getEnvVar = (key: string): string => {
  const env = (import.meta as any).env;
  return env?.[key] || '';
};

const MP_CLIENT_ID = getEnvVar('VITE_MP_CLIENT_ID');
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

export interface CreatePaymentParams {
  transactionId: string;
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: 'pix' | 'credit_card';
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

/**
 * Cria um pagamento no Mercado Pago
 * Em produção, isso deve ser feito via Edge Function para proteger o access_token
 */
export async function createMercadoPagoPayment(
  businessId: string,
  params: CreatePaymentParams
): Promise<PaymentResponse> {
  try {
    // Obter tokens do business
    const tokens = getMercadoPagoTokens(businessId);
    
    if (!tokens) {
      throw new Error('Business não está conectado ao Mercado Pago');
    }

    // Obter URL da Edge Function para webhook
    const webhookUrl = `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;

    // Preparar dados do pagamento
    const paymentData: any = {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: params.paymentMethod === 'pix' ? 'pix' : 'credit_card',
      payer: {
        email: params.customerEmail,
        name: params.customerName
      },
      external_reference: params.transactionId, // ID da transação no nosso sistema
      notification_url: webhookUrl,
      items: params.items
    };

    // Se for PIX, adicionar configurações específicas
    if (params.paymentMethod === 'pix') {
      paymentData.payment_method_id = 'pix';
    }

    // Fazer requisição para criar pagamento
    // NOTA: Em produção, isso deve ser feito via Edge Function
    // para proteger o access_token
    const response = await fetch(`${MP_API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar pagamento:', errorData);
      throw new Error(`Erro ao criar pagamento: ${errorData.message || 'Erro desconhecido'}`);
    }

    const payment: PaymentResponse = await response.json();
    
    return payment;
  } catch (error) {
    console.error('Erro ao criar pagamento no Mercado Pago:', error);
    throw error;
  }
}

/**
 * Obtém os tokens do Mercado Pago para um business
 */
function getMercadoPagoTokens(businessId: string): { accessToken: string; refreshToken: string } | null {
  // Por enquanto, busca do localStorage
  // Em produção, deve buscar do Supabase
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

/**
 * Salva o ID do pagamento na transação
 */
export async function updateTransactionWithPaymentId(
  transactionId: string,
  paymentId: string
): Promise<void> {
  try {
    // Importar e obter cliente Supabase
    const { getSupabaseClient } = await import('./supabaseClient');
    const supabase = getSupabaseClient();
    
    // Atualizar transação com o payment_id
    const { error } = await supabase
      .from('transactions')
      .update({ 
        mp_payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }

    console.log(`✅ Transação ${transactionId} atualizada com payment_id ${paymentId}`);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    // Não relançar o erro se for problema de configuração
    if (error instanceof Error && error.message.includes('not configured')) {
      console.warn('⚠️ Supabase não configurado. Transação não foi atualizada no banco.');
      return;
    }
    throw error;
  }
}
