# ✅ Checklist de Deploy - Vercel

Use este checklist para garantir que tudo está configurado antes do deploy.

## 🔑 Variáveis de Ambiente no Vercel

### Supabase
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Valores verificados e corretos

### Mercado Pago
- [ ] `VITE_MP_CLIENT_ID` configurada
- [ ] `VITE_MP_CLIENT_SECRET` configurada (se usar)
- [ ] Valores verificados e corretos

### Configuração
- [ ] Todas as variáveis marcadas para **Production**, **Preview** e **Development**
- [ ] Nenhuma variável com espaços extras
- [ ] Nenhuma variável com quebras de linha

## 🗄️ Supabase

### Banco de Dados
- [ ] Schema SQL executado (`supabase_schema.sql`)
- [ ] Funções SQL executadas (`supabase_functions.sql`)
- [ ] Todas as tabelas criadas
- [ ] RLS habilitado e funcionando

### Edge Functions
- [ ] Edge Function `mercado-pago-webhook` deployada
- [ ] Secrets configurados:
  - [ ] `SERVICE_ROLE_KEY`
  - [ ] `MP_CLIENT_ID` (se necessário)
  - [ ] `MP_CLIENT_SECRET` (se necessário)
- [ ] URL da função obtida e anotada

## 💳 Mercado Pago

### Aplicação
- [ ] Aplicação criada no Mercado Pago Developers
- [ ] Client ID obtido
- [ ] Client Secret obtido

### URLs Configuradas
- [ ] **Redirect URI** configurado:
  ```
  https://seu-dominio.vercel.app/owner/settings?mp_callback=true
  ```
- [ ] **Webhook URL** configurado:
  ```
  https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
  ```
- [ ] Eventos selecionados (pagamentos)

## 🚀 Vercel

### Projeto
- [ ] Repositório conectado ao Vercel
- [ ] Framework detectado corretamente (Vite)
- [ ] Build settings verificados
- [ ] `vercel.json` presente no projeto

### Deploy
- [ ] Primeiro deploy realizado
- [ ] Build completou sem erros
- [ ] URL do deploy obtida
- [ ] Aplicação acessível

## 🧪 Testes Pós-Deploy

### Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Login funciona (cliente)
- [ ] Login funciona (owner)
- [ ] Login funciona (admin)

### Supabase
- [ ] Conexão com Supabase funciona
- [ ] Businesses aparecem
- [ ] Transações podem ser criadas
- [ ] RLS funcionando corretamente

### Mercado Pago
- [ ] OAuth funciona (conectar ao MP)
- [ ] Tokens sendo salvos
- [ ] Pagamentos podem ser criados
- [ ] Webhooks sendo recebidos

## 🔍 Verificações Finais

### Logs
- [ ] Logs do Vercel verificados (sem erros)
- [ ] Logs do Supabase verificados (sem erros)
- [ ] Logs da Edge Function verificados

### Performance
- [ ] Página carrega rapidamente
- [ ] Sem erros no console do navegador
- [ ] Imagens carregando corretamente

### Segurança
- [ ] Nenhuma chave secreta exposta no código
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] HTTPS funcionando (Vercel fornece automaticamente)

## 📝 URLs Finais

Anote aqui suas URLs:

- **URL do Vercel**: `https://________________.vercel.app`
- **URL do Supabase**: `https://________________.supabase.co`
- **URL da Edge Function**: `https://________________.supabase.co/functions/v1/mercado-pago-webhook`
- **Redirect URI configurado**: `https://________________.vercel.app/owner/settings?mp_callback=true`

---

**✅ Marque cada item conforme for completando!**
