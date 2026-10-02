import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: "#0f172a",
		description:
			"Desafios técnicos em duplas, suporte via WhatsApp e gamificação para a Empresa Júnior.",
		display: "standalone",
		icons: [
			{
				purpose: "maskable",
				sizes: "192x192",
				src: "/favicon/web-app-manifest-192x192.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "512x512",
				src: "/favicon/web-app-manifest-512x512.png",
				type: "image/png",
			},
		],
		name: "orc//desafios",
		short_name: "orc//desafios",
		start_url: "/dashboard",
		theme_color: "#4f46e5",
	};
}
