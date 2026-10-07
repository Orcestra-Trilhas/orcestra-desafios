// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";

export default defineConfig({
	base: "/orcestra-desafios",
	integrations: [
		mermaid(),
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
	server: {
		port: 3002,
	},
	site: "https://orcestra-trilhas.github.io",
	vite: {
		plugins: [
			{
				configureServer(server) {
					return () => {
						server.middlewares.stack.unshift({
							/**
							 * @param {import("node:http").IncomingMessage} req
							 * @param {import("node:http").ServerResponse} res
							 * @param {() => void} next
							 */
							handle(req, res, next) {
								const url = req.url ?? "/";
								const pathname = url.split("?")[0] ?? "/";
								if (pathname === "/" || pathname === "") {
									const search = url.includes("?")
										? url.slice(url.indexOf("?"))
										: "";
									res.writeHead(302, {
										Location: `/orcestra-desafios/${search}`,
									});
									res.end();
									return;
								}
								next();
							},
							route: "",
						});
					};
				},
				enforce: "post",
				name: "dev-redirect-root-to-base",
			},
		],
	},
});
