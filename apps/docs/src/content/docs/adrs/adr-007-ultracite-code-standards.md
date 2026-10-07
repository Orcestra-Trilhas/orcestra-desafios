---
title: "ADR-007: Ultracite e Biome para Governança e Qualidade de Código"
description: Registro de decisão arquitetural sobre o uso do Ultracite (alimentado por Biome) para linting, formatação e padrões de qualidade.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
Em projetos com múltiplos desenvolvedores e diversas tecnologias no monorepo, problemas comuns surgem rapidamente:
1. **Discussões estéreis em Code Reviews**: Debates sobre estilo, identação, aspas e imports.
2. **Lentidão em CI/CD**: Ferramentas clássicas de linting em JavaScript consumindo minutos preciosos da pipeline.
3. **Padrões heterogêneos de código**: Código legado contendo `any`, chamadas síncronas bloqueantes, ausência de atributos de acessibilidade ou vazamentos de `console.log`.

Precisávamos de uma solução zero-config, ultrarrápida e com regras modernas de qualidade que englobassem acessibilidade, segurança e performance.

---

## Decisão Arquitetural
Adotar o **Ultracite**, que utiliza o **Biome** (motor escrito em Rust) como ferramenta única e oficial de linting e formatação do repositório.

Benefícios incorporados:
- **Zero-Config de Fábrica**: Configuração opinativa e robusta sem necessidade de gerenciar dezenas de plugins `eslint-plugin-*` conflitantes.
- **Autofix Imediato**: O comando `npm run fix` (ou `npm exec -- ultracite fix`) resolve a grande maioria das divergências em milissegundos.
- **Enforcement de Acessibilidade & Boas Práticas**: Valida hierarquia de headings, labels em inputs, botões acessíveis e boas práticas de React 19.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **ESLint + Prettier tradicional** | Configuração notoriamente complexa (conflitos entre regras de formatação do Prettier e regras de estilo do ESLint); tempo de execução significativamente mais lento em monorepos com centenas de arquivos TypeScript. |
| **Oxlint** | Excelente velocidade em Rust, porém com foco primário em linting rápido sem paridade completa de substituição do Prettier para formatação e sem o ecossistema maduro de regras do Biome. |

---

## Consequências

### Positivas
- Execução de checagem do repositório inteiro em frações de segundo.
- Eliminação de atritos e inconsistências de formatação entre diferentes editores (VS Code, Zed, Cursor, Neovim).
- Código mais acessível e performático por padrão.

### Negativas / Trade-offs & Mitigações
- **Rigidez em certas regras**: O Biome possui regras estritas (como desestimular regex literais dentro de loops e forçar `.slice` em vez de `.substring`). A equipe adotou essas regras como diretrizes de engenharia de software de alta performance, documentadas no [Guia de Convenções](/guias/convencoes/).
