# Como Configurar as Variáveis de Ambiente no Netlify

Para que o Admin funcione em produção (no site deployado), você precisa adicionar as variáveis de ambiente no painel do Netlify:

## Passo a Passo:

1. **Acesse o Netlify Dashboard**
   - Vá para [app.netlify.com](https://app.netlify.com)
   - Entre no seu site

2. **Vá em Site Settings**
   - Clique em **"Site configuration"** ou **"Site settings"** 

3. **Adicione as Variáveis de Ambiente**
   - No menu lateral, clique em **"Environment variables"**
   - Clique em **"Add a variable"**

4. **Adicione CADA UMA destas variáveis:**

```
Key: VITE_PAGARME_SECRET_KEY
Value: sk_4d4bdc9df7e7458dbe6158ec679cbd4c

Key: VITE_PAGARME_ACCOUNT_ID
Value: acc_5b11l25f0s68jznv

Key: VITE_PAGARME_PUBLIC_KEY
Value: pk_test_1234567890

Key: VITE_ADMIN_PASSWORD
Value: admin123

Key: VITE_SUPABASE_URL
Value: https://jvtjmoymapshexecqzqa.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dGptb3ltYXBzaGV4ZWNxenFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODg2NjcsImV4cCI6MjA4MDU2NDY2N30.2zbJ1ZAgaNTZVhqQFJfRw5ByodMG0eW54fCx_VgNbs8
```

5. **Salvar e Fazer Redeploy**
   - Clique em **"Deploys"** no menu superior
   - Clique em **"Trigger deploy"** > **"Deploy site"**

6. **Aguarde o build finalizar** (alguns minutos)

7. **Teste o Admin** acessando `https://seu-site.netlify.app/admin`

---

## ⚠️ IMPORTANTE

Agora você **NÃO PRECISA** mais do `server.js` em produção! 

Tudo funciona direto:
- Frontend ⟷ Supabase (para dados)
- Frontend ⟷ Pagar.me (via Netlify Functions)

O `server.js` só é útil para desenvolvimento local.
