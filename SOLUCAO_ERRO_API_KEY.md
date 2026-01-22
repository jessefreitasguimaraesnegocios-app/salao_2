# 🔧 Solução: "An API Key must be set when running in a browser"

## 🎯 Problema

O erro ocorre quando o Supabase tenta inicializar sem as variáveis de ambiente configuradas.

## ✅ Solução Passo a Passo

### 1. Verificar arquivo `.env`

Certifique-se de que existe um arquivo `.env` na **raiz do projeto** com:

```env
VITE_SUPABASE_URL=https://ujglqhgpvcrudieosyxz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2xxaGdwdmNydWRpZW9zeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjI2ODIsImV4cCI6MjA4NDUzODY4Mn0.364QR3M2WZGX0xPXEMiCwhwmdAi2rlYKiFSgAO7VW94
VITE_MP_CLIENT_ID=2851977731635151
VITE_MP_CLIENT_SECRET=seu_client_secret_aqui
```

### 2. Verificar localização do arquivo

O arquivo `.env` deve estar na mesma pasta que:
- `package.json`
- `vite.config.ts`
- `App.tsx`

**Estrutura correta:**
```
salao_2/
├── .env          ← AQUI!
├── package.json
├── vite.config.ts
├── App.tsx
└── ...
```

### 3. Reiniciar o servidor

**⚠️ IMPORTANTE**: Após criar ou editar o `.env`, você DEVE reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

### 4. Verificar no console do navegador

Abra o console (F12) e execute:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada ✅' : 'Não configurada ❌');
```

**Se retornar `undefined`**:
- ✅ Verifique se o arquivo está na raiz
- ✅ Verifique se os nomes começam com `VITE_`
- ✅ Reinicie o servidor
- ✅ Limpe o cache do navegador (Ctrl+Shift+R)

### 5. Verificar sintaxe do `.env`

O arquivo `.env` deve ter:
- ✅ Sem espaços antes ou depois do `=`
- ✅ Sem aspas (a menos que o valor tenha espaços)
- ✅ Uma variável por linha
- ✅ Sem comentários na mesma linha (use `#` em linha separada)

**✅ Correto:**
```env
VITE_SUPABASE_URL=https://ujglqhgpvcrudieosyxz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**❌ Incorreto:**
```env
VITE_SUPABASE_URL = https://...  # Espaços ao redor do =
VITE_SUPABASE_ANON_KEY="eyJ..."  # Aspas desnecessárias
```

### 6. Limpar cache e rebuild

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install

# Limpar cache do Vite
rm -rf dist
rm -rf .vite

# Rebuild
npm run build
npm run dev
```

### 7. Verificar se o pacote está instalado

```bash
npm install @supabase/supabase-js
```

---

## 🚀 Se estiver no Vercel

### Configurar variáveis no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá no seu projeto
3. **Settings** > **Environment Variables**
4. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Marque para **Production**, **Preview** e **Development**
6. **Faça um novo deploy** (variáveis não são aplicadas em deploys existentes)

---

## ✅ Verificação Final

Após seguir os passos acima:

1. **Reinicie o servidor**: `npm run dev`
2. **Abra o console do navegador** (F12)
3. **Verifique se aparece**: `✅ Cliente Supabase inicializado: https://...`
4. **Se aparecer erro**, verifique a mensagem no console

---

## 🆘 Ainda com problema?

1. Verifique o console do navegador para mensagens de erro específicas
2. Verifique o terminal onde o `npm run dev` está rodando
3. Verifique se o arquivo `.env` não está sendo ignorado pelo Git
4. Tente criar um novo arquivo `.env` do zero

---

**💡 Dica**: Sempre reinicie o servidor após alterar o `.env`!
