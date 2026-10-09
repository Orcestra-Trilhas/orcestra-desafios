"use client";

import { memo } from "react";
import { BauhausSkeleton, PopPointsBadge } from "@/components/pop-elements";
import { type LeaderboardItem, renderMemberLinks } from "./types";

interface LeaderboardListProps {
	isLoading: boolean;
	ranked: LeaderboardItem[];
}

export const LeaderboardList = memo(function LeaderboardListRender({
	isLoading,
	ranked,
}: LeaderboardListProps) {
	if (isLoading) {
		return (
			<div className="space-y-2">
				<BauhausSkeleton className="h-16" />
				<BauhausSkeleton className="h-16" />
				<BauhausSkeleton className="h-16" />
			</div>
		);
	}

	if (ranked.length === 0) {
		return (
			<div className="rounded-md border-2 border-black border-dashed bg-card p-6 text-center shadow-hard-sm dark:border-white">
				<p className="font-black font-display text-muted-foreground text-xs uppercase">
					Nenhum dado encontrado com os filtros selecionados
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2.5">
			{ranked.map((item, idx) => {
				const position = idx + 1;
				const isTop3 = position <= 3;
				const itemScore = "score" in item ? item.score : item.points;

				let itemBg = "bg-card";
				if (isTop3) {
					if (position === 1) {
						itemBg = "bg-amber-400/15 dark:bg-amber-400/20";
					} else if (position === 2) {
						itemBg = "bg-slate-200/50 dark:bg-slate-700/25";
					} else {
						itemBg = "bg-amber-700/15 dark:bg-amber-700/20";
					}
				}

				let badgeBg = "bg-secondary text-foreground";
				if (position === 1) {
					badgeBg =
						"bg-[#FACC15] text-[#121212] dark:bg-[#F59E0B] dark:text-[#121212]";
				} else if (position === 2) {
					badgeBg =
						"bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100";
				} else if (position === 3) {
					badgeBg = "bg-[#B45309] text-white dark:bg-[#9A3412] dark:text-white";
				}

				return (
					<div
						className={`flex items-center justify-between gap-3 rounded-md border-2 border-black p-3 shadow-hard-sm transition-all sm:p-3.5 dark:border-white ${itemBg}`}
						key={"id" in item && item.id ? String(item.id) : `rank-${position}`}
					>
						<div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
							<div
								className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs sm:h-8 sm:w-8 dark:border-white ${badgeBg}`}
							>
								{position.toString().padStart(2, "0")}
							</div>

							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate font-black font-display text-xs uppercase sm:text-sm">
									{renderMemberLinks(item, false)}
								</span>
								<span className="truncate font-mono text-[10px] text-muted-foreground uppercase">
									{item.department ? item.department : "EJ ORCESTRA"}
								</span>
							</div>
						</div>

						<div className="shrink-0">
							<PopPointsBadge points={itemScore ?? 0} size="sm" />
						</div>
					</div>
				);
			})}
		</div>
	);
});
