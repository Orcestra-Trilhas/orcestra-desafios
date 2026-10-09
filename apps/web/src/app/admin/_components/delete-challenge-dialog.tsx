"use client";

import { Trash2 } from "lucide-react";
import { memo, useCallback } from "react";
import type { AdminChallenge } from "./types";

interface DeleteChallengeDialogProps {
	challenge: AdminChallenge | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirmDelete: (challengeId: string) => void;
}

export const DeleteChallengeDialog = memo(function DeleteChallengeDialogRender({
	challenge,
	onClose,
	onConfirmDelete,
	isDeleting,
}: DeleteChallengeDialogProps) {
	const handleConfirm = useCallback(() => {
		if (challenge) {
			onConfirmDelete(challenge.id);
		}
	}, [challenge, onConfirmDelete]);

	if (!challenge) {
		return null;
	}

	const pairsCount = challenge.pairs?.length ?? 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative w-full max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
				<div className="flex items-center gap-3 border-black border-b-2 pb-3 dark:border-white">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white">
						<Trash2 className="h-5 w-5" />
					</div>
					<div>
						<h3 className="font-black font-display text-[#DC2626] text-lg uppercase">
							EXCLUIR DESAFIO
						</h3>
						<p className="font-mono text-muted-foreground text-xs uppercase">
							AÇÃO DESTRUTIVA IRREVERSÍVEL
						</p>
					</div>
				</div>

				<div className="space-y-2 text-xs">
					<p className="font-medium text-foreground">
						Você tem certeza que deseja excluir o desafio abaixo?
					</p>
					<div className="rounded-md border-2 border-black/20 bg-secondary/50 p-2.5 font-bold font-display uppercase dark:border-white/20">
						{challenge.title}
					</div>
					<p className="font-mono text-[11px] text-muted-foreground">
						{pairsCount > 0 ? (
							<span>
								⚠️ Isso também excluirá permanentemente as{" "}
								<strong className="font-bold text-[#DC2626]">
									{pairsCount} duplas/trios
								</strong>{" "}
								e todas as suas submissões e feedbacks associados.
							</span>
						) : (
							"Nenhuma dupla foi associada a este desafio ainda."
						)}
					</p>
				</div>

				<div className="flex items-center justify-end gap-2 border-black/10 border-t pt-3 dark:border-white/10">
					<button
						className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						CANCELAR
					</button>
					<button
						className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] disabled:opacity-50 dark:border-white"
						disabled={isDeleting}
						onClick={handleConfirm}
						type="button"
					>
						<Trash2 className="h-3.5 w-3.5" />
						<span>
							{isDeleting ? "EXCLUINDO..." : "EXCLUIR DEFINITIVAMENTE"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
});
