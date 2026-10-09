import { Lock, Unlock } from "lucide-react";
import { useCallback } from "react";
import { PopTrackBadge } from "@/components/pop-elements";
import { type ProfileData, TRACKS, type TrackDefinition } from "./types";

interface TrackPreferencesCardProps {
	isOwner: boolean;
	onToggleTrack: (trackId: string) => void;
	profile: ProfileData;
	selectedTracks: string[];
}

function getTrackStatusBadge(
	isLocked: boolean,
	isPrimary: boolean,
	isEnabled: boolean
) {
	if (isLocked) {
		return {
			badgeClass: "bg-muted text-muted-foreground",
			content: <Lock className="h-3 w-3" />,
		};
	}
	if (isPrimary) {
		return {
			badgeClass: "bg-[#1E40AF] text-white",
			content: "FIXO",
		};
	}
	if (isEnabled) {
		return {
			badgeClass: "bg-[#15803D] text-white dark:bg-[#16A34A]",
			content: "ON",
		};
	}
	return {
		badgeClass: "bg-muted text-muted-foreground",
		content: "OFF",
	};
}

function getTrackButtonClass(isLocked: boolean, isEnabled: boolean): string {
	if (isLocked) {
		return "cursor-not-allowed border-black/20 bg-muted/30 text-muted-foreground opacity-60 dark:border-white/20";
	}
	if (isEnabled) {
		return "cursor-pointer border-black bg-secondary text-foreground shadow-hard-sm dark:border-white";
	}
	return "cursor-pointer border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30";
}

function OwnerTrackButton({
	isEnabled,
	isLocked,
	isPrimary,
	onToggle,
	track,
}: {
	isEnabled: boolean;
	isLocked: boolean;
	isPrimary: boolean;
	onToggle: (id: string) => void;
	track: TrackDefinition;
}) {
	const handleClick = useCallback(() => {
		onToggle(track.id);
	}, [onToggle, track.id]);

	const status = getTrackStatusBadge(isLocked, isPrimary, isEnabled);
	const buttonClass = getTrackButtonClass(isLocked, isEnabled);

	return (
		<button
			className={`btn-tactile flex w-full items-center justify-between gap-3 rounded-md border-2 p-3 text-left transition-all ${buttonClass}`}
			disabled={isLocked}
			onClick={handleClick}
			type="button"
		>
			<div className="min-w-0 flex-1 space-y-0.5">
				<div className="flex flex-wrap items-center gap-2">
					<PopTrackBadge track={track.id} />
					{isPrimary ? (
						<span className="rounded border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-bold font-mono text-[9px] text-primary uppercase">
							Trilha Principal
						</span>
					) : null}
					{isLocked ? (
						<span className="flex items-center gap-1 rounded border border-[#DC2626]/40 bg-[#DC2626]/10 px-1.5 py-0.5 font-bold font-mono text-[#DC2626] text-[9px] uppercase dark:text-[#F87171]">
							<Lock className="h-2.5 w-2.5" /> Requer 85%
						</span>
					) : null}
				</div>
				<span className="line-clamp-1 font-mono text-[10px] text-muted-foreground sm:line-clamp-none">
					{track.desc}
				</span>
			</div>

			<div
				className={`flex h-6 min-w-10 shrink-0 items-center justify-center rounded-sm border-2 border-black px-1.5 font-black text-xs dark:border-white ${status.badgeClass}`}
			>
				{status.content}
			</div>
		</button>
	);
}

function PublicTrackRow({
	isPrimary,
	track,
}: {
	isPrimary: boolean;
	track: TrackDefinition;
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border-2 border-black bg-secondary p-3 text-foreground shadow-hard-sm dark:border-white">
			<div className="min-w-0 flex-1 space-y-0.5">
				<div className="flex items-center gap-2">
					<PopTrackBadge track={track.id} />
					{isPrimary ? (
						<span className="rounded border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-bold font-mono text-[9px] text-primary uppercase">
							Trilha Principal
						</span>
					) : null}
				</div>
				<span className="line-clamp-1 font-mono text-[10px] text-muted-foreground sm:line-clamp-none">
					{track.desc}
				</span>
			</div>
		</div>
	);
}

