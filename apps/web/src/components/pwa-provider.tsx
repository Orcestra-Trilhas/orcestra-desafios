"use client";

import { Monitor, Share, Smartphone, X } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	prompt: () => Promise<void>;
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
}

interface PwaContextType {
	canInstall: boolean;
	installApp: () => Promise<void>;
	isIos: boolean;
	isStandalone: boolean;
}

const PwaContext = createContext<PwaContextType>({
	canInstall: false,
	installApp: async () => {
		// Default no-op
	},
	isIos: false,
	isStandalone: false,
});

export function usePwa() {
	return useContext(PwaContext);
}

const IOS_USER_AGENT_REGEX = /iPhone|iPad|iPod/;

export function PwaProvider({ children }: { children: React.ReactNode }) {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isStandalone, setIsStandalone] = useState(false);
	const [isIos, setIsIos] = useState(false);
	const [showIosModal, setShowIosModal] = useState(false);
	const [showBrowserModal, setShowBrowserModal] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		// Detect standalone (installed) mode
		const isStandaloneMode =
			window.matchMedia("(display-mode: standalone)").matches ||
			Boolean((navigator as unknown as { standalone?: boolean }).standalone);
		setIsStandalone(isStandaloneMode);

		// Detect iOS
		const { userAgent } = window.navigator;
		const isIosDevice =
			IOS_USER_AGENT_REGEX.test(userAgent) &&
			!userAgent.includes("Windows Phone");
		setIsIos(isIosDevice);

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		};

		const handleAppInstalled = () => {
			setIsStandalone(true);
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const installApp = useCallback(async () => {
		if (deferredPrompt) {
			await deferredPrompt.prompt();
			const result = await deferredPrompt.userChoice;
			if (result.outcome === "accepted") {
				setDeferredPrompt(null);
				setIsStandalone(true);
			}
			return;
		}

		if (isIos) {
			setShowIosModal(true);
			return;
		}

		setShowBrowserModal(true);
	}, [deferredPrompt, isIos]);

	const closeIosModal = useCallback(() => {
		setShowIosModal(false);
	}, []);

	const closeBrowserModal = useCallback(() => {
		setShowBrowserModal(false);
	}, []);

	const contextValue = useMemo(
		() => ({
			canInstall: Boolean(deferredPrompt) || (!isStandalone && isIos),
			installApp,
			isIos,
			isStandalone,
		}),
		[deferredPrompt, installApp, isIos, isStandalone]
	);

	return (
		<PwaContext.Provider value={contextValue}>
			{children}

			{/* iOS Installation Guide Modal */}
			{showIosModal ? (
				<div
					aria-labelledby="ios-modal-title"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
					role="dialog"
				>
					<div className="relative w-full max-w-md rounded-lg border-2 border-black bg-card p-5 shadow-hard dark:border-white">
						<div className="flex items-center justify-between border-black/10 border-b-2 pb-3 dark:border-white/10">
							<div className="flex items-center gap-2">
								<Smartphone className="h-5 w-5 text-[#FF4A1C]" />
								<h2
									className="font-black font-display text-sm uppercase tracking-wide"
									id="ios-modal-title"
								>
									INSTALAR NO IPHONE OU IPAD
								</h2>
							</div>
							<button
								aria-label="Fechar instruções"
								className="btn-tactile rounded-sm border border-black p-1 hover:bg-muted dark:border-white"
								onClick={closeIosModal}
								type="button"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="mt-4 space-y-3.5 font-medium text-xs leading-relaxed">
							<div className="flex items-start gap-3 rounded-md border border-black/20 bg-secondary/30 p-2.5 dark:border-white/20">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] font-black text-white dark:border-white">
									1
								</span>
								<p>
									No Safari, toque no botão{" "}
									<strong className="text-foreground">Compartilhar</strong> na
									barra inferior do navegador (ícone de um quadrado com uma seta
									para cima{" "}
									<Share className="inline h-3.5 w-3.5 align-middle" />
									).
								</p>
							</div>

							<div className="flex items-start gap-3 rounded-md border border-black/20 bg-secondary/30 p-2.5 dark:border-white/20">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] font-black text-white dark:border-white">
									2
								</span>
								<p>
									Role as opções para baixo e selecione{" "}
									<strong className="text-foreground">
										Adicionar à Tela de Início
									</strong>
									.
								</p>
							</div>

							<div className="flex items-start gap-3 rounded-md border border-black/20 bg-secondary/30 p-2.5 dark:border-white/20">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] font-black text-white dark:border-white">
									3
								</span>
								<p>
									Toque em{" "}
									<strong className="text-foreground">Adicionar</strong> no
									canto superior direito da tela.
								</p>
							</div>

							<div className="rounded-md border border-black/10 bg-background p-2.5 text-[11px] text-muted-foreground dark:border-white/10">
								O aplicativo será instalado na sua tela de início e abrirá em
								modo tela cheia, com ícone próprio e sem as barras do navegador.
							</div>
						</div>

						<div className="mt-5 pt-2">
							<button
								className="btn-tactile w-full rounded-md border-2 border-black bg-primary py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 dark:border-white"
								onClick={closeIosModal}
								type="button"
							>
								ENTENDI, VOU ADICIONAR
							</button>
						</div>
					</div>
				</div>
			) : null}

			{/* Browser Installation Guide Modal */}
			{showBrowserModal ? (
				<div
					aria-labelledby="browser-modal-title"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
					role="dialog"
				>
					<div className="relative w-full max-w-md rounded-lg border-2 border-black bg-card p-5 shadow-hard dark:border-white">
						<div className="flex items-center justify-between border-black/10 border-b-2 pb-3 dark:border-white/10">
							<div className="flex items-center gap-2">
								<Monitor className="h-5 w-5 text-[#FF4A1C]" />
								<h2
									className="font-black font-display text-sm uppercase tracking-wide"
									id="browser-modal-title"
								>
									INSTALAR NO SEU NAVEGADOR
								</h2>
							</div>
							<button
								aria-label="Fechar instruções"
								className="btn-tactile rounded-sm border border-black p-1 hover:bg-muted dark:border-white"
								onClick={closeBrowserModal}
								type="button"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="mt-4 space-y-3.5 font-medium text-xs leading-relaxed">
							<div className="flex items-start gap-3 rounded-md border border-black/20 bg-secondary/30 p-2.5 dark:border-white/20">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] font-black text-white dark:border-white">
									1
								</span>
								<p>
									No Chrome, Edge ou Brave, localize o ícone de{" "}
									<strong className="text-foreground">
										Instalar aplicativo
									</strong>{" "}
									na barra de endereços (lado direito) ou abra o menu de 3
									pontos.
								</p>
							</div>

							<div className="flex items-start gap-3 rounded-md border border-black/20 bg-secondary/30 p-2.5 dark:border-white/20">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] font-black text-white dark:border-white">
									2
								</span>
								<p>
									Clique em{" "}
									<strong className="text-foreground">
										{"Instalar orc//desafios"}
									</strong>
									.
								</p>
							</div>

							<div className="rounded-md border border-black/10 bg-background p-2.5 text-[11px] text-muted-foreground dark:border-white/10">
								O aplicativo será aberto em uma janela dedicada sem controles do
								navegador, exatamente como um software nativo.
							</div>
						</div>

						<div className="mt-5 pt-2">
							<button
								className="btn-tactile w-full rounded-md border-2 border-black bg-primary py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 dark:border-white"
								onClick={closeBrowserModal}
								type="button"
							>
								FECHAR
							</button>
						</div>
					</div>
				</div>
			) : null}
		</PwaContext.Provider>
	);
}
