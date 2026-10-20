"use client";

import Link from "next/link";
import { memo } from "react";
import {
	PopStamp,
	PopTrackBadge,
	PopWhatsAppButton,
} from "@/components/pop-elements";
import type { DashboardPair } from "./types";

interface PairCardProps {
	pair: DashboardPair;
}

function formatDaysRemaining(deadline: Date | string) {
	const target = new Date(deadline);
	const now = new Date();
	const diffTime = target.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return { label: "EXPIRADO", urgent: true };
	}
	if (diffDays === 0) {
		return { label: "HOJE", urgent: true };
	}
	if (diffDays <= 2) {
		return { label: `${diffDays}D RESTANTES`, urgent: true };
	}
	return { label: `${diffDays} DIAS`, urgent: false };
}

function getPartnersTitle(count: number): string {
	if (count > 1) {
		return "SEU TRIO ALOCADO";
	}
	if (count === 1) {
		return "SUA DUPLA TÉCNICA";
	}
	return "DESAFIO INDIVIDUAL";
}

function getStepThreeColor(status: string, currentStep: number): string {
	if (status === "APPROVED") {
		return "bg-[#15803D] dark:bg-[#16A34A]";
	}
	if (currentStep >= 3) {
		return "bg-[#FACC15] dark:bg-[#F59E0B]";
	}
	return "bg-muted";
}

