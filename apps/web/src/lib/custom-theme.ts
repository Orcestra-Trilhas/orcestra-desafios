export interface CustomThemeConfig {
	accent?: string;
	background: string;
	badgeHighlight?: string;
	badgeHighlightForeground?: string;
	badgeStatus?: string;
	badgeStatusForeground?: string;
	baseMode: "dark" | "light";
	border: string;
	buttonPrimary?: string;
	buttonPrimaryForeground?: string;
	buttonSecondary?: string;
	buttonSecondaryForeground?: string;
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

export function getUserThemeKey(userId: string): string {
	return `orc_theme_applied_${userId}`;
}

export function getUserCustomThemeKey(userId: string): string {
	return `orc_custom_theme_${userId}`;
}

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

export const BLANK_CUSTOM_THEME: CustomThemeConfig = {
	accent: "#71717A",
	background: "#09090B",
	badgeHighlight: "#27272A",
	badgeHighlightForeground: "#FAFAFA",
	badgeStatus: "#18181B",
	badgeStatusForeground: "#E4E4E7",
	baseMode: "dark",
	border: "#27272A",
	buttonPrimary: "#FAFAFA",
	buttonPrimaryForeground: "#09090B",
	buttonSecondary: "#18181B",
	buttonSecondaryForeground: "#FAFAFA",
	card: "#121215",
	cardForeground: "#FAFAFA",
	foreground: "#FAFAFA",
	muted: "#18181B",
	mutedForeground: "#A1A1AA",
	name: "TEMA EM BRANCO",
	primary: "#FAFAFA",
	primaryForeground: "#09090B",
	secondary: "#18181B",
	secondaryForeground: "#FAFAFA",
};

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = BLANK_CUSTOM_THEME;

function extractThemeColors(
	parsed: Record<string, unknown>,
	baseMode: "dark" | "light"
) {
	const {
		badgeHighlight: rawBadgeHighlight,
		badgeHighlightForeground,
		badgeStatus: rawBadgeStatus,
		badgeStatusForeground,
		buttonPrimary,
		buttonPrimaryForeground,
		buttonSecondary,
		buttonSecondaryForeground,
		mutedForeground: rawMutedForeground,
		primary: rawPrimary,
		primaryForeground: rawPrimaryForeground,
		secondary: rawSecondary,
		secondaryForeground: rawSecondaryForeground,
	} = parsed;

	let primary = "#FAFAFA";
	if (typeof buttonPrimary === "string") {
		primary = buttonPrimary;
	} else if (typeof rawPrimary === "string") {
		primary = rawPrimary;
	}

	let primaryFg = getContrastForeground(primary);
	if (typeof buttonPrimaryForeground === "string") {
		primaryFg = buttonPrimaryForeground;
	} else if (typeof rawPrimaryForeground === "string") {
		primaryFg = rawPrimaryForeground;
	}

	const fallbackSec = baseMode === "light" ? "#F4F4F5" : "#18181B";
	let secondary = fallbackSec;
	if (typeof buttonSecondary === "string") {
		secondary = buttonSecondary;
	} else if (typeof rawSecondary === "string") {
		secondary = rawSecondary;
	}

	let secondaryFg = getContrastForeground(secondary);
	if (typeof buttonSecondaryForeground === "string") {
		secondaryFg = buttonSecondaryForeground;
	} else if (typeof rawSecondaryForeground === "string") {
		secondaryFg = rawSecondaryForeground;
	}

	let badgeHighlight = primary;
	if (typeof rawBadgeHighlight === "string") {
		badgeHighlight = rawBadgeHighlight;
	}
	const badgeHighlightFg =
		typeof badgeHighlightForeground === "string"
			? badgeHighlightForeground
			: getContrastForeground(badgeHighlight);

	let badgeStatus = secondary;
	if (typeof rawBadgeStatus === "string") {
		badgeStatus = rawBadgeStatus;
	}
	const badgeStatusFg =
		typeof badgeStatusForeground === "string"
			? badgeStatusForeground
			: getContrastForeground(badgeStatus);

	const fallbackMutedFg = baseMode === "dark" ? "#A1A1AA" : "#71717A";
	let mutedForeground = fallbackMutedFg;
	if (typeof rawMutedForeground === "string") {
		mutedForeground = rawMutedForeground;
	}

	return {
		badgeHighlight,
		badgeHighlightFg,
		badgeStatus,
		badgeStatusFg,
		mutedForeground,
		primary,
		primaryFg,
		secondary,
		secondaryFg,
	};
}

export function parseCustomTheme(
	raw: string | null | undefined
): CustomThemeConfig | null {
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		const hasValidColor =
			typeof parsed?.primary === "string" ||
			typeof parsed?.buttonPrimary === "string";

		if (
			!parsed ||
			typeof parsed !== "object" ||
			!hasValidColor ||
			typeof parsed.background !== "string"
		) {
			return null;
		}

		const baseMode = parsed.baseMode === "light" ? "light" : "dark";
		const colors = extractThemeColors(parsed, baseMode);

		return {
			accent:
				typeof parsed.accent === "string" ? parsed.accent : colors.primary,
			background: parsed.background,
			badgeHighlight: colors.badgeHighlight,
			badgeHighlightForeground: colors.badgeHighlightFg,
			badgeStatus: colors.badgeStatus,
			badgeStatusForeground: colors.badgeStatusFg,
			baseMode,
			border:
				typeof parsed.border === "string" ? parsed.border : colors.primary,
			buttonPrimary: colors.primary,
			buttonPrimaryForeground: colors.primaryFg,
			buttonSecondary: colors.secondary,
			buttonSecondaryForeground: colors.secondaryFg,
			card: typeof parsed.card === "string" ? parsed.card : parsed.background,
			cardForeground:
				typeof parsed.cardForeground === "string"
					? parsed.cardForeground
					: undefined,
			foreground:
				typeof parsed.foreground === "string" ? parsed.foreground : "#FAFAFA",
			muted: typeof parsed.muted === "string" ? parsed.muted : undefined,
			mutedForeground: colors.mutedForeground,
			name:
				typeof parsed.name === "string" && parsed.name
					? parsed.name
					: "TEMA EM BRANCO",
			primary: colors.primary,
			primaryForeground: colors.primaryFg,
			secondary: colors.secondary,
			secondaryForeground: colors.secondaryFg,
		};
	} catch {
		return null;
	}
}

