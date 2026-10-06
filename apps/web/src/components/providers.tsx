"use client";

import { Toaster } from "@orcestra-desafios/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/utils/trpc";

import { PwaProvider } from "./pwa-provider";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="orc-dark"
			disableTransitionOnChange
			enableSystem
			themes={["orc-dark", "orc-light", "dark", "light"]}
		>
			<QueryClientProvider client={queryClient}>
				<PwaProvider>{children}</PwaProvider>
				<ReactQueryDevtools />
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
