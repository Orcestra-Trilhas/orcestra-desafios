"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { BauhausSkeleton } from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";
import { ChallengeHeader } from "./_components/challenge-header";
import { ChallengeRulesCard } from "./_components/challenge-rules-card";
import { ChallengeSubmissionModal } from "./_components/challenge-submission-modal";
import { CheckpointsStepper } from "./_components/checkpoints-stepper";
import { CollectiveThermometerCard } from "./_components/collective-thermometer-card";
import { CommunitySolutionsSection } from "./_components/community-solutions-section";
import { DeleteChallengeDialog } from "./_components/delete-challenge-dialog";
import { extractEvidenceUrls } from "./_components/submission-utils";
import type { SubmissionType } from "./_components/types";

export default function ChallengeDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const challengeId = params.id as string;

	const challengeQuery = useQuery(
		trpc.challenge.getById.queryOptions({ id: challengeId })
	);

	const advanceStepMutation = useMutation(
		trpc.challenge.advanceStep.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao avançar etapa");
			},
			onSuccess: () => {
				toast.success(
					"Passo 1 concluído! A dupla agora pode enviar a solução."
				);
				queryClient.invalidateQueries();
			},
		})
	);

	const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [submissionType, setSubmissionType] = useState<SubmissionType>("PR");
	const [prUrl, setPrUrl] = useState("");
	const [repoUrl, setRepoUrl] = useState("");
	const [submissionNotes, setSubmissionNotes] = useState("");

	const submitSolutionMutation = useMutation(
		trpc.challenge.submitSolution.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao submeter solução");
			},
			onSuccess: () => {
				toast.success("Solução enviada para avaliação do assessor!");
				setIsSubmitModalOpen(false);
				queryClient.invalidateQueries();
			},
		})
	);

	const userMe = useQuery(trpc.user.me.queryOptions());
	const isAdmin = userMe.data?.role === "ADMIN";

	const deleteChallengeMutation = useMutation(
		trpc.admin.deleteChallenge.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao excluir desafio");
			},
			onSuccess: () => {
				toast.success("Desafio excluído com sucesso!");
				setIsDeleteModalOpen(false);
				router.push("/admin");
			},
		})
	);

	const attachedEvidences = extractEvidenceUrls(submissionNotes);

	const handleRemoveEvidence = useCallback((rawMatch: string) => {
		setSubmissionNotes((prev) =>
			prev
				.replace(rawMatch, "")
				.replace(/\n\s*\n\s*\n/g, "\n\n")
				.trim()
		);
		toast.success("Evidência removida das notas!");
	}, []);

	const handleAddEvidence = useCallback((url: string) => {
		setSubmissionNotes((prev) =>
			prev
				? `${prev}\n\n![Evidência do Desafio](${url})`
				: `![Evidência do Desafio](${url})`
		);
		toast.success("Evidência anexada com sucesso!");
	}, []);

	const ch = challengeQuery.data;
	const myPair = ch?.myPair;
	const currentStep = myPair ? myPair.currentStep : 1;
	const pairStatus = myPair ? myPair.status : "IN_PROGRESS";

	const handleOpenSubmit = useCallback(() => {
		if (myPair && currentStep === 1) {
			advanceStepMutation.mutate({ pairId: myPair.id });
		}
		setIsSubmitModalOpen(true);
	}, [advanceStepMutation, currentStep, myPair]);

	const handleCloseSubmitModal = useCallback(() => {
		setIsSubmitModalOpen(false);
	}, []);

	const handleOpenDeleteModal = useCallback(() => {
		setIsDeleteModalOpen(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setIsDeleteModalOpen(false);
	}, []);

	const handleDeleteConfirm = useCallback(() => {
		deleteChallengeMutation.mutate({ id: challengeId });
	}, [challengeId, deleteChallengeMutation]);

	const handleAdvanceStep1 = useCallback(() => {
		if (!myPair) {
			return;
		}
		advanceStepMutation.mutate({ pairId: myPair.id });
	}, [advanceStepMutation, myPair]);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	const handleSubmitSolution = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!myPair) {
				return;
			}

			if (submissionType === "PR" && !prUrl) {
				toast.error("Insira a URL do Pull Request no GitHub");
				return;
			}

			if (submissionType === "TEXT" && !submissionNotes) {
				toast.error("Insira a explicação ou resposta da solução");
				return;
			}

			submitSolutionMutation.mutate({
				pairId: myPair.id,
				prUrl: prUrl || null,
				repoUrl: repoUrl || null,
				submissionNotes: submissionNotes || null,
				submissionType,
			});
		},
		[
			myPair,
			prUrl,
			repoUrl,
			submissionNotes,
			submissionType,
			submitSolutionMutation,
		]
	);

	if (challengeQuery.isLoading) {
		return (
			<div className="mx-auto max-w-3xl space-y-4 p-6">
				<BauhausSkeleton />
			</div>
		);
	}

	if (!ch) {
		return (
			<div className="mx-auto max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-8 text-center shadow-hard dark:border-white">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[#DC2626] font-black text-white text-xl">
					!
				</div>
				<h2 className="font-black font-display text-lg uppercase">
					DESAFIO NÃO ENCONTRADO
				</h2>
				<Link
					className="btn-tactile inline-block rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-xs uppercase dark:border-white"
					href="/dashboard"
				>
					&larr; VOLTAR AOS DESAFIOS
				</Link>
			</div>
		);
	}

	const { submittedPairs: submittedCount, totalPairs } = ch;
	const thermometerPercent =
		totalPairs > 0 ? Math.round((submittedCount / totalPairs) * 100) : 0;

	return (
		<div className="mx-auto max-w-3xl space-y-4 px-3 py-4 pb-28 sm:space-y-6 sm:px-4 sm:py-6 sm:pb-32">
			{/* Top Bar, Track lock notice & Header */}
			<ChallengeHeader
				challenge={ch}
				isAdmin={isAdmin}
				onBack={handleBack}
				onOpenDelete={handleOpenDeleteModal}
				userMe={userMe.data}
			/>

			{/* Collective Thermometer */}
			<CollectiveThermometerCard
				submittedCount={submittedCount}
				thermometerPercent={thermometerPercent}
				totalPairs={totalPairs}
			/>

			{/* Rules & Markdown Section */}
			<ChallengeRulesCard rulesMarkdown={ch.rulesMarkdown} />

			{/* Checkpoints Stepper */}
			<CheckpointsStepper
				isAdvancingStep={advanceStepMutation.isPending}
				myPair={myPair}
				onAdvanceStep1={handleAdvanceStep1}
				onOpenSubmit={handleOpenSubmit}
			/>

			{/* Community Solutions & Anti-Spoiler Section */}
			<CommunitySolutionsSection
				canViewAllSolutions={ch.canViewAllSolutions}
				hasMyPair={Boolean(myPair)}
				onOpenSubmit={handleOpenSubmit}
				submissions={ch.submissions}
			/>

			{/* Floating Bottom Bar */}
			{myPair && pairStatus !== "APPROVED" ? (
				<div className="fixed right-0 bottom-16 left-0 z-40 border-black border-t-2 bg-background p-3 dark:border-white">
					<div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-2">
						<div className="text-xs">
							<span className="block font-black font-display uppercase">
								{pairStatus === "SUBMITTED"
									? "SUBMISSÃO EM ANÁLISE"
									: "PRONTO PARA ENTREGAR?"}
							</span>
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								{pairStatus === "SUBMITTED"
									? "Você pode atualizar se necessário"
									: "Envie seu PR ou evidência"}
							</span>
						</div>

						<button
							className="btn-tactile rounded-md border-2 border-black bg-[#FF4A1C] px-5 py-2.5 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] dark:border-white"
							onClick={handleOpenSubmit}
							type="button"
						>
							SUBMETER SOLUÇÃO
						</button>
					</div>
				</div>
			) : null}

			{/* Submission Modal */}
			<ChallengeSubmissionModal
				attachedEvidences={attachedEvidences}
				challengeTitle={ch.title}
				isOpen={isSubmitModalOpen}
				isPending={submitSolutionMutation.isPending}
				onAddEvidence={handleAddEvidence}
				onChangeNotes={setSubmissionNotes}
				onChangePrUrl={setPrUrl}
				onChangeRepoUrl={setRepoUrl}
				onChangeType={setSubmissionType}
				onClose={handleCloseSubmitModal}
				onRemoveEvidence={handleRemoveEvidence}
				onSubmit={handleSubmitSolution}
				prUrl={prUrl}
				repoUrl={repoUrl}
				submissionNotes={submissionNotes}
				submissionType={submissionType}
			/>

			{/* Delete Challenge Confirmation Modal */}
			<DeleteChallengeDialog
				challengeTitle={ch.title}
				isOpen={isDeleteModalOpen}
				isPending={deleteChallengeMutation.isPending}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				totalPairs={ch.totalPairs ?? 0}
			/>
		</div>
	);
}
