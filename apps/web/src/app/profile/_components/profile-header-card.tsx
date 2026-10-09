import { Camera, Loader2, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/components/cloudinary-upload-button";
import { PopBadge, PopWhatsAppButton } from "@/components/pop-elements";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import type { CustomThemeConfig } from "@/lib/custom-theme";
import type { ProfileData } from "./types";

interface ProfileHeaderCardProps {
	isOwner: boolean;
	onAvatarUploaded: (url: string) => void;
	onOpenThemeModal: () => void;
	onRemoveAvatar: () => void;
	profile: ProfileData;
	profileTheme: CustomThemeConfig | null;
	userEmail?: string | null;
}

function ProfileAvatarSection({
	gifUrl,
	isOwner,
	name,
	onAvatarUploaded,
	onRemoveAvatar,
	role,
}: {
	gifUrl?: string | null;
	isOwner: boolean;
	name?: string | null;
	onAvatarUploaded: (url: string) => void;
	onRemoveAvatar: () => void;
	role?: string | null;
}) {
	const roleBadgeColor = role === "ADMIN" ? "admin" : "member";
	const {
		fileInputRef,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileChange,
		isDragging,
		isUploading,
		openFileDialog,
	} = useCloudinaryUpload({
		folder: "orcestra-avatars",
		maxSizeMb: 10,
		onUploadSuccess: onAvatarUploaded,
	});

	const avatarVisual = gifUrl ? (
		<Image
			alt="Avatar Membro"
			className="h-20 w-20 rounded-md border-2 border-black object-cover shadow-hard-sm sm:h-24 sm:w-24 dark:border-white"
			height={96}
			src={getOptimizedMediaUrl(gifUrl, {
				crop: "fill",
				height: 96,
				width: 96,
			})}
			unoptimized
			width={96}
		/>
	) : (
		<div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-black bg-primary font-black font-display text-3xl text-primary-foreground shadow-hard-sm sm:h-24 sm:w-24 sm:text-4xl dark:border-white">
			{name ? name.charAt(0).toUpperCase() : "M"}
		</div>
	);

	let overlayClass =
		"opacity-0 group-hover:opacity-100 group-focus:opacity-100";
	if (isUploading) {
		overlayClass = "opacity-100";
	} else if (isDragging) {
		overlayClass = "bg-primary/70 opacity-100";
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="group relative">
				{isOwner ? (
					<>
						<input
							accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
							className="hidden"
							disabled={isUploading}
							onChange={handleFileChange}
							ref={fileInputRef}
							type="file"
						/>
						<button
							aria-label="Trocar foto de perfil"
							className="btn-tactile group relative block cursor-pointer overflow-hidden rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary"
							disabled={isUploading}
							onClick={openFileDialog}
							onDragEnter={handleDragOver}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							title="Clique ou toque para trocar a foto de perfil"
							type="button"
						>
							{avatarVisual}

							<div
								className={`absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/60 p-1 text-white backdrop-blur-xs transition ${overlayClass}`}
							>
								{isUploading ? (
									<Loader2 className="h-5 w-5 animate-spin text-white sm:h-6 sm:w-6" />
								) : (
									<>
										<Camera className="h-5 w-5 drop-shadow sm:h-6 sm:w-6" />
										<span className="mt-0.5 font-bold font-display text-[9px] uppercase tracking-wider sm:text-[10px]">
											Trocar Foto
										</span>
									</>
								)}
							</div>
						</button>
					</>
				) : (
					avatarVisual
				)}

				<div className="pointer-events-none absolute -right-2 -bottom-2">
					<PopBadge color={roleBadgeColor}>
						{role === "ADMIN" ? "ADMIN" : "MEMBRO"}
					</PopBadge>
				</div>
			</div>

			{isOwner && gifUrl ? (
				<button
					className="btn-tactile inline-flex cursor-pointer items-center gap-1 rounded-md border-2 border-black bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive uppercase hover:bg-destructive/20 dark:border-white"
					onClick={onRemoveAvatar}
					title="Remover foto e voltar ao avatar com iniciais"
					type="button"
				>
					<Trash2 className="h-3 w-3" />
					<span>Remover Foto</span>
				</button>
			) : null}
		</div>
	);
}

function ProfileStatsGrid({
	badgesCount,
	completedChallenges,
	points,
}: {
	badgesCount: number;
	completedChallenges: number;
	points: number;
}) {
	return (
		<div className="mt-5 grid grid-cols-3 gap-2 border-black/10 border-t-2 pt-3 sm:mt-6 sm:gap-3 sm:pt-4 dark:border-white/10">
			<div className="rounded-md border-2 border-black bg-secondary/40 p-2 text-center sm:p-3 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					PONTUAÇÃO
				</span>
				<span className="font-black font-display text-[#FF4A1C] text-lg sm:text-2xl dark:text-orange-400">
					{points} PTS
				</span>
			</div>

			<div className="rounded-md border-2 border-black bg-secondary/40 p-2 text-center sm:p-3 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					CONCLUÍDOS
				</span>
				<span className="font-black font-display text-[#1E40AF] text-lg sm:text-2xl dark:text-blue-400">
					{completedChallenges}
				</span>
			</div>

			<div className="rounded-md border-2 border-black bg-secondary/40 p-2 text-center sm:p-3 dark:border-white">
				<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
					BADGES
				</span>
				<span className="font-black font-display text-[#15803D] text-lg sm:text-2xl dark:text-emerald-400">
					{badgesCount}
				</span>
			</div>
		</div>
	);
}

export function ProfileHeaderCard({
	isOwner,
	onAvatarUploaded,
	onOpenThemeModal,
	onRemoveAvatar,
	profile,
	profileTheme,
	userEmail,
}: ProfileHeaderCardProps) {
	const completedChallenges = profile.completedChallenges ?? 0;
	const badgesCount = (profile.badges ?? []).filter(Boolean).length;
	const points = profile.points ?? 0;

	return (
		<div className="relative overflow-hidden rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
			<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
				<ProfileAvatarSection
					gifUrl={profile.gifUrl}
					isOwner={isOwner}
					name={profile.name}
					onAvatarUploaded={onAvatarUploaded}
					onRemoveAvatar={onRemoveAvatar}
					role={profile.role}
				/>

				<div className="min-w-0 flex-1 space-y-1.5">
					<h1 className="truncate font-black font-display text-2xl uppercase tracking-tight sm:text-3xl">
						{profile.name || "MEMBRO EJ"}
					</h1>
					{isOwner && userEmail ? (
						<p className="truncate font-mono text-muted-foreground text-xs">
							{userEmail}
						</p>
					) : null}
					<div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
						<PopBadge color="neutral">
							DIRETORIA {"//"} {profile.department}
						</PopBadge>
						{profileTheme ? (
							<div className="flex items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-2.5 py-0.5 font-bold font-display text-[11px] uppercase tracking-wider dark:border-white">
								<span
									aria-hidden="true"
									className="h-2.5 w-2.5 shrink-0 rounded-full border border-black dark:border-white"
									style={{ backgroundColor: profileTheme.primary }}
								/>
								<span>
									TEMA {"//"} {profileTheme.name}
								</span>
							</div>
						) : null}
						{isOwner ? (
							<button
								className="btn-tactile inline-flex cursor-pointer items-center gap-1.5 rounded-md border-2 border-black bg-primary px-2.5 py-0.5 font-black font-display text-[11px] text-primary-foreground uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
								onClick={onOpenThemeModal}
								type="button"
							>
								<Sparkles className="h-3 w-3" />
								<span>
									{profile.customTheme ? "EDITAR TEMA" : "CRIAR TEMA"}
								</span>
							</button>
						) : null}
						{isOwner && profile.whatsapp ? (
							<span className="rounded-md border-2 border-black bg-secondary px-2.5 py-0.5 font-bold font-mono text-[11px] uppercase dark:border-white">
								ZAP: {profile.whatsapp}
							</span>
						) : null}
						{!isOwner && profile.whatsapp ? (
							<PopWhatsAppButton
								label="WHATSAPP"
								message={`Olá ${profile.name}! Vi seu perfil na plataforma orc//desafios.`}
								phone={profile.whatsapp}
							/>
						) : null}
					</div>
				</div>
			</div>

			<ProfileStatsGrid
				badgesCount={badgesCount}
				completedChallenges={completedChallenges}
				points={points}
			/>
		</div>
	);
}
