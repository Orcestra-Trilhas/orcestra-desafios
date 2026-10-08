---
title: "ADR-006: PGlite WASM, Vitest e Playwright para Testes Automatizados"
description: Registro de decisão arquitetural sobre a infraestrutura de testes de integração com PGlite em memória e testes E2E com Playwright.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma possui regras de negócio sensíveis que requerem validação contínua:
- Regras de desempate e acumulação de pontos no ranking.
- Trava de proteção contra spoiler em submissões de código.
- Moderação administrativa e permissões baseadas em papéis (RBAC).
- Autenticação e ciclo de vida de sessões.

A equipe precisava de uma suíte de testes que não dependesse de mocks frágeis de banco de dados nem introduzisse a lentidão de subir contêineres Docker a cada execução.

---

## Decisão Arquitetural
Adotar uma estratégia de testes em duas camadas:

1. **Testes de Integração em Memória com Vitest & PGlite**:
   - O `@electric-sql/pglite` roda o PostgreSQL 16 oficial compilado em WebAssembly diretamente no processo do Node.js.
   - Cada teste cria uma base efêmera e executa todas as migrações SQL reais da pasta `packages/db/src/migrations/` em dezenas de milissegundos.
   - O `createCaller` do tRPC executa os procedimentos de backend diretamente com contexto injetado, exercitando Zod, middlewares, queries Drizzle e o PostgreSQL em uma única chamada.

2. **Testes End-to-End com Playwright**:
   - Validação dos fluxos completos da interface em navegadores Chromium Desktop e Mobile.
   - Verificação de interações reais, acessibilidade por teclado e proteção contra spoilers.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **Mocks do Drizzle / ORM** | Frágeis e propensos a falso-positivos; não testam queries SQL reais, constraints de chave estrangeira nem funções do PostgreSQL. |
| **Testcontainers / Docker local** | Fidelidade excelente, mas adiciona overhead de 20 a 40 segundos por execução e exige o daemon do Docker ativo no ambiente do desenvolvedor. |
| **SQLite em memória (`better-sqlite3`)** | Dialeto SQL incompatível com tipos e recursos do PostgreSQL (sem suporte a enums nativos, timestamps com fuso horário e operadores JSONB). |
| **Jest** | Setup mais lento e verboso para monorepos modernos com ECMAScript Modules (ESM) e TypeScript em comparação ao Vitest. |

---

## Consequências

### Positivas
- Bateria completa de testes de integração executada em menos de 5 segundos.
- Zero dependência de serviços externos ou Docker para rodar testes na máquina do desenvolvedor ou no CI.
- Migrações quebradas ou consultas inválidas falham imediatamente nos testes antes de chegarem a produção.
- Testes E2E asseguram estabilidade dos fluxos principais nos navegadores.

### Trade-offs & Mitigações
- **Limitações de extensões C no WASM**: Embora o PGlite seja o motor oficial do Postgres, certas extensões de terceiros compiladas em C não rodam em WASM. Para as funcionalidades relacionais padrão do projeto, o comportamento é 100% idêntico ao Neon Postgres.
