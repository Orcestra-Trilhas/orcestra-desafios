"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@orcestra-desafios/ui/components/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const handleSignOut = useCallback(() => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}, [router]);

	if (isPending) {
		return (
			<div className="h-9 w-20 animate-pulse rounded-md border-2 border-black/20 bg-muted" />
		);
	}

	if (!session) {
		return (
			<Link
				className="btn-tactile rounded-md border-2 border-black bg-[#FF4A1C] px-3 py-1.5 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] dark:border-white"
				href="/login"
			>
				ENTRAR
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						className="btn-tactile flex max-w-[130px] items-center gap-1.5 truncate rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted sm:max-w-none dark:border-white"
						type="button"
					/>
				}
			>
				<span className="truncate">{session.user.name}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="rounded-md border-2 border-black bg-card shadow-hard dark:border-white"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-black font-display text-xs uppercase tracking-wider">
						CONTA // MEMBRO EJ
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-black/20 dark:bg-white/20" />
					<DropdownMenuItem className="font-mono text-[11px] text-muted-foreground">
						{session.user.email}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer font-black font-display text-[#DC2626] text-xs uppercase tracking-wider hover:bg-[#DC2626] hover:text-white"
						onClick={handleSignOut}
					>
						DESCONECTAR
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
