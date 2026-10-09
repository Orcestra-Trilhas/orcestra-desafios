"use client";

import Link from "next/link";
import { memo } from "react";

interface DashboardEmptyStateProps {
	onOpenExplorer: () => void;
}

export const DashboardEmptyState = memo(function DashboardEmptyStateRender({
	onOpenExplorer,
}: DashboardEmptyStateProps) {
	return (
		<div className="space-y-4 rounded-lg border-2 border-black border-dashed bg-card p-8 text-center shadow-hard dark:border-white">
			<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[#FACC15] font-black text-2xl text-black shadow-hard-sm dark:border-white">
				!
			</div>
			<div className="space-y-1">
				<h3 className="font-black font-display text-lg uppercase">
					NENHUMA DUPLA ATIVA NA RODADA
				</h3>
				<p className="mx-auto max-w-sm font-medium text-muted-foreground text-xs">
					O sorteio das duplas ocorre após o fechamento das inscrições de cada
					missão.
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
				<button
					className="btn-tactile rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] dark:border-white"
					onClick={onOpenExplorer}
					type="button"
				>
					EXPLORAR DESAFIOS
				</button>
				<Link
					className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-bold font-display text-foreground text-xs uppercase shadow-hard-sm dark:border-white"
					href="/profile"
				>
					PREFERÊNCIAS NO PERFIL
				</Link>
			</div>
		</div>
	);
});
