"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
	BauhausSkeleton,
	PopBadge,
	PopPointsBadge,
} from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";

const DEPARTMENTS = [
	{ id: "DIPROJ", label: "DIPROJ" },
	{ id: "DIBIS", label: "DIBIS" },
	{ id: "DICOM", label: "DICOM" },
	{ id: "TOPS", label: "TOPS" },
] as const;

const TRACKS = [
	{ id: "FRONT", label: "FRONTEND" },
	{ id: "BACK", label: "BACKEND" },
	{ id: "PROTOTIPACAO", label: "PROTÓTIPO" },
	{ id: "DEVOPS", label: "DEVOPS" },
] as const;

type LeaderboardItem = {
	id?: string;
	name?: string;
	members?: Array<{ id: string; name: string }>;
};

function renderMemberLinks(item: LeaderboardItem, short = false) {
	if (
		"members" in item &&
		Array.isArray(item.members) &&
		item.members.length > 0
	) {
		return item.members.map((m, idx) => (
			<span key={m.id || idx}>
				<Link
					className="hover:text-[#FF4A1C] hover:underline"
					href={`/profile?id=${m.id}`}
				>
					{short ? m.name.split(" ")[0] : m.name}
				</Link>
				{idx < (item.members?.length ?? 0) - 1 ? " & " : ""}
			</span>
		));
	}
	if (item.id && item.name) {
		return (
			<Link
				className="hover:text-[#FF4A1C] hover:underline"
				href={`/profile?id=${item.id}`}
			>
				{short ? item.name.split(" ")[0] : item.name}
			</Link>
		);
	}
	return item.name || "MEMBRO";
}

