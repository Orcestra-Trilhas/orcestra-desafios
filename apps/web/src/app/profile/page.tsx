"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import {
	BauhausSkeleton,
	PopBadge,
	PopTrackBadge,
	PopWhatsAppButton,
} from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const DEPARTMENTS = ["DIPROJ", "DIBIS", "DICOM", "TOPS"] as const;

const TRACKS = [
	{
		desc: "React, Next.js, UI & Frontend Architecture",
		id: "FRONT",
		label: "FRONTEND",
	},
	{
		desc: "Node.js, Drizzle ORM, PostgreSQL & tRPC",
		id: "BACK",
		label: "BACKEND",
	},
	{
		desc: "Figma, UI/UX & Design Systems",
		id: "PROTOTIPACAO",
		label: "PROTÓTIPO",
	},
	{
		desc: "Docker, CI/CD, Neon Cloud & Vercel",
		id: "DEVOPS",
		label: "DEVOPS",
	},
] as const;

const GIF_PRESETS = [
	{
		label: "FOGUETE",
		url: "https://media.giphy.com/media/3ohnEqJ1XOfvWaSk7e/giphy.gif",
	},
	{
		label: "PALMAS",
		url: "https://media.giphy.com/media/nbvFVEldHM4EVyqO9b/giphy.gif",
	},
	{
		label: "ON FIRE",
		url: "https://media.giphy.com/media/nrXif9YExO9EI/giphy.gif",
	},
	{
		label: "PARABÉNS",
		url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
	},
	{
		label: "CAFÉ",
		url: "https://media.giphy.com/media/hPTZgtzfRIB5Nfb5rL/giphy.gif",
	},
	{
		label: "GENIAL",
		url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
	},
	{
		label: "LENDÁRIO",
		url: "https://media.giphy.com/media/okLCopqw6ElCDnIhuS/giphy.gif",
	},
	{
		label: "PARCERIA",
		url: "https://media.giphy.com/media/3o7TKJNFVZ0xTG2Rry/giphy.gif",
	},
] as const;

function ProfileContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const targetUserId = searchParams.get("id") || undefined;

	const profileQuery = useQuery(
		trpc.user.getProfile.queryOptions({ userId: targetUserId })
	);

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
				setShowGiftForm(false);
				setGiftMediaUrl("");
				setGiftMessage("");
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
	const [department, setDepartment] = useState<
		"DIPROJ" | "DIBIS" | "DICOM" | "TOPS"
	>("DIPROJ");
	const [whatsapp, setWhatsapp] = useState("");
	const [gifUrl, setGifUrl] = useState("");
	const [tracks, setTracks] = useState<string[]>([]);

	// Gift Form state
	const [showGiftForm, setShowGiftForm] = useState(false);
	const [giftMediaUrl, setGiftMediaUrl] = useState("");
	const [giftMessage, setGiftMessage] = useState("");

	const profile = profileQuery.data;
	const isOwner = profile?.isOwner ?? false;

	useEffect(() => {
		if (profile && isOwner) {
			setName(profile.name || "");
			setDepartment(
				(profile.department as "DIPROJ" | "DIBIS" | "DICOM" | "TOPS") || "DIPROJ"
			);
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
			setTracks((prev) =>
				prev.includes(trackId)
					? prev.filter((t) => t !== trackId)
					: [...prev, trackId]
			);
		},
		[isOwner]
	);

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
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!profile?.id) {
				return;
			}
			if (!giftMediaUrl.trim()) {
				toast.error("Por favor, selecione um GIF ou informe o link da imagem.");
				return;
			}
			sendGiftMutation.mutate({
				mediaUrl: giftMediaUrl.trim(),
				message: giftMessage.trim() || null,
				recipientId: profile.id,
			});
		},
		[giftMediaUrl, giftMessage, profile?.id, sendGiftMutation]
	);

	const handleDeleteGift = useCallback(
		(giftId: string) => {
			deleteGiftMutation.mutate({ giftId });
		},
		[deleteGiftMutation]
	);

	const handleSignOut = useCallback(async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}, [router]);

	const toggleGiftForm = useCallback(() => {
		setShowGiftForm((prev) => !prev);
	}, []);

	const closeGiftForm = useCallback(() => {
		setShowGiftForm(false);
	}, []);

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
					className="btn-tactile inline-block rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm dark:border-white"
					href="/profile"
				>
					Voltar ao Meu Perfil
				</Link>
			</div>
		);
	}

	const completedChallenges = profile.completedChallenges ?? 0;
	const badges = (profile.badges ?? []).filter(
		(b): b is NonNullable<typeof b> => Boolean(b)
	);
	const points = profile.points ?? 0;
	const gifts = profile.gifts ?? [];
	const currentUserId = session?.user?.id;
	const currentUserRole = (session?.user as { role?: string } | undefined)
		?.role;

	return (
		<div className="mx-auto max-w-2xl space-y-6 px-4 py-6 pb-28">
			{/* Navigation header when visiting another user's profile */}
			{isOwner ? null : (
				<div className="flex items-center justify-between gap-2">
					<Link
						className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
						href="/profile"
					>
						&larr; MEU PERFIL
					</Link>
					<PopBadge color="yellow">VISUALIZANDO PERFIL PÚBLICO</PopBadge>
				</div>
			)}

			{/* Member ID Pass Card */}
			<div className="relative overflow-hidden rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<div className="absolute top-0 right-0 left-0 h-1.5 bg-[#FACC15]" />

				<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
					{/* Avatar or Custom GIF */}
					<div className="relative">
						{profile.gifUrl ? (
							<img
								alt="Avatar Membro"
								className="h-20 w-20 rounded-md border-2 border-black object-cover shadow-hard-sm sm:h-24 sm:w-24 dark:border-white"
								height={96}
								src={profile.gifUrl}
								width={96}
							/>
						) : (
							<div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] font-black font-display text-3xl text-white shadow-hard-sm sm:h-24 sm:w-24 sm:text-4xl dark:border-white">
								{profile.name ? profile.name.charAt(0).toUpperCase() : "M"}
							</div>
						)}
						<div className="absolute -right-2 -bottom-2">
							<PopBadge color={profile.role === "ADMIN" ? "yellow" : "black"}>
								{profile.role === "ADMIN" ? "ADMIN" : "MEMBRO"}
							</PopBadge>
						</div>
					</div>

					<div className="min-w-0 flex-1 space-y-1.5">
						<h1 className="truncate font-black font-display text-2xl uppercase tracking-tight sm:text-3xl">
							{profile.name || "MEMBRO EJ"}
						</h1>
						{isOwner ? (
							<p className="truncate font-mono text-muted-foreground text-xs">
								{session?.user?.email}
							</p>
						) : null}
						<div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
							<PopBadge color="neutral">
								DIRETORIA {"//"} {profile.department}
							</PopBadge>
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

				{/* Gamification Stats */}
				<div className="mt-5 grid grid-cols-3 gap-2 border-black/10 border-t-2 pt-3 sm:mt-6 sm:gap-3 sm:pt-4 dark:border-white/10">
					<div className="rounded-md border-2 border-black bg-secondary/40 p-2 text-center sm:p-3 dark:border-white">
						<span className="block truncate font-black font-display text-[9px] text-muted-foreground uppercase sm:text-[10px]">
							PONTUAÇÃO
						</span>
						<span className="font-black font-display text-[#FF4A1C] text-lg sm:text-2xl">
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
							{badges.length}
						</span>
					</div>
				</div>
			</div>

			{/* Badges / Selos Conquistados */}
			<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<div className="flex items-center gap-2 border-black/10 border-b-2 pb-2 dark:border-white/10">
					<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FACC15] dark:border-white" />
					<h2 className="font-black font-display text-sm uppercase tracking-wider">
						SELOS & BADGES CONQUISTADOS
					</h2>
				</div>

				{badges.length > 0 ? (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{badges.map((b) => (
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

			{/* MURAL//PRESENTES */}
			<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<div className="flex flex-col justify-between gap-3 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
					<div>
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
							<h2 className="font-black font-display text-sm uppercase tracking-wider">
								MURAL{"//"}PRESENTES
							</h2>
						</div>
						<p className="mt-0.5 font-medium text-muted-foreground text-xs">
							Deixe um GIF de comemoração, meme ou reconhecimento para este
							membro!
						</p>
					</div>

					<button
						className="btn-tactile inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-[#FF4A1C] px-3.5 py-2 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] dark:border-white"
						onClick={toggleGiftForm}
						type="button"
					>
						{showGiftForm ? "✕ FECHAR FORMULÁRIO" : "+ DEIXAR UM PRESENTE"}
					</button>
				</div>

				{/* Expandable Gift Form */}
				{showGiftForm ? (
					<form
						className="space-y-4 rounded-md border-2 border-black bg-secondary/30 p-4 shadow-hard-sm dark:border-white"
						onSubmit={handleSendGift}
					>
						<div className="border-black/10 border-b pb-2 dark:border-white/10">
							<span className="font-black font-display text-xs uppercase tracking-wider">
								ENVIAR PRESENTE PARA{" "}
								{profile.name?.split(" ")[0]?.toUpperCase() ?? "ESTE MEMBRO"}
							</span>
						</div>

						{/* Quick GIF Presets */}
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-[11px] uppercase tracking-wider"
								htmlFor="preset-buttons"
								id="preset-label"
							>
								Escolha Rápida de GIF Reação:
							</label>
							<div aria-labelledby="preset-label" className="flex flex-wrap gap-1.5" id="preset-buttons">
								{GIF_PRESETS.map((preset) => (
									<button
										className={`btn-tactile rounded border-2 px-2 py-1 font-black font-display text-[10px] uppercase transition ${
											giftMediaUrl === preset.url
												? "border-black bg-[#FACC15] text-[#121212] shadow-hard-sm dark:border-white"
												: "border-black/30 bg-background text-muted-foreground hover:border-black dark:border-white/30"
										}`}
										key={preset.label}
										onClick={() => setGiftMediaUrl(preset.url)}
										type="button"
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>

						{/* Direct URL Input */}
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="giftMediaUrl"
							>
								URL do GIF ou Imagem
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="giftMediaUrl"
								onChange={(e) => setGiftMediaUrl(e.target.value)}
								placeholder="https://media.giphy.com/... ou cole qualquer link de imagem"
								required
								type="url"
								value={giftMediaUrl}
							/>
							<div className="flex flex-col justify-between gap-1.5 pt-1 sm:flex-row sm:items-center">
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Ou envie uma foto/GIF do seu computador:
								</span>
								<CloudinaryUploadButton
									folder="orcestra-gifts"
									label="Upload Imagem / GIF"
									onUploadSuccess={(url) => {
										setGiftMediaUrl(url);
										toast.success("Imagem carregada!");
									}}
								/>
							</div>
						</div>

						{/* Live Preview */}
						{giftMediaUrl ? (
							<div className="relative overflow-hidden rounded-md border-2 border-black bg-background p-2 text-center dark:border-white">
								<span className="mb-1 block font-bold font-mono text-[10px] text-muted-foreground uppercase">
									Prévia do Presente:
								</span>
								<img
									alt="Prévia do Presente"
									className="mx-auto max-h-48 rounded border border-black/20 object-contain shadow-xs dark:border-white/20"
									height={192}
									src={giftMediaUrl}
									width={250}
								/>
							</div>
						) : null}

						{/* Message input */}
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="giftMessage"
							>
								Dedicatória / Mensagem (Opcional)
							</label>
							<textarea
								className="w-full rounded-md border-2 border-black bg-background p-2.5 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="giftMessage"
								maxLength={300}
								onChange={(e) => setGiftMessage(e.target.value)}
								placeholder="Ex: Mandou bem demais resolvendo o bug do backend! Parabéns pelo empenho!"
								rows={2}
								value={giftMessage}
							/>
							<div className="text-right font-mono text-[10px] text-muted-foreground">
								{giftMessage.length}/300 caracteres
							</div>
						</div>

						{/* Submit button */}
						<div className="flex items-center justify-end gap-2 pt-1">
							<button
								className="btn-tactile rounded-md border-2 border-black bg-secondary px-3 py-2 font-bold font-display text-xs uppercase dark:border-white"
								onClick={closeGiftForm}
								type="button"
							>
								CANCELAR
							</button>
							<button
								className="btn-tactile rounded-md border-2 border-black bg-[#FF4A1C] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
								disabled={
									sendGiftMutation.isPending || !giftMediaUrl.trim()
								}
								type="submit"
							>
								{sendGiftMutation.isPending
									? "ENVIANDO..."
									: "ENVIAR PRESENTE"}
							</button>
						</div>
					</form>
				) : null}

				{/* Gifts Feed / Grid */}
				{gifts.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{gifts.map((g) => {
							const canDelete =
								isOwner ||
								g.senderId === currentUserId ||
								currentUserRole === "ADMIN";

							const senderName = g.sender?.name ?? "Membro orc//desafios";
							const senderDept = g.sender?.department ?? "MEMBRO";
							const senderAvatar = g.sender?.gifUrl;
							const senderId = g.sender?.id ?? g.senderId;

							return (
								<div
									className="relative flex flex-col justify-between overflow-hidden rounded-lg border-2 border-black bg-secondary/30 p-3 shadow-hard-sm dark:border-white"
									key={g.id}
								>
									{/* Sender header */}
									<div className="mb-2 flex items-center justify-between border-black/10 border-b pb-2 dark:border-white/10">
										<Link
											className="group flex min-w-0 items-center gap-2"
											href={`/profile?id=${senderId}`}
										>
											{senderAvatar ? (
												<img
													alt={senderName}
													className="h-6 w-6 shrink-0 rounded-full border border-black object-cover dark:border-white"
													height={24}
													src={senderAvatar}
													width={24}
												/>
											) : (
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black bg-[#FF4A1C] font-black text-[10px] text-white dark:border-white">
													{senderName.charAt(0).toUpperCase()}
												</div>
											)}
											<div className="flex min-w-0 flex-col">
												<span className="truncate font-bold font-display text-xs uppercase leading-none group-hover:underline">
													{senderName}
												</span>
												<span className="font-mono text-[9px] text-muted-foreground uppercase">
													{senderDept}
												</span>
											</div>
										</Link>

										<span className="shrink-0 font-mono text-[10px] text-muted-foreground">
											{new Date(g.createdAt).toLocaleDateString("pt-BR", {
												day: "2-digit",
												month: "short",
											})}
										</span>
									</div>

									{/* Media view */}
									<div className="relative my-1 flex min-h-[140px] max-h-56 items-center justify-center overflow-hidden rounded-md border-2 border-black bg-black/5 dark:border-white dark:bg-black/20">
										<img
											alt="Presente"
											className="max-h-56 w-full object-contain"
											height={224}
											loading="lazy"
											src={g.mediaUrl}
											width={300}
										/>
									</div>

									{/* Message & Actions */}
									<div className="mt-2 space-y-2">
										{g.message ? (
											<p className="rounded border border-black/20 bg-card p-2 font-medium font-sans text-xs italic dark:border-white/20">
												“{g.message}”
											</p>
										) : null}

										{canDelete ? (
											<div className="flex justify-end pt-1">
												<button
													className="font-bold font-mono text-[10px] text-destructive uppercase tracking-wider hover:underline"
													onClick={() => handleDeleteGift(g.id)}
													type="button"
												>
													[ REMOVER ]
												</button>
											</div>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="rounded-md border-2 border-black border-dashed bg-secondary/20 p-6 text-center dark:border-white">
						<span className="block font-black font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							[ MURAL VAZIO ]
						</span>
						<p className="mt-2 font-mono text-muted-foreground text-xs uppercase">
							Nenhum presente no mural ainda.
						</p>
						<p className="mt-1 font-sans text-muted-foreground text-xs">
							Deixe um GIF animado ou imagem para celebrar e reconhecer o
							trabalho deste membro!
						</p>
					</div>
				)}
			</div>

			{/* Track Inscription Toggles / Public View */}
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

				<div className="space-y-2.5">
					{TRACKS.map((t) => {
						const isEnabled = isOwner
							? tracks.includes(t.id)
							: (profile.trackPreferencesList || []).includes(t.id);

						if (!isOwner && !isEnabled) {
							return null;
						}

						if (isOwner) {
							return (
								<button
									className={`btn-tactile flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border-2 p-3 text-left transition-all ${
										isEnabled
											? "border-black bg-secondary text-foreground shadow-hard-sm dark:border-white"
											: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
									}`}
									key={t.id}
									onClick={() => toggleTrack(t.id)}
									type="button"
								>
									<div className="min-w-0 flex-1 space-y-0.5">
										<div className="flex items-center gap-2">
											<PopTrackBadge track={t.id} />
										</div>
										<span className="line-clamp-1 font-mono text-[10px] text-muted-foreground sm:line-clamp-none">
											{t.desc}
										</span>
									</div>

									<div
										className={`flex h-6 w-8 shrink-0 items-center justify-center rounded-sm border-2 border-black font-black text-xs ${
											isEnabled
												? "bg-[#15803D] text-white"
												: "bg-muted text-muted-foreground"
										}`}
									>
										{isEnabled ? "ON" : "OFF"}
									</div>
								</button>
							);
						}

						return (
							<div
								className="flex items-center justify-between gap-3 rounded-md border-2 border-black bg-secondary p-3 text-foreground shadow-hard-sm dark:border-white"
								key={t.id}
							>
								<div className="min-w-0 flex-1 space-y-0.5">
									<div className="flex items-center gap-2">
										<PopTrackBadge track={t.id} />
									</div>
									<span className="line-clamp-1 font-mono text-[10px] text-muted-foreground sm:line-clamp-none">
										{t.desc}
									</span>
								</div>
							</div>
						);
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

			{/* Edit Personal Data - ONLY for Profile Owner */}
			{isOwner ? (
				<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
					<div className="border-black/10 border-b-2 pb-2 dark:border-white/10">
						<h2 className="font-black font-display text-sm uppercase tracking-wider">
							DADOS PESSOAIS & COMUNICAÇÃO
						</h2>
					</div>

					<form className="space-y-4" onSubmit={handleSave}>
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="name"
							>
								Nome Completo
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="name"
								onChange={(e) => setName(e.target.value)}
								required
								type="text"
								value={name}
							/>
						</div>

						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="department"
							>
								Diretoria
							</label>
							<select
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="department"
								onChange={(e) =>
									setDepartment(
										e.target.value as "DIPROJ" | "DIBIS" | "DICOM" | "TOPS"
									)
								}
								value={department}
							>
								{DEPARTMENTS.map((d) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="whatsapp"
							>
								WhatsApp com DDD
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="whatsapp"
								onChange={(e) => setWhatsapp(e.target.value)}
								placeholder="5511999998888"
								type="tel"
								value={whatsapp}
							/>
						</div>

						{/* Custom Avatar / GIF via Cloudinary */}
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="gifUrl"
							>
								Avatar Personalizado / GIF
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id="gifUrl"
								onChange={(e) => setGifUrl(e.target.value)}
								placeholder="https://res.cloudinary.com/... ou URL de imagem"
								type="url"
								value={gifUrl}
							/>
							<div className="flex flex-col justify-between gap-1.5 pt-1 sm:flex-row sm:items-center">
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Faça upload direto de avatar/GIF:
								</span>
								<CloudinaryUploadButton
									folder="orcestra-avatars"
									label="Enviar Imagem"
									onUploadSuccess={(url) => {
										setGifUrl(url);
										toast.success("Imagem carregada via Cloudinary!");
									}}
								/>
							</div>
						</div>

						<button
							className="btn-tactile w-full rounded-md border-2 border-black bg-[#FF4A1C] py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
							disabled={updateProfileMutation.isPending}
							type="submit"
						>
							{updateProfileMutation.isPending
								? "SALVANDO..."
								: "SALVAR ALTERAÇÕES"}
						</button>
					</form>
				</div>
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
