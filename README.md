# BTO Expenses - Sistema de Gerenciamento de Despesas

Sistema completo para controle de despesas pessoais com interface intuitiva e visualizações em gráficos.

## Funcionalidades

- ✅ Cadastro e gerenciamento de despesas
- ✅ Categorização (Papai, Farmácia, Supermercado, Gasolina, Conte, Residência)
- ✅ Métodos de pagamento (Dinheiro, Cartão, PIX, Transferência)
- ✅ Gráfico de pizza com seleção de mês/ano
- ✅ Resumo por categoria
- ✅ Paginação da lista de despesas (15 por página)
- ✅ Layout responsivo para mobile e desktop
- ✅ Integração com Supabase para persistência de dados

## Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Banco de dados**: PostgreSQL (Supabase)
- **Build**: Vite
- **Deploy**: Vercel

## Deploy no Vercel

### 1. Preparação do Projeto

O projeto já está configurado para deploy no Vercel com:
- `vercel.json` - Configuração de build e rotas
- `api/index.ts` - Servidor API para Vercel
- `.vercelignore` - Arquivos ignorados no deploy

### 2. Configuração no Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:

```
DATABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_publica_supabase
NODE_ENV=production
```

### 3. Obtenção das Credenciais Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá em Settings > Database
4. Copie a "Connection string" na seção "Connection pooling"
5. Vá em Settings > API
6. Copie a "anon/public" key

### 4. Deploy

O Vercel detectará automaticamente as configurações e fará o deploy.

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos e schemas compartilhados
├── api/            # Endpoint para Vercel
└── dist/           # Build de produção
```

## Banco de Dados

O sistema utiliza PostgreSQL via Supabase com as seguintes tabelas:

- `expenses` - Despesas cadastradas
- `users` - Informações dos usuários (mock para desenvolvimento)

## Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou abra uma issue no repositório.