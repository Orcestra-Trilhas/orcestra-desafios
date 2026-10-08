---
title: Convenções de Código & Qualidade
description: Regras de linting do Ultracite/Biome, convenções de commits, padrões TypeScript e boas práticas de React 19.
---

Este documento consolida os padrões de engenharia adotados no repositório **Orc'estra Desafios** para manter a base de código limpa, acessível e fácil de manter.

---

## 1. Ultracite & Biome (Linting e Formatação)

Utilizamos o **Ultracite**, que roda o motor de linting e formatação do **Biome** (escrito em Rust). Ele substitui o conjunto tradicional ESLint + Prettier com velocidade de execução quase instantânea.

### Comandos
- **Checar conformidade**: `npm run check`
- **Corrigir automaticamente**: `npm run fix`

### Regras Principais
- **Sem `any`**: Tipos desconhecidos devem usar `unknown` e passar por type narrowing estrito.
- **Regex no Top-Level**: Nunca instancie expressões regulares literais dentro de loops ou funções repetidas; declare-as no escopo do arquivo como constantes nomeadas.
- **Strings com `.slice()`**: Utilize `.slice()` para extrair trechos de strings em vez dos legados `.substr()` ou `.substring()`.
- **Sem Logs em Produção**: Remova `console.log`, `debugger` ou chamadas de debug antes de abrir pull requests.
- **Acessibilidade Obrigatória**: Elementos clicáveis devem ser tags semânticas (`<button>`, `<a>`, `<input>`) com labels descritivos e foco por teclado.

---

## 2. Padrões de Tipagem em TypeScript

O repositório é configurado com `strict: true` e `noUncheckedIndexedAccess: true` no `packages/config/tsconfig.base.json`.

### Práticas Recomendadas

```typescript
// 1. Const Assertions para listas e mapeamentos imutáveis
export const TRACK_ROLES = ["frontend", "backend", "proto", "git", "devops"] as const;
export type TrackRole = (typeof TRACK_ROLES)[number];

// 2. Type Narrowing com predicados de tipo em vez de casting forçado
function isValidSubmissionStatus(status: unknown): status is "PENDING" | "APPROVED" | "REJECTED" {
  return typeof status === "string" && ["PENDING", "APPROVED", "REJECTED"].includes(status);
}

// 3. Extrair constantes semânticas em vez de números mágicos
const MAX_SOLUTION_CODE_LENGTH = 10_000 as const;
```

Evite usar coerção forçada com `as SomeType` a menos que seja estritamente necessário (como em chamadas a bibliotecas externas sem tipagem adequada).

---

## 3. Padrão de Commits

Adotamos a convenção **Conventional Commits** em português, com mensagens concisas em letras minúsculas:

| Prefixo | Finalidade | Exemplo Real |
| :--- | :--- | :--- |
| `feat:` | Nova funcionalidade para o usuário | `feat: adiciona seletor com os 4 temas do design system` |
| `fix:` | Correção de defeito ou bug | `fix: corrige validacao de spoiler em desafios de codigo` |
| `test:` | Inclusão ou refatoração de testes | `test: adiciona testes de integracao para o ranking no pglite` |
| `docs:` | Atualizações em documentação | `docs: reestrutura arquitetura e remove emojis de diagramas` |
| `refactor:`| Mudança interna sem alteração de comportamento | `refactor: unifica resolucao de sessao no context do trpc` |
| `style:` | Ajustes visuais, CSS e temas | `style: ajusta contraste do tema fauvismo para conformidade aaa` |
| `chore:` | Dependências, build e scripts | `chore: atualiza pacotes do monorepo e scripts de teste` |

---

## 4. Diretrizes para React 19 & Next.js 16

1. **Server Components por Padrão**:
   Todas as rotas sob `apps/web/src/app` são Server Components nativos. Apenas componentes folha que demandam interatividade direta (como modais, botões táteis e formulários com estado local) devem conter a diretiva `'use client'`.
2. **React 19 Refs**:
   Utilize `ref` diretamente como prop nos componentes. Não utilize `React.forwardRef`, que foi descontinuado na versão 19.
3. **Imagens Otimizadas**:
   Utilize o componente `next/image` (`<Image />`) com dimensões explícitas e texto alternativo (`alt`) em todas as imagens.
4. **Links Externos Seguros**:
   Links com `target="_blank"` devem sempre incluir `rel="noopener noreferrer"`.

---

## 5. Roteadores e Procedimentos tRPC (`packages/api`)

- **Validação com Zod**: Todo procedimento que receba parâmetros (`.input(...)`) deve validar o payload com um schema Zod explícito.
- **Procedimentos Seguros**:
  - `publicProcedure`: Apenas para rotas abertas (como checagem de status ou metadados públicos).
  - `protectedProcedure`: Para operações autenticadas de membros.
  - `adminProcedure`: Para operações administrativas (criação de desafios, aprovação/rejeição de submissões).
- **Tratamento de Exceções**: Lance exceções semânticas utilizando a classe `TRPCError` fornecida pelo pacote `@trpc/server`:

```typescript
if (!challenge) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "O desafio solicitado não foi encontrado.",
  });
}
```
