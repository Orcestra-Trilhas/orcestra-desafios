"use client";

import { Toaster } from "@orcestra-desafios/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/utils/trpc";

import { CustomThemeDialog } from "./custom-theme-dialog";
import { CustomThemeProvider } from "./custom-theme-provider";
import { DynamicFavicon } from "./dynamic-favicon";
import { PwaProvider } from "./pwa-provider";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="orc-dark"
			disableTransitionOnChange
			enableSystem={false}
			themes={["orc-dark", "orc-light", "dark", "light", "custom"]}
		>
			<QueryClientProvider client={queryClient}>
				<CustomThemeProvider>
					<DynamicFavicon />
					<PwaProvider>{children}</PwaProvider>
					<CustomThemeDialog />
				</CustomThemeProvider>
				<ReactQueryDevtools />
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
