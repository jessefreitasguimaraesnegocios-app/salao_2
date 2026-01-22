# 🔔 Guia de Webhooks - Mercado Pago

Este guia explica como configurar e processar webhooks do Mercado Pago para atualizar automaticamente o status dos pagamentos.

---

## 📋 O que são Webhooks?

Webhooks são notificações que o Mercado Pago envia para sua aplicação quando eventos importantes acontecem, como:
- ✅ Pagamento aprovado
- ❌ Pagamento rejeitado
- 🔄 Pagamento pendente
- 💰 Reembolso processado

---

## 🎯 O que Foi Implementado

### ✅ 1. Edge Function Criada
- **Arquivo**: `supabase/functions/mercado-pago-webhook/index.ts`
- Processa notificações do Mercado Pago
- Atualiza status das transações automaticamente

### ✅ 2. Serviço de Pagamento Criado
- **Arquivo**: `services/mercadoPagoPayment.ts`
- Cria pagamentos no Mercado Pago
- Integra com o sistema de transações

### ✅ 3. Checkout Atualizado
- **Arquivo**: `pages/customer/StoreDetail.tsx`
- Cria transação primeiro (PENDING)
- Depois cria pagamento no Mercado Pago
- Aguarda webhook para atualizar status

---

## 🚀 Passo 1: Deploy da Edge Function

### Opção A: Via Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Deploy da função
supabase functions deploy mercado-pago-webhook
```

### Opção B: Via Dashboard

1. No Supabase Dashboard
2. Vá em **Edge Functions**
3. Clique em **Create a new function**
4. Nome: `mercado-pago-webhook`
5. Cole o código de `supabase/functions/mercado-pago-webhook/index.ts`
6. Clique em **Deploy**

---

## 🔗 Passo 2: Obter URL da Edge Function

Após o deploy, você terá uma URL como:
```
https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
```

**⚠️ IMPORTANTE**: Anote esta URL, você precisará dela no próximo passo!

---

## 🔧 Passo 3: Configurar Webhook no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Suas integrações** > **Suas aplicações**
3. Clique na sua aplicação
4. Vá em **Webhooks** ou **Notificações**
5. Clique em **Adicionar URL de notificação**
6. Cole a URL da Edge Function:
   ```
   https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
   ```
7. Selecione os eventos:
   - ✅ **Pagamentos** (payment)
   - ✅ **Assinaturas** (se usar)
8. Clique em **Salvar**

---

## 🔐 Passo 4: Verificar Secrets no Supabase

Certifique-se de que os seguintes secrets estão configurados:

1. No Supabase Dashboard
2. Vá em **Settings** > **Edge Functions** > **Secrets**
3. Verifique se existem:
   - ✅ `SERVICE_ROLE_KEY`
   - ✅ `MP_CLIENT_ID` (opcional, se precisar)
   - ✅ `MP_CLIENT_SECRET` (opcional, se precisar)

**Nota**: A Edge Function usa `SUPABASE_URL` e `SERVICE_ROLE_KEY` que são fornecidos automaticamente pelo Supabase.

---

## 📊 Fluxo Completo

```
1. Cliente faz checkout
   ↓
2. Cria transação no banco (status: PENDING)
   ↓
3. Cria pagamento no Mercado Pago (com external_reference = transaction.id)
   ↓
4. Cliente paga (PIX, cartão, etc.)
   ↓
5. Mercado Pago envia webhook para Edge Function
   ↓
6. Edge Function recebe webhook
   ↓
7. Busca transação pelo external_reference ou mp_payment_id
   ↓
8. Atualiza transação no banco (status: PAID/PENDING/REFUNDED)
   ↓
9. Trigger atualiza estoque automaticamente (se status = PAID)
```

---

## 🧪 Testando o Webhook

### 1. Teste Manual (Sandbox)

1. Use credenciais de teste do Mercado Pago
2. Faça um pagamento de teste
3. Verifique logs no Supabase Dashboard:
   - **Edge Functions** > **mercado-pago-webhook** > **Logs**

### 2. Verificar Transação

```sql
-- Ver transações recentes
SELECT 
    id,
    customer_name,
    amount,
    status,
    mp_payment_id,
    created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Testar Webhook Manualmente

Você pode simular um webhook usando curl:

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789",
      "status": "approved",
      "external_reference": "transaction-id-aqui"
    }
  }'
```

---

## 🔒 Segurança (Opcional mas Recomendado)

### Validar Assinatura do Webhook

O Mercado Pago envia um header `x-signature` que você pode validar. Para implementar:

1. Adicione `MP_WEBHOOK_SECRET` nos secrets do Supabase
2. Configure o secret no Mercado Pago (nas configurações do webhook)
3. Atualize a Edge Function para validar a assinatura

**Exemplo de validação** (adicionar no início da função):

```typescript
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

function validateWebhookSignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac('sha256', secret)
    .update(data)
    .digest('hex')
  
  return hash === signature
}

// No início da função:
const signature = req.headers.get('x-signature')
if (signature) {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET')
  if (secret && !validateWebhookSignature(bodyText, signature, secret)) {
    return new Response(
      JSON.stringify({ error: 'Assinatura inválida' }),
      { status: 401 }
    )
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Edge Function criada e deployada
- [ ] URL da função obtida
- [ ] Webhook configurado no Mercado Pago
- [ ] Secrets verificados no Supabase
- [ ] Testado com pagamento de teste
- [ ] Logs verificados
- [ ] Transações sendo atualizadas corretamente

---

## 🚨 Troubleshooting

### Webhook não está sendo recebido

1. ✅ Verifique se a URL está correta no Mercado Pago
2. ✅ Verifique logs da Edge Function no Supabase Dashboard
3. ✅ Teste a URL manualmente (deve retornar 200)
4. ✅ Verifique se o webhook está ativo no Mercado Pago

### Transação não está sendo atualizada

1. ✅ Verifique se `external_reference` está sendo enviado ao criar pagamento
2. ✅ Verifique logs da Edge Function
3. ✅ Verifique se o `mp_payment_id` está sendo salvo
4. ✅ Verifique se a transação existe no banco

### Erro de autenticação

1. ✅ Verifique se `SERVICE_ROLE_KEY` está nos secrets
2. ✅ Verifique se a chave está correta
3. ✅ Verifique permissões RLS (service role bypassa RLS)

### Erro "Transação não encontrada"

1. ✅ Verifique se o `external_reference` no pagamento corresponde ao `id` da transação
2. ✅ Verifique se a transação foi criada antes do pagamento
3. ✅ Verifique logs para ver qual `external_reference` está sendo recebido

---

## 📚 Recursos

- [Documentação Webhooks Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Documentação Edge Functions Supabase](https://supabase.com/docs/guides/functions)
- [API de Pagamentos Mercado Pago](https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post)

---

## 🎉 Pronto!

Agora seu sistema está configurado para:
- ✅ Receber notificações do Mercado Pago
- ✅ Atualizar status das transações automaticamente
- ✅ Atualizar estoque quando pagamento for aprovado
- ✅ Processar reembolsos automaticamente

**⚠️ Lembre-se**: Em produção, sempre valide a assinatura do webhook para segurança!
