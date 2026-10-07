---
title: "ADR-003: Neon Serverless Postgres e Drizzle ORM"
description: Registro de decisão arquitetural sobre a escolha do Neon Serverless Postgres e Drizzle ORM para a camada de persistência de dados.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma necessita de uma camada de dados relacional confiável para persistir modelos interdependentes:
- Usuários, sessões e contas de autenticação.
- Desafios técnicos, trilhas e semanas de aprendizado.
- Submissões de código, status de moderação e pontuações do ranking.

Os principais requisitos incluíam:
1. **Branching de Banco de Dados**: Capacidade de criar cópias instantâneas e isoladas do banco para testes de migrações e branches de desenvolvimento.
2. **Performance Serverless**: Inicialização rápida sem gargalos de pool de conexões em ambientes lambdas/edge.
3. **Controle SQL Fino & Type-Safety**: Um ORM que não esconda o SQL por trás de abstrações pesadas e que mantenha o bundle enxuto.

---

## Decisão Arquitetural
Adotar o **Neon Postgres** como provedor de banco de dados serverless em nuvem e o **Drizzle ORM** (`packages/db`) como camada de modelagem e acesso a dados.

Principais benefícios da combinação:
- **Neon Database Branching**: Branches de banco efêmeras criadas via Neon CLI/MCP para testar migrações perigosas sem afetar a base principal.
- **Drizzle SQL-Like Syntax**: O Drizzle reflete a semântica nativa do SQL sem a sobrecarga de um runtime pesado ou motores binários em Rust.
- **Migrações SQL Puras**: As migrações são geradas em arquivos `.sql` padrão na pasta `packages/db/drizzle/`, o que permite executá-las tanto no Neon quanto em bases in-memory em testes locais (`@electric-sql/pglite`).

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **Prisma ORM** | Motor binário pesado em Rust (Prisma Query Engine) que aumenta o tamanho do bundle e o cold start em ambientes serverless; abstrações complexas que dificultam a execução de queries SQL customizadas e migrações transparentes em WASM. |
| **TypeORM** | Modelo baseado em decoradores experimentais e padrões clássicos de Active Record / Data Mapper com menor garantia de type safety em operações complexas e histórico de manutenibilidade instável. |
| **Supabase** | Excelente solução, porém a arquitetura de branch-first e o pooling serverless HTTP nativo do Neon mostraram-se mais alinhados à infraestrutura serverless do projeto. |

---

## Consequências

### Positivas
- Respostas a queries em milissegundos com conexão pooler do Neon.
- Schemas estritamente tipados com autocompletar de relacionamentos via `db.query`.
- Total compatibilidade com a suíte de testes in-memory via PGlite, sem necessidade de emuladores ou containers pesados.

### Negativas / Trade-offs & Mitigações
- **Curva de migrações manuais**: O Drizzle exige o comando `drizzle-kit generate` e revisão dos scripts SQL gerados. Essa prática foi incorporada ao fluxo de desenvolvimento com os comandos `npm run db:generate` e `npm run db:migrate`.
