# 🔐 Guia de Login OTP (One-Time Password)

## Visão Geral

O sistema de login OTP permite que clientes façam autenticação sem senha usando um código de 6 dígitos enviado via telefone (SMS) ou email.

## 📋 Arquivos Criados

### 1. SQL Schema (`supabase_otp_auth.sql`)
- **Tabela `profiles`**: Armazena perfis de usuários autenticados
- **Trigger `on_auth_user_created`**: Cria perfil automaticamente após signup OTP
- **RLS Policies**: Políticas de segurança para acesso aos dados

### 2. Serviço de Autenticação (`services/authService.ts`)
- `sendOTP()`: Envia código OTP via telefone ou email
- `verifyOTP()`: Valida código OTP e autentica usuário
- `getUserProfile()`: Busca perfil do usuário autenticado
- `logout()`: Faz logout do usuário
- Helpers: `isValidPhone()`, `isValidEmail()`, `normalizePhone()`

### 3. Componente React (`pages/customer/OTPLogin.tsx`)
- Formulário de entrada (telefone ou email)
- Formulário de verificação (código OTP)
- Feedback visual (loading, mensagens de erro/sucesso)
- Navegação automática após autenticação

### 4. Integração no App (`App.tsx`)
- Rota `/login` para acesso ao componente OTPLogin
- Integração com Supabase Auth
- Escuta mudanças de autenticação
- Busca perfil da tabela `profiles`

## 🔄 Fluxo de Autenticação

```
1. Cliente acessa /login (ou clica em "Sou Cliente" na landing page)
   ↓
2. Cliente escolhe telefone OU email
   ↓
3. Cliente digita telefone/email e clica "Enviar Código"
   ↓
4. Supabase Auth envia OTP:
   - SMS se for telefone
   - Email se for email
   ↓
5. Cliente recebe código de 6 dígitos
   ↓
6. Cliente digita código no formulário
   ↓
7. Supabase Auth valida código
   ↓
8. Trigger SQL cria perfil automaticamente:
   - Tabela: profiles
   - Role: 'CUSTOMER' (padrão)
   - Campos: id, email, phone, name
   ↓
9. Cliente é redirecionado para /explore
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `profiles`

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger Automático

O trigger `on_auth_user_created` é disparado automaticamente quando um novo usuário é criado em `auth.users` via OTP:

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

A função `handle_new_user()` cria o perfil com:
- `id`: ID do usuário em `auth.users`
- `role`: 'CUSTOMER' (padrão para OTP)
- `email`: Email do usuário (se fornecido)
- `phone`: Telefone do usuário (se fornecido)
- `name`: Nome do usuário (ou 'Cliente' como padrão)

## 🔒 Segurança (RLS)

### Políticas de Leitura (SELECT)
- **Clientes**: Veem apenas seu próprio perfil
- **Business Owners**: Veem apenas seu próprio perfil
- **Admins**: Veem todos os perfis

### Políticas de Atualização (UPDATE)
- **Clientes**: Atualizam apenas seu próprio perfil
- **Business Owners**: Atualizam apenas seu próprio perfil
- **Admins**: Atualizam todos os perfis

### Políticas de Inserção (INSERT)
- Apenas o trigger pode inserir perfis (via `SECURITY DEFINER`)
- Inserção manual é bloqueada por segurança

## 📱 Validações

### Telefone
- Formato aceito: `(11) 98765-4321`, `11987654321`, `987654321`
- Normalização automática para formato internacional: `+5511987654321`
- Validação: 10 ou 11 dígitos

### Email
- Validação de formato padrão: `usuario@dominio.com`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Código OTP
- 6 dígitos numéricos
- Validação no frontend e backend

## 🚀 Configuração no Supabase

### 1. Executar SQL Schema

1. Acesse o **SQL Editor** no Supabase
2. Execute o arquivo `supabase_otp_auth.sql`
3. Verifique se a tabela `profiles` foi criada
4. Verifique se o trigger foi criado

### 2. Configurar Autenticação

1. Acesse **Authentication > Settings** no Supabase
2. Habilite **Phone Auth** (para SMS)
3. Habilite **Email Auth** (para email)
4. Configure provedor de SMS (Twilio, etc.) se necessário

### 3. Configurar Provedor de SMS (Opcional)

Para enviar SMS, você precisa configurar um provedor:

1. Acesse **Authentication > Providers > Phone**
2. Configure Twilio ou outro provedor
3. Adicione credenciais (API Key, etc.)

**Nota**: Em desenvolvimento, o Supabase pode usar um serviço de teste.

## 💻 Uso no Frontend

### Enviar OTP

```typescript
import { sendOTP } from './services/authService';

const response = await sendOTP('11987654321'); // ou 'email@exemplo.com'

if (response.success) {
  console.log('Código enviado!');
} else {
  console.error(response.message);
}
```

### Verificar OTP

```typescript
import { verifyOTP } from './services/authService';

const response = await verifyOTP(
  '11987654321', // telefone ou email
  '123456',      // código OTP
  'sms'          // ou 'email'
);

if (response.success) {
  console.log('Autenticado com sucesso!');
}
```

### Buscar Perfil

```typescript
import { getUserProfile } from './services/authService';

const profile = await getUserProfile();
if (profile) {
  console.log('Perfil:', profile);
}
```

### Fazer Logout

```typescript
import { logout } from './services/authService';

await logout();
```

## 🎨 Componente OTPLogin

O componente `OTPLogin` gerencia todo o fluxo de autenticação:

- **Estado `input`**: Formulário para digitar telefone/email
- **Estado `verify`**: Formulário para digitar código OTP
- **Feedback visual**: Mensagens de sucesso/erro
- **Loading states**: Indicadores de carregamento
- **Navegação**: Redirecionamento automático após login

## 🔧 Troubleshooting

### Erro: "Código inválido"
- Verifique se o código foi digitado corretamente
- Verifique se o código não expirou (geralmente válido por 5-10 minutos)
- Tente reenviar o código

### Erro: "Erro ao enviar código"
- Verifique se o telefone/email está correto
- Verifique se o provedor de SMS está configurado (para telefone)
- Verifique logs do Supabase

### Erro: "Perfil não encontrado"
- O trigger pode não ter sido executado
- Verifique se o trigger `on_auth_user_created` existe
- Verifique logs do Supabase

### SMS não chega
- Verifique configuração do provedor de SMS
- Use email como alternativa
- Verifique logs do Supabase

## 📝 Notas Importantes

1. **Role Padrão**: Todos os usuários autenticados via OTP recebem role `CUSTOMER` por padrão
2. **Sem Senha**: Clientes não precisam criar senha
3. **Sessão**: A sessão é gerenciada pelo Supabase Auth
4. **RLS**: Todas as políticas RLS estão ativas por padrão
5. **Trigger**: O perfil é criado automaticamente, não é necessário criar manualmente

## 🔗 Integração com Outros Sistemas

O sistema OTP é independente do sistema de login de owners/admins:

- Clientes usam OTP (sem senha)
- Owners/Admins usam sistema tradicional (com senha via Supabase Auth)

**Nota**: O `mockApi` foi removido e substituído por `supabaseApi` que usa Supabase como backend real.