export function TrackPreferencesCard({
	isOwner,
	onToggleTrack,
	profile,
	selectedTracks,
}: TrackPreferencesCardProps) {
	const {
		canChooseOtherTracks = false,
		primaryTrack,
		primaryTrackProgress = 0,
	} = profile;

	return (
		<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
			<div className="space-y-1 border-black/10 border-b-2 pb-3 dark:border-white/10">
				<h2 className="font-black font-display text-sm uppercase tracking-wider">
					{isOwner
						? "INSCRIÇÃO AUTOMÁTICA EM TRILHAS TÉCNICAS"
						: "ÁREAS DE INTERESSE & TRILHAS TÉCNICAS"}
				</h2>
				<p className="font-medium text-muted-foreground text-xs">
					{isOwner
						? "Selecione as trilhas que você deseja receber desafios e ser alocado em duplas automaticamente."
						: "Trilhas em que este membro participa e recebe missões e desafios."}
				</p>
			</div>

			{/* Progress & Track Unlock Banner */}
			{primaryTrack ? (
				<div className="space-y-2.5 rounded-md border-2 border-black bg-secondary/50 p-3.5 dark:border-white">
					<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
						<div className="space-y-0.5">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
									Trilha Principal (Planilha EJ):
								</span>
								<span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-black font-display text-primary text-xs uppercase">
									{profile.primaryTrackLabel}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-1.5 font-bold font-mono text-xs">
							<span>Progresso:</span>
							<span className="font-black text-sm">
								{primaryTrackProgress}%
							</span>
							<span className="text-muted-foreground">/ 85% meta</span>
						</div>
					</div>

					{/* Progress Bar with 85% threshold indicator */}
					<div className="space-y-1">
						<div className="relative h-4 w-full overflow-hidden rounded-xs border-2 border-black bg-muted dark:border-white">
							<div
								className={`h-full transition-all duration-300 ${
									canChooseOtherTracks
										? "bg-[#15803D] dark:bg-[#16A34A]"
										: "bg-[#FF4A1C]"
								}`}
								style={{
									width: `${Math.min(100, primaryTrackProgress)}%`,
								}}
							/>
							<div
								className="absolute top-0 bottom-0 z-10 w-0.5 bg-black dark:bg-white"
								style={{ left: "85%" }}
								title="Meta de 85%"
							/>
						</div>
						<div className="flex justify-between font-mono text-[9px] text-muted-foreground">
							<span>0%</span>
							<span className="font-bold text-foreground">
								85% Meta de Desbloqueio
							</span>
							<span>100%</span>
						</div>
					</div>

					{canChooseOtherTracks ? (
						<div className="flex items-center gap-2 rounded border border-[#15803D]/40 bg-[#15803D]/10 p-2 font-medium text-[#15803D] text-xs dark:text-[#4ADE80]">
							<Unlock className="h-4 w-4 shrink-0" />
							<span>
								<strong>Desbloqueado!</strong> Você atingiu os 85% de progresso
								na sua trilha principal e agora pode escolher e participar de
								desafios das demais trilhas.
							</span>
						</div>
					) : (
						<div className="flex items-center gap-2 rounded border border-[#DC2626]/40 bg-[#DC2626]/10 p-2 font-medium text-[#DC2626] text-xs dark:text-[#F87171]">
							<Lock className="h-4 w-4 shrink-0" />
							<span>
								<strong>Demais trilhas bloqueadas:</strong> Você precisa atingir
								pelo menos 85% do progresso na sua trilha principal para
								escolher as demais áreas (faltam{" "}
								{Math.max(0, 85 - primaryTrackProgress)}%).
							</span>
						</div>
					)}
				</div>
			) : null}

			<div className="space-y-2.5">
				{TRACKS.map((t) => {
					const isPrimary = primaryTrack === t.id;
					const isLocked =
						!isPrimary && Boolean(primaryTrack) && !canChooseOtherTracks;

					const isEnabled = isOwner
						? isPrimary || selectedTracks.includes(t.id)
						: (profile.trackPreferencesList || []).includes(t.id);

					if (!(isOwner || isEnabled)) {
						return null;
					}

					if (isOwner) {
						return (
							<OwnerTrackButton
								isEnabled={isEnabled}
								isLocked={isLocked}
								isPrimary={isPrimary}
								key={t.id}
								onToggle={onToggleTrack}
								track={t}
							/>
						);
					}

					return <PublicTrackRow isPrimary={isPrimary} key={t.id} track={t} />;
				})}

				{!isOwner &&
				(!profile.trackPreferencesList ||
					profile.trackPreferencesList.length === 0) ? (
					<p className="font-mono text-muted-foreground text-xs">
						[Nenhuma trilha selecionada por este membro]
					</p>
				) : null}
			</div>
		</div>
	);
}
