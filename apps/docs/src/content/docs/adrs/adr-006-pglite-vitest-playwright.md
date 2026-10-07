---
title: "ADR-006: PGlite WASM, Vitest e Playwright para Testes SOTA"
description: Registro de decisão arquitetural sobre a infraestrutura de testes automatizados com PGlite, Vitest e Playwright.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A confiabilidade da plataforma depende de testes que validem regras de negócio complexas:
- Cálculo e desempate de pontuação no ranking.
- Submissão com proteção anti-spoiler em soluções.
- Permissões de moderação administrativa.
- Fluxos de autenticação e expiração de sessão.

O desafio central residia em como testar o banco de dados PostgreSQL sem cair em armadilhas de performance (testes lentos que desestimulam execução frequente) ou fragilidade (mocks que não testam o SQL de verdade).

---

## Decisão Arquitetural
Adotar uma arquitetura de testes em duas camadas complementares:

1. **Camada de Integração & Caixa-Cinza**:
   - **Vitest**: Executor ultrarrápido nativo para ESM e TypeScript.
   - **`@electric-sql/pglite`**: Motor do PostgreSQL 16 compilado em WebAssembly. Cada arquivo de teste recebe uma instância isolada em memória onde as migrações SQL reais do Drizzle são aplicadas em menos de 100 milissegundos.
   - **`tRPC createCaller`**: Invocação direta dos procedimentos de API com contexto injetado, exercitando Zod, middlewares, ORM e banco de forma unificada.

2. **Camada End-to-End (E2E)**:
   - **Playwright**: Execução de testes de ponta a ponta simulando a experiência do usuário nos navegadores Desktop Chromium e Mobile Chromium.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **Jest** | Configuração pesada para ESM moderno e monorepos TypeScript; execução consideravelmente mais lenta do que o Vitest. |
| **Testcontainers / Docker PostgreSQL** | Excelente fidelidade, mas exige instalação e execução do Docker daemon na máquina do desenvolvedor; adiciona 20 a 40 segundos a cada bateria de testes, quebrando o feedback loop rápido. |
| **SQLite em memória (`better-sqlite3`)** | O Drizzle precisaria de schemas duplicados ou adaptados; incompatível com tipos PostgreSQL específicos como enums nativos, `timestamp with time zone` e operadores relacionais do Postgres. |
| **Cypress (para E2E)** | Arquitetura mais lenta de controle de browser em comparação com a automação multiprocesso nativa via Chrome DevTools Protocol do Playwright. |

---

## Consequências

### Positivas
- Bateria completa de 37 testes de integração executada em menos de 5 segundos.
- Zero dependência de Docker para rodar testes completos localmente ou no GitHub Actions.
- Segurança máxima de que qualquer migração quebrada ou query inválida falhará imediatamente nos testes.
- Cobertura de cenários mobile e desktop em testes E2E.

### Negativas / Trade-offs & Mitigações
- **Diferenças sutis do PGlite**: Embora seja o motor oficial do Postgres, certas extensões de terceiros compiladas em C não estão disponíveis por padrão no WASM. No entanto, para todas as funcionalidades relacionais do projeto, o comportamento é 100% idêntico ao Neon Postgres.

