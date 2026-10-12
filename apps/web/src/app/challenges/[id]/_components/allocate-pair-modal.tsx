"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Info, UserPlus, X } from "lucide-react";
import type React from "react";
import { useCallback, useId, useState } from "react";
import { BauhausSkeleton } from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";

export interface AllocatePairModalProps {
	challengeId: string;
	challengeTitle: string;
	isOpen: boolean;
	isPending: boolean;
	onAllocate: (data: {
		challengeId: string;
		member1Id: string;
		member2Id: string;
		member3Id?: string | null;
	}) => void;
	onClose: () => void;
}

function getMemberTag(
	isAssigned: boolean,
	isMatchingTrack: boolean,
	challengeTrack: string
) {
	if (isAssigned) {
		return "[JÁ ALOCADO]";
	}
	if (isMatchingTrack) {
		return `[${challengeTrack}]`;
	}
	return "[OUTRA TRILHA]";
}

export function AllocatePairModal({
	challengeId,
	challengeTitle,
	isOpen,
	isPending,
	onAllocate,
	onClose,
}: AllocatePairModalProps) {
	const member1InputId = useId();
	const member2InputId = useId();
	const member3InputId = useId();

	const [member1Id, setMember1Id] = useState("");
	const [member2Id, setMember2Id] = useState("");
	const [member3Id, setMember3Id] = useState("");
	const [isTrio, setIsTrio] = useState(false);

	const membersQuery = useQuery(
		trpc.admin.listMembersForChallenge.queryOptions(
			{ challengeId },
			{ enabled: isOpen }
		)
	);

	const { data } = membersQuery;
	const members = data?.members ?? [];
	const challengeTrack = data?.challengeTrack ?? "";

	const trackMembersCount = members.filter((m) => m.isMatchingTrack).length;
	const unassignedCount = members.filter((m) => !m.isAssigned).length;

	const handleChangeMember1 = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setMember1Id(e.target.value);
		},
		[]
	);

	const handleChangeMember2 = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setMember2Id(e.target.value);
		},
		[]
	);

	const handleChangeMember3 = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setMember3Id(e.target.value);
		},
		[]
	);

	const handleToggleTrio = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setIsTrio(e.target.checked);
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!(member1Id && member2Id) || member1Id === member2Id) {
				return;
			}
			if (
				isTrio &&
				member3Id &&
				(member3Id === member1Id || member3Id === member2Id)
			) {
				return;
			}

			onAllocate({
				challengeId,
				member1Id,
				member2Id,
				member3Id: isTrio && member3Id ? member3Id : null,
			});
		},
		[challengeId, isTrio, member1Id, member2Id, member3Id, onAllocate]
	);

	if (!isOpen) {
		return null;
	}

	const canSubmit =
		Boolean(member1Id) &&
		Boolean(member2Id) &&
		member1Id !== member2Id &&
		(!(isTrio && member3Id) ||
			(member3Id !== member1Id && member3Id !== member2Id));

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
				{/* Header */}
				<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
					<div className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#FFD700] text-black shadow-hard-sm dark:border-white">
							<UserPlus className="h-5 w-5" />
						</div>
						<div>
							<h3 className="font-black font-display text-base uppercase sm:text-lg">
								ALOCAÇÃO MANUAL DE DUPLA
							</h3>
							<p className="font-mono text-muted-foreground text-xs uppercase">
								{challengeTitle}
							</p>
						</div>
					</div>
					<button
						className="btn-tactile rounded-md border-2 border-black bg-secondary p-1.5 hover:bg-muted dark:border-white"
						onClick={onClose}
						type="button"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Info stats */}
				<div className="mt-4 rounded-md border-2 border-black/20 bg-secondary/30 p-3 text-xs dark:border-white/20">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center gap-1.5 font-bold font-mono text-[11px]">
							<span className="rounded bg-primary/20 px-1.5 py-0.5 text-primary">
								TRILHA: {challengeTrack || "—"}
							</span>
						</div>
						<div className="font-mono text-[11px] text-muted-foreground">
							{trackMembersCount} na trilha • {unassignedCount} livres
						</div>
					</div>
					<p className="mt-1.5 font-mono text-[10px] text-muted-foreground leading-relaxed">
						<Info className="mr-1 inline h-3 w-3 text-primary" />
						Membros com a trilha ativa aparecem marcados com [TRILHA]. Membros
						já alocados ficam desabilitados.
					</p>
				</div>

				{membersQuery.isLoading ? (
					<div className="my-6">
						<BauhausSkeleton />
					</div>
				) : (
					<form className="mt-4 space-y-4" onSubmit={handleSubmit}>
						{/* Membro 1 */}
						<div className="space-y-1.5">
							<label
								className="block font-bold font-mono text-xs uppercase"
								htmlFor={member1InputId}
							>
								Membro 1 *
							</label>
							<select
								className="w-full rounded-md border-2 border-black bg-background px-3 py-2 font-mono text-xs shadow-hard-xs focus:outline-hidden focus:ring-2 focus:ring-primary dark:border-white"
								id={member1InputId}
								onChange={handleChangeMember1}
								required
								value={member1Id}
							>
								<option value="">-- SELECIONE O PRIMEIRO MEMBRO --</option>
								{members.map((m) => {
									const isCurrentSelected =
										m.id === member2Id || (isTrio && m.id === member3Id);
									const isDisabled = m.isAssigned || isCurrentSelected;
									const tag = getMemberTag(
										m.isAssigned,
										m.isMatchingTrack,
										challengeTrack
									);

									return (
										<option
											disabled={isDisabled}
											key={`m1-${m.id}`}
											value={m.id}
										>
											{tag} {m.name} ({m.department || "Membro"}) - {m.points}{" "}
											pts
										</option>
									);
								})}
							</select>
						</div>

						{/* Membro 2 */}
						<div className="space-y-1.5">
							<label
								className="block font-bold font-mono text-xs uppercase"
								htmlFor={member2InputId}
							>
								Membro 2 *
							</label>
							<select
								className="w-full rounded-md border-2 border-black bg-background px-3 py-2 font-mono text-xs shadow-hard-xs focus:outline-hidden focus:ring-2 focus:ring-primary dark:border-white"
								id={member2InputId}
								onChange={handleChangeMember2}
								required
								value={member2Id}
							>
								<option value="">-- SELECIONE O SEGUNDO MEMBRO --</option>
								{members.map((m) => {
									const isCurrentSelected =
										m.id === member1Id || (isTrio && m.id === member3Id);
									const isDisabled = m.isAssigned || isCurrentSelected;
									const tag = getMemberTag(
										m.isAssigned,
										m.isMatchingTrack,
										challengeTrack
									);

									return (
										<option
											disabled={isDisabled}
											key={`m2-${m.id}`}
											value={m.id}
										>
											{tag} {m.name} ({m.department || "Membro"}) - {m.points}{" "}
											pts
										</option>
									);
								})}
							</select>
						</div>

						{/* Toggle Trio */}
						<div className="flex items-center gap-2 border-black/10 border-t pt-2 dark:border-white/10">
							<input
								checked={isTrio}
								className="h-4 w-4 rounded border-2 border-black text-primary focus:ring-0 dark:border-white"
								id="toggle-trio"
								onChange={handleToggleTrio}
								type="checkbox"
							/>
							<label
								className="cursor-pointer font-bold font-mono text-xs uppercase"
								htmlFor="toggle-trio"
							>
								Formar Trio (Adicionar Membro 3)
							</label>
						</div>

						{/* Membro 3 (opcional) */}
						{isTrio ? (
							<div className="space-y-1.5">
								<label
									className="block font-bold font-mono text-xs uppercase"
									htmlFor={member3InputId}
								>
									Membro 3 (Opcional para Trio)
								</label>
								<select
									className="w-full rounded-md border-2 border-black bg-background px-3 py-2 font-mono text-xs shadow-hard-xs focus:outline-hidden focus:ring-2 focus:ring-primary dark:border-white"
									id={member3InputId}
									onChange={handleChangeMember3}
									value={member3Id}
								>
									<option value="">-- SELECIONE O TERCEIRO MEMBRO --</option>
									{members.map((m) => {
										const isCurrentSelected =
											m.id === member1Id || m.id === member2Id;
										const isDisabled = m.isAssigned || isCurrentSelected;
										const tag = getMemberTag(
											m.isAssigned,
											m.isMatchingTrack,
											challengeTrack
										);

										return (
											<option
												disabled={isDisabled}
												key={`m3-${m.id}`}
												value={m.id}
											>
												{tag} {m.name} ({m.department || "Membro"}) - {m.points}{" "}
												pts
											</option>
										);
									})}
								</select>
							</div>
						) : null}

						{/* Actions */}
						<div className="flex items-center justify-end gap-2 border-black/10 border-t pt-3 dark:border-white/10">
							<button
								className="btn-tactile rounded-md border-2 border-black bg-secondary px-4 py-2 font-black font-display text-foreground text-xs uppercase hover:bg-muted dark:border-white"
								onClick={onClose}
								type="button"
							>
								CANCELAR
							</button>
							<button
								className="btn-tactile flex items-center gap-1.5 rounded-md border-2 border-black bg-[#15803D] px-4 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:opacity-90 disabled:opacity-50 dark:border-white"
								disabled={!canSubmit || isPending}
								type="submit"
							>
								<Check className="h-3.5 w-3.5" />
								<span>{isPending ? "ALOCANDO..." : "CONFIRMAR ALOCAÇÃO"}</span>
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
