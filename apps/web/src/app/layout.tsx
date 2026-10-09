import type { Metadata, Viewport } from "next";
import { Poppins, Ubuntu_Mono } from "next/font/google";

import "../index.css";
import BottomNav from "@/components/bottom-nav";
import Header from "@/components/header";
import Providers from "@/components/providers";
import PwaRegistration from "@/components/pwa-registration";

const ubuntuMono = Ubuntu_Mono({
	fallback: ["UbuntuMono Nerd Font", "Ubuntu Mono Nerd Font", "monospace"],
	subsets: ["latin"],
	variable: "--font-display",
	weight: ["400", "700"],
});

const poppins = Poppins({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "orc//desafios",
	},
	applicationName: "orc//desafios",
	description:
		"Plataforma de desafios técnicos em duplas, suporte via WhatsApp e gamificação para a Empresa Júnior.",
	icons: {
		apple: [
			{
				sizes: "180x180",
				type: "image/png",
				url: "/favicon/apple-touch-icon.png",
			},
		],
		icon: [
			{ type: "image/svg+xml", url: "/favicon/favicon.svg" },
			{ sizes: "96x96", type: "image/png", url: "/favicon/favicon-96x96.png" },
		],
	},
	manifest: "/manifest.webmanifest",
	title: "orc//desafios",
};

export const viewport: Viewport = {
	initialScale: 1,
	maximumScale: 1,
	themeColor: "#080F07",
	userScalable: false,
	viewportFit: "cover",
	width: "device-width",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className="orc-dark"
			lang="pt-BR"
			style={{ colorScheme: "dark" }}
			suppressHydrationWarning
		>
			<body
				className={`${ubuntuMono.variable} ${poppins.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-[#FF4A1C] selection:text-white`}
			>
				<PwaRegistration />

				<Providers>
					<div className="flex min-h-screen flex-col">
						<Header />
						<main className="flex-1 pb-24">{children}</main>
						<BottomNav />
					</div>
				</Providers>
			</body>
		</html>
	);
}
