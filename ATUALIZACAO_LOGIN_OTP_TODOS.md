# 🔐 Sistema de Autenticação - Clientes OTP, Owners/Admins com Senha

## O que foi implementado

Sistema de autenticação híbrido:
- **Clientes**: Login OTP sem senha (telefone/email)
- **Estabelecimentos e Admins**: Login tradicional com email e senha

## Mudanças Realizadas

### 1. SQL Schema (`supabase_otp_auth.sql`)

**Trigger atualizado** para criar perfis automaticamente **apenas para clientes**:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    user_name TEXT;
BEGIN
    -- Determinar role do usuário via metadata
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'CUSTOMER'  -- Padrão se não especificado
    );
    
    -- Determinar nome do usuário
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        CASE 
            WHEN user_role = 'SUPER_ADMIN' THEN 'Super Admin'
            WHEN user_role = 'BUSINESS_OWNER' THEN 'Proprietário'
            ELSE 'Cliente'
        END
    );
    
    -- IMPORTANTE: Apenas criar perfil automaticamente para CUSTOMER
    -- BUSINESS_OWNER e SUPER_ADMIN devem ter perfis criados manualmente
    IF user_role != 'CUSTOMER' THEN
        RETURN NEW; -- Não criar perfil para owners/admins
    END IF;
    
    -- Inserir perfil na tabela profiles (apenas para CUSTOMER)
    INSERT INTO public.profiles (id, role, email, phone, name)
    VALUES (NEW.id, 'CUSTOMER', NEW.email, NEW.phone, user_name);
    
    RETURN NEW;
