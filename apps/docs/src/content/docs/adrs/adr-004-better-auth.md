---
title: "ADR-004: Better Auth para Gestão de Identidade e Sessões"
description: Registro de decisão arquitetural sobre a escolha do Better Auth para a camada de autenticação e controle de acesso.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma exige um sistema de identidade seguro que atenda aos seguintes requisitos:
1. **Autenticação Segura por Credenciais**: Cadastro e login com email e senha, utilizando algoritmos modernos de hashing (scrypt / Argon2).
2. **Gerenciamento de Sessões em Banco de Dados**: Capacidade de revogar sessões ativas instantaneamente e auditar acessos.
3. **Controle de Acesso Baseado em Papéis (RBAC)**: Distinção clara entre membros comuns e administradores da Orc'estra.
4. **Proteção Robusta**: Cookies HTTP-only, flags `SameSite` e proteção nativa contra CSRF.
5. **Independência de Custos por Usuário**: Evitar lock-in financeiro por quantidade de usuários ativos mensais (MAU).

---

## Decisão Arquitetural
Adotar o **Better Auth** no pacote `@orcestra-desafios/auth`, utilizando o adapter oficial para o **Drizzle ORM**.

A integração é realizada de forma centralizada:
- O Better Auth gerencia as tabelas `users`, `sessions`, `accounts` e `verifications` no banco de dados.
- O contexto do tRPC (`createTRPCContext`) extrai e valida a sessão a cada requisição, alimentando os procedimentos protegidos.
- O cliente visual no `apps/web` utiliza os hooks do Better Auth para login, cadastro e logout com feedback instantâneo.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **NextAuth.js / Auth.js v5 (Beta)** | Histórico frequente de breaking changes entre versões; documentação instável durante a migração para a v5; tipagem de sessões customizadas com RBAC requer múltiplos type augmentations complexos. |
| **Clerk / Auth0** | Serviços de terceiros com planos pagos baseados em MAU; introduzem dependência externa e transferem dados de membros para servidores fora do banco do projeto. |
| **Implementação JWT Manual (Custom JWTs)** | Risco elevado de falhas de segurança na emissão e validação de tokens; impossibilidade de revogação imediata de sessões sem criar uma blacklist de tokens no banco (o que anula o benefício stateless do JWT). |

---

## Consequências

### Positivas
- Dados de autenticação pertencem integralmente à base de dados do projeto no Neon Postgres.
- Tipagem estrita de ponta a ponta: as propriedades do usuário na sessão são reconhecidas automaticamente pelo TypeScript.
- Compatibilidade nativa com a suíte de testes de integração via criação direta de sessões no banco PGlite.

### Negativas / Trade-offs & Mitigações
- **Biblioteca mais recente no ecossistema**: O Better Auth é relativamente novo quando comparado ao NextAuth clássico, mas possui documentação exemplar, código-fonte aberto de alta qualidade e suporte nativo a TypeScript de primeira classe.

