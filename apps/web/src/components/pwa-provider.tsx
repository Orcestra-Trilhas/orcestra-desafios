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
			window.matchMedia("(display-mode: fullscreen)").matches ||
			Boolean((navigator as unknown as { standalone?: boolean }).standalone) ||
			document.referrer.includes("android-app://");
		setIsStandalone(isStandaloneMode);

		if (isStandaloneMode) {
			document.documentElement.classList.add("standalone-mode");
		}

		const mql = window.matchMedia("(display-mode: standalone)");
		const handleMqlChange = (e: MediaQueryListEvent) => {
			if (e.matches) {
				setIsStandalone(true);
				document.documentElement.classList.add("standalone-mode");
			}
		};
		mql.addEventListener?.("change", handleMqlChange);

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
			document.documentElement.classList.add("standalone-mode");
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			mql.removeEventListener?.("change", handleMqlChange);
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

	const closeIosModal = useCallback(() => setShowIosModal(false), []);
	const closeBrowserModal = useCallback(() => setShowBrowserModal(false), []);

	const value = useMemo(
		() => ({
			canInstall: Boolean(deferredPrompt) || (!isStandalone && isIos),
			installApp,
			isIos,
			isStandalone,
		}),
		[deferredPrompt, installApp, isIos, isStandalone]
	);

	return (
		<PwaContext.Provider value={value}>
			{children}

			{/* Modal de Instruções para iOS (Safari) */}
			{showIosModal ? (
				<div
					aria-labelledby="ios-install-title"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-xs sm:items-center"
					role="dialog"
				>
					<div className="fade-in-0 zoom-in-95 w-full max-w-sm animate-in rounded-lg border-2 border-black bg-card p-5 shadow-hard dark:border-white">
						<div className="flex items-center justify-between border-black/10 border-b pb-3 dark:border-white/10">
							<div className="flex items-center gap-2">
								<Smartphone className="h-5 w-5 text-[#FF4A1C]" />
								<h3
									className="font-black font-display text-sm uppercase"
									id="ios-install-title"
								>
									INSTALAR NO IPHONE
								</h3>
							</div>
							<button
								aria-label="Fechar"
								className="btn-tactile rounded p-1 hover:bg-secondary"
								onClick={closeIosModal}
								type="button"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-4 py-4 text-xs">
							<p className="font-mono text-muted-foreground">
								Para instalar o app da Orc'estra no seu iPhone e usar em tela
								cheia:
							</p>

							<ol className="space-y-2.5 font-mono">
								<li className="flex items-start gap-2.5">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
										1
									</span>
									<span>
										Toque no botão <strong>Compartilhar</strong>{" "}
										<Share className="inline h-3.5 w-3.5 text-primary" /> no
										Safari.
									</span>
								</li>
								<li className="flex items-start gap-2.5">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
										2
									</span>
									<span>
										Role para baixo e selecione{" "}
										<strong>"Adicionar à Tela de Início"</strong>.
									</span>
								</li>
								<li className="flex items-start gap-2.5">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
										3
									</span>
									<span>
										Toque em <strong>Adicionar</strong> no canto superior
										direito.
									</span>
								</li>
							</ol>
						</div>

						<button
							className="btn-tactile w-full rounded-md border-2 border-black bg-primary py-2.5 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm dark:border-white"
							onClick={closeIosModal}
							type="button"
						>
							ENTENDI
						</button>
					</div>
				</div>
			) : null}

			{/* Modal para Desktop / Navegadores Padrão */}
			{showBrowserModal ? (
				<div
					aria-labelledby="browser-install-title"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
					role="dialog"
				>
					<div className="fade-in-0 zoom-in-95 w-full max-w-sm animate-in rounded-lg border-2 border-black bg-card p-5 shadow-hard dark:border-white">
						<div className="flex items-center justify-between border-black/10 border-b pb-3 dark:border-white/10">
							<div className="flex items-center gap-2">
								<Monitor className="h-5 w-5 text-primary" />
								<h3
									className="font-black font-display text-sm uppercase"
									id="browser-install-title"
								>
									INSTALAR APLICATIVO
								</h3>
							</div>
							<button
								aria-label="Fechar"
								className="btn-tactile rounded p-1 hover:bg-secondary"
								onClick={closeBrowserModal}
								type="button"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-3 py-4 text-xs">
							<p className="font-mono text-muted-foreground">
								Para instalar o app pelo seu navegador:
							</p>
							<p className="font-mono">
								Clique no ícone de <strong>instalar</strong> na barra de
								endereço do navegador (Chrome, Edge ou Brave) ou abra as
								configurações do navegador e selecione{" "}
								<strong>"Instalar aplicativo"</strong>.
							</p>
						</div>

						<button
							className="btn-tactile w-full rounded-md border-2 border-black bg-primary py-2.5 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm dark:border-white"
							onClick={closeBrowserModal}
							type="button"
						>
							FECHAR
						</button>
					</div>
				</div>
			) : null}
		</PwaContext.Provider>
	);
}
