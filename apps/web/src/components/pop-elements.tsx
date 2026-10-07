"use client";

import type React from "react";

import { OrcLogo } from "./orc-logo";

export function PopLogo({
	className = "h-8",
	hideText = false,
	hideTextOnMobile = false,
}: {
	className?: string;
	hideText?: boolean;
	hideTextOnMobile?: boolean;
}) {
	return (
		<OrcLogo
			className={className}
			hideText={hideText}
			hideTextOnMobile={hideTextOnMobile}
		/>
	);
}

export function PopBadge({
	children,
	color = "vermilion",
	className = "",
}: {
	children: React.ReactNode;
	color?:
		| "vermilion"
		| "cobalt"
		| "yellow"
		| "green"
		| "purple"
		| "black"
		| "neutral";
	className?: string;
}) {
	const colors = {
		black:
			"bg-[#18181b] text-white border-black dark:border-white dark:bg-card dark:text-foreground",
		cobalt:
			"bg-[#1E40AF] text-white border-black dark:border-white dark:bg-[#2563EB] dark:text-white",
		green:
			"bg-[#15803D] text-white border-black dark:border-white dark:bg-[#16A34A] dark:text-white font-bold",
		neutral:
			"bg-secondary text-secondary-foreground border-black dark:border-white",
		purple:
			"bg-[#7C3AED] text-white border-black dark:border-white dark:bg-[#8B5CF6] dark:text-white font-bold",
		vermilion:
			"bg-[#EA580C] text-white border-black dark:border-white dark:bg-[#EA580C] dark:text-white",
		yellow:
			"bg-[#FACC15] text-[#121212] border-black dark:border-white dark:bg-[#F59E0B] dark:text-[#121212] font-black",
	};

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-md border-2 px-2.5 py-0.5 font-bold text-[11px] uppercase tracking-wider shadow-hard-sm ${colors[color]} ${className}`}
		>
			{children}
		</span>
	);
}

export function PopStamp({
	status,
	className = "",
}: {
	status: "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CHANGES_REQUESTED";
	className?: string;
}) {
	const config = {
		APPROVED: {
			bg: "bg-[#15803D] text-white border-black dark:border-white dark:bg-[#16A34A] dark:text-white font-black",
			label: "APROVADO",
			rotation: "rotate-[-2deg]",
		},
		CHANGES_REQUESTED: {
			bg: "bg-[#DC2626] text-white border-black dark:border-white dark:bg-[#EF4444] dark:text-white",
			label: "AJUSTES REQUISITADOS",
			rotation: "rotate-[2deg]",
		},
		IN_PROGRESS: {
			bg: "bg-[#FACC15] text-[#121212] border-black dark:border-white dark:bg-[#F59E0B] dark:text-[#121212] font-black",
			label: "EM ANDAMENTO",
			rotation: "rotate-0",
		},
		SUBMITTED: {
			bg: "bg-[#1E40AF] text-white border-black dark:border-white dark:bg-[#2563EB] dark:text-white",
			label: "SUBMETIDO",
			rotation: "rotate-[-1deg]",
		},
	}[status];

	return (
		<span
			className={`inline-block rounded-sm border-2 px-3 py-1 font-black text-xs uppercase tracking-wider shadow-hard-sm ${config.rotation} ${config.bg} ${className}`}
		>
			{config.label}
		</span>
	);
}

export function PopPointsBadge({
	points,
	size = "md",
}: {
	points: number;
	size?: "sm" | "md" | "lg";
}) {
	const sizeClasses = {
		lg: "px-4 py-2 text-xl",
		md: "px-3 py-1.5 text-sm",
		sm: "px-2 py-0.5 text-xs",
	}[size];

	return (
		<div
			className={`inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#FACC15] font-black text-[#121212] shadow-hard-sm dark:border-white dark:bg-[#F59E0B] dark:text-[#121212] ${sizeClasses}`}
		>
			<svg
				aria-hidden="true"
				className="h-4 w-4 fill-current"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<polygon points="12,2 22,12 12,22 2,12" />
			</svg>
			<span>{points} PTS</span>
		</div>
	);
}

export function PopWhatsAppButton({
	phone,
	message,
	label = "Chamar no WhatsApp",
	compactOnMobile = true,
	className = "",
}: {
	phone: string | null | undefined;
	message: string;
	label?: string;
	compactOnMobile?: boolean;
	className?: string;
}) {
	if (!phone) {
		return (
			<span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-muted-foreground/50 border-dashed px-2 py-1 font-bold text-[10px] text-muted-foreground sm:text-[11px]">
				<span className={compactOnMobile ? "hidden sm:inline" : ""}>
					Sem WhatsApp
				</span>
				<span className={compactOnMobile ? "sm:hidden" : "hidden"}>Sem WA</span>
			</span>
		);
	}

	const cleanPhone = phone.replace(/\D/g, "");
	const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

	return (
		<a
			aria-label={label}
			className={`btn-tactile inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-[#15803D] px-2.5 py-1.5 font-black text-white text-xs shadow-hard-sm hover:bg-[#16A34A] sm:px-3 dark:border-white dark:bg-[#16A34A] dark:text-white dark:hover:bg-[#15803D] ${className}`}
			href={url}
			rel="noopener noreferrer"
			target="_blank"
			title={label}
		>
			<svg
				aria-hidden="true"
				className="h-3.5 w-3.5 shrink-0 fill-current sm:h-4 sm:w-4"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z"
					stroke="currentColor"
					strokeWidth="1"
				/>
			</svg>
			<span className={compactOnMobile ? "hidden sm:inline" : ""}>{label}</span>
		</a>
	);
}

export function PopTrackBadge({
	track,
	className = "",
}: {
	track: string;
	className?: string;
}) {
	const map: Record<
		string,
		{
			label: string;
			color: "vermilion" | "cobalt" | "yellow" | "green" | "purple";
		}
	> = {
		BACK: { color: "cobalt", label: "BACKEND" },
		DEVOPS: { color: "yellow", label: "DEVOPS" },
		FRONT: { color: "vermilion", label: "FRONTEND" },
		GIT: { color: "purple", label: "GIT // VCS" },
		PROTOTIPACAO: { color: "green", label: "PROTÓTIPO" },
	};

	const conf = map[track] ?? { color: "vermilion", label: track };

	return (
		<PopBadge className={className} color={conf.color}>
			{conf.label}
		</PopBadge>
	);
}

export function BauhausSkeleton({
	className = "h-40",
}: {
	className?: string;
}) {
	return (
		<div
			className={`animate-pulse rounded-lg border-2 border-black bg-muted/40 p-4 shadow-hard dark:border-white/20 ${className}`}
		>
			<div className="flex justify-between border-black/20 border-b-2 pb-3 dark:border-white/20">
				<div className="h-5 w-24 rounded bg-muted-foreground/30" />
				<div className="h-5 w-16 rounded bg-muted-foreground/30" />
			</div>
			<div className="mt-4 space-y-2">
				<div className="h-6 w-3/4 rounded bg-muted-foreground/40" />
				<div className="h-4 w-1/2 rounded bg-muted-foreground/20" />
			</div>
			<div className="mt-6 flex justify-between gap-3">
				<div className="h-10 flex-1 rounded border-2 border-black/10 bg-muted-foreground/20 dark:border-white/20" />
				<div className="h-10 flex-1 rounded border-2 border-black/10 bg-muted-foreground/20 dark:border-white/20" />
			</div>
		</div>
	);
}
