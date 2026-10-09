"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type CustomThemeConfig,
	DEFAULT_CUSTOM_THEME,
	getContrastForeground,
} from "@/lib/custom-theme";
import { ColorField } from "./custom-theme/color-field";
import { PresetSelector } from "./custom-theme/preset-selector";
import { ThemeLivePreview } from "./custom-theme/theme-live-preview";
import { useCustomTheme } from "./custom-theme-provider";

export function CustomThemeDialog() {
	const { customTheme, isThemeModalOpen, closeThemeModal, saveCustomTheme } =
		useCustomTheme();

	const [formData, setFormData] =
		useState<CustomThemeConfig>(DEFAULT_CUSTOM_THEME);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (isThemeModalOpen && customTheme) {
			setFormData(customTheme);
		}
	}, [isThemeModalOpen, customTheme]);

	const handlePresetClick = useCallback((preset: CustomThemeConfig) => {
		setFormData({ ...preset });
	}, []);

	const handleSave = useCallback(async () => {
		try {
			setIsSaving(true);
			await saveCustomTheme(formData);
			toast.success(`Tema "${formData.name}" ativado com sucesso!`);
			closeThemeModal();
		} catch {
			toast.error("Erro ao salvar tema");
		} finally {
			setIsSaving(false);
		}
	}, [formData, saveCustomTheme, closeThemeModal]);

	const updateColor = useCallback(
		(field: keyof CustomThemeConfig) => (value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[]
	);

	const handleSetDarkMode = useCallback(() => {
		setFormData((prev) => ({ ...prev, baseMode: "dark" }));
	}, []);

	const handleSetLightMode = useCallback(() => {
		setFormData((prev) => ({ ...prev, baseMode: "light" }));
	}, []);

	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, name: e.target.value }));
		},
		[]
	);

	const previewPrimaryFg = useMemo(
		() => formData.primaryForeground ?? getContrastForeground(formData.primary),
		[formData.primaryForeground, formData.primary]
	);

	if (!isThemeModalOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
			{/* Backdrop */}
			<button
				aria-label="Fechar modal"
				className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
				onClick={closeThemeModal}
				type="button"
			/>

			{/* Modal container */}
			<div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border-3 border-black bg-card p-4 text-card-foreground shadow-hard sm:p-6 dark:border-white">
				{/* Header */}
				<div className="mb-4 flex items-center justify-between border-black border-b-2 pb-3 sm:mb-5 dark:border-white">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-primary text-primary-foreground shadow-hard-sm sm:h-9 sm:w-9 dark:border-white">
							<Sparkles className="h-4 w-4" />
						</div>
						<div>
							<h2 className="font-black font-display text-base uppercase tracking-tight sm:text-xl">
								CRIAR SEU PRÓPRIO TEMA
							</h2>
							<p className="font-bold text-muted-foreground text-xs">
								Visível no seu perfil e para você em todo o sistema
							</p>
						</div>
					</div>
					<button
						aria-label="Fechar"
						className="btn-tactile flex h-8 w-8 items-center justify-center rounded-md border-2 border-black bg-muted font-black shadow-hard-sm hover:bg-destructive hover:text-white sm:h-9 sm:w-9 dark:border-white"
						onClick={closeThemeModal}
						type="button"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="space-y-5">
					<PresetSelector
						onSelect={handlePresetClick}
						selectedName={formData.name}
					/>

					{/* Customização Manual */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Nome do Tema */}
						<div className="space-y-1.5 sm:col-span-2">
							<label
								className="font-black font-display text-xs uppercase tracking-wider"
								htmlFor="theme-name"
							>
								NOME DO TEMA
							</label>
							<input
								className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-bold font-display text-sm tracking-wide shadow-hard-sm focus:border-primary focus:outline-hidden dark:border-white"
								id="theme-name"
								onChange={handleNameChange}
								placeholder="Meu Tema Único"
								value={formData.name}
							/>
						</div>

						{/* Base Mode: Dark ou Light */}
						<div className="space-y-1.5 sm:col-span-2">
							<span className="font-black font-display text-xs uppercase tracking-wider">
								MODO BASE (CONTRASTE)
							</span>
							<div className="grid grid-cols-2 gap-2">
								<button
									className={`btn-tactile flex h-9 items-center justify-center gap-2 rounded-md border-2 border-black font-black font-display text-xs uppercase shadow-hard-sm dark:border-white ${
										formData.baseMode === "dark"
											? "bg-foreground text-background"
											: "bg-secondary hover:bg-muted"
									}`}
									onClick={handleSetDarkMode}
									type="button"
								>
									{formData.baseMode === "dark" ? (
										<Check className="h-3.5 w-3.5" />
									) : null}
									DARK (ESCURO)
								</button>
								<button
									className={`btn-tactile flex h-9 items-center justify-center gap-2 rounded-md border-2 border-black font-black font-display text-xs uppercase shadow-hard-sm dark:border-white ${
										formData.baseMode === "light"
											? "bg-foreground text-background"
											: "bg-secondary hover:bg-muted"
									}`}
									onClick={handleSetLightMode}
									type="button"
								>
									{formData.baseMode === "light" ? (
										<Check className="h-3.5 w-3.5" />
									) : null}
									LIGHT (CLARO)
								</button>
							</div>
						</div>

						<ColorField
							description="Destaque, botões e acentos"
							id="color-primary"
							label="COR PRIMÁRIA"
							onChange={updateColor("primary")}
							value={formData.primary}
						/>

						<ColorField
							description="Fundo principal da tela"
							id="color-bg"
							label="FUNDO (BACKGROUND)"
							onChange={updateColor("background")}
							value={formData.background}
						/>

						<ColorField
							description="Fundo dos cards e contêineres"
							id="color-card"
							label="CARD"
							onChange={updateColor("card")}
							value={formData.card}
						/>

						<ColorField
							description="Textos e ícones"
							id="color-fg"
							label="TEXTO (FOREGROUND)"
							onChange={updateColor("foreground")}
							value={formData.foreground}
						/>

						<div className="sm:col-span-2">
							<ColorField
								description="Bordas dos elementos brutalistas"
								id="color-border"
								label="BORDA"
								onChange={updateColor("border")}
								value={formData.border}
							/>
						</div>
					</div>

					<ThemeLivePreview
						previewPrimaryFg={previewPrimaryFg}
						theme={formData}
					/>

					{/* Footer Buttons */}
					<div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
						<button
							className="btn-tactile h-11 rounded-md border-2 border-black bg-secondary px-5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted dark:border-white"
							onClick={closeThemeModal}
							type="button"
						>
							CANCELAR
						</button>
						<button
							className="btn-tactile flex h-11 items-center justify-center gap-2 rounded-md border-2 border-black bg-primary px-6 font-black font-display text-primary-foreground text-xs uppercase shadow-hard hover:opacity-90 disabled:opacity-50 dark:border-white"
							disabled={isSaving}
							onClick={handleSave}
							type="button"
						>
							<Sparkles className="h-4 w-4" />
							{isSaving ? "SALVANDO..." : "SALVAR & ATIVAR TEMA"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
