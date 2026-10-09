import type { ProfileBadge } from "./types";

interface ProfileBadgesCardProps {
	badges?: (ProfileBadge | null)[];
}

export function ProfileBadgesCard({ badges }: ProfileBadgesCardProps) {
	const validBadges = (badges ?? []).filter((b): b is ProfileBadge =>
		Boolean(b)
	);

	return (
		<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
			<div className="flex items-center gap-2 border-black/10 border-b-2 pb-2 dark:border-white/10">
				<div className="h-3 w-3 rounded-full border-2 border-black bg-primary dark:border-white" />
				<h2 className="font-black font-display text-sm uppercase tracking-wider">
					SELOS & BADGES CONQUISTADOS
				</h2>
			</div>

			{validBadges.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{validBadges.map((b) => (
						<div
							className="flex items-center gap-3 rounded-md border-2 border-black bg-secondary/30 p-3 shadow-hard-sm dark:border-white"
							key={b.id}
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-[#FACC15] font-black text-[#121212] text-sm">
								★
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate font-black font-display text-xs uppercase">
									{b.name}
								</span>
								<span className="line-clamp-2 font-medium text-[11px] text-muted-foreground">
									{b.description}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="font-mono text-muted-foreground text-xs">
					[Nenhum selo conquistado ainda. Submeta desafios em duplas para
					desbloquear badges!]
				</p>
			)}
		</div>
	);
}
