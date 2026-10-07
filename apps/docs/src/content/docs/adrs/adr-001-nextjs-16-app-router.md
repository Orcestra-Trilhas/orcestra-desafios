---
title: "ADR-001: Next.js 16 com React 19 e App Router"
description: Registro de decisão arquitetural sobre a escolha do Next.js 16 com App Router e React 19 para a aplicação web.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma Orc'estra Desafios é uma aplicação gamificada rica em interatividade (desafios de programação, submissões com proteção contra spoilers, rankings em tempo real e painel administrativo). Precisávamos de um framework web moderno que suportasse:
1. Renderização híbrida (Server-Side Rendering para SEO e velocidade de carregamento inicial, aliada a client-side interactivity).
2. Integração natural com o compilador do React 19 para memoização e renderização eficiente.
3. Capacidade de operar como Progressive Web App (PWA) instalável em dispositivos móveis.
4. Suporte a empacotamento rápido em desenvolvimento com Turbopack.

---

## Decisão Arquitetural
Adotar o **Next.js 16** com **App Router** e **React 19** como a base da aplicação `apps/web`.

Aproveitamos:
- **Server Components (RSC)**: As páginas buscam dados e pré-renderizam o conteúdo no servidor sem inflar o bundle JavaScript do navegador.
- **Turbopack**: Compilação ultrarrápida em desenvolvimento local.
- **Next.js Route Handlers**: Endpoint unificado para servir os procedimentos do tRPC sob `/api/trpc`.
- **Suporte a PWA nativo**: Manifest, service workers e estratégia de cache offline.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **Vite SPA (Single Page Application)** | Ausência de Server-Side Rendering nativo; maior First Contentful Paint (FCP) em conexões instáveis; necessidade de hospedar backend de API separado. |
| **Remix / React Router 7** | Embora possua excelente modelo de dados com loaders, o ecossistema e ferramentas da Vercel/Next.js (especialmente para hospedagem serverless integrada) mostraram-se mais maduros para o fluxo do projeto. |
| **Next.js Pages Router (Legado)** | O Pages Router está em modo de manutenção e não oferece os ganhos de streaming, layouts aninhados e Server Components do React 19. |

---

## Consequências

### Positivas
- Carregamento inicial acelerado e zero dependência de fetches no `useEffect` para dados estáticos.
- Integração perfeita com Turbopack e Server Actions.
- Bundle de JavaScript reduzido no cliente.

### Negativas / Trade-offs & Mitigações
- **Curva de aprendizado da separação Client vs Server Components**: Mitigada pela regra de isolar a diretiva `'use client'` estritamente nas folhas da árvore de componentes (como formulários interativos e botões de ação).
