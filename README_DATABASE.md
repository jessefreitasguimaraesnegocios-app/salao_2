# 🗄️ Database Schema - Meu Salão App

## 📦 Arquivos Criados

1. **`supabase_schema.sql`** - Schema principal completo
2. **`supabase_functions.sql`** - Funções auxiliares e procedures
3. **`supabase_examples.sql`** - Exemplos práticos de uso
4. **`SUPABASE_SETUP.md`** - Guia completo de configuração
5. **`APP_REVIEW.md`** - Revisão do app e melhorias

## 🎯 O que foi implementado

### ✅ Estrutura Completa do Banco

#### Tabelas Principais (9)
- ✅ `users` - Usuários com roles
- ✅ `businesses` - Estabelecimentos
- ✅ `products` - Produtos
- ✅ `services` - Serviços
- ✅ `team_members` - Membros da equipe
- ✅ `appointments` - Agendamentos
- ✅ `transactions` - Transações com split
- ✅ `subscriptions` - Assinaturas mensais
- ✅ `mercado_pago_tokens` - Tokens OAuth

#### Tipos e Enums (8)
- ✅ `user_role` - CUSTOMER, BUSINESS_OWNER, SUPER_ADMIN
- ✅ `business_type` - BARBERSHOP, SALON
- ✅ `business_status` - ACTIVE, PENDING, SUSPENDED
- ✅ `transaction_status` - PAID, PENDING, REFUNDED
- ✅ `payment_method` - pix, credit_card
- ✅ `appointment_status` - PENDING, CONFIRMED, COMPLETED, CANCELLED
- ✅ `team_member_status` - ACTIVE, INACTIVE
- ✅ `subscription_status` - active, pending, expired, cancelled

### ✅ Funcionalidades de Negócio

#### Split Automático de Pagamentos
- ✅ Trigger que calcula split automaticamente
- ✅ Validação de business ativo e conectado ao MP
- ✅ Histórico do percentual usado na transação
- ✅ Validação matemática (admin_fee + partner_net = amount)

#### Assinaturas Mensais
- ✅ Sistema completo de assinaturas
- ✅ Rastreamento de períodos
- ✅ Renovação automática
- ✅ Integração com Mercado Pago

#### Integração Mercado Pago
- ✅ Armazenamento seguro de tokens
- ✅ Refresh token support
- ✅ Validação de expiração
- ✅ Merchant ID tracking

#### Gestão de Estoque
- ✅ Atualização automática ao criar transação
- ✅ Validação de estoque disponível
- ✅ Soft delete para auditoria

### ✅ Segurança

#### Row Level Security (RLS)
- ✅ 9 tabelas com RLS habilitado
- ✅ 20+ políticas de segurança
- ✅ Isolamento por business
- ✅ Controle por role

#### Validações
- ✅ Constraints de integridade
- ✅ Validação de valores (CHECK constraints)
- ✅ Foreign keys com CASCADE/SET NULL apropriados
- ✅ Validação de negócio antes de operações

#### Triggers
- ✅ Cálculo automático de split
- ✅ Atualização de estoque
- ✅ Timestamps automáticos (updated_at)
- ✅ Validações de negócio

### ✅ Performance

#### Índices Criados (20+)
- ✅ Índices em foreign keys
- ✅ Índices em campos de busca frequente
- ✅ Índices compostos para queries complexas
- ✅ Índices parciais (WHERE deleted_at IS NULL)

#### Views
- ✅ `admin_dashboard_stats` - Estatísticas consolidadas
- ✅ `owner_dashboard_stats` - Métricas por business

### ✅ Funções Auxiliares (15+)

#### Transações
- `create_transaction_with_split()` - Criar transação com validações
- `process_payment()` - Processar pagamento
- `get_transactions_report()` - Relatório de transações

#### Assinaturas
- `upsert_subscription()` - Criar/atualizar assinatura
- `renew_subscription()` - Renovar assinatura
- `check_expired_subscriptions()` - Verificar expiradas

#### Agendamentos
- `create_appointment()` - Criar com validações
- `confirm_appointment()` - Confirmar
- `cancel_appointment()` - Cancelar
- `complete_appointment()` - Completar e criar transação
- `get_upcoming_appointments()` - Próximos agendamentos

