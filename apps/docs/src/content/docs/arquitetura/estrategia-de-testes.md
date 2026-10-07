---
title: Estratégia de Testes SOTA
description: Metodologia de testes caixa-cinza e integração com PGlite (WASM Postgres in-memory) e testes E2E com Playwright.
---

A plataforma Orc'estra Desafios adota uma estratégia de testes de ponta (**State of the Art - SOTA**) projetada para maximizar a confiança sem sacrificar a velocidade de desenvolvimento.

---

## 1. O Dilema dos Testes em Aplicações Postgres

Geralmente, times de engenharia enfrentam três abordagens com sérias limitações:
1. **Mocks de Banco (Drizzle/ORM mockado)**: Frágeis, mascaram erros de queries complexas, joins e integridade referencial.
2. **SQLite em Memória**: Incompatível com tipos e funções nativas do PostgreSQL (como enums, JSONB, schemas e extensões).
3. **Containers Docker (`testcontainers`)**: Fidedignos, porém lentos (adicionam dezenas de segundos no início de cada execução e exigem daemon Docker no ambiente).

---

## 2. A Solução: PGlite (PostgreSQL WASM in-memory)

Adotamos o **`@electric-sql/pglite`**: o motor oficial do PostgreSQL 16 compilado diretamente para WebAssembly.

### Benefícios:
- **100% Compatível com PostgreSQL**: Executa o parser e o motor real do Postgres.
- **Ultra-Rápido**: Instancia um novo banco em milissegundos, permitindo que a suíte de 37 testes de integração execute em menos de 5 segundos.
- **Zero Dependências Externas**: Não requer Docker nem processos locais em execução.
- **Execução Real de Migrações**: Cada suite cria uma base efêmera e executa todos os arquivos SQL reais de `packages/db/drizzle/`, garantindo que o schema em produção seja idêntico ao testado.

```typescript
// tests/helpers/test-db.ts
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@orcestra-desafios/db/schema";

export async function createTestDatabase() {
  const client = new PGlite();
  // Aplica migrações SQL reais do Drizzle
  await applyRealMigrations(client);
  const db = drizzle({ client, schema });
  return { db, client };
}
```

---

## 3. Estrutura da Suíte de Testes

```
tests/
├── e2e/                           # Testes End-to-End com Playwright
│   ├── auth.setup.ts              # Setup e seed de autenticação E2E
│   ├── auth.spec.ts               # Fluxos de login, cadastro e validações
│   ├── dashboard.spec.ts          # Renderização de desafios e trilhas
│   ├── challenge-flow.spec.ts     # Visualização com spoiler e submissão
│   ├── ranking.spec.ts            # Tabela de classificação e filtros
│   ├── profile.spec.ts            # Edição de perfil e visualização de pontos
│   └── admin.spec.ts              # Painel administrativo e moderação
│
├── integration/                   # Testes de Integração e Caixa-Cinza
│   ├── auth.test.ts               # Sessões, validação de tokens e usuários
│   ├── user.test.ts               # Perfil, trilhas e listagens
│   ├── challenge.test.ts          # Desafios, spoilers, semanas e submissões
│   ├── admin.test.ts              # Permissões, criação e moderação de desafios
│   ├── ranking.test.ts            # Cálculo de pontuação e critérios de desempate
│   └── cloudinary.test.ts         # Geração segura de assinaturas de upload
│
└── helpers/                       # Utilitários compartilhados de testes
    ├── factories.ts               # Fábricas de dados falsos sem repetição
    ├── mock-cloudinary.ts         # Mock determinístico da API Cloudinary
    ├── personas.ts                # Personas pré-configuradas (Admin, Membro)
    ├── test-context.ts            # Injeção do createCaller para tRPC Routers
    └── test-db.ts                 # Instanciação isolada do banco PGlite
```

---

## 4. Testes Caixa-Cinza com `createCaller` do tRPC

Em vez de disparar requisições HTTP via rede (que adicionam latência desnecessária aos testes de lógica de negócios), instanciamos o `createCaller` diretamente contra o roteador tRPC fornecendo o contexto de teste:

```typescript
const { db } = await createTestDatabase();
const ctx = createTestContext({ db, user: normalUserPersona });
const caller = appRouter.createCaller(ctx);

// Invoca a mutação diretamente com type safety estrita
const result = await caller.challenge.submit({
  challengeId: "desafio-1",
  content: "console.log('solução')",
});

expect(result.status).toBe("PENDING");
```

Isso testa simultaneamente:
1. Validação de inputs do schema Zod.
2. Middlewares de autenticação e controle de acesso (RBAC).
3. Regras de negócio do roteador.
4. Queries e integridade do banco de dados Drizzle + Postgres.

---

## 5. Testes E2E com Playwright

Os testes E2E validam a experiência do usuário final nos navegadores Chromium Desktop e Mobile:
- **Fluxos Críticos**: Acesso autenticado, proteção contra spoiler em soluções de desafios, formulários reativos e navegação por teclado.
- **Configuração**: `playwright.config.ts` integrado ao servidor local da aplicação Next.js.

