"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	GitPullRequest,
	Sparkles,
	Users,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import {
	PopStamp,
	PopTrackBadge,
	PopWhatsAppButton,
} from "@/components/pop-elements";
import type { AdminPairMember, AdminSubmission } from "./types";

function renderSubmissionNotes(notes: string): React.ReactNode {
	const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	let match = imgRegex.exec(notes);

	while (match !== null) {
		const [fullMatch, altText, imgUrl] = match;
		const textBefore = notes.slice(lastIndex, match.index);
		if (textBefore.trim()) {
			parts.push(
				<p
					className="whitespace-pre-wrap leading-relaxed"
					key={`text-${lastIndex}`}
				>
					{textBefore.trim()}
				</p>
			);
		}
		parts.push(
			<div
				className="my-2 overflow-hidden rounded-md border-2 border-black bg-black/5 dark:border-white dark:bg-black/20"
				key={`img-${match.index}`}
			>
				<Image
					alt={altText || "Evidência da Solução"}
					className="max-h-72 w-full object-contain"
					height={288}
					loading="lazy"
					src={imgUrl}
					unoptimized
					width={400}
				/>
			</div>
		);
		lastIndex = match.index + fullMatch.length;
		match = imgRegex.exec(notes);
	}

	const remainingText = notes.slice(lastIndex);
	if (remainingText.trim()) {
		parts.push(
			<p
				className="whitespace-pre-wrap leading-relaxed"
				key={`text-${lastIndex}`}
			>
				{remainingText.trim()}
			</p>
		);
	}

	return parts.length > 0 ? (
		parts
	) : (
		<p className="whitespace-pre-wrap">{notes}</p>
	);
}

interface AuthorsSectionProps {
	challengeTitle: string;
	members: AdminPairMember[];
}

