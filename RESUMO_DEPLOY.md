# 📋 Resumo Rápido - Deploy Vercel

Guia rápido com apenas o essencial para fazer deploy.

---

## ⚡ Passos Rápidos

### 1. Conectar ao Vercel
1. Acesse [vercel.com](https://vercel.com)
2. **Add New Project** > Selecione `salao_2`
3. Clique em **Import**

### 2. Adicionar Variáveis de Ambiente

No Vercel, vá em **Environment Variables** e adicione:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://ujglqhgpvcrudieosyxz.supabase.co` | All |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2xxaGdwdmNydWRpZW9zeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjI2ODIsImV4cCI6MjA4NDUzODY4Mn0.364QR3M2WZGX0xPXEMiCwhwmdAi2rlYKiFSgAO7VW94` | All |
| `VITE_MP_CLIENT_ID` | `2851977731635151` | All |
| `VITE_MP_CLIENT_SECRET` | `seu_client_secret_aqui` | All |

**⚠️ Substitua `seu_client_secret_aqui` pelo valor real!**

### 3. Deploy
1. Clique em **Deploy**
2. Aguarde build completar
3. Anote a URL fornecida

### 4. Atualizar URLs no Mercado Pago

Após obter a URL do Vercel (ex: `https://salao-2.vercel.app`):

1. **Redirect URI**:
   ```
   https://salao-2.vercel.app/owner/settings?mp_callback=true
   ```

2. **Webhook URL** (não muda, é do Supabase):
   ```
   https://ujglqhgpvcrudieosyxz.supabase.co/functions/v1/mercado-pago-webhook
   ```

---

## ✅ Pronto!

Acesse a URL do Vercel e teste a aplicação.

---

**📚 Para mais detalhes, consulte `GUIA_DEPLOY_VERCEL.md`**
