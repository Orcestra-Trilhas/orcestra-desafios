"use client";

import type React from "react";

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
		<div className={`inline-flex items-center gap-2.5 ${className}`}>
			{/* Bauhaus / Fauve geometric icon: circle + triangle + bar */}
			<div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-[#FF4A1C] shadow-hard-sm dark:border-[#2E3658] dark:bg-[#F04D30]">
				<div className="h-3.5 w-3.5 rounded-full border-2 border-black bg-[#FACC15] dark:border-[#2E3658] dark:bg-[#F59E0B]" />
				<div className="absolute -top-1 -right-1 h-2.5 w-2.5 rotate-45 border-2 border-black bg-[#1E40AF] dark:border-[#2E3658] dark:bg-[#3B6FE8]" />
			</div>
			{!hideText && (
				<div
					className={`${hideTextOnMobile ? "hidden sm:flex" : "flex"} flex-col`}
				>
					<span className="font-black font-display text-base text-foreground lowercase tracking-tight">
						orc
						<span className="text-[#FF4A1C] dark:text-[#F04D30]">{"//"}</span>
						desafios
					</span>
					<span className="hidden font-bold text-[9px] text-muted-foreground uppercase tracking-widest sm:block">
						Missões & Desafios
					</span>
				</div>
			)}
		</div>
	);
}

export function PopBadge({
	children,
	color = "vermilion",
	className = "",
}: {
	children: React.ReactNode;
	color?: "vermilion" | "cobalt" | "yellow" | "green" | "black" | "neutral";
	className?: string;
}) {
	const colors = {
		black:
			"bg-[#121212] text-white border-black dark:bg-[#1C2142] dark:text-[#EDE8DD] dark:border-[#2E3658]",
		cobalt:
			"bg-[#1E40AF] text-white border-black dark:bg-[#3B6FE8] dark:text-white dark:border-[#3B6FE8]/50",
		green:
			"bg-[#15803D] text-white border-black dark:bg-[#10B981] dark:text-[#0B0E1E] dark:border-[#10B981]/50 font-black",
		neutral:
			"bg-secondary text-foreground border-black dark:bg-[#1C2142] dark:text-[#EDE8DD] dark:border-[#2E3658]",
		vermilion:
			"bg-[#FF4A1C] text-white border-black dark:bg-[#F04D30] dark:text-white dark:border-[#F04D30]/50",
		yellow:
			"bg-[#FACC15] text-[#121212] border-black dark:bg-[#F59E0B] dark:text-[#0B0E1E] dark:border-[#F59E0B]/50 font-black",
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
			bg: "bg-[#15803D] text-white border-black dark:bg-[#10B981] dark:text-[#0B0E1E] dark:border-[#10B981]/60 font-black",
			label: "APROVADO",
			rotation: "rotate-[-2deg]",
		},
		CHANGES_REQUESTED: {
			bg: "bg-[#DC2626] text-white border-black dark:bg-[#F04D30] dark:text-white dark:border-[#F04D30]/60",
			label: "AJUSTES REQUISITADOS",
			rotation: "rotate-[2deg]",
		},
		IN_PROGRESS: {
			bg: "bg-[#FACC15] text-[#121212] border-black dark:bg-[#F59E0B] dark:text-[#0B0E1E] dark:border-[#F59E0B]/60 font-black",
			label: "EM ANDAMENTO",
			rotation: "rotate-0",
		},
		SUBMITTED: {
			bg: "bg-[#1E40AF] text-white border-black dark:bg-[#3B6FE8] dark:text-white dark:border-[#3B6FE8]/60",
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
			className={`inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#FACC15] font-black text-[#121212] shadow-hard-sm dark:border-[#2E3658] dark:bg-[#F59E0B] dark:text-[#0B0E1E] ${sizeClasses}`}
		>
			<svg
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
			className={`btn-tactile inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-[#22C55E] px-2.5 py-1.5 font-black text-[#121212] text-xs shadow-hard-sm hover:bg-[#16A34A] hover:text-white sm:px-3 dark:border-[#2E3658] dark:bg-[#10B981] dark:text-[#0B0E1E] dark:hover:bg-[#059669] ${className}`}
			href={url}
			rel="noopener noreferrer"
			target="_blank"
			title={label}
		>
			<svg
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
		{ label: string; color: "vermilion" | "cobalt" | "yellow" | "green" }
	> = {
		BACK: { color: "cobalt", label: "BACKEND" },
		DEVOPS: { color: "yellow", label: "DEVOPS" },
		FRONT: { color: "vermilion", label: "FRONTEND" },
		GIT: { color: "black" as unknown as "green", label: "GIT // VCS" },
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
			className={`animate-pulse rounded-lg border-2 border-black bg-muted/40 p-4 shadow-hard dark:border-[#2E3658] ${className}`}
		>
			<div className="flex justify-between border-black/20 border-b-2 pb-3 dark:border-[#2E3658]/40">
				<div className="h-5 w-24 rounded bg-muted-foreground/30" />
				<div className="h-5 w-16 rounded bg-muted-foreground/30" />
			</div>
			<div className="mt-4 space-y-2">
				<div className="h-6 w-3/4 rounded bg-muted-foreground/40" />
				<div className="h-4 w-1/2 rounded bg-muted-foreground/20" />
			</div>
			<div className="mt-6 flex justify-between gap-3">
				<div className="h-10 flex-1 rounded border-2 border-black/10 bg-muted-foreground/20 dark:border-[#2E3658]/30" />
				<div className="h-10 flex-1 rounded border-2 border-black/10 bg-muted-foreground/20 dark:border-[#2E3658]/30" />
			</div>
		</div>
	);
}
