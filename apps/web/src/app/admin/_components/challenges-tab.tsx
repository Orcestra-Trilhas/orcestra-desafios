"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { memo, useCallback } from "react";
import { PopTrackBadge } from "@/components/pop-elements";
import type { AdminChallenge } from "./types";

interface ChallengesTabProps {
	challenges: AdminChallenge[];
	isDrawing: boolean;
	onDeleteClick: (challenge: AdminChallenge) => void;
	onDrawPairs: (challengeId: string) => void;
	onToggleActive: (challengeId: string, currentActive: boolean) => void;
}

interface ChallengeItemProps {
	challenge: AdminChallenge;
	isDrawing: boolean;
	onDelete: (challenge: AdminChallenge) => void;
	onDraw: (challengeId: string) => void;
	onToggle: (challengeId: string, currentActive: boolean) => void;
}

const ChallengeItem = memo(function ChallengeItemRender({
	challenge: ch,
	onToggle,
	onDraw,
	onDelete,
	isDrawing,
}: ChallengeItemProps) {
	const pairsCount = ch.pairs?.length ?? 0;

	const handleToggle = useCallback(() => {
		onToggle(ch.id, ch.active);
	}, [onToggle, ch.id, ch.active]);

	const handleDraw = useCallback(() => {
		onDraw(ch.id);
	}, [onDraw, ch.id]);

	const handleDelete = useCallback(() => {
		onDelete(ch);
	}, [onDelete, ch]);

	return (
		<div className="space-y-3 rounded-md border-2 border-black bg-card p-3.5 shadow-hard-sm sm:p-5 dark:border-white">
			<div className="flex flex-col justify-between gap-3 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<PopTrackBadge track={ch.trackTheme} />
						<h3 className="truncate font-black font-display text-base uppercase sm:text-lg">
							{ch.title}
						</h3>
					</div>
					<p className="mt-1 font-mono text-muted-foreground text-xs uppercase">
						ASSESSOR: {ch.assessor?.name} {"//"} PRAZO:{" "}
						{new Date(ch.deadline).toLocaleDateString("pt-BR")}
					</p>
				</div>

				<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
					<button
						className={`btn-tactile flex-1 rounded-md border-2 px-3 py-1 font-black font-display text-xs uppercase sm:flex-initial ${
							ch.active
								? "border-black bg-[#15803D] text-white dark:border-white"
								: "border-black/30 bg-muted text-muted-foreground dark:border-white/30"
						}`}
						onClick={handleToggle}
						type="button"
					>
						{ch.active ? "ATIVO" : "INATIVO"}
					</button>

					<button
						className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-3.5 py-1 text-center font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 disabled:opacity-50 sm:flex-initial dark:border-white"
						disabled={isDrawing}
						onClick={handleDraw}
						type="button"
					>
						{isDrawing ? "SORTEANDO..." : "SORTEAR DUPLAS"}
					</button>

					<button
						aria-label={`Excluir desafio ${ch.title}`}
						className="btn-tactile flex items-center justify-center gap-1 rounded-md border-2 border-black bg-[#DC2626] px-2.5 py-1 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] sm:flex-initial dark:border-white"
						onClick={handleDelete}
						title="Excluir Desafio"
						type="button"
					>
						<Trash2 className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">EXCLUIR</span>
					</button>
				</div>
			</div>

			<div className="flex items-center justify-between font-mono text-muted-foreground text-xs uppercase">
				<span>{pairsCount} DUPLAS / TRIOS ALOCADOS</span>
				<Link
					className="font-bold text-foreground hover:underline"
					href={`/challenges/${ch.id}`}
				>
					VER DETALHES &rarr;
				</Link>
			</div>
		</div>
	);
});

export const ChallengesTab = memo(function ChallengesTabRender({
	challenges,
	onToggleActive,
	onDrawPairs,
	onDeleteClick,
	isDrawing,
}: ChallengesTabProps) {
	if (challenges.length === 0) {
		return (
			<div className="rounded-md border-2 border-black border-dashed bg-card p-8 text-center dark:border-white">
				<p className="font-black font-display text-muted-foreground text-xs uppercase">
					Nenhum desafio cadastrado até o momento.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{challenges.map((ch) => (
				<ChallengeItem
					challenge={ch}
					isDrawing={isDrawing}
					key={ch.id}
					onDelete={onDeleteClick}
					onDraw={onDrawPairs}
					onToggle={onToggleActive}
				/>
			))}
		</div>
	);
});
