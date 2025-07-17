# Guia de Configuração para Deploy no Vercel

## 📋 Código Atual Enviado para GitHub

✅ **SYNC COMPLETO** - 93 arquivos enviados para https://github.com/crisnabto/bto-expenses
✅ Código funcionando perfeitamente no preview local
✅ Todos os componentes, hooks e páginas atualizados
✅ Sistema de autenticação completo

## 🔧 Configurações Necessárias para Deploy

### 1. Configurar URLs no Supabase

Acesse seu projeto no Supabase: https://supabase.com/dashboard

#### **Authentication Settings**
1. Vá em **Authentication** → **URL Configuration**
2. **Site URL**: Cole a URL do seu deploy do Vercel
   ```
   https://seu-projeto.vercel.app
   ```
3. **Redirect URLs**: Adicione estas URLs (substitua pelo seu domínio):
   ```
   https://seu-projeto.vercel.app/auth-callback
   https://seu-projeto.vercel.app/login
   https://seu-projeto.vercel.app/
   ```

#### **OAuth Providers - Google**
1. Vá em **Authentication** → **Providers** → **Google**
2. Certifique-se que está **Enabled**
3. Configure as **Redirect URLs** no Google Cloud (próximo passo)

### 2. Configurar URLs no Google Cloud Console

Acesse: https://console.cloud.google.com/apis/credentials

#### **OAuth 2.0 Client**
1. Clique no seu **OAuth 2.0 Client ID** (usado para o Supabase)
2. Em **Authorized JavaScript origins**, adicione:
   ```
   https://seu-projeto.vercel.app
   ```
3. Em **Authorized redirect URIs**, adicione:
   ```
   https://qsbxwyjulqlfeeftixrn.supabase.co/auth/v1/callback
   ```

### 3. Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings** → **Environment Variables** e configure:

```
DATABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
```

### 4. Deploy no Vercel

1. Conecte seu repositório GitHub no Vercel
2. Configure o **Build Command**: `npm run build`
3. Configure o **Output Directory**: `dist`
4. Faça o deploy

## 🚀 Processo de Deploy

### Passo a Passo:

1. **Fazer deploy no Vercel primeiro** para obter a URL
2. **Pegar a URL do deploy** (ex: https://bto-expenses.vercel.app)
3. **Configurar no Supabase** com essa URL
4. **Configurar no Google Cloud** com essa URL
5. **Testar o login** na URL de produção

## 🔍 Troubleshooting

### Se o Google OAuth não funcionar:

1. **Verificar URLs**: Certifique-se que todas as URLs estão corretas
2. **Aguardar propagação**: Pode demorar alguns minutos para as mudanças surtirem efeito
3. **Verificar Console**: Abra o console do navegador para ver erros específicos
4. **Testar em modo anônimo**: Para evitar cache do navegador

### Se aparecer erro de CORS:

1. Verifique se a URL está configurada corretamente no Supabase
2. Certifique-se que não há "/" no final da URL
3. Verifique se o domínio está exatamente igual no Google Cloud

## 💡 Dicas Importantes

- **URLs devem ser exatas**: Sem "/" no final
- **Aguarde propagação**: Mudanças podem demorar 5-10 minutos
- **Teste em modo anônimo**: Para evitar cache
- **Verifique console**: Sempre abra o console do navegador para debug

## 🎯 Resultado Esperado

Após configurar tudo:
1. ✅ Deploy funciona corretamente
2. ✅ Google OAuth funciona na produção
3. ✅ Apenas emails autorizados conseguem acessar
4. ✅ Todas as funcionalidades operacionais

---

**📞 Se precisar de ajuda**, me avise qual erro específico está aparecendo!