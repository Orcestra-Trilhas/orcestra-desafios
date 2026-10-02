"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	BauhausSkeleton,
	PopBadge,
	PopStamp,
	PopTrackBadge,
} from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

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

	// UI state
	const [activeTab, setActiveTab] = useState<
		"SUBMISSIONS" | "CHALLENGES" | "LOGS"
	>("SUBMISSIONS");
	// biome-ignore lint/suspicious/noExplicitAny: modal selected submission object
	const [selectedSubmission, setSelectedSubmission] = useState<any | null>(
		null
	);
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

		reviewSubmissionMutation.mutate({
			feedback: reviewFeedback,
			pairId: selectedSubmission.id,
			pointsBonus: Number(pointsBonus),
			status: reviewAction,
		});
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 py-6 pb-28">
			{/* Poster Header */}
			<div className="flex flex-col justify-between gap-4 border-black border-b-2 pb-4 sm:flex-row sm:items-center dark:border-white">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<PopBadge color="vermilion">GESTÃO // TOPS</PopBadge>
						<PopBadge color="black">ASSESSORIA TÉCNICA</PopBadge>
					</div>
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
					<span className="font-black font-display text-[#FACC15] text-xl sm:text-2xl">
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
					<span className="font-black font-display text-[#15803D] text-xl sm:text-2xl">
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
					<span className="font-black font-display text-[#DC2626] text-xl sm:text-2xl">
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
							? "border-black bg-[#FF4A1C] text-white shadow-hard-sm dark:border-white"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
					}`}
					onClick={() => setActiveTab("SUBMISSIONS")}
					type="button"
				>
					FILA DE SUBMISSÕES ({submissionsQuery.data?.length ?? 0})
				</button>

				<button
					className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
						activeTab === "CHALLENGES"
							? "border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
					}`}
					onClick={() => setActiveTab("CHALLENGES")}
					type="button"
				>
					DESAFIOS & SORTEIO
				</button>

				<button
					className={`btn-tactile shrink-0 rounded-md border-2 px-3 py-1.5 font-black font-display text-[11px] uppercase transition sm:text-xs ${
						activeTab === "LOGS"
							? "border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
							: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
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
												<span>TIPO: {sub.submissionType}</span>
											</div>

											{sub.prUrl && (
												<a
													className="block max-w-full truncate font-bold font-mono text-[#1E40AF] text-xs hover:underline dark:text-blue-400"
													href={sub.prUrl}
													rel="noopener noreferrer"
													target="_blank"
												>
													[GITHUB PR]: {sub.prUrl}
												</a>
											)}
										</div>

										<button
											className="btn-tactile w-full self-stretch rounded-md border-2 border-black bg-[#FACC15] px-4 py-2 text-center font-black font-display text-[#121212] text-xs uppercase shadow-hard-sm hover:bg-[#EAB308] sm:w-auto sm:self-auto dark:border-white"
											onClick={() => {
												setSelectedSubmission(sub);
												setReviewFeedback(sub.feedback || "");
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
			{selectedSubmission && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
					<div className="relative max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:max-h-[90vh] sm:p-6 dark:border-white">
						<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
							<div>
								<h3 className="font-black font-display text-lg uppercase">
									AVALIAÇÃO DE SUBMISSÃO
								</h3>
								<p className="font-mono text-muted-foreground text-xs uppercase">
									{selectedSubmission.challenge?.title}
								</p>
							</div>
							<button
								className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setSelectedSubmission(null)}
								type="button"
							>
								X
							</button>
						</div>

						<form className="space-y-4" onSubmit={handleReviewSubmit}>
							<div className="space-y-1">
								<label className="font-black font-display text-xs uppercase tracking-wider">
									VEREDITO DO ASSESSOR
								</label>
								<div className="grid grid-cols-2 gap-2">
									<button
										className={`btn-tactile rounded-md border-2 p-2.5 font-black font-display text-xs uppercase ${
											reviewAction === "APPROVED"
												? "border-black bg-[#15803D] text-white shadow-hard-sm dark:border-white"
												: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
										}`}
										onClick={() => setReviewAction("APPROVED")}
										type="button"
									>
										APROVAR SOLUÇÃO
									</button>

									<button
										className={`btn-tactile rounded-md border-2 p-2.5 font-black font-display text-xs uppercase ${
											reviewAction === "CHANGES_REQUESTED"
												? "border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white"
												: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
										}`}
										onClick={() => setReviewAction("CHANGES_REQUESTED")}
										type="button"
									>
										SOLICITAR AJUSTES
									</button>
								</div>
							</div>

							<div className="space-y-1">
								<label
									className="font-bold font-display text-xs uppercase tracking-wider"
									htmlFor="bonus"
								>
									Pontos Bônus (Opcional)
								</label>
								<input
									className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
									id="bonus"
									onChange={(e) => setPointsBonus(Number(e.target.value))}
									type="number"
									value={pointsBonus}
								/>
							</div>

							<div className="space-y-1">
								<label
									className="font-bold font-display text-xs uppercase tracking-wider"
									htmlFor="feedback"
								>
									Feedback Técnico & Apontamentos de Código
								</label>
								<textarea
									className="w-full resize-none rounded-md border-2 border-black bg-background p-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
									id="feedback"
									onChange={(e) => setReviewFeedback(e.target.value)}
									placeholder="Descreva pontos positivos, melhorias necessárias ou orientações para a dupla..."
									rows={4}
									value={reviewFeedback}
								/>
							</div>

							<button
								className="btn-tactile w-full rounded-md border-2 border-black bg-[#121212] py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-[#121212]"
								disabled={reviewSubmissionMutation.isPending}
								type="submit"
							>
								{reviewSubmissionMutation.isPending
									? "REGISTRANDO..."
									: "CONCLUIR AVALIAÇÃO"}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Create Challenge Modal */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
					<div className="relative max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:max-h-[90vh] sm:p-6 dark:border-white">
						<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
							<h3 className="font-black font-display text-xl uppercase">
								CRIAR NOVO DESAFIO // EJ
							</h3>
							<button
								className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setIsCreateModalOpen(false)}
								type="button"
							>
								X
							</button>
						</div>

						<form className="space-y-3" onSubmit={handleCreateChallenge}>
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
									<option value="PROTOTIPACAO">PROTOTIPAGEM</option>
									<option value="DEVOPS">DEVOPS // INFRA</option>
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

							<button
								className="btn-tactile mt-2 w-full rounded-md border-2 border-black bg-[#FF4A1C] py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
								disabled={createChallengeMutation.isPending}
								type="submit"
							>
								{createChallengeMutation.isPending
									? "CRIANDO..."
									: "CRIAR DESAFIO // SALVAR"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
