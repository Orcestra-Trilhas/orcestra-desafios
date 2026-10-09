"use client";

import { memo } from "react";
import type { CustomThemeConfig } from "@/lib/custom-theme";

interface ThemeLivePreviewProps {
	previewPrimaryFg: string;
	theme: CustomThemeConfig;
}

export const ThemeLivePreview = memo(function ThemeLivePreviewRender({
	previewPrimaryFg,
	theme,
}: ThemeLivePreviewProps) {
	return (
		<div className="space-y-2">
			<span className="font-black font-display text-muted-foreground text-xs uppercase tracking-wider">
				PRÉ-VISUALIZAÇÃO AO VIVO
			</span>
			<div
				className="rounded-lg p-4 transition-colors"
				style={{
					backgroundColor: theme.background,
					borderColor: theme.border,
					borderStyle: "solid",
					borderWidth: "2px",
					color: theme.foreground,
				}}
			>
				<div
					className="rounded-md p-3.5"
					style={{
						backgroundColor: theme.card,
						borderColor: theme.border,
						borderStyle: "solid",
						borderWidth: "2px",
						boxShadow: `3px 3px 0px ${theme.border}`,
					}}
				>
					<div className="flex items-center justify-between gap-3">
						<div>
							<h4
								className="font-black font-display text-sm uppercase"
								style={{ color: theme.foreground }}
							>
								{theme.name || "SEU TEMA"}
							</h4>
							<p
								className="font-medium text-xs opacity-80"
								style={{ color: theme.foreground }}
							>
								Assim os outros membros verão o seu perfil!
							</p>
						</div>
						<button
							className="rounded-md px-3 py-1.5 font-black font-display text-xs uppercase"
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
							BOTÃO
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});
