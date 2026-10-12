"use client";

import {
	AlertCircle,
	CheckCircle2,
	Clock,
	ExternalLink,
	GitPullRequest,
	MessageSquare,
	RefreshCw,
	Sparkles,
	Trash2,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCallback } from "react";
import { PopWhatsAppButton } from "@/components/pop-elements";
import type { ChallengePairItem, ChallengePairMember } from "./types";

export interface AdminPairsCardProps {
	challengeTitle?: string;
	deletingPairId?: string | null;
	isDrawing: boolean;
	onDeletePair: (pairId: string) => void;
	onDrawPairs: () => void;
	onOpenAllocateModal: () => void;
	onOpenClearModal: () => void;
	onReviewPair: (pair: ChallengePairItem) => void;
	pairs: ChallengePairItem[];
}

function renderEvidenceImages(notes: string) {
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
					alt={altText || "Evidência"}
					className="max-h-56 w-full object-contain"
					height={224}
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

function getPairStatusConfig(status: string) {
	switch (status) {
		case "APPROVED":
			return {
				bg: "bg-[#15803D]/10 dark:bg-emerald-950/20",
				border: "border-[#15803D] dark:border-emerald-500",
				icon: CheckCircle2,
				label: "APROVADO",
				textColor: "text-[#15803D] dark:text-emerald-400",
			};
		case "SUBMITTED":
			return {
				bg: "bg-[#FFD700]/10 dark:bg-amber-950/20",
				border: "border-[#FFD700] dark:border-amber-400",
				icon: Clock,
				label: "EM REVISÃO",
				textColor: "text-[#B45309] dark:text-amber-400",
			};
		case "CHANGES_REQUESTED":
			return {
				bg: "bg-[#DC2626]/10 dark:bg-red-950/20",
				border: "border-[#DC2626] dark:border-red-500",
				icon: AlertCircle,
				label: "AJUSTES SOLICITADOS",
				textColor: "text-[#DC2626] dark:text-red-400",
			};
		default:
			return {
				bg: "bg-secondary/40",
				border: "border-black/30 dark:border-white/30",
				icon: Sparkles,
				label: "EM ANDAMENTO",
				textColor: "text-muted-foreground",
			};
	}
}

function MemberItem({ member }: { member: ChallengePairMember }) {
	return (
		<div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-border bg-background/80 p-2.5">
			<div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary/20 font-black font-display text-[11px] uppercase">
					{member.name.charAt(0)}
				</div>
				<div className="min-w-0 flex-1 overflow-hidden">
					{member.department ? (
						<div className="flex items-center gap-1.5">
							<span className="truncate rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground">
								{member.department}
							</span>
						</div>
					) : null}
					<Link
						className="block truncate font-black font-display text-xs uppercase hover:text-primary hover:underline"
						href={`/profile?id=${member.id}`}
						title={member.name}
					>
						{member.name}
					</Link>
				</div>
			</div>

			{member.whatsapp ? (
				<PopWhatsAppButton
					className="shrink-0"
					message={`Olá ${member.name}, acompanhando o desafio no Orcestra...`}
					phone={member.whatsapp}
				/>
			) : null}
		</div>
	);
}

function PairDeliverablesSection({ pair }: { pair: ChallengePairItem }) {
	if (!(pair.prUrl || pair.repoUrl || pair.submissionNotes)) {
		return (
			<div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
				<Clock className="h-3.5 w-3.5" />
				<span>Nenhum entregável submetido ainda.</span>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{pair.prUrl ? (
				<div className="flex items-center gap-2">
					<GitPullRequest className="h-3.5 w-3.5 text-[#FF4A1C]" />
					<a
						className="inline-flex items-center gap-1 font-mono text-primary text-xs underline hover:text-primary/80"
						href={pair.prUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span>Ver Pull Request</span>
						<ExternalLink className="h-3 w-3" />
					</a>
				</div>
			) : null}

			{pair.repoUrl ? (
				<div className="flex items-center gap-2">
					<span className="font-mono text-muted-foreground text-xs">REPO:</span>
					<a
						className="inline-flex items-center gap-1 font-mono text-primary text-xs underline hover:text-primary/80"
						href={pair.repoUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span className="max-w-[200px] truncate">{pair.repoUrl}</span>
						<ExternalLink className="h-3 w-3" />
					</a>
				</div>
			) : null}

			{pair.submissionNotes ? (
				<div className="rounded border border-black/10 bg-background/50 p-2.5 font-mono text-xs leading-relaxed dark:border-white/10">
					<div className="mb-1 font-bold text-[10px] text-muted-foreground uppercase">
						NOTAS DA SUBMISSÃO:
					</div>
					<div className="max-h-48 overflow-y-auto">
						{renderEvidenceImages(pair.submissionNotes)}
					</div>
				</div>
			) : null}
		</div>
	);
}

function PairFeedbackSection({ feedback }: { feedback?: string | null }) {
	if (!feedback) {
		return null;
	}

	return (
		<div className="rounded-md border-2 border-[#1E40AF]/30 bg-[#1E40AF]/5 p-3 font-mono text-foreground text-xs dark:border-blue-500/30 dark:bg-blue-950/20">
			<div className="mb-1 flex items-center gap-1.5 font-bold font-mono text-[#1E40AF] text-[10px] uppercase dark:text-blue-400">
				<MessageSquare className="h-3 w-3" />
				<span>FEEDBACK DO AVALIADOR:</span>
			</div>
			<p className="whitespace-pre-wrap">{feedback}</p>
		</div>
	);
}

function PairMembersList({ pair }: { pair: ChallengePairItem }) {
	const members: ChallengePairMember[] = [];
	if (pair.member1) {
		members.push(pair.member1);
	}
	if (pair.member2) {
		members.push(pair.member2);
	}
	if (pair.member3) {
		members.push(pair.member3);
	}

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{members.map((member) => (
				<MemberItem key={member.id} member={member} />
			))}
		</div>
	);
}

function PairCard({
	pair,
	index,
	onReviewPair,
	onDeletePair,
	isDeleting,
}: {
	pair: ChallengePairItem;
	index: number;
	onReviewPair: (pair: ChallengePairItem) => void;
	onDeletePair: (pairId: string) => void;
	isDeleting: boolean;
}) {
	const config = getPairStatusConfig(pair.status);
	const StatusIcon = config.icon;
	const isSubmitted = pair.status === "SUBMITTED";

	const handleReview = useCallback(() => {
		onReviewPair(pair);
	}, [onReviewPair, pair]);

	const handleDelete = useCallback(() => {
		onDeletePair(pair.id);
	}, [onDeletePair, pair.id]);

	return (
		<div
			className={`relative flex flex-col justify-between rounded-md border-2 bg-card p-4 shadow-hard-sm transition-all ${config.border}`}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-2 border-black/10 border-b pb-2 dark:border-white/10">
					<div className="flex items-center gap-2">
						<span className="flex h-5 w-5 items-center justify-center rounded bg-black font-black font-mono text-[10px] text-white dark:bg-white dark:text-black">
							#{index + 1}
						</span>
						<h4 className="font-black font-display text-sm uppercase">
							{pair.member3 ? "Trio" : "Dupla"}
						</h4>
					</div>

					<div className="flex items-center gap-1.5 sm:gap-2">
						<div
							className={`flex items-center gap-1 rounded px-2 py-0.5 font-bold font-mono text-[10px] uppercase ${config.bg} ${config.textColor}`}
						>
							<StatusIcon className="h-3 w-3" />
							<span>{config.label}</span>
						</div>
						<span className="rounded border border-black/30 bg-muted px-2 py-0.5 font-bold font-mono text-[10px] uppercase dark:border-white/30">
							ETAPA {pair.currentStep}/3
						</span>
						<button
							className="btn-tactile flex h-6 w-6 items-center justify-center rounded border border-black/30 bg-secondary text-muted-foreground hover:bg-[#DC2626] hover:text-white disabled:opacity-50 dark:border-white/30"
							disabled={isDeleting}
							onClick={handleDelete}
							title="Remover esta dupla"
							type="button"
						>
							<Trash2 className="h-3 w-3" />
						</button>
					</div>
				</div>

				<div className="space-y-1.5">
					<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
						INTEGRANTES
					</span>
					<PairMembersList pair={pair} />
				</div>

				<div className="space-y-1.5">
					<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
						ENTREGÁVEIS & EVIDÊNCIAS
					</span>
					<PairDeliverablesSection pair={pair} />
				</div>

				<PairFeedbackSection feedback={pair.feedback} />
			</div>

			<div className="mt-4 border-black/10 border-t pt-3 dark:border-white/10">
				<div className="flex items-center justify-between gap-2">
					<div className="font-mono text-[10px] text-muted-foreground">
						{pair.status === "SUBMITTED" || pair.status === "APPROVED" ? (
							<span>
								Atualizado em{" "}
								{pair.updatedAt
									? new Date(pair.updatedAt).toLocaleDateString("pt-BR", {
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											month: "short",
										})
									: "—"}
							</span>
						) : (
							<span>Ainda não submetido</span>
						)}
					</div>

					<button
						className={`btn-tactile flex items-center justify-center gap-1.5 rounded-md border-2 border-black px-4 py-2 font-black font-display text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white ${
							isSubmitted
								? "animate-pulse bg-[#15803D] text-white"
								: "bg-primary text-primary-foreground"
						}`}
						onClick={handleReview}
						type="button"
					>
						<UserCheck className="h-3.5 w-3.5" />
						<span>{isSubmitted ? "AVALIAR AGORA" : "REVISAR DUPLA"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

function PairsMetricsSummary({ pairs }: { pairs: ChallengePairItem[] }) {
	const totalPairs = pairs.length;
	const approved = pairs.filter((p) => p.status === "APPROVED").length;
	const submitted = pairs.filter((p) => p.status === "SUBMITTED").length;
	const inProgress = pairs.filter((p) => p.status === "IN_PROGRESS").length;

	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
			<div className="rounded border-2 border-black/20 bg-secondary/30 p-2.5 text-center dark:border-white/20">
				<span className="block font-bold font-mono text-[10px] text-muted-foreground uppercase">
					TOTAL DE DUPLAS
				</span>
				<span className="font-black font-display text-lg sm:text-xl">
					{totalPairs}
				</span>
			</div>
			<div className="rounded border-2 border-[#15803D]/30 bg-[#15803D]/10 p-2.5 text-center dark:border-emerald-500/30">
				<span className="block font-bold font-mono text-[#15803D] text-[10px] uppercase dark:text-emerald-400">
					APROVADAS
				</span>
				<span className="font-black font-display text-[#15803D] text-lg sm:text-xl dark:text-emerald-400">
					{approved}
				</span>
			</div>
			<div className="rounded border-2 border-[#FFD700]/40 bg-[#FFD700]/10 p-2.5 text-center dark:border-amber-400/30">
				<span className="block font-bold font-mono text-[#B45309] text-[10px] uppercase dark:text-amber-400">
					EM REVISÃO
				</span>
				<span className="font-black font-display text-[#B45309] text-lg sm:text-xl dark:text-amber-400">
					{submitted}
				</span>
			</div>
			<div className="rounded border-2 border-black/20 bg-secondary/30 p-2.5 text-center dark:border-white/20">
				<span className="block font-bold font-mono text-[10px] text-muted-foreground uppercase">
					EM ANDAMENTO
				</span>
				<span className="font-black font-display text-lg sm:text-xl">
					{inProgress}
				</span>
			</div>
		</div>
	);
}

export function AdminPairsCard({
	pairs,
	onReviewPair,
	onDrawPairs,
	onOpenAllocateModal,
	onOpenClearModal,
	onDeletePair,
	deletingPairId,
	isDrawing,
	challengeTitle: _challengeTitle,
}: AdminPairsCardProps) {
	return (
		<section className="rounded-md border-3 border-black bg-card p-4 shadow-hard-md sm:p-6 dark:border-white">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-black/20 border-b pb-3 dark:border-white/20">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] text-white dark:border-white">
						<Users className="h-4 w-4" />
					</div>
					<div>
						<h3 className="font-black font-display text-base uppercase sm:text-lg">
							PAINEL DE DUPLAS & ACOMPANHAMENTO
						</h3>
						<p className="font-mono text-muted-foreground text-xs">
							Visão administrativa completa de todas as duplas e submissões
							deste desafio
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button
						className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-bold font-mono text-foreground text-xs uppercase shadow-hard-xs hover:bg-muted dark:border-white"
						onClick={onOpenAllocateModal}
						type="button"
					>
						<UserPlus className="h-3.5 w-3.5 text-primary" />
						<span>ALOCAR MANUAL</span>
					</button>

					<button
						className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#FFD700] px-3.5 py-1.5 font-bold font-mono text-black text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
						disabled={isDrawing}
						onClick={onDrawPairs}
						type="button"
					>
						<RefreshCw
							className={`h-3.5 w-3.5 ${isDrawing ? "animate-spin" : ""}`}
						/>
						<span>{isDrawing ? "SORTEANDO..." : "SORTEAR DUPLAS"}</span>
					</button>

					{pairs.length > 0 ? (
						<button
							className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-3 py-1.5 font-bold font-mono text-white text-xs uppercase shadow-hard-xs hover:bg-[#B91C1C] dark:border-white"
							onClick={onOpenClearModal}
							type="button"
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span>DESORTEAR</span>
						</button>
					) : null}
				</div>
			</div>

			{pairs.length > 0 ? (
				<div className="space-y-4">
					<PairsMetricsSummary pairs={pairs} />

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						{pairs.map((pair, idx) => (
							<PairCard
								index={idx}
								isDeleting={deletingPairId === pair.id}
								key={pair.id}
								onDeletePair={onDeletePair}
								onReviewPair={onReviewPair}
								pair={pair}
							/>
						))}
					</div>
				</div>
			) : (
				<div className="rounded-md border-2 border-black/30 border-dashed p-8 text-center dark:border-white/30">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
						<Users className="h-6 w-6" />
					</div>
					<div className="mt-3">
						<h3 className="font-black font-display text-sm uppercase">
							NENHUMA DUPLA FORMADA AINDA
						</h3>
						<p className="mt-1 font-mono text-muted-foreground text-xs">
							Os membros inscritos na trilha deste desafio ainda não foram
							alocados em duplas.
						</p>
					</div>
					<div className="mt-5 flex flex-wrap items-center justify-center gap-3">
						<button
							className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
							disabled={isDrawing}
							onClick={onDrawPairs}
							type="button"
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isDrawing ? "animate-spin" : ""}`}
							/>
							<span>
								{isDrawing ? "SORTEANDO DUPLAS..." : "SORTEAR DUPLAS AGORA"}
							</span>
						</button>
						<button
							className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-foreground text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
							onClick={onOpenAllocateModal}
							type="button"
						>
							<UserPlus className="h-3.5 w-3.5 text-primary" />
							<span>ALOCAR DUPLA MANUALMENTE</span>
						</button>
					</div>
				</div>
			)}
		</section>
	);
}
