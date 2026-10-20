"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Info, User, UserPlus, Users, X } from "lucide-react";
import type React from "react";
import { useCallback, useId, useState } from "react";
import { BauhausSkeleton } from "@/components/pop-elements";
import { trpc } from "@/utils/trpc";

export type AllocationFormat = "SOLO" | "PAIR" | "TRIO";

export interface AllocatePairModalProps {
	challengeId: string;
	challengeTitle: string;
	isOpen: boolean;
	isPending: boolean;
	onAllocate: (data: {
		challengeId: string;
		member1Id: string;
		member2Id?: string | null;
		member3Id?: string | null;
	}) => void;
	onClose: () => void;
}

interface ModalMember {
	department?: string | null;
	id: string;
	isAssigned: boolean;
	isMatchingTrack: boolean;
	name: string;
	points: number;
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

function getFormatTitle(format: AllocationFormat): string {
	if (format === "SOLO") {
		return "SOLO";
	}
	if (format === "TRIO") {
		return "TRIO";
	}
	return "DUPLA";
}

function getSubmitButtonLabel(
	isPending: boolean,
	format: AllocationFormat
): string {
	if (isPending) {
		return "ALOCANDO...";
	}
	if (format === "SOLO") {
		return "CONFIRMAR ALOCAÇÃO SOLO";
	}
	return "CONFIRMAR ALOCAÇÃO";
}

function isFormValid(
	format: AllocationFormat,
	m1: string,
	m2: string,
	m3: string
): boolean {
	if (!m1) {
		return false;
	}
	if (format === "SOLO") {
		return true;
	}
	if (format === "PAIR") {
		return Boolean(m2) && m1 !== m2;
	}
	return Boolean(m2) && Boolean(m3) && m1 !== m2 && m1 !== m3 && m2 !== m3;
}

interface MemberSelectFieldProps {
	challengeTrack: string;
	excludeIds: string[];
	id: string;
	label: string;
	members: ModalMember[];
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	placeholder: string;
	value: string;
}

function MemberSelectField({
	challengeTrack,
	excludeIds,
	id,
	label,
	members,
	onChange,
	placeholder,
	value,
}: MemberSelectFieldProps) {
	return (
		<div className="space-y-1.5">
			<label
				className="block font-bold font-mono text-xs uppercase"
				htmlFor={id}
			>
				{label}
			</label>
			<select
				className="w-full rounded-md border-2 border-black bg-background px-3 py-2 font-mono text-xs shadow-hard-xs focus:outline-hidden focus:ring-2 focus:ring-primary dark:border-white"
				id={id}
				onChange={onChange}
				required
				value={value}
			>
				<option value="">{placeholder}</option>
				{members.map((m) => {
					const isExcluded = excludeIds.includes(m.id);
					const isDisabled = m.isAssigned || isExcluded;
					const tag = getMemberTag(
						m.isAssigned,
						m.isMatchingTrack,
						challengeTrack
					);

					return (
						<option disabled={isDisabled} key={`${id}-${m.id}`} value={m.id}>
							{tag} {m.name} ({m.department || "Membro"}) - {m.points} pts
						</option>
					);
				})}
			</select>
		</div>
	);
}

interface FormatSelectorProps {
	format: AllocationFormat;
	onSelectPair: () => void;
	onSelectSolo: () => void;
	onSelectTrio: () => void;
}

function FormatSelector({
	format,
	onSelectSolo,
	onSelectPair,
	onSelectTrio,
}: FormatSelectorProps) {
	return (
		<div className="space-y-1.5">
			<span className="block font-bold font-mono text-xs uppercase">
				Modalidade de Participação:
			</span>
			<div className="grid grid-cols-3 gap-2">
				<button
					className={`btn-tactile flex items-center justify-center gap-1.5 rounded-md border-2 border-black py-2 font-black font-display text-xs uppercase transition dark:border-white ${
						format === "SOLO"
							? "bg-primary text-primary-foreground shadow-hard-xs"
							: "bg-secondary text-foreground hover:bg-muted"
					}`}
					onClick={onSelectSolo}
					type="button"
				>
					<User className="h-3.5 w-3.5" />
					<span>SOLO (1)</span>
				</button>
				<button
					className={`btn-tactile flex items-center justify-center gap-1.5 rounded-md border-2 border-black py-2 font-black font-display text-xs uppercase transition dark:border-white ${
						format === "PAIR"
							? "bg-primary text-primary-foreground shadow-hard-xs"
							: "bg-secondary text-foreground hover:bg-muted"
					}`}
					onClick={onSelectPair}
					type="button"
				>
					<Users className="h-3.5 w-3.5" />
					<span>DUPLA (2)</span>
				</button>
				<button
					className={`btn-tactile flex items-center justify-center gap-1.5 rounded-md border-2 border-black py-2 font-black font-display text-xs uppercase transition dark:border-white ${
						format === "TRIO"
							? "bg-primary text-primary-foreground shadow-hard-xs"
							: "bg-secondary text-foreground hover:bg-muted"
					}`}
					onClick={onSelectTrio}
					type="button"
				>
					<Users className="h-3.5 w-3.5" />
					<span>TRIO (3)</span>
				</button>
			</div>
		</div>
	);
}

interface ContextBannerProps {
	challengeTrack: string;
	trackMembersCount: number;
	unassignedCount: number;
}

function ContextBanner({
	challengeTrack,
	trackMembersCount,
	unassignedCount,
}: ContextBannerProps) {
	return (
		<div className="mt-4 rounded-md border-2 border-border bg-muted/40 p-3">
			<div className="flex items-center justify-between">
				<div className="font-bold font-mono text-xs uppercase">
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
				Membros com a trilha ativa aparecem marcados com [TRILHA]. Membros já
				alocados ficam desabilitados.
			</p>
		</div>
	);
}

interface ModalHeaderProps {
	challengeTitle: string;
	format: AllocationFormat;
	onClose: () => void;
}

function ModalHeader({ challengeTitle, format, onClose }: ModalHeaderProps) {
	return (
		<div className="flex items-center justify-between border-black border-b-2 pb-3 dark:border-white">
			<div className="flex items-center gap-2.5">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-black bg-[#FFD700] text-black shadow-hard-sm dark:border-white">
					{format === "SOLO" ? (
						<User className="h-5 w-5" />
					) : (
						<UserPlus className="h-5 w-5" />
					)}
				</div>
				<div>
					<h3 className="font-black font-display text-base uppercase sm:text-lg">
						ALOCAÇÃO MANUAL {"//"} {getFormatTitle(format)}
					</h3>
					<p className="font-mono text-muted-foreground text-xs">
						{challengeTitle}
					</p>
				</div>
			</div>
			<button
				aria-label="Fechar modal"
				className="btn-tactile rounded-md border-2 border-black p-1 text-foreground hover:bg-muted dark:border-white"
				onClick={onClose}
				type="button"
			>
				<X className="h-5 w-5" />
			</button>
		</div>
	);
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

	const [format, setFormat] = useState<AllocationFormat>("SOLO");
	const [member1Id, setMember1Id] = useState("");
	const [member2Id, setMember2Id] = useState("");
	const [member3Id, setMember3Id] = useState("");

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

	const handleSelectSolo = useCallback(() => {
		setFormat("SOLO");
	}, []);

	const handleSelectPair = useCallback(() => {
		setFormat("PAIR");
	}, []);

	const handleSelectTrio = useCallback(() => {
		setFormat("TRIO");
	}, []);

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

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			if (!isFormValid(format, member1Id, member2Id, member3Id)) {
				return;
			}

			onAllocate({
				challengeId,
				member1Id,
				member2Id: format === "SOLO" ? null : member2Id || null,
				member3Id: format === "TRIO" ? member3Id : null,
			});
		},
		[challengeId, format, member1Id, member2Id, member3Id, onAllocate]
	);

