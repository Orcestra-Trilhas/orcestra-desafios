"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { BauhausSkeleton } from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";
import { LeaderboardList } from "./_components/leaderboard-list";
import { PodiumTop3 } from "./_components/podium-top3";
import { RankingFilters } from "./_components/ranking-filters";
import { SprintThermometerCard } from "./_components/sprint-thermometer-card";

export default function RankingPage() {
	const [filterType, setFilterType] = useState<"ALL" | "DEPARTMENT" | "TRACK">(
		"ALL"
	);
	const [filterValue, setFilterValue] = useState<string>("");
	const [viewMode, setViewMode] = useState<"PAIRS" | "MEMBERS">("PAIRS");

	const handleFilterTypeChange = useCallback(
		(type: "ALL" | "DEPARTMENT" | "TRACK") => {
			setFilterType(type);
		},
		[]
	);

	const handleFilterValueChange = useCallback((val: string) => {
		setFilterValue(val);
	}, []);

	const handleViewModeChange = useCallback((mode: "PAIRS" | "MEMBERS") => {
		setViewMode(mode);
	}, []);

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
				<h1 className="font-black font-display text-3xl uppercase tracking-tight sm:text-4xl">
					RANKING {"//"} MISSÕES
				</h1>
				<p className="font-medium text-muted-foreground text-xs">
					Pontuação acumulada por duplas cooperativas e membros da EJ
				</p>
			</div>

			{/* Collective Missions Thermometer */}
			<SprintThermometerCard thermometer={thermometer} />

			{/* Filter Controls */}
			<RankingFilters
				filterType={filterType}
				filterValue={filterValue}
				onFilterTypeChange={handleFilterTypeChange}
				onFilterValueChange={handleFilterValueChange}
				onViewModeChange={handleViewModeChange}
				viewMode={viewMode}
			/>

			{/* Visual Podium Top 3 */}
			{leaderboardQuery.isLoading ? (
				<BauhausSkeleton />
			) : (
				<PodiumTop3 top3={top3} />
			)}

			{/* Full Leaderboard List */}
			<div className="space-y-3">
				<div className="border-black border-b-2 pb-1.5 dark:border-white">
					<h3 className="font-black font-display text-sm uppercase tracking-wider">
						CLASSIFICAÇÃO GERAL {"//"} TODAS AS POSIÇÕES
					</h3>
				</div>

				<LeaderboardList
					isLoading={leaderboardQuery.isLoading}
					ranked={ranked}
				/>
			</div>
		</div>
	);
}
