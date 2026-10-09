import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: "#121212",
		categories: ["education", "productivity"],
		description:
			"Desafios técnicos em duplas, suporte via WhatsApp e gamificação para a Empresa Júnior.",
		display: "standalone",
		display_override: ["standalone", "minimal-ui"],
		icons: [
			{
				purpose: "maskable",
				sizes: "192x192",
				src: "/favicon/web-app-manifest-192x192.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "192x192",
				src: "/favicon/web-app-manifest-192x192.png",
				type: "image/png",
			},
			{
				purpose: "maskable",
				sizes: "512x512",
				src: "/favicon/web-app-manifest-512x512.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "512x512",
				src: "/favicon/web-app-manifest-512x512.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "180x180",
				src: "/favicon/apple-touch-icon.png",
				type: "image/png",
			},
		],
		id: "/",
		name: "orc//desafios",
		orientation: "portrait",
		scope: "/",
		short_name: "orc//desafios",
		shortcuts: [
			{
				description: "Ver desafios e missões ativas",
				icons: [
					{
						sizes: "192x192",
						src: "/favicon/web-app-manifest-192x192.png",
					},
				],
				name: "Desafios",
				short_name: "Desafios",
				url: "/dashboard",
			},
			{
				description: "Ver ranking geral dos membros",
				icons: [
					{
						sizes: "192x192",
						src: "/favicon/web-app-manifest-192x192.png",
					},
				],
				name: "Ranking",
				short_name: "Ranking",
				url: "/ranking",
			},
			{
				description: "Ver meu perfil, pontos e mural de presentes",
				icons: [
					{
						sizes: "192x192",
						src: "/favicon/web-app-manifest-192x192.png",
					},
				],
				name: "Meu Perfil",
				short_name: "Perfil",
				url: "/profile",
			},
		],
		start_url: "/",
		theme_color: "#02571E",
	};
}