const AuthorsSection = memo(function AuthorsSectionRender({
	members,
	challengeTitle,
}: AuthorsSectionProps) {
	return (
		<div className="space-y-3 rounded-md border-2 border-black bg-secondary/30 p-3.5 sm:p-4 dark:border-white">
			<div className="flex items-center gap-2 border-black/10 border-b pb-2 dark:border-white/10">
				<Users className="h-4 w-4 text-[#FF4A1C]" />
				<h4 className="font-black font-display text-xs uppercase tracking-wider">
					AUTORES DA SOLUÇÃO ({members.length} MEMBROS)
				</h4>
			</div>

			<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
				{members.map((member) => (
					<div
						className="flex items-center justify-between gap-2 rounded-md border-2 border-black/20 bg-card p-2.5 dark:border-white/20"
						key={member.id}
					>
						<div className="flex min-w-0 items-center gap-2">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black bg-[#FACC15] font-black font-display text-[#121212] text-xs uppercase dark:border-white">
								{member.name.charAt(0)}
							</div>
							<div className="min-w-0">
								<p className="truncate font-black font-display text-xs uppercase">
									{member.name}
								</p>
							</div>
						</div>

						<PopWhatsAppButton
							className="shrink-0"
							compactOnMobile={false}
							message={`Olá ${member.name.split(" ")[0]}! Sou o assessor avaliando a submissão do desafio "${challengeTitle}".`}
							phone={(member as { whatsapp?: string }).whatsapp || ""}
						/>
					</div>
				))}
			</div>
		</div>
	);
});

interface ChallengeRulesAccordionProps {
	description?: string | null;
	isOpen: boolean;
	onToggle: () => void;
	pointsReward: number;
	rulesMarkdown?: string | null;
}

const ChallengeRulesAccordion = memo(function ChallengeRulesAccordionRender({
	isOpen,
	onToggle,
	pointsReward,
	description,
	rulesMarkdown,
}: ChallengeRulesAccordionProps) {
	return (
		<div className="rounded-md border-2 border-black bg-card dark:border-white">
			<button
				className="flex w-full items-center justify-between p-3.5 font-black font-display text-xs uppercase tracking-wider hover:bg-muted/40 sm:p-4"
				onClick={onToggle}
				type="button"
			>
				<span className="flex items-center gap-2">
					<span>CRITÉRIOS & REGRAS DO DESAFIO</span>
					<span className="rounded-xs border border-black/20 bg-[#FACC15] px-1.5 py-0.5 font-bold font-mono text-[#121212] text-[10px] uppercase dark:border-white/20">
						{pointsReward} PTS BASE
					</span>
				</span>
				{isOpen ? (
					<ChevronUp className="h-4 w-4" />
				) : (
					<ChevronDown className="h-4 w-4" />
				)}
			</button>

			{isOpen ? (
				<div className="space-y-3 border-black/10 border-t-2 p-3.5 sm:p-4 dark:border-white/10">
					{description ? (
						<div className="space-y-1">
							<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
								DESCRIÇÃO DO DESAFIO:
							</span>
							<p className="text-xs leading-relaxed">{description}</p>
						</div>
					) : null}

					{rulesMarkdown ? (
						<div className="space-y-1">
							<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
								INSTRUÇÕES & CRITÉRIOS DE AVALIAÇÃO:
							</span>
							<div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-md border-2 border-black/20 bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed dark:border-white/20">
								{rulesMarkdown}
							</div>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
});

export interface ReviewSubmitData {
	feedback: string;
	pairId: string;
	pointsBonus: number;
	status: "APPROVED" | "CHANGES_REQUESTED";
}

interface ReviewSubmissionModalProps {
	isPending: boolean;
	onClose: () => void;
	onSubmitReview: (data: ReviewSubmitData) => void;
	submission: AdminSubmission | null;
}

export const ReviewSubmissionModal = memo(function ReviewSubmissionModalRender({
	submission,
	onClose,
	onSubmitReview,
	isPending,
}: ReviewSubmissionModalProps) {
	const [reviewAction, setReviewAction] = useState<
		"APPROVED" | "CHANGES_REQUESTED"
	>(
		submission?.status === "CHANGES_REQUESTED"
			? "CHANGES_REQUESTED"
			: "APPROVED"
	);
	const [reviewFeedback, setReviewFeedback] = useState(
		submission?.feedback || ""
	);
	const [pointsBonus, setPointsBonus] = useState(0);
	const [showChallengeRules, setShowChallengeRules] = useState(false);

	const handleActionApproved = useCallback(() => {
		setReviewAction("APPROVED");
	}, []);

	const handleActionChanges = useCallback(() => {
		setReviewAction("CHANGES_REQUESTED");
	}, []);

	const handleToggleRules = useCallback(() => {
		setShowChallengeRules((prev) => !prev);
	}, []);

	const handlePointsBonusChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setPointsBonus(Number(e.target.value));
		},
		[]
	);

	const handleReviewFeedbackChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setReviewFeedback(e.target.value);
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!submission) {
				return;
			}

			if (reviewAction === "CHANGES_REQUESTED" && !reviewFeedback.trim()) {
				toast.error(
					"Por favor, detalhe no feedback os ajustes necessários antes de solicitar alterações."
				);
				return;
			}

			onSubmitReview({
				feedback: reviewFeedback,
				pairId: submission.id,
				pointsBonus: Number(pointsBonus) || 0,
				status: reviewAction,
			});
		},
		[submission, reviewAction, reviewFeedback, pointsBonus, onSubmitReview]
	);

	if (!submission) {
		return null;
	}

	const members = [
		submission.member1,
		submission.member2,
		submission.member3,
	].filter((m): m is NonNullable<typeof m> => Boolean(m));

	const baseReward = submission.challenge?.pointsReward ?? 0;
	const totalCredit =
		reviewAction === "APPROVED" ? baseReward + (Number(pointsBonus) || 0) : 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white">
				{/* Modal Header */}
				<div className="flex items-start justify-between gap-3 border-black border-b-2 p-4 sm:p-5 dark:border-white">
					<div className="min-w-0 space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<PopTrackBadge
								track={submission.challenge?.trackTheme ?? "FRONT"}
							/>
							<span className="rounded-xs border border-black/20 bg-muted px-2 py-0.5 font-bold font-mono text-[10px] uppercase tracking-wider dark:border-white/20">
								TIPO: {submission.submissionType || "PR"}
							</span>
							<PopStamp
								status={
									submission.status as
										| "IN_PROGRESS"
										| "SUBMITTED"
										| "APPROVED"
										| "CHANGES_REQUESTED"
								}
							/>
						</div>
						<h3 className="truncate font-black font-display text-lg uppercase sm:text-xl">
							{submission.challenge?.title}
						</h3>
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
				<div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
					{/* Authors Section */}
					<AuthorsSection
						challengeTitle={submission.challenge?.title || ""}
						members={members}
					/>

					{/* Delivered Solution & Evidences */}
					<div className="space-y-3 rounded-md border-2 border-black bg-card p-3.5 sm:p-4 dark:border-white">
						<div className="flex items-center justify-between border-black/10 border-b pb-2 dark:border-white/10">
							<h4 className="font-black font-display text-xs uppercase tracking-wider">
								CONTEÚDO ENTREGUE PELA DUPLA
							</h4>
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								STATUS ATUAL: {submission.status}
							</span>
						</div>

						{/* Action buttons (PR and Repo) */}
						<div className="flex flex-wrap items-center gap-2">
							{submission.prUrl ? (
								<a
									className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#1E40AF] px-3.5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] dark:border-white"
									href={submission.prUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									<GitPullRequest className="h-4 w-4" />
									<span>ABRIR PULL REQUEST NO GITHUB</span>
									<ExternalLink className="h-3.5 w-3.5 opacity-80" />
								</a>
							) : null}

							{submission.repoUrl ? (
								<a
									className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-3.5 py-2 font-black font-display text-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:bg-muted dark:border-white"
									href={submission.repoUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									<ExternalLink className="h-4 w-4" />
									<span>REPOSITÓRIO NO GITHUB</span>
								</a>
							) : null}
						</div>

						{/* Notes & Evidences */}
						{submission.submissionNotes ? (
							<div className="space-y-2 pt-1">
								<p className="font-bold font-mono text-[11px] text-muted-foreground uppercase">
									ANOTAÇÕES & EVIDÊNCIAS ANEXADAS:
								</p>
								<div className="rounded-md border-2 border-black/20 bg-muted/30 p-3 font-sans text-xs leading-relaxed dark:border-white/20">
									{renderSubmissionNotes(submission.submissionNotes)}
								</div>
							</div>
						) : null}
					</div>

					{/* Challenge Rules & Context Accordion */}
					<ChallengeRulesAccordion
						description={submission.challenge?.description}
						isOpen={showChallengeRules}
						onToggle={handleToggleRules}
						pointsReward={baseReward}
						rulesMarkdown={submission.challenge?.rulesMarkdown}
					/>

					{/* Previous Feedback */}
					{submission.feedback ? (
						<div className="rounded-md border-2 border-black bg-[#FACC15]/20 p-3.5 sm:p-4 dark:border-white">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4 text-amber-800 dark:text-amber-300" />
								<h5 className="font-black font-display text-amber-900 text-xs uppercase tracking-wider dark:text-amber-200">
									FEEDBACK ANTERIOR REGISTRADO
								</h5>
							</div>
							<p className="mt-1.5 whitespace-pre-wrap font-mono text-xs">
								{submission.feedback}
							</p>
						</div>
					) : null}

					{/* Evaluation Form */}
					<form
						className="space-y-4 rounded-md border-2 border-black bg-secondary/20 p-3.5 sm:p-4 dark:border-white"
						id="review-form"
						onSubmit={handleSubmit}
					>
						<div className="flex items-center gap-2 border-black/10 border-b pb-2 dark:border-white/10">
							<Sparkles className="h-4 w-4 text-[#FF4A1C]" />
							<h4 className="font-black font-display text-xs uppercase tracking-wider">
								PARECER DA ASSESSORIA TÉCNICA
							</h4>
						</div>

						{/* Veredito */}
						<div className="space-y-1.5">
							<span className="block font-black font-display text-xs uppercase tracking-wider">
								VEREDITO
							</span>
							<div className="grid grid-cols-2 gap-2">
								<button
									className={`btn-tactile flex items-center justify-center gap-2 rounded-md border-2 p-2.5 font-black font-display text-xs uppercase transition ${
										reviewAction === "APPROVED"
											? "border-black bg-[#15803D] text-white shadow-hard-sm dark:border-white"
											: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
									}`}
									onClick={handleActionApproved}
									type="button"
								>
									<CheckCircle2 className="h-4 w-4" />
									<span>APROVAR SOLUÇÃO</span>
								</button>

								<button
									className={`btn-tactile flex items-center justify-center gap-2 rounded-md border-2 p-2.5 font-black font-display text-xs uppercase transition ${
										reviewAction === "CHANGES_REQUESTED"
											? "border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white"
											: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
									}`}
									onClick={handleActionChanges}
									type="button"
								>
									<AlertCircle className="h-4 w-4" />
									<span>SOLICITAR AJUSTES</span>
								</button>
							</div>
						</div>

						{/* Pontuação */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="space-y-1">
								<label
									className="font-bold font-display text-xs uppercase tracking-wider"
									htmlFor="bonus"
								>
									Pontos Bônus (+ / -)
								</label>
								<input
									className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
									id="bonus"
									onChange={handlePointsBonusChange}
									placeholder="0"
									type="number"
									value={pointsBonus}
								/>
							</div>

							<div className="flex flex-col justify-end space-y-1">
								<span className="font-bold font-display text-muted-foreground text-xs uppercase tracking-wider">
									Cálculo da Recompensa
								</span>
								<div className="flex h-10 items-center justify-between rounded-md border-2 border-black/20 bg-background px-3 font-mono text-xs dark:border-white/20">
									<span>
										{reviewAction === "APPROVED"
											? "A creditar por membro:"
											: "Em espera:"}
									</span>
									<span className="font-black text-[#FF4A1C]">
										{totalCredit} PTS
									</span>
								</div>
							</div>
						</div>

						{/* Feedback */}
						<div className="space-y-1">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="feedback"
							>
								Feedback Técnico & Apontamentos de Código
								{reviewAction === "CHANGES_REQUESTED" ? (
									<span className="text-[#DC2626]"> *</span>
								) : null}
							</label>
							<textarea
								className="w-full resize-none rounded-md border-2 border-black bg-background p-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="feedback"
								onChange={handleReviewFeedbackChange}
								placeholder={
									reviewAction === "CHANGES_REQUESTED"
										? "Descreva claramente quais requisitos não foram atendidos e o que a dupla deve corrigir..."
										: "Descreva pontos positivos, melhorias opcionais ou boas práticas observadas..."
								}
								rows={4}
								value={reviewFeedback}
							/>
						</div>
					</form>
				</div>

				{/* Modal Footer / Actions */}
				<div className="flex items-center justify-end gap-2.5 border-black border-t-2 bg-muted/20 p-4 sm:p-5 dark:border-white">
					<button
						className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						CANCELAR
					</button>

					<button
						className="btn-tactile rounded-md border-2 border-black bg-[#121212] px-5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-[#121212]"
						disabled={isPending}
						form="review-form"
						type="submit"
					>
						{isPending ? "REGISTRANDO..." : "CONCLUIR AVALIAÇÃO"}
					</button>
				</div>
			</div>
		</div>
	);
});
