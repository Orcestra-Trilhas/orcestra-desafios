---
title: Onboarding & Setup Local
description: Guia passo a passo para configurar o ambiente de desenvolvimento local e executar a plataforma Orc'estra Desafios.
---

Este guia detalha o processo de inicialização e desenvolvimento local para novos colaboradores da plataforma **Orc'estra Desafios**.

## 1. Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- **Node.js**: Versão `>= 22.0.0` (recomendado Node 22 LTS ou superior).
- **npm**: Versão `>= 10.0.0` (gerenciador oficial configurado no monorepo).
- **Git**: Para versionamento de código e clone do repositório.
- **Conta no Neon Postgres**: Caso necessite de uma branch própria do banco em nuvem (para desenvolvimento local de testes, a suíte utiliza `@electric-sql/pglite` isolado em memória automaticamente).

---

## 2. Clonando o Repositório e Instalando Dependências

Clone o repositório e instale as dependências de todos os workspaces do monorepo:

```bash
# Clonar o repositório
git clone https://github.com/Orcestra-Trilhas/orcestra-desafios.git
cd orcestra-desafios

# Instalar dependências em todos os workspaces
npm install
```

O comando `npm install` executa automaticamente o hook `postinstall`:
```bash
varlock codegen --path ./apps/web/ && varlock codegen --path ./packages/db/
```
Isso garante que os esquemas e tipos tipados do Varlock sejam sincronizados para suas variáveis de ambiente.

---

## 3. Configuração de Variáveis de Ambiente

O projeto utiliza **Varlock** para validação tipada e segura de variáveis de ambiente.

1. Crie o arquivo `.env.local` na raiz e nos apps conforme necessário, ou utilize as variáveis padrão de desenvolvimento:

```sh
# Banco de Dados (Neon Postgres)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Autenticação (Better Auth)
BETTER_AUTH_SECRET="uma-chave-secreta-forte-com-no-minimo-32-caracteres"
BETTER_AUTH_URL="http://localhost:3001"

# Uploads de Mídia (Cloudinary - Opcional para desenvolvimento sem upload)
CLOUDINARY_CLOUD_NAME="demo"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="secret"
```

2. Gere os tipos do Varlock sempre que alterar o `.env.schema`:

```bash
npm run env:generate
```

---

## 4. Banco de Dados e Migrações (Drizzle ORM)

O projeto armazena o schema em `packages/db/src/schema/`. Para gerenciar o banco de dados:

- **Criar nova migração SQL** após modificar o schema:
  ```bash
  npm run db:generate
  ```
- **Aplicar migrações pendentes** no banco de dados configurado no `DATABASE_URL`:
  ```bash
  npm run db:migrate
  ```
- **Sincronizar schema diretamente** (útil em branches efêmeras de desenvolvimento):
  ```bash
  npm run db:push
  ```
- **Abrir Drizzle Studio** para inspecionar e editar dados via interface gráfica:
  ```bash
  npm run db:studio
  ```

---

## 5. Executando os Serviços em Desenvolvimento

A plataforma é composta por múltiplos apps que rodam em portas dedicadas:

| Serviço | Comando | Porta | Descrição |
| :--- | :--- | :--- | :--- |
| **Aplicação Web Principal** | `npm run dev:web` | `http://localhost:3001` | Next.js 16 (App Router, tRPC, UI) |
| **Documentação Técnica** | `npm run dev:docs` | `http://localhost:3002` | Astro + Starlight |
| **Todos os Serviços** | `npm run dev` | Várias | Inicia todos os apps em paralelo |

Para iniciar o desenvolvimento diário da interface:
```bash
npm run dev:web
```

Para visualizar a documentação interativa:
```bash
npm run dev:docs
```

---

## 6. Scripts e Comandos Mais Utilizados

O monorepo disponibiliza atalhos no `package.json` raiz:

```bash
# Executa a suíte de testes de integração com PGlite (rápida, isolada)
npm run test

# Executa testes em modo watch (ótimo para TDD)
npm run test:watch

# Gera relatório de cobertura de código
npm run test:coverage

# Executa os testes End-to-End com Playwright
npm run test:e2e

# Executa todos os testes (Integração + E2E)
npm run test:all

# Valida tipos TypeScript em todos os workspaces
npm run check-types

# Verifica problemas de linting e formatação com Ultracite (Biome)
npm run check

# Corrige automaticamente formatação e regras de linting
npm run fix
```

---

## 7. Próximos Passos

- Leia as [Convenções de Código & Qualidade](/orcestra-desafios/guias/convencoes/) para entender os padrões estritos de desenvolvimento.
- Conheça a [Arquitetura do Monorepo](/orcestra-desafios/arquitetura/visao-geral/) e a [Estratégia de Testes SOTA](/orcestra-desafios/arquitetura/estrategia-de-testes/).