export const PairCard = memo(function PairCardRender({ pair }: PairCardProps) {
	const { challenge: ch, partners, assessor, status, currentStep } = pair;
	if (!ch) {
		return null;
	}

	const deadlineInfo = formatDaysRemaining(ch.deadline);
	const stepThreeColor = getStepThreeColor(status, currentStep);

	return (
		<div className="space-y-4 rounded-lg border-2 border-border bg-card p-3.5 shadow-hard sm:space-y-5 sm:p-5">
			{/* Card Header */}
			<div className="flex flex-col justify-between gap-3 border-border/10 border-b-2 pb-3.5 sm:flex-row sm:items-start sm:pb-4">
				<div className="min-w-0 flex-1 space-y-1.5">
					<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
						<PopTrackBadge track={ch.trackTheme} />
						<span
							className={`rounded-md border-2 px-2 py-0.5 font-bold font-mono text-[10px] uppercase sm:text-[11px] ${
								deadlineInfo.urgent
									? "border-border bg-[#DC2626] text-white"
									: "border-border bg-secondary text-foreground"
							}`}
						>
							PRAZO: {deadlineInfo.label}
						</span>
						<span className="rounded-md border-2 border-border bg-[#FACC15] px-2 py-0.5 font-black font-mono text-[#121212] text-[10px] sm:text-[11px]">
							+{ch.pointsReward} PTS
						</span>
					</div>
					<Link
						className="block min-w-0 max-w-full truncate font-black font-display text-sm uppercase tracking-tight hover:text-primary sm:text-base"
						href={`/challenges/${ch.id}`}
						title={ch.title}
					>
						{ch.title}
					</Link>
				</div>

				<div className="flex shrink-0 items-center justify-between gap-2 pt-0.5 sm:justify-end sm:pt-0">
					<PopStamp
						status={
							status as
								| "IN_PROGRESS"
								| "SUBMITTED"
								| "APPROVED"
								| "CHANGES_REQUESTED"
						}
					/>
					<Link
						className="btn-tactile rounded-md border-2 border-border bg-foreground px-3 py-1 font-bold font-display text-background text-xs uppercase"
						href={`/challenges/${ch.id}`}
					>
						DETALHES &rarr;
					</Link>
				</div>
			</div>

			{/* Dupla & Assessor Blocks */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				{/* Dupla Block */}
				<div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-md border-2 border-border bg-secondary/40 p-3 sm:p-4">
					<div className="mb-2.5 flex items-center justify-between border-border/20 border-b pb-1.5">
						<span className="truncate font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
							{getPartnersTitle(partners.length)}
						</span>
						<span className="shrink-0 font-bold font-mono text-[9px] text-muted-foreground sm:text-[10px]">
							{partners.length === 0 ? "[SOLO]" : "[PARCEIRO]"}
						</span>
					</div>

					<div className="space-y-2.5 sm:space-y-3">
						{partners.length === 0 ? (
							<div className="rounded border border-border/40 bg-background/50 p-2.5 font-mono text-muted-foreground text-xs leading-relaxed">
								Desafio individual. Você é o único participante alocado nesta
								missão.
							</div>
						) : (
							partners.map((partner) => {
								const zapMsg = `Olá ${partner.name}! Vamos alinhar nosso desafio "${ch.title}" no orc//desafios?`;
								return (
									<div
										className="flex min-w-0 items-center justify-between gap-2 overflow-hidden"
										key={partner.id}
									>
										<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
											<Link
												className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-border bg-primary font-black text-primary-foreground text-xs transition hover:opacity-80 sm:h-8 sm:w-8"
												href={`/profile?id=${partner.id}`}
												title={`Ver perfil de ${partner.name}`}
											>
												{partner.name.charAt(0)}
											</Link>
											<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
												<Link
													className="truncate font-bold font-display text-xs uppercase hover:text-primary hover:underline"
													href={`/profile?id=${partner.id}`}
													title={partner.name}
												>
													{partner.name}
												</Link>
												<span className="truncate font-mono text-[9px] text-muted-foreground sm:text-[10px]">
													{partner.department}
												</span>
											</div>
										</div>

										<PopWhatsAppButton
											className="shrink-0"
											label="WHATSAPP"
											message={zapMsg}
											phone={partner.whatsapp}
										/>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Assessor Block */}
				<div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-md border-2 border-border bg-secondary/40 p-3 sm:p-4">
					<div className="mb-2.5 flex items-center justify-between border-border/20 border-b pb-1.5">
						<span className="truncate font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
							ASSESSOR RESPONSÁVEL
						</span>
						<span className="shrink-0 font-bold font-mono text-[9px] text-muted-foreground sm:text-[10px]">
							[MENTOR]
						</span>
					</div>

					{assessor ? (
						<div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden">
							<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
								<Link
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-border bg-[#FACC15] font-black text-[#121212] text-xs transition hover:opacity-80 sm:h-8 sm:w-8"
									href={`/profile?id=${assessor.id}`}
									title={`Ver perfil de ${assessor.name}`}
								>
									{assessor.name.charAt(0)}
								</Link>
								<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
									<Link
										className="truncate font-bold font-display text-xs uppercase hover:text-primary hover:underline"
										href={`/profile?id=${assessor.id}`}
										title={assessor.name}
									>
										{assessor.name}
									</Link>
									<span className="truncate font-mono text-[9px] text-muted-foreground sm:text-[10px]">
										{assessor.department}
									</span>
								</div>
							</div>

							<PopWhatsAppButton
								className="shrink-0"
								label="WHATSAPP"
								message={`Olá ${assessor.name}! Tenho uma dúvida sobre o desafio "${ch.title}".`}
								phone={assessor.whatsapp}
							/>
						</div>
					) : (
						<p className="font-mono text-muted-foreground text-xs uppercase">
							Aguardando definição de assessor
						</p>
					)}
				</div>
			</div>

			{/* Checkpoint Stepper Mini Indicator */}
			<div className="space-y-2 border-border/10 border-t-2 pt-3 sm:space-y-2.5 sm:pt-3.5">
				<div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
					<span className="font-bold text-muted-foreground uppercase">
						{partners.length === 0
							? "PROGRESSO INDIVIDUAL"
							: "PROGRESSO DA DUPLA"}
					</span>
					<span className="font-black text-foreground">
						ETAPA {currentStep} DE 3
					</span>
				</div>

				<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
					<div
						className={`h-2 rounded-sm border border-border transition-all ${
							currentStep >= 1 ? "bg-primary" : "bg-muted"
						}`}
						title="Etapa 1: Início"
					/>
					<div
						className={`h-2 rounded-sm border border-border transition-all ${
							currentStep >= 2 ? "bg-primary" : "bg-muted"
						}`}
						title="Etapa 2: Submissão"
					/>
					<div
						className={`h-2 rounded-sm border border-border transition-all ${stepThreeColor}`}
						title="Etapa 3: Aprovação"
					/>
				</div>
			</div>
		</div>
	);
});
