# 🔐 Guia de Login com Senha para Estabelecimentos e Admins

## Visão Geral

Estabelecimentos (Business Owners) e Super Admins usam autenticação tradicional com **email e senha**, enquanto clientes usam **OTP sem senha**.

## Diferenças entre Tipos de Usuário

| Tipo | Método de Login | Senha | Componente |
|------|----------------|-------|-------------|
| **Cliente** | OTP (telefone/email) | ❌ Não precisa | `OTPLogin` |
| **Estabelecimento** | Email + Senha | ✅ Obrigatória | `PasswordLogin` |
| **Super Admin** | Email + Senha | ✅ Obrigatória | `PasswordLogin` |

## Arquivos Criados

### 1. Componente PasswordLogin (`pages/auth/PasswordLogin.tsx`)

Componente React para login com email e senha:
- Formulário de email e senha
- Validação de campos
- Integração com Supabase Auth (`signInWithPassword`)
- Verificação de role do perfil
- Redirecionamento baseado no role

## Fluxo de Autenticação

### Para Estabelecimentos e Admins

```
1. Usuário acessa /login-password?role=BUSINESS_OWNER (ou SUPER_ADMIN)
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
   - BUSINESS_OWNER → /owner
   - SUPER_ADMIN → /admin
```

## Criar Usuários com Senha

### Opção 1: Via Supabase Dashboard

1. Acesse **Authentication > Users** no Supabase
2. Clique em **Add User**
3. Preencha:
   - Email
   - Senha
   - **Metadata** (opcional):
     ```json
     {
       "role": "BUSINESS_OWNER",
       "name": "João Proprietário"
     }
     ```
4. Clique em **Create User**

### Opção 2: Via SQL (Criar Perfil Manualmente)

```sql
-- 1. Criar usuário no auth.users (via Supabase Dashboard ou API)
-- 2. Criar perfil na tabela profiles

INSERT INTO profiles (id, role, email, name)
VALUES (
  'uuid-do-usuario-auth', -- ID do usuário em auth.users
  'BUSINESS_OWNER',       -- ou 'SUPER_ADMIN'
  'joao@barbearia.com',
  'João Proprietário'
);
```

### Opção 3: Via Frontend (Signup)

Você pode criar um componente de signup para estabelecimentos:

```typescript
const handleSignup = async (email: string, password: string, name: string) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'BUSINESS_OWNER',
        name: name
      }
    }
  });
  
  if (data.user) {
    // Criar perfil manualmente (trigger não cria para owners/admins)
    await supabase.from('profiles').insert({
      id: data.user.id,
      role: 'BUSINESS_OWNER',
      email: email,
      name: name
    });
  }
};
```

## Trigger SQL Atualizado

O trigger `handle_new_user()` foi atualizado para:

- ✅ Criar perfil automaticamente **apenas para CUSTOMER** (OTP)
- ❌ **NÃO criar** perfil automaticamente para BUSINESS_OWNER ou SUPER_ADMIN
- Estabelecimentos e Admins devem ter perfis criados manualmente

```sql
-- Se role não for CUSTOMER, retorna sem criar perfil
IF user_role != 'CUSTOMER' THEN
    RETURN NEW;
END IF;
```

## Rotas

### Login OTP (Clientes)
- Rota: `/login?role=CUSTOMER`
- Componente: `OTPLogin`
- Método: OTP via telefone/email

### Login Senha (Estabelecimentos/Admins)
- Rota: `/login-password?role=BUSINESS_OWNER`
- Rota: `/login-password?role=SUPER_ADMIN`
- Componente: `PasswordLogin`
- Método: Email + Senha

## Segurança

### Validação de Role

O componente `PasswordLogin` verifica se o role do perfil corresponde ao esperado:

```typescript
if (profile.role !== role) {
  await supabase.auth.signOut();
  setMessage({ 
    type: 'error', 
    text: `Este login é apenas para ${role === UserRole.BUSINESS_OWNER ? 'estabelecimentos' : 'administradores'}.` 
  });
  return;
}
```

Isso impede que:
- Um cliente tente fazer login como estabelecimento
- Um estabelecimento tente fazer login como admin
- Usuários acessem áreas não autorizadas

## Exemplo de Uso

### Criar Estabelecimento Manualmente

```sql
-- 1. Criar usuário no Supabase Dashboard (Authentication > Users)
-- Email: joao@barbearia.com
-- Senha: senha123
-- Metadata: { "role": "BUSINESS_OWNER", "name": "João Proprietário" }

-- 2. Obter ID do usuário criado (do auth.users)

-- 3. Criar perfil
INSERT INTO profiles (id, role, email, name)
VALUES (
  'uuid-do-usuario', -- Substituir pelo ID real
  'BUSINESS_OWNER',
  'joao@barbearia.com',
  'João Proprietário'
);
```

### Criar Admin Manualmente

```sql
-- 1. Criar usuário no Supabase Dashboard
-- Email: admin@meusalaoapp.com
-- Senha: admin123
-- Metadata: { "role": "SUPER_ADMIN", "name": "Super Admin" }

-- 2. Criar perfil
INSERT INTO profiles (id, role, email, name)
VALUES (
  'uuid-do-usuario', -- Substituir pelo ID real
  'SUPER_ADMIN',
  'admin@meusalaoapp.com',
  'Super Admin'
);
```

## Troubleshooting

### Erro: "Perfil não encontrado"
- Verifique se o perfil foi criado na tabela `profiles`
- Verifique se o `id` do perfil corresponde ao `id` do usuário em `auth.users`

### Erro: "Este login é apenas para estabelecimentos"
- Verifique se o role do perfil está correto
- Verifique se está acessando a rota correta (`/login-password?role=BUSINESS_OWNER`)

### Erro: "Email ou senha incorretos"
- Verifique se o email está correto
- Verifique se a senha está correta
- Verifique se o usuário existe em `auth.users`

## Próximos Passos

1. **Criar usuários de teste** no Supabase Dashboard
2. **Criar perfis** manualmente na tabela `profiles`
3. **Testar login** para cada tipo de usuário
4. (Opcional) **Criar componente de signup** para estabelecimentos
