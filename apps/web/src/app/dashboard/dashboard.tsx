"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { BauhausSkeleton, PopPointsBadge } from "@/components/pop-elements";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { DashboardEmptyState } from "./_components/dashboard-empty-state";
import { ExplorerModal } from "./_components/explorer-modal";
import { PairCard } from "./_components/pair-card";
import type { DashboardPair } from "./_components/types";

interface ActivePairsSectionProps {
	hasActivePairs: boolean;
	isLoading: boolean;
	onOpenExplorer: () => void;
	pairsList: DashboardPair[];
}

function ActivePairsSection({
	isLoading,
	hasActivePairs,
	pairsList,
	onOpenExplorer,
}: ActivePairsSectionProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				<BauhausSkeleton />
				<BauhausSkeleton />
			</div>
		);
	}
	if (hasActivePairs) {
		return (
			<div className="space-y-6">
				{pairsList.map((p) => (
					<PairCard key={p.id} pair={p} />
				))}
			</div>
		);
	}
	return <DashboardEmptyState onOpenExplorer={onOpenExplorer} />;
}

export default function Dashboard() {
	const { data: session } = authClient.useSession();
	const userMe = useQuery(trpc.user.me.queryOptions());
	const myPairs = useQuery(trpc.challenge.myPairs.queryOptions());
	const activeChallenges = useQuery(trpc.challenge.listActive.queryOptions());

	const [showExplorer, setShowExplorer] = useState(false);

	const handleOpenExplorer = useCallback(() => {
		setShowExplorer(true);
	}, []);

	const handleCloseExplorer = useCallback(() => {
		setShowExplorer(false);
	}, []);

	const currentUser = userMe.data ?? session?.user;
	const points =
		userMe.data?.points ??
		(session?.user as { points?: number } | undefined)?.points ??
		0;

	const pairsList = myPairs.data ?? [];
	const hasActivePairs = pairsList.length > 0;

	return (
		<div className="mx-auto max-w-3xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
			{/* PWA Install Banner */}
			<PwaInstallBanner />

			{/* Bauhaus / Fauvist Poster Banner */}
			<div className="relative overflow-hidden rounded-lg border-2 border-black bg-[#121212] p-4 text-white shadow-hard sm:p-6 dark:border-white dark:bg-card dark:text-foreground">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
					<div className="space-y-1.5 sm:space-y-2">
						<h1 className="font-black font-display text-xl uppercase tracking-tight sm:text-3xl">
							OLÁ, {currentUser?.name?.split(" ")[0] ?? "MEMBRO"}
						</h1>
						<p className="max-w-md font-medium text-white/70 text-xs dark:text-muted-foreground">
							Trabalhe com sua dupla, sincronize no WhatsApp e submeta os
							checkpoints técnicos da rodada.
						</p>
					</div>

					<div className="flex items-center justify-between gap-2.5 sm:justify-start sm:gap-3">
						<PopPointsBadge points={points} size="md" />

						<button
							className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-3.5 py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 sm:flex-initial sm:px-4 dark:border-white"
							onClick={handleOpenExplorer}
							type="button"
						>
							EXPLORAR DESAFIOS
						</button>
					</div>
				</div>
			</div>

			{/* Section Header */}
			<div className="flex items-center justify-between border-black border-b-2 pb-2 dark:border-white">
				<div className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
					<h2 className="font-black font-display text-base uppercase tracking-tight sm:text-lg">
						MEUS DESAFIOS ATIVOS {"//"} MISSÕES
					</h2>
				</div>
				<span className="font-bold font-mono text-[10px] text-muted-foreground sm:text-xs">
					[{pairsList.length} EM ANDAMENTO]
				</span>
			</div>

			{/* Active Pairs List */}
			<ActivePairsSection
				hasActivePairs={hasActivePairs}
				isLoading={myPairs.isLoading}
				onOpenExplorer={handleOpenExplorer}
				pairsList={pairsList}
			/>

			{/* Explorer Modal */}
			<ExplorerModal
				challenges={activeChallenges.data ?? []}
				isOpen={showExplorer}
				onClose={handleCloseExplorer}
				userMe={userMe.data}
			/>
		</div>
	);
}
