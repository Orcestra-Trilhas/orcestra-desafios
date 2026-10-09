export interface CustomThemeConfig {
	accent?: string;
	background: string;
	baseMode: "dark" | "light";
	border: string;
	card: string;
	cardForeground?: string;
	foreground: string;
	muted?: string;
	mutedForeground?: string;
	name: string;
	primary: string;
	primaryForeground?: string;
	secondary?: string;
	secondaryForeground?: string;
}

export const CUSTOM_THEME_STORAGE_KEY = "orc-custom-theme-data";

export function getContrastForeground(hexColor: string): string {
	const clean = hexColor.replace("#", "");
	if (clean.length !== 6) {
		return "#FFFFFF";
	}
	const r = Number.parseInt(clean.slice(0, 2), 16);
	const g = Number.parseInt(clean.slice(2, 4), 16);
	const b = Number.parseInt(clean.slice(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? "#000000" : "#FFFFFF";
}

export const THEME_PRESETS: Record<string, CustomThemeConfig> = {
	"brutalista-mono": {
		background: "#F4F4F5",
		baseMode: "light",
		border: "#09090B",
		card: "#FFFFFF",
		foreground: "#09090B",
		name: "BRUTALISTA MONO",
		primary: "#09090B",
	},
	// === 3 TEMAS DARK (ESCUROS) ===
	cyberpunk: {
		background: "#070913",
		baseMode: "dark",
		border: "#00F0FF",
		card: "#101424",
		foreground: "#F0F6FC",
		name: "CYBERPUNK NEON",
		primary: "#00F0FF",
	},
	"matcha-florestal": {
		background: "#F0FDF4",
		baseMode: "light",
		border: "#16A34A",
		card: "#FFFFFF",
		foreground: "#14532D",
		name: "MATCHA FLORESTAL",
		primary: "#15803D",
	},
	"matrix-toxic": {
		background: "#040A04",
		baseMode: "dark",
		border: "#00FF66",
		card: "#091609",
		foreground: "#D1FFD9",
		name: "MATRIX TOXIC",
		primary: "#00FF66",
	},

	// === 3 TEMAS LIGHT (CLAROS) ===
	"solar-citrino": {
		background: "#FFFBEB",
		baseMode: "light",
		border: "#B45309",
		card: "#FFFFFF",
		foreground: "#451A03",
		name: "SOLAR CITRINO",
		primary: "#D97706",
	},
	vaporwave: {
		background: "#13091F",
		baseMode: "dark",
		border: "#C026D3",
		card: "#1F0F33",
		foreground: "#FDF4FF",
		name: "VAPORWAVE VIOLET",
		primary: "#E879F9",
	},
};

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = THEME_PRESETS.cyberpunk;

export function parseCustomTheme(
	raw: string | null | undefined
): CustomThemeConfig | null {
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		if (
			parsed &&
			typeof parsed === "object" &&
			typeof parsed.primary === "string" &&
			typeof parsed.background === "string"
		) {
			return {
				accent: parsed.accent ?? parsed.primary,
				background: parsed.background,
				baseMode: parsed.baseMode === "light" ? "light" : "dark",
				border: parsed.border ?? parsed.primary,
				card: parsed.card ?? parsed.background,
				cardForeground: parsed.cardForeground,
				foreground: parsed.foreground ?? "#FFFFFF",
				muted: parsed.muted,
				mutedForeground: parsed.mutedForeground,
				name: parsed.name || "TEMA PERSONALIZADO",
				primary: parsed.primary,
				primaryForeground: parsed.primaryForeground,
				secondary: parsed.secondary,
				secondaryForeground: parsed.secondaryForeground,
			};
		}
	} catch {
		// Retorna nulo se o json for inválido
	}
	return null;
}

export function generateCustomThemeCss(theme: CustomThemeConfig): string {
	const primaryFg =
		theme.primaryForeground ?? getContrastForeground(theme.primary);
	const cardFg =
		theme.cardForeground ??
		(theme.foreground || getContrastForeground(theme.card));
	const secondaryBg =
		theme.secondary ?? (theme.baseMode === "dark" ? "#1F2937" : "#F3F4F6");
	const secondaryFg =
		theme.secondaryForeground ??
		(theme.foreground || getContrastForeground(secondaryBg));
	const mutedBg =
		theme.muted ?? (theme.baseMode === "dark" ? "#1F2937" : "#F3F4F6");
	const mutedFg =
		theme.mutedForeground ??
		(theme.baseMode === "dark" ? "#9CA3AF" : "#6B7280");

	return `
:root.custom,
html.custom,
[data-theme="custom"],
.custom-theme-active {
	--background: ${theme.background} !important;
	--foreground: ${theme.foreground} !important;
	--card: ${theme.card} !important;
	--card-foreground: ${cardFg} !important;
	--popover: ${theme.card} !important;
	--popover-foreground: ${cardFg} !important;
	--primary: ${theme.primary} !important;
	--primary-foreground: ${primaryFg} !important;
	--secondary: ${secondaryBg} !important;
	--secondary-foreground: ${secondaryFg} !important;
	--muted: ${mutedBg} !important;
	--muted-foreground: ${mutedFg} !important;
	--accent: ${theme.accent ?? theme.primary} !important;
	--accent-foreground: ${primaryFg} !important;
	--border: ${theme.border} !important;
	--input: ${secondaryBg} !important;
	--ring: ${theme.primary} !important;
	--sidebar: ${theme.card} !important;
	--sidebar-foreground: ${theme.foreground} !important;
	--sidebar-primary: ${theme.primary} !important;
	--sidebar-primary-foreground: ${primaryFg} !important;
	--sidebar-accent: ${secondaryBg} !important;
	--sidebar-accent-foreground: ${theme.foreground} !important;
	--sidebar-border: ${theme.border} !important;
	--sidebar-ring: ${theme.primary} !important;
}
`;
}
