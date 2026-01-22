# 🗄️ Guia de Configuração do Supabase - Meu Salão App

Este guia explica como configurar o banco de dados Supabase para o Meu Salão App com todas as funcionalidades de split de pagamento, assinaturas e integração com Mercado Pago.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## 🚀 Passo a Passo

### 1. Executar o Schema Principal

1. Acesse o **SQL Editor** no seu projeto Supabase
2. Copie e cole o conteúdo do arquivo `supabase_schema.sql`
3. Execute o script completo
4. Verifique se todas as tabelas foram criadas

### 2. Executar as Funções Adicionais

1. No mesmo SQL Editor, copie e cole o conteúdo do arquivo `supabase_functions.sql`
2. Execute o script
3. Verifique se todas as funções foram criadas

### 3. Configurar Autenticação

O Supabase já possui autenticação integrada. Você precisará:

1. **Habilitar Email Auth** nas configurações de Authentication
2. **Configurar políticas de segurança** (já incluídas no schema via RLS)

### 4. Configurar Variáveis de Ambiente

No seu projeto Supabase, vá em **Settings > API** e anote:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SERVICE_ROLE_KEY` (mantenha secreto! - use este nome nas Edge Functions, sem prefixo SUPABASE_)

### 5. Configurar Mercado Pago

1. Crie uma aplicação no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obtenha `CLIENT_ID` e `CLIENT_SECRET`
3. Configure as variáveis no seu `.env`:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_MP_CLIENT_ID=seu_client_id_mp
VITE_MP_CLIENT_SECRET=seu_client_secret_mp
```

## 🔐 Segurança Implementada

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas específicas:

- **Usuários**: Podem ver/editar apenas seu próprio perfil
- **Businesses**: Públicos podem ver businesses ativos, owners gerenciam seus próprios
- **Transações**: Clientes veem suas transações, owners veem do seu business
- **Tokens MP**: Apenas o owner pode ver seus tokens
- **Super Admin**: Acesso total a todas as tabelas

### Validações

- ✅ Split sempre calculado automaticamente
- ✅ Validação de business ativo antes de transações
- ✅ Verificação de estoque antes de vendas
- ✅ Validação de horários disponíveis para agendamentos
- ✅ Constraints de integridade referencial

## 📊 Funcionalidades Principais

### Split Automático de Pagamentos

O split é calculado automaticamente via trigger quando uma transação é criada:

```sql
-- Exemplo: Transação de R$ 100,00 com split de 10%
-- admin_fee = R$ 10,00
-- partner_net = R$ 90,00
```

### Assinaturas Mensais

- Sistema de assinaturas com renovação automática
- Rastreamento de períodos de cobrança
- Integração com Mercado Pago para pagamentos recorrentes

### Integração Mercado Pago

- Armazenamento seguro de tokens OAuth
- Suporte a refresh tokens
- Validação de expiração de tokens

## 🔧 Funções Úteis

### Criar Transação com Split

```sql
SELECT create_transaction_with_split(
    'business-uuid',
    'customer-uuid',
    'Nome do Cliente',
    100.00,
    'pix',
    '[...]'::jsonb
);
```

### Processar Pagamento

```sql
SELECT process_payment(
    'transaction-uuid',
    'mp-payment-id',
    'mp-transaction-id'
);
```

### Obter Estatísticas do Business

```sql
SELECT * FROM get_business_stats('business-uuid');
```

## 📝 Estrutura das Tabelas

### Principais

- `users` - Usuários do sistema
- `businesses` - Estabelecimentos
- `transactions` - Transações com split
- `subscriptions` - Assinaturas mensais
- `appointments` - Agendamentos
- `products` - Produtos
- `services` - Serviços
- `team_members` - Membros da equipe
- `mercado_pago_tokens` - Tokens OAuth do MP

## 🔄 Próximos Passos

1. **Criar usuário admin inicial**:
   ```sql
   -- Use o Supabase Auth para criar o primeiro admin
   -- Depois atualize a role manualmente se necessário
   ```

2. **Configurar webhooks do Mercado Pago**:
   - Configure webhooks para receber notificações de pagamento
   - Crie uma Edge Function no Supabase para processar webhooks

3. **Testar o split**:
   - Crie uma transação de teste
   - Verifique se o split foi calculado corretamente

4. **Configurar backups**:
   - Configure backups automáticos no Supabase
   - Configure retenção de backups

## ⚠️ Importante

- **Nunca exponha** `SERVICE_ROLE_KEY` no frontend (use apenas em Edge Functions)
- **Sempre use** `SUPABASE_ANON_KEY` no frontend
- **Criptografe** tokens do Mercado Pago em produção
- **Valide** todas as entradas do usuário
- **Monitore** logs de segurança no Supabase

## 🐛 Troubleshooting

### Erro: "permission denied for table"
- Verifique se RLS está configurado corretamente
- Verifique se o usuário tem as políticas adequadas

### Split não está sendo calculado
- Verifique se o trigger `trigger_calculate_split` existe
- Verifique se o business tem `revenue_split` definido

### Tokens do MP não estão sendo salvos
- Verifique se a função `update_mp_tokens` existe
- Verifique permissões RLS na tabela `mercado_pago_tokens`

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt/docs)

---

**Desenvolvido com segurança e boas práticas** 🔒
