import { describe, expect, it } from "vitest";
import {
	BLANK_CUSTOM_THEME,
	generateCustomThemeCss,
	getContrastForeground,
	parseCustomTheme,
} from "../../apps/web/src/lib/custom-theme";

describe("Criador de Temas Customizados & Tema em Branco", () => {
	it("deve fornecer o tema em branco padrão neutro e escuro", () => {
		expect(BLANK_CUSTOM_THEME).toBeDefined();
		expect(BLANK_CUSTOM_THEME.name).toBe("TEMA EM BRANCO");
		expect(BLANK_CUSTOM_THEME.baseMode).toBe("dark");
		expect(BLANK_CUSTOM_THEME.background).toBe("#09090B");
		expect(BLANK_CUSTOM_THEME.primary).toBe("#FAFAFA");
		expect(BLANK_CUSTOM_THEME.badgeHighlight).toBeDefined();
		expect(BLANK_CUSTOM_THEME.badgeStatus).toBeDefined();
	});

	it("deve calcular o contraste correto de texto para fundos claros e escuros", () => {
		expect(getContrastForeground("#000000")).toBe("#FFFFFF");
		expect(getContrastForeground("#09090B")).toBe("#FFFFFF");
		expect(getContrastForeground("#FFFFFF")).toBe("#000000");
		expect(getContrastForeground("#FACC15")).toBe("#000000");
	});

	it("deve parsear JSON de tema customizado preenchendo botões e badges", () => {
		const raw = JSON.stringify({
			background: "#0F172A",
			badgeHighlight: "#F59E0B",
			badgeStatus: "#3B82F6",
			baseMode: "dark",
			border: "#38BDF8",
			buttonPrimary: "#38BDF8",
			buttonSecondary: "#1E293B",
			card: "#1E293B",
			foreground: "#F8FAFC",
			name: "AZUL CÓSMICO",
			primary: "#38BDF8",
		});

		const theme = parseCustomTheme(raw);
		expect(theme).not.toBeNull();
		expect(theme?.name).toBe("AZUL CÓSMICO");
		expect(theme?.buttonPrimary).toBe("#38BDF8");
		expect(theme?.buttonSecondary).toBe("#1E293B");
		expect(theme?.badgeHighlight).toBe("#F59E0B");
		expect(theme?.badgeStatus).toBe("#3B82F6");
	});

	it("deve gerar CSS com variáveis para botões, badges e adaptação da logo oficial", () => {
		const css = generateCustomThemeCss(BLANK_CUSTOM_THEME);

		expect(css).toContain("--badge-highlight-bg");
		expect(css).toContain("--badge-highlight-fg");
		expect(css).toContain("--badge-status-bg");
		expect(css).toContain("--badge-status-fg");
		expect(css).toContain(".orc-logo-badge");
		expect(css).toContain("fill:");
	});
});
