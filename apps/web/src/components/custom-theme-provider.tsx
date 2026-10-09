"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	CUSTOM_THEME_STORAGE_KEY,
	type CustomThemeConfig,
	DEFAULT_CUSTOM_THEME,
	generateCustomThemeCss,
	parseCustomTheme,
} from "@/lib/custom-theme";
import { trpc } from "@/utils/trpc";

interface CustomThemeContextType {
	activeProfileTheme: CustomThemeConfig | null;
	closeThemeModal: () => void;
	customTheme: CustomThemeConfig;
	isThemeModalOpen: boolean;
	openThemeModal: () => void;
	saveCustomTheme: (newTheme: CustomThemeConfig) => Promise<void>;
	setActiveProfileTheme: (theme: CustomThemeConfig | null) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | null>(null);

const STYLE_ELEMENT_ID = "orc-custom-theme-style";

export function CustomThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { theme, setTheme } = useTheme();
	const [customTheme, setCustomThemeState] = useState<CustomThemeConfig>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
			const parsed = parseCustomTheme(saved);
			if (parsed) {
				return parsed;
			}
		}
		return DEFAULT_CUSTOM_THEME;
	});

	// Para quando o visitante estiver vendo o perfil de outra pessoa que possui tema customizado
	const [activeProfileTheme, setActiveProfileTheme] =
		useState<CustomThemeConfig | null>(null);
	const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

	const userMe = useQuery(trpc.user.me.queryOptions());
	const updateCustomThemeMutation = useMutation(
		trpc.user.updateCustomTheme.mutationOptions()
	);

	// Sincroniza tema salvo no banco com o localStorage quando o usuário carrega
	useEffect(() => {
		if (userMe.data?.customTheme) {
			const dbTheme = parseCustomTheme(userMe.data.customTheme);
			if (dbTheme) {
				setCustomThemeState(dbTheme);
				try {
					localStorage.setItem(
						CUSTOM_THEME_STORAGE_KEY,
						JSON.stringify(dbTheme)
					);
				} catch {
					// Local storage indisponível
				}
			}
		}
	}, [userMe.data?.customTheme]);

	// Injeta a tag <style> com as variáveis CSS do tema ativo
	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const targetTheme =
			activeProfileTheme || (theme === "custom" ? customTheme : null);

		let styleEl = document.getElementById(
			STYLE_ELEMENT_ID
		) as HTMLStyleElement | null;

		if (!targetTheme) {
			if (styleEl) {
				styleEl.remove();
			}
			return;
		}

		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = STYLE_ELEMENT_ID;
			document.head.appendChild(styleEl);
		}

		styleEl.innerHTML = generateCustomThemeCss(targetTheme);

		// Ajusta a classe base dark/light para classes auxiliares do Tailwind
		if (targetTheme.baseMode === "dark") {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
		}
	}, [theme, customTheme, activeProfileTheme]);

	const saveCustomTheme = useCallback(
		async (newTheme: CustomThemeConfig) => {
			setCustomThemeState(newTheme);
			try {
				localStorage.setItem(
					CUSTOM_THEME_STORAGE_KEY,
					JSON.stringify(newTheme)
				);
			} catch {
				// Local storage error
			}
			setTheme("custom");

			try {
				await updateCustomThemeMutation.mutateAsync({
					customTheme: JSON.stringify(newTheme),
				});
			} catch {
				// Ignora falha silenciosa de sincronização remota
			}
		},
		[setTheme, updateCustomThemeMutation]
	);

	const openThemeModal = useCallback(() => setIsThemeModalOpen(true), []);
	const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);

	const value = useMemo(
		() => ({
			activeProfileTheme,
			closeThemeModal,
			customTheme,
			isThemeModalOpen,
			openThemeModal,
			saveCustomTheme,
			setActiveProfileTheme,
		}),
		[
			activeProfileTheme,
			closeThemeModal,
			customTheme,
			isThemeModalOpen,
			openThemeModal,
			saveCustomTheme,
		]
	);

	return (
		<CustomThemeContext.Provider value={value}>
			{children}
		</CustomThemeContext.Provider>
	);
}

export function useCustomTheme() {
	const ctx = useContext(CustomThemeContext);
	if (!ctx) {
		throw new Error("useCustomTheme must be used within a CustomThemeProvider");
	}
	return ctx;
}
