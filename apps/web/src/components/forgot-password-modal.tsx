"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

interface ForgotPasswordModalProps {
	defaultEmail?: string;
	isOpen: boolean;
	onClose: () => void;
}

export function ForgotPasswordModal({
	defaultEmail = "",
	isOpen,
	onClose,
}: ForgotPasswordModalProps) {
	const router = useRouter();
	const [email, setEmail] = useState(defaultEmail);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetPasswordMutation = useMutation(
		trpc.user.resetPassword.mutationOptions()
	);

	useEffect(() => {
		if (isOpen) {
			setEmail(defaultEmail);
			setNewPassword("");
			setConfirmPassword("");
		}
	}, [defaultEmail, isOpen]);

	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setEmail(e.target.value);
		},
		[]
	);

	const handleNewPasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setNewPassword(e.target.value);
		},
		[]
	);

	const handleConfirmPasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setConfirmPassword(e.target.value);
		},
		[]
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const trimmedEmail = email.trim();
			if (!trimmedEmail) {
				toast.error("Informe seu e-mail cadastrado.");
				return;
			}

			if (newPassword.length < 4) {
				toast.error("A nova senha deve ter no mínimo 4 caracteres.");
				return;
			}

			if (newPassword !== confirmPassword) {
				toast.error("As senhas informadas não coincidem.");
				return;
			}

			setIsSubmitting(true);
			try {
				await resetPasswordMutation.mutateAsync({
					email: trimmedEmail,
					newPassword,
				});

				toast.success("Senha redefinida com sucesso! Conectando...");

				await authClient.signIn.email(
					{
						email: trimmedEmail,
						password: newPassword,
					},
					{
						onError: () => {
							toast.info("Faça login agora com a sua nova senha.");
							setIsSubmitting(false);
							onClose();
						},
						onSuccess: async () => {
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
			} catch (err: unknown) {
				const errorMsg =
					err instanceof Error
						? err.message
						: "Erro ao redefinir a senha. Verifique o e-mail informado.";
				toast.error(errorMsg);
				setIsSubmitting(false);
			}
		},
		[
			confirmPassword,
			email,
			newPassword,
			onClose,
			resetPasswordMutation,
			router,
		]
	);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
			<div className="w-full max-w-md rounded-lg border-2 border-black bg-card p-6 shadow-hard dark:border-white">
				<div className="mb-4">
					<h2 className="font-black font-display text-xl uppercase tracking-tight">
						Redefinir Senha {"//"} Acesso
					</h2>
					<p className="mt-1 font-medium text-muted-foreground text-xs">
						Informe seu e-mail institucional e cadastre sua nova senha
						imediatamente.
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="reset-email"
						>
							E-mail Cadastrado
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="reset-email"
							onChange={handleEmailChange}
							placeholder="nome@orcestra.com"
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="reset-new-password"
						>
							Nova Senha
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="reset-new-password"
							onChange={handleNewPasswordChange}
							placeholder="Mínimo 4 caracteres"
							required
							type="password"
							value={newPassword}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="reset-confirm-password"
						>
							Confirmar Nova Senha
						</label>
						<input
							className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-sm transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
							id="reset-confirm-password"
							onChange={handleConfirmPasswordChange}
							placeholder="Repita a nova senha"
							required
							type="password"
							value={confirmPassword}
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<button
							className="btn-tactile flex-1 rounded-md border-2 border-black bg-muted py-2.5 font-bold font-display text-xs uppercase tracking-wider transition hover:bg-muted/80 dark:border-white"
							disabled={isSubmitting}
							onClick={onClose}
							type="button"
						>
							Cancelar
						</button>
						<button
							className="btn-tactile flex-1 rounded-md border-2 border-black bg-[#FF4A1C] py-2.5 font-black font-display text-white text-xs uppercase tracking-wider transition hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
							disabled={isSubmitting}
							type="submit"
						>
							{isSubmitting ? "Atualizando..." : "Redefinir e Entrar"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
