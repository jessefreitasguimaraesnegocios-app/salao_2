# 🔧 Troubleshooting - Meu Salão App

Guia para resolver problemas comuns.

---

## ❌ Erro: "An API Key must be set when running in a browser"

### Causa
O Supabase está sendo inicializado sem as variáveis de ambiente configuradas.

### Solução

#### 1. Verificar arquivo `.env`

Certifique-se de que o arquivo `.env` na raiz do projeto contém:

```env
VITE_SUPABASE_URL=https://ujglqhgpvcrudieosyxz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2xxaGdwdmNydWRpZW9zeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjI2ODIsImV4cCI6MjA4NDUzODY4Mn0.364QR3M2WZGX0xPXEMiCwhwmdAi2rlYKiFSgAO7VW94
VITE_MP_CLIENT_ID=2851977731635151
VITE_MP_CLIENT_SECRET=seu_client_secret_aqui
```

#### 2. Verificar se as variáveis estão sendo lidas

Abra o console do navegador (F12) e execute:

```javascript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Se retornar `undefined`**:
- ✅ Verifique se o arquivo `.env` está na raiz do projeto
- ✅ Verifique se os nomes começam com `VITE_`
- ✅ Reinicie o servidor de desenvolvimento (`npm run dev`)
- ✅ Limpe o cache: `npm run build` e depois `npm run dev`

#### 3. Verificar no Vercel (se já fez deploy)

Se o erro está acontecendo no Vercel:

1. Vá em **Settings** > **Environment Variables**
2. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
3. Verifique se estão marcadas para **Production**, **Preview** e **Development**
4. Faça um novo deploy após adicionar/atualizar

#### 4. Verificar se o pacote está instalado

```bash
npm install @supabase/supabase-js
```

---

## ❌ Erro: "Failed to fetch" ou CORS

### Solução

1. Verifique se `VITE_SUPABASE_URL` está correto
2. Verifique se `VITE_SUPABASE_ANON_KEY` está correto
3. No Supabase Dashboard, vá em **Settings** > **API** > **CORS**
4. Adicione seu domínio (ou `*` para desenvolvimento)

---

## ❌ Erro: "Invalid API key"

### Solução

1. Verifique se copiou a chave completa (sem espaços)
2. Verifique se não há quebras de linha na chave
3. Verifique se está usando `VITE_` no início do nome
4. Reinicie o servidor após editar `.env`

---

## ❌ Erro: Variáveis de ambiente não funcionam no Vercel

### Solução

1. No Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as variáveis com `VITE_` no início
3. Marque para **Production**, **Preview** e **Development**
4. Faça um novo deploy (as variáveis não são aplicadas em deploys existentes)

---

## ❌ Erro: Build falha no Vercel

### Solução

1. Verifique logs do build no Vercel
2. Verifique se todas as dependências estão no `package.json`
3. Tente fazer build localmente: `npm run build`
4. Verifique se não há erros de TypeScript: `npm run build`

---

## ❌ Erro: Webhook não funciona

### Solução

1. Verifique se a Edge Function está deployada no Supabase
2. Verifique se a URL do webhook está correta no Mercado Pago
3. Verifique logs da Edge Function no Supabase Dashboard
4. Verifique se os secrets estão configurados (`SERVICE_ROLE_KEY`)

---

## ✅ Verificações Rápidas

### No Console do Navegador

```javascript
// Verificar variáveis de ambiente
console.log('Env vars:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  MP_CLIENT_ID: import.meta.env.VITE_MP_CLIENT_ID
});

// Verificar se Supabase está inicializado
import('./services/supabaseClient').then(({ supabase }) => {
  console.log('Supabase client:', supabase);
});
```

### No Terminal

```bash
# Verificar se .env existe
cat .env

# Verificar se variáveis estão sendo lidas
npm run dev
# (depois abra o console do navegador)
```

---

## 📞 Ainda com problemas?

1. Verifique os logs do navegador (F12 > Console)
2. Verifique os logs do servidor (terminal)
3. Verifique os logs do Vercel (se deployado)
4. Verifique os logs do Supabase (Edge Functions)

---

**💡 Dica**: Sempre reinicie o servidor de desenvolvimento após alterar o `.env`!
