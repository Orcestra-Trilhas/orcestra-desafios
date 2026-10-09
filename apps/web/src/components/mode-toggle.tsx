"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@orcestra-desafios/ui/components/dropdown-menu";
import { Check, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useCustomTheme } from "./custom-theme-provider";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const { customTheme, openThemeModal } = useCustomTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const setOrcDark = useCallback(() => setTheme("orc-dark"), [setTheme]);
	const setOrcLight = useCallback(() => setTheme("orc-light"), [setTheme]);
	const setDark = useCallback(() => setTheme("dark"), [setTheme]);
	const setLight = useCallback(() => setTheme("light"), [setTheme]);
	const setCustom = useCallback(() => setTheme("custom"), [setTheme]);
	const handleOpenCreator = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			openThemeModal();
		},
		[openThemeModal]
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						aria-label="Alternar esquema de cores"
						className="btn-tactile flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
						type="button"
					/>
				}
			>
				{/* Geometric theme toggle icon */}
				<svg
					aria-hidden="true"
					className="h-4 w-4 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Alternar tema</title>
					<circle
						cx="12"
						cy="12"
						fill="none"
						r="9"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<path d="M12 3a9 9 0 0 0 0 18z" />
				</svg>
				<span className="sr-only">Alternar tema</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-58 rounded-md border-2 border-black bg-card shadow-hard dark:border-white"
			>
				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-between font-black font-display text-xs uppercase tracking-wider"
					onClick={setOrcDark}
				>
					<div className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-full border border-[#1E3B1A] bg-[#3BC90C]"
						/>
						<span>DARK {"//"} ORC&apos;ESTRA</span>
					</div>
					{mounted && theme === "orc-dark" ? (
						<Check className="h-3.5 w-3.5 shrink-0" />
					) : null}
				</DropdownMenuItem>

				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-between font-black font-display text-xs uppercase tracking-wider"
					onClick={setOrcLight}
				>
					<div className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-full border border-[#234A1F] bg-[#0D3309]"
						/>
						<span>LIGHT {"//"} ORC&apos;ESTRA</span>
					</div>
					{mounted && theme === "orc-light" ? (
						<Check className="h-3.5 w-3.5 shrink-0" />
					) : null}
				</DropdownMenuItem>

				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-between font-black font-display text-xs uppercase tracking-wider"
					onClick={setDark}
				>
					<div className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-full border border-[#EAB308] bg-[#09090B]"
						/>
						<span>DARK {"//"} LE NOIR</span>
					</div>
					{mounted && theme === "dark" ? (
						<Check className="h-3.5 w-3.5 shrink-0" />
					) : null}
				</DropdownMenuItem>

				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-between font-black font-display text-xs uppercase tracking-wider"
					onClick={setLight}
				>
					<div className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-full border border-[#18181B] bg-[#DC2626]"
						/>
						<span>LIGHT {"//"} LE ROUGE</span>
					</div>
					{mounted && theme === "light" ? (
						<Check className="h-3.5 w-3.5 shrink-0" />
					) : null}
				</DropdownMenuItem>

				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-between font-black font-display text-xs uppercase tracking-wider"
					onClick={setCustom}
				>
					<div className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-full border border-black dark:border-white"
							style={{
								background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.primary} 100%)`,
							}}
						/>
						<span className="max-w-[125px] truncate">
							{customTheme.name || "MEU TEMA"}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<button
							aria-label="Editar tema personalizado"
							className="btn-tactile rounded border border-black bg-muted p-1 hover:bg-secondary dark:border-white"
							onClick={handleOpenCreator}
							title="Editar tema"
							type="button"
						>
							<Sparkles className="h-3 w-3 text-primary" />
						</button>
						{mounted && theme === "custom" ? (
							<Check className="h-3.5 w-3.5 shrink-0" />
						) : null}
					</div>
				</DropdownMenuItem>

				<DropdownMenuItem
					className="flex cursor-pointer items-center justify-center gap-1.5 border-black/10 border-t py-2 font-black font-display text-[11px] text-primary uppercase tracking-wider hover:bg-muted dark:border-white/10"
					onClick={openThemeModal}
				>
					<Sparkles className="h-3 w-3" />
					<span>CRIAR SEU PRÓPRIO TEMA</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
