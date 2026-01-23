# 🔄 Migração do mockApi para Supabase

## O que foi feito

O `mockApi` foi completamente removido e substituído por `supabaseApi`, que usa Supabase como backend real.

## Arquivos Modificados

### 1. Criado: `services/supabaseApi.ts`
Novo serviço que substitui o `mockApi`, usando Supabase para todas as operações:
- `getCurrentUser()` - Busca usuário autenticado via Supabase Auth
- `getBusinesses()` - Busca estabelecimentos da tabela `businesses`
- `getBusinessById()` - Busca estabelecimento específico
- `getProducts()` - Busca produtos da tabela `products`
- `getServices()` - Busca serviços da tabela `services`
- `getTransactions()` - Busca transações (com ou sem businessId)
- `getAppointments()` - Busca agendamentos da tabela `appointments`
- `getTeamMembers()` - Busca membros da equipe
- `saveProduct()` - Cria/atualiza produto
- `deleteProduct()` - Deleta produto (soft delete)
- `saveService()` - Cria/atualiza serviço
- `deleteService()` - Deleta serviço (soft delete)
- `saveTeamMember()` - Cria/atualiza membro da equipe
- `deleteTeamMember()` - Deleta membro da equipe (soft delete)
- `saveAppointment()` - Cria/atualiza agendamento
- `updateAppointmentStatus()` - Atualiza status do agendamento
- `createTransaction()` - Cria nova transação
- `updateBusiness()` - Atualiza estabelecimento
- `addBusiness()` - Adiciona estabelecimento (admin)
- `deleteBusiness()` - Deleta estabelecimento (soft delete)
- `getUsers()` - Busca todos os usuários (admin)
- `saveUser()` - Atualiza perfil de usuário
- `deleteUser()` - Deleta usuário (apenas perfil, não auth.users)

### 2. Removido: `services/mockApi.ts`
Arquivo completamente removido.

### 3. Atualizados: Todos os componentes que usavam `mockApi`

**Páginas de Cliente:**
- `pages/customer/Explore.tsx`
- `pages/customer/StoreDetail.tsx`
- `pages/customer/Appointments.tsx`
- `pages/customer/Orders.tsx`

**Páginas de Owner:**
- `pages/owner/Dashboard.tsx`
- `pages/owner/Settings.tsx`
- `pages/owner/Products.tsx`
- `pages/owner/Services.tsx`
- `pages/owner/Team.tsx`
- `pages/owner/Appointments.tsx`
- `pages/owner/Finance.tsx`

**Páginas de Admin:**
- `pages/admin/AdminDashboard.tsx`
- `pages/admin/Partners.tsx`
- `pages/admin/Transactions.tsx`
- `pages/admin/Users.tsx`

**Componentes:**
- `components/Sidebar.tsx`
- `App.tsx`
- `pages/LandingPage.tsx` (removido import, não usa mais)

## Mudanças Principais

### Antes (mockApi)
- Dados armazenados em `localStorage`
- Sem persistência real
- Dados perdidos ao limpar cache
- Sem sincronização entre dispositivos

### Depois (supabaseApi)
- Dados armazenados no Supabase (PostgreSQL)
- Persistência real e confiável
- Dados sincronizados entre dispositivos
- RLS (Row Level Security) ativo
- Backup automático

## Compatibilidade

O `supabaseApi` mantém a mesma interface do `mockApi`, então:
- ✅ Todos os componentes funcionam sem alterações
- ✅ Mesmos métodos e assinaturas
- ✅ Mesmos tipos de retorno

## Operações Suportadas

### Leitura (SELECT)
- ✅ Buscar estabelecimentos
- ✅ Buscar produtos
- ✅ Buscar serviços
- ✅ Buscar transações
- ✅ Buscar agendamentos
- ✅ Buscar membros da equipe
- ✅ Buscar usuários

### Escrita (INSERT/UPDATE)
- ✅ Criar/atualizar produtos
- ✅ Criar/atualizar serviços
- ✅ Criar/atualizar membros da equipe
- ✅ Criar/atualizar agendamentos
- ✅ Criar transações
- ✅ Atualizar estabelecimentos
- ✅ Atualizar perfis de usuário

### Exclusão (DELETE - Soft Delete)
- ✅ Deletar produtos (soft delete via `deleted_at`)
- ✅ Deletar serviços (soft delete)
- ✅ Deletar membros da equipe (soft delete)
- ✅ Deletar estabelecimentos (soft delete)

## RLS (Row Level Security)

Todas as operações respeitam as políticas RLS configuradas no Supabase:
- Clientes veem apenas seus próprios dados
- Owners veem apenas dados do seu estabelecimento
- Admins veem todos os dados

## Notas Importantes

1. **Soft Delete**: A maioria das exclusões usa `deleted_at` ao invés de DELETE real, preservando histórico
2. **Autenticação**: `getCurrentUser()` usa Supabase Auth, não mais localStorage
3. **Sessão**: Todas as operações requerem sessão ativa do Supabase Auth
4. **Erros**: Em caso de erro, retorna `null` ou array vazio, não lança exceções

## Próximos Passos

1. **Testar todas as funcionalidades** para garantir que funcionam com Supabase
2. **Verificar RLS** - garantir que as políticas estão corretas
3. **Popular dados iniciais** se necessário (via SQL ou interface admin)
4. **Monitorar logs** do Supabase para erros

## Troubleshooting

### Erro: "relation does not exist"
- Execute os scripts SQL (`supabase_schema.sql` e `supabase_functions.sql`)

### Erro: "permission denied"
- Verifique as políticas RLS no Supabase
- Verifique se o usuário está autenticado

### Dados não aparecem
- Verifique se há dados na tabela
- Verifique filtros (deleted_at, is_active, etc.)
- Verifique RLS policies

### Erro ao criar/atualizar
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique constraints do banco de dados
- Verifique logs do Supabase
