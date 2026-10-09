"use client";

import { memo } from "react";
import { type LeaderboardItem, renderMemberLinks } from "./types";

interface PodiumTop3Props {
	top3: LeaderboardItem[];
}

function getItemScore(item?: LeaderboardItem): number {
	if (!item) {
		return 0;
	}
	if ("score" in item && typeof item.score === "number") {
		return item.score;
	}
	if (typeof item.points === "number") {
		return item.points;
	}
	return 0;
}

export const PodiumTop3 = memo(function PodiumTop3Render({
	top3,
}: PodiumTop3Props) {
	if (top3.length === 0) {
		return null;
	}

	const [first, second, third] = top3;

	const firstScore = getItemScore(first);
	const secondScore = getItemScore(second);
	const thirdScore = getItemScore(third);

	return (
		<div className="pt-2 pb-2 sm:pt-4">
			{/* Mobile Podium (< sm): Hero Leader Card + 2 Cards Below */}
			<div className="block space-y-2.5 sm:hidden">
				{/* 1st Place Hero Card (Ouro) */}
				{first ? (
					<div className="rounded-md border-2 border-black bg-[#FACC15] p-3.5 text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#121212]">
						<div className="mb-2 flex items-center justify-between gap-2 border-black/20 border-b-2 pb-2 dark:border-black/30">
							<span className="font-black font-mono text-[10px] uppercase tracking-wider">
								[LÍDER {"//"} 01 OURO]
							</span>
							<span className="rounded bg-black/10 px-2 py-0.5 font-black font-mono text-xs">
								{firstScore} PTS
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-black font-black font-display text-2xl text-[#FACC15] shadow-hard-xs dark:bg-black dark:text-[#F59E0B]">
								01
							</div>
							<div className="min-w-0 flex-1">
								<span className="block truncate font-black font-display text-base uppercase">
									{renderMemberLinks(first, true)}
								</span>
								<span className="font-bold font-mono text-[10px] uppercase opacity-80">
									{first.department ? first.department : "PRIMEIRO LUGAR"}
								</span>
							</div>
						</div>
					</div>
				) : null}

				{/* 2nd and 3rd Place Compact Cards */}
				<div className="grid grid-cols-2 gap-2">
					{second ? (
						<div className="flex flex-col justify-between rounded-md border-2 border-black bg-card p-2.5 shadow-hard-sm dark:border-white">
							<div className="mb-1.5 flex items-center justify-between gap-1 border-black/10 border-b pb-1.5 dark:border-white/10">
								<span className="rounded bg-slate-200 px-1.5 py-0.5 font-black font-mono text-[9px] text-slate-800 uppercase dark:bg-slate-700 dark:text-slate-100">
									02 PRATA
								</span>
								<span className="font-bold font-mono text-[11px] text-muted-foreground">
									{secondScore} PTS
								</span>
							</div>
							<div className="min-w-0">
								<span className="block truncate font-black font-display text-xs uppercase">
									{renderMemberLinks(second, true)}
								</span>
							</div>
						</div>
					) : null}

					{third ? (
						<div className="flex flex-col justify-between rounded-md border-2 border-black bg-card p-2.5 shadow-hard-sm dark:border-white">
							<div className="mb-1.5 flex items-center justify-between gap-1 border-black/10 border-b pb-1.5 dark:border-white/10">
								<span className="rounded bg-amber-700/15 px-1.5 py-0.5 font-black font-mono text-[9px] text-amber-800 uppercase dark:bg-amber-700/30 dark:text-amber-300">
									03 BRONZE
								</span>
								<span className="font-bold font-mono text-[11px] text-muted-foreground">
									{thirdScore} PTS
								</span>
							</div>
							<div className="min-w-0">
								<span className="block truncate font-black font-display text-xs uppercase">
									{renderMemberLinks(third, true)}
								</span>
							</div>
						</div>
					) : null}
				</div>
			</div>

			{/* Desktop Podium (sm+): 3-Column Pedestal Layout */}
			<div className="mx-auto hidden max-w-md items-end justify-center gap-2 sm:flex sm:gap-3">
				{/* 2nd Place (Prata) */}
				{second ? (
					<div className="flex flex-1 flex-col items-center">
						<div className="mb-2 w-full rounded-t-md border-2 border-black bg-secondary p-3 text-center shadow-hard-sm dark:border-white">
							<span className="block truncate font-black font-display text-xs uppercase">
								{renderMemberLinks(second, true)}
							</span>
							<span className="font-bold font-mono text-muted-foreground text-xs">
								{secondScore} PTS
							</span>
						</div>
						<div className="flex h-24 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-slate-200 font-black font-display text-slate-800 shadow-hard-sm dark:border-white dark:bg-slate-700 dark:text-slate-100">
							<span className="text-3xl">02</span>
							<span className="font-mono text-[9px] uppercase tracking-wider">
								[PRATA]
							</span>
						</div>
					</div>
				) : null}

				{/* 1st Place (Ouro) */}
				{first ? (
					<div className="flex flex-1 flex-col items-center">
						<div className="mb-2 w-full rounded-t-md border-2 border-black bg-[#FACC15] p-3.5 text-center text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#121212]">
							<span className="block truncate font-black font-display text-sm uppercase">
								{renderMemberLinks(first, true)}
							</span>
							<span className="font-black font-mono text-xs">
								{firstScore} PTS
							</span>
						</div>
						<div className="flex h-36 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-[#FACC15] font-black font-display text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#121212]">
							<span className="text-5xl">01</span>
							<span className="font-mono text-[10px] uppercase tracking-wider">
								[LÍDER {"//"} OURO]
							</span>
						</div>
					</div>
				) : null}

				{/* 3rd Place (Bronze) */}
				{third ? (
					<div className="flex flex-1 flex-col items-center">
						<div className="mb-2 w-full rounded-t-md border-2 border-black bg-secondary p-3 text-center shadow-hard-sm dark:border-white">
							<span className="block truncate font-black font-display text-xs uppercase">
								{renderMemberLinks(third, true)}
							</span>
							<span className="font-bold font-mono text-muted-foreground text-xs">
								{thirdScore} PTS
							</span>
						</div>
						<div className="flex h-20 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-[#B45309] font-black font-display text-white shadow-hard-sm dark:border-white dark:bg-[#9A3412]">
							<span className="text-3xl">03</span>
							<span className="font-mono text-[9px] uppercase tracking-wider">
								[BRONZE]
							</span>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
});
