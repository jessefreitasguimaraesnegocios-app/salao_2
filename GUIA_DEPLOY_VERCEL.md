# 🚀 Guia Completo de Deploy no Vercel - Meu Salão App

Este guia mostra passo a passo como fazer o deploy do Meu Salão App no Vercel com todas as configurações necessárias.

---

## 📋 Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Projeto no GitHub (já está feito ✅)
- [ ] Projeto configurado no Supabase
- [ ] Aplicação criada no Mercado Pago Developers
- [ ] Todas as chaves e secrets em mãos

---

## 🔑 Passo 1: Obter Todas as Chaves Necessárias

### 1.1 Chaves do Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** > **API**
3. Anote as seguintes chaves:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 Chaves do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Suas integrações** > **Suas aplicações**
3. Anote as seguintes chaves:

```
VITE_MP_CLIENT_ID=2851977731635151
VITE_MP_CLIENT_SECRET=seu_client_secret_aqui
```

**⚠️ IMPORTANTE**: O `VITE_MP_CLIENT_SECRET` não deveria estar no frontend em produção. Considere usar Edge Functions.

---

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New Project**
3. Selecione o repositório `salao_2`
4. Clique em **Import**

### 2.2 Configurar Build Settings

O Vercel detectará automaticamente o Vite. Verifique:

- **Framework Preset**: Vite
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build` (ou `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Configurar Variáveis de Ambiente

**⚠️ CRÍTICO**: Configure TODAS as variáveis antes de fazer deploy!

No Vercel, vá em **Environment Variables** e adicione:

#### Variáveis de Ambiente Obrigatórias

```env
# ============================================
# SUPABASE
# ============================================
VITE_SUPABASE_URL=https://ujglqhgpvcrudieosyxz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2xxaGdwdmNydWRpZW9zeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjI2ODIsImV4cCI6MjA4NDUzODY4Mn0.364QR3M2WZGX0xPXEMiCwhwmdAi2rlYKiFSgAO7VW94

# ============================================
# MERCADO PAGO
# ============================================
VITE_MP_CLIENT_ID=2851977731635151
VITE_MP_CLIENT_SECRET=seu_client_secret_aqui
```

#### Como Adicionar no Vercel

1. Na página de configuração do projeto
2. Vá em **Environment Variables**
3. Para cada variável:
   - **Key**: Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione todas (Production, Preview, Development)
4. Clique em **Add** para cada uma
5. **Salve** todas as variáveis

#### ⚠️ IMPORTANTE sobre VITE_MP_CLIENT_SECRET

**Em produção, o Client Secret não deveria estar no frontend!**

**Solução Recomendada**:
- Use Edge Functions do Supabase para operações que precisam do secret
- O secret deve estar apenas nos **Secrets do Supabase** (Edge Functions)
- O frontend chama a Edge Function, que usa o secret de forma segura

**Se precisar usar no frontend temporariamente**:
- Adicione `VITE_MP_CLIENT_SECRET` no Vercel
- Mas planeje migrar para Edge Functions o quanto antes

---

## 🔧 Passo 3: Configurar Build e Deploy

### 3.1 Verificar package.json

Certifique-se de que o `package.json` tem os scripts corretos:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3.2 Arquivo vercel.json

✅ **Já criado!** O arquivo `vercel.json` já está na raiz do projeto com as configurações corretas.

Ele configura:
- Build command
- Output directory
- Rewrites para SPA (Single Page Application)
- Headers de segurança

---

## 🌐 Passo 4: Configurar Domínio e URLs

### 4.1 Obter URL do Deploy

Após o deploy, você receberá uma URL como:
```
https://salao-2.vercel.app
```

### 4.2 Atualizar Redirect URI no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá na sua aplicação
3. Procure por **"URLs de redirecionamento"** ou **"Redirect URIs"**
4. Adicione a URL de produção:
   ```
   https://seu-dominio.vercel.app/owner/settings?mp_callback=true
   ```
   (Substitua `seu-dominio` pela URL real do Vercel)

### 4.3 Atualizar Webhook URL no Mercado Pago

1. No mesmo painel do Mercado Pago
2. Vá em **Webhooks** ou **Notificações**
3. Atualize a URL do webhook para:
   ```
   https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
   ```
   (Esta é a URL da Edge Function do Supabase, não do Vercel)

---

## ✅ Passo 5: Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] `SUPABASE_URL` correto
- [ ] `SUPABASE_ANON_KEY` correto
- [ ] `VITE_MP_CLIENT_ID` correto
- [ ] `VITE_MP_CLIENT_SECRET` correto (se usar)
- [ ] Schema SQL executado no Supabase
- [ ] Funções SQL executadas no Supabase
- [ ] Edge Function deployada no Supabase
- [ ] Secrets configurados no Supabase (SERVICE_ROLE_KEY, MP_CLIENT_ID, MP_CLIENT_SECRET)
- [ ] Webhook configurado no Mercado Pago
- [ ] Redirect URI configurado no Mercado Pago

---

## 🚀 Passo 6: Fazer o Deploy

