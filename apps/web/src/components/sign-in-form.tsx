"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PopLogo } from "@/components/pop-elements";
import { authClient } from "@/lib/auth-client";
import { ForgotPasswordModal } from "./forgot-password-modal";
import Loader from "./loader";

interface SignInFormProps {
	onSwitchToSignUp: () => void;
}

export default function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
	const router = useRouter();
	const { isPending } = authClient.useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

	const handleOpenForgotPassword = useCallback(() => {
		setIsForgotPasswordOpen(true);
	}, []);

	const handleCloseForgotPassword = useCallback(() => {
		setIsForgotPasswordOpen(false);
	}, []);

	const handleSignIn = useCallback(
		async (userEmail = email, userPassword = password) => {
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
							const userData = sessionResult.data?.user as
								| { role?: string }
								| undefined;
							if (userData?.role === "ADMIN") {
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
		},
		[email, password, router]
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			handleSignIn();
		},
		[handleSignIn]
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
					ACESSO {"//"} MEMBROS
				</h1>
				<p className="mt-1 font-medium text-muted-foreground text-xs">
					Desafios técnicos em duplas, mentorias e ranking de pontuação
				</p>
			</div>

			{/* Form Card */}
			<div className="rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
				<form className="space-y-4" onSubmit={handleSubmit}>
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
							onChange={handleEmailChange}
							placeholder="nome@orcestra.com"
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<label
								className="font-bold font-display text-xs uppercase tracking-wider"
								htmlFor="password"
							>
								Senha
							</label>
							<button
								className="font-mono text-[#FF4A1C] text-[11px] uppercase tracking-wider hover:underline"
								onClick={handleOpenForgotPassword}
								type="button"
							>
								Esqueci a senha
							</button>
						</div>
						<input
							className="h-11 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="password"
							onChange={handlePasswordChange}
							placeholder="••••••••"
							required
							type="password"
							value={password}
						/>
					</div>

					<button
						className="btn-tactile mt-2 flex w-full items-center justify-center rounded-md border-2 border-black bg-primary py-3 font-black font-display text-primary-foreground text-sm uppercase tracking-wider shadow-hard-sm hover:opacity-90 disabled:opacity-50 dark:border-white"
						disabled={loading}
						type="submit"
					>
						{loading ? "CONECTANDO..." : "ENTRAR NA PLATAFORMA"}
					</button>
				</form>

				<div className="mt-5 text-center">
					<button
						className="font-bold font-display text-[11px] text-muted-foreground uppercase tracking-wider hover:text-foreground hover:underline"
						onClick={onSwitchToSignUp}
						type="button"
					>
						Ainda não tem conta? Crie seu perfil aqui &rarr;
					</button>
				</div>
			</div>

			<ForgotPasswordModal
				defaultEmail={email}
				isOpen={isForgotPasswordOpen}
				onClose={handleCloseForgotPassword}
			/>
		</div>
	);
}