export default function RankingPage() {
	const [filterType, setFilterType] = useState<"ALL" | "DEPARTMENT" | "TRACK">(
		"ALL"
	);
	const [filterValue, setFilterValue] = useState<string>("");
	const [viewMode, setViewMode] = useState<"PAIRS" | "MEMBERS">("PAIRS");

	const sprintThermometer = useQuery(
		trpc.ranking.getSprintThermometer.queryOptions()
	);

	const leaderboardQuery = useQuery(
		trpc.ranking.getLeaderboard.queryOptions({
			category: filterType,
			filterValue: filterValue || undefined,
			viewMode,
		})
	);

	const thermometer = sprintThermometer.data ?? {
		completed: 0,
		percentage: 0,
		target: 10,
		total: 0,
	};

	const top3 = leaderboardQuery.data?.top3 ?? [];
	const ranked = leaderboardQuery.data?.ranked ?? [];

	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
			{/* Poster Header */}
			<div className="space-y-1 text-center">
				<div className="flex items-center justify-center gap-2">
					<PopBadge color="yellow">RODADA EM CURSO</PopBadge>
					<PopBadge color="black">GAMIFICAÇÃO EJ</PopBadge>
				</div>
				<h1 className="mt-2 font-black font-display text-3xl uppercase tracking-tight sm:text-4xl">
					RANKING {"//"} MISSÕES
				</h1>
				<p className="font-medium text-muted-foreground text-xs">
					Pontuação acumulada por duplas cooperativas e membros da EJ
				</p>
			</div>

			{/* Collective Missions Thermometer */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 items-center gap-2">
						<div className="h-3 w-3 shrink-0 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
						<span className="truncate font-black font-display text-xs uppercase tracking-wider">
							TERMÔMETRO GERAL DAS MISSÕES
						</span>
					</div>
					<span className="shrink-0 font-black font-mono text-[11px] sm:text-xs">
						{thermometer.completed} ENTREGAS ({thermometer.percentage}%)
					</span>
				</div>

				{/* Two-tone stark Bauhaus meter */}
				<div className="h-5 w-full overflow-hidden rounded-xs border-2 border-black bg-secondary p-0.5 dark:border-white">
					<div
						className="h-full border-black border-r-2 bg-[#FF4A1C] transition-all duration-500 dark:border-white"
						style={{
							width: `${Math.min(Math.max(thermometer.percentage, 3), 100)}%`,
						}}
					/>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-muted-foreground uppercase sm:text-[11px]">
					<span>META COLETIVA: {thermometer.target} ENTREGAS APROVADAS</span>
					<span className="font-bold text-foreground">
						{thermometer.percentage >= 100
							? "[META ALCANÇADA]"
							: "[MISSÕES EM ANDAMENTO]"}
					</span>
				</div>
			</div>

			{/* Filter Controls */}
			<div className="space-y-3">
				<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
					{/* Category Tabs */}
					<div className="flex items-center gap-1 overflow-x-auto rounded-md border-2 border-black bg-secondary p-1 dark:border-white">
						<button
							className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
								filterType === "ALL"
									? "border-2 border-black bg-[#FF4A1C] text-white shadow-hard-sm dark:border-white"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => {
								setFilterType("ALL");
								setFilterValue("");
							}}
							type="button"
						>
							GERAL
						</button>

						<button
							className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
								filterType === "DEPARTMENT"
									? "border-2 border-black bg-[#FF4A1C] text-white shadow-hard-sm dark:border-white"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => {
								setFilterType("DEPARTMENT");
								setFilterValue("DIPROJ");
							}}
							type="button"
						>
							DIRETORIA
						</button>

						<button
							className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
								filterType === "TRACK"
									? "border-2 border-black bg-[#FF4A1C] text-white shadow-hard-sm dark:border-white"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => {
								setFilterType("TRACK");
								setFilterValue("FRONT");
							}}
							type="button"
						>
							TRILHA TÉCNICA
						</button>
					</div>

					{/* View Mode Toggle: Duplas vs Membros */}
					<div className="flex items-center gap-1 self-start rounded-md border-2 border-black bg-secondary p-1 sm:self-auto dark:border-white">
						<button
							className={`btn-tactile rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
								viewMode === "PAIRS"
									? "border-2 border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => setViewMode("PAIRS")}
							type="button"
						>
							DUPLAS
						</button>

						<button
							className={`btn-tactile rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
								viewMode === "MEMBERS"
									? "border-2 border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => setViewMode("MEMBERS")}
							type="button"
						>
							MEMBROS
						</button>
					</div>
				</div>

				{/* Sub-filters for Department */}
				{filterType === "DEPARTMENT" && (
					<div className="flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
						{DEPARTMENTS.map((dept) => (
							<button
								className={`btn-tactile rounded-md border-2 px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:px-3 sm:text-xs ${
									filterValue === dept.id
										? "border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white"
										: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
								}`}
								key={dept.id}
								onClick={() => setFilterValue(dept.id)}
								type="button"
							>
								{dept.label}
							</button>
						))}
					</div>
				)}

				{/* Sub-filters for Track */}
				{filterType === "TRACK" && (
					<div className="flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
						{TRACKS.map((t) => (
							<button
								className={`btn-tactile rounded-md border-2 px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:px-3 sm:text-xs ${
									filterValue === t.id
										? "border-black bg-[#15803D] text-white shadow-hard-sm dark:border-white"
										: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
								}`}
								key={t.id}
								onClick={() => setFilterValue(t.id)}
								type="button"
							>
								{t.label}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Visual Podium Top 3 */}
			{leaderboardQuery.isLoading ? (
				<BauhausSkeleton />
			) : top3.length > 0 ? (
				<div className="pt-2 pb-2 sm:pt-4">
					{/* Mobile Podium (< sm): Hero Leader Card + 2 Cards Below */}
					<div className="block space-y-2.5 sm:hidden">
						{/* 1st Place Hero Card */}
						{top3[0] && (
							<div className="rounded-md border-2 border-black bg-[#FACC15] p-3.5 text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#0B0E1E]">
								<div className="mb-2 flex items-center justify-between gap-2 border-black/20 border-b-2 pb-2 dark:border-black/30">
									<span className="font-black font-mono text-[10px] uppercase tracking-wider">
										[LÍDER // 01 OURO]
									</span>
									<span className="rounded bg-black/10 px-2 py-0.5 font-black font-mono text-xs">
										{"score" in top3[0] ? top3[0].score : top3[0].points} PTS
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-black font-black font-display text-2xl text-[#FACC15] shadow-hard-xs dark:bg-[#0B0E1E] dark:text-[#F59E0B]">
										01
									</div>
									<div className="min-w-0 flex-1">
										<span className="block truncate font-black font-display text-base uppercase">
											{renderMemberLinks(top3[0], true)}
										</span>
										<span className="font-bold font-mono text-[10px] uppercase opacity-80">
											{"department" in top3[0] && top3[0].department
												? top3[0].department
												: "PRIMEIRO LUGAR"}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* 2nd and 3rd Place Compact Cards */}
						<div className="grid grid-cols-2 gap-2">
							{top3[1] && (
								<div className="flex flex-col justify-between rounded-md border-2 border-black bg-card p-2.5 shadow-hard-sm dark:border-white">
									<div className="mb-1.5 flex items-center justify-between gap-1 border-black/10 border-b pb-1.5 dark:border-white/10">
										<span className="rounded bg-[#EFECE6] px-1.5 py-0.5 font-black font-mono text-[#121212] text-[9px] uppercase dark:bg-[#1C2142] dark:text-[#EDE8DD]">
											02 PRATA
										</span>
										<span className="font-bold font-mono text-[11px] text-muted-foreground">
											{"score" in top3[1] ? top3[1].score : top3[1].points} PTS
										</span>
									</div>
									<div className="min-w-0">
										<span className="block truncate font-black font-display text-xs uppercase">
											{renderMemberLinks(top3[1], true)}
										</span>
									</div>
								</div>
							)}

							{top3[2] && (
								<div className="flex flex-col justify-between rounded-md border-2 border-black bg-card p-2.5 shadow-hard-sm dark:border-white">
									<div className="mb-1.5 flex items-center justify-between gap-1 border-black/10 border-b pb-1.5 dark:border-white/10">
										<span className="rounded bg-[#FF4A1C]/20 px-1.5 py-0.5 font-black font-mono text-[#FF4A1C] text-[9px] uppercase dark:text-[#F04D30]">
											03 BRONZE
										</span>
										<span className="font-bold font-mono text-[11px] text-muted-foreground">
											{"score" in top3[2] ? top3[2].score : top3[2].points} PTS
										</span>
									</div>
									<div className="min-w-0">
										<span className="block truncate font-black font-display text-xs uppercase">
											{renderMemberLinks(top3[2], true)}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Desktop Podium (sm+): 3-Column Pedestal Layout */}
					<div className="mx-auto hidden max-w-md items-end justify-center gap-2 sm:flex sm:gap-3">
						{/* 2nd Place */}
						{top3[1] && (
							<div className="flex flex-1 flex-col items-center">
								<div className="mb-2 w-full rounded-t-md border-2 border-black bg-secondary p-3 text-center shadow-hard-sm dark:border-white">
									<span className="block truncate font-black font-display text-xs uppercase">
										{renderMemberLinks(top3[1], true)}
									</span>
									<span className="font-bold font-mono text-muted-foreground text-xs">
										{"score" in top3[1] ? top3[1].score : top3[1].points} PTS
									</span>
								</div>
								<div className="flex h-24 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-[#EFECE6] font-black font-display text-[#121212] shadow-hard-sm dark:border-white dark:bg-[#1C2142] dark:text-[#EDE8DD]">
									<span className="text-3xl">02</span>
									<span className="font-mono text-[9px] uppercase tracking-wider">
										[PRATA]
									</span>
								</div>
							</div>
						)}

						{/* 1st Place */}
						{top3[0] && (
							<div className="flex flex-1 flex-col items-center">
								<div className="mb-2 w-full rounded-t-md border-2 border-black bg-[#FACC15] p-3.5 text-center text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#0B0E1E]">
									<span className="block truncate font-black font-display text-sm uppercase">
										{renderMemberLinks(top3[0], true)}
									</span>
									<span className="font-black font-mono text-xs">
										{"score" in top3[0] ? top3[0].score : top3[0].points} PTS
									</span>
								</div>
								<div className="flex h-36 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-[#FACC15] font-black font-display text-[#121212] shadow-hard dark:border-white dark:bg-[#F59E0B] dark:text-[#0B0E1E]">
									<span className="text-5xl">01</span>
									<span className="font-mono text-[10px] uppercase tracking-wider">
										[LÍDER // OURO]
									</span>
								</div>
							</div>
						)}

						{/* 3rd Place */}
						{top3[2] && (
							<div className="flex flex-1 flex-col items-center">
								<div className="mb-2 w-full rounded-t-md border-2 border-black bg-secondary p-3 text-center shadow-hard-sm dark:border-white">
									<span className="block truncate font-black font-display text-xs uppercase">
										{renderMemberLinks(top3[2], true)}
									</span>
									<span className="font-bold font-mono text-muted-foreground text-xs">
										{"score" in top3[2] ? top3[2].score : top3[2].points} PTS
									</span>
								</div>
								<div className="flex h-20 w-full flex-col items-center justify-center rounded-b-md border-2 border-black bg-[#FF4A1C] font-black font-display text-white shadow-hard-sm dark:border-white dark:bg-[#F04D30]">
									<span className="text-3xl">03</span>
									<span className="font-mono text-[9px] uppercase tracking-wider">
										[BRONZE]
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			) : null}

			{/* Full Leaderboard List */}
			<div className="space-y-3">
				<div className="border-black border-b-2 pb-1.5 dark:border-white">
					<h3 className="font-black font-display text-sm uppercase tracking-wider">
						CLASSIFICAÇÃO GERAL // TODAS AS POSIÇÕES
					</h3>
				</div>

				{leaderboardQuery.isLoading ? (
					<div className="space-y-2">
						<BauhausSkeleton className="h-16" />
						<BauhausSkeleton className="h-16" />
						<BauhausSkeleton className="h-16" />
					</div>
				) : ranked.length > 0 ? (
					<div className="space-y-2.5">
						{ranked.map((item, idx) => {
							const position = idx + 1;
							const isTop3 = position <= 3;

							return (
								<div
									className={`flex items-center justify-between gap-3 rounded-md border-2 border-black p-3 shadow-hard-sm transition-all sm:p-3.5 dark:border-white ${
										isTop3
											? position === 1
												? "bg-[#FACC15]/20"
												: position === 2
													? "bg-[#EFECE6]/40 dark:bg-white/5"
													: "bg-[#FF4A1C]/15"
											: "bg-card"
									}`}
									key={"id" in item ? String(item.id) : `rank-${position}`}
								>
									<div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
										<div
											className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs sm:h-8 sm:w-8 dark:border-white ${
												position === 1
													? "bg-[#FACC15] text-[#121212]"
													: position === 2
														? "bg-[#EFECE6] text-[#121212]"
														: position === 3
															? "bg-[#FF4A1C] text-white"
															: "bg-secondary text-foreground"
											}`}
										>
											{position.toString().padStart(2, "0")}
										</div>

										<div className="flex min-w-0 flex-1 flex-col">
											<span className="truncate font-black font-display text-xs uppercase sm:text-sm">
												{renderMemberLinks(item, false)}
											</span>
											<span className="truncate font-mono text-[10px] text-muted-foreground uppercase">
												{"department" in item && item.department
													? item.department
													: "EJ ORCESTRA"}
											</span>
										</div>
									</div>

									<div className="shrink-0">
										<PopPointsBadge
											points={"score" in item ? item.score : item.points}
											size="sm"
										/>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="rounded-md border-2 border-black border-dashed bg-card p-6 text-center shadow-hard-sm dark:border-white">
						<p className="font-black font-display text-muted-foreground text-xs uppercase">
							Nenhum dado encontrado com os filtros selecionados
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
