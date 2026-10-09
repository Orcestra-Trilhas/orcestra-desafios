"use client";

import { Check, Palette, Sparkles, Tag, ToggleLeft, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type CustomThemeConfig,
	DEFAULT_CUSTOM_THEME,
	getContrastForeground,
} from "@/lib/custom-theme";
import { ColorField, ColorFieldWithContrast } from "./custom-theme/color-field";
import { ThemeLivePreview } from "./custom-theme/theme-live-preview";
import { useCustomTheme } from "./custom-theme-provider";

type ThemeTab = "general" | "buttons" | "badges";

export function CustomThemeDialog() {
	const { customTheme, isThemeModalOpen, closeThemeModal, saveCustomTheme } =
		useCustomTheme();

	const [formData, setFormData] =
		useState<CustomThemeConfig>(DEFAULT_CUSTOM_THEME);
	const [activeTab, setActiveTab] = useState<ThemeTab>("general");
	const [isSaving, setIsSaving] = useState(false);

	// Controles de contraste inteligente (True = automático, False = cor manual)
	const [autoPrimaryFg, setAutoPrimaryFg] = useState(true);
	const [autoSecondaryFg, setAutoSecondaryFg] = useState(true);
	const [autoBadgeHighlightFg, setAutoBadgeHighlightFg] = useState(true);
	const [autoBadgeStatusFg, setAutoBadgeStatusFg] = useState(true);

	useEffect(() => {
		if (isThemeModalOpen && customTheme) {
			setFormData({ ...customTheme });

			// Se o tema já tiver cores manuais diferentes do contraste puro, respeita
			const calculatedPrimaryFg = getContrastForeground(customTheme.primary);
			setAutoPrimaryFg(
				!customTheme.primaryForeground ||
					customTheme.primaryForeground === calculatedPrimaryFg
			);

			const secBg =
				customTheme.secondary ??
				(customTheme.baseMode === "dark" ? "#18181B" : "#F4F4F5");
			const calculatedSecondaryFg = getContrastForeground(secBg);
			setAutoSecondaryFg(
				!customTheme.secondaryForeground ||
					customTheme.secondaryForeground === calculatedSecondaryFg
			);

			const badgeHiBg = customTheme.badgeHighlight ?? customTheme.primary;
			const calculatedBadgeHiFg = getContrastForeground(badgeHiBg);
			setAutoBadgeHighlightFg(
				!customTheme.badgeHighlightForeground ||
					customTheme.badgeHighlightForeground === calculatedBadgeHiFg
			);

			const badgeStBg = customTheme.badgeStatus ?? secBg;
			const calculatedBadgeStFg = getContrastForeground(badgeStBg);
			setAutoBadgeStatusFg(
				!customTheme.badgeStatusForeground ||
					customTheme.badgeStatusForeground === calculatedBadgeStFg
			);
		}
	}, [isThemeModalOpen, customTheme]);

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

	const handleSelectGeneral = useCallback(() => {
		setActiveTab("general");
	}, []);

	const handleSelectButtons = useCallback(() => {
		setActiveTab("buttons");
	}, []);

	const handleSelectBadges = useCallback(() => {
		setActiveTab("badges");
	}, []);

	// Cálculos de Contraste Automático
	const computedPrimaryFg = useMemo(
		() => getContrastForeground(formData.primary),
		[formData.primary]
	);
	const previewPrimaryFg = useMemo(
		() =>
			autoPrimaryFg
				? computedPrimaryFg
				: (formData.primaryForeground ?? computedPrimaryFg),
		[autoPrimaryFg, computedPrimaryFg, formData.primaryForeground]
	);

	const secondaryBg = useMemo(
		() =>
			formData.secondary ??
			(formData.baseMode === "dark" ? "#18181B" : "#F4F4F5"),
		[formData.secondary, formData.baseMode]
	);
	const computedSecondaryFg = useMemo(
		() => getContrastForeground(secondaryBg),
		[secondaryBg]
	);
	const previewSecondaryFg = useMemo(
		() =>
			autoSecondaryFg
				? computedSecondaryFg
				: (formData.secondaryForeground ?? computedSecondaryFg),
		[autoSecondaryFg, computedSecondaryFg, formData.secondaryForeground]
	);

	const badgeHighlightBg = useMemo(
		() => formData.badgeHighlight ?? formData.primary,
		[formData.badgeHighlight, formData.primary]
	);
	const computedBadgeHighlightFg = useMemo(
		() => getContrastForeground(badgeHighlightBg),
		[badgeHighlightBg]
	);
	const previewBadgeHighlightFg = useMemo(
		() =>
			autoBadgeHighlightFg
				? computedBadgeHighlightFg
				: (formData.badgeHighlightForeground ?? computedBadgeHighlightFg),
		[
			autoBadgeHighlightFg,
			computedBadgeHighlightFg,
			formData.badgeHighlightForeground,
		]
	);

	const badgeStatusBg = useMemo(
		() => formData.badgeStatus ?? secondaryBg,
		[formData.badgeStatus, secondaryBg]
	);
	const computedBadgeStatusFg = useMemo(
		() => getContrastForeground(badgeStatusBg),
		[badgeStatusBg]
	);
	const previewBadgeStatusFg = useMemo(
		() =>
			autoBadgeStatusFg
				? computedBadgeStatusFg
				: (formData.badgeStatusForeground ?? computedBadgeStatusFg),
		[autoBadgeStatusFg, computedBadgeStatusFg, formData.badgeStatusForeground]
	);

	const handleSave = useCallback(async () => {
		try {
			const defaultMutedFg =
				formData.baseMode === "dark" ? "#A1A1AA" : "#71717A";
			const themeToSave: CustomThemeConfig = {
				...formData,
				badgeHighlight: badgeHighlightBg,
				badgeHighlightForeground: previewBadgeHighlightFg,
				badgeStatus: badgeStatusBg,
				badgeStatusForeground: previewBadgeStatusFg,
				buttonPrimary: formData.primary,
				buttonPrimaryForeground: previewPrimaryFg,
				buttonSecondary: secondaryBg,
				buttonSecondaryForeground: previewSecondaryFg,
				mutedForeground: formData.mutedForeground ?? defaultMutedFg,
				primaryForeground: previewPrimaryFg,
				secondary: secondaryBg,
				secondaryForeground: previewSecondaryFg,
			};

			await saveCustomTheme(themeToSave);
			toast.success(`Tema "${formData.name}" ativado com sucesso!`);
			closeThemeModal();
		} catch {
			toast.error("Erro ao salvar tema");
		} finally {
			setIsSaving(false);
		}
	}, [
		formData,
		badgeHighlightBg,
		previewBadgeHighlightFg,
		badgeStatusBg,
		previewBadgeStatusFg,
		previewPrimaryFg,
		secondaryBg,
		previewSecondaryFg,
		saveCustomTheme,
		closeThemeModal,
	]);

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
								CRIADOR DE TEMAS {"//"} PERSONALIZADO
							</h2>
							<p className="font-bold text-muted-foreground text-xs">
								Pinte sua identidade e veja refletida em todo o sistema
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

				{/* Tabs Navigation */}
				<div className="mb-4 grid grid-cols-3 gap-2 border-black/10 border-b pb-3 dark:border-white/10">
					<button
						className={`btn-tactile flex h-9 items-center justify-center gap-1.5 rounded-md border-2 border-black px-2 font-black font-display text-xs uppercase shadow-hard-sm transition-colors dark:border-white ${
							activeTab === "general"
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground hover:bg-muted"
						}`}
						onClick={handleSelectGeneral}
						type="button"
					>
						<Palette className="h-3.5 w-3.5" />
						<span className="truncate">GERAL</span>
					</button>
					<button
						className={`btn-tactile flex h-9 items-center justify-center gap-1.5 rounded-md border-2 border-black px-2 font-black font-display text-xs uppercase shadow-hard-sm transition-colors dark:border-white ${
							activeTab === "buttons"
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground hover:bg-muted"
						}`}
						onClick={handleSelectButtons}
						type="button"
					>
						<ToggleLeft className="h-3.5 w-3.5" />
						<span className="truncate">BOTÕES</span>
					</button>
					<button
						className={`btn-tactile flex h-9 items-center justify-center gap-1.5 rounded-md border-2 border-black px-2 font-black font-display text-xs uppercase shadow-hard-sm transition-colors dark:border-white ${
							activeTab === "badges"
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground hover:bg-muted"
						}`}
						onClick={handleSelectBadges}
						type="button"
					>
						<Tag className="h-3.5 w-3.5" />
						<span className="truncate">BADGES</span>
					</button>
				</div>

				<div className="space-y-5">
					{/* Conteúdo da Aba 1: Geral & Estrutura */}
					{activeTab === "general" ? (
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
									placeholder="Tema em Branco"
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
								description="Fundo principal das páginas"
								id="color-bg"
								label="FUNDO (BACKGROUND)"
								onChange={updateColor("background")}
								value={formData.background}
							/>

							<ColorField
								description="Fundo dos cards e contêineres"
								id="color-card"
								label="CARDS"
								onChange={updateColor("card")}
								value={formData.card}
							/>

							<ColorField
								description="Textos e ícones gerais"
								id="color-fg"
								label="TEXTO (FOREGROUND)"
								onChange={updateColor("foreground")}
								value={formData.foreground}
							/>

							<ColorField
								description="Bordas dos elementos brutalistas"
								id="color-border"
								label="BORDAS"
								onChange={updateColor("border")}
								value={formData.border}
							/>

							<ColorField
								description="Subtítulos, legendas, notas secundárias e mensagens vazias"
								id="color-muted-fg"
								label="TEXTO SECUNDÁRIO / LEGENDA (MUTED)"
								onChange={updateColor("mutedForeground")}
								value={
									formData.mutedForeground ??
									(formData.baseMode === "dark" ? "#A1A1AA" : "#71717A")
								}
							/>
						</div>
					) : null}

					{/* Conteúdo da Aba 2: Botões & Ações */}
					{activeTab === "buttons" ? (
						<div className="space-y-4">
							<ColorFieldWithContrast
								autoContrast={autoPrimaryFg}
								bgDescription="Botão de destaque principal e ações primárias"
								bgId="btn-primary-bg"
								bgLabel="BOTÃO PRIMÁRIO (DESTAQUE)"
								bgValue={formData.primary}
								computedFg={computedPrimaryFg}
								fgDescription="Cor do texto e ícone do botão primário"
								fgId="btn-primary-fg"
								fgLabel="Cor do Texto Primário"
								fgValue={previewPrimaryFg}
								onBgChange={updateColor("primary")}
								onFgChange={updateColor("primaryForeground")}
								onToggleAutoContrast={setAutoPrimaryFg}
							/>

							<ColorFieldWithContrast
								autoContrast={autoSecondaryFg}
								bgDescription="Botão de ação secundária e botões neutros"
								bgId="btn-secondary-bg"
								bgLabel="BOTÃO SECUNDÁRIO"
								bgValue={secondaryBg}
								computedFg={computedSecondaryFg}
								fgDescription="Cor do texto e ícone do botão secundário"
								fgId="btn-secondary-fg"
								fgLabel="Cor do Texto Secundário"
								fgValue={previewSecondaryFg}
								onBgChange={updateColor("secondary")}
								onFgChange={updateColor("secondaryForeground")}
								onToggleAutoContrast={setAutoSecondaryFg}
							/>
						</div>
					) : null}

					{/* Conteúdo da Aba 3: Badges & Destaques */}
					{activeTab === "badges" ? (
						<div className="space-y-4">
							<ColorFieldWithContrast
								autoContrast={autoBadgeHighlightFg}
								bgDescription="Badge de pontos acumulados (PTS) e contadores"
								bgId="badge-highlight-bg"
								bgLabel="BADGE DE PONTOS (DESTAQUE)"
								bgValue={badgeHighlightBg}
								computedFg={computedBadgeHighlightFg}
								fgDescription="Cor do texto e ícone da badge de pontos"
								fgId="badge-highlight-fg"
								fgLabel="Cor do Texto da Badge de Pontos"
								fgValue={previewBadgeHighlightFg}
								onBgChange={updateColor("badgeHighlight")}
								onFgChange={updateColor("badgeHighlightForeground")}
								onToggleAutoContrast={setAutoBadgeHighlightFg}
							/>

							<ColorFieldWithContrast
								autoContrast={autoBadgeStatusFg}
								bgDescription="Badges neutras de status e cargos de usuário"
								bgId="badge-status-bg"
								bgLabel="BADGES DE STATUS & CARGO"
								bgValue={badgeStatusBg}
								computedFg={computedBadgeStatusFg}
								fgDescription="Cor do texto das badges de status"
								fgId="badge-status-fg"
								fgLabel="Cor do Texto da Badge de Status"
								fgValue={previewBadgeStatusFg}
								onBgChange={updateColor("badgeStatus")}
								onFgChange={updateColor("badgeStatusForeground")}
								onToggleAutoContrast={setAutoBadgeStatusFg}
							/>
						</div>
					) : null}

					{/* Live Preview sempre visível */}
					<ThemeLivePreview
						previewBadgeHighlightFg={previewBadgeHighlightFg}
						previewBadgeStatusFg={previewBadgeStatusFg}
						previewPrimaryFg={previewPrimaryFg}
						previewSecondaryFg={previewSecondaryFg}
						theme={formData}
					/>

					{/* Footer Buttons */}
					<div className="flex flex-col-reverse justify-end gap-2 border-black/10 border-t pt-3 sm:flex-row dark:border-white/10">
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
