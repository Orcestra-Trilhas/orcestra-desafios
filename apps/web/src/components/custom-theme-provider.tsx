"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
	CUSTOM_THEME_STORAGE_KEY,
	type CustomThemeConfig,
	DEFAULT_CUSTOM_THEME,
	generateCustomThemeCss,
	getUserCustomThemeKey,
	getUserThemeKey,
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

const KNOWN_THEME_CLASSES = [
	"light",
	"dark",
	"orc-dark",
	"orc-light",
	"custom",
	"custom-light",
] as const;

function restoreThemeClasses(activeTheme: string | undefined) {
	const target = activeTheme || "orc-dark";
	for (const cls of KNOWN_THEME_CLASSES) {
		document.documentElement.classList.remove(cls);
	}
	document.documentElement.classList.add(target);
}

function applyCustomClasses(baseMode: "dark" | "light") {
	for (const cls of KNOWN_THEME_CLASSES) {
		document.documentElement.classList.remove(cls);
	}
	document.documentElement.classList.add("custom");
	if (baseMode === "light") {
		document.documentElement.classList.add("custom-light");
	}
}

function applyStoredThemeForUser(
	userId: string,
	setTheme: (t: string) => void,
	setCustomThemeState: (c: CustomThemeConfig) => void
) {
	try {
		const savedTheme = localStorage.getItem(getUserThemeKey(userId));
		const savedCustom = localStorage.getItem(getUserCustomThemeKey(userId));

		if (savedCustom) {
			const parsed = parseCustomTheme(savedCustom);
			if (parsed) {
				setCustomThemeState(parsed);
				localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(parsed));
			}
		} else {
			setCustomThemeState(DEFAULT_CUSTOM_THEME);
			localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
		}

		if (savedTheme) {
			if (savedTheme === "custom") {
				if (savedCustom) {
					setTheme("custom");
				} else {
					setTheme("orc-dark");
				}
			} else {
				setTheme(savedTheme);
			}
		} else if (savedCustom) {
			setTheme("custom");
		} else {
			setTheme("orc-dark");
		}
	} catch {
		// ignore
	}
}

function clearUserTheme(
	setTheme: (t: string) => void,
	setCustomThemeState: (c: CustomThemeConfig) => void
) {
	try {
		localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
	} catch {
		// ignore
	}
	setCustomThemeState(DEFAULT_CUSTOM_THEME);
	setTheme("orc-dark");
}

function syncCustomThemeFromDb(
	userId: string,
	rawCustom: string,
	setTheme: (t: string) => void,
	setCustomThemeState: (c: CustomThemeConfig) => void
) {
	const parsed = parseCustomTheme(rawCustom);
	if (!parsed) {
		return;
	}

	setCustomThemeState(parsed);
	try {
		localStorage.setItem(getUserCustomThemeKey(userId), JSON.stringify(parsed));
		localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(parsed));
	} catch {
		// ignore
	}

	const savedAppliedTheme = localStorage.getItem(getUserThemeKey(userId));
	if (!savedAppliedTheme || savedAppliedTheme === "custom") {
		setTheme("custom");
		try {
			localStorage.setItem(getUserThemeKey(userId), "custom");
		} catch {
			// ignore
		}
	}
}

function handleMissingDbCustomTheme(
	userId: string,
	currentTheme: string | undefined,
	setTheme: (t: string) => void
) {
	try {
		localStorage.removeItem(getUserCustomThemeKey(userId));
	} catch {
		// ignore
	}

	const savedAppliedTheme = localStorage.getItem(getUserThemeKey(userId));
	const shouldResetToDark =
		currentTheme === "custom" &&
		(!savedAppliedTheme || savedAppliedTheme === "custom");

	if (shouldResetToDark) {
		setTheme("orc-dark");
		try {
			localStorage.setItem(getUserThemeKey(userId), "orc-dark");
		} catch {
			// ignore
		}
	}
}

export function CustomThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = useQueryClient();
	const { theme, setTheme } = useTheme();
	const { data: session, isPending } = authClient.useSession();
	const lastUserIdRef = useRef<string | null | undefined>(undefined);

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

	const userMe = useQuery({
		...trpc.user.me.queryOptions(),
		enabled: Boolean(session?.user?.id),
	});
	const updateCustomThemeMutation = useMutation(
		trpc.user.updateCustomTheme.mutationOptions()
	);

	// Quando o usuário troca de conta ou desloga, limpa cache e restaura tema correspondente
	useEffect(() => {
		if (isPending) {
			return;
		}

		const currentUserId = session?.user?.id ?? null;

		if (lastUserIdRef.current !== currentUserId) {
			const previousUserId = lastUserIdRef.current;
			lastUserIdRef.current = currentUserId;

			setActiveProfileTheme(null);

			if (previousUserId !== undefined) {
				queryClient.removeQueries({ queryKey: trpc.user.me.queryKey() });
			}

			if (currentUserId) {
				applyStoredThemeForUser(currentUserId, setTheme, setCustomThemeState);
			} else {
				clearUserTheme(setTheme, setCustomThemeState);
			}
		}
	}, [isPending, session?.user?.id, setTheme, queryClient]);

	// Sincroniza tema salvo no banco com o estado e localStorage quando o usuário carrega
	useEffect(() => {
		const currentUserId = session?.user?.id;
		if (!(currentUserId && userMe.data !== undefined)) {
			return;
		}

		const rawCustom = userMe.data?.customTheme;
		if (rawCustom) {
			syncCustomThemeFromDb(
				currentUserId,
				rawCustom,
				setTheme,
				setCustomThemeState
			);
			return;
		}

		handleMissingDbCustomTheme(currentUserId, theme, setTheme);
	}, [session?.user?.id, userMe.data, theme, setTheme]);

	// Injeta a tag <style> com as variáveis CSS do tema ativo e realiza limpeza estrita
	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const targetTheme =
			activeProfileTheme || (theme === "custom" ? customTheme : null);

		const cleanup = () => {
			const styleEl = document.getElementById(STYLE_ELEMENT_ID);
			if (styleEl) {
				styleEl.remove();
			}
			document.documentElement.removeAttribute("data-custom-theme");

			if (theme !== "custom" || !targetTheme) {
				restoreThemeClasses(theme);
			}
		};

		if (!targetTheme) {
			cleanup();
			return cleanup;
		}

		let styleEl = document.getElementById(
			STYLE_ELEMENT_ID
		) as HTMLStyleElement | null;

		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = STYLE_ELEMENT_ID;
			document.head.appendChild(styleEl);
		}

		styleEl.innerHTML = generateCustomThemeCss(targetTheme);
		document.documentElement.setAttribute("data-custom-theme", "active");
		applyCustomClasses(targetTheme.baseMode);

		return cleanup;
	}, [theme, customTheme, activeProfileTheme]);

	const saveCustomTheme = useCallback(
		async (newTheme: CustomThemeConfig) => {
			setCustomThemeState(newTheme);
			const serialized = JSON.stringify(newTheme);
			const currentUserId = session?.user?.id;

			try {
				localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, serialized);
				if (currentUserId) {
					localStorage.setItem(
						getUserCustomThemeKey(currentUserId),
						serialized
					);
					localStorage.setItem(getUserThemeKey(currentUserId), "custom");
				}
			} catch {
				// Local storage error
			}
			setTheme("custom");

			try {
				await updateCustomThemeMutation.mutateAsync({
					customTheme: serialized,
				});
			} catch {
				// Ignora falha silenciosa de sincronização remota
			}
		},
		[session?.user?.id, setTheme, updateCustomThemeMutation]
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
