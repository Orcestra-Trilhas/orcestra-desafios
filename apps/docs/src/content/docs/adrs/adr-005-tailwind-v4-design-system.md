---
title: "ADR-005: Tailwind CSS v4 e Design System Temático"
description: Registro de decisão arquitetural sobre a adoção do Tailwind CSS v4 e a concepção dos temas inspirados em vanguardas artísticas e na identidade da Orc'estra.
---

## Status
**Aceito** (Outubro de 2026)

---

## Contexto & Desafio
A plataforma Orc'estra Desafios combina aprendizado técnico com gamificação lúdica. O design system precisava atender a três objetivos simultâneos:
1. **Ergonomia e Conforto Visual**: Membros passam horas resolvendo desafios de código e lendo explicações; a interface padrão não poderia ser cansativa nem excessivamente agressiva aos olhos.
2. **Expressividade e Identidade Única**: Distanciar-se do visual genérico de dashboards empresariais cinzas, celebrando a identidade vibrante da Orc'estra Gamificação e das vanguardas artísticas.
3. **Performance de Estilização**: Compilação atômica instantânea sem gargalos de CSS-in-JS em tempo de execução.

---

## Decisão Arquitetural
Adotar o **Tailwind CSS v4** no pacote `@orcestra-desafios/ui`, aproveitando a nova arquitetura baseada em CSS nativo (diretiva `@import "tailwindcss";` sem necessidade do legado `tailwind.config.js`).

Estruturamos um sistema dinâmico de temas via variáveis CSS e classes controladas pelo `next-themes`:

### Paletas Disponíveis:
1. **Orc'estra Dark (Padrão do Sistema)**:
   - Fundo carvão suave com respiro florestal (`#080f07`), cards em verde aveludado (`#0f1d0d`) e acentos em verde claro vibrante (`#3bc90c`). Oferece contraste AAA e extremo conforto visual para programadores.
2. **Orc'estra Light**:
   - Branco linho limpo (`#f9fbf9`), tipografia em verde floresta escuro (`#071a06`) e realces suaves de menta.
3. **Fauvismo (Vanguarda Noturna)**:
   - Inspirado na obra *"La Danse"* de Henri Matisse e André Derain. Fundo em tela índigo mediterrânea profunda (`#0a0f24`), detalhes em vermilion terracota ardente (`#d9381e`), azul cobalto e amarelo cádmio.
4. **Pop Art (Vanguarda Silkscreen)**:
   - Inspirado na serigrafia de Andy Warhol (The Factory). Papel serigráfico marfim claro (`#fffdfa`), preto gráfico com traços nítidos (`#18181b`), magenta Marilyn (`#ec4899`), ciano elétrico (`#06b6d4`) e amarelo banana (`#facc15`).

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **CSS-in-JS (Styled Components / Emotion)** | Incompatível com Server Components do React 19; adiciona sobrecarga de execução JavaScript no cliente e aumenta o First Input Delay (FID) / INP. |
| **Tailwind CSS v3 Legado** | Depende de configuração manual em `tailwind.config.js`, plugins externos de PostCSS mais lentos e não usufrui do compilador Lightning CSS otimizado da v4. |
| **CSS Modules puro** | Menor velocidade de prototipação; risco de duplicação de regras CSS entre componentes e inconsistência de espaçamentos e escalas tipográficas. |

---

## Consequências

### Positivas
- Zero impacto de runtime de estilização no navegador.
- Alternância instantânea de temas sem recarregar a página ou piscar a interface (*flash of unstyled content*).
- Componentes altamente reutilizáveis com suporte a classes utilitárias e shadcn/ui.

### Negativas / Trade-offs & Mitigações
- **Curva da sintaxe Tailwind v4**: A versão 4 introduziu novas convenções para `@theme` e variantes personalizadas (`@custom-variant`). Centralizamos todos os tokens no arquivo `packages/ui/src/styles/globals.css` para manter o ponto único de verdade.
