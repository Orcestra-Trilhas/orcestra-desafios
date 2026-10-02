"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import {
	BauhausSkeleton,
	PopBadge,
	PopTrackBadge,
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
		desc: "Figma, UI/UX, Design Systems & Tokens",
		id: "PROTOTIPACAO",
		label: "PROTOTIPAGEM",
	},
	{
		desc: "Docker, CI/CD, Neon Cloud & Vercel",
		id: "DEVOPS",
		label: "DEVOPS // INFRA",
	},
] as const;

export default function ProfilePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const userMe = useQuery(trpc.user.me.queryOptions());
	const myPairs = useQuery(trpc.challenge.myPairs.queryOptions());

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

	const [name, setName] = useState("");
	const [department, setDepartment] = useState<
		"DIPROJ" | "DIBIS" | "DICOM" | "TOPS"
	>("DIPROJ");
	const [whatsapp, setWhatsapp] = useState("");
	const [gifUrl, setGifUrl] = useState("");
	const [tracks, setTracks] = useState<string[]>([]);

	useEffect(() => {
		if (userMe.data) {
			setName(userMe.data.name || "");
			setDepartment(
				(userMe.data.department as "DIPROJ" | "DIBIS" | "DICOM" | "TOPS") ||
					"DIPROJ"
			);
			setWhatsapp(userMe.data.whatsapp || "");
			setGifUrl(userMe.data.gifUrl || "");
			setTracks(userMe.data.trackPreferencesList || []);
		}
	}, [userMe.data]);

	const toggleTrack = (trackId: string) => {
		const updated = tracks.includes(trackId)
			? tracks.filter((t) => t !== trackId)
			: [...tracks, trackId];
		setTracks(updated);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		updateProfileMutation.mutate({
			department,
			gifUrl: gifUrl || null,
			name,
			trackPreferences: tracks,
			whatsapp: whatsapp || null,
		});
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	};

	const completedChallenges =
		myPairs.data?.filter((p) => p.status === "APPROVED").length ?? 0;
	const badges = (userMe.data?.badges ?? []).filter(
		(b): b is NonNullable<typeof b> => Boolean(b)
	);
	const points = userMe.data?.points ?? 0;

	if (userMe.isLoading) {
		return (
			<div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
				<BauhausSkeleton />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6 px-4 py-6 pb-28">
			{/* Member ID Pass Card */}
			<div className="relative overflow-hidden rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<div className="absolute top-0 right-0 left-0 h-1.5 bg-[#FACC15]" />

				<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
					{/* Avatar or Custom GIF */}
					<div className="relative">
						{gifUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								alt="Avatar Membro"
								className="h-20 w-20 rounded-md border-2 border-black object-cover shadow-hard-sm sm:h-24 sm:w-24 dark:border-white"
								src={gifUrl}
							/>
						) : (
							<div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] font-black font-display text-3xl text-white shadow-hard-sm sm:h-24 sm:w-24 sm:text-4xl dark:border-white">
								{name ? name.charAt(0).toUpperCase() : "M"}
							</div>
						)}
						<div className="absolute -right-2 -bottom-2">
							<PopBadge
								color={userMe.data?.role === "ADMIN" ? "yellow" : "black"}
							>
								{userMe.data?.role === "ADMIN" ? "ADMIN" : "MEMBRO"}
							</PopBadge>
						</div>
					</div>

					<div className="min-w-0 flex-1 space-y-1.5">
						<h1 className="truncate font-black font-display text-2xl uppercase tracking-tight sm:text-3xl">
							{name || "MEMBRO EJ"}
						</h1>
						<p className="truncate font-mono text-muted-foreground text-xs">
							{session?.user?.email}
						</p>
						<div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
							<PopBadge color="neutral">DIRETORIA // {department}</PopBadge>
							{whatsapp ? (
								<span className="rounded-md border-2 border-black bg-secondary px-2.5 py-0.5 font-bold font-mono text-[11px] uppercase dark:border-white">
									ZAP: {whatsapp}
								</span>
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

			{/* Track Inscription Toggles */}
			<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<div className="space-y-1 border-black/10 border-b-2 pb-3 dark:border-white/10">
					<h2 className="font-black font-display text-sm uppercase tracking-wider">
						INSCRIÇÃO AUTOMÁTICA EM TRILHAS TÉCNICAS
					</h2>
					<p className="font-medium text-muted-foreground text-xs">
						Selecione as trilhas que você deseja receber desafios e ser alocado
						em duplas automaticamente.
					</p>
				</div>

				<div className="space-y-2.5">
					{TRACKS.map((t) => {
						const isEnabled = tracks.includes(t.id);
						return (
							<div
								className={`btn-tactile flex cursor-pointer items-center justify-between gap-3 rounded-md border-2 p-3 transition-all ${
									isEnabled
										? "border-black bg-secondary text-foreground shadow-hard-sm dark:border-white"
										: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30"
								}`}
								key={t.id}
								onClick={() => toggleTrack(t.id)}
							>
								<div className="min-w-0 flex-1 space-y-0.5">
									<div className="flex items-center gap-2">
										<PopTrackBadge track={t.id} />
										<span className="font-black font-display text-xs uppercase">
											{t.label}
										</span>
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
							</div>
						);
					})}
				</div>
			</div>

			{/* Edit Personal Data */}
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

			{/* Logout Button */}
			<div className="pt-2 text-center">
				<button
					className="btn-tactile w-full rounded-md border-2 border-black bg-[#DC2626] px-6 py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#B91C1C] sm:w-auto sm:py-2 dark:border-white"
					onClick={handleSignOut}
					type="button"
				>
					DESCONECTAR // SAIR DA CONTA
				</button>
			</div>
		</div>
	);
}