END;
```

**Como funciona:**
- O role pode ser passado via `raw_user_meta_data->>'role'` no signup
- Se não especificado, padrão é `CUSTOMER`
- Nome também pode ser passado via metadata

### 2. Componente PasswordLogin (`pages/auth/PasswordLogin.tsx`)

**Novo componente** para login com senha:

- Formulário de email e senha
- Validação de credenciais via Supabase Auth
- Verificação de role do perfil
- Redirecionamento baseado no role

### 3. Serviço de Autenticação (`services/authService.ts`)

**Função `sendOTP()`** mantida para clientes:

```typescript
export async function sendOTP(
  phoneOrEmail: string, 
  role?: UserRole  // Apenas CUSTOMER
): Promise<OTPResponse>
```

### 4. Componente OTPLogin (`pages/customer/OTPLogin.tsx`)

**Atualizado para suportar diferentes roles:**

- Aceita `role` via props ou query parameter (`?role=BUSINESS_OWNER`)
- Mostra ícone e título diferentes baseado no role
- Redireciona para rota correta após login:
  - `CUSTOMER` → `/explore`
  - `BUSINESS_OWNER` → `/owner`
  - `SUPER_ADMIN` → `/admin`

**Interface:**
```typescript
interface OTPLoginProps {
  role?: UserRole;
}
```

### 5. LandingPage (`pages/LandingPage.tsx`)

**Simplificado** - todos agora usam OTP:

```typescript
const handleLogin = async (role: UserRole) => {
  // Todos os usuários agora usam login OTP
  navigate(`/login?role=${role}`);
};
```

### 6. App.tsx

**Atualizado para:**
- ✅ Removido `mockApi` completamente - substituído por `supabaseApi`
- Usar apenas Supabase Auth
- Redirecionar para `/login` com role correto quando não autenticado

### 7. Sidebar (`components/Sidebar.tsx`)

**Logout atualizado** para usar Supabase Auth:

```typescript
const handleLogout = async () => {
  try {
    await authLogout(); // Supabase Auth
  } catch (error) {
    console.warn('Erro ao fazer logout do Supabase, usando fallback:', error);
  }
  api.logout(); // Limpar localStorage
  navigate('/');
  window.location.reload();
};
```

## Fluxo de Autenticação por Role

### Cliente (CUSTOMER) - OTP Sem Senha
```
1. Clica "Sou Cliente" na landing page
2. Navega para /login?role=CUSTOMER
3. Digita telefone/email
4. Recebe OTP
5. Digita código
6. Perfil criado com role='CUSTOMER'
7. Redirecionado para /explore
```

### Estabelecimento (BUSINESS_OWNER) - Email + Senha
```
1. Clica "Sou Estabelecimento" na landing page
2. Navega para /login-password?role=BUSINESS_OWNER
3. Digita email e senha
4. Supabase Auth valida credenciais
5. Busca perfil na tabela profiles
6. Verifica role do perfil
7. Redirecionado para /owner
```

### Super Admin (SUPER_ADMIN) - Email + Senha
```
1. Clica "Admin Central" na landing page
2. Navega para /login-password?role=SUPER_ADMIN
3. Digita email e senha
4. Supabase Auth valida credenciais
5. Busca perfil na tabela profiles
6. Verifica role do perfil
7. Redirecionado para /admin
```

## Criar Usuários com Senha

Estabelecimentos e Admins devem ter perfis criados **manualmente**:

### Via Supabase Dashboard

1. Acesse **Authentication > Users**
2. Clique em **Add User**
3. Preencha email e senha
4. Adicione metadata (opcional):
   ```json
   {
     "role": "BUSINESS_OWNER",
     "name": "João Proprietário"
   }
   ```

### Via SQL

```sql
-- Após criar usuário no auth.users, criar perfil:
INSERT INTO profiles (id, role, email, name)
VALUES (
  'uuid-do-usuario', -- ID do usuário em auth.users
  'BUSINESS_OWNER',  -- ou 'SUPER_ADMIN'
  'joao@barbearia.com',
  'João Proprietário'
);
```

## Migração de Usuários Existentes

### Para Clientes
- Basta fazer login via OTP - o trigger criará o perfil automaticamente

### Para Estabelecimentos e Admins
- Criar usuário no Supabase Dashboard (Authentication > Users) com email e senha
- Criar perfil manualmente na tabela `profiles` com o mesmo ID do usuário

## Segurança

- **RLS Policies** continuam funcionando:
  - Clientes veem apenas seus dados
  - Business Owners veem apenas seus dados
  - Admins veem todos os dados

- **Role é definido no signup** via metadata, não pode ser alterado facilmente

- **Trigger usa SECURITY DEFINER** para criar perfis com permissões elevadas

## Próximos Passos

1. **Executar SQL atualizado** no Supabase:
   - Execute `supabase_otp_auth.sql` novamente (ou apenas a função `handle_new_user()`)

2. **Criar usuários de teste**:
   - Cliente: Fazer login via OTP (perfil criado automaticamente)
   - Estabelecimento: Criar no Dashboard + criar perfil manualmente
   - Admin: Criar no Dashboard + criar perfil manualmente

3. **Testar login para cada tipo:**
   - Cliente: `/login?role=CUSTOMER` (OTP)
   - Estabelecimento: `/login-password?role=BUSINESS_OWNER` (Senha)
   - Admin: `/login-password?role=SUPER_ADMIN` (Senha)

## Notas Importantes

- **Role padrão**: Se não especificado, o role padrão é `CUSTOMER`
- **Backward compatibility**: O sistema ainda funciona se não passar role (usa CUSTOMER)
- **Query parameter**: Role pode ser passado via URL (`?role=BUSINESS_OWNER`)
- **Props**: Role também pode ser passado via props do componente

## Troubleshooting

### Perfil criado com role errado
- Verifique se está passando `role` corretamente no `sendOTP()`
- Verifique se o trigger está atualizado no Supabase
- Verifique logs do Supabase para ver o `raw_user_meta_data`

### Redirecionamento incorreto
- Verifique se o role está sendo lido corretamente do perfil
- Verifique se a rota de redirecionamento está correta no `OTPLogin`

### Logout não funciona
- Verifique se `authLogout()` está sendo chamado
- Verifique se há erros no console do navegador
