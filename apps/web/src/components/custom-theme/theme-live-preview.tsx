"use client";

import { memo } from "react";
import { ORC_MASK_PATH } from "@/components/orc-logo";
import type { CustomThemeConfig } from "@/lib/custom-theme";

interface ThemeLivePreviewProps {
	previewBadgeHighlightFg: string;
	previewBadgeStatusFg: string;
	previewPrimaryFg: string;
	previewSecondaryFg: string;
	theme: CustomThemeConfig;
}

export const ThemeLivePreview = memo(function ThemeLivePreviewRender({
	previewBadgeHighlightFg,
	previewBadgeStatusFg,
	previewPrimaryFg,
	previewSecondaryFg,
	theme,
}: ThemeLivePreviewProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="font-black font-display text-muted-foreground text-xs uppercase tracking-wider">
					PRÉ-VISUALIZAÇÃO AO VIVO
				</span>
				<span className="font-mono text-[10px] text-muted-foreground uppercase">
					Modo: {theme.baseMode.toUpperCase()}
				</span>
			</div>
			<div
				className="rounded-lg p-3 transition-colors sm:p-4"
				style={{
					backgroundColor: theme.background,
					borderColor: theme.border,
					borderStyle: "solid",
					borderWidth: "2px",
					color: theme.foreground,
				}}
			>
				{/* Header simulado com Logo dinâmico */}
				<div
					className="mb-3 flex items-center justify-between border-b pb-2.5"
					style={{ borderColor: theme.border }}
				>
					<div className="flex items-center gap-2">
						<div
							className="flex h-7 w-7 items-center justify-center rounded-sm border-2"
							style={{
								backgroundColor: theme.primary,
								borderColor: theme.border,
								boxShadow: `2px 2px 0px ${theme.border}`,
							}}
						>
							<svg
								aria-hidden="true"
								className="h-5 w-5"
								viewBox="0 0 200 200"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d={ORC_MASK_PATH}
									fill={previewPrimaryFg}
									fillRule="evenodd"
								/>
							</svg>
						</div>
						<span className="font-black font-display text-xs lowercase tracking-tight">
							orc<span className="opacity-60">{"//"}</span>desafios
						</span>
					</div>

					{/* Badge de Pontos no header */}
					<div
						className="inline-flex items-center gap-1 rounded-md border-2 px-2 py-0.5 font-black font-display text-[10px]"
						style={{
							backgroundColor: theme.badgeHighlight ?? theme.primary,
							borderColor: theme.border,
							boxShadow: `1.5px 1.5px 0px ${theme.border}`,
							color: previewBadgeHighlightFg,
						}}
					>
						<span>⚡ 150 PTS</span>
					</div>
				</div>

				{/* Card de Conteúdo do Tema */}
				<div
					className="rounded-md p-3.5"
					style={{
						backgroundColor: theme.card,
						borderColor: theme.border,
						borderStyle: "solid",
						borderWidth: "2px",
						boxShadow: `3px 3px 0px ${theme.border}`,
						color: theme.cardForeground ?? theme.foreground,
					}}
				>
					<div className="space-y-3">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h4
									className="font-black font-display text-sm uppercase"
									style={{ color: theme.cardForeground ?? theme.foreground }}
								>
									{theme.name || "TEMA EM BRANCO"}
								</h4>
								<p
									className="font-medium text-[11px]"
									style={{
										color:
											theme.mutedForeground ||
											(theme.baseMode === "dark" ? "#A1A1AA" : "#71717A"),
									}}
								>
									[Nenhum selo conquistado ainda. Submeta desafios para
									desbloquear!]
								</p>
							</div>

							{/* Badge de Status no card */}
							<span
								className="inline-block rounded-sm border-2 px-2 py-0.5 font-black text-[10px] uppercase"
								style={{
									backgroundColor:
										theme.badgeStatus ?? theme.secondary ?? "#18181B",
									borderColor: theme.border,
									boxShadow: `1.5px 1.5px 0px ${theme.border}`,
									color: previewBadgeStatusFg,
								}}
							>
								APROVADO
							</span>
						</div>

						{/* Seção de Botões */}
						<div
							className="flex flex-wrap items-center gap-2 border-t pt-2"
							style={{ borderColor: theme.border }}
						>
							<button
								className="rounded-md px-3 py-1.5 font-black font-display text-xs uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5"
								style={{
									backgroundColor: theme.primary,
									borderColor: theme.border,
									borderStyle: "solid",
									borderWidth: "2px",
									boxShadow: `2px 2px 0px ${theme.border}`,
									color: previewPrimaryFg,
								}}
								type="button"
							>
								BOTÃO PRIMÁRIO
							</button>

							<button
								className="rounded-md px-3 py-1.5 font-black font-display text-xs uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5"
								style={{
									backgroundColor: theme.secondary ?? "#18181B",
									borderColor: theme.border,
									borderStyle: "solid",
									borderWidth: "2px",
									boxShadow: `2px 2px 0px ${theme.border}`,
									color: previewSecondaryFg,
								}}
								type="button"
							>
								SECUNDÁRIO
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});
