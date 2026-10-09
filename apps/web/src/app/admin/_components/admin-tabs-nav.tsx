"use client";

import { memo, useCallback } from "react";

export type AdminTab = "SUBMISSIONS" | "CHALLENGES" | "LOGS";

interface AdminTabsNavProps {
	activeTab: AdminTab;
	onTabChange: (tab: AdminTab) => void;
	submissionsCount: number;
}

export const AdminTabsNav = memo(function AdminTabsNavRender({
	activeTab,
	onTabChange,
	submissionsCount,
}: AdminTabsNavProps) {
	const handleSubmissionsClick = useCallback(() => {
		onTabChange("SUBMISSIONS");
	}, [onTabChange]);

	const handleChallengesClick = useCallback(() => {
		onTabChange("CHALLENGES");
	}, [onTabChange]);

	const handleLogsClick = useCallback(() => {
		onTabChange("LOGS");
	}, [onTabChange]);

	return (
		<div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto border-black border-b-2 pb-2 sm:gap-2 dark:border-white">
			<button
				className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
					activeTab === "SUBMISSIONS"
						? "border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white"
						: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
				}`}
				onClick={handleSubmissionsClick}
				type="button"
			>
				FILA DE SUBMISSÕES ({submissionsCount})
			</button>

			<button
				className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
					activeTab === "CHALLENGES"
						? "border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white dark:bg-[#2563EB]"
						: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
				}`}
				onClick={handleChallengesClick}
				type="button"
			>
				DESAFIOS & SORTEIO
			</button>

			<button
				className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
					activeTab === "LOGS"
						? "border-black bg-foreground text-background shadow-hard-sm dark:border-white"
						: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
				}`}
				onClick={handleLogsClick}
				type="button"
			>
				LOGS DE AUDITORIA
			</button>
		</div>
	);
});
