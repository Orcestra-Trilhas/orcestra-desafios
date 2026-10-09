"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PopTrackBadge } from "@/components/pop-elements";

export interface ExplorerChallenge {
	description: string;
	id: string;
	mkdocsUrl: string | null;
	pointsReward: number;
	title: string;
	trackTheme: string;
}

export interface UserMeData {
	canChooseOtherTracks?: boolean;
	primaryTrack?: string | null;
	primaryTrackLabel?: string;
	primaryTrackProgress?: number;
}

interface ExplorerModalProps {
	challenges: ExplorerChallenge[];
	isOpen: boolean;
	onClose: () => void;
	userMe?: UserMeData;
}

export const ExplorerModal = memo(function ExplorerModalRender({
	isOpen,
	onClose,
	challenges,
	userMe,
}: ExplorerModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="relative max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-card p-6 shadow-hard-lg dark:border-white">
				<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
					<div>
						<h3 className="font-black font-display text-xl uppercase">
							DESAFIOS ABERTOS {"//"} EJ
						</h3>
						<p className="font-mono text-muted-foreground text-xs">
							[MATERIAIS & REGRAS MKDOCS]
						</p>
					</div>
					<button
						aria-label="Fechar"
						className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-secondary font-black text-sm hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						X
					</button>
				</div>

				<div className="space-y-4">
					{challenges.map((ch) => {
						const isPrimaryTrack = userMe?.primaryTrack === ch.trackTheme;
						const isLocked =
							Boolean(userMe?.primaryTrack) &&
							!isPrimaryTrack &&
							!userMe?.canChooseOtherTracks;

						return (
							<div
								className="space-y-2.5 rounded-md border-2 border-black bg-secondary/30 p-4 shadow-hard-sm dark:border-white"
								key={ch.id}
							>
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap items-center gap-1.5">
										<PopTrackBadge track={ch.trackTheme} />
										{isPrimaryTrack ? (
											<span className="rounded border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-bold font-mono text-[9px] text-primary uppercase">
												Sua Trilha
											</span>
										) : null}
										{isLocked ? (
											<span className="flex items-center gap-1 rounded border border-[#DC2626]/40 bg-[#DC2626]/10 px-1.5 py-0.5 font-bold font-mono text-[#DC2626] text-[9px] uppercase dark:text-[#F87171]">
												<Lock className="h-2.5 w-2.5" /> Requer 85%
											</span>
										) : null}
									</div>
									<span className="rounded-md border-2 border-black bg-[#FACC15] px-2 py-0.5 font-black font-mono text-[#121212] text-[11px] dark:border-white">
										+{ch.pointsReward} PTS
									</span>
								</div>

								<h4 className="font-black font-display text-base uppercase">
									{ch.title}
								</h4>
								<p className="line-clamp-2 font-medium text-muted-foreground text-xs">
									{ch.description}
								</p>

								{isLocked ? (
									<p className="font-mono text-[#DC2626] text-[10px] dark:text-[#F87171]">
										* Trilha externa: desbloqueia após atingir 85% de progresso
										na sua trilha principal ({userMe?.primaryTrackLabel}:{" "}
										{userMe?.primaryTrackProgress}%).
									</p>
								) : null}

								<div className="flex items-center justify-between border-black/10 border-t-2 pt-3 text-xs dark:border-white/10">
									{ch.mkdocsUrl ? (
										<a
											className="font-black font-display text-xs uppercase hover:underline"
											href={ch.mkdocsUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											VER NO MKDOCS &rarr;
										</a>
									) : (
										<span className="font-mono text-[10px] text-muted-foreground">
											[SEM DOC EXTERNA]
										</span>
									)}

									<Link
										className="btn-tactile rounded-md border-2 border-black bg-foreground px-3 py-1 font-black font-display text-background text-xs uppercase shadow-hard-sm dark:border-white"
										href={`/challenges/${ch.id}`}
										onClick={onClose}
									>
										DETALHES
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
});
