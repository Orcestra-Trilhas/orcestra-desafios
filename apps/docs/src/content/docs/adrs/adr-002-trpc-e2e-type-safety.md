---
title: "ADR-002: tRPC v11 para Comunicação Cliente-Servidor Type-Safe"
description: Registro de decisão arquitetural sobre o uso do tRPC v11 para comunicação tipada entre cliente e servidor.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
Em aplicações web tradicionais com separação entre API e frontend, equipes frequentemente enfrentam problemas de:
1. **Dessincronização de contratos**: Alterações no backend quebram o frontend em tempo de execução sem aviso prévio do compilador.
2. **Boilerplate excessivo**: Necessidade de manter documentações OpenAPI manuais, schemas de validação duplicados ou rotinas de geração de código (`graphql-codegen`, `openapi-typescript`).
3. **Múltiplas camadas de deserialização**: Dificuldade em manter tipos de datas (`Date`), objetos complexos e payloads enriquecidos.

Por se tratar de um monorepo TypeScript onde cliente e servidor coexistem, buscávamos a solução com maior produtividade e menor atrito.

---

## Decisão Arquitetural
Adotar o **tRPC v11** como a camada de comunicação entre a aplicação Next.js (`apps/web`) e o núcleo de lógica de negócios (`packages/api`).

Principais aspectos da implementação:
- **Zero-Codegen**: Os tipos do TypeScript são inferidos diretamente das funções e procedimentos do backend.
- **Validação com Zod**: Todo parâmetro de entrada é estritamente validado por esquemas Zod antes da execução.
- **Integração com TanStack React Query v5**: Gerenciamento de cache, revalidação em segundo plano, refetching e estados de loading automáticos no cliente.
- **Controle de Acesso em Middlewares**: Criação de `protectedProcedure` (usuários logados) e `adminProcedure` (administradores).

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **REST tradicional (Express / Next Route Handlers manuais)** | Sem tipagem estrita de resposta por padrão; exige criação manual de interfaces TypeScript ou schemas OpenAPI propensos a desatualização. |
| **GraphQL (Apollo Server / Yoga)** | Excelente para ecossistemas heterogêneos (múltiplos clientes mobile, web, terceiros), mas introduz complexidade excessiva para uma equipe com monorepo unificado (parsers de query, schema definition language, n+1 resolvers e codegen obrigatório). |
| **Server Actions puras** | Embora viáveis no Next.js, tornam mais complexa a testabilidade isolada fora do contexto de requisição do framework e dificultam o compartilhamento de routers caso surja um novo cliente (ex: app mobile nativo ou bot). |

---

## Consequências

### Positivas
- Refatorações no backend propagam erros de compilação instantâneos no frontend antes do commit.
- Excelente experiência de desenvolvedor (DX) com auto-complete imediato no editor para rotas e parâmetros.
- Testes caixa-cinza simplificados através do `createCaller`.

### Negativas / Trade-offs & Mitigações
- **Acoplamento a TypeScript**: A API não expõe uma interface REST genérica para clientes de linguagens terceiras. Se no futuro for necessária uma API pública aberta, pode-se adotar o plugin `@trpc/openapi` ou expor route handlers dedicados.