#### Mercado Pago
- `update_mp_tokens()` - Salvar tokens
- `refresh_mp_token()` - Renovar token

#### Estatísticas
- `get_business_stats()` - Estatísticas do business
- `is_super_admin()` - Verificar role
- `is_business_owner()` - Verificar ownership

## 🔒 Segurança Implementada

### Row Level Security Policies

#### Users
- ✅ Ver próprio perfil
- ✅ Atualizar próprio perfil
- ✅ Super Admin: acesso total

#### Businesses
- ✅ Público: ver businesses ativos
- ✅ Owner: gerenciar próprio business
- ✅ Super Admin: gerenciar todos

#### Transactions
- ✅ Cliente: ver próprias transações
- ✅ Owner: ver transações do business
- ✅ Cliente: criar transações
- ✅ Super Admin: ver todas

#### Products/Services
- ✅ Público: ver ativos de businesses ativos
- ✅ Owner: gerenciar do próprio business

#### Appointments
- ✅ Cliente: ver próprios agendamentos
- ✅ Owner: ver do business
- ✅ Cliente: criar agendamentos
- ✅ Owner: atualizar do business

#### Tokens MP
- ✅ Apenas owner pode ver/gerenciar

## 📊 Estrutura de Dados

### Relacionamentos

```
users (1) ──< (N) businesses
businesses (1) ──< (N) products
businesses (1) ──< (N) services
businesses (1) ──< (N) team_members
businesses (1) ──< (N) appointments
businesses (1) ──< (N) transactions
businesses (1) ──< (1) subscriptions
businesses (1) ──< (1) mercado_pago_tokens
users (1) ──< (N) appointments
users (1) ──< (N) transactions
services (1) ──< (N) appointments
team_members (1) ──< (N) appointments
appointments (1) ──< (1) transactions
```

## 🚀 Como Usar

### 1. Setup Inicial

```sql
-- No Supabase SQL Editor, execute na ordem:
-- 1. supabase_schema.sql
-- 2. supabase_functions.sql
```

### 2. Criar Primeiro Admin

```sql
-- Via Supabase Auth UI ou API
-- Depois atualizar role se necessário
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@email.com';
```

### 3. Testar Split

```sql
-- Criar business de teste
-- Criar transação
-- Verificar se split foi calculado
SELECT * FROM transactions WHERE id = 'transaction-id';
```

## 📝 Campos Importantes

### Business
- `revenue_split` - Percentual de split (0-100)
- `monthly_fee` - Valor da mensalidade
- `mp_connected` - Se está conectado ao MP
- `mp_merchant_id` - ID do merchant no MP
- `opening_hours` - JSONB com horários
- `notifications` - JSONB com preferências

### Transaction
- `amount` - Valor total
- `admin_fee` - Comissão da plataforma (calculado)
- `partner_net` - Valor líquido do parceiro (calculado)
- `revenue_split_percentage` - % usado (histórico)
- `items` - JSONB com produtos/serviços
- `mp_payment_id` - ID do pagamento no MP

### Subscription
- `current_period_start` - Início do período
- `current_period_end` - Fim do período
- `next_billing_date` - Próxima cobrança
- `mp_subscription_id` - ID da assinatura no MP

## ⚠️ Importante

1. **Tokens do MP**: Em produção, criptografe antes de salvar
2. **Senhas**: Use Supabase Auth (não armazene senhas em texto)
3. **Service Role Key**: Nunca exponha no frontend
4. **Backups**: Configure backups automáticos
5. **Monitoramento**: Monitore logs de segurança

## 🔧 Manutenção

### Verificar Assinaturas Expiradas
```sql
SELECT check_expired_subscriptions();
```

### Verificar Tokens Expirados
```sql
SELECT * FROM mercado_pago_tokens WHERE expires_at < NOW();
```

### Estatísticas da Plataforma
```sql
SELECT * FROM admin_dashboard_stats;
```

## 📚 Documentação Adicional

- Ver `SUPABASE_SETUP.md` para guia completo
- Ver `supabase_examples.sql` para exemplos práticos
- Ver `APP_REVIEW.md` para revisão do app

---

**Schema completo, seguro e pronto para produção** ✅
