"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function BottomNav() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();

	if (pathname === "/login") {
		return null;
	}

	const user = session?.user as { role?: string } | undefined;
	const isAdmin = user?.role === "ADMIN";

	const navItems = [
		{
			active: pathname === "/dashboard" || pathname.startsWith("/challenges"),
			href: "/dashboard",
			label: "DESAFIOS",
			symbol: (
				<svg
					className="h-5 w-5 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
				</svg>
			),
		},
		{
			active: pathname === "/ranking",
			href: "/ranking",
			label: "RANKING",
			symbol: (
				<svg
					className="h-5 w-5 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
				</svg>
			),
		},
		{
			active: pathname === "/profile",
			href: "/profile",
			label: "PERFIL",
			symbol: (
				<svg
					className="h-5 w-5 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
				</svg>
			),
		},
		...(isAdmin
			? [
					{
						active: pathname.startsWith("/admin"),
						href: "/admin",
						label: "ADMIN",
						symbol: (
							<svg
								className="h-5 w-5 fill-current"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
							</svg>
						),
					},
				]
			: []),
	];

	return (
		<nav
			className="fixed right-0 bottom-0 left-0 z-50 border-black border-t-2 bg-background dark:border-white"
			style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
		>
			<div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 sm:px-3 sm:py-2.5">
				{navItems.map((item) => (
					<Link
						className={`btn-tactile flex flex-col items-center gap-1 rounded-md px-2.5 py-1 text-center transition-all sm:px-3 ${
							item.active
								? "border-2 border-black bg-[#FF4A1C] font-black text-white shadow-hard-sm dark:border-white"
								: "font-bold text-muted-foreground hover:text-foreground"
						}`}
						href={item.href as Route}
						key={item.href}
					>
						<div>{item.symbol}</div>
						<span className="font-display text-[10px] uppercase tracking-wider">
							{item.label}
						</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
