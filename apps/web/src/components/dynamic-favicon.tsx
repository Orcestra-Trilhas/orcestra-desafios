"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

interface PwaThemeConfig {
	appleTouchIcon: string;
	favicon: string;
	manifest: string;
	themeColor: string;
}

const THEME_PWA_MAP: Record<string, PwaThemeConfig> = {
	dark: {
		appleTouchIcon: "/favicon/apple-touch-icon-dark.png",
		favicon: "/favicon/favicon-dark.svg",
		manifest: "/manifest-dark.webmanifest",
		themeColor: "#09090B",
	},
	light: {
		appleTouchIcon: "/favicon/apple-touch-icon-light.png",
		favicon: "/favicon/favicon-light.svg",
		manifest: "/manifest-light.webmanifest",
		themeColor: "#DC2626",
	},
	"orc-dark": {
		appleTouchIcon: "/favicon/apple-touch-icon-orc-dark.png",
		favicon: "/favicon/favicon-orc-dark.svg",
		manifest: "/manifest-orc-dark.webmanifest",
		themeColor: "#02571E",
	},
	"orc-light": {
		appleTouchIcon: "/favicon/apple-touch-icon-orc-light.png",
		favicon: "/favicon/favicon-orc-light.svg",
		manifest: "/manifest-orc-light.webmanifest",
		themeColor: "#0D3309",
	},
};

function resolvePwaConfig(
	theme: string | undefined,
	resolvedTheme: string | undefined
): PwaThemeConfig {
	const defaultConf = THEME_PWA_MAP["orc-dark"] as PwaThemeConfig;

	if (theme === "system") {
		const key = resolvedTheme === "light" ? "orc-light" : "orc-dark";
		return THEME_PWA_MAP[key] ?? defaultConf;
	}

	if (theme && theme in THEME_PWA_MAP) {
		return THEME_PWA_MAP[theme] ?? defaultConf;
	}

	return defaultConf;
}

function updateLink(selector: string, rel: string, href: string) {
	let link = document.querySelector<HTMLLinkElement>(selector);
	if (link) {
		link.href = href;
		return;
	}

	link = document.createElement("link");
	link.rel = rel;
	link.href = href;
	document.head.appendChild(link);
}

function updateFavicon(faviconUrl: string) {
	const links = document.querySelectorAll<HTMLLinkElement>(
		'link[rel="icon"], link[rel="shortcut icon"]'
	);

	for (const link of links) {
		if (link.type === "image/svg+xml") {
			link.href = faviconUrl;
			return;
		}
	}

	const [firstLink] = links;
	if (firstLink) {
		firstLink.href = faviconUrl;
		firstLink.type = "image/svg+xml";
		return;
	}

	updateLink('link[rel="icon"]', "icon", faviconUrl);
}

function updateThemeColor(color: string) {
	const meta = document.querySelector<HTMLMetaElement>(
		'meta[name="theme-color"]'
	);
	if (meta) {
		meta.content = color;
		return;
	}

	const newMeta = document.createElement("meta");
	newMeta.name = "theme-color";
	newMeta.content = color;
	document.head.appendChild(newMeta);
}

export function DynamicFavicon() {
	const { theme, resolvedTheme } = useTheme();

	useEffect(() => {
		const conf = resolvePwaConfig(theme, resolvedTheme);
		updateFavicon(conf.favicon);
		updateLink(
			'link[rel="apple-touch-icon"]',
			"apple-touch-icon",
			conf.appleTouchIcon
		);
		updateLink('link[rel="manifest"]', "manifest", conf.manifest);
		updateThemeColor(conf.themeColor);
	}, [theme, resolvedTheme]);

	return null;
}
