# 🔐 Atualização: Login com Senha para Todos + Cadastro

## O que foi implementado

Agora **todos os usuários** (Clientes, Estabelecimentos e Admins) usam **login com email e senha**, e **todos podem se cadastrar**.

## Mudanças Realizadas

### 1. SQL Schema (`supabase_otp_auth.sql`)

**Trigger atualizado** para criar perfis automaticamente para **todos os tipos de usuário**:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    user_name TEXT;
BEGIN
    -- Determinar role via metadata
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'CUSTOMER'  -- Padrão se não especificado
    );
    
    -- Determinar nome
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        CASE 
            WHEN user_role = 'SUPER_ADMIN' THEN 'Super Admin'
            WHEN user_role = 'BUSINESS_OWNER' THEN 'Proprietário'
            ELSE 'Cliente'
        END
    );
    
    -- Criar perfil para TODOS os tipos
    INSERT INTO public.profiles (id, role, email, phone, name)
    VALUES (NEW.id, user_role, NEW.email, NEW.phone, user_name);
    
    RETURN NEW;
END;
```

**Como funciona:**
- O role é passado via `raw_user_meta_data->>'role'` no signup
- Se não especificado, padrão é `CUSTOMER`
- Perfil é criado automaticamente para todos os tipos

### 2. Componente PasswordLogin (`pages/auth/PasswordLogin.tsx`)

**Atualizado** para aceitar todos os roles (incluindo CUSTOMER):

- Suporta `CUSTOMER`, `BUSINESS_OWNER`, `SUPER_ADMIN`
- Redireciona corretamente baseado no role
- Link para cadastro no footer

### 3. Componente Signup (`pages/auth/Signup.tsx`)

**Novo componente** para cadastro de todos os tipos:

- Formulário: Nome, Email, Senha, Confirmar Senha
- Validação de senha (mínimo 6 caracteres)
- Cria usuário via `supabase.auth.signUp()`
- Passa role via `options.data`
- Trigger SQL cria perfil automaticamente
- Link para login no footer

### 4. LandingPage (`pages/LandingPage.tsx`)

**Atualizado** para:
- Todos os usuários usam login com senha (`/login?role={role}`)
- Adicionado link "Cadastre-se gratuitamente" para clientes

### 5. App.tsx

**Atualizado** com:
- Rota `/login` para todos (usa `PasswordLogin`)
- Rota `/signup` para cadastro (usa `Signup`)
- Removida rota `/login-password` (não precisa mais)
- Removido `OTPLogin` (não usado mais)

## Fluxo de Autenticação

### Para Todos os Tipos de Usuário

**Login:**
```
1. Usuário acessa /login?role={CUSTOMER|BUSINESS_OWNER|SUPER_ADMIN}
   ↓
2. Digita email e senha
   ↓
3. Supabase Auth valida credenciais
   ↓
4. Busca perfil na tabela profiles
   ↓
5. Verifica se role do perfil corresponde ao esperado
   ↓
6. Redireciona:
   - CUSTOMER → /explore
   - BUSINESS_OWNER → /owner
   - SUPER_ADMIN → /admin
```

**Cadastro:**
```
1. Usuário acessa /signup?role={CUSTOMER|BUSINESS_OWNER|SUPER_ADMIN}
   ↓
2. Preenche: Nome, Email, Senha, Confirmar Senha
   ↓
3. Clica "Criar Conta"
   ↓
4. Supabase Auth cria usuário em auth.users
   ↓
5. Trigger SQL cria perfil automaticamente:
   - Tabela: profiles
   - Role: baseado em raw_user_meta_data->>'role'
   - Campos: id, email, name
   ↓
6. Redireciona baseado no role
```

## Rotas

### Login
- `/login?role=CUSTOMER` → Login para clientes
- `/login?role=BUSINESS_OWNER` → Login para estabelecimentos
- `/login?role=SUPER_ADMIN` → Login para admins

### Cadastro
- `/signup?role=CUSTOMER` → Cadastro para clientes
- `/signup?role=BUSINESS_OWNER` → Cadastro para estabelecimentos
- `/signup?role=SUPER_ADMIN` → Cadastro para admins

## Como Funciona o Cadastro

### 1. Usuário preenche formulário
```typescript
// Signup.tsx
await supabase.auth.signUp({
  email: email.trim(),
  password: password,
  options: {
    data: {
      role: role,        // CUSTOMER, BUSINESS_OWNER, ou SUPER_ADMIN
      name: name.trim()
    }
  }
});
```

### 2. Supabase cria usuário em `auth.users`
- Email e senha são armazenados
- Metadata (`role`, `name`) é armazenada em `raw_user_meta_data`

### 3. Trigger SQL cria perfil automaticamente
- Função `handle_new_user()` é executada
- Lê `raw_user_meta_data->>'role'` e `raw_user_meta_data->>'name'`
- Insere perfil na tabela `profiles`

## Segurança

### Validação de Role
- `PasswordLogin` verifica se o role do perfil corresponde ao esperado
- Impede acesso não autorizado

### Validação de Senha
- Mínimo 6 caracteres
- Confirmação de senha deve coincidir
- Validação no frontend e backend

### RLS (Row Level Security)
- Todas as políticas RLS continuam ativas
- Clientes veem apenas seus dados
- Owners veem apenas dados do seu estabelecimento
- Admins veem todos os dados

## Diferenças da Versão Anterior

### Antes
- Clientes: OTP sem senha
- Owners/Admins: Email + Senha
- Sem cadastro público

### Agora
- **Todos**: Email + Senha
- **Todos**: Podem se cadastrar
- Trigger cria perfil para todos automaticamente

## Arquivos Criados/Modificados

### Criados
- `pages/auth/Signup.tsx` - Componente de cadastro

### Modificados
- `pages/auth/PasswordLogin.tsx` - Agora aceita CUSTOMER também
- `pages/LandingPage.tsx` - Usa login com senha para todos
- `App.tsx` - Rotas atualizadas
- `supabase_otp_auth.sql` - Trigger atualizado

### Removidos/Desabilitados
- `pages/customer/OTPLogin.tsx` - Não usado mais (pode ser removido)

## Próximos Passos

1. **Executar SQL atualizado** no Supabase:
   - Execute `supabase_otp_auth.sql` novamente (ou apenas a função `handle_new_user()`)

2. **Testar cadastro e login** para cada tipo:
   - Cliente: `/signup?role=CUSTOMER` → `/login?role=CUSTOMER`
   - Estabelecimento: `/signup?role=BUSINESS_OWNER` → `/login?role=BUSINESS_OWNER`
   - Admin: `/signup?role=SUPER_ADMIN` → `/login?role=SUPER_ADMIN`

3. **Verificar trigger**:
   - Faça um cadastro de teste
   - Verifique se o perfil foi criado na tabela `profiles`
   - Verifique se o role está correto

## Notas Importantes

1. **Role no Signup**: O role é passado via `options.data.role` no `signUp()`
2. **Trigger Automático**: O perfil é criado automaticamente, não precisa criar manualmente
3. **Senha Mínima**: 6 caracteres (pode ser ajustado)
4. **Validação de Email**: Supabase valida automaticamente
5. **Confirmação de Email**: Pode ser habilitada nas configurações do Supabase
