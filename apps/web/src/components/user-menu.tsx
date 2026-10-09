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
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { PopBadge } from "@/components/pop-elements";
import { usePwa } from "@/components/pwa-provider";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const { isStandalone, installApp } = usePwa();

	const handleSignOut = useCallback(() => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}, [router]);

	const handleNavigateProfile = useCallback(() => {
		router.push("/profile");
	}, [router]);

	const handleNavigateDashboard = useCallback(() => {
		router.push("/dashboard");
	}, [router]);

	const handleNavigateRanking = useCallback(() => {
		router.push("/ranking");
	}, [router]);

	const handleNavigateAdmin = useCallback(() => {
		router.push("/admin");
	}, [router]);

	const handleInstallApp = useCallback(() => {
		installApp();
	}, [installApp]);

	if (isPending) {
		return (
			<div className="h-9 w-9 animate-pulse rounded-md border-2 border-black/20 bg-muted" />
		);
	}

	if (!session) {
		return (
			<Link
				className="btn-tactile rounded-md border-2 border-black bg-primary px-3 py-1.5 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
				href="/login"
			>
				ENTRAR
			</Link>
		);
	}

	const user = session.user as
		| { role?: string; department?: string }
		| undefined;
	const isAdmin = user?.role === "ADMIN";
	const department = user?.department;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						aria-label="Menu do usuário"
						className="btn-tactile flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
						type="button"
					/>
				}
			>
				<User className="h-4 w-4" />
				<span className="sr-only">Menu do usuário</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-64 rounded-md border-2 border-black bg-card p-2 shadow-hard dark:border-white"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex flex-col gap-1 px-2.5 py-2">
						<span className="font-black font-display text-foreground text-sm uppercase tracking-tight">
							{session.user.name}
						</span>
						<span className="truncate font-mono text-muted-foreground text-xs">
							{session.user.email}
						</span>
						{department ? (
							<div className="mt-1">
								<PopBadge color="neutral">{department}</PopBadge>
							</div>
						) : null}
					</DropdownMenuLabel>

					<DropdownMenuSeparator className="my-1.5 bg-black/20 dark:bg-white/20" />

					<DropdownMenuItem
						className="cursor-pointer rounded-sm px-2.5 py-2 font-bold font-display text-xs uppercase tracking-wider transition hover:bg-secondary"
						onClick={handleNavigateProfile}
					>
						MEU PERFIL
					</DropdownMenuItem>

					<DropdownMenuItem
						className="cursor-pointer rounded-sm px-2.5 py-2 font-bold font-display text-xs uppercase tracking-wider transition hover:bg-secondary"
						onClick={handleNavigateDashboard}
					>
						DESAFIOS
					</DropdownMenuItem>

					<DropdownMenuItem
						className="cursor-pointer rounded-sm px-2.5 py-2 font-bold font-display text-xs uppercase tracking-wider transition hover:bg-secondary"
						onClick={handleNavigateRanking}
					>
						RANKING
					</DropdownMenuItem>

					{isAdmin ? (
						<DropdownMenuItem
							className="cursor-pointer rounded-sm px-2.5 py-2 font-bold font-display text-xs uppercase tracking-wider transition hover:bg-secondary"
							onClick={handleNavigateAdmin}
						>
							PAINEL ADMIN
						</DropdownMenuItem>
					) : null}

					{isStandalone ? null : (
						<>
							<DropdownMenuSeparator className="my-1.5 bg-black/20 dark:bg-white/20" />
							<DropdownMenuItem
								className="cursor-pointer rounded-sm px-2.5 py-2 font-black font-display text-primary text-xs uppercase tracking-wider transition hover:bg-primary hover:text-primary-foreground"
								onClick={handleInstallApp}
							>
								INSTALAR APLICATIVO
							</DropdownMenuItem>
						</>
					)}

					<DropdownMenuSeparator className="my-1.5 bg-black/20 dark:bg-white/20" />

					<DropdownMenuItem
						className="cursor-pointer rounded-sm px-2.5 py-2 font-black font-display text-destructive text-xs uppercase tracking-wider transition hover:bg-destructive hover:text-destructive-foreground dark:text-red-400"
						onClick={handleSignOut}
					>
						DESCONECTAR
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
