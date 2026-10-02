"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import { ModeToggle } from "./mode-toggle";
import { PopLogo, PopPointsBadge } from "./pop-elements";
import UserMenu from "./user-menu";

export default function Header() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const userMe = useQuery({
		...trpc.user.me.queryOptions(),
		enabled: Boolean(session?.user),
	});

	if (pathname === "/login") {
		return null;
	}

	const sessionUser = session?.user as { points?: number } | undefined;
	const points = userMe.data?.points ?? sessionUser?.points ?? 0;

	return (
		<header className="sticky top-0 z-40 w-full border-black border-b-2 bg-background dark:border-white">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:h-16 sm:px-4">
				<Link
					className="btn-tactile group flex shrink-0 items-center gap-2"
					href="/dashboard"
				>
					<PopLogo hideTextOnMobile />
				</Link>

				<div className="flex items-center gap-2 sm:gap-3">
					{session?.user ? <PopPointsBadge points={points} size="sm" /> : null}

					<div className="flex items-center gap-1.5 border-black/20 border-l-2 pl-1.5 sm:gap-2 sm:pl-2 dark:border-white/20">
						<ModeToggle />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}
