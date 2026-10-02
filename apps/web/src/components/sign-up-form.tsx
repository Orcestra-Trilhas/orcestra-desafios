"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PopLogo } from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

const TRACKS = [
	{ color: "vermilion" as const, id: "FRONT", label: "FRONTEND" },
	{ color: "cobalt" as const, id: "BACK", label: "BACKEND" },
	{ color: "green" as const, id: "PROTOTIPACAO", label: "PROTÓTIPO" },
	{ color: "yellow" as const, id: "DEVOPS", label: "DEVOPS" },
] as const;

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [selectedTracks, setSelectedTracks] = useState<string[]>([
		"FRONT",
		"BACK",
	]);
	const [loading, setLoading] = useState(false);

	const toggleTrack = (trackId: string) => {
		setSelectedTracks((prev) =>
			prev.includes(trackId)
				? prev.filter((t) => t !== trackId)
				: [...prev, trackId]
		);
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!(name && email && password)) {
			toast.error("Preencha nome, e-mail e senha");
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
					name,
					password,
					// @ts-expect-error additionalFields defined on server
					trackPreferences: JSON.stringify(selectedTracks),
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
	};

	if (isPending) {
		return <Loader />;
	}

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
					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="name"
						>
							Nome Completo
						</label>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="name"
							onChange={(e) => setName(e.target.value)}
							placeholder="Ex: Carlos Eduardo"
							required
							type="text"
							value={name}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="email"
						>
							E-mail Institucional ou Pessoal
						</label>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="email"
							onChange={(e) => setEmail(e.target.value)}
							placeholder="seu.email@orcestra.com"
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="password"
						>
							Senha
						</label>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="password"
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Mínimo 6 caracteres"
							required
							type="password"
							value={password}
						/>
					</div>

					<div className="space-y-2 pt-1">
						<label className="font-bold font-display text-xs uppercase tracking-wider">
							Áreas de Interesse (Sorteio)
						</label>
						<div className="grid grid-cols-2 gap-2">
							{TRACKS.map((t) => {
								const isSelected = selectedTracks.includes(t.id);
								return (
									<button
										className={`btn-tactile flex items-center justify-between rounded-md border-2 p-2.5 text-left font-black font-display text-xs uppercase transition-all ${
											isSelected
												? "border-black bg-[#121212] text-white shadow-hard-sm dark:border-white dark:bg-white dark:text-[#121212]"
												: "border-black/30 bg-background text-foreground hover:border-black dark:border-white/30"
										}`}
										key={t.id}
										onClick={() => toggleTrack(t.id)}
										type="button"
									>
										<span>{t.label}</span>
										<span className="font-mono text-[10px]">
											{isSelected ? "[X]" : "[ ]"}
										</span>
									</button>
								);
							})}
						</div>
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