	if (!isOpen) {
		return null;
	}

	const canSubmit = isFormValid(format, member1Id, member2Id, member3Id);
	const member1Excludes = [
		format === "SOLO" ? "" : member2Id,
		format === "TRIO" ? member3Id : "",
	].filter(Boolean);
	const member2Excludes = [
		member1Id,
		format === "TRIO" ? member3Id : "",
	].filter(Boolean);
	const member3Excludes = [member1Id, member2Id].filter(Boolean);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4">
			<div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-2 border-black bg-card p-4 shadow-hard-lg sm:p-6 dark:border-white">
				<ModalHeader
					challengeTitle={challengeTitle}
					format={format}
					onClose={onClose}
				/>

				<ContextBanner
					challengeTrack={challengeTrack}
					trackMembersCount={trackMembersCount}
					unassignedCount={unassignedCount}
				/>

				{membersQuery.isLoading ? (
					<div className="my-6">
						<BauhausSkeleton />
					</div>
				) : (
					<form className="mt-4 space-y-4" onSubmit={handleSubmit}>
						<FormatSelector
							format={format}
							onSelectPair={handleSelectPair}
							onSelectSolo={handleSelectSolo}
							onSelectTrio={handleSelectTrio}
						/>

						{/* Membro 1 (ou Membro Solo) */}
						<MemberSelectField
							challengeTrack={challengeTrack}
							excludeIds={member1Excludes}
							id={member1InputId}
							label={
								format === "SOLO"
									? "Membro Participante (Solo) *"
									: "Membro 1 *"
							}
							members={members}
							onChange={handleChangeMember1}
							placeholder={
								format === "SOLO"
									? "-- SELECIONE O MEMBRO SOLO --"
									: "-- SELECIONE O PRIMEIRO MEMBRO --"
							}
							value={member1Id}
						/>

						{/* Membro 2 (visível para Dupla e Trio) */}
						{format === "SOLO" ? null : (
							<MemberSelectField
								challengeTrack={challengeTrack}
								excludeIds={member2Excludes}
								id={member2InputId}
								label="Membro 2 *"
								members={members}
								onChange={handleChangeMember2}
								placeholder="-- SELECIONE O SEGUNDO MEMBRO --"
								value={member2Id}
							/>
						)}

						{/* Membro 3 (visível apenas para Trio) */}
						{format === "TRIO" ? (
							<MemberSelectField
								challengeTrack={challengeTrack}
								excludeIds={member3Excludes}
								id={member3InputId}
								label="Membro 3 *"
								members={members}
								onChange={handleChangeMember3}
								placeholder="-- SELECIONE O TERCEIRO MEMBRO --"
								value={member3Id}
							/>
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
								<Check className="h-4 w-4" />
								<span>{getSubmitButtonLabel(isPending, format)}</span>
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
