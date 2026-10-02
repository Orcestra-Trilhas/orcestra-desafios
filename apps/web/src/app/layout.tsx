import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";

import "../index.css";
import BottomNav from "@/components/bottom-nav";
import Header from "@/components/header";
import Providers from "@/components/providers";
import PwaRegistration from "@/components/pwa-registration";

const syne = Syne({
	subsets: ["latin"],
	variable: "--font-display",
	weight: ["600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Orcestra Desafios",
	},
	description:
		"Plataforma de desafios técnicos em duplas, suporte via WhatsApp e gamificação para a Empresa Júnior.",
	manifest: "/manifest.webmanifest",
	title: "Orcestra Desafios // EJ Gamificação",
};

export const viewport: Viewport = {
	initialScale: 1,
	maximumScale: 1,
	themeColor: "#FF4A1C",
	userScalable: false,
	width: "device-width",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${syne.variable} ${plusJakartaSans.variable} flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-[#FF4A1C] selection:text-white`}
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
