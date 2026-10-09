"use client";

import { memo } from "react";
import type { AdminMetrics } from "./types";

interface MetricCardsProps {
	metrics: AdminMetrics;
}

export const MetricCards = memo(function MetricCardsRender({
	metrics,
}: MetricCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
			<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					DESAFIOS ATIVOS
				</span>
				<span className="font-black font-display text-[#1E40AF] text-xl sm:text-2xl dark:text-blue-400">
					{metrics.activeChallenges} / {metrics.totalChallenges}
				</span>
				<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					{metrics.totalPairs} DUPLAS ALOCADAS
				</span>
			</div>

			<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					SUBMISSÕES
				</span>
				<span className="font-black font-display text-amber-600 text-xl sm:text-2xl dark:text-amber-400">
					{metrics.submittedPairs}
				</span>
				<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					NA FILA DE AVALIAÇÃO
				</span>
			</div>

			<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					APROVAÇÕES
				</span>
				<span className="font-black font-display text-emerald-700 text-xl sm:text-2xl dark:text-emerald-400">
					{metrics.approvalRate}%
				</span>
				<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					{metrics.approvedPairs} APROVADAS
				</span>
			</div>

			<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					TRAVADAS / RISCO
				</span>
				<span className="font-black font-display text-red-600 text-xl sm:text-2xl dark:text-red-400">
					{metrics.stuckPairs}
				</span>
				<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					PERTO DO PRAZO
				</span>
			</div>
		</div>
	);
});
