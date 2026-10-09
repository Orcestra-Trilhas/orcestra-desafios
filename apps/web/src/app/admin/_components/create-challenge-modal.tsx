"use client";

import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import type { AssessorOption } from "./types";

export interface CreateChallengeData {
	assessorId: string;
	deadline: string;
	description: string;
	mkdocsUrl: string | null;
	pointsReward: number;
	rulesMarkdown: string;
	title: string;
	trackTheme: "BACK" | "FRONT" | "PROTOTIPACAO" | "DEVOPS";
}

interface CreateChallengeModalProps {
	assessors: AssessorOption[];
	isOpen: boolean;
	isPending: boolean;
	onClose: () => void;
	onCreateChallenge: (data: CreateChallengeData) => void;
}

export const CreateChallengeModal = memo(function CreateChallengeModalRender({
	isOpen,
	onClose,
	assessors,
	onCreateChallenge,
	isPending,
}: CreateChallengeModalProps) {
	const [title, setTitle] = useState("");
	const [trackTheme, setTrackTheme] = useState<
		"BACK" | "FRONT" | "PROTOTIPACAO" | "DEVOPS"
	>("FRONT");
	const [description, setDescription] = useState("");
	const [rulesMarkdown, setRulesMarkdown] = useState("");
	const [mkdocsUrl, setMkdocsUrl] = useState("");
	const [assessorId, setAssessorId] = useState(assessors[0]?.id ?? "");
	const [pointsReward, setPointsReward] = useState(100);
	const [deadline, setDeadline] = useState("");

	const handleTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setTitle(e.target.value);
		},
		[]
	);

	const handleTrackThemeChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setTrackTheme(
				e.target.value as "BACK" | "FRONT" | "PROTOTIPACAO" | "DEVOPS"
			);
		},
		[]
	);

	const handleDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setDescription(e.target.value);
		},
		[]
	);

	const handleRulesChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setRulesMarkdown(e.target.value);
		},
		[]
	);

	const handleMkdocsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMkdocsUrl(e.target.value);
		},
		[]
	);

	const handleAssessorChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setAssessorId(e.target.value);
		},
		[]
	);

	const handlePointsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setPointsReward(Number(e.target.value));
		},
		[]
	);

	const handleDeadlineChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setDeadline(e.target.value);
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const selectedAssessor = assessorId || assessors[0]?.id;
			if (!selectedAssessor) {
				toast.error("Selecione um assessor responsável");
				return;
			}
			if (!deadline) {
				toast.error("Informe um prazo limite para o desafio");
				return;
			}
			onCreateChallenge({
				assessorId: selectedAssessor,
				deadline: new Date(deadline).toISOString(),
				description,
				mkdocsUrl: mkdocsUrl || null,
				pointsReward: Number(pointsReward),
				rulesMarkdown,
				title,
				trackTheme,
			});
		},
		[
			assessorId,
			assessors,
			deadline,
			description,
			mkdocsUrl,
			pointsReward,
			rulesMarkdown,
			title,
			trackTheme,
			onCreateChallenge,
		]
	);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<form
				className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white"
				onSubmit={handleSubmit}
			>
				{/* Modal Header */}
				<div className="flex shrink-0 items-center justify-between border-black border-b-2 p-4 sm:p-5 dark:border-white">
					<h3 className="font-black font-display text-lg uppercase sm:text-xl">
						CRIAR NOVO DESAFIO {"//"} EJ
					</h3>
					<button
						aria-label="Fechar modal"
						className="btn-tactile flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						X
					</button>
				</div>

				{/* Modal Scrollable Body */}
				<div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-6">
					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalTitle"
						>
							Título do Desafio
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalTitle"
							onChange={handleTitleChange}
							placeholder="Ex: Desafio Frontend: Radix & Tailwind"
							required
							type="text"
							value={title}
						/>
					</div>

					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalTheme"
						>
							Área Técnica
						</label>
						<select
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalTheme"
							onChange={handleTrackThemeChange}
							value={trackTheme}
						>
							<option value="FRONT">FRONTEND</option>
							<option value="BACK">BACKEND</option>
							<option value="PROTOTIPACAO">PROTÓTIPO</option>
							<option value="DEVOPS">DEVOPS</option>
						</select>
					</div>

					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalDesc"
						>
							Descrição Curta
						</label>
						<textarea
							className="w-full resize-none rounded-md border-2 border-black bg-background p-2.5 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalDesc"
							onChange={handleDescriptionChange}
							required
							rows={2}
							value={description}
						/>
					</div>

					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalRules"
						>
							Regras & Critérios (Markdown)
						</label>
						<textarea
							className="w-full resize-none rounded-md border-2 border-black bg-background p-2.5 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalRules"
							onChange={handleRulesChange}
							placeholder="1. Requisitos obrigatórios...&#10;2. Entregáveis esperados..."
							required
							rows={3}
							value={rulesMarkdown}
						/>
					</div>

					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalMkdocs"
						>
							Link do Guia no MkDocs
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalMkdocs"
							onChange={handleMkdocsChange}
							placeholder="https://docs.orcestra.com/..."
							type="url"
							value={mkdocsUrl}
						/>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="chalAssessor"
							>
								Assessor
							</label>
							<select
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="chalAssessor"
								onChange={handleAssessorChange}
								value={assessorId}
							>
								{assessors.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name} ({a.department})
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="chalReward"
							>
								Recompensa (PTS)
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="chalReward"
								onChange={handlePointsChange}
								type="number"
								value={pointsReward}
							/>
						</div>
					</div>

					<div className="space-y-1">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="chalDeadline"
						>
							Prazo Limite
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="chalDeadline"
							onChange={handleDeadlineChange}
							required
							type="date"
							value={deadline}
						/>
					</div>
				</div>

				{/* Modal Pinned Footer */}
				<div className="flex shrink-0 items-center justify-end gap-2.5 border-black border-t-2 bg-muted/20 p-3 sm:p-4 dark:border-white">
					<button
						className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						CANCELAR
					</button>
					<button
						className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-5 py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 disabled:opacity-50 sm:flex-initial dark:border-white"
						disabled={isPending}
						type="submit"
					>
						{isPending ? "CRIANDO..." : "CRIAR DESAFIO // SALVAR"}
					</button>
				</div>
			</form>
		</div>
	);
});
