import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obter secrets do Supabase
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    
    if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
      throw new Error('Variáveis de ambiente não configuradas')
    }
    
    // Criar cliente Supabase com service role (bypass RLS)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Obter dados do webhook
    const bodyText = await req.text()
    const webhookData = JSON.parse(bodyText)
    
    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2))

    // Verificar tipo de notificação
    const type = webhookData.type
    const data = webhookData.data

    if (type === 'payment') {
      // Processar notificação de pagamento
      const paymentId = data.id.toString()
      const status = data.status // 'approved', 'rejected', 'pending', 'refunded'
      const externalReference = data.external_reference // ID da transação no nosso sistema

      console.log(`Pagamento ${paymentId} - Status: ${status} - External Ref: ${externalReference}`)

      // Buscar transação pelo mp_payment_id ou external_reference
      let transaction = null
      
      if (externalReference) {
        const { data: tx, error: findError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', externalReference)
          .single()

        if (!findError) {
          transaction = tx
        }
      }

      // Se não encontrou por external_reference, tenta por mp_payment_id
      if (!transaction) {
        const { data: tx, error: findError } = await supabase
          .from('transactions')
          .select('*')
          .eq('mp_payment_id', paymentId)
          .single()

        if (findError && findError.code !== 'PGRST116') {
          console.error('Erro ao buscar transação:', findError)
          return new Response(
            JSON.stringify({ error: 'Erro ao buscar transação' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        transaction = tx
      }

      if (!transaction) {
        console.log(`Transação não encontrada para payment_id: ${paymentId}, external_ref: ${externalReference}`)
        return new Response(
          JSON.stringify({ message: 'Transação não encontrada' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Mapear status do Mercado Pago para nosso sistema
      let transactionStatus: 'PAID' | 'PENDING' | 'REFUNDED' = 'PENDING'
      
      if (status === 'approved') {
        transactionStatus = 'PAID'
      } else if (status === 'refunded' || status === 'cancelled') {
        transactionStatus = 'REFUNDED'
      } else {
        transactionStatus = 'PENDING'
      }

      // Atualizar transação no banco
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: transactionStatus,
          mp_payment_id: paymentId,
          mp_transaction_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('Erro ao atualizar transação:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar transação', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Se o pagamento foi aprovado, garantir que o estoque seja atualizado
      if (status === 'approved' && transaction.status !== 'PAID') {
        // O trigger update_product_stock já faz isso automaticamente quando status muda para PAID
        // Mas podemos chamar a função process_payment para garantir
        const { error: processError } = await supabase.rpc('process_payment', {
          p_transaction_id: transaction.id,
          p_mp_payment_id: paymentId,
          p_mp_transaction_id: paymentId
        })

        if (processError) {
          console.error('Erro ao processar pagamento:', processError)
          // Não retornar erro, pois a transação já foi atualizada
        }
      }

      console.log(`Transação ${transaction.id} atualizada para status: ${transactionStatus}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          transaction_id: transaction.id,
          status: transactionStatus,
          payment_id: paymentId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Outros tipos de notificação (subscription, etc.)
    console.log(`Tipo de notificação não processado: ${type}`)
    
    return new Response(
      JSON.stringify({ message: 'Tipo de notificação não processado', type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
