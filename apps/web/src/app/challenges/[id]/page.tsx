"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ExternalLink,
	GitPullRequest,
	Lock,
	Trash2,
	Unlock,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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

function extractEvidenceUrls(
	notes: string
): { alt: string; raw: string; url: string }[] {
	const regex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
	const matches: { alt: string; raw: string; url: string }[] = [];
	let match = regex.exec(notes);
	while (match !== null) {
		matches.push({
			alt: match[1] || "Evidência",
			raw: match[0],
			url: match[2],
		});
		match = regex.exec(notes);
	}
	return matches;
}

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

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
	const [submissionType, setSubmissionType] = useState<
		"PR" | "REPO" | "DOCUMENT" | "IMAGE" | "TEXT"
	>("PR");
	const [prUrl, setPrUrl] = useState("");
	const [repoUrl, setRepoUrl] = useState("");
	const [submissionNotes, setSubmissionNotes] = useState("");

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

	const totalPairs = ch.totalPairs;
	const submittedCount = ch.submittedPairs;
	const thermometerPercent =
		totalPairs > 0 ? Math.round((submittedCount / totalPairs) * 100) : 0;

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
			{/* Top Bar with Back Link & Admin Delete */}
			<div className="flex items-center justify-between gap-2">
				<button
					className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-3 py-1 font-black font-display text-xs uppercase shadow-hard-sm dark:border-white"
					onClick={() => router.back()}
					type="button"
				>
					&larr; VOLTAR AOS DESAFIOS
				</button>

				{isAdmin ? (
					<button
						className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-3 py-1 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] dark:border-white"
						onClick={() => setIsDeleteModalOpen(true)}
						type="button"
					>
						<Trash2 className="h-3.5 w-3.5" />
						<span>EXCLUIR DESAFIO</span>
					</button>
				) : null}
			</div>

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
					CADA ENTREGA SOMA PARA A PONTUAÇÃO COLETIVA DA EJ NAS MISSÕES.
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
									O assessor do desafio analisará a qualidade técnica, padrões
									de código e pontuação.
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

			{/* Community Solutions & Anti-Spoiler Section */}
			<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-5 sm:p-6 dark:border-white">
				<div className="flex flex-col justify-between gap-2 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] text-white dark:border-white">
								{ch.canViewAllSolutions ? (
									<Unlock className="h-3.5 w-3.5" />
								) : (
									<Lock className="h-3.5 w-3.5" />
								)}
							</div>
							<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
								SOLUÇÕES {"//"} ENTREGAS DAS DUPLAS
							</h3>
						</div>
						<p className="font-medium text-muted-foreground text-xs">
							{ch.canViewAllSolutions
								? "Você já enviou sua solução ou o prazo expirou. Todas as submissões estão desbloqueadas para estudo e comparação."
								: "Modo anti-spoiler ativo. As respostas de outras duplas estão protegidas com tarja preta até que sua dupla submeta a solução."}
						</p>
					</div>

					<div>
						{ch.canViewAllSolutions ? (
							<PopBadge color="green">SPOILER LIBERADO</PopBadge>
						) : (
							<PopBadge color="yellow">ANTI-SPOILER ATIVO</PopBadge>
						)}
					</div>
				</div>

				{/* Submissions List */}
				{ch.submissions && ch.submissions.length > 0 ? (
					<div className="space-y-4">
						{ch.submissions.map((sub) => {
							const members = [sub.member1, sub.member2, sub.member3].filter(
								(m): m is NonNullable<typeof m> => Boolean(m)
							);
							const isLocked = sub.isSpoilerLocked;

							return (
								<div
									className={`rounded-md border-2 p-3.5 transition sm:p-4 ${
										sub.isMyOwnPair
											? "border-[#FF4A1C] bg-[#FF4A1C]/5 shadow-hard-sm"
											: "border-black bg-card dark:border-white"
									}`}
									key={sub.id}
								>
									{/* Submission Header */}
									<div className="flex flex-col justify-between gap-2 border-black/10 border-b pb-2.5 sm:flex-row sm:items-center dark:border-white/10">
										<div className="flex items-center gap-2">
											<div className="flex -space-x-1.5 overflow-hidden">
												{members.map((m) =>
													m.gifUrl ? (
														<img
															alt={m.name}
															className="inline-block h-6 w-6 rounded-full border border-black object-cover dark:border-white"
															height={24}
															key={m.id}
															src={m.gifUrl}
															width={24}
														/>
													) : (
														<div
															className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-secondary font-black font-display text-[9px] uppercase dark:border-white"
															key={m.id}
														>
															{m.name.charAt(0)}
														</div>
													)
												)}
											</div>

											<div className="flex flex-wrap items-center gap-1.5">
												<span className="font-black font-display text-xs uppercase">
													{members.map((m) => m.name.split(" ")[0]).join(" & ")}
												</span>
												{sub.isMyOwnPair ? (
													<PopBadge color="neutral">SUA DUPLA</PopBadge>
												) : null}
											</div>
										</div>

										<div className="flex items-center gap-2 text-[10px] sm:text-xs">
											<span className="font-mono text-muted-foreground uppercase">
												{new Date(sub.updatedAt).toLocaleDateString("pt-BR", {
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
												})}
											</span>
											<PopBadge
												color={sub.status === "APPROVED" ? "green" : "neutral"}
											>
												{sub.status === "APPROVED" ? "APROVADO" : "SUBMETIDO"}
											</PopBadge>
										</div>
									</div>

									{/* Submission Content */}
									<div className="pt-3">
										{isLocked ? (
											/* Neo-brutalist "Documento Censurado" / anti-spoiler redacted block */
											<div className="relative overflow-hidden rounded-md border-2 border-black bg-[#121212] p-4 text-white shadow-hard dark:border-white dark:bg-[#0A0A0A]">
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div className="space-y-1.5">
														<div className="flex items-center gap-2">
															<span className="rounded-xs border border-white/40 bg-[#FF4A1C] px-1.5 py-0.5 font-black font-mono text-[9px] text-white uppercase tracking-wider">
																[ CONTEÚDO BLOQUEADO {"//"} ANTI-SPOILER ]
															</span>
														</div>
														<h4 className="font-black font-display text-white text-xs uppercase sm:text-sm">
															RESPOSTAS E ARQUIVOS OCULTOS
														</h4>
														<p className="max-w-md font-medium text-white/70 text-xs">
															O código, link de PR e anotações desta entrega
															foram tarjados de preto para evitar spoilers.
															Envie a solução da sua dupla para desbloquear.
														</p>
													</div>

													{myPair ? (
														<button
															className="btn-tactile shrink-0 rounded-md border-2 border-white bg-[#FF4A1C] px-3.5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10]"
															onClick={handleOpenSubmit}
															type="button"
														>
															SUBMETER MINHA SOLUÇÃO &rarr;
														</button>
													) : null}
												</div>
											</div>
										) : (
											/* Unlocked Solution Content */
											<div className="space-y-3 font-sans text-xs">
												{/* Link de PR ou Repositório */}
												<div className="flex flex-wrap items-center gap-2">
													{sub.prUrl ? (
														<a
															className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#1E40AF] px-3 py-1.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] dark:border-white"
															href={sub.prUrl}
															rel="noopener noreferrer"
															target="_blank"
														>
															<GitPullRequest className="h-3.5 w-3.5" />
															<span>VER PULL REQUEST &rarr;</span>
														</a>
													) : null}

													{sub.repoUrl ? (
														<a
															className="btn-tactile inline-flex items-center gap-1.5 rounded-md border border-black bg-secondary px-2.5 py-1.5 font-mono text-[11px] text-foreground hover:bg-muted dark:border-white"
															href={sub.repoUrl}
															rel="noopener noreferrer"
															target="_blank"
														>
															<ExternalLink className="h-3 w-3" />
															<span className="max-w-xs truncate">
																{sub.repoUrl}
															</span>
														</a>
													) : null}
												</div>

												{/* Notas e Explicações / Evidências */}
												{sub.submissionNotes ? (
													<div className="rounded-md border border-black/20 bg-secondary/30 p-3 dark:border-white/20">
														<span className="mb-1 block font-mono text-[10px] text-muted-foreground uppercase">
															NOTAS {"//"} EXPLICAÇÃO DA DUPLA:
														</span>
														<div className="font-mono text-xs leading-relaxed">
															{renderSubmissionNotes(sub.submissionNotes)}
														</div>
													</div>
												) : null}

												{/* Feedback do Assessor se houver */}
												{sub.feedback ? (
													<div className="rounded-md border border-emerald-600/40 bg-emerald-500/10 p-2.5 font-mono text-emerald-950 text-xs dark:text-emerald-300">
														<strong className="block font-bold text-[10px] uppercase">
															FEEDBACK DO ASSESSOR:
														</strong>
														<p className="mt-0.5">{sub.feedback}</p>
													</div>
												) : null}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="rounded-md border-2 border-black border-dashed bg-secondary/30 p-6 text-center dark:border-white">
						<span className="block font-black font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							[ NENHUMA DUPLA SUBMETEU AINDA ]
						</span>
						<p className="mt-1 font-sans text-muted-foreground text-xs">
							Assim que a primeira entrega for enviada pelos membros, ela
							aparecerá aqui.
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
					<form
						className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border-2 border-black bg-card shadow-hard-lg dark:border-white"
						onSubmit={handleSubmitSolution}
					>
						{/* Modal Header */}
						<div className="flex shrink-0 items-center justify-between border-black border-b-2 p-4 sm:p-5 dark:border-white">
							<div className="min-w-0 pr-2">
								<h3 className="truncate font-black font-display text-lg uppercase sm:text-xl">
									SUBMETER SOLUÇÃO // DUPLA
								</h3>
								<p className="truncate font-mono text-[11px] text-muted-foreground uppercase">
									DESAFIO: {ch.title}
								</p>
							</div>
							<button
								aria-label="Fechar modal"
								className="btn-tactile flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setIsSubmitModalOpen(false)}
								type="button"
							>
								X
							</button>
						</div>

						{/* Modal Scrollable Body */}
						<div className="flex-1 space-y-4 overflow-y-auto p-4 overscroll-contain sm:p-6">
							<div className="space-y-1.5">
								<span className="block font-black font-display text-xs uppercase tracking-wider">
									TIPO DE ENTREGA
								</span>
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
								{/* Attached evidences gallery */}
								{attachedEvidences.length > 0 && (
									<div className="space-y-1.5 rounded-md border-2 border-black bg-secondary/30 p-2.5 dark:border-white">
										<span className="block font-bold font-mono text-[10px] text-muted-foreground uppercase">
											Evidências Anexadas ({attachedEvidences.length}):
										</span>
										<div className="flex flex-wrap gap-2">
											{attachedEvidences.map((ev, idx) => (
												<div
													className="group relative flex items-center gap-2 rounded-md border border-black bg-background p-1.5 shadow-hard-xs dark:border-white"
													key={ev.url + String(idx)}
												>
													<img
														alt={ev.alt}
														className="h-10 w-10 rounded border border-black/20 object-cover dark:border-white/20"
														height={40}
														src={ev.url}
														width={40}
													/>
													<span className="max-w-[120px] truncate font-mono text-[10px]">
														{ev.alt || `Evidência #${idx + 1}`}
													</span>
													<button
														className="cursor-pointer p-1 text-muted-foreground hover:text-destructive"
														onClick={() => handleRemoveEvidence(ev.raw)}
														title="Remover anexo"
														type="button"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Dropzone Uploader */}
								<div className="space-y-1">
									<CloudinaryUploadButton
										folder="orcestra-submissoes"
										label="Arraste print/evidência ou clique para anexar"
										onUploadSuccess={(url) => {
											setSubmissionNotes((prev) =>
												prev
													? `${prev}\n\n![Evidência do Desafio](${url})`
													: `![Evidência do Desafio](${url})`
											);
											toast.success("Evidência anexada com sucesso!");
										}}
										variant="dropzone"
									/>
								</div>
							</div>
						</div>

						{/* Modal Pinned Footer */}
						<div className="flex shrink-0 items-center justify-end gap-2.5 border-black border-t-2 bg-muted/20 p-3 sm:p-4 dark:border-white">
							<button
								className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2.5 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
								onClick={() => setIsSubmitModalOpen(false)}
								type="button"
							>
								CANCELAR
							</button>

							<button
								className="btn-tactile flex-1 rounded-md border-2 border-black bg-[#FF4A1C] px-5 py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 sm:flex-initial dark:border-white"
								disabled={submitSolutionMutation.isPending}
								type="submit"
							>
								{submitSolutionMutation.isPending
									? "ENVIANDO..."
									: "CONFIRMAR & SUBMETER SOLUÇÃO"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Delete Challenge Confirmation Modal */}
			{isDeleteModalOpen && ch ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
					<div className="relative w-full max-w-md space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
						<div className="flex items-center gap-3 border-black border-b-2 pb-3 dark:border-white">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#DC2626] text-white shadow-hard-sm dark:border-white">
								<Trash2 className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-black font-display text-destructive text-lg uppercase dark:text-red-400">
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
								{ch.title}
							</div>
							<p className="font-mono text-[11px] text-muted-foreground">
								{(ch.totalPairs ?? 0) > 0 ? (
									<span>
										⚠️ Isso também excluirá permanentemente as{" "}
										<strong className="font-bold text-destructive dark:text-red-400">
											{ch.totalPairs} duplas/trios
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
								onClick={() => setIsDeleteModalOpen(false)}
								type="button"
							>
								CANCELAR
							</button>
							<button
								className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] disabled:opacity-50 dark:border-white"
								disabled={deleteChallengeMutation.isPending}
								onClick={() =>
									deleteChallengeMutation.mutate({ id: challengeId })
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
