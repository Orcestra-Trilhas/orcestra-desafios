---
title: Onboarding & Setup Local
description: Guia prático para clonar, configurar variáveis de ambiente e rodar o projeto localmente.
---

Este guia orienta o setup inicial do monorepo **Orc'estra Desafios** para desenvolvimento local.

---

## 1. Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js**: Versão 22 LTS ou superior (`node -v`).
- **npm**: Versão 10 ou superior (`npm -v`).
- **Git**: Para versionamento e envio de branches.

---

## 2. Clonagem e Instalação

```bash
# Clone o repositório
git clone https://github.com/Orcestra-Trilhas/orcestra-desafios.git
cd orcestra-desafios

# Instale as dependências de todos os workspaces
npm install
```

O comando `npm install` executa automaticamente o hook `postinstall` do **Varlock**, sincronizando a tipagem das variáveis de ambiente em `apps/web/src/env.ts` e `packages/db/src/env.ts`.

---

## 3. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` dentro de `apps/web/` (ou copie a partir do esquema):

```bash
# apps/web/.env
NODE_ENV=development

# Conexão com o banco de dados (Neon Postgres)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Segredo de criptografia de sessão (mínimo 32 caracteres)
BETTER_AUTH_SECRET="uma-chave-secreta-com-no-minimo-32-caracteres"
BETTER_AUTH_URL="http://localhost:3001"

# Upload de imagens de demonstração (opcional para desenvolvimento básico)
CLOUDINARY_CLOUD_NAME="demo"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="secret"
```

:::tip
Para a suíte de testes de integração (`npm run test`), você não precisa de banco em nuvem nem de credenciais externas: os testes utilizam automaticamente o motor **PGlite** (PostgreSQL WASM) em memória.
:::

Sempre que você alterar ou adicionar variáveis em um arquivo `.env.schema`, gere novamente os tipos TypeScript:

```bash
npm run env:generate
```

---

## 4. Banco de Dados e Migrações (Drizzle ORM)

O schema relacional reside em `packages/db/src/schema/`. Os comandos principais são executados a partir da raiz:

```bash
# Cria um novo arquivo de migração SQL após você editar o schema
npm run db:generate

# Aplica as migrações SQL pendentes no banco configurado no DATABASE_URL
npm run db:migrate

# Sincroniza o schema diretamente sem gerar arquivo de migração (útil em branches de rascunho)
npm run db:push

# Abre a interface gráfica do Drizzle Studio no navegador
npm run db:studio
```

---

## 5. Executando os Serviços Locais

| Aplicação | Comando | Endereço | Descrição |
| :--- | :--- | :--- | :--- |
| **Aplicação Web** | `npm run dev:web` | `http://localhost:3001` | Next.js 16 (App Router, tRPC, UI) |
| **Documentação** | `npm run dev:docs` | `http://localhost:3002` | Astro + Starlight |
| **Monorepo Completo** | `npm run dev` | Ambas | Roda web e docs em paralelo |

Para iniciar o desenvolvimento da aplicação web:

```bash
npm run dev:web
```

---

## 6. Fluxo Diário de Comandos

```bash
# Verifica regras de linting e formatação com Ultracite (Biome)
npm run check

# Corrige automaticamente problemas de formatação e linting
npm run fix

# Checa erros de tipagem em todo o monorepo via TypeScript
npm run check-types

# Roda os testes de integração com PGlite (ultra-rápido)
npm run test

# Roda os testes de integração em modo contínuo (TDD)
npm run test:watch

# Roda os testes de ponta a ponta com Playwright
npm run test:e2e
```

---

## 7. Próximas Leituras

- [Convenções de Código & Qualidade](/orcestra-desafios/guias/convencoes/): Regras do Biome, padrão de commits e convenções TypeScript.
- [Arquitetura do Monorepo](/orcestra-desafios/arquitetura/visao-geral/): Entenda a separação entre apps e packages.
- [Fluxo de Dados & Type Safety](/orcestra-desafios/arquitetura/fluxo-de-dados/): Como o tRPC conecta o banco ao frontend sem geração manual de tipos.
