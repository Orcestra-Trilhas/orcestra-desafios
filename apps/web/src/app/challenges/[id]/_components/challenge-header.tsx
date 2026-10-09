import { Lock, Trash2 } from "lucide-react";
import { PopPointsBadge, PopTrackBadge } from "@/components/pop-elements";
import type { ChallengeData, UserMeData } from "./types";

interface ChallengeHeaderProps {
	challenge: Pick<
		ChallengeData,
		| "id"
		| "title"
		| "description"
		| "trackTheme"
		| "pointsReward"
		| "deadline"
		| "mkdocsUrl"
	>;
	isAdmin: boolean;
	onBack: () => void;
	onOpenDelete: () => void;
	userMe?: UserMeData;
}

export function ChallengeHeader({
	challenge,
	isAdmin,
	onBack,
	onOpenDelete,
	userMe,
}: ChallengeHeaderProps) {
	const isSecondaryTrackLocked = Boolean(
		userMe?.primaryTrack &&
			challenge.trackTheme !== userMe.primaryTrack &&
			!userMe.canChooseOtherTracks
	);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Top Bar with Back Link & Admin Delete */}
			<div className="flex items-center justify-between gap-2">
				<button
					className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-secondary px-3 py-1 font-black font-display text-xs uppercase shadow-hard-sm dark:border-white"
					onClick={onBack}
					type="button"
				>
					&larr; VOLTAR AOS DESAFIOS
				</button>

				{isAdmin ? (
					<button
						className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#DC2626] px-3 py-1 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#B91C1C] dark:border-white"
						onClick={onOpenDelete}
						type="button"
					>
						<Trash2 className="h-3.5 w-3.5" />
						<span>EXCLUIR DESAFIO</span>
					</button>
				) : null}
			</div>

			{/* Locked Track Notice */}
			{isSecondaryTrackLocked && userMe ? (
				<div className="rounded-md border-2 border-black bg-[#FEF3C7] p-3.5 text-[#92400E] shadow-hard-sm dark:border-white dark:bg-[#78350F]/40 dark:text-[#FDE68A]">
					<div className="flex items-start gap-2.5">
						<Lock className="mt-0.5 h-4 w-4 shrink-0" />
						<div className="space-y-0.5 text-xs">
							<span className="block font-black font-display uppercase tracking-wider">
								Missão de Trilha Secundária [{challenge.trackTheme}]
							</span>
							<p className="leading-relaxed">
								Sua trilha principal é{" "}
								<strong>{userMe.primaryTrackLabel}</strong> (progresso atual:{" "}
								<strong>{userMe.primaryTrackProgress}%</strong>). Conforme as
								diretrizes da EJ, você só pode participar de desafios de outras
								trilhas após atingir <strong>85%</strong> de progresso na trilha
								principal.
							</p>
						</div>
					</div>
				</div>
			) : null}

			{/* Header Banner */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-4 sm:p-6 dark:border-white">
				<div className="flex flex-wrap items-center justify-between gap-2 border-black/10 border-b-2 pb-2.5 sm:pb-3 dark:border-white/10">
					<div className="flex items-center gap-2">
						<PopTrackBadge track={challenge.trackTheme} />
						<PopPointsBadge points={challenge.pointsReward} size="sm" />
					</div>

					<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">
						PRAZO: {new Date(challenge.deadline).toLocaleDateString("pt-BR")}
					</span>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<h1 className="font-black font-display text-xl uppercase tracking-tight sm:text-3xl">
						{challenge.title}
					</h1>
					<p className="font-medium text-muted-foreground text-xs leading-relaxed sm:text-sm">
						{challenge.description}
					</p>
				</div>

				{/* MkDocs Link */}
				{challenge.mkdocsUrl ? (
					<div className="pt-1">
						<a
							className="btn-tactile inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#1E40AF] px-3.5 py-1.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] sm:px-4 sm:py-2 dark:border-white"
							href={challenge.mkdocsUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span>DOCUMENTAÇÃO NO MKDOCS &rarr;</span>
						</a>
					</div>
				) : null}
			</div>
		</div>
	);
}
