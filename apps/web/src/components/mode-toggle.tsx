"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@orcestra-desafios/ui/components/dropdown-menu";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export function ModeToggle() {
	const { setTheme } = useTheme();

	const setLight = useCallback(() => setTheme("light"), [setTheme]);
	const setDark = useCallback(() => setTheme("dark"), [setTheme]);
	const setSystem = useCallback(() => setTheme("system"), [setTheme]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						className="btn-tactile flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
						type="button"
					/>
				}
			>
				{/* Bauhaus geometric symbol for day/night: circle half filled */}
				<svg
					className="h-4 w-4 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
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
				className="rounded-md border-2 border-black bg-card shadow-hard dark:border-white"
			>
				<DropdownMenuItem
					className="cursor-pointer font-black font-display text-xs uppercase tracking-wider"
					onClick={setLight}
				>
					LIGHT // BAUHAUS
				</DropdownMenuItem>
				<DropdownMenuItem
					className="cursor-pointer font-black font-display text-xs uppercase tracking-wider"
					onClick={setDark}
				>
					DARK // FAUVISM
				</DropdownMenuItem>
				<DropdownMenuItem
					className="cursor-pointer font-black font-display text-xs uppercase tracking-wider"
					onClick={setSystem}
				>
					SYSTEM // AUTO
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
