"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PopBadge, PopLogo } from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import Loader from "./loader";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const ensureAdmin = useMutation(trpc.user.ensureDevAdmin.mutationOptions());

	const handleSignIn = async (userEmail = email, userPassword = password) => {
		if (!(userEmail && userPassword)) {
			toast.error("Preencha e-mail e senha");
			return;
		}

		setLoading(true);
		try {
			await authClient.signIn.email(
				{
					email: userEmail,
					password: userPassword,
				},
				{
					onError: (error) => {
						toast.error(error.error.message || "E-mail ou senha inválidos");
						setLoading(false);
					},
					onSuccess: async () => {
						toast.success("Login realizado com sucesso!");
						const sessionResult = await authClient.getSession();
						const role = (sessionResult.data?.user as { role?: string })?.role;
						if (role === "ADMIN") {
							router.push("/admin");
						} else {
							router.push("/dashboard");
						}
					},
				}
			);
		} catch {
			toast.error("Erro inesperado ao conectar");
			setLoading(false);
		}
	};

	const handleDevAdminLogin = async () => {
		setLoading(true);
		try {
			await ensureAdmin.mutateAsync();
			await handleSignIn("admin@orcestra.com", "admin");
		} catch {
			toast.error("Erro ao inicializar credencial de admin");
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
				<div className="mt-2 flex items-center justify-center gap-2">
					<PopBadge color="vermilion">SPRINT ATIVA</PopBadge>
					<PopBadge color="black">PLATAFORMA EJ</PopBadge>
				</div>
				<h1 className="mt-4 font-black font-display text-3xl uppercase tracking-tight">
					ACESSO // MEMBROS
				</h1>
				<p className="mt-1 font-medium text-muted-foreground text-xs">
					Desafios técnicos em duplas, mentorias e ranking de pontuação
				</p>
			</div>

			{/* Form Card */}
			<div className="rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleSignIn();
					}}
				>
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
							placeholder="nome@orcestra.com"
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
							placeholder="••••••••"
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
						{loading ? "CONECTANDO..." : "ENTRAR NA PLATAFORMA"}
					</button>
				</form>

				{/* Dev Admin Quick Access Stamp Box */}
				<div className="mt-6 border-2 border-black/30 border-dashed bg-secondary/50 p-4 dark:border-white/30">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-black font-display text-[#121212] text-[11px] uppercase tracking-wider dark:text-white">
							[DEV_ACCESS // ADMIN]
						</span>
						<span className="font-bold font-mono text-[10px] text-muted-foreground">
							admin@orcestra.com
						</span>
					</div>
					<button
						className="btn-tactile flex w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-[#FACC15] py-2 font-black font-display text-[#121212] text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#EAB308] disabled:opacity-50 dark:border-white"
						disabled={loading}
						onClick={handleDevAdminLogin}
						type="button"
					>
						<span>ENTRAR COM ADMIN DEV (ORCESTRA)</span>
					</button>
				</div>

				<div className="mt-5 text-center">
					<button
						className="font-bold font-display text-xs uppercase tracking-wider hover:underline"
						onClick={onSwitchToSignUp}
						type="button"
					>
						Ainda não tem conta? Crie seu perfil aqui &rarr;
					</button>
				</div>
			</div>
		</div>
	);
}
