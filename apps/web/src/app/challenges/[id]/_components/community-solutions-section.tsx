import { ExternalLink, GitPullRequest, Lock, Unlock } from "lucide-react";
import Image from "next/image";
import { PopBadge } from "@/components/pop-elements";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import { renderSubmissionNotes } from "./submission-utils";
import type { ChallengeSubmission, SubmissionMember } from "./types";

interface CommunitySolutionsSectionProps {
	canViewAllSolutions?: boolean;
	hasMyPair: boolean;
	onOpenSubmit: () => void;
	submissions?: ChallengeSubmission[];
}

function MemberAvatar({ member }: { member: SubmissionMember }) {
	if (member.gifUrl) {
		return (
			<Image
				alt={member.name}
				className="inline-block h-6 w-6 rounded-full border border-black object-cover dark:border-white"
				height={24}
				src={getOptimizedMediaUrl(member.gifUrl, {
					crop: "fill",
					height: 48,
					width: 48,
				})}
				unoptimized
				width={24}
			/>
		);
	}
	return (
		<div className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-secondary font-black font-display text-[9px] uppercase dark:border-white">
			{member.name.charAt(0)}
		</div>
	);
}

function SubmissionCard({
	hasMyPair,
	onOpenSubmit,
	sub,
}: {
	hasMyPair: boolean;
	onOpenSubmit: () => void;
	sub: ChallengeSubmission;
}) {
	const members = [sub.member1, sub.member2, sub.member3].filter(
		(m): m is NonNullable<typeof m> => Boolean(m)
	);
	const isLocked = sub.isSpoilerLocked;

	return (
		<div
			className={`rounded-md border-2 p-3.5 transition sm:p-4 ${
				sub.isMyOwnPair
					? "border-[#FF4A1C] bg-[#FF4A1C]/5 shadow-hard-sm"
					: "border-black bg-card dark:border-white"
			}`}
		>
			{/* Submission Header */}
			<div className="flex flex-col justify-between gap-2 border-black/10 border-b pb-2.5 sm:flex-row sm:items-center dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex -space-x-1.5 overflow-hidden">
						{members.map((m) => (
							<MemberAvatar key={m.id} member={m} />
						))}
					</div>

					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-black font-display text-xs uppercase">
							{members.map((m) => m.name.split(" ")[0]).join(" & ")}
						</span>
						{sub.isMyOwnPair ? (
							<PopBadge color="neutral">SUA DUPLA</PopBadge>
						) : null}
					</div>
				</div>

				<div className="flex items-center gap-2 text-[10px] sm:text-xs">
					<span className="font-mono text-muted-foreground uppercase">
						{new Date(sub.updatedAt).toLocaleDateString("pt-BR", {
							day: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
							month: "short",
						})}
					</span>
					<PopBadge color={sub.status === "APPROVED" ? "green" : "neutral"}>
						{sub.status === "APPROVED" ? "APROVADO" : "SUBMETIDO"}
					</PopBadge>
				</div>
			</div>

			{/* Submission Content */}
			<div className="pt-3">
				{isLocked ? (
					<div className="relative overflow-hidden rounded-md border-2 border-black bg-[#121212] p-4 text-white shadow-hard dark:border-white dark:bg-[#0A0A0A]">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1.5">
								<div className="flex items-center gap-2">
									<span className="rounded-xs border border-white/40 bg-[#FF4A1C] px-1.5 py-0.5 font-black font-mono text-[9px] text-white uppercase tracking-wider">
										[ CONTEÚDO BLOQUEADO {"//"} ANTI-SPOILER ]
									</span>
								</div>
								<h4 className="font-black font-display text-white text-xs uppercase sm:text-sm">
									RESPOSTAS E ARQUIVOS OCULTOS
								</h4>
								<p className="max-w-md font-medium text-white/70 text-xs">
									O código, link de PR e anotações desta entrega foram tarjados
									de preto para evitar spoilers. Envie a solução da sua dupla
									para desbloquear.
								</p>
							</div>

							{hasMyPair ? (
								<button
									className="btn-tactile shrink-0 rounded-md border-2 border-white bg-primary px-3.5 py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90"
									onClick={onOpenSubmit}
									type="button"
								>
									SUBMETER MINHA SOLUÇÃO &rarr;
								</button>
							) : null}
						</div>
					</div>
				) : (
					<div className="space-y-3 font-sans text-xs">
						<div className="flex flex-wrap items-center gap-2">
							{sub.prUrl ? (
								<a
									className="btn-tactile inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-[#1E40AF] px-3 py-1.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#1D4ED8] dark:border-white"
									href={sub.prUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									<GitPullRequest className="h-3.5 w-3.5" />
									<span>VER PULL REQUEST &rarr;</span>
								</a>
							) : null}

							{sub.repoUrl ? (
								<a
									className="btn-tactile inline-flex items-center gap-1.5 rounded-md border border-black bg-secondary px-2.5 py-1.5 font-mono text-[11px] text-foreground hover:bg-muted dark:border-white"
									href={sub.repoUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									<ExternalLink className="h-3 w-3" />
									<span className="max-w-xs truncate">{sub.repoUrl}</span>
								</a>
							) : null}
						</div>

						{sub.submissionNotes ? (
							<div className="rounded-md border border-black/20 bg-secondary/30 p-3 dark:border-white/20">
								<span className="mb-1 block font-mono text-[10px] text-muted-foreground uppercase">
									NOTAS {"//"} EXPLICAÇÃO DA DUPLA:
								</span>
								<div className="font-mono text-xs leading-relaxed">
									{renderSubmissionNotes(sub.submissionNotes)}
								</div>
							</div>
						) : null}

						{sub.feedback ? (
							<div className="rounded-md border border-emerald-600/40 bg-emerald-500/10 p-2.5 font-mono text-emerald-950 text-xs dark:text-emerald-300">
								<strong className="block font-bold text-[10px] uppercase">
									FEEDBACK DO ASSESSOR:
								</strong>
								<p className="mt-0.5">{sub.feedback}</p>
							</div>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}

export function CommunitySolutionsSection({
	canViewAllSolutions,
	hasMyPair,
	onOpenSubmit,
	submissions,
}: CommunitySolutionsSectionProps) {
	const hasSubmissions = submissions && submissions.length > 0;

	return (
		<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-5 sm:p-6 dark:border-white">
			<div className="flex flex-col justify-between gap-2 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-sm border border-black bg-[#FF4A1C] text-white dark:border-white">
							{canViewAllSolutions ? (
								<Unlock className="h-3.5 w-3.5" />
							) : (
								<Lock className="h-3.5 w-3.5" />
							)}
						</div>
						<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
							SOLUÇÕES {"//"} ENTREGAS DAS DUPLAS
						</h3>
					</div>
					<p className="font-medium text-muted-foreground text-xs">
						{canViewAllSolutions
							? "Você já enviou sua solução ou o prazo expirou. Todas as submissões estão desbloqueadas para estudo e comparação."
							: "Modo anti-spoiler ativo. As respostas de outras duplas estão protegidas com tarja preta até que sua dupla submeta a solução."}
					</p>
				</div>

				<div>
					{canViewAllSolutions ? (
						<PopBadge color="green">SPOILER LIBERADO</PopBadge>
					) : (
						<PopBadge color="yellow">ANTI-SPOILER ATIVO</PopBadge>
					)}
				</div>
			</div>

			{hasSubmissions ? (
				<div className="space-y-4">
					{submissions.map((sub) => (
						<SubmissionCard
							hasMyPair={hasMyPair}
							key={sub.id}
							onOpenSubmit={onOpenSubmit}
							sub={sub}
						/>
					))}
				</div>
			) : (
				<div className="rounded-md border-2 border-black border-dashed bg-secondary/30 p-6 text-center dark:border-white">
					<span className="block font-black font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						[ NENHUMA DUPLA SUBMETEU AINDA ]
					</span>
					<p className="mt-1 font-sans text-muted-foreground text-xs">
						Assim que a primeira entrega for enviada pelos membros, ela
						aparecerá aqui.
					</p>
				</div>
			)}
		</div>
	);
}
