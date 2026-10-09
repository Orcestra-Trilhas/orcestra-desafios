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
3. **Le Noir Dark (Noturno)**:
   - Inspirado na estética monolítica e litúrgica de *Limbus Company* (Grand Magasin Sisyphe). Fundo em preto obsidiana profundo (`#09090b`), cartões em grafite estruturado (`#131317`), bordas de contenção (`#27272f`) e acentos em Dourado Litúrgico "Golden Resin" (`#f59e0b`).
4. **Le Rouge Light (Diurno)**:
   - Inspirado na alta-costura carmesim de *Limbus Company* (Grand Magasin Sisyphe). Mármore marfim suave de vitrine (`#fdfbf9`), traço gráfico de corte em preto alfaiate (`#18181b`), carmesim rubro de alta-costura (`#dc2626`) e toques de "Golden Hide" (`#f59e0b`).

O portal de documentação (`apps/docs`) implementa seletor equivalente com os mesmos 4 esquemas, sincronizando a preferência do usuário via `localStorage`.

5. **Motor de Temas Customizados (Criador de Temas & Perfil do Membro)**:
   - Além das 4 paletas oficiais, a plataforma implementa um motor dinâmico de temas customizados (`CustomThemeProvider` e `CustomThemeDialog`).
   - Os membros podem personalizar livremente: cor primária, cor secundária, botões de ação (primários e secundários), badges/selos (destaque e status) e textos secundários/muted.
   - **Cálculo Automático de Contraste**: Garante legibilidade ideal gerando texto claro ou escuro sobre fundos dinâmicos com algoritmo de luminância relativa (`getContrastForeground`).
   - **Isolamento Multiusuário e Troca Instantânea (0ms)**: Cada usuário possui seu tema gravado de forma isolada em chaves com escopo de ID (`orc_theme_applied_${userId}` e `orc_custom_theme_${userId}`). Ao alternar de conta ou fazer logout, o cache de consultas (`user.me`) é purgado imediatamente e o tema correto da nova conta é recuperado de forma síncrona, eliminando vazamento visual de contas anteriores.
   - **Perfis de Terceiros**: Ao visitar o perfil público de outro membro, a aplicação renderiza temporariamente o tema customizado daquele autor apenas durante a navegação em sua página, restaurando automaticamente o tema do visitante ao sair.

---

## Alternativas Consideradas

| Alternativa | Motivo de Não Adoção |
| :--- | :--- |
| **CSS-in-JS (Styled Components / Emotion)** | Incompatível com Server Components do React 19; adiciona sobrecarga de execução JavaScript no cliente e prejudica métricas de Core Web Vitals (INP). |
| **Tailwind CSS v3 Legado** | Depende de configuração manual em `tailwind.config.js`, dependências pesadas de PostCSS e compilação mais lenta se comparada ao motor Lightning CSS da v4. |
| **CSS Modules isolados** | Menor velocidade na criação de componentes táteis compartilhados e dificuldade para manter a alternância de temas sincronizada em múltiplos workspaces. |
| **Armazenamento Global de Tema no LocalStorage** | Causava vazamento de temas entre contas diferentes no mesmo navegador e requeria refetch de rede para carregar o tema correto. Substituído por chaves com escopo de usuário. |

---

## Consequências

### Positivas
- Zero impacto de runtime de JavaScript para renderização dos temas estáticos.
- Motor dinâmico com injeção de CSS em runtime (`generateCustomThemeCss`) apenas quando o modo customizado está ativo, sem polling e com limpeza estrita de estilos residuais.
- Alternância instantânea de temas sem recarregamento de página nem piscadas de tela (*flash of unstyled content*).
- Consistência estética neo-brutalista tátil (bordas nítidas de 2px, sombras sólidas rígidas `4px 4px 0px` e tipografia display marcante em `Ubuntu Mono Nerd Font` com corpo em `Poppins`).

### Trade-offs & Mitigações
- **Sintaxe nova do Tailwind v4**: A versão 4 utiliza a diretiva `@import "tailwindcss";` e definições inline `@theme`. Centralizamos os tokens em `packages/ui/src/styles/globals.css` para manter um ponto único de verdade documentado.
- **Sobrescrita de Cores em Componentes com Cores Fixas**: Elementos neo-brutalistas com regras de cor hardcoded (como amarelos ou laranjas fixos) foram unificados para classes semânticas do Tailwind (`bg-primary`, `bg-secondary`, `text-muted-foreground`), respeitando o seletor ativo do usuário.
