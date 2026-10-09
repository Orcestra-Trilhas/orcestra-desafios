import { Trash2 } from "lucide-react";

interface DeleteChallengeDialogProps {
	challengeTitle: string;
	isOpen: boolean;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => void;
	totalPairs: number;
}

export function DeleteChallengeDialog({
	challengeTitle,
	isOpen,
	isPending,
	onClose,
	onConfirm,
	totalPairs,
}: DeleteChallengeDialogProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative w-full max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
				<div className="flex items-center gap-3 border-black border-b-2 pb-3 dark:border-white">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white">
						<Trash2 className="h-5 w-5" />
					</div>
					<div>
						<h3 className="font-black font-display text-destructive text-lg uppercase dark:text-red-400">
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
						{challengeTitle}
					</div>
					<p className="font-mono text-[11px] text-muted-foreground">
						{totalPairs > 0 ? (
							<span>
								⚠️ Isso também excluirá permanentemente as{" "}
								<strong className="font-bold text-destructive dark:text-red-400">
									{totalPairs} duplas/trios
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
						disabled={isPending}
						onClick={onConfirm}
						type="button"
					>
						<Trash2 className="h-3.5 w-3.5" />
						<span>
							{isPending ? "EXCLUINDO..." : "EXCLUIR DEFINITIVAMENTE"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
