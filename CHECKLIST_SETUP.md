# ✅ Checklist de Configuração - Meu Salão App

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-Configuração

- [ ] Conta criada no Supabase
- [ ] Projeto criado no Supabase
- [ ] Acesso ao SQL Editor
- [ ] Acesso às configurações do projeto

## 🗄️ Banco de Dados

### Schema Principal
- [ ] Executado `supabase_schema.sql` sem erros
- [ ] Todas as tabelas criadas (9 tabelas)
- [ ] Todos os tipos/enums criados (8 tipos)
- [ ] Todos os índices criados
- [ ] RLS habilitado em todas as tabelas

### Funções
- [ ] Executado `supabase_functions.sql` sem erros
- [ ] Todas as funções criadas (15+ funções)
- [ ] Triggers funcionando corretamente
- [ ] Views criadas

### Testes Básicos
- [ ] Testar criação de usuário
- [ ] Testar criação de business
- [ ] Testar cálculo de split
- [ ] Testar RLS policies

## 🔐 Autenticação

- [ ] Email Auth habilitado no Supabase
- [ ] Configurado domínio de email (se necessário)
- [ ] Testado login/logout
- [ ] Verificado criação de usuários

## 🔑 Variáveis de Ambiente

- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `VITE_MP_CLIENT_ID` configurada (se usando MP)
- [ ] `VITE_MP_CLIENT_SECRET` configurada (se usando MP)
- [ ] Arquivo `.env` criado e configurado

## 💳 Mercado Pago

- [ ] Aplicação criada no Mercado Pago Developers
- [ ] Client ID obtido
- [ ] Client Secret obtido
- [ ] Redirect URI configurado
- [ ] Webhooks configurados (opcional)

## 👤 Usuários Iniciais

- [ ] Super Admin criado
- [ ] Business Owner de teste criado
- [ ] Cliente de teste criado
- [ ] Verificado acesso por role

## 🧪 Testes Funcionais

### Split de Pagamento
- [ ] Criar transação de teste
- [ ] Verificar cálculo automático de split
- [ ] Verificar admin_fee + partner_net = amount
- [ ] Verificar histórico de revenue_split_percentage

### Assinaturas
- [ ] Criar assinatura de teste
- [ ] Verificar períodos de cobrança
- [ ] Testar renovação (se implementado)

### Agendamentos
- [ ] Criar agendamento
- [ ] Confirmar agendamento
- [ ] Completar agendamento
- [ ] Verificar criação de transação ao completar

### Produtos/Serviços
- [ ] Criar produto
- [ ] Criar serviço
- [ ] Verificar atualização de estoque
- [ ] Testar soft delete

## 🔒 Segurança

### RLS Policies
- [ ] Cliente não vê dados de outros clientes
- [ ] Owner não vê dados de outros businesses
- [ ] Super Admin tem acesso total
- [ ] Público pode ver apenas businesses ativos

### Validações
- [ ] Business deve estar ativo para transações
- [ ] Business deve estar conectado ao MP
- [ ] Estoque não pode ficar negativo
- [ ] Split sempre calculado corretamente

## 📊 Performance

- [ ] Índices criados e funcionando
- [ ] Queries otimizadas
- [ ] Views retornando dados corretos

## 📝 Documentação

- [ ] Lido `SUPABASE_SETUP.md`
- [ ] Lido `APP_REVIEW.md`
- [ ] Lido `README_DATABASE.md`
- [ ] Revisado `supabase_examples.sql`

## 🚀 Produção

### Antes de Deploy
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Logs habilitados
- [ ] Variáveis de ambiente em produção
- [ ] Tokens do MP criptografados (se aplicável)
- [ ] Service Role Key protegido
- [ ] Rate limiting configurado (se necessário)

### Pós-Deploy
- [ ] Testado fluxo completo de checkout
- [ ] Testado criação de agendamento
- [ ] Testado split de pagamento
- [ ] Verificado logs de segurança
- [ ] Monitorado performance

## 🐛 Troubleshooting

Se algo não funcionar:

1. **Verificar logs do Supabase**
   - Dashboard > Logs
   - Verificar erros de SQL
   - Verificar erros de RLS

2. **Verificar políticas RLS**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';
   ```

3. **Verificar triggers**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%split%';
   ```

4. **Testar funções manualmente**
   ```sql
   SELECT create_transaction_with_split(...);
   ```

## 📞 Suporte

- Documentação Supabase: https://supabase.com/docs
- Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs

---

**Marque cada item conforme for completando** ✅
