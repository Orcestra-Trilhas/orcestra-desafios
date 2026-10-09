"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { type AdminTab, AdminTabsNav } from "./_components/admin-tabs-nav";
import { ChallengesTab } from "./_components/challenges-tab";
import {
	type CreateChallengeData,
	CreateChallengeModal,
} from "./_components/create-challenge-modal";
import { DeleteChallengeDialog } from "./_components/delete-challenge-dialog";
import { LogsTab } from "./_components/logs-tab";
import { MetricCards } from "./_components/metric-cards";
import {
	ReviewSubmissionModal,
	type ReviewSubmitData,
} from "./_components/review-submission-modal";
import { SubmissionsTab } from "./_components/submissions-tab";
import type {
	AdminChallenge,
	AdminMetrics,
	AdminSubmission,
	AssessorOption,
} from "./_components/types";

export default function AdminPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const userMe = useQuery(trpc.user.me.queryOptions());

	const sessionUser = session?.user as { role?: string } | undefined;
	const role = userMe.data?.role ?? sessionUser?.role;
	const isAdmin = role === "ADMIN";

	const metricsQuery = useQuery(trpc.admin.getMetrics.queryOptions());
	const challengesQuery = useQuery(trpc.admin.listChallenges.queryOptions());
	const submissionsQuery = useQuery(trpc.admin.listSubmissions.queryOptions());
	const logsQuery = useQuery(trpc.admin.listLogs.queryOptions());
	const assessorsQuery = useQuery(trpc.user.listAssessors.queryOptions());

	// Modals and tabs state
	const [activeTab, setActiveTab] = useState<AdminTab>("SUBMISSIONS");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedSubmission, setSelectedSubmission] =
		useState<AdminSubmission | null>(null);
	const [challengeToDelete, setChallengeToDelete] =
		useState<AdminChallenge | null>(null);

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

	// Stable handlers
	const handleOpenCreateModal = useCallback(() => {
		setIsCreateModalOpen(true);
	}, []);

	const handleCloseCreateModal = useCallback(() => {
		setIsCreateModalOpen(false);
	}, []);

	const handleCloseReviewModal = useCallback(() => {
		setSelectedSubmission(null);
	}, []);

	const handleCloseDeleteDialog = useCallback(() => {
		setChallengeToDelete(null);
	}, []);

	const handleToggleChallenge = useCallback(
		(challengeId: string, currentActive: boolean) => {
			toggleChallengeMutation.mutate({
				active: !currentActive,
				id: challengeId,
			});
		},
		[toggleChallengeMutation]
	);

	const handleDrawPairs = useCallback(
		(challengeId: string) => {
			drawPairsMutation.mutate({ challengeId });
		},
		[drawPairsMutation]
	);

	const handleConfirmDelete = useCallback(
		(challengeId: string) => {
			deleteChallengeMutation.mutate({ id: challengeId });
		},
		[deleteChallengeMutation]
	);

	const handleCreateChallenge = useCallback(
		(data: CreateChallengeData) => {
			createChallengeMutation.mutate(data);
		},
		[createChallengeMutation]
	);

	const handleReviewSubmit = useCallback(
		(data: ReviewSubmitData) => {
			reviewSubmissionMutation.mutate(data);
		},
		[reviewSubmissionMutation]
	);

	if (!isAdmin) {
		return (
			<div className="mx-auto max-w-lg space-y-4 rounded-lg border-2 border-black bg-card p-6 text-center shadow-hard dark:border-white">
				<h2 className="font-black font-display text-xl uppercase">
					ACESSO RESTRITO {"//"} ADMIN
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

	const metrics: AdminMetrics = metricsQuery.data ?? {
		activeChallenges: 0,
		approvalRate: 100,
		approvedPairs: 0,
		changesRequested: 0,
		stuckPairs: 0,
		submittedPairs: 0,
		totalChallenges: 0,
		totalPairs: 0,
	};

	const challenges = (challengesQuery.data ??
		[]) as unknown as AdminChallenge[];
	const submissions = (submissionsQuery.data ??
		[]) as unknown as AdminSubmission[];
	const logs = logsQuery.data ?? [];
	const assessors = (assessorsQuery.data ?? []) as unknown as AssessorOption[];

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
					className="btn-tactile flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-black bg-primary px-4 py-2.5 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 sm:w-auto sm:py-2 dark:border-white"
					onClick={handleOpenCreateModal}
					type="button"
				>
					<span>+ NOVO DESAFIO</span>
				</button>
			</div>

			{/* Metric Blocks */}
			<MetricCards metrics={metrics} />

			{/* Tab Switcher */}
			<AdminTabsNav
				activeTab={activeTab}
				onTabChange={setActiveTab}
				submissionsCount={submissions.length}
			/>

			{/* Active Tab Content */}
			{activeTab === "SUBMISSIONS" ? (
				<SubmissionsTab
					isLoading={submissionsQuery.isLoading}
					onSelectSubmission={setSelectedSubmission}
					submissions={submissions}
				/>
			) : null}

			{activeTab === "CHALLENGES" ? (
				<ChallengesTab
					challenges={challenges}
					isDrawing={drawPairsMutation.isPending}
					onDeleteClick={setChallengeToDelete}
					onDrawPairs={handleDrawPairs}
					onToggleActive={handleToggleChallenge}
				/>
			) : null}

			{activeTab === "LOGS" ? <LogsTab logs={logs} /> : null}

			{/* Create Challenge Modal */}
			<CreateChallengeModal
				assessors={assessors}
				isOpen={isCreateModalOpen}
				isPending={createChallengeMutation.isPending}
				onClose={handleCloseCreateModal}
				onCreateChallenge={handleCreateChallenge}
			/>

			{/* Review Submission Modal */}
			<ReviewSubmissionModal
				isPending={reviewSubmissionMutation.isPending}
				onClose={handleCloseReviewModal}
				onSubmitReview={handleReviewSubmit}
				submission={selectedSubmission}
			/>

			{/* Delete Challenge Confirmation Modal */}
			<DeleteChallengeDialog
				challenge={challengeToDelete}
				isDeleting={deleteChallengeMutation.isPending}
				onClose={handleCloseDeleteDialog}
				onConfirmDelete={handleConfirmDelete}
			/>
		</div>
	);
}
