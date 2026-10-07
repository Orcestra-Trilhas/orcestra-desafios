// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://orcestra-trilhas.github.io/orcestra-desafios",
	integrations: [
		starlight({
			customCss: ["./src/styles/custom.css"],
			defaultLocale: "root",
			description:
				"Documentação de Arquitetura, Decisões Técnicas e Guias da Plataforma Orc'estra Desafios",
			locales: {
				root: {
					label: "Português",
					lang: "pt-BR",
				},
			},
			logo: {
				alt: "Orc'estra Gamificação",
				src: "./src/assets/logo.png",
			},
			sidebar: [
				{
					items: [
						{ label: "Introdução", slug: "index" },
						{ label: "Onboarding & Setup Local", slug: "guias/onboarding" },
						{
							label: "Convenções de Código & Qualidade",
							slug: "guias/convencoes",
						},
					],
					label: "Visão Geral & Começando",
				},
				{
					items: [
						{
							label: "Monorepo & Estrutura de Pacotes",
							slug: "arquitetura/visao-geral",
						},
						{
							label: "Fluxo de Dados & Type Safety",
							slug: "arquitetura/fluxo-de-dados",
						},
						{
							label: "Estratégia de Testes SOTA",
							slug: "arquitetura/estrategia-de-testes",
						},
					],
					label: "Arquitetura do Sistema",
				},
				{
					items: [{ autogenerate: { directory: "adrs" } }],
					label: "Architecture Decision Records (ADRs)",
				},
			],
			social: [
				{
					href: "https://github.com/Orcestra-Trilhas/orcestra-desafios",
					icon: "github",
					label: "GitHub",
				},
			],
			title: "Orc'estra Desafios",
		}),
	],
});
