import { AlertTriangle, Trash2 } from "lucide-react";

export interface ClearPairsDialogProps {
	challengeTitle: string;
	isOpen: boolean;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => void;
	totalPairs: number;
}

export function ClearPairsDialog({
	challengeTitle,
	isOpen,
	isPending,
	onClose,
	onConfirm,
	totalPairs,
}: ClearPairsDialogProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative w-full max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
				<div className="flex items-center gap-3 border-black border-b-2 pb-3 dark:border-white">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white">
						<AlertTriangle className="h-5 w-5" />
					</div>
					<div>
						<h3 className="font-black font-display text-destructive text-lg uppercase dark:text-red-400">
							DESORTEAR TODAS AS DUPLAS
						</h3>
						<p className="font-mono text-muted-foreground text-xs uppercase">
							LIMPAR ALOCAÇÃO ATUAL
						</p>
					</div>
				</div>

				<div className="space-y-2 text-xs">
					<p className="font-medium text-foreground">
						Tem certeza que deseja desortear e remover todas as duplas do
						desafio abaixo?
					</p>
					<div className="rounded-md border-2 border-black/20 bg-secondary/50 p-2.5 font-bold font-display uppercase dark:border-white/20">
						{challengeTitle}
					</div>
					<div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 font-mono text-[11px] text-destructive dark:text-red-400">
						⚠️ Esta ação removerá permanentemente as{" "}
						<strong>{totalPairs} duplas</strong> alocadas e suas submissões em
						andamento. Os membros ficarão livres para novo sorteio ou alocação
						manual.
					</div>
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
						<span>{isPending ? "DESORTEANDO..." : "DESORTEAR TUDO"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
