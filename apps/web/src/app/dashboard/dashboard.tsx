"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
	BauhausSkeleton,
	PopPointsBadge,
	PopStamp,
	PopTrackBadge,
	PopWhatsAppButton,
} from "@/components/pop-elements";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function formatDaysRemaining(deadline: string | Date) {
	const diff = new Date(deadline).getTime() - Date.now();
	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	if (days < 0) {
		return { label: "EXPIRADO", urgent: true };
	}
	if (days === 0) {
		return { label: "HOJE!", urgent: true };
	}
	if (days === 1) {
		return { label: "1 DIA RESTANTE", urgent: true };
	}
	return { label: `${days} DIAS RESTANTES`, urgent: days <= 3 };
}

export default function Dashboard() {
	const { data: session } = authClient.useSession();
	const userMe = useQuery(trpc.user.me.queryOptions());
	const myPairs = useQuery(trpc.challenge.myPairs.queryOptions());
	const activeChallenges = useQuery(trpc.challenge.listActive.queryOptions());

	const [showExplorer, setShowExplorer] = useState(false);

	const currentUser = userMe.data ?? session?.user;
	const points =
		userMe.data?.points ?? (session?.user as { points?: number }).points ?? 0;

	return (
		<div className="mx-auto max-w-3xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
			{/* PWA Install Banner */}
			<PwaInstallBanner />

			{/* Bauhaus / Fauvist Poster Banner */}
			<div className="relative overflow-hidden rounded-lg border-2 border-black bg-[#121212] p-4 text-white shadow-hard sm:p-6 dark:border-white dark:bg-card dark:text-foreground">
				{/* Color geometric accent strip */}
				<div className="absolute top-0 right-0 left-0 h-1.5 bg-primary" />

				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
					<div className="space-y-1.5 sm:space-y-2">
						<h1 className="font-black font-display text-xl uppercase tracking-tight sm:text-3xl">
							OLÁ, {currentUser?.name?.split(" ")[0] ?? "MEMBRO"}
						</h1>
						<p className="max-w-md font-medium text-white/70 text-xs dark:text-muted-foreground">
							Trabalhe com sua dupla, sincronize no WhatsApp e submeta os
							checkpoints técnicos da rodada.
						</p>
					</div>

					<div className="flex items-center justify-between gap-2.5 sm:justify-start sm:gap-3">
						<PopPointsBadge points={points} size="md" />

						<button
							className="btn-tactile flex-1 rounded-md border-2 border-black bg-primary px-3.5 py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 sm:flex-initial sm:px-4 dark:border-white"
							onClick={() => setShowExplorer(true)}
							type="button"
						>
							EXPLORAR DESAFIOS
						</button>
					</div>
				</div>
			</div>

			{/* Section Header */}
			<div className="flex items-center justify-between border-black border-b-2 pb-2 dark:border-white">
				<div className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
					<h2 className="font-black font-display text-base uppercase tracking-tight sm:text-lg">
						MEUS DESAFIOS ATIVOS {"//"} MISSÕES
					</h2>
				</div>
				<span className="font-bold font-mono text-[10px] text-muted-foreground sm:text-xs">
					[{myPairs.data?.length ?? 0} EM ANDAMENTO]
				</span>
			</div>

			{/* Active Pairs List */}
			{myPairs.isLoading ? (
				<div className="space-y-4">
					<BauhausSkeleton />
					<BauhausSkeleton />
				</div>
			) : myPairs.data && myPairs.data.length > 0 ? (
				<div className="space-y-6">
					{myPairs.data.map((p) => {
						const ch = p.challenge;
						if (!ch) {
							return null;
						}
						const deadlineInfo = formatDaysRemaining(ch.deadline);
						const partners = p.partners;
						const assessor = p.assessor;

						return (
							<div
								className="space-y-4 rounded-lg border-2 border-black bg-card p-3.5 shadow-hard sm:space-y-5 sm:p-5 dark:border-white"
								key={p.id}
							>
								{/* Card Header */}
								<div className="flex flex-col justify-between gap-3 border-black/10 border-b-2 pb-3.5 sm:flex-row sm:items-start sm:pb-4 dark:border-white/10">
									<div className="space-y-1.5">
										<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
											<PopTrackBadge track={ch.trackTheme} />
											<span
												className={`rounded-md border-2 px-2 py-0.5 font-bold font-mono text-[10px] uppercase sm:text-[11px] ${
													deadlineInfo.urgent
														? "border-black bg-[#DC2626] text-white dark:border-white"
														: "border-black bg-secondary text-foreground dark:border-white"
												}`}
											>
												PRAZO: {deadlineInfo.label}
											</span>
											<span className="rounded-md border-2 border-black bg-[#FACC15] px-2 py-0.5 font-black font-mono text-[#121212] text-[10px] sm:text-[11px] dark:border-white">
												+{ch.pointsReward} PTS
											</span>
										</div>
										<Link
											className="block font-black font-display text-base uppercase tracking-tight hover:text-[#FF4A1C] sm:text-xl"
											href={`/challenges/${ch.id}`}
										>
											{ch.title}
										</Link>
									</div>

									<div className="flex items-center justify-between gap-2 pt-0.5 sm:justify-end sm:pt-0">
										<PopStamp
											status={
												p.status as
													| "IN_PROGRESS"
													| "SUBMITTED"
													| "APPROVED"
													| "CHANGES_REQUESTED"
											}
										/>
										<Link
											className="btn-tactile rounded-md border-2 border-black bg-foreground px-3 py-1 font-bold font-display text-background text-xs uppercase dark:border-white"
											href={`/challenges/${ch.id}`}
										>
											DETALHES &rarr;
										</Link>
									</div>
								</div>

								{/* Dupla & Assessor Blocks */}
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
									{/* Dupla Block */}
									<div className="flex flex-col justify-between rounded-md border-2 border-black bg-secondary/40 p-3 sm:p-4 dark:border-white">
										<div className="mb-2.5 flex items-center justify-between border-black/20 border-b pb-1.5 dark:border-white/20">
											<span className="font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
												{partners.length > 1
													? "SEU TRIO ALOCADO"
													: "SUA DUPLA TÉCNICA"}
											</span>
											<span className="font-bold font-mono text-[9px] text-muted-foreground sm:text-[10px]">
												[PARCEIRO]
											</span>
										</div>

										<div className="space-y-2.5 sm:space-y-3">
											{partners.map((partner) => {
												const zapMsg = `Olá ${partner.name}! Vamos alinhar nosso desafio "${ch.title}" no orc//desafios?`;
												return (
													<div
														className="flex items-center justify-between gap-2"
														key={partner.id}
													>
														<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
															<Link
																className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-[#1E40AF] font-black text-white text-xs transition hover:opacity-80 sm:h-8 sm:w-8 dark:border-white"
																href={`/profile?id=${partner.id}`}
																title={`Ver perfil de ${partner.name}`}
															>
																{partner.name.charAt(0)}
															</Link>
															<div className="flex min-w-0 flex-col">
																<Link
																	className="truncate font-bold font-display text-xs uppercase hover:text-[#FF4A1C] hover:underline"
																	href={`/profile?id=${partner.id}`}
																>
																	{partner.name}
																</Link>
																<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
																	{partner.department}
																</span>
															</div>
														</div>

														<PopWhatsAppButton
															label="WHATSAPP"
															message={zapMsg}
															phone={partner.whatsapp}
														/>
													</div>
												);
											})}
										</div>
									</div>

									{/* Assessor Block */}
									<div className="flex flex-col justify-between rounded-md border-2 border-black bg-secondary/40 p-3 sm:p-4 dark:border-white">
										<div className="mb-2.5 flex items-center justify-between border-black/20 border-b pb-1.5 dark:border-white/20">
											<span className="font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
												ASSESSOR RESPONSÁVEL
											</span>
											<span className="font-bold font-mono text-[9px] text-muted-foreground sm:text-[10px]">
												[MENTOR]
											</span>
										</div>

										{assessor ? (
											<div className="flex items-center justify-between gap-2">
												<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
													<Link
														className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-[#FACC15] font-black text-[#121212] text-xs transition hover:opacity-80 sm:h-8 sm:w-8 dark:border-white"
														href={`/profile?id=${assessor.id}`}
														title={`Ver perfil de ${assessor.name}`}
													>
														{assessor.name.charAt(0)}
													</Link>
													<div className="flex min-w-0 flex-col">
														<Link
															className="truncate font-bold font-display text-xs uppercase hover:text-[#FF4A1C] hover:underline"
															href={`/profile?id=${assessor.id}`}
														>
															{assessor.name}
														</Link>
														<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
															{assessor.department}
														</span>
													</div>
												</div>

												<PopWhatsAppButton
													label="DÚVIDAS"
													message={`Oi ${assessor.name}! Sou da dupla do desafio "${ch.title}" no orc//desafios e gostaríamos de tirar uma dúvida técnica.`}
													phone={assessor.whatsapp}
												/>
											</div>
										) : (
											<span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
												[ASSESSOR EM ALOCAÇÃO]
											</span>
										)}
									</div>
								</div>

								{/* Segmented Stepper */}
								<div className="space-y-2 border-black/10 border-t-2 pt-3 dark:border-white/10">
									<div className="flex items-center justify-between">
										<span className="font-bold font-display text-xs uppercase tracking-wider">
											PROGRESSO TÉCNICO DA DUPLA
										</span>
										<span className="font-black font-mono text-xs">
											ETAPA {p.currentStep} DE 3
										</span>
									</div>

									{/* Bauhaus segmented bars with 2px borders */}
									<div className="grid grid-cols-3 gap-2">
										<div
											className={`h-3 rounded-xs border-2 border-black dark:border-white ${
												p.currentStep >= 1 ? "bg-primary" : "bg-muted"
											}`}
										/>
										<div
											className={`h-3 rounded-xs border-2 border-black dark:border-white ${
												p.currentStep >= 2 ? "bg-primary" : "bg-muted"
											}`}
										/>
										<div
											className={`h-3 rounded-xs border-2 border-black dark:border-white ${
												p.status === "APPROVED"
													? "bg-[#15803D] dark:bg-[#16A34A]"
													: p.currentStep >= 3
														? "bg-[#FACC15] dark:bg-[#F59E0B]"
														: "bg-muted"
											}`}
										/>
									</div>

									<div className="flex justify-between font-mono text-[10px] text-muted-foreground uppercase">
										<span>01. ALINHAMENTO</span>
										<span className="text-center">02. SUBMISSÃO PR</span>
										<span className="text-right">03. AVALIAÇÃO</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				/* Empty State */
				<div className="space-y-4 rounded-lg border-2 border-black border-dashed bg-card p-8 text-center shadow-hard dark:border-white">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[#FACC15] font-black text-2xl text-black shadow-hard-sm dark:border-white">
						!
					</div>
					<div className="space-y-1">
						<h3 className="font-black font-display text-lg uppercase">
							NENHUMA DUPLA ATIVA NA RODADA
						</h3>
						<p className="mx-auto max-w-sm font-medium text-muted-foreground text-xs">
							O sorteio das duplas ocorre após o fechamento das inscrições de
							cada missão.
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
						<button
							className="btn-tactile rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] dark:border-white"
							onClick={() => setShowExplorer(true)}
							type="button"
						>
							EXPLORAR DESAFIOS
						</button>
						<Link
							className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-bold font-display text-foreground text-xs uppercase shadow-hard-sm dark:border-white"
							href="/profile"
						>
							PREFERÊNCIAS NO PERFIL
						</Link>
					</div>
				</div>
			)}

			{/* Explorer Modal */}
			{showExplorer && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
					<div className="relative max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-card p-6 shadow-hard-lg dark:border-white">
						<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
							<div>
								<h3 className="font-black font-display text-xl uppercase">
									DESAFIOS ABERTOS // EJ
								</h3>
								<p className="font-mono text-muted-foreground text-xs">
									[MATERIAIS & REGRAS MKDOCS]
								</p>
							</div>
							<button
								className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
								onClick={() => setShowExplorer(false)}
								type="button"
							>
								X
							</button>
						</div>

						<div className="space-y-4">
							{activeChallenges.data?.map((ch) => (
								<div
									className="space-y-2.5 rounded-md border-2 border-black bg-secondary/30 p-4 shadow-hard-sm dark:border-white"
									key={ch.id}
								>
									<div className="flex items-center justify-between">
										<PopTrackBadge track={ch.trackTheme} />
										<span className="rounded-md border-2 border-black bg-[#FACC15] px-2 py-0.5 font-black font-mono text-[#121212] text-[11px] dark:border-white">
											+{ch.pointsReward} PTS
										</span>
									</div>

									<h4 className="font-black font-display text-base uppercase">
										{ch.title}
									</h4>
									<p className="line-clamp-2 font-medium text-muted-foreground text-xs">
										{ch.description}
									</p>

									<div className="flex items-center justify-between border-black/10 border-t-2 pt-3 text-xs dark:border-white/10">
										{ch.mkdocsUrl ? (
											<a
												className="font-black font-display text-xs uppercase hover:underline"
												href={ch.mkdocsUrl}
												rel="noopener noreferrer"
												target="_blank"
											>
												VER NO MKDOCS &rarr;
											</a>
										) : (
											<span className="font-mono text-[10px] text-muted-foreground">
												[SEM DOC EXTERNA]
											</span>
										)}

										<Link
											className="btn-tactile rounded-md border-2 border-black bg-foreground px-3 py-1 font-black font-display text-background text-xs uppercase shadow-hard-sm dark:border-white"
											href={`/challenges/${ch.id}`}
											onClick={() => setShowExplorer(false)}
										>
											DETALHES
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
