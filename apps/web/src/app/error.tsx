"use client";

import Link from "next/link";
import { useEffect } from "react";

const CHUNK_ERROR_PATTERN =
	/loading chunk|failed to fetch dynamically imported module/i;
const RELOAD_DEBOUNCE_MS = 15_000;

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Detect chunk loading failures (deployment skew) and auto-reload once
		const isChunkError =
			error.name === "ChunkLoadError" ||
			CHUNK_ERROR_PATTERN.test(error.message);

		if (isChunkError && typeof window !== "undefined") {
			const lastReload = sessionStorage.getItem("last_chunk_reload");
			const now = Date.now();
			if (!lastReload || now - Number(lastReload) > RELOAD_DEBOUNCE_MS) {
				sessionStorage.setItem("last_chunk_reload", String(now));
				window.location.reload();
			}
		}
	}, [error]);

	return (
		<div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center p-4 text-center">
			<div className="space-y-4 rounded-lg border-2 border-black bg-card p-6 shadow-hard dark:border-white">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[#DC2626] font-black text-white text-xl shadow-hard-sm dark:border-white">
					!
				</div>
				<div className="space-y-1.5">
					<h2 className="font-black font-display text-lg uppercase tracking-tight">
						OCORREU UM IMPREVISTO
					</h2>
					<p className="font-medium text-muted-foreground text-xs">
						Houve uma atualização no sistema ou oscilação na conexão. Você pode
						tentar novamente ou voltar para a tela principal de desafios.
					</p>
				</div>
				<div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
					<button
						className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-4 py-2 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
						onClick={reset}
						type="button"
					>
						TENTAR NOVAMENTE
					</button>
					<Link
						className="btn-tactile flex-1 rounded-md border-2 border-black bg-secondary px-4 py-2 font-bold font-display text-foreground text-xs uppercase shadow-hard-sm dark:border-white"
						href="/"
					>
						IR AOS DESAFIOS &rarr;
					</Link>
				</div>
			</div>
		</div>
	);
}