export function generateCustomThemeCss(theme: CustomThemeConfig): string {
	const primaryBg = theme.buttonPrimary ?? theme.primary;
	const primaryFg =
		theme.buttonPrimaryForeground ??
		theme.primaryForeground ??
		getContrastForeground(primaryBg);

	const secondaryBg =
		theme.buttonSecondary ??
		theme.secondary ??
		(theme.baseMode === "dark" ? "#18181B" : "#F4F4F5");
	const secondaryFg =
		theme.buttonSecondaryForeground ??
		theme.secondaryForeground ??
		(theme.foreground || getContrastForeground(secondaryBg));

	const cardFg =
		theme.cardForeground ??
		(theme.foreground || getContrastForeground(theme.card));

	const badgeHighlightBg = theme.badgeHighlight ?? primaryBg;
	const badgeHighlightFg =
		theme.badgeHighlightForeground ?? getContrastForeground(badgeHighlightBg);

	const badgeStatusBg = theme.badgeStatus ?? secondaryBg;
	const badgeStatusFg =
		theme.badgeStatusForeground ?? getContrastForeground(badgeStatusBg);

	const mutedBg =
		theme.muted ?? (theme.baseMode === "dark" ? "#1F2937" : "#F3F4F6");
	const defaultMutedFg = theme.baseMode === "dark" ? "#A1A1AA" : "#71717A";
	const mutedFg = theme.mutedForeground || defaultMutedFg;

	return `
:root.custom,
html.custom,
:root[data-custom-theme="active"],
html[data-custom-theme="active"],
[data-theme="custom"],
.custom-theme-active {
	--background: ${theme.background} !important;
	--foreground: ${theme.foreground} !important;
	--card: ${theme.card} !important;
	--card-foreground: ${cardFg} !important;
	--popover: ${theme.card} !important;
	--popover-foreground: ${cardFg} !important;
	--primary: ${primaryBg} !important;
	--primary-foreground: ${primaryFg} !important;
	--secondary: ${secondaryBg} !important;
	--secondary-foreground: ${secondaryFg} !important;
	--muted: ${mutedBg} !important;
	--muted-foreground: ${mutedFg} !important;
	--accent: ${theme.accent ?? primaryBg} !important;
	--accent-foreground: ${primaryFg} !important;
	--border: ${theme.border} !important;
	--input: ${secondaryBg} !important;
	--ring: ${primaryBg} !important;
	--sidebar: ${theme.card} !important;
	--sidebar-foreground: ${theme.foreground} !important;
	--sidebar-primary: ${primaryBg} !important;
	--sidebar-primary-foreground: ${primaryFg} !important;
	--sidebar-accent: ${secondaryBg} !important;
	--sidebar-accent-foreground: ${theme.foreground} !important;
	--sidebar-border: ${theme.border} !important;
	--sidebar-ring: ${primaryBg} !important;

	--badge-highlight-bg: ${badgeHighlightBg} !important;
	--badge-highlight-fg: ${badgeHighlightFg} !important;
	--badge-status-bg: ${badgeStatusBg} !important;
	--badge-status-fg: ${badgeStatusFg} !important;

	--logo-bg: ${primaryBg} !important;
	--logo-border: ${theme.border} !important;
	--logo-shadow: 2px 2px 0px ${theme.border} !important;
	--logo-fill: ${primaryFg} !important;
}

:is(.custom, [data-custom-theme="active"]) .orc-logo-badge,
:root.custom .orc-logo-badge,
html.custom .orc-logo-badge,
:root[data-custom-theme="active"] .orc-logo-badge,
html[data-custom-theme="active"] .orc-logo-badge {
	background-color: ${primaryBg} !important;
	border-color: ${theme.border} !important;
	box-shadow: 2px 2px 0px ${theme.border} !important;
}

:is(.custom, [data-custom-theme="active"]) .orc-logo-badge svg path,
:root.custom .orc-logo-badge svg path,
html.custom .orc-logo-badge svg path,
:root[data-custom-theme="active"] .orc-logo-badge svg path,
html[data-custom-theme="active"] .orc-logo-badge svg path {
	fill: ${primaryFg} !important;
}

/* Custom Theme Borders */
:is(.custom *, [data-custom-theme="active"] *) .border-black,
:is(.custom *, [data-custom-theme="active"] *) .dark\\:border-white,
:is(.custom *, [data-custom-theme="active"] *) .dark\\:border-\\[\\#2E3658\\] {
	border-color: ${theme.border} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .border-black\\/10,
:is(.custom *, [data-custom-theme="active"] *) .dark\\:border-white\\/10 {
	border-color: color-mix(in srgb, ${theme.border} 20%, transparent) !important;
}

:is(.custom *, [data-custom-theme="active"] *) .border-black\\/20,
:is(.custom *, [data-custom-theme="active"] *) .dark\\:border-white\\/20 {
	border-color: color-mix(in srgb, ${theme.border} 40%, transparent) !important;
}

:is(.custom *, [data-custom-theme="active"] *) .border-black\\/30,
:is(.custom *, [data-custom-theme="active"] *) .dark\\:border-white\\/30 {
	border-color: color-mix(in srgb, ${theme.border} 60%, transparent) !important;
}

/* Custom Theme Hard Shadows */
:is(.custom *, [data-custom-theme="active"] *) .shadow-hard {
	box-shadow: 4px 4px 0px ${theme.border} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-sm {
	box-shadow: 2px 2px 0px ${theme.border} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-lg {
	box-shadow: 6px 6px 0px ${theme.border} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-vermilion {
	box-shadow: 3px 3px 0px ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-cobalt {
	box-shadow: 3px 3px 0px ${secondaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-yellow {
	box-shadow: 3px 3px 0px ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .shadow-hard-green {
	box-shadow: 3px 3px 0px ${theme.accent ?? primaryBg} !important;
}

/* Custom Theme Semantic Palette Fallbacks */
:is(.custom *, [data-custom-theme="active"] *) .bg-\\[\\#FF4A1C\\] {
	color: ${primaryFg} !important;
	background-color: ${primaryBg} !important;
	border-color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .hover\\:bg-\\[\\#E03A10\\]:hover {
	background-color: ${primaryBg} !important;
	opacity: 0.9;
}

:is(.custom *, [data-custom-theme="active"] *) .text-\\[\\#FF4A1C\\] {
	color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .focus\\:border-\\[\\#FF4A1C\\]:focus {
	border-color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .bg-\\[\\#1E40AF\\] {
	color: ${secondaryFg} !important;
	background-color: ${secondaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .text-\\[\\#1E40AF\\] {
	color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .bg-\\[\\#FACC15\\] {
	color: ${primaryFg} !important;
	background-color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .text-\\[\\#FACC15\\] {
	color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .bg-\\[\\#15803D\\] {
	color: ${primaryFg} !important;
	background-color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .text-\\[\\#15803D\\] {
	color: ${primaryBg} !important;
}

:is(.custom *, [data-custom-theme="active"] *) .text-muted-foreground {
	color: ${mutedFg} !important;
}
`;
}
