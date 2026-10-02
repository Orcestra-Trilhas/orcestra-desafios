"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePwa } from "./pwa-provider";

export function PwaInstallBanner() {
	const { isStandalone, installApp } = usePwa();
	const [dismissed, setDismissed] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const isDismissed =
			localStorage.getItem("orc_pwa_banner_dismissed") === "true";
		setDismissed(isDismissed);
	}, []);

	const handleDismiss = useCallback(() => {
		setDismissed(true);
		if (typeof window !== "undefined") {
			localStorage.setItem("orc_pwa_banner_dismissed", "true");
		}
	}, []);

	const handleInstall = useCallback(() => {
		installApp();
	}, [installApp]);

	if (isStandalone || dismissed) {
		return null;
	}

	return (
		<div className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-lg border-2 border-black bg-gradient-to-r from-card to-secondary/40 p-3.5 shadow-hard sm:flex-row sm:items-center sm:gap-4 sm:p-4 dark:border-white">
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] text-white shadow-hard-sm dark:border-white">
					<Smartphone className="h-5 w-5" />
				</div>
				<div className="space-y-0.5">
					<div className="flex items-center gap-2">
						<span className="font-black font-mono text-[#FF4A1C] text-[10px] uppercase tracking-widest">
							APP NATIVO {"//"} PWA
						</span>
					</div>
					<h3 className="font-black font-display text-xs text-foreground uppercase tracking-wide sm:text-sm">
						Instale o orc{"//"}desafios no seu dispositivo
					</h3>
					<p className="max-w-xl font-medium text-muted-foreground text-xs leading-snug">
						Acesse suas missões, ranking e desafios técnicos direto da tela
						inicial, com inicialização rápida e em tela cheia.
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 pt-1 sm:pt-0">
				<button
					className="btn-tactile flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-[#FF4A1C] px-3.5 py-1.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] sm:flex-initial dark:border-white"
					onClick={handleInstall}
					type="button"
				>
					<Download className="h-3.5 w-3.5" />
					INSTALAR
				</button>
				<button
					aria-label="Dispensar aviso"
					className="btn-tactile rounded-md border-2 border-black p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground dark:border-white"
					onClick={handleDismiss}
					type="button"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
