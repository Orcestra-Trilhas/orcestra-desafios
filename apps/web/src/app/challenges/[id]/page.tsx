"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import {
	BauhausSkeleton,
	PopBadge,
	PopPointsBadge,
	PopStamp,
	PopTrackBadge,
} from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";

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

	const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
	const [submissionType, setSubmissionType] = useState<
		"PR" | "REPO" | "DOCUMENT" | "IMAGE" | "TEXT"
	>("PR");
	const [prUrl, setPrUrl] = useState("");
	const [repoUrl, setRepoUrl] = useState("");
	const [submissionNotes, setSubmissionNotes] = useState("");

	if (challengeQuery.isLoading) {
		return (
			<div className="mx-auto max-w-3xl space-y-4 p-6">
				<BauhausSkeleton />
			</div>
		);
	}

	const ch = challengeQuery.data;
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

	const myPair = ch.myPair;
	const totalPairs = ch.totalPairs;
	const submittedCount = ch.submittedPairs;
	const thermometerPercent =
		totalPairs > 0 ? Math.round((submittedCount / totalPairs) * 100) : 0;

	const currentStep = myPair ? myPair.currentStep : 1;
	const pairStatus = myPair ? myPair.status : "IN_PROGRESS";

	const handleAdvanceStep1 = () => {
		if (!myPair) {
			return;
		}
		advanceStepMutation.mutate({ pairId: myPair.id });
	};

	const handleSubmitSolution = (e: React.FormEvent) => {
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
	};

	return (
		<div className="mx-auto max-w-3xl space-y-4 px-3 py-4 pb-28 sm:space-y-6 sm:px-4 sm:py-6 sm:pb-32">
			{/* Back Link */}
			<button
				className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-3 py-1 font-black font-display text-xs uppercase shadow-hard-sm dark:border-white"
				onClick={() => router.back()}
				type="button"
			>
				&larr; VOLTAR AOS DESAFIOS
			</button>

			{/* Header Banner */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-4 sm:p-6 dark:border-white">
				<div className="flex flex-wrap items-center justify-between gap-2 border-black/10 border-b-2 pb-2.5 sm:pb-3 dark:border-white/10">
					<div className="flex items-center gap-2">
						<PopTrackBadge track={ch.trackTheme} />
						<PopPointsBadge points={ch.pointsReward} size="sm" />
					</div>

					<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">
						PRAZO: {new Date(ch.deadline).toLocaleDateString("pt-BR")}
					</span>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<h1 className="font-black font-display text-xl uppercase tracking-tight sm:text-3xl">
						{ch.title}
					</h1>
					<p className="font-medium text-muted-foreground text-xs leading-relaxed sm:text-sm">
						{ch.description}
					</p>
				</div>

				{/* MkDocs Link */}
				{ch.mkdocsUrl && (
					<div className="pt-1">
						<a
							className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#1E40AF] px-3.5 py-1.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] sm:px-4 sm:py-2 dark:border-white"
							href={ch.mkdocsUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span>DOCUMENTAÇÃO NO MKDOCS &rarr;</span>
						</a>
					</div>
				)}
			</div>

			{/* Collective Thermometer */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
						<span className="font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
							TERMÔMETRO COLETIVO // META DA EJ
						</span>
					</div>
					<span className="font-black font-mono text-[11px] sm:text-xs">
						{submittedCount} DE {totalPairs} DUPLAS ({thermometerPercent}%)
					</span>
				</div>

				<div className="h-4 w-full overflow-hidden rounded-xs border-2 border-black bg-secondary p-0.5 dark:border-white">
					<div
						className="h-full border-black border-r-2 bg-[#FF4A1C] transition-all duration-500 dark:border-white"
						style={{ width: `${Math.min(thermometerPercent, 100)}%` }}
					/>
				</div>

				<p className="font-mono text-[10px] text-muted-foreground uppercase sm:text-[11px]">
					CADA ENTREGA SOMA PARA A PONTUAÇÃO COLETIVA DA EJ NA SPRINT.
				</p>
			</div>

			{/* Rules & Markdown Section */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
				<div className="flex items-center gap-2 border-black/10 border-b-2 pb-2 dark:border-white/10">
					<div className="h-3 w-3 rounded-sm border-2 border-black bg-[#FACC15] dark:border-white" />
					<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
						INSTRUÇÕES & REGRAS DO DESAFIO
					</h3>
				</div>
				<div className="whitespace-pre-wrap rounded-md border-2 border-black/20 bg-secondary/50 p-3.5 font-mono text-[11px] leading-relaxed sm:p-4 sm:text-xs dark:border-white/20">
					{ch.rulesMarkdown}
				</div>
			</div>

			{/* Checkpoints Stepper */}
			<div className="space-y-5 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-6 sm:p-6 dark:border-white">
				<div className="flex items-center justify-between border-black/10 border-b-2 pb-3 dark:border-white/10">
					<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
						CHECKPOINTS DA DUPLA
					</h3>
					{myPair && (
						<PopStamp
							status={
								pairStatus as
									| "IN_PROGRESS"
									| "SUBMITTED"
									| "APPROVED"
									| "CHANGES_REQUESTED"
							}
						/>
					)}
				</div>

				{myPair ? (
					<div className="relative ml-2 space-y-7 border-black border-l-2 pl-4 sm:ml-4 sm:space-y-8 sm:pl-6 dark:border-white">
						{/* Step 1 */}
						<div className="relative">
							<div
								className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${
									currentStep > 1
										? "bg-[#15803D] text-white"
										: "bg-[#FACC15] text-[#121212]"
								}`}
							>
								01
							</div>
							<div className="space-y-2">
								<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
									<h4 className="font-black font-display text-xs uppercase sm:text-sm">
										ALINHAMENTO DA DUPLA & SETUP INICIAL
									</h4>
									{currentStep > 1 && (
										<div>
											<PopBadge color="green">CONCLUÍDO</PopBadge>
										</div>
									)}
								</div>
								<p className="font-medium text-muted-foreground text-xs">
									Conversem no WhatsApp, alinhem quem fará qual parte e criem a
									branch de trabalho.
								</p>

								{currentStep === 1 && (
									<button
										className="btn-tactile mt-2 w-full rounded-md border-2 border-black bg-[#121212] px-3.5 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-neutral-800 disabled:opacity-50 sm:w-auto sm:px-4 dark:border-white dark:bg-white dark:text-[#121212]"
										disabled={advanceStepMutation.isPending}
										onClick={handleAdvanceStep1}
										type="button"
									>
										{advanceStepMutation.isPending
											? "AVANÇANDO..."
											: "CONCLUIR SETUP & LIBERAR SUBMISSÃO &rarr;"}
									</button>
								)}
							</div>
						</div>

						{/* Step 2 */}
						<div className="relative">
							<div
								className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${
									pairStatus === "SUBMITTED" || pairStatus === "APPROVED"
										? "bg-[#15803D] text-white"
										: currentStep >= 2
											? "bg-[#FF4A1C] text-white"
											: "bg-muted text-muted-foreground"
								}`}
							>
								02
							</div>
							<div className="space-y-2">
								<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
									<h4 className="font-black font-display text-xs uppercase sm:text-sm">
										SUBMISSÃO DA SOLUÇÃO (PR / ARQUIVO)
									</h4>
									{(pairStatus === "SUBMITTED" ||
										pairStatus === "APPROVED") && (
										<div>
											<PopBadge color="green">SUBMETIDO</PopBadge>
										</div>
									)}
								</div>
								<p className="font-medium text-muted-foreground text-xs">
									Submeta o link do Pull Request no GitHub ou anexe evidências
									para validação técnica.
								</p>

								{currentStep >= 2 && pairStatus !== "APPROVED" && (
									<button
										className="btn-tactile mt-2 w-full rounded-md border-2 border-black bg-[#FF4A1C] px-3.5 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] sm:w-auto sm:px-4 dark:border-white"
										onClick={() => setIsSubmitModalOpen(true)}
										type="button"
									>
										{pairStatus === "SUBMITTED"
											? "EDITAR / REENVIAR SUBMISSÃO"
											: "SUBMETER SOLUÇÃO AGORA"}
									</button>
								)}
							</div>
						</div>

						{/* Step 3 */}
						<div className="relative">
							<div
								className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${
									pairStatus === "APPROVED"
										? "bg-[#15803D] text-white"
										: pairStatus === "CHANGES_REQUESTED"
											? "bg-[#DC2626] text-white"
											: "bg-muted text-muted-foreground"
								}`}
							>
								03
							</div>
							<div className="space-y-2">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<h4 className="font-black font-display text-xs uppercase sm:text-sm">
										AVALIAÇÃO DO ASSESSOR RESPONSÁVEL
									</h4>
									<div>
										<PopStamp
											status={
												pairStatus as
													| "IN_PROGRESS"
													| "SUBMITTED"
													| "APPROVED"
													| "CHANGES_REQUESTED"
											}
										/>
									</div>
								</div>
								<p className="font-medium text-muted-foreground text-xs">
									O assessor da sprint analisará a qualidade técnica, padrões de
									código e pontuação.
								</p>

								{myPair.feedback && (
									<div className="mt-3 rounded-md border-2 border-black bg-secondary/60 p-3 font-mono text-xs dark:border-white">
										<span className="block font-black font-display text-[#FF4A1C] uppercase tracking-wider">
											[FEEDBACK DO ASSESSOR]:
										</span>
										<p className="mt-1 whitespace-pre-wrap">
											{myPair.feedback}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="rounded-md border-2 border-black border-dashed bg-secondary/40 p-6 text-center dark:border-white">
						<p className="font-black font-display text-muted-foreground text-xs uppercase">
							Você ainda não foi alocado em uma dupla para este desafio.
						</p>
					</div>
				)}
			</div>

			{/* Floating Bottom Bar */}
			{myPair && pairStatus !== "APPROVED" && (
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
							onClick={() => setIsSubmitModalOpen(true)}
							type="button"
						>
							SUBMETER SOLUÇÃO
						</button>
					</div>
				</div>
			)}

			{/* Submission Modal */}
			{isSubmitModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
					<div className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-card p-6 shadow-hard-lg dark:border-white">
						<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
							<div>
								<h3 className="font-black font-display text-xl uppercase">
									SUBMETER SOLUÇÃO // DUPLA
								</h3>
								<p className="font-mono text-muted-foreground text-xs uppercase">
									DESAFIO: {ch.title}
								</p>
							</div>
							<button
								className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setIsSubmitModalOpen(false)}
								type="button"
							>
								X
							</button>
						</div>

						<form className="space-y-4" onSubmit={handleSubmitSolution}>
							<div className="space-y-1.5">
								<label className="font-black font-display text-xs uppercase tracking-wider">
									TIPO DE ENTREGA
								</label>
								<div className="grid grid-cols-3 gap-2">
									{(["PR", "TEXT", "DOCUMENT"] as const).map((t) => (
										<button
											className={`btn-tactile rounded-md border-2 p-2 font-black font-display text-xs uppercase transition ${
												submissionType === t
													? "border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
													: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
											}`}
											key={t}
											onClick={() => setSubmissionType(t)}
											type="button"
										>
											{t === "PR"
												? "PULL REQUEST"
												: t === "TEXT"
													? "TEXTO / .MD"
													: "ARQUIVO / LINK"}
										</button>
									))}
								</div>
							</div>

							{submissionType === "PR" && (
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
										onChange={(e) => setPrUrl(e.target.value)}
										placeholder="https://github.com/orcestra/.../pull/1"
										required
										type="url"
										value={prUrl}
									/>
								</div>
							)}

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
									onChange={(e) => setRepoUrl(e.target.value)}
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
									onChange={(e) => setSubmissionNotes(e.target.value)}
									placeholder="Explique as decisões da dupla, trade-offs ou dúvidas restantes..."
									rows={4}
									value={submissionNotes}
								/>
								<div className="flex items-center justify-between pt-1">
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Anexe print ou arquivo via Cloudinary:
									</span>
									<CloudinaryUploadButton
										folder="orcestra-submissoes"
										label="Anexar Imagem"
										onUploadSuccess={(url) => {
											setSubmissionNotes((prev) =>
												prev
													? `${prev}\n\n![Evidência do Desafio](${url})`
													: `![Evidência do Desafio](${url})`
											);
											toast.success("Print anexado à descrição!");
										}}
									/>
								</div>
							</div>

							<button
								className="btn-tactile w-full rounded-md border-2 border-black bg-[#FF4A1C] py-3 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
								disabled={submitSolutionMutation.isPending}
								type="submit"
							>
								{submitSolutionMutation.isPending
									? "ENVIANDO SOLUÇÃO..."
									: "CONFIRMAR & SUBMETER SOLUÇÃO"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
