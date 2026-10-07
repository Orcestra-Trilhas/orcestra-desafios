"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";

import { PopLogo } from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import Loader from "./loader";

const DEFAULT_TRACKS = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"] as const;

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const memberSelectId = useId();
	const customNameId = useId();
	const emailId = useId();
	const passwordId = useId();

	const { isPending } = authClient.useSession();
	const eligibleMembersQuery = useQuery(
		trpc.user.getEligibleMembers.queryOptions()
	);

	const [selectedMemberName, setSelectedMemberName] = useState<string>("");
	const [customName, setCustomName] = useState<string>("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [assignedTracks, setAssignedTracks] = useState<string[]>([
		...DEFAULT_TRACKS,
	]);
	const [assignedTrackLabel, setAssignedTrackLabel] = useState<string>(
		"Selecione seu nome acima"
	);
	const [loading, setLoading] = useState(false);

	const handleMemberSelect = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const memberName = e.target.value;
			setSelectedMemberName(memberName);

			if (memberName === "__CUSTOM__") {
				setAssignedTracks([...DEFAULT_TRACKS]);
				setAssignedTrackLabel("Geral (Todas as Trilhas)");
				return;
			}

			const found = eligibleMembersQuery.data?.find(
				(m) => m.name === memberName
			);
			if (found) {
				setAssignedTracks(found.trackPreferences);
				setAssignedTrackLabel(found.displayTrack);
			} else {
				setAssignedTracks([...DEFAULT_TRACKS]);
				setAssignedTrackLabel("Geral (Todas as Trilhas)");
			}
		},
		[eligibleMembersQuery.data]
	);

	const handleCustomNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setCustomName(e.target.value);
		},
		[]
	);

	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setEmail(e.target.value);
		},
		[]
	);

	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setPassword(e.target.value);
		},
		[]
	);

	const handleSignUp = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			const finalName =
				selectedMemberName === "__CUSTOM__"
					? customName.trim()
					: selectedMemberName.trim();

			if (!finalName) {
				toast.error("Selecione ou informe seu nome");
				return;
			}

			if (!(email && password)) {
				toast.error("Preencha e-mail e senha");
				return;
			}

			if (password.length < 6) {
				toast.error("A senha deve ter pelo menos 6 caracteres");
				return;
			}

			setLoading(true);

			try {
				await authClient.signUp.email(
					{
						email,
						name: finalName,
						password,
						// @ts-expect-error additionalFields defined on server
						trackPreferences: JSON.stringify(assignedTracks),
					},
					{
						onError: (error) => {
							toast.error(error.error.message || "Erro ao cadastrar usuário");
							setLoading(false);
						},
						onSuccess: () => {
							toast.success("Conta de membro criada com sucesso!");
							router.push("/dashboard");
						},
					}
				);
			} catch {
				toast.error("Erro inesperado ao realizar cadastro");
				setLoading(false);
			}
		},
		[selectedMemberName, customName, email, password, assignedTracks, router]
	);

	if (isPending) {
		return <Loader />;
	}

	const isCustom = selectedMemberName === "__CUSTOM__";
	const membersList = eligibleMembersQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-md px-4 py-8">
			{/* Poster Header */}
			<div className="mb-6 text-center">
				<div className="mb-3 flex justify-center">
					<PopLogo className="h-10 scale-110" />
				</div>
				<h1 className="mt-4 font-black font-display text-3xl uppercase tracking-tight">
					CADASTRO {"//"} EJ
				</h1>
				<p className="mt-1 font-medium text-muted-foreground text-xs">
					Cadastre seus dados para acessar as missões e desafios da EJ
				</p>
			</div>

			<div className="rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<form className="space-y-4" onSubmit={handleSignUp}>
					{/* Seleção Automática de Membro pela Planilha */}
					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor={memberSelectId}
						>
							Membro da EJ (Planilha de Acompanhamento)
						</label>
						<select
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id={memberSelectId}
							onChange={handleMemberSelect}
							required
							value={selectedMemberName}
						>
							<option disabled value="">
								Selecione seu nome da lista...
							</option>
							{membersList.map((m) => (
								<option disabled={m.isRegistered} key={m.name} value={m.name}>
									{m.name} ({m.displayTrack})
									{m.isRegistered ? " - [Já cadastrado]" : ""}
								</option>
							))}
							<option value="__CUSTOM__">
								+ Outro membro (Não listado na planilha)
							</option>
						</select>
					</div>

					{/* Campo de nome livre se selecionou Não Listado */}
					{isCustom && (
						<div className="space-y-1.5">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor={customNameId}
							>
								Seu Nome Completo
							</label>
							<input
								className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
								id={customNameId}
								onChange={handleCustomNameChange}
								placeholder="Digite seu nome completo"
								required
								type="text"
								value={customName}
							/>
						</div>
					)}

					{/* Trilha Atribuída Automaticamente (Sem escolha manual de área) */}
					<div className="rounded-md border-2 border-black/20 bg-muted/40 p-3 dark:border-white/20">
						<div className="flex items-center justify-between">
							<span className="font-bold font-display text-[11px] text-muted-foreground uppercase tracking-wider">
								Trilha Atribuída
							</span>
							<span className="rounded border border-[#FF4A1C]/30 bg-[#FF4A1C]/10 px-2 py-0.5 font-bold font-mono text-[#FF4A1C] text-xs">
								{assignedTrackLabel}
							</span>
						</div>
						<p className="mt-1.5 text-[11px] text-muted-foreground leading-tight">
							Sua trilha é definida automaticamente pela planilha oficial de
							acompanhamentos da EJ para garantir pareamento justo.
						</p>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor={emailId}
						>
							E-mail Institucional ou Pessoal
						</label>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id={emailId}
							onChange={handleEmailChange}
							placeholder="seu.email@orcestra.com"
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor={passwordId}
						>
							Senha
						</label>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id={passwordId}
							onChange={handlePasswordChange}
							placeholder="Mínimo 6 caracteres"
							required
							type="password"
							value={password}
						/>
					</div>

					<button
						className="btn-tactile mt-2 flex w-full items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] py-3 font-black font-display text-sm text-white uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
						disabled={loading}
						type="submit"
					>
						{loading ? "CADASTRANDO..." : "CONCLUIR CADASTRO"}
					</button>
				</form>

				<div className="mt-5 text-center">
					<button
						className="font-bold font-display text-[11px] text-muted-foreground uppercase tracking-wider hover:text-foreground hover:underline"
						onClick={onSwitchToSignIn}
						type="button"
					>
						Já tem cadastro? Fazer login &rarr;
					</button>
				</div>
			</div>
		</div>
	);
}
