"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCustomTheme } from "@/components/custom-theme-provider";
import { BauhausSkeleton } from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { parseCustomTheme } from "@/lib/custom-theme";
import { trpc } from "@/utils/trpc";
import { EditPersonalDataCard } from "./_components/edit-personal-data-card";
import { ProfileBadgesCard } from "./_components/profile-badges-card";
import { ProfileGiftsMural } from "./_components/profile-gifts-mural";
import { ProfileHeaderCard } from "./_components/profile-header-card";
import { TrackPreferencesCard } from "./_components/track-preferences-card";
import type { Department } from "./_components/types";

function ProfileContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const targetUserId = searchParams.get("id") || undefined;
	const isOwnProfile = !targetUserId || targetUserId === session?.user?.id;

	const { openThemeModal, setActiveProfileTheme } = useCustomTheme();

	const profileQuery = useQuery(
		trpc.user.getProfile.queryOptions({ userId: targetUserId })
	);

	useEffect(() => {
		// Apenas aplica o tema customizado no perfil de terceiros
		// No próprio perfil, respeita estritamente o seletor de temas do usuário
		if (!isOwnProfile && profileQuery.data?.customTheme) {
			const parsed = parseCustomTheme(profileQuery.data.customTheme);
			setActiveProfileTheme(parsed);
		} else {
			setActiveProfileTheme(null);
		}
		return () => {
			setActiveProfileTheme(null);
		};
	}, [isOwnProfile, profileQuery.data?.customTheme, setActiveProfileTheme]);

	const updateProfileMutation = useMutation(
		trpc.user.updateProfile.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao atualizar perfil");
			},
			onSuccess: () => {
				toast.success("Perfil atualizado com sucesso!");
				queryClient.invalidateQueries();
			},
		})
	);

	const sendGiftMutation = useMutation(
		trpc.user.sendGift.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao enviar presente");
			},
			onSuccess: () => {
				toast.success("Presente enviado para o mural com sucesso!");
				queryClient.invalidateQueries();
			},
		})
	);

	const deleteGiftMutation = useMutation(
		trpc.user.deleteGift.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Erro ao remover presente");
			},
			onSuccess: () => {
				toast.success("Presente removido do mural");
				queryClient.invalidateQueries();
			},
		})
	);

	const [name, setName] = useState("");
	const [department, setDepartment] = useState<Department>("DIPROJ");
	const [whatsapp, setWhatsapp] = useState("");
	const [gifUrl, setGifUrl] = useState("");
	const [tracks, setTracks] = useState<string[]>([]);

	const profile = profileQuery.data;
	const isOwner = profile?.isOwner ?? false;

	useEffect(() => {
		if (profile && isOwner) {
			setName(profile.name || "");
			setDepartment((profile.department as Department) || "DIPROJ");
			setWhatsapp(profile.whatsapp || "");
			setGifUrl(profile.gifUrl || "");
			setTracks(profile.trackPreferencesList || []);
		}
	}, [profile, isOwner]);

	const toggleTrack = useCallback(
		(trackId: string) => {
			if (!isOwner) {
				return;
			}

			if (profile?.primaryTrack && !profile.canChooseOtherTracks) {
				if (trackId === profile.primaryTrack) {
					toast.info("A sua trilha principal não pode ser desativada.");
					return;
				}
				toast.error(
					`Você precisa atingir 85% de progresso na sua trilha principal (${profile.primaryTrackLabel}) para selecionar outras trilhas. Progresso atual: ${profile.primaryTrackProgress}%.`
				);
				return;
			}

			setTracks((prev) =>
				prev.includes(trackId)
					? prev.filter((t) => t !== trackId)
					: [...prev, trackId]
			);
		},
		[isOwner, profile]
	);

	const handleAvatarUploaded = useCallback(
		(url: string) => {
			setGifUrl(url);
			updateProfileMutation.mutate({
				department,
				gifUrl: url,
				name,
				trackPreferences: tracks,
				whatsapp: whatsapp || null,
			});
			toast.success("Foto de perfil atualizada!");
		},
		[department, name, tracks, updateProfileMutation, whatsapp]
	);

	const handleRemoveAvatar = useCallback(() => {
		setGifUrl("");
		updateProfileMutation.mutate({
			department,
			gifUrl: null,
			name,
			trackPreferences: tracks,
			whatsapp: whatsapp || null,
		});
		toast.success("Foto removida. Avatar padrão restaurado!");
	}, [department, name, tracks, updateProfileMutation, whatsapp]);

	const handleSave = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			updateProfileMutation.mutate({
				department,
				gifUrl: gifUrl || null,
				name,
				trackPreferences: tracks,
				whatsapp: whatsapp || null,
			});
		},
		[department, gifUrl, name, tracks, updateProfileMutation, whatsapp]
	);

	const handleSendGift = useCallback(
		(mediaUrl: string, message: string) => {
			if (!profile?.id) {
				return;
			}
			if (!mediaUrl.trim()) {
				toast.error("Por favor, selecione um GIF ou informe o link da imagem.");
				return;
			}
			sendGiftMutation.mutate({
				mediaUrl: mediaUrl.trim(),
				message: message.trim() || null,
				recipientId: profile.id,
			});
		},
		[profile?.id, sendGiftMutation]
	);

	const handleDeleteGift = useCallback(
		(giftId: string) => {
			deleteGiftMutation.mutate({ giftId });
		},
		[deleteGiftMutation]
	);

	const handleSignOut = useCallback(async () => {
		try {
			localStorage.removeItem("orc-custom-theme-data");
		} catch {
			// ignore
		}
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}, [router]);

	if (profileQuery.isLoading) {
		return (
			<div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
				<BauhausSkeleton />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-center">
				<h1 className="font-black font-display text-2xl uppercase">
					Membro Não Encontrado
				</h1>
				<p className="font-medium text-muted-foreground text-xs">
					O perfil solicitado não existe ou você não tem acesso.
				</p>
				<Link
					className="btn-tactile inline-block rounded-md border-2 border-black bg-primary px-4 py-2 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 dark:border-white"
					href="/profile"
				>
					Voltar ao Meu Perfil
				</Link>
			</div>
		);
	}

	const gifts = profile.gifts ?? [];
	const profileTheme = profile.customTheme
		? parseCustomTheme(profile.customTheme)
		: null;
	const currentUserId = session?.user?.id;
	const currentUserRole = (session?.user as { role?: string } | undefined)
		?.role;

	return (
		<div className="mx-auto max-w-2xl space-y-6 px-4 py-6 pb-28">
			{/* Navigation header when visiting another user's profile */}
			{isOwner ? null : (
				<div className="flex items-center gap-2">
					<Link
						className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
						href="/profile"
					>
						&larr; MEU PERFIL
					</Link>
				</div>
			)}

			{/* Member ID Pass Card */}
			<ProfileHeaderCard
				isOwner={isOwner}
				onAvatarUploaded={handleAvatarUploaded}
				onOpenThemeModal={openThemeModal}
				onRemoveAvatar={handleRemoveAvatar}
				profile={profile}
				profileTheme={profileTheme}
				userEmail={session?.user?.email}
			/>

			{/* Badges / Selos Conquistados */}
			<ProfileBadgesCard badges={profile.badges} />

			{/* MURAL//PRESENTES */}
			<ProfileGiftsMural
				currentUserId={currentUserId}
				currentUserRole={currentUserRole}
				gifts={gifts}
				isOwner={isOwner}
				isSendingGift={sendGiftMutation.isPending}
				onDeleteGift={handleDeleteGift}
				onSendGift={handleSendGift}
				recipientName={profile.name}
			/>

			{/* Track Inscription Toggles / Public View */}
			<TrackPreferencesCard
				isOwner={isOwner}
				onToggleTrack={toggleTrack}
				profile={profile}
				selectedTracks={tracks}
			/>

			{/* Edit Personal Data - ONLY for Profile Owner */}
			{isOwner ? (
				<EditPersonalDataCard
					department={department}
					isPending={updateProfileMutation.isPending}
					name={name}
					onChangeDepartment={setDepartment}
					onChangeName={setName}
					onChangeWhatsapp={setWhatsapp}
					onSubmit={handleSave}
					whatsapp={whatsapp}
				/>
			) : null}

			{/* Logout Button - ONLY for Profile Owner */}
			{isOwner ? (
				<div className="pt-2 text-center">
					<button
						className="btn-tactile w-full rounded-md border-2 border-black bg-[#DC2626] px-6 py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#B91C1C] sm:w-auto sm:py-2 dark:border-white"
						onClick={handleSignOut}
						type="button"
					>
						DESCONECTAR {"//"} SAIR DA CONTA
					</button>
				</div>
			) : null}
		</div>
	);
}

export default function ProfilePage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
					<BauhausSkeleton />
				</div>
			}
		>
			<ProfileContent />
		</Suspense>
	);
}