1. No Vercel, clique em **Deploy**
2. Aguarde o build completar
3. Verifique se não há erros
4. Acesse a URL fornecida pelo Vercel

---

## 🧪 Passo 7: Testar Após Deploy

### 7.1 Testes Básicos

1. **Acessar a aplicação**
   - Abra a URL do Vercel
   - Verifique se a página carrega

2. **Testar Login**
   - Tente fazer login como cliente
   - Tente fazer login como owner
   - Tente fazer login como admin

3. **Testar Conexão Supabase**
   - Verifique se consegue ver businesses
   - Verifique se consegue criar transações

4. **Testar Mercado Pago**
   - Tente conectar um business ao Mercado Pago
   - Verifique se o OAuth funciona

### 7.2 Verificar Logs

No Vercel Dashboard:
- Vá em **Deployments** > Seu deploy > **Functions Logs**
- Verifique se há erros

No Supabase Dashboard:
- Vá em **Edge Functions** > **mercado-pago-webhook** > **Logs**
- Verifique se há erros

---

## 🔍 Passo 8: Troubleshooting

### Erro: "VITE_SUPABASE_URL is not defined"

**Solução**:
1. Verifique se a variável está configurada no Vercel
2. Verifique se o nome está correto (com `VITE_` no início)
3. Faça um novo deploy após adicionar

### Erro: "Failed to fetch" ou CORS

**Solução**:
1. Verifique se `VITE_SUPABASE_URL` está correto
2. Verifique se `VITE_SUPABASE_ANON_KEY` está correto
3. Verifique configurações de CORS no Supabase

### Erro: "Mercado Pago connection failed"

**Solução**:
1. Verifique se `VITE_MP_CLIENT_ID` está configurado
2. Verifique se o Redirect URI está correto no Mercado Pago
3. Verifique se a aplicação está ativa no Mercado Pago

### Erro: "Webhook not working"

**Solução**:
1. Verifique se a Edge Function está deployada
2. Verifique se a URL do webhook está correta no Mercado Pago
3. Verifique logs da Edge Function no Supabase

### Build falha no Vercel

**Solução**:
1. Verifique logs do build no Vercel
2. Verifique se todas as dependências estão no `package.json`
3. Verifique se não há erros de TypeScript
4. Tente fazer build localmente: `npm run build`

---

## 📝 Passo 9: Configurar Domínio Customizado (Opcional)

1. No Vercel Dashboard
2. Vá em **Settings** > **Domains**
3. Adicione seu domínio
4. Configure DNS conforme instruções
5. Aguarde propagação (pode levar até 24h)

---

## 🔐 Passo 10: Segurança em Produção

### 10.1 Variáveis Sensíveis

**⚠️ NUNCA** commite no Git:
- `.env` (já está no `.gitignore` ✅)
- Chaves secretas
- Tokens de acesso

### 10.2 Client Secret no Frontend

**⚠️ ATENÇÃO**: `VITE_MP_CLIENT_SECRET` não deveria estar no frontend.

**Solução Recomendada**:
- Use Edge Functions do Supabase para operações que precisam do secret
- O secret deve estar apenas nos secrets do Supabase
- O frontend chama a Edge Function, que usa o secret

### 10.3 Service Role Key

- **NUNCA** exponha no frontend
- Use apenas em Edge Functions
- Mantenha nos secrets do Supabase

---

## 📊 Passo 11: Monitoramento

### 11.1 Vercel Analytics (Opcional)

1. No Vercel Dashboard
2. Vá em **Analytics**
3. Ative para monitorar performance

### 11.2 Logs

- **Vercel**: Deployments > Functions Logs
- **Supabase**: Edge Functions > Logs
- **Mercado Pago**: Developers > Logs de notificações

---

## ✅ Checklist Final

- [ ] Deploy realizado com sucesso
- [ ] Aplicação acessível na URL do Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Login funcionando
- [ ] Conexão Supabase funcionando
- [ ] Conexão Mercado Pago funcionando
- [ ] Webhooks funcionando
- [ ] Redirect URI atualizado no Mercado Pago
- [ ] Webhook URL atualizado no Mercado Pago
- [ ] Testes realizados e passando

---

## 🎯 Resumo das URLs Necessárias

### URLs para Configurar no Mercado Pago

1. **Redirect URI (OAuth)**:
   ```
   https://seu-dominio.vercel.app/owner/settings?mp_callback=true
   ```

2. **Webhook URL**:
   ```
   https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
   ```
   (Esta é a URL da Edge Function do Supabase, não do Vercel!)

### Variáveis de Ambiente no Vercel

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_MP_CLIENT_ID=seu_client_id
VITE_MP_CLIENT_SECRET=seu_client_secret
```

---

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Vite no Vercel](https://vercel.com/docs/frameworks/vite)
- [Variáveis de Ambiente Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel
2. Verifique os logs no Supabase
3. Verifique a documentação
4. Consulte os guias:
   - `GUIA_WEBHOOKS.md`
   - `GUIA_CHAVES_API.md`
   - `SUPABASE_SETUP.md`

---

**🎉 Pronto para fazer deploy! Siga os passos acima e seu app estará no ar!**
