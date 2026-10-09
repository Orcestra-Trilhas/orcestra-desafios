import { Trash2 } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback } from "react";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import type { Evidence, SubmissionType } from "./types";

interface ChallengeSubmissionModalProps {
	attachedEvidences: Evidence[];
	challengeTitle: string;
	isOpen: boolean;
	isPending: boolean;
	onAddEvidence: (url: string) => void;
	onChangeNotes: (val: string) => void;
	onChangePrUrl: (val: string) => void;
	onChangeRepoUrl: (val: string) => void;
	onChangeType: (type: SubmissionType) => void;
	onClose: () => void;
	onRemoveEvidence: (rawMatch: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	prUrl: string;
	repoUrl: string;
	submissionNotes: string;
	submissionType: SubmissionType;
}

const SUBMISSION_TYPES: SubmissionType[] = ["PR", "TEXT", "DOCUMENT"];

function SubmissionTypeTab({
	isSelected,
	onSelect,
	type,
}: {
	isSelected: boolean;
	onSelect: (type: SubmissionType) => void;
	type: SubmissionType;
}) {
	const handleClick = useCallback(() => {
		onSelect(type);
	}, [onSelect, type]);

	let label = "ARQUIVO / LINK";
	if (type === "PR") {
		label = "PULL REQUEST";
	} else if (type === "TEXT") {
		label = "TEXTO / .MD";
	}

	return (
		<button
			className={`btn-tactile rounded-md border-2 p-2 font-black font-display text-xs uppercase transition ${
				isSelected
					? "border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
					: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
			}`}
			onClick={handleClick}
			type="button"
		>
			{label}
		</button>
	);
}

function EvidenceGalleryItem({
	evidence,
	idx,
	onRemove,
}: {
	evidence: Evidence;
	idx: number;
	onRemove: (raw: string) => void;
}) {
	const handleRemove = useCallback(() => {
		onRemove(evidence.raw);
	}, [evidence.raw, onRemove]);

	return (
		<div className="group relative flex items-center gap-2 rounded-md border border-black bg-background p-1.5 shadow-hard-xs dark:border-white">
			<Image
				alt={evidence.alt}
				className="h-10 w-10 rounded border border-black/20 object-cover dark:border-white/20"
				height={40}
				src={getOptimizedMediaUrl(evidence.url, {
					crop: "fill",
					height: 80,
					width: 80,
				})}
				unoptimized
				width={40}
			/>
			<span className="max-w-[120px] truncate font-mono text-[10px]">
				{evidence.alt || `Evidência #${idx + 1}`}
			</span>
			<button
				className="cursor-pointer p-1 text-muted-foreground hover:text-destructive"
				onClick={handleRemove}
				title="Remover anexo"
				type="button"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}

export function ChallengeSubmissionModal({
	attachedEvidences,
	challengeTitle,
	isOpen,
	isPending,
	onAddEvidence,
	onChangeNotes,
	onChangePrUrl,
	onChangeRepoUrl,
	onChangeType,
	onClose,
	onRemoveEvidence,
	onSubmit,
	prUrl,
	repoUrl,
	submissionNotes,
	submissionType,
}: ChallengeSubmissionModalProps) {
	const handlePrUrlChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChangePrUrl(e.target.value);
		},
		[onChangePrUrl]
	);

	const handleRepoUrlChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChangeRepoUrl(e.target.value);
		},
		[onChangeRepoUrl]
	);

	const handleNotesChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChangeNotes(e.target.value);
		},
		[onChangeNotes]
	);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<form
				className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white"
				onSubmit={onSubmit}
			>
				{/* Modal Header */}
				<div className="flex shrink-0 items-center justify-between border-black border-b-2 p-4 sm:p-5 dark:border-white">
					<div className="min-w-0 pr-2">
						<h3 className="truncate font-black font-display text-lg uppercase sm:text-xl">
							SUBMETER SOLUÇÃO {"//"} DUPLA
						</h3>
						<p className="truncate font-mono text-[11px] text-muted-foreground uppercase">
							DESAFIO: {challengeTitle}
						</p>
					</div>
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
				<div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
					<div className="space-y-1.5">
						<span className="block font-black font-display text-xs uppercase tracking-wider">
							TIPO DE ENTREGA
						</span>
						<div className="grid grid-cols-3 gap-2">
							{SUBMISSION_TYPES.map((t) => (
								<SubmissionTypeTab
									isSelected={submissionType === t}
									key={t}
									onSelect={onChangeType}
									type={t}
								/>
							))}
						</div>
					</div>

					{submissionType === "PR" ? (
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="prUrl"
							>
								URL do Pull Request (GitHub)
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="prUrl"
								onChange={handlePrUrlChange}
								placeholder="https://github.com/orcestra/.../pull/1"
								required
								type="url"
								value={prUrl}
							/>
						</div>
					) : null}

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="repoUrl"
						>
							URL do Repositório (Opcional)
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="repoUrl"
							onChange={handleRepoUrlChange}
							placeholder="https://github.com/orcestra/meu-repo"
							type="url"
							value={repoUrl}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="notes"
						>
							{submissionType === "TEXT"
								? "Resposta / Markdown da Solução"
								: "Notas da Dupla / Anexos"}
						</label>
						<textarea
							className="w-full resize-none rounded-md border-2 border-black bg-background p-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="notes"
							onChange={handleNotesChange}
							placeholder="Explique as decisões da dupla, trade-offs ou dúvidas restantes..."
							rows={4}
							value={submissionNotes}
						/>

						{/* Attached evidences gallery */}
						{attachedEvidences.length > 0 ? (
							<div className="space-y-1.5 rounded-md border-2 border-black bg-secondary/30 p-2.5 dark:border-white">
								<span className="block font-bold font-mono text-[10px] text-muted-foreground uppercase">
									Evidências Anexadas ({attachedEvidences.length}):
								</span>
								<div className="flex flex-wrap gap-2">
									{attachedEvidences.map((ev, idx) => (
										<EvidenceGalleryItem
											evidence={ev}
											idx={idx}
											key={ev.url + String(idx)}
											onRemove={onRemoveEvidence}
										/>
									))}
								</div>
							</div>
						) : null}

						{/* Dropzone Uploader */}
						<div className="space-y-1">
							<CloudinaryUploadButton
								folder="orcestra-submissoes"
								label="Arraste print/evidência ou clique para anexar"
								onUploadSuccess={onAddEvidence}
								variant="dropzone"
							/>
						</div>
					</div>
				</div>

				{/* Modal Pinned Footer */}
				<div className="flex shrink-0 items-center justify-end gap-2.5 border-black border-t-2 bg-muted/20 p-3 sm:p-4 dark:border-white">
					<button
						className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2.5 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						CANCELAR
					</button>

					<button
						className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-5 py-2.5 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 disabled:opacity-50 sm:flex-initial dark:border-white"
						disabled={isPending}
						type="submit"
					>
						{isPending ? "ENVIANDO..." : "CONFIRMAR & SUBMETER SOLUÇÃO"}
					</button>
				</div>
			</form>
		</div>
	);
}
