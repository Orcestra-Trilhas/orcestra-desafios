---
title: Convenções de Código & Qualidade
description: Diretrizes de desenvolvimento, regras de linting, padrões TypeScript e fluxo de commits adotados no repositório.
---

O projeto Orc'estra Desafios segue uma política rigorosa de qualidade técnica com foco em **acessibilidade, performance, type safety e manutenibilidade**.

---

## 1. Ultracite & Biome (Motor de Qualidade)

Utilizamos o **Ultracite** (construído sobre o Biome) como solução unificada de linting e formatação.

### Comandos Rápidos
- **Formatar e corrigir automaticamente**: `npm run fix` (ou `npm exec -- ultracite fix`)
- **Verificar pendências sem alterar arquivos**: `npm run check` (ou `npm exec -- ultracite check`)

### Principais Regras de Código
- **Sem `any`**: Tipos não definidos devem usar `unknown` e passar por type narrowing estrito.
- **Top-Level Regular Expressions**: Nunca crie literais de expressões regulares dentro de loops ou funções repetitivas. Declare-as como constantes de escopo superior com nomes semânticos.
- **Performance de Loops**: Evite operações assíncronas sequenciais com `await` dentro de laços (`for...of`) quando puderem ser executadas em lote ou paralelizadas com `Promise.all()`.
- **Manipulação de Strings**: Utilize `.slice()` em vez de `.substring()` ou `.substr()`.
- **Ausência de Logs em Produção**: Remova `console.log`, `debugger` e instruções de depuração antes de abrir PRs ou commitar.

---

## 2. Tipagem Estrita em TypeScript

O repositório opera sob `strict: true` e `noUncheckedIndexedAccess: true`.

### Boas Práticas:
1. **Inferência com Type Narrowing**:
   Prefira verificar propriedades usando operadores como `in`, `typeof` ou type guards dedicados ao invés de usar coerção forçada (`as Tipo`).
2. **Const Assertions (`as const`)**:
   Use para literais imutáveis, listas de opções fixas e mapeamentos de configuração.
3. **Nomes Descritivos & Constantes**:
   Evite números e strings mágicas no código. Extraia para constantes com nomes autoexplicativos.

```typescript
// ✅ Recomendado
const MAX_CHALLENGE_TITLE_LENGTH = 100 as const;

function isSolvedStatus(status: unknown): status is "SOLVED" {
  return typeof status === "string" && status === "SOLVED";
}

// ❌ Evitar
function check(s: any) {
  return s === "SOLVED"; // Perde type-safety e gera warning no Ultracite
}
```

---

## 3. Padrão de Commits

Seguimos a convenção de **Conventional Commits** em português, com mensagens claras e objetivas no formato minúsculo:

| Prefixo | Descrição | Exemplo |
| :--- | :--- | :--- |
| `feat:` | Nova funcionalidade para o usuário | `feat: adiciona secao de solucoes com protecao anti-spoiler` |
| `fix:` | Correção de bug ou falha | `fix: corrige upload no cloudinary e melhora intuitividade dos campos` |
| `test:` | Adição ou refatoração de testes | `test: adiciona suite completa de testes de integracao e e2e sota` |
| `docs:` | Atualizações em documentação | `docs: cria portal starlight e registra adrs de arquitetura` |
| `refactor:` | Refatoração de código sem alteração funcional | `refactor: desacopla instanciacao do trpc e unifica helpers` |
| `style:` | Ajustes visuais, CSS e temas | `feat: adiciona esquemas de cores da orc'estra e atualiza temas` |
| `chore:` | Tarefas de manutenção e dependências | `chore: atualiza dependencias e scripts de desenvolvimento` |

---

## 4. Práticas em React 19 & Next.js 16

1. **Server Components por Padrão**:
   Todas as páginas e componentes no App Router devem ser Server Components, a menos que precisem de interatividade direta com o usuário (event handlers, hooks de estado ou contexto).
2. **Diretiva `'use client'` Consciente**:
   Isole componentes de cliente nas folhas da árvore de componentes (ex.: formulários, botões de ação com feedback instantâneo).
3. **Hooks de Top-Level**:
   Nunca invoque React Hooks condicionalmente ou dentro de laços.
4. **Acessibilidade e Semântica**:
   - Utilize elementos HTML semânticos (`<button>`, `<nav>`, `<main>`, `<article>`) em vez de divs com `onClick`.
   - Garanta atributos ARIA apropriados e suporte completo a navegação por teclado (`Tab`, `Enter`, `Escape`).
   - Forneça textos alternativos (`alt`) descritivos em imagens.

---

## 5. Arquitetura de Comunicação com tRPC

- **Validação com Zod**: Todo endpoint de mutação ou query no tRPC deve ter seu input validado por schema Zod estrito.
- **Procedimentos Autenticados**: Utilize `protectedProcedure` para qualquer operação que requeira autenticação, e `adminProcedure` para ações restritas à diretoria/administração.
- **Tratamento de Exceções**: Lance erros semânticos usando `TRPCError` com o código HTTP correspondente (`NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`).
