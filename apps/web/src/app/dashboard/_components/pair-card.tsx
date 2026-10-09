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
		<div className="space-y-4 rounded-lg border-2 border-black bg-card p-3.5 shadow-hard sm:space-y-5 sm:p-5 dark:border-white">
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
							status as
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
							{partners.length > 1 ? "SEU TRIO ALOCADO" : "SUA DUPLA TÉCNICA"}
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
						ETAPA {currentStep} DE 3
					</span>
				</div>

				{/* Bauhaus segmented bars with 2px borders */}
				<div className="grid grid-cols-3 gap-2">
					<div
						className={`h-3 rounded-xs border-2 border-black dark:border-white ${
							currentStep >= 1 ? "bg-primary" : "bg-muted"
						}`}
					/>
					<div
						className={`h-3 rounded-xs border-2 border-black dark:border-white ${
							currentStep >= 2 ? "bg-primary" : "bg-muted"
						}`}
					/>
					<div
						className={`h-3 rounded-xs border-2 border-black dark:border-white ${stepThreeColor}`}
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
});
