---
title: "ADR-005: Tailwind CSS v4 e Design System Multi-Temas"
description: Registro de decisão arquitetural sobre a adoção do Tailwind CSS v4 e a concepção das 4 paletas visuais compartilhadas entre aplicação web e documentação.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma Orc'estra Desafios combina aprendizado técnico rigoroso com dinâmica gamificada. O design system precisava atender a três requisitos claros:
1. **Ergonomia e Conforto Visual**: Membros passam horas resolvendo problemas de código e inspecionando detalhes de submissões. O tema padrão precisa oferecer alto contraste (AAA) sem fadiga visual.
2. **Identidade Visual Autêntica**: Fugir do aspecto genérico de dashboards cinzas, integrando a identidade da Orc'estra Gamificação com referências artísticas expressivas (Fauvismo e Pop Art).
3. **Paridade em Todo o Monorepo**: Os mesmos esquemas visuais devem estar disponíveis tanto no aplicativo principal (`apps/web`) quanto no portal de documentação (`apps/docs`).

---

## Decisão Arquitetural
Adotar o **Tailwind CSS v4** no pacote `@orcestra-desafios/ui`, estruturando variáveis CSS nativas gerenciadas centralizadamente em `packages/ui/src/styles/globals.css`.

Definimos quatro esquemas de cores oficiais:

1. **Orc'estra Dark (Padrão do Sistema)**:
   - Fundo carvão profundo com respiro florestal (`#080f07`), cards em verde escuro aveludado (`#0f1d0d`), bordas em verde musgo (`#1e3b1a`) e acentos vibrantes em verde claro (`#3bc90c`). Proporciona leitura confortável e contraste ideal para IDEs e editores de código.
2. **Orc'estra Light**:
   - Branco linho limpo (`#f9fbf9`), tipografia nítida em verde floresta escuro (`#071a06`), bordas estruturadas (`#234a1f`) e realces sutis em menta.
3. **Fauvismo Dark (Noturno)**:
   - Inspirado na obra *"La Danse"* de Henri Matisse e André Derain. Tela índigo mediterrânea profunda (`#0a0f24`), detalhes em vermilion terracota ardente (`#d9381e`), azul cobalto e amarelo cádmio.
4. **Pop Art Light (Diurno)**:
   - Inspirado na serigrafia de Andy Warhol (The Factory). Papel serigráfico marfim claro (`#fffdfa`), preto gráfico com contornos marcados (`#18181b`), magenta Marilyn (`#ec4899`), ciano elétrico (`#06b6d4`) e amarelo banana (`#facc15`).

O portal de documentação (`apps/docs`) implementa seletor equivalente com os mesmos 4 esquemas, sincronizando a preferência do usuário via `localStorage`.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **CSS-in-JS (Styled Components / Emotion)** | Incompatível com Server Components do React 19; adiciona sobrecarga de execução JavaScript no cliente e prejudica métricas de Core Web Vitals (INP). |
| **Tailwind CSS v3 Legado** | Depende de configuração manual em `tailwind.config.js`, dependências pesadas de PostCSS e compilação mais lenta se comparada ao motor Lightning CSS da v4. |
| **CSS Modules isolados** | Menor velocidade na criação de componentes táteis compartilhados e dificuldade para manter a alternância de temas sincronizada em múltiplos workspaces. |

---

## Consequências

### Positivas
- Zero impacto de runtime de JavaScript para renderização de estilos no navegador.
- Alternância instantânea de temas sem recarregamento de página nem piscadas de tela (*flash of unstyled content*).
- Consistência estética neo-brutalista tátil (bordas nítidas de 2px, sombras sólidas rígidas `4px 4px 0px` e tipografia display marcante em `Syne`).

### Trade-offs & Mitigações
- **Sintaxe nova do Tailwind v4**: A versão 4 utiliza a diretiva `@import "tailwindcss";` e definições inline `@theme`. Centralizamos os tokens em `packages/ui/src/styles/globals.css` para manter um ponto único de verdade documentado.
