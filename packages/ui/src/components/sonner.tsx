"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function getSonnerTheme(theme: string): ToasterProps["theme"] {
	if (theme === "dark" || theme === "orc-dark") {
		return "dark";
	}
	if (theme === "light" || theme === "orc-light") {
		return "light";
	}
	return "system";
}

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();
	const sonnerTheme = getSonnerTheme(theme);

	return (
		<Sonner
			className="toaster group"
			icons={{
				error: <OctagonXIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
				success: <CircleCheckIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
			}}
			style={
				{
					"--border-radius": "var(--radius)",
					"--normal-bg": "var(--popover)",
					"--normal-border": "var(--border)",
					"--normal-text": "var(--popover-foreground)",
				} as React.CSSProperties
			}
			theme={sonnerTheme}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
