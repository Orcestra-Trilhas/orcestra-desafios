"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	GitPullRequest,
	Sparkles,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
	BauhausSkeleton,
	PopStamp,
	PopTrackBadge,
	PopWhatsAppButton,
} from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function renderSubmissionNotes(notes: string) {
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
				<img
					alt={altText || "Evidência da Solução"}
					className="max-h-72 w-full object-contain"
					height={288}
					loading="lazy"
					src={imgUrl}
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

export default function AdminPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const userMe = useQuery(trpc.user.me.queryOptions());

	const role = userMe.data?.role ?? (session?.user as { role?: string })?.role;
	const isAdmin = role === "ADMIN";

	const metricsQuery = useQuery(trpc.admin.getMetrics.queryOptions());
	const challengesQuery = useQuery(trpc.admin.listChallenges.queryOptions());
	const submissionsQuery = useQuery(trpc.admin.listSubmissions.queryOptions());
	const logsQuery = useQuery(trpc.admin.listLogs.queryOptions());
	const assessorsQuery = useQuery(trpc.user.listAssessors.queryOptions());

	// Mutations
	const drawPairsMutation = useMutation(
		trpc.admin.drawPairs.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao sortear duplas");
			},
			onSuccess: (data) => {
				toast.success(
					`Sorteio realizado! ${data.pairsCreated} duplas/trios formados para ${data.membersCount} membros.`
				);
				queryClient.invalidateQueries();
			},
		})
	);

	const toggleChallengeMutation = useMutation(
		trpc.admin.toggleChallenge.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao atualizar desafio");
			},
			onSuccess: () => {
				toast.success("Status do desafio atualizado!");
				queryClient.invalidateQueries();
			},
		})
	);

	const reviewSubmissionMutation = useMutation(
		trpc.admin.reviewSubmission.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao avaliar submissão");
			},
			onSuccess: () => {
				toast.success("Avaliação registrada com sucesso!");
				setSelectedSubmission(null);
				queryClient.invalidateQueries();
			},
		})
	);

	const createChallengeMutation = useMutation(
		trpc.admin.createChallenge.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao criar desafio");
			},
			onSuccess: () => {
				toast.success("Novo desafio criado com sucesso!");
				setIsCreateModalOpen(false);
				queryClient.invalidateQueries();
			},
		})
	);

	const deleteChallengeMutation = useMutation(
		trpc.admin.deleteChallenge.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao excluir desafio");
			},
			onSuccess: () => {
				toast.success("Desafio excluído com sucesso!");
				setChallengeToDelete(null);
				queryClient.invalidateQueries();
			},
		})
	);

	// UI state
	const [activeTab, setActiveTab] = useState<
		"SUBMISSIONS" | "CHALLENGES" | "LOGS"
	>("SUBMISSIONS");
	type SubmissionItem = NonNullable<typeof submissionsQuery.data>[number];
	type ChallengeItem = NonNullable<typeof challengesQuery.data>[number];
	const [selectedSubmission, setSelectedSubmission] =
		useState<SubmissionItem | null>(null);
	const [challengeToDelete, setChallengeToDelete] =
		useState<ChallengeItem | null>(null);
	const [showChallengeRules, setShowChallengeRules] = useState(false);
	const [reviewAction, setReviewAction] = useState<
		"APPROVED" | "CHANGES_REQUESTED"
	>("APPROVED");
	const [reviewFeedback, setReviewFeedback] = useState("");
	const [pointsBonus, setPointsBonus] = useState(0);

	// New challenge form state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [trackTheme, setTrackTheme] = useState("FRONT");
	const [rulesMarkdown, setRulesMarkdown] = useState("");
	const [mkdocsUrl, setMkdocsUrl] = useState("");
	const [assessorId, setAssessorId] = useState("");
	const [pointsReward, setPointsReward] = useState(100);
	const [deadline, setDeadline] = useState("");

	if (!isAdmin) {
		return (
			<div className="mx-auto max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-8 text-center shadow-hard dark:border-white">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[#DC2626] font-black text-white text-xl">
					!
				</div>
				<h2 className="font-black font-display text-xl uppercase">
					ACESSO RESTRITO // ADMIN
				</h2>
				<p className="font-medium text-muted-foreground text-xs">
					Esta área é reservada exclusivamente para assessores e diretores da
					Orcestra.
				</p>
				<Link
					className="btn-tactile inline-block rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-xs uppercase dark:border-white"
					href="/dashboard"
				>
					&larr; VOLTAR PARA MEUS DESAFIOS
				</Link>
			</div>
		);
	}

	const metrics = metricsQuery.data ?? {
		activeChallenges: 0,
		approvalRate: 100,
		approvedPairs: 0,
		changesRequested: 0,
		stuckPairs: 0,
		submittedPairs: 0,
		totalChallenges: 0,
		totalPairs: 0,
	};

	const handleCreateChallenge = (e: React.FormEvent) => {
		e.preventDefault();
		if (!assessorId) {
			toast.error("Selecione um assessor responsável");
			return;
		}
		createChallengeMutation.mutate({
			assessorId,
			deadline: new Date(deadline).toISOString(),
			description,
			mkdocsUrl: mkdocsUrl || null,
			pointsReward: Number(pointsReward),
			rulesMarkdown,
			title,
			trackTheme,
		});
	};

	const handleReviewSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedSubmission) {
			return;
		}

		if (reviewAction === "CHANGES_REQUESTED" && !reviewFeedback.trim()) {
			toast.error(
				"Por favor, detalhe no feedback os ajustes necessários antes de solicitar alterações."
			);
			return;
		}

		reviewSubmissionMutation.mutate({
			feedback: reviewFeedback,
			pairId: selectedSubmission.id,
			pointsBonus: Number(pointsBonus) || 0,
			status: reviewAction,
		});
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 py-6 pb-28">
			{/* Poster Header */}
			<div className="flex flex-col justify-between gap-4 border-black border-b-2 pb-4 sm:flex-row sm:items-center dark:border-white">
				<div className="space-y-1">
					<h1 className="font-black font-display text-2xl uppercase tracking-tight sm:text-3xl">
						PAINEL DO ADMINISTRADOR
					</h1>
					<p className="font-medium text-muted-foreground text-xs">
						Controle de entregas, fila de aprovação e motor de sorteio aleatório
					</p>
				</div>

				<button
					className="btn-tactile flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] sm:w-auto sm:py-2 dark:border-white"
					onClick={() => {
						if (
							assessorsQuery.data &&
							assessorsQuery.data.length > 0 &&
							!assessorId
						) {
							setAssessorId(assessorsQuery.data[0].id);
						}
						setIsCreateModalOpen(true);
					}}
					type="button"
				>
					<span>+ NOVO DESAFIO</span>
				</button>
			</div>

			{/* Metric Blocks (Bauhaus Grid) */}
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
				<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
					<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						DESAFIOS ATIVOS
					</span>
					<span className="font-black font-display text-[#1E40AF] text-xl sm:text-2xl dark:text-blue-400">
						{metrics.activeChallenges} / {metrics.totalChallenges}
					</span>
					<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						{metrics.totalPairs} DUPLAS ALOCADAS
					</span>
				</div>

				<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
					<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						SUBMISSÕES
					</span>
					<span className="font-black font-display text-amber-600 text-xl sm:text-2xl dark:text-amber-400">
						{metrics.submittedPairs}
					</span>
					<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						NA FILA DE AVALIAÇÃO
					</span>
				</div>

				<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
					<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						APROVAÇÕES
					</span>
					<span className="font-black font-display text-emerald-700 text-xl sm:text-2xl dark:text-emerald-400">
						{metrics.approvalRate}%
					</span>
					<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						{metrics.approvedPairs} APROVADAS
					</span>
				</div>

				<div className="rounded-md border-2 border-black bg-card p-3 shadow-hard-sm sm:p-4 dark:border-white">
					<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						TRAVADAS / RISCO
					</span>
					<span className="font-black font-display text-red-600 text-xl sm:text-2xl dark:text-red-400">
						{metrics.stuckPairs}
					</span>
					<span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground uppercase sm:text-[10px]">
						PERTO DO PRAZO
					</span>
				</div>
			</div>

			{/* Tab Switcher */}
			<div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto border-black border-b-2 pb-2 sm:gap-2 dark:border-white">
				<button
					className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
						activeTab === "SUBMISSIONS"
							? "border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
					}`}
					onClick={() => setActiveTab("SUBMISSIONS")}
					type="button"
				>
					FILA DE SUBMISSÕES ({submissionsQuery.data?.length ?? 0})
				</button>

				<button
					className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
						activeTab === "CHALLENGES"
							? "border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white dark:bg-[#2563EB]"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
					}`}
					onClick={() => setActiveTab("CHALLENGES")}
					type="button"
				>
					DESAFIOS & SORTEIO
				</button>

				<button
					className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
						activeTab === "LOGS"
							? "border-black bg-foreground text-background shadow-hard-sm dark:border-white"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
					}`}
					onClick={() => setActiveTab("LOGS")}
					type="button"
				>
					LOGS DE AUDITORIA
				</button>
			</div>

			{/* Tab 1: Submissions Queue */}
			{activeTab === "SUBMISSIONS" && (
				<div className="space-y-3">
					{submissionsQuery.isLoading ? (
						<BauhausSkeleton />
					) : submissionsQuery.data && submissionsQuery.data.length > 0 ? (
						<div className="space-y-3">
							{submissionsQuery.data.map((sub) => {
								const members = [sub.member1, sub.member2, sub.member3].filter(
									Boolean
								);
								return (
									<div
										className="flex flex-col justify-between gap-3 rounded-md border-2 border-black bg-card p-3.5 shadow-hard-sm sm:flex-row sm:items-center sm:p-4 dark:border-white"
										key={sub.id}
									>
										<div className="min-w-0 flex-1 space-y-1.5">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-black font-display text-sm uppercase sm:text-base">
													{sub.challenge?.title}
												</span>
												<PopStamp
													status={
														sub.status as
															| "IN_PROGRESS"
															| "SUBMITTED"
															| "APPROVED"
															| "CHANGES_REQUESTED"
													}
												/>
											</div>

											<div className="flex flex-wrap items-center gap-1.5 font-mono text-muted-foreground text-xs uppercase sm:gap-2">
												<span>
													DUPLA: {members.map((m) => m?.name).join(" & ")}
												</span>
												<span>//</span>
												<span>TIPO: {sub.submissionType ?? "PR"}</span>
											</div>

											<div className="flex flex-wrap items-center gap-2 pt-0.5">
												{sub.prUrl ? (
													<a
														className="inline-flex items-center gap-1 font-bold font-mono text-[#1E40AF] text-xs hover:underline dark:text-blue-400"
														href={sub.prUrl}
														rel="noopener noreferrer"
														target="_blank"
													>
														<GitPullRequest className="h-3 w-3" />
														<span>GITHUB PR</span>
													</a>
												) : null}
												{sub.repoUrl ? (
													<a
														className="inline-flex items-center gap-1 font-bold font-mono text-muted-foreground text-xs hover:underline"
														href={sub.repoUrl}
														rel="noopener noreferrer"
														target="_blank"
													>
														<ExternalLink className="h-3 w-3" />
														<span>REPOSITÓRIO</span>
													</a>
												) : null}
											</div>
										</div>

										<button
											className="btn-tactile w-full self-stretch rounded-md border-2 border-black bg-[#FACC15] px-4 py-2 text-center font-black font-display text-[#121212] text-xs uppercase shadow-hard-sm hover:bg-[#EAB308] sm:w-auto sm:self-auto dark:border-white"
											onClick={() => {
												setSelectedSubmission(sub);
												setReviewFeedback(sub.feedback || "");
												setReviewAction(
													sub.status === "CHANGES_REQUESTED"
														? "CHANGES_REQUESTED"
														: "APPROVED"
												);
												setPointsBonus(0);
												setShowChallengeRules(false);
											}}
											type="button"
										>
											AVALIAR SOLUÇÃO &rarr;
										</button>
									</div>
								);
							})}
						</div>
					) : (
						<div className="rounded-md border-2 border-black border-dashed bg-card p-8 text-center dark:border-white">
							<p className="font-black font-display text-muted-foreground text-xs uppercase">
								Nenhuma submissão pendente na fila no momento.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Tab 2: Challenges & Draw Pairs */}
			{activeTab === "CHALLENGES" && (
				<div className="space-y-4">
					{challengesQuery.data?.map((ch) => {
						const pairsCount = ch.pairs?.length ?? 0;
						return (
							<div
								className="space-y-3 rounded-md border-2 border-black bg-card p-3.5 shadow-hard-sm sm:p-5 dark:border-white"
								key={ch.id}
							>
								<div className="flex flex-col justify-between gap-3 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<PopTrackBadge track={ch.trackTheme} />
											<h3 className="truncate font-black font-display text-base uppercase sm:text-lg">
												{ch.title}
											</h3>
										</div>
										<p className="mt-1 font-mono text-muted-foreground text-xs uppercase">
											ASSESSOR: {ch.assessor?.name} // PRAZO:{" "}
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
											onClick={() =>
												toggleChallengeMutation.mutate({
													active: !ch.active,
													id: ch.id,
												})
											}
											type="button"
										>
											{ch.active ? "ATIVO" : "INATIVO"}
										</button>

										<button
											className="btn-tactile flex-1 rounded-md border-2 border-black bg-[#FF4A1C] px-3.5 py-1 text-center font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 sm:flex-initial dark:border-white"
											disabled={drawPairsMutation.isPending}
											onClick={() =>
												drawPairsMutation.mutate({ challengeId: ch.id })
											}
											type="button"
										>
											{drawPairsMutation.isPending
												? "SORTEANDO..."
												: "SORTEAR DUPLAS"}
										</button>

										<button
											aria-label={`Excluir desafio ${ch.title}`}
											className="btn-tactile flex items-center justify-center gap-1 rounded-md border-2 border-black bg-[#DC2626] px-2.5 py-1 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] sm:flex-initial dark:border-white"
											onClick={() => setChallengeToDelete(ch)}
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
					})}
				</div>
			)}

			{/* Tab 3: Audit Logs */}
			{activeTab === "LOGS" && (
				<div className="space-y-2">
					{logsQuery.data?.map((log) => (
						<div
							className="rounded-md border-2 border-black bg-secondary/30 p-3.5 font-mono text-xs dark:border-white"
							key={log.id}
						>
							<div className="flex items-center justify-between">
								<span className="font-black text-[#FF4A1C]">
									[{log.action}]
								</span>
								<span className="text-[10px] text-muted-foreground">
									{new Date(log.createdAt).toLocaleString("pt-BR")}
								</span>
							</div>
							<p className="mt-1 text-foreground">
								EXECUTOR: <span className="font-bold">{log.actor?.name}</span>
							</p>
							{log.details ? (
								<pre className="mt-2 overflow-x-auto rounded border border-black/20 bg-background p-2 font-mono text-[10px] text-muted-foreground dark:border-white/20">
									{JSON.stringify(log.details, null, 2)}
								</pre>
							) : null}
						</div>
					))}
				</div>
			)}

			{/* Review Submission Modal */}
			{selectedSubmission ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
					<div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white">
						{/* Modal Header */}
						<div className="flex items-start justify-between gap-3 border-black border-b-2 p-4 sm:p-5 dark:border-white">
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<PopTrackBadge
										track={selectedSubmission.challenge?.trackTheme ?? "FRONT"}
									/>
									<span className="rounded-xs border border-black/20 bg-muted px-2 py-0.5 font-bold font-mono text-[10px] uppercase tracking-wider dark:border-white/20">
										TIPO: {selectedSubmission.submissionType || "PR"}
									</span>
									<PopStamp
										status={
											selectedSubmission.status as
												| "IN_PROGRESS"
												| "SUBMITTED"
												| "APPROVED"
												| "CHANGES_REQUESTED"
										}
									/>
								</div>
								<h3 className="truncate font-black font-display text-lg uppercase sm:text-xl">
									{selectedSubmission.challenge?.title}
								</h3>
								<p className="font-mono text-[11px] text-muted-foreground uppercase">
									ÚLTIMA ATUALIZAÇÃO:{" "}
									{new Date(selectedSubmission.updatedAt).toLocaleDateString(
										"pt-BR",
										{
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											month: "short",
										}
									)}
								</p>
							</div>

							<button
								aria-label="Fechar modal"
								className="btn-tactile flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setSelectedSubmission(null)}
								type="button"
							>
								X
							</button>
						</div>

						{/* Modal Scrollable Body */}
						<div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
							{/* Authors Section */}
							<div className="space-y-3 rounded-md border-2 border-black bg-secondary/30 p-3.5 sm:p-4 dark:border-white">
								<div className="flex items-center gap-2 border-black/10 border-b pb-2 dark:border-white/10">
									<Users className="h-4 w-4 text-[#FF4A1C]" />
									<h4 className="font-black font-display text-xs uppercase tracking-wider">
										AUTORES DA SOLUÇÃO (
										{
											[
												selectedSubmission.member1,
												selectedSubmission.member2,
												selectedSubmission.member3,
											].filter(Boolean).length
										}{" "}
										MEMBROS)
									</h4>
								</div>

								<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
									{[
										selectedSubmission.member1,
										selectedSubmission.member2,
										selectedSubmission.member3,
									]
										.filter((m): m is NonNullable<typeof m> => Boolean(m))
										.map((member) => (
											<div
												className="flex items-center justify-between gap-2 rounded-md border-2 border-black/20 bg-card p-2.5 dark:border-white/20"
												key={member.id}
											>
												<div className="flex min-w-0 items-center gap-2">
													{member.gifUrl ? (
														<img
															alt={member.name}
															className="h-8 w-8 shrink-0 rounded-full border border-black object-cover dark:border-white"
															height={32}
															src={member.gifUrl}
															width={32}
														/>
													) : (
														<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black bg-[#FACC15] font-black font-display text-[#121212] text-xs uppercase dark:border-white">
															{member.name.charAt(0)}
														</div>
													)}
													<div className="min-w-0">
														<p className="truncate font-black font-display text-xs uppercase">
															{member.name}
														</p>
														<p className="truncate font-mono text-[10px] text-muted-foreground uppercase">
															{member.department || "Membro"}
														</p>
													</div>
												</div>

												<PopWhatsAppButton
													className="shrink-0"
													compactOnMobile={false}
													message={`Olá ${member.name.split(" ")[0]}! Sou o assessor avaliando a submissão do desafio "${selectedSubmission.challenge?.title}".`}
													phone={member.whatsapp}
												/>
											</div>
										))}
								</div>
							</div>

							{/* Delivered Solution & Evidences */}
							<div className="space-y-3 rounded-md border-2 border-black bg-card p-3.5 sm:p-4 dark:border-white">
								<div className="flex items-center justify-between border-black/10 border-b pb-2 dark:border-white/10">
									<h4 className="font-black font-display text-xs uppercase tracking-wider">
										CONTEÚDO ENTREGUE PELA DUPLA
									</h4>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										STATUS ATUAL: {selectedSubmission.status}
									</span>
								</div>

								{/* Action buttons (PR and Repo) */}
								<div className="flex flex-wrap items-center gap-2">
									{selectedSubmission.prUrl ? (
										<a
											className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#1E40AF] px-3.5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] dark:border-white"
											href={selectedSubmission.prUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											<GitPullRequest className="h-4 w-4" />
											<span>ABRIR PULL REQUEST NO GITHUB</span>
											<ExternalLink className="h-3.5 w-3.5 opacity-80" />
										</a>
									) : null}

									{selectedSubmission.repoUrl ? (
										<a
											className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-3.5 py-2 font-black font-display text-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:bg-muted dark:border-white"
											href={selectedSubmission.repoUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											<ExternalLink className="h-4 w-4" />
											<span>REPOSITÓRIO NO GITHUB</span>
										</a>
									) : null}
								</div>

								{/* Notes & Evidences */}
								{selectedSubmission.submissionNotes ? (
									<div className="space-y-2 pt-1">
										<p className="font-bold font-mono text-[11px] text-muted-foreground uppercase">
											ANOTAÇÕES & EVIDÊNCIAS ANEXADAS:
										</p>
										<div className="rounded-md border-2 border-black/20 bg-muted/30 p-3 font-sans text-xs leading-relaxed dark:border-white/20">
											{renderSubmissionNotes(
												selectedSubmission.submissionNotes
											)}
										</div>
									</div>
								) : null}

								{selectedSubmission.submissionNotes ||
								selectedSubmission.prUrl ||
								selectedSubmission.repoUrl ? null : (
									<div className="rounded-md border-2 border-black/10 border-dashed p-4 text-center font-mono text-muted-foreground text-xs">
										Nenhuma anotação ou link anexado nesta entrega.
									</div>
								)}
							</div>

							{/* Challenge Rules & Context Accordion */}
							<div className="rounded-md border-2 border-black bg-card dark:border-white">
								<button
									className="flex w-full items-center justify-between p-3.5 font-black font-display text-xs uppercase tracking-wider hover:bg-muted/40 sm:p-4"
									onClick={() => setShowChallengeRules((prev) => !prev)}
									type="button"
								>
									<span className="flex items-center gap-2">
										<span>CRITÉRIOS & REGRAS DO DESAFIO</span>
										<span className="rounded-xs border border-black/20 bg-[#FACC15] px-1.5 py-0.5 font-bold font-mono text-[#121212] text-[10px] uppercase dark:border-white/20">
											{selectedSubmission.challenge?.pointsReward ?? 0} PTS BASE
										</span>
									</span>
									{showChallengeRules ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</button>

								{showChallengeRules ? (
									<div className="space-y-3 border-black/10 border-t-2 p-3.5 sm:p-4 dark:border-white/10">
										{selectedSubmission.challenge?.description ? (
											<div className="space-y-1">
												<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
													DESCRIÇÃO DO DESAFIO:
												</span>
												<p className="text-xs leading-relaxed">
													{selectedSubmission.challenge.description}
												</p>
											</div>
										) : null}

										{selectedSubmission.challenge?.rulesMarkdown ? (
											<div className="space-y-1">
												<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
													INSTRUÇÕES & CRITÉRIOS DE AVALIAÇÃO:
												</span>
												<div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-md border-2 border-black/20 bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed dark:border-white/20">
													{selectedSubmission.challenge.rulesMarkdown}
												</div>
											</div>
										) : null}
									</div>
								) : null}
							</div>

							{/* Previous Feedback (if present) */}
							{selectedSubmission.feedback ? (
								<div className="rounded-md border-2 border-black bg-[#FACC15]/20 p-3.5 sm:p-4 dark:border-white">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-amber-800 dark:text-amber-300" />
										<h5 className="font-black font-display text-amber-900 text-xs uppercase tracking-wider dark:text-amber-200">
											FEEDBACK ANTERIOR REGISTRADO
										</h5>
										{selectedSubmission.reviewedAt ? (
											<span className="font-mono text-[10px] text-muted-foreground uppercase">
												(
												{new Date(
													selectedSubmission.reviewedAt
												).toLocaleDateString("pt-BR", {
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
												})}
												)
											</span>
										) : null}
									</div>
									<p className="mt-1.5 whitespace-pre-wrap font-mono text-xs">
										{selectedSubmission.feedback}
									</p>
								</div>
							) : null}

							{/* Evaluation Form */}
							<form
								className="space-y-4 rounded-md border-2 border-black bg-secondary/20 p-3.5 sm:p-4 dark:border-white"
								id="review-form"
								onSubmit={handleReviewSubmit}
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
											onClick={() => setReviewAction("APPROVED")}
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
											onClick={() => setReviewAction("CHANGES_REQUESTED")}
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
											onChange={(e) => setPointsBonus(Number(e.target.value))}
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
												{reviewAction === "APPROVED"
													? `${(selectedSubmission.challenge?.pointsReward ?? 0) + (Number(pointsBonus) || 0)} PTS`
													: "0 PTS"}
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
										onChange={(e) => setReviewFeedback(e.target.value)}
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
								onClick={() => setSelectedSubmission(null)}
								type="button"
							>
								CANCELAR
							</button>

							<button
								className="btn-tactile rounded-md border-2 border-black bg-[#121212] px-5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-[#121212]"
								disabled={reviewSubmissionMutation.isPending}
								form="review-form"
								type="submit"
							>
								{reviewSubmissionMutation.isPending
									? "REGISTRANDO..."
									: "CONCLUIR AVALIAÇÃO"}
							</button>
						</div>
					</div>
				</div>
			) : null}

			{/* Create Challenge Modal */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
					<form
						className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white"
						onSubmit={handleCreateChallenge}
					>
						{/* Modal Header */}
						<div className="flex shrink-0 items-center justify-between border-black border-b-2 p-4 sm:p-5 dark:border-white">
							<h3 className="font-black font-display text-lg uppercase sm:text-xl">
								CRIAR NOVO DESAFIO // EJ
							</h3>
							<button
								aria-label="Fechar modal"
								className="btn-tactile flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setIsCreateModalOpen(false)}
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
									onChange={(e) => setTitle(e.target.value)}
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
									onChange={(e) => setTrackTheme(e.target.value)}
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
									onChange={(e) => setDescription(e.target.value)}
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
									onChange={(e) => setRulesMarkdown(e.target.value)}
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
									onChange={(e) => setMkdocsUrl(e.target.value)}
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
										onChange={(e) => setAssessorId(e.target.value)}
										value={assessorId}
									>
										{assessorsQuery.data?.map((a) => (
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
										onChange={(e) => setPointsReward(Number(e.target.value))}
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
									onChange={(e) => setDeadline(e.target.value)}
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
								onClick={() => setIsCreateModalOpen(false)}
								type="button"
							>
								CANCELAR
							</button>
							<button
								className="btn-tactile flex-1 rounded-md border-2 border-black bg-[#FF4A1C] px-5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 sm:flex-initial dark:border-white"
								disabled={createChallengeMutation.isPending}
								type="submit"
							>
								{createChallengeMutation.isPending
									? "CRIANDO..."
									: "CRIAR DESAFIO // SALVAR"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Delete Challenge Confirmation Modal */}
			{challengeToDelete ? (
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
								{challengeToDelete.title}
							</div>
							<p className="font-mono text-[11px] text-muted-foreground">
								{(challengeToDelete.pairs?.length ?? 0) > 0 ? (
									<span>
										⚠️ Isso também excluirá permanentemente as{" "}
										<strong className="font-bold text-[#DC2626]">
											{challengeToDelete.pairs?.length} duplas/trios
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
								onClick={() => setChallengeToDelete(null)}
								type="button"
							>
								CANCELAR
							</button>
							<button
								className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] disabled:opacity-50 dark:border-white"
								disabled={deleteChallengeMutation.isPending}
								onClick={() =>
									deleteChallengeMutation.mutate({ id: challengeToDelete.id })
								}
								type="button"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>
									{deleteChallengeMutation.isPending
										? "EXCLUINDO..."
										: "EXCLUIR DEFINITIVAMENTE"}
								</span>
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
