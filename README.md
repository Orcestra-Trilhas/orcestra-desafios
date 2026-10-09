# Orc'estra Desafios 🎮⚡

> Plataforma gamificada de capacitação técnica, desafios de código e trilhas de desenvolvimento da **Orc'estra Gamificação**.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC v11](https://img.shields.io/badge/tRPC-v11-2596BE?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![Neon Postgres](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-blue?style=for-the-badge)](https://better-auth.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![Ultracite](https://img.shields.io/badge/Ultracite-Biome-FF6B6B?style=for-the-badge)](https://biomejs.dev/)

---

## 📚 Documentação Técnica Interativa

A documentação completa do projeto é servida via **Astro + Starlight** em `apps/docs`.

- **Online (GitHub Pages)**: [orcestra-trilhas.github.io/orcestra-desafios](https://orcestra-trilhas.github.io/orcestra-desafios/)
- **Localmente** (porta `3002`):

```bash
npm run dev:docs
```

Nele você encontrará:
- **[Onboarding & Setup](apps/docs/src/content/docs/guias/onboarding.md)**: Como configurar o ambiente e variáveis do zero.
- **[Convenções de Código & Qualidade](apps/docs/src/content/docs/guias/convencoes.md)**: Padrões de código governados por Ultracite/Biome.
- **[Arquitetura do Monorepo](apps/docs/src/content/docs/arquitetura/visao-geral.md)**: Relação entre pacotes e fluxos de dados.
- **[Estratégia de Testes SOTA](apps/docs/src/content/docs/arquitetura/estrategia-de-testes.md)**: Testes de integração WASM com PGlite e E2E com Playwright.
- **[Architecture Decision Records (ADRs)](apps/docs/src/content/docs/adrs/)**:
  - `ADR-001`: Next.js 16 com App Router e React 19
  - `ADR-002`: tRPC v11 para Comunicação Cliente-Servidor Type-Safe
  - `ADR-003`: Neon Serverless Postgres e Drizzle ORM
  - `ADR-004`: Better Auth para Gestão de Identidade e Sessões
  - `ADR-005`: Tailwind CSS v4, Design System Multi-Temas e Motor de Temas Customizados
  - `ADR-006`: PGlite WASM, Vitest e Playwright para Testes SOTA
  - `ADR-007`: Ultracite e Biome para Governança e Qualidade de Código

---

## 🏛️ Estrutura do Monorepo

```
orcestra-desafios/
├── apps/
│   ├── web/         # Aplicação principal Next.js 16 (App Router, PWA, UI, tRPC client)
│   └── docs/        # Portal de documentação técnica com Astro e Starlight
├── packages/
│   ├── api/         # Roteadores tRPC (admin, auth, challenge, ranking, user, cloudinary)
│   ├── auth/        # Configuração centralizada do Better Auth e sessões
│   ├── db/          # Schemas do Drizzle ORM, migrações SQL e cliente Neon Postgres
│   ├── ui/          # Componentes base (shadcn/Radix) e design system temático
│   └── config/      # Configurações TypeScript base compartilhadas
└── tests/           # Suíte de testes SOTA
    ├── integration/ # Testes de integração e caixa-cinza isolados via PGlite WASM
    ├── e2e/         # Testes ponta a ponta com Playwright (Desktop & Mobile)
    └── helpers/     # Factories, personas e mocks determinísticos
```

---

## 🚀 Inicialização Rápida

### 1. Pré-requisitos
- **Node.js**: `>= 22.0.0`
- **npm**: `>= 10.0.0`

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/Orcestra-Trilhas/orcestra-desafios.git
cd orcestra-desafios

# Instale as dependências de todos os workspaces
npm install
```

### 3. Executando os Serviços
```bash
# Iniciar a aplicação web (porta 3001)
npm run dev:web

# Iniciar o portal de documentação (porta 3002)
npm run dev:docs

# Iniciar todos os apps simultaneamente
npm run dev
```

---

## 🧪 Suíte de Testes SOTA

Nossa infraestrutura de testes adota **PGlite** (PostgreSQL 16 compilado para WebAssembly), executando as migrações SQL reais do Drizzle em memória com isolamento total em menos de 5 segundos, sem dependência de Docker.

```bash
# Executar todos os testes de integração (37 testes)
npm run test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura de código
npm run test:coverage

# Executar testes End-to-End com Playwright (Chromium Desktop e Mobile)
npm run test:e2e

# Executar toda a suíte (Integração + E2E)
npm run test:all
```

---

## 🎨 Design System e Temas

A plataforma conta com quatro esquemas de cores completos:

1. **Orc'estra Dark (Padrão)**: Fundo carvão suave florestal (`#080f07`), cards verde escuro aveludados (`#0f1d0d`) e realces em verde claro vibrante (`#3bc90c`) com contraste AAA.
2. **Orc'estra Light**: Branco linho limpo (`#f9fbf9`), tipografia floresta profunda (`#071a06`) e acentos de menta.
3. **Fauvismo**: Vanguarda noturna inspirada em Henri Matisse (*"La Danse"*), com vermilion terracota ardente (`#d9381e`), azul cobalto mediterrâneo e amarelo solar.
4. **Pop Art**: Vanguarda inspirada na serigrafia de Andy Warhol (*The Factory*), com magenta Marilyn (`#ec4899`), ciano elétrico e amarelo banana.

---

## 🛠️ Scripts Principais

| Script | Descrição |
| :--- | :--- |
| `npm run dev:web` | Inicia o app Next.js na porta 3001 |
| `npm run dev:docs` | Inicia a documentação Starlight na porta 3002 |
| `npm run build` | Compila todos os pacotes e aplicações |
| `npm run build:docs` | Compila o site estático da documentação |
| `npm run test` | Roda testes de integração no Vitest com PGlite |
| `npm run test:e2e` | Roda testes ponta a ponta no Playwright |
| `npm run check` | Valida formatação e linting com Ultracite (Biome) |
| `npm run fix` | Corrige automaticamente problemas de estilo e lint |
| `npm run check-types` | Valida tipos TypeScript em todo o monorepo |
| `npm run db:generate` | Gera novas migrações SQL no Drizzle |
| `npm run db:migrate` | Executa migrações pendentes no banco |
| `npm run db:studio` | Abre o Drizzle Studio para visualização gráfica |

---

## ⚖️ Licença

Desenvolvido com 💚 pela equipe da **Orc'estra Gamificação**.
