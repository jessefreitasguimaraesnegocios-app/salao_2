# 🔑 Guia de Chaves e Configuração - Meu Salão App

Este guia mostra exatamente onde pegar e onde colocar todas as chaves necessárias para o app funcionar.

---

## 📋 Índice

1. [Chaves do Supabase](#chaves-do-supabase)
2. [Chaves do Mercado Pago](#chaves-do-mercado-pago)
3. [Arquivo .env](#arquivo-env)
4. [Configuração no Supabase](#configuração-no-supabase)
5. [Configuração no Mercado Pago](#configuração-no-mercado-pago)

---

## 🗄️ Chaves do Supabase

### Onde Pegar

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** (⚙️) no menu lateral
3. Clique em **API**
4. Você verá as seguintes chaves:

#### ✅ `SUPABASE_URL`
- **Onde está**: Seção "Project URL"
- **Exemplo**: `https://xxxxxxxxxxxxx.supabase.co`
- **O que é**: URL base do seu projeto Supabase

#### ✅ `SUPABASE_ANON_KEY`
- **Onde está**: Seção "Project API keys" > **`anon` `public`**
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **O que é**: Chave pública (pode ser exposta no frontend)
- **⚠️ IMPORTANTE**: Esta é a chave que você usa no frontend

#### ✅ `SUPABASE_SERVICE_ROLE_KEY`
- **Onde está**: Seção "Project API keys" > **`service_role` `secret`**
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **O que é**: Chave secreta (NUNCA exponha no frontend!)
- **⚠️ SEGURANÇA**: Use apenas no backend/Edge Functions

---

## 💳 Chaves do Mercado Pago

### Onde Pegar

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login com sua conta Mercado Pago
3. Vá em **Suas integrações** > **Suas aplicações**
4. Clique na sua aplicação (ou crie uma nova)

#### ✅ `MP_CLIENT_ID`
- **Onde está**: Na página da aplicação, seção "Credenciais"
- **Label**: **Application ID** ou **Client ID**
- **Exemplo**: `1234567890123456`
- **O que é**: ID público da sua aplicação

#### ✅ `MP_CLIENT_SECRET`
- **Onde está**: Na mesma página, seção "Credenciais"
- **Label**: **Secret Key** ou **Client Secret**
- **Exemplo**: `AbCdEfGhIjKlMnOpQrStUvWxYz123456`
- **O que é**: Chave secreta da aplicação
- **⚠️ SEGURANÇA**: Nunca exponha no frontend!

### Como Criar uma Aplicação (se não tiver)

1. No [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Clique em **Criar aplicação**
3. Preencha:
   - **Nome**: Meu Salão App
   - **Categoria**: Marketplace
   - **Plataforma**: Web
4. Após criar, você verá o **Client ID** e **Client Secret**

---

## 📝 Arquivo .env

### Onde Criar

Crie um arquivo chamado `.env` na **raiz do projeto** (mesmo nível do `package.json`)

### Estrutura do Arquivo

```env
# ============================================
# SUPABASE
# ============================================
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# MERCADO PAGO
# ============================================
VITE_MP_CLIENT_ID=1234567890123456
VITE_MP_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

### ⚠️ IMPORTANTE

1. **Nunca commite o `.env` no Git!**
   - O arquivo `.gitignore` já deve ter `.env` (verifique)

2. **Prefixo `VITE_`**
   - No Vite, variáveis de ambiente precisam do prefixo `VITE_` para serem acessíveis no frontend

3. **Client Secret no Frontend?**
   - ⚠️ **NÃO RECOMENDADO**: O `VITE_MP_CLIENT_SECRET` não deveria estar no frontend
   - Em produção, use Edge Functions do Supabase para chamadas que precisam do secret

---

## 🔧 Configuração no Supabase

### 1. Configurar Redirect URI no Mercado Pago

Antes de usar, você precisa configurar a URL de callback no Mercado Pago:

1. No [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá na sua aplicação
3. Procure por **"URLs de redirecionamento"** ou **"Redirect URIs"**
4. Adicione:
   ```
   http://localhost:5173/owner/settings?mp_callback=true
   ```
   (Para desenvolvimento)

   E para produção:
   ```
   https://seudominio.com/owner/settings?mp_callback=true
   ```

### 2. Variáveis de Ambiente no Supabase (Edge Functions)

Se você quiser usar variáveis de ambiente no Supabase (Edge Functions):

1. No Supabase Dashboard
2. Vá em **Settings** > **Edge Functions** > **Secrets**
3. Adicione as variáveis:

#### ⚠️ IMPORTANTE: Nomes das Variáveis

O Supabase **NÃO permite** nomes que começam com `SUPABASE_` (reservado para uso interno).

**✅ Use estes nomes:**
- `SERVICE_ROLE_KEY` (ao invés de `SUPABASE_SERVICE_ROLE_KEY`)
- `MP_CLIENT_ID`
- `MP_CLIENT_SECRET`

**❌ NÃO use:**
- `SUPABASE_SERVICE_ROLE_KEY` ❌
- `SUPABASE_URL` ❌
- `SUPABASE_ANON_KEY` ❌

**Exemplo de configuração:**
```
Name: SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```
Name: MP_CLIENT_ID
Value: 1234567890123456
```

```
Name: MP_CLIENT_SECRET
Value: AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

---

## 🔐 Segurança - Boas Práticas

### ✅ O que PODE ir no Frontend (.env com VITE_)

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_MP_CLIENT_ID`

### ❌ O que NÃO DEVE ir no Frontend

- ❌ `SERVICE_ROLE_KEY` (sempre no backend, sem prefixo SUPABASE_)
- ❌ `MP_CLIENT_SECRET` (idealmente no backend)

### 🛡️ Solução Recomendada

Para operações que precisam do `MP_CLIENT_SECRET`:

1. **Crie Edge Functions no Supabase**
2. **Armazene o secret nas variáveis de ambiente do Supabase**
3. **Chame a Edge Function do frontend**
4. **A Edge Function usa o secret de forma segura**

---

## 📍 Resumo Rápido

### Onde Pegar Cada Chave

| Chave | Onde Pegar |
|-------|------------|
| `SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon public |
| `SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role secret<br>⚠️ No Dashboard aparece como "service_role", mas nas Edge Functions use `SERVICE_ROLE_KEY` (sem prefixo SUPABASE_) |
| `MP_CLIENT_ID` | Mercado Pago Developers > Suas aplicações > Credenciais |
| `MP_CLIENT_SECRET` | Mercado Pago Developers > Suas aplicações > Credenciais |

### Onde Colocar Cada Chave

| Chave | Onde Colocar |
|-------|--------------|
| `VITE_SUPABASE_URL` | Arquivo `.env` na raiz do projeto |
| `VITE_SUPABASE_ANON_KEY` | Arquivo `.env` na raiz do projeto |
| `VITE_MP_CLIENT_ID` | Arquivo `.env` na raiz do projeto |
| `VITE_MP_CLIENT_SECRET` | Arquivo `.env` (ou melhor: Edge Function) |
| `SERVICE_ROLE_KEY` | Edge Functions do Supabase (variáveis de ambiente) |

---

## 🧪 Testando as Configurações

### 1. Verificar se o .env está sendo lido

No seu código TypeScript/JavaScript:

```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('MP Client ID:', import.meta.env.VITE_MP_CLIENT_ID);
```

### 2. Testar Conexão com Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Testar conexão
const { data, error } = await supabase.from('businesses').select('count');
console.log('Conexão Supabase:', error ? '❌ Erro' : '✅ OK');
```

### 3. Verificar se as chaves estão corretas

- ✅ Supabase: As chaves devem começar com `eyJ...`
- ✅ Mercado Pago: Client ID é numérico, Client Secret é alfanumérico

---

## 🚨 Troubleshooting

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave completa (sem espaços)
- ✅ Verifique se está usando `VITE_` no início
- ✅ Reinicie o servidor de desenvolvimento após criar/editar `.env`

### Erro: "Client ID not found" (Mercado Pago)
- ✅ Verifique se o Client ID está correto
- ✅ Verifique se a aplicação está ativa no Mercado Pago

### Erro: "Redirect URI mismatch"
- ✅ Configure a URL de redirect no Mercado Pago
- ✅ Use exatamente a mesma URL (com ou sem trailing slash)

---

## 📚 Links Úteis

- [Supabase Dashboard](https://app.supabase.com)
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)

---

**⚠️ Lembre-se**: Nunca commite arquivos `.env` com chaves reais no Git!
